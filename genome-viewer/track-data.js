function TrackData(type, args) {
	if (args != null){
		if(args.adapter != null){
			this.adapter = args.adapter;
			console.log(this.adapter);
		}
		if(args.gzip != null){
			this.gzip = args.gzip;
		}
	}
};

TrackData.prototype.retrieveData = function(region){
	this.adapter.getData(region);
};
