/**
 * Auto-generated Test for arlingtonmaroofingcompanyresidentialampcommercial
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated arlingtonmaroofingcompanyresidentialampcommercial Intent", () => {
  it("should securely map to knowledge.dynamic.arlingtonmaroofingcompanyresidentialampcommercial with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about arlingtonmaroofingcompanyresidentialampcommercial please");
    assert.strictEqual(res.intent, "knowledge.dynamic.arlingtonmaroofingcompanyresidentialampcommercial");
    assert.strictEqual(res.confidence, 1.0);
  });
});
