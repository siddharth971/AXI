/**
 * Communication Skill Plugin
 * Handles emails, calendar, and messaging.
 */
module.exports = {
  name: 'communication',
  description: 'Handles basic communication tasks like email and calendar',

  intents: {
    'check_email': {
      handler: async (slots, context) => {
        return {
          success: true,
          message: "Opening your email inbox now.",
          action: 'browser_open',
          data: { url: "https://gmail.com" }
        };
      },
      confidence: 0.9,
      requiresConfirmation: false
    },
    'send_email': {
      handler: async (slots, context) => {
        return {
          success: true,
          message: "Opening email composer.",
          action: 'browser_open',
          data: { url: "https://mail.google.com/mail/u/0/#compose" }
        };
      },
      confidence: 0.9,
      requiresConfirmation: false
    },
    'check_calendar': {
      handler: async (slots, context) => {
        return {
          success: true,
          message: "Here is your calendar.",
          action: 'browser_open',
          data: { url: "https://calendar.google.com" }
        };
      },
      confidence: 0.9,
      requiresConfirmation: false
    }
  }
};
