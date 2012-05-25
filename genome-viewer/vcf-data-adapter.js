function VCFDataAdapter(dataSource){
	this.dataSource = dataSource;
	this.features = new Array();
	this.featuresByChromosome = new Array();
};

VCFDataAdapter.prototype.getData = function(){
	var _this = this;
	console.log("creating objects");
	this.dataSource.success.addEventListener(function(sender, data){
		_this.parse(data);
	});
	dataSource.fetch();
};

VCFDataAdapter.prototype.parse = function(data){
	var _this = this;
	var lines = data.split("\n");
	console.log("creating objects");
	for (var i = 0; i < lines.length; i++){
		var line = lines[i].replace(/^\s+|\s+$/g,"");
		if ((line != null)&&(line.length > 0)){
			var fields = line.split("\t");
			if (fields[0].substr(0,1) != "#"){
				_this.addQualityControl(fields[5]);

				var feature = {
						"id":  fields[2],
						"chromosome": fields[0],
						"start": parseFloat(fields[1]), 
						"end": parseFloat(fields[1]) + 1, 
						"ref": fields[3], 
						"alt": fields[4], 
						"quality": fields[5], 
						"filter": fields[6], 
						"info": fields[7], 
						"format": fields[8], 
						"all": fields,
						"label": this.getLabel(fields)
				};

				this.features.push(feature);
				if (this.featuresByChromosome[fields[0]] == null){
					this.featuresByChromosome[fields[0]] = new Array();
				}
				this.featuresByChromosome[fields[0]].push(feature);
			}
		}
	}
};
