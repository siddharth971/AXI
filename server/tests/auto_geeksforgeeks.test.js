/**
 * Auto-generated Test for geeksforgeeks
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated geeksforgeeks Intent", () => {
  it("should securely map to knowledge.dynamic.geeksforgeeks with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about geeksforgeeks please");
    assert.strictEqual(res.intent, "knowledge.dynamic.geeksforgeeks");
    assert.strictEqual(res.confidence, 1.0);
  });
});
