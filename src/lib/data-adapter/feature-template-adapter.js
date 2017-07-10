/**
 * ** Generic adapter to any uri

 new FeatureTemplateAdapter({
    uriTemplate: 'http://host/webserver/{customVar}/{species}/{region}',
    templateVariables: {
        customVar: 'info',
    },
    species: genomeViewer.species,
    parse: function (response) {
        var itemsArray = [];
        for (var i = 0; i < response.response.length; i++) {
            var r = response.response[i];
            itemsArray.push(r.result);
        }
        return itemsArray;
    }
 })

 * ** templateVariables is used for custom variables in the uri. region and species will be ignored
 * ** as will be configured automatically

 * ** The species config is the current species should not appear in templateVariables
 * ** The region in the uriTemplate is provided by the track so should not appear in templateVariables
 * ** The parse function is used to adapt de features from the response

 */

class FeatureTemplateAdapter {
    constructor(args){
        Object.assign(this, Backbone.Events);

        this.templateVariables = {};
        this.multiRegions = true;
        this.histogramMultiRegions = true;
        this.chromosomeSizes;

        Object.assign(this, args);

        this.configureCache();

        this.debug = false;
    }

    setSpecies(species) {
        this.species = species;
        this.configureCache();
    }

    setHost(host) {
        this.configureCache();
        this.host = host;
    }

    deleteCache(){
        this.cache.delete();
    }

    configureCache() {
        let speciesString = '';
        if (this.species != null) {
            let speciesString = this.species.id + this.species.assembly.name.replace(/[/_().\ -]/g, '');
        }
        let cacheId = this.uriTemplate + speciesString;
        if (!this.cacheConfig) {
            this.cacheConfig = {
                //    //subCacheId: this.resource + this.params.keys(),
                chunkSize: 3000
            }
        }
        this.cacheConfig.cacheId = cacheId;
        this.cache = new FeatureChunkCache(this.cacheConfig);
    }

    getData (args) {
        let _this = this;

        let params = {};
        //histogram: (dataType == 'histogram')
        _.extend(params, this.params);
        _.extend(params, args.params);

        /** 1 region check **/
        let region = args.region;
        let limitedRegion = this._computeLimitedRegion(region.chromosome);
        if (region.start > limitedRegion || region.end < 1) {
            return;
        }
        region.start = (region.start < 1) ? 1 : region.start;
        region.end = (region.end > limitedRegion) ? limitedRegion : region.end;

        /** 2 category check **/
        let categories = ["cat_" + Utils.queryString(this.templateVariables) + Utils.queryString(params)];

        /** 3 dataType check **/
        let dataType = args.dataType;
        if (_.isUndefined(dataType)) {
            console.log("dataType must be provided!!!");
        }

        /** 4 chunkSize check **/
        let chunkSize = params.interval ? params.interval : this.cacheConfig.chunkSize; // this.cache.defaultChunkSize should be the same
        if (this.debug) {
            console.log(chunkSize);
        }

        /**
         * Get the uncached regions (uncachedRegions) and cached chunks (cachedChunks).
         * Uncached regions will be used to query cellbase. The response data will be converted in chunks
         * by the Cache TODO????
         * Cached chunks will be returned by the args.dataReady Callback.
         */
        return new Promise(function(resolve, reject) {
            _this.cache.get(region, categories, dataType, chunkSize, function (cachedChunks, uncachedRegions) {

                let category = categories[0];
                let categoriesName = "";
                for (let j = 0; j < categories.length; j++) {
                    categoriesName += "," + categories[j];
                }
                categoriesName = categoriesName.slice(1); // to remove first ','

                let chunks = cachedChunks[category];
                // TODO check how to manage multiple regions

                let queriesList;
                if (dataType !== 'histogram') {
                    if (_this.multiRegions === false) {
                        queriesList = _this._singleQueries(uncachedRegions[category]);
                    } else {
                        queriesList = _this._groupQueries(uncachedRegions[category]);
                    }
                } else {
                    if (_this.histogramMultiRegions === false) {
                        queriesList = _this._singleQueries(uncachedRegions[category]);
                    } else {
                        queriesList = _this._groupQueries(uncachedRegions[category]);
                    }
                }

                /** Uncached regions found **/
                if (queriesList.length > 0) {
                    args.webServiceCallCount = 0;
                    for (let i = 0; i < queriesList.length; i++) {
                        args.webServiceCallCount++;
                        let queryRegion = queriesList[i];

                        let request = new XMLHttpRequest();

                        /** Temporal fix save queried region **/
                        request._queryRegion = queryRegion;
                        request._originalRegion = region;

                        request.onload = function () {
                            args.webServiceCallCount--;
                            if (request.status !== 400 && request.status !== 500) {
                                let response;
                                try {
                                    response = JSON.parse(this.response);
                                } catch (e) {
                                    console.log('Warning: Response is not JSON');
                                    response = this.response;
                                }

                                /** Process response **/
                                let responseChunks = _this._success(response, categories, dataType, this._queryRegion, this._originalRegion, chunkSize);
                                chunks = chunks.concat(responseChunks);
                            } else {
                                console.log("request.status: " + request.status);
                            }
                            if (args.webServiceCallCount === 0) {
                                chunks.sort(function (a, b) {
                                    return a.chunkKey.localeCompare(b.chunkKey)
                                });
                                resolve({
                                    items: chunks,
                                    dataType: dataType,
                                    chunkSize: chunkSize,
                                    sender: _this
                                });
                            }
                        };
                        request.onerror = function () {
                            console.log('Server error');
                            reject();
                        };
                        let uriTemplate = new URITemplate(_this.uriTemplate);
                        _this.templateVariables['region'] = queryRegion.toString();
                        _this.templateVariables['species'] = _this._getSpeciesQueryString(_this.species);

                        let url = uriTemplate.expand(_this.templateVariables);
                        url = Utils.addQueryParamtersToUrl(params, url);
                        request.open('GET', url, true);
                        console.log(url);
                        request.send();

                    }
                } else
                /** All regions are cached **/
                {
                    resolve({
                        items: chunks,
                        dataType: dataType,
                        chunkSize: chunkSize,
                        sender: _this
                    });
                }
            });
        });
    }

