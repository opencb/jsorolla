/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
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

GFF2DataAdapter.prototype.getData = FeatureDataAdapter.prototype.getData;
GFF2DataAdapter.prototype._fetchData = FeatureDataAdapter.prototype._fetchData;

function GFF2DataAdapter(dataSource, args){
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

GFF2DataAdapter.prototype.parse = function(data, region){
	var _this = this;
	var dataType = "data";
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
						"group": fields[8],
						"featureType":	"gff2"
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
