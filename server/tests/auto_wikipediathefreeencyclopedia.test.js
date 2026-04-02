/**
 * Auto-generated Test for wikipediathefreeencyclopedia
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated wikipediathefreeencyclopedia Intent", () => {
  it("should securely map to knowledge.dynamic.wikipediathefreeencyclopedia with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about wikipediathefreeencyclopedia please");
    assert.strictEqual(res.intent, "knowledge.dynamic.wikipediathefreeencyclopedia");
    assert.strictEqual(res.confidence, 1.0);
  });
});
