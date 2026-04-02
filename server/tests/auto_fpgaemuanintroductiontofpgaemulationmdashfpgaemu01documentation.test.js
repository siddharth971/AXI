/**
 * Auto-generated Test for fpgaemuanintroductiontofpgaemulationmdashfpgaemu01documentation
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated fpgaemuanintroductiontofpgaemulationmdashfpgaemu01documentation Intent", () => {
  it("should securely map to knowledge.dynamic.fpgaemuanintroductiontofpgaemulationmdashfpgaemu01documentation with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about fpgaemuanintroductiontofpgaemulationmdashfpgaemu01documentation please");
    assert.strictEqual(res.intent, "knowledge.dynamic.fpgaemuanintroductiontofpgaemulationmdashfpgaemu01documentation");
    assert.strictEqual(res.confidence, 1.0);
  });
});
