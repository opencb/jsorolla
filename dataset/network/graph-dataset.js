function GraphDataset(){
	DataSet.prototype.constructor.call(this);
	this.edges = new Object();
	this.vertices = new Object();
	this.verticesIndex = new Object();
	
	//Events
	this.newVertex = new Event(this);
	this.vertexNameChanged = new Event(this);
	this.vertexDeleted = new Event(this);
	
	this.newEdge = new Event(this);
	this.edgeNameChanged = new Event(this);
	this.edgeDeleted = new Event(this);
	
	this.json = new Object();
	this.json.vertices = new Array();
	this.json.edges  = new Array();
	this.json.relations = new Array();
};

GraphDataset.prototype.loadFromJSON = DataSet.prototype.loadFromJSON;
GraphDataset.prototype.toJSON  = 	    DataSet.prototype.toJSON;
GraphDataset.prototype.validate  = 	DataSet.prototype.validate;

/** Devuelve el numero de edges incidentes sobre el nodo con mas edges **/
GraphDataset.prototype.getMaxClass = function(){
	var maxClassNode = 0;
	for ( var node in this.vertices) {
		if (this.vertices[node].getEdgesCount() > maxClassNode){
			maxClassNode = this.vertices[node].getEdgesCount();
		}
	}
	return maxClassNode;
};

/** Devuelve el numero de edges incidentes sobre el nodo con mas edges **/
GraphDataset.prototype.getMinClass = function(){
	var minClassNode = Math.min();
	for ( var node in this.vertices) {
		if (this.vertices[node].getEdgesCount() < minClassNode){
			minClassNode = this.vertices[node].getEdgesCount();
		}
	}
	return minClassNode;
};

GraphDataset.prototype.getVertexByName = function(nodeName){
		var results = new Array();
		
		for (var vertexId in this.verticesIndex[nodeName]){
			var vertexByid = this.getVertexById(this.verticesIndex[nodeName][vertexId]);
			results.push(vertexByid);
			//* añadido nuevo porque fallaba el anterior codigo
			return vertexByid
		}
	
		if (results <= 1){
			return this.getVertexById(this.verticesIndex[nodeName]);
		}
		else{
			return results;
		}
};

GraphDataset.prototype.getVertexById = function(id){
	return this.vertices[id];
};

GraphDataset.prototype.toSIF = function(){
	var sifDataAdapter = new SIFFileDataAdapter();
	return sifDataAdapter.toSIF(this);
};

GraphDataset.prototype.toSIFID = function(){
	var sifDataAdapter = new SIFFileDataAdapter();
	return sifDataAdapter.toSIFID(this);
};

GraphDataset.prototype.toDOT = function(){
	var dotFileDataAdapter = new DotFileDataAdapter();
	return dotFileDataAdapter.toDOT(this);
};

GraphDataset.prototype.toDOTID = function(){
	var dotFileDataAdapter = new DotFileDataAdapter();
	return dotFileDataAdapter.toDOTID(this);
};

GraphDataset.prototype._addNode = function(nodeName, args){
	return new Vertex(this._getVerticesCount()-1, nodeName, args);
};

GraphDataset.prototype.addNode = function(nodeName, args){
	this.json.vertices.push(nodeName);
	this._addVerticesIndex(nodeName, this._getVerticesCount() - 1);
	var vertex = this._addNode(nodeName, args);
	this.vertices[this._getVerticesCount()-1] = vertex;
	this._setNodeEvents(vertex);
	this.newVertex.notify(vertex);
};

GraphDataset.prototype._addVerticesIndex = function(nodeName, id){
	if (this.verticesIndex[nodeName] == null){
		this.verticesIndex[nodeName] = new Array();
	}
	this.verticesIndex[nodeName].push(id);
};

GraphDataset.prototype.addEdge = function(edgeName, nodeSourceId, nodeTargetId, args){
	this.json.edges.push(edgeName);
	var nodeSource = this.getVertexById(nodeSourceId);
	var nodeTarget = this.getVertexById(nodeTargetId);
	var index = this.getEdgesCount() - 1;
	this.edges[index] =  new Edge(index, edgeName, nodeSource, nodeTarget, args);
	this.json.relations.push({"index": index, "sourceIndex": nodeSourceId, "targetIndex": nodeTargetId, "args": args });
	
	nodeSource.addEdge(this.edges[index]);
	nodeTarget.addEdge(this.edges[index]);
	this._setEdgeEvents(this.edges[index]);
	this.newEdge.notify(this.edges[index]);
};

GraphDataset.prototype.getVertices = function(){
	return this.vertices;
};

GraphDataset.prototype.getEdges = function(){
	return this.edges;
};

GraphDataset.prototype.getEdgeById = function(edgeId){
	return this.edges[edgeId];
};

