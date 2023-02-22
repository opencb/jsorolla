#!/bin/sh

## Download test data locally
# wget http://reports.test.zettagenomics.com/iva/tests/2.7
# -r recursive
# -np no parents
# -A extensions list to download file
# -P save file to prefix ...
# -nd no directory
# wget -r -np -A .json R "index.html" http://reports.test.zettagenomics.com/iva/tests/2.7/ -P src/sites/test-app/.data-test/ -nd

## Get version from package.json
VERSION=`npm version | grep jsorolla | cut -d : -f 2 | sed "s/[ ',]//g" | cut -d - -f 1 | cut -f 1,2 -d .`

# confirm if exist folder and file
FILE_TEST="src/sites/test-app/test-data/${VERSION}"
if [ ! -d "$FILE_TEST" ]; then
    echo "create directory"
    mkdir -v -p $FILE_TEST
    wget -r -np -A .json R "index.html" http://reports.test.zettagenomics.com/iva/tests/${VERSION}/ -P "$FILE_TEST"/ -nd
fi

