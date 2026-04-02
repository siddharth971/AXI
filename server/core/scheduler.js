/**
 * AXI Job Scheduler
 * -----------------
 * Manages recurring background tasks using cron syntax.
 */

const cron = require("node-cron");
const { spawn } = require("child_process");
const path = require("path");
const { logger } = require("../utils");

class Scheduler {
  constructor() {
    this.jobs = [];
    this.isExplorerRunning = false;
  }

  init() {
    logger.info("⏳ Scheduler: Initializing...");

    // Schedule Autonomous Cycle: Daily at 3:00 AM
    this.schedule("0 3 * * *", "Autonomous Cycle", () => {
      this.runAutonomousCycle();
    });

    // Example: Quick health check every hour
    this.schedule("0 * * * *", "Health Check", () => {
      logger.info("❤️ Health Check: System operational");
    });

    logger.success(`✅ Scheduler: Started with ${this.jobs.length} jobs.`);
  }

  /**
   * Register a new cron job
   * @param {string} wExpression - Cron expression (e.g. "0 3 * * *")
   * @param {string} name - Human readable name
   * @param {Function} task - Function to execute
   */
  schedule(expression, name, task) {
    if (!cron.validate(expression)) {
      logger.error(`Invalid cron expression for ${name}: ${expression}`);
      return;
    }

    const job = cron.schedule(expression, () => {
      logger.info(`⏰ Cron Job Triggered: ${name}`);
      task();
    });

    this.jobs.push({ name, expression, job });
    logger.info(`   - Scheduled: ${name} (${expression})`);
  }

  /**
   * Run the full autonomous learning cycle
   * (Explorer -> Extract -> Learn)
   */
  async runAutonomousCycle() {
    if (this.isExplorerRunning) {
      logger.warn("⚠️ Autonomous Cycle already running. Skipping.");
      return;
    }

    this.isExplorerRunning = true;
    logger.info("🚀 Starting Autonomous Cycle...");

    try {
      // Step 1: Explorer (ESM)
      await this.runScript("autonomous/explorer.mjs", "Explorer");

      // Step 2: Extract (ESM/CommonJS)
      await this.runScript("autonomous/extract.js", "Extract");

      // Step 3: Generate Vectors (Update RAG Index)
      await this.runScript("nlp/semantic/generate-vectors.js", "Vector Gen");

      // Step 4: Learn (CommonJS)
      await this.runScript("nlp/learn.js", "Learn");

      // Step 5: Train Neural Network
      await this.runScript("nlp/train.js", "Train Engine");

      logger.success("✨ Autonomous Cycle Completed Successfully!");
    } catch (error) {
      logger.error(`❌ Autonomous Cycle Failed: ${error.message}`);
    } finally {
      this.isExplorerRunning = false;
    }
  }

  /**
   * Helper to run a node script and stream logs
   */
  runScript(scriptPath, name) {
    return new Promise((resolve, reject) => {
      const fullPath = path.join(__dirname, "../", scriptPath);
      logger.info(`[${name}] Executing...`);

      const child = spawn("node", [fullPath], {
        cwd: path.join(__dirname, "../"),
        env: process.env, // Pass environment variables
      });

      child.stdout.on("data", (data) => {
        // Log stripped of newlines for cleaner output
        const line = data.toString().trim();
        if (line) logger.info(`[${name}] ${line}`);
      });

      child.stderr.on("data", (data) => {
        logger.error(`[${name}] ${data.toString().trim()}`);
      });

      child.on("close", (code) => {
        if (code === 0) {
          logger.success(`[${name}] Finished.`);
          resolve();
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });
    });
  }
}

module.exports = new Scheduler();
