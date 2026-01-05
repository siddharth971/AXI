/**
 * Fallback Responses
 */

const { pickRandom } = require("./helpers");

module.exports = {
  fallback(text) {
    return pickRandom([
      "I'm not sure I understand that yet.",
      "Could you rephrase that, sir?",
      "I didn't quite catch that.",
      "I'm still learning, could you say that again?"
    ]);
  }
};
