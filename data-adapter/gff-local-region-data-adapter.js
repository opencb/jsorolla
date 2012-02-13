GFFLocalRegionDataAdapter.prototype.toJSON = LocalRegionDataAdapter.prototype.toJSON;
GFFLocalRegionDataAdapter.prototype._getHashMapKey = LocalRegionDataAdapter.prototype._getHashMapKey;
GFFLocalRegionDataAdapter.prototype.isRegionAvalaible = LocalRegionDataAdapter.prototype.isRegionAvalaible;
GFFLocalRegionDataAdapter.prototype.fill = LocalRegionDataAdapter.prototype.fill;
GFFLocalRegionDataAdapter.prototype.getFinished = LocalRegionDataAdapter.prototype.getFinished;
GFFLocalRegionDataAdapter.prototype.anticipateRegionRetrieved  = LocalRegionDataAdapter.prototype.anticipateRegionRetrieved;
GFFLocalRegionDataAdapter.prototype.setIntervalView  = LocalRegionDataAdapter.prototype.setIntervalView;

function GFFLocalRegionDataAdapter(args){
	LocalRegionDataAdapter.prototype.constructor.call(this);
	this.resource = "gff";
};

GFFLocalRegionDataAdapter.prototype.getLabel = function(line){
	return  line[2];
};

GFFLocalRegionDataAdapter.prototype.loadFromFileDataAdapter = function(fileDataAdapter){
	for ( var i = 0; i < fileDataAdapter.lines.length; i++) {
		var chromosome = fileDataAdapter.lines[i][0].replace("chr", "");
		
		if (fileDataAdapter.lines[i][3] == 57649472 ){debugger}
		//NAME  SOURCE  TYPE  START  END  SCORE  STRAND  FRAME  GROUP
		var feature = {
						"chromosome": chromosome, 
						"label": this.getLabel(fileDataAdapter.lines[i]) , 
						"start": parseFloat(fileDataAdapter.lines[i][3]), 
						"end": parseFloat(fileDataAdapter.lines[i][4]), 
						"score": parseFloat(fileDataAdapter.lines[i][5]),
						"strand": fileDataAdapter.lines[i][6] , 
						"frame": fileDataAdapter.lines[i][7],
						"group": fileDataAdapter.lines[i][8]
						} ;
		this.features.push(feature);
		if (this.featuresByChromosome[chromosome] == null){
			this.featuresByChromosome[chromosome] = new Array();
		}
		this.featuresByChromosome[chromosome].push(feature);
	}
};
