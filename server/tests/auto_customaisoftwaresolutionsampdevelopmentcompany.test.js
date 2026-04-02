/**
 * Auto-generated Test for customaisoftwaresolutionsampdevelopmentcompany
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated customaisoftwaresolutionsampdevelopmentcompany Intent", () => {
  it("should securely map to knowledge.dynamic.customaisoftwaresolutionsampdevelopmentcompany with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about customaisoftwaresolutionsampdevelopmentcompany please");
    assert.strictEqual(res.intent, "knowledge.dynamic.customaisoftwaresolutionsampdevelopmentcompany");
    assert.strictEqual(res.confidence, 1.0);
  });
});
