/**
 * Auto-generated Test for machinelearningmastery
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated machinelearningmastery Intent", () => {
  it("should securely map to knowledge.dynamic.machinelearningmastery with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about machinelearningmastery please");
    assert.strictEqual(res.intent, "knowledge.dynamic.machinelearningmastery");
    assert.strictEqual(res.confidence, 1.0);
  });
});
