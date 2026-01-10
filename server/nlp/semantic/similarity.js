/**
 * AXI Similarity Functions
 * -------------------------
 * Cosine similarity calculations for semantic matching.
 * Works with pre-computed intent vectors for fast comparison.
 */

"use strict";

/**
 * Compute cosine similarity between two vectors
 * Formula: (A·B) / (|A| × |B|)
 * 
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} - Similarity score between -1 and 1
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);

  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

/**
 * Find the best matching intent for an input embedding
 * 
 * @param {number[]} inputEmbedding - Embedding of user input
 * @param {Object} intentVectors - Object containing intent embeddings
 * @param {number} threshold - Minimum similarity to consider a match
 * @returns {Object|null} - Best match { intent, confidence, example } or null
 */
function findBestMatch(inputEmbedding, intentVectors, threshold = 0.75) {
  if (!inputEmbedding || !intentVectors || !intentVectors.intents) {
    return null;
  }

  let bestMatch = null;
  let bestScore = -1;
  let bestExample = null;

  for (const [intentName, intentData] of Object.entries(intentVectors.intents)) {
    const { embeddings, examples } = intentData;

    if (!embeddings || embeddings.length === 0) continue;

    // Compare against each example embedding for this intent
    for (let i = 0; i < embeddings.length; i++) {
      const similarity = cosineSimilarity(inputEmbedding, embeddings[i]);

      if (similarity > bestScore) {
        bestScore = similarity;
        bestMatch = intentName;
        bestExample = examples ? examples[i] : null;
      }
    }
  }

  // Only return if above threshold
  if (bestScore >= threshold) {
    return {
      intent: bestMatch,
      confidence: bestScore,
      matchedExample: bestExample,
      semantic: true
    };
  }

  return null;
}

/**
 * Get top N matches for an input embedding
 * Useful for debugging and multi-intent detection
 * 
 * @param {number[]} inputEmbedding - Embedding of user input
 * @param {Object} intentVectors - Object containing intent embeddings
 * @param {number} topN - Number of top matches to return
 * @returns {Array} - Array of { intent, confidence } sorted by confidence
 */
function findTopMatches(inputEmbedding, intentVectors, topN = 5) {
  if (!inputEmbedding || !intentVectors || !intentVectors.intents) {
    return [];
  }

  const matches = [];

  for (const [intentName, intentData] of Object.entries(intentVectors.intents)) {
    const { embeddings, examples } = intentData;

    if (!embeddings || embeddings.length === 0) continue;

    // Get best similarity for this intent
    let bestSimilarity = -1;
    let bestExample = null;

    for (let i = 0; i < embeddings.length; i++) {
      const similarity = cosineSimilarity(inputEmbedding, embeddings[i]);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestExample = examples ? examples[i] : null;
      }
    }

    matches.push({
      intent: intentName,
      confidence: bestSimilarity,
      matchedExample: bestExample
    });
  }

  // Sort by confidence descending
  matches.sort((a, b) => b.confidence - a.confidence);

  return matches.slice(0, topN);
}

/**
 * Compute average embedding for a set of vectors
 * Useful for creating centroid-based intent representations
 * 
 * @param {number[][]} embeddings - Array of embedding vectors
 * @returns {number[]} - Average embedding vector
 */
function averageEmbedding(embeddings) {
  if (!embeddings || embeddings.length === 0) return null;

  const dim = embeddings[0].length;
  const avg = new Array(dim).fill(0);

  for (const emb of embeddings) {
    for (let i = 0; i < dim; i++) {
      avg[i] += emb[i];
    }
  }

  for (let i = 0; i < dim; i++) {
    avg[i] /= embeddings.length;
  }

  return avg;
}

module.exports = {
  cosineSimilarity,
  findBestMatch,
  findTopMatches,
  averageEmbedding
};
