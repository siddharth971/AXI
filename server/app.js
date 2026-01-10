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
const sessions = require("./core/sessions");

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
      // 2. Standard NLP Processing (async for semantic matching)
      nlpResult = await nlp.interpret(text);
    }

    logger.nlp(nlpResult);

    // 3. Execute Skill
    const reply = await skills.execute(nlpResult, text, context);

    logger.reply(reply);

    // 4. Update History
    context.set("lastInput", text);
    context.set("lastIntent", nlpResult.intent);
    context.addToHistory(text, nlpResult.intent, reply);

    // 5. Save to current session
    const currentSession = sessions.getCurrentSession();
    sessions.addMessage(currentSession.id, text, reply);

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
 * GET /api/skill-context
 * Get active skill context for the right panel
 */
app.get("/api/skill-context", (req, res) => {
  // Get dynamic context data
  const contextData = context.get("skillContext") || {};

  // Default skill context items
  const defaultContext = {
    items: [
      {
        id: "weather",
        type: "info",
        icon: "cloud-sun",
        title: "Weather",
        value: contextData.weather || "25°C, Sunny",
        color: "cyan"
      },
      {
        id: "time",
        type: "info",
        icon: "clock",
        title: "Current Time",
        value: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        color: "purple"
      }
    ],
    activeSkill: context.get("lastIntent") || null,
    lastUpdated: new Date().toISOString()
  };

  // Add any quick actions based on context
  if (context.get("lastIntent") === "open_website") {
    defaultContext.items.push({
      id: "website",
      type: "action",
      icon: "globe",
      title: "Quick Link",
      value: context.get("lastWebsite") || "youtube.com",
      actionLabel: "Open Site",
      color: "red"
    });
  }

  res.json(defaultContext);
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

/**
 * GET /api/sessions
 * Get all conversation sessions
 */
app.get("/api/sessions", (req, res) => {
  const allSessions = sessions.getAllSessions();
  res.json({
    sessions: allSessions,
    currentSessionId: sessions.currentSessionId
  });
});

/**
 * POST /api/sessions
 * Create a new session
 */
app.post("/api/sessions", (req, res) => {
  const { title } = req.body;
  const newSession = sessions.createSession(title);
  res.json({
    session: newSession
  });
});

/**
 * GET /api/sessions/:id
 * Get a specific session
 */
app.get("/api/sessions/:id", (req, res) => {
  const session = sessions.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }
  res.json({ session });
});

/**
 * DELETE /api/sessions/:id
 * Delete a session
 */
app.delete("/api/sessions/:id", (req, res) => {
  const deleted = sessions.deleteSession(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Session not found" });
  }
  res.json({ success: true });
});

/**
 * PUT /api/sessions/:id
 * Update session title
 */
app.put("/api/sessions/:id", (req, res) => {
  const { title } = req.body;
  const updated = sessions.updateTitle(req.params.id, title);
  if (!updated) {
    return res.status(404).json({ error: "Session not found" });
  }
  res.json({ success: true });
});

/**
 * POST /api/sessions/:id/activate
 * Set current active session
 */
app.post("/api/sessions/:id/activate", (req, res) => {
  const activated = sessions.setCurrentSession(req.params.id);
  if (!activated) {
    return res.status(404).json({ error: "Session not found" });
  }
  res.json({ success: true });
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
