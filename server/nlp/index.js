/**
 * AXI NLP Module Index
 * ----------------------
 * Exports all NLP components.
 */

module.exports = {
  // Main interpreter
  nlp: require("./nlp"),

  // Components (for advanced use)
  preprocessor: require("./preprocessor"),
  entityExtractor: require("./entity-extractor"),
  nluPipeline: require("./nlu-pipeline"),
  intentLoader: require("./intent-loader")
};
