/**
 * API Validator Middleware
 * ------------------------
 * Uses Zod schemas to validate incoming request bodies.
 */

const { z } = require("zod");
const { logger } = require("../utils");

// Define Zod Schemas
const schemas = {
  // POST /api/command
  command: z.object({
    text: z.string().min(1, "Command cannot be empty").max(1000, "Command is too long"),
    context: z.object({}).passthrough().optional()
  }),

  // POST /api/sessions
  createSession: z.object({
    title: z.string().max(100).optional().default("New Session")
  }),

  // PUT /api/sessions/:id
  updateSession: z.object({
    title: z.string().min(1).max(100)
  }),

  // Generic ID param validation (UUID or specific format)
  // Our IDs are currently random strings, so just enforce string length
  idParam: z.string().min(1)
};

/**
 * Middleware factory for body validation
 * @param {z.ZodSchema} schema - The Zod schema to validate against
 */
const validateBody = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorMsg = result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ");
      logger.warn(`Validation Failed: ${errorMsg}`);
      return res.status(400).json({
        error: "Validation Error",
        details: result.error.issues
      });
    }

    // Replace body with validated/sanitized data
    req.body = result.data;
    next();
  } catch (err) {
    res.status(500).json({ error: "Internal validation error" });
  }
};

module.exports = {
  schemas,
  validateBody
};
