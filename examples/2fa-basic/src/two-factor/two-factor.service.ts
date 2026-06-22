import { Injectable, NotFoundException } from '@nestjs/common';
import { XOTPTOTPService } from 'nestjs-xotp';
import { Secret } from 'xotp';
import { APP_ISSUER } from './two-factor.constants';

export type EnrollResult = {
  account: string;
  secret: string;
  keyUri: string;
};

@Injectable()
export class TwoFactorService {
  private readonly secrets = new Map<string, string>();

  constructor(private readonly totp: XOTPTOTPService) {}

  enroll(account: string): EnrollResult {
    const enrollment = XOTPTOTPService.create({
      account,
      issuer: APP_ISSUER,
    });

    const secret = enrollment.secret!.toString();
    const keyUri = enrollment.toKeyUri();

    this.secrets.set(account, secret);

    return { account, secret, keyUri };
  }

  getKeyUri(account: string): string {
    const secret = this.getStoredSecret(account);
    return this.totp.toKeyUri({
      secret: Secret.from(secret, 'base32'),
      account,
      issuer: APP_ISSUER,
    });
  }

  verify(account: string, token: string): boolean {
    const secret = this.getStoredSecret(account);
    return this.totp.validate({
      secret: Secret.from(secret, 'base32'),
      token,
    });
  }

  private getStoredSecret(account: string): string {
    const secret = this.secrets.get(account);
    if (!secret) {
      throw new NotFoundException(`No 2FA enrollment found for account: ${account}`);
    }
    return secret;
  }
}
