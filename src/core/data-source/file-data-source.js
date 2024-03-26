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

FileDataSource.prototype.fetch = DataSource.prototype.fetch;

function FileDataSource(args) {
    DataSource.prototype.constructor.call(this);

    _.extend(this, Backbone.Events);

    this.file;
    this.maxSize = 500 * 1024 * 1024;
    this.type = 'text';

    //set instantiation args, must be last
    _.extend(this, args);
};

FileDataSource.prototype.error = function () {
    alert("File is too big. Max file size is " + this.maxSize + " bytes");
};

FileDataSource.prototype.fetch = function (async) {
    var _this = this;
    if (this.file.size <= this.maxSize) {
        if (async) {
            var reader = new FileReader();
            reader.onload = function (evt) {
                _this.trigger('success', evt.target.result);
            };
            return this.readAs(this.type, reader);
        } else {
            // FileReaderSync web workers only
            var reader = new FileReaderSync();
            return this.readAs(this.type, reader);
        }
    } else {
        _this.error();
        _this.trigger('error', {sender: this});
    }
};


FileDataSource.prototype.readAs = function (type, reader) {
    switch (type) {
        case 'binary':
            return reader.readAsBinaryString(this.file);
            break;
        case 'text':
        default:
            return reader.readAsText(this.file, "UTF-8");
    }
};
