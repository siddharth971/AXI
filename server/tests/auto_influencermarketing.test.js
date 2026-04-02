/**
 * Auto-generated Test for influencermarketing
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated influencermarketing Intent", () => {
  it("should securely map to knowledge.dynamic.influencermarketing with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about influencermarketing please");
    assert.strictEqual(res.intent, "knowledge.dynamic.influencermarketing");
    assert.strictEqual(res.confidence, 1.0);
  });
});
