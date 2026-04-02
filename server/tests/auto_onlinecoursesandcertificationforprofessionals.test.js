/**
 * Auto-generated Test for onlinecoursesandcertificationforprofessionals
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated onlinecoursesandcertificationforprofessionals Intent", () => {
  it("should securely map to knowledge.dynamic.onlinecoursesandcertificationforprofessionals with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about onlinecoursesandcertificationforprofessionals please");
    assert.strictEqual(res.intent, "knowledge.dynamic.onlinecoursesandcertificationforprofessionals");
    assert.strictEqual(res.confidence, 1.0);
  });
});
