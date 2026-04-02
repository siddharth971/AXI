/**
 * Auto-generated Test for aiknowledgebasesoftwarecutticketsby80
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated aiknowledgebasesoftwarecutticketsby80 Intent", () => {
  it("should securely map to knowledge.dynamic.aiknowledgebasesoftwarecutticketsby80 with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about aiknowledgebasesoftwarecutticketsby80 please");
    assert.strictEqual(res.intent, "knowledge.dynamic.aiknowledgebasesoftwarecutticketsby80");
    assert.strictEqual(res.confidence, 1.0);
  });
});
