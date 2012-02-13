
Vertex.prototype.getName = GraphItem.prototype.getName;
Vertex.prototype.setName = GraphItem.prototype.setName;
Vertex.prototype.getId = GraphItem.prototype.getId;

function Vertex(id, name, args){
	GraphItem.prototype.constructor.call(this, id, name, args);
	this.edgesIn= new Array();
	this.edgesOut= new Array();
};

Vertex.prototype.getEdges = function(){
	return this.edgesIn.concat(this.edgesOut);
};

Vertex.prototype.getEdgesCount = function(){
	return this.getEdges().length;
};

Vertex.prototype.getEdgesIn = function(){
	return this.edgesIn;
};

Vertex.prototype.getEdgesOut = function(){
	return this.edgesOut;
};

Vertex.prototype.addEdge = function(edge){
	if (edge.getNodeSource().getId() == this.id){
		this.edgesIn.push(edge);
	}
	else{
		this.edgesOut.push(edge);
	}
};

Vertex.prototype.removeEdge = function(edge){
	for ( var i = 0; i < this.getEdgesIn().length; i++) {
		var edgeIn = this.edgesIn[i];
		if (edgeIn.getId() == edge.getId()){
			this.edgesIn.splice(i, 1);
		}
	}
	for ( var i = 0; i < this.getEdgesOut().length; i++) {
		var edgeIn = this.edgesOut[i];
		if (edgeIn.getId() == edge.getId()){
			this.edgesOut.splice(i, 1);
		}
	}
};

Vertex.prototype.remove = function(){
	var edges = this.getEdges();
	for ( var i = 0; i < edges.length; i++) {
		var edge = edges[i];
		edge.remove();
	}
	this.deleted.notify(this);
};




