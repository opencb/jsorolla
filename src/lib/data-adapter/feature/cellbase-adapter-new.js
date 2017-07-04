/*
 * Copyright (c) 2016 Pedro Furio (Genomics England)
 * Copyright (c) 2016 Ignacio Medina (University of Cambridge)
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

class CellBaseAdapter {

    constructor (client, category, subcategory, resource, params = {}, options = {}, handlers = {}) {
        this.client = client;
        this.category = category;
        this.subCategory = subcategory;
        this.resource = resource;
        this.params = params;
        this.options = options;
        this.handlers = handlers;

        if (!this.options.hasOwnProperty("chunkSize")) {
            this.options.chunkSize = 50000;
        }

        // Extend backbone events
        Object.assign(this, Backbone.Events);
        // _.extend(this, args);
        this.on(this.handlers);
    }

    setSpecies (species) {
        this.species = species;
    }

    setClient (client) {
        this.client = client;
    }

    getData (args) {
        let _this = this;

        let params = {};
        //histogram: (dataType == 'histogram')
        Object.assign(params, this.params);
        Object.assign(params, args.params);

        /** 1 region check **/
        let region = args.region;
        if (region.start > 300000000 || region.end < 1) {
            return;
        }
        region.start = (region.start < 1) ? 1 : region.start;
        region.end = (region.end > 300000000) ? 300000000 : region.end;

        /** 2 category check **/
        // var categories = [this.category + this.subCategory + this.resource + Utils.queryString(params)];

        /** 3 dataType check **/
        let dataType = args.dataType;
        if (_.isUndefined(dataType)) {
            console.log("dataType must be provided!!!");
        }

        /** 4 chunkSize check **/
        let chunkSize = this.options.chunkSize; // this.cache.defaultChunkSize should be the same
        if (this.debug) {
            console.log(chunkSize);
        }

        /** 5 client check **/
        if (_.isUndefined(this.client)) {
            console.log("cellbase client must be provided!!!");
        }

        return new Promise(function(resolve, reject) {
            // Create the chunks to be retrieved
            let start = _this._getStartChunkPosition(region.start);
            let end = _this._getStartChunkPosition(region.end);

            let regions = [];
            let myRegion = start;
            args.webServiceCallCount = 0;

            do {
                regions.push(`${region.chromosome}:${myRegion}-${myRegion + _this.options.chunkSize - 1}`);
                myRegion += _this.options.chunkSize;
            } while(myRegion < end);

            let groupedRegions = _this._groupQueries(regions);
            let chunks = [];
            for (let i = 0; i < groupedRegions.length; i++) {
                args.webServiceCallCount++;
                _this.client.get(_this.category, _this.subCategory, groupedRegions[i], _this.resource, params)
                    .then(function (response) {
                        let responseChunks = _this._cellbaseSuccess(response, dataType, chunkSize);
                        args.webServiceCallCount--;

                        chunks = chunks.concat(responseChunks);
                        if (args.webServiceCallCount === 0) {
                            chunks.sort(function (a, b) {
                                return a.chunkKey.localeCompare(b.chunkKey);
                            });
                            resolve({items: chunks, dataType: dataType, chunkSize: chunkSize, sender: _this});
                        }
                    })
                    .catch(function () {
                        reject("Server error");
                    });
            }
        });
    }

    _getStartChunkPosition (position) {
        return Math.floor(position / this.options.chunkSize) * this.options.chunkSize;
    }

    _cellbaseSuccess (data, dataType, chunkSize) {
        let timeId = `${Utils.randomString(4) + this.resource} save`;
        console.time(timeId);
        /** time log **/

        let regions = [];
        let chunks = [];
        for (let i = 0; i < data.response.length; i++) {    // TODO test what do several responses mean
            let queryResult = data.response[i];
            if (dataType == "histogram") {
                for (let j = 0; j < queryResult.result.length; j++) {
                    let interval = queryResult.result[j];
                    let region = new Region(interval);
                    regions.push(region);
                    chunks.push(interval);
                }
            } else {
                regions.push(new Region(queryResult.id));
                chunks.push(queryResult.result);
            }
        }

        let items = [];
        for (let i = 0; i < regions.length; i++) {
            let chunkStartId = Math.floor(regions[i].start / this.options.chunkSize);
            items.push({
                chunkKey: `${regions[i].chromosome}:${chunkStartId}_${dataType}_${chunkSize}`,
                // chunkKey: this._getChunkKey(regions[i].chromosome, chunkStartId),
                region: regions[i],
                value: chunks[i]
            });
        }

        /** time log **/
        console.timeEnd(timeId);

        return items;
    }

    /**
     * Transform the list on a list of lists, to limit the queries
     * [ r1,r2,r3,r4,r5,r6,r7,r8 ]
     * [ [r1,r2,r3,r4], [r5,r6,r7,r8] ]
     */
    _groupQueries (uncachedRegions) {
        let groupSize = 50;
        let queriesLists = [];
        while (uncachedRegions.length > 0) {
            queriesLists.push(uncachedRegions.splice(0, groupSize).toString());
        }
        return queriesLists;
    }
}
