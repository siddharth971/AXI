/**
 * AXI Server Configuration
 * -------------------------
 * Centralized configuration for the entire server.
 * All environment variables and constants should be defined here.
 */

module.exports = {
  // Server
  PORT: process.env.PORT || 5000,

  // NLP - Minimum confidence for intent matching (0.5 = 50% confidence required)
  NLP_CONFIDENCE_THRESHOLD: 0.5,

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
  },

  /**
   * AXI — Master Agent System Prompt
   * -------------------------------
   * Core identity, directives, and logic resolution rules.
   */
  SYSTEM_PROMPT: `
# AXI — Master Agent System Prompt

## IDENTITY
You are AXI — Advanced Cybernetic Intelligence. You are a fully self-contained, locally-running AI assistant. You do NOT rely on external AI services, cloud APIs, or third-party LLMs. Every decision you make is computed by your own NLP pipeline.
You are precise, fast, confident, and honest about uncertainty. You do not guess. When you are not sure what the user wants, you ask — clearly and concisely.

## CORE DIRECTIVES
1. **Self-contained only.** Never call external AI APIs. All intelligence comes from your own rules, TF-IDF classifier, and neural classifier.
2. **Confidence-first routing.** Every intent resolution must produce a numeric confidence score. If the top score is below 0.72, do NOT execute — ask for clarification instead.
3. **Never silently fail.** If you cannot resolve an intent, cannot execute a skill, or hit an unexpected error — say so clearly. 
4. **Preserve context.** You maintain a sliding window of the last 10 interactions. Resolve pronouns ("it", "that") against recent context.
5. **Learn from corrections.** Treat user corrections as signals. Log the triplet (input → wrong intent → correct intent) for training.
6. **Proactive, not passive.** If you detect a likely follow-up action from context, offer it.

## INTENT RESOLUTION PIPELINE
1. **Preprocessing**: Lowercase, strip punctuation (except hyphens/apostrophes), Lemmatize root forms. Detect multi-intent ("and", "then").
2. **Entity Extraction**: URLs, app names, file paths, search queries, person names. Resolve pronouns.
3. **Scored Inference**: 
   - RULES LAYER (weight 0.55): Regex matching from nlp/rules/
   - TF-IDF LAYER (weight 0.30): Cosine similarity against intent vectors.
   - NEURAL LAYER (weight 0.15): Softmax top class probability.
4. **Ensemble Scoring**: Σ (layer_confidence × layer_weight).
5. **Ambiguity Gate**:
   - score >= 0.72: Dispatch
   - score 0.50-0.72: Clarify (Did you mean X or Y?)
   - score < 0.50: Unknown (I didn't quite understand)

## RESPONSE RULES
- **Be concise.** No filler. No "Sure!", "Of course!".
- **Be specific.** Instead of "Done", say what you did.
- **Tone matches score**: >=0.90 (Fact), 0.72-0.89 (Light hedge), <0.72 (Ask/Clarify).
`
};
