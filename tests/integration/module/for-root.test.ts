import { Secret } from 'xotp';
import {
  XOTPService,
  XOTPHOTPService,
  XOTPTOTPService,
} from '../../../src';
import {
  RFC4226_HOTP_COUNTER_0,
  RFC4226_HOTP_COUNTER_1,
  RFC4226_SECRET,
  RFC6238_SECRET,
  RFC6238_TIMESTAMP_MS,
  RFC6238_TOTP_SHA1,
} from '../../fixtures/rfc-secrets';
import {
  compileForRootModule,
  withForRootModule,
} from '../../support/xotp-testing-module';

describe('XOTPModule.forRoot', () => {
  describe('dependency injection', () => {
    let module: Awaited<ReturnType<typeof compileForRootModule>>;

    beforeEach(async () => {
      module = await compileForRootModule({
        totp: { algorithm: 'sha1', digits: 8, duration: 30 },
        hotp: { algorithm: 'sha1', digits: 6 },
      });
    });

    afterEach(async () => {
      await module.close();
    });

    it('provides XOTPService with injectable TOTP and HOTP services', () => {
      const xotpService = module.get(XOTPService);

      expect(xotpService.totp).toBeInstanceOf(XOTPTOTPService);
      expect(xotpService.hotp).toBeInstanceOf(XOTPHOTPService);
      expect(xotpService.secret).toBe(Secret);
      expect(module.get(XOTPTOTPService)).toBe(xotpService.totp);
      expect(module.get(XOTPHOTPService)).toBe(xotpService.hotp);
    });
  });

  describe('server mode', () => {
    it('generates and validates TOTP using module options', async () => {
      await withForRootModule(
        {
          totp: { algorithm: 'sha1', digits: 8, duration: 30 },
          hotp: { algorithm: 'sha1', digits: 6 },
        },
        async (module) => {
          const { totp } = module.get(XOTPService);
          const secret = Secret.from(RFC6238_SECRET, 'ascii');
          const token = totp.generate({
            secret,
            timestamp: RFC6238_TIMESTAMP_MS,
          });

          expect(token).toBe(RFC6238_TOTP_SHA1);
          expect(
            totp.validate({ token, secret, timestamp: RFC6238_TIMESTAMP_MS }),
          ).toBe(true);
        },
      );
    });

    it('generates HOTP using module options', async () => {
      await withForRootModule(
        {
          hotp: { algorithm: 'sha1', digits: 6 },
        },
        async (module) => {
          const { hotp } = module.get(XOTPService);
          const secret = Secret.from(RFC4226_SECRET, 'ascii');

          expect(hotp.generate({ secret, counter: 0 })).toBe(
            RFC4226_HOTP_COUNTER_0,
          );
          expect(hotp.generate({ secret, counter: 1 })).toBe(
            RFC4226_HOTP_COUNTER_1,
          );
        },
      );
    });
  });

  describe('instance secret', () => {
    it('supports generateSecret on TOTP', async () => {
      await withForRootModule(
        {
          generateSecret: true,
          account: 'user@example.com',
          totp: { algorithm: 'sha1', digits: 6, duration: 30 },
        },
        async (module) => {
          const totp = module.get(XOTPTOTPService);

          expect(totp.secret).toBeDefined();
          expect(typeof totp.generate()).toBe('string');
        },
      );
    });

    it('uses explicit bound secret from module options', async () => {
      const secret = Secret.from(RFC6238_SECRET, 'ascii');

      await withForRootModule(
        {
          secret,
          totp: { algorithm: 'sha1', digits: 8, duration: 30 },
        },
        async (module) => {
          const totp = module.get(XOTPTOTPService);

          expect(totp.secret).toEqual(secret);

          const token = totp.generate({ timestamp: RFC6238_TIMESTAMP_MS });

          expect(token).toBe(RFC6238_TOTP_SHA1);
          expect(
            totp.validate({ token, timestamp: RFC6238_TIMESTAMP_MS }),
          ).toBe(true);
        },
      );
    });
  });
});
