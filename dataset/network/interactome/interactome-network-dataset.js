

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