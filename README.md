# Overview
JSorolla is a JavaScript library for biological and genomic data visualization.

### Documentation
You can find JSorolla documentation and tutorials at: http://docs.opencb.org/display/jsorolla/JSorolla+Home.

### Issue Tracking
You can report bugs or request new features at [GitHub issue tracking](https://github.com/opencb/jsorolla/issues).

### Release Notes and Roadmap
Releases notes are available at [GitHub releases](https://github.com/opencb/jsorolla/releases).

Roadmap is available at [GitHub milestones](https://github.com/opencb/jsorolla/milestones). You can report bugs or request new features at [GitHub issue tracking](https://github.com/opencb/jsorolla/issues).

### Versioning
JSorolla is versioned following the rules from [Semantic versioning](http://semver.org/).

### Maintainers
The main developers and maintainers are:
* Ignacio Medina (im411@cam.ac.uk) (_Founder and Project Leader_)
* Susi Gallego (sgaort@gmail.com)
* Alexis Martinez (alexismartinezchacon@gmail.com)

##### Former Contributors
* Francisco Salavert (fsalavert@cipf.es)

##### Contributing
JSorolla is an open-source and collaborative project. We appreciate any help and feedback from users, you can contribute in many different ways such as simple bug reporting and feature request. Depending on your skills you are more than welcome to develop client tools, new features or even fixing bugs.


# How to build 
JSorolla is developed in JavaScript 6 (es6) and makes a heavy usage of all the new features. It uses [npm](https://www.npmjs.com/) as building tool.

Stable releases are merged and tagged at **_master_** branch, you are encourage to use latest stable release for production. Current active development is carried out at **_develop_** branch, only building is guaranteed to work and bugs are expected, use this branch for development or for testing new functionalities.

### Prerequisites
The following technologies are needed to build JSorolla: [Node.js](https://nodejs.org/) and its package manager [npm](https://www.npmjs.com/).

##### Installing Node.js and npm
To install [Node.js](https://nodejs.org/) you can visit [this link](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager).

[npm](https://www.npmjs.com/) stands for _node packaged modules_ and it is the dependency manager of [Node.js](https://nodejs.org/).

### Cloning
JSorolla is an open-source and free project, you can download **_develop_** branch by executing:

    $ git clone https://github.com/opencb/jsorolla.git
    Cloning into 'jsorolla'...
    remote: Counting objects: 36760, done.
    remote: Compressing objects: 100% (149/149), done.
    remote: Total 36760 (delta 162), reused 135 (delta 76), pack-reused 36532
    Receiving objects: 100% (36760/36760), 27.46 MiB | 1.60 MiB/s, done.
    Resolving deltas: 100% (27029/27029), done.
    Checking connectivity... done.


To fetch the latest stable release at **_master_** branch can be downloaded executing:

    $ git clone -b master https://github.com/opencb/jsorolla.git
    Cloning into 'jsorolla'...
    remote: Counting objects: 36760, done.
    remote: Compressing objects: 100% (149/149), done.
    remote: Total 36760 (delta 162), reused 135 (delta 76), pack-reused 36532
    Receiving objects: 100% (36760/36760), 27.46 MiB | 2.01 MiB/s, done.
    Resolving deltas: 100% (27029/27029), done.
    Checking connectivity... done.


### Build
After installing _Node.js_ and _npm_ we have to install all _npm_ dependencies of JSorolla, from the the root folder execute:

```bash
npm install
```
This will make _npm_ to search all dependencies at file [package.json](package.json) and install them locally.


You can build all JSorolla _demos_ by executing:

```bash
npm run build
```
when completed, all demos will be located under the `build` folder.

Finally, you can build JSorolla libs by executing:

```bash
npm run dist
```

when completed, all compiled files will be located under the `dist` folder.


### Testing
You can copy build content to a web server such as Apache HTTP Server and open your favourite internet browser to open JSorolla demos. 


# Supporters
JetBrains is supporting this open source project with:

[![Intellij IDEA](https://www.jetbrains.com/idea/docs/logo_intellij_idea.png)]
(http://www.jetbrains.com/idea/)
