
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