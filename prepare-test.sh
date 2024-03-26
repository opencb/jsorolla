#!/usr/bin/env bash
#
# Copyright 2015-2024 OpenCB
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

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
