/**
 * Auto-generated Test for worldhistoryencyclopedia
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated worldhistoryencyclopedia Intent", () => {
  it("should securely map to knowledge.dynamic.worldhistoryencyclopedia with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about worldhistoryencyclopedia please");
    assert.strictEqual(res.intent, "knowledge.dynamic.worldhistoryencyclopedia");
    assert.strictEqual(res.confidence, 1.0);
  });
});
