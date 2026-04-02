/**
 * Auto-generated Test for lfxinsights
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated lfxinsights Intent", () => {
  it("should securely map to knowledge.dynamic.lfxinsights with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about lfxinsights please");
    assert.strictEqual(res.intent, "knowledge.dynamic.lfxinsights");
    assert.strictEqual(res.confidence, 1.0);
  });
});
