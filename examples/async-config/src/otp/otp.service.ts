import { Injectable } from '@nestjs/common';
import { XOTPTOTPService } from 'nestjs-xotp';
import { Secret } from 'xotp';

export type OtpSettings = {
  issuer: string;
  algorithm: string;
  digits: number;
  duration: number;
  window: number;
};

@Injectable()
export class OtpService {
  constructor(private readonly totp: XOTPTOTPService) {}

  getSettings(): OtpSettings {
    return {
      issuer: this.totp.issuer,
      algorithm: this.totp.algorithm,
      digits: this.totp.digits,
      duration: this.totp.duration,
      window: this.totp.window,
    };
  }

  verify(secretBase32: string, token: string): boolean {
    return this.totp.validate({
      secret: Secret.from(secretBase32, 'base32'),
      token,
    });
  }
}
