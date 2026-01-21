/**
 * Comprehensive Skill Test Suite
 * Tests all plugins and their intents
 */

"use strict";

const http = require("http");

const tests = [
  // ============ System Plugin ============
  { plugin: "system", name: "greeting", text: "hello" },
  { plugin: "system", name: "tell_time", text: "what time is it" },
  { plugin: "system", name: "tell_date", text: "what is today's date" },
  { plugin: "system", name: "tell_joke", text: "tell me a joke" },
  { plugin: "system", name: "system_info", text: "show system info" },
  { plugin: "system", name: "who_are_you", text: "who are you" },
  { plugin: "system", name: "goodbye", text: "goodbye" },
  { plugin: "system", name: "how_are_you", text: "how are you" },
  { plugin: "system", name: "thanks", text: "thank you" },

  // ============ Browser Plugin ============
  { plugin: "browser", name: "open_youtube", text: "open youtube" },
  { plugin: "browser", name: "open_google", text: "open google" },
  { plugin: "browser", name: "google_search", text: "search google for weather" },
  { plugin: "browser", name: "search_youtube", text: "search youtube for music" },

  // ============ Knowledge Plugin ============
  { plugin: "knowledge", name: "calculate", text: "calculate 25 times 4" },
  { plugin: "knowledge", name: "unit_convert", text: "convert 100 km to miles" },
  { plugin: "knowledge", name: "what_day", text: "what day is today" },
  { plugin: "knowledge", name: "date_math", text: "what date is 10 days from now" },
  { plugin: "knowledge", name: "currency", text: "convert 100 usd to inr" },

  // ============ Media Plugin ============
  { plugin: "media", name: "volume_up", text: "increase volume" },
  { plugin: "media", name: "mute", text: "mute the system" },

  // ============ File Plugin ============
  { plugin: "file", name: "list_files", text: "list files in documents" },

  // ============ Developer Plugin ============
  { plugin: "developer", name: "git_status", text: "show git status" }
];

function testSkill(test) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ text: test.text });
    const options = {
      hostname: "localhost",
      port: 5000,
      path: "/api/command",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const result = JSON.parse(body);
          resolve({ ...test, success: true, response: result.response });
        } catch (e) {
          resolve({ ...test, success: false, error: "Parse error" });
        }
      });
    });

    req.on("error", (e) => resolve({ ...test, success: false, error: e.message }));
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("\n🧪 COMPREHENSIVE SKILL TEST SUITE");
  console.log("=".repeat(70) + "\n");

  let passed = 0;
  let failed = 0;
  let currentPlugin = "";

  for (const test of tests) {
    // Print plugin header
    if (test.plugin !== currentPlugin) {
      currentPlugin = test.plugin;
      console.log(`\n📦 ${currentPlugin.toUpperCase()} PLUGIN`);
      console.log("-".repeat(50));
    }

    const result = await testSkill(test);

    if (result.success && result.response) {
      const shortResponse = result.response.length > 60
        ? result.response.substring(0, 60) + "..."
        : result.response;
      console.log(`✅ ${result.name}`);
      console.log(`   Input: "${result.text}"`);
      console.log(`   Response: ${shortResponse}`);
      passed++;
    } else {
      console.log(`❌ ${result.name}`);
      console.log(`   Input: "${result.text}"`);
      console.log(`   Error: ${result.error || "No response"}`);
      failed++;
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log(`📊 RESULTS: ${passed} passed, ${failed} failed`);
  console.log("=".repeat(70) + "\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error("Test suite failed:", error);
  process.exit(1);
});
