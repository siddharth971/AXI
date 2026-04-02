/**
 * Auto-generated Test for linkedinloginorsignup
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated linkedinloginorsignup Intent", () => {
  it("should securely map to knowledge.dynamic.linkedinloginorsignup with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about linkedinloginorsignup please");
    assert.strictEqual(res.intent, "knowledge.dynamic.linkedinloginorsignup");
    assert.strictEqual(res.confidence, 1.0);
  });
});
