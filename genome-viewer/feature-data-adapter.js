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
	
	this.onGetData = new Event();
	this._onParse = new Event();
	
	this.dataSource.success.addEventListener(function(sender, data){
		_this.parse(data);
		_this._onParse.notify();
	});
	this.dataSource.fetch();
};

FeatureDataAdapter.prototype.getData = function(region){
	var _this = this;
	this._onParse.addEventListener(function(sender){
		var features = _this.featureCache.get(region);
		_this.onGetData.notify(features);
	});
	
};
