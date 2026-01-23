/**
 * AXI Master Test Runner
 * =======================
 * 
 * Unified entry point for all test suites.
 * Supports running individual domains, suites, or full regression.
 * 
 * Usage:
 *   node run-all-tests.js                    # Full regression
 *   node run-all-tests.js --suite smoke      # Smoke tests only
 *   node run-all-tests.js --domain DOM-01    # Specific domain
 *   node run-all-tests.js --priority CRITICAL # Priority filter
 *   node run-all-tests.js --ci               # CI mode
 */

"use strict";

const config = require("./config/ci.config");
const helpers = require("./utils/test-helpers");
const { AXITestRunner, runLegacyTests } = require("./utils/test-runner");

const { colors, checkHealth, sleep } = helpers;

// ============================================================
// CLI ARGUMENT PARSING
// ============================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    suite: "regression",
    domain: null,
    priority: null,
    tags: [],
    ci: false,
    verbose: true,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case "--suite":
      case "-s":
        options.suite = next;
        i++;
        break;
      case "--domain":
      case "-d":
        options.domain = next;
        i++;
        break;
      case "--priority":
      case "-p":
        options.priority = next;
        i++;
        break;
      case "--tag":
      case "-t":
        options.tags.push(next);
        i++;
        break;
      case "--ci":
        options.ci = true;
        options.verbose = false;
        break;
      case "--verbose":
      case "-v":
        options.verbose = true;
        break;
      case "--quiet":
      case "-q":
        options.verbose = false;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
${colors.cyan}${colors.bright}AXI Test Framework - Master Runner${colors.reset}

Usage: node run-all-tests.js [options]

Options:
  --suite, -s <name>     Test suite: smoke, sanity, regression, security, performance, chaos
  --domain, -d <id>      Run specific domain: DOM-01, DOM-02, ..., DOM-10
  --priority, -p <level> Filter by priority: CRITICAL, HIGH, MAJOR, MINOR, TRIVIAL
  --tag, -t <tag>        Filter by tag (can be used multiple times)
  --ci                   CI mode (less verbose, machine-readable output)
  --verbose, -v          Verbose output
  --quiet, -q            Minimal output
  --help, -h             Show this help

Suites:
  smoke        Quick validation (~2 min)
  sanity       Core functionality (~10 min)
  regression   Complete coverage (~45 min)
  security     Security tests only (~5 min)
  performance  Performance benchmarks (~10 min)
  chaos        Edge cases and fuzzing (~20 min)

Domains:
  DOM-01  Conversational Intelligence
  DOM-02  Intent Recognition
  DOM-03  Reasoning & Logic
  DOM-04  Memory System
  DOM-05  Tool/System Integration
  DOM-06  Knowledge & RAG
  DOM-07  Performance & Reliability
  DOM-08  Security & Safety
  DOM-09  Human Experience
  DOM-10  Edge & Chaos Testing

Examples:
  node run-all-tests.js --suite smoke
  node run-all-tests.js --domain DOM-08 --verbose
  node run-all-tests.js --priority CRITICAL --ci
  node run-all-tests.js --tag @security --tag @critical
`);
}

// ============================================================
// SUITE RUNNERS
// ============================================================

/**
 * Get available test modules
 */
function getTestModules() {
  return {
    "DOM-01": {
      name: "Conversational Intelligence",
      module: "./domain_01_conversational/conversational-tests",
      runner: "runConversationalTests"
    },
    "DOM-08": {
      name: "Security & Safety",
      module: "./domain_08_security/security-tests",
      runner: "runSecurityTests"
    },
    // Legacy tests integrated
    "LEGACY": {
      name: "Legacy Comprehensive Check",
      module: "./comprehensive_check",
      legacy: true
    }
  };
}

/**
 * Run specific domain tests
 */
async function runDomainTests(domainId, options) {
  const testModules = getTestModules();
  const domainConfig = testModules[domainId];

  if (!domainConfig) {
    console.log(`${colors.red}Unknown domain: ${domainId}${colors.reset}`);
    console.log(`Available domains: ${Object.keys(testModules).join(", ")}`);
    return null;
  }

  console.log(`\n${colors.bright}Running ${domainConfig.name} tests...${colors.reset}\n`);

  try {
    const testModule = require(domainConfig.module);

    if (domainConfig.legacy) {
      // Run legacy test format
      return await runLegacyTests(require(domainConfig.module).testSuite || [], options);
    }

    // Run new format test
    const runnerFn = testModule[domainConfig.runner];
    if (runnerFn) {
      return await runnerFn(options);
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Could not load ${domainId}: ${error.message}${colors.reset}`);
    return null;
  }
}

/**
 * Run suite based on configuration
 */
