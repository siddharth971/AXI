/**
 * AXI NLP Robustness & Front-End QA Test
 * ========================================
 * Tests the system's ability to handle:
 * - Typos and misspellings
 * - Informal language
 * - Hinglish variations
 * - Edge cases and noise
 * - Natural user behavior
 */

"use strict";

const axios = require("axios");

// Console colors
const c = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m"
};

const API_BASE = "http://localhost:5000";
const API_ENDPOINT = `${API_BASE}/api/command`;
const DELAY_BETWEEN_REQUESTS = 100; // ms

const results = {
  passed: [],
  warnings: [],
  failed: [],
  byIntent: {}
};

/**
 * Test cases with variations for each intent
 */
const ROBUSTNESS_TESTS = [
  // ========== GREETING ==========
  {
    intent: "greeting",
    variations: [
      { input: "hello", type: "standard" },
      { input: "helo", type: "typo" },
      { input: "hii", type: "informal" },
      { input: "hey bro", type: "casual" },
      { input: "hello there jarvis", type: "conversational" },
      { input: "namaste", type: "hindi" },
      { input: "hy", type: "abbreviation" }
    ]
  },

  // ========== GOODBYE ==========
  {
    intent: "goodbye",
    variations: [
      { input: "goodbye", type: "standard" },
      { input: "bye", type: "short" },
      { input: "good bye", type: "spacing" },
      { input: "byee", type: "typo" },
      { input: "see you later", type: "conversational" },
      { input: "chal bye", type: "hinglish" }
    ]
  },

  // ========== TIME ==========
  {
    intent: "tell_time",
    variations: [
      { input: "what time is it", type: "standard" },
      { input: "whats the time", type: "informal" },
      { input: "time batao", type: "hinglish" },
      { input: "what tym is it", type: "typo" },
      { input: "tell me current time", type: "conversational" },
      { input: "kitne baje hain", type: "hindi" }
    ]
  },

  // ========== BROWSER - YOUTUBE ==========
  {
    intent: "open_youtube",
    variations: [
      { input: "open youtube", type: "standard" },
      { input: "open you tube", type: "spacing" },
      { input: "youtube kholo", type: "hinglish" },
      { input: "open youtub", type: "typo" },
      { input: "can you open youtube for me", type: "conversational" },
      { input: "launch youtube", type: "synonym" }
    ]
  },

  // ========== YOUTUBE SEARCH ==========
  {
    intent: "search_youtube",
    variations: [
      { input: "search youtube for music", type: "standard" },
      { input: "find music on youtube", type: "reordered" },
      { input: "youtube pe gana search karo", type: "hinglish" },
      { input: "search youtebe music", type: "typo" },
      { input: "play song from youtube", type: "conversational" },
      { input: "youtube mein dhundho", type: "hindi" }
    ]
  },

  // ========== MEDIA - VOLUME UP ==========
  {
    intent: "volume_up",
    variations: [
      { input: "volume up", type: "standard" },
      { input: "increase volume", type: "synonym" },
      { input: "sound badhao", type: "hinglish" },
      { input: "volum up", type: "typo" },
      { input: "make it louder", type: "conversational" },
      { input: "awaaz badha", type: "hindi" },
      { input: "turn up the volume", type: "phrase" }
    ]
  },

  // ========== MEDIA - PLAY ==========
  {
    intent: "play",
    variations: [
      { input: "play music", type: "standard" },
      { input: "play gaana", type: "hinglish" },
      { input: "paly music", type: "typo" },
      { input: "start playing", type: "synonym" },
      { input: "music chalao", type: "hindi" },
      { input: "can you play something", type: "conversational" }
    ]
  },

  // ========== MEDIA - PAUSE ==========
  {
    intent: "pause",
    variations: [
      { input: "pause", type: "standard" },
      { input: "paus", type: "typo" },
      { input: "pause karo", type: "hinglish" },
      { input: "stop for a moment", type: "conversational" },
      { input: "ruko", type: "hindi" }
    ]
  },

  // ========== FILE - LIST ==========
  {
    intent: "list_files",
    variations: [
      { input: "list files", type: "standard" },
      { input: "show files", type: "synonym" },
      { input: "files dikhao", type: "hinglish" },
      { input: "ls files", type: "command" },
      { input: "file list batao", type: "reordered" },
      { input: "what files are here", type: "conversational" },
      { input: "dir", type: "abbreviation" }
    ]
  },

  // ========== DEVELOPER - GIT STATUS ==========
  {
    intent: "git_status",
    variations: [
      { input: "git status", type: "standard" },
      { input: "check git status", type: "prefix" },
      { input: "git ka status", type: "hinglish" },
      { input: "git stat", type: "abbreviation" },
      { input: "repo status batao", type: "conversational" },
      { input: "show repository status", type: "verbose" }
    ]
  },

  // ========== DEVELOPER - NPM INSTALL ==========
  {
    intent: "npm_install",
    variations: [
      { input: "npm install", type: "standard" },
      { input: "npm i", type: "abbreviation" },
      { input: "install packages", type: "verbose" },
      { input: "npm instal", type: "typo" },
      { input: "npm install karo", type: "hinglish" },
      { input: "install dependencies", type: "synonym" }
    ]
  },

  // ========== KNOWLEDGE - CALCULATE ==========
  {
    intent: "calculate",
    variations: [
      { input: "calculate 10 plus 5", type: "standard" },
      { input: "10 + 5", type: "minimal" },
      { input: "das plus paanch", type: "hindi" },
      { input: "calculte 10 pluss 5", type: "typo" },
      { input: "what is ten plus five", type: "conversational" },
      { input: "add 10 and 5", type: "synonym" }
    ]
  },

  // ========== KNOWLEDGE - UNIT CONVERT ==========
  {
    intent: "unit_convert",
    variations: [
      { input: "convert 100 km to miles", type: "standard" },
      { input: "100 km in miles", type: "short" },
      { input: "kilometer se mile", type: "hinglish" },
      { input: "convert 100 kilomters to miles", type: "typo" },
      { input: "how many miles in 100 km", type: "conversational" }
    ]
  },

  // ========== KNOWLEDGE - WHAT DAY ==========
  {
    intent: "what_day",
    variations: [
      { input: "what day is today", type: "standard" },
      { input: "which day is it", type: "synonym" },
      { input: "aaj kaun sa din hai", type: "hindi" },
      { input: "what day today", type: "informal" },
      { input: "tell me today's day", type: "conversational" }
    ]
  },

  // ========== EDGE CASES & NOISE ==========
  {
    intent: "unknown_intent",
    variations: [
      { input: "asdfgh", type: "garbage" },
      { input: "do something", type: "vague" },
      { input: "????", type: "symbols" },
      { input: "hello how are you what can you do tell me everything", type: "rambling" },
      { input: "😊 hi", type: "emoji" },
      { input: "", type: "empty" },
      { input: "xyz abc qwerty", type: "nonsense" }
    ]
  }
];

