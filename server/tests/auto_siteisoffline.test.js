/**
 * Auto-generated Test for siteisoffline
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated siteisoffline Intent", () => {
  it("should securely map to knowledge.dynamic.siteisoffline with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about siteisoffline please");
    assert.strictEqual(res.intent, "knowledge.dynamic.siteisoffline");
    assert.strictEqual(res.confidence, 1.0);
  });
});
