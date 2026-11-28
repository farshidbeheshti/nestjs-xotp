# 2fa-basic

Minimal TOTP enrollment and verification with `nestjs-xotp` (xotp v2).

This example shows two patterns from the underlying [xotp](https://github.com/farshidbeheshti/xotp) library:

- **Enrollment** — `XotpTotpService.create()` generates a per-user secret and `otpauth://` URI.
- **Verification** — a shared injected `XotpTotpService` uses `verify()` with each user's stored secret and `afterTimeStep` for replay protection.

Secrets and last time steps are kept in memory only. In production, persist and encrypt them in your database (use a conditional update when saving `lastTimeStep`).

## How it works

- `TwoFactorModule` imports `XotpModule.forRoot()` so `XotpTotpService` can be injected into `TwoFactorService`.
- **Enrollment** uses `XotpTotpService.create()` to generate a per-user secret and `otpauth://` URI.
- **Verification** calls `await totp.verify({ secret, token, afterTimeStep })` and stores `timeStep` on success so the same token cannot be reused.

## Run

From the repository root:

```bash
npm run build
cd examples/2fa-basic
npm install
npm run start
```

For local development without a separate build step:

```bash
npm run start:dev
```

The app listens on `http://localhost:3000`.

## Try it

Enroll an account:

```bash
curl -s -X POST http://localhost:3000/2fa/enroll \
  -H 'content-type: application/json' \
  -d '{"account":"user@example.com"}'
```

Response:

```json
{
  "account": "user@example.com",
  "secret": "JBSWY3DPEHPK3PXP",
  "keyUri": "otpauth://totp/MyApp:user@example.com?secret=...&issuer=MyApp"
}
```

Add the `keyUri` to an authenticator app (or generate a QR code from it). Then verify a code:

```bash
curl -s -X POST http://localhost:3000/2fa/verify \
  -H 'content-type: application/json' \
  -d '{"account":"user@example.com","token":"123456"}'
```

Response on success:

```json
{ "valid": true, "timeStep": 59712345, "delta": 0 }
```

Submitting the same token again returns `{ "valid": false }` because `afterTimeStep` rejects that time step.

Fetch the key URI again for an enrolled account:

```bash
curl -s http://localhost:3000/2fa/key-uri/user@example.com
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/2fa/enroll` | Generate secret and key URI for an account |
| `POST` | `/2fa/verify` | Verify a TOTP token once (replay-safe) |
| `GET` | `/2fa/key-uri/:account` | Return the key URI for an enrolled account |
