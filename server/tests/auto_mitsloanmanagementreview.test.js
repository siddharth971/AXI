/**
 * Auto-generated Test for mitsloanmanagementreview
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated mitsloanmanagementreview Intent", () => {
  it("should securely map to knowledge.dynamic.mitsloanmanagementreview with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about mitsloanmanagementreview please");
    assert.strictEqual(res.intent, "knowledge.dynamic.mitsloanmanagementreview");
    assert.strictEqual(res.confidence, 1.0);
  });
});
