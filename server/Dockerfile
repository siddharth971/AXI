# ─── Stage 1: Model Trainer ─────────────────────────────────────────────────
# Trains both NLP classifiers so the runtime image has working models.
# Using node:20 (full Debian image) for native module compatibility (better-sqlite3).
FROM node:20 AS trainer

WORKDIR /app

# Install dependencies (including devDependencies for build tools)
COPY package*.json ./
RUN npm ci

# Copy full source
COPY . .

# Run TF-IDF training first (fast, no internet needed)
RUN npm run train:tfidf

# Run Brain.js training (calls axi:learn internally; autonomous/output/ may be empty — that's ok)
RUN npm run train || true

# ─── Stage 2: Runtime ────────────────────────────────────────────────────────
FROM node:20

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Copy trained model artifacts from trainer stage
COPY --from=trainer /app/data/tfidf-model.json ./data/tfidf-model.json
COPY --from=trainer /app/data/models/          ./data/models/
# axi.db may not exist if no training data produced it; copy it in a shell step so the build doesn't fail
RUN --mount=from=trainer,source=/app/data,target=/trainer_data \
    cp /trainer_data/axi.db ./data/axi.db 2>/dev/null || true

# Expose the API port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]

