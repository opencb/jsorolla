
function DataAdapter(){
	this.dataset = new DataSet();
	this.internalId = Math.round(Math.random()*10000000); // internal id for this class
};


DataAdapter.prototype.toJSON = function(){
	return this.dataset.toJSON();
};

DataAdapter.prototype.getDataset = function(){
	return this.dataset;
};
