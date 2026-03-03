#!/usr/bin/env node

import path from 'node:path';
import url from 'node:url';

import { parseArgs } from 'node:util';

import fs from 'fs-extra';
import prompts from 'prompts';

const main = async () => {

  // package
  const socketPackage = { name: '@where-org/where-socket', version: '^2.0.0', },
        socketAppGeneralPackage = { name: '@where-org/where-socket-app-general', version: '^2.0.0', };

  // config
  const socketAppConfig = ['config/socket-app.yaml'];

  // args
  const { values, positionals } = parseArgs({

    options: {
      'module': { short: 'm', type: 'boolean', },
    },

    allowNegative: true,
    allowPositionals: true,

  });

  const { module } = values,
        [name] = positionals;

  // prompt
  const result = await prompts([{
    // name
    type   : name ? null : 'text',
    name   : 'name',
    message: ':Please enter the where-socket name:',
    initial: 'where-socket'
  }, {
    // module
    type   : module !== undefined ? null : 'confirm',
    name   : 'module',
    message: 'Would you like to add where-socket-app-general?:'
  }]);

  const packageName = name ?? result.name;

  const srcDir = path.resolve(import.meta.dirname, 'templates'),
        destDir = path.resolve(process.cwd(), packageName);

  fs.copySync(srcDir, destDir, {
    filter: (v1) => !socketAppConfig.some((v2) => v1.includes(v2)),
  });

  fs.writeFileSync(path.resolve(destDir, socketAppConfig[0]), '');

  // package.json
  const packageJsonPath = path.resolve(destDir, 'package.json'),
        packageJson = JSON.parse(fs.readFileSync(packageJsonPath));

  packageJson.dependencies[socketPackage.name] = socketPackage.version;

  if (module || result.module) {

    packageJson.dependencies[socketAppGeneralPackage.name] = socketAppGeneralPackage.version;

    socketAppConfig.forEach(v => (
      fs.copySync(path.resolve(srcDir, v), path.resolve(destDir, v))
    ));

  }

  fs.writeFileSync(
    packageJsonPath, JSON.stringify({ ...packageJson, name: packageName }, null, 2)
  );

  console.log(`
  cd ${packageName}
  npm install
  # Before starting, install the required where-socket-app modules and edit config/socket-app.yaml.
  npm start`);

};

main();