async function runSuite(suiteName, options) {
  const suiteConfig = config.SUITES[suiteName];

  if (!suiteConfig) {
    console.log(`${colors.red}Unknown suite: ${suiteName}${colors.reset}`);
    return null;
  }

  console.log(`\n${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}          Running: ${suiteConfig.name}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}          ${suiteConfig.description}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════════════════════${colors.reset}\n`);

  const allResults = [];
  const testModules = getTestModules();

  // Determine which domains to run
  let domainsToRun = suiteConfig.domains || Object.keys(testModules);

  // Filter by command line domain if specified
  if (options.domain) {
    domainsToRun = [options.domain];
  }

  for (const domainId of domainsToRun) {
    const result = await runDomainTests(domainId, options);
    if (result) {
      allResults.push({ domain: domainId, ...result });
    }

    // Check bail condition
    if (suiteConfig.bail && result && result.summary && result.summary.failed > 0) {
      console.log(`${colors.yellow}Bailing due to failures in ${domainId}${colors.reset}`);
      break;
    }
  }

  return aggregateResults(allResults, suiteConfig);
}

/**
 * Aggregate results from multiple domains
 */
function aggregateResults(domainResults, suiteConfig) {
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let safetyViolations = 0;

  for (const dr of domainResults) {
    if (dr.summary) {
      totalTests += dr.summary.total || 0;
      totalPassed += dr.summary.passed || 0;
      totalFailed += dr.summary.failed || 0;
      safetyViolations += dr.summary.violations || 0;
    }
  }

  const passRate = totalTests > 0 ? totalPassed / totalTests : 0;

  // Check quality gate
  const gate = config.QUALITY_GATES[suiteConfig?.name?.toLowerCase()] || config.QUALITY_GATES.pullRequest;
  const gatePassed = passRate >= gate.testPassRate && safetyViolations === 0;

  return {
    summary: {
      totalTests,
      totalPassed,
      totalFailed,
      passRate,
      safetyViolations,
      gatePassed
    },
    domains: domainResults,
    qualityGate: {
      passed: gatePassed,
      required: gate.testPassRate,
      actual: passRate
    }
  };
}

// ============================================================
// MAIN ENTRY POINT
// ============================================================

async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  console.log(`\n${colors.cyan}${colors.bright}╔══════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}║          AXI ENTERPRISE TEST FRAMEWORK v1.0                      ║${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}║          Master Test Runner                                      ║${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}╚══════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  // Check server health
  const isHealthy = await checkHealth();
  if (!isHealthy) {
    console.log(`${colors.red}❌ Server not responding at ${config.getApiUrl()}${colors.reset}`);
    console.log(`${colors.yellow}Please start the server and try again${colors.reset}\n`);
    process.exit(1);
  }
  console.log(`${colors.green}✅ Server healthy${colors.reset}\n`);

  const startTime = Date.now();
  let result;

  // Run based on options
  if (options.domain) {
    result = await runDomainTests(options.domain, options);
  } else {
    result = await runSuite(options.suite, options);
  }

  const duration = Date.now() - startTime;

  // Final summary
  if (result && result.summary) {
    console.log(`\n${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`                         FINAL SUMMARY`);
    console.log(`${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════════════════════${colors.reset}\n`);

    console.log(`  Suite:           ${options.suite}`);
    console.log(`  Duration:        ${(duration / 1000).toFixed(1)}s`);
    console.log(`  Total Tests:     ${result.summary.totalTests}`);
    console.log(`  ${colors.green}✅ Passed:${colors.reset}        ${result.summary.totalPassed}`);
    console.log(`  ${colors.red}❌ Failed:${colors.reset}        ${result.summary.totalFailed}`);
    console.log(`  Pass Rate:       ${(result.summary.passRate * 100).toFixed(1)}%`);

    if (result.summary.safetyViolations > 0) {
      console.log(`  ${colors.red}🔴 Safety:${colors.reset}        ${result.summary.safetyViolations} violations`);
    }

    console.log("");

    // Quality gate result
    if (result.qualityGate) {
      if (result.qualityGate.passed) {
        console.log(`${colors.green}${colors.bright}✅ QUALITY GATE PASSED${colors.reset}`);
        console.log(`   Required: ${(result.qualityGate.required * 100).toFixed(0)}% | Actual: ${(result.qualityGate.actual * 100).toFixed(1)}%\n`);
      } else {
        console.log(`${colors.red}${colors.bright}❌ QUALITY GATE FAILED${colors.reset}`);
        console.log(`   Required: ${(result.qualityGate.required * 100).toFixed(0)}% | Actual: ${(result.qualityGate.actual * 100).toFixed(1)}%\n`);
        process.exitCode = 1;
      }
    }
  }

  // CI mode JSON output
  if (options.ci) {
    console.log("\n---CI_OUTPUT_START---");
    console.log(JSON.stringify(result, null, 2));
    console.log("---CI_OUTPUT_END---");
  }
}

// Run
main().catch(err => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, err.message);
  console.error(err.stack);
  process.exit(1);
});
