/**
 * System Health Diagnostic Rules Module
 * Matches queries for CPU, RAM, and System health metrics
 */

"use strict";

module.exports = {
  name: "system_health",
  fn: (text) => {
    if (!text || typeof text !== "string") return null;
    const lower = text.toLowerCase().trim();

    // Full Health Check Patterns
    if (
      /how\s+is\s+(my\s+)?system(\s+doing)?/i.test(lower) ||
      /system\s+(health|diagnostics|status)/i.test(lower) ||
      /check\s+(system\s+)?health/i.test(lower) ||
      /run\s+(a\s+)?diagnostic/i.test(lower)
    ) {
      return {
        intent: "system.health_check",
        confidence: 1.0,
        entities: {},
      };
    }

    // CPU Check Patterns
    if (
      /cpu\s+(usage|status|load|info)/i.test(lower) ||
      /check\s+cpu/i.test(lower) ||
      /processor\s+status/i.test(lower)
    ) {
      return {
        intent: "system.cpu_check",
        confidence: 1.0,
        entities: {},
      };
    }

    // Memory / RAM Check Patterns
    if (
      /(ram|memory)\s+(usage|status|info)/i.test(lower) ||
      /check\s+(ram|memory)/i.test(lower) ||
      /how\s+much\s+(ram|memory)\s+(free|used)/i.test(lower)
    ) {
      return {
        intent: "system.memory_check",
        confidence: 1.0,
        entities: {},
      };
    }

    return null;
  },
};
