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

const fs = require("fs");
const path = require("path");
const brain = require("brain.js");
const nluPipeline = require("./nlu-pipeline");
const preprocessor = require("./preprocessor");
const { loadAllRules } = require("./rule-loader");
const semanticMatcher = require("./semantic");
const { logger } = require("../utils");


// ===========================
// Model Loading
// ===========================

const MODEL_PATH = {
  model: path.join(__dirname, "model-tf", "model.json"),
  vocab: path.join(__dirname, "model-tf", "vocab.json")
};

let net = new brain.NeuralNetwork();
let vocab = [];
let intentList = [];
let isModelLoaded = false;
let rules = [];

function loadModel() {
  try {
    if (!fs.existsSync(MODEL_PATH.model) || !fs.existsSync(MODEL_PATH.vocab)) {
      logger.warn("NLP model files not found. Run 'npm run train'");
      return;
    }

    const model = JSON.parse(fs.readFileSync(MODEL_PATH.model, "utf8"));
    const vocabData = JSON.parse(fs.readFileSync(MODEL_PATH.vocab, "utf8"));

    vocab = vocabData.vocab;
    intentList = vocabData.intents;

    net.fromJSON(model);
    isModelLoaded = true;
    logger.success("Brain.js model loaded successfully");
  } catch (error) {
    logger.error("Failed to load NLP model", error.message);
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

// ===========================
// Feature Extraction
// ===========================

function textToFeatures(text) {
  // Use same preprocessing as training
  const { tokens } = preprocessor.preprocess(text);

  const features = {};
  tokens.forEach(token => {
    const index = vocab.indexOf(token);
    if (index > -1) {
      features[`w${index}`] = 1;
    }
  });
  return features;
}

// ===========================
// Rule-Based Layer (Dynamic)
// ===========================

function rulesLayer(text, nlu) {
  // Run all loaded rules
  for (const rule of rules) {
    try {
      const result = rule.fn(text, nlu);
      if (result) {
        return result;
      }
    } catch (err) {
      // Skip failed rules silently
    }
  }

  return null;
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

  Object.keys(output).forEach(intent => {
    if (output[intent] > bestScore) {
      bestScore = output[intent];
      bestIntent = intent;
    }
  });

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
    // Semantic matching failed, fall back to ML
    logger.warn("Semantic matching error:", error.message);
  }
  return null;
}

// ===========================
// Main Export
// ===========================

module.exports = {
  /**
   * Interpret user input using the layered NLP system
   * Priority order: Rules → Semantic → Brain.js
   * 
   * @param {string} text - User input
   * @returns {Promise<Object>} - Interpretation result
   */
  async interpret(text) {
    const nlu = nluPipeline.process(text);

    // Step 1: Rules (always first, highest priority)
    const rule = rulesLayer(text, nlu);
    if (rule) return { ...rule, source: "rules", nlu };

    // Step 2: Semantic matching (embeddings + similarity)
    const semantic = await semanticLayer(text);
    if (semantic) return { ...semantic, source: "semantic", nlu };

    // Step 3: Brain.js ML classifier (fallback)
    const ml = mlLayer(text);
    return { ...ml, source: "classifier", nlu };
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
  }
};
