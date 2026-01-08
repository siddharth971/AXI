/**
 * AXI NLP Model Trainer (TensorFlow.js Edition)
 * --------------------------------------------
 * Upgraded to use TFJS Layers Model with Embeddings.
 * Saves in binary format for efficiency.
 */

const fs = require("fs");
const path = require("path");
const tf = require("@tensorflow/tfjs");
const { loadAllIntents } = require("./intent-loader");

// Output paths
const OUTPUT_DIR = path.join(__dirname, "model-tf");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const VOCAB_PATH = path.join(OUTPUT_DIR, "vocab.json");
const META_PATH = path.join(OUTPUT_DIR, "meta.json");

// Configuration
const MAX_LEN = 12; // Max sequence length
const EMBED_DIM = 16;
const EPOCHS = 100;

// Colors for console
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m"
};

console.log(`\n${colors.cyan}${colors.bright}🧠 AXI TENSORFLOW TRAINER${colors.reset}\n`);

// 1. Load Data
const intentData = loadAllIntents();
const intentList = [...new Set(intentData.map(i => i.intent))];

// 2. Build Vocabulary
function cleanText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

const vocab = new Set();
intentData.forEach(item => {
  item.utterances.forEach(u => {
    cleanText(u).split(/\s+/).forEach(word => vocab.add(word));
  });
});

const vocabArray = ["<PAD>", "<OOV>", ...Array.from(vocab)];
const wordToIndex = {};
vocabArray.forEach((word, i) => wordToIndex[word] = i);

console.log(`   Vocab Size: ${vocabArray.length}`);
console.log(`   Intents: ${intentList.length}`);

// 3. Prepare Training Data
function textToSeq(text) {
  const tokens = cleanText(text).split(/\s+/);
  const seq = tokens.map(t => wordToIndex[t] || 1); // 1 = OOV
  // Pad or truncate
  if (seq.length < MAX_LEN) {
    return [...seq, ...Array(MAX_LEN - seq.length).fill(0)];
  }
  return seq.slice(0, MAX_LEN);
}

const X_data = [];
const Y_data = [];

intentData.forEach(item => {
  const intentIdx = intentList.indexOf(item.intent);
  item.utterances.forEach(u => {
    X_data.push(textToSeq(u));
    const target = Array(intentList.length).fill(0);
    target[intentIdx] = 1;
    Y_data.push(target);
  });
});

const xs = tf.tensor2d(X_data);
const ys = tf.tensor2d(Y_data);

// 4. Build Model
const model = tf.sequential();
model.add(tf.layers.embedding({
  inputDim: vocabArray.length,
  outputDim: EMBED_DIM,
  inputLength: MAX_LEN
}));
model.add(tf.layers.globalAveragePooling1d());
model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
model.add(tf.layers.dropout({ rate: 0.2 }));
model.add(tf.layers.dense({ units: intentList.length, activation: 'softmax' }));

model.compile({
  optimizer: tf.train.adam(0.01),
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
});

// 5. Train
console.log(`\n🏋️ Training for ${EPOCHS} epochs...`);

async function run() {
  await model.fit(xs, ys, {
    epochs: EPOCHS,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (epoch % 20 === 0) {
          console.log(`   Epoch ${epoch}: loss=${logs.loss.toFixed(4)}, acc=${logs.acc.toFixed(4)}`);
        }
      }
    }
  });

  console.log(`\n✅ Training Complete! Final Accuracy: ${(tf.metrics.categoricalAccuracy(ys, model.predict(xs)).dataSync().reduce((a, b) => a + b) / X_data.length * 100).toFixed(2)}%`);

  // 6. Save Model
  const savePath = `file://${OUTPUT_DIR}`;
  await model.save(savePath);

  // Save Vocab and Meta
  fs.writeFileSync(VOCAB_PATH, JSON.stringify({ vocab: vocabArray, intents: intentList }));
  fs.writeFileSync(META_PATH, JSON.stringify({
    trainedAt: new Date().toISOString(),
    maxLen: MAX_LEN,
    vocabSize: vocabArray.length,
    intentCount: intentList.length
  }));

  console.log(`\n📁 Model saved to: ${OUTPUT_DIR}`);
  console.log(`   (Includes model.json and binary weights.bin)`);
}

run();
