FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --mode production-results && node build-server.mjs
FROM node:22-bookworm-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/proxy.mjs /app/server.mjs /app/sign-in.html ./
USER node
EXPOSE 8080
CMD ["node", "server.mjs"]
