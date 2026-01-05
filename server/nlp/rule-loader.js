/**
 * AXI Rule Loader
 * -----------------
 * Loads all rule modules from the rules/ folder recursively.
 * Each rule file exports a function that returns an intent match or null.
 */

const path = require("path");
const { loadModulesRecursive } = require("../utils/recursive-loader");

const RULES_DIR = path.join(__dirname, "rules");

/**
 * Load all rule modules and return as array of rule functions
 * @returns {Array<Function>} Array of rule functions
 */
function loadAllRules() {
  console.log("\n📂 Loading rules recursively...\n");

  const modules = loadModulesRecursive(RULES_DIR, { flatten: false, log: true });

  // Extract all exported functions
  const rules = [];

  for (const [path, module] of Object.entries(modules)) {
    if (typeof module === "function") {
      rules.push({ name: path, fn: module });
    } else if (typeof module === "object") {
      for (const [name, fn] of Object.entries(module)) {
        if (typeof fn === "function") {
          rules.push({ name: `${path}/${name}`, fn });
        }
      }
    }
  }

  console.log(`\n✅ Total rules loaded: ${rules.length}`);
  return rules;
}

module.exports = {
  loadAllRules
};
