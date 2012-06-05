function TrackData(type, args) {
	this.gzip = true;
	
	if (args != null){
		if(args.adapter != null){
			this.adapter = args.adapter;
		}
		if(args.gzip != null){
			this.gzip = args.gzip;
		}
	}
	this.onRetrieve = new Event();
};

TrackData.prototype.retrieveData = function(region){
	var _this = this;
	this.adapter.onGetData.addEventListener(function(sender,data){
		_this.onRetrieve.notify(data);
	});
	this.adapter.getData(region);
};

