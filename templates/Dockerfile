# build
FROM node:22-slim AS builder
WORKDIR /app

COPY ./package*.json ./
COPY ./bin ./bin
COPY ./config ./config

RUN npm config set loglevel verbose
RUN npm ci

# deploy
FROM gcr.io/distroless/nodejs22-debian12:latest
WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /app/ .

USER nonroot
EXPOSE 5580

CMD ["./bin/where-socket.js", "./config"]
