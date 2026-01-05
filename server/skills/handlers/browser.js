/**
 * AXI Browser Skills
 * -------------------
 * Handles all browser-related actions:
 * - Opening websites
 * - YouTube operations
 * - Web searches
 */

const { exec } = require("child_process");
const config = require("../../config");
const { logger } = require("../../utils");

/**
 * Open YouTube homepage
 */
function openYoutube() {
  exec("start https://www.youtube.com");
  return "Opening YouTube, sir.";
}

/**
 * Search YouTube for a query
 * @param {string} query - Search query
 */
function searchYoutube(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  exec(`start ${url}`);
  return `Searching YouTube for "${query}", sir.`;
}

/**
 * Open a website by URL or name
 * @param {Object} params
 * @param {string} params.url - URL or site name
 */
function openWebsite({ url }) {
  if (!url) {
    return "Which website would you like me to open?";
  }

  let targetUrl = url;

  // Check if it's just a name (no dots or http)
  if (!url.includes(".") && !url.includes("http")) {
    const lowerName = url.toLowerCase().trim();

    if (config.SITE_MAP[lowerName]) {
      targetUrl = config.SITE_MAP[lowerName];
    } else {
      // Fallback: Google search
      targetUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      exec(`start ${targetUrl}`);
      logger.debug(`Google search fallback for: ${url}`);
      return `Searching Google for "${url}", sir.`;
    }
  } else if (!url.startsWith("http")) {
    targetUrl = "https://" + url;
  }

  exec(`start ${targetUrl}`);

  // Clean URL for display
  const displayUrl = targetUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `Opening ${displayUrl}, sir.`;
}

/**
 * Open any URL directly
 * @param {string} url - Full URL to open
 */
function openUrl(url) {
  exec(`start ${url}`);
  return `Opening link, sir.`;
}

module.exports = {
  openYoutube,
  searchYoutube,
  openWebsite,
  openUrl
};
