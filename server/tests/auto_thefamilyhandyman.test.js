/**
 * Auto-generated Test for thefamilyhandyman
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated thefamilyhandyman Intent", () => {
  it("should securely map to knowledge.dynamic.thefamilyhandyman with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about thefamilyhandyman please");
    assert.strictEqual(res.intent, "knowledge.dynamic.thefamilyhandyman");
    assert.strictEqual(res.confidence, 1.0);
  });
});
