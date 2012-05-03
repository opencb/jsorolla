function MetaNetwork(species,args){
	this.json = new Object();
	this.vertices = new Object();
	this.verticesIndex = new Object(); // verticesIndex[name][]
//	this.species = "hsa";
	this.species = species;
	this.store = null;
	this.dataset = null;
	this.onInfoRetrieved = new Event(this);
	this.onGOsRetrieved = new Event(this);
	this.onGenesRetrieved = new Event(this);
   
	//These variables say if the information has been retrieved from cellBase
	this.gosRetrieved = false;
	this.genesRetrieved = false;
	this.informationRetrieved = false;
	
	this.createStores();
	this.events();
};

MetaNetwork.prototype.events = function(){
	var _this = this;
	this.onGOsRetrieved.addEventListener(function (){
		if(_this.genesRetrieved && !_this.informationRetrieved){
			_this.informationRetrieved = true;
			for(var idVertex in _this.vertices){
				_this.getVertexById(idVertex).setFilled(true);
			}
			//_this.filled = true;
			console.log("entro onGOsRetrieved");
			_this.onInfoRetrieved.notify(_this);
		}
	});
	this.onGenesRetrieved.addEventListener(function (){
		if(_this.gosRetrieved && !_this.informationRetrieved){
			_this.informationRetrieved = true;
			for(var idVertex in _this.vertices) {
				_this.getVertexById(idVertex).setFilled(true);
			}
			//_this.filled = true;
			console.log("entro onInfoRetrieved");
			_this.onInfoRetrieved.notify(_this);
		}
	});
};
MetaNetwork.prototype.addNode = function(vertex){
	var id = vertex.id;
	var name = vertex.name;
	this.vertices[id] = new MetaVertex(id, name);
	if (this.verticesIndex[name] == null){
		this.verticesIndex[name] = new Array();
	}
	this.vertexStore.add({id : id});
	this.verticesIndex[name].push(id);
	
};
MetaNetwork.prototype.getDataset = function(){
	return this.dataset;
};
MetaNetwork.prototype.setDataset = function(dataset){
	this.dataset = dataset;
};

MetaNetwork.prototype.dataBind = function(graphDataset){
	this.dataset = graphDataset;
	this._fillDataset();
};

MetaNetwork.prototype._fillDataset = function(){
	for ( var vertex in this.dataset.getVertices()) {
		var name = this.dataset.getVertexById(vertex).getName();
		this.vertexStore.add({id : vertex});
		
		this.vertices[vertex] = new MetaVertex(vertex, name);//{"x":, "y":};
		if (this.verticesIndex[name] == null){
			this.verticesIndex[name] = new Array();
		}
		this.verticesIndex[name].push(vertex);
	}
};
MetaNetwork.prototype.getVertexById = function(id){
	return this.vertices[id];
};
MetaNetwork.prototype.initStore = function(){
	this.data = new Array();
	this.data.push({"idNodes":"","nameNodes":"","idXref":"", "displayName":"", "description":"", "database":"","allFields":""});
	var _this = this;
	
	/// allFields = idXref+displayName+description: then we can search by all fields
	/// database = will hold which database come from the xref, for instance, jaspar, interpro
	this.store = Ext.create('Ext.data.ArrayStore', {
	    fields: [
	       {name: 'idNodes', mapping:'idNodes'},
	       {name: 'nameNodes', mapping:'nameNodes'},
	       {name: 'idXref', mapping:'idXref'},
	       {name: 'displayName', mapping:'displayName'},
	       {name: 'description', mapping:'description'},
	       {name: 'database', mapping:'database'},
	       {name: 'allFields', mapping:'allFields'}
	    ],
	    data :_this.data
	});
};

