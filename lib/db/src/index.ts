import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

// Determine the DB file path relative to the project root
const dataDir = path.resolve(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "moodify.db");
const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrent performance
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    genre TEXT NOT NULL DEFAULT 'unknown',
    emotion TEXT NOT NULL DEFAULT 'unknown',
    youtube_id TEXT NOT NULL UNIQUE,
    thumbnail TEXT DEFAULT '',
    duration INTEGER DEFAULT 0,
    created_at TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL DEFAULT 'default',
    song_id INTEGER REFERENCES songs(id),
    play_percentage REAL DEFAULT 0,
    play_time REAL DEFAULT 0,
    duration REAL DEFAULT 0,
    timestamp TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL DEFAULT 'default',
    name TEXT NOT NULL,
    created_at TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS playlist_songs (
    playlist_id INTEGER NOT NULL REFERENCES playlists(id),
    song_id INTEGER NOT NULL REFERENCES songs(id),
    added_at TEXT DEFAULT '',
    PRIMARY KEY (playlist_id, song_id)
  );

  CREATE TABLE IF NOT EXISTS likes (
    user_id TEXT NOT NULL DEFAULT 'default',
    song_id INTEGER NOT NULL REFERENCES songs(id),
    created_at TEXT DEFAULT '',
    PRIMARY KEY (user_id, song_id)
  );

  CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL DEFAULT 'default',
    song_id INTEGER REFERENCES songs(id),
    emotion TEXT NOT NULL DEFAULT 'unknown',
    similarity_score REAL DEFAULT 0,
    created_at TEXT DEFAULT ''
  );
`);

export const db = drizzle(sqlite, { schema });

export * from "./schema";
