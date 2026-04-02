/**
 * Auto-generated Plugin for Class Central • Find the best courses, wherever they exist.
 */
const responseHandler = require("../handlers/responses/auto_classcentralfindthebestcourseswherevertheyexist");

module.exports = {
  name: "auto_classcentralfindthebestcourseswherevertheyexist",
  description: "Autonomous handler for Class Central • Find the best courses, wherever they exist.",
  intents: {
    "knowledge.dynamic.classcentralfindthebestcourseswherevertheyexist": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
