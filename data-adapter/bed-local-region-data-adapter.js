BEDLocalRegionDataAdapter.prototype.toJSON = LocalRegionDataAdapter.prototype.toJSON;
BEDLocalRegionDataAdapter.prototype._getHashMapKey = LocalRegionDataAdapter.prototype._getHashMapKey;
BEDLocalRegionDataAdapter.prototype.isRegionAvalaible = LocalRegionDataAdapter.prototype.isRegionAvalaible;
BEDLocalRegionDataAdapter.prototype.fill = LocalRegionDataAdapter.prototype.fill;
BEDLocalRegionDataAdapter.prototype.getFinished = LocalRegionDataAdapter.prototype.getFinished;
BEDLocalRegionDataAdapter.prototype.anticipateRegionRetrieved  = LocalRegionDataAdapter.prototype.anticipateRegionRetrieved;
BEDLocalRegionDataAdapter.prototype.setIntervalView  = LocalRegionDataAdapter.prototype.setIntervalView;

function BEDLocalRegionDataAdapter(args){
	LocalRegionDataAdapter.prototype.constructor.call(this);
	this.resource = "bed";
};

BEDLocalRegionDataAdapter.prototype.loadFromFileDataAdapter = function(fileDataAdapter){
	for ( var i = 0; i < fileDataAdapter.lines.length; i++) {
		var chromosome = fileDataAdapter.lines[i][0].replace("chr", "");
		
		var feature = {
						"label":fileDataAdapter.lines[i][3],
						"chromosome": chromosome, 
						"start": parseFloat(fileDataAdapter.lines[i][1]), 
						"end": parseFloat(fileDataAdapter.lines[i][2]), 
						"score":fileDataAdapter.lines[i][4],
						"strand":fileDataAdapter.lines[i][5],
						"thickStart":fileDataAdapter.lines[i][6],
						"thickEnd":fileDataAdapter.lines[i][7],
						"itemRgb":fileDataAdapter.lines[i][8],
						"blockCount":fileDataAdapter.lines[i][9],
						"blockSizes":fileDataAdapter.lines[i][10],
						"blockStarts":fileDataAdapter.lines[i][11]
		} ;
		this.features.push(feature);
		if (this.featuresByChromosome[chromosome] == null){
			this.featuresByChromosome[chromosome] = new Array();
		}
		this.featuresByChromosome[chromosome].push(feature);
	}
};