MetaNetwork.prototype.loadData = function(){
	var query = "";
	this.initStore();
	this.store.clearData();
	var properties_nodes = new Object();
	for (var vertex in this.vertices){
		/*if(this.vertices[vertex].isFilled())
			continue;*/
		var name = this.vertices[vertex].getName();
		query +=  name + ",";
		var objectVertexName = new Object();
		objectVertexName.displayName = name;
		objectVertexName.idXref = name;
		objectVertexName.description = name;
		objectVertexName.database = "name";
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
	//Here we fill just the names
	this._fillStore(properties_nodes);
	if( query != "" )
		query = query.substring(0, query.length-1);
	this.loadDataQuery(query);
};

MetaNetwork.prototype.loadDataQuery = function(query){
	
	if(query == ""){
		this.onInfoRetrieved.notify();
	}
	else{
		var xrefCellBase = new XrefFeatureListCellBaseDataAdapter();
		xrefCellBase.setSpecies(this.species);
		xrefCellBase.fill(query);
		var _this = this;
		xrefCellBase.successed.addEventListener(function (sender){
			var json = xrefCellBase.toJSON();
			_this.fillXrefItems(json);
		});
	}
};



MetaNetwork.prototype.fillXrefItems = function(json){
	var mapGOs = new Object();
	var mapGenes = new Object();
	var idReactome = 0;
	//var itemsDB = new Object();
	var properties_nodes = new Array();
	for(var i = 0; i < json.length; i++ ){
		if(json[i] == null)
			continue;
		var name = json[i].id;
//		var indexes = this.verticesIndex[name];
		var indexes =  this._getVerticesIds(name);
		if(indexes == null)
			continue;
		for(var index = 0; index < indexes.length; index++){
			var vertex = this.getVertexById(indexes[index]);
			vertex.setXrefItems(json[i].xrefItems);
			
			var xrefItems = json[i].xrefItems;
			
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
						var goArray = new Object();
						if(mapGOs[displayName] == null)
							mapGOs[displayName] = goArray;
						goArray = mapGOs[displayName];
						goArray[indexes[index]] = indexes[index];
						
					}
					if(property == "ensembl_gene"){
						var ensemblGeneArray = new Object();
						if(mapGenes[displayName]== null){
							mapGenes[displayName] = ensemblGeneArray;
						}
						ensemblGeneArray = mapGenes[displayName];
						ensemblGeneArray[indexes[index]] = indexes[index];
					}
					
					if(property == "reactome"){
						/*var vertex = Ext.ModelManager.create({id: indexes[index]}, 'VertexModel');
						var reactome = Ext.ModelManager.create({displayName: displayName, description: description}, 'ReactomeModel');
						var vertexReactome = Ext.ModelManager.create({id: indexes[index], displayName: displayName}, 'VertexReactomeModel');*/
						var idRelation = this.reactomeStore.find("displayName",displayName);
						//this.vertexStore.add({id : indexes[index]});
						if(idRelation == -1){
							this.reactomeStore.add({id: idReactome, displayName: displayName, description: description});
							idRelation = idReactome;
							idReactome++;
						}
						this.vertexReactomeStore.add({idVertex: indexes[index], idReactome: idRelation});
					}
					
				}
			}
		}
		
	}
	this._getGOs(mapGOs, properties_nodes);
	this._getGenes(mapGenes);
};
MetaNetwork.prototype._getVerticesIds = function(name){
	var ids = new Array();
	for ( var metavertex in this.vertices) {
		if(this.vertices[metavertex].name == name)
			ids.push(this.vertices[metavertex].getId());
	}
	return ids;
};	
		

MetaNetwork.prototype._getGOs = function(mapGos, properties_nodes){
	
	var _this = this;
	var managerGOs  = new CellBaseManager();
	managerGOs.setSpecies(this.species);
	var gos = this._keyOfMapToString(mapGos,",");
	if(gos!= ""){
		managerGOs.get("annotation","go",gos, "info");
		managerGOs.successed.addEventListener(function (evt, data){
			
			_this._fillGOsArray(data, mapGos);
			for(var i = 0; i < data.length; i++){
				properties_nodes[data[i].id].displayName = data[i].name;
			}
			_this.gosRetrieved = true;
			_this._fillStore(properties_nodes);
			_this.store.loadData(_this.data,false);
			_this.onGOsRetrieved.notify();
			
		});
	}
	else{
		this.gosRetrieved = true;
		this._fillStore(properties_nodes);
		this.store.loadData(_this.data,false);
		this.onGOsRetrieved.notify();
	}
	
};
MetaNetwork.prototype._fillGOsArray = function(data, mapGos){
	var idItemStore = 0;
	for(var i = 0; i < data.length; i++){
		var dataIdGO = data[i].id;
		var vertices = mapGos[dataIdGO];
		for ( var vertex in vertices) {
			var idVertice = vertices[vertex];
			this.vertices[idVertice].addGO(data[i]);
			
			var idRelation = this.geneOntologyStore.find("id",idItemStore);
			if(idRelation == -1){
				this.geneOntologyStore.add({id:idItemStore ,accession: data[i].id, name: data[i].name});
				idRelation = idItemStore;
				idItemStore++;
			}
			this.vertexGeneOntologyStore.add({idVertex: idVertice, idGeneOntology:idRelation });
		}
	}
};

