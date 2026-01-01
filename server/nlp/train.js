const fs = require("fs");
const path = require("path");
const brain = require("brain.js");

const dataPath = path.join(__dirname, "training-data.json");

const vocabPath = path.join(__dirname, "vocab.json");

const raw = fs.readFileSync(dataPath, "utf8");
const intents = JSON.parse(raw);

// -------------------------
// 1. Build vocabulary
// -------------------------
const vocabSet = new Set();

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

intents.forEach(i => {
  i.utterances.forEach(u => {
    tokenize(u).forEach(token => vocabSet.add(token));
  });
});

const vocab = Array.from(vocabSet);

// -------------------------
// 2. Convert text → features
// -------------------------
function textToFeatures(text) {
  const tokens = tokenize(text);
  return vocab.map((word) => (tokens.includes(word) ? 1 : 0));
}

// -------------------------
// 3. Build training set
// -------------------------
const trainingSet = [];

intents.forEach(item => {
  item.utterances.forEach(u => {
    trainingSet.push({
      input: textToFeatures(u),
      output: { [item.intent]: 1 }
    });
  });
});

// -------------------------
// 4. Train network
// -------------------------
const net = new brain.NeuralNetwork({
  hiddenLayers: [16, 16]
});

console.log("Training NLP model...");
net.train(trainingSet, {
  iterations: 5000,
  errorThresh: 0.005,
  log: true,
  logPeriod: 500
});

// -------------------------
// 5. Save model + vocab
// -------------------------
const modelJSON = net.toJSON();

// Extract weights (heavy part)
const weights = { layers: modelJSON.layers };

// Extract metadata (everything else: sizes, type, trainOpts, outputLookup, inputLookup, etc.)
const { layers, ...meta } = modelJSON;

fs.writeFileSync(path.join(__dirname, "model-meta.json"), JSON.stringify(meta, null, 2));
fs.writeFileSync(path.join(__dirname, "model-weights.json"), JSON.stringify(weights, null, 2));
fs.writeFileSync(vocabPath, JSON.stringify(vocab, null, 2));
console.log("✅ Model & vocab saved (Split format).");
