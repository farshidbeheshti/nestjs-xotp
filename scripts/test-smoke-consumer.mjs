import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const checksCjs = join(rootDir, 'tests/smoke/checks.cjs');
const tmpDir = mkdtempSync(join(tmpdir(), 'nestjs-xotp-smoke-consumer-'));

try {
  writeFileSync(
    join(tmpDir, 'package.json'),
    JSON.stringify(
      {
        private: true,
        type: 'commonjs',
        dependencies: {
          'nestjs-xotp': `file:${rootDir}`,
          '@nestjs/common': '^11.0.0',
          '@nestjs/core': '^11.0.0',
          '@nestjs/testing': '^11.0.0',
          xotp: '^1.1.0',
        },
      },
      null,
      2,
    ) + '\n',
  );

  writeFileSync(
    join(tmpDir, 'test.cjs'),
    `const { runChecks } = require(${JSON.stringify(checksCjs)});\n` +
      'runChecks(require("nestjs-xotp"))\n' +
      '  .then(() => console.log("smoke (cjs, package): ok"))\n' +
      '  .catch((error) => {\n' +
      '    console.error(error);\n' +
      '    process.exit(1);\n' +
      '  });\n',
  );

  const install = spawnSync('npm', ['install', '--ignore-scripts'], {
    cwd: tmpDir,
    stdio: 'inherit',
  });
  if (install.status !== 0) process.exit(install.status ?? 1);

  const run = spawnSync('node', ['test.cjs'], {
    cwd: tmpDir,
    stdio: 'inherit',
  });
  if (run.status !== 0) {
    console.error(`Consumer smoke failed. Temp dir: ${tmpDir}`);
    process.exit(run.status ?? 1);
  }
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}
