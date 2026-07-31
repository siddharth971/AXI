/**
 * Voice Personality Rules Module
 * Matches queries for switching voice profiles, adjusting speech speed, and viewing TTS config
 */

"use strict";

module.exports = {
  name: "voice_settings",
  fn: (text) => {
    if (!text || typeof text !== "string") return null;
    const lower = text.toLowerCase().trim();

    // Switch Voice Profile: e.g. "switch voice to jarvis", "change voice to nova"
    const profileMatch = lower.match(/(switch|change|set)\s+voice\s+(profile\s+)?(to\s+)?(jarvis|nova|synth|female|male)/i);
    if (profileMatch) {
      return {
        intent: "voice.set_profile",
        confidence: 1.0,
        entities: {
          profile: profileMatch[4].trim(),
        },
      };
    }

    // Set Speech Speed: e.g. "set speech speed to 1.2", "set speech rate to 1.5"
    const speedMatch = lower.match(/set\s+speech\s+(speed|rate)\s+(to\s+)?([0-9\.]+)/i);
    if (speedMatch) {
      return {
        intent: "voice.set_speed",
        confidence: 1.0,
        entities: {
          rate: parseFloat(speedMatch[3]),
        },
      };
    }

    // Voice Status: e.g. "show voice settings", "voice status"
    if (/(show|check|get)\s+voice\s+(settings|status|config)/i.test(lower)) {
      return {
        intent: "voice.status",
        confidence: 1.0,
        entities: {},
      };
    }

    return null;
  },
};
