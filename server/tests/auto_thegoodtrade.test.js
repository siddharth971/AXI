/**
 * Auto-generated Test for thegoodtrade
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated thegoodtrade Intent", () => {
  it("should securely map to knowledge.dynamic.thegoodtrade with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about thegoodtrade please");
    assert.strictEqual(res.intent, "knowledge.dynamic.thegoodtrade");
    assert.strictEqual(res.confidence, 1.0);
  });
});
