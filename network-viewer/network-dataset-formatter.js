function NetworkDataSetFormatter(vertexFormatProperties, defaultEdgeProperties, args){
	DataSet.prototype.constructor.call(this);
	
	this.args = new Object();
	
	this.vertices = new Object();
	this.edges = new Object();
	this.dataset = null;
	this.maxClass = 0;
	this.minClass = 0;
	
	/** Coordenates with default Setting */
	this.args.width = 1100;
	this.args.height = 500;
	
	/** Optional parameters */
	this.args.backgroundColor = "#FFFFFF";
	this.args.backgroundImage = null;
	this.args.backgroundImageHeight = null;
	this.args.backgroundImageWidth = null;
	this.args.backgroundImageX = null;
	this.args.backgroundImageY = null;
	
	
	this.args.balanceNodes = false;
	this.args.nodesMaxSize = 3;
	this.args.nodesMinSize = 0.5;
		
	
	/** Zoom **/
	this.args.zoomScale = 1;
	this.args.zoomScaleStepFactor = 0.4;
	
	if (args != null){
		if (args.backgroundImage != null){
			this.args.backgroundImage = args.backgroundImage;		
		}
		
		if (args.width != null){
			this.args.width = args.width;		
		}
		
		if (args.height != null){
			this.args.height = args.height;	
			this.args.svgHeight = args.height;		
		}
		
		if (args.svgHeight != null){
			this.args.svgHeight = args.svgHeight;		
		}
		
		if (args.backgroundColor != null){
			this.args.backgroundColor = args.backgroundColor;		
		}
		
		if(args.balanceNodes != null){
			this.args.balanceNodes = args.balanceNodes;
		}

		if(args.nodesMaxSize != null){
			this.args.nodesMaxSize = args.nodesMaxSize;
		}
		if(args.nodesMinSize != null){
			this.args.nodesMinSize = args.nodesMinSize;
		}
	}
	
	this.args.defaultEdgeProperties =  {"fill":"#000000", "radius":"1", "stroke":"#000000", "size":1, "title":{"fontSize":10, "fontColor":"#000000"}};
	this.args.vertexFormatProperties = { "fill":"#000000", "stroke":"#000000", "stroke-opacity":"#000000"};
	
	if (vertexFormatProperties!= null){
		this.args.vertexFormatProperties = vertexFormatProperties;
	}
	if (defaultEdgeProperties!= null){
		this.args.defaultEdgeProperties = defaultEdgeProperties;
	}
	
	/** Events **/
	this.changed = new Event(this);
	this.edgeChanged = new Event(this);
	this.resized = new Event(this);
	this.backgroundImageChanged= new Event(this);
	this.backgroundColorChanged= new Event(this);
};

NetworkDataSetFormatter.prototype.loadFromJSON = function(dataset, json){
	this.args = new Object();
	this.vertices = new Object();
	this.args = json;
	this._setDataset(dataset);
	var _this = this;
	
	for ( var vertex in json.vertices) {
		this.addVertex(vertex, json.vertices[vertex]);
	}
	
	for ( var edgeId in json.edges) {
		this.addEdge(edgeId, json.edges[edgeId]);
	}
};


NetworkDataSetFormatter.prototype.toJSON = function(){
	
	
//	this.args.vertices = new Object();
//	this.args.edges = new Object();
//	
//	for ( var vertex in this.vertices) {
//		this.args.vertices[vertex] = this.getVertexById(vertex).toJSON();
//	}
//	for ( var edge in this.edges) {
//		this.args.edges[edge] = this.getEdgeById(edge).toJSON();
//	}
//	
//	return (this.args);
	

	var serialize = new Object();
	serialize = JSON.parse(JSON.stringify(this.args));
	serialize.vertices = new Object();
	serialize.edges = new Object();
	
	for ( var vertex in this.vertices) {
		serialize.vertices[vertex] = this.getVertexById(vertex).toJSON();
	}
	for ( var edge in this.edges) {
		serialize.edges[edge] = this.getEdgeById(edge).toJSON();
	}
	
	return (serialize);
};



NetworkDataSetFormatter.prototype._getNodeSize = function(nodeId){
	if (this.isVerticesBalanced()){
		var total =  this.maxClass - this.minClass;
		if (total == 0){ total = 1;}
		var nodeConnection = this.dataset.getVertexById(nodeId).getEdges().length;
		return ((nodeConnection*this.args.nodesMaxSize)/total)  + this.args.nodesMinSize;
	}
	return this.getVertexById(nodeId).getDefault().getSize();
};

