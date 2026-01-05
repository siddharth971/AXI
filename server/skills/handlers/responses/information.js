/**
 * Information Responses (Time, Weather, Jokes, News, Music)
 */

const { pickRandom } = require("./helpers");

module.exports = {
  tellTime() {
    const time = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
    return `The current time is ${time}, sir.`;
  },

  tellJoke() {
    return pickRandom([
      "Why did the scarecrow win an award? Because he was outstanding in his field!",
      "Why don't skeletons fight each other? They don't have the guts.",
      "What do you call a fake noodle? An impasta.",
      "Why did the bicycle fall over? Because it was two-tired.",
      "I told my wife she was drawing her eyebrows too high. She looked surprised."
    ]);
  },

  weatherCheck() {
    return "I cannot check the real-world weather yet, but I hope it's pleasant wherever you are!";
  },

  newsUpdate() {
    return "I don't have access to live news feeds at the moment, sir.";
  },

  musicControl() {
    return "Music control is not yet integrated with your system.";
  }
};
