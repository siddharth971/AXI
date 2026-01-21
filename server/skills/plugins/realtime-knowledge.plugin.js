/**
 * Real-Time Knowledge Plugin
 * ---------------------------
 * Answers factual questions using:
 * - Wikipedia API
 * - DuckDuckGo Instant Answers
 * - Live Web Search + Content Extraction
 *
 * No paid API keys required.
 */

const knowledgeLookup = require("../../core/knowledge-lookup");
const webSearch = require("../../core/web-search");

module.exports = {
  name: "realtime_knowledge",
  description: "Real-time knowledge lookup with web search and extraction",

  intents: {
    // Deep web search and extract
    "knowledge.web_search": {
      confidence: 0.7,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const query = params.query || params.text || params.topic || "";

        if (!query || query.length < 2) {
          return "What would you like me to search for?";
        }

        try {
          console.log(`[Knowledge] Deep web search for: ${query}`);
          const result = await webSearch.searchAndExtract(query);

          if (result.success && result.answer) {
            let response = result.answer;

            // Add source info
            if (result.sources && result.sources.length > 0) {
              response += ` (Source: ${result.sources[0].title})`;
            }

            return response;
          } else {
          } else {
            return `I couldn't find detailed information about "${query}".`;
          }
    } catch(error) {
      console.error("[Knowledge Plugin] Web search error:", error.message);
      return "I had trouble searching the web. Please try again.";
    }
  },
},

  // Generic knowledge lookup (Web Search primary)
  "knowledge.lookup": {
  confidence: 0.6,
    requiresConfirmation: false,
      handler: async (params, context) => {
        const query = params.query || params.text || params.topic || "";

        if (!query || query.length < 2) {
          return "What would you like to know about?";
        }

        try {
          // Use Deep Web Search directly
          const webResult = await webSearch.searchAndExtract(query);
          if (webResult.success) {
            return webResult.answer;
          }

          // DuckDuckGo fallback
          const ddgResult = await knowledgeLookup.queryDuckDuckGo(query);
          if (ddgResult.success) {
            return ddgResult.answer;
          }

          return `I couldn't find information about "${query}".`;
        } catch (error) {
          console.error("[Knowledge Plugin] Error:", error.message);
          return "I had trouble looking that up. Please try again.";
        }
      },
    },

// "What is X" - uses web search
"knowledge.what_is": {
  confidence: 0.7,
    requiresConfirmation: false,
      handler: async (params, context) => {
        const topic = params.topic || params.query || "";

        if (!topic) {
          return "What would you like me to explain?";
        }

        // Deep web search
        console.log(`[Knowledge] Searching web for: ${topic}`);
        const webResult = await webSearch.searchAndExtract(`what is ${topic}`);
        if (webResult.success) {
          return webResult.answer;
        }

        // DuckDuckGo fallback
        const ddgResult = await knowledgeLookup.queryDuckDuckGo(topic);
        if (ddgResult.success) {
          return ddgResult.answer;
        }

        return `I don't have information about ${topic}.`;
      },
    },

// "Who is X" - uses web search
"knowledge.who_is": {
  confidence: 0.7,
    requiresConfirmation: false,
      handler: async (params, context) => {
        const person = params.person || params.query || "";

        if (!person) {
          return "Who would you like to know about?";
        }

        // Web search
        const webResult = await webSearch.searchAndExtract(`who is ${person}`);
        if (webResult.success) {
          return webResult.answer;
        }

        // DuckDuckGo fallback
        const ddgResult = await knowledgeLookup.queryDuckDuckGo(person);
        if (ddgResult.success) {
          return ddgResult.answer;
        }

        return `I couldn't find information about ${person}.`;
      },
    },

// Quick facts
"knowledge.quick_fact": {
  confidence: 0.6,
    requiresConfirmation: false,
      handler: async (params, context) => {
        const query = params.query || params.text || "";

        const ddgResult = await knowledgeLookup.queryDuckDuckGo(query);
        if (ddgResult.success) {
          return ddgResult.answer;
        }

        const wikiResult = await knowledgeLookup.searchWikipedia(query);
        if (wikiResult.success) {
          return wikiResult.summary;
        }

        return "I don't have a quick answer for that.";
      },
    },
  },
};
