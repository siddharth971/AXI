/**
 * Auto-generated Test for historynetyourauthoritativesourceforusampworldhistory
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated historynetyourauthoritativesourceforusampworldhistory Intent", () => {
  it("should securely map to knowledge.dynamic.historynetyourauthoritativesourceforusampworldhistory with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about historynetyourauthoritativesourceforusampworldhistory please");
    assert.strictEqual(res.intent, "knowledge.dynamic.historynetyourauthoritativesourceforusampworldhistory");
    assert.strictEqual(res.confidence, 1.0);
  });
});
