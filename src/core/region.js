
class Region {

    constructor(args) {
        this.chromosome = null;
        this.start = null;
        this.end = null;

        this.chromosomeAlias = ["chromosome", "sequenceName"];
        if (_.isObject(args)) {
            this.load(args);
        } else if (_.isString(args)) {
            this.parse(args);
        }
    }

    load(obj) {
        if (_.isString(obj)) {
            return this.parse(obj);
        }
        this.chromosome = this._checkChromosomeAlias(obj) || this.chromosome;

        if (typeof obj.position !== "undefined") {
            obj.start = parseInt(obj.position);
            obj.end = obj.start;
        }

        (UtilsNew.isUndefinedOrNull(obj.start)) ? this.start = parseInt(this.start) : this.start = parseInt(obj.start);
        (UtilsNew.isUndefinedOrNull(obj.end)) ? this.end = parseInt(this.end) : this.end = parseInt(obj.end);
    }

    parse(str) {
        if (_.isObject(str)) {
            this.load(obj);
        }
        const pattern = /^([a-zA-Z0-9_])+\:([0-9])+\-([0-9])+$/;
        const pattern2 = /^([a-zA-Z0-9_])+\:([0-9])+$/;
        if (pattern.test(str) || pattern2.test(str)) {
            const splitDots = str.split(":");
            if (splitDots.length === 2) {
                const splitDash = splitDots[1].split("-");
                this.chromosome = splitDots[0];
                this.start = parseInt(splitDash[0]);
                if (splitDash.length === 2) {
                    this.end = parseInt(splitDash[1]);
                } else {
                    this.end = this.start;
                }
            }
            return true;
        }
        return false;
    }

    multiParse(str) {
        if (_.isObject(str)) {
            this.load(obj);
        }
        const pattern = /^([a-zA-Z0-9_])+\:([0-9])+\-([0-9])+(,([a-zA-Z0-9_])+\:([0-9])+\-([0-9])+)*$/;
        const pattern2 = /^\[([a-zA-Z0-9_])+\:([0-9])+\-([0-9])+(,([a-zA-Z0-9_])+\:([0-9])+\-([0-9])+)*\]$/;

        let withoutBrackets = str;
        if (pattern2.test(str)) {
            withoutBrackets = str.slice(1, str.length - 1);
        }

        const regions = [];
        if (pattern.test(withoutBrackets)) {
            const splitRegions = withoutBrackets.split(",");
            for (let i = 0; i < splitRegions.length; i++) {
                regions.push(new Region(splitRegions[i]));
            }
        }
        return regions;
    }

    center() {
        return this.start + Math.floor((this.length()) / 2);
    }

    length() {
        return this.end - this.start + 1;
    }

    equals(r) {
        return this.chromosome === r.chromosome && this.start === r.start && this.end === r.end;

    }

    toString(formatted) {
        let str;
        if (formatted === true) {
            str = `${this.chromosome}:${Utils.formatNumber(this.start)}-${Utils.formatNumber(this.end)}`;
        } else {
            str = `${this.chromosome}:${this.start}-${this.end}`;
        }
        return str;
    }

    _checkChromosomeAlias(obj) {
        for (let i = 0; i < this.chromosomeAlias.length; i++) {
            const alias = this.chromosomeAlias[i];
            if (alias in obj) {
                return obj[alias];
            }
        }
    }

}


