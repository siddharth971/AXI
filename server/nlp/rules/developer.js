/**
 * Developer Rules
 * ----------------
 * Pattern matching for developer/git/npm commands
 * HIGH PRIORITY to ensure accurate matching
 */

module.exports = {
  /**
   * Git status - match git status queries
   */
  gitStatus(text) {
    const msg = text.toLowerCase();

    if (/\b(git status|git ka status|repo status|repository status|check git|git changes)\b/i.test(msg)) {
      return { intent: "git_status", confidence: 1, entities: {} };
    }

    return null;
  },

  /**
   * NPM install - match package installation
   */
  npmInstall(text) {
    const msg = text.toLowerCase();

    if (/\b(npm install|npm i\b|install packages|install dependencies|node modules install)\b/i.test(msg)) {
      return { intent: "npm_install", confidence: 1, entities: {} };
    }

    return null;
  },

  /**
   * Open VS Code - match code editor opening
   */
  openVscode(text) {
    const msg = text.toLowerCase();

    if (/\b(open vscode|open vs code|vscode kholo|launch vscode|start vscode|visual studio code)\b/i.test(msg)) {
      return { intent: "open_vscode", confidence: 1, entities: {} };
    }

    // Prevent "open code editor" from being captured by open_application
    if (/\b(code editor|open code editor)\b/i.test(msg)) {
      return { intent: "open_vscode", confidence: 1, entities: {} };
    }

    return null;
  },

  /**
   * Git commit
   */
  gitCommit(text) {
    const msg = text.toLowerCase();

    if (/\b(git commit|commit changes|commit karo)\b/i.test(msg)) {
      return { intent: "git_commit", confidence: 1, entities: {} };
    }

    return null;
  },

  /**
   * Git push
   */
  gitPush(text) {
    const msg = text.toLowerCase();

    if (/\b(git push|push changes|push to remote|push to github)\b/i.test(msg)) {
      return { intent: "git_push", confidence: 1, entities: {} };
    }

    return null;
  },

  /**
   * Git pull
   */
  gitPull(text) {
    const msg = text.toLowerCase();

    if (/\b(git pull|pull changes|pull from remote)\b/i.test(msg)) {
      return { intent: "git_pull", confidence: 1, entities: {} };
    }

    return null;
  }
};
