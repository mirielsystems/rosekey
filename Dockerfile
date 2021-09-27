FROM node:current-alpine3.14 AS base

ENV NODE_ENV=production

WORKDIR /cherrypick

ENV BUILD_DEPS autoconf automake file g++ gcc libc-dev libtool make nasm pkgconfig python3 zlib-dev git

FROM base AS builder

COPY . ./

RUN apk add --no-cache $BUILD_DEPS && \
    git submodule update --init && \
    yarn install && \
    yarn build && \
    rm -rf .git

FROM base AS runner

RUN apk add --no-cache \
    ffmpeg \
    tini

ENTRYPOINT ["/sbin/tini", "--"]

COPY --from=builder /cherrypick/node_modules ./node_modules
COPY --from=builder /cherrypick/built ./built
COPY . ./

CMD ["npm", "run", "migrateandstart"]

