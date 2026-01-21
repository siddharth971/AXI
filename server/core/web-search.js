/**
 * Live Web Search Service
 * -------------------------
 * Searches the web, explores websites, extracts content,
 * and provides comprehensive answers.
 *
 * No paid API keys required.
 */

const https = require("https");
const http = require("http");

// Configuration
const CONFIG = {
  TIMEOUT_MS: 10000,
  MAX_RESULTS: 3,
  MAX_CONTENT_LENGTH: 500,
  USER_AGENT:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 AXI-WebSearch/1.0",
};

/**
 * Make HTTP GET request with proper headers
 */
function httpGet(url, followRedirects = 3) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === "https:" ? https : http;

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: "GET",
      timeout: CONFIG.TIMEOUT_MS,
      headers: {
        "User-Agent": CONFIG.USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    };

    const req = protocol.request(options, (res) => {
      // Handle redirects
      if (
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location &&
        followRedirects > 0
      ) {
        const redirectUrl = new URL(res.headers.location, url).href;
        return httpGet(redirectUrl, followRedirects - 1)
          .then(resolve)
          .catch(reject);
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

    req.end();
  });
}

/**
 * Search using DuckDuckGo HTML or fallback to Wikipedia direct
 */
async function searchWeb(query) {
  try {
    // First try DuckDuckGo
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const html = await httpGet(searchUrl);

    // Extract search results from HTML
    const results = [];

    // Try multiple patterns for DuckDuckGo results
    const patterns = [
      /<a rel="nofollow" class="result__a" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
      /<a class="result__a" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
      /href="\/\/duckduckgo\.com\/l\/\?uddg=([^&"]+)[^"]*"[^>]*>([\s\S]*?)<\/a>/gi,
    ];

    for (const resultRegex of patterns) {
      let match;
      while (
        (match = resultRegex.exec(html)) !== null &&
        results.length < CONFIG.MAX_RESULTS
      ) {
        let href = match[1];
        const title = match[2].replace(/<[^>]+>/g, "").trim();

        // Decode URL if it's a DDG redirect
        if (href.includes("uddg=")) {
          const uddgMatch = /uddg=([^&]+)/.exec(href);
          if (uddgMatch) {
            href = decodeURIComponent(uddgMatch[1]);
          }
        } else if (href.startsWith("//")) {
          href = "https:" + href;
        }

        // Skip DuckDuckGo internal links
        if (href && !href.includes("duckduckgo.com") && title.length > 3) {
          results.push({
            url: href,
            title: title,
            snippet: "",
          });
        }
      }
      if (results.length > 0) break;
    }

    // If still no results, return empty array (no Wikipedia fallback)
    if (results.length === 0) {
      console.log("[WebSearch] No results found.");
    }

    return results;
  } catch (error) {
    console.error("[WebSearch] Search error:", error.message);
    return [];
  }
}

/**
 * Extract main content from a webpage
 */
async function extractContent(url) {
  try {
    const html = await httpGet(url);

    // Remove scripts, styles, and other non-content
    let content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "");

    // Extract paragraphs
    const paragraphs = [];
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let match;

    while ((match = pRegex.exec(content)) !== null && paragraphs.length < 5) {
      const text = match[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Only include meaningful paragraphs
      if (
        text.length > 50 &&
        !text.includes("{") &&
        !text.includes("function")
      ) {
        paragraphs.push(text);
      }
    }

    // Extract headings for context
    const headings = [];
    const hRegex = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;

    while ((match = hRegex.exec(content)) !== null && headings.length < 3) {
      const text = match[1].replace(/<[^>]+>/g, "").trim();
      if (text.length > 3 && text.length < 100) {
        headings.push(text);
      }
    }

    return {
      success: true,
      headings,
      paragraphs,
      summary: paragraphs
        .slice(0, 2)
        .join(" ")
        .substring(0, CONFIG.MAX_CONTENT_LENGTH),
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Search, explore, and extract comprehensive answer
 * @param {string} query - User's question
 * @returns {Promise<object>} Comprehensive answer
 */
async function searchAndExtract(query) {
  console.log(`[WebSearch] Searching for: ${query}`);

  // Step 1: Search the web
  const searchResults = await searchWeb(query);

  if (searchResults.length === 0) {
    return {
      success: false,
      error: "No search results found",
    };
  }

  console.log(
    `[WebSearch] Found ${searchResults.length} results, exploring...`,
  );

  // Step 2: Extract content from top results (in parallel)
  const extractionPromises = searchResults.slice(0, 2).map(async (result) => {
    const extracted = await extractContent(result.url);
    return {
      ...result,
      extracted,
    };
  });

  const exploredResults = await Promise.all(extractionPromises);

  // Step 3: Combine and summarize
  const validResults = exploredResults.filter((r) => r.extracted.success);

  if (validResults.length === 0) {
    // Fallback to snippets from search results
    const snippetAnswer = searchResults
      .map((r) => r.snippet)
      .filter((s) => s.length > 20)
      .join(" ")
      .substring(0, 400);

    return {
      success: true,
      answer: snippetAnswer || "Found results but could not extract content.",
      sources: searchResults.map((r) => ({ title: r.title, url: r.url })),
      method: "snippets",
    };
  }

  // Combine content from explored pages
  let combinedContent = "";
  const sources = [];

  for (const result of validResults) {
    if (result.extracted.summary) {
      combinedContent += result.extracted.summary + " ";
    }
    sources.push({ title: result.title, url: result.url });
  }

  // Trim to reasonable length for voice output
  let answer = combinedContent.trim();
  if (answer.length > 500) {
    answer = answer.substring(0, 500).replace(/\s+\S*$/, "") + "...";
  }

  return {
    success: true,
    answer,
    sources,
    method: "extraction",
  };
}

module.exports = {
  searchWeb,
  extractContent,
  searchAndExtract,
  CONFIG,
};
