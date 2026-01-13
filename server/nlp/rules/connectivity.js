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
      return { intent: "system.wifi_on", confidence: 1, entities: {} };
    }

    if (/\b(turn off|disable|stop|switch off|disconnect)\s+wifi\b/i.test(msg)) {
      return { intent: "system.wifi_off", confidence: 1, entities: {} };
    }

    // Toggle/General - Default to opening settings/checking status if ambiguous, or checking state.
    // For now, map to 'wifi_on' as a safe default to open settings, or skip.
    // Prompt mappings suggest distinct on/off.
    if (/\b(toggle|switch)\s+wifi\b/i.test(msg)) {
      // "switch wifi" -> usually means switch network or toggle.
      return { intent: "system.wifi_on", confidence: 0.8, entities: {} };
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
      return { intent: "system.bluetooth_on", confidence: 1, entities: {} };
    }

    if (/\b(turn off|disable|stop|switch off|disconnect)\s+(bluetooth|bt)\b/i.test(msg)) {
      return { intent: "system.bluetooth_off", confidence: 1, entities: {} };
    }

    if (/\b(toggle|switch)\s+(bluetooth|bt)\b/i.test(msg)) {
      return { intent: "system.bluetooth_on", confidence: 0.8, entities: {} };
    }

    return null;
  }
};
