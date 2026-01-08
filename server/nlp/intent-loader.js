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
const fs = require("fs");

/**
 * Load all intent JSON files and merge them
 * @param {string[]} [extraDirs=[]] - Additional directories to scan for intents (e.g. plugins)
 * @returns {Array} Combined array of all intents
 */
function loadAllIntents(extraDirs = []) {
  console.log("\n📂 Loading intents recursively...");

  let allIntents = loadJsonRecursive(INTENTS_DIR, { merge: true, log: true });

  // Load from extra directories (e.g. plugins)
  extraDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`   Scanning plugin dir: ${dir}`);

      // 1. Load JSONs
      const pluginIntents = loadJsonRecursive(dir, { merge: true, log: true });
      allIntents = [...allIntents, ...pluginIntents];

      // 2. Load .plugin.js files
      try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          if (file.endsWith(".plugin.js")) {
            try {
              const pluginPath = path.join(dir, file);
              // Clear cache to ensure fresh load
              delete require.cache[require.resolve(pluginPath)];
              const plugin = require(pluginPath);

              if (plugin && plugin.intents) {
                console.log(`   🔌 Loading plugin: ${plugin.name} (${Object.keys(plugin.intents).length} intents)`);

                Object.entries(plugin.intents).forEach(([key, value]) => {
                  if (value.utterances && Array.isArray(value.utterances)) {
                    // specific intent name format: pluginName.intentKey or just intentKey?
                    // The registry uses "pluginName.intentKey" usually, but let's check context.
                    // For now, let's assume unique keys or prefixing.
                    // To match registry.js logic, let's stick to the key as the intent name
                    // BUT for safety, maybe we should respect how the system uses it.
                    // Re-reading registry logs: "Loaded plugin: system (16 intents)"

                    allIntents.push({
                      intent: key, // The key itself is the intent name (e.g., 'create_file')
                      utterances: value.utterances
                    });
                  }
                });
              }
            } catch (err) {
              console.error(`   ❌ Failed to load plugin ${file}:`, err.message);
            }
          }
        });
      } catch (err) {
        // Directory read error (ignore)
      }
    }
  });

  // Merge duplicate intents (combine utterances)
  const merged = mergeByField(allIntents, "intent", "utterances");

  console.log(`\n✅ Total intents loaded: ${merged.length}`);
  return merged;
}

module.exports = {
  loadAllIntents
};
