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
/*
 * the search files are very similar,
 * but they may require an individual approach,
 * so should separate the implementations just in case
 */

{
  // simple search MonoGame.Aseprite.dll && MonoGame.Aseprite.ContentPipeline.dll
  // check and set .nuget files
  const dirs = path.resolve('./', './').split(path.sep);
  const last = dirs.length - 1;
  const nugetDirs = [];
  const asepriteRegex = new RegExp('[Aa]seprite');
  const netstandardRegex = new RegExp('[Nn]etstandard');

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
    }) && nugetDirs.push(nugetDir); // side effect
    --slide;
  }

  if (nugetDirs.length === 0) {
    console.warn(`${WARN_MSG} nuget packages dir not found. Please set the path manually.`);
  } else {
    const asepriteFiles = [];

    nugetDirs.forEach(candidatePath => {
      // search aseprite-like dirs
      const files = fs.readdirSync(candidatePath);
      const asepriteLib = files.filter(file => asepriteRegex.test(file)).toString();
      if (asepriteLib) asepriteFiles.push(path.join(candidatePath, asepriteLib));
    });

    if (asepriteFiles.length !== 0) {
      let collectionPotentialWithPipelineLib = asepriteFiles
        .map(candidatePath => search(candidatePath, 'MonoGame.Aseprite.ContentPipeline.dll')) // search aseprite files
        .flat();
      let collectionPotentialWithLib = asepriteFiles
        .map(candidatePath => search(candidatePath, 'MonoGame.Aseprite.dll')) // search aseprite files
        .flat();

      const endedPathToLib = collectionPotentialWithLib.filter(potentialPath =>
        netstandardRegex.test(potentialPath.toString())
      )[0];
      const endedPathToPipelineLib = collectionPotentialWithPipelineLib.filter(potentialPath =>
        netstandardRegex.test(potentialPath.toString())
      )[0];

      if (!endedPathToLib && !endedPathToPipelineLib) return; // todo: work with this line for way wit alternatives search

      config.asepriteLib = wsl.toWindowsSync(endedPathToLib) || endedPathToLib;
      config.asepritePipeline = wsl.toWindowsSync(endedPathToPipelineLib) || endedPathToPipelineLib;

      const configString = JSON.stringify(config, null, ' ');
      fs.writeFileSync(pathToMgcbGenConfigFile, configString);
    }
  }
}

{
  // simple search MonoGame.Extended.Content.Pipeline.dll (support by 3.8)
  const dirs = path.resolve('./', './').split(path.sep);
  const last = dirs.length - 1;
  const nugetDirs = [];
  const extendedContentPipelineRegex = new RegExp('[Ee]xtended.content.pipeline');
  const versionRegex = new RegExp('3.8.0');

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
    }) && nugetDirs.push(nugetDir); // side effect
    --slide;
  }

  if (nugetDirs.length === 0) {
    console.warn(`${WARN_MSG} nuget packages dir not found. Please set the path manually.`);
  } else {
    const monogamePipelineFiles = [];

    nugetDirs.forEach(candidatePath => {
      // search pipeline-like dirs
      const files = fs.readdirSync(candidatePath);
      const pipelineLib = files.filter(file => extendedContentPipelineRegex.test(file)).toString();
      if (pipelineLib) monogamePipelineFiles.push(path.join(candidatePath, pipelineLib));
    });

    if (monogamePipelineFiles.length !== 0) {
      let collectionPotentialWithPipelineLib = monogamePipelineFiles
        .map(candidatePath => search(candidatePath, 'MonoGame.Extended.Content.Pipeline.dll')) // search monogame extended files
        .flat();

      const endedPathToPipelineLib = collectionPotentialWithPipelineLib.filter(potentialPath =>
        versionRegex.test(potentialPath.toString())
      )[0];

      if (!endedPathToPipelineLib) return; // todo: work with this line for way wit alternatives search

      config.extendedContentPipeline = wsl.toWindowsSync(endedPathToPipelineLib) || endedPathToPipelineLib;

      const configString = JSON.stringify(config, null, ' ');
      fs.writeFileSync(pathToMgcbGenConfigFile, configString);
    }
  }
}

{
  // simple search mgcb.exe (support by 3.8)
  const dirs = path.resolve('./', './').split(path.sep);
  const last = dirs.length - 1;
  const nugetDirs = [];
  const contentBuilderTaskRegex = new RegExp('[Mm]onogame.content.builder.task');
  const versionRegex = new RegExp('3.8');

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
    }) && nugetDirs.push(nugetDir); // side effect
    --slide;
  }

  if (nugetDirs.length === 0) {
    console.warn(`${WARN_MSG} nuget packages dir not found. Please set the path manually.`);
  } else {
    const mgcbToolFiles = [];

    nugetDirs.forEach(candidatePath => {
      // search mgcb-tool-like dirs
      const files = fs.readdirSync(candidatePath);
      const asepriteLib = files.filter(file => contentBuilderTaskRegex.test(file)).toString();
      if (asepriteLib) mgcbToolFiles.push(path.join(candidatePath, asepriteLib));
    });

    if (mgcbToolFiles.length !== 0) {
      let collectionPotentialTools = mgcbToolFiles
        .map(candidatePath => search(candidatePath, 'mgcb.exe')) // search aseprite files
        .flat();

      const endedPathToTool = collectionPotentialTools.filter(potentialPath =>
        versionRegex.test(potentialPath.toString())
      )[0];

      if (!endedPathToTool) return; // todo: work with this line for way wit alternatives search

      config.editor = wsl.toWindowsSync(endedPathToTool) || endedPathToTool;

      const configString = JSON.stringify(config, null, ' ');
      fs.writeFileSync(pathToMgcbGenConfigFile, configString);
    }
  }
}
