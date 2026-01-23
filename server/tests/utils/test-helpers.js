/**
 * AXI Test Framework - Test Helpers & Utilities
 * ==============================================
 * 
 * Common utilities for test execution, assertion, and reporting.
 * Designed to integrate with existing test infrastructure.
 */

"use strict";

const axios = require("axios");
const config = require("../config/ci.config");

// Console colors for output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m"
};

// ============================================================
// SESSION MANAGEMENT
// ============================================================

/**
 * Generate unique session ID for test isolation
 */
function generateSessionId(prefix = "test") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Session manager for multi-turn test handling
 */
class TestSession {
  constructor(sessionId = null) {
    this.sessionId = sessionId || generateSessionId();
    this.turns = [];
    this.startTime = Date.now();
    this.metadata = {};
  }

  addTurn(input, response, intent, confidence) {
    this.turns.push({
      index: this.turns.length,
      input,
      response,
      intent,
      confidence,
      timestamp: Date.now()
    });
  }

  getTurnCount() {
    return this.turns.length;
  }

  getLastTurn() {
    return this.turns[this.turns.length - 1] || null;
  }

  getDuration() {
    return Date.now() - this.startTime;
  }

  toJSON() {
    return {
      sessionId: this.sessionId,
      turns: this.turns,
      duration: this.getDuration(),
      metadata: this.metadata
    };
  }
}

// ============================================================
// API INTERACTION
// ============================================================

/**
 * Send command to AXI API
 * Compatible with existing test pattern
 */
async function sendCommand(text, options = {}) {
  const {
    sessionId = "default",
    timeout = config.TIMING.singleTestTimeoutMs,
    retries = config.getEnvironment().RETRY_COUNT
  } = options;

  const apiUrl = config.getApiUrl();
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const start = Date.now();
      const response = await axios.post(apiUrl, {
        text,
        sessionId
      }, {
        headers: { "Content-Type": "application/json" },
        timeout
      });

      const duration = Date.now() - start;

      return {
        success: true,
        response: response.data.response || response.data.reply,
        intent: response.data.intent,
        confidence: response.data.confidence,
        data: response.data,
        duration,
        attempt
      };
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(100 * (attempt + 1)); // Exponential backoff
      }
    }
  }

  return {
    success: false,
    error: true,
    message: lastError?.message || "Unknown error",
    response: null,
    intent: null,
    confidence: null
  };
}

/**
 * Check server health
 */
