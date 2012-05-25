function FeatureCache(args) {
	this.args = args;
	this.id = Math.round(Math.random()*10000000); // internal id for this class

	this.chunkSize = 1000;
	this.gzip = false;
	this.maxSize = 10*1024*1024;
	this.size = 0;
	
	if (args != null){
		if(args.chunkSize != null){
			this.chunkSize = args.chunkSize;
		}
	}
	
	this.cache = new Object();
};

FeatureCache.prototype._getChunk = function(position){
	return Math.floor(position/this.chunkSize);
};

FeatureCache.prototype.put = function(featureDataList){
	var key,firstChunk,lastChunk;
	for(var featureData in featureDataList) {
		firstChunk = this._getChunk(featureData.start);
		lastChunk = this._getChunk(featureData.end);
		for(var i=firstChunk; i<=lastChunk; i++) {
			key = featureData.chromosome+":"+i;
			if(this.cache[key]==null){
				this.cache[key] = new Array();
			}
			if(this.gzip) {
				this.cache[key].push(featureData);
			}else{
				this.cache[key].push(featureData);
			}
		}
	}
};

FeatureCache.prototype.get = function(region){
	var firstChunk = this._getChunk(region.start);
	var lastChunk = this._getChunk(region.end);
	var features =  new Array();
	var feature, key;
	// validator
	for(var i=firstChunk; i<=lastChunk; i++){
		key = region.chromosome+":"+i;
		if(this.cache[key] == null) {
			return null;
		}
	}
	for(var i=firstChunk; i<=lastChunk; i++){
		key = region.chromosome+":"+i;
		if(this.cache[key] != null && this.cache[key].length > 0) {
			for ( var i = 0; i < this.cache[key].length; i++) {
				if(this.gzip) {
//					feature = ;
				}else{
					feature = this.cache[key][i];
				}
				// we only get those features in the region
				if(feature.end > region.start && feature.start < region.end ){
					features.push(feature);
				}
			}
		}
		
	}
	return features;
};

FeatureCache.prototype.remove = function(region){
	var firstChunk = this._getChunk(region.start);
	var lastChunk = this._getChunk(region.end);
	for(var i=firstChunk; i<=lastChunk; i++){
		var key = region.chromosome+":"+i;
		this.cache[key] = null;
	}
};

FeatureCache.prototype.clear = function(key){
	this.size = 0;
	this.cache= new Object();
};