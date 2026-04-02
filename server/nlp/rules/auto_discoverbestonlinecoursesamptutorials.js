/**
 * Auto-generated Rule for Discover Best Online Courses &amp; Tutorials
 */
module.exports = function(text, nlu) {
  if (/\b(discoverbestonlinecoursesamptutorials|Discover)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.discoverbestonlinecoursesamptutorials",
      confidence: 1.0,
      entities: { topic: "Discover Best Online Courses &amp; Tutorials" }
    };
  }
  return null;
};
