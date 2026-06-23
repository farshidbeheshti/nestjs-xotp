import { Injectable, NotFoundException } from '@nestjs/common';
import { XOTPHOTPService } from 'nestjs-xotp';
import { Secret } from 'xotp';
import { APP_ISSUER } from './hotp.constants';

type HotpRecord = {
  secret: string;
  counter: number;
};

export type EnrollResult = {
  account: string;
  secret: string;
  keyUri: string;
  counter: number;
};

export type VerifyResult = {
  valid: boolean;
  counter: number;
};

@Injectable()
export class HotpService {
  private readonly records = new Map<string, HotpRecord>();

  constructor(private readonly hotp: XOTPHOTPService) {}

  enroll(account: string): EnrollResult {
    const enrollment = XOTPHOTPService.create({
      account,
      issuer: APP_ISSUER,
    });

    const secret = enrollment.secret!.toString();
    const keyUri = enrollment.toKeyUri();
    const counter = 0;

    this.records.set(account, { secret, counter });

    return { account, secret, keyUri, counter };
  }

  getCounter(account: string): number {
    return this.getRecord(account).counter;
  }

  verify(account: string, token: string): VerifyResult {
    const record = this.getRecord(account);
    const secret = Secret.from(record.secret, 'base32');
    const valid = this.hotp.validate({
      secret,
      token,
      counter: record.counter,
    });

    if (valid) {
      record.counter += 1;
    }

    return { valid, counter: record.counter };
  }

  private getRecord(account: string): HotpRecord {
    const record = this.records.get(account);
    if (!record) {
      throw new NotFoundException(`No HOTP enrollment found for account: ${account}`);
    }
    return record;
  }
}
