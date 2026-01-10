/**
 * AXI Semantic Embedder (TF-IDF Based)
 * --------------------------------------
 * Generates semantic vectors using TF-IDF (Term Frequency-Inverse Document Frequency).
 * This approach is lightweight, requires no external model downloads, and works offline.
 * 
 * While not as powerful as deep learning embeddings, TF-IDF provides:
 * - Good semantic similarity for intent matching
 * - Sub-millisecond inference
 * - No network dependencies
 * - Zero model loading time
 */

"use strict";

const path = require("path");
const fs = require("fs");
const { logger } = require("../../utils");

const VECTOR_PATH = path.join(__dirname, "intent-vectors.json");

// Cached data
let intentVectors = null;
let vocabulary = null;
let idfWeights = null;
let isInitialized = false;

/**
 * Preprocess text for vectorization
 * @param {string} text - Input text
 * @returns {string[]} - Array of normalized tokens
 */
function tokenize(text) {
  if (!text || typeof text !== "string") return [];
  
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")  // Remove punctuation
    .replace(/\s+/g, " ")             // Normalize spaces
    .trim()
    .split(" ")
    .filter(token => token.length > 1); // Remove single chars
}

/**
 * Compute Term Frequency for a document
 * @param {string[]} tokens - Document tokens
 * @returns {Object} - TF map { token: frequency }
 */
function computeTF(tokens) {
  const tf = {};
  const total = tokens.length;
  
  if (total === 0) return tf;
  
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  
  // Normalize by document length
  for (const token in tf) {
    tf[token] = tf[token] / total;
  }
  
  return tf;
}

/**
 * Compute TF-IDF vector for a document
 * @param {string} text - Input text
 * @returns {Object} - TF-IDF vector { token: weight }
 */
function computeTFIDF(text) {
  if (!vocabulary || !idfWeights) return {};
  
  const tokens = tokenize(text);
  const tf = computeTF(tokens);
  const tfidf = {};
  
  for (const token of tokens) {
    if (vocabulary.has(token)) {
      tfidf[token] = (tf[token] || 0) * (idfWeights[token] || 1);
    }
  }
  
  return tfidf;
}

/**
 * Convert TF-IDF map to dense vector
 * @param {Object} tfidf - TF-IDF map
 * @param {string[]} vocabArray - Ordered vocabulary
 * @returns {number[]} - Dense vector
 */
function toDenseVector(tfidf, vocabArray) {
  return vocabArray.map(token => tfidf[token] || 0);
}

/**
 * Generate embedding for input text
 * @param {string} text - Input text
 * @returns {number[]} - Embedding vector
 */
function embed(text) {
  if (!isInitialized) {
    loadIntentVectors();
  }
  
  if (!vocabulary || vocabulary.size === 0) {
    return [];
  }
  
  const tfidf = computeTFIDF(text);
  const vocabArray = Array.from(vocabulary).sort();
  return toDenseVector(tfidf, vocabArray);
}

/**
 * Load pre-computed intent vectors from JSON file
 */
function loadIntentVectors() {
  if (intentVectors) return intentVectors;

  try {
    if (!fs.existsSync(VECTOR_PATH)) {
      logger.warn("Intent vectors not found. Run 'npm run generate:vectors' first.");
      return null;
    }

    const data = JSON.parse(fs.readFileSync(VECTOR_PATH, "utf8"));
    intentVectors = data;
    vocabulary = new Set(data.vocabulary || []);
    idfWeights = data.idfWeights || {};
    isInitialized = true;
    
    logger.success(`Loaded intent vectors for ${Object.keys(data.intents || {}).length} intents`);
    return intentVectors;
  } catch (error) {
    logger.error("Failed to load intent vectors:", error.message);
    return null;
  }
}

/**
 * Get cached intent vectors
 */
function getIntentVectors() {
  if (!intentVectors) {
    loadIntentVectors();
  }
  return intentVectors;
}

/**
 * Check if embedder is ready
 */
function isReady() {
  return isInitialized && intentVectors !== null;
}

/**
 * Reload intent vectors from disk
 */
function reloadVectors() {
  intentVectors = null;
  vocabulary = null;
  idfWeights = null;
  isInitialized = false;
  return loadIntentVectors();
}

// Load on module initialization
loadIntentVectors();

module.exports = {
  tokenize,
  computeTF,
  computeTFIDF,
  embed,
  loadIntentVectors,
  getIntentVectors,
  isReady,
  reloadVectors
};
