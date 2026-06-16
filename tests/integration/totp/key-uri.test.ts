import { Secret } from 'xotp';
import { XOTPTOTPService } from '../../../src';
import {
  RFC6238_SECRET,
  RFC6238_TIMESTAMP_MS,
} from '../../fixtures/rfc-secrets';
import { withForRootModule } from '../../support/xotp-testing-module';

describe('XOTPTOTPService key URI', () => {
  it('round-trips toKeyUri and fromKeyUri through injected service', async () => {
    const secret = Secret.from(RFC6238_SECRET, 'ascii');

    await withForRootModule(
      {
        secret,
        account: 'user@example.com',
        issuer: 'TestIssuer',
        totp: { algorithm: 'sha1', digits: 8, duration: 30 },
      },
      async (module) => {
        const totp = module.get(XOTPTOTPService);
        const uri = totp.toKeyUri();
        const imported = XOTPTOTPService.fromKeyUri(uri);

        expect(imported.secret).toEqual(secret);
        expect(imported.account).toBe('user@example.com');
        expect(imported.issuer).toBe('TestIssuer');
        expect(imported.generate({ timestamp: RFC6238_TIMESTAMP_MS })).toBe(
          totp.generate({ timestamp: RFC6238_TIMESTAMP_MS }),
        );
      },
    );
  });

  it('validates tokens from fromKeyUri without passing secret per call', async () => {
    const secret = Secret.from(RFC6238_SECRET, 'ascii');

    await withForRootModule(
      {
        secret,
        account: 'user@example.com',
        totp: { algorithm: 'sha1', digits: 8, duration: 30 },
      },
      async (module) => {
        const totp = module.get(XOTPTOTPService);
        const imported = XOTPTOTPService.fromKeyUri(
          totp.toKeyUri({ account: 'user@example.com' }),
        );
        const token = imported.generate({ timestamp: RFC6238_TIMESTAMP_MS });

        expect(imported.validate({ token, timestamp: RFC6238_TIMESTAMP_MS })).toBe(
          true,
        );
      },
    );
  });
});
