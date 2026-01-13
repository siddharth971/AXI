const fs = require('fs');
const path = require('path');

class KnowledgeEngine {
  constructor() {
    this.knowledgeBase = [];
    this.loadKnowledge();
  }

  loadKnowledge() {
    try {
      const corePath = path.join(__dirname, 'core_knowledge.json');
      if (fs.existsSync(corePath)) {
        this.knowledgeBase = JSON.parse(fs.readFileSync(corePath, 'utf8'));
        console.log(`🧠 [KnowledgeEngine] Loaded ${this.knowledgeBase.length} knowledge units.`);
      }
    } catch (error) {
      console.error("❌ [KnowledgeEngine] Failed to load knowledge:", error);
    }
  }

  /**
   * Finds knowledge relevant to a specific intent.
   * Useful when the user asks "Why?" or when an error occurs for that intent.
   */
  getKnowledgeForIntent(intentName) {
    return this.knowledgeBase.filter(k => k.related_intents.includes(intentName));
  }

  /**
   * Finds common mistakes for a domain.
   * Useful for proactive troubleshooting.
   */
  getCommonMistakes(domain) {
    return this.knowledgeBase.filter(k => k.domain === domain && k.type === 'COMMON_MISTAKE');
  }

  /**
   * Semantic search (naive implementation for now).
   * Finds knowledge based on keyword matching in title/content.
   */
  search(query) {
    const q = query.toLowerCase();
    return this.knowledgeBase.filter(k =>
      k.title.toLowerCase().includes(q) ||
      k.content.toLowerCase().includes(q) ||
      k.examples.some(ex => ex.toLowerCase().includes(q))
    );
  }

  /**
   * Returns a thinking propmt part for the response generator
   */
  consult(intent, context) {
    const relevant = this.getKnowledgeForIntent(intent);
    if (relevant.length === 0) return null;

    return relevant.map(k => `[KNOWLEDGE (${k.type}): ${k.content}]`).join('\n');
  }
}

module.exports = new KnowledgeEngine();
