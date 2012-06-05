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
	this.onGetData.notify(this.featureCache.get(region));
};
