
Edge.prototype.getName = GraphItem.prototype.getName;
Edge.prototype.setName = GraphItem.prototype.setName;
Edge.prototype.getId = GraphItem.prototype.getId;

function Edge(id, name, nodeSource, nodeTarget, args){
	GraphItem.prototype.constructor.call(this, id, name, args);
	
	this.sourceNode = nodeSource;
	this.targetNode = nodeTarget;
	
};

Edge.prototype.toJSON = function(){
	return {"index": this.id,"sourceIndex":this.sourceNode.getId(),"targetIndex":this.targetNode.getId(),"args":this.args};
};

Edge.prototype.getNodeSource = function(){
	return this.sourceNode;
};

Edge.prototype.getNodeTarget = function(){
	return this.targetNode;
};

Edge.prototype.remove = function(){
	//Remove edge object in the nodes
	this.getNodeSource().removeEdge(this);
	this.getNodeTarget().removeEdge(this);
	
	this.deleted.notify(this);
};
