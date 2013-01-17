/*
 * Copyright (c) 2013 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2013 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2013 Ignacio Medina (ICM-CIPF)
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


var res = "nothing";


function updateProgress(evt) {
    res+=" updateProgress";
    if (evt.lengthComputable) {
        var percentComplete = evt.loaded / evt.total;
    } else {
        // Unable to compute progress information since the total size is unknown
    }
}

function transferComplete(evt) {
    res+=" transferComplete";
}

function transferFailed(evt) {
    res+=" transferFailed";
}

function transferCanceled(evt) {
    res+=" transferCanceled";
}


function upload(formData) {
    var xhr = new XMLHttpRequest();
    //The upload events are fired on the XMLHttpRequest.upload object
    xhr.upload.addEventListener("progress", updateProgress, false);
    xhr.upload.addEventListener("load", transferComplete, false);
    xhr.upload.addEventListener("error", transferFailed, false);
    xhr.upload.addEventListener("abort", transferCanceled, false);
    // retrieve data unprocessed as a binary string

//    xhr.setRequestHeader("Content-type", "application/json");
//    xhr.overrideMimeType("text/plain; charset=x-user-defined");

    xhr.open('POST', 'http://fsalavert:8080/gcsa/rest/subir', false);//false indicates sync call
    xhr.onload = function(e) {
        res += "loaded";
    };
    var sended = xhr.send(formData);
}



self.onmessage = function(e) {

    //e.data contains the files array;
    var files = e.data.files;

    for (var i = 0; i <files.length; i++) {
        var file = files[i];

        const BYTES_PER_CHUNK = 200;
        const SIZE = file.size;
        const CHUNKS = Math.ceil(SIZE/BYTES_PER_CHUNK);

        var start = 0;
        var end = BYTES_PER_CHUNK;

        var num = 1;
        while (start < SIZE) {
            res+="c";
            var chunkBlob = file.slice(start, end);

            var formData = new FormData();
            formData.append("content", chunkBlob);
            formData.append("num", num);
            formData.append("total", CHUNKS);
            formData.append("total", CHUNKS);
            formData.append("filename", file.name);

            upload(formData);
            start = end;
            end = start + BYTES_PER_CHUNK;
            num++;
        }
    }

    self.postMessage(res);
};




//fr.onload = function(evt) {
//    $.ajax({
//        type: "POST",
//        url: "http://fsalavert:8080/gcsa/rest/subir",
//        data: {a:evt.target.result},
//        success: function(data){console.log(data);},
//        error:  function(data){console.log(data);},
//    });
//
//};

//fr = new FileReader();
//x = f.slice(100,200)
//fr.readAsBinaryString(x)





//var file = [], p = true;
//function upload(blobOrFile) {
//    var xhr = new XMLHttpRequest();
//    xhr.open('POST', '/server', false);
//    xhr.onload = function(e) {
//    };
//    xhr.send(blobOrFile);
//}
//
//function process() {
//    for (var j = 0; j <file.length; j++) {
//        var blob = file[j];
//
//        const BYTES_PER_CHUNK = 1024 * 1024;
//        // 1MB chunk sizes.
//        const SIZE = blob.size;
//
//        var start = 0;
//        var end = BYTES_PER_CHUNK;
//
//        while (start < SIZE) {
//
//            if ('mozSlice' in blob) {
//                var chunk = blob.mozSlice(start, end);
//            } else {
//                var chunk = blob.webkitSlice(start, end);
//            }
//
//            upload(chunk);
//
//            start = end;
//            end = start + BYTES_PER_CHUNK;
//        }
//        p = ( j = file.length - 1) ? true : false;
//        self.postMessage(blob.name + " Uploaded Succesfully");
//    }
//}
//
//
//self.onmessage = function(e) {
//
//    for (var j = 0; j < e.data.length; j++)
//        files.push(e.data[j]);
//
//    if (p) {
//        process()
//    }
//
//}




















////////////
////////////
////////////    External import
////////////
////////////

/*
 * FormData for XMLHttpRequest 2  -  Polyfill for Web Worker  (c) 2012 Rob W
 * License: Creative Commons BY - http://creativecommons.org/licenses/by/3.0/
 * - append(name, value[, filename])
 * - toString: Returns an ArrayBuffer object
 *
 * Specification: http://www.w3.org/TR/XMLHttpRequest/#formdata
 *                http://www.w3.org/TR/XMLHttpRequest/#the-send-method
 * The .append() implementation also accepts Uint8Array and ArrayBuffer objects
 * Web Workers do not natively support FormData:
 *                http://dev.w3.org/html5/workers/#apis-available-to-workers
 **/
(function() {
    // Export variable to the global scope
    (this == undefined ? self : this)['FormData'] = FormData;

    var ___send$rw = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype['send'] = function(data) {
        if (data instanceof FormData) {
            if (!data.__endedMultipart) data.__append('--' + data.boundary + '--\r\n');
            data.__endedMultipart = true;
            this.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + data.boundary);
            data = new Uint8Array(data.data).buffer;
        }
        // Invoke original XHR.send
        return ___send$rw.call(this, data);
    };

    function FormData() {
        // Force a Constructor
        if (!(this instanceof FormData)) return new FormData();
        // Generate a random boundary - This must be unique with respect to the form's contents.
        this.boundary = '------RWWorkerFormDataBoundary' + Math.random().toString(36);
        var internal_data = this.data = [];
        /**
         * Internal method.
         * @param inp String | ArrayBuffer | Uint8Array  Input
         */
        this.__append = function(inp) {
            var i=0, len;
            if (typeof inp === 'string') {
                for (len=inp.length; i<len; i++)
                    internal_data.push(inp.charCodeAt(i) & 0xff);
            } else if (inp && inp.byteLength) {/*If ArrayBuffer or typed array */
                if (!('byteOffset' in inp))   /* If ArrayBuffer, wrap in view */
                    inp = new Uint8Array(inp);
                for (len=inp.byteLength; i<len; i++)
                    internal_data.push(inp[i] & 0xff);
            }
        };
    }
    /**
     * @param name     String                                  Key name
     * @param value    String|Blob|File|Uint8Array|ArrayBuffer Value
     * @param filename String                                  Optional File name (when value is not a string).
     **/
    FormData.prototype['append'] = function(name, value, filename) {
        if (this.__endedMultipart) {
            // Truncate the closing boundary
            this.data.length -= this.boundary.length + 6;
            this.__endedMultipart = false;
        }
        var valueType = Object.prototype.toString.call(value),
            part = '--' + this.boundary + '\r\n' +
                'Content-Disposition: form-data; name="' + name + '"';

        if (/^\[object (?:Blob|File)(?:Constructor)?\]$/.test(valueType)) {
            return this.append(name,
                new Uint8Array(new FileReaderSync().readAsArrayBuffer(value)),
                filename || value.name);
        } else if (/^\[object (?:Uint8Array|ArrayBuffer)(?:Constructor)?\]$/.test(valueType)) {
            part += '; filename="'+ (filename || 'blob').replace(/"/g,'%22') +'"\r\n';
            part += 'Content-Type: application/octet-stream\r\n\r\n';
            this.__append(part);
            this.__append(value);
            part = '\r\n';
        } else {
            part += '\r\n\r\n' + value + '\r\n';
        }
        this.__append(part);
    };
})();