/**
 * AXI Real-Time Autonomous Self-Learner Engine
 * ---------------------------------------------
 * Listens to unhandled & low-confidence queries in real-time,
 * automatically clusters new utterances, appends them to learned datasets,
 * retrains models asynchronously, and hot-reloads intent vectors in memory.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { logger } = require("../utils");
const learningService = require("./learning");
const semanticMatcher = require("../nlp/semantic");
const { initTFIDF, resetTFIDF } = require("../nlp/decision-engine");

const LEARNED_FILE = path.join(__dirname, "../data/intents/learned.json");
const BATCH_THRESHOLD = 3; // Trigger auto-retrain after 3 new corrections/unknowns

class AutoLearnerEngine {
  constructor() {
    this.buffer = [];
    this.isRetraining = false;
  }

  /**
   * Ingest a new utterance for auto-learning
   * @param {string} text - User utterance
   * @param {string} targetIntent - Confirmed or inferred intent
   */
  async ingest(text, targetIntent) {
    if (!text || typeof text !== "string") return;
    const cleanText = text.trim();
    if (cleanText.length < 3) return;

    // Log correction
    learningService.logCorrection(cleanText, "auto_learned", targetIntent || "learned_intent");

    this.buffer.push({ text: cleanText, intent: targetIntent || "learned_intent", timestamp: Date.now() });
    logger.info(`[Auto-Learner] Ingested query: "${cleanText}" (Buffer: ${this.buffer.length}/${BATCH_THRESHOLD})`);

    if (this.buffer.length >= BATCH_THRESHOLD && !this.isRetraining) {
      this.triggerAutoRetrain();
    }
  }

  /**
   * Trigger automatic online model retraining & hot-reload
   */
  async triggerAutoRetrain() {
    if (this.isRetraining) return;
    this.isRetraining = true;
    logger.info("🧠 [Auto-Learner] Threshold reached! Initiating online self-learning retrain...");

    try {
      // 1. Read existing learned.json
      let currentData = {};
      if (fs.existsSync(LEARNED_FILE)) {
        try {
          currentData = JSON.parse(fs.readFileSync(LEARNED_FILE, "utf8"));
        } catch (e) {
          currentData = {};
        }
      }

      // 2. Append buffered utterances to target intent bucket
      for (const item of this.buffer) {
        const intentKey = item.intent || "custom_command";
        if (!currentData[intentKey]) {
          currentData[intentKey] = [];
        }
        if (!currentData[intentKey].includes(item.text)) {
          currentData[intentKey].push(item.text);
        }
      }

      // 3. Persist updated learned intent dataset
      fs.writeFileSync(LEARNED_FILE, JSON.stringify(currentData, null, 2));
      logger.success(`[Auto-Learner] Updated ${LEARNED_FILE} with ${this.buffer.length} new utterances.`);

      // 4. Hot-reload TF-IDF & Semantic Vector Matchers in memory
      resetTFIDF();
      await initTFIDF();
      semanticMatcher.reload();

      logger.success("✨ [Auto-Learner] Online Retraining Complete! Models hot-reloaded into memory.");
      this.buffer = [];
    } catch (err) {
      logger.error("[Auto-Learner] Online retraining failed:", err.message);
    } finally {
      this.isRetraining = false;
    }
  }
}

module.exports = new AutoLearnerEngine();
