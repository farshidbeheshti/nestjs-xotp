import { Injectable, Inject } from '@nestjs/common';
import { XOTPModuleOptions } from '../xotp.interfaces';
import { TOTP } from 'xotp';
import { XOTP_MODULE_OPTIONS } from '../xotp.constants';

@Injectable()
export class XOTPTOTPService extends TOTP {
  constructor(@Inject(XOTP_MODULE_OPTIONS) options: XOTPModuleOptions) {
    super({ ...options, ...options?.totp });
  }
}
