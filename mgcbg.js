#!/usr/bin/env node
const version = require('./package.json').version;
const command = process.argv[2] || showHelp();

function showHelp() {
  console.log(
    `mgcbg ver. ${version} \n\n` +
      'Usage: mgcbg <command> <flags>\n\n' +
      'where is one of: \n' +
      'init, gen\n\n' +
      'mgcbg help         quick help\n' +
      'mgcbg init         init mgcb-gen-config.json file for generate .mgcb file content\n' +
      'mgcbg gen          genearte .mgcb file content\n'
  );
  return null;
}
if (command) {
  switch (command) {
    case 'init':
      require('./init.js');
      break;
    case 'gen':
      require('./gen.js');
      break;
    default:
      showHelp();
  }
}
