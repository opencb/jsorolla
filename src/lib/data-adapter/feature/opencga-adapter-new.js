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

/**
 * Created by pfurio on 16/11/16.
 */

class OpencgaAdapter {

    constructor(client, category, subcategory, resource, params = {}, options = {}, handlers = {}) {

        this.client = client;
        this.category = category;
        this.subCategory = subcategory;
        this.resource = resource;
        this.params = params;
        this.options = options;
        this.handlers = handlers;

        if (!this.options.hasOwnProperty("chunkSize")) {
            this.options.chunkSize = 3000;
        }

        _.extend(this, Backbone.Events);
        this.on(this.handlers);
    }

    // Deprecated method
    setSpecies(species) {
        // this.species = species;
    }

    getAlignmentData(args) {
        var _this = this;
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


        /** 2 category check **/
        var categories = this.resource.toString().split(',');   // in this adapter each category is each file

        /** 3 dataType check **/
        var dataType = args.dataType;
        if (_.isUndefined(dataType)) {
            console.log("dataType must be provided!!!");
        }

        /** 4 chunkSize check **/
        var chunkSize = params.interval ? params.interval : this.options.chunkSize; // this.cache.defaultChunkSize should be the same
        if (this.debug) {
            console.log(chunkSize);
        }

        /** 5 file check **/
        var fileId = params.fileId;
        if (fileId === undefined) {
            return;
        }

        var study = params.study;

        // Create the chunks to be retrieved
        let start = this._getStartChunkPosition(region.start);
        let end = this._getStartChunkPosition(region.end);

        let regions = [];
        let myRegion = start;
        args.webServiceCallCount = 0;

        do {
            regions.push(`chr${region.chromosome}:${myRegion}-${myRegion + this.options.chunkSize - 1}`);
            myRegion += this.options.chunkSize;
        } while(myRegion < end);

        let groupedRegions = this._groupQueries(regions);
        args.regions = groupedRegions;

        if (dataType === "features") {
            let chunks = [];
            for (let i = 0; i < groupedRegions.length; i++) {
                args.webServiceCallCount++;

                let alignments = this.client.alignments().query(fileId,
                    {
                        region: groupedRegions[i],
                        study: study
                    })
                    .then(function (response) {
                        return _this._opencgaSuccess(response, categories, dataType, chunkSize, args);
                    });


                let coverage = this.client.alignments().coverage(fileId,
                    {
                        region: groupedRegions[i],
                        study: study
                    })
                    .then(function (response) {
                        let aux = _this._opencgaSuccess(response, categories, dataType, chunkSize, args);
                        // We fix a little the object
                        for (let i = 0; i < aux.length; i++) {
                            aux[i].windowSize = aux[i].value[0].windowSize;
                            aux[i].value = aux[i].value[0].values;
                        }
                        return aux;
                    });

                Promise.all([alignments, coverage]).then(function (response) {
                    args.webServiceCallCount--;
                    let auxArray = [];
                    // The array of alignments and coverage should be the same size
                    for (let i = 0; i < response[0].length; i++) {
                        if (response[0][i].chunkKey === response[1][i].chunkKey) {
                            let auxObject = {
                                region: response[0][i].region,
                                chunkKey: response[0][i].chunkKey,
                                alignments: response[0][i].value,
                                coverage: {
                                    windowSize: response[1][i].windowSize,
                                    value: response[1][i].value
                                }
                            };
                            auxArray.push(auxObject);
                        } else {
                            console.log("Unexpected behaviour when retrieving alignments and coverage. Something went wrong.");
                            console.log("Alignment chunk key: " + response[0][i].chunkKey + ". Coverage chunk key: "
                                + response[1][i].chunkKey);
                            return;
                        }
                    }
                    chunks = chunks.concat(auxArray);

                    if (args.webServiceCallCount === 0) {
                        args.done({
                            items: chunks, dataType: dataType, chunkSize: chunkSize, sender: _this
                        });
                    }
                });
            }
        } else { // histogram
            this.client.alignments().coverage(fileId,
                {
                    region: `chr${region.chromosome}:${start}-${end - 1}`,
                    study: study,
                    windowSize: Math.round((end - start)/500)
                })
                .then(function (response) {
                    let aux = _this._opencgaSuccess(response, categories, dataType, chunkSize, args);
                    let auxArray = [];

                    for (let i = 0; i < aux.length; i++) {
                        let windowSize = aux[i].value[0].windowSize;
                        let start = aux[i].region.start;

                        for (let j = 0; j < aux[i].value[0].values.length; j++) {
                            auxArray.push({
                                value: {
                                    start: start,
                                    end: start + windowSize - 1,
                                    features_count: aux[i].value[0].values[j]
                                }
                            });

                            start += windowSize;
                        }
                    }

                    args.done({
                        items: auxArray, dataType: dataType, chunkSize: chunkSize, sender: _this
                    });


                });
        }
    }

