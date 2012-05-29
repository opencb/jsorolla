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
		if(args.gzip != null){
			this.gzip = args.gzip;
		}
	}
	
	this.cache = new Object();
};

FeatureCache.prototype._getChunk = function(position){
	return Math.floor(position/this.chunkSize);
};

FeatureCache.prototype.put = function(featureDataList,region){
	var key,firstChunk,lastChunk,feature;
	
	//initialize region
	firstChunk = this._getChunk(region.start);
	lastChunk = this._getChunk(region.end);
	for(var i=firstChunk; i<=lastChunk; i++){
		key = region.chromosome+":"+i;
		if(this.cache[key]==null){
			this.cache[key] = new Array();
		}
	}
	
	//put features on his chunk
	for(var index in featureDataList) {
		feature = featureDataList[index];
		firstChunk = this._getChunk(feature.start);
		lastChunk = this._getChunk(feature.end);
		for(var i=firstChunk; i<=lastChunk; i++) {
			key = feature.chromosome+":"+i;
			if(this.cache[key]==null){
				this.cache[key] = new Array();
			}
			if(this.gzip) {
				this.cache[key].push(RawDeflate.deflate(JSON.stringify(feature)));
			}else{
				this.cache[key].push(feature);
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
	
	var addedHash = new Object();
	for(var i=firstChunk; i<=lastChunk; i++){
		key = region.chromosome+":"+i;
		if(this.cache[key] != null && this.cache[key].length > 0) {
			for ( var j = 0; j < this.cache[key].length; j++) {
				if(this.gzip) {
					feature = JSON.parse(RawDeflate.inflate(this.cache[key][j]));
				}else{
					feature = this.cache[key][j];
				}
				
				if(addedHash[feature.chromosome+feature.start+feature.end]!=true){
					// we only get those features in the region
					if(feature.end > region.start && feature.start < region.end /*&& feature.start > i*this.chunkSize*/){
						features.push(feature);
					}
					addedHash[feature.chromosome+feature.start+feature.end]=true;
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