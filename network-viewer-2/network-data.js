function NetworkData () {
	this.numNodes = 0;
	this.nodes = {};
	this.edges = {};
	this.metaInfo = {};
	this.attributes = {};
};

NetworkData.prototype.addNode = function(nodeId, args){
	this.numNodes++;
	this.nodes[nodeId] = {};
	this.nodes[nodeId].name = args.name;
	this.nodes[nodeId].type = args.type;
	this.nodes[nodeId].edges = [];
};

NetworkData.prototype.removeNode = function(nodeId){
	this.numNodes--;
	delete this.nodes[nodeId];
};

NetworkData.prototype.addEdge = function(edgeId, args){
	this.edges[edgeId] = {};
	this.edges[edgeId].source = args.source;
	this.edges[edgeId].target = args.target;
//	this.edges[edgeId].type = args.type;
	this.edges[edgeId].name = args.name;
	this.edges[edgeId].weight = args.weight;
	this.edges[edgeId].directed = args.directed;
	this.nodes[args.source].edges.push(edgeId);
};

NetworkData.prototype.removeEdge = function(edgeId){
	var sourceNode = this.edges[edgeId].source;
	for(var i=0, len=this.nodes[sourceNode].edges.length; i<len; i++) {
		if(this.nodes[sourceNode].edges[i] == edgeId){
			this.nodes[sourceNode].edges.splice(i, 1);
			break;
		}
	}
	
	delete this.edges[edgeId];
};

NetworkData.prototype.toJson = function(){
	var json = {};
	json.nodes = this.nodes;
	json.edges = this.edges;
	json.metaInfo = this.metaInfo;
	json.attributes = this.attributes;
	return json;
};

//NetworkData.prototype.loadFromJson = function(jsonStr){
//	var json = JSON.parse(jsonStr);
//};

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
	for ( var node in this.nodes) {
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

NetworkData.prototype.getNodesCount = function() {
	return this.numNodes;
};
