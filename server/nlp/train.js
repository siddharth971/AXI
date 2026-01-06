/**
 * AXI NLP Model Trainer (Enhanced)
 * ----------------------------------
 * Trains the Brain.js neural network using intent data.
 * Shows detailed training progress, accuracy, and error analysis.
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
  vocab: path.join(__dirname, "vocab.json"),
  meta: path.join(__dirname, "model-meta.json")
};

// Colors for console
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m"
};

const log = {
  title: (msg) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  stat: (label, value) => console.log(`   ${colors.white}${label}: ${colors.cyan}${value}${colors.reset}`),
  progress: (current, total, label) => {
    const percent = Math.round((current / total) * 100);
    const bar = "█".repeat(Math.floor(percent / 5)) + "░".repeat(20 - Math.floor(percent / 5));
    process.stdout.write(`\r   ${colors.cyan}[${bar}] ${percent}% ${colors.white}${label}${colors.reset}`);
  }
};

console.log(`
${colors.cyan}${colors.bright}
╔══════════════════════════════════════════════════════════╗
║                   🧠 AXI NLP TRAINER                     ║
║            Enhanced Training with Analytics              ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);

// ===========================
// 1. Load Previous Model Stats
// ===========================

log.title("📊 LOADING PREVIOUS MODEL STATS");

let previousMeta = null;
try {
  if (fs.existsSync(OUTPUT.meta)) {
    previousMeta = JSON.parse(fs.readFileSync(OUTPUT.meta, "utf8"));
    log.info(`Previous model found (trained on ${previousMeta.trainedAt})`);
    log.stat("Previous Intents", previousMeta.intentCount);
    log.stat("Previous Vocabulary", previousMeta.vocabSize + " words");
    log.stat("Previous Samples", previousMeta.sampleCount);
    log.stat("Previous Accuracy", (previousMeta.accuracy * 100).toFixed(2) + "%");
    log.stat("Previous Error", previousMeta.error.toFixed(6));
  } else {
    log.warning("No previous model found. This is a fresh training.");
  }
} catch (e) {
  log.warning("Could not load previous model stats.");
}

// ===========================
// 2. Load Intent Data
// ===========================

log.title("📂 LOADING TRAINING DATA");

const intents = loadAllIntents();

if (intents.length === 0) {
  log.error("No intents found. Check nlp/intents/ folder.");
  process.exit(1);
}

// Count utterances per intent
const intentStats = {};
intents.forEach(item => {
  if (!intentStats[item.intent]) {
    intentStats[item.intent] = 0;
  }
  intentStats[item.intent] += item.utterances.length;
});

console.log("");
console.log(`   ${colors.bright}Intent Distribution:${colors.reset}`);
Object.keys(intentStats).sort((a, b) => intentStats[b] - intentStats[a]).forEach(intent => {
  const count = intentStats[intent];
  const bar = "█".repeat(Math.min(count, 30));
  console.log(`   ${colors.cyan}${intent.padEnd(25)}${colors.yellow}${bar} ${colors.white}${count}${colors.reset}`);
});

// ===========================
// 3. Build Vocabulary
// ===========================

log.title("📚 BUILDING VOCABULARY");

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

const vocabSet = new Set();
let totalTokens = 0;

intents.forEach(item => {
  item.utterances.forEach(u => {
    const tokens = tokenize(u);
    totalTokens += tokens.length;
    tokens.forEach(token => vocabSet.add(token));
  });
});

const vocab = Array.from(vocabSet);

log.stat("Unique Words", vocab.length);
log.stat("Total Tokens", totalTokens);
log.stat("Avg Tokens/Utterance", (totalTokens / intents.reduce((sum, i) => sum + i.utterances.length, 0)).toFixed(2));

if (previousMeta) {
  const vocabDiff = vocab.length - previousMeta.vocabSize;
  if (vocabDiff > 0) {
    log.success(`Vocabulary increased by ${vocabDiff} words (+${((vocabDiff / previousMeta.vocabSize) * 100).toFixed(1)}%)`);
  } else if (vocabDiff < 0) {
    log.warning(`Vocabulary decreased by ${Math.abs(vocabDiff)} words`);
  }
}

// ===========================
// 4. Build Training Set
// ===========================

log.title("🏗️  BUILDING TRAINING SET");

function textToFeatures(text) {
  const tokens = tokenize(text);
  const features = {};
  vocab.forEach((word, i) => {
    features[`w${i}`] = tokens.includes(word) ? 1 : 0;
  });
  return features;
}

const intentList = [...new Set(intents.map(i => i.intent))];
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
      output,
      originalText: u,
      expectedIntent: item.intent
    });
  });
});

log.stat("Intent Classes", intentList.length);
log.stat("Training Samples", trainingSet.length);

if (previousMeta) {
  const sampleDiff = trainingSet.length - previousMeta.sampleCount;
  if (sampleDiff > 0) {
    log.success(`Training data increased by ${sampleDiff} samples (+${((sampleDiff / previousMeta.sampleCount) * 100).toFixed(1)}%)`);
  }
}

// ===========================
// 5. Train Network
// ===========================

log.title("🏋️  TRAINING NEURAL NETWORK");

const net = new brain.NeuralNetwork({
  hiddenLayers: [32, 16],  // Simpler architecture
  activation: "sigmoid",   // Stable activation
});

console.log("");
log.stat("Architecture", "Input → 32 → 16 → Output");
log.stat("Activation", "Sigmoid");
console.log("");

let lastError = 1;
let currentIteration = 0;

console.log("   Training in progress...\n");

const stats = net.train(trainingSet.map(t => ({ input: t.input, output: t.output })), {
  iterations: 5000,
  errorThresh: 0.005,
  log: (status) => {
    // Parse iteration and error from log string: "iterations: X, training error: Y"
    const match = status.match(/iterations: (\d+), training error: ([\d.]+)/);
    if (match) {
      currentIteration = parseInt(match[1]);
      lastError = parseFloat(match[2]);
      const errorPercent = (lastError * 100).toFixed(3);
      const progress = Math.min(100, Math.round((1 - lastError) * 100));
      const bar = "█".repeat(Math.floor(progress / 5)) + "░".repeat(20 - Math.floor(progress / 5));
      console.log(`   ${colors.cyan}[${bar}]${colors.reset} Iter: ${currentIteration.toString().padStart(4)} | Error: ${errorPercent}%`);
    }
  },
  logPeriod: 500
});

console.log("");  // New line after progress bar
console.log("");

log.success(`Training completed in ${stats.iterations} iterations`);
log.stat("Final Error", stats.error.toFixed(6));

// ===========================
// 6. Test Accuracy
// ===========================

log.title("🎯 TESTING ACCURACY");

let correct = 0;
let incorrect = 0;
const mistakes = [];
const confusionMatrix = {};

trainingSet.forEach((sample, idx) => {
  const output = net.run(sample.input);

  let bestIntent = "none";
  let bestScore = 0;
  let secondBest = { intent: "none", score: 0 };

  Object.keys(output).forEach(intent => {
    if (output[intent] > bestScore) {
      secondBest = { intent: bestIntent, score: bestScore };
      bestScore = output[intent];
      bestIntent = intent;
    } else if (output[intent] > secondBest.score) {
      secondBest = { intent, score: output[intent] };
    }
  });

  const expected = sample.expectedIntent;

  // Track confusion matrix
  if (!confusionMatrix[expected]) confusionMatrix[expected] = {};
  if (!confusionMatrix[expected][bestIntent]) confusionMatrix[expected][bestIntent] = 0;
  confusionMatrix[expected][bestIntent]++;

  if (bestIntent === expected) {
    correct++;
  } else {
    incorrect++;
    if (mistakes.length < 20) {  // Limit to 20 mistakes
      mistakes.push({
        text: sample.originalText,
        expected,
        predicted: bestIntent,
        confidence: (bestScore * 100).toFixed(1),
        secondBest: secondBest.intent,
        secondConfidence: (secondBest.score * 100).toFixed(1)
      });
    }
  }
});

const accuracy = correct / trainingSet.length;

log.stat("Correct Predictions", `${correct}/${trainingSet.length}`);
log.stat("Accuracy", `${(accuracy * 100).toFixed(2)}%`);

if (previousMeta) {
  const accDiff = accuracy - previousMeta.accuracy;
  if (accDiff > 0) {
    log.success(`Accuracy improved by ${(accDiff * 100).toFixed(2)}% from previous model! 🎉`);
  } else if (accDiff < 0) {
    log.warning(`Accuracy decreased by ${(Math.abs(accDiff) * 100).toFixed(2)}% from previous model`);
  } else {
    log.info("Accuracy unchanged from previous model");
  }
}

// ===========================
// 7. Show Mistakes
// ===========================

if (mistakes.length > 0) {
  log.title("❌ TRAINING MISTAKES (What the model got wrong)");

  console.log("");
  mistakes.forEach((m, i) => {
    console.log(`   ${colors.red}${(i + 1).toString().padStart(2)}. "${m.text}"${colors.reset}`);
    console.log(`      ${colors.yellow}Expected: ${m.expected}${colors.reset}`);
    console.log(`      ${colors.red}Predicted: ${m.predicted} (${m.confidence}%)${colors.reset}`);
    console.log(`      ${colors.blue}2nd choice: ${m.secondBest} (${m.secondConfidence}%)${colors.reset}`);
    console.log("");
  });

  // Common confusions
  log.title("🔄 COMMON CONFUSIONS");
  const confusions = [];
  Object.keys(confusionMatrix).forEach(expected => {
    Object.keys(confusionMatrix[expected]).forEach(predicted => {
      if (expected !== predicted && confusionMatrix[expected][predicted] > 0) {
        confusions.push({
          expected,
          predicted,
          count: confusionMatrix[expected][predicted]
        });
      }
    });
  });

  confusions.sort((a, b) => b.count - a.count).slice(0, 10).forEach(c => {
    console.log(`   ${colors.yellow}${c.expected} → ${c.predicted}: ${c.count} times${colors.reset}`);
  });
} else {
  log.success("Perfect! No mistakes on training data! 🎉");
}

// ===========================
// 8. Save Model & Stats
// ===========================

log.title("💾 SAVING MODEL");

const modelJSON = net.toJSON();

// Save model and vocab
fs.writeFileSync(OUTPUT.model, JSON.stringify(modelJSON, null, 2));
fs.writeFileSync(OUTPUT.vocab, JSON.stringify({ vocab, intents: intentList }, null, 2));

// Save meta for comparison
const newMeta = {
  trainedAt: new Date().toISOString(),
  intentCount: intentList.length,
  vocabSize: vocab.length,
  sampleCount: trainingSet.length,
  iterations: stats.iterations,
  error: stats.error,
  accuracy: accuracy,
  architecture: [vocab.length, 64, 32, 16, intentList.length],
  intents: intentList
};

fs.writeFileSync(OUTPUT.meta, JSON.stringify(newMeta, null, 2));

log.success(`Model saved: ${OUTPUT.model}`);
log.success(`Vocab saved: ${OUTPUT.vocab}`);
log.success(`Meta saved: ${OUTPUT.meta}`);

// ===========================
// 9. Final Summary
// ===========================

console.log(`
${colors.cyan}${colors.bright}
╔══════════════════════════════════════════════════════════╗
║                   📊 TRAINING SUMMARY                    ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);

console.log(`   ${colors.bright}Model Stats:${colors.reset}`);
log.stat("Total Intents", intentList.length);
log.stat("Vocabulary", vocab.length + " words");
log.stat("Training Samples", trainingSet.length);
log.stat("Final Error", stats.error.toFixed(6));
log.stat("Accuracy", (accuracy * 100).toFixed(2) + "%");
log.stat("Training Time", stats.iterations + " iterations");

if (previousMeta) {
  console.log("");
  console.log(`   ${colors.bright}Comparison with Previous:${colors.reset}`);
  const changes = [
    { label: "Intents", prev: previousMeta.intentCount, curr: intentList.length },
    { label: "Vocabulary", prev: previousMeta.vocabSize, curr: vocab.length },
    { label: "Samples", prev: previousMeta.sampleCount, curr: trainingSet.length },
    { label: "Accuracy", prev: (previousMeta.accuracy * 100).toFixed(2) + "%", curr: (accuracy * 100).toFixed(2) + "%" }
  ];

  changes.forEach(c => {
    const diff = typeof c.prev === 'number' ? c.curr - c.prev : null;
    const arrow = diff > 0 ? `${colors.green}↑` : diff < 0 ? `${colors.red}↓` : `${colors.yellow}→`;
    console.log(`   ${c.label.padEnd(12)} ${colors.yellow}${c.prev}${colors.reset} ${arrow}${colors.reset} ${colors.green}${c.curr}${colors.reset}`);
  });
}

console.log("");
log.success("Training complete! Restart server to use new model.");
console.log("");
