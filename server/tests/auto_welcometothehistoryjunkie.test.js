/**
 * Auto-generated Test for welcometothehistoryjunkie
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated welcometothehistoryjunkie Intent", () => {
  it("should securely map to knowledge.dynamic.welcometothehistoryjunkie with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about welcometothehistoryjunkie please");
    assert.strictEqual(res.intent, "knowledge.dynamic.welcometothehistoryjunkie");
    assert.strictEqual(res.confidence, 1.0);
  });
});
