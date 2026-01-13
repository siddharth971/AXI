/**
 * AXI Synthetic Dataset Generator
 * -------------------------------
 * Generates massive amounts of training samples from structured templates.
 * Supports:
 * - Slot filling (Entities)
 * - Synonyms (Verbs/Nouns)
 * - Hinglish injection
 * - Noise injection (Politeness, fillers)
 * 
 * Usage: node dataset-generator.js
 */

const fs = require('fs');
const path = require('path');

// --- Configuration ---
const CONFIG = {
  OUTPUT_FILE: path.join(__dirname, '../intents/generated_samples.json'),
  SAMPLES_PER_INTENT: 150, // Increased to 150 for massive scale
  USE_HINGLISH: true
};

// --- Vocabulary Layers ---
const VOCAB = {
  verbs: {
    open: ["open", "launch", "start", "run", "display", "show", "kholo", "chalao", "on karo"],
    close: ["close", "exit", "quit", "terminate", "kill", "band karo", "hatao"],
    play: ["play", "start", "resume", "chalao", "bajao", "sunao"],
    stop: ["stop", "pause", "halt", "roko", "band karo"]
  },
  politeness: {
    prefixes: ["please", "kindly", "can you", "could you", "would you", "bhai", "jarvis"],
    suffixes: ["please", "sir", "bhai", "ji", "now", "quickly", "asap"]
  },
  entities: {
    app: ["chrome", "vscode", "spotify", "discord", "notepad", "calculator", "terminal"],
    website: ["google", "youtube", "github", "stackoverflow", "gmail", "facebook"],
    song: ["music", "song", "gaana", "playlist", "track"]
  }
};

