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

Each example depends on the local package (`"nestjs-xotp": "file:../.."`), so build the library at the repo root before installing inside an example.

## Examples

| Example | Description |
|---------|-------------|
| [2fa-basic](./2fa-basic) | TOTP enrollment and verification |
| [async-config](./async-config) | `forRootAsync` with environment-based options |
| [hotp-counter](./hotp-counter) | Counter-based HOTP generate and verify |