/**
 * Auto-generated Plugin for FPGAEmu: An Introduction to FPGA Emulation &mdash; fpgaemu 0.1 documentation
 */
const responseHandler = require("../handlers/responses/auto_fpgaemuanintroductiontofpgaemulationmdashfpgaemu01documentation");

module.exports = {
  name: "auto_fpgaemuanintroductiontofpgaemulationmdashfpgaemu01documentation",
  description: "Autonomous handler for FPGAEmu: An Introduction to FPGA Emulation &mdash; fpgaemu 0.1 documentation",
  intents: {
    "knowledge.dynamic.fpgaemuanintroductiontofpgaemulationmdashfpgaemu01documentation": {
      confidence: 0.65,
      requiresConfirmation: false,
      handler: async (params, context) => {
        return responseHandler.reply();
      }
    }
  }
};
