# Stage 1: Build the React application
FROM node:20-alpine AS builder
LABEL org.opencontainers.image.source=https://github.com/Jacobingalls/RecipeAdmin

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy the built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Use custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
