function AttributesDataAdapter(dataSource, args){
	var _this = this;
	this.dataSource = dataSource;
	this.async = true;
	
	this.json = {};
	this.attributes = [];
	this.data = [];

	this.onLoad = new Event();
	
	if (args != null) {
		if(args.async != null){
			this.async = args.async;
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

AttributesDataAdapter.prototype.parse = function(data){
	var _this = this;
	
	var lines = data.split("\n");
	if(lines.length > 2) {
		var types = lines[0].substring(1).replace(/^\s+|\s+$/g,"").split("\t");
		var defVal = lines[1].substring(1).replace(/^\s+|\s+$/g,"").split("\t");
		var headers = lines[2].substring(1).replace(/^\s+|\s+$/g,"").split("\t");
		
		for(var i=0; i < headers.length; i++){
			this.attributes.push({
					"name": headers[i],
					"type": types[i],
					"defaultValue": defVal[i]
			});
		}
	}
	
	for (var i = 3; i < lines.length; i++) {
		var line = lines[i].replace(/^\s+|\s+$/g,"");
		if ((line != null)&&(line.length > 0)){
			var fields = line.split("\t");
			if (fields[0].substr(0,1) != "#") {
				this.data.push(fields);
			}
		}
	}
};

AttributesDataAdapter.prototype.getAttributesJSON = function(){
	var json = {};
	json.attributes = this.attributes;
	json.data = this.data;
	return json;
};
