/**
 * Greeting Responses
 */

const { pickRandom } = require("./helpers");

module.exports = {
  greeting() {
    return pickRandom([
      "Hello sir, how can I assist you today?",
      "Good to see you, sir. What can I do for you?",
      "Hi there! How may I help?",
      "Hello! I'm ready to assist."
    ]);
  }
};
