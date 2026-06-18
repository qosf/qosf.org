# Multi-purpose image: serves the metriq-web static site via nginx.

FROM nginx:1.28-alpine

# Install Node.js so we can build the static assets and apply runtime config overrides.
RUN apk add --no-cache nodejs npm

WORKDIR /usr/share/nginx/html

# Install project dependencies first for better Docker layer caching.
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci --no-audit --no-fund

# Copy application files and build the static assets, including feed.xml.
COPY ./ /usr/share/nginx/html/
RUN npm run build:newapp \
 && npm prune --omit=dev \
 && npm cache clean --force \
 && rm -rf /root/.npm

# Ensure entrypoint helper runs before nginx starts
COPY docker-entrypoint.d/ /docker-entrypoint.d/

# Expose nginx default port
EXPOSE 80

# nginx base image already sets CMD ["nginx", "-g", "daemon off;"]
