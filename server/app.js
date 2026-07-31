/**
 * AXI Server - Main Entry Point
 * ================================
 *
 * This is the main application file for the AXI voice assistant server.
 *
 * Architecture:
 * ├── config/         - Configuration and environment
 * ├── core/           - Core systems (context, memory, db)
 * ├── nlp/            - Natural Language Processing
 * ├── skills/         - Skill handlers and router
 * ├── utils/          - Utilities (logger, helpers)
 * └── app.js          - This file (Express server)
 *
 * @author AXI Development Team
 * @version 1.0.0
 */

"use strict";

const crypto = require("crypto");
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const http = require("http");
const socketData = require("./core/socket");
const path = require("path");

// Core imports
const config = require("./config");
const { logger } = require("./utils");
const context = require("./core/context");
const sessions = require("./core/sessions");
const { validateBody, schemas } = require("./utils/validator");
const knowledgeHandler = require("./skills/knowledge-handler");
const { close: closeDatabase } = require("./core/db");

// NLP and Skills
const nlp = require("./nlp/nlp");
const skills = require("./skills");
const { initTFIDF } = require("./nlp/decision-engine");
const proactive = require("./core/proactive");
const memory = require("./core/memory");
const learning = require("./core/learning");

// Initialize Proactive Engine & Scheduler
proactive.init();
const scheduler = require("./core/scheduler");
scheduler.init();

// ===========================
// Express & Socket Setup
// ===========================

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
socketData.init(server);

// Security & performance middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: [
    "http://localhost:4200",
    "https://siddharth971.github.io"
  ],
  credentials: true
}));
app.use(express.json());
app.use("/screenshots", express.static(path.join(__dirname, "screenshots")));

// Rate limiter: 30 requests per minute per IP on the command endpoint
const commandLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." }
});

// ===========================
// Metrics Collector
// ===========================

class MetricsCollector {
  constructor() {
    this.intentHits = new Map();
    this.totalCommands = 0;
    
    // Load persisted intent metrics from memory
    const saved = memory.recall("intentMetrics");
    if (saved && saved.value) {
      try {
        const parsed = JSON.parse(saved.value);
        for (const [key, val] of Object.entries(parsed)) {
          this.intentHits.set(key, val);
        }
      } catch (e) {
        logger.warn("Failed to parse persisted intentMetrics");
      }
    }
  }

  trackIntent(intent) {
    if (intent && intent !== "none") {
      this.intentHits.set(intent, (this.intentHits.get(intent) || 0) + 1);
    }
    this.totalCommands++;
    
    // Persist to SQLite for long-term visualization
    memory.remember("intentMetrics", JSON.stringify(Object.fromEntries(this.intentHits)));
  }

  getSnapshot() {
    const hits = Object.fromEntries(this.intentHits);
    const maxHits = Math.max(...Object.values(hits), 1);
    return {
      intentHits: hits,
      maxHits,
      totalCommands: this.totalCommands,
      uptime: Math.floor(process.uptime()),
      uptimeHuman: MetricsCollector.formatUptime(process.uptime()),
    };
  }

  static formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  }
}

const metrics = new MetricsCollector();

// ===========================
// Request ID Middleware
// ===========================

app.use((req, _res, next) => {
  req.requestId = crypto.randomUUID();
  next();
});

// ===========================
// API Routes
// ===========================

/**
 * POST /api/command
 * Main command endpoint for voice/text input
 */