NetworkDataSetFormatter.prototype._recalculateSize = function(){
	if (this.isVerticesBalanced()){
		this.maxClass = this.dataset.getMaxClass();
		this.minClass = this.dataset.getMinClass();
		for ( var vertexIdAll in this.vertices) {
				var size = this._getNodeSize(vertexIdAll);
				this.vertices[vertexIdAll].getDefault().setSize(size);
				this.vertices[vertexIdAll].getSelected().setSize(size);
				this.vertices[vertexIdAll].getOver().setSize(size);
		}
	}
};


NetworkDataSetFormatter.prototype.addVertex = function(vertexId, json){
	
	
	if (json == null){
		this.vertices[vertexId] = new CircleVertexGraphFormatter(vertexId, this.args.vertexFormatProperties.defaultFormat, this.args.vertexFormatProperties.selected, this.args.vertexFormatProperties.over, this.args.vertexFormatProperties.dragging);
	}
	else{
		
		/** Cargo los attributos desde el json **/
		if (json.type == null){
			this.vertices[vertexId] = new CircleVertexGraphFormatter(vertexId, this.args.vertexFormatProperties.defaultFormat, this.args.vertexFormatProperties.selected, this.args.vertexFormatProperties.over, this.args.vertexFormatProperties.dragging);
		}
		
		if ((json.type == "SquareVertexGraphFormatter")||(json.type == "SquareVertexNetworkFormatter")){
			this.vertices[vertexId] = new SquareVertexGraphFormatter(vertexId);
			this.vertices[vertexId].loadFromJSON(json);
		}
		
		if ((json.type == "CircleVertexGraphFormatter")||(json.type == "CircleVertexNetworkFormatter")){
			this.vertices[vertexId] = new CircleVertexGraphFormatter(vertexId);
			this.vertices[vertexId].loadFromJSON(json);
		}
		
		if ((json.type == "EllipseVertexGraphFormatter")||(json.type == "EllipseVertexNetworkFormatter")){
			this.vertices[vertexId] = new EllipseVertexGraphFormatter(vertexId);
			this.vertices[vertexId].loadFromJSON(json);
		}
		
		if ((json.type == "RectangleVertexGraphFormatter")||(json.type == "RectangleVertexNetworkFormatter")){
			this.vertices[vertexId] = new RectangleVertexGraphFormatter(vertexId);
			this.vertices[vertexId].loadFromJSON(json);
		}
		
		if ((json.type == "RoundedVertexGraphFormatter")||(json.type == "RoundedVertexNetworkFormatter")){
			this.vertices[vertexId] = new RoundedVertexGraphFormatter(vertexId);
			this.vertices[vertexId].loadFromJSON(json);
		}
		
	}
	
	
	var _this = this;
	this.vertices[vertexId].stateChanged.addEventListener(function (sender, item){
		_this.changed.notify(item);
	});
	
	var size = this._getNodeSize(vertexId);
	this.vertices[vertexId].defaultFormat.args.size = size;
	this.vertices[vertexId].selected.args.size =  size;
	this.vertices[vertexId].over.args.size =  size;
	
};

