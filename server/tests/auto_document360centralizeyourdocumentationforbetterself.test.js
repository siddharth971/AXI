/**
 * Auto-generated Test for document360centralizeyourdocumentationforbetterself
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated document360centralizeyourdocumentationforbetterself Intent", () => {
  it("should securely map to knowledge.dynamic.document360centralizeyourdocumentationforbetterself with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about document360centralizeyourdocumentationforbetterself please");
    assert.strictEqual(res.intent, "knowledge.dynamic.document360centralizeyourdocumentationforbetterself");
    assert.strictEqual(res.confidence, 1.0);
  });
});
