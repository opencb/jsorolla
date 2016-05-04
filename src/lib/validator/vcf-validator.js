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
    this._refTag = false;

    this._duplicates = {};
    this._sorted = true;

    this._prevChrPos = null;

    this._regExp = {
        "headerId": /ID=(\w+)/,
        "headerNumber": /Number=(\w+|\.)/,
        "headerType": /Type=(\w+)/,
        "headerDesc": /Description=\"(.+)\"/,
        "actg": /^[ACGTNactgn]+$/,
        "gt": /^(\.|\d+)([|/](\.|\d+))?$/,
        "alpha": /^(\w+)$/,
        "idSemiColon": /^(\w+(;\w+)?)$/,
        "integer": /^(\d+)$/,
        "float": /^(\d+(\.\d+)?)$/
    }
}

VCFValidator.prototype = Object.create(Validator.prototype);

VCFValidator.prototype.validateLine = function (line) {

    if (this._header) { // parse Header
        this.parseHeader(line);
    } else {
        if (!this._refTag) {
            this._checkReferenceTag();
            this._refTag = true;
        }
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
    } else {
        this.addLog("error", "All header lines must be prefixed by '##");
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

    if (columns.length < 8) {
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

    if (this._contigs[chr] == null) {
        this.addLog("error", "Chromosome must be present on contig tags in header.")
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

    // Check duplicates
    var chr_pos = chr + "_" + pos;
    if (chr_pos in this._duplicates) {
        this.addLog("warning", "There must be no chromosome+position duplicates");
    }

    this._duplicates[chr_pos] = null;

    // Id

    var id = columns[2];

    if (id != ".") {
        if (!this._regExp["alpha"].test(id)) {
            this.addLog("error", "ID must be alphanumeric");
        }

        if (!this._regExp["idSemiColon"].test(id)) {
            this.addLog("error", "If more than one ID is specified, they must be semi-colon separated");
        }
    }

    // ref

    var ref = columns[3];
    if (ref == "") {
        this.addLog("error", "Reference allele must not be empty");
    }

    if (!this._regExp["actg"].test(ref)) {
        this.addLog("error", "Reference allele must match the regular expression /^[ACTGN.]+$/");
    }

    // alt
    var alt = columns[4];

    if (alt == undefined) {}

    var altSplits = alt.split(",");
    var altSplitsUnique = altSplits.filter(function (item, pos) {
        return altSplits.indexOf(item) == pos;
    });

    if (altSplits.length != altSplitsUnique.length) {
        this.addLog("error", "Alternate must contain each allele only once")
    }

    if (altSplitsUnique.indexOf(ref) >= 0) {
        this.addLog("error", "The reference allele must not be in the list of alternate alleles")
    }

    if (alt != "." && alt != "*") {
        for (var i = 0; i < altSplits.length; i++) {

            var altElem = altSplits[i];

            if (!this._regExp["actg"].test(altElem)) {
                this.addLog("error", "Alternate allele must match the regular expression /^[ACTGN]+$/")
            }

            if (altElem.length != ref.length) { // TODO aaleman: Check this
                if (altElem.charAt(0) != ref.charAt(0)) {
                    this.addLog("warning", "The first base of each allele must match the reference if their lengths are different");
                }
            }
        }
    }

    // Qual
    var qual = columns[5];
    if (qual != ".") {
        var qualFloat = parseFloat(qual);
        if (isNaN(qualFloat) || qualFloat < 0) {
            this.addLog("error", "Quality must be a non-negative float");
        }

    }

    // Filter
    var filter = columns[6];
    if (filter == "") {
        this.addLog("error", "Filter status field must not be empty");
    }
    if (filter != 'PASS' && filter != ".") {
        var filterIds = filter.split(";");
        for (var i = 0; i < filterIds.length; i++) {
            var id = filterIds[i];
            if (this._filter[id] == null) {
                this.addLog("warning", "Filter status must be specified in header, be PASS or be set to the missing value '.'");
            }
        }
    }

    var aggregate = columns.length == 8;

    // Info
    var info = columns[7];
    if (info == "") {
        this.addLog("error", "Info field must not be empty");
    }
    var infoFields = info.split(";");
    // if (infoFields.length != Object.keys(this._info).length) {
    //   this.addLog("error", "Info must have the same number of fields specified in header");
    // }

    if (infoFields.length != 1 || infoFields[0] != '.') {
        for (var i = 0; i < infoFields.length; i++) {
            var field = infoFields[i];
            if (field.indexOf("=") > 0) {
                var key = field.substring(0, field.indexOf("="));
                var value = field.substring(field.indexOf("=") + 1);
                if (this._info[key] == null) {
                    this.addLog("warning", "Info field '" + key + "' must be specified in header");
                } else {
                    var v = value.split(",");
                    if (v.length > 1) {
                        switch (this._info[key].number) {
                        case "A":
                            //'A': one value per alternate
                            var expected = altSplits.length;
                            if (expected != v.length) {
                                this.addLog("error", "Wrong number of values in INFO field '" + Key + " (expected one value per alternate)");
                            }
                            break;
                        case "R":
                            //'R': one value for each possible allele
                            var expected = altSplits.length + 1;
                            if (expected != v.length) {
                                this.addLog("error", "Wrong number of values in INFO field '" + Key + " (expected one value for each possible  allele, including the reference)");
                            }
                            break;
                        case "G":
                            //'G': one value for each possible genotype
                            // var expected = altSplits.length * (altSplits.length + 1) / 2;
                            var typeMSG = aggregate ? "warning" : "error";
                            if (!aggregate) {
                                var expected = this._binomial(altSplits.length + this._ploidy, this._ploidy);
                                if (expected != found) {

                                }
                            }
                            this.addLog(typeMSG, "Wrong number of values in INFO field '" + Key + " (expected: '" + expected + "', found: '" + found + "'). Must have one value for each possible genotype");
                            break;
                        }

                        if (this._info[key].type == 'Flag') {
                            this.addLog("warning", "Flag type must not have value");
                        } else {
                            this._checkFormatDataType(v.split(","), this._info[key], 'INFO');
                        }
                    }
                }
            } else {
                if (this._info[field] == null) {
                    this.addLog("warning", "Info field must be specified in header");
                } else if (this._info[field].type != "Flag") {
                    this.addLog("warning", "Info field must be a Flag type or have a data value");
                } else {
                    if (this._info[field].number != 0) {
                        this.addLog("warning", "In Info, Number must be 0 for a Flag type");
                    }
                }
            }
        }
    }

    // if (!(columns.length > 8)) {
    //     return;
    // }

    if (columns.length > 8) {
        // Format
        var format = columns[8];

        if (this._samples.length > 0 && format == "") {
            this.addLog("error", "Must not be empty if the file contains any samples");
        }

        if (format != "" && format.indexOf("GT") >= 0 && !format.startsWith("GT")) {
            this.addLog("error", "GT must be the first field if it is present");
        }

        var formatSplits = format.split(":");
        // ...

        for (var i = 0; i < formatSplits.length; i++) {
            var formatKey = formatSplits[i];
            if (this._format[formatKey] == null) {
                this.addLog("warning", "FORMAT field '" + formatKey + "'must be specified in header");
            }
        }

        // Samples
        var samplesData = [];

        for (var i = 9; i < columns.length; i++) {
            samplesData.push(columns[i]);
        }

        for (var i = 0; i < samplesData.length; i++) {
            var sampleData = samplesData[i];

            if (sampleData == "") {
                this.addLog("error", "Sample fields must be not empty");
            } else {
                var sampleDataSplit = sampleData.split(":");

                for (var j = 0; j < sampleDataSplit.length; j++) {
                    var sampleValue = sampleDataSplit[j];
                    var formatKey = formatSplits[j];
                    var formatElem = this._format[formatKey];

                    if (formatElem == null) {
                        continue;
                    }

                    if (j == 0) { // GT must be the first.

                        var gtGroups = this._regExp["gt"].exec(sampleValue);
                        if (gtGroups.length == 4) { // GT=0/0,0/1....
                            this._ploidy = 2;

                        } else if (gtGroups.length == 2) {
                            this._ploidy = 1;
                            debugger
                        } else {
                            debugger
                        }
                    }

                    // Check Number
                    var found = sampleValue.split(",").length;

                    switch (formatElem.number) {
                    case ".":
                        this._checkFormatDataType(sampleValue.split(","), formatElem, 'FORMAT');
                        break;
                    case "A":
                        var expected = altSplits.length;
                        if (expected != found) {
                            this.addLog("error", "Wrong number of values in FORMAT field '" + formatKey + " (expected one value per alternate)");
                        }
                        this._checkFormatDataType(sampleValue.split(","), formatElem, 'FORMAT');
                        break;
                    case "R":
                        var expected = altSplits.length + 1;
                        if (expected != found) {
                            this.addLog("error", "Wrong number of values in FORMAT field '" + formatKey + " (expected one value for each possible  allele, including the reference)");
                        }
                        this._checkFormatDataType(sampleValue.split(","), formatElem, 'FORMAT');
                        break;
                    case "G":
                        var expected = this._binomial(altSplits.length + this._ploidy, this._ploidy);
                        if (expected != found) {
                            this.addLog("error", "Wrong number of values in FORMAT field '" + formatKey + " (expected: '" + expected + "', found: '" + found + "'). Must have one value for each possible genotype");
                        }
                        this._checkFormatDataType(sampleValue.split(","), formatElem, 'FORMAT');
                        break;
                    default:
                        var expected = parseInt(formatElem.number);
                        if (expected != found) {
                            this.addLog("error", "Wrong number of values in FORMAT field '" + formatKey + " (expected: '" + expected + "', found: '" + found + "'.");
                        }
                        this._checkFormatDataType(sampleValue.split(","), formatElem, 'FORMAT');
                        break;
                    }
                }

                var gt = sampleDataSplit[0];
                if (!this._regExp["gt"].test(gt)) {
                    this.addLog("error", "GT must match the regular expression ^(\.|\d+)([|/]?)");
                } else {
                    var gtGroups = this._regExp["gt"].exec(gt);
                    if (gtGroups.length == 2) { // GT = 0,1
                        var gtAllele = parseInt(gtGroups[1]);
                        if (gtAllele > altSplits.length) {
                            this.addLog("error", "An allele index must not be greater than the number of alleles in that variant");
                        }
                    } else if (gtGroups.length == 4) { // GT = 0/0,0/1,....
                        var gtAllele0 = parseInt(gtGroups[1]);
                        var gtAllele1 = parseInt(gtGroups[3]);

                        if (gtAllele0 > altSplits.length || gtAllele1 > altSplits.length) {
                            this.addLog("error", "An allele index must not be greater than the number of alleles in that variant");
                        }

                    }
                }

                if (sampleDataSplit.length != formatSplits.length) {
                    this.addLog("error", "The number of sub-fields can not be greater than the number in the FORMAT column. Expected : " + formatSplits.length + ", found: " + sampleDataSplit.length);
                }
            }
        }

    }
};

VCFValidator.prototype._checkReferenceTag = function () {

    for (var i = 0; i < this._headerElements.length; i++) {
        var headerElement = this._headerElements[i];
        if (headerElement.id === "reference") {
            return;
        }
    }
    this.addLog("warning", "The tag 'reference' must be present");

};

VCFValidator.prototype._binomial = function (n, k) {
    if ((typeof n !== 'number') || (typeof k !== 'number'))
        return false;
    var coeff = 1;
    for (var x = n - k + 1; x <= n; x++) coeff *= x;
    for (x = 1; x <= k; x++) coeff /= x;
    return coeff;
};

VCFValidator.prototype._isInt = function (value) {
    var x;
    if (isNaN(value)) {
        return false;
    }
    x = parseFloat(value);
    return (x | 0) === x;
};

VCFValidator.prototype._isInt = function (n) {
    return this._regExp["integer"].test(n);
};

VCFValidator.prototype._isFloat = function (n) {
    return this._regExp["float"].test(n);
};

VCFValidator.prototype._checkFormatDataType = function (data, formatElem, field) {
    for (var i = 0; i < data.length; i++) {
        var elem = data[i];

        if (formatElem.type === "Integer") {
            if (!this._isInt(elem)) {
                this.addLog("error", field + " field '" + formatElem.id + "' defined as '" + formatElem.type + "' . Value '" + elem + "' is not '" + formatElem.type + "'.");
            }
        } else if (formatElem.type === "Float") {
            if (!this._isFloat(elem)) {
                this.addLog("error", field + " field '" + formatElem.id + "' defined as '" + formatElem.type + "' . Value '" + elem + "' is not '" + formatElem.type + "'.");
            }
        } else if (formatElem.type === "Character") {
            if (elem.length > 1) {
                this.addLog("error", field + " field '" + formatElem.id + "' defined as '" + formatElem.type + "' . Expected one character, found '" + elem.length + "'");
            }
        }
    }
};
