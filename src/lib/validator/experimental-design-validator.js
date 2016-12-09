function ExperimentalDesignValidator(options) {
    if (!(this instanceof ExperimentalDesignValidator)) {
        return new ExperimentalDesignValidator(options);
    }
    Validator.call(this, options);

    // this._header = true;
    this._duplicates = {};
    this._sorted = true;

}

ExperimentalDesignValidator.prototype = Object.create(Validator.prototype);

ExperimentalDesignValidator.prototype.validateLine = function (line, isLast) {
    this.parseData(line);
}

ExperimentalDesignValidator.prototype.validateEnd = function () {
    if (this.numLines < 1) {
        this.addLog("error", "The file is empty");
    }
}

ExperimentalDesignValidator.prototype.parseData = function (line, isLast) {
    if (line == "") {
        if (!isLast)
            this.addLog("warning", "Empty line.");
    } else {
        var columns = line.split("\t");

        if (columns.length < 2) {
            this.addLog("error", "Number of columns must be 2");
        }
    }
}
