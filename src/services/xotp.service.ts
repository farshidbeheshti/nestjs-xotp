import { Injectable, Inject } from '@nestjs/common';

import { XOTPModuleOptions } from '../xotp.interfaces';

import { XOTP_MODULE_OPTIONS } from '../xotp.constants';
import { XOTPTOTPService } from './xotp.totp.service';
import { XOTPHOTPService } from './xotp.hotp.service';

import { HOTP, TOTP, Secret } from 'xotp';

@Injectable()
export class XOTPService {
  totp: TOTP;
  hotp: HOTP;
  secret: typeof Secret;
  constructor(
    @Inject(XOTP_MODULE_OPTIONS) options: XOTPModuleOptions,
    public readonly xotpTotpService: XOTPTOTPService,
    public readonly xotpHotpService: XOTPHOTPService,
  ) {
    this.totp = xotpTotpService;
    this.hotp = xotpHotpService;
    this.secret = Secret;
  }
}
