import { XOTPModuleOptions } from 'nestjs-xotp';
import { APP_ISSUER } from './two-factor.constants';

export const xotpModuleOptions: XOTPModuleOptions = {
  issuer: APP_ISSUER,
  totp: {
    digits: 6,
    duration: 30,
    window: 1,
  },
};
