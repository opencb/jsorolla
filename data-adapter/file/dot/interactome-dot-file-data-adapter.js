InteractomeDotFileDataAdapter.prototype.loadFromFile = DotFileDataAdapter.prototype.loadFromFile;
InteractomeDotFileDataAdapter.prototype.loadFromContent = DotFileDataAdapter.prototype.loadFromContent;
InteractomeDotFileDataAdapter.prototype.nodeAttributesToJSON = DotFileDataAdapter.prototype.nodeAttributesToJSON;
InteractomeDotFileDataAdapter.prototype.parse = DotFileDataAdapter.prototype.parse;
InteractomeDotFileDataAdapter.prototype.getDataset = DotFileDataAdapter.prototype.getDataset;
InteractomeDotFileDataAdapter.prototype.parseLines = DotFileDataAdapter.prototype.parseLines;

function InteractomeDotFileDataAdapter() {
	DotFileDataAdapter.prototype.constructor.call(this);
	this.dataset = new InteractomeGraphDataset();
	this.layout = new LayoutDataset();

};
InteractomeDotFileDataAdapter.prototype.getFormatter = function(width, height){
	this.formatter = new NetworkDataSetFormatter({
		"defaultFormat": {"size":4, "opacity":1, "fill":"#FFFFFF", "radius":"5", "strokeWidth":"1", "stroke":"#000000", "title":{"fontSize":10, "fill":"black"}},
		"selected": {"opacity":0.9, "fill":"red", "radius":"5", "stroke":"white"},
		"over": {"opacity":1, "fill":"gray", "radius":"5", "stroke":"none", "strokeWidth":"2"}
	}, 
	{
		"defaultFormat": {  "opacity":1,"stroke":"#000000", "strokeWidth":"2", "strokeOpacity":0.5, "title":{"fontSize":6, "fontColor":"black"}},
		"selected": {"stroke":"red", "fill":"black"},
		"over": { "stroke":"blue","strokeOpacity":1, "strokeWidth":"4"}
	},
	{"height":500,"width":width,"right":height,"backgroundColor":"white", "balanceNodes":false, "nodesMaxSize":4, "nodesMinSize":2});		
	this.formatter.dataBind(this.dataset);
	
	for ( var vertex in this.dataset.vertices) {
		var args =  this.dataset.vertices[vertex].args;
		//cambiamos las coordenadas
		//var pos = args.pos.replace("\"", "");
		//pos = pos.replace("\"", "");
		
		if (args.shape == "box"){
			this.formatter.changeNodeType(vertex, "SquareVertexNetworkFormatter");
		}
		
		if (args.shape == "octagon"){
			this.formatter.changeNodeType(vertex, "CircleVertexNetworkFormatter");
		}
		
		if (args.shape == "tripleoctagon"){
			this.formatter.changeNodeType(vertex, "EllipseVertexNetworkFormatter");
		}
		if (args.color != null){
			this.formatter.getVertexById(vertex).getDefault().setFill(args.color);
			this.formatter.getVertexById(vertex).getOver().setFill(args.color);
		}
		if (args.size != null){
			this.formatter.getVertexById(vertex).getDefault().setSize(args.size);
			this.formatter.getVertexById(vertex).getOver().setSize(args.size);
		}
	}
	
	
	for ( var edgeId in this.dataset.edges) {
		var args =  this.dataset.edges[edgeId].args;
		//console.log(args);
		if (args.type == "--"){
			this.formatter.changeEdgeType(edgeId, "LineEdgeNetworkFormatter");
		}
		
		if (args.type == "->"){
			this.formatter.changeEdgeType(edgeId, "DirectedLineEdgeNetworkFormatter");
		}
		
		if (args.arrowhead !=null){
			if (args.arrowhead == "odot"){
				this.formatter.changeEdgeType(edgeId, "OdotDirectedLineEdgeNetworkFormatter");
			}
		}
		if (args.opacity !=null){
			this.formatter.getEdgeById(edgeId).getDefault().setStrokeOpacity(args.opacity);
		}
		if (args.size !=null){
			this.formatter.getEdgeById(edgeId).getDefault().setSize(args.size);
		}
	}
	return this.formatter;
};

InteractomeDotFileDataAdapter.prototype.getLayout = function(){
	this.layout.dataBind(this.dataset);
	

	/*var minWidth = Infinity;
	var minHeight = Infinity;
	
	var maxWidth = - Infinity;
	var maxHeight = - Infinity;
	
	
	for ( var vertex in this.dataset.vertices) {
		var pos = this.dataset.vertices[vertex].args.pos.replace("\"", "");
		pos = pos.replace("\"", "");
		
		var width = parseFloat(pos.split(",")[0]);
		var height = parseFloat(pos.split(",")[1]);
		
		if (width > maxWidth ){
			maxWidth = width;
		}
		if (width < minWidth ){
			minWidth = width;
		}
		
		if (height > maxHeight ){
			maxHeight = height;
		}
		if (width < minHeight ){
			minHeight = height;
		}
	}
	
	for ( var vertex in this.dataset.vertices) {
		var pos = this.dataset.vertices[vertex].args.pos.replace("\"", "");
		var x = parseFloat(pos.split(",")[0])/(maxWidth);
		var y = 1 - (( parseFloat(pos.split(",")[1]))/(maxHeight));
		this.layout.getNodeById(vertex).setCoordinates(x, y);
		console.log(x + " " + y);
	}*/
	return this.layout;
};


