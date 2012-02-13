
function FeatureDataSet(){
	DataSet.prototype.constructor.call(this);
};

FeatureDataSet.prototype.loadFromJSON = DataSet.prototype.loadFromJSON;
FeatureDataSet.prototype.loadFromFile = DataSet.prototype.loadFromFile;
FeatureDataSet.prototype.loadFromURL  = DataSet.prototype.loadFromURL;
FeatureDataSet.prototype.toJSON  = 	    DataSet.prototype.toJSON;

FeatureDataSet.prototype.validate = function(json){
//	var objects = json[0];
//	for (var i = 0; i < objects.length; i++){
//		if (objects[i].chromosome == null){
//			throw "Data can not be validated because record "+ i + " has not chromosome";
//		}
//		if (objects[i].start == null){
//			throw "Data can not be validated because record "+ i + " has not start";
//		}
//		if (objects[i].end == null){
//			throw "Data can not be validated because record "+ i + " has not end";
//		}
//	}
	return true;
};
