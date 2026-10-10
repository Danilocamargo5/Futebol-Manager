import 'dart:convert';

import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as path;

/// SQLite foundation for Pelada Pro.
///
/// Legacy SharedPreferences data is intentionally not deleted. A later
/// migration can import it transactionally without risking existing users.
class LocalDatabase {
  LocalDatabase._();
  static final LocalDatabase instance = LocalDatabase._();
  Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    final base = await getDatabasesPath();
    _database = await openDatabase(
      path.join(base, 'pelada_pro.db'),
      version: 1,
      onConfigure: (db) async => db.execute('PRAGMA foreign_keys = ON'),
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE groups (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL CHECK(length(trim(name)) > 0),
            created_at TEXT NOT NULL
          )
        ''');
        await db.execute('''
          CREATE TABLE players (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL CHECK(length(trim(name)) > 0),
            group_id TEXT REFERENCES groups(id),
            data_json TEXT NOT NULL
          )
        ''');
        await db.execute('''
          CREATE TABLE matches (
            id TEXT PRIMARY KEY,
            group_id TEXT REFERENCES groups(id),
            data_json TEXT NOT NULL
          )
        ''');
        await db.execute('''
          CREATE TABLE attendance (
            group_id TEXT NOT NULL REFERENCES groups(id),
            match_id TEXT NOT NULL REFERENCES matches(id),
            player_id TEXT NOT NULL REFERENCES players(id),
            status TEXT NOT NULL CHECK(status IN ('confirmed', 'declined', 'maybe')),
            revision INTEGER NOT NULL CHECK(revision >= 0),
            PRIMARY KEY (match_id, player_id)
          )
        ''');
        await db.execute('''
          CREATE TABLE inbox_events (
            event_id TEXT PRIMARY KEY,
            event_type TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            processed_at TEXT NOT NULL
          )
        ''');
        await db.execute('''
          CREATE TABLE outbox_events (
            event_id TEXT PRIMARY KEY,
            event_type TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending'
              CHECK(status IN ('pending', 'sent', 'acknowledged')),
            created_at TEXT NOT NULL
          )
        ''');
      },
    );
    return _database!;
  }

  /// Returns false for a duplicate event without executing its side effects.
  /// The caller must validate authentication and authorization first.
  Future<bool> applyOnce({
    required String eventId,
    required String eventType,
    required Map<String, dynamic> payload,
    required Future<void> Function(Transaction txn) apply,
  }) async {
    if (eventId.trim().isEmpty || eventType.trim().isEmpty) {
      throw ArgumentError('eventId and eventType are required');
    }
    final db = await database;
    return db.transaction((txn) async {
      final existing = await txn.query('inbox_events',
          columns: ['event_id'], where: 'event_id = ?', whereArgs: [eventId]);
      if (existing.isNotEmpty) return false;
      await apply(txn);
      await txn.insert('inbox_events', {
        'event_id': eventId,
        'event_type': eventType,
        'payload_json': jsonEncode(payload),
        'processed_at': DateTime.now().toUtc().toIso8601String(),
      });
      return true;
    });
  }

  Future<void> close() async {
    await _database?.close();
    _database = null;
  }
}
