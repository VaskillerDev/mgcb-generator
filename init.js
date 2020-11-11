#!/usr/bin/env node
const fs = require('fs');
const config = require("./mgcb-gen-config-template.json");
const pathToMgcbGenConfigFile = './mgcb-gen-config.json';
const configString = JSON.stringify(config,null,' ');

if (fs.existsSync(pathToMgcbGenConfigFile)) {
    console.warn(`mgcb_init: [Notice] ${pathToMgcbGenConfigFile} exist`)
    process.exit(0);
}

fs.writeFileSync(pathToMgcbGenConfigFile,configString);