//Genomic regions is not necessary to be added to the store
MetaNetwork.prototype._getGenes = function(mapGenes){
	var _this = this;
	
	var cellBase = new FeatureListCellBaseDataAdapter();
	cellBase.setSpecies(this.species);
	var features = this._keyOfMapToString(mapGenes,",");
	if(features != ""){
		cellBase.fill("gene",features);
		cellBase.successed.addEventListener(function (sender){
			var cellBaseJson = cellBase.toJSON();
			_this._fillGenesArray(cellBaseJson, mapGenes);
			_this.genesRetrieved = true;
			_this.onGenesRetrieved.notify();
		});
	}
	else{
		this._fillStore(mapGenes);
		this.genesRetrieved = true;
		this.onGenesRetrieved.notify();
	}
	
};


MetaNetwork.prototype._fillGenesArray = function(data, mapGenes){
	var idItemStore = 0;
	for(var i = 0; i < data.length; i++){
		var dataIdEnsenmbl = data[i].id;
		var vertices = mapGenes[dataIdEnsenmbl];
		for ( var vertex in vertices) {
			var idVertice = vertices[vertex];
			this.vertices[idVertice].addGene(data[i]);
			var idRelation = this.genomicRegionsStore.find("id",idItemStore);
			if(idRelation == -1){
				this.genomicRegionsStore.add({id:idItemStore ,ensemblGene: data[i].id, chromosome: data[i].chromosome, start: data[i].start, end: data[i].end, biotype: data[i].biotype});
				idRelation = idItemStore;
				idItemStore++;
			}
			this.vertexGenomicRegionsStore.add({idVertex: idVertice, idGenomicRegion:idRelation });
		}
	}
};


MetaNetwork.prototype._fillStore = function(properties_nodes){
	var data = new Array();
	var allFields;
	for(var node in properties_nodes){
			
		node = properties_nodes[node];
		var nameNodes = this.getNamesByVerticesId(node.idNodes);
//		var nameNodes = new Array();
		
		allFields = node.idXref+" "+node.displayName+" "+node.description;
		this.data.push({"idNodes":node.idNodes,"nameNodes":nameNodes,"idXref":node.idXref, "displayName":node.displayName, "description":node.description,"database":node.database, "allFields":allFields.toLowerCase()});
	}
};


