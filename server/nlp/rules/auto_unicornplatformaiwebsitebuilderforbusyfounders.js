/**
 * Auto-generated Rule for Unicorn Platform 🦄  AI Website Builder for Busy Founders
 */
module.exports = function(text, nlu) {
  if (/\b(unicornplatformaiwebsitebuilderforbusyfounders|Unicorn)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.unicornplatformaiwebsitebuilderforbusyfounders",
      confidence: 1.0,
      entities: { topic: "Unicorn Platform 🦄  AI Website Builder for Busy Founders" }
    };
  }
  return null;
};
