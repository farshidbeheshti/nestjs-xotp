import { Injectable, Inject } from '@nestjs/common';
import { XotpModuleOptions } from '../xotp.interfaces';
import { HOTP } from 'xotp';
import { XOTP_MODULE_OPTIONS } from '../xotp.constants';

@Injectable()
export class XotpHotpService extends HOTP {
  constructor(@Inject(XOTP_MODULE_OPTIONS) options: XotpModuleOptions) {
    super({ ...options, ...options?.hotp });
  }
}
