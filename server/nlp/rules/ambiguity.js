/**
 * Ambiguity Rules
 * ---------------
 * Handles vague or ambiguous inputs that should trigger clarification
 * instead of unsafe execution.
 */

module.exports = {
  detectAmbiguity(text) {
    const msg = text.toLowerCase().trim();

    // Ambiguous commands that are too risky or vague to execute directly
    const ambiguousPhrases = [
      "open it",
      "delete something",
      "do something",
      "play that thing",
      "play it",
      "open that",
      "delete it"
    ];

    if (ambiguousPhrases.includes(msg)) {
      // Return low confidence to trigger clarification
      return {
        intent: "ambiguous",
        confidence: 0.3,
        entities: {}
      };
    }

    return null;
  }
};
