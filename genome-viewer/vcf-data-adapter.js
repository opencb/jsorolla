function VCFDataAdapter(dataSource){
	this.dataSource = dataSource;
	this.features = new Array();
	this.featuresByChromosome = new Array();
};

VCFDataAdapter.prototype.getData = function(resource){
	var _this = this;
	this.dataSource.success.addEventListener(function(sender, data){
		return _this.parse(data);
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
						"id":  fields[2],
						"chromosome": fields[0],
						"start": parseFloat(fields[1]), 
						"position": parseFloat(fields[1]) + 1, 
						"ref": fields[3], 
						"alt": fields[4], 
						"quality": fields[5], 
						"filter": fields[6], 
						"info": fields[7], 
						"format": fields[8], 
						"all": fields,
						"label": fields[2] + " " +fields[3] + "/" + fields[4] + " Q:" + fields[5]
				};

				this.features.push(feature);
				if (this.featuresByChromosome[fields[0]] == null){
					this.featuresByChromosome[fields[0]] = new Array();
				}
				this.featuresByChromosome[fields[0]].push(feature);
			}
		}
	}
	console.log(this.features);
	return this.features;
};
