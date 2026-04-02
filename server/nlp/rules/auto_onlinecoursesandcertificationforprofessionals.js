/**
 * Auto-generated Rule for Online Courses and Certification For Professionals
 */
module.exports = function(text, nlu) {
  if (/\b(onlinecoursesandcertificationforprofessionals|Online)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.onlinecoursesandcertificationforprofessionals",
      confidence: 1.0,
      entities: { topic: "Online Courses and Certification For Professionals" }
    };
  }
  return null;
};
