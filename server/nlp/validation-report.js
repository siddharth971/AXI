/**
 * NLP System Comprehensive Validation Report
 * ============================================
 * Tests all aspects of the NLP pipeline
 */

"use strict";

const fs = require("fs");
const path = require("path");
const nlp = require("./nlp");
const preprocessor = require("./preprocessor");
const { loadAllIntents } = require("./intent-loader");

// Console colors
const c = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m"
};

const report = {
  passed: [],
  warnings: [],
  errors: [],
  coverage: [],
  observations: []
};

function pass(msg) { report.passed.push(msg); console.log(`${c.green}✅ PASS:${c.reset} ${msg}`); }
function warn(msg) { report.warnings.push(msg); console.log(`${c.yellow}⚠️  WARN:${c.reset} ${msg}`); }
function fail(msg) { report.errors.push(msg); console.log(`${c.red}❌ FAIL:${c.reset} ${msg}`); }
function observe(msg) { report.observations.push(msg); }

console.log(`\n${c.cyan}${c.bright}═══════════════════════════════════════════════════════════${c.reset}`);
console.log(`${c.cyan}${c.bright}         NLP SYSTEM COMPREHENSIVE VALIDATION REPORT         ${c.reset}`);
console.log(`${c.cyan}${c.bright}═══════════════════════════════════════════════════════════${c.reset}\n`);

// ============================================
// 1. Model Artifacts Validation
// ============================================
console.log(`${c.bright}📁 1. MODEL ARTIFACTS${c.reset}`);
console.log("─".repeat(50));

const MODEL_DIR = path.join(__dirname, "model-tf");
const requiredFiles = ["model.json", "vocab.json", "meta.json"];

