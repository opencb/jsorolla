
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
			console.log("entron gos");
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





InteractomeGraphDataset.prototype.loadFromURL = GraphDataset.prototype.loadFromURL;
InteractomeGraphDataset.prototype.getMaxClass = GraphDataset.prototype.getMaxClass;
InteractomeGraphDataset.prototype.getVertexById = GraphDataset.prototype.getVertexById;
InteractomeGraphDataset.prototype.loadFromJSON = GraphDataset.prototype.loadFromJSON;
InteractomeGraphDataset.prototype.loadFromFile = GraphDataset.prototype.loadFromFile;
InteractomeGraphDataset.prototype.init = GraphDataset.prototype.init;
InteractomeGraphDataset.prototype.getMinClass = GraphDataset.prototype.getMinClass;
InteractomeGraphDataset.prototype.getVertices = GraphDataset.prototype.getVertices;
InteractomeGraphDataset.prototype.getEdges = GraphDataset.prototype.getEdges;
InteractomeGraphDataset.prototype.getEdgeById = GraphDataset.prototype.getEdgeById;
InteractomeGraphDataset.prototype.getVerticesCount = GraphDataset.prototype._getVerticesCount;
InteractomeGraphDataset.prototype.getEdgesCount = GraphDataset.prototype.getEdgesCount;
//InteractomeGraphDataset.prototype._setNodeEvents = GraphDataset.prototype._setNodeEvents;
InteractomeGraphDataset.prototype._setEdgeEvents = GraphDataset.prototype._setEdgeEvents;
InteractomeGraphDataset.prototype.loadFromJSON = GraphDataset.prototype.loadFromJSON;
InteractomeGraphDataset.prototype.prettyPrint = GraphDataset.prototype.prettyPrint;
InteractomeGraphDataset.prototype._removeEdge = GraphDataset.prototype._removeEdge;
InteractomeGraphDataset.prototype._removeNode = GraphDataset.prototype._removeNode;
InteractomeGraphDataset.prototype.toJSON = GraphDataset.prototype.toJSON;
InteractomeGraphDataset.prototype.getVertexByName = GraphDataset.prototype.getVertexByName;
InteractomeGraphDataset.prototype._addVerticesIndex = GraphDataset.prototype._addVerticesIndex;

InteractomeGraphDataset.prototype._getVerticesCount = GraphDataset.prototype._getVerticesCount;
InteractomeGraphDataset.prototype._connectVerticesByName = GraphDataset.prototype._connectVerticesByName;
InteractomeGraphDataset.prototype.toSIF = GraphDataset.prototype.toSIF;
InteractomeGraphDataset.prototype.toDOT = GraphDataset.prototype.toDOT;
InteractomeGraphDataset.prototype.toSIFID = GraphDataset.prototype.toSIFID;
InteractomeGraphDataset.prototype.toDOTID = GraphDataset.prototype.toDOTID;

InteractomeGraphDataset.prototype._addNode = GraphDataset.prototype._addNode;
InteractomeGraphDataset.prototype.addNode = GraphDataset.prototype.addNode;

function InteractomeGraphDataset(){
	GraphDataset.prototype.constructor.call(this);
	this.species = "hsa";
	
		
    this.store = null;
    this.data = new Array();
    this.data.push({"idNodes":"","idXref":"", "displayName":"", "description":"", "database":"","allFields":""});
    this.initStore();
    
	// Events
	this.onXrefRetrieved = new Event(this);
	//this.onDataChanged = new Event(this);
	//this.onGOsRetrieved = new Event(this);
	//this.onGenomicRegionsRetrieved = new Event(this);
};

InteractomeGraphDataset.prototype.initStore = function(){
	var _this = this;
	
	/// allFields = idXref+displayName+description: then we can search by all fields
	/// database = will hold which database come from the xref, for instance, jaspar, interpro
	this.store = Ext.create('Ext.data.ArrayStore', {
	    fields: [
	       {name: 'idNode', mapping:'idNode'},
	       {name: 'idXref', mapping:'idXref'},
	       {name: 'displayName', mapping:'displayName'},
	       {name: 'description', mapping:'description'},
	       {name: 'database', mapping:'database'},
	       {name: 'allFields', mapping:'allFields'}
	    ],
	    data :_this.data
	});
};


