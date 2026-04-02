/**
 * Auto-generated Test for diyprojectsforthehome
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated diyprojectsforthehome Intent", () => {
  it("should securely map to knowledge.dynamic.diyprojectsforthehome with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about diyprojectsforthehome please");
    assert.strictEqual(res.intent, "knowledge.dynamic.diyprojectsforthehome");
    assert.strictEqual(res.confidence, 1.0);
  });
});
