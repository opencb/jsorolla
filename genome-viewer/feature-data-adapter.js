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

function FeatureDataAdapter(dataSource, args){
	var _this = this;
	
	this.dataSource = dataSource;
	this.gzip = true;
	
	this.params = {};
	if (args != null){
		if(args.gzip != null){
			this.gzip = args.gzip;
		}
		if(args.species != null){
			this.species = args.species;
		}
		if(args.params != null){
			this.params = args.params;
		}
	}
	
	this.featureCache =  new FeatureCache({chunkSize:10000, gzip:this.gzip});
	
	this.onLoad = new Event();	
	this.onGetData = new Event();

	//chromosomes loaded
	this.chromosomesLoaded = {};
};

FeatureDataAdapter.prototype.getData = function(region){
	
	console.log("TODO comprobar histograma");
	console.log(region);
	this.params["dataType"] = "data";
	this.params["chromosome"] = region.chromosome;

	//check if the chromosome has been already loaded
	if(this.chromosomesLoaded[region.chromosome] != true){
		this._fetchData(region);
		this.chromosomesLoaded[region.chromosome]=true;
	}
	
	var itemList = this.featureCache.getFeatureChunksByRegion(region);
	if(itemList != null){
		this.onGetData.notify({items:itemList, params:this.params, cached:true});
	}
};

FeatureDataAdapter.prototype._fetchData = function(region){
	var _this = this;
	if(this.dataSource!=null){//could be null in expression genomic attributer widget 59
		if(this.async){
			this.dataSource.success.addEventListener(function(sender,data){
				_this.parse(data, region);
				_this.onLoad.notify();
			});
			this.dataSource.fetch(this.async);
		}else{
			var data = this.dataSource.fetch(this.async);
			this.parse(data,region);
		}
	}
}

FeatureDataAdapter.prototype.addFeatures = function(features){
		this.featureCache.putFeatures(features, "data");
};