    _success (response, categories, dataType, queryRegion, originalRegion, chunkSize) {
        //let timeId = Utils.randomString(4) + this.resource + " save";
        //console.time(timeId);
        /** time log **/

        let regions = [];
        let chunks = [];
        if (dataType !== 'histogram') {
            if (typeof this.parse === 'function') {
                chunks = this.parse(response, dataType);
            } else {
                chunks = response;
            }
            regions = this._getRegionsFromQueryRegions(queryRegion);
        } else {
            if (typeof this.parseHistogram === 'function') {
                chunks = this.parseHistogram(response);
            } else {
                chunks = response;
            }
            regions = this._getRegionsFromHistogramChunks(chunks, originalRegion.chromosome);
        }

        let items = this.cache.putByRegions(regions, chunks, categories, dataType, chunkSize);

        /** time log **/
        //console.timeEnd(timeId);

        return items;
    }

    /**
     * Transform the list on a list of lists, to limit the queries
     * [ r1,r2,r3,r4,r5,r6,r7,r8 ]
     * [ [r1,r2,r3,r4], [r5,r6,r7,r8] ]
     */
    _groupQueries(uncachedRegions) {
        // modify region end to chromosome length.
        for (let i = 0; i < uncachedRegions.length; i++) {
            let r = uncachedRegions[i];
            this._computeRegionSize(r);
        }

        let groupSize = 50;
        let queriesLists = [];
        while (uncachedRegions.length > 0) {
            queriesLists.push(uncachedRegions.splice(0, groupSize).toString());
        }
        return queriesLists;
    }

    _singleQueries(uncachedRegions) {
        // modify region end to chromosome length.
        for (let i = 0; i < uncachedRegions.length; i++) {
            let r = uncachedRegions[i];
            this._computeRegionSize(r);
        }

        let queriesLists = [];
        for (let i = 0; i < uncachedRegions.length; i++) {
            let region = uncachedRegions[i];
            queriesLists.push(region.toString());
        }
        return queriesLists;
    }

    _getSpeciesQueryString(species) {
        if (species == null) {
            return '';
        }
        if (this.speciesParse != null) {
            return this.speciesParse(species);
        } else {
            return Utils.getSpeciesCode(species.scientificName)
        }
    }

    _getRegionsFromQueryRegions(queryRegion) {
        let regions = [];
        let regionSplit = queryRegion.split(',');
        for (let i = 0; i < regionSplit.length; i++) {
            let regionStr = regionSplit[i];
            regions.push(new Region(regionStr));
        }
        return regions;
    }

    _getRegionsFromHistogramChunks(intervals, chromosome) {
        let regions = [];
        for (let i = 0; i < intervals.length; i++) {
            let interval = intervals[i];
            let region = new Region(interval);
            region.chromosome = chromosome;
            regions.push(region);
        }
        return regions;
    }

    _computeLimitedRegion(chromosome) {
        let regionLimit = 300000000;

        if (this.species != null && this.species.chromosomes != null && this.species.chromosomes[chromosome] != null) {
            regionLimit = this.species.chromosomes[chromosome].end;
        }

        if (this.chromosomeSizes != null &&
            this.chromosomeSizes[chromosome] != null &&
            !isNaN(this.chromosomeSizes[chromosome])
        ) {
            regionLimit = this.chromosomeSizes[chromosome];
        }

        return regionLimit;
    }

    _computeRegionSize(region) {
        let limitedRegion = this._computeLimitedRegion(region.chromosome);
        if (region.end > limitedRegion) {
            region.end = limitedRegion;
        }
    }
}
