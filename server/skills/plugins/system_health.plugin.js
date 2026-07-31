/**
 * System Health Diagnostics Plugin
 * -----------------------------------
 * Real-time OS diagnostic telemetry & voice reporting for AXI
 */

"use strict";

const os = require("os");
const { logger } = require("../../utils");

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(" ");
}

module.exports = {
  name: "system_health",
  description: "Real-time OS diagnostic telemetry",

  intents: {
    "system.health_check": {
      confidence: 0.95,
      requiresConfirmation: false,
      handler: async (params, context) => {
        logger.info("[Diagnostics] Gathering system health telemetry...");

        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memPercent = ((usedMem / totalMem) * 100).toFixed(1);

        const cpus = os.cpus();
        const cpuModel = cpus[0]?.model || "Processor";
        const cpuCores = cpus.length;
        const loadAvg = os.loadavg().map(l => l.toFixed(2)).join(", ");

        const sysUptime = formatUptime(os.uptime());
        const procMem = process.memoryUsage();
        const heapUsed = formatBytes(procMem.heapUsed);

        const status = parseFloat(memPercent) > 85 ? "⚠️ Warning (High Memory)" : "✅ Optimal";

        return `System Diagnostics (${status}):
• CPU: ${cpuCores}x ${cpuModel.trim()} (Load: ${loadAvg})
• RAM: ${formatBytes(usedMem)} / ${formatBytes(totalMem)} (${memPercent}% used)
• OS Uptime: ${sysUptime} (${os.platform()} ${os.arch()})
• Node Engine Heap: ${heapUsed}`;
      },
    },

    "system.cpu_check": {
      confidence: 0.95,
      requiresConfirmation: false,
      handler: async () => {
        const cpus = os.cpus();
        const loadAvg = os.loadavg().map(l => l.toFixed(2)).join(", ");
        return `CPU Telemetry: ${cpus.length} cores (${cpus[0]?.model.trim()}). Load Average (1m, 5m, 15m): ${loadAvg}.`;
      },
    },

    "system.memory_check": {
      confidence: 0.95,
      requiresConfirmation: false,
      handler: async () => {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memPercent = ((usedMem / totalMem) * 100).toFixed(1);
        return `RAM Telemetry: Using ${formatBytes(usedMem)} out of ${formatBytes(totalMem)} (${memPercent}% utilized). ${formatBytes(freeMem)} remaining.`;
      },
    },
  },
};
