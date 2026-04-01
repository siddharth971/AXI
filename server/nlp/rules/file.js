/**
 * File Rules
 * -----------
 * Pattern matching for file operations — covers ALL 8 file plugin intents.
 * HIGH PRIORITY to run before website/open rules.
 *
 * FIX: Entity extraction uses ORIGINAL case text (not lowercased msg)
 * so folder/file names preserve their original capitalisation.
 */

"use strict";

/**
 * Extract entity value from ORIGINAL text (preserves case)
 * @param {string} original - Original-case input text
 * @param {RegExp} pattern  - Regex with one capture group
 */
function extractAfter(original, pattern) {
  const m = original.match(pattern);
  return m ? m[1].trim() : null;
}

module.exports = {

  // ── List files ────────────────────────────────────────────────────────────
  listFiles(text) {
    const msg = text.toLowerCase();
    if (/\b(list files?|show files?|files dikha|files dikhao|list directory|dir\b|ls\b|folder ke files|directory ke files|show folder contents|what files|show me files|contents of|show desktop files|show me my downloads)\b/i.test(msg)) {
      // Extract path from original text to preserve casing
      const location = extractAfter(text, /(?:contents of|files in|list files? in|show files? in|show me files in|show me my|dir)\s+(.+)/i)
        // Shorthand expansions
        || (msg.includes("desktop") ? "Desktop" : null)
        || (msg.includes("download") ? "Downloads" : null);
      return { intent: "list_files", confidence: 1, entities: location ? { path: location } : {} };
    }
    return null;
  },

  // ── Create folder ─────────────────────────────────────────────────────────
  createFolder(text) {
    const msg = text.toLowerCase();
    if (/\b(create folder|make folder|new folder|folder banao|create directory|make directory|mkdir)\b/i.test(msg)) {
      // Use original text for case-preserving entity extraction
      const name = extractAfter(text, /(?:create folder|make folder|new folder|folder banao|create directory|make directory|mkdir)\s+(?:named?\s+|called\s+)?(.+)/i);
      return { intent: "create_folder", confidence: 1, entities: name ? { name } : {} };
    }
    return null;
  },

  // ── Create file ───────────────────────────────────────────────────────────
  createFile(text) {
    const msg = text.toLowerCase();
    if (/\b(create file|make file|new file|file banao|touch\s+\S+|write a file|generate file)\b/i.test(msg)) {
      // Use original text for case-preserving entity extraction
      const name = extractAfter(text, /(?:create file|make file|new file|file banao|generate file|write a file|touch)\s+(?:named?\s+|called\s+)?(.+)/i);
      return { intent: "create_file", confidence: 1, entities: name ? { name } : {} };
    }
    return null;
  },

  // ── Open file ─────────────────────────────────────────────────────────────
  openFile(text) {
    const msg = text.toLowerCase();
    // Must contain "file" to avoid hijacking general "open X" (handled by system plugin)
    if (/\b(open file|open the file|read file|access file|show file|launch file)\b/i.test(msg)) {
      const name = extractAfter(text, /(?:open|read|access|show|launch)\s+(?:the\s+)?(?:file\s+)?(.+)/i);
      return { intent: "open_file", confidence: 1, entities: name ? { name } : {} };
    }
    return null;
  },

  // ── Delete file ───────────────────────────────────────────────────────────
  deleteFile(text) {
    const msg = text.toLowerCase();
    if (/\b(delete file|remove file|file delete|file hatao|erase file|trash file)\b/i.test(msg)) {
      const name = extractAfter(text, /(?:delete|remove|erase|trash)\s+(?:the\s+)?(?:file\s+)?(.+)/i);
      return { intent: "delete_file", confidence: 1, entities: name ? { name } : {} };
    }
    return null;
  },

  // ── Delete folder ─────────────────────────────────────────────────────────
  deleteFolder(text) {
    const msg = text.toLowerCase();
    if (/\b(delete folder|remove folder|erase folder|trash folder|delete directory|remove directory|rmdir)\b/i.test(msg)) {
      const name = extractAfter(text, /(?:delete|remove|erase|trash|rmdir)\s+(?:the\s+)?(?:folder|directory)?\s*(.+)/i);
      return { intent: "delete_folder", confidence: 1, entities: name ? { name } : {} };
    }
    return null;
  },

  // ── Rename file ───────────────────────────────────────────────────────────
  renameFile(text) {
    const msg = text.toLowerCase();
    // FIX: fire even without 'to' — handler will ask for the new name interactively
    if (/\b(rename file|rename the file|file rename|rename)\b/i.test(msg)) {
      // Try to extract both names: "rename X to Y"
      const m = text.match(/(?:rename\s+(?:file|the file)?\s*)(.+?)\s+to\s+(.+)/i);
      if (m) {
        return { intent: "rename_file", confidence: 1, entities: { oldname: m[1].trim(), newname: m[2].trim() } };
      }
      // Only old name provided — handler will ask for new name
      const partial = text.match(/(?:rename\s+(?:file\s+|the file\s+)?)(.+)/i);
      const oldname = partial ? partial[1].trim() : null;
      return { intent: "rename_file", confidence: 1, entities: { oldname, newname: null } };
    }
    return null;
  },

  // ── Search file ───────────────────────────────────────────────────────────
  searchFile(text) {
    const msg = text.toLowerCase();
    if (/\b(find file|search file|locate file|where is file|find a file|search for file|look for file)\b/i.test(msg)) {
      // Use original text for query (preserves case for filenames)
      const query = extractAfter(text, /(?:find|search for?|locate|where is)\s+(?:a\s+)?(?:file\s+)?(?:named?\s+|called\s+)?(.+)/i);
      return { intent: "search_file", confidence: 1, entities: query ? { query } : {} };
    }
    return null;
  }
};