NetworkDataSetFormatter.prototype.addEdge = function(edgeId, json){
	
	/** Es un edge nuevo que le doy los atributos por defecto **/
	if (json == null){
		if (this.dataset.getEdgeById(edgeId).getNodeSource().getId() == this.dataset.getEdgeById(edgeId).getNodeTarget().getId()){
			this.edges[edgeId] = new BezierEdgeGraphFormatter(edgeId, this.args.defaultEdgeProperties.defaultFormat, this.args.defaultEdgeProperties.selected, this.args.defaultEdgeProperties.over, this.args.defaultEdgeProperties.dragging);
		}else{
			this.edges[edgeId] = new DirectedLineEdgeGraphFormatter(edgeId, this.args.defaultEdgeProperties.defaultFormat, this.args.defaultEdgeProperties.selected, this.args.defaultEdgeProperties.over, this.args.defaultEdgeProperties.dragging);
		}
	}
	else{
		/** Cargo los attributos desde el json **/
		if (json.type == null){
			this.edges[edgeId] = new LineEdgeGraphFormatter(edgeId, this.args.defaultEdgeProperties.defaultFormat, this.args.defaultEdgeProperties.selected, this.args.defaultEdgeProperties.over, this.args.defaultEdgeProperties.dragging);
		}
		
		if ((json.type == "LineEdgeGraphFormatter")||(json.type == "LineEdgeNetworkFormatter")){
			this.edges[edgeId] = new LineEdgeGraphFormatter(edgeId);
			this.edges[edgeId].loadFromJSON(json);
		}
		if ((json.type == "DirectedLineEdgeGraphFormatter")||(json.type == "DirectedLineEdgeNetworkFormatter")){
			this.edges[edgeId] = new DirectedLineEdgeGraphFormatter(edgeId);
			this.edges[edgeId].loadFromJSON(json);
		}
		
		if ((json.type == "BezierEdgeGraphFormatter")||(json.type == "BezierEdgeNetworkFormatter")){
			this.edges[edgeId] = new BezierEdgeGraphFormatter(edgeId);
			this.edges[edgeId].loadFromJSON(json);
		}
		
		
		if ((json.type == "CutDirectedLineEdgeGraphFormatter")||(json.type == "CutDirectedLineEdgeNetworkFormatter")){
			this.edges[edgeId] = new CutDirectedLineEdgeGraphFormatter(edgeId);
			this.edges[edgeId].loadFromJSON(json);
		}
		
		if ((json.type == "DotDirectedLineEdgeGraphFormatter")||(json.type == "DotDirectedLineEdgeNetworkFormatter")){
			this.edges[edgeId] = new DotDirectedLineEdgeGraphFormatter(edgeId);
			this.edges[edgeId].loadFromJSON(json);
		}
		if ((json.type == "OdotDirectedLineEdgeGraphFormatter")||(json.type == "OdotDirectedLineEdgeNetworkFormatter")){
			this.edges[edgeId] = new OdotDirectedLineEdgeGraphFormatter(edgeId);
			this.edges[edgeId].loadFromJSON(json);
		}
		
		if ((json.type == "OdirectedLineEdgeGraphFormatter")||(json.type == "OdirectedLineEdgeNetworkFormatter")){
			this.edges[edgeId] = new OdirectedLineEdgeGraphFormatter(edgeId);
			this.edges[edgeId].loadFromJSON(json);
		}
	}
	
	var _this = this;
	this.edges[edgeId].stateChanged.addEventListener(function (sender, item){
		_this.edgeChanged.notify(item);
	});
	
	this._recalculateSize();
};

NetworkDataSetFormatter.prototype._setDataset = function(dataset){
	this.dataset = dataset;
	this.maxClass = dataset.getMaxClass();
	this.minClass = dataset.getMinClass();
	this._attachDatasetEvents();
};

NetworkDataSetFormatter.prototype.changeEdgeType = function(edgeId, type){
	if ((type == "LineEdgeGraphFormatter")||(type == "LineEdgeNetworkFormatter")){
		this.edges[edgeId] = new LineEdgeGraphFormatter(edgeId, this.args.defaultEdgeProperties.defaultFormat, this.args.defaultEdgeProperties.selected, this.args.defaultEdgeProperties.over, this.args.defaultEdgeProperties.dragging);
		
	}
	if ((type == "DirectedLineEdgeGraphFormatter")||(type == "DirectedLineEdgeNetworkFormatter")){
		this.edges[edgeId] = new DirectedLineEdgeGraphFormatter(edgeId, this.args.defaultEdgeProperties.defaultFormat, this.args.defaultEdgeProperties.selected, this.args.defaultEdgeProperties.over, this.args.defaultEdgeProperties.dragging);
	}
	
	if ((type == "CutDirectedLineEdgeGraphFormatter")||(type == "CutDirectedLineEdgeNetworkFormatter")){
		this.edges[edgeId] = new CutDirectedLineEdgeGraphFormatter(edgeId, this.args.defaultEdgeProperties.defaultFormat, this.args.defaultEdgeProperties.selected, this.args.defaultEdgeProperties.over, this.args.defaultEdgeProperties.dragging);
	}
	
	if ((type == "DotDirectedLineEdgeGraphFormatter")||(type == "DotDirectedLineEdgeNetworkFormatter")){
		this.edges[edgeId] = new DotDirectedLineEdgeGraphFormatter(edgeId, this.args.defaultEdgeProperties.defaultFormat, this.args.defaultEdgeProperties.selected, this.args.defaultEdgeProperties.over, this.args.defaultEdgeProperties.dragging);
	}
	
	if ((type == "OdotDirectedLineEdgeGraphFormatter")||(type == "OdotDirectedLineEdgeNetworkFormatter")){
		this.edges[edgeId] = new OdotDirectedLineEdgeGraphFormatter(edgeId, this.args.defaultEdgeProperties.defaultFormat, this.args.defaultEdgeProperties.selected, this.args.defaultEdgeProperties.over, this.args.defaultEdgeProperties.dragging);
	}
	
	if ((type == "OdirectedLineEdgeGraphFormatter")||(type == "OdirectedLineEdgeNetworkFormatter")){
		this.edges[edgeId] = new OdirectedLineEdgeGraphFormatter(edgeId, this.args.defaultEdgeProperties.defaultFormat, this.args.defaultEdgeProperties.selected, this.args.defaultEdgeProperties.over, this.args.defaultEdgeProperties.dragging);
	}
	
	
	
	var _this = this;
	this.edges[edgeId].stateChanged.addEventListener(function (sender, item){
		_this.edgeChanged.notify(item);
	});
	_this.edgeChanged.notify(this.edges[edgeId]);
};
/*
classe = "SquareNetworkNodeFormatter";
}
if (value == "circle"){
	classe = "CircleNetworkNodeFormatter";
	**/
