import path from 'path';

import fs from 'fs-extra';

import TestBot from '../../../bot/TestBot';

function loadModule(modulePath) {
  let mod;
  try {
    mod = require(path.resolve(modulePath)); // eslint-disable-line import/no-dynamic-require
  } catch (err) {} // eslint-disable-line

  if (!mod) return null;

  if (typeof mod === 'object' && mod.default) {
    return mod.default;
  }

  return mod;
}

const test = async ({ argv }) => {
  const inputFile = argv._[1];
  const outputFile = argv['out-file']; // TODO: handle -o.

  const inputFilePath = path.resolve(inputFile);

  const tests = await fs.readJson(inputFilePath);

  const bot = new TestBot();

  // TODO: how to find handler and initialState?
  // find from ./handler or ./src/handler
  const handler = loadModule('handler') || loadModule('src/handler');

  if (!handler) {
    console.error('cannot find handler');
    return process.exit(1);
  }

  bot.onEvent(handler);

  console.log('start running tests...');

  const result = await bot.runTests(tests);

  // TODO: how to prettify output

  if (outputFile) {
    // TODO: write into file
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
};

export default test;
