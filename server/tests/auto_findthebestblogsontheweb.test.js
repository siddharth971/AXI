/**
 * Auto-generated Test for findthebestblogsontheweb
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated findthebestblogsontheweb Intent", () => {
  it("should securely map to knowledge.dynamic.findthebestblogsontheweb with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about findthebestblogsontheweb please");
    assert.strictEqual(res.intent, "knowledge.dynamic.findthebestblogsontheweb");
    assert.strictEqual(res.confidence, 1.0);
  });
});
