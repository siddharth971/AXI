/**
 * Intent Loader
 * ---------------
 * Loads and merges all intent files from the intents/ folder.
 * This allows training data to be split across multiple files.
 */

const fs = require("fs");
const path = require("path");

const INTENTS_DIR = path.join(__dirname, "intents");

/**
 * Load all intent JSON files and merge them
 * @returns {Array} Combined array of all intents
 */
function loadAllIntents() {
  const allIntents = [];

  if (!fs.existsSync(INTENTS_DIR)) {
    console.warn("⚠️ Intents directory not found:", INTENTS_DIR);
    return allIntents;
  }

  const files = fs.readdirSync(INTENTS_DIR).filter(f => f.endsWith(".json"));

  for (const file of files) {
    try {
      const filePath = path.join(INTENTS_DIR, file);
      const content = fs.readFileSync(filePath, "utf8");
      const intents = JSON.parse(content);

      if (Array.isArray(intents)) {
        allIntents.push(...intents);
        console.log(`📁 Loaded: ${file} (${intents.length} intents)`);
      }
    } catch (err) {
      console.error(`❌ Failed to load ${file}:`, err.message);
    }
  }

  // Merge duplicate intents (combine utterances)
  const merged = mergeIntents(allIntents);

  console.log(`✅ Total intents loaded: ${merged.length}`);
  return merged;
}

/**
 * Merge intents with the same name
 */
function mergeIntents(intents) {
  const map = new Map();

  for (const item of intents) {
    if (map.has(item.intent)) {
      // Merge utterances
      const existing = map.get(item.intent);
      const combined = [...new Set([...existing.utterances, ...item.utterances])];
      existing.utterances = combined;
    } else {
      map.set(item.intent, { ...item });
    }
  }

  return Array.from(map.values());
}

module.exports = {
  loadAllIntents
};
