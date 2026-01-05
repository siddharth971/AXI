/**
 * AI Chat Responses
 * Handles conversational/small-talk interactions
 */

const { pickRandom } = require("./helpers");

module.exports = {
  aiChat(text) {
    const msg = text.toLowerCase().trim();

    // Positive feedback
    if (/nice|cool|awesome|great|amazing|good job|wow|excellent/.test(msg)) {
      return pickRandom([
        "I'm glad you think so, sir.",
        "Thank you!",
        "I appreciate that.",
        "Always happy to help.",
        "That's great to hear!"
      ]);
    }

    // Short affirmatives
    if (/^(yes|yeah|yep|sure|ok|okay|alright|right|correct|exactly|perfect|got it|understood)$/.test(msg)) {
      return pickRandom([
        "Understood, sir.",
        "Alright!",
        "Got it.",
        "Okay, what can I do for you?",
        "Sure thing. What's next?"
      ]);
    }

    // Short negatives
    if (/^(no|nope|not really|never mind|forget it|nothing|not now|later|maybe)$/.test(msg)) {
      return pickRandom([
        "Alright, let me know if you need anything.",
        "No problem, sir.",
        "Okay, I'll be here when you need me.",
        "Sure, just say the word when you're ready."
      ]);
    }

    // Question words without context
    if (/^(why|what|how|who|where|when)$/.test(msg)) {
      return pickRandom([
        "Could you be more specific, sir?",
        "I'm not sure what you're asking about. Can you elaborate?",
        "What would you like to know?"
      ]);
    }

    // Fillers and thinking sounds
    if (/^(hmm|hm|uh|um|oh|oops)$/.test(msg)) {
      return pickRandom([
        "Take your time, sir.",
        "I'm listening.",
        "Yes?"
      ]);
    }

    // Well-being responses
    if (/^(i am|im|i'm) (fine|good|okay|great|well)/.test(msg)) {
      return pickRandom([
        "That's great to hear, sir!",
        "Wonderful! How can I assist you?",
        "Glad to hear that."
      ]);
    }

    // Identity questions
    if (/who are you|your name|what are you|^who$/.test(msg)) {
      return "I am AXI, your advanced virtual assistant.";
    }

    // Gratitude
    if (/thank|thanks/.test(msg)) {
      return pickRandom([
        "You are welcome, sir.",
        "No problem at all.",
        "Anytime.",
        "My pleasure."
      ]);
    }

    // Generic conversational responses
    return pickRandom([
      "I'm here if you need anything else.",
      "Interesting. Tell me more.",
      "I am listening, sir.",
      "How can I help you further?",
      "Go on, I'm listening."
    ]);
  }
};
