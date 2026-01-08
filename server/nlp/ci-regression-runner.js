/**
 * CI/CD Compatible Regression Test Runner
 * ========================================
 * 
 * Produces machine-readable JSON output for CI/CD pipelines.
 * Use: npm run test:regression:ci
 * 
 * Exit codes:
 *   0 - All tests passed
 *   1 - Tests failed or unsafe execution detected
 */

"use strict";

const { runRegressionTests } = require("./regression-conversation-tests");
const fs = require("fs");
const path = require("path");

async function runCITests() {
  console.log("Running Conversational Intelligence Regression Tests in CI mode...\n");

  const startTime = Date.now();

  const result = await runRegressionTests({
    ciMode: false,  // We handle exit ourselves
    verbose: true,
    skipBackend: true  // NLP-only for CI speed
  });

  const duration = Date.now() - startTime;

  // Generate JSON report
  const report = {
    timestamp: new Date().toISOString(),
    duration: `${duration}ms`,
    summary: {
      total: result.total,
      passed: result.passed,
      failed: result.failed,
      passRate: ((result.passed / result.total) * 100).toFixed(1) + "%",
      unsafeExecutions: result.unsafeExecutions,
      regressionDetected: result.regressionDetected
    },
    failedScenarios: result.results.failed.map(f => ({
      category: f.category,
      scenario: f.scenario,
      input: f.input || f.turns?.join(" → "),
      actualIntent: f.actualIntent || f.detectedIntent,
      expectedIntent: f.expectedIntent || f.expectedIntents?.join(", "),
      notes: f.notes,
      unsafe: f.unsafe || false
    })),
    categories: {}
  };

  // Aggregate by category
  [...result.results.passed, ...result.results.failed].forEach(r => {
    if (!report.categories[r.category]) {
      report.categories[r.category] = { passed: 0, failed: 0 };
    }
    if (r.passed) {
      report.categories[r.category].passed++;
    } else {
      report.categories[r.category].failed++;
    }
  });

  // Write report to file
  const reportPath = path.join(__dirname, "regression-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 JSON report saved to: ${reportPath}`);

  // CI summary
  console.log("\n" + "=".repeat(60));
  console.log("CI/CD SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total: ${report.summary.total}`);
  console.log(`Passed: ${report.summary.passed}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Pass Rate: ${report.summary.passRate}`);
  console.log(`Regression Detected: ${report.summary.regressionDetected}`);
  console.log(`Unsafe Executions: ${report.summary.unsafeExecutions}`);
  console.log("=".repeat(60));

  // Exit with appropriate code
  const exitCode = (result.failed > 0 || result.unsafeExecutions > 0) ? 1 : 0;
  console.log(`\nExiting with code: ${exitCode}`);
  process.exit(exitCode);
}

// Run if called directly
if (require.main === module) {
  runCITests().catch(err => {
    console.error("CI Test Runner Error:", err.message);
    process.exit(1);
  });
}

module.exports = { runCITests };
