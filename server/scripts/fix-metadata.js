const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../nlp/dataset-expansion');

function fixFiles() {
  console.log("🛠️ Starting Recursive Metadata Fixer...");

  const allFiles = getAllFiles(ROOT);

  allFiles.forEach(file => {
    if (file.endsWith('.json') && (file.includes('batch') || file.includes('intents'))) {

      try {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));
        let changed = false;

        // 1. Fix Missing Domain in Metadata
        if (content.batch_metadata && !content.batch_metadata.domain) {
          const parentDir = path.basename(path.dirname(file));
          let guessed = parentDir;
          if (guessed === 'cognitive-states') guessed = 'cognitive';
          if (guessed === 'discourse-patterns') guessed = 'discourse';

          content.batch_metadata.domain = guessed;
          console.log(`Auto-assigned domain '${guessed}' to ${path.basename(file)}`);
          changed = true;
        }

        // 2. Fix Missing Context in Samples
        if (content.samples && Array.isArray(content.samples)) {
          content.samples.forEach(sample => {
            if (!sample.context) {
              sample.context = {
                situation: "general",
                urgency: "low",
                auto_added: true
              };
              changed = true;
            }
          });
        }

        if (changed) {
          console.log(`💾 Saving fixes to ${path.basename(file)}`);
          fs.writeFileSync(file, JSON.stringify(content, null, 2));
        }

      } catch (e) {
        console.error(`Skipping ${path.basename(file)}: ${e.message}`);
      }
    }
  });

  console.log("✅ Recursive Fixes Complete.");
}

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
}

fixFiles();
