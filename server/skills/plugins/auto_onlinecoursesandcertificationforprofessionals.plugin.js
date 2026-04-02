/**
 * Auto-generated Plugin for Online Courses and Certification For Professionals
 */
const responseHandler = require("../handlers/responses/auto_onlinecoursesandcertificationforprofessionals");

module.exports = {
  name: "auto_onlinecoursesandcertificationforprofessionals",
  description: "Autonomous handler for Online Courses and Certification For Professionals",
  intents: {
    "knowledge.dynamic.onlinecoursesandcertificationforprofessionals": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
