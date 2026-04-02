/**
 * Auto-generated Test for microsoftsource
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated microsoftsource Intent", () => {
  it("should securely map to knowledge.dynamic.microsoftsource with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about microsoftsource please");
    assert.strictEqual(res.intent, "knowledge.dynamic.microsoftsource");
    assert.strictEqual(res.confidence, 1.0);
  });
});
