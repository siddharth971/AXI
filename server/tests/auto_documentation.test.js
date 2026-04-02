/**
 * Auto-generated Test for documentation
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated documentation Intent", () => {
  it("should securely map to knowledge.dynamic.documentation with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about documentation please");
    assert.strictEqual(res.intent, "knowledge.dynamic.documentation");
    assert.strictEqual(res.confidence, 1.0);
  });
});