InteractomeGraphDataset.prototype._addNode = function(nodeName, args){
	return new InteractomeVertex(this.getVerticesCount()-1, nodeName, args);
	
};


InteractomeGraphDataset.prototype._setNodeEvents = function(node){
	var _this = this;
	//NODE EVENTS
	node.deleted.addEventListener(function (sender, node){
		_this._removeNode(node);
	});
	
	node.nameChanged.addEventListener(function (sender, args){
		var item = args.item;
		var newName = item.name;
		var indexes = _this.verticesIndex[args.previousName];
		for(var i = 0; i < indexes.length; i++){
			if(indexes[i] == item.id)
				indexes.splice(i,1);
		}
		if(indexes.length == 0){
			delete _this.verticesIndex[args.previousName];
		}
		
		_this.json.vertices[item.id] = newName;
		
		_this._addVerticesIndex(newName, item.id);
		node.cleanXref();
		//_this.fillAnnotationQuery(newName);
		_this.vertexNameChanged.notify(args);
		
	});
};

InteractomeGraphDataset.prototype.addEdge = function(edgeName, nodeSourceId, nodeTargetId, args){
	this.json.edges.push(edgeName);
	var nodeSource = this.getVertexById(nodeSourceId);
	var nodeTarget = this.getVertexById(nodeTargetId);
	
	var index = this.getEdgesCount() - 1;
	this.edges[index] =  new InteractomeEdge(index, edgeName, nodeSource, nodeTarget, args);
	this.json.relations.push({"index": index, "sourceIndex": nodeSourceId, "targetIndex": nodeTargetId, "args": args });
	
	nodeSource.addEdge(this.edges[index]);
	nodeTarget.addEdge(this.edges[index]);
	this._setEdgeEvents(this.edges[index]);
	this.newEdge.notify(this.edges[index]);
	
};
/*InteractomeGraphDataset.prototype.loadData = function(){
	var query = "";
	this.store.clearData();
	var properties_nodes = new Object();
	for (var vertex in  this.getVertices()){
		var name = this.getVertices()[vertex].getName();
		query +=  name + ",";
		var objectVertexName = new Object();
		objectVertexName.displayName = name;
		objectVertexName.idXref = name;
		objectVertexName.description = name;
		objectVertexName.database = "";
		if(properties_nodes[name] == null){
			properties_nodes[name] = objectVertexName;
			objectVertexName.idNodes = new Array();
		}
		array = properties_nodes[name].idNodes;
		if($.inArray(vertex, array) == -1){
			array.push(vertex);
		}
		objectVertexName.idNodes = array;
	}
	this._fillStore(properties_nodes);
	if( query != "" )
		query = query.substring(0, query.length-1);
	this.loadDataQuery(query);
};
InteractomeGraphDataset.prototype.loadDataQuery = function(query){
	if(query == "")
		return;
	
	var xrefCellBase = new XrefFeatureListCellBaseDataAdapter();
	xrefCellBase.setSpecies(this.species);
	xrefCellBase.fill(query);
	var _this = this;
	xrefCellBase.successed.addEventListener(function (sender){
		var json = xrefCellBase.toJSON();
		_this.fillXrefItems2(json);
	});
};



InteractomeGraphDataset.prototype.fillXrefItems2 = function(json){
	var mapGOs = new Object();
	//var mapGenes = new Array();
	//var itemsDB = new Object();
	var properties_nodes = new Array();
	for(var i = 0; i < json.length; i++ ){
		if(json[i] == null)
			continue;
		var name = json[i].id;
		
		var indexes = this.verticesIndex[name];
		if(indexes == null)
			continue;
		for(var index = 0; index < indexes.length; index++){
			var vertex = this.getVertexById(indexes[index]);
			vertex.setXrefItems(json[i].xrefItems);
			
			var xrefItems = json[i].xrefItems;
			//var ensemblGeneArray = new Array();
			var goArray = new Object();
			
			//XrefItems
			for(property in xrefItems){
				for(var k=0; k < xrefItems[property].length; k++){
					var displayName = xrefItems[property][k].displayName;
					var description = xrefItems[property][k].description;
						
					var object = new Object();
					object.displayName = displayName;
					object.idXref = displayName;
					object.description = description;
					object.database = property;
					if(properties_nodes[displayName] == null){
						properties_nodes[displayName] = object;
						object.idNodes = new Array();
					}
					array = properties_nodes[displayName].idNodes;
					if($.inArray(indexes[index], array) == -1){
						array.push(indexes[index]);
					}
					object.idNodes = array;
					if( property == "go_biological_process" || property == "go_molecular_function" || property == "go_cellular_component"){
						if(mapGOs[displayName] == null)
							mapGOs[displayName] = goArray;
						goArray = mapGOs[displayName];
						goArray[indexes[index]] = indexes[index];
					}
					
//					if(property == "ensembl_gene"){
//						if(mapGenes[displayName]== null){
//							mapGenes[displayName] = ensemblGeneArray;
//						}
//						ensemblGeneArray = mapGenes[displayName];
//						ensemblGeneArray.push(indexes[index]);
//						
//					}
					//fill databaseItems
				}
			}
		}
		
	}
	
	this._getGOs(mapGOs, properties_nodes);
};
//	this._getGenes(mapGenes);
	
		

InteractomeGraphDataset.prototype._getGOs = function(mapGos, properties_nodes){
	var _this = this;
	var managerGOs  = new CellBaseManager();
	managerGOs.setSpecies(this.species);
	//managerGOs.species = this.species;
	var gos = this._keyOfMapToString(mapGos,",");
	if(gos!= ""){
		managerGOs.get("annotation","go",gos, "info");
		managerGOs.successed.addEventListener(function (evt, data){
			//_this._fillGOsArray(data, mapGos);
			for(var i = 0; i < data.length; i++){
				properties_nodes[data[i].id].displayName = data[i].name;
			}
			_this._fillStore(properties_nodes);
			_this.store.loadData(_this.data,false);
			_this.onXrefRetrieved.notify();
			
		});
	}
	else{
		this._fillStore(properties_nodes);
		_this.store.loadData(_this.data,false);
		_this.onXrefRetrieved.notify();
	}
	
};
InteractomeGraphDataset.prototype._fillStore = function(properties_nodes){
	var data = new Array();
	for(var node in properties_nodes){
		node = properties_nodes[node];
		allFields = node.idXref+" "+node.displayName+" "+node.description;
		this.data.push({"idNodes":node.idNodes,"idXref":node.idXref, "displayName":node.displayName, "description":node.description,"database":node.database, "allFields":allFields.toLowerCase()});
	}
};
InteractomeGraphDataset.prototype._keyOfMapToString = function(map, separator){
	var str = new StringBuffer();
	var entro = false;
	for(property in map){
		entro = true;
		str.append(property+separator);
	}
	if(entro)
		str = str.toString().substr(0,str.toString().length-1);
	return str.toString();
};

InteractomeGraphDataset.prototype._arrayToString = function(array, separator){
		var str = new StringBuffer();
		for(var i = 0; i < array.length; i++){
			if(i != array.length-1)
				str.append(array[i]+separator);
			else
				str.append(array[i]);
		}
		return str.toString();
};

InteractomeGraphDataset.prototype.setSpecies = function(species){
	this.species = species;
};
*/
/*InteractomeGraphDataset.prototype._fillGOsArray = function(data, mapGos){
	for(var i = 0; i < data.length; i++){
		this.propertyDesc[data[i].id].displayName = data[i].name;
		var dataIdGO = data[i].id;
		var vertices = mapGos[dataIdGO];
		for ( var vertex in vertices) {
			var idVertice = vertices[vertex];
			this.vertices[idVertice].addGO(data[i]);
		}
	}
	this.onGOsRetrieved.notify();
};

InteractomeGraphDataset.prototype._getGenes = function(mapGenes){
	var _this = this;
	
	var featureListCellBaseDataAdapter = new FeatureListCellBaseDataAdapter();
	//manager.species = this.species;
	var features = this._keyOfMapToString(mapGenes,",");
	
	if(features != ""){
		featureListCellBaseDataAdapter.fill("gene",features);
		featureListCellBaseDataAdapter.successed.addEventListener(function (sender){
			var featureListCellBaseDataAdapterJson = featureListCellBaseDataAdapter.toJSON();
			_this._fillGenesArray(featureListCellBaseDataAdapterJson, mapGenes);
		});
		
	}
	
};
InteractomeGraphDataset.prototype._fillGenesArray = function(data, mapGenes){
	for(var i = 0; i < data.length; i++){
		var dataIdEnsenmbl = data[i].id;
		var vertices = mapGenes[dataIdEnsenmbl];
		for ( var vertex in vertices) {
			var idVertice = vertices[vertex];
			console.log("cuidado xq creo que la proxioma linea es this.vertices[idVertice].addGene(data[i]);")
			this.vertices[idVertice].addGene(data[vertex]);
		}
		
	}
	this.onGenomicRegionsRetrieved.notify();
};

InteractomeGraphDataset.prototype.search = function(query){
	query = query.toLowerCase();
	var nodes_properties = new Array();
	var properties_nodes = new Array();
	for (var idNode in this.getVertices()){
		var properties = new Array();
		var nodes = new Array();
		var xrefItems = this.getVertices()[idNode].getXrefItems();
		var name = this.getVertices()[idNode].name;
		if(name.toLowerCase().indexOf(query) != -1){
			if(properties_nodes[name] == null)
				properties_nodes[name] = new Array();
			properties_nodes[name].push(idNode);
		}
		for(property in xrefItems){
			for(var k=0; k < xrefItems[property].length; k++){
				var displayName = xrefItems[property][k].displayName;
				var description = xrefItems[property][k].description;
				
				if(displayName.toLowerCase().indexOf(query) != -1 || description.toLowerCase().indexOf(query) != -1){
					if(nodes_properties[idNode] != null){
						properties = nodes_properties[idNode];
					}
					if(properties_nodes[displayName] != null)
						nodes = properties_nodes[displayName];
					nodes[idNode]= idNode ;
					properties[displayName] = displayName;
					nodes_properties[idNode] = properties;
					properties_nodes[displayName] = nodes;
				}
			}
		}
	}
	return properties_nodes;
};
*/


