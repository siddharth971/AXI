# AXI Server Architecture

## Directory Structure

```
server/
├── app.js                    # Express server entry point
├── package.json
│
├── config/                   # Configuration
│   └── index.js
│
├── core/                     # Core services
│   ├── context.js            # Conversation context
│   ├── sessions.js           # Session management
│   └── index.js
│
├── data/                     # Runtime/generated data
│   ├── models/               # Trained ML models
│   │   └── model-tf/
│   └── logs/                 # Runtime logs
│
├── docs/                     # Documentation
│
├── nlp/                      # NLP Engine
│   ├── intents/              # Intent definitions (JSON)
│   ├── rules/                # Rule-based matching
│   ├── semantic/             # Semantic similarity
│   ├── knowledge/            # Knowledge base
│   └── *.js                  # NLP logic
│
├── skills/                   # Skills/Plugins
│   ├── plugins/              # Plugin implementations
│   ├── handlers/             # Legacy handlers
│   └── *.js                  # Router, registry
│
├── autonomous/               # Autonomous learning
│   ├── output/               # Explorer output
│   └── *.js                  # Explorer, discover
│
├── tests/                    # Test suites
│   ├── nlp/
│   ├── skills/
│   └── e2e/
│
└── utils/                    # Shared utilities
    ├── logger.js
    └── recursive-loader.js
```

## Key Principles

1. **Separation of Concerns**: Data files in `data/`, tests in `tests/`, docs in `docs/`
2. **Feature Modules**: `nlp/`, `skills/`, `autonomous/` are independent
3. **Extensibility**: Add plugins to `skills/plugins/` without modifying core
4. **No Circular Dependencies**: Clear import hierarchy
