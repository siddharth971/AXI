/**
 * AXI End-to-End NLP & Backend Validation
 * =========================================
 * Simulates real user commands and validates responses
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
  blue: "\x1b[34m",
  gray: "\x1b[90m"
};

const API_BASE = "http://localhost:5000";
const API_ENDPOINT = `${API_BASE}/api/command`;

const results = { passed: [], warnings: [], failed: [] };

const TEST_CASES = [
  // Core  
  { cat: "Core", input: "hello", pattern: /hello|hi|greetings|good/i },
  { cat: "Core", input: "what time is it", pattern: /time|\d{1,2}:\d{2}|current/i },
  { cat: "Core", input: "goodbye", pattern: /goodbye|bye|see you|take care/i },
  { cat: "Core", input: "thanks", pattern: /welcome|pleasure|glad|anytime/i },

  // Browser
  { cat: "Browser", input: "open youtube", pattern: /youtube|opening|opened/i },
  { cat: "Browser", input: "open google", pattern: /google|opening|opened/i },
  { cat: "Browser", input: "search youtube for music", pattern: /youtube|search|music/i },

  // Media
  { cat: "Media", input: "play music", pattern: /play|music|media|playing/i },
  { cat: "Media", input: "volume up", pattern: /volume|increased|louder|up/i },
  { cat: "Media", input: "mute", pattern: /mute|silence|muted/i },
  { cat: "Media", input: "pause", pattern: /pause|paused|pausing/i },

  // File
  { cat: "File", input: "list files", pattern: /file|folder|directory|list|here are|showing/i },
  { cat: "File", input: "create folder test", pattern: /folder|created|create|test/i },

  // Developer
  { cat: "Developer", input: "git status", pattern: /git|status|repository|working|changes/i },
  { cat: "Developer", input: "npm install", pattern: /npm|install|package|dependencies|installing/i },
  { cat: "Developer", input: "open vscode", pattern: /vscode|code|editor|visual studio|opening/i },

  // Knowledge
  { cat: "Knowledge", input: "calculate 10 plus 5", pattern: /15|result|equals|calculation|answer/i },
  { cat: "Knowledge", input: "what day is today", pattern: /monday|tuesday|wednesday|thursday|friday|saturday|sunday/i },
  { cat: "Knowledge", input: "convert 100 km to miles", pattern: /mile|62|convert|kilometers/i },

  // Edge
  { cat: "Edge", input: "", pattern: /didn't|understand|empty|catch/i, expectFail: true },
  { cat: "Edge", input: "random gibberish xyz", pattern: /didn't|understand|sorry|catch/i, expectFail: true },
  { cat: "Edge", input: "aaj kaun sa din hai", pattern: /monday|tuesday|wednesday|thursday|friday|saturday|sunday/i }
];

async function sendCommand(text) {
  try {
    const res = await axios.post(API_ENDPOINT, { text }, { timeout: 8000 });
    return res.data;
  } catch (error) {
    return { error: true, message: error.message };
  }
}

async function validateCommand(test) {
  try {
    const response = await sendCommand(test.input);
    const reply = response.response || response.reply || response.message || "";

    const patternMatch = test.pattern.test(reply);
    let status = "✅ PASS";
    let notes = "";

    if (!reply) {
      status = "❌ FAIL";
      notes = "No response from server";
    } else if (!patternMatch && !test.expectFail) {
      status = "⚠️ WARNING";
      notes = `Unexpected response: "${reply.substring(0, 40)}..."`;
    } else if (response.error && !test.expectFail) {
      status = "❌ FAIL";
      notes = `API Error`;
    }

    const result = {
      cat: test.cat,
      input: test.input || "(empty)",
      reply: reply.substring(0, 80),
      status,
      notes
    };

    if (status === "✅ PASS") results.passed.push(result);
    else if (status === "⚠️ WARNING") results.warnings.push(result);
    else results.failed.push(result);

    return result;
  } catch (error) {
    const result = {
      cat: test.cat,
      input: test.input,
      reply: error.message,
      status: "❌ FAIL",
      notes: "Exception"
    };
    results.failed.push(result);
    return result;
  }
}

async function runValidation() {
  console.log(`\n${c.cyan}${c.bright}═══════════════════════════════════════════════════════════${c.reset}`);
  console.log(`${c.cyan}${c.bright}       E2E NLP & BACKEND VALIDATION - RUNTIME TEST         ${c.reset}`);
  console.log(`${c.cyan}${c.bright}═══════════════════════════════════════════════════════════${c.reset}\n`);

  // Check server
  try {
    await axios.get(`${API_BASE}/api/health`, { timeout: 3000 });
    console.log(`${c.green}✅ Server running at ${API_BASE}${c.reset}\n`);
  } catch {
    console.log(`${c.red}❌ Server not responding${c.reset}\n`);
    process.exit(1);
  }

  console.log(`${c.bright}Testing ${TEST_CASES.length} commands across all categories...${c.reset}\n`);

  // Group by category
  const byCategory = {};
  TEST_CASES.forEach(tc => {
    if (!byCategory[tc.cat]) byCategory[tc.cat] = [];
    byCategory[tc.cat].push(tc);
  });

  // Test each category
  for (const [cat, tests] of Object.entries(byCategory)) {
    console.log(`${c.cyan}${c.bright}▶ ${cat} Commands${c.reset}`);

    for (const test of tests) {
      const result = await validateCommand(test);

      const icon = result.status === "✅ PASS" ? c.green + "✅" :
        result.status === "⚠️ WARNING" ? c.yellow + "⚠️" :
          c.red + "❌";

      console.log(`  ${icon} "${result.input}"${c.reset}`);
      if (result.notes) console.log(`    ${c.gray}${result.notes}${c.reset}`);
    }
    console.log("");
  }

  // Summary
  const total = results.passed.length + results.warnings.length + results.failed.length;
  const passRate = ((results.passed.length / total) * 100).toFixed(1);

  console.log(`${c.cyan}${c.bright}═══════════════════════════════════════════════════════════${c.reset}`);
  console.log(`${c.cyan}${c.bright}                      SUMMARY REPORT                        ${c.reset}`);
  console.log(`${c.cyan}${c.bright}═══════════════════════════════════════════════════════════${c.reset}\n`);

  console.log(`${c.bright}📊 Test Results:${c.reset}`);
  console.log(`   Total Commands:  ${total}`);
  console.log(`   ${c.green}✅ Passed:${c.reset}        ${results.passed.length} (${passRate}%)`);
  console.log(`   ${c.yellow}⚠️  Warnings:${c.reset}     ${results.warnings.length}`);
  console.log(`   ${c.red}❌ Failed:${c.reset}        ${results.failed.length}\n`);

  // Category breakdown
  const byCategory2 = {};
  [...results.passed, ...results.warnings, ...results.failed].forEach(r => {
    if (!byCategory2[r.cat]) byCategory2[r.cat] = { pass: 0, warn: 0, fail: 0 };
    if (r.status === "✅ PASS") byCategory2[r.cat].pass++;
    else if (r.status === "⚠️ WARNING") byCategory2[r.cat].warn++;
    else byCategory2[r.cat].fail++;
  });

  console.log(`${c.bright}📈 Category Breakdown:${c.reset}`);
  Object.entries(byCategory2).forEach(([cat, stats]) => {
    const t = stats.pass + stats.warn + stats.fail;
    const rate = ((stats.pass / t) * 100).toFixed(0);
    const icon = rate >= 80 ? c.green + "✅" : rate >= 50 ? c.yellow + "⚠️" : c.red + "❌";
    console.log(`   ${icon} ${cat.padEnd(12)}: ${rate}% (${stats.pass}/${t})${c.reset}`);
  });
  console.log("");

  if (results.failed.length > 0) {
    console.log(`${c.red}${c.bright}❌ Failed Commands:${c.reset}`);
    results.failed.forEach(r => {
      console.log(`   • "${r.input}"`);
      console.log(`     ${c.gray}${r.notes}${c.reset}`);
    });
    console.log("");
  }

  if (results.warnings.length > 0) {
    console.log(`${c.yellow}${c.bright}⚠️  Warnings (Pattern Mismatches):${c.reset}`);
    results.warnings.forEach(r => {
      console.log(`   • "${r.input}"`);
      console.log(`     ${c.gray}Got: "${r.reply}"${c.reset}`);
    });
    console.log("");
  }

  console.log(`${c.cyan}${c.bright}═══════════════════════════════════════════════════════════${c.reset}`);

  if (passRate >= 90 && results.failed.length === 0) {
    console.log(`${c.green}${c.bright}🎉 VALIDATION PASSED - SYSTEM IS PRODUCTION READY${c.reset}`);
  } else if (passRate >= 70) {
    console.log(`${c.yellow}${c.bright}⚠️  VALIDATION WARNING - MINOR ISSUES DETECTED${c.reset}`);
  } else {
    console.log(`${c.red}${c.bright}❌ VALIDATION FAILED - CRITICAL ISSUES FOUND${c.reset}`);
  }

  console.log(`${c.cyan}${c.bright}═══════════════════════════════════════════════════════════${c.reset}\n`);

  console.log(`${c.bright}🔧 Recommendations:${c.reset}`);
  if (results.warnings.length > 0) {
    console.log(`   • Review warning responses - they may be correct but unexpected`);
  }
  if (results.failed.length > 0) {
    console.log(`   • Fix failed commands - likely server or network issues`);
  }
  if (passRate >= 90) {
    console.log(`   • System is performing excellently!`);
  }
  console.log("");
}

runValidation().catch(err => {
  console.error(`${c.red}Fatal:${c.reset}`, err.message);
  process.exit(1);
});
