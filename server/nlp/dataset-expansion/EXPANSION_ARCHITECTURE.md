# AXI Dataset Expansion Architecture

## Enterprise-Grade Linguistic Dataset Engineering Blueprint

**Version:** 1.0.0  
**Created:** 2026-01-23  
**Target Scale:** 1M+ Samples | 350K+ Vocabulary | 20K+ Intents

---

## 📊 Current Baseline Analysis

| Metric     | Current | Target     | Multiplier |
| ---------- | ------- | ---------- | ---------- |
| Vocabulary | 3,756   | 350,000+   | ~93×       |
| Intents    | 218     | 20,000+    | ~92×       |
| Samples    | 11,956  | 1,000,000+ | ~84×       |

---

## 🏗️ Expansion Architecture Overview

### Phase 1: Domain Saturation (Months 1-3)

### Phase 2: Cognitive & Emotional Deepening (Months 4-6)

### Phase 3: Discourse Complexity & Edge Cases (Months 7-9)

### Phase 4: Cultural & Temporal Expansion (Months 10-12)

---

## 🧠 Generation Philosophy Principles

### Anti-Pattern Rules (CRITICAL)

1. **NO Template Pollution**
   - Never use "Can you [verb]?" as a repeating pattern
   - Never use "Please [verb] the [noun]" mechanically
   - Each sample must feel organically composed

2. **NO Algorithmic Permutations**
   - Do not swap synonyms programmatically
   - Do not generate cartesian products of phrases
   - Each variation must have semantic justification

3. **NO Repetitive Metaphors**
   - Track metaphor usage across the dataset
   - Introduce diversity in figurative language
   - Rotate cultural references and idioms

4. **NO Over-Formalization**
   - Balance formal and casual register
   - Include incomplete sentences, stutters, repairs
   - Simulate real human speech patterns

---

## 📁 Directory Structure

```
server/nlp/dataset-expansion/
├── EXPANSION_ARCHITECTURE.md          # This document
├── schema/
│   └── sample-schema.json             # Annotation schema
├── domains/
│   ├── software-engineering/
│   ├── cloud-infrastructure/
│   ├── finance/
│   ├── healthcare/
│   ├── manufacturing/
│   ├── education/
│   ├── logistics/
│   ├── government/
│   ├── gaming/
│   └── entertainment/
├── cognitive-states/
│   ├── confusion.json
│   ├── anxiety.json
│   ├── curiosity.json
│   ├── impatience.json
│   └── precision-seeking.json
├── discourse-patterns/
│   ├── interruptions.json
│   ├── self-corrections.json
│   ├── incomplete-thoughts.json
│   └── layered-questions.json
├── cultural-variations/
│   ├── regional-dialects.json
│   ├── generational-speech.json
│   └── professional-registers.json
├── validation/
│   ├── uniqueness-scores.json
│   ├── coverage-maps.json
│   └── distribution-analysis.json
└── batches/
    ├── batch-001/
    ├── batch-002/
    └── ...
```

---

## 📋 Sample Annotation Schema

Every generated sample MUST include:

```json
{
  "id": "uuid-v4",
  "text": "actual utterance",
  "primary_intent": "intent.category.action",
  "secondary_intent": "optional.secondary.intent",
  "language": {
    "primary": "en",
    "mixing": ["hi", "es"],
    "register": "casual|formal|technical|slang"
  },
  "emotional_context": {
    "tone": "neutral|frustrated|excited|anxious|calm",
    "intensity": 0.0-1.0,
    "markers": ["specific", "emotion", "indicators"]
  },
  "cognitive_state": {
    "type": "focused|confused|multitasking|fatigued",
    "confidence_level": 0.0-1.0
  },
  "context": {
    "situation": "workplace|emergency|casual|learning",
    "urgency": "low|medium|high|critical",
    "background_activity": "optional description"
  },
  "implicit_goal": "what the user really wants to achieve",
  "risk_level": "none|low|medium|high",
  "discourse_features": {
    "completeness": "complete|interrupted|abandoned",
    "repairs": ["list", "of", "self-corrections"],
    "hedging": ["uncertainty", "markers"]
  },
  "metadata": {
    "domain": "software-engineering",
    "scenario": "debugging session",
    "generated_at": "ISO-8601 timestamp",
    "batch_id": "batch-XXX",
    "quality_score": 0.0-1.0
  }
}
```

---

## 🎯 Intent Taxonomy Expansion

### Level 1: Core Categories (20)

### Level 2: Sub-Categories (~100 each = 2,000)

### Level 3: Micro-Intents (~10 each = 20,000)

### Intent Decomposition Framework

For each existing intent, decompose into:

1. **Micro-Intents** - Atomic action breakdowns
2. **Contextual Intents** - Situation-specific variants
3. **Emotional Intents** - Mood-influenced variations
4. **Implicit Intents** - Unstated but inferable goals
5. **Meta-Intents** - Intents about intents (clarification, confirmation)
6. **Repair Intents** - Error recovery patterns
7. **Clarification Intents** - Disambiguation requests
8. **Hesitation Intents** - Uncertain expressions
9. **Social Intents** - Relationship management

### Example Decomposition: `open_website`

```
open_website                     # Base intent
├── open_website.specific        # "open google.com"
├── open_website.generic         # "open a website"
├── open_website.urgent          # "quick, open the bank website!"
├── open_website.uncertain       # "umm, can you maybe open... google?"
├── open_website.conditional     # "if it's working, open twitter"
├── open_website.chained         # "after closing this, open youtube"
├── open_website.corrected       # "open face... I mean facebook"
├── open_website.implicit        # "I need to check my email" (implies gmail)
├── open_website.frustrated      # "why isn't it opening? just open google already"
└── open_website.multitask       # "while that loads, also open spotify"
```

