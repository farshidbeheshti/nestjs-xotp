import { Secret } from 'xotp';
import { XOTPSecret, XOTPService } from '../../../src';
import { RFC6238_SECRET } from '../../fixtures/rfc-secrets';
import { withForRootModule } from '../../support/xotp-testing-module';

describe('XOTPSecret', () => {
  it('extends Secret for direct package use', () => {
    const secret = new XOTPSecret({ algorithm: 'sha1' });

    expect(secret).toBeInstanceOf(Secret);
    expect(secret).toBeInstanceOf(XOTPSecret);
    expect(secret.toString('base32')).toBeTruthy();
  });

  it('parses secrets the same way as xotp Secret', () => {
    const fromXotp = Secret.from(RFC6238_SECRET, 'ascii');
    const fromWrapper = XOTPSecret.from(RFC6238_SECRET, 'ascii');

    expect(fromWrapper.toString('ascii')).toBe(fromXotp.toString('ascii'));
  });

  it('is not exposed through XOTPService (use Secret from xotp)', async () => {
    await withForRootModule(undefined, async (module) => {
      const xotpService = module.get(XOTPService);

      expect(xotpService.secret).toBe(Secret);
      expect(xotpService.secret).not.toBe(XOTPSecret);
    });
  });
});
