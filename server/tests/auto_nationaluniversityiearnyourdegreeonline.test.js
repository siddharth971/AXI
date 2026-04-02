/**
 * Auto-generated Test for nationaluniversityiearnyourdegreeonline
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated nationaluniversityiearnyourdegreeonline Intent", () => {
  it("should securely map to knowledge.dynamic.nationaluniversityiearnyourdegreeonline with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about nationaluniversityiearnyourdegreeonline please");
    assert.strictEqual(res.intent, "knowledge.dynamic.nationaluniversityiearnyourdegreeonline");
    assert.strictEqual(res.confidence, 1.0);
  });
});
