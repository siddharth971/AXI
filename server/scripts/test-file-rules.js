// Plain text rule test — no ANSI colours
"use strict";

const fileRules  = require("../nlp/rules/file.js");

function fireRules(text) {
  let best = null, highest = -1;
  for (const [name, fn] of Object.entries(fileRules)) {
    if (typeof fn !== "function") continue;
    try {
      const r = fn(text);
      if (r && (r.confidence || 1) > highest) {
        highest = r.confidence || 1;
        best = { ...r, _rule: name };
      }
    } catch {}
  }
  return best;
}

const TESTS = [
  // [input,                                          expectedIntent]
  ["list files",                                     "list_files"],
  ["show files",                                     "list_files"],
  ["show me files",                                  "list_files"],
  ["show folder contents",                           "list_files"],
  ["contents of documents",                          "list_files"],
  ["list directory",                                 "list_files"],
  ["create folder TestAXI_001",                      "create_folder"],
  ["new folder named TestAXI_002",                   "create_folder"],
  ["make directory TestAXI_003",                     "create_folder"],
  ["mkdir TestAXI_004",                              "create_folder"],
  ["create file axi_test_001.txt",                   "create_file"],
  ["make file called axi_test_002.txt",              "create_file"],
  ["generate file axi_test_003.txt",                 "create_file"],
  ["write a file axi_test_004.txt",                  "create_file"],
  ["open file axi_test_001.txt",                     "open_file"],
  ["open the file axi_test_002.txt",                 "open_file"],
  ["read file axi_test_003.txt",                     "open_file"],
  ["rename file axi_test_001.txt to renamed.txt",    "rename_file"],
  ["rename axi_test_002.txt to renamed2.txt",        "rename_file"],
  ["rename myfile",                                  "rename_file"],    // edge: no TO
  ["find file axi_test",                             "search_file"],
  ["search for file invoice",                        "search_file"],
  ["locate file report.txt",                         "search_file"],
  ["where is file budget",                           "search_file"],
  ["delete file axi_renamed_001.txt",                "delete_file"],
  ["remove file axi_test_003.txt",                   "delete_file"],
  ["erase file axi_test_004.txt",                    "delete_file"],
  ["delete folder TestAXI_001",                      "delete_folder"],
  ["remove directory TestAXI_002",                   "delete_folder"],
  ["remove folder TestAXI_003",                      "delete_folder"],
  ["rmdir TestAXI_004",                              "delete_folder"],
  ["create file",                                    "create_file"],    // edge: no name
  ["create folder",                                  "create_folder"],  // edge: no name
  ["files dikha",                                    "list_files"],
  ["folder banao TestHindi",                         "create_folder"],
  ["file banao hindi_test.txt",                      "create_file"],
];

let pass = 0, fail = 0;
const problems = [];
const noEntity = [];

console.log("=".repeat(100));
console.log("  AXI FILE MANAGER RULE TEST");
console.log("=".repeat(100));
console.log(
  "STATUS | " +
  "INPUT".padEnd(48) +
  "INTENT FIRED".padEnd(22) +
  "ENTITIES"
);
console.log("-".repeat(100));

for (const [input, expected] of TESTS) {
  const r   = fireRules(input);
  const got = r ? r.intent : "NO_MATCH";
  const ok  = got === expected;

  if (ok) pass++; else { fail++; problems.push({ input, expected, got, entities: r?.entities }); }

  const ent = r?.entities ? JSON.stringify(r.entities) : "{}";
  const hasEnt = r?.entities && Object.keys(r.entities).length > 0;
  if (ok && !hasEnt) noEntity.push({ input, intent: got });

  const status = ok ? "PASS " : "FAIL ";
  const entFlag = !hasEnt ? " [!]" : "";
  console.log(status + "  | " + `"${input}"`.padEnd(48) + got.padEnd(22) + ent + entFlag);
}

console.log("=".repeat(100));
console.log(`TOTAL: ${TESTS.length}  |  PASS: ${pass}  |  FAIL: ${fail}`);

if (problems.length > 0) {
  console.log("\n[PROBLEMS]");
  problems.forEach((p, i) => {
    console.log(`  ${i+1}. Input    : "${p.input}"`);
    console.log(`     Expected: ${p.expected}`);
    console.log(`     Got     : ${p.got}`);
    console.log(`     Entities: ${JSON.stringify(p.entities)}`);
  });
}

if (noEntity.length > 0) {
  console.log("\n[MISSING ENTITY WARNINGS] (rule matched but no name/path extracted)");
  noEntity.forEach(n => console.log(`  - "${n.input}" -> ${n.intent}`));
}

console.log("\n[IMPROVEMENT SUGGESTIONS]");
if (noEntity.length > 0)
  console.log("  - Add NLP-level entity extraction for inputs with no name/path");
if (problems.some(p => p.got === "NO_MATCH"))
  console.log("  - Add missing rules for unmatched commands");
if (problems.some(p => p.got !== "NO_MATCH" && p.got !== p.expected))
  console.log("  - Fix rule conflicts causing wrong intent routing");
console.log("  - Integrate plugin handler test (create/delete real files in temp dir)");
console.log("=".repeat(100));
