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
	this.start = 0;
	this.end = 0;
};

SequenceAdapter.prototype.getData = function(args){
	var _this = this;
	//region check
	this.params["histogram"] = args.histogram;
	this.params["interval"] = args.interval;
	this.params["transcript"] = args.transcript;
	this.params["chromosome"] = args.chromosome;
	this.params["resource"] = this.resource;

	if(args.start<1){
		args.start=1;
	}
	if(args.end>300000000){
		args.end=300000000;
	}
	console.log("--------------------------------------------------------------------"+this.start+" "+this.end);
	console.log("--------------------------------------------------------------------"+args.start+" "+args.end);

	var s,e;
	if(_this.start==0 && _this.end==0){
			_this.start = args.start;
			_this.end = args.end;
			s = args.start;
			e = args.end;
	}else{
		if(args.start <= _this.start){
			s = args.start;
			e = _this.start-1;
			_this.start = s;
			this.params["side"] = "left";
		}
		if(args.end >= _this.end){
			e = args.end;
			s = _this.end+1;
			_this.end = e;
			this.params["side"] = "rigth";
		}
	}

	this.params["queryStart"] = s;
	this.params["queryEnd"] = e;
	var query = args.chromosome+":"+s+"-"+e;
	console.log("--------------------------------------------------------------------"+s+" "+e);
	console.log("--------------------------------------------------------------------"+this.start+" "+this.end);
	console.log(this)
	var cellBaseManager = new CellBaseManager(this.species,{host: this.host});
//
	cellBaseManager.success.addEventListener(function(sender,data){
		var seqResponse = data.result[0];
		if(data.params.side == null){
			_this.sequence = seqResponse.sequence;
		}else{
			if(data.params.side == "left"){
				_this.sequence = seqResponse.sequence + _this.sequence;
			}else{
				_this.sequence = _this.sequence + seqResponse.sequence;
			}

		}
		_this.onGetData.notify({items:{sequence:seqResponse.sequence,start:data.params.queryStart,end:data.params.queryEnd},params:_this.params});
	});
	cellBaseManager.get(this.category, this.subCategory, query, this.resource, this.params);
	
};

SequenceAdapter.prototype.compare = function(args){
	var _this=this;
	//var start = args.start;
	//var end = args.end;
	//var sequence = args.sequence

	//TODO

	var s,e, query, querys = [];
	if(_this.start==0 && _this.end==0){
			_this.start = args.start;
			_this.end = args.end;
			s = args.start;
			e = args.end;
	}else{
		if(args.start <= _this.start){
			s = args.start;
			e = _this.start-1;
			_this.start = s;
			this.params["side"] = "left";
		}
		query = args.chromosome+":"+s+"-"+e;
		querys.push(query);
		if(args.end >= _this.end){
			e = args.end;
			s = _this.end+1;
			_this.end = e;
			this.params["side"] = "rigth";
		}
		query = args.chromosome+":"+s+"-"+e;
		querys.push(query);
	}

	var query = args.chromosome+":"+s+"-"+e;
	
	var cellBaseManager = new CellBaseManager(this.species,{host: this.host, async:false});
	var x  =  cellBaseManager.get(this.category, this.subCategory, querys.toString(), this.resource, this.params);
	console.log(x)
	debugger
	//cellBaseManager.success.addEventListener(function(sender,data){
		//var seqResponse = data.result[0];
		//if(data.params.side == null){
			//_this.sequence = seqResponse.sequence;
		//}else{
			//if(data.params.side == "left"){
				//_this.sequence = seqResponse.sequence + _this.sequence;
			//}else{
				//_this.sequence = _this.sequence + seqResponse.sequence;
			//}
//
		//}
		//_this.onGetData.notify({items:{sequence:seqResponse.sequence,start:data.params.queryStart,end:data.params.queryEnd},params:_this.params});
	//});
};
