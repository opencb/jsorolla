# README

## Overview

IVA is a generic Interactive Variant Analysis browser that can be used for the visualization of biological information from various data sources. IVA uses data from [OpenCGA](https://github.com/opencb/opencga) which is an OpenCB project.

### Documentation

You can find IVA documentation and tutorials at: [https://github.com/opencb/iva/wiki](https://github.com/opencb/iva/wiki).

### Issues Tracking

You can report bugs or request new features at [GitHub issue tracking](https://github.com/opencb/iva/issues).

### Release Notes and Roadmap

Releases notes are available at [GitHub releases](https://github.com/opencb/iva/releases).

Roadmap is available at [GitHub milestones](https://github.com/opencb/iva/milestones). You can report bugs or request new features at [GitHub issue tracking](https://github.com/opencb/iva/issues).

### Versioning

IVA is versioned following the rules from [Semantic versioning](http://semver.org/).

### Maintainers

We recommend to contact IVA developers by writing to OpenCB mailing list opencb@googlegroups.com. The main developers and maintainers are:

* Ignacio Medina \(im411@cam.ac.uk\) \(_Founder and Project Leader_\)
* Javier Perez Florido \(javier.perez.florido.ext@juntadeandalucia.es\)
* Alexis Martínez \(alexis.martinez@juntadeandalucia.es\)

#### Former Contributors

* Swaathi Kandasaamy \(sk913@cam.ac.uk\)
* Asuncion Gallego \(agallego@cipf.es\)

#### Contributing

IVA is an open-source and collaborative project, currently developement is mainly carried out by Stefan Gräf and Ignacio Medina teams from the University of Cambridge and Joaquin Dopazo team from CIBERER. We appreciate any help and feedback from users, you can contribute in many different ways such as simple bug reporting and feature request. Dependending on your skills you are more than welcome to develop client tools, new features or even fixing bugs.

## How to build

IVA is developed in HTML5, therefore it is mainly developed in JavaScript and makes a heavy usage of HTML and CSS. It uses Grunt as building tool. IVA also requires of OpenCB JSorolla project to be built, this is a JavaScript library developed for several OpenCB web-based projects, this can be found as Git submodule in IVA.

Stable releases are merged and tagged at _master_ branch, you are encourage to use latest stable release for production. Current active development is carried out at _develop_ branch, only building is guaranteed and bugs are expected, use this branch for development or for testing new functionalities. The only dependency of IVA from OpenCB is JSorolla.

### Prerequisites

The following technologies are needed to build IVA: [Node.js](https://nodejs.org/en/), [npm](https://www.npmjs.com/) and [Grunt](http://gruntjs.com/getting-started).

#### Installing Node.js and npm

To install [Node.js](https://nodejs.org/en/) you can visit [this link](http://blog.teamtreehouse.com/install-node-js-npm-linux).

[npm](https://www.npmjs.com/) stands for _node packaged modules_ and it is the dependency manager of [Node.js](https://nodejs.org/en/).

### Cloning

IVA is an open-source project and can be downloaded either as package\(tar.gz\) from GitHub releases or source code by cloning the repository.

Default _**develop**_ branch can be downloaded by executing:

```text
$ git clone https://github.com/opencb/iva.git
Cloning into 'iva'...
remote: Counting objects: 624, done.
remote: Total 624 (delta 0), reused 0 (delta 0), pack-reused 624
Receiving objects: 100% (624/624), 139.37 KiB | 0 bytes/s, done.
Resolving deltas: 100% (356/356), done.
Checking connectivity... done.
```

Latest stable release at _**master**_ branch can be downloaded by executing:

```text
$ git clone -b master https://github.com/opencb/iva.git
Cloning into 'iva'...
remote: Counting objects: 624, done.
remote: Total 624 (delta 0), reused 0 (delta 0), pack-reused 624
Receiving objects: 100% (624/624), 139.37 KiB | 191.00 KiB/s, done.
Resolving deltas: 100% (356/356), done.
Checking connectivity... done.
```

After this, in both cases, you **must** execute the following command to fetch the JSorolla submodule \(only the first time\):

```text
git submodule update --init
```

Go to lib/jsorolla and checkout to _**develop**_ branch of Jsorolla by

```text
cd lib/jsorolla
git checkout develop
```

### Build

First, you must update JSorolla dependencies, from the root folder execute:

```text
cd lib/jsorolla
npm install
```

Finally, to build IVA execute:

We have to install npm packages for IVA, from the the root folder execute:

```text
npm install
```

And now execute:

```text
npm run build
```

when completed, all compiled files will be located under the _build_ folder.

### Testing

You can copy build content to a web server such as Apache HTTP Server and open your favourite internet browser to open IVA.

### Execute Tests in development with nightwatch\([http://nightwatchjs.org/](http://nightwatchjs.org/)\)

Prerequisite: make sure you have JDK installed, with at least version 8. If you don't have it, you can grab it from [http://www.oracle.com/technetwork/java/javase/downloads/index.html](http://www.oracle.com/technetwork/java/javase/downloads/index.html).

1. npm install --dev
2. Selenium server. Download the latest release .jar from [http://selenium-release.storage.googleapis.com/index.html](http://selenium-release.storage.googleapis.com/index.html). i.e. selenium-server-standalone-3.7.0.jar
3. Chromedriver. Download from [https://sites.google.com/a/chromium.org/chromedriver/downloads](https://sites.google.com/a/chromium.org/chromedriver/downloads) that version which supports your chrome versión. You can review what version fits your browser here [https://chromedriver.storage.googleapis.com/2.33/notes.txt](https://chromedriver.storage.googleapis.com/2.33/notes.txt).
4. Create a bin folder inside your test folder in root path
5. Move selenium bin and chrome bin inside that bin folder.
6. npm run test-e2e \( or ./node\_modules/.bin/nightwatch test/e2e/clinical-prioritization.js if you want execute just one\)

