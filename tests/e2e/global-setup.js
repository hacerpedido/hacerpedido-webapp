const { execFileSync } = require('child_process');
const { resolve } = require('path');

const {
  composeFile,
  composeProject,
  pgConnectionString,
} = require('./fixtures/database');

const composeArgs = ['compose', '--project-name', composeProject, '-f', composeFile];

const knexEnv = {
  ...process.env,
  NODE_ENV: 'test',
  PG_CONNECTION_STRING: pgConnectionString,
};

const knexArgs = (command) => [
  'knex',
  '--knexfile',
  resolve(__dirname, '../../knexfile.js'),
  command,
];

module.exports = async function globalSetup() {
  execFileSync(
    'docker',
    [...composeArgs, 'down', '--volumes', '--remove-orphans'],
    { stdio: 'inherit' }
  );
  execFileSync('docker', [...composeArgs, 'up', '--detach', '--wait'], {
    stdio: 'inherit',
  });
  execFileSync('npx', [...knexArgs('migrate:latest')], {
    stdio: 'inherit',
    env: knexEnv,
  });
  execFileSync('npx', [...knexArgs('seed:run')], {
    stdio: 'inherit',
    env: knexEnv,
  });
};
