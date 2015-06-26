#!/bin/sh
rm -rf build/network-viewer
mkdir -p build/network-viewer

vulcanize src/network-viewer/jso-network-viewer.html -o build/network-viewer/jso-network-viewer-min.html --strip --csp --inline

cp -r bower_components/fontawesome/fonts build/network-viewer/
cp -r styles/fonts/*.woff* build/network-viewer/fonts/
cp -r src/network-viewer/example-files build/network-viewer/

sed -i 's@../../bower_components/fontawesome/fonts/fontawesome-webfont.@fonts/fontawesome-webfont.@g' build/network-viewer/jso-network-viewer-min.html
sed -i 's@../../styles/fonts/@fonts/@g' build/network-viewer/jso-network-viewer-min.html


cp -r bower_components/webcomponentsjs/ build/network-viewer/
cp src/network-viewer/jso-network-viewer-index.html build/network-viewer/index.html


sed -i 's@../../bower_components/@@g' build/network-viewer/index.html
sed -i 's@jso-network-viewer.html@jso-network-viewer-min.html@g' build/network-viewer/index.html
