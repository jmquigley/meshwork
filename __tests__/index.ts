"use strict";

import * as proc from "child_process";
import * as fs from "fs-extra";
import * as path from "path";
import {popd, pushd} from "util.chdir";
import {cleanup, Fixture} from "util.fixture";
import merge from "util.merge-packages";
import {meshwork} from "../index";

export function validateMerge(fixture: Fixture) {
	const f1 = fixture.read("module1/package.json");
	expect(f1).toBe(
		`{\n\t"module1": "module1",\n\t"common": "common stuff"\n}\n`
	);

	const f2 = fixture.read("module2/package.json");
	expect(f2).toBe(
		`{\n\t"module2": "module2",\n\t"common": "common stuff"\n}\n`
	);
}

afterAll((done) => {
	cleanup({done, message: path.basename(__filename)});
});

test("Validating bad configuration (no base)", () => {
	try {
		meshwork({});
	} catch (err) {
		expect(err.message).toBe("No base package given in configuration");
	}
});

test("Validating missing modules in configuration", () => {
	try {
		meshwork({
			base: "aslkdjalskjgalskdj"
		});
	} catch (err) {
		expect(err.message).toBe("No modules list given in configuration");
	}
});

test("Validating missing/invalid base in configuration", () => {
	try {
		meshwork({
			base: "aslkdjalskjgalskdj",
			modules: []
		});
	} catch (err) {
		expect(err.message.startsWith(`Can't find base package: `)).toBe(true);
	}
});

test("Validating no modules in configuration (no modules)", () => {
	const fixture = new Fixture("no-modules");
	pushd(fixture.dir);

	try {
		meshwork(fixture.obj);
	} catch (err) {
		expect(err.message).toBe("No modules list given in configuration");
	}

	popd();
});

test("Validating empty modules in configuration", () => {
	const fixture = new Fixture("empty-modules");
	pushd(fixture.dir);

	try {
		meshwork(fixture.obj);
	} catch (err) {
		expect(err.message).toBe("Modules list contains no entries");
	}

	popd();
});

test("Validating modules datatype in configuration", () => {
	const fixture = new Fixture("modules-type-mismatch");
	pushd(fixture.dir);

	try {
		meshwork(fixture.obj);
	} catch (err) {
		expect(err.message).toBe("Modules list must be of type Array");
	}

	popd();
});

test("Validating missing module configuration", () => {
	const fixture = new Fixture("modules-missing-file");
	pushd(fixture.dir);
	fixture.obj.configFile = path.join(fixture.dir, "obj.json");

	try {
		meshwork(fixture.obj);
	} catch (err) {
		expect(err.message.startsWith(`Can't find module package:`)).toBe(true);
	}

	popd();
});

test("Validating merge process", () => {
	const fixture = new Fixture("simple");
	pushd(fixture.dir);
	fixture.obj.configFile = path.join(fixture.dir, "meshwork.json");

	meshwork({configFile: path.join(fixture.dir, "meshwork.json")});
	validateMerge(fixture);

	popd();
});

test("Validating command-line merge", () => {
	const fixture = new Fixture("simple");
	const inp: string = fs
		.readFileSync(path.join(fixture.dir, "meshwork.json"))
		.toString();
	const config = JSON.parse(inp);

	const cmd = `node cli.js --base=${config.base} --modules=${
		config.modules[0]
	},${config.modules[1]} --verbose`;

	proc.execSync(cmd);
	validateMerge(fixture);
});

test("Validating package-merge", () => {
	const o1 = {
		item1: "item1"
	};

	const o2 = {
		item2: "item2"
	};

	const dst = JSON.stringify(o1);
	const src = JSON.stringify(o2);

	expect(merge(dst, src)).toBe('{"item1":"item1","item2":"item2"}');
});
