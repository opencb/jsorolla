#!/bin/sh
NAME="network-viewer"
BP=build/$NAME

rm -rf $BP
mkdir -p $BP
mkdir -p $BP/fonts
mkdir -p $BP/fontawesome
#mkdir -p $BP/images
mkdir -p $BP/css

mkdir -p $BP/bower_components
mkdir -p $BP/lib/

cp -r bower_components/* $BP/bower_components/

cp -r src/lib/components $BP/lib/
cp -r src/lib/network $BP/lib/
cp -r src/lib/data-adapter $BP/lib/
cp -r src/lib/data-source $BP/lib/
cp -r src/lib/utils.js $BP/lib/
cp -r src/lib/svg.js $BP/lib/
cp -r src/lib/cellbase-manager.js $BP/lib/
cp -r src/lib/opencga-manager.js $BP/lib/

cp -r src/network-viewer/* $BP/
mv $BP/jso-network-viewer-index.html $BP/index.html

sed -i s@../../styles/@@g $BP/index.html
cp -r styles/fonts/* $BP/fonts/

sed -i s@../../bower_components/@bower_components/@g $BP/index.html
sed -i s@../../bower_components/@bower_components/@g $BP/jso-network-viewer.html
sed -i s@../lib/@lib/@g $BP/index.html
sed -i s@../lib/@lib/@g $BP/jso-network-viewer.html

sed -i s@../../../../bower_components/@../../../bower_components/@g $BP/lib/components/table/jso-table.html
