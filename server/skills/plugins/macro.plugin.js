/**
 * Dynamic Custom Voice Macro Plugin
 * -----------------------------------
 * Create, persist, list, and execute custom multi-command macros on-the-fly via voice!
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { logger } = require("../../utils");

const MACROS_FILE = path.join(__dirname, "../../data/macros.json");

function loadMacros() {
  if (!fs.existsSync(MACROS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(MACROS_FILE, "utf8"));
  } catch (e) {
    return {};
  }
}

function saveMacros(data) {
  try {
    fs.writeFileSync(MACROS_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    logger.error("Failed to save macros:", e.message);
  }
}

module.exports = {
  name: "macro",
  description: "Dynamic Custom Voice Macro Shortcut Engine",

  intents: {
    "macro.create": {
      confidence: 0.95,
      requiresConfirmation: false,
      handler: async (params) => {
        const macroName = (params.name || "custom_routine").toLowerCase().trim();
        const stepsRaw = params.steps || "open vscode, set volume 50%";

        const steps = stepsRaw.split(/,|\band\b/).map((s) => s.trim()).filter((s) => s.length > 0);

        const macros = loadMacros();
        macros[macroName] = steps;
        saveMacros(macros);

        logger.success(`[Macro Engine] Created custom macro '${macroName}' with ${steps.length} steps.`);
        return `Custom macro '${macroName}' created successfully! Contains ${steps.length} steps: ${steps.join(" → ")}`;
      },
    },

    "macro.execute": {
      confidence: 0.95,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const macroName = (params.name || "").toLowerCase().trim();
        const macros = loadMacros();

        if (!macros[macroName]) {
          return `Macro '${macroName}' not found. Available macros: ${Object.keys(macros).join(", ") || "None"}.`;
        }

        const steps = macros[macroName];
        logger.info(`[Macro Engine] Executing macro '${macroName}' (${steps.length} steps)...`);

        const nlp = require("../../nlp/nlp");
        const skills = require("../index");
        const results = [];

        for (const stepText of steps) {
          const nlpRes = await nlp.interpret(stepText);
          const execRes = await skills.execute(nlpRes, stepText, context);
          const reply = typeof execRes === "object" ? execRes.response : execRes;
          results.push(`✓ ${stepText}`);
        }

        return `Executed macro '${macroName}':\n` + results.join("\n");
      },
    },

    "macro.list": {
      confidence: 0.95,
      requiresConfirmation: false,
      handler: async () => {
        const macros = loadMacros();
        const names = Object.keys(macros);

        if (names.length === 0) {
          return "No custom macros created yet. Say 'create macro coding mode: open vsc, set volume 50%' to make one!";
        }

        let reply = `Saved Custom Voice Macros (${names.length}):\n`;
        names.forEach((name) => {
          reply += `• **${name}**: ${macros[name].join(" → ")}\n`;
        });
        return reply;
      },
    },
  },
};
