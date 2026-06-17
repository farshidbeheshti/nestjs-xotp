const { runChecks } = require('./checks.cjs');

runChecks(require('../../dist/index.js'))
  .then(() => {
    console.log('smoke (cjs, dist): ok');
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
