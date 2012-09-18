function BamCache(args) {
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
	this.chunksDisplayed = {};
	
	this.maxFeaturesInterval = 0;//for local histogram
	
	
	
	//XXX
	this.gzip = false;
};

BamCache.prototype._getChunk = function(position){
	return Math.floor(position/this.chunkSize);
};

BamCache.prototype.getFeaturesByChunk = function(key, dataType){
	var features =  [];
	var feature, firstChunk, lastChunk, chunk;
	var chr = key.split(":")[0], chunkId = key.split(":")[1];
	var region = {chromosome:chr,start:chunkId*this.chunkSize,end:chunkId*this.chunkSize+this.chunkSize-1};
	
	if(this.cache[key] != null && this.cache[key][dataType] != null) {
		if(this.gzip) {
			coverage = JSON.parse(RawDeflate.inflate(this.cache[key]["coverage"]));
		}else{
			coverage = this.cache[key]["coverage"];
		}
		
		for ( var i = 0, len = this.cache[key]["data"].length; i < len; i++) {
			if(this.gzip) {
				feature = JSON.parse(RawDeflate.inflate(this.cache[key]["data"][i]));
			}else{
				feature = this.cache[key]["data"][i];
			}
			
			//check if any feature chunk has been already displayed 
			var displayed = false;
			firstChunk = this._getChunk(feature.start);
			lastChunk = this._getChunk(feature.end);
			for(var f=firstChunk; f<=lastChunk; f++){
				var fkey = feature.chromosome+":"+f;
				if(this.chunksDisplayed[fkey+dataType]==true){
					displayed = true;
					break;
				}
			}
			
			if(!displayed){
				features.push(feature);
				returnNull = false;
			}
		}
		this.chunksDisplayed[key+dataType]=true;
		chunk = {reads:features,coverage:coverage,region:region};
		return chunk;
	}
	
};

BamCache.prototype.getFeaturesByRegion = function(region, dataType){
	var firstRegionChunk, lastRegionChunk, firstChunk, lastChunk, chunks = [], feature, key, coverage, features = [], displayed;
	firstRegionChunk = this._getChunk(region.start);
	lastRegionChunk = this._getChunk(region.end);
	for(var i=firstRegionChunk; i<=lastRegionChunk; i++){
		key = region.chromosome+":"+i;
		if(this.cache[key] != null){
			if(this.gzip) {
				coverage = JSON.parse(RawDeflate.inflate(this.cache[key]["coverage"]));
			}else{
				coverage = this.cache[key]["coverage"];
			}

			for ( var j = 0, len = this.cache[key]["data"].length; j < len; j++) {
				if(this.gzip) {
					feature = JSON.parse(RawDeflate.inflate(this.cache[key]["data"][j]));
				}else{
					feature = this.cache[key]["data"][j];
				}
				
				
//				check if any feature chunk has been already displayed 
				displayed = false;
				firstChunk = this._getChunk(feature.start);
				lastChunk = this._getChunk(feature.end);
				for(var f=firstChunk; f<=lastChunk; f++){
					var fkey = region.chromosome+":"+f;
					if(this.chunksDisplayed[fkey+dataType]==true){
						displayed = true;
						break;
					}
				}
				
				if(!displayed){
					features.push(feature);
				}
				
			}
		}
		this.chunksDisplayed[key+dataType]=true;//mark chunk as displayed
		chunks.push({reads:features,coverage:coverage,region:region});
	}
	return chunks;
};




BamCache.prototype.putFeaturesByRegion = function(resultObj, region, featureType, dataType){
	var key, firstChunk, lastChunk, firstRegionChunk, lastRegionChunk, read, gzipRead;
	var reads = resultObj.reads;
	var coverage = resultObj.coverage;
	
	//initialize region
	firstRegionChunk = this._getChunk(region.start);
	lastRegionChunk = this._getChunk(region.end);
	
	var chunkIndex = 0;
	console.time("BamCache.prototype.putFeaturesByRegion1")
	for(var i=firstRegionChunk; i<=lastRegionChunk; i++){
		key = region.chromosome+":"+i;
		if(this.cache[key]==null){
			this.cache[key] = {};
			this.cache[key]["data"] = [];
		}
//		var chunkCoverage = coverage.slice(chunkIndex,chunkIndex+this.chunkSize);
		var chunkCoverageAll = coverage.all.slice(chunkIndex,chunkIndex+this.chunkSize);
		var chunkCoverageA = coverage.a.slice(chunkIndex,chunkIndex+this.chunkSize);
		var chunkCoverageC = coverage.c.slice(chunkIndex,chunkIndex+this.chunkSize);
		var chunkCoverageG = coverage.g.slice(chunkIndex,chunkIndex+this.chunkSize);
		var chunkCoverageT = coverage.t.slice(chunkIndex,chunkIndex+this.chunkSize);
		var chunkCoverage = {
			"all":chunkCoverageAll,
			"a":chunkCoverageA,
			"c":chunkCoverageC,
			"g":chunkCoverageG,
			"t":chunkCoverageT
		};
		
		if(this.gzip) {
			this.cache[key]["coverage"]=RawDeflate.deflate(JSON.stringify(chunkCoverage));
		}else{
			this.cache[key]["coverage"]=chunkCoverage;
		}
		chunkIndex+=this.chunkSize;
	}
	console.timeEnd("BamCache.prototype.putFeaturesByRegion1")
	console.time("BamCache.prototype.putFeaturesByRegion")
	var ssss = 0;
	for(var index = 0, len = reads.length; index<len; index++) {
		read = reads[index];
		read.featureType = "bam";
		firstChunk = this._getChunk(read.start);
		lastChunk = this._getChunk(read.end == 0?read.end=-1:read.end);//0 is not a position, i set to -1 to avoid enter in for
//		Some reads has end = 0. So will not be drawn IGV does not draw those reads
		
		if(this.gzip) {
			gzipRead = RawDeflate.deflate(JSON.stringify(read));
			ssss+= gzipRead.length;
		}else{
			gzipRead = read;
			ssss+= JSON.stringify(gzipRead).length;
		}
		
		for(var i=firstChunk; i<=lastChunk; i++) {
			if(i >= firstRegionChunk && i<= lastRegionChunk){//only if is inside the called region
				key = read.chromosome+":"+i;
				this.cache[key]["data"].push(gzipRead);
			}
		}
	}
	console.timeEnd("BamCache.prototype.putFeaturesByRegion");
	console.log("BamCache.prototype.putFeaturesByRegion"+ssss)
};

//BamCache.prototype.remove = function(region){
//	var firstChunk = this._getChunk(region.start);
//	var lastChunk = this._getChunk(region.end);
//	for(var i=firstChunk; i<=lastChunk; i++){
//		var key = region.chromosome+":"+i;
//		this.cache[key] = null;
//	}
//};
//
//BamCache.prototype.clear = function(){
//		this.size = 0;		
//		this.cache = {};
//};
//
//BamCache.prototype.clearType = function(dataType){
//	this.cache[dataType] = null;
//};