/**
 * Send command and get response
 */
async function sendCommand(text) {
  try {
    const res = await axios.post(API_ENDPOINT, { text }, {
      headers: { "Content-Type": "application/json" },
      timeout: 5000
    });
    return { response: res.data.response || res.data.reply, error: false };
  } catch (error) {
    return { response: null, error: true, message: error.message };
  }
}

/**
 * Analyze if response indicates correct intent
 */
function analyzeResponse(response, expectedIntent) {
  if (!response) return { likely: false, confidence: "unknown" };

  const intentPatterns = {
    greeting: /hello|hi|greetings|good (morning|evening|afternoon)/i,
    goodbye: /goodbye|bye|see you|take care/i,
    tell_time: /time|\d{1,2}:\d{2}|current/i,
    open_youtube: /youtube|opening|opened/i,
    search_youtube: /search|youtube|music/i,
    volume_up: /volume|increased|louder|up/i,
    play: /play|music|playing/i,
    pause: /pause|paused|pausing/i,
    list_files: /file|folder|directory|contents|here are/i,
    git_status: /git|status|repository|working|changes/i,
    npm_install: /npm|install|package|dependencies/i,
    calculate: /\d+|result|equals|answer/i,
    unit_convert: /mile|kilometer|convert/i,
    what_day: /monday|tuesday|wednesday|thursday|friday|saturday|sunday/i,
    unknown_intent: /didn't|understand|not sure|rephrase|catch/i
  };

  const pattern = intentPatterns[expectedIntent];
  if (!pattern) return { likely: false, confidence: "unknown" };

  const matches = pattern.test(response);
  return { likely: matches, confidence: matches ? "high" : "low" };
}

/**
 * Test a single variation
 */