/**
 * This has been replaced by 'filter' of extJS
 * 
 * InteractomeGraphDataset.prototype.search = function(query){
	query = query.toLowerCase();
	var nodes_properties = new Array();
	var properties_nodes = new Array();
	for (var idNode in this.getVertices()){
		var properties = new Array();
		var nodes = new Array();
		var xrefItems = this.getVertices()[idNode].getXrefItems();
		var name = this.getVertices()[idNode].name;
		if(name.toLowerCase().indexOf(query) != -1){
			if(properties_nodes[name] == null)
				properties_nodes[name] = new Array();
			properties_nodes[name].push(idNode);
		}
		for(property in xrefItems){
			for(var k=0; k < xrefItems[property].length; k++){
				var displayName = xrefItems[property][k].displayName;
				var description = xrefItems[property][k].description;
				
				if(displayName.toLowerCase().indexOf(query) != -1 || description.toLowerCase().indexOf(query) != -1){
					if(nodes_properties[idNode] != null){
						properties = nodes_properties[idNode];
					}
					if(properties_nodes[displayName] != null)
						nodes = properties_nodes[displayName];
					nodes[idNode]= idNode ;
					properties[displayName] = displayName;
					nodes_properties[idNode] = properties;
					properties_nodes[displayName] = nodes;
				}
			}
		}
	}
	return properties_nodes;
};*/

