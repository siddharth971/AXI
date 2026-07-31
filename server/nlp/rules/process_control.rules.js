/**
 * Process Control Rules Module
 * Matches queries for listing processes and terminating processes
 */

"use strict";

module.exports = {
  name: "process_control",
  fn: (text) => {
    if (!text || typeof text !== "string") return null;
    const lower = text.toLowerCase().trim();

    // List Processes: e.g. "show running processes", "check active tasks", "top processes"
    if (
      /(show|list|check)\s+(running\s+)?(processes|tasks)/i.test(lower) ||
      /top\s+processes/i.test(lower)
    ) {
      return {
        intent: "system.list_processes",
        confidence: 1.0,
        entities: {},
      };
    }

    // Kill Process: e.g. "kill process chrome", "terminate process node"
    const killMatch = lower.match(/(kill|terminate|stop)\s+process\s+([a-z0-9_\-\.]+)/i);
    if (killMatch) {
      return {
        intent: "system.kill_process",
        confidence: 1.0,
        entities: {
          processName: killMatch[2].trim(),
        },
      };
    }

    return null;
  },
};
