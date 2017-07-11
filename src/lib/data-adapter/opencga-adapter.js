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

        Object.assign(this, Backbone.Events);
        this.on(this.handlers);
    }

    // Deprecated method
    setSpecies(species) {
        // this.species = species;
    }

    _checks(args){

        /** 1 region check **/
        let region = args.region;
        if (region.start > 300000000 || region.end < 1) {
            return;
        }
        region.start = (region.start < 1) ? 1 : region.start;
        region.end = (region.end > 300000000) ? 300000000 : region.end;

        /** 2 category check **/
        let categories = this.resource.toString().split(',');   // in this adapter

        /** 3 dataType check **/
        let dataType = args.dataType;
        if (_.isUndefined(dataType)) {
            console.error("dataType must be provided!!!");
            return;
        }
    }

    getData(args){
        switch(this.category ) {
            case "analysis/variant": //FIX analysis/data?
                return this._getVariant(args);
                break;
            case "analysis/alignment":
                return this._getAlignmentData(args);
                break;
            default:
                return this._getExpressionData(args);
        }

    }

    _getExpressionData(args){
        //TODO check with expression data
        console.log("In GetExpressionData");
        let _this = this;
        let params = {};

        Object.assign(params, this.params);
        Object.assign(params, args.params);

        this._checks(args);

        /** 4 chunkSize check **/
        let chunkSize = params.interval ? params.interval : this.options.chunkSize; // this.cache.defaultChunkSize should be the same
        if (this.debug) {
            console.log(chunkSize);
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
                        let responseChunks = _this._generalOpencgaSuccess(response, dataType, chunkSize);
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

    _getVariant(args){
        console.log("In GetVariant");
        let _this = this;
        let params = {};

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
        let categories = this.resource.toString().split(',');   // in this adapter

        /** 3 dataType check **/
        let dataType = args.dataType;
        if (_.isUndefined(dataType)) {
            console.error("dataType must be provided!!!");
            return;
        }

        /** 4 chunkSize check **/
        let chunkSize = params.interval ? params.interval : this.options.chunkSize; // this.cache.defaultChunkSize should be the same
        if (this.debug) {
            console.log(chunkSize);
        }

        /** 5 studies check **/
        let studies = params.studies;
        if (studies === undefined) {
            return;
        }

        /** 6 exclude check **/
        let exclude = params.exclude;
        if (exclude === undefined) {
            exclude = "studies,annotation"; //For FeatureRender
            //exclude= "studies.files,studies.stats,annotation" For VariantRender
        }

        return new Promise(function(resolve, reject) {
            // Create the chunks to be retrieved
            let start = _this._getStartChunkPosition(region.start);

            let regions = [];

            do {
                regions.push(`${region.chromosome}:${start}-${start + _this.options.chunkSize - 1}`);
                start += _this.options.chunkSize;
            } while (start <= region.end);


            if (dataType === "features") {
                    // _this.client.variants().query({
                    //     region: groupedRegions[i],
                    //     studies: studies,
                    //     exclude: exclude
                    //     //exclude: "studies, annotation"
                    //     //exclude: "studies.files,studies.stats,annotation"
                    // })

                let p = {};
                for (let param of Object.keys(params)) {
                    if (typeof params[param] !== "undefined") {
                        p[param] = params[param];
                    }
                }
                let chuncksByRegion =[];
                for (let i = 0; i < regions.length; i++) {
                    p["region"] = regions[i];
                    chuncksByRegion[i] =_this.client.variants().query(p)
                        .then(function (response) {
                            // return  _this._variantsuccess(response, categories, dataType, p.region, p.region, chunkSize);
                            return _this._variantsuccess(response, categories, dataType, regions[i], regions[i], chunkSize);
                        })
                        .catch(function (reason) {
                            reject("Server error, getting variants: " + reason);
                        });
                }

                Promise.all(chuncksByRegion).then(function (response) {
                    resolve({
                        items: response, dataType: dataType, chunkSize: chunkSize, sender: _this
                    });
                });
            } else { // histogram

            }
        });

    }

    _getAlignmentData(args) {
        let _this = this;
        let params = {};
//                    histogram: (dataType == 'histogram')
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
        let categories = this.resource.toString().split(',');   // in this adapter each category is each file

        /** 3 dataType check **/
        let dataType = args.dataType;
        if (_.isUndefined(dataType)) {
            console.log("dataType must be provided!!!");
        }

        /** 4 chunkSize check **/
        let chunkSize = params.interval ? params.interval : this.options.chunkSize; // this.cache.defaultChunkSize should be the same
        if (this.debug) {
            console.log(chunkSize);
        }

        /** 5 file check **/
        let fileId = params.fileId;
        if (fileId === undefined) {
            return;
        }

        let study = params.study;

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

        return new Promise(function(resolve, reject) {
            if (dataType === "features") {
                let chunks = [];
                for (let i = 0; i < groupedRegions.length; i++) {
                    args.webServiceCallCount++;

                    let alignments = _this.client.alignments().query(fileId,
                        {
                            region: groupedRegions[i],
                            study: study
                        })
                        .then(function (response) {
                            return _this._opencgaSuccess(response, categories, dataType, chunkSize, args);
                        });


                    let coverage = _this.client.alignments().coverage(fileId,
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
                                reject("Unexpected behaviour when retrieving alignments and coverage. Something went wrong.");
                            }
                        }
                        chunks = chunks.concat(auxArray);

                        if (args.webServiceCallCount === 0) {
                            resolve({
                                items: chunks, dataType: dataType, chunkSize: chunkSize, sender: _this
                            });
                        }
                    })
                        .catch(function(response){
                            reject("Server alignments error");
                        });
                }
            } else { // histogram
                _this.client.alignments().coverage(fileId,
                    {
                        region: `chr${region.chromosome}:${start}-${end - 1}`,
                        study: study,
                        windowSize: Math.round((end - start) / 500)
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

                        resolve({
                            items: auxArray, dataType: dataType, chunkSize: chunkSize, sender: _this
                        });


                    })
                    .catch(function(response){
                        reject("Error when trying to fetch the alignment histogram");
                    });
            }
        });
    }

    _generalOpencgaSuccess (data, dataType, chunkSize) {
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

    _opencgaSuccess(data, categories, dataType, chunkSize, args) {
        let timeId = Utils.randomString(4) + this.resource + " save";
        console.time(timeId);
        /** time log **/
        let responseItems = [];
        for (let i = 0; i < data.response.length; i++) {
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
        console.log(data);
        /** time log **/
        console.timeEnd(timeId);

        return responseItems;
    }

    _variantsuccess(response, categories, dataType, queryRegion, originalRegion, chunkSize) {

        //console.time(timeId);
        /** time log **/
        debugger
        var regions = [];
        var chunks = [];
        if (dataType !== 'histogram') {
            for(var i = 0; i< response.response.length; i++){
                var res = response.response[i].result;
                chunks.push(res);

            }
            console.log("Los chunks son:");
            console.log(chunks);

            var regionSplit = queryRegion.split(',');
            for (var i = 0; i < regionSplit.length; i++) {
                var regionStr = regionSplit[i];
                regions.push(new Region(regionStr));
            }
        } else {
            if (typeof this.parseHistogram === 'function') {
                chunks = this.parseHistogram(response);
            } else {
                chunks = response;
            }
            for (let i = 0; i < chunks.length; i++) {
                let interval = chunks[i];
                let region = new Region(interval);
                region.chromosome = originalRegion.chromosome;
                regions.push(region);
            }
        }
        console.log(response);
        //for (let i = 0; i < regions.length; i++) {
            let chunkStartId = Math.floor(regions[0].start / chunkSize);
        return {
                chunkKey: `${regions[0].chromosome}:${chunkStartId}_${dataType}_${chunkSize}`,
                region: regions[0],
                value: response.response[0].result,
                dataType: dataType
            };

        /** time log **/
        //console.timeEnd(timeId);
    }

    _getStartChunkPosition (position) {
        return Math.floor(position / this.options.chunkSize) * this.options.chunkSize;
    }

    /**
     * Transform the list on a list of lists, to limit the queries
     * [ r1,r2,r3,r4,r5,r6,r7,r8 ]
     * [ [r1,r2,r3,r4], [r5,r6,r7,r8] ]
     */
    // _groupQueries(uncachedRegions) {
    //     let groupSize = 50;
    //     let queriesLists = [];
    //     while (uncachedRegions.length > 0) {
    //         queriesLists.push(uncachedRegions.splice(0, groupSize).toString());
    //     }
    //     return queriesLists;
    // }

    _adaptChunks(queryResult, category, dataType, chunkSize) {
        let chunks;
        let regions;
        let items = [];
//        debugger
        if (queryResult.resultType == "org.opencb.biodata.models.variant.Variant") {
            chunks = [];
            regions = [];
            let keyToPair = {};
            for (let i = 0; i < queryResult.result.length; i++) {
                let variation = queryResult.result[i];
                let chunkId = this.cache.getChunkId(variation.start, chunkSize);
                let key = this.cache.getChunkKey(variation.chromosome,
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
            for (let j = 0; j < queryResult.result.length; j++) {
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