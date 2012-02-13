GeneBlockManager.prototype.loadFromJSON = DataSet.prototype.loadFromJSON;
GeneBlockManager.prototype.loadFromFile = DataSet.prototype.loadFromFile;
GeneBlockManager.prototype.loadFromURL  = DataSet.prototype.loadFromURL;
//GeneBlockManager.prototype.validate  = 	    DataSet.prototype.validate;

function GeneBlockManager () {
	this.data = new Object();
};

GeneBlockManager.prototype.getGenesTrackCount = function(){
	return this.data.queues.length;
};


GeneBlockManager.prototype.getFeaturesFromGeneTrackIndex = function(index){
	return this.data.queues[index];
};

GeneBlockManager.prototype.toJSON = function(){
	return this.data;
};
GeneBlockManager.prototype.validate = function(){
	return true;
};

GeneBlockManager.prototype.sort = function(a, b){
	return (b.end - b.start) - (a.end - a.start);
};

GeneBlockManager.prototype.toDatasetFormatter = function(dataset){
	var features = new Array();
	try{
		for ( var i = 0; i < dataset.length; i++) {
			var geneFormatter = new GeneFeatureFormatter(dataset[i]);
			features.push(geneFormatter);
			if (dataset[i].transcript != null){
				var transcripts = dataset[i].transcript; //dataset[i].transcript.sort(this.sort);
				for ( var j = 0; j < transcripts.length; j++) {
					if (geneFormatter.transcript == null){
						geneFormatter.transcript = new Array();
					}
					geneFormatter.transcript.push(new TranscriptFeatureFormatter(dataset[i].transcript[j]));
				}
			}
		}
	}
	catch(e)
	{
		alert("ERROR: GeneBlockManager: " + e);
	}
	return features;
//	return this;
};
