/**
 * Local File Search & RAG Rules Module
 * Matches queries for code searching, content scanning, and extension filtering
 */

"use strict";

module.exports = {
  name: "local_search",
  fn: (text) => {
    if (!text || typeof text !== "string") return null;
    const lower = text.toLowerCase().trim();

    // Extension Search Patterns: e.g. "find markdown files", "find json files"
    const extMatch = lower.match(/find\s+([a-z0-9]+)\s+files/i);
    if (extMatch && ["md", "json", "js", "ts", "css", "html", "py"].includes(extMatch[1])) {
      return {
        intent: "file.find_by_type",
        confidence: 1.0,
        entities: { ext: extMatch[1] },
      };
    }

    // Keyword Search Patterns: e.g. "search code for benchmark", "find files containing Soundex"
    const searchMatch =
      lower.match(/(search|find)\s+(code|files|workspace)\s+(for|containing|with)\s+(.+)/i) ||
      lower.match(/search\s+local\s+files\s+for\s+(.+)/i) ||
      lower.match(/search\s+for\s+(.+)\s+in\s+(files|code)/i);

    if (searchMatch) {
      const keyword = (searchMatch[4] || searchMatch[1]).trim();
      return {
        intent: "file.search_content",
        confidence: 1.0,
        entities: { query: keyword },
      };
    }

    return null;
  },
};
