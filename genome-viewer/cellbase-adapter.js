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

function CellBaseAdapter(args){
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
		if(args.filters != null){
			this.filters = args.filters;
		}
		if(args.options != null){
			this.options = args.options;
		}
		if(args.featureConfig != null){
			if(args.featureConfig.filters != null){
				this.filtersConfig = args.featureConfig.filters;
			}
			if(args.featureConfig.options != null){
				this.optionsConfig = args.featureConfig.options;
				for(var i = 0; i < this.optionsConfig.length; i++){
					if(this.optionsConfig[i].checked == true){
						this.options[this.optionsConfig[i].name] = true;
						this.params[this.optionsConfig[i].name] = true;
					}				
				}
			}
		}
	}
	this.featureCache =  new FeatureCache(argsFeatureCache);
	this.onGetData = new Event();
};

CellBaseAdapter.prototype.clearData = function(){
	this.featureCache.clear();
};

CellBaseAdapter.prototype.setFilters = function(filters){
	this.clearData();
	this.filters = filters;
	for(filter in filters){
		var value = filters[filter].toString();
		delete this.params[filter];
		if(value != ""){
			this.params[filter] = value;
		}
	}
};
CellBaseAdapter.prototype.setOption = function(opt, value){
	if(opt.fetch){
		this.clearData();
	}
	this.options[opt.name] = value;
	for(option in this.options){
		if(this.options[opt.name] != null){
			this.params[opt.name] = this.options[opt.name];
		}else{
			delete this.params[opt.name];
		}
	}
};


CellBaseAdapter.prototype.getData = function(args){
	var rnd = String.fromCharCode(65+Math.round(Math.random()*10));
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
	
	var dataType = "data";
	if(args.histogram){
		dataType = "histogram"+args.interval;
	}
	if(args.transcript){
		dataType = "withTranscripts";
	}

	this.params["dataType"] = dataType
	
	var firstChunk = this.featureCache._getChunk(args.start);
	var lastChunk = this.featureCache._getChunk(args.end);
	var chunks = [];
	var itemList = [];
	for(var i=firstChunk; i<=lastChunk; i++){
		var key = args.chromosome+":"+i;
		if(this.featureCache.cache[key] == null || this.featureCache.cache[key][dataType] == null) {
			chunks.push(i);
		}else{
			var item = this.featureCache.getFeatureChunk(key);
			itemList.push(item);
		}
	}
	
	//CellBase data process
	var cellBaseManager = new CellBaseManager(this.species,{host: this.host});
	cellBaseManager.success.addEventListener(function(sender,data){
		var dataType = "data";
		if(data.params.histogram){
			dataType = "histogram"+data.params.interval;
		}
		if(data.params.transcript){
			dataType = "withTranscripts";
		}

		//XXX quitar cuando este arreglado el ws
		if(data.params.histogram == true){
			data.result = [data.result];
		}
		//XXX
		
		var queryList = [];
		for(var i = 0; i < data.query.length; i++) {
			var splitDots = data.query[i].split(":");
			var splitDash = splitDots[1].split("-");
			queryList.push({chromosome:splitDots[0],start:splitDash[0],end:splitDash[1]});
		}
		
		for(var i = 0; i < data.result.length; i++) {
			
			//Check if is a single object
			if(data.result[i].constructor != Array){
				data.result[i] = [data.result[i]];
			}
			
			if(data.resource == "gene" && data.params.transcript!=null){
				for ( var j = 0, lenj = data.result[i].length; j < lenj; j++) {
					for (var t = 0, lent = data.result[i][j].transcripts.length; t < lent; t++){
						data.result[i][j].transcripts[t].featureType = "transcript";
						//loop over exons
						for (var e = 0, lene = data.result[i][j].transcripts[t].exonToTranscripts.length; e < lene; e++){
							data.result[i][j].transcripts[t].exonToTranscripts[e].exon.featureType = "exon";
						}
					}
				}
			}
			console.time(_this.resource+" save "+rnd);
			_this.featureCache.putFeaturesByRegion(data.result[i], queryList[i], data.resource, dataType);
			var items = _this.featureCache.getFeatureChunksByRegion(queryList[i]);
			console.timeEnd(_this.resource+" save "+rnd);
			if(items != null){
				itemList = itemList.concat(items);
			}
		}
		if(itemList.length > 0){
			_this.onGetData.notify({items:itemList, params:_this.params, cached:false});
		}
		console.timeEnd(_this.resource+" get and save "+rnd);
	});

	var querys = [];
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
//		console.log(querys);
		console.time(_this.resource+" get and save "+rnd);
		cellBaseManager.get(this.category, this.subCategory, querys, this.resource, this.params);
	}else{
		if(itemList.length > 0){
			this.onGetData.notify({items:itemList, params:this.params});
		}
	}
};
