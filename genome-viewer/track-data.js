function TrackData(type, args) {
	
	if (args != null){
		if(args.adapter != null){
			this.adapter = args.adapter;
		}
		if(args.gzip != null){
			this.gzip = args.gzip;
		}
	}
	this.onRetrieve = this.adapter.onGetData;
};

TrackData.prototype.retrieveData = function(region){
	this.adapter.getData(region);
};

