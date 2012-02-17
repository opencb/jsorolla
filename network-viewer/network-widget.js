function NetworkWidget(args){
	this.id = "NetworkWidget#"+ Math.round(Math.random()*10000) +"#";
	this.label = true;
	if (args != null){
		if (args.targetId != null){
			this.targetId = args.targetId;
		}
		if (args.label != null){
			this.label = args.label;
		}
	}
	
	this.onVertexOver = new Event(this);
	this.onVertexOut = new Event(this);
};


NetworkWidget.prototype.draw = function(dataset, formatter, layout){

	this.graphCanvas = new GraphCanvas(this.id, document.getElementById(this.targetId), {"labeled":this.label,"multipleSelectionEnabled":true, "draggingCanvasEnabled":false});
	this.graphCanvas.draw(dataset, formatter, layout);
	
	var _this = this;
	this.graphCanvas.onVertexOver.addEventListener(function(sender, nodeId){
		_this.onVertexOver.notify(nodeId);
	});
	
	this.graphCanvas.onVertexOut.addEventListener(function(sender, nodeId){
		_this.onVertexOut.notify(nodeId);
	});
};


/** SELECT VERTICES BY NAME **/
NetworkWidget.prototype.selectVertexByName = function(vertexName){
	var vertices = this.getDataset().getVertexByName(vertexName);
//	console.log(this.getDataset());
	if (vertices != null){
		for (var nodeId in vertices){
			var vertexId = vertices[nodeId].getId();
			this.selectVertexById(vertexId);
		}
	}
};

NetworkWidget.prototype.selectVerticesByName = function(verticesName){
	for ( var i = 0; i < verticesName.length; i++) {
		this.selectVertexByName(verticesName[i]);
	}
};

/** SELECT VERTICES BY ID **/
NetworkWidget.prototype.selectVertexById = function(vertexId){
	this.graphCanvas.selectNode(vertexId);
	this.blinkVertexById(vertexId);
};

NetworkWidget.prototype.selectVerticesById = function(verticesId){
	for ( var i = 0; i < verticesId.length; i++) {
		this.selectVertexById(verticesId[i]);
	}
};


/** VECINDARIO **/
NetworkWidget.prototype.selectNeighbourhood = function(){
    this.selectEdgesFromVertices();
    this.selectAdjacent();
};


/** DESELECT **/
NetworkWidget.prototype.deselectNodes = function(){
	this.graphCanvas.deselectNodes();
};



/** SELECT ALL NODES **/
NetworkWidget.prototype.selectAllNodes = function(){
	this.getGraphCanvas().selectAllNodes();
};

/** SELECT EVERYTHING **/
NetworkWidget.prototype.selectAll = function(){
	this.getGraphCanvas().selectAll();
};

/** SELECT ALL EDGES **/
NetworkWidget.prototype.selectAllEdges = function(){
	this.getGraphCanvas().selectAllEdges();
};

/** ZOOM **/
NetworkWidget.prototype.setScale = function(value){
	this.graphCanvas.setScale(value);
};

NetworkWidget.prototype.getScale = function(){
	return this.graphCanvas.getScale(value);
};

/** SELECT ADJACENT VERTICES FROM SELECTED VERTICES **/
NetworkWidget.prototype.selectAdjacent = function(){
	var selectedVertices = this.getGraphCanvas().getSelectedVertices();
		var edges = new Array();
		for ( var i = 0; i < selectedVertices.length; i++) {
			edges = edges.concat(this.getGraphCanvas().getDataset().getVertexById(selectedVertices[i]).getEdges());
		}
		var vertices = new Array();
		for ( var i = 0; i < edges.length; i++) {
			vertices.push(edges[i].getNodeSource().getId());
			vertices.push(edges[i].getNodeTarget().getId());
		}
		
		this.selectVerticesById(vertices);
};

/** SELECT EDGES FROM SELECTED VERTICES **/
NetworkWidget.prototype.selectEdgesFromVertices = function(){
	var selectedVertices = this.getGraphCanvas().getSelectedVertices();
		var edges = new Array();
		for ( var i = 0; i < selectedVertices.length; i++) {
			edges = edges.concat(this.getGraphCanvas().getDataset().getVertexById(selectedVertices[i]).getEdges());
	}
	var edgesId = new Array();
	for ( var i = 0; i < edges.length; i++) {
			edgesId.push(edges[i].getId());
	}
	this.getGraphCanvas().selectEdges(edgesId);
};

