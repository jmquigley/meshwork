'use strict';

import test from 'ava';
import * as proc from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import {popd, pushd} from 'util.chdir';
import {Fixture} from 'util.fixture';
import merge from 'util.merge-packages';
import {meshwork} from '../index';
import {cleanup, validateMerge} from './helpers';

test.after.always.cb(t => {
	cleanup(path.basename(__filename), t);
});

test('Validating bad configuration (no base)', t => {
	try {
		meshwork({});
	} catch (err) {
		t.is(err.message, 'No base package given in configuration');
	}
});

test('Validating missing modules in configuration', t => {
	try {
		meshwork({
			base: 'aslkdjalskjgalskdj'
		});
	} catch (err) {
		t.is(err.message, 'No modules list given in configuration');
	}
});

test('Validating missing/invalid base in configuration', t => {
	try {
		meshwork({
			base: 'aslkdjalskjgalskdj',
			modules: []
		});
	} catch (err) {
		t.true(err.message.startsWith(`Can't find base package: `));
	}
});

test('Validating no modules in configuration (no modules)', t => {
	const fixture = new Fixture('no-modules');
	pushd(fixture.dir);

	try {
		meshwork(fixture.obj);
	} catch (err) {
		t.is(err.message, 'No modules list given in configuration');
	}

	popd();
});

test('Validating empty modules in configuration', t => {
	const fixture = new Fixture('empty-modules');
	pushd(fixture.dir);

	try {
		meshwork(fixture.obj);
	} catch (err) {
		t.is(err.message, 'Modules list contains no entries');
	}

	popd();
});

test('Validating modules datatype in configuration', t => {
	const fixture = new Fixture('modules-type-mismatch');
	pushd(fixture.dir);

	try {
		meshwork(fixture.obj);
	} catch (err) {
		t.is(err.message, 'Modules list must be of type Array');
	}

	popd();
});

test('Validating missing module configuration', t => {
	const fixture = new Fixture('modules-missing-file');
	pushd(fixture.dir);
	fixture.obj.configFile = path.join(fixture.dir, 'obj.json');

	try {
		meshwork(fixture.obj);
	} catch (err) {
		t.true(err.message.startsWith(`Can't find module package:`));
	}

	popd();
});

test('Validating merge process', t => {
	const fixture = new Fixture('simple');
	pushd(fixture.dir);
	fixture.obj.configFile = path.join(fixture.dir, 'meshwork.json');

	meshwork({configFile: path.join(fixture.dir, 'meshwork.json')});
	validateMerge(fixture, t);

	popd();
});

test('Validating command-line merge', t => {
	const fixture = new Fixture('simple');
	const inp: string = fs.readFileSync(path.join(fixture.dir, 'meshwork.json')).toString();
	const config = JSON.parse(inp);

	const cmd = `node cli.js --base=${config.base} --modules=${config.modules[0]},${config.modules[1]} --verbose`;

	proc.execSync(cmd);
	validateMerge(fixture, t);
});

test('Validating package-merge', t => {
	const o1 = {
		item1: 'item1'
	};

	const o2 = {
		item2: 'item2'
	};

	const dst = JSON.stringify(o1);
	const src = JSON.stringify(o2);

	t.is(merge(dst, src), '{"item1":"item1","item2":"item2"}');
});
