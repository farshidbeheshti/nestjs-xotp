# hotp-counter

Counter-based HOTP enrollment and verification with `nestjs-xotp`.

This example shows:

- **Enrollment** — `XOTPHOTPService.create()` generates a per-user secret and `otpauth://` URI.
- **Verification** — a shared injected `XOTPHOTPService` validates tokens at the stored counter.
- **Counter persistence** — the server increments the counter after each successful verification (in memory).

Secrets and counters are kept in memory only. In production, persist them in your database.

## How it works

- `HotpModule` imports `XOTPModule.forRoot()` with HOTP-specific options.
- Each account has a `{ secret, counter }` record starting at counter `0`.
- `POST /hotp/verify` checks the token at the current counter; on success, the counter advances by one.

## Run

From the repository root:

```bash
npm run build
cd examples/hotp-counter
npm install
npm run start
```

For local development:

```bash
npm run start:dev
```

The app listens on `http://localhost:3002` by default (`PORT` overrides).

## Try it

Enroll an account:

```bash
curl -s -X POST http://localhost:3002/hotp/enroll \
  -H 'content-type: application/json' \
  -d '{"account":"device-1"}'
```

Response:

```json
{
  "account": "device-1",
  "secret": "JBSWY3DPEHPK3PXP",
  "keyUri": "otpauth://hotp/MyApp:device-1?secret=...&counter=0&issuer=MyApp",
  "counter": 0
}
```

Generate a token at counter `0` from the returned secret (e.g. with an authenticator app or the `xotp` CLI), then verify:

```bash
curl -s -X POST http://localhost:3002/hotp/verify \
  -H 'content-type: application/json' \
  -d '{"account":"device-1","token":"123456"}'
```

Response on success:

```json
{ "valid": true, "counter": 1 }
```

Check the stored counter:

```bash
curl -s http://localhost:3002/hotp/counter/device-1
```

Response:

```json
{ "account": "device-1", "counter": 1 }
```

The next valid token must be generated at counter `1`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/hotp/enroll` | Generate secret, key URI, and start counter at 0 |
| `POST` | `/hotp/verify` | Validate a HOTP token at the current counter |
| `GET` | `/hotp/counter/:account` | Return the stored counter for an account |
