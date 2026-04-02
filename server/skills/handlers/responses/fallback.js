/**
 * Fallback Responses
 */

const fs = require("fs");
const path = require("path");
const { pickRandom } = require("./helpers");

module.exports = {
  fallback(text) {
    if (text) {
      try {
        const CONTENT_PATH = path.join(__dirname, "../../../nlp/knowledge/learned_content.json");
        if (fs.existsSync(CONTENT_PATH)) {
          const learned = JSON.parse(fs.readFileSync(CONTENT_PATH, "utf8"));
          const input = text.toLowerCase();
          for (const key of Object.keys(learned)) {
            const brand = learned[key].brand.toLowerCase();
            if (brand.length > 3 && input.includes(brand)) {
              return `I'm still organizing my knowledge about ${learned[key].brand}. Could you be more specific?`;
            }
          }
        }
      } catch (err) {}
    }

    return pickRandom([
      "I'm not sure I understand that yet.",
      "Could you rephrase that, sir?",
      "I didn't quite catch that.",
      "I'm still learning, could you say that again?"
    ]);
  }
};
