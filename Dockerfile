FROM node:20-slim AS builder

WORKDIR /app

RUN npm install -g pnpm@latest

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/boticario/package.json ./artifacts/boticario/
COPY artifacts/portal-cliente/package.json ./artifacts/portal-cliente/
COPY lib/db/package.json ./lib/db/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/

RUN pnpm install --frozen-lockfile

COPY . .

RUN BASE_PATH=/portal-cliente/ PORT=3000 pnpm --filter @workspace/portal-cliente build && \
    BASE_PATH=/ PORT=3000 pnpm --filter @workspace/boticario build && \
    pnpm --filter @workspace/api-server build

FROM node:20-slim AS production

WORKDIR /app

RUN npm install -g pnpm@latest

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY lib/db/package.json ./lib/db/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-zod/package.json ./lib/api-zod/

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder /app/artifacts/boticario/dist ./artifacts/boticario/dist
COPY --from=builder /app/artifacts/portal-cliente/dist ./artifacts/portal-cliente/dist

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "artifacts/api-server/dist/index.cjs"]
