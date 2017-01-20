# meshwork [![Build Status](https://travis-ci.org/jmquigley/meshwork.svg?branch=master)](https://travis-ci.org/jmquigley/meshwork)

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

The application can be configured a three ways:

- A configuration file named `meshwork.json`.
- A Command line parameters to a cli named `meshwork`.
- An inline JSON object passed to `meshwork()`.

The inline JSON has the highest precedence over the configuration file.  This allows the program to override the settings programatically.

### Configuration File
The application will look for a configuration at the root of the project named `meshwork.json`.  This file contains the base package.json file and a list of modules that will be merged with the base.

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
The package.json files within each module can be built directly from the commandline.  A base package and a list of modules are given:

```
$ meshwork --base=package.json --modules={file1},{file2},... [--verbose]
```

### Inline
The configuration can also be passed directly to the `meshwork()`.

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
