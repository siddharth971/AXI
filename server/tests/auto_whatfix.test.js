/**
 * Auto-generated Test for whatfix
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated whatfix Intent", () => {
  it("should securely map to knowledge.dynamic.whatfix with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about whatfix please");
    assert.strictEqual(res.intent, "knowledge.dynamic.whatfix");
    assert.strictEqual(res.confidence, 1.0);
  });
});
