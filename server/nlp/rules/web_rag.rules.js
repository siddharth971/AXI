/**
 * Real-Time Web RAG Rules Module
 * Matches queries for web search, live news, and online summaries
 */

"use strict";

module.exports = {
  name: "web_rag",
  fn: (text) => {
    if (!text || typeof text !== "string") return null;
    const lower = text.toLowerCase().trim();

    // Match Web RAG Queries
    const match =
      lower.match(/search\s+(the\s+)?web\s+for\s+(.+)/i) ||
      lower.match(/(fetch|get)\s+(latest\s+)?news\s+(on|about)\s+(.+)/i) ||
      lower.match(/what\s+is\s+the\s+latest\s+news\s+(on|about)\s+(.+)/i) ||
      lower.match(/summarize\s+(web\s+results\s+for|article\s+about)\s+(.+)/i);

    if (match) {
      const keyword = (match[4] || match[2] || match[1]).trim();
      return {
        intent: "knowledge.web_rag",
        confidence: 1.0,
        entities: { query: keyword },
      };
    }

    return null;
  },
};
