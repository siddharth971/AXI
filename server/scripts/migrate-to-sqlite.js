/**
 * AXI — JSON to SQLite Migration Script
 * ----------------------------------------
 * One-shot migration that reads legacy memory.json and corrections.json
 * and inserts their records into the new SQLite database (data/axi.db).
 *
 * Run ONCE after upgrading:
 *   node scripts/migrate-to-sqlite.js
 */

"use strict";

const fs   = require("fs");
const path = require("path");

const DATA_DIR  = path.join(__dirname, "../data");

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Load better-sqlite3 directly (bypasses the graceful-fallback in core/db.js)
let Database;
try {
  Database = require("better-sqlite3");
} catch (err) {
  console.error("❌ better-sqlite3 is not available:", err.message);
  console.error("   Rebuild it first: npm rebuild better-sqlite3");
  process.exit(1);
}

const DB_PATH = path.join(DATA_DIR, "axi.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Ensure schema exists
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
`);

let migratedFacts       = 0;
let migratedCorrections = 0;
let errors              = 0;

// ── Migrate memory.json ──────────────────────────────────────────────────────

const MEMORY_FILE = path.join(DATA_DIR, "memory.json");

if (fs.existsSync(MEMORY_FILE)) {
  console.log("📂 Found memory.json — migrating facts...");

  try {
    const raw   = JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
    const facts = raw.facts || [];

    const insert = db.prepare(`
      INSERT INTO facts (key, value, timestamp)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, timestamp = excluded.timestamp
    `);

    const insertMany = db.transaction((rows) => {
      for (const f of rows) {
        if (!f.key || !f.value) continue;
        insert.run(f.key, f.value, f.timestamp || new Date().toISOString());
        migratedFacts++;
      }
    });

    insertMany(facts);
    console.log(`  ✅ Migrated ${migratedFacts} facts from memory.json`);

    // Rename old file instead of deleting — safe fallback
    fs.renameSync(MEMORY_FILE, MEMORY_FILE + ".bak");
    console.log("  🗄️  memory.json renamed to memory.json.bak");
  } catch (err) {
    console.error("  ❌ Failed to migrate memory.json:", err.message);
    errors++;
  }
} else {
  console.log("ℹ️  memory.json not found — skipping.");
}

// ── Migrate corrections.json ──────────────────────────────────────────────────

const CORRECTIONS_FILE = path.join(DATA_DIR, "corrections.json");

if (fs.existsSync(CORRECTIONS_FILE)) {
  console.log("📂 Found corrections.json — migrating corrections...");

  try {
    const corrections = JSON.parse(fs.readFileSync(CORRECTIONS_FILE, "utf8"));

    const insert = db.prepare(`
      INSERT INTO corrections (utterance, predicted_intent, correct_intent, status, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((rows) => {
      for (const c of rows) {
        if (!c.utterance || !c.correct_intent) continue;
        insert.run(
          c.utterance,
          c.predicted_intent || null,
          c.correct_intent,
          c.status || "pending_training",
          c.timestamp || new Date().toISOString()
        );
        migratedCorrections++;
      }
    });

    insertMany(corrections);
    console.log(`  ✅ Migrated ${migratedCorrections} corrections from corrections.json`);

    fs.renameSync(CORRECTIONS_FILE, CORRECTIONS_FILE + ".bak");
    console.log("  🗄️  corrections.json renamed to corrections.json.bak");
  } catch (err) {
    console.error("  ❌ Failed to migrate corrections.json:", err.message);
    errors++;
  }
} else {
  console.log("ℹ️  corrections.json not found — skipping.");
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log("");
console.log("╔═══════════════════════════════════════╗");
console.log("║         Migration Complete             ║");
console.log("╠═══════════════════════════════════════╣");
console.log(`║  Facts migrated      : ${String(migratedFacts).padEnd(13)} ║`);
console.log(`║  Corrections migrated: ${String(migratedCorrections).padEnd(13)} ║`);
console.log(`║  Errors              : ${String(errors).padEnd(13)} ║`);
console.log("╚═══════════════════════════════════════╝");

if (errors > 0) {
  process.exit(1);
}
