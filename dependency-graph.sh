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
