/**
 * Communication Rules
 * -------------------
 * Pattern matching for Email and Calendar interactions
 */

module.exports = {
  /**
   * Email Operations
   */
  emailControl(text) {
    const msg = text.toLowerCase();

    // Check Inbox
    if (/\b(check|read|show|open)\s+(my\s+)?(email|emails|inbox|gmail|messages|mails)\b/i.test(msg)) {
      // Exclude "send" context
      if (!/\b(send|write|compose)\b/i.test(msg)) {
        return { intent: "check_email", confidence: 1, entities: {} };
      }
    }

    // Send Email
    if (/\b(send|write|compose|draft)\s+(an\s+)?(email|mail|message)\b/i.test(msg)) {
      return { intent: "send_email", confidence: 1, entities: {} };
    }

    return null;
  },

  /**
   * Calendar Operations
   */
  calendarControl(text) {
    const msg = text.toLowerCase();

    if (/\b(check|show|open|what's on|view)\s+(my\s+)?(calendar|schedule|agenda|meetings|appointments|events)\b/i.test(msg) ||
      /\b(what do i have|what am i doing)\s+(today|tomorrow)\b/i.test(msg) ||
      /\b(do i have)\s+(any\s+)?(meetings|plans)\b/i.test(msg)) {

      return { intent: "check_calendar", confidence: 1, entities: {} };
    }

    return null;
  }
};
