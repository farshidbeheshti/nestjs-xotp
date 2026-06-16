import { Secret } from 'xotp';
import { XOTPHOTPService } from '../../../src';
import {
  RFC4226_HOTP_COUNTER_0,
  RFC4226_SECRET,
} from '../../fixtures/rfc-secrets';
import { withForRootModule } from '../../support/xotp-testing-module';

describe('XOTPHOTPService operations', () => {
  it('validates generated HOTP tokens', async () => {
    await withForRootModule(
      {
        hotp: { algorithm: 'sha1', digits: 6 },
      },
      async (module) => {
        const hotp = module.get(XOTPHOTPService);
        const secret = Secret.from(RFC4226_SECRET, 'ascii');
        const token = hotp.generate({ secret, counter: 0 });

        expect(token).toBe(RFC4226_HOTP_COUNTER_0);
        expect(hotp.validate({ token, secret, counter: 0 })).toBe(true);
      },
    );
  });

  it('finds token drift with compare using module window', async () => {
    await withForRootModule(
      {
        hotp: { algorithm: 'sha1', digits: 6, window: 1 },
      },
      async (module) => {
        const hotp = module.get(XOTPHOTPService);
        const secret = Secret.from(RFC4226_SECRET, 'ascii');
        const token = hotp.generate({ secret, counter: 1 });

        expect(
          hotp.compare({
            token,
            secret,
            counter: 0,
          }),
        ).toBe(1);
      },
    );
  });

  it('compares tokens with equals', async () => {
    await withForRootModule(
      {
        hotp: { algorithm: 'sha1', digits: 6 },
      },
      async (module) => {
        const hotp = module.get(XOTPHOTPService);
        const secret = Secret.from(RFC4226_SECRET, 'ascii');
        const token = hotp.generate({ secret, counter: 0 });

        expect(hotp.equals({ token, secret, counter: 0 })).toBe(true);
        expect(hotp.equals({ token: '000000', secret, counter: 0 })).toBe(false);
      },
    );
  });
});
