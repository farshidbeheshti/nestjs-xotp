// Installs the packed package into a clean project for each Nest major and
// runs the CommonJS and ESM smoke checks there.
//
// Usage: node scripts/test-smoke-consumer.mjs [nest-major ...]
// Defaults to Nest 10, 11 and 12.
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const smokeDir = join(rootDir, 'tests/smoke');
const nestMajors = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['10', '11', '12'];

function run(command, args, cwd) {
  return spawnSync(command, args, { cwd, stdio: 'inherit' }).status ?? 1;
}

function smokeNest(major) {
  const tmpDir = mkdtempSync(
    join(tmpdir(), `nestjs-xotp-smoke-consumer-nest${major}-`),
  );
  let failed = false;

  try {
    console.log(`\n=== Nest ${major} ===`);

    writeFileSync(
      join(tmpDir, 'package.json'),
      JSON.stringify(
        {
          private: true,
          type: 'commonjs',
          dependencies: {
            'nestjs-xotp': `file:${rootDir}`,
            '@nestjs/common': `^${major}.0.0`,
            '@nestjs/core': `^${major}.0.0`,
            '@nestjs/testing': `^${major}.0.0`,
            'reflect-metadata': '^0.2.2',
            rxjs: '^7.8.1',
            xotp: '^2.0.0',
          },
        },
        null,
        2,
      ) + '\n',
    );

    // Copy the checks into the consumer so they resolve Nest and xotp from
    // the consumer's node_modules, like the installed package does.
    copyFileSync(join(smokeDir, 'checks.cjs'), join(tmpDir, 'checks.cjs'));
    copyFileSync(join(smokeDir, 'esm.mjs'), join(tmpDir, 'esm.mjs'));
    writeFileSync(
      join(tmpDir, 'cjs.cjs'),
      "const { runChecks } = require('./checks.cjs');\n" +
        "runChecks(require('nestjs-xotp'))\n" +
        `  .then(() => console.log('smoke (cjs, package, nest ${major}): ok'))\n` +
        '  .catch((error) => {\n' +
        '    console.error(error);\n' +
        '    process.exit(1);\n' +
        '  });\n',
    );

    // --install-links copies the file: dependency instead of symlinking it,
    // like a registry install, so peers resolve from the consumer project.
    if (
      run('npm', ['install', '--ignore-scripts', '--install-links'], tmpDir) !==
      0
    ) {
      failed = true;
    } else if (
      run('node', ['cjs.cjs'], tmpDir) !== 0 ||
      run('node', ['esm.mjs', 'nestjs-xotp'], tmpDir) !== 0
    ) {
      failed = true;
    }

    if (failed) {
      console.error(
        `Consumer smoke failed for Nest ${major}. Temp dir: ${tmpDir}`,
      );
    }
  } finally {
    if (!failed) rmSync(tmpDir, { recursive: true, force: true });
  }

  return !failed;
}

const results = nestMajors.map((major) => [major, smokeNest(major)]);
const failedMajors = results.filter(([, ok]) => !ok).map(([major]) => major);

if (failedMajors.length > 0) {
  console.error(`\nFailed for Nest: ${failedMajors.join(', ')}`);
  process.exit(1);
}

console.log(`\nConsumer smoke passed for Nest: ${nestMajors.join(', ')}`);
