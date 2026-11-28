<h1 align="center">nestjs-xotp</h1>

<p align="center">
  <a href="https://github.com/farshidbeheshti/xotp" ><img src="https://github.com/user-attachments/assets/8ef372d6-3cd7-4202-88b2-519f45f67160" width="180" alt="XOTP Logo" /></a>
  <img src="https://github.com/user-attachments/assets/a5cf0746-9250-46fb-8b07-88e7b74ccbe9" width="120" alt="plus"  />
  <a href="https://github.com/nestjs/nest"><img src="https://github.com/user-attachments/assets/b9848d88-74a6-4ded-9ba8-54769cf12330" width="190" alt="NestJS Logo" /></a>
</p>

<p align="center">
  A <a href="https://github.com/nestjs/nest" rel="nofollow" >Nest</a> module wrapper for <a href="https://github.com/farshidbeheshti/xotp">XOTP</a>.
</p>

## Overview

`nestjs-xotp` provides a convenient way to use the XOTP library within your NestJS applications. It fully leverages NestJS's powerful dependency injection system, making it easy to manage, generate, and validate OTPs (Time-based One-Time Passwords - TOTP, and HMAC-based One-Time Passwords - HOTP) for robust security within your services.


> [!IMPORTANT]
> **xotp v2 is async.** `await` `generate`, `validate`, `compare`, `equals`, and `verify`. See [Migrating from v1](https://github.com/farshidbeheshti/xotp#migrating-from-v1).

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [Cookbook](#cookbook)
- [Options](#options)
- [License](#license)

## Installation

```bash
npm i xotp nestjs-xotp
```

`xotp` is a **peer dependency**, so your app and `nestjs-xotp` share one copy of it. Install both, as shown above (npm 7+ and pnpm also install peer dependencies automatically).

## Usage

Integrate `XotpModule` into your NestJS application by importing it into your `AppModule` and configuring it using the `forRoot()` method.
See the [options reference section](#options) for the options with which you can customize the module!

```typescript
import { Module } from '@nestjs/common';
import { XotpModule } from 'nestjs-xotp';

@Module({
  imports: [
    XotpModule.forRoot({
      // Optional: Your XOTP configuration options go here
    }),
  ],
})
export class AppModule {}
```

## Asynchronous Configuration

If your configuration depends on dynamic values, like environment variables or data from another module, use `forRootAsync()`:

```typescript
import { Module } from '@nestjs/common';
import { XotpModule } from 'nestjs-xotp';

@Module({
  imports: [
    XotpModule.forRootAsync({
      useFactory: () => ({
        // Your XOTP configuration options, dynamically provided
      }),
    }),
  ],
})
export class AppModule {}
```

To resolve dependencies of `useFactory` without importing another module, pass `extraProviders`:

```typescript
XotpModule.forRootAsync({
  extraProviders: [ConfigService],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    digits: config.otpDigits,
  }),
});
```

### Global module

By default you import `XotpModule` in every module that needs it. To register it once and inject it anywhere, set `global: true` on `forRoot()` or `forRootAsync()`:

```typescript
XotpModule.forRoot({ global: true });

XotpModule.forRootAsync({
  global: true,
  useFactory: () => ({ /* ... */ }),
});
```

Once `XotpModule` is configured, you can easily inject XotpService into any of your NestJS services or controllers:

```typescript
import { Injectable } from '@nestjs/common';
import { XotpService } from 'nestjs-xotp';

@Injectable()
export class MyService {
  constructor(private readonly xotpService: XotpService) {}
}
```

`XotpService` exposes the configured `totp` and `hotp` services, plus the `xotp` helpers `secret` (the `Secret` class) and `uri` (the `URI` class for `URI.parse()` / `URI.format()` of `otpauth://` key URIs):

```typescript
const parsed = this.xotpService.uri.parse(keyUri);
const secret = this.xotpService.secret.for('sha1');
```

The option and result types `TOTPOptions`, `HOTPOptions` and `TOTPVerifyResult` are re-exported from `nestjs-xotp`, so you can import them from there.

## Examples

Runnable NestJS apps live under [`examples/`](./examples/).

### Run with npm (recommended)

From the repository root:

```bash
npm run build
cd examples/2fa-basic
npm install
npm run start
```

The app listens on `http://localhost:3000`. See [examples/2fa-basic/README.md](./examples/2fa-basic/README.md) for enroll and verify requests.

| Example | Description |
|---------|-------------|
| [`2fa-basic`](./examples/2fa-basic) | TOTP enrollment + replay-safe `verify()` |
| [`async-config`](./examples/async-config) | `forRootAsync` with environment-based options |
| [`hotp-counter`](./examples/hotp-counter) | Counter-based HOTP generate and verify |

Each example depends on the local package (`"nestjs-xotp": "file:../.."`), so run `npm run build` at the repo root before `npm install` inside an example.

### Run with Docker Compose (optional)

Requires [Docker](https://docs.docker.com/get-docker/). No local `npm install` or `npm run build` is needed — the image builds the library and example from source.

From the repository root:

```bash
# Build and run one example (foreground)
docker compose -f examples/docker-compose.yml up 2fa-basic

# Build and run in the background
docker compose -f examples/docker-compose.yml up -d 2fa-basic

# Build images only
docker compose -f examples/docker-compose.yml build

# Stop containers
docker compose -f examples/docker-compose.yml down
```

| Service | URL | Per-example docs |
|---------|-----|------------------|
| `2fa-basic` | http://localhost:3000 | [README](./examples/2fa-basic/README.md) |
| `async-config` | http://localhost:3001 | [README](./examples/async-config/README.md) |
| `hotp-counter` | http://localhost:3002 | [README](./examples/hotp-counter/README.md) |

Run every example at once:

```bash
docker compose -f examples/docker-compose.yml up
```

npm is the primary workflow for development and copying code into your own app. See [examples/README.md](./examples/README.md) for more detail.

## Cookbook

Copy-paste patterns for common integrations. For runnable NestJS apps, see [Examples](#examples) above.

### Verify a TOTP token (replay-safe)

Prefer `verify()` over `validate()` for login 2FA. Pass each user's secret per call and persist `timeStep` after success:

```typescript
import { Injectable } from '@nestjs/common';
import { XotpTotpService } from 'nestjs-xotp';

@Injectable()
export class AuthService {
  constructor(private readonly totp: XotpTotpService) {}

  async verify(
    userSecretBase32: string,
    token: string,
    afterTimeStep?: number | null,
  ) {
    const result = await this.totp.verify({
      secret: userSecretBase32, // Base32 string is accepted in xotp v2
      token,
      afterTimeStep,
    });

    if (result.valid) {
      // Persist result.timeStep (conditional update) for the next login
    }

    return result; // { valid: true, timeStep, delta } | { valid: false }
  }
}
```

### Enroll a user (TOTP)

For enrollment, create a bound instance and export the key URI:

```typescript
const enrollment = XotpTotpService.create({
  account: 'user@example.com',
  issuer: 'MyApp',
});

const secret = enrollment.secret!.toString(); // persist (base32)
const keyUri = enrollment.toKeyUri(); // QR / authenticator setup
```

## Options

The nestjs-xotp module accepts an optional configuration object. These options mirror those available in the underlying XOTP library and apply globally to both TOTP and HOTP services. If you don't know what each one does, refer to the main [xotp options](https://github.com/farshidbeheshti/xotp?tab=readme-ov-file#totp-options)!

```json
{
  "digits": 6,
  "window": 1,
  "algorithm": "sha1",
  "duration": 30,
  "issuer": "xotp"
}
```

`window` may also be asymmetric: `{ "backward": 1, "forward": 0 }`. Convert env vars with `Number(...)` — xotp rejects string values such as `"30"`.

### Overriding Specific Options for TOTP/OTP servioces

You can set distinct options for TOTP or HOTP services individually. For instance, to change only the digit length for HOTP tokens:

```json
{
  "digits": 6,
  "hotp": {
    "digits": 4
  }
}
```

### Module registration options

These are passed to `forRoot()` / `forRootAsync()` next to the OTP options. They configure the module only and don't affect the OTP settings:

| Option | Applies to | Description |
|--------|------------|-------------|
| `global` | `forRoot`, `forRootAsync` | Register the module globally. Default `false`. |
| `extraProviders` | `forRootAsync` | Providers registered alongside the options, usable in `inject`. |

## License

`nestjs-xotp` is [MIT licensed][project-license]

[project-license]: https://github.com/farshidbeheshti/nestjs-xotp/blob/master/LICENSE
