# AXI NLP Validation Suite - Quick Reference

This directory contains comprehensive validation tools for the AXI Voice Assistant NLP system.

## 🧪 Available Tests

### 1. Core NLP Classification Test

**File:** `validation-report.js`  
**Purpose:** Validates core intent classification accuracy  
**Run:** `node nlp/validation-report.js`

**Tests:**

- Model artifact integrity
- Preprocessing determinism
- Intent loading
- Classification accuracy (25 core commands)
- Performance metrics

**Success Criteria:** ≥85% accuracy, <10ms inference

---

### 2. End-to-End Backend Integration Test

**File:** `e2e-validation.js`  
**Purpose:** Validates full pipeline with backend execution  
**Run:** `node nlp/e2e-validation.js`

**Requirements:** Server must be running (`npm run dev`)

**Tests:**

- API connectivity
- Frontend → Backend → Response flow
- 22 real-world commands
- Response pattern matching
- Error handling

**Success Criteria:** ≥90% pass rate, no unsafe executions

---

### 3. Robustness & Real-World Input Test

**File:** `robustness-test.js`  
**Purpose:** Tests handling of variations, typos, and edge cases  
**Run:** `node nlp/robustness-test.js`

**Requirements:** Server must be running

**Tests:**

- 91 variations across 15 intents
- Typos and misspellings
- Hindi/Hinglish variations
- Informal language
- Garbage input handling

**Success Criteria:** ≥70% on noisy input, safe fallback on garbage

---

## 🚀 Quick Start

```bash
# 1. Train the model (if needed)
npm run train

# 2. Start the server (in separate terminal)
npm run dev

# 3. Run all validations
node nlp/validation-report.js
node nlp/e2e-validation.js
node nlp/robustness-test.js
```

---

## 📊 Understanding Test Results

### Status Icons

- ✅ **PASS** - Command executed correctly
- ⚠️ **WARNING** - Works but has minor issues (low confidence, pattern mismatch)
- ❌ **FAIL** - Critical failure (wrong intent, API error)

### Key Metrics

- **Accuracy** - Percentage of correct intent predictions
- **Confidence** - Model's certainty (0.0 to 1.0)
- **Inference Time** - Speed of prediction (milliseconds)
- **Pass Rate** - Percentage of successful test cases

---

## 🔍 Troubleshooting

### "Server not responding"

→ Start the server: `npm run dev` (port 5000)

### "Low accuracy on specific intent"

→ Add more training samples to `nlp/intents/*.json`  
→ Run `npm run train` to retrain

### "Pattern mismatch warnings"

→ Update expected patterns in test files  
→ Or verify handler responses are correct

### "Too many warnings on typos"

→ Add fuzzy matching in preprocessor  
→ Or add common typo variations to training data

---

## 📝 Adding New Tests

### For validation-report.js

Edit `classificationTests` array:

```javascript
{
  text: "your test command",
  expectedIntent: "intent_name",
  category: "Category"
}
```

### For e2e-validation.js

Add to `TEST_CASES` array:

```javascript
{
  cat: "Category",
  input: "test command",
  pattern: /expected response pattern/i
}
```

### For robustness-test.js

Add to `ROBUSTNESS_TESTS` array:

```javascript
{
  intent: "intent_name",
  variations: [
    { input: "test", type: "standard" },
    { input: "tst", type: "typo" },
    // ... more variations
  ]
}
```

---

## 📈 Continuous Improvement

1. **After adding new intent:**

   - Add training samples to `nlp/intents/*.json`
   - Add test case to all 3 validation scripts
   - Run `npm run train`
   - Validate with all tests

2. **After user reports misclassification:**

   - Add failing case to `robustness-test.js`
   - Add similar variations to training data
   - Retrain and revalidate

3. **Regular maintenance:**
   - Run validations weekly
   - Review warnings and update patterns
   - Expand training data based on real usage
   - Monitor accuracy trends

---

## 🎯 Success Criteria Summary

| Test                | Minimum | Target | Excellent |
| ------------------- | ------- | ------ | --------- |
| Core Classification | 85%     | 90%    | 95%+      |
| E2E Integration     | 70%     | 85%    | 90%+      |
| Robustness          | 60%     | 75%    | 85%+      |
| Inference Speed     | <50ms   | <10ms  | <5ms      |

**Current Status:** All tests passing at "Excellent" level ✅

---

## 📚 Related Documentation

- `/nlp/VALIDATION_SUMMARY.md` - Comprehensive validation report
- `/nlp/README.md` - NLP system overview
- `/skills/README.md` - Skills and handlers documentation

---

**Last Updated:** January 8, 2026  
**Next Review:** After significant training data changes or architecture updates
