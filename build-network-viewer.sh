#!/bin/sh
NAME="network-viewer"
BP=build/$NAME

rm -rf $BP
mkdir -p $BP
mkdir -p $BP/tmp
mkdir -p $BP/fonts
mkdir -p $BP/fontawesome
mkdir -p $BP/images

vulcanize \
    --inline-scripts \
    --inline-css \
    --strip-comments \
    --exclude "src/network-viewer/nv-theme.html" \
    src/$NAME/jso-network-viewer-index.html > $BP/tmp/build.html

crisper \
    --source $BP/tmp/build.html \
    --html $BP/tmp/index.html \
    --js $BP/tmp/$NAME.js

rm -rf $BP/tmp/build.html

uglifyjs $BP/tmp/$NAME.js > $BP/tmp/$NAME.min.js

sed -i s@$NAME.js@$NAME.min.js@g $BP/tmp/index.html


#fix paths
sed -i s@../../styles/fonts/@fonts/@g $BP/tmp/index.html
cp -r styles/fonts/* $BP/fonts/


sed -i s@../../bower_components/fontawesome/fonts/@fontawesome/fonts/@g $BP/tmp/index.html
cp -r bower_components/fontawesome/css $BP/fontawesome/
cp -r bower_components/fontawesome/fonts $BP/fontawesome/
## end fix paths

#cp LICENSE $BP/
#cp README.md $BP/

mv $BP/tmp/index.html $BP/
mv $BP/tmp/$NAME.js $BP/
mv $BP/tmp/$NAME.min.js $BP/
cp -r src/$NAME/nv-theme.html $BP/
cp -r src/$NAME/example-files $BP/

rm -rf $BP/tmp
