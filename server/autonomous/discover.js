import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOMAINS_PATH = path.join(__dirname, "domains.json");
const CONTENT_PATH = path.join(__dirname, "content.json");

// Simple user agent to look like a browser
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
};

function getTopics() {
  try {
    if (fs.existsSync(CONTENT_PATH)) {
      const data = JSON.parse(fs.readFileSync(CONTENT_PATH, "utf-8"));
      if (data.topics && Array.isArray(data.topics) && data.topics.length > 0) {
        return data.topics;
      }
    }
  } catch (e) {
    console.error("⚠️ Failed to load content.json, falling back to defaults.");
  }

  // Fallbacks if file is missing or empty
  return [
    "latest technology news websites",
    "best cooking blogs 2025",
    "top machine learning resources",
    "popular travel blogs",
  ];
}

function getRandomTopic() {
  const topics = getTopics();
  return topics[Math.floor(Math.random() * topics.length)];
}

async function searchAndDiscover(query) {
  const targetQuery = query || getRandomTopic();
  console.log(`\n🔍 Searching for new domains related to: "${targetQuery}"...`);

  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(targetQuery)}`;

  try {
    const response = await fetch(searchUrl, { headers: HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const linkRegex = /class="result__a" href="([^"]+)"/g;
    let match;
    const foundDomains = new Set();

    while ((match = linkRegex.exec(html)) !== null) {
      let rawUrl = match[1];
      if (rawUrl.startsWith("//")) rawUrl = "https:" + rawUrl;
      if (rawUrl.startsWith("/"))
        rawUrl = "https://html.duckduckgo.com" + rawUrl;

      try {
        const urlObj = new URL(rawUrl);
        if (
          !urlObj.hostname.includes("duckduckgo") &&
          !urlObj.hostname.includes("google")
        ) {
          foundDomains.add(urlObj.origin);
        }
      } catch (e) { }
    }

    return Array.from(foundDomains);
  } catch (err) {
    console.error(`❌ Search failed: ${err.message}`);
    return [];
  }
}

async function updateDomainsFile(newDomains) {
  if (newDomains.length === 0) {
    console.log("⚠️ No new domains found.");
    return;
  }

  let currentDomains = [];
  try {
    if (fs.existsSync(DOMAINS_PATH)) {
      currentDomains = JSON.parse(fs.readFileSync(DOMAINS_PATH, "utf-8"));
    }
  } catch (err) {
    currentDomains = [];
  }

  const initialCount = currentDomains.length;
  const set = new Set(currentDomains);
  newDomains.forEach((d) => set.add(d));

  const updatedList = Array.from(set);
  const addedCount = updatedList.length - initialCount;

  if (addedCount > 0) {
    fs.writeFileSync(DOMAINS_PATH, JSON.stringify(updatedList, null, 2));
    console.log(`✅ Added ${addedCount} new domains to ${DOMAINS_PATH}`);
    console.log(`   Total monitored domains: ${updatedList.length}`);
  } else {
    console.log("ℹ️ All discovered domains were already in the list.");
  }
}

const userArg = process.argv.slice(2).join(" ");
const query = userArg.trim();

(async () => {
  const results = await searchAndDiscover(query);
  await updateDomainsFile(results);
})();
