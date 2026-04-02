/**
 * Auto-generated Test for computerandelectronicsrecyclingservices
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated computerandelectronicsrecyclingservices Intent", () => {
  it("should securely map to knowledge.dynamic.computerandelectronicsrecyclingservices with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about computerandelectronicsrecyclingservices please");
    assert.strictEqual(res.intent, "knowledge.dynamic.computerandelectronicsrecyclingservices");
    assert.strictEqual(res.confidence, 1.0);
  });
});
