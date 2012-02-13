CellBaseDataAdapter.prototype.toJSON = DataAdapter.prototype.toJSON;


function CellBaseDataAdapter(species){
//	console.log(species);
	DataAdapter.prototype.constructor.call(this);
	this.cellBaseManager = new CellBaseManager(species);
	this.successed = new Event();
	
};


CellBaseDataAdapter.prototype.getVersion = function(){
	return this.cellBaseManager.getVersion();
};


CellBaseDataAdapter.prototype.getSpecies = function(){
	return this.cellBaseManager.getSpecies();
};

CellBaseDataAdapter.prototype.setVersion = function(version){
	this.cellBaseManager.setVersion(version);
};

CellBaseDataAdapter.prototype.setSpecies = function(specie){
	this.cellBaseManager.setSpecies(specie);
};


CellBaseDataAdapter.prototype.fill = function(category, subcategory, query, resource, callbackFunction){
	this.cellBaseManager.get(category, subcategory, query, resource);
	var _this = this;
	this.cellBaseManager.successed.addEventListener(function (evt, data){
		_this.getFinished(data);
	});
};


CellBaseDataAdapter.prototype.getFinished = function(data){
	this.dataset.loadFromJSON(data);
	this.successed.notify();
};

CellBaseDataAdapter.prototype.arrayToString = function(array, separator){
	var str = new StringBuffer();
	for(var i = 0; i < array.length; i++){
		if(i != array.length-1)
			str.append(array[i]+separator);
		else
			str.append(array[i]);
	}
	return str.toString();
};











