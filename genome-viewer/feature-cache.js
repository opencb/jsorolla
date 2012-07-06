function FeatureCache(args) {
	this.args = args;
	this.id = Math.round(Math.random() * 10000000); // internal id for this class

	this.chunkSize = 50000;
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

FeatureCache.prototype.getFirstFeature = function(){
	var feature;
	if(this.gzip) {
		feature = JSON.parse(RawDeflate.inflate(this.cache[Object.keys(this.cache)[0]].data[0]));
	}else{
		feature = this.cache[Object.keys(this.cache)[0]].data[0];
	}
	return feature;
};


FeatureCache.prototype.getFeaturesByChunk = function(key, dataType){
	var features =  [];
	var feature;
	
	if(this.cache[key] != null && this.cache[key][dataType] != null) {
		for ( var i = 0, len = this.cache[key][dataType].length; i < len; i++) {
			if(this.gzip) {
				feature = JSON.parse(RawDeflate.inflate(this.cache[key][dataType][i]));
			}else{
				feature = this.cache[key][dataType][i];
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


FeatureCache.prototype.putFeaturesByRegion = function(featureDataList, region, featureType, dataType){
	var key,firstChunk,lastChunk,feature;
	
	//initialize region
	firstChunk = this._getChunk(region.start);
	lastChunk = this._getChunk(region.end);
	for(var i=firstChunk; i<=lastChunk; i++){
		key = region.chromosome+":"+i;
		if(this.cache[key]==null){
			this.cache[key] = {};
		}
		if(this.cache[key][dataType]==null){
			this.cache[key][dataType] = [];
		}
	}
	
	//Check if is a single object
	if(featureDataList.constructor != Array){
		featureDataList = [featureDataList];
	}
	
	for(var index = 0, len = featureDataList.length; index<len; index++) {
		feature = featureDataList[index];
		feature.featureType = featureType;
		firstChunk = this._getChunk(feature.start);
		lastChunk = this._getChunk(feature.end);
		for(var i=firstChunk; i<=lastChunk; i++) {
			key = feature.chromosome+":"+i;
			/*XXX la feature no tiene chromosoma, una feature de histograma no tiene chromosoma, cojo el de la region para que vaya */
			if(feature.chromosome==null){
				key = region.chromosome+":"+i;
			}
			/*XXX*/
			if(this.cache[key] != null && this.cache[key][dataType] != null){
				if(this.gzip) {
					this.cache[key][dataType].push(RawDeflate.deflate(JSON.stringify(feature)));
				}else{
					this.cache[key][dataType].push(feature);
				}
			}
		}
	}
};


FeatureCache.prototype.getFeaturesByRegion = function(region, dataType){
	var firstChunk = this._getChunk(region.start);
	var lastChunk = this._getChunk(region.end);
	var features =  [];
	var feature, key;
	var returnNull = true;
	for(var i=firstChunk; i<=lastChunk; i++){
//		console.log("Chunk: "+i)
		key = region.chromosome+":"+i;
		// check if this key exists in cache (features from files)
		if(this.cache[key] != null && this.cache[key][dataType] != null){
			for ( var j = 0, len = this.cache[key][dataType].length; j < len; j++) {
				if(this.gzip) {
					feature = JSON.parse(RawDeflate.inflate(this.cache[key][dataType][j]));
				}else{
					feature = this.cache[key][dataType][j];
				}
				if(this.featuresAdded[feature.chromosome+":"+feature.start+"-"+feature.end]!=true){
					// we only get those features in the region
					if(feature.end > region.start && feature.start < region.end){
						features.push(feature);
						returnNull = false;
					}
					this.featuresAdded[feature.chromosome+":"+feature.start+"-"+feature.end]=true;
				}
			}
		}
	}
	if(returnNull){
		return null;
	}else{
		return features;
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

FeatureCache.prototype.clear = function(){
		this.size = 0;		
		this.cache = {};
};

FeatureCache.prototype.clearType = function(dataType){
	this.cache[dataType] = null;
};






//XXX need revision
FeatureCache.prototype.putFeatures = function(featureDataList, dataType){
	var feature, key, firstChunk, lastChunk;

	//Check if is a single object
	if(featureDataList.constructor != Array){
		var featureData = featureDataList;
		featureDataList = [featureData];
	}

	for(var index = 0, len = featureDataList.length; index<len; index++) {
		feature = featureDataList[index];
		firstChunk = this._getChunk(feature.start);
		lastChunk = this._getChunk(feature.end);
		for(var i=firstChunk; i<=lastChunk; i++) {
			key = feature.chromosome+":"+i;
			if(this.cache[key]==null){
				this.cache[key] = [];
			}
			if(this.cache[key][dataType]==null){
				this.cache[key][dataType] = [];
			}
			if(this.gzip) {
				this.cache[key][dataType].push(RawDeflate.deflate(JSON.stringify(feature)));
			}else{
				this.cache[key][dataType].push(feature);
			}

		}
	}
};

FeatureCache.prototype.putChunk = function(featureDataList, chunkRegion, dataType){
	var feature, key, chunk;
	chunk = this._getChunk(chunkRegion.start);
	key = chunkRegion.chromosome+":"+chunk;

	if(this.cache[key]==null){
		this.cache[key] = [];
	}
	if(this.cache[key][dataType]==null){
		this.cache[key][dataType] = [];
	}

	if(featureDataList.constructor == Object){
		if(this.gzip) {
			this.cache[key][dataType].push(RawDeflate.deflate(JSON.stringify(featureDataList)));
		}else{
			this.cache[key][dataType].push(featureDataList);
		}
	}else{
		for(var index = 0, len = featureDataList.length; index<len; index++) {
			feature = featureDataList[index];
			if(this.gzip) {
				this.cache[key][dataType].push(RawDeflate.deflate(JSON.stringify(feature)));
			}else{
				this.cache[key][dataType].push(feature);
			}
		}
	}
	
};




//XXX not tested
FeatureCache.prototype.histogram = function(region, interval){

	var intervals = (region.end-region.start+1)/interval;
	var intervalList = [];
	
	for ( var i = 0; i < intervals; i++) {
		var featuresInterval = 0;
		
		var intervalStart = i*interval;//deberia empezar en 1...
		var intervalEnd = ((i+1)*interval)-1;
		
		var firstChunk = this._getChunk(intervalStart+region.start);
		var lastChunk = this._getChunk(intervalEnd+region.start);
		
		console.log(this.cache);
		for(var j=firstChunk; j<=lastChunk; j++){
			var key = region.chromosome+":"+j;
			console.log(key);
			console.log(this.cache[key]);
			for ( var k = 0, len = this.cache[key].length; k < len; k++) {
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