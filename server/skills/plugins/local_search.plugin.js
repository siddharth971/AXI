/**
 * Local File Content Search & RAG Plugin
 * ---------------------------------------
 * Deep local workspace searching by content keywords or file extensions.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { logger } = require("../../utils");

const BASE_DIR = path.join(__dirname, "../../../"); // Workspace root directory

/**
 * Recursively search directory for files matching query string
 */
function searchFilesRecursively(dir, query, maxResults = 5, depth = 0) {
  if (depth > 5) return []; // Prevent stack overflow or deep node_modules crawl
  let results = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (results.length >= maxResults) break;

      const fullPath = path.join(dir, entry.name);

      // Exclude heavy/irrelevant folders
      if (entry.isDirectory()) {
        if (["node_modules", ".git", ".vs", "dist", "build", ".angular"].includes(entry.name)) {
          continue;
        }
        const subResults = searchFilesRecursively(fullPath, query, maxResults - results.length, depth + 1);
        results = results.concat(subResults);
      } else if (entry.isFile()) {
        // Exclude large binary/minified files
        if (/\.(png|jpg|jpeg|gif|ico|pdf|zip|tar|gz|db|sqlite|bin)$/i.test(entry.name)) {
          continue;
        }

        try {
          const content = fs.readFileSync(fullPath, "utf8");
          const queryLower = query.toLowerCase();

          if (content.toLowerCase().includes(queryLower)) {
            const lines = content.split("\n");
            let lineNo = -1;
            let snippet = "";

            for (let i = 0; i < lines.length; i++) {
              if (lines[i].toLowerCase().includes(queryLower)) {
                lineNo = i + 1;
                snippet = lines[i].trim();
                break;
              }
            }

            const relativePath = path.relative(BASE_DIR, fullPath);
            results.push({ path: relativePath, fullPath, lineNo, snippet });
          }
        } catch (e) {
          // Ignore unreadable files
        }
      }
    }
  } catch (err) {
    // Ignore unreadable directories
  }

  return results;
}

module.exports = {
  name: "local_search",
  description: "Deep local workspace content search engine",

  intents: {
    "file.search_content": {
      confidence: 0.95,
      requiresConfirmation: false,
      handler: async (params) => {
        const query = params.query || params.keyword || params.text;
        if (!query) {
          return "Please specify a search term. Example: 'search code for decision engine'.";
        }

        logger.info(`[LocalSearch] Searching files for query: "${query}"...`);
        const matches = searchFilesRecursively(BASE_DIR, query, 5);

        if (matches.length === 0) {
          return `No local files found containing "${query}".`;
        }

        let reply = `Found ${matches.length} matching file(s) for "${query}":\n`;
        matches.forEach((m, idx) => {
          reply += `\n${idx + 1}. 📄 ${m.path} (Line ${m.lineNo})\n   Snippet: "${m.snippet.slice(0, 75)}"`;
        });

        return reply;
      },
    },

    "file.find_by_type": {
      confidence: 0.95,
      requiresConfirmation: false,
      handler: async (params) => {
        const ext = (params.ext || "md").replace(/^\./, "");
        logger.info(`[LocalSearch] Finding files of type: .${ext}...`);

        let matches = [];
        function crawlExt(dir, depth = 0) {
          if (depth > 4 || matches.length >= 8) return;
          try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
              if (matches.length >= 8) break;
              const fullPath = path.join(dir, entry.name);
              if (entry.isDirectory()) {
                if (!["node_modules", ".git", ".angular", "dist"].includes(entry.name)) {
                  crawlExt(fullPath, depth + 1);
                }
              } else if (entry.name.endsWith(`.${ext}`)) {
                matches.push(path.relative(BASE_DIR, fullPath));
              }
            }
          } catch (e) {}
        }

        crawlExt(BASE_DIR);

        if (matches.length === 0) {
          return `No .${ext} files found in workspace.`;
        }

        return `Found ${matches.length} .${ext} file(s):\n• ` + matches.join("\n• ");
      },
    },
  },
};