async function testVariation(expectedIntent, variation) {
  const { input, type } = variation;

  const result = await sendCommand(input);
  const analysis = analyzeResponse(result.response, expectedIntent);

  let status = "✅ PASS";
  let notes = "";

  // Check for errors
  if (result.error) {
    status = "❌ FAIL";
    notes = `API Error: ${result.message}`;
  }
  // Check if response matches expected intent
  else if (!analysis.likely && expectedIntent !== "unknown_intent") {
    status = "⚠️ WARNING";
    notes = `Response doesn't match expected intent pattern`;
  }
  // For garbage input, ensure it's handled safely
  else if (expectedIntent === "unknown_intent" && !analysis.likely) {
    status = "⚠️ WARNING";
    notes = "Garbage input not recognized as unknown";
  }

  return {
    expectedIntent,
    input,
    type,
    response: result.response ? result.response.substring(0, 60) : "N/A",
    status,
    notes
  };
}

/**
 * Main test runner
 */
async function runRobustnessTest() {
  console.log(`\n${c.cyan}${c.bright}═══════════════════════════════════════════════════════════${c.reset}`);
  console.log(`${c.cyan}${c.bright}         NLP ROBUSTNESS & REAL-WORLD INPUT TEST            ${c.reset}`);
  console.log(`${c.cyan}${c.bright}═══════════════════════════════════════════════════════════${c.reset}\n`);

  // Check server
  try {
    await axios.get(`${API_BASE}/api/health`, { timeout: 3000 });
    console.log(`${c.green}✅ Server running at ${API_BASE}${c.reset}\n`);
  } catch {
    console.log(`${c.red}❌ Server not responding${c.reset}\n`);
    process.exit(1);
  }

  const totalTests = ROBUSTNESS_TESTS.reduce((sum, t) => sum + t.variations.length, 0);
  console.log(`${c.bright}Testing ${totalTests} variations across ${ROBUSTNESS_TESTS.length} intents...${c.reset}\n`);

  // Test each intent
  for (const testCase of ROBUSTNESS_TESTS) {
    const { intent, variations } = testCase;

    console.log(`${c.cyan}${c.bright}▶ Testing "${intent}"${c.reset}`);

    if (!results.byIntent[intent]) {
      results.byIntent[intent] = { passed: 0, warned: 0, failed: 0, total: 0 };
    }

    for (const variation of variations) {
      const result = await testVariation(intent, variation);

      // Categorize result
      if (result.status === "✅ PASS") {
        results.passed.push(result);
        results.byIntent[intent].passed++;
      } else if (result.status === "⚠️ WARNING") {
        results.warnings.push(result);
        results.byIntent[intent].warned++;
      } else {
        results.failed.push(result);
        results.byIntent[intent].failed++;
      }
      results.byIntent[intent].total++;

      // Display result
      const icon = result.status === "✅ PASS" ? c.green + "✅" :
        result.status === "⚠️ WARNING" ? c.yellow + "⚠️" :
          c.red + "❌";

      console.log(`  ${icon} [${result.type.padEnd(15)}] "${result.input}"${c.reset}`);
      if (result.notes) {
        console.log(`    ${c.gray}${result.notes}${c.reset}`);
      }

      // Small delay to avoid overwhelming server
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    }
    console.log("");
  }

  // Generate report
  generateReport();
}

/**
 * Generate final report
 */
