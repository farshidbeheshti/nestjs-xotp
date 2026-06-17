const TOTP_SECRET = '12345678901234567890';
const TOTP_TIMESTAMP_MS = 59 * 1000;
const TOTP_TOKEN = '94287082';
const HOTP_TOKEN = '755224';

async function runChecks({ XOTPModule, XOTPService }) {
  require('reflect-metadata');

  const { Test } = require('@nestjs/testing');
  const { Secret } = require('xotp');

  const module = await Test.createTestingModule({
    imports: [
      XOTPModule.forRoot({
        totp: { algorithm: 'sha1', digits: 8, duration: 30 },
        hotp: { algorithm: 'sha1', digits: 6 },
      }),
    ],
  }).compile();

  try {
    const xotpService = module.get(XOTPService);
    const secret = Secret.from(TOTP_SECRET, 'ascii');
    const token = xotpService.totp.generate({
      secret,
      timestamp: TOTP_TIMESTAMP_MS,
    });

    if (token !== TOTP_TOKEN) {
      throw new Error(`TOTP generate: expected ${TOTP_TOKEN}, got ${token}`);
    }

    if (
      !xotpService.totp.validate({
        token,
        secret,
        timestamp: TOTP_TIMESTAMP_MS,
      })
    ) {
      throw new Error('TOTP validate failed');
    }

    const hotpToken = xotpService.hotp.generate({ secret, counter: 0 });

    if (hotpToken !== HOTP_TOKEN) {
      throw new Error(`HOTP generate: expected ${HOTP_TOKEN}, got ${hotpToken}`);
    }
  } finally {
    await module.close();
  }
}

module.exports = { runChecks };
