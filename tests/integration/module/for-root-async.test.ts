import { Injectable, Module } from '@nestjs/common';
import { Secret } from 'xotp';
import {
  XOTPOptionsFactory,
  XOTPService,
  XOTPHOTPService,
  XOTPTOTPService,
} from '../../../src';
import {
  RFC4226_HOTP_COUNTER_0,
  RFC4226_SECRET,
  RFC6238_SECRET,
  RFC6238_TIMESTAMP_MS,
  RFC6238_TOTP_SHA1,
} from '../../fixtures/rfc-secrets';
import { withForRootAsyncModule } from '../../support/xotp-testing-module';

@Injectable()
class ConfigService {
  readonly totpDigits = 8;
}

describe('XOTPModule.forRootAsync', () => {
  it('loads options from useFactory', async () => {
    await withForRootAsyncModule(
      {
        useFactory: () => ({
          totp: { algorithm: 'sha1', digits: 8, duration: 30 },
        }),
      },
      async (module) => {
        const totp = module.get(XOTPTOTPService);
        const secret = Secret.from(RFC6238_SECRET, 'ascii');

        expect(totp.generate({ secret, timestamp: RFC6238_TIMESTAMP_MS })).toBe(
          RFC6238_TOTP_SHA1,
        );
      },
    );
  });

  it('loads options from useExisting factory', async () => {
    @Injectable()
    class TestOptionsFactory implements XOTPOptionsFactory {
      createXOTPModuleOptions() {
        return {
          hotp: { algorithm: 'sha1', digits: 6 },
        };
      }
    }

    @Module({
      providers: [TestOptionsFactory],
      exports: [TestOptionsFactory],
    })
    class TestConfigModule {}

    await withForRootAsyncModule(
      {
        imports: [TestConfigModule],
        useExisting: TestOptionsFactory,
      },
      async (module) => {
        const hotp = module.get(XOTPHOTPService);
        const secret = Secret.from(RFC4226_SECRET, 'ascii');

        expect(hotp.generate({ secret, counter: 0 })).toBe(
          RFC4226_HOTP_COUNTER_0,
        );
      },
    );
  });

  it('loads options from useClass factory', async () => {
    @Injectable()
    class TestOptionsFactory implements XOTPOptionsFactory {
      createXOTPModuleOptions() {
        return {
          totp: { algorithm: 'sha1', digits: 8, duration: 30 },
        };
      }
    }

    await withForRootAsyncModule(
      {
        useClass: TestOptionsFactory,
      },
      async (module) => {
        const totp = module.get(XOTPTOTPService);
        const secret = Secret.from(RFC6238_SECRET, 'ascii');

        expect(totp.generate({ secret, timestamp: RFC6238_TIMESTAMP_MS })).toBe(
          RFC6238_TOTP_SHA1,
        );
      },
    );
  });

  it('loads options from useFactory with inject', async () => {
    @Module({
      providers: [ConfigService],
      exports: [ConfigService],
    })
    class ConfigModule {}

    await withForRootAsyncModule(
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          totp: {
            algorithm: 'sha1',
            digits: config.totpDigits,
            duration: 30,
          },
        }),
      },
      async (module) => {
        const totp = module.get(XOTPTOTPService);
        const secret = Secret.from(RFC6238_SECRET, 'ascii');

        expect(totp.digits).toBe(8);
        expect(totp.generate({ secret, timestamp: RFC6238_TIMESTAMP_MS })).toBe(
          RFC6238_TOTP_SHA1,
        );
      },
    );
  });

  it('loads options from async useFactory', async () => {
    await withForRootAsyncModule(
      {
        useFactory: async () => {
          await Promise.resolve();
          return {
            totp: { algorithm: 'sha1', digits: 8, duration: 30 },
          };
        },
      },
      async (module) => {
        const totp = module.get(XOTPTOTPService);
        const secret = Secret.from(RFC6238_SECRET, 'ascii');

        expect(totp.generate({ secret, timestamp: RFC6238_TIMESTAMP_MS })).toBe(
          RFC6238_TOTP_SHA1,
        );
      },
    );
  });

  it('loads options from async factory class', async () => {
    @Injectable()
    class AsyncOptionsFactory implements XOTPOptionsFactory {
      async createXOTPModuleOptions() {
        await Promise.resolve();
        return {
          hotp: { algorithm: 'sha1', digits: 6 },
        };
      }
    }

    await withForRootAsyncModule(
      {
        useClass: AsyncOptionsFactory,
      },
      async (module) => {
        const hotp = module.get(XOTPHOTPService);
        const secret = Secret.from(RFC4226_SECRET, 'ascii');

        expect(hotp.generate({ secret, counter: 0 })).toBe(
          RFC4226_HOTP_COUNTER_0,
        );
      },
    );
  });

  it('applies nested totp and hotp overrides independently', async () => {
    await withForRootAsyncModule(
      {
        useFactory: () => ({
          algorithm: 'sha512',
          totp: { algorithm: 'sha1', digits: 8, duration: 30 },
          hotp: { algorithm: 'sha1', digits: 6 },
        }),
      },
      async (module) => {
        const { totp, hotp } = module.get(XOTPService);
        const totpSecret = Secret.from(RFC6238_SECRET, 'ascii');
        const hotpSecret = Secret.from(RFC4226_SECRET, 'ascii');

        expect(
          totp.generate({ secret: totpSecret, timestamp: RFC6238_TIMESTAMP_MS }),
        ).toBe(RFC6238_TOTP_SHA1);
        expect(hotp.generate({ secret: hotpSecret, counter: 0 })).toBe(
          RFC4226_HOTP_COUNTER_0,
        );
      },
    );
  });
});
