/**
 * Long-Term Memory Service
 * -------------------------
 * Stores and retrieves user facts using SQLite (better-sqlite3).
 * Replaces memory.json — ACID-compliant, crash-safe.
 *
 * Public API is unchanged: remember(key, value), recall(query), forget(key), data.facts
 */

"use strict";

const { db } = require("./db");
const { logger } = require("../utils");
const fs   = require("fs");
const path = require("path");

const MEMORY_FILE = path.join(__dirname, "../data/memory.json");

// Prepared statements (only when SQLite is available)
const stmts = db ? {
  upsertFact:  db.prepare(`INSERT INTO facts (key, value, timestamp)
                           VALUES (?, ?, datetime('now'))
                           ON CONFLICT(key) DO UPDATE SET value = excluded.value, timestamp = excluded.timestamp`),
  getAllFacts:  db.prepare(`SELECT key, value, timestamp FROM facts ORDER BY timestamp DESC`),
  getFact:     db.prepare(`SELECT key, value, timestamp FROM facts WHERE key = ?`),
  searchFacts: db.prepare(`SELECT key, value, timestamp FROM facts WHERE key LIKE ? OR key LIKE ?`),
  deleteFact:  db.prepare(`DELETE FROM facts WHERE key = ?`),
  countFacts:  db.prepare(`SELECT COUNT(*) as count FROM facts`)
} : null;

class MemoryService {
  constructor() {
    if (stmts) {
      const { count } = stmts.countFacts.get();
      console.log(`🧠 Memory: Loaded ${count} facts from SQLite.`);
    } else {
      // JSON fallback
      this._loadJSON();
      console.log(`🧠 Memory: Loaded ${this._jsonData.facts.length} facts from JSON.`);
    }
  }

  /** Load JSON data (fallback only) */
  _loadJSON() {
    try {
      if (fs.existsSync(MEMORY_FILE)) {
        this._jsonData = JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
      } else {
        this._jsonData = { facts: [] };
      }
    } catch { this._jsonData = { facts: [] }; }
  }

  /** Save JSON data (fallback only) */
  _saveJSON() {
    try {
      fs.writeFileSync(MEMORY_FILE, JSON.stringify(this._jsonData, null, 2));
    } catch (err) { logger.error("Memory JSON save failed", err.message); }
  }

  /**
   * Compatibility shim — code that reads memory.data.facts gets
   * a fresh array from SQLite on every access.
   */
  get data() {
    if (stmts) return { facts: stmts.getAllFacts.all() };
    if (!this._jsonData) this._loadJSON();
    return { facts: this._jsonData.facts || [] };
  }

  /**
   * Remember a fact (insert or update)
   * @param {string} key   — Subject (e.g., "wifi password")
   * @param {string} value — Value   (e.g., "secret123")
   */
  remember(key, value) {
    if (!key || !value) return false;
    const cleanKey = String(key).trim().toLowerCase();
    const cleanVal = String(value).trim();

    if (stmts) {
      try {
        stmts.upsertFact.run(cleanKey, cleanVal);
        return true;
      } catch (err) {
        logger.error("Memory.remember (SQLite) failed", err.message);
        return false;
      }
    }

    // JSON fallback
    if (!this._jsonData) this._loadJSON();
    const idx = this._jsonData.facts.findIndex(f => f.key === cleanKey);
    const fact = { key: cleanKey, value: cleanVal, timestamp: new Date().toISOString() };
    if (idx >= 0) { this._jsonData.facts[idx] = fact; } else { this._jsonData.facts.push(fact); }
    this._saveJSON();
    return true;
  }

  /**
   * Recall a fact by key (exact then fuzzy)
   * @param {string} query — Search term
   * @returns {{ key, value, timestamp }|null}
   */
  recall(query) {
    if (!query) return null;
    const q = String(query).toLowerCase().trim();

    if (stmts) {
      const exact = stmts.getFact.get(q);
      if (exact) return exact;
      return stmts.searchFacts.get(`%${q}%`, q) || null;
    }

    // JSON fallback
    if (!this._jsonData) this._loadJSON();
    const exact = this._jsonData.facts.find(f => f.key === q);
    if (exact) return exact;
    return this._jsonData.facts.find(f => f.key.includes(q) || q.includes(f.key)) || null;
  }

  /**
   * Forget a fact
   * @param {string} key — Key to delete
   * @returns {boolean} true if deleted
   */
  forget(key) {
    if (!key) return false;
    const cleanKey = String(key).trim().toLowerCase();

    if (stmts) {
      const result = stmts.deleteFact.run(cleanKey);
      return result.changes > 0;
    }

    // JSON fallback
    if (!this._jsonData) this._loadJSON();
    const before = this._jsonData.facts.length;
    this._jsonData.facts = this._jsonData.facts.filter(f => f.key !== cleanKey);
    if (this._jsonData.facts.length !== before) { this._saveJSON(); return true; }
    return false;
  }
}

module.exports = new MemoryService();

