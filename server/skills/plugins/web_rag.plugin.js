/**
 * Ultra-Powerful Real-Time Web RAG & Multi-Source Knowledge Summarizer
 * ---------------------------------------------------------------------
 * Features: Multi-source fallback (DuckDuckGo Instant API + Wikipedia REST API + HTML RAG),
 * TTL Caching, Bullet-Point Summarization, and Source Citations.
 */

"use strict";

const https = require("https");
const http = require("http");
const { logger } = require("../../utils");

// In-Memory RAG Query Cache (TTL: 1 Hour)
const RAG_CACHE = new Map();
const CACHE_TTL_MS = 3600 * 1000;

/**
 * Perform lightweight HTTP/HTTPS GET request
 */
function fetchUrlContent(url) {
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AXI-RAG-Engine/2.0" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });
    req.on("error", () => resolve(""));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve("");
    });
  });
}

/**
 * Strip HTML tags and extract readable text
 */
function cleanHtml(html) {
  if (!html) return "";
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

/**
 * Query DuckDuckGo Instant Answer API
 */
async function queryDuckDuckGoAPI(query) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const jsonStr = await fetchUrlContent(url);
    if (!jsonStr) return null;
    const data = JSON.parse(jsonStr);

    if (data.AbstractText && data.AbstractText.length > 20) {
      return {
        summary: data.AbstractText,
        source: data.AbstractSource || "DuckDuckGo Knowledge Graph",
        url: data.AbstractURL || "https://duckduckgo.com",
      };
    }
  } catch (e) {
    return null;
  }
  return null;
}

/**
 * Query Wikipedia Summary REST API
 */
async function queryWikipediaAPI(query) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    const jsonStr = await fetchUrlContent(url);
    if (!jsonStr) return null;
    const data = JSON.parse(jsonStr);

    if (data.extract && data.type !== "disambiguation" && data.extract.length > 30) {
      return {
        summary: data.extract,
        source: "Wikipedia Encyclopedia",
        url: data.content_urls?.desktop?.page || "https://wikipedia.org",
      };
    }
  } catch (e) {
    return null;
  }
  return null;
}

/**
 * Query HTML Web Search RAG Fallback
 */
async function queryHTMLWebSearch(query) {
  try {
    const targetUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const rawHtml = await fetchUrlContent(targetUrl);
    const textContent = cleanHtml(rawHtml);

    if (textContent && textContent.length > 80) {
      const sentences = textContent
        .split(/(?<=[.!?])\s+/)
        .filter((s) => s.length > 30 && !s.includes("DuckDuckGo") && !s.includes("JavaScript"))
        .slice(0, 3);

      if (sentences.length > 0) {
        return {
          summary: sentences.join(" "),
          source: "Live Web Crawler",
          url: "https://duckduckgo.com",
        };
      }
    }
  } catch (e) {
    return null;
  }
  return null;
}

module.exports = {
  name: "web_rag",
  description: "Ultra-Powerful Multi-Source Real-Time Web RAG & Knowledge Summarizer",

  intents: {
    "knowledge.web_rag": {
      confidence: 0.95,
      requiresConfirmation: false,
      handler: async (params) => {
        const query = params.query || params.keyword || params.text;
        if (!query) {
          return "Please specify what you would like me to search on the web.";
        }

        const cacheKey = query.toLowerCase().trim();

        // 1. Check TTL Cache
        if (RAG_CACHE.has(cacheKey)) {
          const cached = RAG_CACHE.get(cacheKey);
          if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
            logger.info(`⚡ [Web RAG Cache Hit] Query: "${query}"`);
            return cached.response;
          }
        }

        logger.info(`🌐 [Web RAG Pipeline] Initiating multi-source search for: "${query}"...`);

        // 2. Step-by-Step RAG Fallback Chain
        let result = await queryDuckDuckGoAPI(query);

        if (!result) {
          result = await queryWikipediaAPI(query);
        }

        if (!result) {
          result = await queryHTMLWebSearch(query);
        }

        if (!result) {
          return `I searched multiple web sources for "${query}", but no reliable live summary was found.`;
        }

        // 3. Format Bullet Points & Source Citations
        const sentences = result.summary.split(/(?<=[.!?])\s+/).filter((s) => s.length > 15);
        let bulletPoints = sentences.map((s) => `• ${s.trim()}`).join("\n");

        const responseText = `🌐 **Live Web Knowledge Summary for "${query}"**:\n${bulletPoints}\n\n📍 *Source*: ${result.source} (${result.url})`;

        // 4. Update Cache
        RAG_CACHE.set(cacheKey, { response: responseText, timestamp: Date.now() });

        return responseText;
      },
    },
  },
};
