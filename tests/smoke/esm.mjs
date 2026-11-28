// ESM smoke test: imports the named exports of the CommonJS package the way
// an ESM app (for example on Nest 12) does.
//
// Usage: node tests/smoke/esm.mjs [package-specifier]
// The specifier defaults to the built dist; the consumer smoke test passes
// "nestjs-xotp" so it resolves from the temporary consumer project.
import 'reflect-metadata';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { Test } from '@nestjs/testing';
import { Secret, URI } from 'xotp';

const TOTP_SECRET = '12345678901234567890';
const TOTP_SECRET_BASE32 = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
const TOTP_TIMESTAMP_MS = 59 * 1000;
const TOTP_TOKEN = '94287082';
const HOTP_TOKEN = '755224';

const EXPECTED_EXPORTS = [
  'XotpModule',
  'XotpService',
  'XotpTotpService',
  'XotpHotpService',
  'XOTPModule',
  'XOTPService',
  'XOTPTOTPService',
  'XOTPHOTPService',
];

const specifier = process.argv[2];
const pkg = await import(
  specifier ?? pathToFileURL(resolve('dist/index.js')).href
);

// Named exports are detected from the CommonJS output; fail clearly if not.
const missing = EXPECTED_EXPORTS.filter((name) => pkg[name] === undefined);
if (missing.length > 0) {
  throw new Error(`Missing named ESM exports: ${missing.join(', ')}`);
}

const {
  XotpModule,
  XotpService,
  XotpTotpService,
  XotpHotpService,
  XOTPModule,
  XOTPService,
  XOTPTOTPService,
  XOTPHOTPService,
} = pkg;

if (
  XOTPModule !== XotpModule ||
  XOTPService !== XotpService ||
  XOTPTOTPService !== XotpTotpService ||
  XOTPHOTPService !== XotpHotpService
) {
  throw new Error('Deprecated XOTP* aliases differ from the Xotp* classes');
}

const module = await Test.createTestingModule({
  imports: [
    XOTPModule.forRoot({
      totp: { algorithm: 'sha1', digits: 8, duration: 30 },
      hotp: { algorithm: 'sha1', digits: 6 },
    }),
  ],
}).compile();

try {
  const xotpService = module.get(XotpService);

  if (module.get(XOTPService) !== xotpService) {
    throw new Error('XOTPService did not resolve to the XotpService instance');
  }

  // Not an identity check: an ESM app's `import 'xotp'` loads the ESM build
  // of xotp, while this CommonJS package loads the CJS build, so the classes
  // are different copies (dual package hazard). Behavior must still match.
  const keyUri = xotpService.totp.toKeyUri({
    secret: TOTP_SECRET_BASE32,
    account: 'user@example.com',
  });
  const parsed = xotpService.uri.parse(keyUri);

  if (parsed.type !== 'totp' || parsed.account !== 'user@example.com') {
    throw new Error('XotpService.uri.parse returned an unexpected key URI');
  }

  if (URI.parse(keyUri).type !== 'totp') {
    throw new Error('ESM xotp URI cannot parse a key URI from the service');
  }

  const secret = Secret.from(TOTP_SECRET, 'ascii');
  const token = await xotpService.totp.generate({
    secret,
    timestamp: TOTP_TIMESTAMP_MS,
  });

  if (token !== TOTP_TOKEN) {
    throw new Error(`TOTP generate: expected ${TOTP_TOKEN}, got ${token}`);
  }

  if (
    !(await xotpService.totp.validate({
      token,
      secret,
      timestamp: TOTP_TIMESTAMP_MS,
    }))
  ) {
    throw new Error('TOTP validate failed');
  }

  const hotpToken = await xotpService.hotp.generate({ secret, counter: 0 });

  if (hotpToken !== HOTP_TOKEN) {
    throw new Error(`HOTP generate: expected ${HOTP_TOKEN}, got ${hotpToken}`);
  }
} finally {
  await module.close();
}

console.log(`smoke (esm, ${specifier ?? 'dist'}): ok`);
