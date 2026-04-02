/**
 * Auto-generated Test for homedesigndecoratingandremodelingideaslandscapingkitchenandbathroomdesign
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated homedesigndecoratingandremodelingideaslandscapingkitchenandbathroomdesign Intent", () => {
  it("should securely map to knowledge.dynamic.homedesigndecoratingandremodelingideaslandscapingkitchenandbathroomdesign with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about homedesigndecoratingandremodelingideaslandscapingkitchenandbathroomdesign please");
    assert.strictEqual(res.intent, "knowledge.dynamic.homedesigndecoratingandremodelingideaslandscapingkitchenandbathroomdesign");
    assert.strictEqual(res.confidence, 1.0);
  });
});
