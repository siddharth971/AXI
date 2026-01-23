/**
 * AXI Dataset Expansion - Intent Merger
 * 
 * Merges the expanded intents from the expansion pipeline with the
 * existing/learned intents of the system into a single training file.
 * 
 * Usage:
 *   node merge-intents.mjs [--output <file>]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  intentsDir: join(__dirname, '..', 'nlp', 'intents'),
  sources: [
    'autonomous_learned.json',  // Original system intents
    'expanded_intents.json'     // New generated intents
  ],
  outputFile: 'combined_intents.json'
};

function main() {
  console.log('AXI Dataset Expansion - Intent Merger');
  console.log('='.repeat(50));

  const mergedMap = new Map();
  let totalUtterances = 0;

  // Process each source file
  for (const sourceFile of CONFIG.sources) {
    const filePath = join(CONFIG.intentsDir, sourceFile);

    if (!existsSync(filePath)) {
      console.warn(`⚠️ Warning: Source file not found: ${sourceFile}`);
      continue;
    }

    try {
      console.log(`Processing ${sourceFile}...`);
      const content = readFileSync(filePath, 'utf-8');
      const intents = JSON.parse(content);

      if (!Array.isArray(intents)) {
        console.error(`❌ Error: ${sourceFile} is not an array of intents`);
        continue;
      }

      let fileUtterances = 0;

      for (const item of intents) {
        if (!item.intent || !Array.isArray(item.utterances)) continue;

        if (!mergedMap.has(item.intent)) {
          mergedMap.set(item.intent, {
            intent: item.intent,
            utterances: new Set(),
            metadata: { sources: [] }
          });
        }

        const merged = mergedMap.get(item.intent);

        // Add source tracking
        if (!merged.metadata.sources.includes(sourceFile)) {
          merged.metadata.sources.push(sourceFile);
        }

        // Merge utterances
        for (const utt of item.utterances) {
          merged.utterances.add(utt);
          fileUtterances++;
        }
      }

      console.log(`  ✓ Added ${intents.length} intents, ${fileUtterances} utterances`);

    } catch (e) {
      console.error(`❌ Error reading ${sourceFile}: ${e.message}`);
    }
  }

  // Convert sets back to arrays and sort
  const finalIntents = Array.from(mergedMap.values()).map(item => {
    totalUtterances += item.utterances.size;
    return {
      intent: item.intent,
      utterances: Array.from(item.utterances).sort(),
      metadata: item.metadata
    };
  }).sort((a, b) => a.intent.localeCompare(b.intent));

  // Write output
  const outputPath = join(CONFIG.intentsDir, CONFIG.outputFile);
  writeFileSync(outputPath, JSON.stringify(finalIntents, null, 2), 'utf-8');

  console.log();
  console.log('Merge Statistics');
  console.log('-'.repeat(30));
  console.log(`Total unique intents: ${finalIntents.length}`);
  console.log(`Total utterances:     ${totalUtterances}`);
  console.log(`Output file:          ${outputPath}`);
  console.log();
  console.log('✅ Merge complete!');
}

main();
