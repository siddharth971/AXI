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
    if (/\b(add|subtract|multiply|divide)\s+\d+\s+(and|by|from)\s+\d+/i.test(msg)) {
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
    if (/\b(convert|conversion)\b.*\b(km|kilometers|miles|meters|feet|celsius|fahrenheit|kg|pounds|liters|gallons)\b/i.test(msg)) {
      return { intent: "unit_convert", confidence: 1, entities: {} };
    }

    // Match "X km in miles", "X kilometers to miles"
    if (/\d+\s*(km|kilometers|miles|meters|feet|celsius|fahrenheit|kg|pounds)\s*(in|to|mein|se)\s*(km|kilometers|miles|meters|feet|celsius|fahrenheit|kg|pounds)/i.test(msg)) {
      return { intent: "unit_convert", confidence: 1, entities: {} };
    }

    // Match "how many miles in X km"
    if (/how many\s*(miles|feet|kilometers|kg|pounds)\s*(in|are in)\s*\d+/i.test(msg)) {
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
  }
};
