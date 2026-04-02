/**
 * Auto-generated Test for classcentralfindthebestcourseswherevertheyexist
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated classcentralfindthebestcourseswherevertheyexist Intent", () => {
  it("should securely map to knowledge.dynamic.classcentralfindthebestcourseswherevertheyexist with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about classcentralfindthebestcourseswherevertheyexist please");
    assert.strictEqual(res.intent, "knowledge.dynamic.classcentralfindthebestcourseswherevertheyexist");
    assert.strictEqual(res.confidence, 1.0);
  });
});
