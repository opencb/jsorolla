SIFDataAdapter.prototype.getNetworkData = NetworkDataAdapter.prototype.getNetworkData;

function SIFDataAdapter(dataSource, args){
	NetworkDataAdapter.prototype.constructor.call(this, dataSource, args);
	
//	this.dataSource = dataSource;
//	this.async = true;
//	this.graph = {};
//	this.addedNodes = {};
//
//	this.onLoad = new Event();
//	
//	if (args != null) {
//		if(args.async != null){
//			this.async = args.async;
//		}
//	}
//	
//	if(this.async){
//		this.dataSource.success.addEventListener(function(sender,data){
//			_this.parse(data);
//			_this.onLoad.notify(data);
//		});
//		this.dataSource.fetch(this.async);
//	}else{
//		var data = this.dataSource.fetch(this.async);
//		this.parse(data);
//	}
	
};

SIFDataAdapter.prototype.parse = function(data){
	var _this = this;
	
	var lines = data.split("\n");
	for (var i = 0; i < lines.length; i++){
		var line = lines[i].replace(/^\s+|\s+$/g,"");
		if ((line != null)&&(line.length > 0)){
			var fields = line.split("\t");
			if (fields[0].substr(0,1) != "#"){
				var source = fields[0];
				if(this.addedNodes[source] == null){
					sourceId = this.networkData.addNode({
						"name": source,
						"metainfo":{}
					});
					this.addedNodes[source] = sourceId;
				}
				
				var relation = fields[1];
				
				for(var j=2, len=fields.length; j<len; j++){
					target = fields[j];
					if(this.addedNodes[target] == null){
						targetId = this.networkData.addNode({
							"name": target,
							"metainfo":{}
						});
						this.addedNodes[target] = targetId;
					}
					this.networkData.addEdge(this.addedNodes[source], this.addedNodes[target], "directed", relation, EDGE_TYPES["directed"]);
					
				}
			}
		}
	}
};