app.post("/api/command", commandLimiter, validateBody(schemas.command), async (req, res) => {
  const { text } = req.body;
  const startNs = process.hrtime.bigint();
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
          type: context.get("awaiting"),
        },
      };
    } else {
      // 2. Standard NLP Processing (async for semantic matching)
      nlpResult = await nlp.interpret(text);
    }

    logger.nlp(nlpResult);

    // 3. Execute Skill
    const skillResult = await skills.execute(nlpResult, text, context);

    // skills.execute() returns either a string OR a confirmation object
    const isConfirmationRequest = typeof skillResult === "object" && skillResult?.requiresConfirmation;
    const reply = isConfirmationRequest ? skillResult.response : skillResult;

    logger.reply(reply);

    // 4. Update History
    context.set("lastInput", text);
    context.set("lastIntent", nlpResult.intent);
    context.addToHistory(text, nlpResult.intent, reply);

    // 5. Save to current session
    const currentSession = sessions.getCurrentSession();
    sessions.addMessage(currentSession.id, text, reply);

    // 6. Track intent metrics
    metrics.trackIntent(nlpResult.intent);

    // Calculate execution time with sub-ms precision
    const elapsedMs = Number(process.hrtime.bigint() - startNs) / 1e6;

    const responsePayload = {
      response: reply,
      intent: nlpResult.intent || "none",
      confidence: nlpResult.confidence || 0,
      source: nlpResult.source || nlpResult.decision || "unknown",
      executionTime: Math.round(elapsedMs * 100) / 100,
    };

    // Emit live WebSocket telemetry for HUD 3D Galaxy Visualization
    socketData.emit("nlp_telemetry", {
      text,
      intent: nlpResult.intent || "none",
      confidence: nlpResult.confidence || 0,
      source: nlpResult.source || "ensemble",
      weightedBreakdown: nlpResult.weightedBreakdown || {},
      executionTime: Math.round(elapsedMs * 100) / 100,
      timestamp: new Date().toISOString(),
    });

    // Include confirmation metadata if applicable
    if (isConfirmationRequest) {
      responsePayload.requiresConfirmation = true;
      responsePayload.confirmationExpiresAt = skillResult.expiresAt;
    }

    res.json(responsePayload);
  } catch (error) {
    logger.error("Command processing failed", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    name: "AXI Server",
    version: "1.0.0",
    uptime: MetricsCollector.formatUptime(process.uptime()),
  });
});

/**
 * GET /api/skill-context
 * Get active skill context for the right panel
 */
app.get("/api/skill-context", (_req, res) => {
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
        color: "cyan",
      },
      {
        id: "time",
        type: "info",
        icon: "clock",
        title: "Current Time",
        value: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        color: "purple",
      },
    ],
    activeSkill: context.get("lastIntent") || null,
    lastUpdated: new Date().toISOString(),
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
      color: "red",
    });
  }

  res.json(defaultContext);
});

/**
 * GET /api/history
 * Get conversation history
 */
app.get("/api/history", (_req, res) => {
  res.json({
    history: context.getHistory(),
  });
});

/**
 * GET /api/sessions
 * Get all conversation sessions
 */
app.get("/api/sessions", (_req, res) => {
  const allSessions = sessions.getAllSessions();
  res.json({
    sessions: allSessions,
    currentSessionId: sessions.currentSessionId,
  });
});

/**
 * POST /api/sessions
 * Create a new session
 */
