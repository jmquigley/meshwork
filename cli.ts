#!/usr/bin/env node

"use strict";

import {meshwork} from "./index";

const argv = require("yargs")
	.usage("$0 --base={package} --modules={package}[,{package}] [--verbose]")
	.example(
		"$0 --base=base-package.json --modules=./app/pacakge.json,./devops/packag.json",
		"Adds the base file to each module"
	)
	.alias("base", "b")
	.nargs("base", 1)
	.describe("base", "The base package file")
	.demandOption(["base"])
	.alias("modules", "m")
	.nargs("modules", 1)
	.describe("modules", "The list of modules that will take part in the merge")
	.demandOption(["modules"])
	.boolean("verbose")
	.describe("verbose", "Prints information on operations as they occur")
	.help().argv;

const config = {
	base: argv.base,
	modules: argv.modules.split(","),
	verbose: argv.verbose
};

meshwork(config);
