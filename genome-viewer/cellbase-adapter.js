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
		if(args.gzip != null){
			this.gzip = args.gzip;
		}
	}
	this.featureCache =  new FeatureCache({chunkSize:1000, gzip:this.gzip});
	this.onGetData = new Event();
};

CellBaseAdapter.prototype.getData = function(region){
	var _this = this;
	
	var features = _this.featureCache.get(region, true);
	
	if(features == null){
		var cellBaseManager = new CellBaseManager(this.species,{host: this.host});
		cellBaseManager.success.addEventListener(function(sender,data){
			console.log("cellBaseManager.success")
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
		
		console.log(query)
		var query = region.chromosome+":"+region.start+"-"+region.end;
		cellBaseManager.get(this.category, this.subCategory, query, this.resource);
		
	}else{
		_this.onGetData.notify(features);
	}
};
