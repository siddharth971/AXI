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

// We no longer output to a monolith intent file.
const INTENTS_DIR = path.join(__dirname, "./intents");
const OUTPUT_CONTENT_PATH = path.join(__dirname, "./knowledge/learned_content.json");
const RULES_DIR = path.join(__dirname, "./rules");
const PLUGINS_DIR = path.join(__dirname, "../skills/plugins");
const HANDLERS_DIR = path.join(__dirname, "../skills/handlers");
const RESPONSES_DIR = path.join(HANDLERS_DIR, "responses");
const TESTS_DIR = path.join(__dirname, "../tests");

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
  `${colors.cyan}🧠 AXI Autonomous Code Generation Engine Initialized...${colors.reset}`,
);

/**
 * Load blueprints from sharded directory or legacy single file
 */
function loadBlueprints() {
  if (fs.existsSync(INDEX_PATH) && fs.existsSync(BLUEPRINTS_DIR)) {
    console.log(`${colors.yellow}📂 Loading from sharded blueprints...${colors.reset}`);
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
  if (fs.existsSync(LEGACY_BLUEPRINTS_PATH)) {
    console.log(`${colors.yellow}📄 Loading from legacy blueprints file...${colors.reset}`);
    return JSON.parse(fs.readFileSync(LEGACY_BLUEPRINTS_PATH, "utf8"));
  }
  return null;
}

// Scaffolding Generators
function scaffoldRule(cleanBrand, brand, intentName) {
  const code = `/**
 * Auto-generated Rule for ${brand}
 */
module.exports = function(text, nlu) {
  if (/\\b(${cleanBrand}|${brand.replace(/[^a-zA-Z0-9 ]/g, "").split(" ")[0]})\\b/i.test(text)) {
    return {
      intent: "${intentName}",
      confidence: 1.0,
      entities: { topic: "${brand}" }
    };
  }
  return null;
};
`;
  fs.writeFileSync(path.join(RULES_DIR, `auto_${cleanBrand}.js`), code);
}

function scaffoldPlugin(cleanBrand, brand, intentName) {
  const code = `/**
 * Auto-generated Plugin for ${brand}
 */
const responseHandler = require("../handlers/responses/auto_${cleanBrand}");

module.exports = {
  name: "auto_${cleanBrand}",
  description: "Autonomous handler for ${brand}",
  intents: {
    "${intentName}": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
`;
  fs.writeFileSync(path.join(PLUGINS_DIR, `auto_${cleanBrand}.plugin.js`), code);
}

function scaffoldResponse(cleanBrand, brand, summary) {
  const safeSummary = summary.replace(/`/g, "'").substring(0, 300);
  const code = `/**
 * Auto-generated Response logic for ${brand}
 */
module.exports = {
  reply() {
    return \`Here is the requested knowledge about **${brand}**:\\n\\n${safeSummary}...\`;
  }
};
`;
  fs.writeFileSync(path.join(RESPONSES_DIR, `auto_${cleanBrand}.js`), code);
}

function scaffoldHandler(cleanBrand, brand) {
  const code = `/**
 * Auto-generated Legacy Handler for ${brand}
 */
const responses = require("./responses/auto_${cleanBrand}");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
`;
  fs.writeFileSync(path.join(HANDLERS_DIR, `auto_${cleanBrand}.js`), code);
}

function scaffoldTest(cleanBrand, intentName) {
  const code = `/**
 * Auto-generated Test for ${cleanBrand}
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated ${cleanBrand} Intent", () => {
  it("should securely map to ${intentName} with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about ${cleanBrand} please");
    assert.strictEqual(res.intent, "${intentName}");
    assert.strictEqual(res.confidence, 1.0);
  });
});
`;
  if (!fs.existsSync(TESTS_DIR)) fs.mkdirSync(TESTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(TESTS_DIR, `auto_${cleanBrand}.test.js`), code);
}

function learnFromBlueprints() {
  const blueprints = loadBlueprints();

  if (!blueprints || blueprints.length === 0) {
    console.error(`${colors.red}❌ No blueprints found. Run 'npm run axi:explore' first.${colors.reset}`);
    return;
  }

  // Ensure directories exist
  [INTENTS_DIR, RULES_DIR, PLUGINS_DIR, RESPONSES_DIR, TESTS_DIR].forEach((d) => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  const nlp = require("./nlp.js"); // Evaluate context

  console.log(`${colors.yellow}🔍 Compiling code from ${blueprints.length} blueprints...${colors.reset}`);

  let learnedContent = {};
  if (fs.existsSync(OUTPUT_CONTENT_PATH)) {
    learnedContent = JSON.parse(fs.readFileSync(OUTPUT_CONTENT_PATH, "utf8"));
  }

  let totalUtterances = 0;
  let codeGenCount = 0;

  blueprints.forEach((site) => {
    const config = site.global_configuration;
    const brand = config.brand_name || config.domain;
    const cleanBrand = brand.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    if (!cleanBrand || cleanBrand.length < 3) return;

    const intentName = `knowledge.dynamic.${cleanBrand}`;
    const utterances = new Set();

    utterances.add(`What is ${brand}?`);
    utterances.add(`Tell me about ${brand}`);
    utterances.add(`Who is ${brand}?`);
    utterances.add(`give me information on ${brand}`);
    utterances.add(`details for ${config.domain}`);

    const contentSummary = [];

    site.site_routes_and_content.forEach((route) => {
      if (route.page_content && Array.isArray(route.page_content.main_content)) {
        route.page_content.main_content.forEach((block) => {
          if (block.text) {
            const text = block.text.replace(/[^\\w\\s]/gi, "").trim();
            if (text.length > 5 && text.length < 50) {
              utterances.add(`What does ${brand} say about ${text}?`);
              utterances.add(`${brand} ${text}`);
            }
          }
          if (block.text && block.text.length > 20) {
            contentSummary.push(block.text);
          }
        });
      }
    });

    const summaryStr = contentSummary.slice(0, 5).join("\\n");
    learnedContent[intentName] = {
      brand,
      domain: config.domain,
      description: site.global_configuration.description || "No description available.",
      summary: summaryStr
    };

    // AXI Context Evaluator Core Logic
    // We test pure brand to see if the engine natively knows the entity category
    const testMatch = nlp.interpretSync(brand);
    let matchedIntent = null;
    let mappedToFile = null;

    // We strictly demand a very high confidence (> 0.90) to prevent fallback intent mapping
    if (testMatch && testMatch.intent !== "none" && testMatch.confidence > 0.90) {
      if (!testMatch.intent.startsWith("knowledge.dynamic") && testMatch.intent !== "knowledge.what_is") {
        // High confidence match to an existing context intent
        matchedIntent = testMatch.intent;

        // Try to locate JSON intent file
        const intentFiles = fs.readdirSync(INTENTS_DIR).filter(f => f.endsWith(".json"));
        for (const file of intentFiles) {
          const filePath = path.join(INTENTS_DIR, file);
          try {
            const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
            const targetObj = data.find(i => i.intent === matchedIntent);
            
            if (targetObj) {
              Array.from(utterances).forEach(u => {
                if (!targetObj.utterances.includes(u)) targetObj.utterances.push(u);
              });
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
              mappedToFile = file;
              totalUtterances += utterances.size;
              break;
            }
          } catch(e) {}
        }
      }
    }

    if (mappedToFile) {
      console.log(`   ✅ Seamlessly mapped [${brand}] knowledge into existing module (${mappedToFile}) -> intent: ${matchedIntent}`);
    } else {
      // Scaffold completely new module!
      const newIntentFile = path.join(INTENTS_DIR, `auto_${cleanBrand}.json`);
      fs.writeFileSync(newIntentFile, JSON.stringify([{
        intent: intentName,
        utterances: Array.from(utterances)
      }], null, 2));
      totalUtterances += utterances.size;
      
      // Auto-Write Software Logic
      scaffoldRule(cleanBrand, brand, intentName);
      scaffoldResponse(cleanBrand, brand, summaryStr);
      scaffoldHandler(cleanBrand, brand);
      scaffoldPlugin(cleanBrand, brand, intentName);
      scaffoldTest(cleanBrand, intentName);
      
      codeGenCount++;
      console.log(`   💻 Scaffolded full codebase bindings for new dynamic intent [${intentName}]`);
    }
  });

  fs.writeFileSync(OUTPUT_CONTENT_PATH, JSON.stringify(learnedContent, null, 2));

  console.log(`\\n${colors.green}✨ Compilation Complete! Integrated ${totalUtterances} samples & wrote code for ${codeGenCount} domains.${colors.reset}`);
  console.log(`${colors.cyan}🚀 You can now run 'npm run train' and 'npm test' to verify bindings.${colors.reset}`);
}

learnFromBlueprints();
