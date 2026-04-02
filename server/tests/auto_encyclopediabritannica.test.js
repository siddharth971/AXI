/**
 * Auto-generated Test for encyclopediabritannica
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated encyclopediabritannica Intent", () => {
  it("should securely map to knowledge.dynamic.encyclopediabritannica with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about encyclopediabritannica please");
    assert.strictEqual(res.intent, "knowledge.dynamic.encyclopediabritannica");
    assert.strictEqual(res.confidence, 1.0);
  });
});
