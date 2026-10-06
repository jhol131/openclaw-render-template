FROM node:24.16-slim

RUN apt-get update && apt-get install -y git curl procps python3 make g++ cron tini patch && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --prefer-online && npm cache clean --force

COPY patches ./patches
COPY scripts ./scripts
RUN patch --batch --forward -p1 -d node_modules/@chrysb/alphaclaw < patches/alphaclaw-watchdog-circuit-breaker.patch \
    && patch --batch --forward -p1 -d node_modules/@chrysb/alphaclaw < patches/alphaclaw-openclaw-2026.9.8-compat.patch \
    && npm run verify:watchdog-patch

ENV PATH="/app/node_modules/.bin:$PATH"
ENV ALPHACLAW_ROOT_DIR=/data

RUN mkdir -p /data

EXPOSE 3000

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["alphaclaw", "start"]
