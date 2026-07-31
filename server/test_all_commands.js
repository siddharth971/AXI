/**
 * AXI End-to-End Skill & Intent Validation Test Suite
 * ----------------------------------------------------
 * Executes all primary commands through the full pipeline:
 * NLP Interpretation -> Decision Engine -> Skill Plugin Router -> Handler Output
 */

"use strict";

const nlp = require("./nlp/nlp");
const { initTFIDF } = require("./nlp/decision-engine");
const skills = require("./skills");
const context = require("./core/context");

const TEST_UTTERANCES = [
  // Workflows
  "prepare my workstation",
  "system standby",

  // System Diagnostics
  "how is my system doing",
  "check cpu usage",
  "check ram status",

  // Media Controls
  "mute volume",
  "turn volume up",
  "pause playback",

  // Phonetic Typo STT
  "open ytube",
  "open googl",
  "open spotifi",
  "open vsc",

  // File Operations
  "list my files",
  "create folder project_alpha",

  // Knowledge & Conversational
  "tell me the time",
  "what can you do"
];

async function runE2ETests() {
  console.log("🧪 Starting End-to-End AXI Command Execution Validation...\n");

  await initTFIDF();
  await skills.initialize();

  let passed = 0;
  let failed = 0;

  for (const query of TEST_UTTERANCES) {
    try {
      console.log(`[TEST] Utterance: "${query}"`);

      // 1. NLP Interpretation
      const nlpResult = await nlp.interpret(query);
      console.log(`       → Intent: ${nlpResult.intent} | Confidence: ${nlpResult.confidence} | Source: ${nlpResult.source || "rules"}`);

      // 2. Skill Plugin Execution
      const skillResult = await skills.execute(nlpResult, query, context);
      const replyText = typeof skillResult === "object" ? skillResult.response : skillResult;
      console.log(`       → Execution Output: "${replyText.replace(/\n/g, " ").slice(0, 80)}..."`);

      if (replyText && typeof replyText === "string") {
        console.log(`       ✅ PASSED\n`);
        passed++;
      } else {
        console.log(`       ❌ FAILED (Empty output)\n`);
        failed++;
      }
    } catch (err) {
      console.log(`       ❌ FAILED WITH ERROR: ${err.message}\n`);
      failed++;
    }
  }

  console.log("==================================================");
  console.log(`🎯 Test Summary: ${passed} PASSED | ${failed} FAILED | Total: ${TEST_UTTERANCES.length}`);
  console.log("==================================================");
}

runE2ETests().catch(err => console.error("Validation failed:", err));
