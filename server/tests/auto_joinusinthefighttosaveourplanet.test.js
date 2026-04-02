/**
 * Auto-generated Test for joinusinthefighttosaveourplanet
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated joinusinthefighttosaveourplanet Intent", () => {
  it("should securely map to knowledge.dynamic.joinusinthefighttosaveourplanet with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about joinusinthefighttosaveourplanet please");
    assert.strictEqual(res.intent, "knowledge.dynamic.joinusinthefighttosaveourplanet");
    assert.strictEqual(res.confidence, 1.0);
  });
});
