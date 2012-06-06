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
	var key;
	var querys = [];
	
	var firstChunk = this.featureCache._getChunk(region.start);
	var lastChunk = this.featureCache._getChunk(region.end);
	var cellBaseManager = new CellBaseManager(this.species,{host: this.host});

	cellBaseManager.success.addEventListener(function(sender,data){
		_this.featureCache.put(data);
		for(var i = 0; i < data.length; i++) {
			_this.featureCache.put(data[i]);
			_this.onGetData.notify(_this.featureCache.getFeaturesByChunk(key));
		}
		
	});
	
	for(var i=firstChunk; i<=lastChunk; i++){
		key = region.chromosome+":"+i;
		if(this.featureCache.cache[key] == null) {
			this.featureCache.cache[key] = new Array();
			var chunkStart = parseInt(i * this.featureCache.chunkSize);
			var chunkEnd = parseInt((i * this.featureCache.chunkSize) + this.featureCache.chunkSize-1);
			var query = region.chromosome+":"+chunkStart+"-"+chunkEnd;
			querys.push(query);
		}else{
			this.onGetData.notify(this.featureCache.getFeaturesByChunk(key));
		}
		
	}
	if(querys.length > 0){
		cellBaseManager.get(this.category, this.subCategory, querys, this.resource);
	}
};

CellBaseAdapter.prototype.getDataOLD = function(region){
	var _this = this;
	
	var features = _this.featureCache.get(region, true);
	
	if(features == null){
		var cellBaseManager = new CellBaseManager(this.species,{host: this.host});
		cellBaseManager.success.addEventListener(function(sender,data){
			//check if is an array of arrays or an array of objects
			if(data.length > 0){
				if(data[0].constructor == Object){ 
					_this.featureCache.put(data,region);
				}
				else{
					for(var i = 0; i < data.length; i++) {
						_this.featureCache.put(data[i],region);
					}
				}
			}else{
				_this.featureCache.put(data,region);
			}
			_this.onGetData.notify(_this.featureCache.get(region, true));
		});

		var chunkRegion = this.featureCache.getChunkRegion(region);
		var query = region.chromosome+":"+chunkRegion.start+"-"+chunkRegion.end;
//		var query = region.chromosome+":"+region.start+"-"+region.end;
		cellBaseManager.get(this.category, this.subCategory, query, this.resource);
		
	}else{
//		_this.onGetData.notify(features);
	}
};
