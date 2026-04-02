/**
 * Auto-generated Test for w3schoolsonlinewebtutorials
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated w3schoolsonlinewebtutorials Intent", () => {
  it("should securely map to knowledge.dynamic.w3schoolsonlinewebtutorials with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about w3schoolsonlinewebtutorials please");
    assert.strictEqual(res.intent, "knowledge.dynamic.w3schoolsonlinewebtutorials");
    assert.strictEqual(res.confidence, 1.0);
  });
});
