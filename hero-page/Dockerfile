FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy the rest of the application code, excluding node_modules
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install only production dependencies
RUN npm install -g pnpm
RUN pnpm install --production

# Copy next.config.js
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# Set the command to start the app
CMD ["pnpm", "start"]

EXPOSE 3000 