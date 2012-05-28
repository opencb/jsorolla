function BEDDataAdapter(dataSource){
	this.dataSource = dataSource;
	this.features = new Array();
	this.featuresByChromosome = new Array();
};

BEDDataAdapter.prototype.getData = function(resource){
	var _this = this;
	this.dataSource.success.addEventListener(function(sender, data){
		_this.parse(data);
	});
	this.dataSource.fetch(resource);
};

BEDDataAdapter.prototype.parse = function(data){
	var _this = this;
	var lines = data.split("\n");
	console.log("creating objects");
	for (var i = 0; i < lines.length; i++){
		var line = lines[i].replace(/^\s+|\s+$/g,"");
		if ((line != null)&&(line.length > 0)){
			var fields = line.split("\t");

			var feature = {
					"label":fields[3],
					"chromosome": fields[0].replace("chr", ""), 
					"start": parseFloat(fields[1]), 
					"end": parseFloat(fields[2]), 
					"score":fields[4],
					"strand":fields[5],
					"thickStart":fields[6],
					"thickEnd":fields[7],
					"itemRgb":fields[8],
					"blockCount":fields[9],
					"blockSizes":fields[10],
					"blockStarts":fields[11]
			} ;

			this.features.push(feature);
			if (this.featuresByChromosome[fields[0]] == null){
				this.featuresByChromosome[fields[0]] = new Array();
			}
			this.featuresByChromosome[fields[0]].push(feature);
		}
	}
};
