function VCFDataAdapter(dataSource){
	this.dataSource = dataSource;
	this.features = new Array();
	this.featuresByChromosome = new Array();
	
	this.completed = new Event();
};

VCFDataAdapter.prototype.getData = function(resource){
	var _this = this;
	this.dataSource.success.addEventListener(function(sender, data){
		_this.parse(data);
	});
	this.dataSource.fetch(resource);
};

VCFDataAdapter.prototype.parse = function(data){
	var _this = this;
	var lines = data.split("\n");
	console.log("creating objects");
	console.log(data);
	for (var i = 0; i < lines.length; i++){
		var line = lines[i].replace(/^\s+|\s+$/g,"");
		if ((line != null)&&(line.length > 0)){
			var fields = line.split("\t");
			if (fields[0].substr(0,1) != "#"){
//				_this.addQualityControl(fields[5]);

				var feature = {
						"chromosome": 	fields[0],
						"position": 	parseFloat(fields[1]), 
						"start": 		parseFloat(fields[1]), 
						"end": 			parseFloat(fields[1]),
						"id":  			fields[2],
						"ref": 			fields[3], 
						"alt": 			fields[4], 
						"quality": 		fields[5], 
						"filter": 		fields[6], 
						"info": 		fields[7], 
						"format": 		fields[8], 
						"record":		fields,
						"label": 		fields[2] + " " +fields[3] + "/" + fields[4] + " Q:" + fields[5]
				};

				this.features.push(feature);
				if (this.featuresByChromosome[fields[0]] == null){
					this.featuresByChromosome[fields[0]] = new Array();
				}
				this.featuresByChromosome[fields[0]].push(feature);
			}
		}
	}
	_this.completed.notify(this.features);
};
