/**
 * Media Rules
 * -------------
 * Pattern matching for media-related commands (music, video control)
 */

module.exports = {
  music(text) {
    if (/music|song|player|volume|track/.test(text.toLowerCase())) {
      return { intent: "music_control", confidence: 1, entities: {} };
    }
    return null;
  }
};
