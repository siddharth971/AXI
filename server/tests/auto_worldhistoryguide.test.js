/**
 * Auto-generated Test for worldhistoryguide
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated worldhistoryguide Intent", () => {
  it("should securely map to knowledge.dynamic.worldhistoryguide with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about worldhistoryguide please");
    assert.strictEqual(res.intent, "knowledge.dynamic.worldhistoryguide");
    assert.strictEqual(res.confidence, 1.0);
  });
});
