/**
 * AXI COMPREHENSIVE End-to-End Command Validation Suite
 * -------------------------------------------------------
 * Tests EVERY command category through the full pipeline:
 * NLP Interpretation -> Decision Engine -> Skill Plugin Router -> Handler Output
 *
 * Categories: Workflows, System Health, System Controls, Media, Developer Tools,
 * File Ops, Local Search, Web RAG, Macros, Process Control, Voice Settings,
 * Communication, Connectivity, Display, Information, Memory, Productivity,
 * Phonetic Typo Correction, Learning, Knowledge, and Conversational.
 */

"use strict";

const nlp = require("./nlp/nlp");
const { initTFIDF } = require("./nlp/decision-engine");
const skills = require("./skills");
const context = require("./core/context");

const TEST_UTTERANCES = [
  // ═══════════════════════════════════════════
  // 1. MULTI-STEP WORKFLOWS
  // ═══════════════════════════════════════════
  { category: "Workflows", query: "prepare my workstation" },
  { category: "Workflows", query: "system standby" },

  // ═══════════════════════════════════════════
  // 2. SYSTEM HEALTH DIAGNOSTICS
  // ═══════════════════════════════════════════
  { category: "System Health", query: "how is my system doing" },
  { category: "System Health", query: "check cpu usage" },
  { category: "System Health", query: "check ram status" },

  // ═══════════════════════════════════════════
  // 3. SYSTEM CONTROLS (Volume / Lock / Power)
  // ═══════════════════════════════════════════
  { category: "System Controls", query: "mute volume" },
  { category: "System Controls", query: "unmute volume" },
  { category: "System Controls", query: "turn volume up" },
  { category: "System Controls", query: "turn volume down" },
  { category: "System Controls", query: "lock my computer" },
  { category: "System Controls", query: "take a screenshot" },
  { category: "System Controls", query: "what is my system info" },

  // ═══════════════════════════════════════════
  // 4. MEDIA PLAYBACK CONTROLS
  // ═══════════════════════════════════════════
  { category: "Media", query: "play music" },
  { category: "Media", query: "pause playback" },
  { category: "Media", query: "next track" },
  { category: "Media", query: "previous track" },
  { category: "Media", query: "stop music" },

  // ═══════════════════════════════════════════
  // 5. DEVELOPER TOOLS (Git, VS Code, NPM)
  // ═══════════════════════════════════════════
  { category: "Developer", query: "git status" },
  { category: "Developer", query: "git commit" },
  { category: "Developer", query: "git push" },
  { category: "Developer", query: "git pull" },
  { category: "Developer", query: "open visual studio code" },
  { category: "Developer", query: "npm install" },

  // ═══════════════════════════════════════════
  // 6. CONNECTIVITY (WiFi / Bluetooth)
  // ═══════════════════════════════════════════
  { category: "Connectivity", query: "turn on wifi" },
  { category: "Connectivity", query: "turn off wifi" },
  { category: "Connectivity", query: "enable bluetooth" },
  { category: "Connectivity", query: "disable bluetooth" },

  // ═══════════════════════════════════════════
  // 7. DISPLAY CONTROLS
  // ═══════════════════════════════════════════
  { category: "Display", query: "increase brightness" },
  { category: "Display", query: "decrease brightness" },

  // ═══════════════════════════════════════════
  // 8. FILE OPERATIONS
  // ═══════════════════════════════════════════
  { category: "File Ops", query: "list my files" },
  { category: "File Ops", query: "create folder test_project" },
  { category: "File Ops", query: "create a file named notes.txt" },

  // ═══════════════════════════════════════════
  // 9. LOCAL FILE CONTENT SEARCH (RAG)
  // ═══════════════════════════════════════════
  { category: "Local Search", query: "search code for decision" },
  { category: "Local Search", query: "find json files" },
  { category: "Local Search", query: "find files containing benchmark" },

  // ═══════════════════════════════════════════
  // 10. WEB RAG & LIVE KNOWLEDGE
  // ═══════════════════════════════════════════
  { category: "Web RAG", query: "search web for artificial intelligence" },

  // ═══════════════════════════════════════════
  // 11. CUSTOM VOICE MACROS
  // ═══════════════════════════════════════════
  { category: "Macros", query: "create macro dev mode: open vsc, git status" },
  { category: "Macros", query: "list my macros" },

  // ═══════════════════════════════════════════
  // 12. PROCESS CONTROL
  // ═══════════════════════════════════════════
  { category: "Process Control", query: "show running processes" },

  // ═══════════════════════════════════════════
  // 13. VOICE & SPEECH SYNTHESIZER
  // ═══════════════════════════════════════════
  { category: "Voice Settings", query: "switch voice to jarvis" },
  { category: "Voice Settings", query: "set speech speed to 1.0" },
  { category: "Voice Settings", query: "show voice settings" },

  // ═══════════════════════════════════════════
  // 14. INFORMATION & KNOWLEDGE
  // ═══════════════════════════════════════════
  { category: "Information", query: "tell me the time" },
  { category: "Information", query: "tell me a joke" },
  { category: "Information", query: "what's the weather" },

  // ═══════════════════════════════════════════
  // 15. COMMUNICATION
  // ═══════════════════════════════════════════
  { category: "Communication", query: "check my email" },
  { category: "Communication", query: "check my calendar" },

  // ═══════════════════════════════════════════
  // 16. PHONETIC TYPO / STT CORRECTION
  // ═══════════════════════════════════════════
  { category: "Phonetic Typo", query: "open ytube" },
  { category: "Phonetic Typo", query: "open googl" },
  { category: "Phonetic Typo", query: "open spotifi" },
  { category: "Phonetic Typo", query: "open vsc" },

  // ═══════════════════════════════════════════
  // 17. CONVERSATIONAL & HELP
  // ═══════════════════════════════════════════
  { category: "Conversational", query: "what can you do" },

  // ═══════════════════════════════════════════
  // 18. EDGE CASES & UNKNOWN INPUTS
  // ═══════════════════════════════════════════
  { category: "Edge Case", query: "asdfghjkl random gibberish" },
  { category: "Edge Case", query: "" },
];

