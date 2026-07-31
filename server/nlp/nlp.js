/**
 * AXI NLP Engine
 * ---------------
 * Hybrid NLP system combining:
 *
 * 1. NLU Pipeline (preprocessing, NER, POS tagging)
 * 2. Rule-based pattern matching (loaded recursively) - HIGHEST PRIORITY
 * 3. Semantic matching (sentence embeddings + cosine similarity)
 * 4. Machine Learning (brain.js neural network) - FALLBACK
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const brain = require("brain.js");
const nluPipeline = require("./nlu-pipeline");
const preprocessor = require("./preprocessor");
const { loadAllRules } = require("./rule-loader");
const semanticMatcher = require("./semantic");
const contextStore = require("./context-store");
const { logger } = require("../utils");
const learningMonitor = require("./learning-monitor");

// ===========================
// Model Loading
// ===========================

const MODEL_PATH = {
  model: path.join(__dirname, "../data/models/model-tf", "model.json"),
  vocab: path.join(__dirname, "../data/models/model-tf", "vocab.json"),
};

let net = new brain.NeuralNetwork();
let vocab = [];
let intentList = [];
let isModelLoaded = false;
let rules = [];

// Feature hashing config — set from vocab.json at load time
let hashBuckets = 0; // 0 = legacy mode (use vocabIndex), >0 = hashed mode

/**
 * FNV-1a hash → bucket index (must match train.js exactly)
 * @param {string} word
 * @returns {number} bucket index 0..hashBuckets-1
 */
