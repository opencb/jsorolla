
function GeneFeatureDataSet(){
	FeatureDataAdapter.prototype.constructor.call(this);
};

GeneFeatureDataSet.prototype = 			    FeatureDataAdapter;
GeneFeatureDataSet.prototype.constructor=   FeatureDataAdapter;
GeneFeatureDataSet.prototype.loadFromJSON = FeatureDataAdapter.prototype.loadFromJSON;
GeneFeatureDataSet.prototype.loadFromFile = FeatureDataAdapter.prototype.loadFromFile;
GeneFeatureDataSet.prototype.loadFromURL  = FeatureDataAdapter.prototype.loadFromURL;
GeneFeatureDataSet.prototype.toJSON  = 	    FeatureDataAdapter.prototype.toJSON;
GeneFeatureDataSet.prototype.validate  =    FeatureDataAdapter.prototype.validate;


