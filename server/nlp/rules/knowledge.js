/**
 * Knowledge Rules
 * ----------------
 * Pattern matching for knowledge/calculation commands
 * HIGH PRIORITY to ensure accurate matching
 */

module.exports = {
  /**
   * Calculate - match calculation requests
   */
  calculate(text) {
    const msg = text.toLowerCase();

    // Match explicit "calculate" keyword
    if (/\b(calculate|calculation|hisaab|math solve)\b/i.test(msg)) {
      return { intent: "calculate", confidence: 1, entities: {} };
    }

    // Match "X plus Y", "X times Y", "X divided by Y", "X minus Y" patterns
    if (/\d+\s*(plus|minus|times|divided by|x|\+|-|\*|\/)\s*\d+/i.test(msg)) {
      return { intent: "calculate", confidence: 1, entities: {} };
    }

    // Match "what is X + Y" pattern
    if (/what is \d+\s*[\+\-\*\/x]\s*\d+/i.test(msg)) {
      return { intent: "calculate", confidence: 1, entities: {} };
    }

    // Match "add X and Y", "multiply X by Y"
    if (
      /\b(add|subtract|multiply|divide)\s+\d+\s+(and|by|from)\s+\d+/i.test(msg)
    ) {
      return { intent: "calculate", confidence: 1, entities: {} };
    }

    return null;
  },

  /**
   * Unit conversion - match conversion requests
   */
  unitConvert(text) {
    const msg = text.toLowerCase();

    // Match "convert X to Y" pattern
    if (
      /\b(convert|conversion)\b.*\b(km|kilometers|miles|meters|feet|celsius|fahrenheit|kg|pounds|liters|gallons)\b/i.test(
        msg,
      )
    ) {
      return { intent: "unit_convert", confidence: 1, entities: {} };
    }

    // Match "X km in miles", "X kilometers to miles"
    if (
      /\d+\s*(km|kilometers|miles|meters|feet|celsius|fahrenheit|kg|pounds)\s*(in|to|mein|se)\s*(km|kilometers|miles|meters|feet|celsius|fahrenheit|kg|pounds)/i.test(
        msg,
      )
    ) {
      return { intent: "unit_convert", confidence: 1, entities: {} };
    }

    // Match "how many miles in X km"
    if (
      /how many\s*(miles|feet|kilometers|kg|pounds)\s*(in|are in)\s*\d+/i.test(
        msg,
      )
    ) {
      return { intent: "unit_convert", confidence: 1, entities: {} };
    }

    return null;
  },

  /**
   * What day - match day of week queries
   */
  whatDay(text) {
    const msg = text.toLowerCase();

    // Pattern: "what day is it"
    if (/what day|which day|kaun sa din|kya din/.test(msg)) {
      return { intent: "what_day", confidence: 1, entities: {} };
    }

    // Match "today is what day"
    if (/today.*what day|aaj.*day/i.test(msg)) {
      return { intent: "what_day", confidence: 1, entities: {} };
    }

    return null;
  },

  /**
   * What Is - match definition/explanation queries
   */
  whatIs(text) {
    const msg = text.toLowerCase();

    // Pattern: "what is X", "what are X"
    const simpleMatch = msg.match(
      /^(?:please )?(?:tell me )?(?:explain )?what (?:is|are|was|were) (.+)/i,
    );
    if (simpleMatch) {
      return {
        intent: "knowledge.what_is",
        confidence: 1.0,
        entities: { topic: simpleMatch[1].trim() },
      };
    }

    // Pattern: "define X"
    const defineMatch = msg.match(/^(?:please )?define (.+)/i);
    if (defineMatch) {
      return {
        intent: "knowledge.what_is",
        confidence: 1.0,
        entities: { topic: defineMatch[1].trim() },
      };
    }

    return null;
  },

  /**
   * Who Is - match person queries
   */
  whoIs(text) {
    const msg = text.toLowerCase();

    // Pattern: "who is X", "who was X"
    const match = msg.match(
      /^(?:please )?(?:tell me )?(?:know )?who (?:is|are|was|were) (.+)/i,
    );
    if (match) {
      return {
        intent: "knowledge.who_is",
        confidence: 1.0,
        entities: { person: match[1].trim() },
      };
    }

    return null;
  },

  /**
   * About Self - routes "tell me about yourself / who are you" to system.about_self
   * Checked FIRST inside the rule loop — highest specificity.
   */
  aboutSelf(text) {
    const msg = text.toLowerCase();
    if (
      /\b(about your ?self|who are you|what are you|introduce your ?self|describe your ?self|tell me about your ?self|tell me about you|what is your name|whats your name)\b/i.test(msg)
    ) {
      // Confidence slightly above 1.0 so this always beats tellMeAbout in the tie-breaker
      return { intent: "ai_chat", confidence: 1.01, entities: {} };
    }
    return null;
  },

  /**
   * Tell Me About - routes generic "tell me about X" to web search.
   * Prevents falling through to noisy semantic matching.
   * Excludes self-referential topics (handled by aboutSelf above).
   */
  tellMeAbout(text) {
    const msg = text.toLowerCase();

    // Self-referential — let aboutSelf handle it
    if (/\b(your ?self|about you$|about you\s)\b/.test(msg)) return null;

    // "tell me about X", "explain X", "describe X", "give me info on X"
    const match = msg.match(
      /^(?:please )?(?:can you )?(?:tell me about|explain|describe|give me (?:info|information|details?) (?:on|about)) (.+)/i,
    );
    if (match) {
      const topic = match[1].trim();
      return {
        intent: "knowledge.what_is",
        confidence: 1.0,
        entities: { topic },
      };
    }

    return null;
  },
};
