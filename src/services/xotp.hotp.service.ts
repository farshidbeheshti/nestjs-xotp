import { Injectable, Inject } from '@nestjs/common';
import { XOTPModuleOptions } from '../xotp.interfaces';
import { HOTP } from 'xotp';
import { XOTP_MODULE_OPTIONS } from '../xotp.constants';

@Injectable()
export class XOTPHOTPService extends HOTP {
  constructor(@Inject(XOTP_MODULE_OPTIONS) options: XOTPModuleOptions) {
    super({ ...options, ...options?.hotp });
  }
}
