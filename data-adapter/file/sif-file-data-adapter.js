SIFFileDataAdapter.prototype.loadFromFile = FileDataAdapter.prototype.loadFromFile;
SIFFileDataAdapter.prototype.loadFromContent = FileDataAdapter.prototype.loadFromContent;

function SIFFileDataAdapter(){
	FileDataAdapter.prototype.constructor.call(this);
	
	this.dataset = new GraphDataset();
	
	this.graph = new Object();
	this.graph.edges = new Array();
	this.graph.nodes = new Array();
	this.graph.relations = new Array();
};

SIFFileDataAdapter.prototype.toSIFID = function(dataset){
	var sifText = "";
	for ( var vertexId in dataset.vertices) {
		var line = "";
		var vertex = dataset.getVertexById(vertexId);
		
		if ((vertex.getEdges().length == 0)){
			line = vertex.getId() + "\n";
			sifText = sifText + line;
		}
		else{
			var edges = vertex.getEdgesOut();
			
			for ( var i = 0; i < edges.length; i++) {
				line = edges[i].getNodeSource().getId() + "\t--\t" + edges[i].getNodeTarget().getId() + "\n";
				sifText = sifText + line;
			}
		}
	}
	return sifText;
};


SIFFileDataAdapter.prototype.toSIF = function(dataset){
	var sifText = "";
	for ( var vertexId in dataset.vertices) {
		var line = "";
		var vertex = dataset.getVertexById(vertexId);
		
		if ((vertex.getEdges().length == 0)){
			line = vertex.getName() + "\n";
			sifText = sifText + line;
		}
		else{
			var edges = vertex.getEdgesOut();
			
			for ( var i = 0; i < edges.length; i++) {
				line = edges[i].getNodeSource().getName() + "\t--\t" + edges[i].getNodeTarget().getName() + "\n";
				sifText = sifText + line;
			}
		}
	}
	return sifText;
};

SIFFileDataAdapter.prototype.toDOT = function(dataset){
	var sifText = "graph network {\n";
	sifText = sifText + this.toSIF(dataset);
	return sifText + "}";
};

SIFFileDataAdapter.prototype.toDOTID = function(dataset){
	var sifText = "graph network {\n";
	sifText = sifText + this.toSIFID(dataset);
	return sifText + "}";
};

//HAY QUE MODIFICAR ESTE METODO PARA QUE NO USE LAS CLASES DE NETWORK NODE
// SIMPLEMENTE DEBERIA PARSEAR EL FICHERO SIF Y PONERLA EN UNA ESTRUCTURA DE DATOS INDICANDO, NODOS, ARISTAS Y RELATIONES
SIFFileDataAdapter.prototype.parse = function(sifString){
	var lineBreak = sifString.split("\n");
	var sifFieldsString  = new Array();
	for (var i = 0; i < lineBreak.length; i++){
		if (lineBreak[i].length>0){
			
				var trimmed = lineBreak[i].replace(/^\s+|\s+$/g,"");
			
				var field =trimmed.replace(/\s+/g,'**%**').split("**%**");
				if (field.length>0){
					sifFieldsString.push( field);
				}
		}
	}
	
	var nodesIndex = new Array();
	var nodesId = new Object();
	var nodes = new Object();
	for (var i = 0; i < sifFieldsString.length; i++){
		var id = sifFieldsString[i][0];
			if (nodes[id] == null){
				nodesIndex.push(id);
				nodesId[id] = i;
				nodes[id] = new Vertex(nodesIndex.length - 1, id, {});
			}
		
		for (var j = 2; j < sifFieldsString[i].length; j++){
			var id = sifFieldsString[i][j];
			if (nodes[id] == null){
				nodesIndex.push(id);
				nodesId[id] = i;
				nodes[id] = new Vertex(nodesIndex.length - 1, id, {});
			}
		}
	}
	var relations = new Array();
	var edgesIndex = new Array();
	var edges = new Object();
	
	//adding edges to nodes field from 1 to last one
	for (var nodeIndex = 0; nodeIndex < sifFieldsString.length; nodeIndex++){
		for (var j = 2; j < sifFieldsString[nodeIndex].length; j++){
				var from =sifFieldsString[nodeIndex][0];
				var to =sifFieldsString[nodeIndex][j];
				var edgeid = "e_" + from + "_" + to;
				edgesIndex.push(edgeid);
				var edge =  new Edge(edgesIndex.length-1, edgeid, nodes[from], nodes[to], {"type": sifFieldsString[nodeIndex][1]});
				edges[edgeid] = edge;
				nodes[from].addEdge(edge);
				nodes[to].addEdge(edge);
				relations.push(edge.toJSON());
		}		
	}
	
	
	this.graph.edges = edgesIndex;
	this.graph.nodes = nodesIndex;
	this.graph.relations = relations;
	
	this.dataset.loadFromJSON((this.graph));
};




InteractomeSIFFileDataAdapter.prototype.loadFromFile = SIFFileDataAdapter.prototype.loadFromFile;
InteractomeSIFFileDataAdapter.prototype.parse = SIFFileDataAdapter.prototype.parse;
InteractomeSIFFileDataAdapter.prototype.loadFromContent = SIFFileDataAdapter.prototype.loadFromContent;

function InteractomeSIFFileDataAdapter(){
	SIFFileDataAdapter.prototype.constructor.call(this);
	this.dataset = new GraphDataset();
	
};








