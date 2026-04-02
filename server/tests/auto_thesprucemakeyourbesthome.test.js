/**
 * Auto-generated Test for thesprucemakeyourbesthome
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated thesprucemakeyourbesthome Intent", () => {
  it("should securely map to knowledge.dynamic.thesprucemakeyourbesthome with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about thesprucemakeyourbesthome please");
    assert.strictEqual(res.intent, "knowledge.dynamic.thesprucemakeyourbesthome");
    assert.strictEqual(res.confidence, 1.0);
  });
});
