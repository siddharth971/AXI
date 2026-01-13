/**
 * System Plugin
 * --------------
 * Handles system-level operations:
 * - Screenshots
 * - Application launching
 * - System information
 * - Power management
 * - Time/date queries
 * - General queries
 */

"use strict";

const { exec } = require("child_process");
const { promisify } = require("util");
const path = require("path");
const fs = require("fs");
const os = require("os");

const execAsync = promisify(exec);

// Common application paths (Windows)
const APP_MAP = {
  notepad: "notepad",
  calculator: "calc",
  calc: "calc",
  paint: "mspaint",
  explorer: "explorer",
  "file explorer": "explorer",
  cmd: "cmd",
  terminal: "cmd",
  "command prompt": "cmd",
  powershell: "powershell",
  settings: "ms-settings:",
  control: "control",
  "control panel": "control",
  edge: "start msedge",
  chrome: "start chrome",
  firefox: "start firefox",
  word: "start winword",
  excel: "start excel",
  powerpoint: "start powerpnt",
  outlook: "start outlook",
  teams: "start msteams:",
  slack: "start slack:",
  discord: "start discord:",
  spotify: "start spotify:",
  vscode: "code",
  "visual studio code": "code",
  "vs code": "code"
};

// Joke collection for entertainment
const JOKES = [
  "Why did the scarecrow win an award? Because he was outstanding in his field!",
  "Why don't skeletons fight each other? They don't have the guts.",
  "What do you call a fake noodle? An impasta.",
  "Why did the bicycle fall over? Because it was two-tired.",
  "I told my wife she was drawing her eyebrows too high. She looked surprised.",
  "What do you call a bear with no teeth? A gummy bear!",
  "Why did the programmer quit his job? Because he didn't get arrays.",
  "There are only 10 types of people: those who understand binary and those who don't."
];

// Greeting responses
const GREETINGS = [
  "Hello sir, how can I assist you today?",
  "Good to see you, sir. What can I do for you?",
  "Hi there! How may I help?",
  "Hello! I'm ready to assist.",
  "Greetings! What would you like me to do?"
];

/**
 * Pick random item from array
 * @param {Array} arr - Array to pick from
 * @returns {*} Random item
 */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get time-appropriate greeting
 * @returns {string}
 */
function getTimeBasedGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

module.exports = {
  name: "system",
  description: "System operations, app launching, info queries, and general interactions",

  intents: {




    tell_time: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const now = new Date();
        const time = now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        });

        return `The current time is ${time}, sir.`;
      }
    },

    tell_date: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const now = new Date();
        const date = now.toLocaleDateString("en-IN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });

        return `Today is ${date}, sir.`;
      }
    },

    greeting: {
      confidence: 0.4,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return pickRandom(GREETINGS);
      }
    },

    tell_joke: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return pickRandom(JOKES);
      }
    },

    system_info: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const type = (params.type || params.info || "all").toLowerCase();

        const info = {
          platform: os.platform(),
          arch: os.arch(),
          hostname: os.hostname(),
          cpus: os.cpus().length,
          totalMemory: Math.round(os.totalmem() / (1024 * 1024 * 1024)),
          freeMemory: Math.round(os.freemem() / (1024 * 1024 * 1024)),
          uptime: Math.round(os.uptime() / 3600)
        };

        switch (type) {
          case "cpu":
            return `You have ${info.cpus} CPU cores, sir.`;
          case "memory":
          case "ram":
            return `You have ${info.totalMemory}GB total RAM with ${info.freeMemory}GB currently free, sir.`;
          case "uptime":
            return `The system has been running for ${info.uptime} hours, sir.`;
          default:
            return `System: ${info.hostname}\nPlatform: ${info.platform} (${info.arch})\nCPU Cores: ${info.cpus}\nMemory: ${info.freeMemory}GB free of ${info.totalMemory}GB\nUptime: ${info.uptime} hours`;
        }
      }
    },

    weather_check: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        // Note: In production, integrate with a weather API
        return "I don't have access to real-time weather data yet. You can ask me to open a weather website for you, sir.";
      }
    },

    news_update: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        // Note: In production, integrate with a news API
        return "I don't have access to live news feeds at the moment. Would you like me to open a news website, sir?";
      }
    },



    ai_chat: {
      confidence: 0.3, // Low threshold to catch conversational messages
      requiresConfirmation: false,
      handler: async (params, context) => {
        const text = (params.text || params.query || params.message || "").toLowerCase().trim();

        // Handle common conversational patterns
        if (/nice|cool|awesome|great|amazing|good job|wow|excellent/.test(text)) {
          return pickRandom([
            "I'm glad you think so, sir.",
            "Thank you!",
            "I appreciate that.",
            "Always happy to help."
          ]);
        }

        if (/^(yes|yeah|yep|sure|ok|okay|alright)$/.test(text)) {
          return pickRandom([
            "Understood, sir.",
            "Alright! What can I do for you?",
            "Got it. What's next?"
          ]);
        }

        if (/^(no|nope|not really|never mind)$/.test(text)) {
          return pickRandom([
            "Alright, let me know if you need anything.",
            "No problem, sir.",
            "Okay, I'll be here when you need me."
          ]);
        }

        if (/who are you|your name|what are you/.test(text)) {
          return "I am AXI, your advanced virtual assistant. I'm here to help you with various tasks, sir.";
        }

        if (/thank|thanks/.test(text)) {
          return pickRandom([
            "You're welcome, sir.",
            "No problem at all.",
            "Anytime!",
            "My pleasure."
          ]);
        }

        if (/how are you|how('s| is) it going/.test(text)) {
          return pickRandom([
            "I'm doing great, thank you for asking!",
            "All systems operational, sir. How can I help?",
            "I'm well! Ready to assist you."
          ]);
        }

        return pickRandom([
          "I'm here if you need anything else.",
          "How can I help you further?",
          "Is there something specific you'd like me to do?",
          "I'm listening, sir."
        ]);
      }
    },

    goodbye: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return pickRandom([
          "Goodbye, sir. Have a great day!",
          "See you later! Call me whenever you need.",
          "Take care, sir!",
          "Until next time!"
        ]);
      }
    }
  }
};
