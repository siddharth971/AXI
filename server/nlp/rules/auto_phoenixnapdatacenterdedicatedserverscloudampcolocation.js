/**
 * Auto-generated Rule for phoenixNAP: Data Center, Dedicated Servers, Cloud, &amp; Colocation
 */
module.exports = function(text, nlu) {
  if (/\b(phoenixnapdatacenterdedicatedserverscloudampcolocation|phoenixNAP)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.phoenixnapdatacenterdedicatedserverscloudampcolocation",
      confidence: 1.0,
      entities: { topic: "phoenixNAP: Data Center, Dedicated Servers, Cloud, &amp; Colocation" }
    };
  }
  return null;
};
