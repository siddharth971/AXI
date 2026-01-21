const router = require("./skills/router");
const sessionMemory = require("./skills/context/memory").memory; // The session memory used by router
const learning = require("./core/learning");
const registry = require("./skills/registry");

async function test() {
  console.log("🚀 Starting Learning Loop Test...");
  await registry.initialize();
  console.log(
    "Plugins loaded:",
    registry
      .getAllPlugins()
      .map((p) => p.name)
      .join(", "),
  );
  console.log(
    "Load Errors:",
    JSON.stringify(registry.getLoadErrors(), null, 2),
  );
  console.log(
    "Handler for feedback.wrong:",
    registry.getIntentHandler("feedback.wrong") ? "FOUND" : "MISSING",
  );

  // 1. Simulate a previous interaction
  // We need to inject 'lastInput' into the 'default' session context manually
  // because we are skipping the full app.js loop.
  const sessionId = "default";

  // Manually set "Memory" (Session Context)
  sessionMemory.updateGlobalContext(
    {
      lastInput: "turn off light",
      lastIntent: "device.off",
    },
    sessionId,
  );

  console.log('\n--- Step 1: User says "That was wrong" ---');
  // This triggers 'feedback.wrong', which should set 'awaiting' = 'correction_intent'
  // AND save 'faultyInput' = 'turn off light'
  const response1 = await router.execute(
    {
      intent: "feedback.wrong",
      confidence: 0.9,
      entities: {},
      params: {},
    },
    "That was wrong",
    null,
    sessionId,
  );

  console.log(`AXI: ${response1}`);

  // PROBE: Check if awaiting state is set
  const awaiting = sessionMemory.getAwaiting(sessionId);
  if (awaiting && awaiting.intent === "correction_intent") {
    console.log("✅ Awaiting state set correctly.");
  } else {
    console.log("❌ Awaiting state NOT set.");
  }

  console.log('\n--- Step 2: User says "correct command" ---');
  // The app.js usually creates the 'context_response' intent when 'awaiting' is set.
  // We simulate that here.
  const response2 = await router.execute(
    {
      intent: "context_response",
      confidence: 1.0,
      entities: { type: "correction_intent", value: "turn on light" },
      params: { type: "correction_intent", value: "turn on light" },
    },
    "turn on light",
    null,
    sessionId,
  );

  console.log(`AXI: ${response2}`);

  console.log("\n--- Step 3: Verify Log ---");
  const pending = learning.getPending();
  if (
    pending.length > 0 &&
    pending.find((p) => p.correct_intent === "turn on light")
  ) {
    console.log("✅ Correction Logged Successfully!");
    console.log(JSON.stringify(pending[pending.length - 1], null, 2));
  } else {
    console.log("❌ Correction NOT logged.");
  }
}

test().catch(console.error);
