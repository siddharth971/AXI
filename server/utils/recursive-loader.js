/**
 * AXI Recursive Loader
 * ----------------------
 * Generic utility for recursively loading files from nested folder structures.
 * Supports any depth of nesting.
 * 
 * Usage:
 *   const { loadJsonRecursive, loadModulesRecursive } = require('./recursive-loader');
 *   
 *   // Load all JSON files from a folder (any depth)
 *   const intents = loadJsonRecursive('./nlp/intents');
 *   
 *   // Load all JS modules from a folder (any depth)
 *   const skills = loadModulesRecursive('./skills/handlers');
 */

const fs = require("fs");
const path = require("path");

/**
 * Recursively find all files with given extensions in a directory
 * @param {string} dir - Directory to search
 * @param {string[]} extensions - File extensions to include (e.g., ['.json', '.js'])
 * @param {string} [relativeTo] - Base path for relative paths (internal use)
 * @returns {Array<{absolute: string, relative: string}>} File paths
 */
function findFilesRecursive(dir, extensions, relativeTo = null) {
  const basePath = relativeTo || dir;
  const results = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      // Recurse into subdirectory
      results.push(...findFilesRecursive(fullPath, extensions, basePath));
    } else if (item.isFile()) {
      const ext = path.extname(item.name).toLowerCase();
      if (extensions.includes(ext)) {
        results.push({
          absolute: fullPath,
          relative: path.relative(basePath, fullPath),
          name: item.name,
          nameWithoutExt: path.basename(item.name, ext)
        });
      }
    }
  }

  return results;
}

/**
 * Load all JSON files from a directory recursively
 * @param {string} dir - Directory to load from
 * @param {Object} options - Options
 * @param {boolean} options.merge - If true, merge arrays; if false, return array of {file, data}
 * @param {boolean} options.log - Log loaded files
 * @returns {Array} Merged array of all JSON contents, or array of {file, data} objects
 */
function loadJsonRecursive(dir, options = {}) {
  const { merge = true, log = true } = options;
  const files = findFilesRecursive(dir, [".json"]);
  const results = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file.absolute, "utf8");
      const data = JSON.parse(content);

      if (log) {
        const itemCount = Array.isArray(data) ? data.length : 1;
        console.log(`📁 Loaded: ${file.relative} (${itemCount} items)`);
      }

      if (merge && Array.isArray(data)) {
        results.push(...data);
      } else {
        results.push({ file: file.relative, data });
      }
    } catch (err) {
      console.error(`❌ Failed to load ${file.relative}:`, err.message);
    }
  }

  return results;
}

/**
 * Load all JS modules from a directory recursively
 * @param {string} dir - Directory to load from
 * @param {Object} options - Options
 * @param {boolean} options.flatten - If true, merge all exports into one object
 * @param {boolean} options.log - Log loaded files
 * @returns {Object} Object with module exports
 */
function loadModulesRecursive(dir, options = {}) {
  const { flatten = true, log = true } = options;
  const files = findFilesRecursive(dir, [".js"]);
  const results = {};

  for (const file of files) {
    // Skip index.js files to avoid circular requires
    if (file.name === "index.js") continue;

    try {
      const module = require(file.absolute);

      if (log) {
        const exportCount = Object.keys(module).length;
        console.log(`📦 Loaded: ${file.relative} (${exportCount} exports)`);
      }

      if (flatten) {
        // Merge all exports into results
        Object.assign(results, module);
      } else {
        // Use relative path as key (without extension)
        const key = file.relative.replace(/\.js$/, "").replace(/\\/g, "/");
        results[key] = module;
      }
    } catch (err) {
      console.error(`❌ Failed to load ${file.relative}:`, err.message);
    }
  }

  return results;
}

/**
 * Merge items with same identifier (e.g., merge intents with same "intent" field)
 * @param {Array} items - Array of objects
 * @param {string} idField - Field to use as identifier
 * @param {string} mergeField - Field to merge (arrays are concatenated)
 * @returns {Array} Merged array
 */
function mergeByField(items, idField = "intent", mergeField = "utterances") {
  const map = new Map();

  for (const item of items) {
    const id = item[idField];

    if (map.has(id)) {
      const existing = map.get(id);
      // Merge arrays, remove duplicates
      if (Array.isArray(existing[mergeField]) && Array.isArray(item[mergeField])) {
        existing[mergeField] = [...new Set([...existing[mergeField], ...item[mergeField]])];
      }
    } else {
      map.set(id, { ...item });
    }
  }

  return Array.from(map.values());
}

module.exports = {
  findFilesRecursive,
  loadJsonRecursive,
  loadModulesRecursive,
  mergeByField
};
