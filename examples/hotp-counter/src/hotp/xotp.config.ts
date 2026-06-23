import { XOTPModuleOptions } from 'nestjs-xotp';
import { APP_ISSUER } from './hotp.constants';

export const xotpModuleOptions: XOTPModuleOptions = {
  issuer: APP_ISSUER,
  hotp: {
    algorithm: 'sha1',
    digits: 6,
    window: 0,
  },
};
