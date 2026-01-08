/**
 * Developer Plugin
 * -----------------
 * Handles developer-focused operations:
 * - Starting development servers
 * - Git operations
 * - NPM package management
 * - IDE launching
 * - Script execution
 */

"use strict";

const { exec, spawn } = require("child_process");
const { promisify } = require("util");
const path = require("path");
const fs = require("fs");

const execAsync = promisify(exec);

// Common project directories
const USER_HOME = process.env.USERPROFILE || process.env.HOME || "C:\\Users";
const COMMON_PROJECT_PATHS = [
  path.join(USER_HOME, "Projects"),
  path.join(USER_HOME, "Documents", "Projects"),
  path.join(USER_HOME, "Code"),
  path.join(USER_HOME, "development"),
  "D:\\Projects",
  "D:\\Code"
];

/**
 * Find a project directory by name
 * @param {string} name - Project name
 * @returns {string|null} Project path or null
 */
async function findProject(name) {
  if (!name) return null;

  for (const basePath of COMMON_PROJECT_PATHS) {
    const projectPath = path.join(basePath, name);
    try {
      await fs.promises.access(projectPath);
      return projectPath;
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Get current working directory or find project
 * @param {Object} params - Handler params
 * @returns {string} Working directory
 */
async function getWorkingDir(params) {
  if (params.path) {
    return params.path;
  }

  if (params.project) {
    const projectPath = await findProject(params.project);
    if (projectPath) return projectPath;
  }

  return process.cwd();
}

module.exports = {
  name: "developer",
  description: "Developer tools including servers, git, npm, and IDE operations",

  intents: {
    start_server: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const workDir = await getWorkingDir(params);
        const port = params.port || "3000";
        const type = (params.type || "npm").toLowerCase();

        try {
          // Check if package.json exists
          const packageJsonPath = path.join(workDir, "package.json");

          try {
            await fs.promises.access(packageJsonPath);
          } catch {
            return `No package.json found in ${workDir}. Is this a Node.js project?`;
          }

          // Read package.json to find scripts
          const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, "utf8"));
          const scripts = packageJson.scripts || {};

          let command = "npm start";

          if (scripts.dev) {
            command = "npm run dev";
          } else if (scripts.serve) {
            command = "npm run serve";
          } else if (scripts.start) {
            command = "npm start";
          } else {
            return "No start, dev, or serve script found in package.json.";
          }

          // Start in new terminal window
          await execAsync(`start cmd /k "cd /d ${workDir} && ${command}"`, { cwd: workDir });

          return `Starting development server in ${path.basename(workDir)}. Check the new terminal window, sir.`;
        } catch (error) {
          return `I couldn't start the server: ${error.message}`;
        }
      }
    },

    git_status: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const workDir = await getWorkingDir(params);

        try {
          // Check if it's a git repository
          try {
            await fs.promises.access(path.join(workDir, ".git"));
          } catch {
            return `${path.basename(workDir)} is not a Git repository.`;
          }

          const { stdout } = await execAsync("git status --short", { cwd: workDir });

          if (!stdout.trim()) {
            return `Working directory is clean in ${path.basename(workDir)}. No changes to commit, sir.`;
          }

          const lines = stdout.trim().split("\n").slice(0, 10);
          const changes = lines.map(line => {
            const status = line.substring(0, 2).trim();
            const file = line.substring(3);
            const statusMap = {
              "M": "modified",
              "A": "added",
              "D": "deleted",
              "??": "untracked"
            };
            return `${statusMap[status] || status}: ${file}`;
          });

          let response = `Git status for ${path.basename(workDir)}:\n- ${changes.join("\n- ")}`;

          if (stdout.trim().split("\n").length > 10) {
            response += `\n...and more changes.`;
          }

          return response;
        } catch (error) {
          return `I couldn't get git status: ${error.message}`;
        }
      }
    },

    git_commit: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const workDir = await getWorkingDir(params);
        const message = params.message || params.msg || "Update from AXI";

        try {
          // Stage all changes
          await execAsync("git add -A", { cwd: workDir });

          // Commit
          await execAsync(`git commit -m "${message}"`, { cwd: workDir });

          return `Changes committed with message: "${message}", sir.`;
        } catch (error) {
          if (error.message.includes("nothing to commit")) {
            return "There's nothing to commit. The working directory is clean.";
          }
          return `I couldn't commit changes: ${error.message}`;
        }
      }
    },

    git_pull: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const workDir = await getWorkingDir(params);

        try {
          const { stdout, stderr } = await execAsync("git pull", { cwd: workDir });

          if (stdout.includes("Already up to date")) {
            return `${path.basename(workDir)} is already up to date, sir.`;
          }

          return `Pulled latest changes for ${path.basename(workDir)}, sir.`;
        } catch (error) {
          return `I couldn't pull changes: ${error.message}`;
        }
      }
    },

    git_push: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const workDir = await getWorkingDir(params);

        try {
          await execAsync("git push", { cwd: workDir });
          return `Changes pushed to remote for ${path.basename(workDir)}, sir.`;
        } catch (error) {
          return `I couldn't push changes: ${error.message}`;
        }
      }
    },

    npm_install: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const workDir = await getWorkingDir(params);
        const packageName = params.package || params.name;

        try {
          let command = "npm install";
          let message = "Installing all dependencies";

          if (packageName) {
            const isDev = params.dev || params.devDependency;
            command = `npm install ${isDev ? "-D" : ""} ${packageName}`;
            message = `Installing ${packageName}${isDev ? " as dev dependency" : ""}`;
          }

          // Start in new terminal for visibility
          await execAsync(`start cmd /k "cd /d ${workDir} && ${command}"`, { cwd: workDir });

          return `${message} in ${path.basename(workDir)}. Check the new terminal window, sir.`;
        } catch (error) {
          return `I couldn't run npm install: ${error.message}`;
        }
      }
    },

    npm_run: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const workDir = await getWorkingDir(params);
        const script = params.script || params.name;

        if (!script) {
          // List available scripts
          try {
            const packageJsonPath = path.join(workDir, "package.json");
            const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, "utf8"));
            const scripts = Object.keys(packageJson.scripts || {});

            if (scripts.length === 0) {
              return "No npm scripts found in this project.";
            }

            return `Available scripts:\n- ${scripts.join("\n- ")}\n\nWhich would you like to run?`;
          } catch {
            return "Which npm script would you like to run?";
          }
        }

        try {
          await execAsync(`start cmd /k "cd /d ${workDir} && npm run ${script}"`, { cwd: workDir });
          return `Running npm script "${script}" in ${path.basename(workDir)}, sir.`;
        } catch (error) {
          return `I couldn't run the script: ${error.message}`;
        }
      }
    },

    open_vscode: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const workDir = await getWorkingDir(params);
        const file = params.file;

        try {
          const target = file ? path.join(workDir, file) : workDir;
          await execAsync(`code "${target}"`);

          if (file) {
            return `Opening ${file} in VS Code, sir.`;
          }
          return `Opening ${path.basename(workDir)} in VS Code, sir.`;
        } catch (error) {
          return "I couldn't open VS Code. Please ensure it's installed and 'code' is in your PATH.";
        }
      }
    },

    run_script: {
      confidence: 0.6,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const script = params.script || params.file || params.path;
        const workDir = await getWorkingDir(params);

        if (!script) {
          return "Which script would you like me to run?";
        }

        const scriptPath = path.isAbsolute(script) ? script : path.join(workDir, script);
        const ext = path.extname(scriptPath).toLowerCase();

        try {
          await fs.promises.access(scriptPath);
        } catch {
          return `I couldn't find the script "${script}".`;
        }

        let command;

        switch (ext) {
          case ".js":
            command = `node "${scriptPath}"`;
            break;
          case ".py":
            command = `python "${scriptPath}"`;
            break;
          case ".ps1":
            command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`;
            break;
          case ".bat":
          case ".cmd":
            command = `"${scriptPath}"`;
            break;
          case ".sh":
            command = `bash "${scriptPath}"`;
            break;
          default:
            return `I don't know how to run ${ext} files. Supported: .js, .py, .ps1, .bat, .cmd, .sh`;
        }

        try {
          await execAsync(`start cmd /k "${command}"`, { cwd: workDir });
          return `Running ${path.basename(script)}. Check the new terminal window, sir.`;
        } catch (error) {
          return `I couldn't run the script: ${error.message}`;
        }
      }
    },

    open_terminal: {
      confidence: 0.5,
      requiresConfirmation: false,
      handler: async (params, context) => {
        const workDir = await getWorkingDir(params);

        try {
          await execAsync(`start cmd /k "cd /d ${workDir}"`, { cwd: workDir });
          return `Opening terminal in ${path.basename(workDir)}, sir.`;
        } catch (error) {
          return `I couldn't open the terminal: ${error.message}`;
        }
      }
    }
  }
};
