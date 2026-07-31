/**
 * AXI Preprocessor
 * -----------------
 * Text preprocessing pipeline:
 * 1. Synonym expansion
 * 2. Normalization (lowercase, trim)
 * 3. Stopword removal
 * 4. Lemmatization (basic)
 * 5. Tokenization
 */

// Common stopwords to remove
const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "must", "shall", "can", "need", "dare",
  "to", "of", "in", "for", "on", "with", "at", "by", "from", "as",
  "into", "through", "during", "all", "each", "few",
  "more", "most", "other", "some", "such", "only", "own", "same",
  "so", "than", "too", "very", "just", "also"
]);

// Negation words that must be preserved at inference time
const NEGATIONS = new Set([
  "not", "don't", "without", "except", "never", "no", "unless", "until",
  "before", "after", "instead", "but", "rather", "avoid", "stop",
  "cancel", "undo", "remove", "close", "quit", "exit"
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
 * Synonym map — canonical forms for common variant expressions.
 * Applied BEFORE tokenization so multi-word synonyms are also caught.
 * Keys are sorted longest-first to prevent partial replacements.
 */
const SYNONYMS = {
  // Speech-to-text phonetic typo corrections
  "ytube":        "youtube",
  "utube":        "youtube",
  "you tube":     "youtube",
  "goggl":        "google",
  "goolge":       "google",
  "spotifi":      "spotify",
  "spoatify":     "spotify",
  "vsc":          "vscode",
  "vs code":      "vscode",
  "git hub":      "github",
  // Open / Launch
  "go to":        "open",
  "navigate to":  "open",
  "navigate":     "open",
  "launch":       "open",
  "start":        "open",
  "boot":         "open",
  "browse to":    "open",
  "browse":       "open",
  "visit":        "open",
  "load":         "open",
  // Play / Media
  "resume":       "play",
  "unpause":      "play",
  // Pause / Stop
  "halt":         "pause",
  // Volume
  "louder":       "increase volume",
  "quieter":      "decrease volume",
  "softer":       "decrease volume",
  "volume higher": "increase volume",
  "volume lower":  "decrease volume",
  "turn up":      "increase volume",
  "turn down":    "decrease volume",
  // System
  "shut down":    "shutdown",
  "power off":    "shutdown",
  "power down":   "shutdown",
  "reboot":       "restart",
  // Screenshot
  "snap":         "screenshot",
  "capture":      "screenshot",
  "screen grab":  "screenshot",
  // Search / Find
  "look up":      "find",
  "look for":     "find",
  "query":        "find",
  "search for":   "search",
  // Memory
  "recall":       "remember",
  // Close
  "shut":         "close",
  "exit":         "close",
  "quit":         "close"
};

// Pre-sort synonym keys longest-first to avoid partial replacements
const SYNONYM_ENTRIES = Object.entries(SYNONYMS).sort(
  (a, b) => b[0].length - a[0].length
);

/**
 * Expand synonyms in text before tokenization.
 * Replaces known variant words/phrases with their canonical forms.
 * @param {string} text
 * @returns {string}
 */
function expandSynonyms(text) {
  let result = text.toLowerCase();
  for (const [synonym, canonical] of SYNONYM_ENTRIES) {
    result = result.replace(new RegExp(`\\b${synonym}\\b`, "gi"), canonical);
  }
  return result;
}

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
function removeStopwords(tokens, options = {}) {
  const { preserveNegations = true } = options;
  return tokens.filter(token => {
    if (preserveNegations && NEGATIONS.has(token)) return true;
    return !STOPWORDS.has(token);
  });
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
 * Soundex Phonetic Code Generator
 * Computes a 4-character phonetic hash for any word to match speech-to-text sound-alikes.
 * @param {string} word
 * @returns {string} 4-char Soundex code
 */
function soundex(word) {
  if (!word || typeof word !== "string") return "";
  const str = word.toUpperCase().replace(/[^A-Z]/g, "");
  if (!str) return "";

  const firstChar = str[0];
  const mapping = {
    B: 1, F: 1, P: 1, V: 1,
    C: 2, G: 2, J: 2, K: 2, Q: 2, S: 2, X: 2, Z: 2,
    D: 3, T: 3,
    L: 4,
    M: 5, N: 5,
    R: 6
  };

  let codes = [firstChar];
  let prevCode = mapping[firstChar] || 0;

  for (let i = 1; i < str.length; i++) {
    const char = str[i];
    const code = mapping[char] || 0;
    if (code !== 0 && code !== prevCode) {
      codes.push(code);
    }
    prevCode = code;
  }

  let result = codes.join("");
  while (result.length < 4) result += "0";
  return result.slice(0, 4);
}

/**
 * Phonetic similarity comparison
 * @param {string} word1
 * @param {string} word2
 * @returns {boolean} true if words sound phonetically identical
 */
function phoneticMatch(word1, word2) {
  return soundex(word1) === soundex(word2);
}

/**
 * Full preprocessing pipeline
 */
function preprocess(text, options = {}) {
  const {
    removeStops = true,
    lemma = true,
    keepOriginal = true,
    preserveNegations = true,
    expandSyns = true
  } = options;

  // Stage 1: Synonym expansion (before normalization, to catch multi-word phrases)
  const expanded = expandSyns ? expandSynonyms(text) : text;

  const normalized = normalize(expanded);
  let tokens = tokenize(normalized);

  const original = [...tokens];

  if (removeStops) {
    tokens = removeStopwords(tokens, { preserveNegations });
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
  expandSynonyms,
  soundex,
  phoneticMatch,
  preprocess,
  STOPWORDS,
  SYNONYMS
};

