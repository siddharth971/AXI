/**
 * YouTube Rules
 * ---------------
 * Pattern matching for YouTube-related commands
 * PRIORITY: Runs before website rules to capture YouTube searches
 */

module.exports = {
  /**
   * Match YouTube search queries
   * IMPORTANT: This must run BEFORE website rules
   */
  searchYoutube(text, nlu) {
    const msg = text.toLowerCase();

    // Pattern: "search youtube for X" or "youtube search for X"
    const searchMatch = msg.match(/(?:search\s+)?(?:youtube|you tube)\s+(?:for|pe|mein|search)\s+(.+)/i);
    if (searchMatch) {
      return {
        intent: "search_youtube",
        confidence: 1,
        entities: { query: searchMatch[1].trim() }
      };
    }

    // Pattern: "search for X on youtube"
    const searchOnMatch = msg.match(/search\s+(?:for\s+)?(.+?)\s+on\s+(?:youtube|you tube)/i);
    if (searchOnMatch) {
      return {
        intent: "search_youtube",
        confidence: 1,
        entities: { query: searchOnMatch[1].trim() }
      };
    }

    // Pattern: "play X on youtube"
    const playMatch = msg.match(/play\s+(.+?)\s+on\s+(?:youtube|you tube)/i);
    if (playMatch) {
      return {
        intent: "search_youtube",
        confidence: 1,
        entities: { query: playMatch[1].trim() }
      };
    }

    // Pattern: "youtube pe X dhundho/search karo"
    const hindiMatch = msg.match(/(?:youtube|you tube)\s+pe\s+(.+?)\s+(?:dhundho|search|chalao|dikhao)/i);
    if (hindiMatch) {
      return {
        intent: "search_youtube",
        confidence: 1,
        entities: { query: hindiMatch[1].trim() }
      };
    }

    // Use NLU extracted query if YouTube is mentioned with search context
    if (nlu?.entities?.searchQuery && /youtube/.test(msg) && /search|find|play|dhundho/.test(msg)) {
      return {
        intent: "search_youtube",
        confidence: 1,
        entities: { query: nlu.entities.searchQuery }
      };
    }

    return null;
  }
};
