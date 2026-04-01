/**
 * AXI SQLite Database
 * --------------------
 * Single ACID-compliant database for all persistent data.
 * Replaces the JSON file storage used for memory.json and corrections.json.
 *
 * Uses better-sqlite3 (synchronous, zero server, WAL mode).
 * Gracefully falls back to a stub if the native module hasn't been compiled yet.
 */

"use strict";

const path = require("path");
const fs   = require("fs");

// Ensure data/ directory exists
const DATA_DIR = path.join(__dirname, "../data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let db;

try {
  const Database = require("better-sqlite3");
  const DB_PATH  = path.join(DATA_DIR, "axi.db");
  db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  db.pragma("journal_mode = WAL");
  // Enforce foreign key constraints
  db.pragma("foreign_keys = ON");

  // ─── Schema ────────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS facts (
      key       TEXT    PRIMARY KEY,
      value     TEXT    NOT NULL,
      timestamp TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS corrections (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      utterance        TEXT    NOT NULL,
      predicted_intent TEXT,
      correct_intent   TEXT    NOT NULL,
      status           TEXT    NOT NULL DEFAULT 'pending_training',
      created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS learning_log (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      type            TEXT    NOT NULL,
      text            TEXT    NOT NULL,
      predicted_intent TEXT,
      confidence      REAL,
      status          TEXT    NOT NULL DEFAULT 'pending_review',
      created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  console.log(`💾 Database: Connected to ${path.join(DATA_DIR, "axi.db")}`);
} catch (err) {
  console.warn(`⚠️  SQLite unavailable (${err.message}). Falling back to JSON persistence.`);
  console.warn("   Run: npm install  (you may need Visual Studio Build Tools on Windows)");
  db = null;
}

module.exports = db;

