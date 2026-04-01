/**
 * Continuous Learning Service
 * ---------------------------
 * Captures user corrections using SQLite (better-sqlite3).
 * Replaces corrections.json — ACID-compliant, crash-safe.
 *
 * Public API unchanged: logCorrection(), getPending()
 */

"use strict";

const db = require("./db");
const fs   = require("fs");
const path = require("path");

const CORRECTIONS_FILE = path.join(__dirname, "../data/corrections.json");

// Prepared statements (only when SQLite is available)
const stmts = db ? {
  insert:     db.prepare(`INSERT INTO corrections (utterance, predicted_intent, correct_intent, status, created_at)
                          VALUES (?, ?, ?, 'pending_training', datetime('now'))`),
  getPending: db.prepare(`SELECT * FROM corrections WHERE status = 'pending_training' ORDER BY created_at ASC`),
  getAll:     db.prepare(`SELECT * FROM corrections ORDER BY created_at DESC`),
  count:      db.prepare(`SELECT COUNT(*) as count FROM corrections`)
} : null;

class LearningService {
  constructor() {
    if (stmts) {
      const { count } = stmts.count.get();
      console.log(`🎓 Learning: Loaded ${count} corrections from SQLite.`);
    } else {
      this._load();
      console.log(`🎓 Learning: Loaded ${this._corrections.length} corrections from JSON.`);
    }
  }

  _load() {
    try {
      if (fs.existsSync(CORRECTIONS_FILE)) {
        this._corrections = JSON.parse(fs.readFileSync(CORRECTIONS_FILE, "utf8"));
      } else {
        this._corrections = [];
      }
    } catch { this._corrections = []; }
  }

  _save() {
    try { fs.writeFileSync(CORRECTIONS_FILE, JSON.stringify(this._corrections, null, 2)); }
    catch (err) { console.error("❌ Learning JSON save failed:", err.message); }
  }

  /**
   * Log a user correction
   * @param {string} utterance       — What the user said originally
   * @param {string} originalIntent  — What AXI thought it was
   * @param {string} correctIntent   — What it actually was
   */
  logCorrection(utterance, originalIntent, correctIntent) {
    if (!utterance || !correctIntent) return false;

    if (stmts) {
      try {
        stmts.insert.run(utterance.trim(), originalIntent || null, correctIntent.trim());
        console.log(`🎓 Correction logged: "${utterance}" → ${correctIntent}`);
        return true;
      } catch (err) {
        console.error("❌ Learning.logCorrection failed:", err.message);
        return false;
      }
    }

    // JSON fallback
    if (!this._corrections) this._load();
    this._corrections.push({
      utterance: utterance.trim(),
      predicted_intent: originalIntent || null,
      correct_intent: correctIntent.trim(),
      status: "pending_training",
      timestamp: new Date().toISOString()
    });
    this._save();
    console.log(`🎓 Correction logged: "${utterance}" → ${correctIntent}`);
    return true;
  }

  /**
   * Get all pending corrections (status = 'pending_training')
   */
  getPending() {
    if (stmts) return stmts.getPending.all();
    if (!this._corrections) this._load();
    return this._corrections.filter(c => c.status === "pending_training");
  }

  getAll() {
    if (stmts) return stmts.getAll.all();
    if (!this._corrections) this._load();
    return this._corrections;
  }
}

module.exports = new LearningService();