requiredFiles.forEach(file => {
  const filePath = path.join(MODEL_DIR, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    pass(`${file} exists (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    fail(`${file} is MISSING`);
  }
});

// Check model integrity
try {
  const vocabData = JSON.parse(fs.readFileSync(path.join(MODEL_DIR, "vocab.json"), "utf8"));
  const metaData = JSON.parse(fs.readFileSync(path.join(MODEL_DIR, "meta.json"), "utf8"));

  pass(`Vocab size: ${vocabData.vocab.length} words`);
  pass(`Intent count: ${vocabData.intents.length} intents`);
  pass(`Model type: ${metaData.type}`);
  pass(`Training error: ${metaData.stats.error.toFixed(6)}`);
  observe(`Model trained at: ${metaData.trainedAt}`);
} catch (e) {
  fail(`Failed to parse model files: ${e.message}`);
}

// ============================================
// 2. Preprocessing Validation
// ============================================
console.log(`\n${c.bright}🔧 2. PREPROCESSING VALIDATION${c.reset}`);
console.log("─".repeat(50));

const preprocessTests = [
  { input: "HELLO WORLD", expected: "hello world", check: "lowercase" },
  { input: "  extra  spaces  ", expected: "extra spaces", check: "trim/normalize" },
  { input: "Hello, World!", expected: "hello world", check: "punctuation removal" },
  { input: "open the youtube", expected: "open youtube", check: "stopword removal" }
];

let preprocessPassed = 0;
preprocessTests.forEach(test => {
  const result = preprocessor.preprocess(test.input, { removeStops: true, lemma: false });
  if (result.cleaned === test.expected) {
    pass(`${test.check}: "${test.input}" → "${result.cleaned}"`);
    preprocessPassed++;
  } else {
    warn(`${test.check}: Expected "${test.expected}", got "${result.cleaned}"`);
  }
});

// Consistency check: same input should produce same output
const consistencyInput = "what time is it now";
const results = [1, 2, 3].map(() => preprocessor.preprocess(consistencyInput));
if (results[0].cleaned === results[1].cleaned && results[1].cleaned === results[2].cleaned) {
  pass("Preprocessing is deterministic");
} else {
  fail("Preprocessing is NOT deterministic");
}

// ============================================
// 3. Intent Loading Validation
// ============================================
console.log(`\n${c.bright}📦 3. INTENT LOADING VALIDATION${c.reset}`);
console.log("─".repeat(50));

const pluginDirs = [path.join(__dirname, "../skills/plugins")];
const intents = loadAllIntents(pluginDirs);

if (intents.length > 0) {
  pass(`Loaded ${intents.length} intent definitions`);
} else {
  fail("No intents loaded!");
}

// Check for duplicates
const intentNames = intents.map(i => i.intent);
const uniqueIntents = [...new Set(intentNames)];
if (intentNames.length === uniqueIntents.length) {
  pass("No duplicate intent names after merge");
} else {
  warn(`Found ${intentNames.length - uniqueIntents.length} merged duplicate intents`);
}

// Check for empty utterances
const emptyIntents = intents.filter(i => !i.utterances || i.utterances.length === 0);
if (emptyIntents.length === 0) {
  pass("All intents have utterances");
} else {
  warn(`${emptyIntents.length} intents have no utterances: ${emptyIntents.map(i => i.intent).join(", ")}`);
}

// Check deterministic sorting
const sorted = [...uniqueIntents].sort();
pass(`Intent labels are sortable (first: ${sorted[0]}, last: ${sorted[sorted.length - 1]})`);

// ============================================
// 4. NLP Classification Test
// ============================================
console.log(`\n${c.bright}🧠 4. NLP CLASSIFICATION TEST${c.reset}`);
console.log("─".repeat(50));

const classificationTests = [
  // System
  { text: "hello", expectedIntent: "greeting", category: "System" },
  { text: "what time is it", expectedIntent: "tell_time", category: "System" },
  { text: "what is today's date", expectedIntent: "tell_date", category: "System" },
  { text: "tell me a joke", expectedIntent: "tell_joke", category: "System" },
  { text: "take a screenshot", expectedIntent: "take_screenshot", category: "System" },
  { text: "goodbye", expectedIntent: "goodbye", category: "System" },
  { text: "thanks", expectedIntent: "thanks", category: "System" },

  // Browser
  { text: "open youtube", expectedIntent: "open_youtube", category: "Browser" },
  { text: "open google", expectedIntent: "open_website", category: "Browser" },
  { text: "search youtube for music", expectedIntent: "search_youtube", category: "Browser" },

  // Media
  { text: "play music", expectedIntent: "play", category: "Media" },
  { text: "pause", expectedIntent: "pause", category: "Media" },
  { text: "volume up", expectedIntent: "volume_up", category: "Media" },
  { text: "increase volume", expectedIntent: "volume_up", category: "Media" },
  { text: "mute", expectedIntent: "mute", category: "Media" },
  { text: "next song", expectedIntent: "next", category: "Media" },

  // Knowledge
  { text: "calculate 10 plus 5", expectedIntent: "calculate", category: "Knowledge" },
  { text: "convert 100 km to miles", expectedIntent: "unit_convert", category: "Knowledge" },
  { text: "what day is today", expectedIntent: "what_day", category: "Knowledge" },

  // Developer
  { text: "git status", expectedIntent: "git_status", category: "Developer" },
  { text: "npm install", expectedIntent: "npm_install", category: "Developer" },
  { text: "open vscode", expectedIntent: "open_vscode", category: "Developer" },

  // File
  { text: "create folder test", expectedIntent: "create_folder", category: "File" },
  { text: "list files", expectedIntent: "list_files", category: "File" },
  { text: "delete file test.txt", expectedIntent: "delete_file", category: "File" }
];

let classificationResults = {
  correct: 0,
  incorrect: 0,
  lowConfidence: 0,
  byCategory: {}
};

console.log(`\n${c.gray}Testing ${classificationTests.length} utterances...${c.reset}\n`);

classificationTests.forEach(test => {
  const result = nlp.interpret(test.text);
  const isCorrect = result.intent === test.expectedIntent;
  const isLowConf = result.confidence < 0.5;

  if (!classificationResults.byCategory[test.category]) {
    classificationResults.byCategory[test.category] = { correct: 0, total: 0 };
  }
  classificationResults.byCategory[test.category].total++;

  if (isCorrect) {
    classificationResults.correct++;
    classificationResults.byCategory[test.category].correct++;
    if (isLowConf) {
      classificationResults.lowConfidence++;
      warn(`Low confidence on "${test.text}": ${result.confidence.toFixed(2)}`);
    }
  } else {
    classificationResults.incorrect++;
  }

  report.coverage.push({
    text: test.text,
    expected: test.expectedIntent,
    actual: result.intent,
    confidence: result.confidence,
    category: test.category,
    correct: isCorrect
  });
});

const accuracy = (classificationResults.correct / classificationTests.length * 100).toFixed(1);
if (accuracy >= 80) {
  pass(`Overall accuracy: ${accuracy}% (${classificationResults.correct}/${classificationTests.length})`);
} else if (accuracy >= 60) {
  warn(`Moderate accuracy: ${accuracy}% (${classificationResults.correct}/${classificationTests.length})`);
} else {
  fail(`Low accuracy: ${accuracy}% (${classificationResults.correct}/${classificationTests.length})`);
}

if (classificationResults.lowConfidence > 0) {
  warn(`${classificationResults.lowConfidence} tests had low confidence (<0.5)`);
}

// ============================================
// 5. Category Breakdown
// ============================================
console.log(`\n${c.bright}📊 5. CATEGORY BREAKDOWN${c.reset}`);
console.log("─".repeat(50));

Object.entries(classificationResults.byCategory).forEach(([cat, stats]) => {
  const catAccuracy = (stats.correct / stats.total * 100).toFixed(0);
  const status = catAccuracy >= 80 ? "✅" : catAccuracy >= 50 ? "⚠️" : "❌";
  console.log(`${status} ${cat.padEnd(12)}: ${catAccuracy}% (${stats.correct}/${stats.total})`);
});

// ============================================
// 6. Confusion Analysis
// ============================================
console.log(`\n${c.bright}🔍 6. CONFUSION ANALYSIS${c.reset}`);
console.log("─".repeat(50));

const misclassified = report.coverage.filter(r => !r.correct);
if (misclassified.length === 0) {
  pass("No misclassified utterances!");
} else {
  console.log(`${c.yellow}Misclassified (${misclassified.length}):${c.reset}`);
  misclassified.forEach(m => {
    console.log(`  • "${m.text}"`);
    console.log(`    Expected: ${m.expected}, Got: ${m.actual} (conf: ${m.confidence.toFixed(2)})`);
  });
}

// ============================================
// 7. Error Handling Test
// ============================================
console.log(`\n${c.bright}🛡️ 7. ERROR HANDLING${c.reset}`);
console.log("─".repeat(50));

// Test empty input
try {
  const emptyResult = nlp.interpret("");
  pass("Handles empty input gracefully");
} catch (e) {
  fail(`Crashes on empty input: ${e.message}`);
}

// Test very long input
try {
  const longInput = "a ".repeat(1000);
  const longResult = nlp.interpret(longInput);
  pass("Handles very long input");
} catch (e) {
  fail(`Crashes on long input: ${e.message}`);
}

// Test special characters
try {
  const specialResult = nlp.interpret("!@#$%^&*()");
  pass("Handles special characters");
} catch (e) {
  fail(`Crashes on special characters: ${e.message}`);
}

// ============================================
// 8. Performance Check
// ============================================
console.log(`\n${c.bright}⚡ 8. PERFORMANCE${c.reset}`);
console.log("─".repeat(50));

const perfStart = Date.now();
for (let i = 0; i < 100; i++) {
  nlp.interpret("hello how are you doing today");
}
const perfTime = Date.now() - perfStart;
const avgTime = perfTime / 100;

if (avgTime < 10) {
  pass(`Inference time: ${avgTime.toFixed(2)}ms/query (excellent)`);
} else if (avgTime < 50) {
  pass(`Inference time: ${avgTime.toFixed(2)}ms/query (good)`);
} else {
  warn(`Inference time: ${avgTime.toFixed(2)}ms/query (slow)`);
}

// Model size
const modelSize = fs.statSync(path.join(MODEL_DIR, "model.json")).size / 1024;
if (modelSize < 500) {
  pass(`Model size: ${modelSize.toFixed(1)} KB (lightweight)`);
} else if (modelSize < 2000) {
  pass(`Model size: ${modelSize.toFixed(1)} KB (acceptable)`);
} else {
  warn(`Model size: ${modelSize.toFixed(1)} KB (consider optimization)`);
}

// ============================================
// FINAL SUMMARY
// ============================================
console.log(`\n${c.cyan}${c.bright}═══════════════════════════════════════════════════════════${c.reset}`);
console.log(`${c.cyan}${c.bright}                       FINAL SUMMARY                       ${c.reset}`);
console.log(`${c.cyan}${c.bright}═══════════════════════════════════════════════════════════${c.reset}\n`);

console.log(`${c.green}✅ Passed:${c.reset}   ${report.passed.length}`);
console.log(`${c.yellow}⚠️  Warnings:${c.reset} ${report.warnings.length}`);
console.log(`${c.red}❌ Errors:${c.reset}   ${report.errors.length}`);
console.log(`📊 Accuracy: ${accuracy}%`);

if (report.errors.length === 0 && report.warnings.length < 5) {
  console.log(`\n${c.green}${c.bright}🎉 SYSTEM STATUS: READY FOR PRODUCTION${c.reset}`);
} else if (report.errors.length === 0) {
  console.log(`\n${c.yellow}${c.bright}⚠️  SYSTEM STATUS: FUNCTIONAL WITH WARNINGS${c.reset}`);
} else {
  console.log(`\n${c.red}${c.bright}❌ SYSTEM STATUS: NEEDS FIXES${c.reset}`);
}

// Print command coverage table
console.log(`\n${c.bright}📋 COMMAND COVERAGE TABLE${c.reset}`);
console.log("─".repeat(70));
console.log("| Command".padEnd(30) + "| Expected".padEnd(18) + "| Actual".padEnd(15) + "| Conf  |");
console.log("─".repeat(70));
report.coverage.forEach(r => {
  const status = r.correct ? "✅" : "❌";
  console.log(`${status} ${r.text.substring(0, 26).padEnd(27)}| ${r.expected.padEnd(16)}| ${r.actual.padEnd(13)}| ${r.confidence.toFixed(2)} |`);
});
console.log("─".repeat(70));

// Recommendations
if (misclassified.length > 0) {
  console.log(`\n${c.bright}🛠️  FIX SUGGESTIONS${c.reset}`);
  console.log("─".repeat(50));
  misclassified.forEach(m => {
    console.log(`• Add more training samples for intent "${m.expected}"`);
    console.log(`  Example: "${m.text}" variations`);
  });
}

console.log(`\n${c.bright}🚀 IMPROVEMENT RECOMMENDATIONS${c.reset}`);
console.log("─".repeat(50));
console.log("• Add Hindi/Hinglish variations for all intents");
console.log("• Increase utterance count for low-accuracy categories");
console.log("• Consider adding contextual disambiguation");
console.log("• Implement confidence calibration");
console.log("");
