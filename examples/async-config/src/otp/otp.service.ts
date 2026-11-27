import { Injectable } from '@nestjs/common';
import { XotpTotpService } from 'nestjs-xotp';
import type { OTPWindow } from 'xotp';

export type OtpSettings = {
  issuer: string;
  algorithm: string;
  digits: number;
  duration: number;
  window: OTPWindow;
};

@Injectable()
export class OtpService {
  constructor(private readonly totp: XotpTotpService) {}

  getSettings(): OtpSettings {
    return {
      issuer: this.totp.issuer,
      algorithm: this.totp.algorithm,
      digits: this.totp.digits,
      duration: this.totp.duration,
      window: this.totp.window,
    };
  }

  async verify(secretBase32: string, token: string): Promise<boolean> {
    return this.totp.validate({
      secret: secretBase32,
      token,
    });
  }
}
