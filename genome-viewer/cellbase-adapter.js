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
			var params = args.params;
		}
	}
	this.featureCache =  new FeatureCache(argsFeatureCache);
	this.onGetData = new Event();
};

CellBaseAdapter.prototype.getData = function(args){
	console.time("all");
	var _this = this;
	//region check
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
	var cellBaseManager = new CellBaseManager(this.species,{host: this.host});

	var chunks = [];
	var itemList = [];
	for(var i=firstChunk; i<=lastChunk; i++){
		var key = args.chromosome+":"+i;
		if(this.featureCache.cache[key] == null || this.featureCache.cache[key][type] == null) {
			chunks.push(i);
		}else{
			var items = this.featureCache.getFeaturesByChunk(key, type);
//			console.time("concat");
			itemList = itemList.concat(items);
//			console.timeEnd("concat");
		}
	}
//	//notify all chunks
	if(itemList.length>0){
		this.onGetData.notify({data:itemList,cached:true});
	}
	
	
	//CellBase data process
	cellBaseManager.success.addEventListener(function(sender,data){
		var type = "data";
		if(data.params.histogram){
			type = "histogram"+data.params.interval;
		}
		
		//XXX quitar cuando este arreglado el ws
		if(data.params.histogram == true){
			data.result = [data.result];
		}
		//XXX
		
		var queryList = [];
//		console.log("query length "+data.query.length);
//		console.log("data length "+data.result.length);
//		console.log("data "+data.result);
		for(var i = 0; i < data.query.length; i++) {
			var splitDots = data.query[i].split(":");
			var splitDash = splitDots[1].split("-");
			queryList.push({chromosome:splitDots[0],start:splitDash[0],end:splitDash[1]});
		}
//		console.log(_this.featureCache.cache);

		
		for(var i = 0; i < data.result.length; i++) {
			_this.featureCache.putFeaturesByRegion(data.result[i], queryList[i], resource, type);
			var items = _this.featureCache.getFeaturesByRegion(queryList[i], type);
			_this.onGetData.notify({data:items,cached:false});
		}
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
		this.params["histogram"] = args.histogram;
		this.params["interval"] = args.interval;
		this.params["transcript"] = args.transcript;
		cellBaseManager.get(this.category, this.subCategory, querys, this.resource, this.params);
	}
};

//CellBaseAdapter.prototype.getDataOLD = function(region){
	//var _this = this;
	//
	//var features = _this.featureCache.get(region, true);
	//
	//if(features == null){
		//var cellBaseManager = new CellBaseManager(this.species,{host: this.host});
		//cellBaseManager.success.addEventListener(function(sender,data){
//			check if is an array of arrays or an array of objects
			//if(data.length > 0){
				//if(data[0].constructor == Object){ 
					//_this.featureCache.put(data,region);
				//}
				//else{
					//for(var i = 0; i < data.length; i++) {
						//_this.featureCache.put(data[i],region);
					//}
				//}
			//}else{
				//_this.featureCache.put(data,region);
			//}
			//_this.onGetData.notify(_this.featureCache.get(region, true));
		//});
//
//
		//var chunkRegion = this.featureCache.getChunkRegion(region);
		//var query = region.chromosome+":"+chunkRegion.start+"-"+chunkRegion.end;
//		var query = region.chromosome+":"+region.start+"-"+region.end;
		//cellBaseManager.get(this.category, this.subCategory, query, this.resource);
		//
	//}else{
//		_this.onGetData.notify(features);
	//}
//};
