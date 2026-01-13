import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = "./autonomous/output";
const DOMAINS_PATH = "./autonomous/domains.json";

const FETCH_OPTIONS = {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AXI-Autonomous-Explorer/4.0"
  },
  timeout: 15000
};

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function fetchPage(url) {
  const res = await fetch(url, FETCH_OPTIONS);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : url;

  // Semantic extraction: identify dialog-like structures before flattening
  let dialogs = [];
  // Pattern: Look for <li> or <div> containing "User:" and "Assistant:" or similar
  const dialogMarkupRegex = /<(?:li|div|p|span)[^>]*>(?:User|Human|Customer|You):\s*(.*?)<\/(?:li|div|p|span)>\s*<(?:li|div|p|span)[^>]*>(?:Assistant|AI|AXI|Bot|Alexa|Siri|Google):\s*(.*?)<\/(?:li|div|p|span)>/gis;
  let dMatch;
  while ((dMatch = dialogMarkupRegex.exec(html)) !== null) {
    dialogs.push({ user: dMatch[1].replace(/<[^>]*>?/gm, ' ').trim(), assistant: dMatch[2].replace(/<[^>]*>?/gm, ' ').trim() });
  }

  // Preserve structure
  let structuredText = html
    .replace(/<(h1|h2|h3|h4|h5|h6)[^>]*>(.*?)<\/\1>/gi, '\n\n# $2\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '\n* $1')
    .replace(/<dt[^>]*>(.*?)<\/dt>\s*<dd[^>]*>(.*?)<\/dd>/gi, '\nQ: $1\nA: $2') // Help with definition lists (FAQs)
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n');

  const cleanText = structuredText
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n');

  return { title, text: cleanText, dialogs };
}

function extractKnowledgeUnits(text, detectedDialogs) {
  return {
    intents: extractIntents(text),
    entities: extractEntities(text),
    procedures: extractProcedures(text),
    faqs: extractFaqs(text),
    conversation_samples: [...detectedDialogs, ...extractConversations(text)],
    emotions: extractEmotions(text)
  };
}

function extractIntents(text) {
  const patterns = [
    /(?:can you|how do I|please|i want to|ask|tell) ([\w\s]{10,80})/gi,
    /["`'](?:hey axi|alexa|siri|google),? ([\w\s]{5,60})["`']/gi,
    /Example utterances?:\s*\*? (.*)/gi
  ];

  return [...new Set(patterns.flatMap(p => {
    const matches = Array.from(text.matchAll(p));
    return matches.map(m => m[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim());
  }))].filter(m => {
    const junk = ["feedback", "privacy", "cookies", "sign in", "learn more", "reload", "understand", "problem", "copyright"];
    const isJunk = junk.some(j => m.toLowerCase().includes(j));
    const words = m.split(' ').length;
    return words >= 3 && words <= 12 && !isJunk;
  });
}

function extractEntities(text) {
  const entityPats = [
    /\b(API|SDK|Framework|Library|Service|Plugin|Module)\b:?\s*([A-Z][\w\s-]{2,25})/g,
    /\b([A-Z]{2,10})\s+(?:SDK|API|Toolkit|Integration)\b/g
  ];
  return [...new Set(entityPats.flatMap(p => {
    const matches = Array.from(text.matchAll(p));
    return matches.map(m => m[0].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim());
  }))].filter(e => e.length > 3 && e.length < 40);
}

function extractProcedures(text) {
  const stepPattern = /(?:Step|Task|Stage) \d+:?\s*(.*?)(?=\n(?:Step|Task|Stage) \d+|\n\n|$)/gis;
  const matches = Array.from(text.matchAll(stepPattern));
  return [...new Set(matches.map(m => m[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()).filter(s => s.length > 20))];
}

function extractFaqs(text) {
  const faqPattern = /(?:Q|Question|How do I|What is):\s*(.*?)\s*(?:A|Answer|To do this|It is):\s*(.*?)(?=\n(?:Q|Question|How do I|What is):|\n\n|$)/gis;
  const matches = Array.from(text.matchAll(faqPattern));
  return matches.map(m => ({
    question: m[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
    answer: m[2].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
  })).filter(f => f.question.length > 10 && f.answer.length > 20);
}

function extractConversations(text) {
  const patterns = [
    /(?:User|Human|Customer):\s*(.*?)\s*(?:AI|AXI|Assistant|Bot):\s*(.*?)(?=\n(?:User|Human|Customer):|\n\n|$)/gis,
    /(?:>|U:)\s*(.*?)\s*\n(?:<|A:)\s*(.*?)(?=\n(?:>|U:)|\n\n|$)/gis
  ];

  return patterns.flatMap(p => {
    const matches = Array.from(text.matchAll(p));
    return matches.map(m => ({
      user: m[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
      assistant: m[2].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
    }));
  });
}

function extractEmotions(text) {
  const keywords = ["frustrated", "happy", "angry", "confused", "excited", "disappointed", "urgent", "polite", "stressed", "overwhelmed"];
  return keywords.filter(k => new RegExp(`\\b${k}\\b`, 'i').test(text));
}

async function runExplorer() {
  console.log("🚀 AXI Hyper-Deep Exploration Mode Initialized...");

  let sources;
  try {
    const config = JSON.parse(fs.readFileSync(DOMAINS_PATH, "utf-8"));
    sources = [...new Set(Array.isArray(config) ? config : Object.values(config).flat().map(s => typeof s === 'string' ? s : s.url))];
  } catch (err) {
    console.error("❌ Failed to load domains.json:", err.message);
    return;
  }

  const results = [];

  for (const url of sources) {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) continue;

    try {
      console.log(`\n🔍 Exploring: ${url}...`);
      const { title, text, dialogs } = await fetchPage(url);
      const knowledge = extractKnowledgeUnits(text, dialogs);

      const hitCount = Object.values(knowledge).flat().length;

      if (hitCount > 0) {
        console.log(`✅ Discovered ${hitCount} total knowledge units.`);
        results.push({
          source_url: url,
          page_title: title,
          explored_at: new Date().toISOString(),
          knowledge
        });
      } else {
        console.log(`⚠️ No significant conversational data found.`);
      }
    } catch (err) {
      console.error(`❌ Exploration failed for ${url}: ${err.message}`);
    }
  }

  const outputPath = path.join(OUTPUT_DIR, "deep_learning_results.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`\n✨ Hyper-Deep Exploration Complete! Results in: ${outputPath}`);
}

runExplorer();
