import { XotpModuleOptions } from 'nestjs-xotp';
import { APP_ISSUER } from './hotp.constants';

export const xotpModuleOptions: XotpModuleOptions = {
  issuer: APP_ISSUER,
  hotp: {
    algorithm: 'sha1',
    digits: 6,
    window: 0,
  },
};
