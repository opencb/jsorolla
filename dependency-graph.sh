exclude=\
"node_modules|"\
"./deprecated|"\
"src/genome-browser|"\
"src/core|"\
"src/core/src/core/utils.js|"\
"src/core/utilsNew.js|"\
"src/core/clients|"\
"src/core/visualisation|"\
"src/webcomponents/loading-spinner.js|"\
"src/webcomponents/NotificationUtils.js|"\
"src/webcomponents/PolymerUtils.js|"\
"src/webcomponents/opencga/clinical/obsolete|"\
"src/webcomponents/variant/deprecated|"\
"src/webcomponents/Notification.js|"\
"src/webcomponents/commons/filters/deprecated|"\
"src/webcomponents/commons"

depcruise "src/webcomponents/**/*.js" -x "^($exclude)" --output-type dot | dot -T svg > dependency.svg
depcruise "src/sites/iva/**/*.js" -x "^($exclude)" --output-type json > dependency.json

# depcruise "lib/jsorolla/src/core/webcomponents/**/*.js" -x "^($exclude)" --output-type dot | dot -Gsplines=ortho -Grankdir=TD -T svg > dependency.svg
# depcruise "lib/jsorolla/src/core/webcomponents/**/*.js" -x "^($exclude)" --output-type ddot | dot -Gsplines=ortho -T svg > dependency.svg
