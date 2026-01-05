/**
 * AXI NLP Engine
 * ---------------
 * Hybrid NLP system combining:
 * 
 * 1. NLU Pipeline (preprocessing, NER, POS tagging)
 * 2. Rule-based pattern matching (fast, exact)
 * 3. Machine Learning (brain.js neural network)
 */

const fs = require("fs");
const path = require("path");
const brain = require("brain.js");
const nluPipeline = require("./nlu-pipeline");
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

loadModel();

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
// Rule-Based Layer
// ===========================

function rulesLayer(text, nlu) {
  const msg = text.toLowerCase().trim();
  const { entities, signals } = nlu;

  // 1. YouTube Search
  if (entities.searchQuery && /youtube/.test(msg)) {
    return {
      intent: "search_youtube",
      confidence: 1,
      entities: { query: entities.searchQuery }
    };
  }

  // 2. Ask which website
  if (msg === "open website" || msg === "visit website" || msg === "open a website") {
    return { intent: "ask_which_website", confidence: 1, entities: {} };
  }

  // 3. Open website
  if (entities.website && signals.isCommand) {
    if (entities.website === "youtube") {
      return { intent: "open_youtube", confidence: 1, entities: {} };
    }
    return { intent: "open_website", confidence: 1, entities: { url: entities.website } };
  }

  // 4. URL detection
  if (entities.urls && entities.urls.length > 0) {
    return { intent: "open_website", confidence: 1, entities: { url: entities.urls[0] } };
  }

  // 5-10. Keyword rules
  if (/weather|raining|temperature|forecast/.test(msg)) {
    return { intent: "weather_check", confidence: 1, entities: {} };
  }
  if (/joke|funny|laugh/.test(msg)) {
    return { intent: "tell_joke", confidence: 1, entities: {} };
  }
  if (/news|headlines/.test(msg)) {
    return { intent: "news_update", confidence: 1, entities: {} };
  }
  if (/music|song|player|volume|track/.test(msg)) {
    return { intent: "music_control", confidence: 1, entities: {} };
  }
  if (/what time|tell.+time|current time/.test(msg)) {
    return { intent: "tell_time", confidence: 1, entities: {} };
  }
  if (/screenshot|capture|screen.?shot/.test(msg)) {
    return { intent: "take_screenshot", confidence: 1, entities: {} };
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
  }
};
