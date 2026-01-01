const fs = require("fs");
const path = require("path");
const brain = require("brain.js");

// -------------------------
// 1. Safe Model Loading
// -------------------------
const metaPath = path.join(__dirname, "model-meta.json");
const weightsPath = path.join(__dirname, "model-weights.json");
const vocabPath = path.join(__dirname, "vocab.json");

let net = new brain.NeuralNetwork();
let vocab = [];
let isModelLoaded = false;

try {
  if (fs.existsSync(metaPath) && fs.existsSync(weightsPath) && fs.existsSync(vocabPath)) {
    const metaRaw = fs.readFileSync(metaPath, "utf8");
    const weightsRaw = fs.readFileSync(weightsPath, "utf8");
    const vocabRaw = fs.readFileSync(vocabPath, "utf8");

    if (metaRaw.trim() && weightsRaw.trim() && vocabRaw.trim()) {
      const meta = JSON.parse(metaRaw);
      const weights = JSON.parse(weightsRaw);
      const modelJSON = { ...meta, ...weights };
      vocab = JSON.parse(vocabRaw);
      net.fromJSON(modelJSON);
      isModelLoaded = true;
      console.log("✅ Brain.js model loaded successfully.");
    } else {
      console.log("⚠️ Model files empty. Run 'node nlp/train.js'");
    }
  } else {
    console.log("⚠️ No model found. Using Rules-Only Mode.");
  }
} catch (err) {
  console.log("❌ Error loading model:", err.message);
}

// -------------------------
// 2. Helpers
// -------------------------
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function textToFeatures(text) {
  const tokens = tokenize(text);
  return vocab.map((word) => (tokens.includes(word) ? 1 : 0));
}

// -------------------------
// 3. RULE-BASED NLP (Exact matches)
// -------------------------
function rulesLayer(text) {
  const msg = text.toLowerCase().trim();

  // --- 1. YouTube Search ---
  const ytMatch = msg.match(/search (?:youtube|you tube) for (.+)/i);
  if (ytMatch) {
    return {
      intent: "search_youtube",
      confidence: 1,
      entities: { query: ytMatch[1].trim() }
    };
  }

  // --- 2. Open website with domain ---
  const urlMatch = msg.match(
    /(?:open|visit|go to|open website)\s+(https?:\/\/)?([a-z0-9\.-]+\.[a-z]{2,})/i
  );
  if (urlMatch) {
    return {
      intent: "open_website",
      confidence: 1,
      entities: { url: "https://" + urlMatch[2] }
    };
  }

  // --- 3. Ask which website ---
  if (msg === "open website" || msg === "visit website") {
    return {
      intent: "ask_which_website",
      confidence: 1,
      entities: {}
    };
  }

  // --- 4. Domain-only detection ---
  const domainOnly = msg.match(/^([a-z0-9\.-]+\.[a-z]{2,})$/i);
  if (domainOnly) {
    return {
      intent: "open_website",
      confidence: 1,
      entities: { url: "https://" + domainOnly[1] }
    };
  }

  return null;
}


// -------------------------
// 4. ML NLP Layer (brain.js)
// -------------------------
function mlLayer(text) {
  if (!isModelLoaded || vocab.length === 0) {
    return { intent: "none", confidence: 0, entities: {} };
  }

  const output = net.run(textToFeatures(text));

  let bestIntent = "none";
  let bestScore = 0;

  Object.keys(output).forEach((intent) => {
    if (output[intent] > bestScore) {
      bestScore = output[intent];
      bestIntent = intent;
    }
  });

  return {
    intent: bestIntent,
    confidence: bestScore,
    entities: {}
  };
}

// -------------------------
// 5. Main NLP Export
// -------------------------
module.exports = {
  interpret(text) {
    // 1) Try RULES first
    const rule = rulesLayer(text);
    if (rule) return rule;

    // 2) Try ML next
    return mlLayer(text);
  }
};
