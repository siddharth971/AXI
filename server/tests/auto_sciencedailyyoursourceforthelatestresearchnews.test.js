/**
 * Auto-generated Test for sciencedailyyoursourceforthelatestresearchnews
 */
const assert = require("assert");
const nlp = require("../nlp/nlp");

describe("NLP: Auto Generated sciencedailyyoursourceforthelatestresearchnews Intent", () => {
  it("should securely map to knowledge.dynamic.sciencedailyyoursourceforthelatestresearchnews with 1.0 confidence", () => {
    const res = nlp.interpretSync("Tell me about sciencedailyyoursourceforthelatestresearchnews please");
    assert.strictEqual(res.intent, "knowledge.dynamic.sciencedailyyoursourceforthelatestresearchnews");
    assert.strictEqual(res.confidence, 1.0);
  });
});
