/**
 * AXI Server - Main Entry Point
 * ================================
 * 
 * This is the main application file for the AXI voice assistant server.
 * 
 * Architecture:
 * ├── config/         - Configuration and environment
 * ├── core/           - Core systems (context, memory)
 * ├── nlp/            - Natural Language Processing
 * ├── skills/         - Skill handlers and router
 * ├── utils/          - Utilities (logger, helpers)
 * └── app.js          - This file (Express server)
 * 
 * @author AXI Development Team
 * @version 1.0.0
 */

const express = require("express");
const cors = require("cors");

// Core imports
const config = require("./config");
const { logger } = require("./utils");
const context = require("./core/context");

// NLP and Skills
const nlp = require("./nlp/nlp");
const skills = require("./skills");

// ===========================
// Express Setup
// ===========================

const app = express();

app.use(cors());
app.use(express.json());

// ===========================
// API Routes
// ===========================

/**
 * POST /api/command
 * Main command endpoint for voice/text input
 */
app.post("/api/command", async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'text' field" });
  }

  logger.received(text);

  try {
    // 1. Check for Context Overrides
    let nlpResult;

    if (config.FEATURES.CONTEXT_ENABLED && context.get("awaiting")) {
      logger.context(context.get("awaiting"));
      nlpResult = {
        intent: "context_response",
        confidence: 1,
        entities: {
          value: text,
          type: context.get("awaiting")
        }
      };
    } else {
      // 2. Standard NLP Processing
      nlpResult = nlp.interpret(text);
    }

    logger.nlp(nlpResult);

    // 3. Execute Skill
    const reply = await skills.execute(nlpResult, text, context);

    logger.reply(reply);

    // 4. Update History
    context.set("lastInput", text);
    context.set("lastIntent", nlpResult.intent);
    context.addToHistory(text, nlpResult.intent, reply);

    res.json({ response: reply });
  } catch (error) {
    logger.error("Command processing failed", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    name: "AXI Server",
    version: "1.0.0"
  });
});

/**
 * GET /api/history
 * Get conversation history
 */
app.get("/api/history", (req, res) => {
  res.json({
    history: context.getHistory()
  });
});

// ===========================
// Server Start
// ===========================

app.listen(config.PORT, () => {
  console.log("");
  console.log("╔════════════════════════════════════════╗");
  console.log("║         🧠 AXI Voice Assistant         ║");
  console.log("╠════════════════════════════════════════╣");
  console.log(`║  Server running on port ${config.PORT}            ║`);
  console.log(`║  API: http://localhost:${config.PORT}/api        ║`);
  console.log("╚════════════════════════════════════════╝");
  console.log("");
});
