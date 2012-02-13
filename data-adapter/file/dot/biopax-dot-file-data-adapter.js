BiopaxDotFileDataAdapter.prototype.loadFromFile = DotFileDataAdapter.prototype.loadFromFile;
BiopaxDotFileDataAdapter.prototype.loadFromContent = DotFileDataAdapter.prototype.loadFromContent;
BiopaxDotFileDataAdapter.prototype.nodeAttributesToJSON = DotFileDataAdapter.prototype.nodeAttributesToJSON;
BiopaxDotFileDataAdapter.prototype.parse = DotFileDataAdapter.prototype.parse;
BiopaxDotFileDataAdapter.prototype.getDataset = DotFileDataAdapter.prototype.getDataset;
BiopaxDotFileDataAdapter.prototype.parseFromJSON = DotFileDataAdapter.prototype.parseFromJSON;
BiopaxDotFileDataAdapter.prototype.parseLines = DotFileDataAdapter.prototype.parseLines;

function BiopaxDotFileDataAdapter() {
	DotFileDataAdapter.prototype.constructor.call(this);
	this.dataset = new GraphDataset();
	this.layout = new LayoutDataset();
	this.formatter = new NetworkDataSetFormatter({
		"defaultFormat": {"size":3, "opacity":1, "fill":"#FFFFFF", "radius":"5", "strokeWidth":"1", "stroke":"#000000", "title":{"fontSize":10, "fill":"black"}},
		"selected": {"opacity":0.9, "fill":"red", "radius":"5", "stroke":"white"},
		"over": {"opacity":1, "fill":"gray", "radius":"5", "stroke":"none", "strokeWidth":"2"}
	}, 
	{
		"defaultFormat": {  "opacity":1,"stroke":"#000000", "strokeWidth":"2", "strokeOpacity":0.5, "title":{"fontSize":6, "fontColor":"black"}},
		"selected": {"stroke":"red", "fill":"black"},
		"over": { "stroke":"blue","strokeOpacity":1, "strokeWidth":"4"}
	},
	{"backgroundColor":"white", "balanceNodes":false, "nodesMaxSize":4, "nodesMinSize":2});		
	
};



BiopaxDotFileDataAdapter.prototype.getFormatter = function(width, height){
	this.formatter.dataBind(this.dataset);
	
	for ( var vertex in this.dataset.vertices) {
		var args =  this.dataset.vertices[vertex].args;
		//cambiamos las coordenadas
		var pos = args.pos.replace("\"", "");
		pos = pos.replace("\"", "");
		
		
		if (args.shape == "box"){
			if (args.style!=null){
				if (args.style.indexOf("rounded")!=-1){
					this.formatter.changeNodeType(vertex, "RoundedVertexNetworkFormatter");
				}
				else{
					this.formatter.changeNodeType(vertex, "SquareVertexNetworkFormatter");
					this.formatter.getVertexById(vertex).getDefault().setSize(this.formatter.getVertexById(vertex).getDefault().getSize()/1.5);//(vertex, "SquareVertexNetworkFormatter");
				}
			}else{
				this.formatter.changeNodeType(vertex, "SquareVertexNetworkFormatter");
				this.formatter.getVertexById(vertex).getDefault().setSize(this.formatter.getVertexById(vertex).getDefault().getSize()/1.5);
			}
		}
		
		if (args.shape == "octagon"){
			this.formatter.changeNodeType(vertex, "OctagonVertexNetworkFormatter");
		}
		
		if (args.shape == "ellipse"){
			this.formatter.changeNodeType(vertex, "EllipseVertexNetworkFormatter");
		}
		
		if (args.shape == "tripleoctagon"){
			this.formatter.changeNodeType(vertex, "EllipseVertexNetworkFormatter");
		}
		
		if (args.color != null){
			this.formatter.getVertexById(vertex).getDefault().setFill(args.color);
			this.formatter.getVertexById(vertex).getOver().setFill(args.color);
		}
		
		if (args.fillcolor != null){
			while (args.fillcolor.indexOf("\"")!= -1) {
				args.fillcolor = args.fillcolor.replace("\"", "");
			}
			this.formatter.getVertexById(vertex).getDefault().setFill( args.fillcolor);
			this.formatter.getVertexById(vertex).getOver().setFill( args.fillcolor);
		}
	}
	
	
	for ( var edge in this.dataset.edges) {
		var args =  this.dataset.edges[edge].args;
		if (args.type == "--"){
			this.formatter.changeEdgeType(edge, "LineEdgeNetworkFormatter");
		}
		
		if (args.type == "->"){
			this.formatter.changeEdgeType(edge, "DirectedLineEdgeNetworkFormatter");
		}
		
		if (args.arrowhead !=null){
			if (args.arrowhead == "odot"){
				this.formatter.changeEdgeType(edge, "OdotDirectedLineEdgeNetworkFormatter");
			}
		}
	}
	return this.formatter;
};

BiopaxDotFileDataAdapter.prototype.getLayout = function(){
	this.layout.dataBind(this.dataset);
	

	var minWidth = Infinity;
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
	
	/*maxWidth = maxWidth + (maxWidth/4);
	maxHeight = maxHeight + (maxHeight/4);*/
	
	for ( var vertex in this.dataset.vertices) {
		var pos = this.dataset.vertices[vertex].args.pos.replace("\"", "");
		var x = ((parseFloat(pos.split(",")[0])/(maxWidth))*0.8) + 0.05;
		var y = ((1 - (( parseFloat(pos.split(",")[1]))/(maxHeight)))*0.8) + 0.05;
		this.layout.getNodeById(vertex).setCoordinates(x, y);
	}
	return this.layout;
};





