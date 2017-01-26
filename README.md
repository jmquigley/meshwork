# meshwork [![Build Status](https://travis-ci.org/jmquigley/meshwork.svg?branch=master)](https://travis-ci.org/jmquigley/meshwork) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo) [![NPM](https://img.shields.io/badge/npm-v0.0.6-blue.svg)](https://www.npmjs.com/package/meshwork) [![Coverage Status](https://coveralls.io/repos/github/jmquigley/meshwork/badge.svg?branch=master)](https://coveralls.io/github/jmquigley/meshwork?branch=master)

> Multi-module package.json manager.

Manages multiple submodules that contain individual package.json files.  The project contains a base package.json and N sub package files (one for each module).  This program will then scan each of the subpackages and merge the contents of the base into the each submodule.  This is a way to put common information into the base package that all of the subpackages can *inherit*.

- Merging of common dependencies.
- Merging of common settings for tools like XO, ESLint, etc, from the base.
- Preservation of values within submodules (they have higher precedence)

A project with the following contrived setup:

    package.json
    meshwork.json
    modules/
        module1/
            package.json
        module2/
            package.json
        moduleN/
            package.json

When the application is executed, the `package.json` files within `module1`, `module2`, and `module3` are merged together with the *root* `package.json` file.  Each module will then preserve its customizations within its local version while also receiving the common/global information from the root package.  Note that the modules directory is not necessary.  The modules can be stored in any location one would choose.  The configuration below explains how to customize the module layout.

## Installation

To install as a global package and cli:
```
$ npm install --global meshwork
```

To install as a development dependency with cli:
```
$ npm install --save-dev meshwork
```

## Configuration and Usage

The application can be configured three ways:

- A configuration file named `meshwork.json`.
- A Command line parameter to a CLI named `meshwork`.
- An inline JSON object passed to `meshwork()`.

The inline JSON object has the highest precedence over the configuration file.  This allows the program to override the settings programatically.

### Configuration File
The application will look for a configuration at the root of the project named `meshwork.json`.  This file contains the base package.json file and a list of modules that will be merged with the base:

    {
        "base": "package.json",
        "modules": [
            "module1/package.json",
            "module2/package.json",
            ...
        ],
        "verbose": false
    }

### Command Line
The package.json files within each module can be built (merged) directly from the command line.  A base package and a list of modules are given as parameters to the CLI:

```
$ meshwork --base=package.json --modules={file1},{file2},... [--verbose]
```

### Inline
The configuration can also be passed directly to the `meshwork()` as a JSON object:

    const meshwork = require('meshwork');
    
    meshwork({
        "base": "package.json",
        "modules": [
            "module1/package.json",
            "module2/package.json",
        ],
        "verbose": false
    });

## Gulp Task

    gulp.task('mesh', (done) => {
        meshwork({
            base: "package.json",
            verbose: true,
            modules: [
                "lib/package.json"
            ]
        });
    
        done();
    });
