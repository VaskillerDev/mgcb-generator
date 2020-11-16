#!/usr/bin/env node
// tested on node 12.4
// -- env:
//      content: string,
//      debug: boolean,
//      asepriteLib: string,
//      asepritePipeline: string,
// -- principle of operation:
// -> find dir with content in /exampleDir
// -> normalize with current rules
// -> recursively add all files to example.mgcb
const path = require('path');
const fs = require('fs');

let configFile;
let config;
try {
  configFile = fs.readFileSync('./mgcb-gen-config.json');
  config = JSON.parse(configFile.toString('utf-8'));
} catch (ignore) {
  throw new Error('mgcb-gen-config.json not found in this directory.');
}

console.log('Your config: ', config);

const DEBUG = process.env.debug || config['debug'] || false;
const ASEPRITE_LIB_PATH = process.env.asepriteLib || config['asepriteLib'];
const ASEPRITE_PIPELINE_PATH = process.env.asepritePipeline || config['asepritePipeline'];
const maybePathToContent =
  process.env.content || config['content'] || new Error('Path to content directory not found.');

if (maybePathToContent instanceof Error) {
  // path not set
  console.error(maybePathToContent);
  process.exit(1);
}

const purePathToContent = maybePathToContent; // content dir
const pathToMGCB = path.join(purePathToContent, 'content.mgcb');

if (!fs.existsSync(purePathToContent)) {
  // content dir not exist
  console.error(new Error(`Content directory not exist: ${purePathToContent}`));
  process.exit(1);
}
// -- declaration
function addAsepriteEntity (mgcb, dirName) {
  // require .json && .png file
  try {
    const pathToEntity = path.join(purePathToContent, dirName);
    const list = fs.readdirSync(pathToEntity);
    const spriteFile = list.filter(file => path.extname(file) === '.png')[0];
    const animationFile = list.filter(file => path.extname(file) === '.json')[0];

    if (DEBUG) console.log(`dirName: ${dirName} \nSprite file: ${spriteFile} \nAnimation file: ${animationFile}`);
    checkFile(spriteFile, `Sprite file not found in ${dirName}`);
    checkFile(animationFile, `Animation file not found in ${dirName}`);

    // .json
    fs.appendFileSync(mgcb, `#begin ${dirName}/${animationFile}\n`);
    fs.appendFileSync(mgcb, '/importer:AsepriteImporter\n' + '/processor:Processor\n');
    fs.appendFileSync(mgcb, `/build:${dirName}/${animationFile}\n\n`);

    // .png
    fs.appendFileSync(mgcb, `#begin ${dirName}/${spriteFile}\n`);
    fs.appendFileSync(
      mgcb,
      '/importer:TextureImporter\n' +
        '/processor:TextureProcessor\n' +
        '/processorParam:ColorKeyColor=255,0,255,255\n' +
        '/processorParam:ColorKeyEnabled=True\n' +
        '/processorParam:GenerateMipmaps=False\n' +
        '/processorParam:PremultiplyAlpha=True\n' +
        '/processorParam:ResizeToPowerOfTwo=False\n' +
        '/processorParam:MakeSquare=False\n' +
        '/processorParam:TextureFormat=Color\n'
    );
    fs.appendFileSync(mgcb, `/build:${dirName}/${spriteFile}\n\n`);
  } catch (e) {
    console.error('Error in addAsepriteEntity: ' + e);
  }
}

function addAsepriteReferences (mgcb) {
  if (DEBUG) {
    console.log('asepriteLib: ' + ASEPRITE_LIB_PATH);
    console.log('asepritePipeline: ' + ASEPRITE_PIPELINE_PATH);
  }
  fs.appendFileSync(mgcb, `/reference:${ASEPRITE_LIB_PATH}\n`);
  fs.appendFileSync(mgcb, `/reference:${ASEPRITE_PIPELINE_PATH}\n`);
}

function checkFile (file, msg) {
  if (!file) throw new Error(msg);
}

function addWindowsConfig (mgcb) {
  fs.appendFileSync(
    mgcb,
    '/outputDir:bin\n' +
      '/intermediateDir:obj\n' +
      '/platform:Windows\n' +
      '/config:\n' +
      '/profile:Reach\n' +
      '/compress:False\n'
  );
}

// -- start
console.log(`Content path: ${purePathToContent}`);
console.log(`MGCB path: ${pathToMGCB}`);

if (fs.existsSync(pathToMGCB)) fs.unlinkSync(pathToMGCB);

fs.writeFileSync(pathToMGCB, '\n#----------------------------- Global Properties ----------------------------#\n\n');
addWindowsConfig(pathToMGCB);
fs.appendFileSync(pathToMGCB, '\n#-------------------------------- References --------------------------------#\n\n');
addAsepriteReferences(pathToMGCB);
fs.appendFileSync(pathToMGCB, '\n#---------------------------------- Content ---------------------------------#\n\n');
addAsepriteEntity(pathToMGCB, 'human');
