import { Secret } from 'xotp';
import { XotpHotpService } from '../../../src';
import {
  RFC4226_HOTP_COUNTER_0,
  RFC4226_SECRET,
} from '../../fixtures/rfc-secrets';
import { withForRootModule } from '../../support/xotp-testing-module';

describe('XotpHotpService operations', () => {
  it('validates generated HOTP tokens', async () => {
    await withForRootModule(
      {
        hotp: { algorithm: 'sha1', digits: 6 },
      },
      async (module) => {
        const hotp = module.get(XotpHotpService);
        const secret = Secret.from(RFC4226_SECRET, 'ascii');
        const token = await hotp.generate({ secret, counter: 0 });

        expect(token).toBe(RFC4226_HOTP_COUNTER_0);
        expect(await hotp.validate({ token, secret, counter: 0 })).toBe(true);
      },
    );
  });

  it('finds token drift with compare using module window', async () => {
    await withForRootModule(
      {
        hotp: { algorithm: 'sha1', digits: 6, window: 1 },
      },
      async (module) => {
        const hotp = module.get(XotpHotpService);
        const secret = Secret.from(RFC4226_SECRET, 'ascii');
        const token = await hotp.generate({ secret, counter: 1 });

        expect(
          await hotp.compare({
            token,
            secret,
            counter: 0,
          }),
        ).toBe(1);
      },
    );
  });

  it('does not accept earlier counters with a numeric HOTP window', async () => {
    await withForRootModule(
      {
        hotp: { algorithm: 'sha1', digits: 6, window: 1 },
      },
      async (module) => {
        const hotp = module.get(XotpHotpService);
        const secret = Secret.from(RFC4226_SECRET, 'ascii');
        const token = await hotp.generate({ secret, counter: 0 });

        expect(
          await hotp.compare({
            token,
            secret,
            counter: 1,
          }),
        ).toBeNull();
      },
    );
  });

  it('compares tokens with equals', async () => {
    await withForRootModule(
      {
        hotp: { algorithm: 'sha1', digits: 6 },
      },
      async (module) => {
        const hotp = module.get(XotpHotpService);
        const secret = Secret.from(RFC4226_SECRET, 'ascii');
        const token = await hotp.generate({ secret, counter: 0 });

        expect(await hotp.equals({ token, secret, counter: 0 })).toBe(true);
        expect(
          await hotp.equals({ token: '000000', secret, counter: 0 }),
        ).toBe(false);
      },
    );
  });
});
