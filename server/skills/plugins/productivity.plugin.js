const fs = require('fs');
const path = require('path');
const util = require('util');

/**
 * Productivity Skill Plugin
 * Handles reminders, alarms, and productivity tools.
 */
module.exports = {
  name: 'productivity',
  description: 'Handles reminders, alarms, and productivity tools',

  // Intents this plugin handles
  intents: {
    'set_reminder': {
      handler: async (slots, context) => {
        const task = slots.task || "something";
        const time = slots.time || "later";
        return {
          success: true,
          message: `Okay, I've set a reminder to ${task} for ${time}.`,
          action: 'notify_create',
          data: { type: 'reminder', content: task, time: time }
        };
      },
      confidence: 0.9,
      requiresConfirmation: false
    },
    'set_alarm': {
      handler: async (slots, context) => {
        const time = slots.time || "7 AM";
        return {
          success: true,
          message: `Done. Alarm set for ${time}.`,
          action: 'alarm_create',
          data: { time: time }
        };
      },
      confidence: 0.9,
      requiresConfirmation: false
    },
    'timer.set': {
      handler: async (slots, context) => {
        // Future expansion
        return {
          success: true,
          message: "I can't set timers just yet, but I have noted the request.",
          action: 'none'
        };
      },
      confidence: 0.8,
      requiresConfirmation: false
    }
  }
};
