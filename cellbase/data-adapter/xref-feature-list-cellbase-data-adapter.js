XrefFeatureListCellBaseDataAdapter.prototype.setVersion = CellBaseDataAdapter.prototype.setVersion;
XrefFeatureListCellBaseDataAdapter.prototype.setSpecies = CellBaseDataAdapter.prototype.setSpecies;
XrefFeatureListCellBaseDataAdapter.prototype.getVersion = CellBaseDataAdapter.prototype.getVersion;
XrefFeatureListCellBaseDataAdapter.prototype.getSpecies = CellBaseDataAdapter.prototype.getSpecies;
XrefFeatureListCellBaseDataAdapter.prototype.getFinished = CellBaseDataAdapter.prototype.getFinished;
XrefFeatureListCellBaseDataAdapter.prototype.arrayToString = CellBaseDataAdapter.prototype.arrayToString;
XrefFeatureListCellBaseDataAdapter.prototype.toJSON = CellBaseDataAdapter.prototype.toJSON;
//manager1.get("feature","id",idSpecies, "dbname");
//manager2.get("feature","id",query, "xref?dbname="+arrayToString(_this.databases,","));
//managerGOs.get("annotation","go",gos, "info");
//manager.get("feature","gene",features, "info");
function XrefFeatureListCellBaseDataAdapter(species,args){
//	console.log(species);
	CellBaseDataAdapter.prototype.constructor.call(this,species);
	this.category = "feature";
	this.subcategory = "id";
	this.resource = "xref?dbname=";
	this.databases = new Array("go_cellular_component","go_molecular_function","go_biological_process","kegg","reactome","ensembl_gene","interpro","uniprot_swissprot_accession","jaspar");
};


XrefFeatureListCellBaseDataAdapter.prototype.fill = function(query, identifier/*, callbackFunction*/){
	
	this.resource += this.arrayToString(this.databases,",");
	//this.resource = this.resource+dbnames;
	if(identifier != null){
		query+="&identifier="+identifier;
	}
	this.cellBaseManager.get(this.category, this.subcategory, query, this.resource);
	var _this = this;
	this.cellBaseManager.successed.addEventListener(function (evt, data){
		_this.getFinished(data);
	});
};