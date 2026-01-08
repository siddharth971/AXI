/**
 * File Plugin
 * ------------
 * Handles all file system operations:
 * - Creating files and folders
 * - Opening, renaming, deleting files
 * - File search operations
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);
const fsPromises = fs.promises;

// Default base directory for file operations
const USER_HOME = process.env.USERPROFILE || process.env.HOME || "C:\\Users";
const DEFAULT_BASE = path.join(USER_HOME, "Documents");

/**
 * Resolve path relative to base directory
 * @param {string} filepath - Relative or absolute path
 * @returns {string} Resolved absolute path
 */
function resolvePath(filepath) {
  if (!filepath) return DEFAULT_BASE;

  // Already absolute
  if (path.isAbsolute(filepath)) {
    return filepath;
  }

  return path.join(DEFAULT_BASE, filepath);
}

/**
 * Sanitize filename for safety
 * @param {string} name - Filename to sanitize
 * @returns {string} Sanitized filename
 */
function sanitizeName(name) {
  return name.replace(/[<>:"/\\|?*]/g, "_").trim();
}

/**
 * Check if path is within allowed directories
 * @param {string} targetPath - Path to check
 * @returns {boolean}
 */
function isPathSafe(targetPath) {
  const resolved = path.resolve(targetPath);

  // Prevent access to system directories
  const forbidden = [
    "C:\\Windows",
    "C:\\Program Files",
    "C:\\Program Files (x86)",
    "/usr",
    "/etc",
    "/bin",
    "/sys"
  ];

  return !forbidden.some(dir =>
    resolved.toLowerCase().startsWith(dir.toLowerCase())
  );
}

module.exports = {
  name: "file",
  description: "File system operations including create, open, delete, and search",

  intents: {
    create_folder: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const name = params.name || params.foldername || params.folder;

        if (!name) {
          return "What should I name the folder?";
        }

        const safeName = sanitizeName(name);
        const folderPath = params.path
          ? resolvePath(path.join(params.path, safeName))
          : resolvePath(safeName);

        if (!isPathSafe(folderPath)) {
          return "I cannot create folders in system directories.";
        }

        try {
          await fsPromises.mkdir(folderPath, { recursive: true });
          return `Folder "${safeName}" created successfully at ${path.dirname(folderPath)}, sir.`;
        } catch (error) {
          if (error.code === "EEXIST") {
            return `Folder "${safeName}" already exists.`;
          }
          return `I couldn't create the folder: ${error.message}`;
        }
      }
    },

    create_file: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const name = params.name || params.filename || params.file;
        const content = params.content || "";

        if (!name) {
          return "What should I name the file?";
        }

        const safeName = sanitizeName(name);
        const filePath = params.path
          ? resolvePath(path.join(params.path, safeName))
          : resolvePath(safeName);

        if (!isPathSafe(filePath)) {
          return "I cannot create files in system directories.";
        }

        try {
          // Ensure parent directory exists
          await fsPromises.mkdir(path.dirname(filePath), { recursive: true });

          // Check if file exists
          try {
            await fsPromises.access(filePath);
            return `File "${safeName}" already exists. Would you like me to overwrite it?`;
          } catch {
            // File doesn't exist, proceed
          }

          await fsPromises.writeFile(filePath, content, "utf8");
          return `File "${safeName}" created successfully, sir.`;
        } catch (error) {
          return `I couldn't create the file: ${error.message}`;
        }
      }
    },

    open_file: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const name = params.name || params.filename || params.file || params.path;

        if (!name) {
          return "Which file would you like me to open?";
        }

        const filePath = resolvePath(name);

        try {
          await fsPromises.access(filePath);
          await execAsync(`start "" "${filePath}"`);
          return `Opening "${path.basename(filePath)}", sir.`;
        } catch (error) {
          if (error.code === "ENOENT") {
            return `I couldn't find the file "${name}".`;
          }
          return `I couldn't open the file: ${error.message}`;
        }
      }
    },

    delete_file: {
      confidence: 0.7,
      requiresConfirmation: true, // DESTRUCTIVE ACTION
      handler: async (params, context) => {
        const name = params.name || params.filename || params.file || params.path;

        if (!name) {
          return "Which file would you like me to delete?";
        }

        const filePath = resolvePath(name);

        if (!isPathSafe(filePath)) {
          return "I cannot delete files in system directories.";
        }

        try {
          const stats = await fsPromises.stat(filePath);

          if (stats.isDirectory()) {
            return `"${name}" is a directory. Use the delete folder command instead.`;
          }

          await fsPromises.unlink(filePath);
          return `File "${path.basename(filePath)}" has been deleted, sir.`;
        } catch (error) {
          if (error.code === "ENOENT") {
            return `I couldn't find the file "${name}".`;
          }
          return `I couldn't delete the file: ${error.message}`;
        }
      }
    },

    delete_folder: {
      confidence: 0.7,
      requiresConfirmation: true, // DESTRUCTIVE ACTION
      handler: async (params, context) => {
        const name = params.name || params.foldername || params.folder || params.path;

        if (!name) {
          return "Which folder would you like me to delete?";
        }

        const folderPath = resolvePath(name);

        if (!isPathSafe(folderPath)) {
          return "I cannot delete system directories.";
        }

        try {
          const stats = await fsPromises.stat(folderPath);

          if (!stats.isDirectory()) {
            return `"${name}" is a file. Use the delete file command instead.`;
          }

          await fsPromises.rm(folderPath, { recursive: true, force: true });
          return `Folder "${path.basename(folderPath)}" and its contents have been deleted, sir.`;
        } catch (error) {
          if (error.code === "ENOENT") {
            return `I couldn't find the folder "${name}".`;
          }
          return `I couldn't delete the folder: ${error.message}`;
        }
      }
    },

    search_file: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const query = params.query || params.name || params.search;
        const searchPath = params.path ? resolvePath(params.path) : DEFAULT_BASE;

        if (!query) {
          return "What file are you looking for?";
        }

        try {
          // Use Windows dir command for search
          const { stdout } = await execAsync(
            `dir /s /b "${searchPath}\\*${query}*" 2>nul`,
            { maxBuffer: 1024 * 1024 }
          );

          const files = stdout.trim().split("\n").filter(f => f);

          if (files.length === 0) {
            return `I couldn't find any files matching "${query}" in ${searchPath}.`;
          }

          if (files.length > 10) {
            const firstTen = files.slice(0, 10).map(f => path.basename(f));
            return `Found ${files.length} files matching "${query}". Here are the first 10:\n- ${firstTen.join("\n- ")}`;
          }

          const names = files.map(f => path.basename(f));
          return `Found ${files.length} file(s) matching "${query}":\n- ${names.join("\n- ")}`;
        } catch (error) {
          return `I couldn't search for files: ${error.message}`;
        }
      }
    },

    rename_file: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const oldName = params.oldname || params.from || params.current;
        const newName = params.newname || params.to || params.name;

        if (!oldName) {
          return "Which file would you like me to rename?";
        }

        if (!newName) {
          return "What should I rename it to?";
        }

        const oldPath = resolvePath(oldName);
        const newPath = path.join(path.dirname(oldPath), sanitizeName(newName));

        if (!isPathSafe(oldPath) || !isPathSafe(newPath)) {
          return "I cannot rename files in system directories.";
        }

        try {
          await fsPromises.access(oldPath);
          await fsPromises.rename(oldPath, newPath);
          return `Renamed "${path.basename(oldPath)}" to "${path.basename(newPath)}", sir.`;
        } catch (error) {
          if (error.code === "ENOENT") {
            return `I couldn't find the file "${oldName}".`;
          }
          return `I couldn't rename the file: ${error.message}`;
        }
      }
    },

    list_files: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const targetPath = params.path ? resolvePath(params.path) : DEFAULT_BASE;

        try {
          const entries = await fsPromises.readdir(targetPath, { withFileTypes: true });

          if (entries.length === 0) {
            return `The folder "${path.basename(targetPath)}" is empty.`;
          }

          const folders = entries.filter(e => e.isDirectory()).map(e => `📁 ${e.name}`);
          const files = entries.filter(e => e.isFile()).map(e => `📄 ${e.name}`);

          const items = [...folders, ...files].slice(0, 20);
          const remaining = entries.length - items.length;

          let response = `Contents of ${path.basename(targetPath)}:\n${items.join("\n")}`;

          if (remaining > 0) {
            response += `\n...and ${remaining} more items.`;
          }

          return response;
        } catch (error) {
          if (error.code === "ENOENT") {
            return `I couldn't find the folder "${targetPath}".`;
          }
          return `I couldn't list the files: ${error.message}`;
        }
      }
    }
  }
};
