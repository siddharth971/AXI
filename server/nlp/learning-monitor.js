const fs = require('fs');
const path = require('path');
const { logger } = require('../utils');

class LearningMonitor {
  constructor() {
    this.logsDir = path.join(__dirname, 'logs');
    this.logFile = path.join(this.logsDir, 'learning.json');
    this.failedFile = path.join(this.logsDir, 'failures.json');
    this.correctionsFile = path.join(this.logsDir, 'corrections.json');

    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
   * Log an unknown input (intent = 'none' or unhandled)
   * @param {string} text - The user input
   * @param {Object} context - Context state
   */
  logUnknown(text, context = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      type: 'unknown',
      text,
      context,
      status: 'pending_review'
    };
    this._appendLog(this.failedFile, entry);
    logger.info(`[Learning] Logged unknown input: "${text}"`);
  }

  /**
   * Log a low confidence prediction
   * @param {string} text - User input
   * @param {string} intent - Predicted intent
   * @param {number} confidence - Confidence score
   */
  logLowConfidence(text, intent, confidence) {
    const entry = {
      timestamp: new Date().toISOString(),
      type: 'low_confidence',
      text,
      predictedIntent: intent,
      confidence,
      status: 'pending_review'
    };
    this._appendLog(this.failedFile, entry);
    logger.info(`[Learning] Logged low confidence: "${text}" -> ${intent} (${confidence.toFixed(2)})`);
  }

  /**
   * Log a user correction
   * @param {string} originalText - What the user said originally
   * @param {string} originalIntent - What we thought it was
   * @param {string} correctIntent - What it actually was (if known) or "corrected_by_user"
   */
  logCorrection(originalText, originalIntent, correctIntent) {
    const entry = {
      timestamp: new Date().toISOString(),
      type: 'correction',
      text: originalText,
      originalIntent,
      correctIntent,
      status: 'pending_retrain'
    };
    this._appendLog(this.correctionsFile, entry);
    logger.info(`[Learning] Logged correction: "${originalText}" was ${originalIntent}, should be ${correctIntent}`);
  }

  /**
   * Approve a log entry for retraining
   * @param {Object} entry - The log entry
   * @param {string} targetIntent - The validated intent
   */
  async approveForTraining(entry, targetIntent) {
    // In a real database system, we'd update the record. 
    // Here we might move it to a 'training_queue.json'
    const trainingEntry = {
      text: entry.text,
      intent: targetIntent,
      addedAt: new Date().toISOString()
    };

    const queueFile = path.join(this.logsDir, 'training_queue.json');
    this._appendLog(queueFile, trainingEntry);
    logger.success(`[Learning] Approved "${entry.text}" for intent "${targetIntent}"`);
  }

  _appendLog(filePath, data) {
    try {
      let logs = [];
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        try {
          logs = JSON.parse(content);
        } catch (e) {
          // If corrupted, start new
          logger.warn(`[Learning] Log file corrupted: ${filePath}`);
        }
      }

      logs.push(data);
      fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));
    } catch (err) {
      logger.error(`[Learning] Failed to write to log: ${err.message}`);
    }
  }

  // ========================================================
  // Retraining Helpers
  // ========================================================

  /**
   * Get all pending training items
   */
  getTrainingQueue() {
    const queueFile = path.join(this.logsDir, 'training_queue.json');
    if (!fs.existsSync(queueFile)) return [];
    try {
      return JSON.parse(fs.readFileSync(queueFile, 'utf8'));
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear training queue after successful processing
   */
  clearTrainingQueue() {
    const queueFile = path.join(this.logsDir, 'training_queue.json');
    if (fs.existsSync(queueFile)) {
      fs.writeFileSync(queueFile, '[]');
    }
  }
}

module.exports = new LearningMonitor();
