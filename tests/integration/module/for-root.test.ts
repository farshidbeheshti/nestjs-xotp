import { Secret, URI } from 'xotp';
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

  describe('defaults', () => {
    it('uses xotp defaults when no options are passed', async () => {
      await withForRootModule(undefined, async (module) => {
        const totp = module.get(XOTPTOTPService);
        const hotp = module.get(XOTPHOTPService);
        const secret = Secret.from(RFC6238_SECRET, 'ascii');
        const token = totp.generate({
          secret,
          timestamp: RFC6238_TIMESTAMP_MS,
        });

        expect(totp.algorithm).toBe('sha1');
        expect(totp.digits).toBe(6);
        expect(totp.duration).toBe(30);
        expect(totp.window).toBe(1);
        expect(hotp.algorithm).toBe('sha1');
        expect(hotp.digits).toBe(6);
        expect(hotp.counter).toBe(0);
        expect(hotp.window).toBe(1);
        expect(totp.validate({ token, secret, timestamp: RFC6238_TIMESTAMP_MS })).toBe(
          true,
        );
      });
    });
  });

  describe('top-level module options', () => {
    it('applies top-level issuer and account in toKeyUri', async () => {
      const secret = Secret.from(RFC6238_SECRET, 'ascii');

      await withForRootModule(
        {
          secret,
          issuer: 'MyIssuer',
          account: 'user@example.com',
          totp: { algorithm: 'sha1', digits: 8, duration: 30 },
        },
        async (module) => {
          const totp = module.get(XOTPTOTPService);
          const parsed = URI.parse(totp.toKeyUri());

          expect(parsed.type).toBe('totp');
          expect(parsed.issuer).toBe('MyIssuer');
          expect(parsed.account).toBe('user@example.com');
        },
      );
    });

    it('uses top-level counter as HOTP default', async () => {
      await withForRootModule(
        {
          counter: 1,
          hotp: { algorithm: 'sha1', digits: 6 },
        },
        async (module) => {
          const hotp = module.get(XOTPHOTPService);
          const secret = Secret.from(RFC4226_SECRET, 'ascii');

          expect(hotp.counter).toBe(1);
          expect(hotp.generate({ secret, counter: hotp.counter })).toBe(
            RFC4226_HOTP_COUNTER_1,
          );
        },
      );
    });

    it('uses top-level window for TOTP compare', async () => {
      await withForRootModule(
        {
          window: 1,
          totp: { algorithm: 'sha1', digits: 8, duration: 30 },
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

    it('shares top-level secret between TOTP and HOTP', async () => {
      const secret = Secret.from(RFC4226_SECRET, 'ascii');

      await withForRootModule(
        {
          secret,
          totp: { algorithm: 'sha1', digits: 8, duration: 30 },
          hotp: { algorithm: 'sha1', digits: 6 },
        },
        async (module) => {
          const { totp, hotp } = module.get(XOTPService);

          expect(totp.secret).toEqual(secret);
          expect(hotp.secret).toEqual(secret);
          expect(totp.generate({ timestamp: RFC6238_TIMESTAMP_MS })).toBe(
            RFC6238_TOTP_SHA1,
          );
          expect(hotp.generate({ counter: 0 })).toBe(RFC4226_HOTP_COUNTER_0);
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

    it('supports generateSecret on HOTP', async () => {
      await withForRootModule(
        {
          generateSecret: true,
          account: 'user@example.com',
          hotp: { algorithm: 'sha1', digits: 6 },
        },
        async (module) => {
          const hotp = module.get(XOTPHOTPService);

          expect(hotp.secret).toBeDefined();
          expect(typeof hotp.generate()).toBe('string');
        },
      );
    });
  });
});
