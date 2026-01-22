/**
 * Verification Script for Backend Improvements
 * --------------------------------------------
 * 1. Validation Logic
 * 2. Knowledge Handler Logic
 * 3. Scheduler Logic
 */

const { z } = require("zod");
const assert = require("assert");
const knowledgeHandler = require("../skills/knowledge-handler");
const { schemas } = require("../utils/validator");
const scheduler = require("../core/scheduler");

console.log("🔍 Verifying Backend Improvements...\n");

// Test 1: Data Validation
console.log("1️⃣  Testing Data Validation...");
try {
  // Valid
  schemas.command.parse({ text: "Hello" });
  console.log("   ✅ Valid command passed");

  // Invalid (Empty)
  try {
    schemas.command.parse({ text: "" });
    console.error("   ❌ Failed: Empty command should throw");
  } catch (e) {
    console.log("   ✅ Empty command rejected (Good)");
  }

  // Invalid (Type)
  try {
    schemas.command.parse({ text: 123 });
    console.error("   ❌ Failed: Numeric command should throw");
  } catch (e) {
    console.log("   ✅ Numeric command rejected (Good)");
  }
} catch (e) {
  console.error("   ❌ Validation test failed:", e);
}

// Test 2: Knowledge Handler
console.log("\n2️⃣  Testing Knowledge Handler (RAG)...");
try {
  // We know "flavor365_com" intent exists from vectors
  const response = knowledgeHandler.handle("knowledge:flavor365_com");

  if (response.includes("Flavor365")) {
    console.log("   ✅ Handler retrieved flavor365 blueprint");
    console.log("   📝 Output Snippet:", response.substring(0, 50) + "...");
  } else {
    console.error("   ❌ Handler returned unexpected output:", response);
  }

  // Test missing
  const missing = knowledgeHandler.handle("knowledge:fake_site_com");
  if (missing.includes("haven't explored")) {
    console.log("   ✅ Handler handled missing blueprint gracefully");
  }
} catch (e) {
  console.error("   ❌ Knowledge test failed:", e);
}

// Test 3: Scheduler
console.log("\n3️⃣  Testing Scheduler Registration...");
try {
  scheduler.init();
  const jobs = scheduler.jobs.map(j => j.name);

  if (jobs.includes("Autonomous Cycle")) {
    console.log("   ✅ 'Autonomous Cycle' job is registered");
  } else {
    console.error("   ❌ Job missing. Found:", jobs);
  }
} catch (e) {
  console.error("   ❌ Scheduler test failed:", e);
}

console.log("\n✨ Verification Complete.");
process.exit(0);
