/**
 * YouTube Rules
 * ---------------
 * Pattern matching for YouTube-related commands
 */

module.exports = {
  /**
   * Match YouTube search queries
   */
  searchYoutube(text, nlu) {
    const msg = text.toLowerCase();

    // Pattern: "search youtube for X"
    const match = msg.match(/search (?:youtube|you tube) for (.+)/i);
    if (match) {
      return {
        intent: "search_youtube",
        confidence: 1,
        entities: { query: match[1].trim() }
      };
    }

    // Use NLU extracted query if YouTube is mentioned
    if (nlu?.entities?.searchQuery && /youtube/.test(msg)) {
      return {
        intent: "search_youtube",
        confidence: 1,
        entities: { query: nlu.entities.searchQuery }
      };
    }

    return null;
  }
};
