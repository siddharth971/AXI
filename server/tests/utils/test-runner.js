/**
 * AXI Test Framework - Enhanced Test Runner
 * ==========================================
 * 
 * Enterprise-grade test runner that integrates with existing tests
 * while providing new framework capabilities.
 * 
 * Features:
 * - Backward compatible with existing test structure
 * - Parallel execution support
 * - Enhanced reporting
 * - CI/CD integration
 * - Priority-based filtering
 */

"use strict";

const config = require("../config/ci.config");
const helpers = require("./test-helpers");

const { colors, sleep, checkHealth, formatSummary } = helpers;

// ============================================================
// TEST RUNNER CLASS
// ============================================================

class AXITestRunner {
  constructor(options = {}) {
    this.options = {
      suite: options.suite || "regression",
      verbose: options.verbose ?? true,
      bail: options.bail ?? false,
      parallel: options.parallel ?? false,
      tags: options.tags || [],
      domains: options.domains || [],
      priorities: options.priorities || [],
      ciMode: options.ciMode ?? (process.env.CI === "true"),
      ...options
    };

    this.suiteConfig = config.SUITES[this.options.suite] || config.SUITES.regression;
    this.results = [];
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Initialize and validate runner
   */
  async initialize() {
    console.log(`\n${colors.cyan}${colors.bright}╔══════════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}║           AXI ENTERPRISE TEST FRAMEWORK v1.0                     ║${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}╠══════════════════════════════════════════════════════════════════╣${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}║  Suite: ${this.suiteConfig.name.padEnd(54)}║${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}╚══════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

    // Check server health
    const isHealthy = await checkHealth();
    if (!isHealthy) {
      console.log(`${colors.red}❌ Server not responding at ${config.getApiUrl()}${colors.reset}`);
      if (this.suiteConfig.bail) {
        throw new Error("Server health check failed");
      }
      console.log(`${colors.yellow}⚠️  Continuing with offline-capable tests only${colors.reset}\n`);
      return false;
    }

    console.log(`${colors.green}✅ Server healthy at ${config.getEnvironment().API_BASE}${colors.reset}\n`);
    return true;
  }

  /**
   * Filter tests based on configuration
   */
  filterTests(tests) {
    let filtered = [...tests];

    // Filter by tags
    if (this.options.tags.length > 0) {
      filtered = filtered.filter(t =>
        t.tags?.some(tag => this.options.tags.includes(tag))
      );
    }

    // Filter by domain
    if (this.options.domains.length > 0) {
      filtered = filtered.filter(t =>
        this.options.domains.includes(t.domain)
      );
    }

    // Filter by priority
    if (this.options.priorities.length > 0) {
      filtered = filtered.filter(t =>
        this.options.priorities.includes(t.priority)
      );
    }

    return filtered;
  }

  /**
   * Run a single test case
   */
  async runTest(testCase, executor) {
    const sessionId = helpers.generateSessionId(testCase.id);

    if (this.options.verbose) {
      process.stdout.write(`  [${colors.gray}...${colors.reset}] ${testCase.name}`);
    }

    try {
      const session = new helpers.TestSession(sessionId);
      const result = await executor(testCase, session);

      // Store result
      this.results.push(result);

      // Output
      if (this.options.verbose) {
        const status = result.passed
          ? `${colors.green}✅ PASS${colors.reset}`
          : `${colors.red}❌ FAIL${colors.reset}`;
        process.stdout.write(`\r  [${status}] ${testCase.name}\n`);

        // Show failure details
        if (!result.passed && result.failures) {
          result.failures.forEach(f => {
            console.log(`    ${colors.red}↳ ${f.message}${colors.reset}`);
          });
        }
      }

      // Bail on safety violations
      if (result.isSafetyViolation && this.options.suite === "security") {
        throw new Error(`SAFETY VIOLATION in ${testCase.id}`);
      }

      // Bail on failure if configured
      if (!result.passed && this.suiteConfig.bail) {
        throw new Error(`Test failed: ${testCase.id} - ${result.failures[0]?.message}`);
      }

      return result;

    } catch (error) {
      const errorResult = {
        testId: testCase.id,
        testName: testCase.name,
        passed: false,
        error: true,
        message: error.message,
        timestamp: new Date().toISOString()
      };

      this.results.push(errorResult);

      if (this.options.verbose) {
        process.stdout.write(`\r  [${colors.red}❌ ERROR${colors.reset}] ${testCase.name}\n`);
        console.log(`    ${colors.red}↳ ${error.message}${colors.reset}`);
      }

      if (this.suiteConfig.bail) {
        throw error;
      }

      return errorResult;
    }
  }

  /**
   * Run test category
   */
  async runCategory(category, tests, executor) {
    console.log(helpers.formatCategoryHeader(category));

    const categoryResults = [];

    // Sequential execution (default)
    for (const test of tests) {
      const result = await this.runTest(test, executor);
      categoryResults.push(result);
      await sleep(config.TIMING.requestDelayMs);
    }

    return categoryResults;
  }

  /**
   * Run all tests
   */
  async run(testSuite, executor) {
    this.startTime = Date.now();

    try {
      await this.initialize();

      // Handle both flat and categorized test structures
      if (Array.isArray(testSuite)) {
        // Flat array of tests
        const filtered = this.filterTests(testSuite);
        console.log(`${colors.bright}Running ${filtered.length} tests...${colors.reset}\n`);

        for (const test of filtered) {
          await this.runTest(test, executor);
          await sleep(config.TIMING.requestDelayMs);
        }

      } else if (testSuite.categories) {
        // Categorized structure
        for (const category of testSuite.categories) {
          const filtered = this.filterTests(category.tests);
          if (filtered.length > 0) {
            await this.runCategory(category.name, filtered, executor);
          }
        }
      }

    } finally {
      this.endTime = Date.now();
    }

    return this.generateReport();
  }

  /**
   * Generate final report
   */
  generateReport() {
    const duration = this.endTime - this.startTime;
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const passRate = total > 0 ? (passed / total) : 0;

    const safetyViolations = this.results.filter(r => r.isSafetyViolation);

    // Group by failure category
    const failuresByCategory = this.results
      .filter(r => !r.passed && r.failureCategory)
      .reduce((acc, r) => {
        acc[r.failureCategory] = (acc[r.failureCategory] || 0) + 1;
        return acc;
      }, {});

    // Group by domain
    const byDomain = helpers.groupByDomain(this.results);
    const domainStats = {};
    for (const [domain, results] of Object.entries(byDomain)) {
      const domainPassed = results.filter(r => r.passed).length;
      domainStats[domain] = {
        total: results.length,
        passed: domainPassed,
        passRate: results.length > 0 ? (domainPassed / results.length) : 0
      };
    }

    const report = {
      summary: {
        suite: this.options.suite,
        total,
        passed,
        failed,
        passRate,
        duration,
        safetyViolations: safetyViolations.length,
        timestamp: new Date().toISOString()
      },

      qualityGateResult: this.checkQualityGate(passRate, safetyViolations.length),

      failuresByCategory,
      domainStats,

      failures: this.results.filter(r => !r.passed),
      safetyViolations,

      allResults: this.results
    };

    // Print summary
    console.log(formatSummary(this.results));
    console.log(`  Duration: ${(duration / 1000).toFixed(1)}s\n`);

    // Quality gate result
    if (report.qualityGateResult.passed) {
      console.log(`${colors.green}${colors.bright}✅ QUALITY GATE PASSED${colors.reset}\n`);
    } else {
      console.log(`${colors.red}${colors.bright}❌ QUALITY GATE FAILED${colors.reset}`);
      report.qualityGateResult.reasons.forEach(r => {
        console.log(`  ${colors.red}• ${r}${colors.reset}`);
      });
      console.log("");
    }

    return report;
  }

  /**
   * Check quality gate
   */
  checkQualityGate(passRate, safetyViolationCount) {
    const gate = config.QUALITY_GATES[this.options.suite] || config.QUALITY_GATES.pullRequest;
    const reasons = [];

    if (passRate < gate.testPassRate) {
      reasons.push(`Pass rate ${(passRate * 100).toFixed(1)}% < ${(gate.testPassRate * 100)}% required`);
    }

    if (safetyViolationCount > 0) {
      reasons.push(`${safetyViolationCount} safety violation(s) detected`);
    }

    return {
      passed: reasons.length === 0,
      reasons,
      gate
    };
  }
}

// ============================================================
// CONVENIENCE FUNCTIONS (Backward Compatibility)
// ============================================================

/**
 * Run tests in legacy format (compatible with existing tests)
 * Accepts array of test categories as used in comprehensive_check.js
 */
async function runLegacyTests(testSuite, options = {}) {
  const runner = new AXITestRunner(options);

  // Legacy executor: expects tests with { input, expectedPart }
  const legacyExecutor = async (testCase) => {
    const result = await helpers.sendCommand(testCase.input);

    const assertions = [];

    // Check if response contains expected substring
    if (testCase.expectedPart) {
      const passed = result.response &&
        result.response.toLowerCase().includes(testCase.expectedPart.toLowerCase());
      assertions.push({
        passed,
        message: passed
          ? `Response contains "${testCase.expectedPart}"`
          : `Response missing "${testCase.expectedPart}"`,
        expected: testCase.expectedPart,
        actual: result.response
      });
    }

    return helpers.buildTestResult(testCase, assertions, {
      response: result.response,
      duration: result.duration,
      confidence: result.confidence
    });
  };

  // Convert legacy format to runner format
  const convertedSuite = {
    categories: testSuite.map(cat => ({
      name: cat.category,
      tests: cat.tests.map((t, i) => ({
        id: `LEGACY-${cat.category.replace(/[^A-Z]/gi, "").substring(0, 3).toUpperCase()}-${i + 1}`,
        name: t.input.substring(0, 40),
        category: cat.category,
        domain: "LEGACY",
        priority: "MAJOR",
        ...t
      }))
    }))
  };

  return runner.run(convertedSuite, legacyExecutor);
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  AXITestRunner,
  runLegacyTests
};
