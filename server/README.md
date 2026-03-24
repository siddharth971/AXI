# 🧠 AXI Server: The Definitive Architectural Guide

AXI (Advanced Cybernetic Intelligence) is a state-of-the-art hybrid NLP backend. This document provides a **no-detail-missed** breakdown of every subsystem, data flow, and design pattern used in the server.

---

---

## 📂 Deep Project Structure

The AXI Monorepo is organized for high modularity and autonomous scalability.

### 🏛️ Root & Frontend
```text
AXI/
├── client/                     # Angular 19 HUD (Vision & Interface)
│   ├── src/app/                # HUD Logic (Chat, Visualizers, JARVIS mode)
│   ├── src/assets/             # Static Assets (Neural SFX, Icons)
│   ├── angular.json            # Build Configurations
│   └── package.json            # Frontend Dependencies
└── shared/                     # Types and constants shared between Client/Server
```

### 🧠 Neural Engine (Server)
```text
server/
├── autonomous/                 # THE CRAWLER (Blueprint Engine)
│   ├── explorer.mjs            # Sharded Web Explorer (Blueprint Gen)
│   ├── extract.js              # Recursive Data Extraction
│   └── domains.json            # Target Knowledge Index
├── core/                       # BRAIN CORE (Singletons)
│   ├── context.js              # Short-term Memory (Pronoun/Context)
│   ├── learning.js             # User Feedback & Correction Engine
│   ├── memory.js               # Long-term Knowledge Persistence
│   ├── proactive.js            # Trigger-based Interaction Engine
│   ├── scheduler.js            # 3 AM "Brain Cycle" Manager
│   └── socket.js               # Real-time WebSocket Gateway
├── nlp/                        # NATURAL LANGUAGE LAYER
│   ├── intents/                # Training Data (Over 20 JSON datasets)
│   ├── rules/                  # Manual Rule-based Overrides (RegEx)
│   ├── semantic/               # Vector Embeddings & Similarity Logic
│   ├── decision-engine.js      # Logic Resolution authority
│   └── nlu-pipeline.js         # Tokenization/NER/Sentiment chain
├── skills/                     # CAPABILITY LAYER (Plugins)
│   ├── plugins/                # Every *.plugin.js is auto-discovered
│   │   ├── system_control      # Hardware/Windows Control
│   │   ├── developer           # Git/NPM/Terminal automation
│   │   └── realtime_knowledge  # Live Web/DDG search
│   ├── handlers/               # Lower-level skill logic
│   └── responses/              # Multi-modal response templates
├── triggers/                   # PROACTIVE TRIGGERS
│   ├── morning-briefing.js     # Daily automated summary
│   └── system-health.js        # Latency/Usage monitoring
├── utils/                      # SYSTEM TOOLS
│   ├── logger.js               # Colored console output
│   └── recursive-loader.js     # Dynamically loads all plugins
└── app.js                      # NEURAL ENGINE ENTRY POINT
```

## 🏛️ System Philosophy & Core Patterns

AXI is built on three foundational pillars:
1.  **Hybrid Intelligence**: Combining deterministic rules with fuzzy machine learning and semantic similarity.
2.  **Decoupled Skills**: A plugin-based architecture where every capability is an isolated unit.
3.  **Proactive Autonomy**: Systems that learn, explore, and interact without manual intervention.

### Key Design Patterns
-   **Singleton Services**: Core systems like `Socket`, `Registry`, and `Scheduler` are singletons.
-   **Middleware-First**: Heavy use of Express middleware for validation (`Zod`) and context initialization.
-   **Stateful Sessions**: Multi-turn conversation support via a robust session-state machine.

---

## 🌊 The Request Lifecycle (Deep Trace)

When a user says "*Open YouTube and play lofi music*", the following happens:

1.  **Socket/API Ingress**: The request enters via `POST /api/command` or a WebSocket event.
2.  **Context Resolution**: `ContextResolver` checks for pronouns. If the user previously talked about "YouTube", "it" is resolved to the URL.
3.  **NLU Pipeline**: 
    - `Preprocessor` tokenizes and lemmatizes.
    - `EntityExtractor` (via **compromise.js**) identifies "YouTube" as a `Website` and "lofi music" as a `SearchQuery`.
    - `POS Tagger` identifies "Open" and "Play" as action verbs.
4.  **Multi-Intent Detection**: The `DecisionEngine` detects the "and" conjunction, splitting the command into two segments.
5.  **Layered Inference**:
    - **Rules Layer**: Checks for regex matches (e.g., `open [site]`).
    - **Semantic Layer**: Compares embeddings against known variants.
    - **Classifier**: Brain.js provides a fuzzy prediction.
