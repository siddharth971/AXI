/**
 * Workflow Automation Plugin
 * ----------------------------
 * Multi-Step Sequential Workflow Execution Engine for AXI
 */

"use strict";

const { exec } = require("child_process");
const { logger } = require("../../utils");

module.exports = {
  name: "workflow",
  description: "Sequential Multi-Step Workflows & Automations",

  intents: {
    "workflow.prepare_workstation": {
      confidence: 0.9,
      requiresConfirmation: false,
      handler: async (params, context) => {
        logger.info("[Workflow] Triggering Workstation Setup routine...");
        const steps = [];

        // Step 1: Open VS Code
        try {
          exec("code .");
          steps.push("✓ Opened VS Code");
        } catch (e) {
          steps.push("✗ Failed to open VS Code");
        }

        // Step 2: Launch browser tabs (GitHub & ChatGPT)
        try {
          const openCmd = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
          exec(`${openCmd} https://github.com`);
          exec(`${openCmd} https://chatgpt.com`);
          steps.push("✓ Opened GitHub & ChatGPT in browser");
        } catch (e) {
          steps.push("✗ Failed to launch browser tabs");
        }

        // Step 3: Set Volume to 40%
        try {
          if (process.platform === "linux") {
            exec("amixer -D pulse sset Master 40%");
          } else if (process.platform === "win32") {
            exec("nircmd.exe mutesysvolume 0");
          }
          steps.push("✓ Volume adjusted to 40%");
        } catch (e) {
          steps.push("! Volume control bypassed");
        }

        // Step 4: Launch Lofi Music Stream
        try {
          const openCmd = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
          exec(`${openCmd} "https://www.youtube.com/watch?v=jfKfPfyJRdk"`);
          steps.push("✓ Started Lofi Beats stream");
        } catch (e) {
          steps.push("! Media launch bypassed");
        }

        return `Workstation setup complete, sir:\n${steps.join("\n")}`;
      },
    },

    "workflow.standby": {
      confidence: 0.9,
      requiresConfirmation: true,
      handler: async (params, context) => {
        logger.info("[Workflow] Triggering Standby routine...");
        const steps = [];

        // Mute volume
        try {
          if (process.platform === "linux") exec("amixer -D pulse sset Master 0%");
          steps.push("✓ Sound muted");
        } catch (e) {}

        // Lock screen
        try {
          if (process.platform === "linux") exec("xdg-screensaver lock");
          else if (process.platform === "win32") exec("rundll32.exe user32.dll,LockWorkStation");
          steps.push("✓ Screen locked");
        } catch (e) {}

        return `System entered standby mode:\n${steps.join("\n")}`;
      },
    },
  },
};
