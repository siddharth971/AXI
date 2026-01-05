# AXI Voice Assistant - Server

A hybrid NLP-powered voice assistant backend.

## 📁 Directory Structure

```
server/
├── app.js              # Main entry point (Express server)
├── package.json        # Dependencies and scripts
│
├── config/             # Configuration
│   └── index.js        # Centralized config & env vars
│
├── core/               # Core systems
│   ├── index.js        # Barrel export
│   └── context.js      # Conversation context manager
│
├── nlp/                # Natural Language Processing
│   ├── nlp.js          # Main NLP engine (rules + ML)
│   ├── train.js        # Training script
│   ├── intent-loader.js # Loads & merges intent files
│   ├── intents/        # ⭐ SPLIT INTENT FILES
│   │   ├── greeting.json
│   │   ├── browser.json
│   │   ├── system.json
│   │   ├── information.json
│   │   └── chat.json
│   ├── vocab.json      # Generated vocabulary
│   ├── model-meta.json # Neural network metadata
│   └── model-weights.json  # Neural network weights
│
├── skills/             # Skill handlers
│   ├── index.js        # Barrel export
│   ├── router.js       # Intent-to-skill routing
│   └── handlers/       # Individual skill modules
│       ├── index.js    # Barrel export
│       ├── browser.js  # Browser operations
│       ├── system.js   # System operations
│       ├── general.js  # Aggregator for responses
│       └── responses/  # ⭐ SPLIT RESPONSE FILES
│           ├── helpers.js    # Utility functions
│           ├── greeting.js
│           ├── information.js
│           ├── chat.js
│           └── fallback.js
│
└── utils/              # Utilities
    ├── index.js        # Barrel export
    └── logger.js       # Logging utility
```

## 🚀 Scripts

```bash
npm run dev      # Start development server (nodemon)
npm run start    # Start production server
npm run train    # Train the NLP model
```

## 🔌 API Endpoints

| Method | Endpoint       | Description                |
| ------ | -------------- | -------------------------- |
| POST   | `/api/command` | Process voice/text command |
| GET    | `/api/health`  | Health check               |
| GET    | `/api/history` | Get conversation history   |

## ➕ Adding New Intents

1. Create or edit a file in `nlp/intents/` (e.g., `shopping.json`)
2. Add intents in the format:
   ```json
   [{ "intent": "buy_item", "utterances": ["buy this", "purchase"] }]
   ```
3. Run `npm run train`

## ➕ Adding New Responses

1. Create a file in `skills/handlers/responses/` (e.g., `shopping.js`)
2. Export your functions
3. Import in `skills/handlers/general.js`
4. Add the intent case in `skills/router.js`

## 🧠 NLP Architecture

The NLP system is a full **Natural Language Understanding (NLU) pipeline**:

### Pipeline Flow

```
User Input
    ↓
┌─────────────────────────────────────────┐
│ 1. PREPROCESSING                        │
│    - Normalization (lowercase, trim)    │
│    - Tokenization                       │
│    - Stopword removal (optional)        │
│    - Lemmatization                      │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 2. ENTITY EXTRACTION (NER)              │
│    - People, Places, Organizations      │
│    - Dates, Numbers, URLs               │
│    - POS Tagging (Nouns, Verbs, etc.)   │
│    - Sentiment Analysis                 │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 3. RULES LAYER (Fast, Exact)            │
│    - Regex patterns for commands        │
│    - Uses extracted entities            │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 4. ML LAYER (Fuzzy, Learning)           │
│    - Brain.js neural network            │
│    - Fallback when rules don't match    │
└─────────────────────────────────────────┘
    ↓
Intent + Entities + Confidence
```

### NLP Files

```
nlp/
├── nlp.js              # Main NLP engine
├── nlu-pipeline.js     # Full NLU orchestrator
├── preprocessor.js     # Text preprocessing
├── entity-extractor.js # NER & POS tagging (uses compromise.js)
├── intent-loader.js    # Loads intent files
├── train.js            # Model training
└── intents/            # Training data (split files)
```

## 📝 Configuration

All configuration is in `config/index.js`:

- Server port
- NLP confidence threshold
- Website mappings
- Feature flags
