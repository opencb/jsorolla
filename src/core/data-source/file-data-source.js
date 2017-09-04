/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
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