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

GTFDataAdapter.prototype.getData = FeatureDataAdapter.prototype.getData;
GTFDataAdapter.prototype._fetchData = FeatureDataAdapter.prototype._fetchData;

function GTFDataAdapter(dataSource, args){
	FeatureDataAdapter.prototype.constructor.call(this, dataSource, args);
	var _this = this;

	this.async = true;

	//stat atributes
	this.featuresCount = 0;
	this.featuresByChromosome = {};

	if (args != null){
		if(args.async != null){
			this.async = args.async;
		}
	}
};

GTFDataAdapter.prototype.parse = function(data, region){
	var _this = this;

	//parse attributes column
	var getAttr = function(column){
		var arr = column.split(";");
		var obj = {};
		for (var i = 0, li = arr.length; i<li ; i++){
			var item = arr[i].split("=");
			obj[item[0]] = item[1];
		}
		return obj;
	};

	var dataType = "value";
	var lines = data.split("\n");
//	console.log("creating objects");
	for (var i = 0; i < lines.length; i++){
		var line = lines[i].replace(/^\s+|\s+$/g,"");
		if ((line != null)&&(line.length > 0)){
			var fields = line.split("\t");
			var chromosome = fields[0].replace("chr", "");
			if(chromosome == region.chromosome){// load only one chromosome on the cache

				//NAME  SOURCE  TYPE  START  END  SCORE  STRAND  FRAME  GROUP
				var feature = {
						"chromosome": chromosome,
						"label": fields[2],
						"start": parseInt(fields[3]),
						"end": parseInt(fields[4]),
						"score": fields[5],
						"strand": fields[6],
						"frame": fields[7],
						"attributes": getAttr(fields[8]),
						"featureType":	"gtf"
				} ;

				this.featureCache.putFeatures(feature, dataType);
				if (this.featuresByChromosome[chromosome] == null){
					this.featuresByChromosome[chromosome] = 0;
				}
				this.featuresByChromosome[chromosome]++;
				this.featuresCount++;
			}
		}
	}
};
