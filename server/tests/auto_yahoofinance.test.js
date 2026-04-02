/**
 * Auto-generated Test for yahoofinance
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated yahoofinance Intent", () => {
  it("should securely map to knowledge.dynamic.yahoofinance with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about yahoofinance please");
    assert.strictEqual(res.intent, "knowledge.dynamic.yahoofinance");
    assert.strictEqual(res.confidence, 1.0);
  });
});
