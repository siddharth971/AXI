/**
 * Process Control & Task Management Plugin
 * -----------------------------------------
 * View running OS processes, monitor top memory/cpu consumers, and terminate processes by voice!
 */

"use strict";

const { exec } = require("child_process");
const os = require("os");
const { logger } = require("../../utils");

function runSysCommand(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { timeout: 3000 }, (error, stdout) => {
      if (error) return resolve("");
      resolve(stdout || "");
    });
  });
}

module.exports = {
  name: "process_control",
  description: "OS Process Management & Task Control",

  intents: {
    "system.list_processes": {
      confidence: 0.95,
      requiresConfirmation: false,
      handler: async () => {
        logger.info("[Process Control] Fetching top OS processes...");
        const isWin = os.platform() === "win32";

        let output = "";
        if (isWin) {
          output = await runSysCommand("tasklist /FO CSV /NH");
        } else {
          output = await runSysCommand("ps -eo comm,%mem,%cpu --sort=-%mem | head -n 6");
        }

        if (!output) {
          return "Unable to retrieve running OS processes.";
        }

        return `Top Active OS Processes:\n\`\`\`\n${output.trim()}\n\`\`\``;
      },
    },

    "system.kill_process": {
      confidence: 0.95,
      requiresConfirmation: true,
      handler: async (params) => {
        const procName = (params.processName || params.name || "").trim();
        if (!procName) {
          return "Please specify the process name to terminate. Example: 'kill process chrome'.";
        }

        logger.info(`[Process Control] Terminating process: ${procName}...`);
        const isWin = os.platform() === "win32";
        const cmd = isWin ? `taskkill /IM "${procName}.exe" /F` : `pkill -f "${procName}"`;

        await runSysCommand(cmd);
        return `Termination signal sent to process '${procName}'.`;
      },
    },
  },
};
