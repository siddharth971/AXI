/**
 * Auto-generated Test for menutiger
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated menutiger Intent", () => {
  it("should securely map to knowledge.dynamic.menutiger with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about menutiger please");
    assert.strictEqual(res.intent, "knowledge.dynamic.menutiger");
    assert.strictEqual(res.confidence, 1.0);
  });
});
