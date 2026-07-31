/**
 * Custom Voice Macro Rules Module
 * Matches queries for creating, running, and listing custom user macros
 */

"use strict";

module.exports = {
  name: "macro",
  fn: (text) => {
    if (!text || typeof text !== "string") return null;
    const lower = text.toLowerCase().trim();

    // Create Macro: e.g. "create macro coding mode: open vsc, set volume 50%"
    const createMatch = lower.match(/create\s+(custom\s+)?macro\s+([a-z0-9_\s]+)[:\s]+(.+)/i);
    if (createMatch) {
      return {
        intent: "macro.create",
        confidence: 1.0,
        entities: {
          name: createMatch[2].trim(),
          steps: createMatch[3].trim(),
        },
      };
    }

    // Run Macro: e.g. "run macro coding mode", "execute macro workstation"
    const runMatch = lower.match(/(run|execute|trigger|start)\s+(custom\s+)?macro\s+([a-z0-9_\s]+)/i);
    if (runMatch) {
      return {
        intent: "macro.execute",
        confidence: 1.0,
        entities: {
          name: runMatch[3].trim(),
        },
      };
    }

    // List Macros: e.g. "list my macros", "show custom macros"
    if (/(list|show)\s+(my\s+)?(custom\s+)?macros/i.test(lower)) {
      return {
        intent: "macro.list",
        confidence: 1.0,
        entities: {},
      };
    }

    return null;
  },
};
