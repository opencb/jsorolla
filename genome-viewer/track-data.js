function TrackData(type, args) {
	
	this.args = args;
	this.gzip = true;
	
	if (args != null){
		if(args.adapter != null){
			this.adapter = args.adapter;
		}
//		if(args.id != null){
//			this.id = args.id;
//		}
//		if(args.type != null){
//			this.type = args.type;
//		}
		if(args.gzip != null){
			this.gzip = args.gzip;
		}
	}
	
	this.featureCache =  new FeatureCache({chunkSize:1000, gzip:this.gzip});
	
	this.onRetrieve = new Event();
	
	// this.retrieveData({chromosome:13,start:32889511,end:32891522});
};

//al moverse se va rellenando.
TrackData.prototype.retrieveData = function(region){
	var _this = this;
	var features = this.featureCache.get(region);
	if(features == null){
		console.log(this.adapter)
		var query = region.chromosome+":"+region.start+"-"+region.end;
		this.adapter.onGetData.addEventListener(function(sender,data){
			if(_this.adapter.resource == "sequence"){
				_this.featureCache.put(data,region);
			}
			else{
				for(var i = 0; i < data.length; i++) {
					_this.featureCache.put(data[i],region);
				}
			}
			_this.onRetrieve.notify(_this.featureCache.get(region));
		});
		this.adapter.getData(query);
		
	}else{
		_this.onRetrieve.notify(features);
	}
	
	
	
//	console.log(region.chromosome+":"+region.start+"-"+region.end)
//	var _this = this;
//	var features = this.featureCache.get(region);
//	if(features == null){
//		var query = region.chromosome+":"+region.start+"-"+region.end;
//		var cellBaseManager = new CellBaseManager(_this.species);
//		cellBaseManager.success.addEventListener(function(sender,data){
//			if(_this.resource == "sequence"){
//				_this.featureCache.put(data,region);
//			}
//			else{
//				for(var i = 0; i < data.length; i++) {
//					_this.featureCache.put(data[i],region);
//				}
//			}
//			_this.onRetrieve.notify(_this.featureCache.get(region));
//		});
//		cellBaseManager.get("genomic", "region", query, this.resource);
//	}else{
//		_this.onRetrieve.notify(features);
//	}
	
};


