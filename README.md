<h1 align="center">nestjs-xotp</h1>

<p align="center">
  <a href="https://github.com/farshidbeheshti/xotp" ><img src="https://github.com/user-attachments/assets/8ef372d6-3cd7-4202-88b2-519f45f67160" width="180" alt="XOTP Logo" /></a>
  <img src="https://github.com/user-attachments/assets/eb24514f-2298-46c5-bc70-ec69481c8a2c" width="120" alt="plus"  />
  <a href="https://github.com/nestjs/nest"><img src="https://github.com/user-attachments/assets/b9848d88-74a6-4ded-9ba8-54769cf12330" width="190" alt="NestJS Logo" /></a>
</p>

<p align="center">
  A <a href="https://github.com/nestjs/nest" rel="nofollow" >Nest</a> module wrapper for <a href="https://github.com/farshidbeheshti/xotp">XOTP</a>.
</p>

## Overview

`nestjs-xotp` provides a convenient way to use the XOTP library within your NestJS applications. It fully leverages NestJS's powerful dependency injection system, making it easy to manage, generate, and validate OTPs (Time-based One-Time Passwords - TOTP, and HMAC-based One-Time Passwords - HOTP) for robust security within your services.

## Installation

```bash
npm i xotp nestjs-xotp
```

## Usage

Integrate `XOTPModule` into your NestJS application by importing it into your `AppModule` and configuring it using the `forRoot()` method.
See the [options reference section](#options) for the options with which you can customize the module!

```typescript
import { Module } from '@nestjs/common';
import { XOTPModule } from 'nestjs-xotp';

@Module({
  imports: [
    XOTPModule.forRoot({
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
import { XOTPModule } from 'nestjs-xotp';

@Module({
  imports: [
    XOTPModule.forRootAsync({
      useFactory: () => ({
        // Your XOTP configuration options, dynamically provided
      }),
    }),
  ],
})
export class AppModule {}
```

Once `XOTPModule` is configured, you can easily inject XOTPService into any of your NestJS services or controllers:

```typescript
import { Injectable } from '@nestjs/common';
import { XOTPService } from 'nestjs-xotp';

@Injectable()
export class MyService {
  constructor(private readonly xotpService: XOTPService) {}
}
```

## Examples

Here are some common ways to use the XOTPService for OTP operations:

### Generating a TOTP

Create a new Time-based One-Time Password:

```typescript
getOtp(): string {
  return this.xotpService.totp.generate({
    secret: this.xotpService.secret.from('A_STRONG_SECRET_KEY'),
  });
}
```

### Verifying a TOTP

Validate an OTP provided by a user:

```typescript
authenticate(userOTP: string): boolean {
  return this.xotpService.totp.validate({
    token: userOTP,
    secret: this.xotpService.secret.from('YOUR_SECRET_KEY'),
  });
}
```

### Generating a Key URI

Get the keyURI from which create a QR Code. Users can then scan the QR Code by authenticator apps like Google Authenticator!

```typescript
getKeyUri(): string {
  return this.xotpService.totp.keyUri({
    secret: this.xotpService.secret.from('A_STRONG_SECRET_KEY'),
    account: 'Nestjs-XOTP',
  });
}
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

## License

`nestjs-xotp` is [MIT licensed][project-license]

[project-license]: https://github.com/farshidbeheshti/nestjs-xotp/blob/master/LICENSE
