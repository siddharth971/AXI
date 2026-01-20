import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLUEPRINTS_PATH = path.join(__dirname, "output/website_blueprints.json");
const CONTENT_PATH = path.join(__dirname, "content.json");

function extractData() {
  console.log("🔍 Extracting text content from Blueprints...");

  if (!fs.existsSync(BLUEPRINTS_PATH)) {
    console.error("❌ Blueprints file not found.");
    return;
  }

  let blueprints = [];
  try {
    blueprints = JSON.parse(fs.readFileSync(BLUEPRINTS_PATH, "utf-8"));
  } catch (e) {
    console.error("❌ Failed to parse blueprints:", e.message);
    return;
  }

  const extractedTexts = new Set();

  blueprints.forEach((bp) => {
    const config = bp.global_configuration || {};

    // 1. Brand Name
    if (config.brand_name) extractedTexts.add(config.brand_name);

    if (
      bp.site_routes_and_content &&
      Array.isArray(bp.site_routes_and_content)
    ) {
      bp.site_routes_and_content.forEach((route) => {
        // 2. Titles & Descriptions
        if (route.meta_seo) {
          if (route.meta_seo.title && route.meta_seo.title !== "Pending Scan") {
            extractedTexts.add(route.meta_seo.title);
          }
          if (route.meta_seo.description) {
            extractedTexts.add(route.meta_seo.description);
          }
        }

        // 3. Anchor Text
        if (
          route.anchor_text &&
          route.anchor_text !== "Unknown" &&
          route.anchor_text.length > 2
        ) {
          extractedTexts.add(route.anchor_text);
        }

        // 4. Main Content Text (Headings/Paragraphs)
        if (
          route.page_content &&
          Array.isArray(route.page_content.main_content)
        ) {
          route.page_content.main_content.forEach((block) => {
            if (block.text && block.text.length > 5) {
              extractedTexts.add(block.text);
            }
          });
        }
      });
    }
  });

  const newItems = Array.from(extractedTexts).filter(
    (t) => t && t.trim().length > 0,
  );
  console.log(`✅ Extracted ${newItems.length} unique text items.`);

  // Update content.json
  let contentData = { topics: [], extracted_knowledge: [] };
  if (fs.existsSync(CONTENT_PATH)) {
    try {
      contentData = JSON.parse(fs.readFileSync(CONTENT_PATH, "utf-8"));
    } catch (e) {
      console.error(
        "⚠️ Failed to parse existing content.json, starting fresh.",
      );
    }
  }

  if (!contentData.extracted_knowledge) contentData.extracted_knowledge = [];

  // Merge (avoiding duplicates)
  const existingSet = new Set(contentData.extracted_knowledge);
  let addedCount = 0;
  newItems.forEach((item) => {
    if (!existingSet.has(item)) {
      contentData.extracted_knowledge.push(item);
      addedCount++;
    }
  });

  fs.writeFileSync(CONTENT_PATH, JSON.stringify(contentData, null, 2));
  console.log(
    `✨ Saved ${addedCount} new items to extracted_knowledge in content.json`,
  );
}

extractData();
