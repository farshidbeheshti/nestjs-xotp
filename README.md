<h1 style="text-align:center" >nestjs-xotp</h1>

<p align="center">
  A <a href="https://github.com/nestjs/nest" rel="nofollow" >Nest</a> module wrapper for <a href="https://github.com/farshidbeheshti/xotp">XOTP</a>.
</p>

> [!CAUTION]
> This repo is not yet fully production-ready, so I recommend not using it in a production environment.

## Installation

Clone the nestjs-xotp repository to your desired local path and afterward navigate to your target project into where you're going install nestjs-xotp, then:

```bash
npm install LOCAL_NESTJS_XOTP_REPOSITORY_PATH
```

`LOCAL_NESTJS_XOTP_REPOSITORY_PATH` Is your local cloned repository of nestjs-xotp

## Usage

Import `XOTPModule` into the root `AppModule` and use the `forRoot()` method to configure it!
If you'd lile to config the module, see the [options](#options) section:

```typescript
import { Module } from '@nestjs/common';
import { XOTPModule } from 'nestjs-xotp';

@Module({
  imports: [XOTPModule.forRoot(/* options, if any */)],
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
        // options, if any!
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

Example #1: Generate a OTP for user:

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
getKeyUri(userOTP: string): string {
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

That options are applied to both TOTP and HOTP services.But you could also setmore specific options for either/both of TOTP or HOTP. for example, you want to change the digit length of hotp token

```javascript
{
  digit: 6,
  hotp: {digit: 4}
}

## License

`XOTP` is [MIT licensed][project-license]
```