6.  **Conflict Resolution**: The `DecisionEngine` picks the most reliable signal (Rules > Semantic > ML).
7.  **Skill Dispatch**: The `Router` looks up the handler in the `Registry`.
    - Segment 1 -> `browser.plugin` -> `open_website`.
    - Segment 2 -> `youtube.plugin` -> `search_and_play`.
8.  **Execution**: Handlers use `child_process` or `fetch` to perform actions.
9.  **Response Synthesis**: `Context` and `Memory` are updated. The final response is returned.

---

## 🧠 NLP Pipeline Excellence (`/nlp`)

### 1. Preprocessing (`preprocessor.js`)
- **Normalization**: Lowercasing and striping non-alphanumeric (keeping hyphen/apostrophe).
- **Stopword Filtering**: Removes 50+ common English particles (a, the, is) to focus on signal words.
- **Lemmatization**: Systematic suffix stripping (ing, ed, es, ly) to reduce word variants.

### 2. NLU & Entity Extraction (`nlu-pipeline.js`, `entity-extractor.js`)
- **Named Entity Recognition (NER)**: Powered by `compromise.js`.
- **Custom Slot Filling**: Specialized regex-based extractors for URLs, Search Queries, and Application Names.
- **Sentiment Analysis**: Score-based analysis (Positive/Negative/Neutral) used to tune response tone.

### 3. Layered Inference Mechanics
- **Rules Layer**: Handlers in `nlp/rules/` provide manual overrides.
- **Semantic Layer**: Vector-space matching.
- **ML Layer**: A feed-forward neural network (Brain.js) trained on `nlp/intents/*.json`.

---

## ⚡ Skill & Plugin Infrastructure (`/skills`)

### The Automated Registry (`registry.js`)
The registry is a dynamic discovery service. On startup, it:
1.  Scans `skills/plugins/*.plugin.js`.
2.  Hot-loads the modules (clearing cache for dev-mode updates).
3.  Validates the **Plugin Contract**:
    - `name` and `description` required.
    - `intents` must specify `confidence` thresholds and `requiresConfirmation` flags.

### The Stateful Router (`router.js`)
The router implements a **State Machine** for complex interactions:
- **Confirmation Flow**: If `requiresConfirmation` is true, the router stores the parameters in a `pendingConfirmations` Map and emits a prompt. The next user input is intercepted as a Yes/No.
- **Wait Context**: If a plugin needs more data (e.g., "Which website?"), it sets an `awaiting` state and intercepts the next message.

---

## 💾 Core Intelligence Matrix (`/core`)

- **Context (`context.js`)**: A "sliding window" of recent interactions. Essential for pronoun resolution and follow-up intent detection.
- **Memory (`memory.js`)**: A key-value store for "facts" learned about the user or the environment.
- **Sessions (`sessions.js`)**: Multi-session management. Each session has its own history and awaiting-state.

---

## 🔄 Autonomous Ecosystem (`/autonomous`)

The AXI server is self-improving through the **Autonomous Learning Cycle**:

1.  **Explorer (`explorer.mjs`)**: A sharded crawler that visits URLs to extract structured "blueprints" (SEO, Assets, Infrastructure, API Manifests).
2.  **Extractor (`extract.js`)**: Analyzes raw data into searchable knowledge blocks.
3.  **Scheduler (`scheduler.js`)**: Manages the daily 3 AM "Brain Cycle" and hourly health checks.

---

## 📡 Proactive Interaction Layer

AXI doesn't wait for you. The **Proactive Engine** (`proactive.js`) monitors:
- **Triggers**: Time-based (Morning Briefing) or Event-based (System issues).
- **Socket.IO Protocol**: Real-time push notifications to the HUD.

---

## 🛠️ Developer's Handbook

### Adding a Complex Skill
1.  **File**: Create `skills/plugins/my_skill.plugin.js`.
2.  **Logic**: Implement the handler using `executionContext` to access memory.
3.  **Intents**: Define utterances in a JSON file and run `npm run train`.

### Debugging the Brain
Use the built-in diagnostic scripts:
- `node nlp/nlp.js --debug "your command"`: Trace NLU output.
- `node autonomous/explorer.mjs --verify`: Audit the knowledge crawl.
- `node tests/axi-complete-test-suite.js`: Run 200+ integration tests.

---

## 📦 Infrastructure & Deployment

- **Containerization**: Single-stage Dockerfile optimized for Node.js production.
- **Persistence**: File-based JSON storage (default) or Prisma/Postgres (configurable).
- **Environment**: All secrets and ports managed via `config/index.js`.
