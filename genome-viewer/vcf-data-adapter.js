function VCFDataAdapter(dataSource){
	this.dataSource = dataSource;
//	this.features = new Array();
	this.featuresByChromosome = new Object();
	
	this.completed = new Event();
	this.onGetData = new Event();
	this._onParse = new Event();
	
	var _this = this;
	this.dataSource.success.addEventListener(function(sender, data){
		_this.parse(data);
		_this._onParse.notify();
	});
	this.dataSource.fetch();
};

VCFDataAdapter.prototype.getData = function(region){
	var _this = this;
	
	this._onParse.addEventListener(function(sender){
		var features = [];
		for ( var i = 0; i < _this.featuresByChromosome[region.chromosome].length; i++) {
			var feature =  _this.featuresByChromosome[region.chromosome][i];
			if(feature.end > region.start && feature.start < region.end){
				features.push(feature);
			}
		}
		_this.onGetData.notify(features);
	});
	
};

VCFDataAdapter.prototype.parse = function(data){
	var _this = this;
	var lines = data.split("\n");
//	console.log("creating objects");
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

//				this.features.push(feature);
				if (this.featuresByChromosome[fields[0]] == null){
					this.featuresByChromosome[fields[0]] = new Array();
				}
				this.featuresByChromosome[fields[0]].push(feature);
			}
		}
	}
//	_this.completed.notify(this.features);
};
