/**
 * Auto-generated Legacy Handler for Online Courses and Certification For Professionals
 */
const responses = require("./responses/auto_onlinecoursesandcertificationforprofessionals");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
