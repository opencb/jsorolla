#!/usr/bin/env bash
## #!/bin/sh

## Get version from package.json
VERSION=`npm version | grep jsorolla | cut -d : -f 2 | sed "s/[ ',]//g" | cut -d - -f 1 | cut -f 1,2 -d .`

## FILE_TEST="src/sites/test-app/test-data/${VERSION}"
FILE_TEST="test-data/${VERSION}"
if [ ! -d "$FILE_TEST" ]; then
    mkdir -p $FILE_TEST
    wget -r -np -A .json R "index.html" http://reports.test.zettagenomics.com/iva/test-data/${VERSION}/ -P "$FILE_TEST"/ -nd
    exit 0;
fi
