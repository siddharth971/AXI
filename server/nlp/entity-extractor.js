/**
 * AXI Entity Extractor (NER)
 * ---------------------------
 * Named Entity Recognition using compromise.js
 * Extracts: People, Places, Organizations, Dates, URLs, etc.
 */

const nlp = require("compromise");

/**
 * Extract all entities from text
 * @param {string} text - Input text
 * @returns {Object} Extracted entities by category
 */
function extractEntities(text) {
  const doc = nlp(text);

  return {
    // People names
    people: doc.people().out("array"),

    // Places (cities, countries, etc.)
    places: doc.places().out("array"),

    // Organizations
    organizations: doc.organizations().out("array"),

    // Dates and times
    dates: doc.dates().out("array"),

    // Numbers and values
    numbers: doc.values().out("array"),

    // URLs and emails (custom extraction)
    urls: extractUrls(text),

    // Nouns (potential subjects/objects)
    nouns: doc.nouns().out("array"),

    // Verbs (actions)
    verbs: doc.verbs().out("array"),

    // Adjectives
    adjectives: doc.adjectives().out("array")
  };
}

/**
 * Extract URLs from text
 */
function extractUrls(text) {
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+)(?:\/[^\s]*)?/gi;
  const matches = text.match(urlRegex) || [];
  return matches.map(url => url.toLowerCase());
}

/**
 * Get Part-of-Speech tags for all words
 * @param {string} text - Input text
 * @returns {Array} Array of {word, tags} objects
 */
function getPOSTags(text) {
  const doc = nlp(text);
  const terms = doc.terms().json();

  return terms.map(term => ({
    word: term.text,
    tags: term.tags || [],
    normal: term.normal || term.text.toLowerCase()
  }));
}

/**
 * Identify the question type
 * @param {string} text - Input text
 * @returns {string|null} Question type (what, where, when, who, how, why)
 */
function getQuestionType(text) {
  const lower = text.toLowerCase().trim();

  const questionWords = ["what", "where", "when", "who", "whom", "whose", "which", "why", "how"];

  for (const qw of questionWords) {
    if (lower.startsWith(qw)) {
      return qw;
    }
  }

  // Check for inverted questions (Is it..., Can you...)
  if (/^(is|are|was|were|do|does|did|can|could|will|would|should|may|might)\s/i.test(lower)) {
    return "yes_no";
  }

  return null;
}

/**
 * Extract intent signals from text
 */
function extractIntentSignals(text) {
  const doc = nlp(text);

  return {
    isQuestion: doc.questions().length > 0,
    questionType: getQuestionType(text),
    isCommand: /^(open|go|show|tell|find|search|play|turn|set|make|create|delete|remove)/i.test(text.trim()),
    hasNegation: doc.has("#Negative"),
    sentiment: analyzeSentiment(text),
    topics: doc.topics().out("array")
  };
}

/**
 * Simple sentiment analysis
 */
function analyzeSentiment(text) {
  const positive = ["good", "great", "awesome", "nice", "love", "like", "thanks", "thank", "happy", "wonderful", "excellent", "amazing", "perfect", "best"];
  const negative = ["bad", "terrible", "awful", "hate", "dislike", "angry", "sad", "worst", "horrible", "annoying", "wrong", "problem", "error"];

  const lower = text.toLowerCase();

  let score = 0;
  for (const word of positive) {
    if (lower.includes(word)) score++;
  }
  for (const word of negative) {
    if (lower.includes(word)) score--;
  }

  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}

/**
 * Full NLU analysis
 */
function analyze(text) {
  return {
    entities: extractEntities(text),
    pos: getPOSTags(text),
    signals: extractIntentSignals(text)
  };
}

module.exports = {
  extractEntities,
  getPOSTags,
  getQuestionType,
  extractIntentSignals,
  analyzeSentiment,
  analyze
};
