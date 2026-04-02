/**
 * Auto-generated Test for hirevettedsoftwaredevelopersfull
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated hirevettedsoftwaredevelopersfull Intent", () => {
  it("should securely map to knowledge.dynamic.hirevettedsoftwaredevelopersfull with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about hirevettedsoftwaredevelopersfull please");
    assert.strictEqual(res.intent, "knowledge.dynamic.hirevettedsoftwaredevelopersfull");
    assert.strictEqual(res.confidence, 1.0);
  });
});
