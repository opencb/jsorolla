function VCFValidator(options) {
    if (!(this instanceof VCFValidator)) {
        return new VCFValidator(options);
    }
    Validator.call(this, options);

    this._header = true;
    this._fileFormat = false;
    this._contigs = {};
    this._info = {};
    this._format = {};
    this._filter = {};
    this._headerElements = [];
    this._samples = [];
    this._columnsSize = 0;

    this._regExp = {
        "headerId": /ID=(\w+)/,
        "headerNumber": /Number=(\w+|\.)/,
        "headerType": /Type=(\w+)/,
        "headerDesc": /Description=\"(.+)\"/,
        "actg": /^[ACGTN]+$/
    }
}

VCFValidator.prototype = Object.create(Validator.prototype);

VCFValidator.prototype.validateLine = function (line) {

    if (this._header) { // parse Header
        this.parseHeader(line);
    } else {
        if (!this._fileFormat) {
            this.addLog("error", "The file format declaration must be present");
            this._fileFormat = true;
        }
        this.parseData(line);
    }

}

VCFValidator.prototype.isHeaderLine = function (line) {
    return line.startsWith("#");
}

VCFValidator.prototype.parseHeader = function (line) {
    if (this.line == 0) { // parse fileformat
        if (!line.startsWith("##fileformat=")) {
            this.addLog("error", "The file format declaration must be the first line in the file");
        }
    }

    if (line.startsWith("##")) {
        var lineData = line.substring(2);
        var key = lineData.substring(0, lineData.indexOf("="))
        var value = lineData.substring(lineData.indexOf("=") + 1)

        if (key == "" || value == "") {
            this.addLog("error", "All lines must be key=value pairs.")
        }

        if (key.toLowerCase() == "fileformat") {
            this._fileFormat = true;

        } else if (key.toLowerCase() == "contig") {
            var contigId = this._getDataFromRegExp(value, "headerId");
            this._contigs[contigId] = contigId;
        } else if (key.toLowerCase() == "info") {
            var id = this._getDataFromRegExp(value, "headerId");
            var number = this._getDataFromRegExp(value, "headerNumber");
            var type = this._getDataFromRegExp(value, "headerType");
            var description = this._getDataFromRegExp(value, "headerDesc");

            if (id == null || number == null || type == null || description == null) {
                this.addLog("error", "INFO fields must be described as ##INFO=<ID=ID,Number=number,Type=type,Description='description'> ")
            }

            this._info[id] = {
                id: id,
                number: number,
                type: type,
                description: description
            }
        } else if (key.toLowerCase() == "format") {
            var id = this._getDataFromRegExp(value, "headerId");
            var number = this._getDataFromRegExp(value, "headerNumber");
            var type = this._getDataFromRegExp(value, "headerType");
            var description = this._getDataFromRegExp(value, "headerDesc");

            if (id == null || number == null || type == null || description == null) {
                this.addLog("error", "FORMAT fields must be described as ##FORMAT=<ID=ID,Number=number,Type=type,Description='description'> ")
            }

            this._format[id] = {
                id: id,
                number: number,
                type: type,
                description: description
            }
        } else if (key.toLowerCase() == "filter") {
            var id = this._getDataFromRegExp(value, "headerId");
            var description = this._getDataFromRegExp(value, "headerDesc");

            if (id == null || description == null) {
                this.addLog("error", "FILTER fields must be described as ##FILTER=<ID=ID,Description='description'>")
            }

            this._filter[id] = {
                id: id,
                description: description
            }

        } else {

            this._headerElements.push({
                id: key,
                value: value
            });
        }

    } else if (line.startsWith("#CHROM")) {
        this._header = false;
        splits = line.split("\t");
        this._columnsSize = splits.length;
        if (splits.length < 8) {
            this.addLog("error", "Must contain at least 8 columns(CHROM to INFO)");
        } else if (splits.length > 9) {
            for (var i = 9; i < splits.length; i++) {
                this._samples.push(splits[i]);
            }
        }
    }
}

VCFValidator.prototype._getDataFromRegExp = function (data, regExpId) {
    var regExp = this._regExp[regExpId];
    if (regExp == null) {
        return null;
    }
    if (regExp.test(data)) {
        var groups = regExp.exec(data);
        if (groups != null && groups.length > 1) {
            return groups[1];
        }
    }
    return null;

}

VCFValidator.prototype.parseData = function (line) {
    if (this.isHeaderLine(line)) {
        this.addLog("error", "Must not start with a header prefix (#)");
        return;
    }

    var columns = line.split("\t");

    if (columns.length < 9) {
        this.addLog("error", "Must contain at least 8 columns(CHROM to INFO)");
    } else if (columns.length - 9 != this._samples.length) {
        this.addLog("error", "The number of samples must match those listed in the header");
    }

    if (this._columnsSize != columns.length) {
        this.addLog("error", "All ines must have the same number of columns");
    }

    // Chromosome
    var chr = columns[0];
    if (chr == "") {
        this.addLog("error", "Chromosome must not be empty");
    }
    if (chr.search(":") >= 0) {
        this.addLog("error", "Chromosome must not contain colons");
    }
    if (chr.search(" ") >= 0) {
        this.addLog("error", "Chromosome must not contain whitespaces");
    }

    // Position
    var pos = columns[1]
    if (pos == "") {
        this.addLog("error", "Position must not be empty");
    }
    pos = parseInt(pos)
    if (isNaN(pos)) {
        this.addLog("error", "Position must be numeric");
    }

    // Id

    var id = columns[2];




    // ref

    var ref = columns[3];
    if(ref == ""){
      this.addLog("error", "Reference allele must not be empty");
    }

    if(!this._regExp["actg"].test(ref)){
      this.addLog("error", "Reference allele must match the regular expression /^[ACTGN]+$/");
    }

}
