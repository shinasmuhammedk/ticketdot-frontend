# ==========================================
# Multi-stage Dockerfile for TicketDot Frontend
# ==========================================

# 1. Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (respecting package-lock)
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Build-time environment variable for the backend API URL
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy source code and build production bundle
COPY . .
RUN npm run build

# 2. Production Stage with Nginx
FROM nginx:alpine AS runtime

# Remove default static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built production assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration with SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