app.post("/api/sessions", validateBody(schemas.createSession), (req, res) => {
  const { title } = req.body;
  const newSession = sessions.createSession(title);
  res.json({
    session: newSession,
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
app.put("/api/sessions/:id", validateBody(schemas.updateSession), (req, res) => {
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

/**
 * GET /api/notifications
 * Poll for proactive messages
 */
app.get("/api/notifications", (_req, res) => {
  const messages = proactive.getMessages();
  res.json({ messages });
});

/**
 * GET /api/memory
 * Get all memory facts
 */
app.get("/api/memory", (_req, res) => {
  res.json({ facts: memory.data.facts });
});

/**
 * DELETE /api/memory/:key
 * Delete a memory fact
 */
app.delete("/api/memory/:key", (req, res) => {
  const { key } = req.params;
  const deleted = memory.forget(key);
  if (deleted) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Fact not found" });
  }
});

/**
 * GET /api/learning
 * Get pending corrections
 */
app.get("/api/learning", (_req, res) => {
  res.json({ corrections: learning.getPending() });
});

/**
 * GET /api/knowledge
 * Get list of all explored knowledge blueprints
 */
app.get("/api/knowledge", (_req, res) => {
  const items = knowledgeHandler.list();
  res.json({ blueprints: items });
});

/**
 * POST /api/explain
 * Returns per-layer NLP scores for a given input — without executing the intent.
 * Useful for debugging classification decisions.
 */
app.post("/api/explain", validateBody(schemas.command), async (req, res) => {
  const { text } = req.body;
  try {
    const DecisionEngine = require("./nlp/decision-engine");
    const preprocessor = require("./nlp/preprocessor");

    const { tokens } = preprocessor.preprocess(text, { removeStops: true });

    // Interpret the full text to get all layer data
    const nlpResult = await nlp.interpret(text);

    const sources = nlpResult.sources || {};

    res.json({
      input: text,
      tokens,
      layers: {
        rules: {
          intent: sources.rules?.intent || null,
          confidence: sources.rules?.confidence || 0
        },
        tfidf: {
          intent: sources.tfidf?.intent || null,
          confidence: sources.tfidf?.confidence || 0
        },
        neural: {
          intent: sources.neural?.intent || null,
          confidence: sources.neural?.confidence || 0
        }
      },
      ensemble: {
        finalIntent: nlpResult.intent || "none",
        confidence: nlpResult.confidence || 0,
        decision: nlpResult.decision || "unknown",
        source: nlpResult.source || "ensemble"
      }
    });
  } catch (err) {
    logger.error("Explain endpoint error", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/metrics
 * Returns live intent hit counts, uptime, and total request count.
 * Powers the Galaxy visualization node sizing.
 */
app.get("/api/metrics", (_req, res) => {
  res.json(metrics.getSnapshot());
});

/**
 * GET /api/learning/stats
 * Returns per-intent correction counts — surfaces underperforming intents.
 */
app.get("/api/learning/stats", (_req, res) => {
  const corrections = learning.getPending();
  const stats = corrections.reduce((acc, c) => {
    const key = c.predicted_intent || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  res.json({
    stats,
    totalPending: corrections.length,
    mostCorrected: Object.entries(stats).sort((a, b) => b[1] - a[1]).slice(0, 5)
  });
});

// ===========================
// Admin Routes
// ===========================

/**
 * POST /api/admin/cycle
 * Manually trigger the autonomous learning cycle
 */
app.post("/api/admin/cycle", (_req, res) => {
  if (scheduler.isExplorerRunning) {
    return res.status(409).json({ error: "Cycle is already running" });
  }

  // Run asynchronously
  scheduler.runAutonomousCycle();

  res.json({
    success: true,
    message: "Autonomous Cycle started",
    status: "running"
  });
});

// ===========================
// Graceful Shutdown
// ===========================

function gracefulShutdown(signal) {
  logger.info(`Received ${signal} — shutting down gracefully...`);

  server.close(() => {
    logger.info("HTTP server closed.");
    closeDatabase();
    logger.info("All resources released. Goodbye.");
    process.exit(0);
  });

  // Force exit if cleanup takes too long
  setTimeout(() => {
    logger.warn("Graceful shutdown timed out — forcing exit.");
    process.exit(1);
  }, 5000);
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// ===========================
// Server Start
// ===========================

(async () => {
  try {
    // Initialize TF-IDF and Skills before listening
    await initTFIDF();
    await skills.initialize();

    server.listen(config.PORT, () => {
      console.log("");
      console.log("╔════════════════════════════════════════╗");
      console.log("║         🧠 AXI Voice Assistant         ║");
      console.log("╠════════════════════════════════════════╣");
      console.log(`║  Server running on port ${config.PORT}            ║`);
      console.log(`║  API: http://localhost:${config.PORT}/api        ║`);
      console.log("╚════════════════════════════════════════╝");
      console.log("");
    });
  } catch (err) {
    logger.error("Failed to start server due to initialization error", err.message);
    process.exit(1);
  }
})();
