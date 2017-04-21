'use strict';

import * as fs from 'fs-extra';
import * as path from 'path';
import merge from 'util.merge-packages';

const prefix = 'meshwork:';

export interface IMeshworkOpts {
	configFile?: string;
	base?: string;
	modules?: string[];
	verbose?: boolean;
}

function mergeFiles(base: string, module: string, opts: IMeshworkOpts) {
	if (opts.verbose) {
		console.log(`${prefix} merging ${module} with ${base}`);
	}

	const dst = fs.readFileSync(module);
	const src = fs.readFileSync(base);
	const combined = merge(dst, src);

	fs.writeFileSync(module, combined);
}

export function meshwork(opts?: IMeshworkOpts) {

	const defaultOpts: IMeshworkOpts = {
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

	const base = path.resolve(opts.base);
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
		const module = path.resolve(pkg);

		if (!fs.existsSync(module)) {
			throw new Error(`Can't find module package: ${module}`);
		}

		if (opts.verbose) {
			console.log(`${prefix} module=${module}`);
		}

		mergeFiles(base, module, opts);
	});
}
