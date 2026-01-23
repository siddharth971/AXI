const nlp = require('../nlp/nlp');
const { logger } = require('../utils');

const TEST_CASES = [
  // Phase 2: Cloud
  { text: "scale the deployment to 5 replicas", expected: "cloud.kubernetes.deployment.scale" },
  { text: "restart the ec2 instance i-12345", expected: "cloud.aws.ec2.restart" },

  // Phase 2: Finance
  { text: "buy 10 shares of Apple", expected: "finance.trading.order.buy" },
  { text: "what is the price of Bitcoin?", expected: "finance.trading.market.quote" },

  // Phase 3: IoT
  { text: "turn on the living room lights", expected: "iot.lighting.control.on" },
  { text: "set thermostat to 72 degrees", expected: "iot.climate.hvac.set_temp" },

  // Phase 4: Education
  { text: "explain quantum physics like I'm 5", expected: "education.learning.explain.analogy" },

  // Phase 5: Gaming
  { text: "clip that", expected: "gaming.social.streaming.clip_that" },
  { text: "launch Overwatch", expected: "gaming.control.launch.start" },

  // Phase 5: Travel
  { text: "book a flight to New York", expected: "travel.booking.flight.search" },

  // Phase 6: Stress Test
  { text: "call Mom... I mean Dad", expected: "communication.call.start" }
];

async function validate() {
  console.log("=== Validating Expansion Model ===");

  let passed = 0;

  for (const test of TEST_CASES) {
    const result = await nlp.interpret(test.text);
    const success = result.intent === test.expected;
    const icon = success ? "✅" : "❌";

    console.log(`${icon} Input: "${test.text}"`);
    console.log(`   Expected: ${test.expected}`);
    console.log(`   Got:      ${result.intent} (${(result.confidence * 100).toFixed(1)}%)`);

    if (success) passed++;
  }

  console.log(`\nResults: ${passed}/${TEST_CASES.length} Passed`);

  if (passed === TEST_CASES.length) {
    console.log("🚀 Validation Successful: Model understands new domains!");
    process.exit(0);
  } else {
    console.log("⚠️  Partial Success. Retraining might be needed or intents are ambiguous.");
    process.exit(1);
  }
}

validate();
