import {CallbackTestContext, TestContext} from 'ava';
import * as fs from 'fs-extra';
import {Fixture} from 'util.fixture';

export function validateMerge(fixture: Fixture, t: TestContext) {
	const f1 = fixture.read('module1/package.json');
	t.is(f1, `{\n\t"module1": "module1",\n\t"common": "common stuff"\n}\n`);

	const f2 = fixture.read('module2/package.json');
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
