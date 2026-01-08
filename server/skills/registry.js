/**
 * Plugin Registry
 * ----------------
 * Auto-discovers and loads all plugin files from the plugins directory.
 * Builds intent-to-plugin mapping and provides lookup functionality.
 * Enforces plugin contract validation and prevents duplicate intents.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { logger } = require("../utils");

const PLUGINS_DIR = path.join(__dirname, "plugins");
const PLUGIN_FILE_PATTERN = /\.plugin\.js$/;

class PluginRegistry {
  constructor() {
    this._plugins = new Map();        // pluginName -> pluginModule
    this._intentMap = new Map();      // intentName -> { plugin, intentConfig }
    this._initialized = false;
    this._loadErrors = [];
  }

  /**
   * Initialize the registry by loading all plugins
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this._initialized) {
      logger.warn("Registry already initialized, skipping reload");
      return;
    }

    logger.info("Initializing plugin registry...");
    this._loadErrors = [];

    try {
      await this._discoverPlugins();
      this._initialized = true;
      logger.success(`Registry initialized: ${this._plugins.size} plugins, ${this._intentMap.size} intents`);
    } catch (error) {
      logger.error("Failed to initialize plugin registry", error.message);
      throw error;
    }
  }

  /**
   * Discover and load all plugin files
   * @private
   */
  async _discoverPlugins() {
    // Ensure plugins directory exists
    if (!fs.existsSync(PLUGINS_DIR)) {
      fs.mkdirSync(PLUGINS_DIR, { recursive: true });
      logger.warn("Created plugins directory");
      return;
    }

    const files = fs.readdirSync(PLUGINS_DIR)
      .filter(file => PLUGIN_FILE_PATTERN.test(file));

    logger.debug(`Found ${files.length} plugin files`);

    for (const file of files) {
      await this._loadPlugin(path.join(PLUGINS_DIR, file));
    }
  }

  /**
   * Load and validate a single plugin
   * @private
   * @param {string} filepath - Absolute path to plugin file
   */
  async _loadPlugin(filepath) {
    const filename = path.basename(filepath);

    try {
      // Clear require cache to allow hot-reloading
      delete require.cache[require.resolve(filepath)];

      const plugin = require(filepath);

      // Validate plugin contract
      this._validatePlugin(plugin, filename);

      // Register plugin
      this._plugins.set(plugin.name, plugin);

      // Register all intents
      for (const [intentName, intentConfig] of Object.entries(plugin.intents)) {
        this._registerIntent(intentName, plugin, intentConfig, filename);
      }

      logger.debug(`Loaded plugin: ${plugin.name} (${Object.keys(plugin.intents).length} intents)`);

    } catch (error) {
      this._loadErrors.push({ file: filename, error: error.message });
      logger.error(`Failed to load plugin ${filename}: ${error.message}`);
    }
  }

  /**
   * Validate plugin contract
   * @private
   * @param {Object} plugin - Plugin module
   * @param {string} filename - Source filename for error reporting
   */
  _validatePlugin(plugin, filename) {
    if (!plugin.name || typeof plugin.name !== "string") {
      throw new Error("Plugin must export 'name' as a non-empty string");
    }

    if (!plugin.description || typeof plugin.description !== "string") {
      throw new Error("Plugin must export 'description' as a non-empty string");
    }

    if (!plugin.intents || typeof plugin.intents !== "object") {
      throw new Error("Plugin must export 'intents' as an object");
    }

    // Validate each intent
    for (const [intentName, intentConfig] of Object.entries(plugin.intents)) {
      if (!intentConfig.handler || typeof intentConfig.handler !== "function") {
        throw new Error(`Intent '${intentName}' must have a 'handler' function`);
      }

      if (typeof intentConfig.confidence !== "number") {
        throw new Error(`Intent '${intentName}' must specify 'confidence' threshold as a number`);
      }

      if (typeof intentConfig.requiresConfirmation !== "boolean") {
        throw new Error(`Intent '${intentName}' must specify 'requiresConfirmation' as a boolean`);
      }
    }
  }

  /**
   * Register an intent to the intent map
   * @private
   * @param {string} intentName - Intent identifier
   * @param {Object} plugin - Parent plugin
   * @param {Object} config - Intent configuration
   * @param {string} filename - Source filename
   */
  _registerIntent(intentName, plugin, config, filename) {
    // Check for duplicate intent registration
    if (this._intentMap.has(intentName)) {
      const existing = this._intentMap.get(intentName);
      throw new Error(
        `Duplicate intent '${intentName}' in ${filename}. Already registered by '${existing.plugin.name}'`
      );
    }

    this._intentMap.set(intentName, {
      plugin,
      config: {
        ...config,
        intentName
      }
    });
  }

  /**
   * Get plugin handler for an intent
   * @param {string} intentName - Intent to look up
   * @returns {Object|null} { plugin, config } or null if not found
   */
  getIntentHandler(intentName) {
    return this._intentMap.get(intentName) || null;
  }

  /**
   * Check if an intent exists
   * @param {string} intentName - Intent to check
   * @returns {boolean}
   */
  hasIntent(intentName) {
    return this._intentMap.has(intentName);
  }

  /**
   * Get intent metadata
   * @param {string} intentName - Intent to look up
   * @returns {Object|null} Intent metadata
   */
  getIntentMetadata(intentName) {
    const entry = this._intentMap.get(intentName);
    if (!entry) return null;

    return {
      pluginName: entry.plugin.name,
      pluginDescription: entry.plugin.description,
      confidence: entry.config.confidence,
      requiresConfirmation: entry.config.requiresConfirmation,
      intentName
    };
  }

  /**
   * Get all registered intents
   * @returns {Array<string>}
   */
  getAllIntents() {
    return Array.from(this._intentMap.keys());
  }

  /**
   * Get all loaded plugins
   * @returns {Array<Object>}
   */
  getAllPlugins() {
    return Array.from(this._plugins.values()).map(p => ({
      name: p.name,
      description: p.description,
      intents: Object.keys(p.intents)
    }));
  }

  /**
   * Get plugin by name
   * @param {string} name - Plugin name
   * @returns {Object|null}
   */
  getPlugin(name) {
    return this._plugins.get(name) || null;
  }

  /**
   * Get load errors
   * @returns {Array<Object>}
   */
  getLoadErrors() {
    return [...this._loadErrors];
  }

  /**
   * Reload all plugins (for hot-reloading)
   * @returns {Promise<void>}
   */
  async reload() {
    logger.info("Reloading plugin registry...");
    this._plugins.clear();
    this._intentMap.clear();
    this._initialized = false;
    await this.initialize();
  }

  /**
   * Check if registry is initialized
   * @returns {boolean}
   */
  isInitialized() {
    return this._initialized;
  }

  /**
   * Get registry statistics
   * @returns {Object}
   */
  getStats() {
    return {
      pluginCount: this._plugins.size,
      intentCount: this._intentMap.size,
      initialized: this._initialized,
      errorCount: this._loadErrors.length
    };
  }
}

// Singleton instance
const registry = new PluginRegistry();

module.exports = {
  PluginRegistry,
  registry,

  // Convenience exports
  initialize: () => registry.initialize(),
  getIntentHandler: (name) => registry.getIntentHandler(name),
  hasIntent: (name) => registry.hasIntent(name),
  getIntentMetadata: (name) => registry.getIntentMetadata(name),
  getAllIntents: () => registry.getAllIntents(),
  getAllPlugins: () => registry.getAllPlugins(),
  reload: () => registry.reload(),
  getStats: () => registry.getStats()
};
