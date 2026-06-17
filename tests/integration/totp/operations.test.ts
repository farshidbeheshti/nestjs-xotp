import { Secret } from 'xotp';
import { XOTPTOTPService } from '../../../src';
import {
  RFC6238_SECRET,
  RFC6238_SECRETS,
  RFC6238_TIMESTAMP_MS,
  RFC6238_TOTP_SHA1,
  RFC6238_TOTP_SHA256,
  RFC6238_TOTP_SHA512,
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

  it('compares tokens with equals', async () => {
    await withForRootModule(
      {
        totp: { algorithm: 'sha1', digits: 8, duration: 30 },
      },
      async (module) => {
        const totp = module.get(XOTPTOTPService);
        const secret = Secret.from(RFC6238_SECRET, 'ascii');
        const token = totp.generate({
          secret,
          timestamp: RFC6238_TIMESTAMP_MS,
        });

        expect(totp.equals({ token, secret, timestamp: RFC6238_TIMESTAMP_MS })).toBe(
          true,
        );
        expect(
          totp.equals({
            token: '00000000',
            secret,
            timestamp: RFC6238_TIMESTAMP_MS,
          }),
        ).toBe(false);
      },
    );
  });

  describe('time helpers', () => {
    it('reports timeUsed and timeRemaining from module duration', async () => {
      await withForRootModule(
        {
          totp: { algorithm: 'sha1', digits: 8, duration: 30 },
        },
        async (module) => {
          const totp = module.get(XOTPTOTPService);

          expect(totp.timeUsed({ timestamp: RFC6238_TIMESTAMP_MS })).toBe(29);
          expect(
            totp.timeRemaining({ timestamp: RFC6238_TIMESTAMP_MS }),
          ).toBe(1);
        },
      );
    });
  });

  describe('algorithms', () => {
    it.each([
      ['sha256', RFC6238_SECRETS.sha256, RFC6238_TOTP_SHA256],
      ['sha512', RFC6238_SECRETS.sha512, RFC6238_TOTP_SHA512],
    ] as const)(
      'generates RFC 6238 TOTP with %s',
      async (_algorithm, secretValue, expectedToken) => {
        await withForRootModule(
          {
            totp: { algorithm: _algorithm, digits: 8, duration: 30 },
          },
          async (module) => {
            const totp = module.get(XOTPTOTPService);
            const secret = Secret.from(secretValue, 'ascii');

            expect(
              totp.generate({ secret, timestamp: RFC6238_TIMESTAMP_MS }),
            ).toBe(expectedToken);
          },
        );
      },
    );
  });
});
