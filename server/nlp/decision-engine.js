/**
 * AXI Decision Engine
 * ---------------------
 * Central decision-making module that merges signals from all NLP layers
 * (Rules, TF-IDF, Neural) into a single confidence-aware decision.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { logger } = require("../utils");
const { TFIDFClassifier } = require("./tfidf-classifier");

// --- CONSTANTS (frozen — never mutate at runtime) ---

const THRESHOLDS = Object.freeze({
  EXECUTE: 0.72,      // High confidence → execute immediately
  CLARIFY: 0.50,      // Medium confidence → ask for clarification
});

const WEIGHTS = Object.freeze({
  rules: 0.55,
  tfidf: 0.30,
  neural: 0.15,
});

const DECISIONS = Object.freeze({
  EXECUTE: "execute",
  CLARIFY: "clarify",
  EMOTIONAL: "emotional",
  UNKNOWN: "unknown",
});

const CONJUNCTIONS = Object.freeze([
  "and", "then", "also", "after that", "and then", "plus",
]);

const ACTION_VERBS = Object.freeze([
  "open", "close", "play", "pause", "stop", "start",
  "mute", "unmute", "search", "find", "create", "delete",
  "show", "tell", "what", "turn", "increase", "decrease",
  "list", "run", "execute", "launch", "check",
]);

// TF-IDF Singleton
let _tfidf = null;

/**
 * Initialize TF-IDF Classifier from disk
 */
async function initTFIDF() {
  if (_tfidf) return _tfidf;

  const modelPath = path.join(__dirname, "..", "data", "tfidf-model.json");
  try {
    if (fs.existsSync(modelPath)) {
      _tfidf = new TFIDFClassifier();
      await _tfidf.load(modelPath);
      logger.success("[TF-IDF] Classifier ready");
      return _tfidf;
    }
  } catch (err) {
    logger.warn(`[TF-IDF] Model failed to load: ${err.message}`);
  }

  logger.warn("[TF-IDF] Model not found — run 'npm run train:tfidf'");
  return null;
}

/**
 * Reset TF-IDF classifier (for hot-reload / testing)
 */
function resetTFIDF() {
  _tfidf = null;
  logger.info("[TF-IDF] Classifier reset — call initTFIDF() to reload");
}

/**
 * Safe run helper for parallel execution
 */
async function safeRun(fn) {
  try {
    return await fn();
  } catch (err) {
    logger.error("Ensemble layer failed", err.message);
    return null;
  }
}

/**
 * Build a decision result object (DRY helper for the gate logic)
 * @param {string} intent - Resolved intent
 * @param {number} score - Ensemble confidence score
 * @param {string} decision - Decision type (execute, clarify, etc.)
 * @param {Array} candidates - Sorted candidate list
 * @param {Object} sources - Per-layer raw results
 * @param {Object} weightedBreakdown - Per-layer weighted scores
 * @param {Object} [extra] - Additional fields to merge
 * @returns {Object} Decision result
 */
function buildDecision(intent, score, decision, candidates, sources, weightedBreakdown, extra = {}) {
  return {
    intent,
    confidence: score,
    decision,
    candidates,
    sources,
    weightedBreakdown,
    ...extra,
  };
}

/**
 * Decision Engine Module
 */
