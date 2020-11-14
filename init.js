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
    fs.readdirSync(currentPath).find(file => { // search nuget-like dirs
      // require dirs
      let isNugetDir = false;
      if (file === '.nuget') (nugetDir = path.join(currentPath, file, 'packages')) && (isNugetDir = true); // for usr dir
      if (file === 'packages') (nugetDir = path.join(currentPath, file)) && (isNugetDir = true);
      return isNugetDir;
    }) && candidatePaths.push(nugetDir); // side effect
    --slide;
  }
  if (candidatePaths.length === 0) {
    console.warn(`${WARN_MSG} nuget packages dir not found. Please set the path manually.`);
  } else {
    const candidateAsepritePaths = [];
    candidatePaths.forEach(candidatePath => { // search asprite-like dirs
      const files = fs.readdirSync(candidatePath);
      const asepriteLib = files.filter(file => asepriteNameLike.test(file)).toString();
      if (asepriteLib) candidateAsepritePaths.push(path.join(candidatePath, asepriteLib));
    });
    if (candidateAsepritePaths.length !== 0) {
      candidateAsepritePaths.forEach(candidatePath => { // search asprite files
        const files = fs.readdirSync(candidatePath);
        // todo: continue search function
      })
    }
  }
}

