# Solution 1: Recommended - Install LibreOffice after bun install
FROM oven/bun:1.0.30

WORKDIR /app

# Copy package.json files for workspaces needed by server
COPY package.json .
COPY turbo.json .
COPY apps/server/package.json ./apps/server/
COPY packages/db/package.json ./packages/db/
COPY packages/typescript-config/package.json ./packages/typescript-config/


# Copy necessary workspace files
COPY apps/server ./apps/server
COPY packages/db ./packages/db
COPY packages/typescript-config ./packages/typescript-config

# Install dependencies FIRST (before LibreOffice)
RUN bun install

# Install LibreOffice AFTER bun install
RUN apt-get update && apt-get install -y \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory to server app
WORKDIR /app/apps/server

# Expose port (adjust if needed)
EXPOSE 3000

# Environment variables with defaults
ENV PORT=3000

# Start the server
CMD ["bun", "run", "start"]
