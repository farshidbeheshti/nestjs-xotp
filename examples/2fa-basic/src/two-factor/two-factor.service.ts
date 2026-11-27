import { Injectable, NotFoundException } from '@nestjs/common';
import { XotpTotpService } from 'nestjs-xotp';
import { APP_ISSUER } from './two-factor.constants';

type EnrollmentRecord = {
  secret: string;
  lastTimeStep: number | null;
};

export type EnrollResult = {
  account: string;
  secret: string;
  keyUri: string;
};

export type VerifyResult =
  | { valid: true; timeStep: number; delta: number }
  | { valid: false };

@Injectable()
export class TwoFactorService {
  private readonly records = new Map<string, EnrollmentRecord>();

  constructor(private readonly totp: XotpTotpService) {}

  enroll(account: string): EnrollResult {
    const enrollment = XotpTotpService.create({
      account,
      issuer: APP_ISSUER,
    });

    const secret = enrollment.secret!.toString();
    const keyUri = enrollment.toKeyUri();

    this.records.set(account, { secret, lastTimeStep: null });

    return { account, secret, keyUri };
  }

  getKeyUri(account: string): string {
    const { secret } = this.getRecord(account);
    return this.totp.toKeyUri({
      secret,
      account,
      issuer: APP_ISSUER,
    });
  }

  async verify(account: string, token: string): Promise<VerifyResult> {
    const record = this.getRecord(account);
    const result = await this.totp.verify({
      secret: record.secret,
      token,
      afterTimeStep: record.lastTimeStep,
    });

    if (result.valid) {
      // Refuse this token (and older ones) on the next successful login.
      record.lastTimeStep = result.timeStep;
    }

    return result;
  }

  private getRecord(account: string): EnrollmentRecord {
    const record = this.records.get(account);
    if (!record) {
      throw new NotFoundException(`No 2FA enrollment found for account: ${account}`);
    }
    return record;
  }
}
