function NetworkDataAdapter(dataSource, args){
	var _this = this;
	
	this.dataSource = dataSource;
	this.async = true;
	this.graph = {};
	this.addedNodes = {};

	this.onLoad = new Event();
	
	if (args != null) {
		if(args.async != null){
			this.async = args.async;
		}
		if(args.networkData != null){
			this.networkData = args.networkData;
		}
		else {
			this.networkData = new NetworkData({});
		}
	}
	
	if(this.async){
		this.dataSource.success.addEventListener(function(sender,data){
			_this.parse(data);
			_this.onLoad.notify(data);
		});
		this.dataSource.fetch(this.async);
	}else{
		var data = this.dataSource.fetch(this.async);
		this.parse(data);
	}
};

NetworkDataAdapter.prototype.getNetworkData = function(){
	return this.networkData;
};
