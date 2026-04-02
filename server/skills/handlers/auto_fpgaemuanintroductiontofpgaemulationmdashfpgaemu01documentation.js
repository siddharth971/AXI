/**
 * Auto-generated Legacy Handler for FPGAEmu: An Introduction to FPGA Emulation &mdash; fpgaemu 0.1 documentation
 */
const responses = require("./responses/auto_fpgaemuanintroductiontofpgaemulationmdashfpgaemu01documentation");

module.exports = {
  execute: async (intent, entities, nlu) => {
    return {
      action: "chat.response",
      response: responses.reply()
    };
  }
};
