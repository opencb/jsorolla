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

VCFDataAdapter.prototype.getData = FeatureDataAdapter.prototype.getData;
VCFDataAdapter.prototype._fetchData = FeatureDataAdapter.prototype._fetchData;

function VCFDataAdapter(dataSource, args) {
    FeatureDataAdapter.prototype.constructor.call(this, dataSource, args);
    var _this = this;

    this.async = true;
    //stat atributes
    this.featuresCount = 0;
    this.featuresByChromosome = {};

    this.header = "";
    this.samples = [];

    if (args != null) {
        if (args.async != null) {
            this.async = args.async;
        }
    }
}

VCFDataAdapter.prototype.parse = function (data, region) {
//	console.log(data);
    var _this = this;
    var dataType = "value";
    var lines = data.split("\n");
//    debugger
//	console.log("creating objects");
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].replace(/^\s+|\s+$/g, "");
        if ((line != null) && (line.length > 0)) {

            var fields = line.split("\t");

            if (line.substr(0, 1) === "#") {
                if (line.substr(1, 1) === "#") {
                    this.header += line.replace(/</gi, "&#60;").replace(/>/gi, "&#62;") + "<br>";
                } else {
                    this.samples = fields.slice(9);
                }
            } else {

                var chrom = fields[0].replace(/chr/gi, "");
                if (chrom == region.chromosome) {// load only one chromosome on the cache

                    //				_this.addQualityControl(fields[5]);

                    var samples = [];
                    if(fields[9]){
                        samples = fields.slice(9);
                    }

                    var feature = {
                        "chromosome": chrom,
                        "position": parseInt(fields[1]),
                        "start": parseInt(fields[1]),//added
                        "end": parseInt(fields[1]),//added
                        "id": fields[2],
                        "reference": fields[3],
                        "alternate": fields[4],
                        "quality": fields[5],
                        "filter": fields[6],
                        "info": fields[7].replace(/;/gi, "<br>"),
                        "format": fields[8],
                        "sampleData": line,
                        "samples": samples,
                        //						"record":		fields,
                        //						"label": 		fields[2] + " " +fields[3] + "/" + fields[4] + " Q:" + fields[5],
                        "featureType": "vcf"
                    };

                    this.featureCache.putFeatures(feature, dataType);

                    if (this.featuresByChromosome[chrom] == null) {
                        this.featuresByChromosome[chrom] = 0;
                    }
                    this.featuresByChromosome[chrom]++;
                    this.featuresCount++;
                }
            }
        }
    }
};
