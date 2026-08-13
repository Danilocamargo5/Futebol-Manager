enum PlayerPosition {
  goalkeeper,
  defender,
  midfielder,
  striker,
}

extension PlayerPositionExtension on PlayerPosition {
  String get label {
    switch (this) {
      case PlayerPosition.goalkeeper:
        return 'Goleiro';
      case PlayerPosition.defender:
        return 'Defesa';
      case PlayerPosition.midfielder:
        return 'Meio';
      case PlayerPosition.striker:
        return 'Ataque';
    }
  }

  String get shortLabel {
    switch (this) {
      case PlayerPosition.goalkeeper:
        return 'GOL';
      case PlayerPosition.defender:
        return 'DEF';
      case PlayerPosition.midfielder:
        return 'MEI';
      case PlayerPosition.striker:
        return 'ATA';
    }
  }
}

PlayerPosition positionFromKey(String key) {
  return PlayerPosition.values.firstWhere(
    (position) => position.name == key,
    orElse: () => PlayerPosition.midfielder,
  );
}

class Team {
  Team({
    required this.id,
    required this.name,
    this.colorValue = 0xFF2457D6,
  });

  final String id;
  String name;
  int colorValue;

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'colorValue': colorValue,
      };

  factory Team.fromJson(Map<String, dynamic> json) {
    return Team(
      id: json['id'] as String,
      name: json['name'] as String,
      colorValue: (json['colorValue'] as num?)?.toInt() ?? 0xFF2457D6,
    );
  }
}

class Player {
  Player({
    required this.id,
    required this.name,
    required this.teamId,
    required this.ratings,
    this.present = true,
  });

  final String id;
  String name;
  String? teamId;
  Map<PlayerPosition, int> ratings;
  bool present;

  int ratingFor(PlayerPosition position) => ratings[position] ?? 0;

  PlayerPosition get strongestPosition {
    return PlayerPosition.values.reduce(
      (current, next) =>
          ratingFor(next) > ratingFor(current) ? next : current,
    );
  }

  double get overall {
    final total =
        PlayerPosition.values.fold<int>(0, (sum, item) => sum + ratingFor(item));
    return total / PlayerPosition.values.length;
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'teamId': teamId,
        'ratings': {
          for (final entry in ratings.entries) entry.key.name: entry.value,
        },
        'present': present,
      };

  factory Player.fromJson(Map<String, dynamic> json) {
    final rawRatings = (json['ratings'] as Map?)?.cast<String, dynamic>() ?? {};
    return Player(
      id: json['id'] as String,
      name: json['name'] as String,
      teamId: json['teamId'] as String?,
      ratings: {
        for (final position in PlayerPosition.values)
          position: (rawRatings[position.name] as num?)?.toInt() ?? 0,
      },
      present: json['present'] as bool? ?? true,
    );
  }
}

class MatchRecord {
  MatchRecord({
    required this.id,
    required this.date,
    required this.teamA,
    required this.teamB,
    required this.scoreA,
    required this.scoreB,
    required this.goalsByPlayer,
    this.bestGoalkeeperId,
  });

  final String id;
  final DateTime date;
  final List<String> teamA;
  final List<String> teamB;
  final int scoreA;
  final int scoreB;
  final Map<String, int> goalsByPlayer;
  final String? bestGoalkeeperId;

  Map<String, dynamic> toJson() => {
        'id': id,
        'date': date.toIso8601String(),
        'teamA': teamA,
        'teamB': teamB,
        'scoreA': scoreA,
        'scoreB': scoreB,
        'goalsByPlayer': goalsByPlayer,
        'bestGoalkeeperId': bestGoalkeeperId,
      };

  factory MatchRecord.fromJson(Map<String, dynamic> json) {
    return MatchRecord(
      id: json['id'] as String,
      date: DateTime.parse(json['date'] as String),
      teamA: (json['teamA'] as List).cast<String>(),
      teamB: (json['teamB'] as List).cast<String>(),
      scoreA: (json['scoreA'] as num).toInt(),
      scoreB: (json['scoreB'] as num).toInt(),
      goalsByPlayer: (json['goalsByPlayer'] as Map).map(
        (key, value) => MapEntry(key.toString(), (value as num).toInt()),
      ),
      bestGoalkeeperId: json['bestGoalkeeperId'] as String?,
    );
  }
}