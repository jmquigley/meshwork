import * as fs from "fs-extra";
import {Fixture} from "util.fixture";

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

export function cleanup(msg: string, done: any): void {
	if (msg) {
		console.log(`final cleanup: ${msg}`);
	}

	Fixture.cleanup((err: Error, directories: string[]) => {
		if (err) {
			throw new Error(`Failure cleaning up after test: ${err.message}`);
		}

		directories.forEach((directory: string) => {
			expect(fs.existsSync(directory)).toBe(false);
		});

		done();
	});
}
