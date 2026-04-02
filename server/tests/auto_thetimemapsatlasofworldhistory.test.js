/**
 * Auto-generated Test for thetimemapsatlasofworldhistory
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated thetimemapsatlasofworldhistory Intent", () => {
  it("should securely map to knowledge.dynamic.thetimemapsatlasofworldhistory with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about thetimemapsatlasofworldhistory please");
    assert.strictEqual(res.intent, "knowledge.dynamic.thetimemapsatlasofworldhistory");
    assert.strictEqual(res.confidence, 1.0);
  });
});
