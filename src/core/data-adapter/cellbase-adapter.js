/*
 * Copyright 2015-2024 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import FeatureAdapter from "./feature-adapter.js";
import Region from "../bioinfo/region.js";

export default class CellBaseAdapter extends FeatureAdapter {

    constructor (client, category, subcategory, resource, params = {}, options = {}, handlers = {}) {
        super();

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

        /** 5 client check **/
        if (_.isUndefined(this.client)) {
            console.log("cellbase client must be provided!!!");
        }

        return new Promise(function(resolve, reject) {
            // Create the chunks to be retrieved
            let start = _this._getStartChunkPosition(region.start);
            let regions = [];
            do {
                regions.push(`${region.chromosome}:${start}-${start + _this.options.chunkSize - 1}`);
                start += _this.options.chunkSize;
            } while(start <= region.end);

            _this.client.get(_this.category, _this.subCategory, regions.join(","), _this.resource, params)
                .then(function (response) {
                    let responseChunks = _this._cellbaseSuccess(response, dataType, chunkSize);
                    resolve({items: responseChunks, dataType: dataType, chunkSize: chunkSize, sender: _this});
                })
                .catch(function () {
                    reject("Server error");
                });
        });
    }

    _getStartChunkPosition (position) {
        return Math.floor(position / this.options.chunkSize) * this.options.chunkSize;
    }

    _cellbaseSuccess (data, dataType, chunkSize) {
        //let timeId = `${Utils.randomString(4) + this.resource} save`;
        //console.time(timeId);
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
                region: regions[i],
                value: chunks[i]
            });
        }
        /** time log **/
        //console.timeEnd(timeId);
        return items;
    }
}
