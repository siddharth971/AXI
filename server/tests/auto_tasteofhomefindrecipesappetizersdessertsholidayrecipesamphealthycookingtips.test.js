/**
 * Auto-generated Test for tasteofhomefindrecipesappetizersdessertsholidayrecipesamphealthycookingtips
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated tasteofhomefindrecipesappetizersdessertsholidayrecipesamphealthycookingtips Intent", () => {
  it("should securely map to knowledge.dynamic.tasteofhomefindrecipesappetizersdessertsholidayrecipesamphealthycookingtips with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about tasteofhomefindrecipesappetizersdessertsholidayrecipesamphealthycookingtips please");
    assert.strictEqual(res.intent, "knowledge.dynamic.tasteofhomefindrecipesappetizersdessertsholidayrecipesamphealthycookingtips");
    assert.strictEqual(res.confidence, 1.0);
  });
});
