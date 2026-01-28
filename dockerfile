# -------- Multi-stage Dockerfile for Node.js Application --------

# -------- Stage 1: install dependencies --------
FROM node:18-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci


# -------- Stage 2: build application --------
FROM node:18-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build


# -------- Stage 3: production runtime --------
FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 8080
CMD ["npm", "run", "dev"]