/**
 * AXI NLU Pipeline
 * -----------------
 * Complete Natural Language Understanding pipeline:
 * 
 * 1. Preprocessing (normalization, tokenization)
 * 2. Entity Extraction (NER)
 * 3. POS Tagging
 * 4. Intent Classification
 * 5. Slot Filling
 * 
 * This replaces the simple tokenizer with a full NLU system.
 */

const preprocessor = require("./preprocessor");
const entityExtractor = require("./entity-extractor");
const { logger } = require("../utils");

/**
 * Main NLU Pipeline
 * @param {string} text - Raw user input
 * @returns {Object} Complete NLU result
 */
function process(text) {
  // Step 1: Preprocess
  const preprocessed = preprocessor.preprocess(text, {
    removeStops: false, // Keep all words for entity extraction
    lemma: false,
    keepOriginal: true
  });

  // Step 2: Entity Extraction & POS Tagging
  const analysis = entityExtractor.analyze(text);

  // Step 3: Build NLU result
  const result = {
    // Original and cleaned text
    raw: text,
    normalized: preprocessed.cleaned,
    tokens: preprocessed.tokens,

    // Entities found
    entities: {
      ...analysis.entities,

      // Extract specific slots
      website: extractWebsiteSlot(text, analysis.entities),
      searchQuery: extractSearchQuery(text),
      appName: extractAppName(text)
    },

    // Intent signals
    signals: analysis.signals,

    // POS tags for advanced processing
    pos: analysis.pos,

    // Metadata
    meta: {
      wordCount: preprocessed.wordCount,
      isQuestion: analysis.signals.isQuestion,
      questionType: analysis.signals.questionType,
      sentiment: analysis.signals.sentiment
    }
  };

  return result;
}

/**
 * Extract website/URL slot
 */
function extractWebsiteSlot(text, entities) {
  // Check for explicit URLs
  if (entities.urls && entities.urls.length > 0) {
    return entities.urls[0];
  }

  // Check for common website names
  const websitePattern = /(google|youtube|facebook|instagram|twitter|amazon|flipkart|github|linkedin|netflix)/i;
  const match = text.match(websitePattern);

  if (match) {
    return match[1].toLowerCase();
  }

  return null;
}

/**
 * Extract search query from text
 */
function extractSearchQuery(text) {
  // Pattern: "search for X" or "search X on Y" or "find X"
  const patterns = [
    /search (?:for |on youtube for |youtube for )?(.+)/i,
    /find (.+?) (?:on|in|about)/i,
    /look up (.+)/i,
    /look for (.+)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Extract application name
 */
function extractAppName(text) {
  const appPattern = /(?:open|launch|start|run) (.+?)(?:\s|$)/i;
  const match = text.match(appPattern);

  if (match) {
    const app = match[1].trim().toLowerCase();
    // Filter out websites
    if (!/\.com|\.org|\.in|\.net|youtube|google|facebook/.test(app)) {
      return app;
    }
  }

  return null;
}

/**
 * Debug NLU output
 */
function debug(text) {
  const result = process(text);

  console.log("\n🔬 NLU Debug Output");
  console.log("━".repeat(50));
  console.log(`📝 Input: "${text}"`);
  console.log(`📊 Normalized: "${result.normalized}"`);
  console.log(`🏷️  Tokens: [${result.tokens.join(", ")}]`);
  console.log("\n📦 Entities:");
  console.log(`   👤 People: ${result.entities.people.join(", ") || "none"}`);
  console.log(`   📍 Places: ${result.entities.places.join(", ") || "none"}`);
  console.log(`   🌐 Website: ${result.entities.website || "none"}`);
  console.log(`   🔍 Search Query: ${result.entities.searchQuery || "none"}`);
  console.log("\n📡 Signals:");
  console.log(`   ❓ Question: ${result.signals.isQuestion} (${result.signals.questionType || "n/a"})`);
  console.log(`   💻 Command: ${result.signals.isCommand}`);
  console.log(`   😊 Sentiment: ${result.signals.sentiment}`);
  console.log("━".repeat(50));

  return result;
}

module.exports = {
  process,
  debug
};
