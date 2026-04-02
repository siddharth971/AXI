/**
 * Auto-generated Test for worldhistorymattersaportaltoworldhistorysitesfromthecenterforhistoryandnewmedia
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated worldhistorymattersaportaltoworldhistorysitesfromthecenterforhistoryandnewmedia Intent", () => {
  it("should securely map to knowledge.dynamic.worldhistorymattersaportaltoworldhistorysitesfromthecenterforhistoryandnewmedia with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about worldhistorymattersaportaltoworldhistorysitesfromthecenterforhistoryandnewmedia please");
    assert.strictEqual(res.intent, "knowledge.dynamic.worldhistorymattersaportaltoworldhistorysitesfromthecenterforhistoryandnewmedia");
    assert.strictEqual(res.confidence, 1.0);
  });
});
