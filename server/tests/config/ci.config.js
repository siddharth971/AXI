/**
 * AXI Test Framework - CI Configuration
 * ======================================
 * 
 * Central configuration for all test environments and CI pipelines.
 * Maintains backward compatibility with existing test infrastructure.
 */

"use strict";

// Quality Thresholds
const THRESHOLDS = {
  // Confidence thresholds (matching existing system)
  confidence: {
    HIGH: 0.7,      // Execute immediately
    MEDIUM: 0.4,    // May need clarification
    LOW: 0.25,      // Unknown / reject
    FLOOR: 0.25     // Minimum for any action
  },

  // Quality gates
  quality: {
    testPassRateMin: 0.95,        // 95% minimum pass rate
    intentAccuracyMin: 0.93,      // 93% intent accuracy
    latencyP95MaxMs: 2000,        // 2 second max for 95th percentile
    memoryGrowthMaxMB: 50,        // Max memory growth in MB
    flakyTestRateMax: 0.02        // Max 2% flaky tests
  },

  // Test timing limits
  timing: {
    smokeTimeoutMs: 120000,       // 2 minutes for smoke
    regressionTimeoutMs: 2700000, // 45 minutes for regression
    singleTestTimeoutMs: 8000,    // 8 seconds per test
    requestDelayMs: 100           // Delay between requests
  }
};

// Environment Configuration
const ENVIRONMENTS = {
  local: {
    API_BASE: "http://localhost:5000",
    API_ENDPOINT: "/api/command",
    HEALTH_ENDPOINT: "/api/health",
    TIMEOUT_MS: 8000,
    RETRY_COUNT: 2,
    PARALLEL_TESTS: 1,
    VERBOSE: true
  },

  ci: {
    API_BASE: process.env.TEST_API_URL || "http://localhost:5000",
    API_ENDPOINT: "/api/command",
    HEALTH_ENDPOINT: "/api/health",
    TIMEOUT_MS: parseInt(process.env.TEST_TIMEOUT) || 8000,
    RETRY_COUNT: parseInt(process.env.TEST_RETRIES) || 2,
    PARALLEL_TESTS: parseInt(process.env.PARALLEL_TESTS) || 4,
    VERBOSE: false
  },

  production: {
    API_BASE: process.env.PROD_API_URL,
    API_ENDPOINT: "/api/command",
    HEALTH_ENDPOINT: "/api/health",
    TIMEOUT_MS: 10000,
    RETRY_COUNT: 3,
    PARALLEL_TESTS: 2,
    VERBOSE: false
  }
};

// Test Suite Configurations
const SUITES = {
  smoke: {
    name: "Smoke Tests",
    description: "Quick validation of core functionality",
    timeout: THRESHOLDS.timing.smokeTimeoutMs,
    bail: true,          // Stop on first failure
    tags: ["@smoke"],
    priority: ["CRITICAL"],
    domains: ["DOM-01", "DOM-02"],
    parallel: false
  },

  sanity: {
    name: "Sanity Tests",
    description: "Core functionality verification",
    timeout: 600000,     // 10 minutes
    bail: false,
    tags: ["@sanity", "@primary"],
    priority: ["CRITICAL", "HIGH"],
    domains: ["DOM-01", "DOM-02", "DOM-04", "DOM-05"],
    parallel: true
  },

  regression: {
    name: "Full Regression",
    description: "Complete test coverage",
    timeout: THRESHOLDS.timing.regressionTimeoutMs,
    bail: false,
    tags: ["@regression"],
    priority: ["CRITICAL", "HIGH", "MAJOR"],
    domains: null,       // All domains
    parallel: true
  },

  security: {
    name: "Security Tests",
    description: "Security and safety validation",
    timeout: 300000,     // 5 minutes
    bail: true,          // Any security failure stops
    tags: ["@security"],
    priority: ["CRITICAL"],
    domains: ["DOM-08"],
    parallel: false,     // Sequential for isolation
    isolation: true
  },

  performance: {
    name: "Performance Tests",
    description: "Latency and load testing",
    timeout: 600000,     // 10 minutes
    bail: false,
    tags: ["@performance"],
    priority: null,
    domains: ["DOM-07"],
    parallel: false,
    benchmarking: true
  },

  chaos: {
    name: "Chaos/Edge Tests",
    description: "Edge cases and chaos testing",
    timeout: 1200000,    // 20 minutes
    bail: false,
    tags: ["@chaos", "@edge"],
    priority: ["MINOR", "TRIVIAL"],
    domains: ["DOM-10"],
    parallel: true
  }
};

