/* eslint-disable no-console */
/**
 * System Control Skill QA Test
 */

const nlp = require("./nlp");

const TESTS = [
  // Power
  { input: "shutdown my computer", expected: "system.shutdown" },
  { input: "restart system", expected: "system.restart" },
  { input: "sleep mode", expected: "system.sleep" },
  { input: "hibernate pc", expected: "system.sleep" },
  { input: "lock the screen", expected: "system.lock" },
  { input: "cancel shutdown", expected: "system.shutdown_cancel" },

  // App
  { input: "open chrome", expected: "app.open" },
  { input: "close it", expected: "app.close" }, // Context dependent? But usually classified if trained
  { input: "minimize window", expected: "app.minimize" },
  { input: "maximize window", expected: "app.maximize" },
  { input: "switch window", expected: "window.switch" },
  { input: "close window", expected: "window.close" },

  // Audio
  { input: "volume up", expected: "system.volume_up" },
  { input: "mute sound", expected: "system.mute" },
  { input: "unmute", expected: "system.unmute" },

  // Display
  { input: "brightness up", expected: "display.brightness_up" },
  { input: "night mode on", expected: "display.night_mode_on" },

  // Connectivity
  { input: "turn on wifi", expected: "system.wifi_on" },
  { input: "turn off bluetooth", expected: "system.bluetooth_off" },
  { input: "airplane mode on", expected: "system.airplane_mode_on" },

  // Battery
  { input: "battery status", expected: "system.battery_status" },
  { input: "is charger plugged in", expected: "system.power_connected" },
  { input: "power saver on", expected: "system.power_saver_on" }
];

async function run() {
  console.log("Waiting for NLP model...");
  await new Promise(r => setTimeout(r, 2000)); // Wait for generic load if async

  let passed = 0;
  for (const test of TESTS) {
    const result = await nlp.interpret(test.input);
    if (result.intent === test.expected) {
      console.log(`✅ PASS: "${test.input}" -> ${result.intent} (${result.confidence.toFixed(2)})`);
      passed++;
    } else {
      console.log(`❌ FAIL: "${test.input}" -> Got ${result.intent} (${result.confidence.toFixed(2)}), Expected ${test.expected}`);
    }
  }

  console.log(`\nResults: ${passed}/${TESTS.length} Passed`);
}

run();
