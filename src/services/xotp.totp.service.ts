import { Injectable, Inject } from '@nestjs/common';
import { XotpModuleOptions } from '../xotp.interfaces';
import { TOTP } from 'xotp';
import { XOTP_MODULE_OPTIONS } from '../xotp.constants';

@Injectable()
export class XotpTotpService extends TOTP {
  constructor(@Inject(XOTP_MODULE_OPTIONS) options: XotpModuleOptions) {
    super({ ...options, ...options?.totp });
  }
}
