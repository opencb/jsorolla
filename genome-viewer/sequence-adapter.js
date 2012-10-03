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
	this.sender = args.sender;
	
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

	var queryString = this._getSequenceQuery(args);

	var cellBaseManager = new CellBaseManager(this.species,{host: this.host});
//
	cellBaseManager.success.addEventListener(function(sender,data){
		_this._processSequenceQuery(data,true);
	});
	cellBaseManager.get(this.category, this.subCategory, queryString, this.resource, this.params);
	
};

SequenceAdapter.prototype._getSequenceQuery = function(args){
	var _this = this;
	var s,e, query, querys = [];
	if(_this.start==0 && _this.end==0){
			_this.start = args.start;
			_this.end = args.end;
			s = args.start;
			e = args.end;
			query = args.chromosome+":"+s+"-"+e;
			querys.push(query);
	}else{
		if(args.start <= _this.start){
			s = args.start;
			e = _this.start-1;
			_this.start = s;
			query = args.chromosome+":"+s+"-"+e;
			querys.push(query);
		}
		if(args.end >= _this.end){
			e = args.end;
			s = _this.end+1;
			_this.end = e;
			query = args.chromosome+":"+s+"-"+e;
			querys.push(query);
		}
	}
	
	console.log("--------------------------------------------------------------------"+s+" "+e);
	console.log("--------------------------------------------------------------------"+this.start+" "+this.end);
	
	return querys.toString();
};

SequenceAdapter.prototype._processSequenceQuery = function(data, throwNotify){
	var seqResponse = data.result;
	for(var i = 0; i < seqResponse.length; i++){
		var splitDots = data.query[i].split(":");
		var splitDash = splitDots[1].split("-");
		var queryStart = splitDash[0];
		var queryEnd = splitDash[1];
		
		if(this.sequence == ""){
			this.sequence = seqResponse[i].sequence;
		}else{
			if(queryStart == this.start){
				this.sequence = seqResponse[i].sequence + this.sequence;
			}else{
				this.sequence = this.sequence + seqResponse[i].sequence;
			}
		}
		if(throwNotify == true){
			if(this.sender == "onMove"){
				this.onGetData.notify({items:{sequence:seqResponse[i].sequence,start:queryStart,end:queryEnd},params:this.params});
			}else{//if not onMove the svg was cleared so all sequence is send to redraw
				this.onGetData.notify({items:{sequence:this.sequence,start:this.start,end:this.end},params:this.params});
			}
		}
	}
};

SequenceAdapter.prototype.getDiffString = function(args){
	var _this=this;
	var queryString = this._getSequenceQuery(args);
	
	var cellBaseManager = new CellBaseManager(this.species,{host: this.host, async:false});
	var data = cellBaseManager.get(this.category, this.subCategory, queryString, this.resource, this.params);
	_this._processSequenceQuery(data);

	//here the needed sequence is on the cache
	
	var referenceSubStr = this.sequence.substring(args.start-this.start,args.sequence.length);

	resultStr = "";
	for(var i = 0; i < args.sequence.length; i++){
		if(args.sequence.charAt(i) == referenceSubStr.charAt(i)){
			resultStr+=" ";
		}else{
			resultStr+=args.sequence.charAt(i);
		}
	}
	return resultStr;
};
