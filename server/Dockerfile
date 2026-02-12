# Use Node.js 20 on Debian (standard) for better compatibility with TFJS/native modules
FROM node:20

# Set working directory
WORKDIR /app

# Install system dependencies (optional, for screenshot/canvas if needed later)
# RUN apt-get update && apt-get install -y \
#     python3 \
#     make \
#     g++ \
#     && rm -rf /var/lib/apt/lists/*

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
