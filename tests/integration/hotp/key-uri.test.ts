import { Secret } from 'xotp';
import { XOTPHOTPService } from '../../../src';
import { RFC4226_SECRET } from '../../fixtures/rfc-secrets';
import { withForRootModule } from '../../support/xotp-testing-module';

describe('XOTPHOTPService key URI', () => {
  it('round-trips toKeyUri and fromKeyUri through injected service', async () => {
    const secret = Secret.from(RFC4226_SECRET, 'ascii');

    await withForRootModule(
      {
        secret,
        account: 'user@example.com',
        issuer: 'TestIssuer',
        hotp: { algorithm: 'sha1', digits: 6, counter: 4 },
      },
      async (module) => {
        const hotp = module.get(XOTPHOTPService);
        const uri = hotp.toKeyUri();
        const imported = XOTPHOTPService.fromKeyUri(uri);

        expect(imported.secret).toEqual(secret);
        expect(imported.account).toBe('user@example.com');
        expect(imported.issuer).toBe('TestIssuer');
        expect(imported.generate({ counter: 4 })).toBe(hotp.generate({ counter: 4 }));
      },
    );
  });
});
