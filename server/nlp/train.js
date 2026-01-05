/**
 * AXI NLP Model Trainer
 * -----------------------
 * Trains the Brain.js neural network using intent data.
 * 
 * Usage: npm run train
 */

const fs = require("fs");
const path = require("path");
const brain = require("brain.js");
const { loadAllIntents } = require("./intent-loader");

// Output paths
const OUTPUT = {
  model: path.join(__dirname, "model.json"),
  vocab: path.join(__dirname, "vocab.json")
};

// ===========================
// 1. Load Intent Data
// ===========================

console.log("\n🧠 AXI NLP Trainer\n");
console.log("Loading intents...\n");

const intents = loadAllIntents();

if (intents.length === 0) {
  console.error("❌ No intents found. Check nlp/intents/ folder.");
  process.exit(1);
}

// ===========================
// 2. Build Vocabulary
// ===========================

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

const vocabSet = new Set();

intents.forEach(item => {
  item.utterances.forEach(u => {
    tokenize(u).forEach(token => vocabSet.add(token));
  });
});

const vocab = Array.from(vocabSet);
console.log(`📚 Vocabulary size: ${vocab.length} words\n`);

// ===========================
// 3. Build Training Set
// ===========================

function textToFeatures(text) {
  const tokens = tokenize(text);
  const features = {};
  vocab.forEach((word, i) => {
    features[`w${i}`] = tokens.includes(word) ? 1 : 0;
  });
  return features;
}

// Get all unique intents
const intentList = [...new Set(intents.map(i => i.intent))];
console.log(`🎯 Intent count: ${intentList.length}\n`);

const trainingSet = [];

intents.forEach(item => {
  const intentIndex = intentList.indexOf(item.intent);
  item.utterances.forEach(u => {
    const output = {};
    intentList.forEach((intent, i) => {
      output[intent] = i === intentIndex ? 1 : 0;
    });

    trainingSet.push({
      input: textToFeatures(u),
      output
    });
  });
});

console.log(`📊 Training samples: ${trainingSet.length}\n`);

// ===========================
// 4. Train Network
// ===========================

const net = new brain.NeuralNetwork({
  hiddenLayers: [32, 16],
  activation: "sigmoid"
});

console.log("🏋️ Training neural network...\n");

const stats = net.train(trainingSet, {
  iterations: 5000,
  errorThresh: 0.005,
  log: true,
  logPeriod: 1000
});

console.log(`\n✅ Training complete!`);
console.log(`   Iterations: ${stats.iterations}`);
console.log(`   Error: ${stats.error.toFixed(6)}`);

// ===========================
// 5. Save Model
// ===========================

const modelJSON = net.toJSON();

fs.writeFileSync(OUTPUT.model, JSON.stringify(modelJSON, null, 2));
fs.writeFileSync(OUTPUT.vocab, JSON.stringify({ vocab, intents: intentList }, null, 2));

console.log(`\n📁 Model saved: ${OUTPUT.model}`);
console.log(`📁 Vocab saved: ${OUTPUT.vocab}\n`);
