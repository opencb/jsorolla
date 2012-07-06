function FeatureDataAdapter(dataSource, args){
	var _this = this;
	
	this.dataSource = dataSource;
	this.gzip = true;
	
	this.params = {};
	if (args != null){
		if(args.gzip != null){
			this.gzip = args.gzip;
		}
		if(args.species != null){
			this.species = args.species;
		}
		if(args.params != null){
			this.params = args.params;
		}
	}
	
	this.featureCache =  new FeatureCache({chunkSize:10000, gzip:this.gzip});
	
	this.onLoad = new Event();	
	this.onGetData = new Event();
};

FeatureDataAdapter.prototype.getData = function(region){
	
	console.log("XXX comprobar histograma");
	console.log(region);
	var dataType = "data";
	var itemList = this.featureCache.getFeaturesByRegion(region, dataType);
	if(itemList != null){
		this.onGetData.notify({data:itemList, params:this.params, cached:true});
	}
};


FeatureDataAdapter.prototype.addFeatures = function(features){
		this.featureCache.putFeatures(features, "data");
};
