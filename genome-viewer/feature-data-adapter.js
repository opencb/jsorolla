function FeatureDataAdapter(dataSource, args){
	var _this = this;
	
	this.dataSource = dataSource;
	this.gzip = true;
	
	if (args != null){
		if(args.gzip != null){
			this.gzip = args.gzip;
		}
	}
	
	this.featureCache =  new FeatureCache({chunkSize:1000, gzip:this.gzip});
	
	this.onLoad = new Event();	
	this.onGetData = new Event();
};

FeatureDataAdapter.prototype.getData = function(region){
	var dataType = "data";
	var itemList = this.featureCache.getFeaturesByRegion(region, dataType);
	console.log(itemList);
	this.onGetData.notify({data:itemList,cached:true});
};
