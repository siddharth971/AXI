/**
 * AXI TF-IDF Cosine Similarity Classifier
 * ---------------------------------------
 * A zero-dependency, explainable replacement for saturated neural networks.
 * 
 * Features:
 * 1. Negation preservation (high precision)
 * 2. IDF-weighted term scoring (handles rare words better)
 * 3. L2-normalized cosine similarity (no saturation on unknown inputs)
 * 4. Zero NPM dependencies
 */

"use strict";

const fs = require("fs");
const path = require("path");

// --- CONSTANTS ---

const NEGATION_WORDS = new Set([
  "not", "don't", "without", "except", "never", "no", "unless", "until",
  "before", "after", "only", "instead", "but", "rather", "avoid", "stop",
  "cancel", "undo", "remove", "close", "quit", "exit",
  "doesn't", "won't", "can't", "shouldn't", "wouldn't", "couldn't",
  "haven't", "hasnt", "hadnt", "didnt", "isnt", "arent", "wasnt"
]);

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "to", "of", "in", "for", "on",
  "with", "at", "by", "from", "as", "into", "through", "above", "below",
  "i", "me", "my", "we", "our", "you", "your", "he", "she", "it", "his", "her",
  "its", "they", "them", "their", "this", "that", "these", "those", "am",
  "also", "up", "down", "about", "any", "just", "now", "very", "so", "out"
]);

const LEMMA_RULES = [
  [/nesses$/i, ""], [/ments$/i, ""], [/ations$/i, ""], [/ation$/i, ""],
  [/ings$/i, ""], [/ing$/i, ""], [/tions$/i, ""], [/tion$/i, ""],
  [/ness$/i, ""], [/ment$/i, ""], [/ities$/i, ""], [/ity$/i, ""],
  [/iers$/i, "y"], [/ier$/i, "y"], [/ies$/i, "y"], [/ves$/i, "f"],
  [/ses$/i, "s"], [/s$/i, ""], [/ed$/i, ""], [/er$/i, ""], [/est$/i, ""], [/ly$/i, ""]
];

// --- TOKENIZER & LEMMATIZER ---

function lemmatize(word) {
  if (word.length <= 4) return word;
  
  for (const [pattern, replacement] of LEMMA_RULES) {
    if (pattern.test(word)) {
      const result = word.replace(pattern, replacement);
      if (result.length >= 3) return result;
    }
  }
  return word;
}

