'use strict';

import * as fs from 'fs-extra';
import * as path from 'path';

const packageMerge = require('package-merge');

let prefix = 'meshwork:';

export interface IMeshworkOpts {
	configFile?: string;
	base?: string;
	modules?: string[];
	verbose?: boolean;
}

function merge(base: string, module: string, opts: IMeshworkOpts) {
	if (opts.verbose) {
		console.log(`${prefix} merging ${module} with ${base}`);
	}

	let dst = fs.readFileSync(module);
	let src = fs.readFileSync(base);
	let combined = packageMerge(dst, src);

	fs.writeFileSync(module, combined);
}

export function meshwork(opts?: IMeshworkOpts) {

	let defaultOpts: IMeshworkOpts = {
		configFile: 'meshwork.json',
		verbose: false
	};

	opts = Object.assign(defaultOpts, opts);

	opts.configFile = path.resolve(opts.configFile);
	if (fs.existsSync(opts.configFile)) {
		opts = JSON.parse(fs.readFileSync(opts.configFile).toString());
	}

	if (!Object.prototype.hasOwnProperty.call(opts, 'base')) {
		throw new Error('No base package given in configuration');
	}

	if (!Object.prototype.hasOwnProperty.call(opts, 'modules')) {
		throw new Error('No modules list given in configuration');
	}

	let base = path.resolve(opts.base);
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

	opts.modules.forEach((pkg: string) => {
		let module = path.resolve(pkg);

		if (!fs.existsSync(module)) {
			throw new Error(`Can't find module package: ${module}`);
		}

		if (opts.verbose) {
			console.log(`${prefix} module=${module}`);
		}

		merge(base, module, opts);
	});
};
