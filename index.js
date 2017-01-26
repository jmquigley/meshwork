'use strict';

const fs = require('fs-extra');
const objectAssign = require('object-assign');
const resolvePath = require('resolve-path');
const packageMerge = require('package-merge');

let prefix = 'meshwork:';

function merge(base, module, opts) {
	if (opts.verbose) {
		console.log(`${prefix} merging ${module} with ${base}`);
	}

	let dst = fs.readFileSync(module);
	let src = fs.readFileSync(base);
	let combined = packageMerge(dst, src);

	fs.writeFileSync(module, combined);
}

module.exports = function(opts = undefined, configFile = 'meshwork.json') {
	let configOpts = {};
	configFile = resolvePath(configFile);
	if (fs.existsSync(configFile)) {
		configOpts = JSON.parse(fs.readFileSync(configFile));
	}

	opts = objectAssign({verbose: false}, configOpts, opts);

	if (!Object.prototype.hasOwnProperty.call(opts, 'base')) {
		throw new Error('No base package given in configuration');
	}

	if (!Object.prototype.hasOwnProperty.call(opts, 'modules')) {
		throw new Error('No modules list given in configuration');
	}

	let base = resolvePath(opts.base);
	if (!fs.existsSync(base)) {
		throw new Error(`Can't find base package: ${base}`);
	}

	if (opts.verbose) {
		console.log(`${prefix} base=${base}`);
	}

	if (!(opts.modules instanceof Array)) {
		throw new Error(`Modules list must be of type Array`);
	}

	if (opts.modules.length <= 0) {
		throw new Error(`Modules list contains no entries`);
	}

	opts.modules.forEach(function(pkg) {
		let module = resolvePath(pkg);

		if (!fs.existsSync(module)) {
			throw new Error(`Can't find module package: ${module}`);
		}

		if (opts.verbose) {
			console.log(`${prefix} module=${module}`);
		}

		merge(base, module, opts);
	});
};
