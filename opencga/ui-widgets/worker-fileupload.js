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


var res = {finished:false};
var resumeInfo = {};
var host = '';
var accountId = '';
var bucketId = '';
var objectId = '';
var sessionId = '';


function getTime(){
    return Date.now()/1000;
}

function updateProgress(evt) {
    res+=" updateProgress";
    if (evt.lengthComputable) {
        var percentComplete = evt.loaded / evt.total;
    } else {
        // Unable to compute progress information since the total size is unknown
    }
}

function transferComplete(evt) {
//    res.info+=" transferComplete";
}

function transferFailed(evt) {
//    res.info+=" transferFailed";
}

function transferCanceled(evt) {
//    res.info+=" transferCanceled";
}

function getUrl(){
    return host+'/account/'+accountId+'/storage/'+bucketId+'/'+objectId+'/chunk_upload?sessionid='+sessionId;
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

    xhr.open('POST', getUrl(), false);//false indicates sync call
    xhr.send(formData);
}

function getResumeInfo(formData) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', getUrl(), false);//false indicates sync call
    xhr.send(formData);
    return xhr.responseText;
//    if (request.status === 200) {
//        console.log(request.responseText);
//    }
}


function checkChunk(id, size) {
    if(typeof resumeInfo[id] == 'undefined'){
        return false;
    }else if(resumeInfo[id].size != size /*|| resumeInfo[id].hash != hash*/){
        return false;
    }
    return true;
}

self.onmessage = function(e) {
    host = e.data.host;
    accountId = e.data.accountId;
    bucketId = e.data.bucketId;
    sessionId = e.data.sessionId;
    objectId = e.data.objectId;

    var fileFormat = e.data.fileFormat;
    var file = e.data.file;
    var resume = e.data.resume;

    const BYTES_PER_CHUNK = 7*1024*1024;
    const SIZE = file.size;
    const NUM_CHUNKS = Math.ceil(SIZE/BYTES_PER_CHUNK);
    var start = 0;
    var end = BYTES_PER_CHUNK;
    var chunkId = 0;
    res.total = NUM_CHUNKS;

    if(resume){
        var resumeFormData = new FormData();
        resumeFormData.append('filename', file.name);
        resumeFormData.append('object_id', objectId);
        resumeFormData.append('bucket_id', bucketId);
        resumeFormData.append('resume_upload', 'true');
        var str = getResumeInfo(resumeFormData);
        resumeInfo = JSON.parse(str);
    }

    var t;
    while (start < SIZE) {
        t = getTime();
        var chunkBlob = file.slice(start, end);
        res.chunkId = chunkId;
        if(checkChunk(chunkId, chunkBlob.size) == false){
            var formData = new FormData();
            formData.append('chunk_content', chunkBlob);
            formData.append('chunk_id', chunkId);
            formData.append('chunk_size', chunkBlob.size);
//                formData.append('chunk_hash', hash);
            formData.append("filename", file.name);
            formData.append('object_id', objectId);
            formData.append('bucket_id', bucketId);
//            formData.append('chunk_gzip', );
            /**/
            if(chunkId == (NUM_CHUNKS-1)){
                formData.append("last_chunk", true);
                formData.append("fileFormat", fileFormat);
                formData.append("total_size", SIZE);
            }
            upload(formData);
        }

        res.start = start;
        res.end = end;
        res.t = getTime()-t;
        self.postMessage(res);

        start = end;
        end = start + BYTES_PER_CHUNK;
        chunkId++;
    }

    res.finished = true;
    self.postMessage(res);
};




//fr.onload = function(evt) {
//    $.ajax({
//        type: "POST",
//        url: "http://fsalavert:8080/opencga/rest/subir",
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


/*
 CryptoJS v3.1.2
 code.google.com/p/crypto-js
 (c) 2009-2013 by Jeff Mott. All rights reserved.
 code.google.com/p/crypto-js/wiki/License
 */
