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

function EnsemblAdapter(args) {

    _.extend(this, Backbone.Events);

    _.extend(this, args);

    this.on(this.handlers);

    this.cache = new FeatureChunkCache(this.cacheConfig);
}

EnsemblAdapter.prototype = {

    getData: function (args) {
        var _this = this;
        args.webServiceCallCount = 0;

        var params = {};
//                    histogram: (dataType == 'histogram')
        _.extend(params, this.params);
        _.extend(params, args.params);

        /** 1 region check **/
        var region = args.region;
        if (region.start > 300000000 || region.end < 1) {
            return;
        }
        region.start = (region.start < 1) ? 1 : region.start;
        region.end = (region.end > 300000000) ? 300000000 : region.end;

        /** 3 dataType check **/
        var dataType = args.dataType;
        if (_.isUndefined(dataType)) {
            console.log("dataType must be provided!!!");
        }

        /** 2 category check **/
        var categories = [dataType];

        /** 4 chunkSize check **/
        var chunkSize = args.params.interval? args.params.interval : this.cacheConfig.chunkSize; // this.cache.defaultChunkSize should be the same
        if (this.debug) {
            console.log(chunkSize);
        }

        /**
         * Get the uncached regions (uncachedRegions) and cached chunks (cachedChunks).
         * Uncached regions will be used to query cellbase. The response data will be converted in chunks
         * by the Cache TODO????
         * Cached chunks will be returned by the args.dataReady Callback.
         */
        this.cache.get(region, categories, dataType, chunkSize, function (cachedChunks, uncachedRegions) {

            if (uncachedRegions.length > 0) {
                var queryRegionStrings = uncachedRegions;
                for (var i = 0; i < queryRegionStrings.length; i++) {
                    args.webServiceCallCount++;
                    _this._get(queryRegionStrings[i], params, categories, chunkSize, args);
                }
            }
            // Get chunks from cache
            if (cachedChunks.length > 0) {
                if (args.webServiceCallCount === 0) {
                    args.done();
                }
                _this.trigger('data:ready', {items: cachedChunks[categories[0]], dataType: dataType, chunkSize: chunkSize, sender: _this});
            }
        });
    },

    _get: function (query, params, categories, chunkSize, args) {
        var _this = this;
        EnsemblManager.get({
            host: _this.host,
            species: _this.species,
            category: _this.category,
            subCategory: _this.subCategory,
            query: query,
            params: params,
            success: function (data) {
                var transformedData = _this._transformResponse(data, query);
                _this._success(transformedData, categories, undefined, chunkSize, args);
            }
        });
    },

    _success: function (data, categories, dataType, chunkSize, args) {
        args.webServiceCallCount--;
        var timeId = Utils.randomString(4) + this.resource + " save";
        console.time(timeId);
        /** time log **/

        var regions = [];
        var chunks = [];
        for (var i = 0; i < data.response.length; i++) {
            var queryResult = data.response[i];
            regions.push(new Region(queryResult.id));
            chunks.push(queryResult.result);
        }
        var items = this.cache.putByRegions(regions, chunks, categories, dataType, chunkSize);

        /** time log **/
        console.timeEnd(timeId);

        if (args.webServiceCallCount === 0) {
            args.done();
        }

        if (items.length > 0) {
            this.trigger('data:ready', {items: items, dataType: dataType, chunkSize: chunkSize, sender: _this});
        }
    },

    _transformResponse: function (data, query) {
//        id: "ENSG00000189167"
//        source: "Ensembl"
//        name: "ZAR1L"
//        biotype: "protein_coding"
//        status: "KNOWN"
//        chromosome: "13"
//        start: 32877837
//        end: 32889481
//        strand: "-"
//        description: "zygote arrest 1-like [Source:HGNC Symbol;Acc:37116]"


//        ID: "ENSG00000073910"
//        source: "ensembl"
//        external_name: "FRY"
//        logic_name: "ensembl_havana_gene"
//        feature_type: "gene"
//        description: "furry homolog (Drosophila) [Source:HGNC Symbol;Acc:20367]"
//        biotype: "protein_coding"
//        end: 32870794
//        seq_region_name: "13"
//        strand: 1
//        start: 32605437

        for (var i = 0; i < data.length; i++) {
            var f = data[i];
            f.id = f.ID;
            delete f.ID;
            f.name = f.external_name;
            delete f.external_name;
            f.chromosome = f.seq_region_name;
            delete f.seq_region_name;
        }

        var r = {
            response: []
        };
        var result = {
            id: query,
            result: data
        };
        r.response.push(result);
        return  r;
    }
};

