/**
 * Auto-generated Test for thelatesttechnologyproductreviewsnewstipsanddeals
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated thelatesttechnologyproductreviewsnewstipsanddeals Intent", () => {
  it("should securely map to knowledge.dynamic.thelatesttechnologyproductreviewsnewstipsanddeals with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about thelatesttechnologyproductreviewsnewstipsanddeals please");
    assert.strictEqual(res.intent, "knowledge.dynamic.thelatesttechnologyproductreviewsnewstipsanddeals");
    assert.strictEqual(res.confidence, 1.0);
  });
});
