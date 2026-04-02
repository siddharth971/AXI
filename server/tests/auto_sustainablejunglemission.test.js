/**
 * Auto-generated Test for sustainablejunglemission
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated sustainablejunglemission Intent", () => {
  it("should securely map to knowledge.dynamic.sustainablejunglemission with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about sustainablejunglemission please");
    assert.strictEqual(res.intent, "knowledge.dynamic.sustainablejunglemission");
    assert.strictEqual(res.confidence, 1.0);
  });
});