// Reporting Configuration
const REPORTERS = {
  console: {
    enabled: true,
    colors: true,
    showPassedTests: false,
    showFailureDetails: true
  },

  junit: {
    enabled: process.env.CI === "true",
    outputDir: "./reports/junit",
    filename: "test-results.xml"
  },

  html: {
    enabled: true,
    outputDir: "./reports/html",
    filename: "test-report.html"
  },

  json: {
    enabled: true,
    outputDir: "./reports",
    filename: "test-results.json"
  }
};

// Quality Gate Definitions
const QUALITY_GATES = {
  commit: {
    testPassRate: 1.0,           // 100% for smoke tests
    maxFailures: 0,
    maxDuration: 120000,         // 2 minutes
    requiredSuites: ["smoke"]
  },

  pullRequest: {
    testPassRate: 0.98,          // 98% for regression
    intentAccuracy: 0.93,        // 93% intent accuracy
    safetyViolations: 0,         // Zero tolerance
    maxNewFlaky: 0,
    maxDuration: 2700000,        // 45 minutes
    requiredSuites: ["smoke", "sanity", "security", "regression"]
  },

  release: {
    testPassRate: 0.99,          // 99% for full suite
    intentAccuracy: 0.95,        // 95% intent accuracy
    safetyViolations: 0,
    securityPassed: true,
    performancePassed: true,
    manualApproval: true,
    requiredSuites: ["smoke", "sanity", "security", "regression", "performance"]
  }
};

// Priority Definitions
const PRIORITIES = {
  CRITICAL: {
    code: "P0",
    weight: 5,
    responseTime: "Immediate",
    blocksRelease: true
  },
  HIGH: {
    code: "P1",
    weight: 4,
    responseTime: "Same Day",
    blocksRelease: true
  },
  MAJOR: {
    code: "P2",
    weight: 3,
    responseTime: "48 Hours",
    blocksRelease: false
  },
  MINOR: {
    code: "P3",
    weight: 2,
    responseTime: "Sprint",
    blocksRelease: false
  },
  TRIVIAL: {
    code: "P4",
    weight: 1,
    responseTime: "Backlog",
    blocksRelease: false
  }
};

// Failure Categories
const FAILURE_CATEGORIES = {
  "F-INT": { name: "Intent Mismatch", severity: "MEDIUM" },
  "F-CNF": { name: "Confidence Failure", severity: "MEDIUM" },
  "F-CTX": { name: "Context Loss", severity: "MEDIUM" },
  "F-SAF": { name: "Safety Violation", severity: "CRITICAL" },
  "F-TMO": { name: "Timeout", severity: "LOW" },
  "F-RSP": { name: "Response Error", severity: "LOW" },
  "F-STA": { name: "State Corruption", severity: "HIGH" },
  "F-SEC": { name: "Security Breach", severity: "CRITICAL" }
};

// Get current environment config
function getEnvironment() {
  const env = process.env.TEST_ENV || "local";
  return ENVIRONMENTS[env] || ENVIRONMENTS.local;
}

// Build full API URL
function getApiUrl() {
  const env = getEnvironment();
  return `${env.API_BASE}${env.API_ENDPOINT}`;
}

// Build health check URL
function getHealthUrl() {
  const env = getEnvironment();
  return `${env.API_BASE}${env.HEALTH_ENDPOINT}`;
}

// Export configuration
module.exports = {
  THRESHOLDS,
  ENVIRONMENTS,
  SUITES,
  REPORTERS,
  QUALITY_GATES,
  PRIORITIES,
  FAILURE_CATEGORIES,

  // Helper functions
  getEnvironment,
  getApiUrl,
  getHealthUrl,

  // Quick access to thresholds
  CONFIDENCE: THRESHOLDS.confidence,
  TIMING: THRESHOLDS.timing,
  QUALITY: THRESHOLDS.quality
};
