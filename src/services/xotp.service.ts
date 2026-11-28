import { Injectable } from '@nestjs/common';
import { XotpTotpService } from './xotp.totp.service';
import { XotpHotpService } from './xotp.hotp.service';

import { Secret, URI } from 'xotp';

@Injectable()
export class XotpService {
  totp: XotpTotpService;
  hotp: XotpHotpService;
  secret: typeof Secret;
  uri: typeof URI;
  constructor(
    public readonly xotpTotpService: XotpTotpService,
    public readonly xotpHotpService: XotpHotpService,
  ) {
    this.totp = xotpTotpService;
    this.hotp = xotpHotpService;
    this.secret = Secret;
    this.uri = URI;
  }
}
