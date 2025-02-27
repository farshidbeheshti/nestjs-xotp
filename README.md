<h1 align="center">nestjs-xotp</h1>

<p align="center">
  A <a href="https://github.com/nestjs/nest" rel="nofollow" >Nest</a> module wrapper for <a href="https://github.com/farshidbeheshti/xotp">XOTP</a>.
</p>

## Installation

```bash
npm i xotp nestjs-xotp
```

## Usage

Import `XOTPModule` into the root `AppModule` and use the `forRoot()` method to configure it!
See the [options](#options) section to see what options you can customize the module with!

```typescript
import { Module } from '@nestjs/common';
import { XOTPModule } from 'nestjs-xotp';

@Module({
  imports: [XOTPModule.forRoot(/* your options, if any */)],
})
export class AppModule {}
```

## Aync Config

```typescript
import { Module } from '@nestjs/common';
import { XOTPModule } from 'nestjs-xotp';

@Module({
  imports: [
    XOTPModule.forRootAsync({
      useFactory: () => ({
        // your options, if any!
      }),
    }),
  ],
})
export class AppModule {}
```

Now, you're able to inject the service, like so:

```typescript
import { Injectable } from '@nestjs/common';
import { XOTPService } from 'nestjs-xotp';

@Injectable()
export class MyService {
  constructor(private readonly xotpService: XOTPService) {}
}
```

## Example

Example #1: Generate a OTP for the user:

```typescript
getOtp(): string {
  return this.xotpService.totp.generate({
    secret: this.xotpService.secret.from('A_STRONG_SECRET_KEY'),
  });
}
```

Example #2: To authenticate, verify the otp sent by the user.

```typescript
authenticate(userOTP: string): boolean {
  return this.xotpService.totp.validate({
    token: userOTP,
    secret: this.xotpService.secret.from('your Secret Key'),
  });
}
```

Example #3: Get the keyURI from which create a QR Code from, so that could be scanned by authenticator apps like Google Authenticator!

```typescript
getKeyUri(): string {
  return this.xotpService.totp.keyUri({
    secret: this.xotpService.secret.from('A_STRONG_SECRET_KEY'),
    account: 'Nestjs-XOTP',
  });
}
```

## Options

Option is an optional object the same as original xotp [options](https://github.com/farshidbeheshti/xotp?tab=readme-ov-file#totp-options).

```javascript
{
  digits: 6,
  window: 1,
  algorithm: 'sha1',
  duration: 30,
  issuer:'xotp'
}
```

That options are applied to both TOTP and HOTP services.But you could also set more specific options for either/both of TOTP or HOTP. for example, you want to change the digit length of hotp token:

```javascript
{
  digits: 6,
  hotp: {digits: 4}
}
```

## License

`nestjs-xotp` is [MIT licensed][project-license]

[project-license]: https://github.com/farshidbeheshti/nestjs-xotp/blob/master/LICENSE
