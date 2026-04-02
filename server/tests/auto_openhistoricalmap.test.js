/**
 * Auto-generated Test for openhistoricalmap
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated openhistoricalmap Intent", () => {
  it("should securely map to knowledge.dynamic.openhistoricalmap with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about openhistoricalmap please");
    assert.strictEqual(res.intent, "knowledge.dynamic.openhistoricalmap");
    assert.strictEqual(res.confidence, 1.0);
  });
});
