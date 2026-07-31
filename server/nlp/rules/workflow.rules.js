/**
 * Workflow Rules Module
 * Matches multi-step workstation automation intent rules
 */

"use strict";

module.exports = {
  name: "workflow",
  fn: (text) => {
    if (!text || typeof text !== "string") return null;
    const lower = text.toLowerCase().trim();

    // Workstation Setup Patterns
    if (
      /prepare\s+(my\s+)?workstation/i.test(lower) ||
      /setup\s+(my\s+)?workstation/i.test(lower) ||
      /start\s+(my\s+)?work\s+routine/i.test(lower) ||
      /prepare\s+(my\s+)?workspace/i.test(lower) ||
      /get\s+ready\s+for\s+work/i.test(lower)
    ) {
      return {
        intent: "workflow.prepare_workstation",
        confidence: 1.0,
        entities: {},
      };
    }

    // Standby Routine Patterns
    if (
      /leave\s+(my\s+)?workstation/i.test(lower) ||
      /system\s+standby/i.test(lower) ||
      /enter\s+standby/i.test(lower)
    ) {
      return {
        intent: "workflow.standby",
        confidence: 1.0,
        entities: {},
      };
    }

    return null;
  },
};
