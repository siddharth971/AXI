/**
 * Auto-generated Rule for ScienceDaily: Your source for the latest research news
 */
module.exports = function(text, nlu) {
  if (/\b(sciencedailyyoursourceforthelatestresearchnews|ScienceDaily)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.sciencedailyyoursourceforthelatestresearchnews",
      confidence: 1.0,
      entities: { topic: "ScienceDaily: Your source for the latest research news" }
    };
  }
  return null;
};
