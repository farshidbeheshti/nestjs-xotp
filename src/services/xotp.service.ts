import { Injectable } from '@nestjs/common';
import { XOTPTOTPService } from './xotp.totp.service';
import { XOTPHOTPService } from './xotp.hotp.service';

import { HOTP, TOTP, Secret } from 'xotp';

@Injectable()
export class XOTPService {
  totp: XOTPTOTPService;
  hotp: XOTPHOTPService;
  secret: typeof Secret;
  constructor(
    public readonly xotpTotpService: XOTPTOTPService,
    public readonly xotpHotpService: XOTPHOTPService,
  ) {
    this.totp = xotpTotpService;
    this.hotp = xotpHotpService;
    this.secret = Secret;
  }
}
