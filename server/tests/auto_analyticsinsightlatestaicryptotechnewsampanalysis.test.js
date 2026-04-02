/**
 * Auto-generated Test for analyticsinsightlatestaicryptotechnewsampanalysis
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated analyticsinsightlatestaicryptotechnewsampanalysis Intent", () => {
  it("should securely map to knowledge.dynamic.analyticsinsightlatestaicryptotechnewsampanalysis with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about analyticsinsightlatestaicryptotechnewsampanalysis please");
    assert.strictEqual(res.intent, "knowledge.dynamic.analyticsinsightlatestaicryptotechnewsampanalysis");
    assert.strictEqual(res.confidence, 1.0);
  });
});
