/**
 * Morning Briefing Trigger
 * ------------------------
 * Fires automatically at 8:00 AM (or strictly for demo purposes, can be set to always fire on startup once).
 */

const knowledgeLookup = require("../core/knowledge-lookup");

module.exports = {
  name: "Morning Briefing",

  lastRunDate: null, // Track by date string YYYY-MM-DD to run once per day

  async check(context) {
    const today = new Date().toISOString().split("T")[0];

    // Check if already ran today
    if (this.lastRunDate === today) return false;

    // DEMO: Always fire on first boot of the day
    return true;
  },

  async execute() {
    this.lastRunDate = new Date().toISOString().split("T")[0];

    // Get a quick fact or quote for the briefing
    const randomTopics = ["Science", "History", "Technology", "Space"];
    const topic = randomTopics[Math.floor(Math.random() * randomTopics.length)];

    let fact = "";
    try {
      const result = await knowledgeLookup.queryDuckDuckGo(
        `amazing fact about ${topic}`,
      );
      if (result.success) fact = result.answer;
    } catch (e) {
      // Ignore error
    }

    return `Good morning, Sir. All systems are online. Here is your daily fact about ${topic}: ${fact || "The sky is blue."}`;
  },
};
