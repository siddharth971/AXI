const fs = require('fs');
const path = require('path');
const glob = require('glob'); // Assuming glob is available or we use recursive read

// Utils
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith("-batch.json")) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const EXPANSION_DIR = path.join(__dirname, '../nlp/dataset-expansion');
const REPORT_PATH = path.join(EXPANSION_DIR, 'DATASET_HEALTH.md');

function analyze() {
  console.log("🏥 Starting Dataset Health Check...");

  const batchFiles = getAllFiles(EXPANSION_DIR);
  let totalSamples = 0;
  let domains = {};
  let textMap = new Map(); // text -> [ids]
  let duplicates = [];
  let formatErrors = [];
  let missingFields = [];

  batchFiles.forEach(file => {
    try {
      const content = JSON.parse(fs.readFileSync(file, 'utf8'));
      const batchId = content.batch_metadata?.batch_id || 'unknown';
      const domain = content.batch_metadata?.domain || 'unknown';

      if (!domains[domain]) domains[domain] = 0;

      if (!content.samples || !Array.isArray(content.samples)) {
        formatErrors.push({ file, error: "Missing 'samples' array" });
        return;
      }

      content.samples.forEach((sample, index) => {
        totalSamples++;
        domains[domain]++;

        // 1. Check Duplicates
        const textNorm = sample.text.toLowerCase().trim();
        if (textMap.has(textNorm)) {
          textMap.get(textNorm).push({ file: path.basename(file), id: sample.id });
        } else {
          textMap.set(textNorm, [{ file: path.basename(file), id: sample.id }]);
        }

        // 2. Check Fields
        const required = ['id', 'text', 'primary_intent', 'context'];
        const missing = required.filter(f => !sample[f]);
        if (missing.length > 0) {
          missingFields.push({ id: sample.id, missing: missing.join(', ') });
        }

        // 3. ID format
        if (!sample.id) {
          formatErrors.push({ file, error: `Sample at index ${index} missing ID` });
        }
      });

    } catch (e) {
      formatErrors.push({ file, error: `JSON Parse Error: ${e.message}` });
    }
  });

  // Collect duplicates
  textMap.forEach((occurrences, text) => {
    if (occurrences.length > 1) {
      duplicates.push({ text, occurrences });
    }
  });

  // Generate Report
  let report = `# 🏥 AXI Dataset Health Report
*Generated: ${new Date().toISOString()}*

## 📊 Overview
- **Total Batches Successfully Scanned**: ${batchFiles.length}
- **Total Samples**: ${totalSamples}
- **Domains Covered**: ${Object.keys(domains).length}

### Domain Breakdown
| Domain | Samples |
|--------|---------|
`;

  Object.keys(domains).sort().forEach(d => {
    report += `| ${d} | ${domains[d]} |\n`;
  });

  report += `
## ⚠️ Issues Found

### 1. Exact Duplicates (${duplicates.length})
> *Samples with identical text (case-insensitive).*
`;

  if (duplicates.length === 0) {
    report += "\n✅ No exact duplicates found.\n";
  } else {
    duplicates.slice(0, 50).forEach(d => {
      report += `- **"${d.text}"**\n`;
      d.occurrences.forEach(o => report += `  - ${o.id} (${o.file})\n`);
    });
    if (duplicates.length > 50) report += `\n... and ${duplicates.length - 50} more.\n`;
  }

  report += `
### 2. Format / Schema Errors (${formatErrors.length})
`;
  if (formatErrors.length === 0) report += "\n✅ No file format errors.\n";
  else {
    formatErrors.forEach(e => report += `- ${path.basename(e.file)}: ${e.error}\n`);
  }

  report += `
### 3. Missing Required Fields (${missingFields.length})
`;
  if (missingFields.length === 0) report += "\n✅ All samples have required fields.\n";
  else {
    missingFields.slice(0, 50).forEach(m => report += `- ID ${m.id}: Missing [${m.missing}]\n`);
  }

  fs.writeFileSync(REPORT_PATH, report);
  console.log(`✅ Health Report generated at: ${REPORT_PATH}`);
  console.log(`   - Duplicates: ${duplicates.length}`);
  console.log(`   - Format Errors: ${formatErrors.length}`);
}

analyze();