NetworkDataSetFormatter.prototype.changeNodeType = function(vertexId, type){
	var defaultFormat = JSON.parse(JSON.stringify(this.vertices[vertexId].getDefault()));
	var selectedFormat = JSON.parse(JSON.stringify(this.vertices[vertexId].getSelected()));
	var defaultFormat = JSON.parse(JSON.stringify(this.vertices[vertexId].getDefault()));
	var defaultFormat = JSON.parse(JSON.stringify(this.vertices[vertexId].getDefault()));
	
	if ((type == "SquareVertexGraphFormatter")||(type == "SquareVertexNetworkFormatter")){
		this.vertices[vertexId] = new SquareVertexGraphFormatter(vertexId,defaultFormat, this.args.vertexFormatProperties.selected, this.args.vertexFormatProperties.over, this.args.vertexFormatProperties.dragging);
	}
	
	if ((type == "CircleVertexGraphFormatter")||(type == "CircleVertexNetworkFormatter")){
		this.vertices[vertexId] = new CircleVertexGraphFormatter(vertexId, defaultFormat, this.args.vertexFormatProperties.selected, this.args.vertexFormatProperties.over, this.args.vertexFormatProperties.dragging);
	}
	
	if ((type == "EllipseVertexGraphFormatter")||(type == "EllipseVertexNetworkFormatter")){
		this.vertices[vertexId] = new EllipseVertexGraphFormatter(vertexId, defaultFormat, this.args.vertexFormatProperties.selected, this.args.vertexFormatProperties.over, this.args.vertexFormatProperties.dragging);
	}
	
	if ((type == "RectangleVertexGraphFormatter")||(type == "RectangleVertexNetworkFormatter")){
		this.vertices[vertexId] = new RectangleVertexGraphFormatter(vertexId, defaultFormat, this.args.vertexFormatProperties.selected, this.args.vertexFormatProperties.over, this.args.vertexFormatProperties.dragging);
	}
	
	if ((type == "RoundedVertexGraphFormatter")||(type == "RoundedVertexNetworkFormatter")){
		this.vertices[vertexId] = new RoundedVertexGraphFormatter(vertexId, defaultFormat, this.args.vertexFormatProperties.selected, this.args.vertexFormatProperties.over, this.args.vertexFormatProperties.dragging);
	}
	
	if ((type == "OctagonVertexGraphFormatter")||(type == "OctagonVertexNetworkhFormatter")){
		this.vertices[vertexId] = new OctagonVertexGraphFormatter(vertexId, defaultFormat, this.args.vertexFormatProperties.selected, this.args.vertexFormatProperties.over, this.args.vertexFormatProperties.dragging);
	}
	

	var _this = this;
	this.vertices[vertexId].stateChanged.addEventListener(function (sender, item){
		_this.changed.notify(item);
	});
	_this.changed.notify(this.vertices[vertexId]);
};



NetworkDataSetFormatter.prototype.dataBind = function(networkDataSet){
	var _this = this;
	this._setDataset(networkDataSet);
		
	for ( var vertex in this.dataset.getVertices()) {
		this.addVertex(vertex);
	}
	
	for ( var edge in this.dataset.getEdges()) {
		this.addEdge(edge);
	}
};

NetworkDataSetFormatter.prototype._removeEdge = function(edgeId){
	delete this.edges[edgeId];
};

NetworkDataSetFormatter.prototype._removeVertex = function(vertexId){
	delete this.vertices[vertexId];
};

