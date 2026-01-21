const fs = require("fs");
const path = require("path");

// Configuration - Sharded Input
const BLUEPRINTS_DIR = path.join(__dirname, "../autonomous/output/blueprints");
const INDEX_PATH = path.join(__dirname, "../autonomous/output/index.json");
// Legacy fallback
const LEGACY_BLUEPRINTS_PATH = path.join(
  __dirname,
  "../autonomous/output/website_blueprints.json",
);

const OUTPUT_INTENTS_PATH = path.join(
  __dirname,
  "./intents/autonomous_learned.json",
);
const OUTPUT_CONTENT_PATH = path.join(
  __dirname,
  "./knowledge/learned_content.json",
);

// Colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
};

console.log(
  `${colors.cyan}🧠 AXI Autonomous Learning Module Initialized...${colors.reset}`,
);

/**
 * Load blueprints from sharded directory or legacy single file
 */
function loadBlueprints() {
  // Try sharded mode first
  if (fs.existsSync(INDEX_PATH) && fs.existsSync(BLUEPRINTS_DIR)) {
    console.log(
      `${colors.yellow}📂 Loading from sharded blueprints...${colors.reset}`,
    );

    const index = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
    const blueprints = [];

    for (const entry of index.blueprints) {
      const filepath = path.join(__dirname, "../autonomous/output", entry.file);
      if (fs.existsSync(filepath)) {
        try {
          const bp = JSON.parse(fs.readFileSync(filepath, "utf8"));
          blueprints.push(bp);
        } catch (e) {
          console.error(`   ⚠️ Failed to load ${entry.file}`);
        }
      }
    }

    return blueprints;
  }

  // Fallback to legacy single file
  if (fs.existsSync(LEGACY_BLUEPRINTS_PATH)) {
    console.log(
      `${colors.yellow}📄 Loading from legacy blueprints file...${colors.reset}`,
    );
    return JSON.parse(fs.readFileSync(LEGACY_BLUEPRINTS_PATH, "utf8"));
  }

  return null;
}

function learnFromBlueprints() {
  const blueprints = loadBlueprints();

  if (!blueprints || blueprints.length === 0) {
    console.error(
      `${colors.red}❌ No blueprints found. Run 'npm run axi:explore' first.${colors.reset}`,
    );
    return;
  }

  console.log(
    `${colors.yellow}🔍 Analyzing ${blueprints.length} blueprints for knowledge extraction...${colors.reset}`,
  );

  const learnedIntents = [];
  const learnedContent = {};
  let totalUtterances = 0;

  blueprints.forEach((site) => {
    const config = site.global_configuration;
    const brand = config.brand_name || config.domain;
    const cleanBrand = brand.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    if (!cleanBrand) return;

    const intentName = `knowledge.dynamic.${cleanBrand}`;
    const utterances = new Set();

    // Basic Brand Queries
    utterances.add(`What is ${brand}?`);
    utterances.add(`Tell me about ${brand}`);
    utterances.add(`Who is ${brand}?`);
    utterances.add(`Give me information on ${brand}`);
    utterances.add(`Do you know ${brand}?`);
    utterances.add(`${brand} website info`);
    utterances.add(`details for ${config.domain}`);

    // Infrastructure Queries
    if (config.infrastructure) {
      if (config.infrastructure.server_ip) {
        utterances.add(`What is the IP of ${brand}?`);
        utterances.add(`${brand} server address`);
      }
      if (
        config.infrastructure.hosting_provider &&
        config.infrastructure.hosting_provider !== "Unknown"
      ) {
        utterances.add(`Who hosts ${brand}?`);
        utterances.add(`Where is ${brand} hosted?`);
      }
    }

    // Deep Content Queries (from main_content headers)
    const contentSummary = [];

    site.site_routes_and_content.forEach((route) => {
      if (
        route.page_content &&
        Array.isArray(route.page_content.main_content)
      ) {
        route.page_content.main_content.forEach((block) => {
          if (block.tag && block.tag.startsWith("h") && block.text) {
            const text = block.text.replace(/[^\w\s]/gi, "").trim();
            if (text.length > 5 && text.length < 50) {
              utterances.add(`What does ${brand} say about ${text}?`);
              utterances.add(`Explain ${text} on ${brand}`);
              utterances.add(`${brand} ${text}`);
            }
          }
          if (block.text && block.text.length > 20) {
            contentSummary.push(block.text);
          }
        });
      }
    });

    // Store knowledge content
    learnedContent[intentName] = {
      brand: brand,
      domain: config.domain,
      description:
        site.global_configuration.description || "No description available.",
      hosting: config.infrastructure.hosting_provider,
      ip: config.infrastructure.server_ip,
      summary: contentSummary.slice(0, 5).join("\n\n"),
    };

    if (utterances.size > 0) {
      learnedIntents.push({
        intent: intentName,
        utterances: Array.from(utterances),
      });
      totalUtterances += utterances.size;
      console.log(
        `   ✅ Learned ${utterances.size} knowledge points for [${brand}]`,
      );
    }
  });

  // Save outputs
  if (learnedIntents.length > 0) {
    fs.writeFileSync(
      OUTPUT_INTENTS_PATH,
      JSON.stringify(learnedIntents, null, 2),
    );
    fs.writeFileSync(
      OUTPUT_CONTENT_PATH,
      JSON.stringify(learnedContent, null, 2),
    );

    console.log(
      `\n${colors.green}✨ Learning Complete! generated ${learnedIntents.length} new intent clusters with ${totalUtterances} samples.${colors.reset}`,
    );
    console.log(
      `${colors.gray}📁 Saved intents to: ${OUTPUT_INTENTS_PATH}${colors.reset}`,
    );
    console.log(
      `${colors.gray}📁 Saved content map to: ${OUTPUT_CONTENT_PATH}${colors.reset}`,
    );
    console.log(
      `${colors.cyan}🚀 You can now run 'npm run train' to integrate this knowledge into the Neural Network.${colors.reset}`,
    );
  } else {
    console.log(
      `${colors.yellow}⚠️ No learnable patterns found in blueprints.${colors.reset}`,
    );
  }
}

learnFromBlueprints();
