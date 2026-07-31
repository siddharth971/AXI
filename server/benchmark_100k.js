/**
 * AXI 100,000 Command Stress & Performance Benchmark Engine
 * -----------------------------------------------------------
 * Evaluates throughput, latency distribution (p50/p95/p99),
 * cache hit efficiency, and ensemble layer breakdown.
 */

"use strict";

const path = require("path");
const fs = require("fs");

// Load AXI backend modules
const nlp = require("./nlp/nlp.js");
const { initTFIDF } = require("./nlp/decision-engine.js");
const skills = require("./skills/index.js");

// Test seed commands across diverse categories
const SEED_COMMANDS = [
  // Direct deterministic rules (Early Exit)
  "open youtube",
  "open google",
  "mute volume",
  "turn volume up",
  "pause playback",
  "lock screen",
  "tell me the time",
  "list my files",
  "prepare my workstation",
  "system diagnostics",
  "how is my system doing",
  "check cpu usage",
  "check ram status",

  // Phonetic Speech-to-Text typos (Soundex / Synonym expansion)
  "open ytube",
  "open googl",
  "open spotifi",
  "open vsc",
  "git hub open",

  // Contextual & Pronoun references
  "open it",
  "play it",
  "search for it",
  "do it again",
  "tell me about it",

  // Complex multi-step workflows
  "setup workstation",
  "start work routine",
  "enter standby",

  // Semantic & General Queries
  "what is the weather like today",
  "search youtube for interstellar soundtrack",
  "create folder project_alpha",
  "show me my notes",
  "who created you",
  "what can you do",

  // Unknown / Low confidence inputs
  "quantum entanglement supercollider initialization",
  "blerg wobble flim flam 99",
  "xyz123 random unhandled string query"
];

async function runBenchmark() {
  console.log("🚀 Initializing AXI Engine for 100,000 Command Benchmark...");
  await initTFIDF();
  await skills.initialize();

  const TOTAL_COMMANDS = 100000;
  const numSeeds = SEED_COMMANDS.length;

  const metrics = {
    total: TOTAL_COMMANDS,
    cacheHits: 0,
    earlyExitHits: 0,
    semanticHits: 0,
    classifierHits: 0,
    unknownCount: 0,
    latencies: new Float64Array(TOTAL_COMMANDS),
    sampleResults: []
  };

  const overallStart = process.hrtime.bigint();

  for (let i = 0; i < TOTAL_COMMANDS; i++) {
    const seed = SEED_COMMANDS[i % numSeeds];
    const itemStart = process.hrtime.bigint();

    const result = await nlp.interpret(seed);

    const itemElapsedMs = Number(process.hrtime.bigint() - itemStart) / 1e6;
    metrics.latencies[i] = itemElapsedMs;

    if (result.cached) {
      metrics.cacheHits++;
    } else if (result.earlyExit || result.confidence >= 0.95) {
      metrics.earlyExitHits++;
    } else if (result.source === "semantic") {
      metrics.semanticHits++;
    } else if (result.source === "classifier") {
      metrics.classifierHits++;
    }

    if (result.intent === "none") {
      metrics.unknownCount++;
    }

    // Capture first 30 distinct output samples for detailed reporting
    if (i < 30) {
      metrics.sampleResults.push({
        index: i + 1,
        input: seed,
        intent: result.intent,
        confidence: Math.round((result.confidence || 0) * 1000) / 1000,
        source: result.cached ? "cache" : result.source || "rules",
        latencyMs: Math.round(itemElapsedMs * 1000) / 1000
      });
    }
  }

  const overallElapsedSec = Number(process.hrtime.bigint() - overallStart) / 1e9;
  const opsPerSec = Math.round(TOTAL_COMMANDS / overallElapsedSec);

  // Compute Latency Percentiles
  const sortedLatencies = Array.from(metrics.latencies).sort((a, b) => a - b);
  const p50 = sortedLatencies[Math.floor(TOTAL_COMMANDS * 0.50)];
  const p90 = sortedLatencies[Math.floor(TOTAL_COMMANDS * 0.90)];
  const p95 = sortedLatencies[Math.floor(TOTAL_COMMANDS * 0.95)];
  const p99 = sortedLatencies[Math.floor(TOTAL_COMMANDS * 0.99)];
  const avgLatency = (sortedLatencies.reduce((a, b) => a + b, 0) / TOTAL_COMMANDS);

  const report = {
    benchmarkDate: new Date().toISOString(),
    totalCommandsExecuted: TOTAL_COMMANDS,
    totalTimeSeconds: Math.round(overallElapsedSec * 1000) / 1000,
    throughputOpsPerSec: opsPerSec,
    latency: {
      averageMs: Math.round(avgLatency * 10000) / 10000,
      p50Ms: Math.round(p50 * 10000) / 10000,
      p90Ms: Math.round(p90 * 10000) / 10000,
      p95Ms: Math.round(p95 * 10000) / 10000,
      p99Ms: Math.round(p99 * 10000) / 10000,
    },
    layerDistribution: {
      cacheHits: metrics.cacheHits,
      cacheHitPercentage: `${((metrics.cacheHits / TOTAL_COMMANDS) * 100).toFixed(2)}%`,
      earlyExitRulesHits: metrics.earlyExitHits,
      semanticHits: metrics.semanticHits,
      classifierHits: metrics.classifierHits,
      unhandledUnknowns: metrics.unknownCount
    },
    sampleExecutions: metrics.sampleResults
  };

  const outputPath = path.join(__dirname, "benchmark_100k_result.json");
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  console.log("\n✅ BENCHMARK COMPLETE!");
  console.log(`Throughput: ${opsPerSec.toLocaleString()} commands/sec`);
  console.log(`Average Latency: ${avgLatency.toFixed(4)} ms`);
  console.log(`Cache Hit Rate: ${report.layerDistribution.cacheHitPercentage}`);
  console.log(`p95 Latency: ${p95.toFixed(4)} ms`);

  return report;
}

runBenchmark().catch(err => console.error("Benchmark failed:", err));