async function checkHealth(timeout = 3000) {
  try {
    const healthUrl = config.getHealthUrl();
    await axios.get(healthUrl, { timeout });
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// ASSERTIONS
// ============================================================

/**
 * Assert intent matches expected (with alternates)
 */
function assertIntentMatch(actual, expected, alternates = []) {
  if (actual === expected) {
    return { passed: true, message: `Intent matched: ${actual}` };
  }

  if (alternates && alternates.includes(actual)) {
    return {
      passed: true,
      message: `Intent matched alternate: ${actual} (expected: ${expected})`
    };
  }

  return {
    passed: false,
    message: `Intent mismatch: got "${actual}", expected "${expected}"`,
    expected,
    actual,
    alternates
  };
}

/**
 * Assert confidence meets threshold
 */
function assertConfidence(actual, threshold) {
  const passed = actual >= threshold;
  return {
    passed,
    message: passed
      ? `Confidence ${actual.toFixed(3)} >= ${threshold}`
      : `Confidence too low: ${actual.toFixed(3)} < ${threshold}`,
    actual,
    threshold
  };
}

/**
 * Assert response contains pattern
 */
function assertResponsePattern(response, pattern) {
  const regex = typeof pattern === "string" ? new RegExp(pattern, "i") : pattern;
  const passed = regex.test(response);

  return {
    passed,
    message: passed
      ? `Response matches pattern: ${pattern}`
      : `Response does not match pattern: ${pattern}`,
    pattern: pattern.toString(),
    response: response?.substring(0, 100)
  };
}

/**
 * Assert safety - action was NOT executed
 */
function assertSafetyBlocked(result, actionType = "unsafe") {
  // Safety check: low confidence or clarification requested
  const isBlocked =
    result.confidence < config.CONFIDENCE.HIGH ||
    (result.response && /not sure|clarif|rephrase/i.test(result.response));

  return {
    passed: isBlocked,
    message: isBlocked
      ? `${actionType} action was safely blocked`
      : `UNSAFE: ${actionType} action was NOT blocked`,
    confidence: result.confidence,
    safetyViolation: !isBlocked
  };
}

/**
 * Assert latency within threshold
 */
function assertLatency(durationMs, maxMs) {
  const passed = durationMs <= maxMs;
  return {
    passed,
    message: passed
      ? `Latency ${durationMs}ms <= ${maxMs}ms`
      : `Latency exceeded: ${durationMs}ms > ${maxMs}ms`,
    actual: durationMs,
    threshold: maxMs
  };
}

// ============================================================
// TEST RESULT BUILDERS
// ============================================================

/**
 * Build a standard test result
 */
function buildTestResult(testCase, assertions, additionalData = {}) {
  const allPassed = assertions.every(a => a.passed);
  const failures = assertions.filter(a => !a.passed);
  const safetyViolations = assertions.filter(a => a.safetyViolation);

  return {
    testId: testCase.id,
    testName: testCase.name,
    category: testCase.category,
    domain: testCase.domain,
    priority: testCase.priority,

    passed: allPassed,
    assertions,
    failures,
    safetyViolations,

    isSafetyViolation: safetyViolations.length > 0,
    failureCategory: !allPassed ? classifyFailure(failures) : null,

    timestamp: new Date().toISOString(),
    ...additionalData
  };
}

/**
 * Classify failure into category
 */
function classifyFailure(failures) {
  for (const f of failures) {
    if (f.safetyViolation) return "F-SAF";
    if (f.message?.includes("Intent mismatch")) return "F-INT";
    if (f.message?.includes("Confidence")) return "F-CNF";
    if (f.message?.includes("Context")) return "F-CTX";
    if (f.message?.includes("Latency")) return "F-TMO";
    if (f.message?.includes("Security")) return "F-SEC";
  }
  return "F-RSP"; // Default to response error
}

// ============================================================
// OUTPUT FORMATTING
// ============================================================

/**
 * Format test status for console
 */
function formatStatus(passed, message = "") {
  const icon = passed ? `${colors.green}✅` : `${colors.red}❌`;
  const status = passed ? "PASS" : "FAIL";
  return `${icon} ${status}${colors.reset}${message ? `: ${message}` : ""}`;
}

/**
 * Format test category header
 */
function formatCategoryHeader(category) {
  return `\n${colors.cyan}${colors.bright}📂 ${category}${colors.reset}\n${"─".repeat(50)}`;
}

/**
 * Format test summary
 */
function formatSummary(results) {
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  const passRate = ((passed / total) * 100).toFixed(1);

  const safetyViolations = results.filter(r => r.isSafetyViolation).length;

  return `
${colors.cyan}${colors.bright}═══════════════════════════════════════════════════${colors.reset}
                    TEST SUMMARY
${colors.cyan}${colors.bright}═══════════════════════════════════════════════════${colors.reset}

  Total Tests:     ${total}
  ${colors.green}✅ Passed:${colors.reset}        ${passed} (${passRate}%)
  ${colors.red}❌ Failed:${colors.reset}        ${failed}
  ${colors.red}🔴 Safety:${colors.reset}        ${safetyViolations} violations

${colors.cyan}${colors.bright}═══════════════════════════════════════════════════${colors.reset}
`;
}

/**
 * Truncate response for display
 */
function truncateResponse(response, maxLength = 60) {
  if (!response) return "N/A";
  if (response.length <= maxLength) return response;
  return response.substring(0, maxLength - 3) + "...";
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Async sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse decision from confidence level
 */
function getDecision(confidence) {
  if (confidence >= config.CONFIDENCE.HIGH) return "execute";
  if (confidence >= config.CONFIDENCE.MEDIUM) return "execute";
  if (confidence >= config.CONFIDENCE.LOW) return "clarify";
  return "unknown";
}

/**
 * Calculate priority score
 */
function calculatePriorityScore(userImpact, securityRisk, frequency, workaround) {
  // Weights from framework spec
  const score =
    (userImpact * 0.4) +
    (securityRisk * 0.3) +
    (frequency * 0.15) +
    (workaround * 0.15);

  if (score >= 4.0) return "CRITICAL";
  if (score >= 3.0) return "HIGH";
  if (score >= 2.0) return "MAJOR";
  if (score >= 1.0) return "MINOR";
  return "TRIVIAL";
}

/**
 * Group results by category
 */
function groupByCategory(results) {
  return results.reduce((acc, result) => {
    const cat = result.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(result);
    return acc;
  }, {});
}

/**
 * Group results by domain
 */
function groupByDomain(results) {
  return results.reduce((acc, result) => {
    const domain = result.domain || "UNKNOWN";
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(result);
    return acc;
  }, {});
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  // Session management
  generateSessionId,
  TestSession,

  // API interaction
  sendCommand,
  checkHealth,

  // Assertions
  assertIntentMatch,
  assertConfidence,
  assertResponsePattern,
  assertSafetyBlocked,
  assertLatency,

  // Result building
  buildTestResult,
  classifyFailure,

  // Formatting
  formatStatus,
  formatCategoryHeader,
  formatSummary,
  truncateResponse,
  colors,

  // Utilities
  sleep,
  getDecision,
  calculatePriorityScore,
  groupByCategory,
  groupByDomain
};
