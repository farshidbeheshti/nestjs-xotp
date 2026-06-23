# Examples

Runnable NestJS apps that demonstrate `nestjs-xotp`.

## Run with npm (recommended)

From the repository root:

```bash
npm run build
cd examples/2fa-basic
npm install
npm run start
```

Each example depends on the local package (`"nestjs-xotp": "file:../.."`), so run `npm run build` at the repo root before `npm install` inside an example.

## Docker (optional)

Requires [Docker](https://docs.docker.com/get-docker/). The container build compiles `nestjs-xotp` and the selected example — no local `npm install` or `npm run build` required.

From the repository root:

```bash
# One example (foreground)
docker compose -f examples/docker-compose.yml up 2fa-basic

# One example (background)
docker compose -f examples/docker-compose.yml up -d async-config

# All examples
docker compose -f examples/docker-compose.yml up

# Build images without starting
docker compose -f examples/docker-compose.yml build

# Stop and remove containers
docker compose -f examples/docker-compose.yml down
```

| Service | Port | Docs |
|---------|------|------|
| `2fa-basic` | 3000 | [README](./2fa-basic/README.md) |
| `async-config` | 3001 | [README](./async-config/README.md) |
| `hotp-counter` | 3002 | [README](./hotp-counter/README.md) |

npm is the primary workflow for development and copying code into your own app.

## Examples

| Example | Description |
|---------|-------------|
| [2fa-basic](./2fa-basic) | TOTP enrollment and verification |
| [async-config](./async-config) | `forRootAsync` with environment-based options |
| [hotp-counter](./hotp-counter) | Counter-based HOTP generate and verify |
