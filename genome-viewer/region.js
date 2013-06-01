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

function Region(args) {

    this.chromosome = null;
    this.start = null;
    this.end = null;

    if (typeof args != 'undefined') {
        this.chromosome = args.chromosome || this.chromosome;
        this.start = args.start || this.start;
        this.end = args.end || this.end;

        if (args.str != null) {
            this.parse(args.str);
        }
    }
}

Region.prototype = {
    load : function (obj) {
        this.chromosome = obj.chromosome || this.chromosome;
        this.start = obj.start || this.start;
        this.end = obj.end || this.end;
    },

    parse: function (str) {
        var splitDots = str.split(":");
        if (splitDots.length == 2) {
            var splitDash = splitDots[1].split("-");
            this.chromosome = splitDots[0];
            this.start = parseInt(splitDash[0]);
            if (splitDash.length == 2) {
                this.end = parseInt(splitDash[1]);
            } else {
                this.end = this.start;
            }
        }
    },

    center : function () {
        return this.start + Math.floor((this.length()) / 2);
    },

    length : function () {
        return this.end - this.start + 1;
    },

    toString : function (formated) {
        var str;
        if (formated == true) {
            str = this.chromosome + ":" + Utils.formatNumber(this.start) + "-" + Utils.formatNumber(this.end);
        } else {
            str = this.chromosome + ":" + this.start + "-" + this.end;
        }
        return str;
    }
};


