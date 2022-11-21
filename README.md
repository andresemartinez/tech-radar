# Tech Radar (T3 stack POC)

This is an excuse to try the [T3](https://github.com/t3-oss/create-t3-app) stack
## Development

### Requirements

- Node >= 16
- Yarn
- Docker & Docker Compose (for running Postgres)

### Commands

```bash
yarn build      # runs `prisma generate` + `prisma migrate` + `next build`
yarn db-nuke    # resets local db
yarn dev        # starts next.js
yarn dx         # starts postgres db + runs migrations + seeds + starts next.js
yarn test-dev   # runs e2e tests on dev
yarn test-start # runs e2e tests on `next start` - build required before
yarn test:unit  # runs normal jest unit tests
yarn test:e2e   # runs e2e tests
```
