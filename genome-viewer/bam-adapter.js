function BamAdapter(args){
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
	this.featureCache =  new BamCache(argsFeatureCache);
	this.onGetData = new Event();
};

BamAdapter.prototype.getData = function(args){
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
	var dqsManager = new DqsManager();
	dqsManager.onRegion.addEventListener(function (evt, data){
		var dataType = "data";
		if(data.params.histogram){
			dataType = "histogram"+data.params.interval;
		}

		var splitDots = data.query.split(":");
		var splitDash = splitDots[1].split("-");
		var query = {chromosome:splitDots[0],start:splitDash[0],end:splitDash[1]};
		
		
		
		_this.featureCache.putFeaturesByRegion(data.result, query, data.resource, dataType);
		var items = _this.featureCache.getFeatureChunksByRegion(query, dataType);
		itemList = itemList.concat(items);
		if(itemList.length > 0){
			_this.onGetData.notify({items:itemList, params:_this.params, cached:false});
		}
	});

	var querys = [];
	var updateStart = true;
	var updateEnd = true;
	if(chunks.length > 0){//chunks needed to retrieve
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
		for ( var i = 0, li = querys.length; i < li; i++) {
			console.time("dqs");
			dqsManager.region(this.category, this.resource, querys[i], this.params);
		}
	}else{//no server call
		if(itemList.length > 0){
			this.onGetData.notify({items:itemList, params:this.params});
		}
	}
};
