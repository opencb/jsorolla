FeatureListCellBaseDataAdapter.prototype.setVersion = CellBaseDataAdapter.prototype.setVersion;
FeatureListCellBaseDataAdapter.prototype.setSpecies = CellBaseDataAdapter.prototype.setSpecies;
FeatureListCellBaseDataAdapter.prototype.getVersion = CellBaseDataAdapter.prototype.getVersion;
FeatureListCellBaseDataAdapter.prototype.getSpecies = CellBaseDataAdapter.prototype.getSpecies;
FeatureListCellBaseDataAdapter.prototype.getFinished = CellBaseDataAdapter.prototype.getFinished;
FeatureListCellBaseDataAdapter.prototype.toJSON = CellBaseDataAdapter.prototype.toJSON;

function FeatureListCellBaseDataAdapter(species){
//	console.log(species);
	CellBaseDataAdapter.prototype.constructor.call(this,species);
	this.category = "feature";
	this.subcategory = null;
	this.resource = "info";
	
};

FeatureListCellBaseDataAdapter.prototype.fill = function(subcategory, query, callbackFunction){
	this.cellBaseManager.get(this.category, subcategory, query, this.resource);
	var _this = this;
	this.cellBaseManager.successed.addEventListener(function (evt, data){
		_this.getFinished(data);
	});
};
