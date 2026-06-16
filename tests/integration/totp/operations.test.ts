import { Secret } from 'xotp';
import { XOTPTOTPService } from '../../../src';
import {
  RFC6238_SECRET,
  RFC6238_TIMESTAMP_MS,
  RFC6238_TOTP_SHA1,
} from '../../fixtures/rfc-secrets';
import { withForRootModule } from '../../support/xotp-testing-module';

describe('XOTPTOTPService operations', () => {
  it('finds token drift with compare using module window', async () => {
    await withForRootModule(
      {
        totp: {
          algorithm: 'sha1',
          digits: 8,
          duration: 30,
          window: 1,
        },
      },
      async (module) => {
        const totp = module.get(XOTPTOTPService);
        const secret = Secret.from(RFC6238_SECRET, 'ascii');
        const token = totp.generate({
          secret,
          timestamp: RFC6238_TIMESTAMP_MS + 30 * 1000,
        });

        expect(
          totp.compare({
            token,
            secret,
            timestamp: RFC6238_TIMESTAMP_MS,
          }),
        ).toBe(1);
      },
    );
  });

  it('validates token at exact counter with zero drift', async () => {
    await withForRootModule(
      {
        totp: { algorithm: 'sha1', digits: 8, duration: 30, window: 1 },
      },
      async (module) => {
        const totp = module.get(XOTPTOTPService);
        const secret = Secret.from(RFC6238_SECRET, 'ascii');
        const token = totp.generate({
          secret,
          timestamp: RFC6238_TIMESTAMP_MS,
        });

        expect(token).toBe(RFC6238_TOTP_SHA1);
        expect(
          totp.compare({
            token,
            secret,
            timestamp: RFC6238_TIMESTAMP_MS,
          }),
        ).toBe(0);
      },
    );
  });
});
