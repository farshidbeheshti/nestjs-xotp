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
