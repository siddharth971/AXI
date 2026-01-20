const fs = require("fs");
const path = require("path");

// Configuration
const BLUEPRINTS_PATH = path.join(
  __dirname,
  "../autonomous/output/website_blueprints.json",
);
const OUTPUT_INTENTS_PATH = path.join(
  __dirname,
  "./intents/autonomous_learned.json",
);

// Colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

console.log(
  `${colors.cyan}🧠 AXI Autonomous Learning Module Initialized...${colors.reset}`,
);

function learnFromBlueprints() {
  if (!fs.existsSync(BLUEPRINTS_PATH)) {
    console.error(
      `${colors.red}❌ No blueprints found at ${BLUEPRINTS_PATH}. Run 'npm run axi:explore' first.${colors.reset}`,
    );
    return;
  }

  let blueprints;
  try {
    blueprints = JSON.parse(fs.readFileSync(BLUEPRINTS_PATH, "utf8"));
  } catch (err) {
    console.error(
      `${colors.red}❌ Failed to parse blueprints: ${err.message}${colors.reset}`,
    );
    return;
  }

  console.log(
    `${colors.yellow}🔍 Analyzing ${blueprints.length} blueprints for knowledge extraction...${colors.reset}`,
  );

  const learnedIntents = [];
  let totalUtterances = 0;

  blueprints.forEach((site) => {
    const config = site.global_configuration;
    const brand = config.brand_name || config.domain;
    const cleanBrand = brand.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    if (!cleanBrand) return;

    // 1. Create a specific intent for this domain/brand
    // We categorize it under 'knowledge.website' typically, but to make it "Learned",
    // we create a specific entry that the classifier can pick up.
    // However, to avoid exploding the output layer with dynamic classes,
    // we might map to a generic "knowledge.query" and train the NET to recognize the entities.
    // FOR THIS DEMO: We will generate specific intents to demonstrate distinct learning.

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
    site.site_routes_and_content.forEach((route) => {
      if (
        route.page_content &&
        Array.isArray(route.page_content.main_content)
      ) {
        route.page_content.main_content.forEach((block) => {
          // Heuristic: If it's a heading, turn it into a question.
          if (block.tag && block.tag.startsWith("h") && block.text) {
            const text = block.text.replace(/[^\w\s]/gi, "").trim();
            if (text.length > 5 && text.length < 50) {
              utterances.add(`What does ${brand} say about ${text}?`);
              utterances.add(`Explain ${text} on ${brand}`);
              utterances.add(`${brand} ${text}`);
            }
          }
        });
      }
    });

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

  // Save the learned knowledge to the NLP intents directory
  if (learnedIntents.length > 0) {
    fs.writeFileSync(
      OUTPUT_INTENTS_PATH,
      JSON.stringify(learnedIntents, null, 2),
    );
    console.log(
      `\n${colors.green}✨ Learning Complete! generated ${learnedIntents.length} new intent clusters with ${totalUtterances} samples.${colors.reset}`,
    );
    console.log(
      `${colors.gray}📁 Saved to: ${OUTPUT_INTENTS_PATH}${colors.reset}`,
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
