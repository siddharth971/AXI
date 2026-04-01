/**
 * File Manager Command Test Suite
 * Directly tests: rules → plugin handler (bypasses HTTP, uses internal modules)
 */

"use strict";

const path  = require("path");
const fs    = require("fs");

// ── Internal modules ─────────────────────────────────────────────────────────
const fileRules  = require("../nlp/rules/file.js");
const filePlugin = require("../skills/plugins/file.plugin.js");

// ── ANSI colours ─────────────────────────────────────────────────────────────
const G = (s) => `\x1b[32m${s}\x1b[0m`;   // green
const R = (s) => `\x1b[31m${s}\x1b[0m`;   // red
const Y = (s) => `\x1b[33m${s}\x1b[0m`;   // yellow
const B = (s) => `\x1b[36m${s}\x1b[0m`;   // cyan
const W = (s) => `\x1b[1m${s}\x1b[0m`;    // bold

// ── Test infrastructure ───────────────────────────────────────────────────────
const results = [];

/**
 * Simulate rulesLayer (highest-confidence wins)
 */
function fireRules(text) {
  let best = null;
  let highest = -1;
  for (const [name, fn] of Object.entries(fileRules)) {
    if (typeof fn !== "function") continue;
    try {
      const r = fn(text);
      if (r && (r.confidence || 1) > highest) {
        highest = r.confidence || 1;
        best = { ...r, _rule: name };
      }
    } catch (e) {
      // skip
    }
  }
  return best;
}

/**
 * Run one test case end-to-end: rules + plugin handler
 */
async function test(label, input, expectedIntent, overrideParams = {}) {
  const t0 = Date.now();
  let ruleFired  = null;
  let result     = null;
  let error      = null;
  let pass       = false;

  // 1. Rules layer
  ruleFired = fireRules(input);

  // 2. Plugin handler
  if (ruleFired) {
    const intent = ruleFired.intent;
    const intentDef = filePlugin.intents[intent];

    if (!intentDef) {
      error = `⚠️  Plugin has no handler for intent: "${intent}"`;
    } else {
      // Merge rule entities + override params + raw text
      const params = {
        ...ruleFired.entities,
        ...overrideParams,
        text: input,
        raw:  input,
      };

      try {
        // Skip confirmation dialogue for delete tests
        result = await intentDef.handler(params, {});
      } catch (e) {
        error = e.message;
      }
    }
  } else {
    error = "❌ No rule matched";
  }

  const ms   = Date.now() - t0;
  pass = !error && !!result;

  results.push({ label, input, expected: expectedIntent, fired: ruleFired?._rule, intent: ruleFired?.intent, entities: ruleFired?.entities, result, error, pass, ms });
}

