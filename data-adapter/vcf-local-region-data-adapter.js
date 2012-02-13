VCFLocalRegionDataAdapter.prototype.toJSON = LocalRegionDataAdapter.prototype.toJSON;
VCFLocalRegionDataAdapter.prototype._getHashMapKey = LocalRegionDataAdapter.prototype._getHashMapKey;
VCFLocalRegionDataAdapter.prototype.isRegionAvalaible = LocalRegionDataAdapter.prototype.isRegionAvalaible;
VCFLocalRegionDataAdapter.prototype.fill = LocalRegionDataAdapter.prototype.fill;
VCFLocalRegionDataAdapter.prototype.getFinished = LocalRegionDataAdapter.prototype.getFinished;
VCFLocalRegionDataAdapter.prototype.anticipateRegionRetrieved  = LocalRegionDataAdapter.prototype.anticipateRegionRetrieved;
VCFLocalRegionDataAdapter.prototype.setIntervalView  = LocalRegionDataAdapter.prototype.setIntervalView;
 

function VCFLocalRegionDataAdapter(args){
	LocalRegionDataAdapter.prototype.constructor.call(this);
	this.resource = "vcf";
	this.qualitycontrol = new Object();
};

VCFLocalRegionDataAdapter.prototype.getLabel = function(line){
	return  line[2] + " " +line[3] + "/" + line[4] + " Q:" + line[5];
};

VCFLocalRegionDataAdapter.prototype.addQualityControl = function(quality){
	var range = (Math.ceil(quality/1000) - 1)*1000;
	if (this.qualitycontrol[range] == null){
		this.qualitycontrol[range] = 1;
	}
	else{
		this.qualitycontrol[range] = this.qualitycontrol[range] + 1;
	}
};

VCFLocalRegionDataAdapter.prototype.loadFromFileDataAdapter = function(fileDataAdapter){
	for ( var i = 0; i < fileDataAdapter.lines.length; i++) {
		this.addQualityControl(fileDataAdapter.lines[i][5]);
		
		var feature = {
					
					"id":  fileDataAdapter.lines[i][2],
					"chromosome": fileDataAdapter.lines[i][0],
					"start": parseFloat(fileDataAdapter.lines[i][1]), 
					"end": parseFloat(fileDataAdapter.lines[i][1]) + 1, 
					"ref": (fileDataAdapter.lines[i][3]), 
					"alt": (fileDataAdapter.lines[i][4]), 
					"quality": (fileDataAdapter.lines[i][5]), 
					"filter": (fileDataAdapter.lines[i][6]), 
					"info": (fileDataAdapter.lines[i][7]), 
					"format": (fileDataAdapter.lines[i][8]), 
					"all": (fileDataAdapter.lines[i]),
					"label": this.getLabel(fileDataAdapter.lines[i])
					
		} ;
		this.features.push(feature);
		if (this.featuresByChromosome[fileDataAdapter.lines[i][0]] == null){
			this.featuresByChromosome[fileDataAdapter.lines[i][0]] = new Array();
		}
		this.featuresByChromosome[fileDataAdapter.lines[i][0]].push(feature);
	}
};



