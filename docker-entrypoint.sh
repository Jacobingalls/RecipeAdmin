#!/bin/sh
set -e

# Default upstream to localhost for local Docker testing
export UPSTREAM_API_URL="${UPSTREAM_API_URL:-http://host.docker.internal:8080}"

# Replace placeholder in config.js for frontend display
API_DISPLAY="${API_DISPLAY_URL:-$UPSTREAM_API_URL}"
sed -i "s|__API_BASE_URL__|/api|g" /usr/share/nginx/html/config.js
sed -i "s|__API_DISPLAY_URL__|${API_DISPLAY}|g" /usr/share/nginx/html/config.js
sed -i "s|__VERSION__|${VERSION}|g" /usr/share/nginx/html/config.js
sed -i "s|__GIT_COMMIT__|${GIT_COMMIT}|g" /usr/share/nginx/html/config.js

# Process nginx template with environment variables
envsubst '${UPSTREAM_API_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
