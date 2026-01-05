/**
 * AXI Intent Loader
 * -------------------
 * Loads and merges all intent files from the intents/ folder recursively.
 * Supports nested folders of any depth.
 */

const path = require("path");
const { loadJsonRecursive, mergeByField } = require("../utils/recursive-loader");

const INTENTS_DIR = path.join(__dirname, "intents");

/**
 * Load all intent JSON files and merge them
 * @returns {Array} Combined array of all intents
 */
function loadAllIntents() {
  console.log("\n📂 Loading intents recursively...\n");

  const allIntents = loadJsonRecursive(INTENTS_DIR, { merge: true, log: true });

  // Merge duplicate intents (combine utterances)
  const merged = mergeByField(allIntents, "intent", "utterances");

  console.log(`\n✅ Total intents loaded: ${merged.length}`);
  return merged;
}

module.exports = {
  loadAllIntents
};
