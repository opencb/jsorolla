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

function SequenceAdapter(args) {

    _.extend(this, Backbone.Events);

    this.id = Utils.genId("TrackListPanel");

    //set default args
    this.host;
    this.version;
    this.gzip = true;

    //set instantiation args, must be last
    _.extend(this, args);

    this.sequence = {};
    this.start = {};
    this.end = {};

    this.on(this.handlers);
}

SequenceAdapter.prototype.clearData = function () {
    this.sequence = {};
    this.start = {};
    this.end = {};
};

SequenceAdapter.prototype.getData = function (args) {
    var _this = this;

    this.sender = args.sender;
    var region = args.region;
    var chromosome = region.chromosome;

    region.start = (region.start < 1) ? 1 : region.start;
    region.end = (region.end > 300000000) ? 300000000 : region.end;

    //clean when the new position is too far from current
    if (region.start < this.start[chromosome] - 5000 || region.end > this.end[chromosome] + 5000) {
        this.clearData();
    }

    var params = {};
    _.extend(params, this.params);


    var queryString = this._getSequenceQuery(region);

    if (queryString != "") {

        CellBaseManager.get({
            host: this.host,
            version: this.version,
            species: this.species,
            category: this.category,
            subCategory: this.subCategory,
            query: queryString,
            resource: this.resource,
            params: params,
            success: function (data) {
                _this._processSequenceQuery(data, true);
            }
        });


    } else {
        if (this.sender != "move") {
            this.trigger('data:ready', {
                items: {
                    sequence: this.sequence[chromosome],
                    start: this.start[chromosome],
                    end: this.end[chromosome]
                },
                params: params,
                sender: this
            });
        }
    }

};

SequenceAdapter.prototype._getSequenceQuery = function (region) {
    var _this = this;
    var chromosome = region.chromosome;

    var s, e, query, querys = [];
    if (_this.start[chromosome] == null && _this.end[chromosome] == null) {
        //args.start -= 100;
        //args.end += 100;
        _this.start[chromosome] = region.start;
        _this.end[chromosome] = region.end;
        s = region.start;
        e = region.end;
        query = chromosome + ":" + s + "-" + e;
        querys.push(query);
    } else {
        if (region.start < _this.start[chromosome]) {
            s = region.start;
            e = _this.start[chromosome] - 1;
            e = (e < 1) ? region.end = 1 : e;
            _this.start[chromosome] = s;
            query = region.chromosome + ":" + s + "-" + e;
            querys.push(query);
        }
        if (region.end > _this.end[chromosome]) {
            e = region.end;
            s = _this.end[chromosome] + 1;
            _this.end[chromosome] = e;
            query = region.chromosome + ":" + s + "-" + e;
            querys.push(query);
        }
    }
    return querys.toString();
};

SequenceAdapter.prototype._processSequenceQuery = function (data, throwNotify) {
    var _this = this;
    var params = data.params;


    for (var i = 0; i < data.response.length; i++) {
        var queryResponse = data.response[i];
        var splitDots = queryResponse.id.split(":");
        var splitDash = splitDots[1].split("-");
        var queryStart = parseInt(splitDash[0]);
        var queryEnd = parseInt(splitDash[1]);

        var queryId = queryResponse.id;
        var seqResponse = queryResponse.result[0];


        var chromosome = seqResponse.chromosome;
        if (typeof chromosome === 'undefined') {
            chromosome = seqResponse.sequenceName;
        }

        if (this.sequence[chromosome] == null) {
            this.sequence[chromosome] = seqResponse.sequence;
        } else {
            if (queryStart == this.start[chromosome]) {
                this.sequence[chromosome] = seqResponse.sequence + this.sequence[chromosome];
            } else {
                this.sequence[chromosome] = this.sequence[chromosome] + seqResponse.sequence;
            }
        }

        if (this.sender == "move" && throwNotify == true) {
            this.trigger('data:ready', {
                items: {
                    sequence: seqResponse.sequence,
                    start: queryStart,
                    end: queryEnd
                },
                params: params,
                sender: this
            });
        }
    }

    if (this.sender != "move" && throwNotify == true) {
        this.trigger('data:ready', {
            items: {
                sequence: this.sequence[chromosome],
                start: this.start[chromosome],
                end: this.end[chromosome]
            },
            params: params,
            sender: this
        });
    }
};

//Used by bam to get the mutations
SequenceAdapter.prototype.getNucleotidByPosition = function (args) {
    var _this = this;
    if (args.start > 0 && args.end > 0) {
        var queryString = this._getSequenceQuery(args);

        var chromosome = args.chromosome;

        if (queryString != "") {
            var data = CellBaseManager.get({
                host: this.host,
                version: this.version,
                species: this.species,
                category: this.category,
                subCategory: this.subCategory,
                query: queryString,
                resource: this.resource,
                params: this.params,
                async: false
            });
            _this._processSequenceQuery(data);
        }
        if (this.sequence[chromosome] != null) {
            var referenceSubStr = this.sequence[chromosome].substr((args.start - this.start[chromosome]), 1);
            return referenceSubStr;
        } else {
            console.log("SequenceRender: this.sequence[chromosome] is undefined");
            return "";
        }
    }
};
