/*
 * Copyright 2015-2024 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function XLSXNetworkDataAdapter(args) {
    var _this = this;
    _.extend(this, Backbone.Events);

    this.dataSource;
    this.async = true;

    this.graph = new JsoGraph();
    this.xlsx;

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);


    if (this.async) {
        this.dataSource.on('success', function (data) {
            _this.parse(data);
        });
        this.dataSource.fetch(this.async);
    } else {
        var data = this.dataSource.fetch(this.async);
        this.parse(data);
    }


};

XLSXNetworkDataAdapter.prototype.parse = function (data) {
    try {
        this.xlsx = XLSX.read(data, {type: 'binary'});
        this.trigger('data:load', {workbook: this.xlsx, sender: this});
    } catch (e) {
        console.log(e);
        this.trigger('error:parse', {errorMsg: 'Parse error', sender: this});
    }
};
XLSXNetworkDataAdapter.prototype.parseSheet = function (sheetName) {
    var csv = XLSX.utils.sheet_to_csv(this.xlsx.Sheets[sheetName]);
    return csv;
};
