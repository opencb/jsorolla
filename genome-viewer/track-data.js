function TrackData(species,args) {
	this.args = args;
	this.id = args.id;
	this.type = args.type;
	this.resource = args.resource;
	this.species = species;
	
	this.featureCache =  new FeatureCache({chunkSize:1000, gzip:true});
	
	this.onRetrieve = new Event();
	
	//~ this.retrieveData({chromosome:13,start:32889511,end:32891522});
};

//al moverse se va rellenando.
TrackData.prototype.retrieveData = function(region){
	
	console.log(region.chromosome+":"+region.start+"-"+region.end)
	var _this = this;
	var features = this.featureCache.get(region);
	if(features == null){
		var query = region.chromosome+":"+region.start+"-"+region.end;
		var cellBaseManager = new CellBaseManager(_this.species);
		cellBaseManager.success.addEventListener(function(sender,data){
			if(_this.resource == "sequence"){
				_this.featureCache.put(data,region);
			}
			else{
				for(var i = 0; i < data.length; i++) {
					_this.featureCache.put(data[i],region);
				}
			}
			_this.onRetrieve.notify(_this.featureCache.get(region));
		});
		cellBaseManager.get("genomic", "region", query, this.resource);
	}else{
		_this.onRetrieve.notify(features);
	}
	
};


