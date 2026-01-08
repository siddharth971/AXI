/**
 * Skills System CLI REPL
 * -----------------------
 * A command-line interface to manually test and interact with the skills system.
 * Useful for debugging plugins and verifying intent handlers.
 * 
 * Usage: node skills/repl.js
 */

"use strict";

const readline = require("readline");
const skills = require("./index");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
  cyan: "\x1b[36m"
};

function log(color, msg) {
  console.log(`${color}${msg}${colors.reset}`);
}

async function startRepl() {
  console.clear();
  log(colors.cyan, "╔════════════════════════════════════════╗");
  log(colors.cyan, "║      AXI SKILLS SYSTEM - DEV CLI       ║");
  log(colors.cyan, "╚════════════════════════════════════════╝");
  console.log("Type 'exit' to quit, 'help' for commands.\n");

  try {
    process.stdout.write("Initializing registry... ");
    await skills.initialize();
    log(colors.green, "OK");

    const plugins = skills.getPlugins();
    log(colors.gray, `Loaded ${plugins.length} plugins with ${skills.getIntents().length} intents.`);
    console.log("");

    prompt();
  } catch (error) {
    log(colors.red, `Initialization failed: ${error.message}`);
    process.exit(1);
  }
}

function prompt() {
  rl.question(`${colors.blue}AXI>${colors.reset} `, handleInput);
}

async function handleInput(input) {
  const line = input.trim();

  if (!line) {
    prompt();
    return;
  }

  if (line === "exit" || line === "quit") {
    console.log("Goodbye!");
    process.exit(0);
  }

  if (line === "help") {
    showHelp();
    prompt();
    return;
  }

  if (line === "list" || line === "ls") {
    listPlugins();
    prompt();
    return;
  }

  if (line.startsWith("reload")) {
    await reloadSkills();
    prompt();
    return;
  }

  // Check if first word is a known intent
  const parts = line.split(" ");
  const potentialIntent = parts[0];

  if (skills.registry.hasIntent(potentialIntent)) {
    // Direct intent execution
    const params = parseParams(parts.slice(1));
    await executeIntent(potentialIntent, params);
  } else {
    // Basic text execution (simulated NLP)
    // This allows testing flows like "yes/no" or conversational triggers
    await executeRaw(line);
  }

  prompt();
}

function parseParams(args) {
  const params = {};
  args.forEach(arg => {
    const [key, value] = arg.split("=");
    if (key && value) {
      if (!isNaN(value)) {
        params[key] = parseFloat(value);
      } else {
        params[key] = value.replace(/_/g, " ");
      }
    }
  });
  return params;
}

async function executeIntent(intent, params) {
  const startTime = Date.now();
  console.log(colors.gray, `\nExecuting intent: ${intent}`);
  console.log(colors.gray, `Params: ${JSON.stringify(params)}`);

  try {
    const result = await skills.execute(
      { intent, confidence: 1.0, params },
      "MANUAL_INTENT",
      null,
      "dev-session"
    );

    const duration = Date.now() - startTime;
    console.log(`${colors.green}✔ RESPONSE (${duration}ms):${colors.reset}`);
    console.log(`  "${result}"\n`);

  } catch (error) {
    log(colors.red, `✖ ERROR: ${error.message}\n`);
  }
}

async function executeRaw(text) {
  const startTime = Date.now();
  console.log(colors.gray, `\nProcessing text: "${text}"`);

  try {
    // Pass raw text with no simulated intent
    // This allows router to handle confirmations/context logic
    const result = await skills.execute(
      { intent: null, confidence: 0 },
      text,
      null,
      "dev-session"
    );

    const duration = Date.now() - startTime;
    console.log(`${colors.green}✔ RESPONSE (${duration}ms):${colors.reset}`);
    console.log(`  "${result}"\n`);

  } catch (error) {
    log(colors.red, `✖ ERROR: ${error.message}\n`);
  }
}

async function reloadSkills() {
  try {
    await skills.reload();
    log(colors.green, "✔ Plugins reloaded successfully.");
  } catch (error) {
    log(colors.red, `✖ Reload failed: ${error.message}`);
  }
}

function listPlugins() {
  const plugins = skills.getPlugins();
  console.log("\nLoaded Plugins:");
  plugins.forEach(p => {
    console.log(`${colors.green}• ${p.name.toUpperCase()}${colors.reset} (${p.description})`);
    const validIntents = p.intents.filter(i => skills.registry.hasIntent(i));
    if (validIntents.length > 0) {
      console.log(colors.gray, `  Intents: ${validIntents.join(", ")}`);
    }
    console.log("");
  });
}

function showHelp() {
  console.log("\nCommands:");
  console.log("  list, ls           Show all plugins and intents");
  console.log("  reload             Hot-reload all plugins");
  console.log("  exit, quit         Exit REPL");
  console.log("  <intent> [k=v...]  Execute a specific intent");
  console.log("  <text result>      Send raw text (for confirmation/chat)");
  console.log("\nExamples:");
  console.log("  open_youtube");
  console.log("  calculate expression=20*5");
  console.log("  delete_file filename=test.txt");
  console.log("  yes (to confirm action)\n");
}

rl.on("SIGINT", () => {
  console.log("\nGoodbye!");
  process.exit(0);
});

startRepl();
