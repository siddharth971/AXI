/**
 * Auto-generated Test for narrativewebflowhtmlwebsitetemplate
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated narrativewebflowhtmlwebsitetemplate Intent", () => {
  it("should securely map to knowledge.dynamic.narrativewebflowhtmlwebsitetemplate with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about narrativewebflowhtmlwebsitetemplate please");
    assert.strictEqual(res.intent, "knowledge.dynamic.narrativewebflowhtmlwebsitetemplate");
    assert.strictEqual(res.confidence, 1.0);
  });
});
