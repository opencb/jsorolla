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

