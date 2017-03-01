'use strict';

import * as assert from 'assert';
import * as proc from 'child_process';
import * as path from 'path';
import * as fs from 'fs-extra';
import {popd, pushd} from 'util.chdir';
import {Fixture} from 'util.fixture';
import {meshwork} from '../index';
import {validateMerge} from './helpers';

const packageMerge = require('package-merge');

describe('Testing meshwork', () => {

	after(() => {
		let directories = Fixture.cleanup();
		directories.forEach((directory: string) => {
			assert(!fs.existsSync(directory));
		});
	});

	it('Validating bad configuration (no base)', () => {
		try {
			meshwork({});
		} catch (err) {
			assert.equal(err.message, 'No base package given in configuration');
		}
	});

	it('Validating missing modules in configuration', () => {
		try {
			meshwork({
				base: 'aslkdjalskjgalskdj'
			});
		} catch (err) {
			assert.equal(err.message, 'No modules list given in configuration');
		}
	});

	it('Validating missing/invalid base in configuration', () => {
		try {
			meshwork({
				base: 'aslkdjalskjgalskdj',
				modules: []
			});
		} catch (err) {
			assert(err.message.startsWith(`Can't find base package: `));
		}
	});

	it('Validating no modules in configuration (no modules)', () => {
		let fixture = new Fixture('no-modules');
		pushd(fixture.dir);

		try {
			meshwork(fixture.obj);
		} catch (err) {
			assert.equal(err.message, 'No modules list given in configuration');
		}

		popd();
	});

	it('Validating empty modules in configuration', () => {
		let fixture = new Fixture('empty-modules');
		pushd(fixture.dir);

		try {
			meshwork(fixture.obj);
		} catch (err) {
			assert.equal(err.message, 'Modules list contains no entries');
		}

		popd();
	});

	it('Validating modules datatype in configuration', () => {
		let fixture = new Fixture('modules-type-mismatch');
		pushd(fixture.dir);

		try {
			meshwork(fixture.obj);
		} catch (err) {
			assert.equal(err.message, 'Modules list must be of type Array');
		}

		popd();
	});

	it('Validating missing module configuration', () => {
		let fixture = new Fixture('modules-missing-file');
		pushd(fixture.dir);
		fixture.obj.configFile = path.join(fixture.dir, 'obj.json');

		try {
			meshwork(fixture.obj);
		} catch (err) {
			assert(err.message.startsWith(`Can't find module package:`));
		}

		popd();
	});

	it('Validating merge process', () => {
		let fixture = new Fixture('simple');
		pushd(fixture.dir);
		fixture.obj.configFile = path.join(fixture.dir, 'meshwork.json');

		meshwork({configFile: path.join(fixture.dir, 'meshwork.json')});
		validateMerge(fixture);

		popd();
	});

	it('Validating command-line merge', () => {
		let fixture = new Fixture('simple');
		let inp: string = fs.readFileSync(path.join(fixture.dir, 'meshwork.json')).toString();
		let config = JSON.parse(inp);

		let cmd = `node cli.js --base=${config.base} --modules=${config.modules[0]},${config.modules[1]} --verbose`;

		proc.execSync(cmd);
		validateMerge(fixture);
	});

	it('Validating package-merge', () => {
		let o1 = {
			item1: 'item1'
		};

		let o2 = {
			item2: 'item2'
		};

		let dst = JSON.stringify(o1);
		let src = JSON.stringify(o2);

		assert.equal(packageMerge(dst, src), '{"item1":"item1","item2":"item2"}');
	});
});
