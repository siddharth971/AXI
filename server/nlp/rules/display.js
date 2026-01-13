/**
 * Display Rules
 * -------------
 * Pattern matching for screen display settings (Brightness)
 */

module.exports = {
  /**
   * Brightness Control
   */
  brightnessControl(text) {
    const msg = text.toLowerCase();

    // Increase
    if (/\b(brightness up|increase brightness|screen brighter|brighten screen|roshni badhao|turn up brightness)\b/i.test(msg)) {
      return { intent: "display.brightness_up", confidence: 1, entities: {} };
    }

    // Decrease
    if (/\b(brightness down|decrease brightness|screen dimmer|dim screen|roshni kam|turn down brightness|darken screen)\b/i.test(msg)) {
      return { intent: "display.brightness_down", confidence: 1, entities: {} };
    }

    // Set specific value (Entity Extraction)
    // e.g. "set brightness to 50%"
    const setMatch = msg.match(/set\s+brightness\s+(?:to\s+)?(\d+)%?/i);
    if (setMatch) {
      // We'll map "set" to up or down based on current state in a real app, 
      // but typically "brightness_up" is a safe generic container if we pass the value.
      // Or we might need a specific "set_brightness" intent.
      // For now, based on intents display.json, we only have up/down.
      // We will default to brightness_up with value, or just ignore exact parsing 
      // if the intent system assumes relative changes.
      // Let's stick to the relative intents defined.
      return null;
    }

    return null;
  }
};
