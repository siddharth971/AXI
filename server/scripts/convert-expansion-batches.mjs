/**
 * AXI Dataset Expansion - Batch Converter
 * 
 * Converts richly annotated expansion samples into the training format
 * used by the existing NLP pipeline.
 * 
 * Usage:
 *   node convert-expansion-batches.js [--output <file>] [--merge]
 * 
 * Options:
 *   --output <file>  Output file path (default: intents/expanded_intents.json)
 *   --merge          Merge with existing intent files
 *   --validate       Run schema validation before conversion
 *   --stats          Show statistics after conversion
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  expansionDir: join(__dirname, '..', 'nlp', 'dataset-expansion'),
  outputDir: join(__dirname, '..', 'nlp', 'intents'),
  outputFile: 'expanded_intents.json',
  batchDirs: ['batches', 'cognitive-states', 'discourse-patterns', 'domains']
};

// Statistics tracking
const stats = {
  filesProcessed: 0,
  samplesConverted: 0,
  intentsCreated: new Set(),
  errors: [],
  warnings: []
};

/**
 * Recursively find all JSON files in a directory
 */
function findJsonFiles(dir, files = []) {
  if (!existsSync(dir)) return files;

  const items = readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = join(dir, item.name);
    if (item.isDirectory()) {
      findJsonFiles(fullPath, files);
    } else if (item.name.endsWith('.json') && !item.name.startsWith('.')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Parse an expansion batch file
 */
function parseBatchFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    if (!data.samples || !Array.isArray(data.samples)) {
      stats.warnings.push(`${filePath}: No samples array found`);
      return [];
    }

    stats.filesProcessed++;
    return data.samples;
  } catch (error) {
    stats.errors.push(`${filePath}: ${error.message}`);
    return [];
  }
}

/**
 * Convert a single annotated sample to training format
 */
function convertSample(sample) {
  const { id, text, primary_intent, secondary_intent } = sample;

  if (!text || !primary_intent) {
    stats.warnings.push(`Sample ${id || 'unknown'}: Missing text or intent`);
    return null;
  }

  stats.intentsCreated.add(primary_intent);
  if (secondary_intent) {
    stats.intentsCreated.add(secondary_intent);
  }

  return {
    intent: primary_intent,
    text: text,
    metadata: {
      source: 'expansion',
      id: id,
      secondary_intent: secondary_intent || null,
      emotional_tone: sample.emotional_context?.tone || 'neutral',
      cognitive_state: sample.cognitive_state?.type || 'focused'
    }
  };
}

/**
 * Group samples by intent for training format
 */
function groupByIntent(convertedSamples) {
  const intentMap = new Map();

  for (const sample of convertedSamples) {
    if (!sample) continue;

    const intent = sample.intent;
    if (!intentMap.has(intent)) {
      intentMap.set(intent, {
        intent: intent,
        utterances: [],
        metadata: {
          source: 'expansion',
          sample_count: 0
        }
      });
    }

    const intentData = intentMap.get(intent);
    intentData.utterances.push(sample.text);
    intentData.metadata.sample_count++;
  }

  return Array.from(intentMap.values());
}

/**
 * Main conversion process
 */
function main() {
  console.log('AXI Dataset Expansion - Batch Converter');
  console.log('='.repeat(50));
  console.log();

  // Parse command line arguments
  const args = process.argv.slice(2);
  const showStats = args.includes('--stats');
  const mergeWithExisting = args.includes('--merge');

  let outputFile = CONFIG.outputFile;
  const outputIdx = args.indexOf('--output');
  if (outputIdx !== -1 && args[outputIdx + 1]) {
    outputFile = args[outputIdx + 1];
  }

  // Find all batch files
  const allJsonFiles = [];
  for (const batchDir of CONFIG.batchDirs) {
    const dirPath = join(CONFIG.expansionDir, batchDir);
    findJsonFiles(dirPath, allJsonFiles);
  }

  console.log(`Found ${allJsonFiles.length} batch files to process`);
  console.log();

  // Parse and convert all samples
  const allConvertedSamples = [];

  for (const filePath of allJsonFiles) {
    const relativePath = filePath.replace(CONFIG.expansionDir + '\\', '');
    console.log(`Processing: ${relativePath}`);

    const samples = parseBatchFile(filePath);
    for (const sample of samples) {
      const converted = convertSample(sample);
      if (converted) {
        allConvertedSamples.push(converted);
        stats.samplesConverted++;
      }
    }
  }

  console.log();

  // Group by intent
  const groupedIntents = groupByIntent(allConvertedSamples);

  // Write output
  const outputPath = join(CONFIG.outputDir, outputFile);

  // Ensure output directory exists
  if (!existsSync(CONFIG.outputDir)) {
    mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // If merging, read existing file
  let existingIntents = [];
  if (mergeWithExisting && existsSync(outputPath)) {
    try {
      existingIntents = JSON.parse(readFileSync(outputPath, 'utf-8'));
      console.log(`Merging with ${existingIntents.length} existing intents`);
    } catch (e) {
      console.warn(`Could not read existing file: ${e.message}`);
    }
  }

  // Merge intents
  const mergedIntentMap = new Map();

  // Add existing intents first
  for (const intent of existingIntents) {
    mergedIntentMap.set(intent.intent, intent);
  }

  // Merge new intents
  for (const intent of groupedIntents) {
    if (mergedIntentMap.has(intent.intent)) {
      // Append utterances to existing intent
      const existing = mergedIntentMap.get(intent.intent);
      const existingSet = new Set(existing.utterances);
      for (const utt of intent.utterances) {
        if (!existingSet.has(utt)) {
          existing.utterances.push(utt);
        }
      }
    } else {
      mergedIntentMap.set(intent.intent, intent);
    }
  }

  const finalIntents = Array.from(mergedIntentMap.values());

  // Write output file
  writeFileSync(
    outputPath,
    JSON.stringify(finalIntents, null, 2),
    'utf-8'
  );

  console.log(`Output written to: ${outputPath}`);
  console.log();

  // Show statistics
  if (showStats || true) {
    console.log('Conversion Statistics');
    console.log('-'.repeat(30));
    console.log(`Files processed:      ${stats.filesProcessed}`);
    console.log(`Samples converted:    ${stats.samplesConverted}`);
    console.log(`Unique intents:       ${stats.intentsCreated.size}`);
    console.log(`Final intent count:   ${finalIntents.length}`);
    console.log(`Total utterances:     ${finalIntents.reduce((sum, i) => sum + i.utterances.length, 0)}`);

    if (stats.errors.length > 0) {
      console.log();
      console.log('Errors:');
      stats.errors.forEach(e => console.log(`  ❌ ${e}`));
    }

    if (stats.warnings.length > 0) {
      console.log();
      console.log('Warnings:');
      stats.warnings.slice(0, 10).forEach(w => console.log(`  ⚠️ ${w}`));
      if (stats.warnings.length > 10) {
        console.log(`  ... and ${stats.warnings.length - 10} more`);
      }
    }
  }

  console.log();
  console.log('✅ Conversion complete!');

  // Output sample intent distribution
  console.log();
  console.log('Top 10 Intents by Utterance Count:');
  console.log('-'.repeat(50));

  const sortedIntents = finalIntents
    .sort((a, b) => b.utterances.length - a.utterances.length)
    .slice(0, 10);

  for (const intent of sortedIntents) {
    const bar = '█'.repeat(Math.min(intent.utterances.length, 30));
    console.log(`${intent.intent.padEnd(35)} ${intent.utterances.length.toString().padStart(4)} ${bar}`);
  }
}

// Run main function
main();