var CryptoJS=CryptoJS||function(e,m){var p={},j=p.lib={},l=function(){},f=j.Base={extend:function(a){l.prototype=this;var c=new l;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
    n=j.WordArray=f.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=m?c:4*a.length},toString:function(a){return(a||h).stringify(this)},concat:function(a){var c=this.words,q=a.words,d=this.sigBytes;a=a.sigBytes;this.clamp();if(d%4)for(var b=0;b<a;b++)c[d+b>>>2]|=(q[b>>>2]>>>24-8*(b%4)&255)<<24-8*((d+b)%4);else if(65535<q.length)for(b=0;b<a;b+=4)c[d+b>>>2]=q[b>>>2];else c.push.apply(c,q);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
        32-8*(c%4);a.length=e.ceil(c/4)},clone:function(){var a=f.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],b=0;b<a;b+=4)c.push(4294967296*e.random()|0);return new n.init(c,a)}}),b=p.enc={},h=b.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var b=[],d=0;d<a;d++){var f=c[d>>>2]>>>24-8*(d%4)&255;b.push((f>>>4).toString(16));b.push((f&15).toString(16))}return b.join("")},parse:function(a){for(var c=a.length,b=[],d=0;d<c;d+=2)b[d>>>3]|=parseInt(a.substr(d,
        2),16)<<24-4*(d%8);return new n.init(b,c/2)}},g=b.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var b=[],d=0;d<a;d++)b.push(String.fromCharCode(c[d>>>2]>>>24-8*(d%4)&255));return b.join("")},parse:function(a){for(var c=a.length,b=[],d=0;d<c;d++)b[d>>>2]|=(a.charCodeAt(d)&255)<<24-8*(d%4);return new n.init(b,c)}},r=b.Utf8={stringify:function(a){try{return decodeURIComponent(escape(g.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return g.parse(unescape(encodeURIComponent(a)))}},
    k=j.BufferedBlockAlgorithm=f.extend({reset:function(){this._data=new n.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=r.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,b=c.words,d=c.sigBytes,f=this.blockSize,h=d/(4*f),h=a?e.ceil(h):e.max((h|0)-this._minBufferSize,0);a=h*f;d=e.min(4*a,d);if(a){for(var g=0;g<a;g+=f)this._doProcessBlock(b,g);g=b.splice(0,a);c.sigBytes-=d}return new n.init(g,d)},clone:function(){var a=f.clone.call(this);
        a._data=this._data.clone();return a},_minBufferSize:0});j.Hasher=k.extend({cfg:f.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){k.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(c,b){return(new a.init(b)).finalize(c)}},_createHmacHelper:function(a){return function(b,f){return(new s.HMAC.init(a,
    f)).finalize(b)}}});var s=p.algo={};return p}(Math);
(function(){var e=CryptoJS,m=e.lib,p=m.WordArray,j=m.Hasher,l=[],m=e.algo.SHA1=j.extend({_doReset:function(){this._hash=new p.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(f,n){for(var b=this._hash.words,h=b[0],g=b[1],e=b[2],k=b[3],j=b[4],a=0;80>a;a++){if(16>a)l[a]=f[n+a]|0;else{var c=l[a-3]^l[a-8]^l[a-14]^l[a-16];l[a]=c<<1|c>>>31}c=(h<<5|h>>>27)+j+l[a];c=20>a?c+((g&e|~g&k)+1518500249):40>a?c+((g^e^k)+1859775393):60>a?c+((g&e|g&k|e&k)-1894007588):c+((g^e^
    k)-899497514);j=k;k=e;e=g<<30|g>>>2;g=h;h=c}b[0]=b[0]+h|0;b[1]=b[1]+g|0;b[2]=b[2]+e|0;b[3]=b[3]+k|0;b[4]=b[4]+j|0},_doFinalize:function(){var f=this._data,e=f.words,b=8*this._nDataBytes,h=8*f.sigBytes;e[h>>>5]|=128<<24-h%32;e[(h+64>>>9<<4)+14]=Math.floor(b/4294967296);e[(h+64>>>9<<4)+15]=b;f.sigBytes=4*e.length;this._process();return this._hash},clone:function(){var e=j.clone.call(this);e._hash=this._hash.clone();return e}});e.SHA1=j._createHelper(m);e.HmacSHA1=j._createHmacHelper(m)})();