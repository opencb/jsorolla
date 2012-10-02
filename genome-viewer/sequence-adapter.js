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

function SequenceAdapter(args){
	this.host = null;
	this.gzip = true;
	
	this.params={};
	if (args != null){
		if(args.host != null){
			this.host = args.host;
		}
		if(args.species != null){
			this.species = args.species;
		}
		if(args.category != null){
			this.category = args.category;
		}
		if(args.subCategory != null){
			this.subCategory = args.subCategory;
		}
		if(args.resource != null){
			this.resource = args.resource;
		}
		if(args.featureCache != null){
			var argsFeatureCache = args.featureCache;
		}
		if(args.params != null){
			this.params = args.params;
		}
	}
	this.onGetData = new Event();
	this.sequence="";
	this.start = null;
	this.end = null;
};

SequenceAdapter.prototype.getData = function(args){
	var _this = this;
	//region check
	this.params["histogram"] = args.histogram;
	this.params["interval"] = args.interval;
	this.params["transcript"] = args.transcript;
	this.params["chromosome"] = args.chromosome;
	this.params["resource"] = this.resource;
	this.params["queryStart"] = args.start;
	this.params["queryEnd"] = args.end;

	if(args.start<1){
		args.start=1;
	}
	if(args.end>300000000){
		args.end=300000000;
	}
	var query = args.chromosome+"-"+args.start+":"+args.end;
	
	var cellBaseManager = new CellBaseManager(this.species,{host: this.host});

	cellBaseManager.success.addEventListener(function(sender,data){
		debugger
		var seqResponse = data.result[0];
		if(_this.start==null && _this.end==null){
			_this.start = seqResponse.start;
			_this.end = seqResponse.end;
			_this.sequence = seqResponse.sequence;
		}else{
			if(seqResponse.start < _this.start){
				_this.start = seqResponse.start;
			}
			if(seqResponse.end > _this.end){
				_this.end = seqResponse.end;
			}
		}
		_this.onGetData.notify({sequence:_this.sequence,start:_this.start,end:_this.end})
	});

	cellBaseManager.get(this.category, this.subCategory, query, this.resource, this.params);
	
};
