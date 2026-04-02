/**
 * Auto-generated Test for ibm
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated ibm Intent", () => {
  it("should securely map to knowledge.dynamic.ibm with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about ibm please");
    assert.strictEqual(res.intent, "knowledge.dynamic.ibm");
    assert.strictEqual(res.confidence, 1.0);
  });
});
