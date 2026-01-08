/**
 * ⚠️ DEPRECATED HANDLERS DIRECTORY
 * =================================
 * 
 * This directory contains legacy skill handlers that have been migrated
 * to the new plugin-based architecture.
 * 
 * ❌ DO NOT MODIFY these files
 * ❌ DO NOT ADD new handlers here
 * 
 * ✅ Use the new plugin system instead:
 *    server/skills/plugins/
 * 
 * Migration Guide:
 * ----------------
 * Old: require('./handlers/browser').openYoutube()
 * New: Skills system automatically routes via plugins
 * 
 * To create a new skill:
 * 1. Create a new file in plugins/ named: yourskill.plugin.js
 * 2. Export the plugin contract (name, description, intents)
 * 3. The registry auto-discovers and loads it
 * 
 * These files are kept for reference during the transition period
 * and will be removed in a future version.
 * 
 * @deprecated Since v2.0.0 - Use plugin system instead
 */

console.warn(
  "\n⚠️  WARNING: Deprecated handlers directory accessed.\n" +
  "   Please migrate to the plugin system: server/skills/plugins/\n"
);

// Re-export for backward compatibility (will be removed)
module.exports = {
  browser: require("./browser"),
  system: require("./system"),
  general: require("./general"),

  // Deprecation notice
  __deprecated: true,
  __message: "Use the plugin system in server/skills/plugins/ instead"
};
