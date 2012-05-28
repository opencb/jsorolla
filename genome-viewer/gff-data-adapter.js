function GFFDataAdapter(dataSource){
	this.dataSource = dataSource;
	this.features = new Array();
	this.featuresByChromosome = new Array();
};

GFFDataAdapter.prototype.getData = function(resource){
	var _this = this;
	this.dataSource.success.addEventListener(function(sender, data){
		_this.parse(data);
	});
	this.dataSource.fetch(resource);
};

GFFDataAdapter.prototype.parse = function(data){
	var _this = this;
	var lines = data.split("\n");
	console.log("creating objects");
	for (var i = 0; i < lines.length; i++){
		var line = lines[i].replace(/^\s+|\s+$/g,"");
		if ((line != null)&&(line.length > 0)){
			var fields = line.split("\t");
			var chromosome = fields[0].replace("chr", "");

			//NAME  SOURCE  TYPE  START  END  SCORE  STRAND  FRAME  GROUP
			var feature = {
					"chromosome": chromosome, 
					"label": fields[2], 
					"start": parseFloat(fields[3]), 
					"end": parseFloat(fields[4]), 
					"score": parseFloat(fields[5]),
					"strand": fields[6], 
					"frame": fields[7],
					"group": fields[8]
			} ;

			this.features.push(feature);
			if (this.featuresByChromosome[chromosome] == null){
				this.featuresByChromosome[chromosome] = new Array();
			}
			this.featuresByChromosome[chromosome].push(feature);
		}
	}
};
