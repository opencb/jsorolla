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

BEDDataAdapter.prototype.getData = FeatureDataAdapter.prototype.getData;
BEDDataAdapter.prototype._fetchData = FeatureDataAdapter.prototype._fetchData;

function BEDDataAdapter(dataSource, args) {
    FeatureDataAdapter.prototype.constructor.call(this, dataSource, args);
    var _this = this;

    this.async = true;

    this.parseFunction;
    if (args != null) {
        if (args.parseFunction != null) {
            this.parseFunction = args.parseFunction;
        }
    }

    //stat atributes
    this.featuresCount = 0;
    this.featuresByChromosome = {};

    if (args != null) {
        if (args.async != null) {
            this.async = args.async;
        }
    }
};

BEDDataAdapter.prototype.parse = function (data, region) {
    if (this.parseFunction){
        this.parseFunction(data, region);
    }else{
        this._defaultParse(data, region);
    }
};

BEDDataAdapter.prototype._defaultParse = function (data, region) {

    var _this = this;
    var dataType = "value";
    var lines = data.split("\n");
//	console.log("creating objects");
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].replace(/^\s+|\s+$/g, "");
        if ((line != null) && (line.length > 0)) {
            var fields = line.split("\t");
            var chromosome = fields[0].replace("chr", "");
            if (chromosome == region.chromosome) {// load only one chromosome on the cache

                var feature = {
                    "label": fields[3],
                    "chromosome": chromosome,
                    "start": parseFloat(fields[1]),
                    "end": parseFloat(fields[2]),
                    "score": fields[4],
                    "strand": fields[5],
                    "thickStart": fields[6],
                    "thickEnd": fields[7],
                    "itemRgb": fields[8],
                    "blockCount": fields[9],
                    "blockSizes": fields[10],
                    "blockStarts": fields[11],
                    "featureType": "bed"
                };

                this.featureCache.putFeatures(feature, dataType);

                if (this.featuresByChromosome[chromosome] == null) {
                    this.featuresByChromosome[chromosome] = 0;
                }
                this.featuresByChromosome[chromosome]++;
                this.featuresCount++;
            }
        }
    }
};
