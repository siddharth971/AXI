/**
 * Auto-generated Test for easyrecipestv
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated easyrecipestv Intent", () => {
  it("should securely map to knowledge.dynamic.easyrecipestv with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about easyrecipestv please");
    assert.strictEqual(res.intent, "knowledge.dynamic.easyrecipestv");
    assert.strictEqual(res.confidence, 1.0);
  });
});
