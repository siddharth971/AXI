/**
 * Auto-generated Test for opensourceendpointdetectionandresponseedr
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated opensourceendpointdetectionandresponseedr Intent", () => {
  it("should securely map to knowledge.dynamic.opensourceendpointdetectionandresponseedr with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about opensourceendpointdetectionandresponseedr please");
    assert.strictEqual(res.intent, "knowledge.dynamic.opensourceendpointdetectionandresponseedr");
    assert.strictEqual(res.confidence, 1.0);
  });
});
