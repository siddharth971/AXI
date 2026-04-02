/**
 * Auto-generated Test for diyhomeimprovementinformation
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated diyhomeimprovementinformation Intent", () => {
  it("should securely map to knowledge.dynamic.diyhomeimprovementinformation with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about diyhomeimprovementinformation please");
    assert.strictEqual(res.intent, "knowledge.dynamic.diyhomeimprovementinformation");
    assert.strictEqual(res.confidence, 1.0);
  });
});
