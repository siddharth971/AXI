/**
 * Continuous Learning Service
 * ---------------------------
 * captures user corrections and manages the training dataset.
 */

const fs = require("fs");
const path = require("path");

class LearningService {
  constructor() {
    this.CORRECTIONS_FILE = path.join(__dirname, "../data/corrections.json");
    this.corrections = [];
    this.init();
  }

  /**
   * Initialize service
   */
  init() {
    this.load();
    console.log(`🎓 Learning: Loaded ${this.corrections.length} corrections.`);
  }

  /**
   * Load corrections from disk
   */
  load() {
    try {
      if (fs.existsSync(this.CORRECTIONS_FILE)) {
        this.corrections = JSON.parse(
          fs.readFileSync(this.CORRECTIONS_FILE, "utf8"),
        );
      } else {
        this.save();
      }
    } catch (err) {
      console.error("❌ Learning Load Error:", err.message);
      this.corrections = [];
    }
  }

  /**
   * Save corrections to disk
   */
  save() {
    try {
      fs.writeFileSync(
        this.CORRECTIONS_FILE,
        JSON.stringify(this.corrections, null, 2),
      );
    } catch (err) {
      console.error("❌ Learning Save Error:", err.message);
    }
  }

  /**
   * Log a correction
   * @param {string} utterance - What the user said originally
   * @param {string} originalIntent - What AXI thought it was
   * @param {string} correctIntent - What it actually was
   */
  logCorrection(utterance, originalIntent, correctIntent) {
    if (!utterance || !correctIntent) return false;

    const entry = {
      utterance: utterance.trim(),
      predicted_intent: originalIntent,
      correct_intent: correctIntent,
      timestamp: new Date().toISOString(),
      status: "pending_training", // pending_training, trained
    };

    this.corrections.push(entry);
    this.save();
    console.log(`🎓 Correction logged: "${utterance}" -> ${correctIntent}`);
    return true;
  }

  /**
   * Get all pending corrections
   */
  getPending() {
    return this.corrections.filter((c) => c.status === "pending_training");
  }

  /**
   * Mark corrections as trained (placeholder for future auto-retrain)
   */
  markTrained(ids) {
    // TODO: robust ID system needed if we partial update
    // For now, mark all or specific logic
  }
}

module.exports = new LearningService();
