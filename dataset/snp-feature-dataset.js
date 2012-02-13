
function SNPFeatureDataSet(){
	FeatureDataSet.prototype.constructor.call(this);
};

SNPFeatureDataSet.prototype = 			   FeatureDataSet;
SNPFeatureDataSet.prototype.constructor=   FeatureDataSet;
SNPFeatureDataSet.prototype.loadFromJSON = FeatureDataSet.prototype.loadFromJSON;
SNPFeatureDataSet.prototype.loadFromFile = FeatureDataSet.prototype.loadFromFile;
SNPFeatureDataSet.prototype.loadFromURL  = FeatureDataSet.prototype.loadFromURL;
SNPFeatureDataSet.prototype.toJSON  = 	   FeatureDataSet.prototype.toJSON;

SNPFeatureDataSet.prototype.validate = function(json){
	
	var objects = json[0];
	for (var i = 0; i < objects.length; i++){
		if (objects[i].chromosome == null){
			throw "Data can not be validated because record "+ i + " has not chromosome";
		}
		if (objects[i].start == null){
			throw "Data can not be validated because record "+ i + " has not start";
		}
		if (objects[i].end == null){
			throw "Data can not be validated because record "+ i + " has not end";
		}
	}
	return true;
	
};
