/**
 * AXI Preprocessor
 * -----------------
 * Text preprocessing pipeline:
 * 1. Normalization (lowercase, trim)
 * 2. Stopword removal
 * 3. Lemmatization (basic)
 * 4. Tokenization
 */

// Common stopwords to remove
const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "must", "shall", "can", "need", "dare",
  "to", "of", "in", "for", "on", "with", "at", "by", "from", "as",
  "into", "through", "during", "before", "after", "above", "below",
  "between", "under", "again", "further", "then", "once", "here",
  "there", "when", "where", "why", "how", "all", "each", "few",
  "more", "most", "other", "some", "such", "only", "own", "same",
  "so", "than", "too", "very", "just", "also"
]);

// Simple lemmatization rules
const LEMMA_RULES = [
  { suffix: "ing", replacement: "" },
  { suffix: "ed", replacement: "" },
  { suffix: "es", replacement: "" },
  { suffix: "s", replacement: "" },
  { suffix: "ly", replacement: "" },
  { suffix: "ies", replacement: "y" }
];

/**
 * Normalize text (lowercase, remove punctuation)
 */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokenize text into words
 */
function tokenize(text) {
  return text.split(/\s+/).filter(Boolean);
}

/**
 * Remove stopwords
 */
function removeStopwords(tokens) {
  return tokens.filter(token => !STOPWORDS.has(token));
}

/**
 * Simple lemmatization
 */
function lemmatize(word) {
  for (const rule of LEMMA_RULES) {
    if (word.endsWith(rule.suffix) && word.length > rule.suffix.length + 2) {
      return word.slice(0, -rule.suffix.length) + rule.replacement;
    }
  }
  return word;
}

/**
 * Full preprocessing pipeline
 */
function preprocess(text, options = {}) {
  const {
    removeStops = true,
    lemma = true,
    keepOriginal = true
  } = options;

  const normalized = normalize(text);
  let tokens = tokenize(normalized);

  const original = [...tokens];

  if (removeStops) {
    tokens = removeStopwords(tokens);
  }

  if (lemma) {
    tokens = tokens.map(lemmatize);
  }

  return {
    original: keepOriginal ? original : null,
    tokens,
    cleaned: tokens.join(" "),
    wordCount: tokens.length
  };
}

module.exports = {
  normalize,
  tokenize,
  removeStopwords,
  lemmatize,
  preprocess,
  STOPWORDS
};
