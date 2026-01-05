/**
 * AXI Skills Module
 * ------------------
 * Main entry point for the skills system.
 * Re-exports the router for use by the application.
 */

const router = require("./router");

module.exports = {
  execute: router.execute
};
