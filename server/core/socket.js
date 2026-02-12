/**
 * Socket.IO Singleton
 * -------------------
 * Manages the WebSocket server instance.
 */

const { Server } = require("socket.io");
const { logger } = require("../utils");

let io = null;

module.exports = {
  /**
   * Initialize Socket.IO
   * @param {Object} httpServer - Node.js HTTP server
   */
  init(httpServer) {
    if (io) return io;

    io = new Server(httpServer, {
      cors: {
        origin: [
          "http://localhost:4200",
          "https://siddharth971.github.io"
        ],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    io.on("connection", (socket) => {
      logger.info(`🔌 Client Connected: ${socket.id}`);

      socket.on("disconnect", () => {
        logger.info(`🔌 Client Disconnected: ${socket.id}`);
      });
    });

    logger.success("✅ Socket.IO Initialized");
    return io;
  },

  /**
   * Get the IO instance
   */
  getIO() {
    if (!io) {
      throw new Error("Socket.IO not initialized!");
    }
    return io;
  },

  /**
   * Emit an event to all clients
   * @param {string} event - Event name
   * @param {any} data - Payload
   */
  emit(event, data) {
    if (io) {
      io.emit(event, data);
    }
  }
};