NetworkDataSetFormatter.prototype._attachDatasetEvents = function(id){
	var _this = this;
	this.dataset.vertexDeleted.addEventListener(function (sender, item){
		_this._removeVertex(item.getId());
	});
	
	this.dataset.edgeDeleted.addEventListener(function (sender, item){
		_this._removeEdge(item.getId());
	});
	
	this.dataset.newVertex.addEventListener(function (sender, item){
		_this.addVertex(item.getId());
	});
	
	this.dataset.newEdge.addEventListener(function (sender, item){
		_this.addEdge(item.getId());
	});
};


NetworkDataSetFormatter.prototype.getVertexById = function(id){
	return this.vertices[id];
};

NetworkDataSetFormatter.prototype.getEdgeById = function(id){
	return this.edges[id];
};

NetworkDataSetFormatter.prototype.makeLabelsBigger = function(){
for ( var vertexId in this.vertices) {
		var fontSize = this.vertices[vertexId].getDefault().getFontSize() + 2;
		this.vertices[vertexId].getDefault().setFontSize(fontSize);
	}
};

NetworkDataSetFormatter.prototype.makeLabelsSmaller = function(){
	for ( var vertexId in this.vertices) {
			var fontSize = this.vertices[vertexId].getDefault().getFontSize() - 2;
			this.vertices[vertexId].getDefault().setFontSize(fontSize);
		}
};


NetworkDataSetFormatter.prototype.resize = function(width, height){
	this.args.width = width;
	this.args.height = height;
	this.resized.notify();
};

/** ZOOM GETTERS **/
NetworkDataSetFormatter.prototype.getZoomScaleStepFactor = function(){return this.args.zoomScaleStepFactor;};
NetworkDataSetFormatter.prototype.setZoomScaleStepFactor = function(scaleFactor){this.args.zoomScaleStepFactor = scaleFactor;};
NetworkDataSetFormatter.prototype.getZoomScale = function(){return this.args.zoomScale;};
NetworkDataSetFormatter.prototype.setZoomScale = function(scale){this.args.zoomScale = scale;};

NetworkDataSetFormatter.prototype.getNodesMaxSize = function(){return this.args.nodesMaxSize;};
NetworkDataSetFormatter.prototype.getNodesMinSize = function(){return this.args.nodesMinSize;};

/** SIZE SETTERS AND GETTERS **/
NetworkDataSetFormatter.prototype.isVerticesBalanced = function(){return this.args.balanceNodes;};
NetworkDataSetFormatter.prototype.getWidth = function(){return this.args.width;};
NetworkDataSetFormatter.prototype.getHeight = function(){return this.args.height;};

/** OPTIONAL PARAMETERS GETTERS AND SETTERS **/
NetworkDataSetFormatter.prototype.getBackgroundImage = function(){return this.args.backgroundImage;};
NetworkDataSetFormatter.prototype.setBackgroundImage = function(value){this.args.backgroundImage = value; this.backgroundImageChanged.notify(this);};


NetworkDataSetFormatter.prototype.getBackgroundImageWidth = function(){return this.args.backgroundImageWidth;};
NetworkDataSetFormatter.prototype.setBackgroundImageWidth = function(value){this.args.backgroundImageWidth = value; this.backgroundImageChanged.notify(this);};

NetworkDataSetFormatter.prototype.getBackgroundImageHeight = function(){return this.args.backgroundImageHeight;};
NetworkDataSetFormatter.prototype.setBackgroundImageHeight = function(value){this.args.backgroundImageHeight = value; this.backgroundImageChanged.notify(this);};

NetworkDataSetFormatter.prototype.getBackgroundImageX = function(){return this.args.backgroundImageX;};
NetworkDataSetFormatter.prototype.setBackgroundImageX = function(value){this.args.backgroundImageX = value; this.backgroundImageChanged.notify(this);};

NetworkDataSetFormatter.prototype.getBackgroundImageY = function(){return this.args.backgroundImageX;};
NetworkDataSetFormatter.prototype.setBackgroundImageY = function(value){this.args.backgroundImageY = value; this.backgroundImageChanged.notify(this);};



NetworkDataSetFormatter.prototype.getBackgroundColor = function(){return this.args.backgroundColor;};
NetworkDataSetFormatter.prototype.setBackgroundColor = function(value){this.args.backgroundColor = value; this.backgroundColorChanged.notify(this);};

NetworkDataSetFormatter.prototype.getWidth = function(){return this.args.width;};
NetworkDataSetFormatter.prototype.setWidth = function(value){this.args.width = value;};

NetworkDataSetFormatter.prototype.getHeight = function(){return this.args.height;};
NetworkDataSetFormatter.prototype.setHeight = function(value){this.args.height = value;};


