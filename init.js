#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const config = require('./mgcb-gen-config-template.json');
const wsl = require('./wslPath.js');
const pathToMgcbGenConfigFile = './mgcb-gen-config.json';

// --declaration
const NOTICE_MSG = 'mgcb_init: [Notice]';
const WARN_MSG = 'mgcb_init: [Warn]';

const search = (source, target) => {
  // --declaration
  const searchSync = (collector, source, target) => {
    // recursive search
    const files = fs.readdirSync(source, { withFileTypes: true });
    const dirs = files.filter(file => file.isDirectory()).map(dir => dir.name);
    if (files.length === 0 || !files) return;
    files.forEach(file => {
      if (file.name === target) {
        const targetPath = path.join(source, file.name);
        collector.push(targetPath);
      }
    });
    if (dirs.length === 0 || !dirs) return;
    for (const dir of dirs) {
      const tmpPath = path.resolve(source, dir.toString());
      searchSync(collector, tmpPath, target);
    }
  };

  // --impl
  const collector = [];
  searchSync(collector, source, target);
  return collector;
};

// --impl
if (fs.existsSync(pathToMgcbGenConfigFile)) {
  console.warn(`${NOTICE_MSG} ${pathToMgcbGenConfigFile} exist`);
  process.exit(0);
}

{
  // simple search MonoGame.Aseprite.dll && MonoGame.Aseprite.ContentPipeline.dll
  // check and set .nuget files
  const dirs = path.resolve('./', './').split(path.sep);
  const last = dirs.length - 1;
  const candidatePaths = [];
  const asepriteNameLike = new RegExp('[Aa]seprite');
  const netstandardNameLike = new RegExp('[Nn]etstandard');

  let slide = last;
  let currentPath = path.resolve(dirs[last]);
  let nugetDir;
  while (slide > 0) {
    currentPath = path.resolve(currentPath, '../');
    fs.readdirSync(currentPath).find(file => {
      // search nuget-like dirs
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
    candidatePaths.forEach(candidatePath => {
      // search asprite-like dirs
      const files = fs.readdirSync(candidatePath);
      const asepriteLib = files.filter(file => asepriteNameLike.test(file)).toString();
      if (asepriteLib) candidateAsepritePaths.push(path.join(candidatePath, asepriteLib));
    });
    if (candidateAsepritePaths.length !== 0) {
      let collectionPotentialWithPipelineLib = candidateAsepritePaths
        .map((
          candidatePath // search aseprite files
        ) => search(candidatePath, 'MonoGame.Aseprite.ContentPipeline.dll'))
        .flat();
      let collectionPotentialWithLib = candidateAsepritePaths
        .map((
          candidatePath // search aseprite files
        ) => search(candidatePath, 'MonoGame.Aseprite.dll'))
        .flat();

      const endedPathToLib = collectionPotentialWithLib.filter(potentialPath =>
        netstandardNameLike.test(potentialPath.toString())
      )[0];
      const endedPathToPipelineLib = collectionPotentialWithPipelineLib.filter(potentialPath =>
        netstandardNameLike.test(potentialPath.toString())
      )[0];
      if (!endedPathToLib && !endedPathToPipelineLib) return; // todo: work with this line for way wit alternatives search

      config.asepriteLib = wsl.wslToWindowsSync(endedPathToLib) || endedPathToLib;
      config.asepritePipeline = wsl.wslToWindowsSync(endedPathToPipelineLib) || endedPathToPipelineLib;

      const configString = JSON.stringify(config, null, ' ');
      fs.writeFileSync(pathToMgcbGenConfigFile, configString);
    }
  }
}