// --- Templates ---
const TEMPLATES = [
  // --- 1. System Core ---
  {
    intent: "system.shutdown",
    patterns: [
      "{verb_stop} {device}",
      "{verb_stop} {device} {polite_suf}",
      "{polite_pre} {verb_stop} {device}",
      "{device} {verb_stop}",
      "shutdown",
      "power off"
    ],
    slots: {
      verb_stop: ["shutdown", "turn off", "power off", "kill", "band karo", "band kar do", "off karo", "off kar"],
      device: ["system", "computer", "pc", "laptop", "machine", "desktop"],
      polite_pre: VOCAB.politeness.prefixes,
      polite_suf: VOCAB.politeness.suffixes
    }
  },
  {
    intent: "system.restart",
    patterns: [
      "{verb_restart} {device}",
      "{verb_restart} {device} {polite_suf}",
      "{polite_pre} {verb_restart} {device}",
      "{device} {verb_restart}",
      "reboot",
      "restart"
    ],
    slots: {
      verb_restart: ["restart", "reboot", "reset", "phir se chalao", "dobara start karo", "restart karo"],
      device: ["system", "computer", "pc", "laptop", "machine"],
      polite_pre: VOCAB.politeness.prefixes,
      polite_suf: VOCAB.politeness.suffixes
    }
  },
  {
    intent: "system.lock",
    patterns: [
      "{verb_lock} {device}",
      "{verb_lock} {screen}",
      "{polite_pre} {verb_lock} {screen}",
      "lock {device}"
    ],
    slots: {
      verb_lock: ["lock", "secure", "lock karo", "lock kar do"],
      device: ["system", "computer", "pc", "laptop"],
      screen: ["screen", "display", "monitor", "window"],
      polite_pre: VOCAB.politeness.prefixes
    }
  },
  {
    intent: "system.volume_up",
    patterns: [
      "{verb_increase} {noun_volume}",
      "{noun_volume} {verb_increase}",
      "{verb_scale_up}",
      "make it {adj_loud}",
      "{polite_pre} {verb_increase} {noun_volume}",
      "{verb_increase} {noun_volume} {polite_suf}"
    ],
    slots: {
      verb_increase: ["increase", "raise", "turn up", "boost", "badhao", "tez karo", "up karo", "zyada karo"],
      noun_volume: ["volume", "sound", "audio", "awaaz"],
      verb_scale_up: ["louder", "volume up", "speak up"],
      adj_loud: ["louder", "audible"],
      polite_pre: VOCAB.politeness.prefixes,
      polite_suf: VOCAB.politeness.suffixes
    }
  },
  {
    intent: "system.volume_down",
    patterns: [
      "{verb_decrease} {noun_volume}",
      "{noun_volume} {verb_decrease}",
      "{verb_scale_down}",
      "make it {adj_quiet}",
      "{polite_pre} {verb_decrease} {noun_volume}"
    ],
    slots: {
      verb_decrease: ["decrease", "lower", "turn down", "reduce", "kam karo", "ghatao", "slow karo", "dheere karo"],
      noun_volume: ["volume", "sound", "audio", "awaaz"],
      verb_scale_down: ["quieter", "volume down", "shush"],
      adj_quiet: ["quieter", "softer", "silent"],
      polite_pre: VOCAB.politeness.prefixes
    }
  },

  // --- 2. Application Control ---
  {
    intent: "app.open",
    patterns: [
      "{verb_open} {app}",
      "{polite_pre} {verb_open} {app}",
      "{verb_open} {app} {polite_suf}",
      "{app} {verb_open}"
    ],
    slots: {
      verb_open: VOCAB.verbs.open,
      app: VOCAB.entities.app,
      polite_pre: VOCAB.politeness.prefixes,
      polite_suf: VOCAB.politeness.suffixes
    }
  },
  {
    intent: "app.close",
    patterns: [
      "{verb_close} {app}",
      "{polite_pre} {verb_close} {app}",
      "{app} {verb_close}",
      "kill {app}"
    ],
    slots: {
      verb_close: VOCAB.verbs.close,
      app: VOCAB.entities.app,
      polite_pre: VOCAB.politeness.prefixes
    }
  },

  // --- 3. Browser / Web ---
  {
    intent: "open_website", // Mapping to existing intent name
    patterns: [
      "{verb_open} {website}",
      "go to {website}",
      "{website} {verb_open}",
      "visit {website}",
      "browse {website}"
    ],
    slots: {
      verb_open: VOCAB.verbs.open,
      website: VOCAB.entities.website
    }
  },
  {
    intent: "open_youtube",
    patterns: [
      "{verb_open} youtube",
      "go to youtube",
      "watch youtube",
      "youtube {verb_open}"
    ],
    slots: {
      verb_open: VOCAB.verbs.open
    }
  },

  // --- 4. Connectivity ---
  {
    intent: "system.wifi_on",
    patterns: [
      "{verb_enable} wifi",
      "turn on wifi",
      "wifi {verb_enable}",
      "connect to wifi",
      "wifi on"
    ],
    slots: {
      verb_enable: ["enable", "start", "activate", "switch on", "on karo", "chalu karo", "connect"]
    }
  },
  {
    intent: "system.wifi_off",
    patterns: [
      "{verb_disable} wifi",
      "turn off wifi",
      "wifi {verb_disable}",
      "disconnect wifi",
      "wifi off"
    ],
    slots: {
      verb_disable: ["disable", "stop", "deactivate", "switch off", "off karo", "band karo", "disconnect"]
    }
  },

  // --- 5. Media ---
  {
    intent: "play",
    patterns: [
      "{verb_play} {song}",
      "{verb_play} {song} {polite_suf}",
      "{polite_pre} {verb_play} {song}",
      "play some music",
      "music {verb_play}"
    ],
    slots: {
      verb_play: VOCAB.verbs.play,
      song: VOCAB.entities.song,
      polite_pre: VOCAB.politeness.prefixes,
      polite_suf: VOCAB.politeness.suffixes
    }
  },
  {
    intent: "stop",
    patterns: [
      "{verb_stop} {song}",
      "{verb_stop} music",
      "stop playing",
      "music {verb_stop}"
    ],
    slots: {
      verb_stop: VOCAB.verbs.stop,
      song: VOCAB.entities.song
    }
  },

  // --- 6. File System Control ---
  {
    intent: "create_file",
    patterns: [
      "{verb_create} {file_type} {file_name}",
      "{verb_create} {file_type}",
      "{file_type} {verb_create}",
      "make a new file",
      "touch {file_name}"
    ],
    slots: {
      verb_create: ["create", "make", "generate", "banao", "create karo", "new"],
      file_type: ["file", "document", "text file", "script"],
      file_name: ["test.txt", "script.js", "notes.md", "app.py", "index.html"]
    }
  },
  {
    intent: "create_folder",
    patterns: [
      "{verb_create} {folder_type} {folder_name}",
      "{verb_create} {folder_type}",
      "{folder_type} {verb_create}",
      "mkdir {folder_name}"
    ],
    slots: {
      verb_create: ["create", "make", "banao", "create karo", "new"],
      folder_type: ["folder", "directory", "dir"],
      folder_name: ["src", "components", "assets", "logs", "backup"]
    }
  },
  {
    intent: "delete_file",
    patterns: [
      "{verb_delete} {file_type} {file_name}",
      "{verb_delete} {file_type}",
      "{file_type} {verb_delete}",
      "remove {file_name}",
      "rm {file_name}"
    ],
    slots: {
      verb_delete: ["delete", "remove", "erase", "hatao", "delete karo", "trash"],
      file_type: ["file", "document"],
      file_name: ["test.txt", "junk.tmp", "old.log", "error.txt"]
    }
  },
  {
    intent: "list_files",
    patterns: [
      "{verb_list} files",
      "show files",
      "what is in here",
      "ls",
      "dir",
      "files dikhao"
    ],
    slots: {
      verb_list: ["list", "show", "display", "list karo", "dikhao"]
    }
  },

  // --- 7. Developer Tools ---
  {
    intent: "git_status",
    patterns: [
      "git status",
      "check git status",
      "repo status",
      "git check karo",
      "status dikhao"
    ],
    slots: {}
  },
  {
    intent: "git_commit",
    patterns: [
      "git commit",
      "commit changes",
      "save changes to git",
      "commit karo",
      "code commit kar do"
    ],
    slots: {}
  },
  {
    intent: "git_push",
    patterns: [
      "git push",
      "push changes",
      "push to remote",
      "code upload karo",
      "git push karo"
    ],
    slots: {}
  },
  {
    intent: "git_pull",
    patterns: [
      "git pull",
      "pull changes",
      "get latest code",
      "git update karo",
      "pull karo"
    ],
    slots: {}
  },
  {
    intent: "npm_install",
    patterns: [
      "npm install",
      "install packages",
      "npm i",
      "dependencies install karo",
      "node modules install karo"
    ],
    slots: {}
  },
  {
    intent: "start_server",
    patterns: [
      "start server",
      "run server",
      "npm start",
      "server chalu karo",
      "run dev server"
    ],
    slots: {}
  },
  {
    intent: "open_vscode",
    patterns: [
      "open vscode",
      "start vscode",
      "code .",
      "vscode kholo",
      "launch vs code"
    ],
    slots: {}
  },
  {
    intent: "open_terminal",
    patterns: [
      "open terminal",
      "start terminal",
      "launch terminal",
      "terminal kholo",
      "cmd open karo"
    ],
    slots: {}
  },
  // --- 8. Knowledge & Information ---
  {
    intent: "tell_time",
    patterns: [
      "what time is it",
      "time batao",
      "current time",
      "ghadi mein kya time hua hai",
      "time please"
    ],
    slots: {}
  },
  {
    intent: "tell_date",
    patterns: [
      "what is the date",
      "aaj ki date batao",
      "todays date",
      "date kya hai",
      "date please"
    ],
    slots: {}
  },
  {
    intent: "weather_check",
    patterns: [
      "whats the weather",
      "mausam kaisa hai",
      "weather update",
      "temperature batao",
      "is it raining"
    ],
    slots: {}
  },
  {
    intent: "calculate",
    patterns: [
      "calculate {math_expression}",
      "what is {math_expression}",
      "{math_expression} ka answer batao",
      "solve {math_expression}"
    ],
    slots: {
      math_expression: ["5 plus 5", "10 divided by 2", "20 into 5", "100 minus 50"]
    }
  },
  {
    intent: "translate",
    patterns: [
      "translate this",
      "iska matlab batao",
      "translate to hindi",
      "how to say this in english"
    ],
    slots: {}
  },

  // --- 9. Productivity ---
  {
    intent: "set_reminder",
    patterns: [
      "set a reminder",
      "remind me to {task}",
      "reminder set karo",
      "mujhe yaad dilana {task}"
    ],
    slots: {
      task: ["buy milk", "go to gym", "call mom", "submit report"]
    }
  },
  {
    intent: "set_alarm",
    patterns: [
      "set an alarm",
      "wake me up",
      "alarm laga do",
      "alarm set karo"
    ],
    slots: {}
  },

  // --- 10. Chat & Personality ---
  {
    intent: "greeting",
    patterns: [
      "hello",
      "hi",
      "hey jarvis",
      "namaste",
      "kaise ho",
      "good morning"
    ],
    slots: {}
  },
  {
    intent: "goodbye",
    patterns: [
      "bye",
      "goodbye",
      "see you",
      "chalta hoon",
      "phir milenge"
    ],
    slots: {}
  },
  {
    intent: "thanks",
    patterns: [
      "thank you",
      "thanks",
      "shukriya",
      "dhanyavaad",
      "thanks a lot"
    ],
    slots: {}
  },
  {
    intent: "tell_joke",
    patterns: [
      "tell me a joke",
      "joke sunao",
      "make me laugh",
      "koi joke batao"
    ],
    slots: {}
  },
  {
    intent: "ai_chat",
    patterns: [
      "who are you",
      "tum kaun ho",
      "what is your name",
      "tumhara naam kya hai",
      "intro do apna"
    ],
    slots: {}
  }
];