function hashWord(word) {
  let hash = 2166136261;
  for (let i = 0; i < word.length; i++) {
    hash ^= word.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash % hashBuckets;
}

// O(1) vocab lookup map (legacy mode only)
let vocabIndex = new Map();

/**
 * Load brain.js model from disk with timing
 * @returns {boolean} true if model loaded successfully
 */
function loadModel() {
  const startMs = Date.now();
  try {
    if (!fs.existsSync(MODEL_PATH.model) || !fs.existsSync(MODEL_PATH.vocab)) {
      logger.warn("NLP model files not found. Run 'npm run train'");
      return false;
    }

    const model = JSON.parse(fs.readFileSync(MODEL_PATH.model, "utf8"));
    const vocabData = JSON.parse(fs.readFileSync(MODEL_PATH.vocab, "utf8"));

    vocab = vocabData.vocab;
    intentList = vocabData.intents;
    hashBuckets = vocabData.hashBuckets || 0;

    if (hashBuckets > 0) {
      logger.info(`[NLP] Using feature hashing (${hashBuckets} buckets)`);
    } else {
      // Legacy mode: rebuild O(1) vocab index map
      vocabIndex = new Map();
      vocab.forEach((word, idx) => vocabIndex.set(word, idx));
    }

    net.fromJSON(model);
    isModelLoaded = true;

    const elapsed = Date.now() - startMs;
    logger.success(`Brain.js model loaded (${vocab.length} vocab, ${intentList.length} intents) in ${elapsed}ms`);
    return true;
  } catch (error) {
    logger.error("Failed to load NLP model", error.message);
    return false;
  }
}

function loadRules() {
  try {
    rules = loadAllRules();
  } catch (error) {
    logger.error("Failed to load rules", error.message);
    rules = [];
  }
}

// Load on startup
loadModel();
loadRules();

/**
 * Convert text to feature vector for Brain.js inference.
 * Uses feature hashing (h{bucket}) if model was trained with hashing,
 * otherwise falls back to legacy vocab index (w{index}).
 */
function textToFeatures(text) {
  const { tokens } = preprocessor.preprocess(text);
  const features = {};

  if (hashBuckets > 0) {
    // Hashed mode — matches train.js v2.3+
    tokens.forEach((token) => {
      const bucket = hashWord(token);
      features[`h${bucket}`] = 1;
    });
  } else {
    // Legacy mode — direct vocab index
    tokens.forEach((token) => {
      const index = vocabIndex.get(token);
      if (index !== undefined) {
        features[`w${index}`] = 1;
      }
    });
  }

  return features;
}

// ===========================
// Rule-Based Layer (Dynamic)
// ===========================

function rulesLayer(text, nlu) {
  let bestMatch = null;
  let highestSpecificity = -1;

  for (const rule of rules) {
    try {
      const result = rule.fn(text, nlu);
      if (result) {
        const specificity = result.confidence || 1.0;

        if (specificity > highestSpecificity) {
          highestSpecificity = specificity;
          bestMatch = { ...result, confidence: 1.0 * specificity };
        }
      }
    } catch (err) {
      // Log broken rules so they can be fixed — never silently swallow
      logger.warn(`Rule "${rule.name || "unnamed"}" threw: ${err.message}`);
    }
  }

  return bestMatch;
}

// ===========================
// ML Layer
// ===========================

function mlLayer(text) {
  if (!isModelLoaded || vocab.length === 0) {
    return { intent: "none", confidence: 0, entities: {} };
  }

  const output = net.run(textToFeatures(text));

  let bestIntent = "none";
  let bestScore = 0;

  Object.keys(output).forEach((intent) => {
    if (output[intent] > bestScore) {
      bestScore = output[intent];
      bestIntent = intent;
    }
  });

  // Hard floor for classifier noise
  if (bestScore < 0.2) {
    return { intent: "none", confidence: bestScore, entities: {} };
  }

  return { intent: bestIntent, confidence: bestScore, entities: {} };
}

// ===========================
// Semantic Layer
// ===========================

async function semanticLayer(text) {
  try {
    const result = await semanticMatcher.semanticMatch(text);
    if (result && result.confidence >= 0.75) {
      return result;
    }
  } catch (error) {
    logger.warn("Semantic matching error:", error.message);
  }
  return null;
}

// ===========================
// Main Export
// ===========================

const decisionEngine = require("./decision-engine");

/**
 * Trigger curated retraining from approved logs (non-blocking async)
 * @returns {Promise<boolean>} true if training succeeded
 */
async function retrainFromLogs() {
  const queue = learningMonitor.getTrainingQueue();
  if (queue.length === 0) {
    logger.info("[Learning] No items to retrain.");
    return false;
  }

  const learnedPath = path.join(__dirname, "intents", "learned.json");
  let learnedData = [];
  if (fs.existsSync(learnedPath)) {
    try {
      learnedData = JSON.parse(fs.readFileSync(learnedPath, "utf8"));
    } catch {
      learnedData = [];
    }
  }

  // Update intent data
  queue.forEach((item) => {
    let entry = learnedData.find((d) => d.intent === item.intent);
    if (!entry) {
      entry = { intent: item.intent, utterances: [] };
      learnedData.push(entry);
    }
    if (!entry.utterances.includes(item.text)) {
      entry.utterances.push(item.text);
    }
  });

  fs.writeFileSync(learnedPath, JSON.stringify(learnedData, null, 2));
  logger.success(`[Learning] Added ${queue.length} new utterances to learned.json`);

  // Run training asynchronously via spawn (does NOT block the event loop)
  logger.info("[Learning] Starting retraining...");
  return new Promise((resolve) => {
    const child = spawn("node", ["train.js"], {
      cwd: __dirname,
      stdio: "inherit",
    });

    child.on("close", (code) => {
      if (code === 0) {
        learningMonitor.clearTrainingQueue();
        loadModel();
        logger.success("[Learning] Retraining completed successfully");
        const socketData = require("../core/socket");
        socketData.emit("training_complete", { success: true, message: "Autonomous cycle: Retraining completed" });
        resolve(true);
      } else {
        logger.error(`[Learning] Retraining exited with code ${code}`);
        resolve(false);
      }
    });

    child.on("error", (err) => {
      logger.error(`[Learning] Retraining failed: ${err.message}`);
      resolve(false);
    });
  });
}

// High-Performance LRU Response Cache (Capacity: 100 entries)
const RESPONSE_CACHE = new Map();
const MAX_CACHE_SIZE = 100;

function getCachedResult(key) {
  if (!RESPONSE_CACHE.has(key)) return null;
  const val = RESPONSE_CACHE.get(key);
  RESPONSE_CACHE.delete(key); // Refresh key position
  RESPONSE_CACHE.set(key, val);
  return { ...val, cached: true };
}

function setCachedResult(key, val) {
  if (RESPONSE_CACHE.size >= MAX_CACHE_SIZE) {
    const oldestKey = RESPONSE_CACHE.keys().next().value;
    RESPONSE_CACHE.delete(oldestKey);
  }
  RESPONSE_CACHE.set(key, val);
}

module.exports = {
  /**
   * Interpret user input using the layered NLP system
   * Priority order: Cache → Rules → Semantic → Brain.js
   *
   * @param {string} text - User input
   * @returns {Promise<Object>} - Interpretation result
   */
  async interpret(text) {
    if (!text || typeof text !== "string") return { intent: "none", confidence: 0, entities: {} };
    
    const cacheKey = text.trim().toLowerCase();
    const cached = getCachedResult(cacheKey);
    if (cached) return cached;

    const nlu = nluPipeline.process(text);

    // Step 1: Rules (always first, highest priority)
    const rule = rulesLayer(text, nlu);
    if (rule) {
      const res = { ...rule, source: "rules", nlu };
      setCachedResult(cacheKey, res);
      return res;
    }

    // Step 2: Semantic matching (embeddings + similarity)
    const semantic = await semanticLayer(text);
    if (semantic) {
      const res = { ...semantic, source: "semantic", nlu };
      setCachedResult(cacheKey, res);
      return res;
    }

    // Step 3: Brain.js ML classifier (fallback)
    const ml = mlLayer(text);

    // Learning Loop: Log failures
    if (ml.intent === "none") {
      learningMonitor.logUnknown(text, { source: "classifier" });
    } else if (ml.confidence < 0.6) {
      learningMonitor.logLowConfidence(text, ml.intent, ml.confidence);
    }

    const res = { ...ml, source: "classifier", nlu };
    setCachedResult(cacheKey, res);
    return res;
  },

  /**
   * Interpret with full decision engine — provides decision type
   * (execute, confirm, clarify, unknown)
   *
   * @param {string} text - User input
   * @returns {Promise<Object>} - Decision result with action recommendation
   */
  async interpretWithDecision(text) {
    const nlu = nluPipeline.process(text);

    // Execute all layers in parallel
    const [rule, semantic, classifier] = await Promise.all([
      rulesLayer(text, nlu),
      semanticLayer(text),
      mlLayer(text),
    ]);

    // Pass all signals to decision engine for weighted ensemble scoring
    const decision = decisionEngine.decide(
      { rules: rule, semantic, classifier },
      { lastIntent: null },
    );

    return {
      ...decision,
      nlu,
      signals: {
        rules: rule,
        semantic,
        classifier,
      },
    };
  },

  /**
   * Process multi-intent commands
   * e.g., "open youtube and play music" → 2 separate actions
   *
   * @param {string} text - User input
   * @returns {Promise<Object>} - Multi-intent result
   */
  async interpretMulti(text) {
    const self = this;
    return decisionEngine.processMultiIntent(text, async (segment) => {
      return self.interpret(segment);
    });
  },

  /**
   * Synchronous interpret for backward compatibility
   * Only uses Rules + ML (no semantic)
   */
  interpretSync(text) {
    const nlu = nluPipeline.process(text);

    const rule = rulesLayer(text, nlu);
    if (rule) return { ...rule, source: "rules", nlu };

    const ml = mlLayer(text);
    return { ...ml, source: "classifier", nlu };
  },

  debug(text) {
    return nluPipeline.debug(text);
  },

  /**
   * Debug semantic matching for a given text
   */
  async debugSemantic(text) {
    return semanticMatcher.debug(text);
  },

  /**
   * Debug decision engine for a given text
   */
  async debugDecision(text) {
    const result = await this.interpretWithDecision(text);
    return decisionEngine.explainDecision(result);
  },

  /**
   * Interpret with full context awareness
   * Handles pronouns, follow-ups, and conversational continuity
   *
   * @param {string} text - User input
   * @returns {Promise<Object>} - Context-aware interpretation result
   */
  async interpretWithContext(text) {
    // Step 1: Resolve pronouns first (e.g., "open it" → "open youtube")
    const resolved = contextStore.resolvePronoun(text);
    const textToInterpret = resolved.resolved ? resolved.text : text;

    // Step 2: Check for follow-up commands (e.g., "louder", "again")
    let followUp = null;

    if (!resolved.resolved || !/open|play|start/.test(resolved.text)) {
      followUp = contextStore.detectFollowUp(textToInterpret);
    }

    if (followUp) {
      return {
        intent: followUp.intent,
        confidence: followUp.confidence,
        source: "context",
        reason: followUp.reason,
        nlu: nluPipeline.process(textToInterpret),
      };
    }

    // Step 3: Standard interpretation
    const result = await this.interpret(textToInterpret);

    // Add context metadata
    result.contextResolved = resolved.resolved;
    result.originalInput = resolved.resolved ? text : null;
    result.resolvedReference = resolved.reference;

    return result;
  },

  /**
   * Update context after successful command execution
   */
  updateContext(interaction) {
    contextStore.push(interaction);
  },

  /**
   * Get current context state
   */
  getContext() {
    return contextStore.getState();
  },

  /**
   * Clear context (new session)
   */
  clearContext() {
    contextStore.clear();
  },

  reloadModel() {
    loadModel();
  },

  reloadRules() {
    loadRules();
  },

  reloadSemantic() {
    semanticMatcher.reload();
  },

  /**
   * Initialize semantic matching (call on startup if needed)
   */
  async initializeSemantic() {
    return semanticMatcher.initialize();
  },

  /**
   * Status/health info for diagnostics
   */
  getStatus() {
    return {
      modelLoaded: isModelLoaded,
      vocabSize: vocab.length,
      intentCount: intentList.length,
      rulesCount: rules.length,
    };
  },

  /**
   * Export modules for direct access
   */
  decisionEngine,
  contextStore,
  learningMonitor,
  retrainFromLogs,
};
