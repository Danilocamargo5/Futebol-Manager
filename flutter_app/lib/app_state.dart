import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'models.dart';

class DrawResult {
  DrawResult({
    required this.teamA,
    required this.teamB,
  });

  final List<Player> teamA;
  final List<Player> teamB;

  double get teamARating =>
      teamA.fold<double>(0, (sum, player) => sum + player.overall);

  double get teamBRating =>
      teamB.fold<double>(0, (sum, player) => sum + player.overall);
}

class AppState extends ChangeNotifier {
  static const _teamsKey = 'pelada_pro_teams';
  static const _playersKey = 'pelada_pro_players';
  static const _matchesKey = 'pelada_pro_matches';

  List<Team> teams = [];
  List<Player> players = [];
  List<MatchRecord> matches = [];
  bool isReady = false;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final teamsJson = prefs.getString(_teamsKey);
    final playersJson = prefs.getString(_playersKey);
    final matchesJson = prefs.getString(_matchesKey);

    if (teamsJson == null || playersJson == null) {
      _seedDemoData();
      await _persist();
    } else {
      teams = (jsonDecode(teamsJson) as List)
          .map((item) => Team.fromJson(item as Map<String, dynamic>))
          .toList();
      players = (jsonDecode(playersJson) as List)
          .map((item) => Player.fromJson(item as Map<String, dynamic>))
          .toList();
      if (matchesJson != null) {
        matches = (jsonDecode(matchesJson) as List)
            .map((item) => MatchRecord.fromJson(item as Map<String, dynamic>))
            .toList();
      }
    }
    isReady = true;
    notifyListeners();
  }

  void _seedDemoData() {
    final team = Team(id: 'team-principal', name: 'Pelada de quarta');
    teams = [team];
    players = [
      _demoPlayer('p-1', 'Rafa', PlayerPosition.goalkeeper, 3, team.id),
      _demoPlayer('p-2', 'Bruno', PlayerPosition.defender, 3, team.id),
      _demoPlayer('p-3', 'Caio', PlayerPosition.defender, 2, team.id),
      _demoPlayer('p-4', 'Diego', PlayerPosition.midfielder, 3, team.id),
      _demoPlayer('p-5', 'Erick', PlayerPosition.midfielder, 2, team.id),
      _demoPlayer('p-6', 'Felipe', PlayerPosition.striker, 3, team.id),
      _demoPlayer('p-7', 'Gui', PlayerPosition.striker, 2, team.id),
      _demoPlayer('p-8', 'Hugo', PlayerPosition.midfielder, 1, team.id),
    ];
  }

  Player _demoPlayer(
    String id,
    String name,
    PlayerPosition strongest,
    int level,
    String teamId,
  ) {
    return Player(
      id: id,
      name: name,
      teamId: teamId,
      ratings: {
        for (final position in PlayerPosition.values)
          position: position == strongest ? level : (level > 1 ? level - 1 : 0),
      },
    );
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _teamsKey,
      jsonEncode(teams.map((team) => team.toJson()).toList()),
    );
    await prefs.setString(
      _playersKey,
      jsonEncode(players.map((player) => player.toJson()).toList()),
    );
    await prefs.setString(
      _matchesKey,
      jsonEncode(matches.map((match) => match.toJson()).toList()),
    );
  }

  String _id(String prefix) => '$prefix-${DateTime.now().microsecondsSinceEpoch}';

  Future<void> addTeam(String name) async {
    teams.add(Team(id: _id('team'), name: name.trim()));
    await _persist();
    notifyListeners();
  }

  Future<void> updateTeam(Team team, String name) async {
    team.name = name.trim();
    await _persist();
    notifyListeners();
  }

  Future<void> removeTeam(Team team) async {
    teams.removeWhere((item) => item.id == team.id);
    for (final player in players) {
      if (player.teamId == team.id) player.teamId = null;
    }
    await _persist();
    notifyListeners();
  }

  Future<void> addPlayer({
    required String name,
    required String? teamId,
    required Map<PlayerPosition, int> ratings,
    bool present = true,
  }) async {
    players.add(
      Player(
        id: _id('player'),
        name: name.trim(),
        teamId: teamId,
        ratings: ratings,
        present: present,
      ),
    );
    await _persist();
    notifyListeners();
  }

  Future<void> updatePlayer(
    Player player, {
    required String name,
    required String? teamId,
    required Map<PlayerPosition, int> ratings,
  }) async {
    player.name = name.trim();
    player.teamId = teamId;
    player.ratings = ratings;
    await _persist();
    notifyListeners();
  }

  Future<void> removePlayer(Player player) async {
    players.removeWhere((item) => item.id == player.id);
    await _persist();
    notifyListeners();
  }

  DrawResult drawTeams() {
    final available = players.where((player) => player.present).toList()
      ..sort((a, b) => b.overall.compareTo(a.overall));
    final teamA = <Player>[];
    final teamB = <Player>[];
    for (var index = 0; index < available.length; index++) {
      final round = index ~/ 2;
      final goesToA = round.isEven ? index.isEven : index.isOdd;
      (goesToA ? teamA : teamB).add(available[index]);
    }
    return DrawResult(teamA: teamA, teamB: teamB);
  }

  Future<void> addMatch({
    required List<Player> teamA,
    required List<Player> teamB,
    required int scoreA,
    required int scoreB,
    required Map<String, int> goalsByPlayer,
    String? bestGoalkeeperId,
  }) async {
    matches.insert(
      0,
      MatchRecord(
        id: _id('match'),
        date: DateTime.now(),
        teamA: teamA.map((player) => player.id).toList(),
        teamB: teamB.map((player) => player.id).toList(),
        scoreA: scoreA,
        scoreB: scoreB,
        goalsByPlayer: goalsByPlayer,
        bestGoalkeeperId: bestGoalkeeperId,
      ),
    );
    await _persist();
    notifyListeners();
  }

  int goalsFor(String playerId, {DateTime? start}) {
    return matches.where((match) => start == null || !match.date.isBefore(start)).fold<int>(
      0,
      (sum, match) => sum + (match.goalsByPlayer[playerId] ?? 0),
    );
  }

  int goalkeeperAwardsFor(String playerId, {DateTime? start}) {
    return matches
        .where(
          (match) =>
              match.bestGoalkeeperId == playerId &&
              (start == null || !match.date.isBefore(start)),
        )
        .length;
  }

  List<Player> rankingByGoals({DateTime? start}) {
    final totals = <String, int>{};
    for (final match in matches) {
      if (start != null && match.date.isBefore(start)) continue;
      for (final entry in match.goalsByPlayer.entries) {
        totals[entry.key] = (totals[entry.key] ?? 0) + entry.value;
      }
    }
    return players
        .where((player) => (totals[player.id] ?? 0) > 0)
        .toList()
      ..sort((a, b) => (totals[b.id] ?? 0).compareTo(totals[a.id] ?? 0));
  }

  List<Player> rankingByGoalkeeper({DateTime? start}) {
    final totals = <String, int>{};
    for (final match in matches) {
      if (start != null && match.date.isBefore(start)) continue;
      final id = match.bestGoalkeeperId;
      if (id != null) totals[id] = (totals[id] ?? 0) + 1;
    }
    return players
        .where((player) => (totals[player.id] ?? 0) > 0)
        .toList()
      ..sort((a, b) => (totals[b.id] ?? 0).compareTo(totals[a.id] ?? 0));
  }
}