function NetworkData (args) {
	this.nodes = {};
	this.edges = {};
	this.subgraphs = {};
	
	this.nodeId = 0;
	this.edgeId = 0;
	
	
	this.metaInfo = {};
	this.metaInfo.numNodes = 0;
	this.metaInfo.numEdges= 0;
	
	var defaults = [["Id", "number", "null"],["Name", "string", "none"]];
	this.attributes = new AttributeManager(defaults);
	
	if(args != null) {
		if(args.type != null) {
			this.type = args.type;
		}
		else {
			this.type = "undirected";
		}
	}
};

NetworkData.prototype.addNode = function(args) {
	this.metaInfo.numNodes++;
	this.nodes[this.nodeId] = {};
	this.nodes[this.nodeId].name = args.name;
	this.nodes[this.nodeId].type = args.type;
	this.nodes[this.nodeId].subgraph = args.subgraph;
	if(this.subgraphs[args.subgraph] == null) {
		this.subgraphs[args.subgraph] = [];
		this.subgraphs[args.subgraph].push(this.nodeId);
	}
	else {
		this.subgraphs[args.subgraph].push(this.nodeId);
	}
	this.nodes[this.nodeId].metainfo = args.metainfo;
	this.nodes[this.nodeId].edges = [];
	
	this.attributes.addRow([[this.nodeId], [args.name]]);

	this.nodeId++;
	
	return this.nodeId-1;
};

NetworkData.prototype.removeNode = function(nodeId) {
	this.metaInfo.numNodes--;
	this.attributes.removeRow("Id", nodeId);
	delete this.nodes[nodeId];
};

NetworkData.prototype.addEdge = function(source, target, type, name, args) {
	this.metaInfo.numEdges++;
	this.edges[this.edgeId] = {};
	this.edges[this.edgeId].source = source;
	this.edges[this.edgeId].target = target;
	this.edges[this.edgeId].type = type;
	this.edges[this.edgeId].metainfo = args;
	this.edges[this.edgeId].metainfo.name = name;
//	this.edges[this.edgeId].metainfo.weight = args.weight;
//	this.edges[this.edgeId].metainfo.x1 = args.x1;
//	this.edges[this.edgeId].metainfo.y1 = args.y1;
//	this.edges[this.edgeId].metainfo.x2 = args.x2;
//	this.edges[this.edgeId].metainfo.y2 = args.y2;
//	this.edges[this.edgeId].metainfo.markerArrow = args.markerArrow;
//	this.edges[this.edgeId].metainfo.markerLabel = args.markerLabel;
	this.nodes[source].edges.push(this.edgeId);
	
	this.edgeId++;
	
	return this.edgeId-1;
};

NetworkData.prototype.removeEdge = function(edgeId) {
	var sourceNode = this.edges[edgeId].source;
	for(var i=0, len=this.nodes[sourceNode].edges.length; i<len; i++) {
		if(this.nodes[sourceNode].edges[i] == edgeId){
			this.nodes[sourceNode].edges.splice(i, 1);
			this.metaInfo.numEdges--;
			break;
		}
	}
	
	this.metaInfo.numEdges--;
	delete this.edges[edgeId];
};

NetworkData.prototype.loadJSON = function(jsonStr){
	var json = JSON.parse(jsonStr);
	
	this.nodes = {};
	this.edges = {};
	this.nodeId = 0;
	this.edgeId = 0;
	this.metaInfo.numNodes = 0;
	this.metaInfo.numEdges= 0;
	
	this.type = json.type;
	this.attributes = json.attributes;
	
	// loop over nodes
	for (var node in json.nodes){
		this.addNode({
			"name":json.nodes[node].name,
			"type":json.nodes[node].type,
			"metainfo":json.nodes[node].metainfo
		});
	}
	
	// loop over edges
	for (var edge in json.edges){
		this.addEdge(json.edges[edge].source, json.edges[edge].target, json.edges[edge].type, json.edges[edge].name, {
			"x1":json.edges[edge].metainfo.x1,
			"y1":json.edges[edge].metainfo.y1,
			"x2":json.edges[edge].metainfo.x2,
			"y2":json.edges[edge].metainfo.y2,
			"name":json.edges[edge].metainfo.name,
			"weight":json.edges[edge].metainfo.weight,
			"markerArrow":json.edges[edge].metainfo.markerArrow,
			"markerLabel":json.edges[edge].metainfo.markerLabel
		});
	}
};

NetworkData.prototype.toJSON = function() {
	var json = {};
	json.type = this.type;
	json.nodes = this.nodes;
	json.edges = this.edges;
	json.metaInfo = this.metaInfo;
	json.attributes = this.attributes;
	return json;
};

NetworkData.prototype.toSif = function() {
	var sifText = "";
	for ( var node in this.nodes) {
		var line = "";

		if(this.nodes[node].edges.length == 0) {
			sifText = sifText + node + "\n";
		}else{
			var edges = this.nodes[node].edges;
			for(var i=0; i<edges.length; i++){
				line = this.edges[edges[i]].source + " -- " + this.edges[edges[i]].target + "\n";
				sifText = sifText + line;
			}
		}
	}
	return sifText;
};

NetworkData.prototype.toSifByName = function() {
	var sifText = "";
	for (var node in this.nodes) {
		var line = "";

		if(this.nodes[node].edges.length == 0) {
			sifText = sifText + this.nodes[node].name + "\n";
		}else{
			var edges = this.nodes[node].edges;
			for(var i=0; i<edges.length; i++){
				line = this.nodes[this.edges[edges[i]].source].name + " -- " + this.nodes[this.edges[edges[i]].target].name + "\n";
				sifText = sifText + line;
			}
		}
	}
	return sifText;
};

NetworkData.prototype.toDot = function() {
	var dotText = "graph network {\n" + this.toSif() + "}";
	return dotText;
};

NetworkData.prototype.toDotByName = function() {
	var dotText = "graph network {\n" + this.toSifByName() + "}";
	return dotText;
};

NetworkData.prototype.setType = function(type) {
	this.type = type;
};

NetworkData.prototype.getNodesCount = function() {
	return this.metaInfo.numNodes;
};

NetworkData.prototype.getNodesList = function() {
	var nodeList = [];
	for(var nodeId in this.nodes) {
		nodeList.push(nodeId);
	}
	return nodeList;
};

NetworkData.prototype.getAttributes = function() {
	return this.attributes;
};
