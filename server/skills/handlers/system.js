/**
 * AXI System Skills
 * ------------------
 * Handles system-level operations:
 * - Screenshots
 * - Shutdown/Restart
 * - Application launching
 */

const screenshot = require("screenshot-desktop");
const path = require("path");
const fs = require("fs");
const { logger } = require("../../utils");

/**
 * Take a screenshot and save to disk
 * @returns {Promise<string>} - Response message
 */
async function takeScreenshot() {
  try {
    const screenshotsDir = path.join(__dirname, "../../screenshots");

    // Ensure directory exists
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const filename = `screenshot-${Date.now()}.png`;
    const filepath = path.join(screenshotsDir, filename);

    await screenshot({ filename: filepath });

    logger.success(`Screenshot saved: ${filename}`);
    return `Screenshot saved as ${filename}, sir.`;
  } catch (error) {
    logger.error("Screenshot failed", error.message);
    return "Sorry, I couldn't take the screenshot.";
  }
}

/**
 * Shutdown the system (with warning)
 */
function shutdown() {
  // Placeholder - implement with caution
  return "System shutdown is disabled for safety.";
}

/**
 * Restart the system (with warning)
 */
function restart() {
  // Placeholder - implement with caution
  return "System restart is disabled for safety.";
}

module.exports = {
  takeScreenshot,
  shutdown,
  restart
};