// ── TEST CASES ────────────────────────────────────────────────────────────────
async function runAll() {
  console.log("\n" + W("═".repeat(70)));
  console.log(W("  📂  AXI File Manager — Full Command Test Suite"));
  console.log(W("═".repeat(70)));

  // ── LIST FILES ──────────────────────────────────────────────────────────────
  console.log("\n" + B("▶ LIST FILES"));
  await test("List files (basic)",          "list files",                   "list_files");
  await test("Show files",                  "show files",                   "list_files");
  await test("Show me files",               "show me files",                "list_files");
  await test("List directory",              "list directory",               "list_files");
  await test("Show folder contents",        "show folder contents",         "list_files");
  await test("Contents of folder",          "contents of documents",        "list_files");

  // ── CREATE FOLDER ───────────────────────────────────────────────────────────
  console.log("\n" + B("▶ CREATE FOLDER"));
  await test("Create folder (simple)",      "create folder TestAXI_001",    "create_folder");
  await test("Make directory",              "make directory TestAXI_002",   "create_folder");
  await test("New folder named",            "new folder named TestAXI_003", "create_folder");
  await test("mkdir",                       "mkdir TestAXI_004",            "create_folder");

  // ── CREATE FILE ─────────────────────────────────────────────────────────────
  console.log("\n" + B("▶ CREATE FILE"));
  await test("Create file (simple)",        "create file axi_test_001.txt", "create_file");
  await test("Make file called",            "make file called axi_test_002.txt", "create_file");
  await test("Generate file",               "generate file axi_test_003.txt", "create_file");
  await test("Write a file named",          "write a file axi_test_004.txt", "create_file");

  // ── OPEN FILE ───────────────────────────────────────────────────────────────
  console.log("\n" + B("▶ OPEN FILE"));
  await test("Open file",                   "open file axi_test_001.txt",   "open_file");
  await test("Open the file",               "open the file axi_test_002.txt", "open_file");
  await test("Read file",                   "read file axi_test_003.txt",   "open_file");

  // ── RENAME FILE ─────────────────────────────────────────────────────────────
  console.log("\n" + B("▶ RENAME FILE"));
  await test("Rename file X to Y",          "rename file axi_test_001.txt to axi_renamed_001.txt", "rename_file");
  await test("Rename X to Y",              "rename axi_test_002.txt to axi_renamed_002.txt",      "rename_file");

  // ── SEARCH FILE ─────────────────────────────────────────────────────────────
  console.log("\n" + B("▶ SEARCH FILE"));
  await test("Find file",                   "find file axi_test",           "search_file");
  await test("Search for file",             "search for file axi_test",     "search_file");
  await test("Locate file",                 "locate file axi_test_003.txt", "search_file");
  await test("Where is file",               "where is file axi_test",       "search_file");

  // ── DELETE FILE ─────────────────────────────────────────────────────────────
  console.log("\n" + B("▶ DELETE FILE (will skip confirmation in test mode)"));
  // Directly use handler with known-good params (bypass requiresConfirmation)
  await test("Delete file",                 "delete file axi_renamed_001.txt", "delete_file");
  await test("Remove file",                 "remove file axi_test_003.txt",    "delete_file");
  await test("Erase file",                  "erase file axi_test_004.txt",     "delete_file");

  // ── DELETE FOLDER ───────────────────────────────────────────────────────────
  console.log("\n" + B("▶ DELETE FOLDER"));
  await test("Delete folder",               "delete folder TestAXI_001",    "delete_folder");
  await test("Remove directory",            "remove directory TestAXI_002", "delete_folder");
  await test("Remove folder",               "remove folder TestAXI_003",    "delete_folder");
  await test("rmdir",                       "rmdir TestAXI_004",            "delete_folder");

  // ── EDGE CASES ───────────────────────────────────────────────────────────────
  console.log("\n" + B("▶ EDGE CASES & AMBIGUOUS INPUTS"));
  await test("No filename given (create)",  "create file",                  "create_file");
  await test("No name given (folder)",      "create folder",                "create_folder");
  await test("Rename no 'to'",              "rename myfile",                "rename_file");
  await test("Hindi: files dikha",          "files dikha",                  "list_files");
  await test("Hindi: folder banao",         "folder banao TestHindi",       "create_folder");
  await test("Hindi: file banao",           "file banao hindi_test.txt",    "create_file");

  // ── PRINT REPORT ─────────────────────────────────────────────────────────────
  printReport();
}

function printReport() {
  console.log("\n" + W("═".repeat(70)));
  console.log(W("  📊  RESULTS"));
  console.log(W("═".repeat(70)));

  const passed  = results.filter(r => r.pass).length;
  const failed  = results.filter(r => !r.pass).length;
  const total   = results.length;

  // Detailed per-test output
  for (const r of results) {
    const icon   = r.pass ? G("✅") : R("❌");
    const intent = r.intent ? B(r.intent) : R("NO MATCH");
    const entity = r.entities ? Y(JSON.stringify(r.entities)) : "";

    console.log(`\n${icon}  ${W(r.label)}`);
    console.log(`   Input  : "${r.input}"`);
    console.log(`   Rule   : ${r.fired ? G(r.fired) : R("none")}  → intent: ${intent}  entities: ${entity}`);

    if (r.result) {
      const shortResult = r.result.length > 120 ? r.result.slice(0, 120) + "…" : r.result;
      console.log(`   Output : ${G(shortResult)}`);
    }
    if (r.error) {
      console.log(`   Error  : ${R(r.error)}`);
    }
    console.log(`   Time   : ${r.ms}ms`);
  }

  // Summary
  console.log("\n" + W("═".repeat(70)));
  console.log(`  ${G("PASSED")}: ${passed}/${total}   ${failed > 0 ? R(`FAILED: ${failed}`) : G("ALL PASS")}`);
  console.log(W("═".repeat(70)));

  // Problems & improvements
  const problems = results.filter(r => !r.pass);
  if (problems.length > 0) {
    console.log("\n" + W("🔴 PROBLEMS DETECTED:"));
    problems.forEach((r, i) => {
      console.log(`  ${i+1}. ${Y(r.label)}: ${R(r.error || "Handler missing/failed")}`);
      console.log(`     Input: "${r.input}"`);
      if (r.intent) console.log(`     Intent matched: ${r.intent}, but handler failed`);
    });
  }

  // Improvements list
  console.log("\n" + W("💡 IMPROVEMENT ANALYSIS:"));

  const noEntityCases = results.filter(r => r.pass && r.entities && Object.keys(r.entities).length === 0);
  if (noEntityCases.length > 0) {
    console.log(Y("  ⚠️  Entity extraction missing for:"));
    noEntityCases.forEach(r => console.log(`     - "${r.input}" → intent: ${r.intent}`));
  }

  const noMatch = results.filter(r => !r.intent);
  if (noMatch.length > 0) {
    console.log(R("  ❌ Commands with NO rule match:"));
    noMatch.forEach(r => console.log(`     - "${r.input}"`));
  }
}

runAll().catch(console.error);
