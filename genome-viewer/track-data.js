function TrackData(species,args) {
	this.args = args;
	this.id = args.id;
	this.resource = args.resource;
	this.species = species;
	
	this.featureCache =  new FeatureCache({chunkSize:1000});
	
	this.onCache = new Event();
	
	this.get({chromosome:13,start:32889511,end:32891522});
};

//al moverse se va rellenando.
TrackData.prototype.get = function(region){
	var _this = this;
	
	this.featureCache.get(region);
	
//	var query = region.chromosome+":"+region.start+"-"+region.end;
//	var cellBaseManager = new CellBaseManager(_this.species);
//	cellBaseManager.success.addEventListener(function(sender,data){
//		for(var i = 0; i < data.length; i++) {
//			_this.featureCache.put(data[i]);
//			_this.onCache.notify(region);
//		}
//	});
//	cellBaseManager.get("genomic", "region", query, this.resource);
};

//este método recoge exactamente los elementos de la región.
TrackData.prototype._asdf = function(region){
	var firstChunk = Math.floor(region.start/this.featureCache.chunkSize);
	if (firstChunk > 0){
		firstChunk -=1;
	}
	var lastChunk = Math.floor(region.end/this.featureCache.chunkSize) + 1;
	
	var keys = new Array();
	for(i=firstChunk; i<=lastChunk; i++){
		var key = region.chromosome+"-"+i;
		keys.push(key);
		console.log(this.featureCache.get(keys[i]));
	}
};
