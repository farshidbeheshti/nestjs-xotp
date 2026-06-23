import { Injectable, Module } from '@nestjs/common';
import { XOTPModuleOptions, XOTPOptionsFactory } from 'nestjs-xotp';
import { Algorithm } from 'xotp';

@Injectable()
export class OtpConfigService implements XOTPOptionsFactory {
  createXOTPModuleOptions(): XOTPModuleOptions {
    return {
      issuer: process.env.OTP_ISSUER ?? 'MyApp',
      totp: {
        algorithm: (process.env.OTP_TOTP_ALGORITHM ?? 'sha1') as Algorithm,
        digits: Number(process.env.OTP_TOTP_DIGITS ?? 6),
        duration: Number(process.env.OTP_TOTP_DURATION ?? 30),
        window: Number(process.env.OTP_TOTP_WINDOW ?? 1),
      },
    };
  }
}

@Module({
  providers: [OtpConfigService],
  exports: [OtpConfigService],
})
export class OtpConfigModule {}
