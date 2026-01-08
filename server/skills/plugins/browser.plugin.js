/**
 * Browser Plugin
 * ---------------
 * Handles all browser-related operations:
 * - Opening websites and URLs
 * - Tab management
 * - Page navigation
 * - Web screenshots
 */

"use strict";

const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

// Site name to URL mappings
const SITE_MAP = {
  google: "https://google.com",
  youtube: "https://youtube.com",
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  twitter: "https://twitter.com",
  x: "https://x.com",
  linkedin: "https://linkedin.com",
  amazon: "https://amazon.in",
  flipkart: "https://flipkart.com",
  netflix: "https://netflix.com",
  github: "https://github.com",
  stackoverflow: "https://stackoverflow.com",
  reddit: "https://reddit.com",
  spotify: "https://open.spotify.com",
  gmail: "https://mail.google.com",
  drive: "https://drive.google.com",
  maps: "https://maps.google.com",
  wikipedia: "https://wikipedia.org",
  chatgpt: "https://chat.openai.com",
  claude: "https://claude.ai"
};

/**
 * Open URL in default browser (Windows)
 * @param {string} url - URL to open
 * @returns {Promise<void>}
 */
async function openBrowserUrl(url) {
  await execAsync(`start "" "${url}"`);
}

/**
 * Resolve site name or URL to full URL
 * @param {string} input - Site name or URL
 * @returns {string} Full URL
 */
function resolveUrl(input) {
  if (!input) return null;

  const normalized = input.toLowerCase().trim();

  // Check site map first
  if (SITE_MAP[normalized]) {
    return SITE_MAP[normalized];
  }

  // Already a URL
  if (input.includes(".") || input.startsWith("http")) {
    return input.startsWith("http") ? input : `https://${input}`;
  }

  // Fallback to Google search
  return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
}

/**
 * Get display-friendly URL
 * @param {string} url - Full URL
 * @returns {string} Cleaned URL for display
 */
function getDisplayUrl(url) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

module.exports = {
  name: "browser",
  description: "Browser control and web navigation operations",

  intents: {
    open_website: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const url = params.url || params.site || params.query;

        if (!url) {
          return "Which website would you like me to open?";
        }

        const targetUrl = resolveUrl(url);
        const isSearch = targetUrl.includes("google.com/search");

        await openBrowserUrl(targetUrl);

        if (isSearch) {
          return `Searching Google for "${url}", sir.`;
        }

        return `Opening ${getDisplayUrl(targetUrl)}, sir.`;
      }
    },

    open_youtube: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        await openBrowserUrl("https://www.youtube.com");
        return "Opening YouTube, sir.";
      }
    },

    search_youtube: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const query = params.query || params.search || "";

        if (!query) {
          return "What would you like me to search on YouTube?";
        }

        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        await openBrowserUrl(url);

        return `Searching YouTube for "${query}", sir.`;
      }
    },

    open_incognito: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const url = params.url ? resolveUrl(params.url) : "";

        try {
          // Try Chrome first
          if (url) {
            await execAsync(`start chrome --incognito "${url}"`);
            return `Opening ${getDisplayUrl(url)} in incognito mode, sir.`;
          } else {
            await execAsync("start chrome --incognito");
            return "Opening an incognito window, sir.";
          }
        } catch {
          try {
            // Fallback to Edge
            if (url) {
              await execAsync(`start msedge --inprivate "${url}"`);
              return `Opening ${getDisplayUrl(url)} in private mode, sir.`;
            } else {
              await execAsync("start msedge --inprivate");
              return "Opening an InPrivate window, sir.";
            }
          } catch {
            return "I couldn't open an incognito window. Please ensure Chrome or Edge is installed.";
          }
        }
      }
    },

    close_tab: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        try {
          // Send Ctrl+W to close current tab using PowerShell
          const script = `
            Add-Type -AssemblyName System.Windows.Forms
            [System.Windows.Forms.SendKeys]::SendWait("^w")
          `;
          await execAsync(`powershell -Command "${script.replace(/\n/g, " ")}"`);
          return "Closing the current tab, sir.";
        } catch {
          return "I couldn't close the tab. Please try manually pressing Ctrl+W.";
        }
      }
    },

    refresh_page: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        try {
          const script = `
            Add-Type -AssemblyName System.Windows.Forms
            [System.Windows.Forms.SendKeys]::SendWait("{F5}")
          `;
          await execAsync(`powershell -Command "${script.replace(/\n/g, " ")}"`);
          return "Refreshing the page, sir.";
        } catch {
          return "I couldn't refresh the page. Please try pressing F5.";
        }
      }
    },

    scroll_page: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const direction = (params.direction || "down").toLowerCase();
        const key = direction === "up" ? "{PGUP}" : "{PGDN}";

        try {
          const script = `
            Add-Type -AssemblyName System.Windows.Forms
            [System.Windows.Forms.SendKeys]::SendWait("${key}")
          `;
          await execAsync(`powershell -Command "${script.replace(/\n/g, " ")}"`);
          return `Scrolling ${direction}, sir.`;
        } catch {
          return `I couldn't scroll ${direction}. Please try using Page Up/Down keys.`;
        }
      }
    },

    take_web_screenshot: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        // This delegates to system screenshot as web-specific screenshot
        // requires more complex browser automation
        try {
          const screenshot = require("screenshot-desktop");
          const path = require("path");
          const fs = require("fs");

          const screenshotsDir = path.join(__dirname, "../../screenshots");
          if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
          }

          const filename = `web-screenshot-${Date.now()}.png`;
          const filepath = path.join(screenshotsDir, filename);

          await screenshot({ filename: filepath });
          return `Web screenshot saved as ${filename}, sir.`;
        } catch {
          return "I couldn't capture the web screenshot. Please try again.";
        }
      }
    },

    ask_which_website: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        context.memory.setAwaiting("ask_website_name", null, context.sessionId);
        return "Which website should I open, sir?";
      }
    },

    google_search: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const query = params.query || params.search || "";

        if (!query) {
          return "What would you like me to search for?";
        }

        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        await openBrowserUrl(url);

        return `Searching Google for "${query}", sir.`;
      }
    }
  }
};
