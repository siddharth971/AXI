# AXI Testing Framework - Quick Start Guide

Fast-track guide to using the AXI Enterprise Testing Framework.

## Prerequisites

1. Node.js (v14+)
2. AXI Server running on `http://localhost:5000`
3. Dependencies installed (`npm install axios zod`)

## Running Tests

### Quick Commands

```bash
# Navigate to tests directory
cd server/tests

# Run smoke tests (2 minutes)
node run-all-tests.js --suite smoke

# Run full regression (45 minutes)
node run-all-tests.js --suite regression

# Run security tests only (MUST PASS for production)
node run-all-tests.js --suite security

# Run specific domain
node run-all-tests.js --domain DOM-01
node run-all-tests.js --domain DOM-08

# Run with priority filter
node run-all-tests.js --priority CRITICAL

# CI mode (machine-readable output)
node run-all-tests.js --suite regression --ci
```

### Running Individual Test Files

```bash
# Security tests
node domain_08_security/security-tests.js

# Conversational tests
node domain_01_conversational/conversational-tests.js

# Legacy comprehensive check (existing)
node comprehensive_check.js

# Robustness tests (existing)
node nlp/robustness-test.js

# Regression conversation tests (existing)
node nlp/regression-conversation-tests.js
```

## Test Structure

```
tests/
├── run-all-tests.js              # Master runner
├── comprehensive_check.js        # Original tests (preserved)
├── verify_improvements.js        # Original tests (preserved)
├── TESTING_FRAMEWORK.md          # Full documentation
├── QUICKSTART.md                 # This file
│
├── config/
│   └── ci.config.js              # Configuration & thresholds
│
├── utils/
│   ├── test-helpers.js           # Assertion & utility functions
│   └── test-runner.js            # Enhanced test runner
│
├── fixtures/
│   ├── security.fixtures.json    # Security test cases
│   ├── chaos.fixtures.json       # Edge case test cases
│   └── conversational.fixtures.json
│
├── domain_01_conversational/
│   └── conversational-tests.js   # Context & multi-turn tests
│
├── domain_08_security/
│   └── security-tests.js         # Security validation tests
│
├── nlp/                          # Original NLP tests (preserved)
│   ├── regression-conversation-tests.js
│   ├── robustness-test.js
│   └── ...
│
└── skills/                       # Original skill tests (preserved)
    └── ...
```

## Test Suites

| Suite         | Duration | Use Case                        |
| ------------- | -------- | ------------------------------- |
| `smoke`       | ~2 min   | Quick validation before commits |
| `sanity`      | ~10 min  | Core functionality check        |
| `regression`  | ~45 min  | Full coverage for PRs/releases  |
| `security`    | ~5 min   | Security validation (MUST PASS) |
| `performance` | ~10 min  | Latency & load testing          |
| `chaos`       | ~20 min  | Edge cases & fuzzing            |

## Test Priorities

- **P0 CRITICAL**: Must pass always (security, core functions)
- **P1 HIGH**: Must pass for releases
- **P2 MAJOR**: Should pass for quality
- **P3 MINOR**: Edge cases
- **P4 TRIVIAL**: Nice-to-have

## Adding New Tests

### 1. Single Test Case

Add to appropriate fixture file:

```json
{
  "id": "CTX-01-A-010",
  "name": "My new context test",
  "turns": [
    { "user": "open youtube", "expectedIntent": "open_youtube" },
    { "user": "close it", "expectedIntent": "close_youtube" }
  ],
  "priority": "HIGH"
}
```

### 2. New Test Category

1. Create fixture file: `fixtures/my-category.fixtures.json`
2. Create test file: `domain_XX_category/my-tests.js`
3. Register in `run-all-tests.js` testModules

### 3. Using Test Helpers

```javascript
const helpers = require("./utils/test-helpers");

// Send command
const result = await helpers.sendCommand("open youtube");

// Assert intent
helpers.assertIntentMatch(result.intent, "open_youtube");

// Assert confidence
helpers.assertConfidence(result.confidence, 0.7);

// Assert response pattern
helpers.assertResponsePattern(result.response, /opening|opened/i);
```

## Quality Gates

Tests must pass these thresholds:

| Gate    | Pass Rate    | Safety Violations |
| ------- | ------------ | ----------------- |
| Commit  | 100% (smoke) | 0                 |
| PR      | 98%          | 0                 |
| Release | 99%          | 0                 |

## Troubleshooting

### Server not responding

```bash
# Check if server is running
curl http://localhost:5000/api/health

# Start server if needed
cd server && npm start
```

### Tests timing out

```bash
# Increase timeout
TEST_TIMEOUT=15000 node run-all-tests.js
```

### Flaky tests

- Check for session isolation issues
- Ensure tests don't depend on execution order
- Mark flaky tests with `@flaky` tag

## CI/CD Integration

### GitHub Actions Example

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Start server
        run: npm start &
      - name: Wait for server
        run: sleep 5
      - name: Run smoke tests
        run: node server/tests/run-all-tests.js --suite smoke --ci
      - name: Run security tests
        run: node server/tests/run-all-tests.js --suite security --ci
```

## Next Steps

1. Read the full documentation: [TESTING_FRAMEWORK.md](./TESTING_FRAMEWORK.md)
2. Explore existing tests to understand patterns
3. Add domain-specific tests as needed
4. Set up CI/CD pipeline

---

_Questions? Check the full playbook or create an issue._
