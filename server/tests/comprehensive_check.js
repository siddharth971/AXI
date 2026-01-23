const axios = require('axios');

const API_URL = 'http://localhost:5000/api/command';

// Define test categories and commands
const testSuite = [
  {
    category: "Basic Info & System",
    tests: [
      { input: "what time is it", expectedPart: "time" },
      { input: "what is the date", expectedPart: "date" },
      { input: "battery status", expectedPart: "battery" } // Might fail if no battery module, but intent should be recognized
    ]
  },
  {
    category: "Browser & Navigation",
    tests: [
      { input: "open youtube", expectedPart: "Opening" },
      { input: "search google for weather", expectedPart: "Searching" }
    ]
  },
  {
    category: "Media Control",
    tests: [
      { input: "play music", expectedPart: "Playing" },
      { input: "stop music", expectedPart: "Stopping" },
      { input: "volume up", expectedPart: "Increased" }
    ]
  },
  {
    category: "File Operations (Safe)",
    tests: [
      { input: "list files", expectedPart: "files" },
      { input: "current directory", expectedPart: "directory" }
    ]
  },
  {
    category: "Knowledge & RAG",
    tests: [
      { input: "who is the prime minister of india", expectedPart: "Modi" }, // Realtime/Knowledge check
      { input: "what is the meaning of life", expectedPart: "42" }, // Or philosophical answer
      { input: "explain quantum computing", expectedPart: "quantum" }
    ]
  },
  {
    category: "Memory & Personalization",
    tests: [
      { input: "remember my name is JarvisTester", expectedPart: "remembered" },
      { input: "what is my name", expectedPart: "JarvisTester" }
    ]
  },
  {
    category: "Productivity",
    tests: [
      { input: "set a timer for 10 minutes", expectedPart: "Timer set" }
    ]
  },
  {
    category: "Developer Tools",
    tests: [
      { input: "git status", expectedPart: "git" }
    ]
  },
  {
    category: "Negative / Edge Cases",
    tests: [
      { input: "fsdfsdfsdfsd", expectedPart: "not sure" }, // Should be unknown
      { input: "open something weird", expectedPart: "not sure" } // Ambiguous
    ]
  }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  console.log("🚀 Starting Comprehensive AXI System Check");
  console.log("==========================================");

  let successCount = 0;
  let totalTests = 0;

  for (const category of testSuite) {
    console.log(`\n📂 Category: ${category.category}`);
    console.log("------------------------------------------");

    for (const test of category.tests) {
      totalTests++;
      process.stdout.write(`[...] Testing: "${test.input}"`);

      try {
        const start = Date.now();
        const response = await axios.post(API_URL, { text: test.input });
        const duration = Date.now() - start;
        const reply = response.data.response;

        // Simple validation: check if response contains expected keywords (case-insensitive)
        const passed = test.expectedPart ?
          reply.toLowerCase().includes(test.expectedPart.toLowerCase()) : true; // If no expectedPart, just checking for 200 OK

        // Special handling for knowledge/meaning of life which might be long
        const cleanReply = reply.length > 60 ? reply.substring(0, 57) + "..." : reply;

        if (passed) {
          console.log(`\r✅ PASSED: "${test.input}" (${duration}ms) -> "${cleanReply}"`);
          successCount++;
        } else {
          console.log(`\r❌ FAILED: "${test.input}"`);
          console.log(`    Expected substring: "${test.expectedPart}"`);
          console.log(`    Actual response:    "${reply}"`);
        }

      } catch (error) {
        console.log(`\r❌ ERROR:  "${test.input}"`);
        console.log(`    Details: ${error.message}`);
      }

      await sleep(200); // Rate limiting
    }
  }

  console.log("\n==========================================");
  console.log(`🏁 Summary: ${successCount}/${totalTests} Tests Passed`);
  console.log("==========================================");
}

runTests();
