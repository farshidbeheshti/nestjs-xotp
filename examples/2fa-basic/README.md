# 2fa-basic

Minimal TOTP enrollment and verification with `nestjs-xotp`.

This example shows two patterns from the underlying [xotp](https://github.com/farshidbeheshti/xotp) library:

- **Enrollment** — `XOTPTOTPService.create()` generates a per-user secret and `otpauth://` URI.
- **Verification** — a shared injected `XOTPTOTPService` validates tokens with each user's stored secret.

Secrets are kept in memory only. In production, persist and encrypt them in your database.

## How it works

- `TwoFactorModule` imports `XOTPModule.forRoot()` so `XOTPTOTPService` can be injected into `TwoFactorService`.
- **Enrollment** uses `XOTPTOTPService.create()` to generate a per-user secret and `otpauth://` URI.
- **Verification** uses the shared injected `XOTPTOTPService` with each user's stored secret.

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

**Alternative:** from the repository root, `docker compose -f examples/docker-compose.yml up 2fa-basic` (requires Docker).

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

Response:

```json
{ "valid": true }
```

Fetch the key URI again for an enrolled account:

```bash
curl -s http://localhost:3000/2fa/key-uri/user@example.com
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/2fa/enroll` | Generate secret and key URI for an account |
| `POST` | `/2fa/verify` | Validate a TOTP token |
| `GET` | `/2fa/key-uri/:account` | Return the key URI for an enrolled account |
