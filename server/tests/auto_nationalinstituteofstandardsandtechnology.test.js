/**
 * Auto-generated Test for nationalinstituteofstandardsandtechnology
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated nationalinstituteofstandardsandtechnology Intent", () => {
  it("should securely map to knowledge.dynamic.nationalinstituteofstandardsandtechnology with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about nationalinstituteofstandardsandtechnology please");
    assert.strictEqual(res.intent, "knowledge.dynamic.nationalinstituteofstandardsandtechnology");
    assert.strictEqual(res.confidence, 1.0);
  });
});
