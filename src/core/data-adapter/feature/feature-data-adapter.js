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

function FeatureDataAdapter(dataSource, args) {
    var _this = this;
    _.extend(this, Backbone.Events);

    this.dataSource = dataSource;
    this.gzip = true;

    this.params = {};
    if (args != null) {
        if (args.gzip != null) {
            this.gzip = args.gzip;
        }
        if (args.species != null) {
            this.species = args.species;
        }
        if (args.params != null) {
            this.params = args.params;
        }
    }

    this.featureCache = new FileFeatureCache({chunkSize: 10000, gzip: this.gzip});

//	this.onLoad = new Event();
//	this.onGetData = new Event();

    //chromosomes loaded
    this.chromosomesLoaded = {};
}

FeatureDataAdapter.prototype.getData = function (args) {
    console.log("TODO comprobar histograma");
    console.log(args.region);
    this.params["dataType"] = "data";
    this.params["chromosome"] = args.region.chromosome;

    //check if the chromosome has been already loaded
    if (this.chromosomesLoaded[args.region.chromosome] != true) {
        this._fetchData(args.region);
        this.chromosomesLoaded[args.region.chromosome] = true;
    }

    var itemList = this.featureCache.getFeatureChunksByRegion(args.region);
    if (itemList != null) {
        this.trigger('data:ready', {items: itemList, params: this.params, chunkSize: this.featureCache.chunkSize, cached: true, sender: this});
    }
    args.done();
};

FeatureDataAdapter.prototype._fetchData = function (region) {
    var _this = this;
    if (this.dataSource != null) {//could be null in expression genomic attributer widget 59
        if (this.async) {
            this.dataSource.on('success', function (data) {
                _this.parse(data, region);
//				_this.onLoad.notify();
                _this.trigger('file:load', {sender: _this});


                var itemList = _this.featureCache.getFeatureChunksByRegion(region);
                if (itemList != null) {
                    _this.trigger('data:ready', {items: itemList, params: _this.params, chunkSize: _this.featureCache.chunkSize, cached: true, sender: _this});
                }

            });
            this.dataSource.fetch(this.async);
        } else {
            var data = this.dataSource.fetch(this.async);
            this.parse(data, region);
        }
    }
}

FeatureDataAdapter.prototype.addFeatures = function (features) {
    this.featureCache.putFeatures(features, "data");
};
