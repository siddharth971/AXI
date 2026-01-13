import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = "./server/autonomous/output";
const SOURCES = [
  "https://developer.amazon.com/en-US/alexa",
  "https://developers.google.com/assistant",
  "https://rasa.com/docs",
  "https://learn.microsoft.com/en-us/cortana/",
  "https://open-source-voice-assistant.github.io"
];

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function fetchText(url) {
  const res = await fetch(url);
  return await res.text();
}

function extractKnowledgeUnits(text) {
  return {
    intentIdeas: extractIntentIdeas(text),
    emotions: extractEmotionPatterns(text),
    skills: extractSkillPatterns(text),
  };
}

/* --- DETERMINISTIC EXTRACTORS --- */

function extractIntentIdeas(text) {
  const patterns = [
    /"ask .* to .*"/gi,
    /"tell .* to .*"/gi,
    /"how do I .*"/gi
  ];
  return patterns.flatMap(p => text.match(p) || []);
}

function extractEmotionPatterns(text) {
  const emotions = ["happy", "sad", "angry", "frustrated", "excited"];
  return emotions.filter(e => text.toLowerCase().includes(e));
}

function extractSkillPatterns(text) {
  const skills = ["calendar", "reminder", "email", "music", "navigation"];
  return skills.filter(s => text.toLowerCase().includes(s));
}

async function runExplorer() {
  const results = [];

  for (const source of SOURCES) {
    try {
      console.log(`Exploring: ${source}...`);
      const text = await fetchText(source);
      const knowledge = extractKnowledgeUnits(text);

      results.push({
        source,
        extracted_at: new Date().toISOString(),
        knowledge
      });
    } catch (err) {
      console.error("Failed:", source, err.message);
    }
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "learning_proposals.json"),
    JSON.stringify(results, null, 2)
  );

  console.log("AXI Exploration Complete. Proposals generated.");
}

runExplorer();