/*
InteractomeGraphDataset.prototype.fillXrefItems = function(json){
	var mapGOs = new Object();
	var mapGenes = new Array();
	var itemsDB = new Object();
	for(var i = 0; i < json.length; i++ ){
		if(json[i] == null)
			continue;
		var name = json[i].id;
		
		var indexes = this.verticesIndex[name];
		if(indexes == null)
			continue;
		for(var index = 0; index < indexes.length; index++){
			var vertex = this.getVertexById(indexes[index]);
			vertex.setXrefItems(json[i].xrefItems);
			var xrefItems = json[i].xrefItems;
			var ensemblGeneArray = new Array();
			var goArray = new Object();
			
			var item = new Object();
			item.displayName = vertex.getName();
			item.description = "";
			this.propertyDesc[vertex.getName()] = item;
			for(property in xrefItems){
				itemsDB = new Array();
				for(var k=0; k < xrefItems[property].length; k++){
					var displayName = xrefItems[property][k].displayName;
					var description = xrefItems[property][k].description;
					item = new Object();
					item.displayName = displayName;
					item.description = description;
					
					if( property == "go_biological_process" || property == "go_molecular_function" || property == "go_cellular_component"){
						if(mapGOs[displayName] == null)
							mapGOs[displayName] = goArray;
						goArray = mapGOs[displayName];
						goArray[indexes[index]] = indexes[index];
					}
					this.propertyDesc[displayName] = item;
					if(property == "ensembl_gene"){
						if(mapGenes[displayName]== null){
							mapGenes[displayName] = ensemblGeneArray;
						}
						ensemblGeneArray = mapGenes[displayName];
						ensemblGeneArray.push(indexes[index]);
						
					}
					//fill databaseItems
					if(this.databaseItems[property]!=null)
						itemsDB = this.databaseItems[property] ; 
					itemsDB[displayName] = displayName;
					this.databaseItems[property] = itemsDB;
				}
			}
		}
		
	}
	this.onXrefRetrieved.notify();
	this._getGOs(mapGOs);
	this._getGenes(mapGenes);
	
		
};*/
InteractomeEdge.prototype.getName = Edge.prototype.getName;
InteractomeEdge.prototype.setName = Edge.prototype.setName;
InteractomeEdge.prototype.getId = Edge.prototype.getId;
InteractomeEdge.prototype.toJSON = Edge.prototype.toJSON;
InteractomeEdge.prototype.getNodeSource = Edge.prototype.getNodeSource;
InteractomeEdge.prototype.getNodeTarget = Edge.prototype.getNodeTarget;
InteractomeEdge.prototype.remove = Edge.prototype.remove;

