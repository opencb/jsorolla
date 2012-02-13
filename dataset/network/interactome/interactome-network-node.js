
InteractomeVertex.prototype.getName = Vertex.prototype.getName;
InteractomeVertex.prototype.setName = Vertex.prototype.setName;
InteractomeVertex.prototype.getId = Vertex.prototype.getId;
InteractomeVertex.prototype.getEdges = Vertex.prototype.getEdges;
InteractomeVertex.prototype.getEdgesOut = Vertex.prototype.getEdgesOut;
InteractomeVertex.prototype.getEdgesIn = Vertex.prototype.getEdgesIn;
InteractomeVertex.prototype.getEdgesCount = Vertex.prototype.getEdgesCount;
InteractomeVertex.prototype.addEdge = Vertex.prototype.addEdge;
InteractomeVertex.prototype.addEdge = Vertex.prototype.addEdge;
InteractomeVertex.prototype.removeEdge = Vertex.prototype.removeEdge;
InteractomeVertex.prototype.remove = Vertex.prototype.remove;


function InteractomeVertex(id, name, args){
	Vertex.prototype.constructor.call(this, id, name, args);
	
	this.species = "hsa";
	
	this.goCellularComponent = new Array();
	this.goMolecularFunction = new Array();
	this.goBiologicalProcess = new Array();
	this.kegg = new Array();
	this.reactome = new Array();
	this.ensemblGene = new Array();
	this.interpro = new Array();
	this.uniprotSwissprotAccession = new Array();
	this.jaspar = new Array();
	this.xrefItems = null;
	this.connections = "not available";
	this.betweenness = "not available";
	this.clustering = "not available";
	
	this.genes = new Array();
	this.gos = new Array();
	//this.databases = new Array("go_cellular_component","go_molecular_function","go_biological_process","kegg","reactome","ensembl_gene","interpro","uniprot_swissprot_accession","jaspar");
	this.onXrefRetrieved = new Event(this);
	this.onGOsRetrieved = new Event(this);
	this.onGenesRetrieved = new Event(this);
	
};

InteractomeVertex.prototype.cleanXref = function(){
	this.setXrefItems(null);
	this.setGOs(new Array());
	this.setGenes(new Array());
};
InteractomeVertex.prototype.fillXref = function(){
	var xrefFeatureListCellBaseDataAdapter = new XrefFeatureListCellBaseDataAdapter();
	xrefFeatureListCellBaseDataAdapter.setSpecies(this.species);
	xrefFeatureListCellBaseDataAdapter.fill(this.getName());
	var _this = this;
	xrefFeatureListCellBaseDataAdapter.successed.addEventListener(function (sender){
		var json = xrefFeatureListCellBaseDataAdapter.toJSON();
		_this._fillXrefItems(json);
		_this.onXrefRetrieved.notify();
	});
};
InteractomeVertex.prototype._fillXrefItems = function(json){
	if(json.length == 0)
		return;
	this.setXrefItems(json[0].xrefItems);

	var arrayGOs = new Array();
	for(var i=0; i < this.xrefItems["go_biological_process"].length; i++){
		arrayGOs.push(this.xrefItems["go_biological_process"][i]["displayName"]);
	}
	for(var i=0; i < this.xrefItems["go_molecular_function"].length; i++){
		arrayGOs.push(this.xrefItems["go_molecular_function"][i]["displayName"]);
	}
	for(var i=0; i < this.xrefItems["go_cellular_component"].length; i++){
		arrayGOs.push(this.xrefItems["go_cellular_component"][i]["displayName"]);
	}
	
	var arrayGenes = new Array();
	
	for(var i=0; i < this.xrefItems["ensembl_gene"].length; i++){
		arrayGenes.push(this.xrefItems["ensembl_gene"][i]["displayName"]);
	}
	this.fillGOs(arrayGOs);
	this.fillGenes(arrayGenes);
};

InteractomeVertex.prototype.fillGOs = function(arrayData){
	var _this = this;
	var managerGOs  = new CellBaseManager();
	managerGOs.setSpecies(this.species);
	//managerGOs.species = this.species;
	var gos = this.arrayToString(arrayData,",");
	if(gos!= ""){
		managerGOs.get("annotation","go",gos, "info");
		managerGOs.successed.addEventListener(function (evt, data){
			console.log("entron gos")
			_this._fillGOsArray(data);
			_this.onGOsRetrieved.notify();
		});
	}
	else
		this.setGOs(new Array());
};
InteractomeVertex.prototype._fillGOsArray = function(data){
	for(var i = 0; i < data.length; i++){
		this.addGO(data[i]);
	}
};
InteractomeVertex.prototype.fillGenes = function(arrayData){
	var _this = this;
	
	var featureListCellBaseDataAdapter = new FeatureListCellBaseDataAdapter();
	featureListCellBaseDataAdapter.setSpecies(this.species);
	//manager.species = this.species;
	var genes = this.arrayToString(arrayData,",");
	
	if(genes != ""){
		featureListCellBaseDataAdapter.fill("gene",genes);
		featureListCellBaseDataAdapter.successed.addEventListener(function (sender){
			var data = featureListCellBaseDataAdapter.toJSON();
			_this._fillGenesArray(data);
			_this.onGenesRetrieved.notify();
		});
	}
	else
		this.setGenes(new Array());
	
};
InteractomeVertex.prototype._fillGenesArray = function(data){
	for(var i = 0; i < data.length; i++){
		this.addGene(data[i]);
	}
};

InteractomeVertex.prototype.arrayToString = function(array,  separator){
	var str = new StringBuffer();
	for(var i = 0; i < array.length; i++){
		if(i != array.length-1)
			str.append(array[i]+separator);
		else
			str.append(array[i]);
	}
	return str.toString();
};