function generateReport() {
  const total = results.passed.length + results.warnings.length + results.failed.length;
  const passRate = ((results.passed.length / total) * 100).toFixed(1);

  console.log(`${c.cyan}${c.bright}═══════════════════════════════════════════════════════════${c.reset}`);
  console.log(`${c.cyan}${c.bright}                    ROBUSTNESS REPORT                       ${c.reset}`);
  console.log(`${c.cyan}${c.bright}═══════════════════════════════════════════════════════════${c.reset}\n`);

  console.log(`${c.bright}📊 Overall Results:${c.reset}`);
  console.log(`   Total Variations: ${total}`);
  console.log(`   ${c.green}✅ Passed:${c.reset}        ${results.passed.length} (${passRate}%)`);
  console.log(`   ${c.yellow}⚠️  Warnings:${c.reset}     ${results.warnings.length}`);
  console.log(`   ${c.red}❌ Failed:${c.reset}        ${results.failed.length}\n`);

  // Per-intent breakdown
  console.log(`${c.bright}📈 Robustness by Intent:${c.reset}`);
  Object.entries(results.byIntent).forEach(([intent, stats]) => {
    const rate = ((stats.passed / stats.total) * 100).toFixed(0);
    const icon = rate >= 80 ? c.green + "✅" : rate >= 50 ? c.yellow + "⚠️" : c.red + "❌";
    console.log(`   ${icon} ${intent.padEnd(20)}: ${rate}% (${stats.passed}/${stats.total})${c.reset}`);
  });
  console.log("");

  // Variation type analysis
  const byType = { typo: 0, hinglish: 0, informal: 0, conversational: 0, garbage: 0 };
  [...results.passed, ...results.warnings, ...results.failed].forEach(r => {
    if (r.type === "typo") byType.typo++;
    else if (["hindi", "hinglish"].includes(r.type)) byType.hinglish++;
    else if (["informal", "casual", "abbreviation"].includes(r.type)) byType.informal++;
    else if (["conversational", "verbose"].includes(r.type)) byType.conversational++;
    else if (["garbage", "nonsense", "vague"].includes(r.type)) byType.garbage++;
  });

  console.log(`${c.bright}📋 Variation Type Handling:${c.reset}`);
  console.log(`   Typos:           ${byType.typo} tested`);
  console.log(`   Hinglish/Hindi:  ${byType.hinglish} tested`);
  console.log(`   Informal:        ${byType.informal} tested`);
  console.log(`   Conversational:  ${byType.conversational} tested`);
  console.log(`   Garbage/Noise:   ${byType.garbage} tested\n`);

  // Failed tests
  if (results.failed.length > 0) {
    console.log(`${c.red}${c.bright}❌ Failed Variations:${c.reset}`);
    results.failed.forEach(r => {
      console.log(`   • "${r.input}" (${r.type}) → ${r.expectedIntent}`);
      console.log(`     ${c.gray}${r.notes}${c.reset}`);
    });
    console.log("");
  }

  // Warnings
  if (results.warnings.length > 5) {
    console.log(`${c.yellow}${c.bright}⚠️  Sample Warnings (showing first 5):${c.reset}`);
    results.warnings.slice(0, 5).forEach(r => {
      console.log(`   • "${r.input}" (${r.type})`);
      console.log(`     ${c.gray}Got: "${r.response}"${c.reset}`);
    });
    console.log(`   ${c.gray}... and ${results.warnings.length - 5} more${c.reset}\n`);
  } else if (results.warnings.length > 0) {
    console.log(`${c.yellow}${c.bright}⚠️  Warnings:${c.reset}`);
    results.warnings.forEach(r => {
      console.log(`   • "${r.input}" (${r.type})`);
      console.log(`     ${c.gray}Got: "${r.response}"${c.reset}`);
    });
    console.log("");
  }

  // Final verdict
  console.log(`${c.cyan}${c.bright}═══════════════════════════════════════════════════════════${c.reset}`);

  if (passRate >= 85 && results.failed.length === 0) {
    console.log(`${c.green}${c.bright}🎉 ROBUSTNESS TEST PASSED - SYSTEM HANDLES REAL-WORLD INPUT${c.reset}`);
  } else if (passRate >= 70) {
    console.log(`${c.yellow}${c.bright}⚠️  MODERATE ROBUSTNESS - SOME IMPROVEMENTS NEEDED${c.reset}`);
  } else {
    console.log(`${c.red}${c.bright}❌ LOW ROBUSTNESS - SIGNIFICANT ISSUES DETECTED${c.reset}`);
  }

  console.log(`${c.cyan}${c.bright}═══════════════════════════════════════════════════════════${c.reset}\n`);

  // Recommendations
  console.log(`${c.bright}🔧 Recommendations:${c.reset}`);

  const weakIntents = Object.entries(results.byIntent)
    .filter(([_, stats]) => (stats.passed / stats.total) < 0.7)
    .map(([intent]) => intent);

  if (weakIntents.length > 0) {
    console.log(`   • Add more training variations for: ${weakIntents.join(", ")}`);
  }

  if (results.warnings.filter(r => r.type === "typo").length > 3) {
    console.log(`   • Consider adding fuzzy matching or spell correction`);
  }

  if (results.warnings.filter(r => ["hindi", "hinglish"].includes(r.type)).length > 3) {
    console.log(`   • Add more Hindi/Hinglish training data`);
  }

  if (results.failed.filter(r => r.type === "garbage").length > 0) {
    console.log(`   • Improve unknown intent detection for garbage input`);
  }

  if (passRate >= 85) {
    console.log(`   • System shows excellent robustness!`);
  }

  console.log("");
}

// Run the test
runRobustnessTest().catch(err => {
  console.error(`${c.red}Fatal error:${c.reset}`, err.message);
  process.exit(1);
});
