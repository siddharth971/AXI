/**
 * Auto-generated Test for mirumeecomposablecommerceandheadlesssolutions
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated mirumeecomposablecommerceandheadlesssolutions Intent", () => {
  it("should securely map to knowledge.dynamic.mirumeecomposablecommerceandheadlesssolutions with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about mirumeecomposablecommerceandheadlesssolutions please");
    assert.strictEqual(res.intent, "knowledge.dynamic.mirumeecomposablecommerceandheadlesssolutions");
    assert.strictEqual(res.confidence, 1.0);
  });
});
