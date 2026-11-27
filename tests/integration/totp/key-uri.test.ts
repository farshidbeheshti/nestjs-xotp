import { Secret } from 'xotp';
import { XotpTotpService } from '../../../src';
import {
  RFC6238_SECRET,
  RFC6238_TIMESTAMP_MS,
} from '../../fixtures/rfc-secrets';
import { withForRootModule } from '../../support/xotp-testing-module';

describe('XotpTotpService key URI', () => {
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
        const totp = module.get(XotpTotpService);
        const uri = totp.toKeyUri();
        const imported = XotpTotpService.fromKeyUri(uri);

        expect(imported.secret).toEqual(secret);
        expect(imported.account).toBe('user@example.com');
        expect(imported.issuer).toBe('TestIssuer');
        expect(
          await imported.generate({ timestamp: RFC6238_TIMESTAMP_MS }),
        ).toBe(await totp.generate({ timestamp: RFC6238_TIMESTAMP_MS }));
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
        const totp = module.get(XotpTotpService);
        const imported = XotpTotpService.fromKeyUri(
          totp.toKeyUri({ account: 'user@example.com' }),
        );
        const token = await imported.generate({
          timestamp: RFC6238_TIMESTAMP_MS,
        });

        expect(
          await imported.validate({ token, timestamp: RFC6238_TIMESTAMP_MS }),
        ).toBe(true);
      },
    );
  });

  it('keeps deprecated keyUri aligned with toKeyUri', async () => {
    const secret = Secret.from(RFC6238_SECRET, 'ascii');

    await withForRootModule(
      {
        secret,
        account: 'user@example.com',
        issuer: 'TestIssuer',
        totp: { algorithm: 'sha1', digits: 8, duration: 30 },
      },
      async (module) => {
        const totp = module.get(XotpTotpService);

        expect(totp.keyUri()).toBe(totp.toKeyUri());
      },
    );
  });
});