InteractomeVertex.prototype.setXrefItems = function(xrefItems){
	this.xrefItems = xrefItems;
	this._fillFieldsXrefItems();
	
};
InteractomeVertex.prototype._fillGOs = function(gos){
	for(var i = 0; i < gos.length; i++){
		gos[i].displayName = gos[i].displayName.replace(":","_");
	}
};
InteractomeVertex.prototype._fillFieldsXrefItems = function(){
	
	if(this.xrefItems == null){
		this.goCellularComponent = new Array();
		this.goMolecularFunction = new Array();
		this.goBiologicalProcess = new Array();
		this.kegg = new Array();
		this.reactome = new Array();
		this.ensemblGene = new Array();
		this.interpro = new Array();
		this.uniprotSwissprotAccession = new Array();
		this.jaspar = new Array();
		
	}
	else{
		if(this.xrefItems["go_cellular_component"] != null){
			//	this._fillGOs(this.xrefItems["go_cellular_component"]);
				this.goCellularComponent = this.xrefItems["go_cellular_component"];
			}
			
			if(this.xrefItems["go_molecular_function"] != null){
			//	this._fillGOs(this.xrefItems["go_molecular_function"]);
				this.goMolecularFunction = this.xrefItems["go_molecular_function"];
			}
			
			if(this.xrefItems["go_biological_process"] != null){
			//	this._fillGOs(this.xrefItems["go_biological_process"]);
				this.goBiologicalProcess = this.xrefItems["go_biological_process"];
			}
			
			if(this.xrefItems["kegg"] != null){
				this.kegg = this.xrefItems["kegg"];
			}
			
			if(this.xrefItems["reactome"] != null){
				this.reactome = this.xrefItems["reactome"];
			}
			
			if(this.xrefItems["ensembl_gene"] != null){
				this.ensemblGene = this.xrefItems["ensembl_gene"];
			}
				
			if(this.xrefItems["interpro"] != null){
				this.interpro = this.xrefItems["interpro"];
			}
			
			if(this.xrefItems["uniprot_swissprot_accession"] != null){
				this.uniprotSwissprotAccession = this.xrefItems["uniprot_swissprot_accession"];
			}
			
			if(this.xrefItems["jaspar"] != null){
				this.jaspar = this.xrefItems["jaspar"];
			}
	}
};
InteractomeVertex.prototype.setSpecies = function(species){
	this.species = species;
};
InteractomeVertex.prototype.getSpecies = function(){
	return this.species;
};
InteractomeVertex.prototype.getGOs = function(){
	return this.gos;
};
InteractomeVertex.prototype.setGOs = function(gos){
	this.gos = gos;
};
InteractomeVertex.prototype.addGO = function(go){
	this.gos.push(go);
};
InteractomeVertex.prototype.addGene = function(gene){
	this.genes.push(gene);
};
InteractomeVertex.prototype.getGenes = function(){
	return this.genes;
};
InteractomeVertex.prototype.setGenes = function(genes){
	this.genes = genes;
};
InteractomeVertex.prototype.getXrefItems = function(){
	return this.xrefItems;
};
InteractomeVertex.prototype.getGoCellularComponent = function(){
	return this.goCellularComponent;
};
InteractomeVertex.prototype.getGoMolecularFunction = function(){
	return this.goMolecularFunction;
};
InteractomeVertex.prototype.getGoBiologicalProcess = function(){
	return this.goBiologicalProcess;
};
InteractomeVertex.prototype.getKegg = function(){
	return this.kegg;
};
InteractomeVertex.prototype.getReactome = function(){
	return this.reactome;
};
InteractomeVertex.prototype.getEnsemblGene = function(){
	return this.ensemblGene;
};
InteractomeVertex.prototype.getInterpro = function(){
	return this.interpro;
};
InteractomeVertex.prototype.getUniprotSwissprotAccession = function(){
	return this.uniprotSwissprotAccession;
};
InteractomeVertex.prototype.getJaspar = function(){
	return this.jaspar;
};
InteractomeVertex.prototype.getConnections = function(){
	return this.connections;
};
InteractomeVertex.prototype.getBetweenness = function(){
	return this.betweenness;
};
InteractomeVertex.prototype.getClustering = function(){
	return this.clustering;
};

InteractomeVertex.prototype.getJaspar = function(){
	return this.jaspar;
};
InteractomeVertex.prototype.setGoCellularComponent = function(value){
	 this.goCellularComponent = value;
};
InteractomeVertex.prototype.setGoMolecularFunction = function(value){
	 this.goMolecularFunction = value;
};
InteractomeVertex.prototype.setGoBiologicalProcess = function(value){
	 this.goBiologicalProcess = value;
};
InteractomeVertex.prototype.setKegg = function(value){
	 this.kegg = value;
};
InteractomeVertex.prototype.setReactome = function(value){
	 this.reactome = value;
};
InteractomeVertex.prototype.setEnsemblGene = function(value){
	 this.ensemblGene = value;
};
InteractomeVertex.prototype.setInterpro = function(value){
	 this.interpro = value;
};
InteractomeVertex.prototype.setUniprotSwissprotAccession = function(value){
	 this.uniprotSwissprotAccession = value;
};
InteractomeVertex.prototype.setJaspar = function(value){
	 this.jaspar = value;
};
InteractomeVertex.prototype.setConnections = function(value){
	this.connetions = value;
};
InteractomeVertex.prototype.setBetweenness = function(value){
	this.betweenness = value;
};
InteractomeVertex.prototype.setClustering = function(value){
	this.clustering = value;
};



