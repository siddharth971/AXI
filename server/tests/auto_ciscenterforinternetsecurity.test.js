/**
 * Auto-generated Test for ciscenterforinternetsecurity
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated ciscenterforinternetsecurity Intent", () => {
  it("should securely map to knowledge.dynamic.ciscenterforinternetsecurity with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about ciscenterforinternetsecurity please");
    assert.strictEqual(res.intent, "knowledge.dynamic.ciscenterforinternetsecurity");
    assert.strictEqual(res.confidence, 1.0);
  });
});
