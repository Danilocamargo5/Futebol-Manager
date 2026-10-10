import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite/sqflite.dart';

import 'local_database.dart';

/// Stores the existing app models without changing their JSON contracts.
/// Legacy preferences are kept as a fallback until migration is verified.
class AppSnapshotStore {
  AppSnapshotStore({LocalDatabase? localDatabase})
      : _localDatabase = localDatabase ?? LocalDatabase.instance;

  final LocalDatabase _localDatabase;

  static const teamsKey = 'pelada_pro_teams';
  static const playersKey = 'pelada_pro_players';
  static const matchesKey = 'pelada_pro_matches';

  Future<void> initialize() async {
    final db = await _localDatabase.database;
    await db.execute('''
      CREATE TABLE IF NOT EXISTS app_snapshots (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        teams_json TEXT NOT NULL,
        players_json TEXT NOT NULL,
        matches_json TEXT NOT NULL
      )
    ''');
  }

  Future<Map<String, List<dynamic>>?> read() async {
    await initialize();
    final db = await _localDatabase.database;
    final rows = await db.query('app_snapshots', where: 'id = ?', whereArgs: [1]);
    if (rows.isNotEmpty) {
      final row = rows.single;
      return {
        'teams': jsonDecode(row['teams_json']! as String) as List<dynamic>,
        'players': jsonDecode(row['players_json']! as String) as List<dynamic>,
        'matches': jsonDecode(row['matches_json']! as String) as List<dynamic>,
      };
    }
    final prefs = await SharedPreferences.getInstance();
    final teams = prefs.getString(teamsKey);
    final players = prefs.getString(playersKey);
    if (teams == null || players == null) return null;
    final matches = prefs.getString(matchesKey);
    final snapshot = <String, List<dynamic>>{
      'teams': jsonDecode(teams) as List<dynamic>,
      'players': jsonDecode(players) as List<dynamic>,
      'matches': matches == null ? [] : jsonDecode(matches) as List<dynamic>,
    };
    // Only commit after all legacy JSON has been decoded successfully.
    await write(
      teams: snapshot['teams']!,
      players: snapshot['players']!,
      matches: snapshot['matches']!,
    );
    return snapshot;
  }

  Future<void> write({
    required List<dynamic> teams,
    required List<dynamic> players,
    required List<dynamic> matches,
  }) async {
    await initialize();
    final db = await _localDatabase.database;
    await db.transaction((txn) async {
      await txn.insert(
        'app_snapshots',
        {
          'id': 1,
          'teams_json': jsonEncode(teams),
          'players_json': jsonEncode(players),
          'matches_json': jsonEncode(matches),
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    });
  }
}