---

## 📚 Domain Coverage Matrix

### Software Engineering (Target: 50K samples)

| Sub-Domain         | Intents | Samples | Priority |
| ------------------ | ------- | ------- | -------- |
| Git Operations     | 150     | 5,000   | P0       |
| Debugging          | 200     | 7,000   | P0       |
| Code Review        | 100     | 3,500   | P1       |
| CI/CD              | 120     | 4,000   | P1       |
| IDE Operations     | 80      | 3,000   | P1       |
| Package Management | 90      | 3,000   | P2       |
| Testing            | 130     | 4,500   | P0       |
| Documentation      | 70      | 2,500   | P2       |
| Architecture       | 60      | 2,500   | P2       |
| Security           | 100     | 4,000   | P0       |

### Cloud Infrastructure (Target: 40K samples)

| Sub-Domain      | Intents | Samples | Priority |
| --------------- | ------- | ------- | -------- |
| AWS Services    | 200     | 7,000   | P0       |
| Azure Services  | 180     | 6,000   | P0       |
| GCP Services    | 150     | 5,000   | P1       |
| Kubernetes      | 120     | 4,500   | P0       |
| Docker          | 100     | 4,000   | P0       |
| Terraform       | 80      | 3,000   | P1       |
| Monitoring      | 90      | 3,500   | P1       |
| Networking      | 100     | 3,500   | P1       |
| Cost Management | 50      | 2,000   | P2       |
| Compliance      | 40      | 1,500   | P2       |

### Finance (Target: 35K samples)

| Sub-Domain  | Intents | Samples | Priority |
| ----------- | ------- | ------- | -------- |
| Trading     | 150     | 5,000   | P0       |
| Banking     | 180     | 6,000   | P0       |
| Investments | 120     | 4,000   | P1       |
| Accounting  | 100     | 3,500   | P1       |
| Budgeting   | 80      | 3,000   | P1       |
| Tax         | 70      | 2,500   | P2       |
| Insurance   | 60      | 2,000   | P2       |
| Crypto      | 100     | 4,000   | P0       |
| Compliance  | 50      | 2,000   | P2       |
| Reporting   | 40      | 1,500   | P2       |

_(Similar matrices for Healthcare, Manufacturing, Education, Logistics, Government, Gaming, Entertainment)_

---

## 🧪 Quality Control System

### Validation Layers

1. **Semantic Uniqueness Check**
   - Cosine similarity threshold: < 0.85
   - Prevent near-duplicate samples
   - Track semantic clusters

2. **Vocabulary Novelty Scoring**
   - New tokens per batch: > 2%
   - N-gram diversity metrics
   - Collocational variety

3. **Intent Orthogonality**
   - Inter-intent distinction score
   - Confusion matrix analysis
   - Boundary sample identification

4. **Bias Detection**
   - Demographic representation audit
   - Cultural reference balance
   - Register distribution check

5. **Distribution Balance**
   - Intent frequency normalization
   - Domain coverage uniformity
   - Emotional tone distribution

6. **Drift Prevention**
   - Periodic baseline comparison
   - Linguistic style consistency
   - Quality degradation alerts

---

## 📈 Expansion Metrics Dashboard

### Per-Batch Tracking

```
Batch ID: batch-XXX
├── Total Samples: N
├── New Vocabulary Items: N (N% of batch)
├── New Intents Introduced: N
├── Domain Coverage: [domain: percentage]
├── Cognitive State Distribution: [state: percentage]
├── Emotional Tone Distribution: [tone: percentage]
├── Average Quality Score: 0.XX
├── Uniqueness Score: 0.XX
├── Rejected Samples: N (N%)
└── Annotation Completeness: XX%
```

---

## 🚀 Generation Roadmap

### Immediate (Week 1-2)

- [ ] Create schema validation system
- [ ] Generate first high-density batch (5,000 samples)
- [ ] Establish quality baselines

### Short-Term (Month 1)

- [ ] Complete software engineering domain (50K samples)
- [ ] Complete cloud infrastructure domain (40K samples)
- [ ] Develop cognitive state variations (all domains)

### Medium-Term (Months 2-3)

- [ ] Complete finance, healthcare, manufacturing domains
- [ ] Introduce discourse complexity patterns
- [ ] Add cultural and regional variations

### Long-Term (Months 4-12)

- [ ] Complete all 10 domain saturations
- [ ] Full temporal variation coverage
- [ ] Edge case and stress test samples
- [ ] Final validation and deduplication

---

## 🛡️ Ethical & Safety Constraints

### Prohibited Content

- No harmful instructions (violence, self-harm)
- No illegal activity guidance
- No biased profiling or discrimination
- No private data simulation (real PII patterns)
- No political manipulation content
- No medical advice that could cause harm

### Required Safeguards

- All samples undergo safety classification
- High-risk intents require explicit safety annotations
- Harmful intent detection training samples clearly labeled
- Regular audit for bias accumulation

---

## 📖 Appendix: Linguistic Diversity Sources

### Regional Dialects

- British English
- American English
- Indian English
- Australian English
- Nigerian English
- Singaporean English

### Code-Mixing Patterns

- Hindi-English (Hinglish)
- Spanish-English (Spanglish)
- Arabic-English
- Chinese-English

### Professional Registers

- Academic
- Legal
- Medical
- Technical
- Business Formal
- Customer Service

### Generational Speech

- Gen Z slang
- Millennial patterns
- Professional mature
- Elder speech accommodations

### Internet Culture

- Meme language
- Gaming terminology
- Social media speak
- Streaming culture
