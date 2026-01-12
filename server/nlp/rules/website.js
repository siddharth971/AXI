/**
 * Website Rules
 * ---------------
 * Pattern matching for website-related commands
 * 
 * RULE ORDER NOTE: YouTube search rules should run before these.
 * This file explicitly skips YouTube when search context is detected.
 */

module.exports = {
  /**
   * Match "open website" without specific site
   */
  askWhichWebsite(text) {
    const msg = text.toLowerCase().trim();

    if (msg === "open website" || msg === "visit website" || msg === "open a website") {
      return { intent: "ask_which_website", confidence: 1, entities: {} };
    }

    return null;
  },

  /**
   * Match website opening commands using NLU entities
   * IMPORTANT: Skips YouTube if search/play context is detected
   */
  openWebsite(text, nlu) {
    const msg = text.toLowerCase();
    const { entities, signals } = nlu || {};

    // Skip if there's a search/play context with YouTube - let youtube.js handle it
    if (entities?.website === "youtube" && /search|find|play|dhundho|chalao/.test(msg)) {
      return null;
    }

    // Use extracted website from NLU
    if (entities?.website && signals?.isCommand) {
      if (entities.website === "youtube") {
        return { intent: "open_youtube", confidence: 1, entities: { website: "youtube" } };
      }
      return {
        intent: "open_website",
        confidence: 1,
        entities: { url: entities.website }
      };
    }

    // Explicit google request in correction context
    if (/\bgoogle please\b/i.test(msg)) {
      return {
        intent: "open_website",
        confidence: 1,
        entities: { url: "google" }
      };
    }

    // URL detection
    if (entities?.urls && entities.urls.length > 0) {
      return {
        intent: "open_website",
        confidence: 1,
        entities: { url: entities.urls[0] }
      };
    }

    return null;
  }
};
