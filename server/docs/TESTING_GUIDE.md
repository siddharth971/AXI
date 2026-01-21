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

### 4. Conversational Intelligence Regression Test (NEW)

**File:** `regression-conversation-tests.js`  
**Purpose:** Ensures NLP intelligence improvements don't regress  
**Run:** `node nlp/regression-conversation-tests.js`

**CLI Options:**

- `--ci` - CI/CD mode with exit codes (exit 1 on failure)
- `--nlp-only` - Skip backend, test NLP classification only
- `--quiet` - Minimal output

**npm Scripts:**

```bash
npm run test:regression      # Full regression suite
npm run test:regression:ci   # CI mode with exit codes
npm run test:regression:quick # NLP-only, quiet mode
npm run test:all             # Run all validation suites
```

**Test Categories (8 Mandatory):**

1. **Indirect / Implied Requests** - "I'm bored, play something nice"
2. **Multi-Intent Sentences** - "Open YouTube and play music"
3. **Context-Based Follow-ups** - "play music" → "louder"
4. **Conversational / Natural Language** - "Could you please open YouTube?"
5. **User Corrections** - "no wait, open youtube instead"
6. **Ambiguous Input** - "Open it" (should clarify, not guess)
7. **Story-Based Input** - "I was working late and forgot what day it is"
8. **Misspellings / Informal Language** - "opn youtub"

**Assertions (Strict):**

- ✅ Correct intent selected
- ✅ Correct confidence behavior (High→execute, Medium→clarify, Low→unknown)
- ✅ Correct use of context (if applicable)
- ❌ No unsafe action on ambiguity
- ❌ No fallback to keyword-only behavior

**Critical Fail Conditions:**

- Previously passing AFTER behavior fails
- Context is ignored in multi-turn tests
- System guesses instead of asking for clarification
- Unsafe execution occurs on ambiguous input

**Success Criteria:**

- All AFTER behaviors enforced
- BEFORE failures remain impossible
- Zero unsafe executions
- Regression Detected: NO

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
