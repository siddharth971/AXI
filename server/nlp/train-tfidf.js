/**
 * AXI TF-IDF Trainer
 * -------------------
 * Independent training script that processes intent JSONs and corrections.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { TFIDFClassifier } = require("./tfidf-classifier");

const INTENTS_DIR = path.join(__dirname, "intents");
const MODEL_PATH = path.join(__dirname, "..", "data", "tfidf-model.json");
const CORRECTIONS_PATH = path.join(__dirname, "..", "data", "corrections.jsonl");

function loadIntentDatasets() {
  const datasets = [];
  const warnings = [];

  if (!fs.existsSync(INTENTS_DIR)) {
    throw new Error(`Intents directory not found: ${INTENTS_DIR}`);
  }

  const files = fs.readdirSync(INTENTS_DIR).filter(f => f.endsWith(".json"));
  
  for (const file of files) {
    try {
      const filePath = path.join(INTENTS_DIR, file);
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      
      const items = Array.isArray(content) ? content : [content];
      
      for (const item of items) {
        if (!item.intent || !item.utterances) {
          warnings.push(`Skipping invalid entry in ${file}`);
          continue;
        }
        
        if (item.utterances.length < 5) {
          warnings.push(`Intent '${item.intent}' has very few examples (${item.utterances.length})`);
        }
        
        datasets.push(item);
      }
    } catch (err) {
      warnings.push(`Error parsing ${file}: ${err.message}`);
    }
  }

  return { datasets, warnings };
}

function applyCorrections(datasets) {
  if (!fs.existsSync(CORRECTIONS_PATH)) return { datasets, applied: 0 };

  const lines = fs.readFileSync(CORRECTIONS_PATH, "utf-8").split("\n").filter(Boolean);
  let applied = 0;

  for (const line of lines) {
    try {
      const correction = JSON.parse(line);
      const { input, correctIntent } = correction;
      
      const ds = datasets.find(d => d.intent === correctIntent);
      if (ds && !ds.utterances.includes(input)) {
        ds.utterances.push(input);
        applied++;
      }
    } catch (e) {}
  }

  return { datasets, applied };
}

function reportConflicts(classifier) {
  const conflicts = classifier.findConflicts(0.4);
  if (conflicts.length === 0) {
    console.log("[TF-IDF] No high-overlap intent pairs detected (Threshold: 0.4)");
    return;
  }

  console.log(`[TF-IDF] Found ${conflicts.length} potential intent conflicts:`);
  conflicts.slice(0, 10).forEach((c, i) => {
    console.log(`${i + 1}. ${(c.similarity * 100).toFixed(1)}% overlap — ${c.intentA} ↔ ${c.intentB}`);
  });
  
  if (conflicts.length > 10) {
    console.log(`... and ${conflicts.length - 10} more.`);
  }
}

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("       🧠 AXI TF-IDF TRAINING INITIATED        ");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // 1. Load
    const { datasets, warnings } = loadIntentDatasets();
    warnings.forEach(w => console.warn(`⚠ ${w}`));
    console.log(`[TF-IDF] Loaded ${datasets.length} base intents from disk`);

    // 2. Patch
    const { datasets: patchedDatasets, applied } = applyCorrections(datasets);
    if (applied > 0) console.log(`[TF-IDF] Applied ${applied} corrections from user history`);

    // 3. Train
    const classifier = new TFIDFClassifier();
    const meta = classifier.train(patchedDatasets);

    // 4. Conflict detection
    reportConflicts(classifier);

    // 5. Self-test
    console.log("\n🧪 Running self-test suite:");
    const tests = [
      { q: "open youtube", expected: "open", name: "Basic Web" },
      { q: "play some music", expected: "play", name: "Media" },
      { q: "don't open chrome", expected: "!open_browser", name: "Negation" },
      { q: "hello", expected: "greet", name: "Greeting" }
    ];

    for (const t of tests) {
      const result = classifier.classifyOne(t.q);
      let passed = false;
      
      if (t.expected.startsWith("!")) {
        passed = !result.intent.includes(t.expected.substring(1));
      } else {
        passed = result.intent.includes(t.expected);
      }

      console.log(`${passed ? "✅" : "⚠"} [${t.name}] "${t.q}" → ${result.intent} (${(result.confidence * 100).toFixed(1)}%)`);
    }

    // 6. Save
    await classifier.save(MODEL_PATH);
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("       🏆 TF-IDF TRAINING SUCCESSFUL           ");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  } catch (err) {
    console.error(`\n❌ Training failed: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
