
function MetaVertex(id, name){
	
	this.species = "hsa";
	this.id = id;
	this.name = name;
	this.filled = false;
	
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
	
	this.onInfoRetrieved = new Event(this);
	//this.onXrefRetrieved = new Event(this);
	this.onGOsRetrieved = new Event(this);
	this.onGenesRetrieved = new Event(this);
	
	//These variables say if the information has been retrieved from cellBase
	this.gosRetrieved = false;
	this.genesRetrieved = false;
	this.infoNotified = false;
	
	this.events();
	
};

MetaVertex.prototype.events = function(){
	var _this = this;
	this.onGOsRetrieved.addEventListener(function (){
		if(_this.genesRetrieved && !_this.infoNotified){
			_this.infoNotified = true;
			_this.filled = true;
			_this.onInfoRetrieved.notify(this);
		}
	});
	this.onGenesRetrieved.addEventListener(function (){
		if(_this.gosRetrieved && !_this.infoNotified){
			_this.infoNotified = true;
			_this.filled = true;
			_this.onInfoRetrieved.notify(this);
		}
	});
};

MetaVertex.prototype.cleanXref = function(){
	this.setXrefItems(null);
	this.setGOs(new Array());
	this.setGenes(new Array());
};
MetaVertex.prototype.fillXref = function(){
	var cellBase = new XrefFeatureListCellBaseDataAdapter();
	cellBase.setSpecies(this.species);
	cellBase.fill(this.name);
	var _this = this;
	cellBase.successed.addEventListener(function (sender){
		var json = cellBase.toJSON();
		_this._fillXrefItems(json);
		//_this.onXrefRetrieved.notify();
	});
};

MetaVertex.prototype._fillXrefItems = function(json){
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

MetaVertex.prototype.fillGOs = function(arrayData){
	var _this = this;
	var managerGOs  = new CellBaseManager();
	managerGOs.setSpecies(this.species);
	//managerGOs.species = this.species;
	var gos = this.arrayToString(arrayData,",");
	if(gos!= ""){
		managerGOs.get("annotation","go",gos, "info");
		managerGOs.successed.addEventListener(function (evt, data){
			_this._fillGOsArray(data);
			_this.gosRetrieved = true;
			_this.onGOsRetrieved.notify();
		});
	}
	else{
		this.setGOs(new Array());
		this.gosRetrieved = true;
		this.onGOsRetrieved.notify();
	}
};
MetaVertex.prototype._fillGOsArray = function(data){
	for(var i = 0; i < data.length; i++){
		this.addGO(data[i]);
	}
};
MetaVertex.prototype.fillGenes = function(arrayData){
	var _this = this;
	
	var cellBase = new FeatureListCellBaseDataAdapter();
	cellBase.setSpecies(this.species);
	//manager.species = this.species;
	var genes = this.arrayToString(arrayData,",");
	
	if(genes != ""){
		cellBase.fill("gene",genes);
		cellBase.successed.addEventListener(function (sender){
			var data = cellBase.toJSON();
			_this._fillGenesArray(data);
			_this.genesRetrieved = true;
			_this.onGenesRetrieved.notify();
		});
	}
	else{
		this.setGenes(new Array());
		this.genesRetrieved = true;
		this.onGenesRetrieved.notify();
	}
	
};
MetaVertex.prototype._fillGenesArray = function(data){
	for(var i = 0; i < data.length; i++){
		this.addGene(data[i]);
	}
};

MetaVertex.prototype.arrayToString = function(array,  separator){
	var str = new StringBuffer();
	for(var i = 0; i < array.length; i++){
		if(i != array.length-1)
			str.append(array[i]+separator);
		else
			str.append(array[i]);
	}
	return str.toString();
};


MetaVertex.prototype.setXrefItems = function(xrefItems){
	this.xrefItems = xrefItems;
	this._fillFieldsXrefItems();
	
};
MetaVertex.prototype._fillGOs = function(gos){
	for(var i = 0; i < gos.length; i++){
		gos[i].displayName = gos[i].displayName.replace(":","_");
	}
};
MetaVertex.prototype._fillFieldsXrefItems = function(){
	
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
MetaVertex.prototype.isFilled = function(){
	return this.filled;
};
MetaVertex.prototype.setFilled = function(filled){
	this.filled = filled;
};
MetaVertex.prototype.getId = function(){
	return this.id;
};
MetaVertex.prototype.getName = function(){
	return this.name;
};
MetaVertex.prototype.setName = function(name){
	this.name = name;
};
MetaVertex.prototype.setSpecies = function(species){
	this.species = species;
};
MetaVertex.prototype.getSpecies = function(){
	return this.species;
};
MetaVertex.prototype.getGOs = function(){
	return this.gos;
};
MetaVertex.prototype.setGOs = function(gos){
	this.gos = gos;
};
MetaVertex.prototype.addGO = function(go){
	this.gos.push(go);
};
MetaVertex.prototype.addGene = function(gene){
	this.genes.push(gene);
};
MetaVertex.prototype.getGenes = function(){
	return this.genes;
};
MetaVertex.prototype.setGenes = function(genes){
	this.genes = genes;
};
MetaVertex.prototype.getXrefItems = function(){
	return this.xrefItems;
};
MetaVertex.prototype.getGoCellularComponent = function(){
	return this.goCellularComponent;
};
MetaVertex.prototype.getGoMolecularFunction = function(){
	return this.goMolecularFunction;
};
MetaVertex.prototype.getGoBiologicalProcess = function(){
	return this.goBiologicalProcess;
};
MetaVertex.prototype.getKegg = function(){
	return this.kegg;
};
MetaVertex.prototype.getReactome = function(){
	return this.reactome;
};
MetaVertex.prototype.getEnsemblGene = function(){
	return this.ensemblGene;
};
MetaVertex.prototype.getInterpro = function(){
	return this.interpro;
};
MetaVertex.prototype.getUniprotSwissprotAccession = function(){
	return this.uniprotSwissprotAccession;
};
MetaVertex.prototype.getJaspar = function(){
	return this.jaspar;
};
MetaVertex.prototype.getConnections = function(){
	return this.connections;
};
MetaVertex.prototype.getBetweenness = function(){
	return this.betweenness;
};
MetaVertex.prototype.getClustering = function(){
	return this.clustering;
};

MetaVertex.prototype.getJaspar = function(){
	return this.jaspar;
};
MetaVertex.prototype.setGoCellularComponent = function(value){
	 this.goCellularComponent = value;
};
MetaVertex.prototype.setGoMolecularFunction = function(value){
	 this.goMolecularFunction = value;
};
MetaVertex.prototype.setGoBiologicalProcess = function(value){
	 this.goBiologicalProcess = value;
};
MetaVertex.prototype.setKegg = function(value){
	 this.kegg = value;
};
MetaVertex.prototype.setReactome = function(value){
	 this.reactome = value;
};
MetaVertex.prototype.setEnsemblGene = function(value){
	 this.ensemblGene = value;
};
MetaVertex.prototype.setInterpro = function(value){
	 this.interpro = value;
};
MetaVertex.prototype.setUniprotSwissprotAccession = function(value){
	 this.uniprotSwissprotAccession = value;
};
MetaVertex.prototype.setJaspar = function(value){
	 this.jaspar = value;
};
MetaVertex.prototype.setConnections = function(value){
	this.connetions = value;
};
MetaVertex.prototype.setBetweenness = function(value){
	this.betweenness = value;
};
MetaVertex.prototype.setClustering = function(value){
	this.clustering = value;
};



