'use strict';

const proc = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const test = require('ava');
const uuidV4 = require('uuid/v4');
const packageMerge = require('package-merge');
const timestamp = require('util.timestamp');
const home = require('expand-home-dir');
const meshwork = require('./index');

let unitTestBaseDir = home(path.join('~/', '.tmp', 'unit-test-data'));
let unitTestDir = home(path.join(unitTestBaseDir, uuidV4()));
if (fs.existsSync(unitTestDir)) {
	fs.mkdirsSync(unitTestDir);
}

/**
 * This will setup a unique data directory for each test that calls it.  This
 * is needed for concurrent testing or there will be race conditions
 */
function setupTest() {
	let root = path.join(unitTestDir, timestamp());
	let tdata = {
		root: root,
		f1: path.join(root, 'obj1.json'),
		f2: path.join(root, 'obj2.json'),
		fbase: path.join(root, 'package.json'),
		fmod1: path.join(root, 'module1', 'package.json'),
		fmod2: path.join(root, 'module2', 'package.json'),

		tobj1: {
			item1: 'item1'
		},

		tobj2: {
			item2: 'item2'
		},

		mod1: {
			module1: 'module1'
		},

		mod2: {
			module2: 'module2'
		},

		pbase: {
			common: 'common stuff'
		},

		config: {}
	};

	tdata.config = {
		base: path.join(tdata.root, 'package.json'),
		modules: [
			tdata.fmod1,
			tdata.fmod2
		],
		verbose: false
	};

	if (fs.existsSync(tdata.root)) {
		fs.removeSync(tdata.root);
	}
	fs.mkdirsSync(tdata.root);

	// Test files for validating the package merge
	fs.writeFileSync(tdata.f1, JSON.stringify(tdata.tobj1));
	fs.writeFileSync(tdata.f2, JSON.stringify(tdata.tobj2));

	// Test files for combining two modules
	fs.mkdirsSync(path.join(tdata.root, 'module1'));
	fs.mkdirsSync(path.join(tdata.root, 'module2'));

	fs.writeFileSync(tdata.fmod1, JSON.stringify(tdata.mod1));
	fs.writeFileSync(tdata.fmod2, JSON.stringify(tdata.mod2));
	fs.writeFileSync(tdata.fbase, JSON.stringify(tdata.pbase));

	return tdata;
}

test.after.always('test cleanup', t => {
	fs.removeSync(unitTestBaseDir);
	t.pass();
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
	let tdata = setupTest();

	try {
		meshwork({
			base: tdata.fbase
		});
	} catch (err) {
		t.is(err.message, 'No modules list given in configuration');
	}
});

test('Validating empty modules in configuration', t => {
	let tdata = setupTest();

	try {
		meshwork({
			base: tdata.fbase,
			modules: []
		});
	} catch (err) {
		t.is(err.message, 'Modules list contains no entries');
	}
});

test('Validating modules datatype in configuration', t => {
	let tdata = setupTest();

	try {
		meshwork({
			base: tdata.fbase,
			modules: ''
		});
	} catch (err) {
		t.is(err.message, 'Modules list must be of type Array');
	}
});

test('Validating missing module configuration', t => {
	let tdata = setupTest();

	try {
		meshwork({
			base: tdata.fbase,
			modules: [
				'alsdjfalksdjglaksdj'
			]
		});
	} catch (err) {
		t.true(err.message.startsWith(`Can't find module package:`));
	}
});

function validate(t, tdata) {
	let s = '{"common":"common stuff"}';
	let buf = fs.readFileSync(tdata.fbase).toString();
	t.is(buf, s);

	s = '{"module1":"module1","common":"common stuff"}';
	buf = fs.readFileSync(tdata.fmod1).toString();
	t.is(buf, s);

	s = '{"module2":"module2","common":"common stuff"}';
	buf = fs.readFileSync(tdata.fmod2).toString();
	t.is(buf, s);
}

test('Validating merge process', async t => {
	let tdata = setupTest();

	meshwork({
		base: path.join(tdata.root, 'package.json'),
		modules: [
			tdata.fmod1,
			tdata.fmod2
		],
		verbose: false
	});

	validate(t, tdata);
});

test('Validating command-line merge', async t => {
	let tdata = setupTest();

	let cmd = `node cli.js --base=${tdata.fbase} --modules=${tdata.fmod1},${tdata.fmod2} --verbose`;
	proc.execSync(cmd);

	validate(t, tdata);
});

test('Validating package-merge', t => {
	let tdata = setupTest();

	let dst = fs.readFileSync(tdata.f1);
	let src = fs.readFileSync(tdata.f2);

	t.is(packageMerge(dst, src), '{"item1":"item1","item2":"item2"}');
});

test('Using meshwork.json default file', t => {
	let tdata = setupTest();

	process.chdir(tdata.root);
	fs.writeFileSync(path.join(tdata.root, 'meshwork.json'), JSON.stringify(tdata.config));
	meshwork();

	validate(t, tdata);
});
