function CellBaseAdapter(args){
	this.host = null;
	this.gzip = true;
	
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
	}
	this.featureCache =  new FeatureCache(argsFeatureCache);
	this.onGetData = new Event();
};

CellBaseAdapter.prototype.getData = function(region){
	var _this = this;
	//region check
	if(region.start<1){
		region.start=1;
	}
	if(region.end>300000000){
		region.end=300000000;
	}
	
	var firstChunk = this.featureCache._getChunk(region.start);
	var lastChunk = this.featureCache._getChunk(region.end);
	var cellBaseManager = new CellBaseManager(this.species,{host: this.host});

	var chunks = [];
	var itemList = [];
	for(var i=firstChunk; i<=lastChunk; i++){
		var key = region.chromosome+":"+i;
		if(this.featureCache.cache[key] == null) {
			chunks.push(i);
		}else{
			var items = this.featureCache.getFeaturesByChunk(key);
//			console.time("concat");
			itemList = itemList.concat(items);
//			console.timeEnd("concat");
		}
	}
	
	//notify all chunks
	if(itemList.length>0){
		this.onGetData.notify(itemList);
	}
	
	
	//CellBase data process
	cellBaseManager.success.addEventListener(function(sender,data){
		var queryList = [];
//		console.log("query length "+data.query.length);
//		console.log("data length "+data.result.length);
		for(var i = 0; i < data.query.length; i++) {
			var splitDots = data.query[i].split(":");
			var splitDash = splitDots[1].split("-");
			queryList.push({chromosome:splitDots[0],start:splitDash[0],end:splitDash[1]});
		}
//		console.log(_this.featureCache.cache);

		
		for(var i = 0; i < data.result.length; i++) {
			_this.featureCache.putRegion(data.result[i], queryList[i]);
			var items = _this.featureCache.getFeaturesByRegion(queryList[i]);
			_this.onGetData.notify(items);
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
					var query = region.chromosome+":"+chunkStart+"-"+chunkEnd;
					querys.push(query);
					updateStart = true;
					updateEnd = true;
				}
			}else{
				var query = region.chromosome+":"+chunkStart+"-"+chunkEnd;
				querys.push(query);
				updateStart = true;
				updateEnd = true;
			}
		}
//		console.log(querys);
		cellBaseManager.get(this.category, this.subCategory, querys, this.resource, {histogram:region.histogram,interval:region.interval});
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