const DecisionEngine = {
  THRESHOLDS,
  DECISIONS,
  WEIGHTS,
  initTFIDF,
  resetTFIDF,

  /**
   * Resolve intent using Weighted Ensemble Scoring
   */
  async resolveIntent(input, nlu, deps) {
    const { rulesLayer, neuralClassifier } = deps;
    const sentiment = nlu.meta?.sentiment || "neutral";

    // 1. Run all layers in parallel
    const [rulesResult, tfidfResult, neuralResult] = await Promise.all([
      safeRun(() => rulesLayer.run(input)),
      safeRun(() => _tfidf?.classifyOne(input) || null),
      safeRun(() => neuralClassifier?.predict(input) || null),
    ]);

    // 2. Accumulate scores + track per-layer weighted contributions
    const scores = new Map();
    const weightedBreakdown = {};

    const applyScore = (res, weight, layerName) => {
      if (!res || !res.intent || res.intent === "none" || res.intent === "unknown") {
        weightedBreakdown[layerName] = { intent: null, raw: 0, weighted: 0 };
        return;
      }
      const rawConfidence = res.confidence || 0;
      const weightedScore = rawConfidence * weight;
      const current = scores.get(res.intent) || 0;
      scores.set(res.intent, current + weightedScore);
      weightedBreakdown[layerName] = {
        intent: res.intent,
        raw: rawConfidence,
        weighted: weightedScore,
      };
    };

    applyScore(rulesResult, WEIGHTS.rules, "rules");
    applyScore(tfidfResult, WEIGHTS.tfidf, "tfidf");
    applyScore(neuralResult, WEIGHTS.neural, "neural");

    // 3. Sort candidates
    const sorted = Array.from(scores.entries())
      .map(([intent, score]) => ({ intent, score }))
      .sort((a, b) => b.score - a.score);

    const topCandidate = sorted[0];
    const topIntent = topCandidate ? topCandidate.intent : "none";
    const topScore = topCandidate ? topCandidate.score : 0;

    const sources = {
      rules: rulesResult,
      tfidf: tfidfResult,
      neural: neuralResult,
    };

    // 4. Gate Decision
    if (topScore >= THRESHOLDS.EXECUTE) {
      return buildDecision(topIntent, topScore, DECISIONS.EXECUTE, sorted, sources, weightedBreakdown);
    }

    if (topScore >= THRESHOLDS.CLARIFY) {
      return buildDecision(topIntent, topScore, DECISIONS.CLARIFY, sorted, sources, weightedBreakdown);
    }

    // Sentiment fallback
    if (sentiment === "positive" || sentiment === "negative") {
      return buildDecision("conversational_emotional", 1.0, DECISIONS.EMOTIONAL, [], sources, weightedBreakdown, { sentiment });
    }

    // Default Unknown
    return buildDecision("none", topScore, DECISIONS.UNKNOWN, sorted, sources, weightedBreakdown);
  },

  /**
   * Explain classification result
   */
  explainClassification(input, intent) {
    if (!_tfidf) return { error: "TF-IDF model not loaded" };
    return _tfidf.explain(input, intent);
  },

  /**
   * Old sync method for backward compatibility
   */
  decide(signals) {
    return this.resolveIntent(signals.input || "", { meta: { sentiment: "neutral" } }, {
      rulesLayer: { run: () => signals.rules },
      neuralClassifier: { predict: () => signals.classifier },
    });
  },

  /**
   * Multi-intent detection with validation.
   * Only splits if BOTH resulting fragments independently contain an action verb.
   * This prevents "play lofi AND ambient music" from producing a broken second segment.
   */
  detectMultiIntent(text) {
    if (!text || typeof text !== "string") return { isMulti: false, segments: [text] };
    const lowerText = text.toLowerCase();

    for (const conj of CONJUNCTIONS) {
      const idx = lowerText.indexOf(` ${conj} `);
      if (idx > 0) {
        const parts = text
          .split(new RegExp(`\\s+${conj}\\s+`, "i"))
          .map(p => p.trim())
          .filter(Boolean);

        // Require all parts to independently contain an action verb
        const allPartsHaveVerb = parts.length >= 2 && parts.every(p => this.hasActionVerb(p));
        if (allPartsHaveVerb) {
          return { isMulti: true, segments: parts, conjunction: conj };
        }
      }
    }
    return { isMulti: false, segments: [text] };
  },

  hasActionVerb(text) {
    const lower = text.toLowerCase();
    return ACTION_VERBS.some(verb => lower.startsWith(verb) || lower.includes(` ${verb} `));
  },

  async processMultiIntent(text, interpretFn) {
    const detection = this.detectMultiIntent(text);
    if (!detection.isMulti) return { isMulti: false, results: [await interpretFn(text)] };

    const results = [];
    for (const segment of detection.segments) {
      results.push({ segment, ...await interpretFn(segment) });
    }
    return { isMulti: true, conjunction: detection.conjunction, segments: detection.segments, results };
  },

  generateConfirmation(intent) {
    const confirmations = {
      open_youtube: "Did you want me to open YouTube?",
      play: "Should I start playing music?",
      pause: "Would you like me to pause?",
      volume_up: "Increase the volume?",
      volume_down: "Decrease the volume?",
      mute: "Should I mute the sound?",
      search_youtube: "Search YouTube for that?",
      default: `I think you want: "${intent}". Is that correct?`,
    };
    return confirmations[intent] || confirmations.default;
  },

  generateClarification(intent) {
    if (intent && intent !== "unknown" && intent !== "none") {
      return `I'm not quite sure - did you mean "${intent}" or something else?`;
    }
    return "I didn't quite catch that. Could you say it differently?";
  },

  explainDecision(decision) {
    return {
      action: decision.decision,
      intent: decision.intent,
      confidence: `${(decision.confidence * 100).toFixed(1)}%`,
      source: "ensemble",
      weightedBreakdown: decision.weightedBreakdown || {},
      reason: decision.decision === "execute" ? "High ensemble confidence" : "Low confidence",
    };
  },
};

module.exports = DecisionEngine;