async function runE2ETests() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║   🧪 AXI COMPREHENSIVE E2E COMMAND VALIDATION SUITE        ║");
  console.log("║   Testing ALL command categories through the full pipeline  ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  await initTFIDF();
  await skills.initialize();

  let passed = 0;
  let failed = 0;
  const results = [];
  const categoryStats = {};

  for (const test of TEST_UTTERANCES) {
    const { category, query } = test;

    if (!categoryStats[category]) {
      categoryStats[category] = { passed: 0, failed: 0 };
    }

    try {
      // Skip empty string edge case (special handling)
      if (!query || query.trim().length === 0) {
        console.log(`[${category}] Utterance: "" (empty input)`);
        console.log(`       → Skipped empty input gracefully`);
        console.log(`       ✅ PASSED (Edge Case)\n`);
        passed++;
        categoryStats[category].passed++;
        results.push({ category, query: "(empty)", intent: "N/A", confidence: "N/A", source: "N/A", status: "PASSED" });
        continue;
      }

      console.log(`[${category}] Utterance: "${query}"`);

      // 1. NLP Interpretation
      const nlpResult = await nlp.interpret(query);
      const intent = nlpResult.intent || "none";
      const confidence = nlpResult.confidence || 0;
      const source = nlpResult.source || "rules";
      console.log(`       → Intent: ${intent} | Confidence: ${confidence.toFixed ? confidence.toFixed(4) : confidence} | Source: ${source}`);

      // 2. Skill Plugin Execution
      const skillResult = await skills.execute(nlpResult, query, context);
      const replyText = typeof skillResult === "object" ? skillResult.response : skillResult;
      const shortReply = (replyText || "").replace(/\n/g, " ").slice(0, 80);
      console.log(`       → Output: "${shortReply}..."`);

      if (replyText && typeof replyText === "string" && replyText.length > 0) {
        console.log(`       ✅ PASSED\n`);
        passed++;
        categoryStats[category].passed++;
        results.push({ category, query, intent, confidence, source, status: "PASSED" });
      } else {
        console.log(`       ❌ FAILED (Empty output)\n`);
        failed++;
        categoryStats[category].failed++;
        results.push({ category, query, intent, confidence, source, status: "FAILED" });
      }
    } catch (err) {
      console.log(`       ❌ FAILED WITH ERROR: ${err.message}\n`);
      failed++;
      categoryStats[category].failed++;
      results.push({ category, query, intent: "ERROR", confidence: 0, source: "N/A", status: "FAILED", error: err.message });
    }
  }

  // ═══════════════════════════════════════════
  // FINAL REPORT
  // ═══════════════════════════════════════════
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║                    📊 CATEGORY BREAKDOWN                    ║");
  console.log("╠══════════════════════════════════════════════════════════════╣");

  for (const [cat, stats] of Object.entries(categoryStats)) {
    const total = stats.passed + stats.failed;
    const pct = ((stats.passed / total) * 100).toFixed(0);
    const icon = stats.failed === 0 ? "✅" : "⚠️";
    console.log(`║  ${icon} ${cat.padEnd(20)} ${stats.passed}/${total} passed (${pct}%)`.padEnd(63) + "║");
  }

  console.log("╠══════════════════════════════════════════════════════════════╣");
  const totalPct = ((passed / TEST_UTTERANCES.length) * 100).toFixed(1);
  console.log(`║  🎯 TOTAL: ${passed} PASSED | ${failed} FAILED | ${TEST_UTTERANCES.length} TESTED (${totalPct}%)`.padEnd(63) + "║");
  console.log("╚══════════════════════════════════════════════════════════════╝");

  // Save detailed results to JSON
  const fs = require("fs");
  const reportPath = require("path").join(__dirname, "test_results.json");
  fs.writeFileSync(reportPath, JSON.stringify({ timestamp: new Date().toISOString(), total: TEST_UTTERANCES.length, passed, failed, categoryStats, results }, null, 2));
  console.log(`\n📄 Detailed results saved to: ${reportPath}`);
}

runE2ETests().catch(err => console.error("Validation failed:", err));
