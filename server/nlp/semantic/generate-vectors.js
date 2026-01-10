/**
 * AXI Intent Vector Generator (TF-IDF Based)
 * --------------------------------------------
 * Offline script to generate intent-vectors.json from intent files.
 * Uses TF-IDF (Term Frequency-Inverse Document Frequency) for vectorization.
 * 
 * Usage: npm run generate:vectors
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { loadAllIntents } = require("../intent-loader");

// Output path
const OUTPUT_PATH = path.join(__dirname, "intent-vectors.json");

// Configuration
const CONFIG = {
  MAX_EXAMPLES_PER_INTENT: 50,  // Limit examples per intent
  MIN_WORD_FREQUENCY: 2,        // Minimum word frequency to include in vocabulary
  PLUGIN_DIRS: [
    path.join(__dirname, "../../skills/plugins"),
    path.join(__dirname, "../../plugins")
  ]
};

// Console colors
const c = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m"
};

/**
 * Tokenize and normalize text
 */
function tokenize(text) {
  if (!text || typeof text !== "string") return [];
  
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(token => token.length > 1);
}

/**
 * Compute IDF weights for vocabulary
 */
function computeIDF(documents) {
  const docFreq = {};
  const numDocs = documents.length;
  
  // Count document frequency for each term
  for (const doc of documents) {
    const uniqueTokens = new Set(doc);
    for (const token of uniqueTokens) {
      docFreq[token] = (docFreq[token] || 0) + 1;
    }
  }
  
  // Compute IDF: log(N / df)
  const idf = {};
  for (const token in docFreq) {
    idf[token] = Math.log(numDocs / docFreq[token]) + 1; // +1 smoothing
  }
  
  return idf;
}

/**
 * Compute TF for a document
 */
function computeTF(tokens) {
  const tf = {};
  const total = tokens.length;
  
  if (total === 0) return tf;
  
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  
  for (const token in tf) {
    tf[token] = tf[token] / total;
  }
  
  return tf;
}

/**
 * Convert TF-IDF to dense vector
 */
function toDenseVector(tfidf, vocabArray) {
  return vocabArray.map(token => tfidf[token] || 0);
}

/**
 * Normalize vector to unit length
 */
function normalizeVector(vec) {
  const magnitude = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  if (magnitude === 0) return vec;
  return vec.map(v => v / magnitude);
}

async function generateVectors() {
  console.log(`\n${c.cyan}${c.bright}🧠 AXI INTENT VECTOR GENERATOR (TF-IDF)${c.reset}\n`);

  // Step 1: Load intents
  console.log(`${c.yellow}1. Loading Intent Data...${c.reset}`);
  const intentData = loadAllIntents(CONFIG.PLUGIN_DIRS);

  if (!intentData || intentData.length === 0) {
    console.error("No intents found!");
    process.exit(1);
  }

  // Group utterances by intent
  const intentGroups = {};
  const allDocuments = [];
  
  for (const item of intentData) {
    if (!intentGroups[item.intent]) {
      intentGroups[item.intent] = [];
    }
    const remaining = CONFIG.MAX_EXAMPLES_PER_INTENT - intentGroups[item.intent].length;
    if (remaining > 0) {
      const toAdd = item.utterances.slice(0, remaining);
      intentGroups[item.intent].push(...toAdd);
      
      // Tokenize for vocabulary building
      for (const utt of toAdd) {
        allDocuments.push(tokenize(utt));
      }
    }
  }

  const intentCount = Object.keys(intentGroups).length;
  const totalUtterances = Object.values(intentGroups).reduce((sum, arr) => sum + arr.length, 0);

  console.log(`   ${c.gray}Intents:${c.reset} ${intentCount}`);
  console.log(`   ${c.gray}Total Utterances:${c.reset} ${totalUtterances}`);

  // Step 2: Build vocabulary and compute IDF
  console.log(`\n${c.yellow}2. Building Vocabulary & Computing IDF...${c.reset}`);
  
  // Count word frequencies
  const wordFreq = {};
  for (const doc of allDocuments) {
    for (const token of doc) {
      wordFreq[token] = (wordFreq[token] || 0) + 1;
    }
  }
  
  // Filter vocabulary by minimum frequency
  const vocabulary = Object.keys(wordFreq)
    .filter(token => wordFreq[token] >= CONFIG.MIN_WORD_FREQUENCY)
    .sort();
  
  console.log(`   ${c.gray}Vocabulary Size:${c.reset} ${vocabulary.length} words`);
  
  // Compute IDF weights
  const idfWeights = computeIDF(allDocuments);
  
  console.log(`   ${c.gray}IDF computed:${c.reset} ${Object.keys(idfWeights).length} terms`);

  // Step 3: Generate intent vectors
  console.log(`\n${c.yellow}3. Generating Intent Vectors...${c.reset}`);

  const result = {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    model: "tfidf",
    vocabulary: vocabulary,
    idfWeights: idfWeights,
    intents: {}
  };

  let processed = 0;

  for (const [intentName, utterances] of Object.entries(intentGroups)) {
    process.stdout.write(`   Processing ${intentName}... `);

    const vectors = [];
    const examples = [];

    for (const utt of utterances) {
      const tokens = tokenize(utt);
      const tf = computeTF(tokens);
      
      // Compute TF-IDF
      const tfidf = {};
      for (const token of tokens) {
        if (vocabulary.includes(token)) {
          tfidf[token] = (tf[token] || 0) * (idfWeights[token] || 1);
        }
      }
      
      // Convert to dense vector and normalize
      const denseVec = toDenseVector(tfidf, vocabulary);
      const normalizedVec = normalizeVector(denseVec);
      
      vectors.push(normalizedVec);
      examples.push(utt);
    }

    // Compute centroid (average of all vectors for this intent)
    const centroid = new Array(vocabulary.length).fill(0);
    for (const vec of vectors) {
      for (let i = 0; i < vec.length; i++) {
        centroid[i] += vec[i];
      }
    }
    for (let i = 0; i < centroid.length; i++) {
      centroid[i] /= vectors.length;
    }

    result.intents[intentName] = {
      examples,
      embeddings: vectors,
      centroid: normalizeVector(centroid),
      count: vectors.length
    };

    processed += vectors.length;
    console.log(`${c.green}✓${c.reset} (${vectors.length} vectors)`);
  }

  // Step 4: Save to file
  console.log(`\n${c.yellow}4. Saving Vectors...${c.reset}`);

  const jsonString = JSON.stringify(result);
  const sizeKB = (Buffer.byteLength(jsonString, "utf8") / 1024).toFixed(1);

  fs.writeFileSync(OUTPUT_PATH, jsonString);

  console.log(`   ${c.gray}File:${c.reset} ${OUTPUT_PATH}`);
  console.log(`   ${c.gray}Size:${c.reset} ${sizeKB} KB`);
  console.log(`   ${c.gray}Vectors:${c.reset} ${processed}`);

  // Summary
  console.log(`\n${c.green}${c.bright}✅ Vector generation complete!${c.reset}`);
  console.log(`\n${c.bright}Intent Summary:${c.reset}`);

  for (const [name, data] of Object.entries(result.intents)) {
    console.log(`   ${name.padEnd(25)} ${data.count} vectors`);
  }

  console.log(`\n${c.cyan}Next: Restart the server to load new vectors.${c.reset}\n`);
}

// Run
generateVectors().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
