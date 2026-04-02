/**
 * AXI NLP Model Trainer (Brain.js Edition)
 * --------------------------------------------
 * Lightweight, Pure JS Neural Network.
 *
 * PERFORMANCE OPTIMIZATIONS (v2.3):
 * - Feature Hashing: compresses vocab (5K+) into fixed 512 buckets → 12x fewer weights
 * - Deduplication of training samples
 * - Auto-tuned config based on dataset scale
 * - Progress timing with ETA
 */

"use strict";

const fs = require("fs");
const path = require("path");
const brain = require("brain.js");
const { loadAllIntents } = require("./intent-loader");
const preprocessor = require("./preprocessor");

// Output paths
const OUTPUT_DIR = path.join(__dirname, "../data/models/model-tf");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const VOCAB_PATH = path.join(OUTPUT_DIR, "vocab.json");
const META_PATH = path.join(OUTPUT_DIR, "meta.json");
const MODEL_PATH = path.join(OUTPUT_DIR, "model.json");

const PLUGIN_DIRS = [
  path.join(__dirname, "../skills/plugins"),
  path.join(__dirname, "../plugins"),
];

// ─── Feature Hashing ─────────────────────────────────────────────────────────
// Instead of a 5898-dimensional sparse vector, hash every word into one of
// HASH_BUCKETS slots. Collisions are fine — it's a well-proven technique
// (the "hashing trick") used by Vowpal Wabbit, scikit-learn, etc.
const HASH_BUCKETS = 512;

/**
 * Simple string hash → bucket index (FNV-1a inspired, fast & uniform)
 * @param {string} word
 * @returns {number} bucket index 0..HASH_BUCKETS-1
 */
function hashWord(word) {
  let hash = 2166136261;
  for (let i = 0; i < word.length; i++) {
    hash ^= word.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash % HASH_BUCKETS;
}

// Colors for console
const C = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
};

console.log(`\n${C.cyan}${C.bright}🧠 AXI BRAIN.JS TRAINER v2.3${C.reset}\n`);

