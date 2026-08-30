const { execFileSync } = require('child_process');

const {
  composeFile,
  composeProject,
} = require('./fixtures/database');

const composeArgs = ['compose', '--project-name', composeProject, '-f', composeFile];

module.exports = async function globalSetup() {
  execFileSync(
    'docker',
    [...composeArgs, 'down', '--volumes', '--remove-orphans'],
    { stdio: 'inherit' }
  );
  execFileSync('docker', [...composeArgs, 'up', '--detach', '--wait'], {
    stdio: 'inherit',
  });
};