/** BLINKING **/
NetworkWidget.prototype.blinkVertexById = function(vertexId){
	this.graphCanvas.blinkVertexById(vertexId);
};


/** COMPONENTE CONEXA DE LOS NODOS SELECCIONADOS **/
NetworkWidget.prototype.selectConnectedComponent = function(){
	var elements = this.getConnectedComponent();
	this.selectVerticesById(elements.nodes);
	this.graphCanvas.selectEdges(elements.edges);
};

NetworkWidget.prototype.getConnectedComponent = function(){
	var nodosVisitados = {};
	var aristasVisitadas = {};
	var arrNodos=[];
	var arrAristas=[];
	var selectedGraphNodesId = this.getGraphCanvas().getSelectedVertices();
	for(var i = 0; i < selectedGraphNodesId.length; i++){
		this.visitNode(selectedGraphNodesId[i], nodosVisitados, aristasVisitadas, arrNodos, arrAristas);
	}
	return {nodes:arrNodos,edges:arrAristas};
};

NetworkWidget.prototype.visitNode = function(nodeId, nodosVisitados, aristasVisitadas, arrNodos, arrAristas){
	nodosVisitados[nodeId]=true;
	arrNodos.push(nodeId);
		var nodeEdges = this.getDataset().getVertexById(nodeId).getEdges();
		for ( var j = 0; j < nodeEdges.length; j++) {
			var edge = nodeEdges[j];
			var edgeId = edge.getId();
			if(aristasVisitadas[edgeId]==null){
				aristasVisitadas[edgeId]=true;
				arrAristas.push(edgeId);
				var nodeTargetId = edge.getNodeTarget().getId();
				if(nodosVisitados[nodeTargetId]==null){
					this.visitNode(nodeTargetId, nodosVisitados, aristasVisitadas, arrNodos, arrAristas);
				}
				var nodeSourceId = edge.getNodeSource().getId();
				if(nodosVisitados[nodeSourceId]==null){
					this.visitNode(nodeSourceId, nodosVisitados, aristasVisitadas, arrNodos, arrAristas);
				}
			}
		}
};

/** COLLAPSE SELECTED VERTICES **/
NetworkWidget.prototype.collapse = function(){
	var selectedVertices = this.getGraphCanvas().getSelectedVertices();
	var xMin = -Infinity;
	var xMax = Infinity;
	var yMin = -Infinity;
	var yMax = Infinity;

	for ( var i = 0; i < selectedVertices.length; i++) {
		var vertex = this.getGraphCanvas().getLayout().getNodeById(selectedVertices[i]);
		if (xMin < vertex.x){xMin = vertex.x;}
		if (xMax > vertex.x){xMax = vertex.x;}
		if (yMin < vertex.y){yMin = vertex.y;}
		if (yMax > vertex.y){yMax = vertex.y;}
	}
	
	var centerX =  xMin - xMax;
	var centerY =  yMin - yMax ;
	var radius = (xMax - xMin)/4;
	
	var count = selectedVertices.length;
	var verticesCoordinates = new Array();
	
	for(var i = 0; i < selectedVertices.length; i++){
		x = centerX + radius * Math.sin(i * 2 * Math.PI/count);
		y = centerY + radius * Math.cos(i * 2 * Math.PI/count);
		verticesCoordinates.push({'x':x,'y':y});
	}
	
	for ( var i = 0; i < selectedVertices.length; i++) {
		vertex = selectedVertices[i];
		this.getGraphCanvas().getLayout().getNodeById(vertex).setCoordinates(verticesCoordinates[i].x, verticesCoordinates[i].y);
	}
};

/** SETTER FONT SIZE **/
NetworkWidget.prototype.setVerticesFontSize = function(value){
	for (var nodeId in this.getDataset().getVertices()){
		this.getFormatter().getVertexById(nodeId).getDefault().setFontSize(value);
	}
};

/** GETTERS **/
NetworkWidget.prototype.getFormatter = function(){
	return this.getGraphCanvas().getFormatter();
};
NetworkWidget.prototype.getLayout = function(){
	return this.getGraphCanvas().getLayout();
};

NetworkWidget.prototype.getDataset = function(){
	return this.getGraphCanvas().getDataset();
};

NetworkWidget.prototype.getGraphCanvas = function(){
	return this.graphCanvas;
};