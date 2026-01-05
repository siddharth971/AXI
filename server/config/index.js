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
    SCREENSHOTS: "./screenshots"
  },

  // Website Mappings (for "open amazon" style commands)
  SITE_MAP: {
    "google": "https://google.com",
    "youtube": "https://youtube.com",
    "facebook": "https://facebook.com",
    "instagram": "https://instagram.com",
    "twitter": "https://twitter.com",
    "linkedin": "https://linkedin.com",
    "amazon": "https://amazon.in",
    "flipkart": "https://flipkart.com",
    "netflix": "https://netflix.com",
    "github": "https://github.com",
    "stackoverflow": "https://stackoverflow.com"
  },

  // Feature Flags
  FEATURES: {
    CONTEXT_ENABLED: true,
    LOGGING_VERBOSE: true
  }
};
