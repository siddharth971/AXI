/**
 * Auto-generated Test for kitchenwithhoorzahra
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated kitchenwithhoorzahra Intent", () => {
  it("should securely map to knowledge.dynamic.kitchenwithhoorzahra with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about kitchenwithhoorzahra please");
    assert.strictEqual(res.intent, "knowledge.dynamic.kitchenwithhoorzahra");
    assert.strictEqual(res.confidence, 1.0);
  });
});
