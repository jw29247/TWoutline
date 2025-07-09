ARG APP_PATH=/opt/outline

# Build stage - builds the application from local source
FROM node:20 AS builder

ARG APP_PATH
WORKDIR $APP_PATH

# Copy package files and patches
COPY ./package.json ./yarn.lock ./
COPY ./patches ./patches

# Install build dependencies including cmake
RUN apt-get update && apt-get install -y cmake
ENV NODE_OPTIONS="--max-old-space-size=24000"

# Install all dependencies
RUN yarn install --no-optional --frozen-lockfile --network-timeout 1000000 && \
  yarn cache clean

# Copy local source code
COPY . .

# Build the application
ARG CDN_URL
RUN yarn build

# Remove development dependencies
RUN rm -rf node_modules

# Install production dependencies only
RUN yarn install --production=true --frozen-lockfile --network-timeout 1000000 && \
  yarn cache clean

# ---
# Runtime stage - minimal production image
FROM node:22-slim AS runner

LABEL org.opencontainers.image.source="https://github.com/outline/outline"

ARG APP_PATH
WORKDIR $APP_PATH
ENV NODE_ENV=production

# Copy built application from builder stage
COPY --from=builder $APP_PATH/build ./build
COPY --from=builder $APP_PATH/server ./server
COPY --from=builder $APP_PATH/public ./public
COPY --from=builder $APP_PATH/.sequelizerc ./.sequelizerc
COPY --from=builder $APP_PATH/node_modules ./node_modules
COPY --from=builder $APP_PATH/package.json ./package.json

# Install wget to healthcheck the server
RUN  apt-get update \
  && apt-get install -y wget \
  && rm -rf /var/lib/apt/lists/*

# Create a non-root user compatible with Debian and BusyBox based images
RUN addgroup --gid 1001 nodejs && \
  adduser --uid 1001 --ingroup nodejs nodejs && \
  chown -R nodejs:nodejs $APP_PATH/build && \
  mkdir -p /var/lib/outline && \
  chown -R nodejs:nodejs /var/lib/outline

ENV FILE_STORAGE_LOCAL_ROOT_DIR=/var/lib/outline/data
RUN mkdir -p "$FILE_STORAGE_LOCAL_ROOT_DIR" && \
  chown -R nodejs:nodejs "$FILE_STORAGE_LOCAL_ROOT_DIR" && \
  chmod 1777 "$FILE_STORAGE_LOCAL_ROOT_DIR"



USER nodejs

HEALTHCHECK --interval=1m CMD wget -qO- "http://localhost:${PORT:-3000}/_health" | grep -q "OK" || exit 1

EXPOSE 3000
CMD ["yarn", "start"]
