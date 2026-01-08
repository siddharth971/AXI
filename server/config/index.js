/**
 * AXI Server Configuration
 * -------------------------
 * Centralized configuration for the entire server.
 * All environment variables and constants should be defined here.
 */

module.exports = {
  // Server
  PORT: process.env.PORT || 5000,

  // NLP
  NLP_CONFIDENCE_THRESHOLD: 0.4,

  // Paths (relative to server root)
  PATHS: {
    NLP_MODEL_META: "./nlp/model-meta.json",
    NLP_MODEL_WEIGHTS: "./nlp/model-weights.json",
    NLP_VOCAB: "./nlp/vocab.json",
    NLP_TRAINING_DATA: "./nlp/training-data.json",
    SCREENSHOTS: "./screenshots",
    PLUGINS: "./skills/plugins"
  },

  // Website Mappings (for "open amazon" style commands)
  SITE_MAP: {
    "google": "https://google.com",
    "youtube": "https://youtube.com",
    "facebook": "https://facebook.com",
    "instagram": "https://instagram.com",
    "twitter": "https://twitter.com",
    "x": "https://x.com",
    "linkedin": "https://linkedin.com",
    "amazon": "https://amazon.in",
    "flipkart": "https://flipkart.com",
    "netflix": "https://netflix.com",
    "github": "https://github.com",
    "stackoverflow": "https://stackoverflow.com",
    "reddit": "https://reddit.com",
    "chatgpt": "https://chat.openai.com",
    "claude": "https://claude.ai"
  },

  // Plugin System Configuration
  PLUGINS: {
    // Auto-load plugins on startup
    AUTO_LOAD: true,
    // Allow hot-reloading of plugins
    HOT_RELOAD: process.env.NODE_ENV === "development",
    // Confirmation timeout in milliseconds
    CONFIRMATION_TIMEOUT: 30000,
    // Default confidence threshold for intents
    DEFAULT_CONFIDENCE: 0.5,
    // Enable plugin sandboxing (future feature)
    SANDBOX_ENABLED: false
  },

  // Safety Configuration
  SAFETY: {
    // Actions requiring confirmation
    DESTRUCTIVE_INTENTS: [
      "delete_file",
      "delete_folder",
      "shutdown_system",
      "restart_system",
      "clear_history",
      "uninstall_package"
    ],
    // Blocked paths for file operations
    BLOCKED_PATHS: [
      "C:\\Windows",
      "C:\\Program Files",
      "C:\\Program Files (x86)",
      "/usr",
      "/etc",
      "/bin",
      "/sys"
    ]
  },

  // Feature Flags
  FEATURES: {
    CONTEXT_ENABLED: true,
    LOGGING_VERBOSE: true,
    PLUGINS_ENABLED: true,
    CONFIRMATION_FLOW: true
  }
};
