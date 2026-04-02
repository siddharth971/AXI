/**
 * Auto-generated Rule for FPGAEmu: An Introduction to FPGA Emulation &mdash; fpgaemu 0.1 documentation
 */
module.exports = function(text, nlu) {
  if (/\b(fpgaemuanintroductiontofpgaemulationmdashfpgaemu01documentation|FPGAEmu)\b/i.test(text)) {
    return {
      intent: "knowledge.dynamic.fpgaemuanintroductiontofpgaemulationmdashfpgaemu01documentation",
      confidence: 1.0,
      entities: { topic: "FPGAEmu: An Introduction to FPGA Emulation &mdash; fpgaemu 0.1 documentation" }
    };
  }
  return null;
};
