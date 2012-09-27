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

function DqsAdapter(args){
	this.host = null;
	this.gzip = true;
	
	this.params={};
	if (args != null){
		if(args.host != null){
			this.host = args.host;
		}
		if(args.category != null){
			this.category = args.category;
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
	this.featureCache =  new FeatureCache(argsFeatureCache);
	this.onGetData = new Event();
};

DqsAdapter.prototype.getData = function(args){
	debugger
	var _this = this;
	//region check
	
	this.params["histogram"] = args.histogram;
	this.params["interval"] = args.interval;
	this.params["transcript"] = args.transcript;
	
	
	if(args.start<1){
		args.start=1;
	}
	if(args.end>300000000){
		args.end=300000000;
	}
	
	var type = "data";
	if(args.histogram){
		type = "histogram"+args.interval;
	}
	
	var firstChunk = this.featureCache._getChunk(args.start);
	var lastChunk = this.featureCache._getChunk(args.end);

	var chunks = [];
	var itemList = [];
	for(var i=firstChunk; i<=lastChunk; i++){
		var key = args.chromosome+":"+i;
		if(this.featureCache.cache[key] == null || this.featureCache.cache[key][type] == null) {
			chunks.push(i);
		}else{
			var items = this.featureCache.getFeaturesByChunk(key, type);
			itemList = itemList.concat(items);
		}
	}
////	//notify all chunks
//	if(itemList.length>0){
//		this.onGetData.notify({data:itemList, params:this.params, cached:true});
//	}
	
	
	//CellBase data process
	var dqsManager = new DqsManager();
	var calls = 0;
	var querys = [];
	dqsManager.onRegion.addEventListener(function (evt, data){
		console.timeEnd("dqs");
		console.time("dqs-cache");
		var type = "data";
		if(data.params.histogram){
			type = "histogram"+data.params.interval;
		}

		var splitDots = data.query.split(":");
		var splitDash = splitDots[1].split("-");
		var query = {chromosome:splitDots[0],start:splitDash[0],end:splitDash[1]};

		_this.featureCache.putFeaturesByRegion(data.result, query, data.resource, type);
		var items = _this.featureCache.getFeaturesByRegion(query, type);
		console.timeEnd("dqs-cache");
		if(items != null){
			itemList = itemList.concat(items);
		}
		if(calls == querys.length ){
			_this.onGetData.notify({data:itemList, params:_this.params, cached:false});
		}
	});

	var updateStart = true;
	var updateEnd = true;
	if(chunks.length > 0){
//		console.log(chunks);
		
		for ( var i = 0; i < chunks.length; i++) {
			
			if(updateStart){
				var chunkStart = parseInt(chunks[i] * this.featureCache.chunkSize);
				updateStart = false;
			}
			if(updateEnd){
				var chunkEnd = parseInt((chunks[i] * this.featureCache.chunkSize) + this.featureCache.chunkSize-1);
				updateEnd = false;
			}
			
			if(chunks[i+1]!=null){
				if(chunks[i]+1==chunks[i+1]){
					updateEnd =true;
				}else{
					var query = args.chromosome+":"+chunkStart+"-"+chunkEnd;
					querys.push(query);
					updateStart = true;
					updateEnd = true;
				}
			}else{
				var query = args.chromosome+":"+chunkStart+"-"+chunkEnd;
				
				querys.push(query);
				updateStart = true;
				updateEnd = true;
			}
		}
//		console.log(querys)
		for ( var i = 0, li = querys.length; i < li; i++) {
			console.time("dqs");
			calls++;
			dqsManager.region(this.category, this.resource, querys[i], this.params);
		}
	}else{
		if(itemList.length > 0){
			this.onGetData.notify({data:itemList, params:this.params});
		}
	}
};