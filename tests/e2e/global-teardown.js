const { execFileSync } = require('child_process');

const {
  composeFile,
  composeProject,
} = require('./fixtures/database');

module.exports = async function globalTeardown() {
  execFileSync(
    'docker',
    [
      'compose',
      '--project-name',
      composeProject,
      '-f',
      composeFile,
      'down',
      '--volumes',
      '--remove-orphans',
    ],
    { stdio: 'inherit' }
  );
};
