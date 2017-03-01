import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';
import {Fixture} from 'util.fixture';

export function validateMerge(fixture: Fixture) {
	let f1 = fs.readFileSync(path.join(fixture.dir, 'module1', 'package.json')).toString();
	assert.equal(f1, `{\n\t"module1": "module1",\n\t"common": "common stuff"\n}\n`);

	let f2 = fs.readFileSync(path.join(fixture.dir, 'module2', 'package.json')).toString();
	assert.equal(f2, `{\n\t"module2": "module2",\n\t"common": "common stuff"\n}\n`);
}
