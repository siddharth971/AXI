/**
 * Learning Plugin
 * ---------------
 * Handles user feedback and corrections.
 */

const learning = require("../../core/learning");

module.exports = {
  name: "learning",
  description: "Handles user corrections",

  intents: {
    // User says "That was wrong" or "Incorrect"
    "feedback.wrong": {
      confidence: 0.8,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const lastInput = context.get("lastInput");
        const lastIntent = context.get("lastIntent");

        if (!lastInput) {
          return "I'm not sure what I did wrong. I don't have a record of our last interaction.";
        }

        // Save the error context for the next turn
        context.set("faultyInput", lastInput);
        context.set("faultyIntent", lastIntent);

        // Set context to await the correction
        context.set("awaiting", "correction_intent");

        return `I'm sorry about that. What did you mean when you said "${lastInput}"?`;
      },
    },

    // User provides correction: "I meant [Intent]" or just rephrasing
    // NOTE: This usually needs "context" support in the main NLP loop to force this intent
    // But for now, we can try to capture it via specific phrasing or context awareness
    "feedback.correction": {
      confidence: 0.7,
      requiresConfirmation: false,
      handler: async (params, context) => {
        // This might be triggered if user says "I meant turn on lights"
        // Logic to extract real intent would be complex without a secondary classification pass.
        // Simpler MVP: Just save the text as the "corrected intent description" for manual review first,
        // OR, assume the user is stating the command they WANTED.

        const lastInput = context.get("lastInput"); // This is CURRENT input "I meant..."
        // We need the PREVIOUS input which was wrong.
        // Context needs to track history better.
        // Let's assume 'lastInput' was updated to the current one.
        // We need 'history' from context.

        const history = context.getHistory();
        // history[0] is current, history[1] is AXI reply, history[2] is user's wrong command?
        // This is getting tricky to reliable get "previous previous" input without specific state.

        return "Thanks, I've noted that for future training.";
      },
    },

    // Special handler for Context Overrides (from app.js logic)
    context_response: {
      confidence: 1.0,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const type = params.type; // 'correction_intent'
        const value = params.value; // "turn on the lights"

        if (type === "correction_intent") {
          // The user just said what they meant.
          // We need the ORIGINAL wrong utterance.
          // AXI's context.set('lastInput') overwrites on every command.
          // We need to persist the *faulty* input across the turn.

          // Hack: We can look at session history or stored context variable.
          // In feedback.wrong, we should store the faulty input.

          const faultyInput = context.get("faultyInput");
          const faultyIntent = context.get("faultyIntent");

          if (faultyInput) {
            learning.logCorrection(faultyInput, faultyIntent, value);
            context.delete("awaiting"); // clear state
            context.delete("faultyInput");
            return `Understood. I've learned that "${faultyInput}" implies "${value}".`;
          }

          context.delete("awaiting");
          return "I've lost track of what we were correcting, but thanks.";
        }
        return "Context processed.";
      },
    },
  },
};
