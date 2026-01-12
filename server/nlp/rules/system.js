/**
 * System Rules
 * -------------
 * Pattern matching for system-level commands (volume, brightness, power)
 */

module.exports = {
  /**
   * Volume control
   */
  volumeControl(text) {
    const msg = text.toLowerCase();

    // Explicit volume up patterns
    if (/\b(volume up|increase volume|louder|turn up|raise volume|volume badao|volume badha|sound up|badhao)\b/i.test(msg)) {
      return { intent: "volume_up", confidence: 1, entities: {} };
    }

    // Implied volume up (contextual)
    if (/\b(too quiet|cant hear|can't hear|audible|volume low)\b/i.test(msg)) {
      // "it's too quiet" -> volume up
      return { intent: "volume_up", confidence: 0.85, entities: {} };
    }

    // Explicit volume down patterns
    if (/\b(volume down|decrease volume|quieter|turn down|lower volume|volume kam|sound down|ghatao)\b/i.test(msg)) {
      return { intent: "volume_down", confidence: 1, entities: {} };
    }

    // Implied volume down
    if (/\b(too loud|too noisy|hurting my ears|lower the sound)\b/i.test(msg)) {
      return { intent: "volume_down", confidence: 0.85, entities: {} };
    }

    return null;
  },

  /**
   * Screen Control (Lock, Screenshot)
   */
  screenControl(text) {
    const msg = text.toLowerCase();

    if (/\b(lock screen|lock my pc|lock computer|lock system)\b/i.test(msg)) {
      return { intent: "lock_screen", confidence: 1, entities: {} };
    }

    if (/\b(screenshot|screen shot|capture screen|take a picture of screen)\b/i.test(msg)) {
      return { intent: "take_screenshot", confidence: 1, entities: {} };
    }

    return null;
  },

  /**
   * Power Control
   */
  powerControl(text) {
    const msg = text.toLowerCase();

    if (/\b(shutdown|shut down|turn off computer|power off system)\b/i.test(msg)) {
      return { intent: "shutdown_system", confidence: 1, entities: {} };
    }

    if (/\b(restart|reboot|restart computer|restart system)\b/i.test(msg)) {
      return { intent: "restart_system", confidence: 1, entities: {} };
    }

    return null;
  }
};