// --- Generator Logic ---

function getRandom(arr) {
  if (!arr || arr.length === 0) return "";
  return arr[Math.floor(Math.random() * arr.length)];
}

function fillTemplate(pattern, slots) {
  let result = pattern;
  // Regex to find {slot_name}
  const regex = /{(\w+)}/g;
  let match;

  // We need to loop or replace all occurrences
  // Simple replace(regex) with callback works best for multiple different slots
  result = result.replace(regex, (match, slotName) => {
    if (slots[slotName]) {
      return getRandom(slots[slotName]);
    }
    return match; // Keep it if slot not found (debug)
  });

  return result;
}

function generate() {
  const dataset = [];

  console.log("🚀 Starting generation...");

  TEMPLATES.forEach(tmpl => {
    const samples = new Set();
    let attempts = 0;

    // Brute force generation with dedup
    // Aiming for 50-100 per intent for this batch
    const targetCount = CONFIG.SAMPLES_PER_INTENT;

    while (samples.size < targetCount && attempts < targetCount * 20) {
      const pattern = getRandom(tmpl.patterns);
      // Clean up extra spaces if a slot was empty string (not implemented here but good to know)
      const text = fillTemplate(pattern, tmpl.slots).trim().replace(/\s+/g, ' ');
      samples.add(text.toLowerCase());
      attempts++;
    }

    // Add to dataset
    dataset.push({
      intent: tmpl.intent,
      utterances: Array.from(samples)
    });

    console.log(`✅ Generated ${samples.size} samples for ${tmpl.intent}`);
  });

  // Write Output
  fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(dataset, null, 2));
  console.log(`\n💾 Saved generated dataset to ${CONFIG.OUTPUT_FILE}`);
  console.log(`📊 Total Intents: ${dataset.length}`);
  console.log(`📊 Total Samples: ${dataset.reduce((acc, i) => acc + i.utterances.length, 0)}`);
}

generate();
