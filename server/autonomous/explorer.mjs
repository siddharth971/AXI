import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { URL } from "url";
import dns from "dns/promises";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, "output");
const DOMAINS_PATH = path.join(__dirname, "domains.json");
const OUTPUT_FILE = "website_blueprints.json";

const FETCH_OPTIONS = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AXI-Autonomous-Explorer/4.0",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  },
  timeout: 8000,
  redirect: "follow",
};

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to generate IDs
const generateId = (prefix = "ID") =>
  `${prefix}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

// Helper to parse infrastructure (Best Effort)
async function getInfrastructureInfo(hostname) {
  try {
    const { address } = await dns.lookup(hostname);
    return {
      hosting_provider: "Unknown (Requires ASN Lookup)",
      server_ip: address,
      cdn_provider: "Unknown", // Would need headers to detect Cloudflare/AWS
      ssl_certificate: {
        issuer: "Unknown (Requires TLS Socket)", // Skipping strict TLS check to avoid crashes
        valid_until: "Unknown",
      },
    };
  } catch (e) {
    return { error: "DNS Lookup Failed" };
  }
}

// Regex Helpers
const REGEX = {
  title: /<title>([^<]*)<\/title>/i,
  metaDesc: /<meta\s+name=["']description["']\s+content=["'](.*?)["']\s*\/?>/i,
  metaAuthor: /<meta\s+name=["']author["']\s+content=["'](.*?)["']\s*\/?>/i,
  links: /<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi,
  images: /<img\s+(?:[^>]*?\s+)?src=["']([^"']*)["'][^>]*>/gi,
  scripts: /<script\s+(?:[^>]*?\s+)?src=["']([^"']*)["'][^>]*>/gi,
  styles:
    /<link\s+(?:[^>]*?\s+)?rel=["']stylesheet["']\s+href=["']([^"']*)["'][^>]*>/gi,
  api_calls: /["'](\/api\/[^"']+)["']/gi,
};

// Content Analyzer
function analyzePageContent(html) {
  // Extract Hero Section (First H1 + nearby text/buttons)
  const h1Match = /<h1[^>]*>(.*?)<\/h1>/i.exec(html);
  const hero = {
    h1_title: h1Match ? h1Match[1].replace(/<[^>]+>/g, "").trim() : "Untitled",
    h2_subtitle: "",
    cta_buttons: [],
  };

  // Attempt to find a subtitle
  if (hero.h1_title && html.includes(hero.h1_title)) {
    const afterH1 = html.split(hero.h1_title)[1] || "";
    const pMatch = /<p[^>]*>(.*?)<\/p>/i.exec(afterH1.substring(0, 500));
    if (pMatch) hero.h2_subtitle = pMatch[1].replace(/<[^>]+>/g, "").trim();
  }

  // Extract Value Props
  const value_props = [];
  const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  let h2Matches;
  while ((h2Matches = h2Regex.exec(html)) !== null) {
    if (value_props.length < 3) {
      value_props.push({
        title: h2Matches[1].replace(/<[^>]+>/g, "").trim(),
        desc: "Description detected in content block.",
      });
    }
  }

  // Extract Detailed Content (Headings + Paragraphs in order)
  const captured_content = [];
  // Regex to match h1-h6 and p tags.
  // Note: [\s\S]*? ensures we capture newlines within tags
  const contentRegex = /<(h[1-6]|p)[^>]*>([\s\S]*?)<\/\1>/gi;
  let cMatch;
  while ((cMatch = contentRegex.exec(html)) !== null) {
    const tag = cMatch[1].toLowerCase();
    // Remove internal HTML tags from the match content
    const text = cMatch[2]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Filter out very short garbage text often found in html parsing (e.g. empty p tags or controls)
    if (text.length > 3 && !text.includes("{") && !text.includes("function(")) {
      captured_content.push({
        tag: tag,
        text: text,
      });
    }
  }

  return {
    hero_section: hero,
    value_props,
    main_content: captured_content,
    structure_summary: {
      paragraphs: (html.match(/<p/gi) || []).length,
      headings: (html.match(/<h\d/gi) || []).length,
      images: (html.match(/<img/gi) || []).length,
    },
  };
}

// Asset Extractor
function extractAssets(html, baseUrl) {
  const assets = {
    summary: { total_files: 0, total_size_mb: 0 },
    core_assets: [],
  };
  const seen = new Set();

  const addAsset = (url, type) => {
    if (!url || url.startsWith("data:") || seen.has(url)) return;
    try {
      const fullUrl = new URL(url, baseUrl).href;
      seen.add(url);
      assets.core_assets.push({
        path: new URL(fullUrl).pathname,
        type,
        full_url: fullUrl,
      });
    } catch (e) { }
  };

  let match;
  while ((match = REGEX.scripts.exec(html)) !== null)
    addAsset(match[1], "script");
  while ((match = REGEX.styles.exec(html)) !== null)
    addAsset(match[1], "stylesheet");
  while ((match = REGEX.images.exec(html)) !== null)
    addAsset(match[1], "image");

  assets.summary.total_files = assets.core_assets.length;
  return assets;
}

// Route Extractor
function extractRoutes(html, baseUrl) {
  const routes = [];
  const seen = new Set();

  let match;
  while ((match = REGEX.links.exec(html)) !== null) {
    const href = match[1];
    const text = match[2].replace(/<[^>]+>/g, "").trim();

    if (
      href &&
      !href.startsWith("#") &&
      !href.startsWith("mailto") &&
      !href.startsWith("tel") &&
      !seen.has(href)
    ) {
      try {
        const urlObj = new URL(href, baseUrl);
        if (urlObj.hostname === new URL(baseUrl).hostname) {
          seen.add(href);
          routes.push({
            route_id: generateId("ROUTE"),
            path: urlObj.pathname,
            type: "Detected Link",
            anchor_text: text || "Unknown",
          });
        }
      } catch (e) { }
    }
  }
  return routes.slice(0, 15); // limit detected routes
}

// API Extractor
function extractApiManifest(html) {
  const manifest = {};
  let match;
  while ((match = REGEX.api_calls.exec(html)) !== null) {
    const endpoint = match[1];
    const name = endpoint.split("/").pop() || "endpoint";
    manifest[name] = { method: "UNKNOWN", url: endpoint };
  }
  return manifest;
}

async function generateBlueprint(url) {
  // console.log(`\n🔍 Analyzing Blueprint for: ${url}...`);
  const blueprintId =
    "BLUEPRINT-" +
    crypto
      .createHash("md5")
      .update(url)
      .digest("hex")
      .substr(0, 8)
      .toUpperCase();

  try {
    const startTime = Date.now();
    const res = await fetch(url, FETCH_OPTIONS);
    const latency = Date.now() - startTime;

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const headers = {};
    for (const [key, value] of res.headers.entries()) {
      headers[key] = value;
    }

    const domain = new URL(url).hostname;
    const infrastructure = await getInfrastructureInfo(domain);

    // Enrich Infrastructure with Headers
    if (headers["server"]) infrastructure.web_server = headers["server"];
    if (headers["cf-ray"]) infrastructure.cdn_provider = "Cloudflare";
    if (headers["x-amz-id-2"]) infrastructure.hosting_provider = "AWS";

    const titleMatch = REGEX.title.exec(html);
    const title = titleMatch ? titleMatch[1] : domain;

    const descMatch = REGEX.metaDesc.exec(html);
    const description = descMatch ? descMatch[1] : "";

    const assets = extractAssets(html, url);
    const discoveredRoutes = extractRoutes(html, url);
    const pageContent = analyzePageContent(html);
    const apiManifest = extractApiManifest(html);

    // Construct the primary route (The one we visited)
    const primaryRoute = {
      route_id: "route_landing",
      path: new URL(url).pathname,
      type: "Entry Point",
      rendering_strategy: "Unknown (Assumed Static/SSR)",
      meta_seo: {
        title,
        description,
        canonical: url,
      },
      network_waterfall: [
        { resource: "document", latency: `${latency}ms` },
        ...assets.core_assets.slice(0, 3).map((a) => ({
          resource: path.basename(a.path),
          latency: "pending",
        })),
      ],
      page_content: pageContent,
    };

    // Combine Primary with Discovered (as stubs)
    const allRoutes = [
      primaryRoute,
      ...discoveredRoutes.map((r) => ({
        ...r,
        rendering_strategy: "Unknown",
        meta_seo: { title: "Pending Scan" },
        page_content: {},
      })),
    ];

    return {
      website_blueprint_id: blueprintId,
      generated_at: new Date().toISOString(),
      global_configuration: {
        brand_name: title.split(/[-|]/)[0].trim(),
        domain: domain,
        primary_language: "en-US", // approximation
        infrastructure: infrastructure,
        server_headers: {
          "Cache-Control": headers["cache-control"] || "Not Set",
          "Content-Security-Policy":
            headers["content-security-policy"] || "Not Set",
          Server: headers["server"] || "Unknown",
        },
      },
      file_system_inventory: assets,
      site_routes_and_content: allRoutes,
      api_endpoints_manifest: apiManifest,
    };
  } catch (err) {
    console.error(`❌ Failed to blueprint ${url}: ${err.message}`);
    return null;
  }
}

// Batch processing configuration
const CONCURRENCY_LIMIT = 50;
const BLUEPRINTS_DIR = path.join(OUTPUT_DIR, "blueprints");
const INDEX_FILE = path.join(OUTPUT_DIR, "index.json");

// Ensure blueprints directory exists
if (!fs.existsSync(BLUEPRINTS_DIR)) {
  fs.mkdirSync(BLUEPRINTS_DIR, { recursive: true });
}

// Generate a safe filename from domain
function getDomainFilename(domain) {
  return domain.replace(/[^a-zA-Z0-9.-]/g, "_") + ".json";
}

async function runExplorer() {
  console.log("🚀 AXI Autonomous Blueprint Engine (Sharded Output Mode)...");

  let sources;
  try {
    const config = JSON.parse(fs.readFileSync(DOMAINS_PATH, "utf-8"));
    sources = [
      ...new Set(
        Array.isArray(config)
          ? config
          : Object.values(config)
            .flat()
            .map((s) => (typeof s === "string" ? s : s.url)),
      ),
    ];
  } catch (err) {
    console.error("❌ Failed to load domains.json:", err.message);
    return;
  }

  const indexEntries = [];
  const total = sources.length;
  let completed = 0;
  let successCount = 0;

  // Helper to process a single URL and save to individual file
  const processUrl = async (url) => {
    try {
      const blueprint = await generateBlueprint(url);
      if (blueprint) {
        const domain = blueprint.global_configuration.domain;
        const filename = getDomainFilename(domain);
        const filepath = path.join(BLUEPRINTS_DIR, filename);

        // Write individual blueprint file
        fs.writeFileSync(filepath, JSON.stringify(blueprint, null, 2));

        // Add to index
        indexEntries.push({
          id: blueprint.website_blueprint_id,
          domain: domain,
          brand: blueprint.global_configuration.brand_name,
          file: `blueprints/${filename}`,
          generated_at: blueprint.generated_at,
        });

        successCount++;
        process.stdout.write(`.`);
      }
    } catch (e) {
      // Ignore failures in fast mode
    } finally {
      completed++;
    }
  };

  // Chunking helper
  const chunk = (arr, size) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size),
    );

  const batches = chunk(sources, CONCURRENCY_LIMIT);

  console.log(
    `\n⚡ Processing ${total} domains in ${batches.length} concurrent batches...`,
  );

  const startTime = Date.now();

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(
      `\n🌊 [Batch ${i + 1}/${batches.length}] Launching ${batch.length} explorers...`,
    );

    // Execute batch in parallel
    await Promise.all(batch.map((url) => processUrl(url)));

    console.log(`\n   ✅ Batch ${i + 1} complete. (${completed}/${total})`);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Write index file
  const indexData = {
    generated_at: new Date().toISOString(),
    total_blueprints: successCount,
    blueprints: indexEntries,
  };
  fs.writeFileSync(INDEX_FILE, JSON.stringify(indexData, null, 2));

  console.log(
    `\n✨ Exploration Finished in ${duration}s! Generated ${successCount} blueprints.`,
  );
  console.log(`📁 Index saved to: ${INDEX_FILE}`);
  console.log(`📂 Blueprints saved to: ${BLUEPRINTS_DIR}/`);
}

runExplorer();
