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

    this.cache = {};
}

EnsemblAdapter.prototype = {

    getData: function (args) {
        var _this = this;

        /** Check region and parameters **/
        var region = args.region;
        if (region.start > 300000000 || region.end < 1) {
            return;
        }
        region.start = (region.start < 1) ? 1 : region.start;
        region.end = (region.end > 300000000) ? 300000000 : region.end;


        var params = {};
        _.extend(params, this.params);
        _.extend(params, args.params);

        var dataType = args.dataType;
        if (_.isUndefined(dataType)) {
            console.log("dataType must be provided!!!");
        }
        var chunkSize;


        /** Check dataType histogram  **/
        if (dataType == 'histogram') {

            /** Features: genes, snps ... **/
        } else {
            // Features will be saved using the dataType features
            if (_.isUndefined(this.cache[dataType])) {
                this.cache[dataType] = new FeatureChunkCache(this.cacheConfig);
            }
            chunkSize = this.cache[dataType].chunkSize;

            // Get cached chunks and not cached chunk regions
            //        --------------------             -> Region needed
            // |----|----|----|----|----|----|----|    -> Logical chunk division
            //      |----|----|----|----|----|         -> Chunks covered by needed region
            //      |----|++++|++++|----|----|         -> + means the chunk is cached so its region will not be retrieved
            this.cache[dataType].getCachedByRegion(region, function(chunksByRegion){
                if (chunksByRegion.notCached.length > 0) {
                    var queryRegionStrings = _.map(chunksByRegion.notCached, function (region) {
                        return new Region(region).toString();
                    });

                    for (var i = 0; i < queryRegionStrings.length; i++) {
                        _this._get(queryRegionStrings[i], params, dataType);
                    }
                }
                // Get chunks from cache
                if (chunksByRegion.cached.length > 0) {
                    _this.cache[dataType].getByRegions(chunksByRegion.cached, function (cachedChunks) {
                        _this.trigger('data:ready', {items: cachedChunks, dataType: dataType, chunkSize: chunkSize, sender: _this});
                    });
                }
            });
        }
    },

    _get: function (query, params, dataType) {
        var _this = this;
        EnsemblManager.get({
            host: this.host,
            species: this.species,
            category: this.category,
            subCategory: this.subCategory,
            query: query,
            params: params,
            success: function (data) {
                var data = _this._transformResponse(data, query);
                _this._success(data, dataType);
            }
        });
    },

    _success: function (data, dataType) {
        var timeId = this.resource + " save " + Utils.randomString(4);
        console.time(timeId);
        /** time log **/

        var chunkSize = this.cache[dataType].chunkSize;

        var chunks = [];
        for (var i = 0; i < data.response.length; i++) {
            var queryResult = data.response[i];

            var region = new Region(queryResult.id);
            var features = queryResult.result;
            var chunk = this.cache[dataType].putByRegion(region, features);
            chunks.push(chunk);
        }

        /** time log **/
        console.timeEnd(timeId);


        if (chunks.length > 0) {
            this.trigger('data:ready', {items: chunks, dataType: dataType, chunkSize: chunkSize, sender: this});
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
        }
        r.response.push(result);
        return  r;
    }
};