function tokenize(text, mode = "inference") {
  if (!text || typeof text !== "string") return [];

  // 1. Lowercase + 2. Clean characters
  const cleaned = text.toLowerCase()
    .replace(/[^a-z0-9\s\-']+/g, " ") // Keep a-z, 0-9, spaces, hyphens, apostrophes
    .replace(/\s+/g, " ")            // Collapse spaces
    .trim();

  // 3. Split
  const rawTokens = cleaned.split(" ");
  
  // 4. Process tokens
  const processed = rawTokens
    .map(token => {
      // In inference mode, keep negation words exactly as-is
      if (mode === "inference" && NEGATION_WORDS.has(token)) {
        return token;
      }
      return lemmatize(token);
    })
    .filter(token => {
      if (!token || token.length < 2) return false;
      
      // At training: strip all stopwords
      // At inference: strip stopwords EXCEPT negation words
      if (STOPWORDS.has(token)) {
        if (mode === "inference" && NEGATION_WORDS.has(token)) return true;
        return false;
      }
      return true;
    });

  return processed;
}

// --- MATH UTILITIES ---

function computeTF(tokens) {
  const counts = {};
  tokens.forEach(t => counts[t] = (counts[t] || 0) + 1);
  
  const tf = {};
  const total = tokens.length;
  for (const term in counts) {
    tf[term] = counts[term] / total;
  }
  return tf;
}

function buildIDF(documents) {
  const N = documents.length;
  const df = {};
  
  documents.forEach(tokens => {
    const uniqueTokens = new Set(tokens);
    uniqueTokens.forEach(t => df[t] = (df[t] || 0) + 1);
  });

  const idf = {};
  for (const term in df) {
    // Smoothed IDF: log((N+1)/(df+1)) + 1
    idf[term] = Math.log((N + 1) / (df[term] + 1)) + 1;
  }
  return idf;
}

function l2Normalize(vector) {
  let sumSq = 0;
  for (let i = 0; i < vector.length; i++) {
    sumSq += vector[i] * vector[i];
  }
  
  const norm = Math.sqrt(sumSq);
  if (norm === 0) return vector;
  
  const normalized = new Float32Array(vector.length);
  for (let i = 0; i < vector.length; i++) {
    normalized[i] = vector[i] / norm;
  }
  return normalized;
}

function buildVector(tokens, idf, vocab) {
  const vector = new Float32Array(vocab.size);
  const tf = computeTF(tokens);
  
  for (const term in tf) {
    if (vocab.has(term)) {
      const index = vocab.get(term);
      vector[index] = tf[term] * (idf[term] || 1);
    }
  }
  
  return l2Normalize(vector);
}

function cosineSimilarity(vecA, vecB) {
  // Dot product of L2-normalized vectors is cosine similarity
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
  }
  return Math.max(0, Math.min(1, dot)); // Clamp to [0, 1]
}

// --- CLASS DEFINITION ---

class TFIDFClassifier {
  constructor() {
    this.vocab = new Map();
    this.idf = {};
    this.intentDocs = [];
    this.trained = false;
    this._meta = {};
  }

  train(datasets) {
    if (!Array.isArray(datasets) || datasets.length === 0) {
      throw new Error("No training data provided");
    }

    const start = Date.now();
    
    // 1. Process each dataset
    const processedIntents = datasets
      .map(ds => {
        if (!ds.utterances || ds.utterances.length === 0) return null;
        
        // Combine all utterances for this intent for its vector representation
        const allText = ds.utterances.join(" ");
        const tokens = tokenize(allText, "train");
        
        return {
          intent: ds.intent,
          tokens,
          exampleCount: ds.utterances.length
        };
      })
      .filter(Boolean);

    // 2. Build Vocabulary
    const vocabSet = new Set();
    processedIntents.forEach(p => p.tokens.forEach(t => vocabSet.add(t)));
    
    this.vocab = new Map();
    Array.from(vocabSet).sort().forEach((token, index) => {
      this.vocab.set(token, index);
    });

    // 3. Build IDF
    this.idf = buildIDF(processedIntents.map(p => p.tokens));

    // 4. Build Intent Vectors
    this.intentDocs = processedIntents.map(p => ({
      intent: p.intent,
      exampleCount: p.exampleCount,
      vector: buildVector(p.tokens, this.idf, this.vocab)
    }));

    this.trained = true;
    this._meta = {
      trainedAt: new Date().toISOString(),
      intentCount: this.intentDocs.length,
      vocabSize: this.vocab.size,
      durationMs: Date.now() - start
    };

    console.log(`[TF-IDF] Training complete: ${this._meta.intentCount} intents, ${this._meta.vocabSize} tokens (${this._meta.durationMs}ms)`);
    return this._meta;
  }

  classify(input, topN = 3) {
    if (!this.trained) throw new Error("Classifier not trained");
    if (!input) return [{ intent: "none", confidence: 0 }];

    const tokens = tokenize(input, "inference");
    if (tokens.length === 0) return [{ intent: "none", confidence: 0 }];

    const queryVec = buildVector(tokens, this.idf, this.vocab);
    
    const results = this.intentDocs.map(doc => {
      let score = cosineSimilarity(queryVec, doc.vector);
      
      // Coverage boost (reward intents with more training examples)
      const boost = Math.min(0.05, doc.exampleCount / 500);
      score = Math.min(1, score + boost);
      
      return {
        intent: doc.intent,
        confidence: score
      };
    });

    return results.sort((a, b) => b.confidence - a.confidence).slice(0, topN);
  }

  classifyOne(input) {
    const results = this.classify(input, 1);
    return results[0] || { intent: "none", confidence: 0 };
  }

  explain(input, intentName) {
    const tokens = tokenize(input, "inference");
    const queryVec = buildVector(tokens, this.idf, this.vocab);
    const doc = this.intentDocs.find(d => d.intent === intentName);
    
    if (!doc) return { error: "Intent not found" };

    const contributions = [];
    const uniqueTokens = Array.from(new Set(tokens));
    
    uniqueTokens.forEach(token => {
      const index = this.vocab.get(token);
      if (index !== undefined) {
        const weight = queryVec[index] * doc.vector[index];
        if (weight > 0) contributions.push({ token, weight });
      }
    });

    return {
      input,
      intent: intentName,
      confidence: cosineSimilarity(queryVec, doc.vector),
      topTokens: contributions.sort((a, b) => b.weight - a.weight).slice(0, 8),
      queryTokens: tokens
    };
  }

  findConflicts(threshold = 0.4) {
    const conflicts = [];
    for (let i = 0; i < this.intentDocs.length; i++) {
      for (let j = i + 1; j < this.intentDocs.length; j++) {
        const sim = cosineSimilarity(this.intentDocs[i].vector, this.intentDocs[j].vector);
        if (sim >= threshold) {
          conflicts.push({
            intentA: this.intentDocs[i].intent,
            intentB: this.intentDocs[j].intent,
            similarity: sim
          });
        }
      }
    }
    return conflicts.sort((a, b) => b.similarity - a.similarity);
  }

  serialize() {
    if (!this.trained) throw new Error("Classifier not trained");
    return {
      _meta: this._meta,
      vocab: Array.from(this.vocab.entries()),
      idf: this.idf,
      intentDocs: this.intentDocs.map(d => {
        // Sparse vector serialization: only store non-zero weights
        const sparseVec = {};
        d.vector.forEach((weight, index) => {
          if (weight > 0) sparseVec[index] = Number(weight.toFixed(6));
        });
        
        return {
          intent: d.intent,
          exampleCount: d.exampleCount,
          vector: sparseVec
        };
      })
    };
  }

  async save(filePath) {
    const data = JSON.stringify(this.serialize());
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, data);
    console.log(`[TF-IDF] Model saved to ${filePath}`);
  }

  async load(filePath) {
    if (!fs.existsSync(filePath)) throw new Error(`Model file not found: ${filePath}`);
    
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    this._meta = data._meta;
    this.idf = data.idf;
    this.vocab = new Map(data.vocab);
    
    this.intentDocs = data.intentDocs.map(d => {
      const fullVec = new Float32Array(this.vocab.size);
      // Restore sparse vector
      for (const [index, weight] of Object.entries(d.vector)) {
        fullVec[parseInt(index)] = weight;
      }
      
      return {
        intent: d.intent,
        exampleCount: d.exampleCount,
        vector: fullVec
      };
    });
    
    this.trained = true;
    console.log(`[TF-IDF] Loaded model: ${this.intentDocs.length} intents, ${this.vocab.size} tokens`);
    return this._meta;
  }

  static async fromFile(filePath) {
    const classifier = new TFIDFClassifier();
    await classifier.load(filePath);
    return classifier;
  }
}

module.exports = {
  TFIDFClassifier,
  tokenize,
  lemmatize
};
