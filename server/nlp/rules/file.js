/**
 * File Rules
 * -----------
 * Pattern matching for file operations
 * HIGH PRIORITY to prevent confusion with website/open commands
 * 
 * RULE ORDER: These rules run before website rules to prevent
 * "delete file" from being captured as "open website"
 */

module.exports = {
  /**
   * List files - match listing/showing files
   */
  listFiles(text) {
    const msg = text.toLowerCase();
    if (/\b(list files|show files|files dikha|files dikhao|list directory|dir\b|ls\b|folder ke files|directory ke files|show folder contents|what files)\b/i.test(msg)) {
      return { intent: "list_files", confidence: 1, entities: {} };
    }
    return null;
  },

  /**
   * Delete file - match delete/remove file commands
   * Must run before website rules to avoid "delete file.txt" becoming "open website"
   */
  deleteFile(text) {
    const msg = text.toLowerCase();
    if (/\b(delete file|remove file|file delete|file hatao|erase file|trash file)\b/i.test(msg)) {
      // Extract filename if present
      const match = msg.match(/(?:delete|remove|erase|trash)\s+(?:the\s+)?(?:file\s+)?([a-z0-9_.]+)/i);
      const filename = match ? match[1] : null;
      return { intent: "delete_file", confidence: 1, entities: { filename } };
    }
    return null;
  },

  /**
   * Create folder
   */
  createFolder(text) {
    const msg = text.toLowerCase();
    if (/\b(create folder|make folder|new folder|folder banao|create directory|make directory)\b/i.test(msg)) {
      return { intent: "create_folder", confidence: 1, entities: {} };
    }
    return null;
  },

  /**
   * Create file
   */
  createFile(text) {
    const msg = text.toLowerCase();
    if (/\b(create file|make file|new file|file banao|touch)\b/i.test(msg)) {
      return { intent: "create_file", confidence: 1, entities: {} };
    }
    return null;
  }
};
