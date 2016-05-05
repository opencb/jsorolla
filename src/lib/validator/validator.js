function Validator(options) {

    if (!(this instanceof Validator)) {
        return new Validator(options);
    }

    this.file = options.file ? options.file : null;

    this.log = [];
    this.line = 0;
    this.progress = 0;
    this._readBytes = 0;
    this._events = {};
    this.numLines = 0;

    this.linesToRead = 2000;
}

Validator.prototype = {
    init: function () {
        this.file = null;
        this.log = [];
        this.line = 0;
        this.numLines = 0;
        this.progress = 0;
        this._readBytes = 0;
    },
    stop: function (cb) {
        if (this._navigator != null) {
            this._navigator._stop = true;
        }
    },

    validate: function () {
        var me = this;

        /*Check if file is \r or \n , \r\n */
        this._detectCRSeparator(this.file, function (res) {
            var lastReadBytes = null;
            if (res) {
                me._navigator = new FileNavigator(me.file, undefined, {
                    newLineCode: '\r'.charCodeAt(0),
                    splitPattern: /\r/
                });
            } else {
                me._navigator = new FileNavigator(me.file);
            }

            me._totalBytes = me.file.size;
            var indexToStartWith = 0;

            // me._navigator.readSomeLines(indexToStartWith, function linesReadHandler(err, index, lines, eof, progress) {
            me._navigator.readLines(indexToStartWith, me.linesToRead, function linesReadHandler(err, index, lines, eof, progress) {
                if (err) {
                    me._emit("err");
                    return;
                }
                // console.log(lines.length);
                console.log(progress);
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    me.line++;

                    me.numLines++;
                    // me._emit("lines", [me.numLines]);
                    me._readBytes += line.length;
                    me.progress = (me._readBytes / me._totalBytes) * 100;
                    me.validateLine(line);
                }
                // me._emit("progress", [me.progress]);

                if (lastReadBytes == me._readBytes) {
                    me._emit("progress", 100);
                    me._emit("end");
                    me._validateEnd();
                    return;
                }

                if (me._navigator._stop != true) {
                    // me._navigator.readSomeLines(index + lines.length, linesReadHandler);
                    me._navigator.readLines(index + lines.length, me.linesToRead, linesReadHandler);
                } else {
                    me._emit("stop");
                    console.log("STOP!!!!!");
                }

            })

        });

    },
    validateLine: function (line) {
        return true;
    },
    _validateEnd: function () {
        this.validateEnd();
    },
    validateEnd: function () {
        return true;
    },
    addLog: function (type, msg,column) {
        var log = {
            type: type,
            msg: msg,
            line: this.line,
            column: column
        };
        this.log.push(log);
        this._emit("log", log);
    },
    on: function (eventName, cb) {
        this._events[eventName] = cb;
    },
    _emit: function (event, args) {
        if (typeof this._events[event] === 'function') {
            this._events[event].apply(this, Array.prototype.slice.call(arguments, 1));
        }
    },
    _detectCRSeparator: function (file, cb) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var regex = /\r(?!\n)/;
            if (regex.test(e.target.result)) {
                cb(true);
            } else {
                cb(false);
            }
        }
        reader.readAsText(file);
    }
}
