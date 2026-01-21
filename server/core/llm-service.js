/**
 * LLM Service
 * ------------
 * Provides integration with local LLM (Ollama) or cloud LLMs.
 * Used as intelligent fallback for unknown intents.
 */

const http = require("http");
const https = require("https");

// Configuration
const CONFIG = {
  // Ollama (default - local)
  OLLAMA_HOST: process.env.OLLAMA_HOST || "http://localhost:11434",
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || "llama3.2",

  // OpenAI (optional)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || null,
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",

  // Behavior
  TIMEOUT_MS: 30000,
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7,
};

// System prompt for AXI personality
const SYSTEM_PROMPT = `You are AXI, an intelligent voice assistant. You are helpful, concise, and friendly.

Guidelines:
- Keep responses SHORT (1-3 sentences for simple queries)
- Be conversational but efficient
- If you don't know something, say so honestly
- You can help with general knowledge, explanations, and advice
- Format responses for voice output (no markdown, simple text)`;

/**
 * Query Ollama LLM
 */
async function queryOllama(userMessage, conversationHistory = []) {
  const url = new URL("/api/chat", CONFIG.OLLAMA_HOST);

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const body = JSON.stringify({
    model: CONFIG.OLLAMA_MODEL,
    messages: messages,
    stream: false,
    options: {
      temperature: CONFIG.TEMPERATURE,
      num_predict: CONFIG.MAX_TOKENS,
    },
  });

  return new Promise((resolve, reject) => {
    const protocol = url.protocol === "https:" ? https : http;

    const req = protocol.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
        timeout: CONFIG.TIMEOUT_MS,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (json.message && json.message.content) {
              resolve({
                success: true,
                response: json.message.content.trim(),
                model: CONFIG.OLLAMA_MODEL,
                provider: "ollama",
              });
            } else {
              reject(new Error("Invalid Ollama response"));
            }
          } catch (e) {
            reject(new Error(`Failed to parse Ollama response: ${e.message}`));
          }
        });
      },
    );

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Ollama request timeout"));
    });

    req.write(body);
    req.end();
  });
}

/**
 * Query OpenAI (fallback if Ollama unavailable)
 */
async function queryOpenAI(userMessage, conversationHistory = []) {
  if (!CONFIG.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const body = JSON.stringify({
    model: CONFIG.OPENAI_MODEL,
    messages: messages,
    max_tokens: CONFIG.MAX_TOKENS,
    temperature: CONFIG.TEMPERATURE,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CONFIG.OPENAI_API_KEY}`,
        },
        timeout: CONFIG.TIMEOUT_MS,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (json.choices && json.choices[0]) {
              resolve({
                success: true,
                response: json.choices[0].message.content.trim(),
                model: CONFIG.OPENAI_MODEL,
                provider: "openai",
              });
            } else {
              reject(new Error("Invalid OpenAI response"));
            }
          } catch (e) {
            reject(new Error(`Failed to parse OpenAI response: ${e.message}`));
          }
        });
      },
    );

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("OpenAI request timeout"));
    });

    req.write(body);
    req.end();
  });
}

/**
 * Check if Ollama is available
 */
async function isOllamaAvailable() {
  return new Promise((resolve) => {
    const url = new URL("/api/tags", CONFIG.OLLAMA_HOST);
    const protocol = url.protocol === "https:" ? https : http;

    const req = protocol.request(
      url,
      { method: "GET", timeout: 3000 },
      (res) => {
        resolve(res.statusCode === 200);
      },
    );

    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

/**
 * Main query function - tries Ollama first, then OpenAI
 */
async function query(userMessage, conversationHistory = []) {
  // Try Ollama first (local, free)
  try {
    const ollamaAvailable = await isOllamaAvailable();
    if (ollamaAvailable) {
      return await queryOllama(userMessage, conversationHistory);
    }
  } catch (e) {
    console.warn("[LLM] Ollama failed:", e.message);
  }

  // Fallback to OpenAI if available
  if (CONFIG.OPENAI_API_KEY) {
    try {
      return await queryOpenAI(userMessage, conversationHistory);
    } catch (e) {
      console.warn("[LLM] OpenAI failed:", e.message);
    }
  }

  // No LLM available
  return {
    success: false,
    response: "I'm not sure how to help with that. Could you rephrase?",
    provider: "fallback",
  };
}

module.exports = {
  query,
  queryOllama,
  queryOpenAI,
  isOllamaAvailable,
  CONFIG,
};
