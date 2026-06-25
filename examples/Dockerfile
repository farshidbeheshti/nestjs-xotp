ARG EXAMPLE=2fa-basic

FROM node:22-alpine AS builder

ARG EXAMPLE

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY tsconfig.json tsconfig.build.json LICENSE README.md ./
COPY src ./src

RUN npm ci && npm run build && npm pack && mv nestjs-xotp-*.tgz /workspace/nestjs-xotp.tgz

WORKDIR /workspace/examples/${EXAMPLE}

COPY examples/${EXAMPLE}/package.json examples/${EXAMPLE}/package-lock.json ./
COPY examples/${EXAMPLE}/tsconfig.json examples/${EXAMPLE}/tsconfig.build.json ./
COPY examples/${EXAMPLE}/src ./src

RUN sed -i 's|"nestjs-xotp": "file:../.."|"nestjs-xotp": "file:../../nestjs-xotp.tgz"|' package.json \
  && npm install \
  && npm run build \
  && npm prune --omit=dev

FROM node:22-alpine AS runner

ARG EXAMPLE

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /workspace/examples/${EXAMPLE}/package.json /workspace/examples/${EXAMPLE}/package-lock.json ./
COPY --from=builder /workspace/examples/${EXAMPLE}/dist ./dist
COPY --from=builder /workspace/examples/${EXAMPLE}/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/main.js"]
