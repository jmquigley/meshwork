#!/usr/bin/env node

'use strict';

const argv = require('yargs').argv;
const meshwork = require('./index');

console.log(`Executing meshwork cli: ${argv}`);
console.log(meshwork);
