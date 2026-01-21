/**
 * Long-Term Memory Service
 * -------------------------
 * Stores and retrieves user facts and preferences using a local JSON file.
 */

const fs = require("fs");
const path = require("path");
const { logger } = require("../utils"); // Assuming utils are available

class MemoryService {
  constructor() {
    this.MEMORY_FILE = path.join(__dirname, "../data/memory.json");
    this.data = { facts: [], preferences: {} };
    this.init();
  }

  /**
   * Initialize memory
   */
  init() {
    this.load();
    console.log(`🧠 Memory: Loaded ${this.data.facts.length} facts.`);
  }

  /**
   * Load memory from disk
   */
  load() {
    try {
      if (fs.existsSync(this.MEMORY_FILE)) {
        this.data = JSON.parse(fs.readFileSync(this.MEMORY_FILE, "utf8"));
      } else {
        this.save(); // Create if not exists
      }
    } catch (err) {
      console.error("❌ Memory Load Error:", err.message);
      this.data = { facts: [], preferences: {} }; // Fallback
    }
  }

  /**
   * Save memory to disk
   */
  save() {
    try {
      this.data.last_updated = new Date().toISOString();
      fs.writeFileSync(this.MEMORY_FILE, JSON.stringify(this.data, null, 2));
    } catch (err) {
      console.error("❌ Memory Save Error:", err.message);
    }
  }

  /**
   * Remember a fact
   * @param {string} key - Subject (e.g., "wifi password")
   * @param {string} value - Value (e.g., "secret123")
   */
  remember(key, value) {
    if (!key || !value) return false;

    // Normalize
    const cleanKey = key.trim().toLowerCase();

    // Check if update or new
    const existingIndex = this.data.facts.findIndex((f) => f.key === cleanKey);

    const fact = {
      key: cleanKey,
      value: value.trim(),
      timestamp: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.data.facts[existingIndex] = fact; // Update
    } else {
      this.data.facts.push(fact); // Add new
    }

    this.save();
    return true;
  }

  /**
   * Recall a fact
   * @param {string} query - Query to search for (e.g., "wifi")
   * @returns {object|null} Found fact or null
   */
  recall(query) {
    if (!query) return null;
    const q = query.toLowerCase().trim();

    // 1. Exact match
    const exact = this.data.facts.find((f) => f.key === q);
    if (exact) return exact;

    // 2. Fuzzy / Partial match
    // Simple inclusion search
    const partial = this.data.facts.find(
      (f) => f.key.includes(q) || q.includes(f.key),
    );

    return partial || null;
  }

  /**
   * Forget a fact
   */
  forget(key) {
    const initialLength = this.data.facts.length;
    this.data.facts = this.data.facts.filter(
      (f) => f.key !== key.toLowerCase().trim(),
    );

    if (this.data.facts.length !== initialLength) {
      this.save();
      return true;
    }
    return false;
  }
}

module.exports = new MemoryService();
