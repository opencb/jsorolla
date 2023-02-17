#!/bin/sh

## Download test data locally
# wget http://reports.test.zettagenomics.com/iva/tests/2.7
# -r recursive
# -np no parents
# -A extensions list to download file
# -P save file to prefix ...
# -nd no directory
# wget -r -np -A .json R "index.html" http://reports.test.zettagenomics.com/iva/tests/2.7/ -P src/sites/test-app/.data-test/ -nd

# confirm if exist folder and file
FILE_TEST="src/sites/test-app/.data-test"
if [ ! -d "$FILE_TEST" ]; then
    echo "create directory"
    mkdir -v $FILE_TEST && wget -r -np -A .json R "index.html" http://reports.test.zettagenomics.com/iva/tests/2.7/ -P "$FILE_TEST"/ -nd
fi

