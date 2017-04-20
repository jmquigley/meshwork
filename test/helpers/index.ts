import {CallbackTestContext, TestContext} from 'ava';
import * as fs from 'fs-extra';
import * as path from 'path';
import {Fixture} from 'util.fixture';

export function validateMerge(fixture: Fixture, t: TestContext) {
	const f1 = fs.readFileSync(path.join(fixture.dir, 'module1', 'package.json')).toString();
	t.is(f1, `{\n\t"module1": "module1",\n\t"common": "common stuff"\n}\n`);

	const f2 = fs.readFileSync(path.join(fixture.dir, 'module2', 'package.json')).toString();
	t.is(f2, `{\n\t"module2": "module2",\n\t"common": "common stuff"\n}\n`);
}

export function cleanup(msg: string, t: CallbackTestContext): void {
	if (msg) {
		console.log(`final cleanup: ${msg}`);
	}

	Fixture.cleanup((err: Error, directories: string[]) => {
		if (err) {
			return t.fail(`Failure cleaning up after test: ${err.message}`);
		}

		directories.forEach((directory: string) => {
			t.false(fs.existsSync(directory));
		});

		t.end();
	});
}
