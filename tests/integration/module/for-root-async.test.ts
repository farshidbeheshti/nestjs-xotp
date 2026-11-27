import { Injectable, Module } from '@nestjs/common';
import { Secret } from 'xotp';
import {
  XotpModuleOptions,
  XotpOptionsFactory,
  XotpService,
  XotpHotpService,
  XotpTotpService,
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

describe('XotpModule.forRootAsync', () => {
  it('loads options from useFactory', async () => {
    await withForRootAsyncModule(
      {
        useFactory: (): XotpModuleOptions => ({
          totp: { algorithm: 'sha1', digits: 8, duration: 30 },
        }),
      },
      async (module) => {
        const totp = module.get(XotpTotpService);
        const secret = Secret.from(RFC6238_SECRET, 'ascii');

        expect(
          await totp.generate({ secret, timestamp: RFC6238_TIMESTAMP_MS }),
        ).toBe(RFC6238_TOTP_SHA1);
      },
    );
  });

  it('loads options from useExisting factory', async () => {
    @Injectable()
    class TestOptionsFactory implements XotpOptionsFactory {
      createXOTPModuleOptions(): XotpModuleOptions {
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
        const hotp = module.get(XotpHotpService);
        const secret = Secret.from(RFC4226_SECRET, 'ascii');

        expect(await hotp.generate({ secret, counter: 0 })).toBe(
          RFC4226_HOTP_COUNTER_0,
        );
      },
    );
  });

  it('loads options from useClass factory', async () => {
    @Injectable()
    class TestOptionsFactory implements XotpOptionsFactory {
      createXOTPModuleOptions(): XotpModuleOptions {
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
        const totp = module.get(XotpTotpService);
        const secret = Secret.from(RFC6238_SECRET, 'ascii');

        expect(
          await totp.generate({ secret, timestamp: RFC6238_TIMESTAMP_MS }),
        ).toBe(RFC6238_TOTP_SHA1);
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
        useFactory: (config: ConfigService): XotpModuleOptions => ({
          totp: {
            algorithm: 'sha1',
            digits: config.totpDigits,
            duration: 30,
          },
        }),
      },
      async (module) => {
        const totp = module.get(XotpTotpService);
        const secret = Secret.from(RFC6238_SECRET, 'ascii');

        expect(totp.digits).toBe(8);
        expect(
          await totp.generate({ secret, timestamp: RFC6238_TIMESTAMP_MS }),
        ).toBe(RFC6238_TOTP_SHA1);
      },
    );
  });

  it('loads options from async useFactory', async () => {
    await withForRootAsyncModule(
      {
        useFactory: async (): Promise<XotpModuleOptions> => {
          await Promise.resolve();
          return {
            totp: { algorithm: 'sha1', digits: 8, duration: 30 },
          };
        },
      },
      async (module) => {
        const totp = module.get(XotpTotpService);
        const secret = Secret.from(RFC6238_SECRET, 'ascii');

        expect(
          await totp.generate({ secret, timestamp: RFC6238_TIMESTAMP_MS }),
        ).toBe(RFC6238_TOTP_SHA1);
      },
    );
  });

  it('loads options from async factory class', async () => {
    @Injectable()
    class AsyncOptionsFactory implements XotpOptionsFactory {
      async createXOTPModuleOptions(): Promise<XotpModuleOptions> {
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
        const hotp = module.get(XotpHotpService);
        const secret = Secret.from(RFC4226_SECRET, 'ascii');

        expect(await hotp.generate({ secret, counter: 0 })).toBe(
          RFC4226_HOTP_COUNTER_0,
        );
      },
    );
  });

  it('applies nested totp and hotp overrides independently', async () => {
    await withForRootAsyncModule(
      {
        useFactory: (): XotpModuleOptions => ({
          algorithm: 'sha512',
          totp: { algorithm: 'sha1', digits: 8, duration: 30 },
          hotp: { algorithm: 'sha1', digits: 6 },
        }),
      },
      async (module) => {
        const { totp, hotp } = module.get(XotpService);
        const totpSecret = Secret.from(RFC6238_SECRET, 'ascii');
        const hotpSecret = Secret.from(RFC4226_SECRET, 'ascii');

        expect(
          await totp.generate({
            secret: totpSecret,
            timestamp: RFC6238_TIMESTAMP_MS,
          }),
        ).toBe(RFC6238_TOTP_SHA1);
        expect(await hotp.generate({ secret: hotpSecret, counter: 0 })).toBe(
          RFC4226_HOTP_COUNTER_0,
        );
      },
    );
  });
});
