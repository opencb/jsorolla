function Validator(options) {

    if (!(this instanceof Validator)) {
        return new Validator(options);
    }

    this.file = options.file;
    this._navigator = new FileNavigator(this.file);

    this.log = [];
    this.line = 0;
    this._totalBytes = this.file.size;
    this._readBytes = 0;
    this._events = {};
}

Validator.prototype = {

    validate: function () {

        var me = this;

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
                me.validateLine(line);
            }

            if (eof) {
                me._emit("end");
                return;
            }

            me._navigator.readSomeLines(index + lines.length, linesReadHandler);

        })

    },
    validateLine: function (line) {
        return true;
    },
    progress: function () {
        return (this._readBytes / this._totalBytes) * 100;
    },
    addLog: function (type, msg) {
        this.log.push({
            type: type,
            msg: msg,
            line: this.line
        });
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
