/**
 * Auto-generated Test for allaboutcircuits
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated allaboutcircuits Intent", () => {
  it("should securely map to knowledge.dynamic.allaboutcircuits with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about allaboutcircuits please");
    assert.strictEqual(res.intent, "knowledge.dynamic.allaboutcircuits");
    assert.strictEqual(res.confidence, 1.0);
  });
});
