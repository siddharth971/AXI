/**
 * Website Rules
 * ---------------
 * Pattern matching for website-related commands
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
   */
  openWebsite(text, nlu) {
    const { entities, signals } = nlu || {};

    // Use extracted website from NLU
    if (entities?.website && signals?.isCommand) {
      if (entities.website === "youtube") {
        return { intent: "open_youtube", confidence: 1, entities: {} };
      }
      return {
        intent: "open_website",
        confidence: 1,
        entities: { url: entities.website }
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
