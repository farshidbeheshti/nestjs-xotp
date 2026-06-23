# async-config

Load `nestjs-xotp` options from environment variables with `XOTPModule.forRootAsync()`.

This example shows:

- An `OtpConfigService` that implements `XOTPOptionsFactory`
- `XOTPModule.forRootAsync({ imports, useExisting })` wiring
- Reading TOTP settings from `process.env` at bootstrap

## Run

From the repository root:

```bash
npm run build
cd examples/async-config
npm install
npm run start
```

For local development:

```bash
npm run start:dev
```

The app listens on `http://localhost:3001` by default (`PORT` overrides).

### Custom options

```bash
OTP_ISSUER=Acme \
OTP_TOTP_DIGITS=8 \
OTP_TOTP_DURATION=30 \
OTP_TOTP_WINDOW=1 \
OTP_TOTP_ALGORITHM=sha1 \
npm run start
```

| Variable | Default | Description |
|----------|---------|-------------|
| `OTP_ISSUER` | `MyApp` | Issuer label for key URIs |
| `OTP_TOTP_ALGORITHM` | `sha1` | TOTP hash algorithm |
| `OTP_TOTP_DIGITS` | `6` | Token length |
| `OTP_TOTP_DURATION` | `30` | Step size in seconds |
| `OTP_TOTP_WINDOW` | `1` | Validation drift window |
| `PORT` | `3001` | HTTP port |

## Try it

Check the loaded settings:

```bash
curl -s http://localhost:3001/otp/settings
```

Response:

```json
{
  "issuer": "MyApp",
  "algorithm": "sha1",
  "digits": 6,
  "duration": 30,
  "window": 1
}
```

Verify a token (use a secret from an authenticator app or from [2fa-basic](../2fa-basic)):

```bash
curl -s -X POST http://localhost:3001/otp/verify \
  -H 'content-type: application/json' \
  -d '{"secret":"JBSWY3DPEHPK3PXP","token":"123456"}'
```

Response:

```json
{ "valid": false }
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/otp/settings` | Show effective TOTP options loaded from config |
| `POST` | `/otp/verify` | Validate a token against a base32 secret |

## How it works

`OtpModule` imports `XOTPModule.forRootAsync()` and delegates option creation to `OtpConfigService`:

```typescript
XOTPModule.forRootAsync({
  imports: [OtpConfigModule],
  useExisting: OtpConfigService,
})
```

`OtpConfigService.createXOTPModuleOptions()` maps environment variables to `XOTPModuleOptions`. In a real app, this service might read from `@nestjs/config`, a secrets manager, or another config source instead of `process.env` directly.
