'use strict';

const proc = require('child_process');
const fs = require('fs-extra');
const test = require('ava');
const packageMerge = require('package-merge');
const meshwork = require('./index');

let unitTestDir = 'tmp-unit-test-data';
let f1 = `${unitTestDir}/obj1.json`;
let f2 = `${unitTestDir}/obj2.json`;
let fbase = `${unitTestDir}/package.json`;
let fmod1 = `${unitTestDir}/module1/package.json`;
let fmod2 = `${unitTestDir}/module2/package.json`;

let tobj1 = {
	item1: 'item1'
};
let tobj2 = {
	item2: 'item2'
};

test.before(t => {
	if (fs.existsSync(unitTestDir)) {
		fs.removeSync(unitTestDir);
	}
	fs.mkdirSync(unitTestDir);

	// Test files for validating the package merge
	fs.writeFileSync(f1, JSON.stringify(tobj1));
	fs.writeFileSync(f2, JSON.stringify(tobj2));

	// Test files for combining two modules
	fs.mkdirSync(`${unitTestDir}/module1`);
	fs.mkdirSync(`${unitTestDir}/module2`);

	t.pass();
});

test.beforeEach(t => {
	//
	// Each test will reset the files in the directory to use:
	//
	// unitTestDir/
	//	 package.json
	//	 module1/
	//		 package.json
	//	 module2/
	//		 package.json
	//

	let mod1 = {
		module1: 'module1'
	};

	let mod2 = {
		module2: 'module2'
	};

	let pbase = {
		common: 'common stuff'
	};

	fs.writeFileSync(fmod1, JSON.stringify(mod1));
	fs.writeFileSync(fmod2, JSON.stringify(mod2));
	fs.writeFileSync(fbase, JSON.stringify(pbase));

	t.pass();
});

test.after.always('cleanup', t => {
	fs.removeSync(unitTestDir);
	t.pass();
});

test('Validating bad configuration (no base)', t => {
	try {
		meshwork({});
	} catch (err) {
		t.is(err.message, 'No base package given in configuration');
	}
});

test('Validating missing base in configuration', t => {
	try {
		meshwork({
			base: 'aslkdjalskjgalskdj'
		});
	} catch (err) {
		t.is(err.message, 'No modules list given in configuration');
	}
});

test('Validating no modules in configuration (no modules)', t => {
	try {
		meshwork({
			base: fbase
		});
	} catch (err) {
		t.is(err.message, 'No modules list given in configuration');
	}
});

test('Validating empty modules in configuration', t => {
	try {
		meshwork({
			base: fbase,
			modules: []
		});
	} catch (err) {
		t.is(err.message, 'Modules list contains no entries');
	}
});

test('Validating modules datatype in configuration', t => {
	try {
		meshwork({
			base: fbase,
			modules: ''
		});
	} catch (err) {
		t.is(err.message, 'Modules list must be of type Array');
	}
});

test('Validating missing module configuration', t => {
	try {
		meshwork({
			base: fbase,
			modules: [
				'alsdjfalksdjglaksdj'
			]
		});
	} catch (err) {
		t.true(err.message.startsWith(`Can't find module package:`));
	}
});

function validate(t) {
	let s = '{"common":"common stuff"}';
	let buf = fs.readFileSync(fbase).toString();
	t.is(buf, s);

	s = '{"module1":"module1","common":"common stuff"}';
	buf = fs.readFileSync(fmod1).toString();
	t.is(buf, s);

	s = '{"module2":"module2","common":"common stuff"}';
	buf = fs.readFileSync(fmod2).toString();
	t.is(buf, s);
}

test('Validating merge process', async t => {
	meshwork({
		base: `${unitTestDir}/package.json`,
		modules: [
			fmod1,
			fmod2
		],
		verbose: false
	});

	validate(t);
});

test('Validating command-line merge', async t => {
	let cmd = `node cli.js --base=${fbase} --modules=${fmod1},${fmod2} --verbose`;
	proc.execSync(cmd);

	validate(t);
});

test('Validating package-merge', t => {
	let dst = fs.readFileSync(f1);
	let src = fs.readFileSync(f2);

	t.is(packageMerge(dst, src), '{"item1":"item1","item2":"item2"}');
});
