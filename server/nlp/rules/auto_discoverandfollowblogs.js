/**
 * Auto-generated Rule for Discover and Follow Blogs
 */
module.exports = function(text, nlu) {
  if (/\b(discoverandfollowblogs|Discover)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.discoverandfollowblogs",
      confidence: 1.0,
      entities: { topic: "Discover and Follow Blogs" }
    };
  }
  return null;
};
