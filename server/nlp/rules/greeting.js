/**
 * Greeting Rules
 * --------------
 * Pattern matching for greetings
 */

module.exports = {
  greeting(text) {
    const msg = text.toLowerCase();

    // Explicit greetings
    if (/\b(hello|hi|hey|greetings|namaste|yo|sup|wassup)\b/i.test(msg)) {
      return { intent: "greeting", confidence: 1, entities: {} };
    }

    return null;
  }
};