function InteractomeEdge(id, name, nodeSource, nodeTarget, args){
	Edge.prototype.constructor.call(this, id, name, nodeSource, nodeTarget, args);
	
};
//function GeneFeatureDataSet(){
//	FeatureDataAdapter.prototype.constructor.call(this);
//};
//
//GeneFeatureDataSet.prototype = 			    FeatureDataAdapter;
//GeneFeatureDataSet.prototype.constructor=   FeatureDataAdapter;
//GeneFeatureDataSet.prototype.loadFromJSON = FeatureDataAdapter.prototype.loadFromJSON;
//GeneFeatureDataSet.prototype.loadFromFile = FeatureDataAdapter.prototype.loadFromFile;
//GeneFeatureDataSet.prototype.loadFromURL  = FeatureDataAdapter.prototype.loadFromURL;
//GeneFeatureDataSet.prototype.toJSON  = 	    FeatureDataAdapter.prototype.toJSON;
//GeneFeatureDataSet.prototype.validate  =    FeatureDataAdapter.prototype.validate;
//

function ExpressionMatrixDataSet(){
	DataSet.prototype.constructor.call(this);

	
	this.normalizedRows = new Object();
	this.colorRows = new Object();
	this.classesName = null;
	this._classMaxInterval = new Object();
	this._classMinInterval = new Object();
	
	/** Original not modified json **/
	this._json = null;
	
	/** Optional parameters **/
	this.groupByClass = true;
	
};

//ExpressionMatrixDataSet.prototype.loadFromJSON =    DataSet.prototype.loadFromJSON;
ExpressionMatrixDataSet.prototype.toJSON  = 	    DataSet.prototype.toJSON;

ExpressionMatrixDataSet.prototype.loadFromJSON = function(json){
	if (this.validate(json)){
		this.json = json;
		this._json = JSON.parse(JSON.stringify(json));
		this.init();
	}
};

ExpressionMatrixDataSet.prototype.getRowNameByStatisticValue = function(statisticName, lower, bigger){
	var indexes = this.getRowIndexByStatisticValue(statisticName, lower, bigger);
	var rowNames = this.getRowNames();
	
	var rowSelectedName = new Array();
	for ( var i = 0; i < indexes.length; i++) {
		rowSelectedName.push(rowNames[indexes[i]]);
	}
	return rowSelectedName;
	
};

ExpressionMatrixDataSet.prototype.getRowIndexByStatisticValue = function(statisticName, lower, bigger){
	var statisticNames = this.getStatisticNames();
	for ( var i = 0; i < statisticNames.length; i++) {
		if (statisticNames[i]==statisticName){
			var rowIndex = new Array();
			
			var statisticMatrix = this.getStatisticMatrix();
			for ( var j = 0; j < statisticMatrix.length; j++) {
				
				if ((statisticMatrix[j][i]>=lower)&&(statisticMatrix[j][i]<=bigger)){
					rowIndex.push(j);
					
				}
				
			}
			return rowIndex;
		}
	}
};


