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
}

Validator.prototype = {
    init: function () {
        this.file = null;
        this.log = [];
        this.line = 0;
        this.progress = 0;
        this._readBytes = 0;
    },

    validate: function () {
        var me = this;

        this._navigator = new FileNavigator(this.file);
        this._totalBytes = this.file.size;

        var indexToStartWith = 0;

        this._navigator.readSomeLines(indexToStartWith, function linesReadHandler(err, index, lines, eof, progress) {
            if (err) {
                me._emit("err");
                return;
            }
            console.log(lines.length);
            console.log(progress);

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];

                me.line++;
                me._readBytes += line.length;
                me.progress = (me._readBytes / me._totalBytes) * 100;
                me.validateLine(line);
            }
            me._emit("progress", [me.progress]);

            if (eof) {
                me._emit("progress", [100]);
                me._emit("end");
                return;
            }

            me._navigator.readSomeLines(index + lines.length, linesReadHandler);

        })

    },
    validateLine: function (line) {
        return true;
    },
    addLog: function (type, msg) {
        var log = {
            type: type,
            msg: msg,
            line: this.line
        };
        this.log.push(log);
        this._emit("log", [log]);
    },
    on: function (eventName, cb) {
        this._events[eventName] = cb;
    },
    _emit: function (event, args) {

        var boundEvents = this._events;
        if (typeof boundEvents[event] === 'function') {
            boundEvents[event].apply(this, args);
        }
    }
}