    _opencgaSuccess(data, categories, dataType, chunkSize, args) {
        var timeId = Utils.randomString(4) + this.resource + " save";
        console.time(timeId);
        /** time log **/
        var responseItems = [];
        for (var i = 0; i < data.response.length; i++) {
            // var chunks = [];
            // var queryResult = data.response[i].result;
            responseItems.push({
                chunkKey: data.response[i].id,
                region: new Region(data.response[i].id),
                value: data.response[i].result
            });
            // for (var j = 0; j < queryResult.length; j++) {
            //     chunks.push(queryResult[j])
            // }
            // var items = this._adaptChunks(queryResult, categories[i], dataType, chunkSize);
            // responseItems = responseItems.concat(items);
        }

        /** time log **/
        console.timeEnd(timeId);

        return responseItems;

    }

    _getStartChunkPosition (position) {
        return Math.floor(position / this.options.chunkSize) * this.options.chunkSize;
    }

    /**
     * Transform the list on a list of lists, to limit the queries
     * [ r1,r2,r3,r4,r5,r6,r7,r8 ]
     * [ [r1,r2,r3,r4], [r5,r6,r7,r8] ]
     */
    _groupQueries(uncachedRegions) {
        var groupSize = 50;
        var queriesLists = [];
        while (uncachedRegions.length > 0) {
            queriesLists.push(uncachedRegions.splice(0, groupSize).toString());
        }
        return queriesLists;
    }

    _adaptChunks(queryResult, category, dataType, chunkSize) {
        var chunks;
        var regions;
        var items = [];
//        debugger
        if (queryResult.resultType == "org.opencb.biodata.models.variant.Variant") {
            chunks = [];
            regions = [];
            var keyToPair = {};
            for (var i = 0; i < queryResult.result.length; i++) {
                var variation = queryResult.result[i];
                var chunkId = this.cache.getChunkId(variation.start, chunkSize);
                var key = this.cache.getChunkKey(variation.chromosome,
                    chunkId,
                    dataType,
                    chunkSize);

                if (keyToPair[key] == undefined) {
                    keyToPair[key] = chunks.length;
                    regions.push(new Region({chromosome: variation.chromosome, start: chunkId * chunkSize, end: (chunkId + 1) * chunkSize - 1}));
                    chunks.push([]);
                }
                chunks[keyToPair[key]].push(variation);
            }

//            debugger
            items = this.cache.putByRegions(regions, chunks, category, dataType, chunkSize);
        } else { //if(queryResult.resultType == "org.opencb.biodata.models.alignment.AlignmentRegion") {
            regions = [];
            for (var j = 0; j < queryResult.result.length; j++) {
                regions.push(new Region(queryResult.result[j]));
            }
            chunks = queryResult.result;

//            if (data.response[i].result.length == 1) {
//            } else {
//                console.log("unexpected data structure");
//            }
            items = this.cache.putByRegions(regions, chunks, category, dataType, chunkSize);
        }
        return items;
    }

}