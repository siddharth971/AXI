/**
 * AXI NLP Model Trainer (Brain.js Edition)
 * --------------------------------------------
 * Lightweight, Pure JS Neural Network.
 * No binary dependencies. Fast training.
 */

const fs = require("fs");
const path = require("path");
const brain = require("brain.js");
const { loadAllIntents } = require("./intent-loader");
const preprocessor = require("./preprocessor");

// Output paths
const OUTPUT_DIR = path.join(__dirname, "model-tf"); // Keeping same dir name for compatibility
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const VOCAB_PATH = path.join(OUTPUT_DIR, "vocab.json");
const META_PATH = path.join(OUTPUT_DIR, "meta.json");
const MODEL_PATH = path.join(OUTPUT_DIR, "model.json");

// Configuration
const CONFIG = {
  ITERATIONS: 10000,       // Increased for deeper learning
  ERROR_THRESH: 0.002,    // Lower threshold for higher precision
  HIDDEN_LAYERS: [64, 64], // Significantly increased capacity (was [16, 16])
  ACTIVATION: 'sigmoid',
  LEARNING_RATE: 0.3,     // Explicitly defined
  PLUGIN_DIRS: [
    path.join(__dirname, "../skills/plugins"),
    path.join(__dirname, "../plugins")
  ]
};

// Colors for console
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  gray: "\x1b[90m"
};

console.log(`\n${colors.cyan}${colors.bright}🧠 AXI BRAIN.JS TRAINER${colors.reset}\n`);

async function train() {
  try {
    // 1. Load Data
    console.log(`${colors.yellow}1. Loading Intent Data...${colors.reset}`);
    const intentData = loadAllIntents(CONFIG.PLUGIN_DIRS);

    if (!intentData || intentData.length === 0) {
      throw new Error("No intents found!");
    }

    // Sort intents for consistency
    const intentList = [...new Set(intentData.map(i => i.intent))].sort();

    // 2. Build Vocabulary (Bag of Words)
    console.log(`${colors.yellow}2. Building Vocabulary...${colors.reset}`);

    const vocab = new Set();
    const trainingData = [];

    // Preprocess and build raw data
    intentData.forEach(item => {
      item.utterances.forEach(u => {
        const { tokens } = preprocessor.preprocess(u, {
          removeStops: true,
          lemma: false,
          keepOriginal: false
        });

        if (tokens.length > 0) {
          tokens.forEach(word => vocab.add(word));
          trainingData.push({
            input: tokens,
            output: item.intent
          });
        }
      });
    });

    const vocabArray = Array.from(vocab).sort();

    console.log(`   ${colors.gray}Vocab Size:${colors.reset} ${vocabArray.length}`);
    console.log(`   ${colors.gray}Intents:${colors.reset}    ${intentList.length}`);
    console.log(`   ${colors.gray}Samples:${colors.reset}    ${trainingData.length}`);

    // 3. Format Data for Brain.js
    // Brain.js handles object inputs { word1: 1, word2: 1 } very well
    const formattedData = trainingData.map(item => {
      const input = {};

      // Bag of Words encoding
      item.input.forEach(word => {
        // We stick to simple binary presence or basic frequency
        // Assuming the runtime nlp.js uses encoded 'w{index}' keys
        const index = vocabArray.indexOf(word);
        if (index !== -1) {
          input[`w${index}`] = 1;
        }
      });

      const output = {};
      output[item.output] = 1;

      return { input, output };
    });

    // 4. Train Model
    console.log(`\n${colors.yellow}3. Training Neural Network...${colors.reset}`);

    const net = new brain.NeuralNetwork({
      hiddenLayers: CONFIG.HIDDEN_LAYERS,
      activation: CONFIG.ACTIVATION
    });

    const stats = net.train(formattedData, {
      iterations: CONFIG.ITERATIONS,
      errorThresh: CONFIG.ERROR_THRESH,
      log: (str) => console.log(`   ${str}`),
      logPeriod: 100,
      learningRate: CONFIG.LEARNING_RATE
    });

    console.log(`\n${colors.green}✅ Training Complete!${colors.reset}`);
    console.log(`   Iterations: ${stats.iterations}`);
    console.log(`   Final Error: ${stats.error.toFixed(6)}`);

    // 5. Save Artifacts
    const modelJson = net.toJSON();

    fs.writeFileSync(MODEL_PATH, JSON.stringify(modelJson)); // Save as standard JSON

    // Save Meta & Vocab
    const metaData = {
      trainedAt: new Date().toISOString(),
      version: "2.1.0",
      type: "brain.js",
      stats: stats,
      config: CONFIG
    };

    fs.writeFileSync(VOCAB_PATH, JSON.stringify({ vocab: vocabArray, intents: intentList }, null, 2));
    fs.writeFileSync(META_PATH, JSON.stringify(metaData, null, 2));

    console.log(`\n${colors.cyan}📁 Model saved to:${colors.reset} ${OUTPUT_DIR}`);
    console.log(`   - model.json`);
    console.log(`   - vocab.json`);
    console.log(`   - meta.json`);

  } catch (error) {
    console.error(`\n${colors.red}❌ Training Failed:${colors.reset}`);
    console.error(error.message);
    process.exit(1);
  }
}

train();

