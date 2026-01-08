/**
 * Plugin System Test Suite
 * -------------------------
 * Validates the plugin-based skill execution engine.
 * Run with: node skills/test.js
 */

"use strict";

const skills = require("./index");

const TESTS = [
  {
    name: "Registry initialization",
    async run() {
      await skills.initialize();
      const plugins = skills.getPlugins();
      const intents = skills.getIntents();

      if (plugins.length < 6) throw new Error("Expected at least 6 plugins");
      if (intents.length < 50) throw new Error("Expected at least 50 intents");

      return `Loaded ${plugins.length} plugins with ${intents.length} intents`;
    }
  },
  {
    name: "Tell time intent",
    async run() {
      const result = await skills.execute(
        { intent: "tell_time", confidence: 0.9 },
        "what time is it"
      );
      if (!result.includes("time")) throw new Error("Expected time in response");
      return result;
    }
  },
  {
    name: "Greeting intent",
    async run() {
      const result = await skills.execute(
        { intent: "greeting", confidence: 0.8 },
        "hello"
      );
      if (!result) throw new Error("Expected greeting response");
      return result;
    }
  },
  {
    name: "Calculate intent",
    async run() {
      const result = await skills.execute(
        { intent: "calculate", confidence: 0.9, params: { expression: "10 * 5" } },
        "calculate 10 times 5"
      );
      if (!result.includes("50")) throw new Error("Expected 50 in result");
      return result;
    }
  },
  {
    name: "Unit conversion intent",
    async run() {
      const result = await skills.execute(
        { intent: "unit_convert", confidence: 0.9, params: { value: 100, from: "km", to: "mi" } },
        "convert 100 km to miles"
      );
      if (!result.includes("62")) throw new Error("Expected ~62 miles");
      return result;
    }
  },
  {
    name: "Low confidence fallback",
    async run() {
      const result = await skills.execute(
        { intent: "some_intent", confidence: 0.2 },
        "gibberish"
      );
      if (!result) throw new Error("Expected fallback response");
      return `Fallback triggered: ${result}`;
    }
  },
  {
    name: "Unknown intent fallback",
    async run() {
      const result = await skills.execute(
        { intent: "nonexistent_crazy_intent", confidence: 0.9 },
        "do something crazy"
      );
      if (!result) throw new Error("Expected plugin not found response");
      return `Plugin not found: ${result}`;
    }
  },
  {
    name: "Confirmation flow - request",
    async run() {
      const result = await skills.execute(
        { intent: "delete_file", confidence: 0.9, params: { filename: "important.txt" } },
        "delete important.txt",
        null,
        "test-session-1"
      );
      if (!result.includes("sure")) throw new Error("Expected confirmation request");
      return `Confirmation requested: ${result}`;
    }
  },
  {
    name: "Confirmation flow - cancel",
    async run() {
      const result = await skills.execute(
        { intent: "ai_chat", confidence: 0.3 },
        "no",
        null,
        "test-session-1"
      );
      if (!result.includes("cancelled")) throw new Error("Expected cancellation response");
      return `Cancelled: ${result}`;
    }
  },
  {
    name: "Plugin metadata retrieval",
    async run() {
      const metadata = skills.registry.getIntentMetadata("take_screenshot");
      if (!metadata) throw new Error("Expected metadata for take_screenshot");
      if (metadata.pluginName !== "system") throw new Error("Expected system plugin");
      return `Metadata: plugin=${metadata.pluginName}, confidence=${metadata.confidence}`;
    }
  },
  {
    name: "Hot reload functionality",
    async run() {
      const beforeCount = skills.getIntents().length;
      await skills.reload();
      const afterCount = skills.getIntents().length;
      if (beforeCount !== afterCount) throw new Error("Intent count mismatch after reload");
      return `Reloaded successfully: ${afterCount} intents`;
    }
  }
];

async function runTests() {
  console.log("\n🧪 Plugin System Test Suite\n" + "=".repeat(50) + "\n");

  let passed = 0;
  let failed = 0;

  for (const test of TESTS) {
    process.stdout.write(`Testing: ${test.name}... `);

    try {
      const result = await test.run();
      console.log(`✅ PASS`);
      console.log(`   └─ ${result}\n`);
      passed++;
    } catch (error) {
      console.log(`❌ FAIL`);
      console.log(`   └─ Error: ${error.message}\n`);
      failed++;
    }
  }

  console.log("=".repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("=".repeat(50) + "\n");

  // Print plugin summary
  console.log("📦 Loaded Plugins:");
  skills.getPlugins().forEach(p => {
    console.log(`   • ${p.name}: ${p.intents.length} intents`);
    console.log(`     └─ ${p.intents.slice(0, 5).join(", ")}${p.intents.length > 5 ? "..." : ""}`);
  });

  console.log("\n📊 System Status:", skills.getStatus());

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error("Test suite failed:", error);
  process.exit(1);
});
