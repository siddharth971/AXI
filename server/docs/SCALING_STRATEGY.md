# AXI Intelligence Scaling Strategy

**Architect:** Antigravity  
**Version:** 1.0.0  
**Target Scale:** 5M Vocabulary / 50k Actions / 2M Samples

## 1. Intent Family Tree

We move from flat intents to a strict hierarchy. The `Router` model classifies into a Family, then a Specialized Model (or Rule Engine) refines the specific intent.

### 🌳 Root Families

1.  **System Core** (`system.*`)
    - _Sub-families:_ Power, Audio, Display, WindowManager, Hardware
2.  **Connectivity** (`network.*`)
    - _Sub-families:_ WiFi, Bluetooth, AirplaneMode, VPN
3.  **IO / Filesystem** (`file.*`)
    - _Sub-families:_ Operations (CRUD), Navigation, Search, Archives
4.  **DevOps & Code** (`dev.*`)
    - _Sub-families:_ Git, PackageManagers (NPM/Pip), Docker, IDE Control
5.  **Media & Entertainment** (`media.*`)
    - _Sub-families:_ Playback, Transport, Volume (Contextual), Library
6.  **Web & Browser** (`browser.*`)
    - _Sub-families:_ Navigation, Tabs, History, Bookmarks
7.  **Productivity** (`office.*`)
    - _Sub-families:_ Time (Clock/Timer), Calendar, Email, Notes
8.  **Knowledge & Chat** (`chat.*`)
    - _Sub-families:_ Q&A, SmallTalk, Personality, Calculator

---

## 2. Core Intent List (The "800" Limit)

We do **NOT** train `file.open_report_pdf`. We train `file.open`.  
The _Parameter Slot_ handles the specificity.

**Example Reduction:**

- ❌ `git_commit`, `git_push`, `git_pull` (3 Intents)
- ✅ `dev.git_action` (1 Intent) + Entity: `{action: "commit"}`
- ❌ `brightness_up_10`, `brightness_up_20`
- ✅ `display.brightness_set` (1 Intent) + Entity: `{value: "10%"}`

**Target Core Distribution:**

- System: ~50 intents
- Dev: ~100 intents
- Media: ~30 intents
- File: ~20 intents
- Web: ~40 intents
- ...Total < 300 active training classes.

---

## 3. Skill Composition Map

Skills consist of a **Trigger** (Core Intent) and **Parameters** (Entities).

| Core Intent   | Entities (Dynamic)     | Resulting Logical Action |
| :------------ | :--------------------- | :----------------------- |
| `app.open`    | `{app: "vscode"}`      | Open VS Code             |
| `app.open`    | `{app: "spotify"}`     | Open Spotify             |
| `file.delete` | `{target: "*.tmp"}`    | Delete Extension         |
| `file.delete` | `{target: "old_logs"}` | Delete Folder            |
| `dev.run`     | `{cmd: "npm start"}`   | Run Script               |
| `dev.run`     | `{cmd: "docker up"}`   | Run Container            |

_Note: The model learns ONE pattern (`verb + entity`), but we achieve infinite actions._

---

## 4. Vocabulary Layer Breakdown

To reach 5M tokens without noise, we layer the vocabulary.

### Layer 1: Core Verbs (1,500)

- _Static, High-Frequency_
- `open`, `close`, `start`, `stop`, `run`, `delete`, `create`, `search`...

### Layer 2: Synonyms & Hinglish (40,000)

- _Mapped 1:1 to Core_
- `chalao` -> `start`
- `band karo` -> `stop`
- `hatao` -> `remove`
- `execute`, `launch`, `initiate`, `destroy`, `wipe`...

### Layer 3: Dynamic Entity Slots (The ~5M)

- **DO NOT TRAIN THESE IN THE NEURAL NET.**
- These are injected at runtime via Named Entity Recognition (NER) or fuzzy matching.
- **App Names:** `chrome`, `photoshop`, `valorant`...
- **File Types:** `pdf`, `jpg`, `js`, `json`...
- **Project Names:** `jarvis`, `axi`, `backend`...

---

## 5. Sample Generation Strategy

We programmatically generate samples to ensure balanced distribution.

**Template Format:**

```json
{
  "intent": "app.open",
  "patterns": [
    "{verb_open} {app_name}",
    "please {verb_open} {app_name}",
    "{app_name} {verb_open} {politeness}",
    "can you {verb_open} {app_name} for me"
  ],
  "slots": {
    "verb_open": ["open", "launch", "start", "run", "kholo", "chalao"],
    "app_name": ["{dynamic_app}"],
    "politeness": ["please", "kindly", "yaar", "sir"]
  }
}
```

**Combinatorial Explosion:**
4 patterns _ 6 verbs _ 100 apps \* 4 modifiers = **9,600 unique samples** for just 1 intent.

---

## 6. Synthetic Data Safety Report & Verification

Before ingesting a batch:

1.  **Overlap Check:** Does a generated sample for `app.open` match a regex for `file.open`? -> _Reject_.
2.  **Length Check:** Is the sample too long/short to be realistic?
3.  **Vocabulary Validation:** Are all tokens known or mapped?

## 7. Scaling Readiness Verdict

**Current Status:** ✅ READY FOR PHASE 1
**Next Step:** Implement `tools/dataset-generator.js` and refactor `intents/*.json` to use the schema above.