GraphDataset.prototype._getVerticesCount = function(){
	return this.json.vertices.length;
};


GraphDataset.prototype.getVerticesCount = function(){
	var count = 0;
	for ( var vertex in this.getVertices()) {
		count ++;
	}
	return count;
};


GraphDataset.prototype.getEdgesCount = function(){
	return this.json.edges.length;
};

GraphDataset.prototype.init = function(){
	this.edges = new Object();
	this.vertices = new Object();
};

GraphDataset.prototype._setNodeEvents = function(node){
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
		_this._addVerticesIndex(newName, item.id);
		_this.json.vertices[item.id] = newName;
		_this.vertexNameChanged.notify(args);
	});
};

GraphDataset.prototype._setEdgeEvents = function(edge){
	var _this = this;
	//EDGE EVENTS
	edge.nameChanged.addEventListener(function (sender, edge){
		_this.edgeNameChanged.notify(edge);
		
	});
	
	edge.deleted.addEventListener(function (sender, edge){
		_this._removeEdge(edge);
	});
};

GraphDataset.prototype._connectVerticesByName = function(nodeNameSource, nodeNameTarget){
	var source = this.getVertexByName(nodeNameSource);
	var target = this.getVertexByName(nodeNameTarget);
	
	if ((source != null)&&(target!=null)){
		this.addEdge(source.getName() +"_" + target.getName(), source.getId(), target.getId(), {});
	}
	else{
		if (source == null){
			console.log("No encontrado: " + nodeNameSource)
		}
		if (target == null){
			console.log("No encontrado: " + nodeNameTarget)
		}
	}
};

GraphDataset.prototype.loadFromJSON = function(json){
	var json = json;
	this.init();
	this.json = new Object();
	this.json.vertices = new Array();
	this.json.edges = new Array();
	this.json.relations = new Array();

	for ( var i = 0; i < json.nodes.length; i++) {
		if (json.nodes[i] != null){
			var name = json.nodes[i];
			this.addNode(name);
		}
		else{
			this.json.vertices.push(null);
		}
	}
	
	for ( var i = 0; i < json.edges.length; i++) {
		if (json.edges[i] != null){
			if (json.relations[i] != null){
				var name = json.edges[i];
				this.addEdge(name, json.relations[i].sourceIndex, json.relations[i].targetIndex, json.relations[i].args);
			}
		}
		else{
				this.json.edges.push(null);
				this.json.relations.push(null);
		}
	}
};

GraphDataset.prototype.prettyPrint = function(){
	for ( var node in this.vertices) {
		console.log(this.vertices[node].getName() ); 
		for ( var j = 0; j <  this.vertices[node].getEdgesIn().length; j++) {
 			console.log("          --> " + this.vertices[node].getEdgesIn()[j].getNodeTarget().getName() ); 
		}
	}
};

GraphDataset.prototype._removeEdge = function(edge){
	this.json.edges[edge.getId()] = null;
	this.json.relations[edge.getId()] = null;
	
	delete this.edges[edge.getId()];
	this.edgeDeleted.notify(edge);
	

};

GraphDataset.prototype._removeNode = function(node){
	this.json.vertices[node.getId()] = null;
	delete this.vertices[node.getId()];
	this.vertexDeleted.notify(node);
};

GraphDataset.prototype.toJSON = function(){
	var json = new Object();
	var nodes = new Array();
	json.nodes = this.json.vertices; //nodes;
	json.edges = this.json.edges; //edges;
	json.relations = this.json.relations;
	return json;
};

GraphDataset.prototype.clone = function(){
	var dsDataset = new GraphDataset();
	dsDataset.loadFromJSON(this.toJSON());
	return dsDataset;
};
//GraphDataset.prototype.test = function(){
//	this.loadFromJSON(this.toJSON());
//};

function labels(){
	var names = new Array();
	
	var dataset = interactomeViewer.graphEditorWidget.dataset;
	var layout = interactomeViewer.graphEditorWidget.layout;
	
	for ( var vertexId in interactomeViewer.graphEditorWidget.dataset.getVertices()) {
		names.push(interactomeViewer.graphEditorWidget.dataset.getVertexById(vertexId).getName());
	}
	
	var sorted = (names.sort());
	console.log(sorted)
	var distance =  0.01;
	var altura = 0.6;
	for ( var i = 0; i < names.length; i++) {
		var id =dataset.getVertexByName(names[i]).getId();
		
		layout.getNodeById(id).setCoordenates(distance, altura);
		
		
		distance = parseFloat(distance) + parseFloat(0.03);
		
		altura = parseFloat(altura) + parseFloat(0.02);
	
		if (parseFloat(altura) == 0.9800000000000003){
		
			altura = 0.6;
			distance = distance - 0.51;
		}
		
	}
	

};
