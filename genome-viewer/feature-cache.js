function FeatureCache(args) {
	this.args = args;
	this.id = Math.round(Math.random() * 10000000); // internal id for this class

	this.chunkSize = 1000;
	this.gzip = true;
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
	
	this.cache = {};
	this.featuresAdded = {};
	
	this.maxFeaturesInterval = 0;
};

FeatureCache.prototype._getChunk = function(position){
	return Math.floor(position/this.chunkSize);
};

FeatureCache.prototype.getChunkRegion = function(region){
	start = this._getChunk(region.start) * this.chunkSize;
	end = (this._getChunk(region.end) * this.chunkSize) + this.chunkSize-1;
	return {start:start,end:end};
};


FeatureCache.prototype.putChunk = function(featureDataList, chunkRegion){
	var feature, key, chunk;
	chunk = this._getChunk(chunkRegion.start);
	key = chunkRegion.chromosome+":"+chunk;

	if(this.cache[key]==null){
		this.cache[key] = [];
	}

	if(featureDataList.constructor == Object){
		if(this.gzip) {
			this.cache[key].push(RawDeflate.deflate(JSON.stringify(featureDataList)));
		}else{
			this.cache[key].push(featureDataList);
		}
	}else{
		for(var index in featureDataList) {
			feature = featureDataList[index];
			if(this.gzip) {
				this.cache[key].push(RawDeflate.deflate(JSON.stringify(feature)));
			}else{
				this.cache[key].push(feature);
			}
		}
	}
	
};

FeatureCache.prototype.getFeaturesByChunk = function(key){
	var features =  [];
	var feature;
	
	if(this.cache[key] != null) {
		for ( var i = 0; i < this.cache[key].length; i++) {
			if(this.gzip) {
				feature = JSON.parse(RawDeflate.inflate(this.cache[key][i]));
			}else{
				feature = this.cache[key][i];
			}
			
			if(this.featuresAdded[feature.chromosome+":"+feature.start+"-"+feature.end]!=true){
				features.push(feature);
				this.featuresAdded[feature.chromosome+":"+feature.start+"-"+feature.end]=true;
			}
//			features.push(feature);
		}
		return features;
	}
	
	return null;
};





FeatureCache.prototype.putRegion = function(featureDataList,region){
	var key,firstChunk,lastChunk,feature;
	
	//initialize region
	firstChunk = this._getChunk(region.start);
	lastChunk = this._getChunk(region.end);
	for(var i=firstChunk; i<=lastChunk; i++){
		key = region.chromosome+":"+i;
		if(this.cache[key]==null){
			this.cache[key] = [];
		}
	}
	
	//Check if is a single object
	if(featureDataList.constructor != Array){
		var featureData = featureDataList;
		featureDataList = [featureData];
	}
	
	for(var index in featureDataList) {
		feature = featureDataList[index];
		firstChunk = this._getChunk(feature.start);
		lastChunk = this._getChunk(feature.end);
		for(var i=firstChunk; i<=lastChunk; i++) {
			key = feature.chromosome+":"+i;
			if(this.cache[key]!=null){
				if(this.gzip) {
					this.cache[key].push(RawDeflate.deflate(JSON.stringify(feature)));
				}else{
					this.cache[key].push(feature);
				}
			}
		}
	}
};

//FeatureCache.prototype.put2 = function(featureDataList){
//	var feature, key, firstChunk,lastChunk;
//	
//	for(var index in featureDataList) {
//		feature = featureDataList[index];
//		firstChunk = this._getChunk(feature.start);
//		lastChunk = this._getChunk(feature.end);
//		for(var i=firstChunk; i<=lastChunk; i++) {
//			key = feature.chromosome+":"+i;
//			if(this.cache[key] != null){
//				if(this.gzip) {
//					this.cache[key].push(RawDeflate.deflate(JSON.stringify(feature)));
//				}else{
//					this.cache[key].push(feature);
//				}
//			}
//		}
//	}
//};



FeatureCache.prototype.getFeaturesByRegion = function(region){
	var firstChunk = this._getChunk(region.start);
	var lastChunk = this._getChunk(region.end);
	var features =  [];
	var feature, key;
	for(var i=firstChunk; i<=lastChunk; i++){
//		console.log("Chunk: "+i)
		key = region.chromosome+":"+i;
		for ( var j = 0; j < this.cache[key].length; j++) {
			if(this.gzip) {
				feature = JSON.parse(RawDeflate.inflate(this.cache[key][j]));
			}else{
				feature = this.cache[key][j];
			}
			if(this.featuresAdded[feature.chromosome+":"+feature.start+"-"+feature.end]!=true){
				// we only get those features in the region
				if(feature.end > region.start && feature.start < region.end){
					features.push(feature);
				}
				this.featuresAdded[feature.chromosome+":"+feature.start+"-"+feature.end]=true;
			}
		}
	}
	return features;
};

FeatureCache.prototype.histogram = function(region, interval){

	var intervals = (region.end-region.start+1)/interval;
	var intervalList = [];
	
	for ( var i = 0; i < intervals; i++) {
		var featuresInterval = 0;
		
		var intervalStart = i*interval;//deberia empezar en 1...
		var intervalEnd = ((i+1)*interval)-1;
		
		debugger
		
		var firstChunk = this._getChunk(intervalStart+region.start);
		var lastChunk = this._getChunk(intervalEnd+region.start);
		
		console.log(this.cache);
		for(var j=firstChunk; j<=lastChunk; j++){
			var key = region.chromosome+":"+j;
			console.log(key);
			console.log(this.cache[key]);
			for ( var k = 0; k < this.cache[key].length; k++) {
				if(this.gzip) {
					feature = JSON.parse(RawDeflate.inflate(this.cache[key][k]));
				}else{
					feature = this.cache[key][k];
				}
				if(feature.start > intervalStart && feature.start < intervalEnd);
				featuresInterval++;
			}
			
		}
		intervalList[i]=featuresInterval;
		
		if(this.maxFeaturesInterval<featuresInterval){
			this.maxFeaturesInterval = featuresInterval;
		}
	}
	
	for ( var inter in  intervalList) {
		intervalList[inter]=intervalList[inter]/this.maxFeaturesInterval;
	}
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
