/**
 * Auto-generated Test for unicornplatformaiwebsitebuilderforbusyfounders
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated unicornplatformaiwebsitebuilderforbusyfounders Intent", () => {
  it("should securely map to knowledge.dynamic.unicornplatformaiwebsitebuilderforbusyfounders with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about unicornplatformaiwebsitebuilderforbusyfounders please");
    assert.strictEqual(res.intent, "knowledge.dynamic.unicornplatformaiwebsitebuilderforbusyfounders");
    assert.strictEqual(res.confidence, 1.0);
  });
});
