/**
 * Knowledge Handler
 * -----------------
 * Handles "knowledge:*" intents by looking up autonomous blueprints
 * and summarizing the website content for the user.
 */

const fs = require("fs");
const path = require("path");
const { logger } = require("../utils");

const BLUEPRINTS_DIR = path.join(__dirname, "../autonomous/output/blueprints");
const SCREENSHOTS_DIR = path.join(__dirname, "../screenshots");

/**
 * Handle a knowledge intent
 * @param {string} intent - The intent name (e.g. knowledge:flavor365_com)
 * @returns {string} - Response text
 */
function handle(intent) {
  try {
    const slug = intent.replace("knowledge:", "");

    // Find matching blueprint file
    // Strategy: The intent has replaced '.' with '_', so we need to valid permutations or scan.
    // E.g. "flavor365_com" -> match "flavor365.com.json"

    if (!fs.existsSync(BLUEPRINTS_DIR)) {
      return "I haven't explored that website yet.";
    }

    const files = fs.readdirSync(BLUEPRINTS_DIR);

    // Find file that matches the slug (ignoring dots/underscores difference)
    const match = files.find(f => {
      const dbFilename = f.replace(".json", "").replace(/\./g, "_");
      return dbFilename === slug;
    });

    if (!match) {
      return `I have general knowledge about this, but I can't find the specific blueprint database for ${slug}.`;
    }

    // Load blueprint
    const bpPath = path.join(BLUEPRINTS_DIR, match);
    const bp = JSON.parse(fs.readFileSync(bpPath, "utf-8"));

    return summarize(bp);

  } catch (error) {
    logger.error(`Knowledge Handler Error: ${error.message}`);
    return "I encountered an error retrieving that information.";
  }
}

/**
 * Summarize a blueprint
 */
function summarize(bp) {
  const config = bp.global_configuration || {};
  const brand = config.brand_name || config.domain;

  const structure = bp.site_routes_and_content?.[0] || {};
  const desc = structure.meta_seo?.description || "No description available.";
  const title = structure.meta_seo?.title || brand;

  // Extract key features if available
  const content = structure.page_content || {};
  let features = [];

  if (content.value_props && content.value_props.length > 0) {
    features = content.value_props.map(vp => vp.title).slice(0, 3);
  }

  // Construct response
  let response = `Here is what I know about **${brand}** (${config.domain}):\n\n`;
  response += `**${title}**\n`;
  if (desc && desc.length > 5) response += `"${desc}"\n\n`;

  if (features.length > 0) {
    response += `**Key Features:**\n`;
    features.forEach(f => response += `- ${f}\n`);
    response += `\n`;
  }

  const fileCount = bp.file_system_inventory?.summary?.total_files || 0;
  response += `*I have analyzed ${fileCount} assets and ${bp.site_routes_and_content?.length || 1} pages on this site.*`;

  return response;
}

/**
 * List all available knowledge blueprints
 */
function list() {
  if (!fs.existsSync(BLUEPRINTS_DIR)) return [];

  try {
    const files = fs.readdirSync(BLUEPRINTS_DIR).filter(f => f.endsWith(".json"));

    return files.map(file => {
      try {
        const content = fs.readFileSync(path.join(BLUEPRINTS_DIR, file), "utf-8");
        const bp = JSON.parse(content);
        const domain = bp.global_configuration?.domain || file.replace(".json", "");

        let screenshot = null;
        if (fs.existsSync(path.join(SCREENSHOTS_DIR, `${domain}.png`))) {
          screenshot = `http://localhost:5000/screenshots/${domain}.png`;
        }

        return {
          id: bp.website_blueprint_id,
          domain: domain,
          brand: bp.global_configuration?.brand_name || "Unknown",
          generated_at: bp.generated_at,
          file: file,
          image: screenshot
        };
      } catch (e) {
        return null;
      }
    }).filter(Boolean).sort((a, b) => new Date(b.generated_at) - new Date(a.generated_at));
  } catch (err) {
    logger.error(`Failed to list blueprints: ${err.message}`);
    return [];
  }
}

module.exports = { handle, list };