/*
ExpressionMatrixDataSet.prototype.groupByClasses = function(){
	var classesName = this.getClassesName();
	
	var hashTable = new Object();
	//Inserted in a hashmap
	for ( var i = 0; i < classesName.length; i++) {
		hashTable[classesName[i]] = classesName[i];
	}
	
	console.log(hashTable);
	console.log(classesName);
	
};
*/

ExpressionMatrixDataSet.prototype.init = function(){
	/** Global parameteres **/
	this.normalizedRows = new Object();
	this.colorRows = new Object();
	this.classesName = null;
	this._classMaxInterval = new Object();
	this._classMinInterval = new Object();
	
	/** Normalizing and getting colors **/
	this.normalizeMatrix();
};

ExpressionMatrixDataSet.prototype.validate = function(json){
	return true;
};

ExpressionMatrixDataSet.prototype.getStatisticNames = function(){
	return this.json.statisticMatrix.columnNames;
};

ExpressionMatrixDataSet.prototype.getStatisticMatrix = function(){
	return this.json.statisticMatrix.matrix;
};


ExpressionMatrixDataSet.prototype.getRowNames = function(){
	return this.json.dataMatrix.rowNames;
};

ExpressionMatrixDataSet.prototype.getColumnNames = function(){
	return this.json.dataMatrix.columnNames;
};

ExpressionMatrixDataSet.prototype.getMatrix = function(){
	return this.json.dataMatrix.matrix;
};

ExpressionMatrixDataSet.prototype.getClasses = function(){
	return this.json.classNames;
};

ExpressionMatrixDataSet.prototype.getClassesName = function(){
	if (this.classesName == null){
			var classes = this.getClasses();
			var aux = new Array();
			aux.push(classes[0]);
			this._classMinInterval[0] = 0;
			
			for ( var i = 1; i < classes.length; i++) {
				if (classes[i]!=aux[aux.length-1]){
					aux.push(classes[i]);
					this._classMaxInterval[aux.length-2] = i-1;
					this._classMinInterval[aux.length-1] = i;
				}
			}
			//Insertamos la ultima columna de la ultima clase
			this._classMaxInterval[aux.length - 1] = classes.length - 1;
			this.classesName = aux;
	}
	return this.classesName;
};

ExpressionMatrixDataSet.prototype.getClassIntervalByIndex = function(classNameIndex){
	if (this.classesName == null){
		this.classesName = this.getClassesName();
	}
	return [this._classMinInterval[classNameIndex ], this._classMaxInterval[classNameIndex]]; 
};

ExpressionMatrixDataSet.prototype.normalizeMatrix = function(){
	for ( var i = 0; i < this.getRowNames().length; i++) {
		this.normalizedRows[i] = this.normalizedRow(i);
		this.colorRows[i] = this.getColorRow(i);
		this.classesName = this.getClassesName();
	}
};

ExpressionMatrixDataSet.prototype.normalizedRow = function(rowIndex){
	if (this.normalizedRows[rowIndex] == null){
		this.normalizedRows[rowIndex] = Normalizer.normalizeArray(this.getMatrix()[rowIndex]);
	}
	return this.normalizedRows[rowIndex];
};

ExpressionMatrixDataSet.prototype.getNormalizedData = function(rowIndex, columnIndex){
	return this.normalizedRow([rowIndex])[columnIndex];
};

ExpressionMatrixDataSet.prototype.getColorRow = function(rowIndex){
	if (this.colorRows[rowIndex] == null){
		this.colorRows[rowIndex] = Colors.getHexStringByScoreArrayValue(this.normalizedRow(rowIndex));
	}
	return this.colorRows[rowIndex];
};

ExpressionMatrixDataSet.prototype.getColor = function(rowIndex, columnIndex){
	return this.getColorRow(rowIndex)[columnIndex];
};

ExpressionMatrixDataSet.prototype.getClassesRange = function(){
	var classes = this.getClasses();

};





function DataSet(){
	this.json = null;
};


DataSet.prototype.loadFromJSON = function(json){
	if(json != null) {
		if(this.validate(json)) {
			this.json = json;
		}
	}
};


DataSet.prototype.toJSON = function(json){
	return this.json;
};


/** Abstract method to be override on childs classes **/
DataSet.prototype.validate = function(json){
	if (true){
		return true;
	}
	/*else{
		throw "Data validation failed";
	}*/
};



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
