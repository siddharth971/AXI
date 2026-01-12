/**
 * Connectivity Rules
 * ------------------
 * Pattern matching for hardware connectivity (WiFi, Bluetooth)
 */

module.exports = {
  /**
   * WiFi Control
   */
  wifiControl(text) {
    const msg = text.toLowerCase();

    if (/\b(turn on|enable|start|switch on|connect to)\s+wifi\b/i.test(msg)) {
      return { intent: "toggle_wifi", confidence: 1, entities: { action: "on" } };
    }

    if (/\b(turn off|disable|stop|switch off|disconnect)\s+wifi\b/i.test(msg)) {
      return { intent: "toggle_wifi", confidence: 1, entities: { action: "off" } };
    }

    // Toggle/General
    if (/\b(toggle|switch)\s+wifi\b/i.test(msg)) {
      return { intent: "toggle_wifi", confidence: 1, entities: { action: "toggle" } };
    }

    return null;
  },

  /**
   * Bluetooth Control
   */
  bluetoothControl(text) {
    const msg = text.toLowerCase();

    // Accounts for "bluetooth" and "bt"
    if (/\b(turn on|enable|start|switch on|connect)\s+(bluetooth|bt)\b/i.test(msg)) {
      return { intent: "toggle_bluetooth", confidence: 1, entities: { action: "on" } };
    }

    if (/\b(turn off|disable|stop|switch off|disconnect)\s+(bluetooth|bt)\b/i.test(msg)) {
      return { intent: "toggle_bluetooth", confidence: 1, entities: { action: "off" } };
    }

    if (/\b(toggle|switch)\s+(bluetooth|bt)\b/i.test(msg)) {
      return { intent: "toggle_bluetooth", confidence: 1, entities: { action: "toggle" } };
    }

    return null;
  }
};