async function train() {
  const trainStart = Date.now();

  try {
    // ═══════════════════════════════════════════════════════════════
    // 1. LOAD DATA
    // ═══════════════════════════════════════════════════════════════
    console.log(`${C.yellow}1. Loading Intent Data...${C.reset}`);
    const intentData = loadAllIntents(PLUGIN_DIRS);

    if (!intentData || intentData.length === 0) {
      throw new Error("No intents found!");
    }

    const intentList = [...new Set(intentData.map((i) => i.intent))].sort();

    // ═══════════════════════════════════════════════════════════════
    // 2. BUILD VOCABULARY + HASHED FEATURES
    // ═══════════════════════════════════════════════════════════════
    console.log(`${C.yellow}2. Building Vocabulary...${C.reset}`);

    const vocabSet = new Set();
    const rawSamples = [];

    intentData.forEach((item) => {
      item.utterances.forEach((u) => {
        const { tokens } = preprocessor.preprocess(u, {
          removeStops: true,
          lemma: false,
          keepOriginal: false,
        });

        if (tokens.length > 0) {
          tokens.forEach((word) => vocabSet.add(word));
          rawSamples.push({
            input: tokens,
            output: item.intent,
          });
        }
      });
    });

    const vocabArray = Array.from(vocabSet).sort();

    // Build O(1) word→index map (for vocab.json compatibility at inference time)
    const vocabIndex = new Map();
    vocabArray.forEach((word, idx) => vocabIndex.set(word, idx));

    console.log(`   ${C.gray}Vocab Size:${C.reset}   ${vocabArray.length}`);
    console.log(`   ${C.gray}Intents:${C.reset}      ${intentList.length}`);
    console.log(`   ${C.gray}Raw Samples:${C.reset}  ${rawSamples.length}`);
    console.log(`   ${C.gray}Hash Buckets:${C.reset} ${HASH_BUCKETS} (compression: ${(vocabArray.length / HASH_BUCKETS).toFixed(1)}x)`);

    // ═══════════════════════════════════════════════════════════════
    // 3. FORMAT DATA (with hashing + deduplication)
    // ═══════════════════════════════════════════════════════════════
    console.log(`${C.yellow}3. Formatting & Deduplicating...${C.reset}`);

    const seen = new Set();
    const formattedData = [];

    for (const item of rawSamples) {
      const input = {};
      const bucketHits = [];

      for (const word of item.input) {
        const bucket = hashWord(word);
        input[`h${bucket}`] = 1;
        bucketHits.push(bucket);
      }

      // Dedup fingerprint
      bucketHits.sort((a, b) => a - b);
      const fingerprint = `${item.output}|${bucketHits.join(",")}`;
      if (seen.has(fingerprint)) continue;
      seen.add(fingerprint);

      const output = {};
      output[item.output] = 1;
      formattedData.push({ input, output });
    }

    const deduped = rawSamples.length - formattedData.length;
    console.log(`   ${C.gray}Unique Samples:${C.reset} ${formattedData.length} (removed ${deduped} duplicates)`);

    // Weight matrix size comparison
    const oldWeights = vocabArray.length * 256 + 256 * intentList.length;
    const newWeights = HASH_BUCKETS * 64 + 64 * intentList.length;
    console.log(`   ${C.gray}Weight Reduction:${C.reset} ${(oldWeights / 1000).toFixed(0)}K → ${(newWeights / 1000).toFixed(0)}K (${(oldWeights / newWeights).toFixed(1)}x faster)`);

    // ═══════════════════════════════════════════════════════════════
    // 4. AUTO-TUNE CONFIG
    // ═══════════════════════════════════════════════════════════════
    const HIDDEN_SIZE = 64;

    const autoErrorThresh = intentList.length > 500 ? 0.005
                          : intentList.length > 100 ? 0.002
                          : 0.001;

    const autoIterations = formattedData.length > 10000 ? 300
                         : formattedData.length > 5000  ? 500
                         : 1000;

    const LEARNING_RATE = 0.05;

    const CONFIG = {
      ITERATIONS: autoIterations,
      ERROR_THRESH: autoErrorThresh,
      HIDDEN_LAYERS: [HIDDEN_SIZE],
      ACTIVATION: "sigmoid",
      LEARNING_RATE,
      HASH_BUCKETS,
    };

    console.log(`\n${C.yellow}4. Training Neural Network...${C.reset}`);
    console.log(`   ${C.gray}Input Dim:${C.reset}     ${HASH_BUCKETS} (hashed)`);
    console.log(`   ${C.gray}Hidden Layer:${C.reset}  [${HIDDEN_SIZE}] neurons`);
    console.log(`   ${C.gray}Output Dim:${C.reset}    ${intentList.length} intents`);
    console.log(`   ${C.gray}Max Iterations:${C.reset} ${CONFIG.ITERATIONS}`);
    console.log(`   ${C.gray}Error Thresh:${C.reset}  ${CONFIG.ERROR_THRESH}`);
    console.log(`   ${C.gray}Learning Rate:${C.reset} ${CONFIG.LEARNING_RATE}`);
    console.log("");

    // ═══════════════════════════════════════════════════════════════
    // 5. TRAIN
    // ═══════════════════════════════════════════════════════════════
    const net = new brain.NeuralNetwork({
      hiddenLayers: CONFIG.HIDDEN_LAYERS,
      activation: CONFIG.ACTIVATION,
    });

    const stats = net.train(formattedData, {
      iterations: CONFIG.ITERATIONS,
      errorThresh: CONFIG.ERROR_THRESH,
      log: (str) => {
        const elapsed = ((Date.now() - trainStart) / 1000).toFixed(1);
        console.log(`   [${elapsed}s] ${str}`);
      },
      logPeriod: 25,
      learningRate: CONFIG.LEARNING_RATE,
    });

    const totalTime = ((Date.now() - trainStart) / 1000).toFixed(1);
    console.log(`\n${C.green}✅ Training Complete in ${totalTime}s!${C.reset}`);
    console.log(`   Iterations: ${stats.iterations}`);
    console.log(`   Final Error: ${stats.error.toFixed(6)}`);

    // ═══════════════════════════════════════════════════════════════
    // 6. SAVE ARTIFACTS
    // ═══════════════════════════════════════════════════════════════
    const modelJson = net.toJSON();
    fs.writeFileSync(MODEL_PATH, JSON.stringify(modelJson));

    const metaData = {
      trainedAt: new Date().toISOString(),
      version: "2.3.0",
      type: "brain.js",
      featureMode: "hashed",
      hashBuckets: HASH_BUCKETS,
      stats,
      config: CONFIG,
      dataStats: {
        vocabSize: vocabArray.length,
        intentCount: intentList.length,
        totalSamples: rawSamples.length,
        uniqueSamples: formattedData.length,
        deduplicatedSamples: deduped,
      },
      trainingTimeSeconds: parseFloat(totalTime),
    };

    fs.writeFileSync(
      VOCAB_PATH,
      JSON.stringify({
        vocab: vocabArray,
        intents: intentList,
        hashBuckets: HASH_BUCKETS,
      }, null, 2),
    );
    fs.writeFileSync(META_PATH, JSON.stringify(metaData, null, 2));

    console.log(`\n${C.cyan}📁 Model saved to:${C.reset} ${OUTPUT_DIR}`);
    console.log(`   - model.json (${(JSON.stringify(modelJson).length / 1024).toFixed(0)} KB)`);
    console.log(`   - vocab.json`);
    console.log(`   - meta.json`);
  } catch (error) {
    console.error(`\n${C.red}❌ Training Failed:${C.reset}`);
    console.error(error.message);
    process.exit(1);
  }
}

train();
