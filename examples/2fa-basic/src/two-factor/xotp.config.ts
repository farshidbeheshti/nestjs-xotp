import { XotpModuleOptions } from 'nestjs-xotp';
import { APP_ISSUER } from './two-factor.constants';

export const xotpModuleOptions: XotpModuleOptions = {
  issuer: APP_ISSUER,
  totp: {
    digits: 6,
    duration: 30,
    window: 1,
  },
};
