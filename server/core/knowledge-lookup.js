/**
 * Knowledge Lookup Service
 * -------------------------
 * Real-time knowledge fetching from free sources:
 * - Wikipedia API (no key required)
 * - DuckDuckGo Instant Answers (no key required)
 *
 * No external paid APIs required.
 */

const https = require("https");
const http = require("http");

// Configuration
const CONFIG = {
  TIMEOUT_MS: 8000,
  WIKIPEDIA_API: "https://en.wikipedia.org/api/rest_v1/page/summary/",
  WIKIPEDIA_SEARCH: "https://en.wikipedia.org/w/api.php",
  DUCKDUCKGO_API: "https://api.duckduckgo.com/",
};

/**
 * Make HTTP GET request
 */
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;

    const req = protocol.get(url, { timeout: CONFIG.TIMEOUT_MS }, (res) => {
      // Handle redirects
      if (
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        return httpGet(res.headers.location).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

/**
 * Search Wikipedia and get summary
 * @param {string} query - Search query
 * @returns {Promise<object>} Search result
 */
async function searchWikipedia(query) {
  try {
    // Clean and encode the query
    const cleanQuery = query.trim().replace(/\s+/g, "_");
    const url = `${CONFIG.WIKIPEDIA_API}${encodeURIComponent(cleanQuery)}`;

    const data = await httpGet(url);
    const result = JSON.parse(data);

    if (result.type === "standard" && result.extract) {
      return {
        success: true,
        title: result.title,
        summary: result.extract,
        source: "Wikipedia",
        url: result.content_urls?.desktop?.page || null,
      };
    }

    // If direct match fails, try search
    return await searchWikipediaFallback(query);
  } catch (error) {
    // Try search as fallback
    return await searchWikipediaFallback(query);
  }
}

/**
 * Wikipedia search fallback
 */
async function searchWikipediaFallback(query) {
  try {
    const searchUrl = `${CONFIG.WIKIPEDIA_SEARCH}?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=1`;

    const data = await httpGet(searchUrl);
    const result = JSON.parse(data);

    if (result.query?.search?.length > 0) {
      const title = result.query.search[0].title;
      // Now get the summary for this title
      return await searchWikipedia(title);
    }

    return { success: false, error: "No results found" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Query DuckDuckGo Instant Answers
 * @param {string} query - Search query
 * @returns {Promise<object>} Answer result
 */
async function queryDuckDuckGo(query) {
  try {
    const url = `${CONFIG.DUCKDUCKGO_API}?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;

    const data = await httpGet(url);
    const result = JSON.parse(data);

    // DuckDuckGo returns different types of answers
    if (result.AbstractText) {
      return {
        success: true,
        answer: result.AbstractText,
        source: result.AbstractSource || "DuckDuckGo",
        url: result.AbstractURL || null,
      };
    }

    if (result.Answer) {
      return {
        success: true,
        answer: result.Answer,
        source: "DuckDuckGo",
        type: "instant",
      };
    }

    // Check for related topics
    if (result.RelatedTopics?.length > 0 && result.RelatedTopics[0].Text) {
      return {
        success: true,
        answer: result.RelatedTopics[0].Text,
        source: "DuckDuckGo",
        type: "related",
      };
    }

    return { success: false, error: "No instant answer available" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Main knowledge lookup - tries multiple sources
 * @param {string} query - User's question
 * @returns {Promise<object>} Knowledge result
 */
async function lookup(query) {
  // Detect query type
  const isDefinition = /^(what is|who is|define|meaning of)/i.test(query);
  const isFact = /^(when|where|how many|how much|how old)/i.test(query);

  // Clean up the query for search
  let searchQuery = query
    .replace(
      /^(what is|who is|what are|tell me about|define|explain|meaning of)\s*/i,
      "",
    )
    .replace(/\?+$/, "")
    .trim();

  if (!searchQuery || searchQuery.length < 2) {
    return { success: false, error: "Query too short" };
  }

  // Try DuckDuckGo first for quick answers
  const ddgResult = await queryDuckDuckGo(searchQuery);
  if (ddgResult.success) {
    return {
      success: true,
      answer: ddgResult.answer,
      source: ddgResult.source,
      type: "instant",
    };
  }

  // Wikipedia lookup disabled by user request
  // return { success: false, error: "No info found (Wikipedia disabled)" };

  return {
    success: false,
    error: "Could not find information on that topic.",
  };
}

/**
 * Check if a query looks like a factual question
 */
function isFactualQuestion(text) {
  const patterns = [
    /^what (is|are|was|were)\b/i,
    /^who (is|are|was|were)\b/i,
    /^when (is|did|was|were)\b/i,
    /^where (is|did|was|were)\b/i,
    /^how (many|much|old|tall|big|long)\b/i,
    /^define\b/i,
    /^meaning of\b/i,
    /^tell me about\b/i,
    /^explain\b/i,
  ];

  return patterns.some((pattern) => pattern.test(text.trim()));
}

module.exports = {
  lookup,
  searchWikipedia,
  queryDuckDuckGo,
  isFactualQuestion,
  CONFIG,
};
