/**
 * AXI NLP Engine
 * ---------------
 * Hybrid NLP system combining:
 * 
 * 1. NLU Pipeline (preprocessing, NER, POS tagging)
 * 2. Rule-based pattern matching (loaded recursively)
 * 3. Machine Learning (brain.js neural network)
 */

const fs = require("fs");
const path = require("path");
const brain = require("brain.js");
const nluPipeline = require("./nlu-pipeline");
const { loadAllRules } = require("./rule-loader");
const { logger } = require("../utils");

// ===========================
// Model Loading
// ===========================

const MODEL_PATH = {
  model: path.join(__dirname, "model.json"),
  vocab: path.join(__dirname, "vocab.json")
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

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function textToFeatures(text) {
  const tokens = tokenize(text);
  const features = {};
  vocab.forEach((word, i) => {
    features[`w${i}`] = tokens.includes(word) ? 1 : 0;
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
// Main Export
// ===========================

module.exports = {
  interpret(text) {
    const nlu = nluPipeline.process(text);

    const rule = rulesLayer(text, nlu);
    if (rule) return { ...rule, nlu };

    const ml = mlLayer(text);
    return { ...ml, nlu };
  },

  debug(text) {
    return nluPipeline.debug(text);
  },

  reloadModel() {
    loadModel();
  },

  reloadRules() {
    loadRules();
  }
};
