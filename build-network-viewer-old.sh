#!/bin/sh
NAME="network-viewer"
BP=build/$NAME

rm -rf $BP
mkdir -p $BP
mkdir -p $BP/tmp
mkdir -p $BP/fonts
mkdir -p $BP/fontawesome
#mkdir -p $BP/images
mkdir -p $BP/css

vulcanize \
    --inline-scripts \
    --inline-css \
    --strip-comments \
    --exclude "src/network-viewer/nv-theme.html" \
    src/$NAME/jso-network-viewer.html > $BP/tmp/build.html

crisper \
    --source $BP/tmp/build.html \
    --html $BP/tmp/jso-network-viewer.html \
    --js $BP/tmp/$NAME.js

rm -rf $BP/tmp/build.html

uglifyjs $BP/tmp/$NAME.js > $BP/tmp/$NAME.min.js

sed -i s@$NAME.js@$NAME.min.js@g $BP/tmp/jso-network-viewer.html

cp COPYING $BP/
cp README.md $BP/

mv $BP/tmp/jso-network-viewer.html $BP/
mv $BP/tmp/$NAME.js $BP/
mv $BP/tmp/$NAME.min.js $BP/
cp -r src/$NAME/nv-theme.html $BP/
cp -r src/$NAME/example-files $BP/
cp -r src/$NAME/jso-network-viewer-index.html $BP/index.html

#
# fix index.html paths
#
sed -i s@../../styles/@@g $BP/index.html
cp -r styles/fonts/* $BP/fonts/

sed -i s@../../bower_components/@@g $BP/index.html
cp -r bower_components/fontawesome/css $BP/fontawesome/
cp -r bower_components/fontawesome/fonts $BP/fontawesome/

sed -i s@../lib/components/@css/@g $BP/index.html
cp -r src/lib/components/jso-global.css $BP/css/
cp -r src/lib/components/jso-form.css $BP/css/
cp -r src/lib/components/jso-dropdown.css $BP/css/


sed -i s@../../bower_components/@@g $BP/index.html
cp -r bower_components/webcomponentsjs $BP/
## end fix paths


rm -rf $BP/tmp
