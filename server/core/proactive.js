/**
 * Proactive Actions Engine
 * -------------------------
 * Manages scheduled checks and triggers unsolicited actions.
 */

const fs = require("fs");
const path = require("path");
const socket = require("./socket");

class ProactiveService {
  constructor() {
    this.triggers = [];
    this.interval = null;
    this.messageQueue = []; // Queue for frontend polling
    this.TRIGGERS_DIR = path.join(__dirname, "../triggers");
  }

  /**
   * Initialize the engine
   */
  init() {
    console.log("🚀 Proactive Engine: Initializing...");
    this.loadTriggers();
    this.startScheduler();
    console.log(
      `✅ Proactive Engine: Started with ${this.triggers.length} triggers.`,
    );
  }

  /**
   * Load all triggers from triggers/ directory
   */
  loadTriggers() {
    if (!fs.existsSync(this.TRIGGERS_DIR)) return;

    const files = fs
      .readdirSync(this.TRIGGERS_DIR)
      .filter((f) => f.endsWith(".js"));

    for (const file of files) {
      try {
        const trigger = require(path.join(this.TRIGGERS_DIR, file));
        if (trigger.name && typeof trigger.check === "function") {
          this.triggers.push(trigger);
          console.log(`   - Loaded Trigger: ${trigger.name}`);
        }
      } catch (err) {
        console.error(`❌ Failed to load trigger ${file}:`, err.message);
      }
    }
  }

  /**
   * Start the minute-ticker
   */
  startScheduler() {
    // Run every 60 seconds
    this.interval = setInterval(() => this.tick(), 60000);
    // Initial check after 5 seconds
    setTimeout(() => this.tick(), 5000);
  }

  /**
   * Check all triggers
   */
  async tick() {
    const context = {
      timestamp: new Date(),
      hour: new Date().getHours(),
      minute: new Date().getMinutes(),
    };

    for (const trigger of this.triggers) {
      try {
        const shouldRun = await trigger.check(context);

        if (shouldRun) {
          console.log(`🔔 Trigger Fired: ${trigger.name}`);
          const message = await trigger.execute(context);
          if (message) {
            this.enqueueMessage(message);
          }
        }
      } catch (err) {
        console.error(`Error in trigger ${trigger.name}:`, err);
      }
    }
  }

  /**
   * Queue a message for the user
   */
  enqueueMessage(text) {
    const payload = {
      id: Date.now(),
      text: text,
      timestamp: new Date().toISOString(),
      read: false,
    };
    this.messageQueue.push(payload);

    // Emit real-time event
    socket.emit("notification", payload);
  }

  /**
   * Get pending messages for frontend
   */
  getMessages() {
    const messages = [...this.messageQueue];
    this.messageQueue = []; // Clear queue after fetching (or keep history?)
    // For now, clear on read (polling)
    return messages;
  }
}

module.exports = new ProactiveService();
