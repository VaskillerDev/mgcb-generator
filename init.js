#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const config = require('./mgcb-gen-config-template.json');
const pathToMgcbGenConfigFile = './mgcb-gen-config.json';
const configString = JSON.stringify(config, null, ' ');

const NOTICE_MSG = 'mgcb_init: [Notice]';
const WARN_MSG = 'mgcb_init: [Warn]';

if (fs.existsSync(pathToMgcbGenConfigFile)) {
  console.warn(`${NOTICE_MSG} ${pathToMgcbGenConfigFile} exist`);
  process.exit(0);
}

fs.writeFileSync(pathToMgcbGenConfigFile, configString);

{
  // check and set .nuget files
  const dirs = path.resolve('./', './').split(path.sep);
  const last = dirs.length - 1;
  const candidatePaths = [];
  const asepriteNameLike = new RegExp('[Aa]seprite');

  let slide = last;
  let currentPath = path.resolve(dirs[last]);
  let nugetDir;
  while (slide > 0) {
    currentPath = path.resolve(currentPath, '../');
    fs.readdirSync(currentPath).find(file => {
      let isNugetDir = false;
      if (file === '.nuget')
        (nugetDir = path.join(currentPath, file, 'packages')) &&
          (isNugetDir = true);
      if (file === 'packages')
        (nugetDir = path.join(currentPath, file)) && (isNugetDir = true);
      return isNugetDir;
    }) && candidatePaths.push(nugetDir); // require dirs // side effect
    --slide;
  }
  if (candidatePaths.length === 0) {
    console.warn(
      `${WARN_MSG} nuget packages dir not found. Please set the path manually.`
    );
  } else {
    candidatePaths.forEach(candidatePath => {
      const files = fs.readdirSync(candidatePath);
      const asepriteLib = files.filter(file => asepriteNameLike.test(file));
      if (asepriteLib)
        console.log(path.join(candidatePath, asepriteLib.toString()));
    });
  }
}

/*while (searchCountAttempt > 0) {
    const maybePackagesDir =  fs.readdirSync(currentPath).find(fileName=>fileName==="packages");
    const parent = path.dirname(currentPath).split(path.sep).pop();
    console.log(parent)
    --searchCountAttempt;
}*/
