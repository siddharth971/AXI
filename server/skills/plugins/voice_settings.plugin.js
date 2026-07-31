/**
 * Voice Personality & Speech Synthesizer Plugin
 * ------------------------------------------------
 * Dynamically change spoken TTS voice profiles, speech rate, and pitch by voice commands!
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { logger } = require("../../utils");
const socketData = require("../../core/socket");

const VOICE_SETTINGS_FILE = path.join(__dirname, "../../data/voice_settings.json");

const DEFAULT_SETTINGS = {
  profile: "jarvis",
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

function loadVoiceSettings() {
  if (!fs.existsSync(VOICE_SETTINGS_FILE)) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(fs.readFileSync(VOICE_SETTINGS_FILE, "utf8")) };
  } catch (e) {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveVoiceSettings(data) {
  try {
    fs.writeFileSync(VOICE_SETTINGS_FILE, JSON.stringify(data, null, 2));
    socketData.emit("voice_settings_changed", data);
  } catch (e) {
    logger.error("Failed to save voice settings:", e.message);
  }
}

module.exports = {
  name: "voice_settings",
  description: "Dynamic Voice Personality & Speech Synthesizer Controls",

  intents: {
    "voice.set_profile": {
      confidence: 0.95,
      requiresConfirmation: false,
      handler: async (params) => {
        const profile = (params.profile || "jarvis").toLowerCase().trim();
        const settings = loadVoiceSettings();
        settings.profile = profile;
        saveVoiceSettings(settings);

        logger.info(`[Voice Controls] Switched voice profile to: '${profile}'`);
        return `Voice profile updated to '${profile}'. Live Web Speech Synthesizer telemetry broadcasted to HUD.`;
      },
    },

    "voice.set_speed": {
      confidence: 0.95,
      requiresConfirmation: false,
      handler: async (params) => {
        const rate = parseFloat(params.rate || 1.0);
        const settings = loadVoiceSettings();
        settings.rate = Math.max(0.5, Math.min(2.0, rate));
        saveVoiceSettings(settings);

        logger.info(`[Voice Controls] Speech rate adjusted to: ${settings.rate}x`);
        return `Speech synthesis speed adjusted to ${settings.rate}x normal rate.`;
      },
    },

    "voice.status": {
      confidence: 0.95,
      requiresConfirmation: false,
      handler: async () => {
        const settings = loadVoiceSettings();
        return `Current Voice Synthesizer Configuration:\n• Profile: ${settings.profile.toUpperCase()}\n• Speech Speed: ${settings.rate}x\n• Pitch: ${settings.pitch}\n• Output Volume: ${Math.round(settings.volume * 100)}%`;
      },
    },
  },
};