MetaNetwork.prototype.createStores = function(){
	
	/*********	Definiendo los modelos de datos: Vertex-Name *********/
	//One to many: hasMany
	this.vertexModel = Ext.define('VertexModel', {
	    extend: 'Ext.data.Model',
	    fields: [
	        {name: 'id', type: 'int'}
	    ],
	    hasMany: {model: 'VertexReactomeModel', name: 'reactome'}
	});
	
	this.vertexStore = Ext.create('Ext.data.Store', {
	    model: 'VertexModel'
	});
	
	/*** REACTOME ***/
	//One to many: hasManyAssociation
	this.reactomeModel = Ext.define('ReactomeModel', {
	    extend: 'Ext.data.Model',
	    fields: [
	        {name: 'id', type: 'int'},
	        {name: 'displayName', type: 'string'},
	        {name: 'description', type: 'string'}
	    ],
	    // we can use the hasMany shortcut on the model to create a hasMany association
	    hasMany: {model: 'VertexReactomeModel', name: 'vertices'}
	});
	this.reactomeStore = Ext.create('Ext.data.Store', {
	    model: 'ReactomeModel'
	});
	
	//Many to one: BelongsToAssociation
	this.vertexReactomeModel =  Ext.define('VertexReactomeModel', {
	    extend: 'Ext.data.Model',
	    fields: [
	        {name: 'idVertex', type: 'int'},
	        {name: 'idReactome', type: 'int'}
	    ],
	    associations: [
	         {type: 'belongsTo', model: 'VertexModel'},
	         {type: 'belongsTo', model: 'ReactomeModel'}
	    ]
	});
	this.vertexReactomeStore = Ext.create('Ext.data.Store', {
	    model: 'VertexReactomeModel'
	});
	
	/************************ Genomic Regions ************************/
	this.genomicRegionsModel = Ext.define('GenomicRegionsModel', {
	    extend: 'Ext.data.Model',
	    fields: [
	        {name: 'id', type: 'int'},
	        {name: 'ensemblGene', type: 'string'},
	        {name: 'chromosome', type: 'string'},
	        {name: 'start', type: 'int'},
	        {name: 'end', type: 'int'},
	        {name: 'biotype', type: 'string'}
	    ],
	    hasMany: {model: 'VertexGenomicRegionsModel', name: 'vertices'}
	});
	this.genomicRegionsStore = Ext.create('Ext.data.Store', {
	    model: 'GenomicRegionsModel'
	});
	this.vertexGenomicRegionsModel =  Ext.define('VertexGenomicRegionsModel', {
	    extend: 'Ext.data.Model',
	    fields: [
	        {name: 'idVertex', type: 'int'},
	        {name: 'idGenomicRegion', type: 'int'}
	    ],
	    associations: [
	         {type: 'belongsTo', model: 'VertexModel'},
	         {type: 'belongsTo', model: 'GenomicRegionsModel'}
	    ]
	});
	this.vertexGenomicRegionsStore = Ext.create('Ext.data.Store', {
	    model: 'VertexGenomicRegionsModel'
	});
	
	/************************ Gene Ontology ************************/
	this.geneOntologyModel = Ext.define('GeneOntologyModel', {
	    extend: 'Ext.data.Model',
	    fields: [
	        {name: 'id', type: 'int'},
	        {name: 'accession', type: 'string'},
	        {name: 'name', type: 'string'}
	    ],
	    hasMany: {model: 'VertexGeneOntologyModel', name: 'vertices'}
	});
	this.geneOntologyStore = Ext.create('Ext.data.Store', {
	    model: 'GeneOntologyModel'
	});
	this.vertexGeneOntologyModel =  Ext.define('VertexGeneOntologyModel', {
	    extend: 'Ext.data.Model',
	    fields: [
	        {name: 'idVertex', type: 'int'},
	        {name: 'idGeneOntology', type: 'int'}
	    ],
	    associations: [
	         {type: 'belongsTo', model: 'VertexModel'},
	         {type: 'belongsTo', model: 'GeneOntologyModel'}
	    ]
	});
	this.vertexGeneOntologyStore = Ext.create('Ext.data.Store', {
	    model: 'VertexGeneOntologyModel'
	});
	/************************ Fin Gene Ontology ************************/
};
MetaNetwork.prototype.getVertices = function(){
	return this.vertices;
};
MetaNetwork.prototype.getVertexById = function(id){
	return this.vertices[id];
};

MetaNetwork.prototype.getNamesByVerticesId = function (ids){
	var nodesName = new Array();
	if(ids != null)
		for ( var i = 0; i < ids.length; i++) {
			nodesName.push(this.vertices[ids[i]].name);
		}
	return nodesName;
};
MetaNetwork.prototype._keyOfMapToString = function(map, separator){
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

MetaNetwork.prototype.isInformationRetrieved = function(){
	return this.informationRetrieved;
};

MetaNetwork.prototype.setInformationRetrieved = function(informationRetrieved){
	this.informationRetrieved = informationRetrieved;
};
MetaNetwork.prototype.setSpecies = function(species){
	this.species = species;
};
MetaNetwork.prototype.getSpecies = function(){
	return this.species;
};