VCFFileDataAdapter.prototype.loadFromFile = FileDataAdapter.prototype.loadFromFile;
VCFFileDataAdapter.prototype.loadFromContent = FileDataAdapter.prototype.loadFromContent;
VCFFileDataAdapter.prototype.read = FileDataAdapter.prototype.read;
VCFFileDataAdapter.prototype.getDataset = FileDataAdapter.prototype.getDataset;


function VCFFileDataAdapter(){
	FileDataAdapter.prototype.constructor.call(this);
	
	this.dataset = null;
	this.content = null;
	
	this.lines = new Array();
};

VCFFileDataAdapter.prototype.getLines = function(content){
	return this.lines;
};


VCFFileDataAdapter.prototype.parse = function(content){
	this.content = content;
	var lineBreak = content.split("\n");
	var sifFieldsString  = new Array();
	for (var i = 0; i < lineBreak.length; i++){
		var trimmed = lineBreak[i].replace(/^\s+|\s+$/g,"");
		if ((trimmed != null)&&(trimmed.length > 0)){
			var field = trimmed.replace(/\t/g,'**%**').split("**%**");
			if (field[0].substr(0,1) != "#"){
				this.lines.push(field);
			}
		}
	}
	
	
};











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








TabularFileDataAdapter.prototype.loadFromFile = FileDataAdapter.prototype.loadFromFile;
TabularFileDataAdapter.prototype.loadFromContent = FileDataAdapter.prototype.loadFromContent;
TabularFileDataAdapter.prototype.read = FileDataAdapter.prototype.read;
TabularFileDataAdapter.prototype.getDataset = FileDataAdapter.prototype.getDataset;


function TabularFileDataAdapter(args){
	FileDataAdapter.prototype.constructor.call(this);
	
	this.dataset = null;
	this.content = null;
	
	this.comment = null;
		 
	if (args != null){
		if (args.comment != null){
			this.comment = args.comment;
		}
		
		
	}
	this.lines = new Array();
};

TabularFileDataAdapter.prototype.getLines = function(content){
	return this.lines;
};

TabularFileDataAdapter.prototype.getLinesCount = function(){
	return this.lines.length;
};

TabularFileDataAdapter.prototype.getValuesByColumnIndex = function(columnIndex){
	var result = new Array();
	for (var i = 0; i < this.getLinesCount(); i++) {
		if (this.getLines()[i][columnIndex] != null){
			result.push(this.getLines()[i][columnIndex]);
		}
	}
	return result;
};

/** Returns: 'numeric' || 'string **/
TabularFileDataAdapter.prototype.getHeuristicTypeByColumnIndex = function(columnIndex){
	return this.getHeuristicTypeByValues(this.getValuesByColumnIndex(columnIndex));
};

TabularFileDataAdapter.prototype.getHeuristicTypeByValues = function(values){
	var regExp = /^[-+]?[0-9]*\.?[0-9]+$/;
	for (var i = 0; i < values.length; i++) {
		if(!regExp.test(new String(values[i]).replace(",", "."))){
			return 'string';
		}
	}
	return 'numeric';
};


TabularFileDataAdapter.prototype.parse = function(content){
	this.content = content;
	var lineBreak = content.split("\n");
	var sifFieldsString  = new Array();
	for (var i = 0; i < lineBreak.length; i++){
		var trimmed = lineBreak[i].replace(/^\s+|\s+$/g,"");
		trimmed = trimmed.replace(/\//gi,"");//TODO DONE   /  is not allowed in the call
				
		if ((trimmed != null)&&(trimmed.length > 0)){
			var field =trimmed.replace(/\t/g,'**%**').split("**%**");
			if (this.comment == null){
				this.lines.push(field);
			}
			else{
				if (trimmed.substring(0,1) != "#"){
					this.lines.push(field);
				}
			}
			
		}
	}
	
//	this.dataset = new AttributesDataset();
//	this.dataset.load(this.lines);
};












GFFFileDataAdapter.prototype.loadFromFile = FileDataAdapter.prototype.loadFromFile;
GFFFileDataAdapter.prototype.loadFromContent = FileDataAdapter.prototype.loadFromContent;
GFFFileDataAdapter.prototype.read = FileDataAdapter.prototype.read;
GFFFileDataAdapter.prototype.getDataset = FileDataAdapter.prototype.getDataset;


function GFFFileDataAdapter(){
	FileDataAdapter.prototype.constructor.call(this);
	
	this.dataset = null;
	this.content = null;
	
	this.lines = new Array();
};

GFFFileDataAdapter.prototype.getLines = function(content){
	return this.lines;
};


GFFFileDataAdapter.prototype.parse = function(content){
	this.content = content;
	var lineBreak = content.split("\n");
	var sifFieldsString  = new Array();
	for (var i = 0; i < lineBreak.length; i++){
		var trimmed = lineBreak[i].replace(/^\s+|\s+$/g,"");
		if ((trimmed != null)&&(trimmed.length > 0)){
			var field = trimmed.replace(/\t/g,'**%**').split("**%**");
			if (field[0].substr(0,1) != "#"){
				this.lines.push(field);
			}
		}
	}
	
	
};











DotFileDataAdapter.prototype.loadFromFile = FileDataAdapter.prototype.loadFromFile;
DotFileDataAdapter.prototype.loadFromContent = FileDataAdapter.prototype.loadFromContent;
DotFileDataAdapter.prototype.getDataset = FileDataAdapter.prototype.getDataset;

function DotFileDataAdapter() {
	FileDataAdapter.prototype.constructor.call(this);
	this.dataset = new GraphDataset();
};

DotFileDataAdapter.prototype._toSIFID = function(dataset) {
	var sifText = "";
	for ( var vertexId in dataset.vertices) {
		var line = "";
		var vertex = dataset.getVertexById(vertexId);

		if ((vertex.getEdges().length == 0)) {
			line = vertex.getId() + "\n";
			sifText = sifText + line;
		} else {
			var edges = vertex.getEdgesOut();

			for ( var i = 0; i < edges.length; i++) {
				line = edges[i].getNodeSource().getId() + " -- "
						+ edges[i].getNodeTarget().getId() + "\n";
				sifText = sifText + line;
			}
		}
	}
	return sifText;
};

DotFileDataAdapter.prototype._toSIF = function(dataset) {
	var sifText = "";
	for ( var vertexId in dataset.vertices) {
		var line = "";
		var vertex = dataset.getVertexById(vertexId);

		if ((vertex.getEdges().length == 0)) {
			line = vertex.getName() + "\n";
			sifText = sifText + line;
		} else {
			var edges = vertex.getEdgesOut();

			for ( var i = 0; i < edges.length; i++) {
				line = edges[i].getNodeSource().getName() + " -- "
						+ edges[i].getNodeTarget().getName() + "\n";
				sifText = sifText + line;
			}
		}
	}
	return sifText;
};

DotFileDataAdapter.prototype.toDOT = function(dataset) {
	var sifText = "graph network {\n";
	sifText = sifText + this._toSIF(dataset);
	return sifText + "}";
};

DotFileDataAdapter.prototype.toDOTID = function(dataset) {
	var sifText = "graph network {\n";
	sifText = sifText + this._toSIFID(dataset);
	return sifText + "}";
};

DotFileDataAdapter.prototype.nodeAttributesToJSON = function(text) {
	var format = text.replace("[", "");
	format = format.replace("];", "");
	
	while (format.indexOf(" ")!= -1){
		format = format.replace(" ", "·");
	}
	
	while (format.indexOf(",·")!= -1){
		format = format.replace(",·", " || ");
	}
	var pairs = format.split(" || ");
	var json = new Object();
	try{
		for ( var i = 0; i < pairs.length; i++) {
			var separator = pairs[i].split("=");
			if (separator.length != 2){
				//console.log("[Conflict separator]: " + separator + " Text: " + text);
				var previousSeparator = pairs[i-1].split("=")[0];
				json[previousSeparator] += separator[0];
			}else{
				while (separator[1].indexOf("·")!= -1){
					 separator[1] =  separator[1].replace("·", " ");
				}
				json[separator[0]] = separator[1];
			}
		}
	}
	catch(e){
		
		console.log("FATAL ERROR: " + e + " Text: " + text);
	}
	return json;
};

DotFileDataAdapter.prototype.parse = function(sifString) {
	var lineBreak = sifString.split("\n");
	this.parseLines(lineBreak);
};

DotFileDataAdapter.prototype.parseFromJSON = function(lines) {
	this.parseLines(lines);
};

DotFileDataAdapter.prototype.parseLines = function(lineBreak) {
	//var lineBreak = sifString.split("\n");
	var edgesText =  new Array();
	var graphText = new Array();
	var verticesText = new Object();
	var nodesSetupText = new Array();
	
	for ( var i = 0; i < lineBreak.length; i++) {
		var field = lineBreak[i].replace(/^\s+|\s+$/g, "");
		if ((field.indexOf("->") != -1 || field.indexOf("--") != -1)&&(field.indexOf("label") == -1)){
			var argsText = field.substr(field.indexOf("["), field.indexOf("];"));
			var fieldTrimmed = field.replace(argsText, "");
			var fields = fieldTrimmed.replace(/^\s+|\s+$/g, "").split(" ");
			
			
			var edge = new Object();
			edge["source"] = fields[0];
			edge["target"] = fields[2];

			if (field == ""){
				continue;
				}
			
			if ((field.indexOf("[")!= -1)&&(field.indexOf("];")==-1)){
				i++;
				var nextField = lineBreak[i].replace(/^\s+|\s+$/g, "");
				field = field + nextField;
				
				while(field.indexOf("];") == -1){
					i++;
					var nextField = lineBreak[i].replace(/^\s+|\s+$/g, "");
					field = field + nextField;
				}
			}
			
			var args = this.nodeAttributesToJSON(field.substr(field.indexOf("["), field.indexOf("];")));
			edge["args"] = args;
			edge["args"].type = fields[1];
			edgesText.push(edge);
			continue;
		}
		
		if (field.indexOf("graph") != -1){
				graphText.push(field);
				continue;
		}
			
		if ((field.indexOf("node") != -1)&&(field.indexOf("node [label=") != -1)){
			nodesSetupText.push(field);
			continue;
		}
		
		if (((field.indexOf("{") == -1)&& (field.indexOf("}") == -1))||(field.indexOf("label") != -1)) {
			if (field.length != 0){
				/** Hay lineas que acaban estilo: entity_33645 [label="Nef binds Rho-family GTPase Rac, its cofactor EL\ **/
				if ((field.indexOf("[")!= -1)&&(field.indexOf("];")==-1)){
					i++;
					var nextField = lineBreak[i].replace(/^\s+|\s+$/g, "");
					field = field + nextField;
					
					while(field.indexOf("];") == -1){
						i++;
						var nextField = lineBreak[i].replace(/^\s+|\s+$/g, "");
						field = field + nextField;
					}
				}
			
				

				/** Hay veces que las labes tienen: [label="17-hydroxypregnenolone + NAD+ => pregn-5-ene-3,20-dione-17-ol + NADH + H+", shape=box, pos.. **/
				var labelStart = field.indexOf("label=\"") ;
				var labelEnd = field.length;
			
				if (labelStart != -1){
						labelStart = labelStart + 7;
						for ( var j = labelStart; j < labelEnd; j++) {
							
							if(field[j] == "\""){
								var label = field.substr(labelStart, j - labelStart);
								labelEnd = j;
								
								if (label.indexOf("=") != -1){
									while (label.indexOf("=")!= -1){
										label =  label.replace("=", "-");
										var previousLabelContent = field.substr(labelStart,  j - labelStart);	
										field = field.replace(previousLabelContent, label);
										
									}
									continue;
									
								}
							}
						}
						
				}
				var	args = this.nodeAttributesToJSON(field.substr(field.indexOf("["), field.indexOf("];")));
				var entity = field.substr(0, field.indexOf("[")).replace(/^\s+|\s+$/g, "");
				verticesText[entity] = args;
			}
			continue;
		}
		
//		if (field.indexOf("}") != -1){
//			continue;
//		}
	}

	for ( var vertex in verticesText) {
		if ( this.dataset.getVertexByName(verticesText[vertex].label) == null){
			if (verticesText[vertex].label == undefined){
				verticesText[vertex].label = "";
			}
			this.dataset.addNode(verticesText[vertex].label, verticesText[vertex]);
		}
	}
	
	for ( var edge in edgesText) {
		var source = this.dataset.getVertexByName(verticesText[edgesText[edge].source].label);
		var target = this.dataset.getVertexByName(verticesText[edgesText[edge].target].label);
		this.dataset.addEdge(source.getId() + "_" + target.getId(), source.getId(), target.getId(),edgesText[edge].args);
		
	}
	for ( var vertex in this.dataset.vertices) {
		var label = this.dataset.getVertexById(vertex).getName();
		while (label.indexOf("\"")!= -1){
			label = label.replace("\"", "");
		}
		this.dataset.getVertexById(vertex).setName(label);
	}
};

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





FileDataAdapter.prototype.toJson = DataAdapter.prototype.toJSON;
FileDataAdapter.prototype.getDataset = DataAdapter.prototype.getDataset;


function FileDataAdapter(){
	DataAdapter.prototype.constructor.call(this);
	
	this.file = null;
	this.content = null;
	this.onRead = new Event(this);
};


FileDataAdapter.prototype.loadFromFile = function(file){
	//Not implemented yet. HTML5 reader to get the string of a file --> Ralonso rules!!
	this.file = file;
	var _this = this;
	 if(file){
		var  reader = new FileReader();
		reader.readAsText(file, "UTF-8");
		reader.onload = function(evt) {
			_this.loadFromContent(evt.target.result);
		};
	 }
};


FileDataAdapter.prototype.loadFromContent = function(content){
	this.content = content;
	this.parse(this.content);
	this.onRead.notify(this);
};

FileDataAdapter.prototype.read = function(file){
	//Not implemented yet. HTML5 reader to get the string of a file --> Ralonso rules!!
	var _this = this;
	 if(file){
		var  reader = new FileReader();
		reader.readAsText(file, "UTF-8");
		reader.onload = function(evt) {
			this.content =  evt.target.result;
			_this.onRead.notify(this);
		};
	 }
};


FileDataAdapter.prototype.parse = function(text){
	//here we parse the text
};









BEDFileDataAdapter.prototype.loadFromFile = FileDataAdapter.prototype.loadFromFile;
BEDFileDataAdapter.prototype.loadFromContent = FileDataAdapter.prototype.loadFromContent;
BEDFileDataAdapter.prototype.read = FileDataAdapter.prototype.read;
BEDFileDataAdapter.prototype.getDataset = FileDataAdapter.prototype.getDataset;


function BEDFileDataAdapter(){
	FileDataAdapter.prototype.constructor.call(this);
	
	this.dataset = null;
	this.content = null;
	
	this.lines = new Array();
};

BEDFileDataAdapter.prototype.getLines = function(content){
	return this.lines;
};


BEDFileDataAdapter.prototype.parse = function(content){
	this.content = content;
	var lineBreak = content.split("\n");
	var sifFieldsString  = new Array();
	for (var i = 0; i < lineBreak.length; i++){
		var trimmed = lineBreak[i].replace(/^\s+|\s+$/g,"");
		if ((trimmed != null)&&(trimmed.length > 0)){
			var field = trimmed.replace(/\s+/g,'**%**').split("**%**");
			if (field[0].substr(0,1) != "#"){
				this.lines.push(field);
			}
		}
	}
};GFFLocalRegionDataAdapter.prototype.toJSON = LocalRegionDataAdapter.prototype.toJSON;
GFFLocalRegionDataAdapter.prototype._getHashMapKey = LocalRegionDataAdapter.prototype._getHashMapKey;
GFFLocalRegionDataAdapter.prototype.isRegionAvalaible = LocalRegionDataAdapter.prototype.isRegionAvalaible;
GFFLocalRegionDataAdapter.prototype.fill = LocalRegionDataAdapter.prototype.fill;
GFFLocalRegionDataAdapter.prototype.getFinished = LocalRegionDataAdapter.prototype.getFinished;
GFFLocalRegionDataAdapter.prototype.anticipateRegionRetrieved  = LocalRegionDataAdapter.prototype.anticipateRegionRetrieved;
GFFLocalRegionDataAdapter.prototype.setIntervalView  = LocalRegionDataAdapter.prototype.setIntervalView;

function GFFLocalRegionDataAdapter(args){
	LocalRegionDataAdapter.prototype.constructor.call(this);
	this.resource = "gff";
};

GFFLocalRegionDataAdapter.prototype.getLabel = function(line){
	return  line[2];
};

GFFLocalRegionDataAdapter.prototype.loadFromFileDataAdapter = function(fileDataAdapter){
	for ( var i = 0; i < fileDataAdapter.lines.length; i++) {
		var chromosome = fileDataAdapter.lines[i][0].replace("chr", "");
		
		if (fileDataAdapter.lines[i][3] == 57649472 ){debugger;}
		//NAME  SOURCE  TYPE  START  END  SCORE  STRAND  FRAME  GROUP
		var feature = {
						"chromosome": chromosome, 
						"label": this.getLabel(fileDataAdapter.lines[i]) , 
						"start": parseFloat(fileDataAdapter.lines[i][3]), 
						"end": parseFloat(fileDataAdapter.lines[i][4]), 
						"score": parseFloat(fileDataAdapter.lines[i][5]),
						"strand": fileDataAdapter.lines[i][6] , 
						"frame": fileDataAdapter.lines[i][7],
						"group": fileDataAdapter.lines[i][8]
						} ;
		this.features.push(feature);
		if (this.featuresByChromosome[chromosome] == null){
			this.featuresByChromosome[chromosome] = new Array();
		}
		this.featuresByChromosome[chromosome].push(feature);
	}
};
BEDLocalRegionDataAdapter.prototype.toJSON = LocalRegionDataAdapter.prototype.toJSON;
BEDLocalRegionDataAdapter.prototype._getHashMapKey = LocalRegionDataAdapter.prototype._getHashMapKey;
BEDLocalRegionDataAdapter.prototype.isRegionAvalaible = LocalRegionDataAdapter.prototype.isRegionAvalaible;
BEDLocalRegionDataAdapter.prototype.fill = LocalRegionDataAdapter.prototype.fill;
BEDLocalRegionDataAdapter.prototype.getFinished = LocalRegionDataAdapter.prototype.getFinished;
BEDLocalRegionDataAdapter.prototype.anticipateRegionRetrieved  = LocalRegionDataAdapter.prototype.anticipateRegionRetrieved;
BEDLocalRegionDataAdapter.prototype.setIntervalView  = LocalRegionDataAdapter.prototype.setIntervalView;

function BEDLocalRegionDataAdapter(args){
	LocalRegionDataAdapter.prototype.constructor.call(this);
	this.resource = "bed";
};

BEDLocalRegionDataAdapter.prototype.loadFromFileDataAdapter = function(fileDataAdapter){
	for ( var i = 0; i < fileDataAdapter.lines.length; i++) {
		var chromosome = fileDataAdapter.lines[i][0].replace("chr", "");
		
		var feature = {
						"label":fileDataAdapter.lines[i][3],
						"chromosome": chromosome, 
						"start": parseFloat(fileDataAdapter.lines[i][1]), 
						"end": parseFloat(fileDataAdapter.lines[i][2]), 
						"score":fileDataAdapter.lines[i][4],
						"strand":fileDataAdapter.lines[i][5],
						"thickStart":fileDataAdapter.lines[i][6],
						"thickEnd":fileDataAdapter.lines[i][7],
						"itemRgb":fileDataAdapter.lines[i][8],
						"blockCount":fileDataAdapter.lines[i][9],
						"blockSizes":fileDataAdapter.lines[i][10],
						"blockStarts":fileDataAdapter.lines[i][11]
		} ;
		this.features.push(feature);
		if (this.featuresByChromosome[chromosome] == null){
			this.featuresByChromosome[chromosome] = new Array();
		}
		this.featuresByChromosome[chromosome].push(feature);
	}
};



RuleRegionDataAdapter.prototype.toJSON = DataAdapter.prototype.toJSON;

function RuleRegionDataAdapter(args){
	DataAdapter.prototype.constructor.call(this);
	this.resource = "rule";
	this.lockSuccessEventNotify = false;
	
	/** DataSet hashMaps **/
	this.datasets = new Object();
	this.autoFill = true;
	
	/** Parametros compartidos con el track **/
	this.pixelRatio = 0.000005;
	this.space = 100;
	this.maxChromosomeSize = 260000000;
	
	if (args != null){
		if (args.autoFill != null){
			this.autoFill = args.autoFill;
		}
		if (args.pixelRatio != null){
			this.pixelRatio = args.pixelRatio;
		}
		
	}
	
	this.dataset = new DataSet();
	this.resource = "rule";
	this.ratio = this.space / this.pixelRatio; 
	
	/** Events **/
	this.preloadSuccess = new Event(this);
	this.successed = new Event();
	
	this.preloadSuccess = new Event(this);
};

RuleRegionDataAdapter.prototype._getHashMapKey = function(chromosome, start, end){
	return chromosome + "-" + start + "-" + end;
};


RuleRegionDataAdapter.prototype.isRegionAvalaible = function(chromosome, start, end){
	return this.datasets[this._getHashMapKey(chromosome, start, end)] != null;
};

RuleRegionDataAdapter.prototype._getFeaturesFromRegion = function(start, end){
	var features = new Array();

	for (var i = start ; i < end ; i = parseFloat(i) + parseFloat(this.ratio) ){
			if ((i >=0)&&(i<this.maxChromosomeSize)){
			
				
				for ( var j = 2; j < 9; j = j + 2) {
					var start = parseFloat(i) + parseFloat(j* this.ratio/10);
					features.push({"start":  start, "end": i + start, "label":false});
				}
				if (Math.ceil(this.pixelRatio) == 1){
					i = Math.ceil(i/1000) * 1000;
				}
				features.push({"start":  i, "end": i, "label":true});
				
			}
	}
	return features;
};


RuleRegionDataAdapter.prototype.fill = function(chromosome, start, end, resource, callbackFunction){
	var _this = this;
	this.resource = resource;
	if ((chromosome == null)|| (start == null) || (end == null)){
		throw "Missing value in a not optional parameter: chromosome, start or end";
	}
	else{
		if (!this.isRegionAvalaible(chromosome, start, end)){
					var result = new Array();
					var data = new Array();
					result = this._getFeaturesFromRegion(start, end);
					data.push(result);
					
					if (!_this.lockSuccessEventNotify){
						_this.getFinished(data, chromosome, start, end);
					}
					else{
						_this.anticipateRegionRetrieved(data, chromosome, start, end);
					}
		}
		else{
			this.lockSuccessEventNotify = false;
			
		}
	}
};

RuleRegionDataAdapter.prototype.getFinished = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = this.dataset;
	this.successed.notify();
};

RuleRegionDataAdapter.prototype.anticipateRegionRetrieved = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = data;
	this.lockSuccessEventNotify = false;
	this.preloadSuccess.notify();
};


RuleRegionDataAdapter.prototype.setIntervalView = function(chromosome,  middleView){
	if (this.autoFill && !this.lockSuccessEventNotify){
		for ( var iterable_element in this.datasets) {
			var id = (iterable_element.split("-"));
			var start = id[1];
			var end = id[2];
			
			if ((start < middleView) && (middleView < end)){
				
				var window = end - start;
				var quarter = window/3;
			
				if (( (start -1) < 0 ) || ((parseFloat(end) + 1) > this.maxChromosomeSize ))
				{
					return;
				}

				if ((middleView - start) < quarter){
					this.lockSuccessEventNotify = true;
					var newStart = parseFloat(parseFloat(start) - parseFloat(window));
					this.fill(chromosome, newStart, start , this.resource);
					return;
				}
				
				if ((end - middleView) < quarter){
					this.lockSuccessEventNotify = true;
					var newEnd = parseFloat(parseFloat(end) + parseFloat(window));
					this.fill(chromosome, end, newEnd , this.resource);
					return;
				}
			}
			
		}
	}
};



VCFLocalRegionDataAdapter.prototype.toJSON = LocalRegionDataAdapter.prototype.toJSON;
VCFLocalRegionDataAdapter.prototype._getHashMapKey = LocalRegionDataAdapter.prototype._getHashMapKey;
VCFLocalRegionDataAdapter.prototype.isRegionAvalaible = LocalRegionDataAdapter.prototype.isRegionAvalaible;
VCFLocalRegionDataAdapter.prototype.fill = LocalRegionDataAdapter.prototype.fill;
VCFLocalRegionDataAdapter.prototype.getFinished = LocalRegionDataAdapter.prototype.getFinished;
VCFLocalRegionDataAdapter.prototype.anticipateRegionRetrieved  = LocalRegionDataAdapter.prototype.anticipateRegionRetrieved;
VCFLocalRegionDataAdapter.prototype.setIntervalView  = LocalRegionDataAdapter.prototype.setIntervalView;
 

function VCFLocalRegionDataAdapter(args){
	LocalRegionDataAdapter.prototype.constructor.call(this);
	this.resource = "vcf";
	this.qualitycontrol = new Object();
};

VCFLocalRegionDataAdapter.prototype.getLabel = function(line){
	return  line[2] + " " +line[3] + "/" + line[4] + " Q:" + line[5];
};

VCFLocalRegionDataAdapter.prototype.addQualityControl = function(quality){
	var range = (Math.ceil(quality/1000) - 1)*1000;
	if (this.qualitycontrol[range] == null){
		this.qualitycontrol[range] = 1;
	}
	else{
		this.qualitycontrol[range] = this.qualitycontrol[range] + 1;
	}
};

VCFLocalRegionDataAdapter.prototype.loadFromFileDataAdapter = function(fileDataAdapter){
	for ( var i = 0; i < fileDataAdapter.lines.length; i++) {
		this.addQualityControl(fileDataAdapter.lines[i][5]);
		
		var feature = {
					
					"id":  fileDataAdapter.lines[i][2],
					"chromosome": fileDataAdapter.lines[i][0],
					"start": parseFloat(fileDataAdapter.lines[i][1]), 
					"end": parseFloat(fileDataAdapter.lines[i][1]) + 1, 
					"ref": (fileDataAdapter.lines[i][3]), 
					"alt": (fileDataAdapter.lines[i][4]), 
					"quality": (fileDataAdapter.lines[i][5]), 
					"filter": (fileDataAdapter.lines[i][6]), 
					"info": (fileDataAdapter.lines[i][7]), 
					"format": (fileDataAdapter.lines[i][8]), 
					"all": (fileDataAdapter.lines[i]),
					"label": this.getLabel(fileDataAdapter.lines[i])
					
		} ;
		this.features.push(feature);
		if (this.featuresByChromosome[fileDataAdapter.lines[i][0]] == null){
			this.featuresByChromosome[fileDataAdapter.lines[i][0]] = new Array();
		}
		this.featuresByChromosome[fileDataAdapter.lines[i][0]].push(feature);
	}
};



DasRegionDataAdapter.prototype.toJSON = DataAdapter.prototype.toJSON;


function DasRegionDataAdapter(args){
	DataAdapter.prototype.constructor.call(this);
	

	/** DataSet hashMaps **/
	this.datasets = new Object();
	this.autoFill = true;
	
	if (args != null){
		if (args.autoFill != null){
			this.autoFill = args.autoFill;
		}
		if (args.url != null){
			this.url = args.url;
		}
		
	}
	
	this.features = new Array();
	this.xml = null;
	
	this.dataset = new DataSet();
	this.resource = "das";
	
	
//	/** Optimizadores **/
//	this.featuresByChromosome = new Object();
	
	/** Events **/
	this.preloadSuccess = new Event(this);
	this.successed = new Event();
	this.onError = new Event();
};

//DasRegionDataAdapter.prototype.getLabel = function(line){
//	return  line[2] + " " +line[3] + "/" + line[4] + " Q:" + line[1];
//};
//DasRegionDataAdapter.prototype.loadFromVCFFileDataAdapter = function(fileDataAdapter){
//	
//	for ( var i = 0; i < fileDataAdapter.lines.length; i++) {
//		var feature = {"chromosome": fileDataAdapter.lines[i][0], "start": parseFloat(fileDataAdapter.lines[i][1]), "end": parseFloat(fileDataAdapter.lines[i][1]) + 1, "label": this.getLabel(fileDataAdapter.lines[i])} ;
//		this.features.push(feature);
//		if (this.featuresByChromosome[fileDataAdapter.lines[i][0]] == null){
//			this.featuresByChromosome[fileDataAdapter.lines[i][0]] = new Array();
//		}
//		this.featuresByChromosome[fileDataAdapter.lines[i][0]].push(feature);
//	}
//};

DasRegionDataAdapter.prototype._getHashMapKey = function(chromosome, start, end){
	return chromosome + "-" + start + "-" + end;
};

DasRegionDataAdapter.prototype.isRegionAvalaible = function(chromosome, start, end){
	return this.datasets[this._getHashMapKey(chromosome, start, end)] != null;
};

DasRegionDataAdapter.prototype.fill = function(chromosome, start, end, callbackFunction){
	var _this = this;
	if ((chromosome == null)|| (start == null) || (end == null)){
		throw "Missing value in a not optional parameter: chromosome, start or end";
	}
	else{
		var fullURL = this.url + "?segment=" + chromosome + ":" + start + "," + end; 
		if (!this.isRegionAvalaible(chromosome, start, end)){
			
				$.ajax({
					  url: fullURL,
					  type: 'GET',
					  dataType:"xml",
					  error: function(){
							alert("error");
							_this.onError.notify("It is not allowed by Access-Control-Allow-Origin " );
					  },
					  
					  success: function(data){
						  
						  		try{
								_this.xml =   (new XMLSerializer()).serializeToString(data);
								var xmlStringified =  (new XMLSerializer()).serializeToString(data); //data.childNodes[2].nodeValue;
								var data = xml2json.parser(xmlStringified);
								var result = new Array();
								if (data.dasgff.gff.segment.feature != null){
									for ( var i = 0; i < array.length; i++) {
										data.dasgff.gff.segment.feature[i]["chromosome"] = chromosome;
									}
									result.push(data.dasgff.gff.segment.feature);
								}
								else{
									result.push([]);
								}
					
					
								/** Esto funciona **/
//								console.log("Con jquery");
//								console.log(new Date())
//								var result = new Array();
								//result.push($.xmlToJSON(data).GFF[0].SEGMENT[0].FEATURE);
//								console.log(new Date())
//								console.log(result)
								
								if (!_this.lockSuccessEventNotify){
									_this.getFinished(result, chromosome, start, end);
								}
								else{
									_this.anticipateRegionRetrieved(result, chromosome, start, end);
								}
						  		}
						  		catch(e){
						  			alert("There was a problem parsing the xml: " + e);
						  			console.log(data);
						  			
						  		}
					  }
					});
				
		}else{
				this.lockSuccessEventNotify = false;
				return this.datasets[this._getHashMapKey(chromosome, start, end)];
		}
	}
	
};

DasRegionDataAdapter.prototype.getFinished = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = this.dataset;
	this.successed.notify();
};

DasRegionDataAdapter.prototype.anticipateRegionRetrieved = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = data;
	this.lockSuccessEventNotify = false;
	this.preloadSuccess.notify();
};


DasRegionDataAdapter.prototype.setIntervalView = function(chromosome,  middleView){
	if (this.autoFill && !this.lockSuccessEventNotify){
		for ( var iterable_element in this.datasets) {
			var id = (iterable_element.split("-"));
			var chromosome = id[0];
			var start = id[1];
			var end = id[2];
			
			if ((start < middleView) && (middleView < end)){
				var tier = (end - start)/3;
				
				if (end - middleView <= tier){
					this.lockSuccessEventNotify = true;
					var newEnd = parseInt(end) + parseInt(end -start);
					this.fill(chromosome, end, newEnd , this.resource);
					return;
				}
				
				if(middleView - start <= tier){
					this.lockSuccessEventNotify = true;
					var newstart = parseInt(start) - parseInt(end -start);
					this.fill(chromosome, newstart, start, this.resource);
					return;
					
				}
				
			}
			
			
		}
	}
};




function DataAdapter(){
	this.dataset = new DataSet();
	this.internalId = Math.round(Math.random()*10000000); // internal id for this class
};


DataAdapter.prototype.toJSON = function(){
	return this.dataset.toJSON();
};

DataAdapter.prototype.getDataset = function(){
	return this.dataset;
};
LocalRegionDataAdapter.prototype.toJSON = DataAdapter.prototype.toJSON;


function LocalRegionDataAdapter(args){
	DataAdapter.prototype.constructor.call(this);
	
	/** DataSet hashMaps **/
	this.datasets = new Object();
	this.autoFill = true;
	
	if (args != null){
		if (args.autoFill != null){
			this.autoFill = args.autoFill;
		}
		
	}
	this.features = new Array();
	this.dataset = new DataSet();
	this.resource = "bed";
	
	/** Optimizadores **/
	this.featuresByChromosome = new Object();
	
	/** Flag loaded from features **/
	this.loadedFromFeatures = false;
	
	/** Events **/
	this.preloadSuccess = new Event(this);
	this.successed = new Event();
};

LocalRegionDataAdapter.prototype.loadFromFeatures = function(features){
	
	for ( var i = 0; i < features.length; i++) {
		var feature = features[i];
		if ((feature.chromosome != null)&&(feature.start != null)&&(feature.end != null)){
			var chromosome = feature.chromosome;
			var formatter = new GenericFeatureFormatter(features[i]);
			this.features.push(chromosome);
			if (this.featuresByChromosome[chromosome] == null){
				this.featuresByChromosome[chromosome] = new Array();
			}
			this.featuresByChromosome[chromosome].push(formatter);
		}
	}
	this.loadedFromFeatures = true;
};

LocalRegionDataAdapter.prototype._getHashMapKey = function(chromosome, start, end){
	return chromosome + "-" + start + "-" + end;
};

LocalRegionDataAdapter.prototype.isRegionAvalaible = function(chromosome, start, end){
	return this.datasets[this._getHashMapKey(chromosome, start, end)] != null;
};

LocalRegionDataAdapter.prototype.fill = function(chromosome, start, end, callbackFunction){
	var _this = this;
	if ((chromosome == null)|| (start == null) || (end == null)){
		throw "Missing value in a not optional parameter: chromosome, start or end";
	}
	else{
		if (!this.isRegionAvalaible(chromosome, start, end)){
				
				var retrieved = new Array();
				var data = new Array();
			
				if(this.featuresByChromosome[chromosome] != null){
					for ( var i = 0; i < this.featuresByChromosome[chromosome].length; i++) {
						if ((this.featuresByChromosome[chromosome][i].start <  parseFloat(end))&&(this.featuresByChromosome[chromosome][i].end > parseFloat(start))){
							data.push(this.featuresByChromosome[chromosome][i]);
						}
					}
				}
				
					if (this.loadedFromFeatures){ 
						retrieved = data;
					}
					else{
						retrieved[0] = data;
					}
					
					if (!_this.lockSuccessEventNotify){
						_this.getFinished(retrieved, chromosome, start, end);
					}
					else{
						_this.anticipateRegionRetrieved(retrieved, chromosome, start, end);
					}
		}else{
				this.lockSuccessEventNotify = false;
		}
	}
	
};

LocalRegionDataAdapter.prototype.getFinished = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = this.dataset;
	this.successed.notify();
};

LocalRegionDataAdapter.prototype.anticipateRegionRetrieved = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = data;
	this.lockSuccessEventNotify = false;
	this.preloadSuccess.notify();
};


LocalRegionDataAdapter.prototype.setIntervalView = function(chromosome,  middleView){
	if (this.autoFill && !this.lockSuccessEventNotify){
		for ( var iterable_element in this.datasets) {
			var id = (iterable_element.split("-"));
			var chromosome = id[0];
			var start = id[1];
			var end = id[2];
			
			if ((start < middleView) && (middleView < end)){
				var tier = (end - start)/3;
				
				if (end - middleView <= tier){
					this.lockSuccessEventNotify = true;
					var newEnd = parseInt(end) + parseInt(end -start);
					this.fill(chromosome, end, newEnd , this.resource);
					return;
				}
				
				if(middleView - start <= tier){
					this.lockSuccessEventNotify = true;
					var newstart = parseInt(start) - parseInt(end -start);
					this.fill(chromosome, newstart, start, this.resource);
					return;
					
				}
				
			}
			
			
		}
	}
};



function DataSet(){
	this.json = null;
};


DataSet.prototype.loadFromJSON = function(json){
	if(json != null) {
		if(this.validate(json)) {
			this.json = json;
		}
	}
};


DataSet.prototype.toJSON = function(json){
	return this.json;
};


/** Abstract method to be override on childs classes **/
DataSet.prototype.validate = function(json){
	if (true){
		return true;
	}
	/*else{
		throw "Data validation failed";
	}*/
};



function FeatureDataSet(){
	DataSet.prototype.constructor.call(this);
};

FeatureDataSet.prototype.loadFromJSON = DataSet.prototype.loadFromJSON;
FeatureDataSet.prototype.loadFromFile = DataSet.prototype.loadFromFile;
FeatureDataSet.prototype.loadFromURL  = DataSet.prototype.loadFromURL;
FeatureDataSet.prototype.toJSON  = 	    DataSet.prototype.toJSON;

FeatureDataSet.prototype.validate = function(json){
//	var objects = json[0];
//	for (var i = 0; i < objects.length; i++){
//		if (objects[i].chromosome == null){
//			throw "Data can not be validated because record "+ i + " has not chromosome";
//		}
//		if (objects[i].start == null){
//			throw "Data can not be validated because record "+ i + " has not start";
//		}
//		if (objects[i].end == null){
//			throw "Data can not be validated because record "+ i + " has not end";
//		}
//	}
	return true;
};

//function GeneFeatureDataSet(){
//	FeatureDataAdapter.prototype.constructor.call(this);
//};
//
//GeneFeatureDataSet.prototype = 			    FeatureDataAdapter;
//GeneFeatureDataSet.prototype.constructor=   FeatureDataAdapter;
//GeneFeatureDataSet.prototype.loadFromJSON = FeatureDataAdapter.prototype.loadFromJSON;
//GeneFeatureDataSet.prototype.loadFromFile = FeatureDataAdapter.prototype.loadFromFile;
//GeneFeatureDataSet.prototype.loadFromURL  = FeatureDataAdapter.prototype.loadFromURL;
//GeneFeatureDataSet.prototype.toJSON  = 	    FeatureDataAdapter.prototype.toJSON;
//GeneFeatureDataSet.prototype.validate  =    FeatureDataAdapter.prototype.validate;
//

function ExpressionMatrixDataSet(){
	DataSet.prototype.constructor.call(this);

	
	this.normalizedRows = new Object();
	this.colorRows = new Object();
	this.classesName = null;
	this._classMaxInterval = new Object();
	this._classMinInterval = new Object();
	
	/** Original not modified json **/
	this._json = null;
	
	/** Optional parameters **/
	this.groupByClass = true;
	
};

//ExpressionMatrixDataSet.prototype.loadFromJSON =    DataSet.prototype.loadFromJSON;
ExpressionMatrixDataSet.prototype.toJSON  = 	    DataSet.prototype.toJSON;

ExpressionMatrixDataSet.prototype.loadFromJSON = function(json){
	if (this.validate(json)){
		this.json = json;
		this._json = JSON.parse(JSON.stringify(json));
		this.init();
	}
};

ExpressionMatrixDataSet.prototype.getRowNameByStatisticValue = function(statisticName, lower, bigger){
	var indexes = this.getRowIndexByStatisticValue(statisticName, lower, bigger);
	var rowNames = this.getRowNames();
	
	var rowSelectedName = new Array();
	for ( var i = 0; i < indexes.length; i++) {
		rowSelectedName.push(rowNames[indexes[i]]);
	}
	return rowSelectedName;
	
};

ExpressionMatrixDataSet.prototype.getRowIndexByStatisticValue = function(statisticName, lower, bigger){
	var statisticNames = this.getStatisticNames();
	for ( var i = 0; i < statisticNames.length; i++) {
		if (statisticNames[i]==statisticName){
			var rowIndex = new Array();
			
			var statisticMatrix = this.getStatisticMatrix();
			for ( var j = 0; j < statisticMatrix.length; j++) {
				
				if ((statisticMatrix[j][i]>=lower)&&(statisticMatrix[j][i]<=bigger)){
					rowIndex.push(j);
					
				}
				
			}
			return rowIndex;
		}
	}
};


/*
ExpressionMatrixDataSet.prototype.groupByClasses = function(){
	var classesName = this.getClassesName();
	
	var hashTable = new Object();
	//Inserted in a hashmap
	for ( var i = 0; i < classesName.length; i++) {
		hashTable[classesName[i]] = classesName[i];
	}
	
	console.log(hashTable);
	console.log(classesName);
	
};
*/

ExpressionMatrixDataSet.prototype.init = function(){
	/** Global parameteres **/
	this.normalizedRows = new Object();
	this.colorRows = new Object();
	this.classesName = null;
	this._classMaxInterval = new Object();
	this._classMinInterval = new Object();
	
	/** Normalizing and getting colors **/
	this.normalizeMatrix();
};

ExpressionMatrixDataSet.prototype.validate = function(json){
	return true;
};

ExpressionMatrixDataSet.prototype.getStatisticNames = function(){
	return this.json.statisticMatrix.columnNames;
};

ExpressionMatrixDataSet.prototype.getStatisticMatrix = function(){
	return this.json.statisticMatrix.matrix;
};


ExpressionMatrixDataSet.prototype.getRowNames = function(){
	return this.json.dataMatrix.rowNames;
};

ExpressionMatrixDataSet.prototype.getColumnNames = function(){
	return this.json.dataMatrix.columnNames;
};

ExpressionMatrixDataSet.prototype.getMatrix = function(){
	return this.json.dataMatrix.matrix;
};

ExpressionMatrixDataSet.prototype.getClasses = function(){
	return this.json.classNames;
};

ExpressionMatrixDataSet.prototype.getClassesName = function(){
	if (this.classesName == null){
			var classes = this.getClasses();
			var aux = new Array();
			aux.push(classes[0]);
			this._classMinInterval[0] = 0;
			
			for ( var i = 1; i < classes.length; i++) {
				if (classes[i]!=aux[aux.length-1]){
					aux.push(classes[i]);
					this._classMaxInterval[aux.length-2] = i-1;
					this._classMinInterval[aux.length-1] = i;
				}
			}
			//Insertamos la ultima columna de la ultima clase
			this._classMaxInterval[aux.length - 1] = classes.length - 1;
			this.classesName = aux;
	}
	return this.classesName;
};

ExpressionMatrixDataSet.prototype.getClassIntervalByIndex = function(classNameIndex){
	if (this.classesName == null){
		this.classesName = this.getClassesName();
	}
	return [this._classMinInterval[classNameIndex ], this._classMaxInterval[classNameIndex]]; 
};

ExpressionMatrixDataSet.prototype.normalizeMatrix = function(){
	for ( var i = 0; i < this.getRowNames().length; i++) {
		this.normalizedRows[i] = this.normalizedRow(i);
		this.colorRows[i] = this.getColorRow(i);
		this.classesName = this.getClassesName();
	}
};

ExpressionMatrixDataSet.prototype.normalizedRow = function(rowIndex){
	if (this.normalizedRows[rowIndex] == null){
		this.normalizedRows[rowIndex] = Normalizer.normalizeArray(this.getMatrix()[rowIndex]);
	}
	return this.normalizedRows[rowIndex];
};

ExpressionMatrixDataSet.prototype.getNormalizedData = function(rowIndex, columnIndex){
	return this.normalizedRow([rowIndex])[columnIndex];
};

ExpressionMatrixDataSet.prototype.getColorRow = function(rowIndex){
	if (this.colorRows[rowIndex] == null){
		this.colorRows[rowIndex] = Colors.getHexStringByScoreArrayValue(this.normalizedRow(rowIndex));
	}
	return this.colorRows[rowIndex];
};

ExpressionMatrixDataSet.prototype.getColor = function(rowIndex, columnIndex){
	return this.getColorRow(rowIndex)[columnIndex];
};

ExpressionMatrixDataSet.prototype.getClassesRange = function(){
	var classes = this.getClasses();

};






function SNPFeatureDataSet(){
	FeatureDataSet.prototype.constructor.call(this);
};

SNPFeatureDataSet.prototype = 			   FeatureDataSet;
SNPFeatureDataSet.prototype.constructor=   FeatureDataSet;
SNPFeatureDataSet.prototype.loadFromJSON = FeatureDataSet.prototype.loadFromJSON;
SNPFeatureDataSet.prototype.loadFromFile = FeatureDataSet.prototype.loadFromFile;
SNPFeatureDataSet.prototype.loadFromURL  = FeatureDataSet.prototype.loadFromURL;
SNPFeatureDataSet.prototype.toJSON  = 	   FeatureDataSet.prototype.toJSON;

SNPFeatureDataSet.prototype.validate = function(json){
	
	var objects = json[0];
	for (var i = 0; i < objects.length; i++){
		if (objects[i].chromosome == null){
			throw "Data can not be validated because record "+ i + " has not chromosome";
		}
		if (objects[i].start == null){
			throw "Data can not be validated because record "+ i + " has not start";
		}
		if (objects[i].end == null){
			throw "Data can not be validated because record "+ i + " has not end";
		}
	}
	return true;
	
};
CellBaseDataAdapter.prototype.toJSON = DataAdapter.prototype.toJSON;


function CellBaseDataAdapter(species){
//	console.log(species);
	DataAdapter.prototype.constructor.call(this);
	this.cellBaseManager = new CellBaseManager(species);
	this.successed = new Event();
	
};


CellBaseDataAdapter.prototype.getVersion = function(){
	return this.cellBaseManager.getVersion();
};


CellBaseDataAdapter.prototype.getSpecies = function(){
	return this.cellBaseManager.getSpecies();
};

CellBaseDataAdapter.prototype.setVersion = function(version){
	this.cellBaseManager.setVersion(version);
};

CellBaseDataAdapter.prototype.setSpecies = function(specie){
	this.cellBaseManager.setSpecies(specie);
};


CellBaseDataAdapter.prototype.fill = function(category, subcategory, query, resource, callbackFunction){
	this.cellBaseManager.get(category, subcategory, query, resource);
	var _this = this;
	this.cellBaseManager.successed.addEventListener(function (evt, data){
		_this.getFinished(data);
	});
};


CellBaseDataAdapter.prototype.getFinished = function(data){
	this.dataset.loadFromJSON(data);
	this.successed.notify();
};

CellBaseDataAdapter.prototype.arrayToString = function(array, separator){
	var str = new StringBuffer();
	for(var i = 0; i < array.length; i++){
		if(i != array.length-1)
			str.append(array[i]+separator);
		else
			str.append(array[i]);
	}
	return str.toString();
};











RegionCellBaseDataAdapter.prototype.setVersion = CellBaseDataAdapter.prototype.setVersion;
RegionCellBaseDataAdapter.prototype.setSpecies = CellBaseDataAdapter.prototype.setSpecies;
RegionCellBaseDataAdapter.prototype.toJSON = CellBaseDataAdapter.prototype.toJSON;

function RegionCellBaseDataAdapter(species, args){
	CellBaseDataAdapter.prototype.constructor.call(this, species);
	this.dataset = new FeatureDataSet();
	this.category = "genomic";
	this.subcategory = "region";
	this.resource = null;
	this.lockSuccessEventNotify = false;
	
	this.checkDuplicates = false;
	/** DataSet hashMaps **/
	this.datasets = new Object();
	this.autoFill = true;
	
	if (args != null){
		if (args.autoFill != null){
			this.autoFill = args.autoFill;
		}
		
//		if (args.checkDuplicates != null){
//			this.checkDuplicates = args.checkDuplicates;
//		}
		
		if (args.resource != null){
			this.resource = args.resource;
		}
	}
	this.preloadSuccess = new Event(this);
};

RegionCellBaseDataAdapter.prototype._getHashMapKey = function(chromosome, start, end){
	return chromosome + "-" + start + "-" + end;
//	return start;
};

RegionCellBaseDataAdapter.prototype.isRegionAvalaible = function(chromosome, start, end){
	return this.datasets[this._getHashMapKey(chromosome, start, end)] != null;
};

RegionCellBaseDataAdapter.prototype.fill = function(chromosome, start, end, resource, callbackFunction){
	var _this = this;
	this.resource = resource;
	if ((chromosome == null)|| (start == null) || (end == null)){
		throw "Missing value in a not optional parameter: chromosome, start or end";
	}
		if (!this.isRegionAvalaible(chromosome, start, end)){
//				console.log("Recovering " + resource+"  from server: " + chromosome + ":" + start + "-" + end);
				this.cellBaseManager.successed = new Event(this);
				this.cellBaseManager.successed.addEventListener(function (evt, data){
					if (!_this.lockSuccessEventNotify){
						_this.getFinished(data, chromosome, start, end);
					}
					else{
						_this.anticipateRegionRetrieved(data, chromosome, start, end);
					}
				});
				this.cellBaseManager.get(this.category, this.subcategory, chromosome + ":" + Math.ceil(start) + "-" + Math.ceil(end), resource);
		}else{
//				console.log("No need to go to the server: " + chromosome + ":" + start + "-" + end);
				this.lockSuccessEventNotify = false;
//				return this.datasets[this._getHashMapKey(chromosome, start, end)];
		}
};

RegionCellBaseDataAdapter.prototype.getFinished = function(data, chromosome, start, end){
//	debugger
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = this.dataset;
	this.successed.notify();
};

RegionCellBaseDataAdapter.prototype.anticipateRegionRetrieved = function(data, chromosome, start, end){
	
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = data;
	this.lockSuccessEventNotify = false;
	this.preloadSuccess.notify();
};


RegionCellBaseDataAdapter.prototype.getFeaturesByPosition = function(position){
	var features =  new Array();
	var featuresKey = new Object();
	for (var dataset in this.datasets){
		var features = this.datasets[dataset].toJSON();
		for ( var g = 0; g < features.length; g++) {
			var feature = features[g];
			
			if ((feature.start <= position)&&(feature.end >= position)&&(featuresKey[feature.id]==null)){
				features.push(feature);
				featuresKey[feature.id] = true;
			}
		}
	}
	console.log(features.length);
	return features;
};


RegionCellBaseDataAdapter.prototype.setIntervalView = function(chromosome,  middleView){
	if (this.autoFill && !this.lockSuccessEventNotify){
		for ( var iterable_element in this.datasets) {
			var id = (iterable_element.split("-"));
			var chromosome = id[0];
			var start = id[1];
			var end = id[2];
			
			if ((start < middleView) && (middleView < end)){
				var tier = (end - start)/3;
				
				if (end - middleView <= tier){
					this.lockSuccessEventNotify = true;
					var newEnd = parseInt(end) + parseInt(end -start);
					this.fill(chromosome, end, newEnd , this.resource);
					return;
				}
				
				if(middleView - start <= tier){
					this.lockSuccessEventNotify = true;
					var newstart = parseInt(start) - parseInt(end -start);
					if (newstart < 0){ newstart = 1;}
					this.fill(chromosome, newstart, start, this.resource);
					return;
					
				}
				
			}
			
			
		}
	}
};



GeneRegionCellBaseDataAdapter.prototype.setVersion = RegionCellBaseDataAdapter.prototype.setVersion;
GeneRegionCellBaseDataAdapter.prototype.setSpecies = RegionCellBaseDataAdapter.prototype.setSpecies;
GeneRegionCellBaseDataAdapter.prototype.toJSON = RegionCellBaseDataAdapter.prototype.toJSON;
//GeneRegionCellBaseDataAdapter.prototype.anticipateRegionRetrieved = RegionCellBaseDataAdapter.prototype.anticipateRegionRetrieved;
GeneRegionCellBaseDataAdapter.prototype.setIntervalView = RegionCellBaseDataAdapter.prototype.setIntervalView;
GeneRegionCellBaseDataAdapter.prototype.getFinished = RegionCellBaseDataAdapter.prototype.getFinished;		
GeneRegionCellBaseDataAdapter.prototype._getHashMapKey = RegionCellBaseDataAdapter.prototype._getHashMapKey;
GeneRegionCellBaseDataAdapter.prototype.isRegionAvalaible = RegionCellBaseDataAdapter.prototype.isRegionAvalaible;

function GeneRegionCellBaseDataAdapter(species,args){
//	console.log(species);
	this.species = species;
	this.geneDataAdapter = new CellBaseManager(this.species);
	this.transcriptDataAdapter = null;//new CellBaseManager();
	this.exonDataAdapter = null;//new CellBaseManager();
	this.dataset = new FeatureDataSet();
	
	// 3 nothing retrieved yet and 0 everything retrieved lauch the event
	this.done = 3;
	this.geneData = null;
	
	
	this.obtainTranscripts = true;
	
	/** DataSet hashMaps **/
	this.datasets = new Object();
	this.autoFill = true;
	
	if (args != null){
		if (args.autoFill != null){
			this.autoFill = args.autoFill;
		}
		if (args.obtainTranscripts != null){
			this.obtainTranscripts = args.obtainTranscripts;
		}
	}
	
	this.lockSuccessEventNotify = false;
	this.preloadSuccess = new Event(this);
	this.successed = new Event();
};

GeneRegionCellBaseDataAdapter.prototype.partialRetrieveDone = function(type, data){
	this.done --;
	
	if (type == "transcript"){
		for ( var i = 0; i < this.geneData.length; i++) {
			this.geneData[i].transcript = new Array();
			this.geneData[i].transcript = data[i];
		}
	}

};


GeneRegionCellBaseDataAdapter.prototype.fill = function(chromosome, start, end, callbackFunction){
		var _this = this;
		this.chromosome = chromosome;
		start = Math.ceil(start);
		end = Math.ceil(end);
		this.start = start;
		this.end = end;

		this.geneDataAdapter = new CellBaseManager(this.species);
		
		if (!this.isRegionAvalaible(chromosome, start, end)){
					this.geneDataAdapter.successed = new Event(this);
					this.geneDataAdapter.successed.addEventListener(function (evt, data){
							_this.retrievedGene(data, chromosome, start, end);
					});
			
					this.geneDataAdapter.get("genomic", "region", chromosome + ":" + start + "-" + end, "gene");
			}
			else{
				this.lockSuccessEventNotify = false;
			}
};

GeneRegionCellBaseDataAdapter.prototype.retrieveExonInformation = function(query){
		this.exonDataAdapter = new CellBaseManager(this.species);
		var _this = this;
		
		if (query.length == 0) {
			if (!_this.lockSuccessEventNotify){
				_this.getFinished({}, this.chromosome, this.start, this.end );
			}
			else{
				_this.anticipateRegionRetrieved({},this.chromosome, this.start, this.end );
			}
			return;
		}
		
		this.exonDataAdapter.successed.addEventListener(function (evt, data){
				var index = 0;
				for ( var i = 0; i < _this.transcriptData.length; i++) {
					for ( var j = 0; j < _this.transcriptData[i].length; j++) {
						_this.transcriptData[i][j].exon = data[index];
						index ++;
					}
				}
				for ( var i = 0; i < _this.geneData.length; i++) {
					_this.geneData[i].transcript = _this.transcriptData[i];
				}
				if (!_this.lockSuccessEventNotify){
					_this.getFinished(_this.geneData, _this.chromosome, _this.start, _this.end );
				}
				else{
					_this.anticipateRegionRetrieved(_this.geneData,_this.chromosome, _this.start, _this.end );
				}
		});
		this.exonDataAdapter.get("feature", "transcript", query, "exon");
};

GeneRegionCellBaseDataAdapter.prototype.retrieveTranscriptInformation = function(query){
	this.transcriptDataAdapter = new CellBaseManager(this.species);
	
	var _this = this;
	if (query.length == 0) {
		_this.retrieveExonInformation(query);
		return;
	}
	
	this.transcriptDataAdapter.successed.addEventListener(function (evt, data){
		_this.transcriptData = data[0];
		for ( var i = 0; i < _this.geneData.length; i++) {
			_this.geneData[i].transcript = _this.transcriptData[i];
		}
		
		var query = "";
		var tCount = 0;
		
		for ( var i = 0; i < _this.geneData.length; i++) {
			if (_this.geneData[i].transcript != null){
				for ( var j = 0; j < _this.geneData[i].transcript.length; j++) {
					query = query + "," + _this.transcriptData[i][j].stableId ; 
					tCount ++;
				}
			}
		}
		query = query.substr(1, query.length );
		_this.retrieveExonInformation(query);
	});
	this.transcriptDataAdapter.get("feature", "gene", query, "transcript");
};

GeneRegionCellBaseDataAdapter.prototype.getFinished = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = this.dataset;
	this.successed.notify();
};

GeneRegionCellBaseDataAdapter.prototype.anticipateRegionRetrieved = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = this.dataset;
	this.lockSuccessEventNotify = false;
	this.preloadSuccess.notify();
};

GeneRegionCellBaseDataAdapter.prototype.getFeaturesByPosition = function(position){
	var features =  new Array();
	var featuresKey = new Object();
	for (var dataset in this.datasets){
		var genes = this.datasets[dataset].toJSON();
		for ( var g = 0; g < genes.length; g++) {
			var gene = genes[g];
			
			if ((gene.start <= position)&&(gene.end >= position)&&(featuresKey[gene.id]==null)){
				features.push(gene);
				featuresKey[gene.id] = true;
				var transcripts = gene.transcript;
				if (transcripts != null){
					for ( var i = 0; i < transcripts.length; i++) {
						var transcript = transcripts[i];
						if ((transcript.start <= position)&&(transcript.end >= position)){
							features.push(transcript);
							var exons = transcript.exon;
							if (exons != null){
								for ( var j = 0; j < exons.length; j++) {
									var exon = exons[j];
									if ((exon.start <= position)&&(exon.end >= position)){
										features.push(exon);
									}
								}
							}
						}
					}
				}
			}
		}
	}
	return features;
};

GeneRegionCellBaseDataAdapter.prototype.retrievedGene = function(data, chromosome, start, end){
	this.geneData = data[0];
	var query = new String();
	for ( var i = 0; i < data[0].length; i++) {
		query = query + "," + data[0][i].stableId ; 
		
	}
	if (this.obtainTranscripts){
			this.retrieveTranscriptInformation(query.substr(1, query.length));
	}else{
		if (!this.lockSuccessEventNotify){
			this.getFinished(data[0], chromosome, start, end);
		}
		else{
			this.anticipateRegionRetrieved(data[0], chromosome, start, end);
		}
	}
};
KaryotypeCellBaseDataAdapter.prototype.setVersion = CellBaseDataAdapter.prototype.setVersion;
KaryotypeCellBaseDataAdapter.prototype.getVersion = CellBaseDataAdapter.prototype.getVersion;
KaryotypeCellBaseDataAdapter.prototype.getSpecies = CellBaseDataAdapter.prototype.getSpecies;
KaryotypeCellBaseDataAdapter.prototype.setSpecies = CellBaseDataAdapter.prototype.setSpecies;
KaryotypeCellBaseDataAdapter.prototype.getFinished = CellBaseDataAdapter.prototype.getFinished;
KaryotypeCellBaseDataAdapter.prototype.toJSON = CellBaseDataAdapter.prototype.toJSON;


function KaryotypeCellBaseDataAdapter(species) {
//	console.log(species);
	CellBaseDataAdapter.prototype.constructor.call(this, species);
	this.species = species;
	this.category = "feature";
	this.subcategory = "karyotype";
	this.resource = "chromosome";
	
	this.chromosomeNames = null;

};

KaryotypeCellBaseDataAdapter.prototype.fill = function( callbackFunction) {
	var _this = this;
//	console.log(this.species);
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function(evt, data) {
		_this.getCytobandsByChromosome(cellBaseDataAdapter.dataset.json);
	});
	cellBaseDataAdapter.fill("feature", "karyotype", "none", "chromosome");
};







KaryotypeCellBaseDataAdapter.prototype.sortfunction = function(a, b) {
	var ValidChars = "0123456789.";
	var IsNumber = true;
	var Char;

	for (i = 0; i < a.length && IsNumber == true; i++) {
		Char = a.charAt(i);
		if (ValidChars.indexOf(Char) == -1) {
			IsNumber = false;
		}
	}

	if (!IsNumber)
		return 1;
	return (a - b);
};

KaryotypeCellBaseDataAdapter.prototype.IsNumeric = function(sText) {
	var ValidChars = "0123456789.";
	var IsNumber = true;
	var Char;

	for (i = 0; i < sText.length && IsNumber == true; i++) {
		Char = sText.charAt(i);
		if (ValidChars.indexOf(Char) == -1) {
			IsNumber = false;
		}
	}
	return IsNumber;
};

KaryotypeCellBaseDataAdapter.prototype.getCytobandsByChromosome = function(chromosomeName) {
	var _this = this;
	
	var cellBaseDataAdapterChr = new CellBaseManager(this.species);
	cellBaseDataAdapterChr.successed.addEventListener(function(evt, data) {
		_this.getFinished(data);
	});
	chromosomeName.sort(this.sortfunction);
	this.chromosomeNames = chromosomeName;
	cellBaseDataAdapterChr.get("feature", "karyotype", chromosomeName.toString(), "cytoband");

};



XrefFeatureListCellBaseDataAdapter.prototype.setVersion = CellBaseDataAdapter.prototype.setVersion;
XrefFeatureListCellBaseDataAdapter.prototype.setSpecies = CellBaseDataAdapter.prototype.setSpecies;
XrefFeatureListCellBaseDataAdapter.prototype.getVersion = CellBaseDataAdapter.prototype.getVersion;
XrefFeatureListCellBaseDataAdapter.prototype.getSpecies = CellBaseDataAdapter.prototype.getSpecies;
XrefFeatureListCellBaseDataAdapter.prototype.getFinished = CellBaseDataAdapter.prototype.getFinished;
XrefFeatureListCellBaseDataAdapter.prototype.arrayToString = CellBaseDataAdapter.prototype.arrayToString;
XrefFeatureListCellBaseDataAdapter.prototype.toJSON = CellBaseDataAdapter.prototype.toJSON;
//manager1.get("feature","id",idSpecies, "dbname");
//manager2.get("feature","id",query, "xref?dbname="+arrayToString(_this.databases,","));
//managerGOs.get("annotation","go",gos, "info");
//manager.get("feature","gene",features, "info");
function XrefFeatureListCellBaseDataAdapter(species,args){
//	console.log(species);
	CellBaseDataAdapter.prototype.constructor.call(this,species);
	this.category = "feature";
	this.subcategory = "id";
	this.resource = "xref?dbname=";
	this.databases = new Array("go_cellular_component","go_molecular_function","go_biological_process","kegg","reactome","ensembl_gene","interpro","uniprot_swissprot_accession","jaspar");
};


XrefFeatureListCellBaseDataAdapter.prototype.fill = function(query, identifier/*, callbackFunction*/){
	
	this.resource += this.arrayToString(this.databases,",");
	//this.resource = this.resource+dbnames;
	if(identifier != null){
		query+="&identifier="+identifier;
	}
	this.cellBaseManager.get(this.category, this.subcategory, query, this.resource);
	var _this = this;
	this.cellBaseManager.successed.addEventListener(function (evt, data){
		_this.getFinished(data);
	});
};function InfoWidget(targetId, species, args){
	this.id = "InfoWidget_" + Math.round(Math.random()*10000000);
	this.targetId = null;
	
	this.species=species;
	
	this.title = null;
	this.featureId = null;
	this.width = 800;
	this.height = 400;
	
	if (targetId!= null){
		this.targetId = targetId;       
	}
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
	
	switch (species){
	case "hsa": 
		this.ensemblSpecie = "Homo_sapiens"; 
		this.reactomeSpecie = "48887"; 
		this.wikipathwaysSpecie = "Homo+sapiens"; 
		this.omimSpecie = ""; 
		this.uniprotSpecie = ""; 
		this.intactSpecie = ""; 
		this.dbsnpSpecie = ""; 
		this.haphapSpecie = ""; 
//		this.Specie = ""; 
		break;
	case "mmu":
		this.ensemblSpecies = "Mus_musculus"; 
		this.reactomeSpecies = "48892";
		this.wikipathwaysSpecie = "Mus+musculus"; 
		this.omimSpecie = ""; 
		this.uniprotSpecie = ""; 
		this.intactSpecie = ""; 
		this.dbsnpSpecie = ""; 
		this.haphapSpecie = ""; 
//		this.Specie = ""; 
		break;
	case "dre":
		this.ensemblSpecie = "Danio_rerio"; 
		this.reactomeSpecie = "68323"; 
		this.wikipathwaysSpecie = "Danio+rerio"; 
		this.omimSpecie = ""; 
		this.uniprotSpecie = ""; 
		this.intactSpecie = ""; 
		this.dbsnpSpecie = ""; 
		this.haphapSpecie = ""; 
//		this.Specie = ""; 
		break;
	}
	
	
};

InfoWidget.prototype.draw = function (feature){
//	this.featureId = feature.id;
	this.feature = feature;
	console.log(feature.getName());
//	this.feature.getName = function(){return "a";};
	
	this.panel=Ext.getCmp(this.title +" "+ this.feature.getName());
	if (this.panel == null){
		//the order is important
		this.render();
		this.panel.show();
		this.getData();
	}else{
		this.panel.show();
	}
};

InfoWidget.prototype.render = function (){
		/**MAIN PANEL**/
		this.panel = Ext.create('Ext.ux.Window', {
		    title: this.title +" "+ this.feature.getName(),
		    id : this.title +" "+ this.feature.getName(),
		    resizable: false,
		    minimizable :true,
			constrain:true,
		    closable:true,
		    height:this.height,
		    width:this.width,
//		    modal:true,
//			layout: {type: 'table',columns: 2},
		    layout: { type: 'hbox',align: 'stretch'},
		    items: [this.getTreePanel()],
		    buttonAlign:'right',
//		    buttons:[],
		    listeners: {
			       scope: this,
			       minimize:function(){
			       		this.panel.hide();
			       },
			       destroy: function(){
			       		delete this.panel;
			       }
	        }
		});
};

InfoWidget.prototype.getTreePanel = function (){
		var dataTypes = this.getdataTypes();
	   	this.checkDataTypes(dataTypes);
	        
		var treeStore = Ext.create('Ext.data.TreeStore', {
		    root: {
		        expanded: true,
		        text: "Options",
		        children: dataTypes
		    }
		});
		
		var treePan = Ext.create('Ext.tree.Panel', {
		    title: 'Detailed information',
		    bodyPadding:10,
		    flex:1,
		   	border:false,
		    store: treeStore,
		    useArrows: true,
		    rootVisible: false,
		    listeners : {
			    	scope: this,
			    	itemclick : function (este,record){
			    		this.optionClick(record.data);
		    		}
			}
		});	
		return treePan;
};



InfoWidget.prototype.doGrid = function (columns,fields,modelName,groupField){
		var groupFeature = Ext.create('Ext.grid.feature.Grouping',{
			groupHeaderTpl: groupField+' ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
	    });
		var filters = [];
		for(var i=0; i<fields.length; i++){
			filters.push({type:'string', dataIndex:fields[i]});
		}
		var filters = {
				ftype: 'filters',
				local: true, // defaults to false (remote filtering)
				filters: filters
		};
	    Ext.define(modelName, {
		    extend: 'Ext.data.Model',
	    	fields:fields
		});
	   	var store = Ext.create('Ext.data.Store', {
			groupField: groupField,
			model:modelName
	    });
		var grid = Ext.create('Ext.grid.Panel', {
			id: this.id+modelName,
	        store: store,
	        title : modelName,
	        border:false,
	        cls:'panel-border-left',
			flex:3,        
	        features: [groupFeature,filters],
	        columns: columns,
	        bbar  : ['->', {
	            text:'Clear Grouping',
	            handler : function(){
	                groupFeature.disable();
	            }
	        }]
	    });
    return grid;
};


InfoWidget.prototype.checkDataTypes = function (dataTypes){
	for (var i = 0; i<dataTypes.length; i++){
		if(dataTypes[i]["children"]!=null){
			dataTypes[i]["iconCls"] ='icon-box';
			dataTypes[i]["expanded"] =true;
			this.checkDataTypes(dataTypes[i]["children"]);
		}else{
			dataTypes[i]["iconCls"] ='icon-blue-box';
			dataTypes[i]["leaf"]=true;
		}
	}
};

InfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return [];
};
InfoWidget.prototype.optionClick = function (){
	//Abstract method
};
InfoWidget.prototype.getData = function (){
	//Abstract method
};

InfoWidget.prototype.getGeneTemplate = function (){
	return  new Ext.XTemplate(
		    '<p><span class="panel-border-bottom"><span class="ssel s130">{externalName}</span> &nbsp; <span class="emph s120"> {stableId} </span></span>',
			' &nbsp; <a target="_blank" href="http://www.ensembl.org/'+this.ensemblSpecie+'/Location/View?g={stableId}">Ensembl</a>',
			'</p><br>',
		    '<p><span class="w75 dis s90">Location: </span> <span class="">{chromosome}:{start}-{end} </span><span style="margin-left:50px" class=" dis s90">Strand: </span> {strand}</p>',
		    '<p><span class="w75 dis s90">Biotype: </span> {biotype}</p>',
		    '<p><span class="w75 dis s90">Description: </span> <span><tpl if="description == &quot;&quot;">No description available</tpl>{description}</span></p>',
		    '<br>',
		    '<p><span class="w75 dis s90">Source: </span> <span class="s110">{source}</span></p>',
		    '<p><span class="w75 dis s90">External DB: </span> {externalDb}</p>',
		    '<p><span class="w75 dis s90">Status: </span> {status}</p>' // +  '<br>'+str
	);
};
InfoWidget.prototype.getTranscriptTemplate = function (){
	return new Ext.XTemplate(
		    '<p><span class="panel-border-bottom"><span class="ssel s130">{externalName}</span> &nbsp; <span class="emph s120"> {stableId} </span></span>',
		    ' &nbsp; <a target="_blank" href="http://www.ensembl.org/'+this.ensemblSpecie+'/Transcript/Transcript?t={stableId}">Ensembl</a>',
		    '</p><br>',
		    '<p><span class="w100 dis s90">Location: </span> <span class="">{chromosome}:{start}-{end} </span><span style="margin-left:50px" class=" dis s90">Strand: </span> {strand}</p>',
		    '<p><span class="w100 dis s90">Biotype: </span> {biotype}</p>',
		    '<p><span class="w100 dis s90">Description: </span> <span><tpl if="description == &quot;&quot;">No description available</tpl>{description}</span></p>',
		    '<br>',
		    '<p><span class="w100 dis s90">CDS &nbsp; (start-end): </span> {codingRegionStart}-{codingRegionEnd} <span style="margin-left:50px" class="w100 dis s90">CDNA (start-end): </span> {cdnaCodingStart}-{cdnaCodingEnd}</p>',
		    '<br>',
		    '<p><span class="w100 dis s90">External DB: </span> {externalDb}</p>',
		    '<p><span class="w100 dis s90">Status: </span> {status}</p><br>'// +  '<br>'+str
		);
};
InfoWidget.prototype.getSnpTemplate = function (){
	return new Ext.XTemplate(
		    '<p><span class="panel-border-bottom"><span class="ssel s130">{name}</span></span>',
		    ' &nbsp; <a target="_blank" href="http://www.ensembl.org/'+this.ensemblSpecie+'/Variation/Summary?v={name}">Ensembl</a>',
		    '</p><br>',
		    '<p><span class="w140 dis s90">Location: </span> <span class="">{chromosome}:{start}-{end} </span><span style="margin-left:50px" class=" dis s90">Strand: </span> {strand}</p>',
		    '<p><span class="w140 dis s90">Source: </span> <span class="s110">{source}</span></p>',
		    '<br>',
		    '<p><span class="w140 dis s90">Map weight: </span> {mapWeight}</p>',
		    '<p><span class="w140 dis s90">Allele string: </span> {alleleString}</p>',
		    '<p><span class="w140 dis s90">Ancestral allele: </span> {ancestralAllele}</p>',
		    '<p><span class="w140 dis s90">Display So consequence: </span> {displaySoConsequence}</p>',
		    '<p><span class="w140 dis s90">So consequence type: </span> {soConsequenceType}</p>',
		    '<p><span class="w140 dis s90">Display consequence: </span> {displayConsequence}</p>',
		    '<p><span class="w140 dis s90">Sequence: </span> {sequence}</p>' // +  '<br>'+str
		);
};

InfoWidget.prototype.getExonTemplate = function (){
	return new Ext.XTemplate(
			'<span><span class="panel-border-bottom"><span class="ssel s110">{stableId}</span></span></span>',
			'<span><span style="margin-left:30px" class="dis s90"> Location: </span> <span class="">{chromosome}:{start}-{end} </span></span>',
			'<span><span style="margin-left:30px" class="dis s90"> Strand: </span> {strand}</span>'
		);
};

InfoWidget.prototype.getVCFVariantTemplate = function (){
	return new Ext.XTemplate(
			'<p><span><span class="panel-border-bottom"><span class="ssel s130">{chromosome}:{start}-{alt}</span> &nbsp; <span class="emph s120"> {label} </span></span></span></p><br>',
			'<p><span class="w75 dis s90">Alt: </span> {alt}</p>',
			'<p><span class="w75 dis s90">Ref: </span> {ref}</p>',
			'<p><span class="w75 dis s90">Quality: </span> {quality}</p>',
			'<p><span class="w75 dis s90">Format: </span> {format}</p>',
			'<p><span class="w75 dis s90">Samples: </span> {samples}</p>',
			'<p><span class="w75 dis s90">Info: </span> {info}</p>'
		);
};GeneInfoWidget.prototype.draw = InfoWidget.prototype.draw;
GeneInfoWidget.prototype.render = InfoWidget.prototype.render;
GeneInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
GeneInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
GeneInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
GeneInfoWidget.prototype.getGeneTemplate = InfoWidget.prototype.getGeneTemplate;
GeneInfoWidget.prototype.getTranscriptTemplate = InfoWidget.prototype.getTranscriptTemplate;

function GeneInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Gene Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

GeneInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Genomic", children: [
	                { text: "Information"},
	                { text: "Transcripts"}
	            ] },
	            { text: "Functional information", children: [
	                { text: "GO"},
	                { text: "Reactome"},
	                { text: "Interpro"}
	            ] },
	            { text: "Regulatory", children: [
	                { text: "Jaspar"},
	                { text: "miRNA"}
	            ] },
	            {text: "3D protein"}
	        ];
};

GeneInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Information": this.panel.add(this.getInfoPanel(this.data).show()); break;
			case "Transcripts": this.panel.add(this.getTranscriptGrid(this.data.transcripts).show());  break;
//			case "GO": this.panel.add(this.getGoGrid().show()); break;
			case "GO": this.panel.add(this.getXrefGrid(this.data.go, "GO").show());  break;
			case "Interpro": this.panel.add(this.getXrefGrid(this.data.interpro, "Interpro").show());  break;
			case "Reactome": this.panel.add(this.getXrefGrid(this.data.reactome, "Reactome").show());  break;
			case "Jaspar": break;
			case "miRNA": break;
			case "3D protein": this.panel.add(this.get3Dprotein(this.data.snps).show());  break;
		}
	}
};

GeneInfoWidget.prototype.getInfoPanel = function(data){
    if(this.infoPanel==null){
    	
    	var tpl = this.getGeneTemplate();
    	
		this.infoPanel = Ext.create('Ext.panel.Panel',{
			title:"Information",
	        border:false,
	        cls:'panel-border-left',
			flex:3,
			bodyPadding:10,
			data:data,
			tpl:tpl
		});

    }
    return this.infoPanel;
};

GeneInfoWidget.prototype.getTranscriptGrid = function(data){
    if(this.transcriptGrid==null){
    	
    	var tpl = this.getTranscriptTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var transcriptPanel = Ext.create('Ext.panel.Panel',{
		        border:false,
				bodyPadding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(transcriptPanel);
    	}
		this.transcriptGrid = Ext.create('Ext.panel.Panel',{
			title:"Transcripts ("+i+")",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.transcriptGrid;
};


GeneInfoWidget.prototype.getXrefGrid = function(data, dbname){
    if(this[dbname+"Grid"]==null){
    	if(data.length<=0){
    		this[dbname+"Grid"]= Ext.create('Ext.panel.Panel',{
    			cls:'panel-border-left',
    			border:false,
    			flex:3,
    			bodyPadding:'40',
    			html:'No results found'
    		});
    	}else{
    		var groupField = '';
    		var modelName = dbname;
    		var fields = ['description','displayId'];
    		var columns = [
    		               {header : 'Display Id',dataIndex: 'displayId',flex:1},
    		               {header : 'Description',dataIndex: 'description',flex:3}
    		               ];
    		this[dbname+"Grid"] = this.doGrid(columns,fields,modelName,groupField);
    		this[dbname+"Grid"].store.loadData(data);
    	}
    }
    return this[dbname+"Grid"];
};

//GeneInfoWidget.prototype.getGoGrid = function(){
//    var _this = this;
//    if(this.goGrid==null){
//    	var groupField = 'namespace';
//    	var modelName = 'GO';
//	    var fields = ['id','name','description','level','directNumberOfGenes','namespace','parents','propagatedNumberOfGenes','score'];
//		var columns = [ {header : 'Database id',dataIndex: 'id',flex:2},
//						{header : 'Name',dataIndex: 'name',flex:1},
//						{header : 'Description',dataIndex: 'description',flex:2},
//		                {
//		                	xtype: 'actioncolumn',
//		                	header : '+info',
//		                    flex:1,
//		                    items: [{
//		                        iconCls: 'icon-blue-box',  // Use a URL in the icon config
//		                        tooltip: '+info',    
//		                        handler: function(grid, rowIndex, colIndex) {
//		                            var rec = _this.goStore.getAt(rowIndex);
//		                            Ext.Msg.alert(rec.get('name'), rec.get('description'));
//		                        }
//		                    }]
//		                 },
//		                {header : 'Direct genes',dataIndex: 'directNumberOfGenes',flex:2},
//						{header : 'Level',dataIndex: 'level',flex:1},
//						{header : 'Namespace',dataIndex: 'namespace',flex:2},
//						{header : 'Propagated genes',dataIndex: 'propagatedNumberOfGenes',flex:2.5}
//		             ];
//		this.goGrid = this.doGrid(columns,fields,modelName,groupField);
//		
//    }
//    return this.goGrid;
//};

GeneInfoWidget.prototype.get3Dprotein = function(data){
	var _this=this;
    if(this.p3dProtein==null){
    	//ws
//    	
      	this.p3dProtein = Ext.create('Ext.tab.Panel',{
      		title:"3D Protein Viewer",
      		border:false,
      		cls:'panel-border-left',
      		flex:3,
//    		bodyPadding:5,
      		autoScroll:true
//      		items:items
      	});
    	
//		$.get('http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/'+_this.feature.feature.stableId+'/xref?dbname=pdb', function(data){
    
    	var pdbs = [];
    	$.ajax({
//    		  url: 'http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/brca2/xref?dbname=pdb',
    		  url: 'http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/'+this.feature.feature.stableId+'/xref?dbname=pdb',
//    		  data: data,
//    		  dataType: dataType,
    		  async:false,
    		  success: function(data){
    			if(data!=""){
//      	    		console.log(data.trim());
      	    		pdbs = data.trim().split("\n");
//      	    		console.log(pdbs);
      	    		
      	    		for ( var i = 0; i < pdbs.length; i++) {
      	    			var pdb_name=pdbs[i].trim();
      	    			var pan = Ext.create('Ext.panel.Panel',{
      	    				title:pdb_name,
      	    				bodyCls:'background-black',
      	    				html:'<center><canvas class="ChemDoodleWebComponent" id="pdb_canvas_'+pdb_name+'" width="600" height="600" style="width: 600px; height: 600px; ">This browser does not support HTML5/Canvas.</canvas></center>',
      	    				listeners:{
      	    					afterrender:function(este){
      	    						// JavaScript Document
      	    						var pdb_name=este.title;
      	    						
      	    				    	ChemDoodle.default_backgroundColor = '#000000';
      	    				    	
      	    				    	var pdb = new ChemDoodle.TransformCanvas3D('pdb_canvas_'+pdb_name, 300, 300);
      	    				    	if(!pdb.gl){
      	    				    	  pdb.emptyMessage = 'Your browser does not support WebGL';
      	    				    	  pdb.displayMessage();
      	    				    	}else{
      	    					    	pdb.specs.set3DRepresentation('Ball and Stick');
      	    					    	pdb.specs.proteins_ribbonCartoonize = true;
      	    					    	pdb.handle = null;
      	    					    	pdb.timeout = 15;
      	    					    	pdb.startAnimation = ChemDoodle._AnimatorCanvas.prototype.startAnimation;
      	    					    	pdb.stopAnimation = ChemDoodle._AnimatorCanvas.prototype.stopAnimation;
      	    					    	pdb.isRunning = ChemDoodle._AnimatorCanvas.prototype.isRunning;
      	    					    	pdb.dblclick = ChemDoodle.RotatorCanvas.prototype.dblclick;
      	    					    	pdb.nextFrame = function(delta){
      	    					    		var matrix = [];
      	    					    		mat4.identity(matrix);
      	    					    		var change = delta/1000;
      	    					    	        var increment = Math.PI/15;
      	    					    		mat4.rotate(matrix, increment*change, [ 1, 0, 0 ]);
      	    					    		mat4.rotate(matrix, increment*change, [ 0, 1, 0 ]);
      	    					    		mat4.rotate(matrix, increment*change, [ 0, 0, 1 ]);
      	    					    		mat4.multiply(this.rotationMatrix, matrix);
      	    					    	};
      	    					    	
//      	    					    	http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/brca2/xref?dbname=pdb
//      	    				    	var mol = ChemDoodle.readPDB('HEADER    PLANT SEED PROTEIN                      30-APR-81   1CRN                                                                       \nDBREF  1CRN A    1    46  UNP    P01542   CRAM_CRAAB       1     46             \nSEQRES   1 A   46  THR THR CYS CYS PRO SER ILE VAL ALA ARG SER ASN PHE          \nSEQRES   2 A   46  ASN VAL CYS ARG LEU PRO GLY THR PRO GLU ALA ILE CYS          \nSEQRES   3 A   46  ALA THR TYR THR GLY CYS ILE ILE ILE PRO GLY ALA THR          \nSEQRES   4 A   46  CYS PRO GLY ASP TYR ALA ASN                                  \nHELIX    1  H1 ILE A    7  PRO A   19  13/10 CONFORMATION RES 17,19       13    \nHELIX    2  H2 GLU A   23  THR A   30  1DISTORTED 3/10 AT RES 30           8    \nSHEET    1  S1 2 THR A   1  CYS A   4  0                                        \nSHEET    2  S1 2 CYS A  32  ILE A  35 -1                                        \nSSBOND   1 CYS A    3    CYS A   40                          1555   1555  2.00  \nSSBOND   2 CYS A    4    CYS A   32                          1555   1555  2.04  \nSSBOND   3 CYS A   16    CYS A   26                          1555   1555  2.05  \nCRYST1   40.960   18.650   22.520  90.00  90.77  90.00 P 1 21 1      2          \nORIGX1      1.000000  0.000000  0.000000        0.00000                         \nORIGX2      0.000000  1.000000  0.000000        0.00000                         \nORIGX3      0.000000  0.000000  1.000000        0.00000                         \nSCALE1      0.024414  0.000000 -0.000328        0.00000                         \nSCALE2      0.000000  0.053619  0.000000        0.00000                         \nSCALE3      0.000000  0.000000  0.044409        0.00000                         \nATOM      1  N   THR A   1      17.047  14.099   3.625  1.00 13.79           N  \nATOM      2  CA  THR A   1      16.967  12.784   4.338  1.00 10.80           C  \nATOM      3  C   THR A   1      15.685  12.755   5.133  1.00  9.19           C  \nATOM      4  O   THR A   1      15.268  13.825   5.594  1.00  9.85           O  \nATOM      5  CB  THR A   1      18.170  12.703   5.337  1.00 13.02           C  \nATOM      6  OG1 THR A   1      19.334  12.829   4.463  1.00 15.06           O  \nATOM      7  CG2 THR A   1      18.150  11.546   6.304  1.00 14.23           C  \nATOM      8  N   THR A   2      15.115  11.555   5.265  1.00  7.81           N  \nATOM      9  CA  THR A   2      13.856  11.469   6.066  1.00  8.31           C  \nATOM     10  C   THR A   2      14.164  10.785   7.379  1.00  5.80           C  \nATOM     11  O   THR A   2      14.993   9.862   7.443  1.00  6.94           O  \nATOM     12  CB  THR A   2      12.732  10.711   5.261  1.00 10.32           C  \nATOM     13  OG1 THR A   2      13.308   9.439   4.926  1.00 12.81           O  \nATOM     14  CG2 THR A   2      12.484  11.442   3.895  1.00 11.90           C  \nATOM     15  N   CYS A   3      13.488  11.241   8.417  1.00  5.24           N  \nATOM     16  CA  CYS A   3      13.660  10.707   9.787  1.00  5.39           C  \nATOM     17  C   CYS A   3      12.269  10.431  10.323  1.00  4.45           C  \nATOM     18  O   CYS A   3      11.393  11.308  10.185  1.00  6.54           O  \nATOM     19  CB  CYS A   3      14.368  11.748  10.691  1.00  5.99           C  \nATOM     20  SG  CYS A   3      15.885  12.426  10.016  1.00  7.01           S  \nATOM     21  N   CYS A   4      12.019   9.272  10.928  1.00  3.90           N  \nATOM     22  CA  CYS A   4      10.646   8.991  11.408  1.00  4.24           C  \nATOM     23  C   CYS A   4      10.654   8.793  12.919  1.00  3.72           C  \nATOM     24  O   CYS A   4      11.659   8.296  13.491  1.00  5.30           O  \nATOM     25  CB  CYS A   4      10.057   7.752  10.682  1.00  4.41           C  \nATOM     26  SG  CYS A   4       9.837   8.018   8.904  1.00  4.72           S  \nATOM     27  N   PRO A   5       9.561   9.108  13.563  1.00  3.96           N  \nATOM     28  CA  PRO A   5       9.448   9.034  15.012  1.00  4.25           C  \nATOM     29  C   PRO A   5       9.288   7.670  15.606  1.00  4.96           C  \nATOM     30  O   PRO A   5       9.490   7.519  16.819  1.00  7.44           O  \nATOM     31  CB  PRO A   5       8.230   9.957  15.345  1.00  5.11           C  \nATOM     32  CG  PRO A   5       7.338   9.786  14.114  1.00  5.24           C  \nATOM     33  CD  PRO A   5       8.366   9.804  12.958  1.00  5.20           C  \nATOM     34  N   SER A   6       8.875   6.686  14.796  1.00  4.83           N  \nATOM     35  CA  SER A   6       8.673   5.314  15.279  1.00  4.45           C  \nATOM     36  C   SER A   6       8.753   4.376  14.083  1.00  4.99           C  \nATOM     37  O   SER A   6       8.726   4.858  12.923  1.00  4.61           O  \nATOM     38  CB  SER A   6       7.340   5.121  15.996  1.00  5.05           C  \nATOM     39  OG  SER A   6       6.274   5.220  15.031  1.00  6.39           O  \nATOM     40  N   ILE A   7       8.881   3.075  14.358  1.00  4.94           N  \nATOM     41  CA  ILE A   7       8.912   2.083  13.258  1.00  6.33           C  \nATOM     42  C   ILE A   7       7.581   2.090  12.506  1.00  5.32           C  \nATOM     43  O   ILE A   7       7.670   2.031  11.245  1.00  6.85           O  \nATOM     44  CB  ILE A   7       9.207   0.677  13.924  1.00  8.43           C  \nATOM     45  CG1 ILE A   7      10.714   0.702  14.312  1.00  9.78           C  \nATOM     46  CG2 ILE A   7       8.811  -0.477  12.969  1.00 11.70           C  \nATOM     47  CD1 ILE A   7      11.185  -0.516  15.142  1.00  9.92           C  \nATOM     48  N   VAL A   8       6.458   2.162  13.159  1.00  5.02           N  \nATOM     49  CA  VAL A   8       5.145   2.209  12.453  1.00  6.93           C  \nATOM     50  C   VAL A   8       5.115   3.379  11.461  1.00  5.39           C  \nATOM     51  O   VAL A   8       4.664   3.268  10.343  1.00  6.30           O  \nATOM     52  CB  VAL A   8       3.995   2.354  13.478  1.00  9.64           C  \nATOM     53  CG1 VAL A   8       2.716   2.891  12.869  1.00 13.85           C  \nATOM     54  CG2 VAL A   8       3.758   1.032  14.208  1.00 11.97           C  \nATOM     55  N   ALA A   9       5.606   4.546  11.941  1.00  3.73           N  \nATOM     56  CA  ALA A   9       5.598   5.767  11.082  1.00  3.56           C  \nATOM     57  C   ALA A   9       6.441   5.527   9.850  1.00  4.13           C  \nATOM     58  O   ALA A   9       6.052   5.933   8.744  1.00  4.36           O  \nATOM     59  CB  ALA A   9       6.022   6.977  11.891  1.00  4.80           C  \nATOM     60  N   ARG A  10       7.647   4.909  10.005  1.00  3.73           N  \nATOM     61  CA  ARG A  10       8.496   4.609   8.837  1.00  3.38           C  \nATOM     62  C   ARG A  10       7.798   3.609   7.876  1.00  3.47           C  \nATOM     63  O   ARG A  10       7.878   3.778   6.651  1.00  4.67           O  \nATOM     64  CB  ARG A  10       9.847   4.020   9.305  1.00  3.95           C  \nATOM     65  CG  ARG A  10      10.752   3.607   8.149  1.00  4.55           C  \nATOM     66  CD  ARG A  10      11.226   4.699   7.244  1.00  5.89           C  \nATOM     67  NE  ARG A  10      12.143   5.571   8.035  1.00  6.20           N  \nATOM     68  CZ  ARG A  10      12.758   6.609   7.443  1.00  7.52           C  \nATOM     69  NH1 ARG A  10      12.539   6.932   6.158  1.00 10.68           N  \nATOM     70  NH2 ARG A  10      13.601   7.322   8.202  1.00  9.48           N  \nATOM     71  N   SER A  11       7.186   2.582   8.445  1.00  5.19           N  \nATOM     72  CA  SER A  11       6.500   1.584   7.565  1.00  4.60           C  \nATOM     73  C   SER A  11       5.382   2.313   6.773  1.00  4.84           C  \nATOM     74  O   SER A  11       5.213   2.016   5.557  1.00  5.84           O  \nATOM     75  CB  SER A  11       5.908   0.462   8.400  1.00  5.91           C  \nATOM     76  OG  SER A  11       6.990  -0.272   9.012  1.00  8.38           O  \nATOM     77  N   ASN A  12       4.648   3.182   7.446  1.00  3.54           N  \nATOM     78  CA  ASN A  12       3.545   3.935   6.751  1.00  4.57           C  \nATOM     79  C   ASN A  12       4.107   4.851   5.691  1.00  4.14           C  \nATOM     80  O   ASN A  12       3.536   5.001   4.617  1.00  5.52           O  \nATOM     81  CB  ASN A  12       2.663   4.677   7.748  1.00  6.42           C  \nATOM     82  CG  ASN A  12       1.802   3.735   8.610  1.00  8.25           C  \nATOM     83  OD1 ASN A  12       1.567   2.613   8.165  1.00 12.72           O  \nATOM     84  ND2 ASN A  12       1.394   4.252   9.767  1.00  9.92           N  \nATOM     85  N   PHE A  13       5.259   5.498   6.005  1.00  3.43           N  \nATOM     86  CA  PHE A  13       5.929   6.358   5.055  1.00  3.49           C  \nATOM     87  C   PHE A  13       6.304   5.578   3.799  1.00  3.40           C  \nATOM     88  O   PHE A  13       6.136   6.072   2.653  1.00  4.07           O  \nATOM     89  CB  PHE A  13       7.183   6.994   5.754  1.00  5.48           C  \nATOM     90  CG  PHE A  13       7.884   8.006   4.883  1.00  5.57           C  \nATOM     91  CD1 PHE A  13       8.906   7.586   4.027  1.00  6.99           C  \nATOM     92  CD2 PHE A  13       7.532   9.373   4.983  1.00  6.52           C  \nATOM     93  CE1 PHE A  13       9.560   8.539   3.194  1.00  8.20           C  \nATOM     94  CE2 PHE A  13       8.176  10.281   4.145  1.00  6.34           C  \nATOM     95  CZ  PHE A  13       9.141   9.845   3.292  1.00  6.84           C  \nATOM     96  N   ASN A  14       6.900   4.390   3.989  1.00  3.64           N  \nATOM     97  CA  ASN A  14       7.331   3.607   2.791  1.00  4.31           C  \nATOM     98  C   ASN A  14       6.116   3.210   1.915  1.00  3.98           C  \nATOM     99  O   ASN A  14       6.240   3.144   0.684  1.00  6.22           O  \nATOM    100  CB  ASN A  14       8.145   2.404   3.240  1.00  5.81           C  \nATOM    101  CG  ASN A  14       9.555   2.856   3.730  1.00  6.82           C  \nATOM    102  OD1 ASN A  14      10.013   3.895   3.323  1.00  9.43           O  \nATOM    103  ND2 ASN A  14      10.120   1.956   4.539  1.00  8.21           N  \nATOM    104  N   VAL A  15       4.993   2.927   2.571  1.00  3.76           N  \nATOM    105  CA  VAL A  15       3.782   2.599   1.742  1.00  3.98           C  \nATOM    106  C   VAL A  15       3.296   3.871   1.004  1.00  3.80           C  \nATOM    107  O   VAL A  15       2.947   3.817  -0.189  1.00  4.85           O  \nATOM    108  CB  VAL A  15       2.698   1.953   2.608  1.00  4.71           C  \nATOM    109  CG1 VAL A  15       1.384   1.826   1.806  1.00  6.67           C  \nATOM    110  CG2 VAL A  15       3.174   0.533   3.005  1.00  6.26           C  \nATOM    111  N   CYS A  16       3.321   4.987   1.720  1.00  3.79           N  \nATOM    112  CA  CYS A  16       2.890   6.285   1.126  1.00  3.54           C  \nATOM    113  C   CYS A  16       3.687   6.597  -0.111  1.00  3.48           C  \nATOM    114  O   CYS A  16       3.200   7.147  -1.103  1.00  4.63           O  \nATOM    115  CB  CYS A  16       3.039   7.369   2.240  1.00  4.58           C  \nATOM    116  SG  CYS A  16       2.559   9.014   1.649  1.00  5.66           S  \nATOM    117  N   ARG A  17       4.997   6.227  -0.100  1.00  3.99           N  \nATOM    118  CA  ARG A  17       5.895   6.489  -1.213  1.00  3.83           C  \nATOM    119  C   ARG A  17       5.738   5.560  -2.409  1.00  3.79           C  \nATOM    120  O   ARG A  17       6.228   5.901  -3.507  1.00  5.39           O  \nATOM    121  CB  ARG A  17       7.370   6.507  -0.731  1.00  4.11           C  \nATOM    122  CG  ARG A  17       7.717   7.687   0.206  1.00  4.69           C  \nATOM    123  CD  ARG A  17       7.949   8.947  -0.615  1.00  5.10           C  \nATOM    124  NE  ARG A  17       9.212   8.856  -1.337  1.00  4.71           N  \nATOM    125  CZ  ARG A  17       9.537   9.533  -2.431  1.00  5.28           C  \nATOM    126  NH1 ARG A  17       8.659  10.350  -3.032  1.00  6.67           N  \nATOM    127  NH2 ARG A  17      10.793   9.491  -2.899  1.00  6.41           N  \nATOM    128  N   LEU A  18       5.051   4.411  -2.204  1.00  4.70           N  \nATOM    129  CA  LEU A  18       4.933   3.431  -3.326  1.00  5.46           C  \nATOM    130  C   LEU A  18       4.397   4.014  -4.620  1.00  5.13           C  \nATOM    131  O   LEU A  18       4.988   3.755  -5.687  1.00  5.55           O  \nATOM    132  CB  LEU A  18       4.196   2.184  -2.863  1.00  6.47           C  \nATOM    133  CG  LEU A  18       4.960   1.178  -1.991  1.00  7.43           C  \nATOM    134  CD1 LEU A  18       3.907   0.097  -1.634  1.00  8.70           C  \nATOM    135  CD2 LEU A  18       6.129   0.606  -2.768  1.00  9.39           C  \nATOM    136  N   PRO A  19       3.329   4.795  -4.543  1.00  4.28           N  \nATOM    137  CA  PRO A  19       2.792   5.376  -5.797  1.00  5.38           C  \nATOM    138  C   PRO A  19       3.573   6.540  -6.322  1.00  6.30           C  \nATOM    139  O   PRO A  19       3.260   7.045  -7.422  1.00  9.62           O  \nATOM    140  CB  PRO A  19       1.358   5.766  -5.472  1.00  5.87           C  \nATOM    141  CG  PRO A  19       1.223   5.694  -3.993  1.00  6.47           C  \nATOM    142  CD  PRO A  19       2.421   4.941  -3.408  1.00  6.45           C  \nATOM    143  N   GLY A  20       4.565   7.047  -5.559  1.00  4.94           N  \nATOM    144  CA  GLY A  20       5.366   8.191  -6.018  1.00  5.39           C  \nATOM    145  C   GLY A  20       5.007   9.481  -5.280  1.00  5.03           C  \nATOM    146  O   GLY A  20       5.535  10.510  -5.730  1.00  7.34           O  \nATOM    147  N   THR A  21       4.181   9.438  -4.262  1.00  4.10           N  \nATOM    148  CA  THR A  21       3.767  10.609  -3.513  1.00  3.94           C  \nATOM    149  C   THR A  21       5.017  11.397  -3.042  1.00  3.96           C  \nATOM    150  O   THR A  21       5.947  10.757  -2.523  1.00  5.82           O  \nATOM    151  CB  THR A  21       2.992  10.188  -2.225  1.00  4.13           C  \nATOM    152  OG1 THR A  21       2.051   9.144  -2.623  1.00  5.45           O  \nATOM    153  CG2 THR A  21       2.260  11.349  -1.551  1.00  5.41           C  \nATOM    154  N   PRO A  22       4.971  12.703  -3.176  1.00  5.04           N  \nATOM    155  CA  PRO A  22       6.143  13.513  -2.696  1.00  4.69           C  \nATOM    156  C   PRO A  22       6.400  13.233  -1.225  1.00  4.19           C  \nATOM    157  O   PRO A  22       5.485  13.061  -0.382  1.00  4.47           O  \nATOM    158  CB  PRO A  22       5.703  14.969  -2.920  1.00  7.12           C  \nATOM    159  CG  PRO A  22       4.676  14.893  -3.996  1.00  7.03           C  \nATOM    160  CD  PRO A  22       3.964  13.567  -3.811  1.00  4.90           C  \nATOM    161  N   GLU A  23       7.728  13.297  -0.921  1.00  5.16           N  \nATOM    162  CA  GLU A  23       8.114  13.103   0.500  1.00  5.31           C  \nATOM    163  C   GLU A  23       7.427  14.073   1.410  1.00  4.11           C  \nATOM    164  O   GLU A  23       7.036  13.682   2.540  1.00  5.11           O  \nATOM    165  CB  GLU A  23       9.648  13.285   0.660  1.00  6.16           C  \nATOM    166  CG  GLU A  23      10.440  12.093   0.063  1.00  7.48           C  \nATOM    167  CD  GLU A  23      11.941  12.170   0.391  1.00  9.40           C  \nATOM    168  OE1 GLU A  23      12.416  13.225   0.681  1.00 10.40           O  \nATOM    169  OE2 GLU A  23      12.539  11.070   0.292  1.00 13.32           O  \nATOM    170  N   ALA A  24       7.212  15.334   0.966  1.00  4.56           N  \nATOM    171  CA  ALA A  24       6.614  16.317   1.913  1.00  4.49           C  \nATOM    172  C   ALA A  24       5.212  15.936   2.350  1.00  4.10           C  \nATOM    173  O   ALA A  24       4.782  16.166   3.495  1.00  5.64           O  \nATOM    174  CB  ALA A  24       6.605  17.695   1.246  1.00  5.80           C  \nATOM    175  N   ILE A  25       4.445  15.318   1.405  1.00  4.37           N  \nATOM    176  CA  ILE A  25       3.074  14.894   1.756  1.00  5.44           C  \nATOM    177  C   ILE A  25       3.085  13.643   2.645  1.00  4.32           C  \nATOM    178  O   ILE A  25       2.315  13.523   3.578  1.00  4.72           O  \nATOM    179  CB  ILE A  25       2.204  14.637   0.462  1.00  6.42           C  \nATOM    180  CG1 ILE A  25       1.815  16.048  -0.129  1.00  7.50           C  \nATOM    181  CG2 ILE A  25       0.903  13.864   0.811  1.00  7.65           C  \nATOM    182  CD1 ILE A  25       0.756  16.761   0.757  1.00  7.80           C  \nATOM    183  N   CYS A  26       4.032  12.764   2.313  1.00  3.92           N  \nATOM    184  CA  CYS A  26       4.180  11.549   3.187  1.00  4.37           C  \nATOM    185  C   CYS A  26       4.632  11.944   4.596  1.00  3.95           C  \nATOM    186  O   CYS A  26       4.227  11.252   5.547  1.00  4.74           O  \nATOM    187  CB  CYS A  26       5.038  10.518   2.539  1.00  4.63           C  \nATOM    188  SG  CYS A  26       4.349   9.794   1.022  1.00  5.61           S  \nATOM    189  N   ALA A  27       5.408  13.012   4.694  1.00  3.89           N  \nATOM    190  CA  ALA A  27       5.879  13.502   6.026  1.00  4.43           C  \nATOM    191  C   ALA A  27       4.696  13.908   6.882  1.00  4.26           C  \nATOM    192  O   ALA A  27       4.528  13.422   8.025  1.00  5.44           O  \nATOM    193  CB  ALA A  27       6.880  14.615   5.830  1.00  5.36           C  \nATOM    194  N   THR A  28       3.827  14.802   6.358  1.00  4.53           N  \nATOM    195  CA  THR A  28       2.691  15.221   7.194  1.00  5.08           C  \nATOM    196  C   THR A  28       1.672  14.132   7.434  1.00  4.62           C  \nATOM    197  O   THR A  28       0.947  14.112   8.468  1.00  7.80           O  \nATOM    198  CB  THR A  28       1.986  16.520   6.614  1.00  6.03           C  \nATOM    199  OG1 THR A  28       1.664  16.221   5.230  1.00  7.19           O  \nATOM    200  CG2 THR A  28       2.914  17.739   6.700  1.00  7.34           C  \nATOM    201  N   TYR A  29       1.621  13.190   6.511  1.00  5.01           N  \nATOM    202  CA  TYR A  29       0.715  12.045   6.657  1.00  6.60           C  \nATOM    203  C   TYR A  29       1.125  11.125   7.815  1.00  4.92           C  \nATOM    204  O   TYR A  29       0.286  10.632   8.545  1.00  7.13           O  \nATOM    205  CB  TYR A  29       0.755  11.229   5.322  1.00  9.66           C  \nATOM    206  CG  TYR A  29      -0.203  10.044   5.354  1.00 11.56           C  \nATOM    207  CD1 TYR A  29      -1.547  10.337   5.645  1.00 12.85           C  \nATOM    208  CD2 TYR A  29       0.193   8.750   5.100  1.00 14.44           C  \nATOM    209  CE1 TYR A  29      -2.496   9.329   5.673  1.00 16.61           C  \nATOM    210  CE2 TYR A  29      -0.801   7.705   5.156  1.00 17.11           C  \nATOM    211  CZ  TYR A  29      -2.079   8.031   5.430  1.00 19.99           C  \nATOM    212  OH  TYR A  29      -3.097   7.057   5.458  1.00 28.98           O  \nATOM    213  N   THR A  30       2.470  10.984   7.995  1.00  5.31           N  \nATOM    214  CA  THR A  30       2.986   9.994   8.950  1.00  5.70           C  \nATOM    215  C   THR A  30       3.609  10.505  10.230  1.00  6.28           C  \nATOM    216  O   THR A  30       3.766   9.715  11.186  1.00  8.77           O  \nATOM    217  CB  THR A  30       4.076   9.103   8.225  1.00  6.55           C  \nATOM    218  OG1 THR A  30       5.125  10.027   7.824  1.00  6.57           O  \nATOM    219  CG2 THR A  30       3.493   8.324   7.035  1.00  7.29           C  \nATOM    220  N   GLY A  31       3.984  11.764  10.241  1.00  4.99           N  \nATOM    221  CA  GLY A  31       4.769  12.336  11.360  1.00  5.50           C  \nATOM    222  C   GLY A  31       6.255  12.243  11.106  1.00  4.19           C  \nATOM    223  O   GLY A  31       7.037  12.750  11.954  1.00  6.12           O  \nATOM    224  N   CYS A  32       6.710  11.631   9.992  1.00  4.30           N  \nATOM    225  CA  CYS A  32       8.140  11.694   9.635  1.00  4.89           C  \nATOM    226  C   CYS A  32       8.500  13.141   9.206  1.00  5.50           C  \nATOM    227  O   CYS A  32       7.581  13.949   8.944  1.00  5.82           O  \nATOM    228  CB  CYS A  32       8.504  10.686   8.530  1.00  4.66           C  \nATOM    229  SG  CYS A  32       8.048   8.987   8.881  1.00  5.33           S  \nATOM    230  N   ILE A  33       9.793  13.410   9.173  1.00  6.02           N  \nATOM    231  CA  ILE A  33      10.280  14.760   8.823  1.00  5.24           C  \nATOM    232  C   ILE A  33      11.346  14.658   7.743  1.00  5.16           C  \nATOM    233  O   ILE A  33      11.971  13.583   7.552  1.00  7.19           O  \nATOM    234  CB  ILE A  33      10.790  15.535  10.085  1.00  5.49           C  \nATOM    235  CG1 ILE A  33      12.059  14.803  10.671  1.00  6.85           C  \nATOM    236  CG2 ILE A  33       9.684  15.686  11.138  1.00  6.45           C  \nATOM    237  CD1 ILE A  33      12.733  15.676  11.781  1.00  8.94           C  \nATOM    238  N   ILE A  34      11.490  15.773   7.038  1.00  5.52           N  \nATOM    239  CA  ILE A  34      12.552  15.877   6.036  1.00  6.82           C  \nATOM    240  C   ILE A  34      13.590  16.917   6.560  1.00  6.92           C  \nATOM    241  O   ILE A  34      13.168  18.006   6.945  1.00  9.22           O  \nATOM    242  CB  ILE A  34      11.987  16.360   4.681  1.00  8.11           C  \nATOM    243  CG1 ILE A  34      10.914  15.338   4.163  1.00  9.59           C  \nATOM    244  CG2 ILE A  34      13.131  16.517   3.629  1.00  9.73           C  \nATOM    245  CD1 ILE A  34      10.151  16.024   2.938  1.00 13.41           C  \nATOM    246  N   ILE A  35      14.856  16.493   6.536  1.00  7.06           N  \nATOM    247  CA  ILE A  35      15.930  17.454   6.941  1.00  7.52           C  \nATOM    248  C   ILE A  35      16.913  17.550   5.819  1.00  6.63           C  \nATOM    249  O   ILE A  35      17.097  16.660   4.970  1.00  7.90           O  \nATOM    250  CB  ILE A  35      16.622  16.995   8.285  1.00  8.07           C  \nATOM    251  CG1 ILE A  35      17.360  15.651   8.067  1.00  9.41           C  \nATOM    252  CG2 ILE A  35      15.592  16.974   9.434  1.00  9.46           C  \nATOM    253  CD1 ILE A  35      18.298  15.206   9.219  1.00  9.85           C  \nATOM    254  N   PRO A  36      17.664  18.669   5.806  1.00  8.07           N  \nATOM    255  CA  PRO A  36      18.635  18.861   4.738  1.00  8.78           C  \nATOM    256  C   PRO A  36      19.925  18.042   4.949  1.00  8.31           C  \nATOM    257  O   PRO A  36      20.593  17.742   3.945  1.00  9.09           O  \nATOM    258  CB  PRO A  36      18.945  20.364   4.783  1.00  9.67           C  \nATOM    259  CG  PRO A  36      18.238  20.937   5.908  1.00 10.15           C  \nATOM    260  CD  PRO A  36      17.371  19.900   6.596  1.00  9.53           C  \nATOM    261  N   GLY A  37      20.172  17.730   6.217  1.00  8.48           N  \nATOM    262  CA  GLY A  37      21.452  16.969   6.513  1.00  9.20           C  \nATOM    263  C   GLY A  37      21.143  15.478   6.427  1.00 10.41           C  \nATOM    264  O   GLY A  37      20.138  15.023   5.878  1.00 12.06           O  \nATOM    265  N   ALA A  38      22.055  14.701   7.032  1.00  9.24           N  \nATOM    266  CA  ALA A  38      22.019  13.242   7.020  1.00  9.24           C  \nATOM    267  C   ALA A  38      21.944  12.628   8.396  1.00  9.60           C  \nATOM    268  O   ALA A  38      21.869  11.387   8.435  1.00 13.65           O  \nATOM    269  CB  ALA A  38      23.246  12.697   6.275  1.00 10.43           C  \nATOM    270  N   THR A  39      21.894  13.435   9.436  1.00  8.70           N  \nATOM    271  CA  THR A  39      21.936  12.911  10.809  1.00  9.46           C  \nATOM    272  C   THR A  39      20.615  13.191  11.521  1.00  8.32           C  \nATOM    273  O   THR A  39      20.357  14.317  11.948  1.00  9.89           O  \nATOM    274  CB  THR A  39      23.131  13.601  11.593  1.00 10.72           C  \nATOM    275  OG1 THR A  39      24.284  13.401  10.709  1.00 11.66           O  \nATOM    276  CG2 THR A  39      23.340  12.935  12.962  1.00 11.81           C  \nATOM    277  N   CYS A  40      19.827  12.110  11.642  1.00  7.64           N  \nATOM    278  CA  CYS A  40      18.504  12.312  12.298  1.00  8.05           C  \nATOM    279  C   CYS A  40      18.684  12.451  13.784  1.00  7.63           C  \nATOM    280  O   CYS A  40      19.533  11.718  14.362  1.00  9.64           O  \nATOM    281  CB  CYS A  40      17.582  11.117  11.996  1.00  7.80           C  \nATOM    282  SG  CYS A  40      17.199  10.929  10.237  1.00  7.30           S  \nATOM    283  N   PRO A  41      17.880  13.266  14.426  1.00  8.00           N  \nATOM    284  CA  PRO A  41      17.924  13.421  15.877  1.00  8.96           C  \nATOM    285  C   PRO A  41      17.392  12.206  16.594  1.00  9.06           C  \nATOM    286  O   PRO A  41      16.652  11.368  16.033  1.00  8.82           O  \nATOM    287  CB  PRO A  41      17.076  14.658  16.145  1.00 10.39           C  \nATOM    288  CG  PRO A  41      16.098  14.689  14.997  1.00 10.99           C  \nATOM    289  CD  PRO A  41      16.859  14.150  13.779  1.00 10.49           C  \nATOM    290  N   GLY A  42      17.728  12.124  17.884  1.00  7.55           N  \nATOM    291  CA  GLY A  42      17.334  10.956  18.691  1.00  8.00           C  \nATOM    292  C   GLY A  42      15.875  10.688  18.871  1.00  7.22           C  \nATOM    293  O   GLY A  42      15.434   9.550  19.166  1.00  8.41           O  \nATOM    294  N   ASP A  43      15.036  11.747  18.715  1.00  5.54           N  \nATOM    295  CA  ASP A  43      13.564  11.573  18.836  1.00  5.85           C  \nATOM    296  C   ASP A  43      12.936  11.227  17.470  1.00  5.87           C  \nATOM    297  O   ASP A  43      11.720  11.040  17.428  1.00  7.29           O  \nATOM    298  CB  ASP A  43      12.933  12.737  19.580  1.00  6.72           C  \nATOM    299  CG  ASP A  43      13.140  14.094  18.958  1.00  8.59           C  \nATOM    300  OD1 ASP A  43      14.109  14.303  18.212  1.00  9.59           O  \nATOM    301  OD2 ASP A  43      12.267  14.963  19.265  1.00 11.45           O  \nATOM    302  N   TYR A  44      13.725  11.174  16.425  1.00  5.22           N  \nATOM    303  CA  TYR A  44      13.257  10.745  15.081  1.00  5.56           C  \nATOM    304  C   TYR A  44      14.275   9.687  14.612  1.00  4.61           C  \nATOM    305  O   TYR A  44      14.930   9.862  13.568  1.00  6.04           O  \nATOM    306  CB  TYR A  44      13.200  11.914  14.071  1.00  5.41           C  \nATOM    307  CG  TYR A  44      12.000  12.819  14.399  1.00  5.34           C  \nATOM    308  CD1 TYR A  44      12.119  13.853  15.332  1.00  6.59           C  \nATOM    309  CD2 TYR A  44      10.775  12.617  13.762  1.00  5.94           C  \nATOM    310  CE1 TYR A  44      11.045  14.675  15.610  1.00  5.97           C  \nATOM    311  CE2 TYR A  44       9.676  13.433  14.048  1.00  5.17           C  \nATOM    312  CZ  TYR A  44       9.802  14.456  14.996  1.00  5.96           C  \nATOM    313  OH  TYR A  44       8.740  15.265  15.269  1.00  8.60           O  \nATOM    314  N   ALA A  45      14.342   8.640  15.422  1.00  4.76           N  \nATOM    315  CA  ALA A  45      15.445   7.667  15.246  1.00  5.89           C  \nATOM    316  C   ALA A  45      15.171   6.533  14.280  1.00  6.67           C  \nATOM    317  O   ALA A  45      16.093   5.705  14.039  1.00  7.56           O  \nATOM    318  CB  ALA A  45      15.680   7.099  16.682  1.00  6.82           C  \nATOM    319  N   ASN A  46      13.966   6.502  13.739  1.00  5.80           N  \nATOM    320  CA  ASN A  46      13.512   5.395  12.878  1.00  6.15           C  \nATOM    321  C   ASN A  46      13.311   5.853  11.455  1.00  6.61           C  \nATOM    322  O   ASN A  46      13.733   6.929  11.026  1.00  7.18           O  \nATOM    323  CB  ASN A  46      12.266   4.769  13.501  1.00  7.27           C  \nATOM    324  CG  ASN A  46      12.538   4.304  14.922  1.00  7.98           C  \nATOM    325  OD1 ASN A  46      11.982   4.849  15.886  1.00 11.00           O  \nATOM    326  ND2 ASN A  46      13.407   3.298  15.015  1.00 10.32           N  \nATOM    327  OXT ASN A  46      12.703   4.973  10.746  1.00  7.86           O  \nTER     328      ASN A  46                                                      \nCONECT   20  282                                                                \nCONECT   26  229                                                                \nCONECT  116  188                                                                \nCONECT  188  116                                                                \nCONECT  229   26                                                                \nCONECT  282   20                                                                \nMASTER      227    0    0    2    2    1    0    6  327    1    6    4          \nEND                                                                             \n', 1);
      						    		$.get('http://www.rcsb.org/pdb/files/'+pdb_name+'.pdb', function(data) {			
      						    			var mol = ChemDoodle.readPDB(data);
      						    			pdb.loadMolecule(mol);
      						    			pdb.startAnimation();
      						    		});
      	    				    	}
      	    					}
      	    				}
      	    			});
      	    			
      	    			_this.p3dProtein.add(pan);
      	    		}
    			}
    			else{
    				_this.p3dProtein.setTitle('No proteins found');
    			}


  	    	}
    	});
    	
//    	$.get('http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/brca2/xref?dbname=pdb', 
    	
    	
    	
    	
//    	http://www.rcsb.org/pdb/files/1A17.pdb
    	
//    	http://www.rcsb.org/pdb/files/AAAA.pdb
    	
//		var pan = Ext.create('Ext.panel.Panel',{
//			title:"3D Protein Viewer",
//	        border:false,
//	        cls:'panel-border-left',
//			flex:3,
//			bodyPadding:5,
//			autoScroll:true,
//			html:'<canvas class="ChemDoodleWebComponent" id="pdb_canvas_prueba" width="600" height="600" style="width: 600px; height: 600px; ">This browser does not support HTML5/Canvas.</canvas>',
//
//		});

    }
    return this.p3dProtein;

};


GeneInfoWidget.prototype.getEnsembleId = function (){

};


GeneInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function (evt){
		_this.dataReceived(JSON.parse(cellBaseDataAdapter.toJSON()));//TODO
	});
	cellBaseDataAdapter.fill("feature","gene", this.feature.feature.stableId, "fullinfo");
};
GeneInfoWidget.prototype.dataReceived = function (data){
	this.data=data[0];
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};ProteinInfoWidget.prototype.draw = InfoWidget.prototype.draw;
ProteinInfoWidget.prototype.render = InfoWidget.prototype.render;
ProteinInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
ProteinInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
ProteinInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;

function ProteinInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Protein Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

ProteinInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Sumary", children: [
	                { text: "Long"},
	                { text: "Seq"}
	            ] },
	            { text: "Functional information", children: [
	                { text: "GO"},
	                { text: "Reactome"},
	                { text: "Interpro"}
	            ] },
	            { text: "Interactions"},
	            { text: "Variations"}
	           
	        ];
};
ProteinInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "":  break;
			case "":  break;
//			case "GO": this.panel.add(this.getGoGrid().show()); break;
			case "Reactome": break;
			case "Interpro": break;
			case "": break;
			case "": break;
			case "": break;
		}
	}
};SnpInfoWidget.prototype.draw = InfoWidget.prototype.draw;
SnpInfoWidget.prototype.render = InfoWidget.prototype.render;
SnpInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
SnpInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
SnpInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
SnpInfoWidget.prototype.getSnpTemplate = InfoWidget.prototype.getSnpTemplate;

function SnpInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "SNP Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

SnpInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Genomic", children: [
	                { text: "Information"},
	                { text: "Gene"}
	            ] },
	            { text: "Consequence Type"},
	            { text: "Population"}
	           
	        ];
};
SnpInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Information":  this.panel.add(this.getInfoPanel(this.data).show()); break;
			case "Consequence Type": break;
			case "Population": break;
		}
	}
};

SnpInfoWidget.prototype.getInfoPanel = function(data){
    if(this.infoPanel==null){

    	var tpl = this.getSnpTemplate();

		this.infoPanel = Ext.create('Ext.panel.Panel',{
			title:"Information",
	        border:false,
	        cls:'panel-border-left',
			flex:3,    
			bodyPadding:10,
			data:data,
			tpl:tpl
		});

    }
    return this.infoPanel;
};

SnpInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function (evt){
		_this.dataReceived(JSON.parse(cellBaseDataAdapter.toJSON()));//TODO
	});
	cellBaseDataAdapter.fill("feature","snp", this.feature.getName(), "fullinfo");
};
SnpInfoWidget.prototype.dataReceived = function (data){
	var mappedSnps = data[0];
	for ( var i = 0; i < mappedSnps.length; i++) {
		if (mappedSnps[i].chromosome == this.feature.feature.chromosome && mappedSnps[i].start == this.feature.start && mappedSnps[i].end == this.feature.end ){
			this.data=mappedSnps[i];
			console.log(mappedSnps[i]);
		}
	}
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};
TranscriptInfoWidget.prototype.draw = InfoWidget.prototype.draw;
TranscriptInfoWidget.prototype.render = InfoWidget.prototype.render;
TranscriptInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
TranscriptInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
TranscriptInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
TranscriptInfoWidget.prototype.getGeneTemplate = InfoWidget.prototype.getGeneTemplate;
TranscriptInfoWidget.prototype.getTranscriptTemplate = InfoWidget.prototype.getTranscriptTemplate;
TranscriptInfoWidget.prototype.getExonTemplate = InfoWidget.prototype.getExonTemplate;

function TranscriptInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Transcript";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

TranscriptInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Genomic", children: [
	                 { text: "Information"},
	                 { text: "Gene"},
	                 { text: "Exons"}
	            ] },
	            { text: "Functional information", children: [
	                  { text: "GO"},
	                  { text: "Interpro"},
	                  { text: "Reactome"}
	            ] },
	            { text: "Variation", children: [
	                  { text: "SNPs"},
	                  { text: "Mutations"}
	            ] },
	            { text: "Regulatory", children: [
	            ]},
	            {text:"3D protein"}
	            
	        ];
};
TranscriptInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Information": this.panel.add(this.getInfoPanel(this.data).show()); break;
			case "Gene": this.panel.add(this.getGenePanel(this.data.gene).show());  break;
			case "Exons": this.panel.add(this.getExonsGrid(this.data.exons).show());  break;
			case "GO": this.panel.add(this.getXrefGrid(this.data.go, "GO").show());  break;
			case "Interpro": this.panel.add(this.getXrefGrid(this.data.interpro, "Interpro").show());  break;
			case "Reactome": this.panel.add(this.getXrefGrid(this.data.reactome, "Reactome").show());  break;
			case "SNPs": this.panel.add(this.getSnpsGrid(this.data.snps).show());  break;
			case "3D protein": this.panel.add(this.get3Dprotein(this.data.snps).show());  break;
		}
	}
};

TranscriptInfoWidget.prototype.getInfoPanel = function(data){
	if(this.infoPanel==null){
		
    	var tpl = this.getTranscriptTemplate();
    	
		this.infoPanel = Ext.create('Ext.panel.Panel',{
			title:"Information",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:10,
			autoScroll:true,
			data:data,//para el template
			tpl:tpl
		});
	}
	return this.infoPanel;
};

TranscriptInfoWidget.prototype.getGenePanel = function(data){
    if(this.genePanel==null){
    	
    	var tpl = this.getGeneTemplate();
    	
		this.genePanel = Ext.create('Ext.panel.Panel',{
			title:"Gene",
	        border:false,
	        cls:'panel-border-left',
			flex:3,
			bodyPadding:10,
			data:data,
			tpl:tpl
		});
    }
    return this.genePanel;
};

TranscriptInfoWidget.prototype.getExonsGrid = function(data){
    if(this.exonsGrid==null){

    	var tpl = this.getExonTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var exonPanel = Ext.create('Ext.panel.Panel',{
		        border:false,
				bodyPadding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(exonPanel);
    	}
		this.exonsGrid = Ext.create('Ext.panel.Panel',{
			title:"Exons ("+i+")",
	        border:false,
	        cls:'panel-border-left',
			flex:3,
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.exonsGrid;
};

TranscriptInfoWidget.prototype.getXrefGrid = function(data, dbname){
    if(this[dbname+"Grid"]==null){
    	if(data.length<=0){
    		this[dbname+"Grid"]= Ext.create('Ext.panel.Panel',{
    			cls:'panel-border-left',
    			border:false,
    			flex:3,
    			bodyPadding:'40',
    			html:'No results found'
    		});
    	}else{
    		var groupField = '';
    		var modelName = dbname;
    		var fields = ['description','displayId'];
    		var columns = [
    		               {header : 'Display Id',dataIndex: 'displayId',flex:1},
    		               {header : 'Description',dataIndex: 'description',flex:3}
    		               ];
    		this[dbname+"Grid"] = this.doGrid(columns,fields,modelName,groupField);
    		this[dbname+"Grid"].store.loadData(data);
    	}
    }
    return this[dbname+"Grid"];
};


//TODO hay muchos y tarda
TranscriptInfoWidget.prototype.getSnpsGrid = function(data){
    if(this.snpsGrid==null){
    	var groupField = '';
    	var modelName = 'SNPs';
	    var fields = ['chromosome','start','end','name',"strand","sequence"];
		var columns = [
		               	{header : 'Name',dataIndex: 'name',flex:2},
		               	{header : 'Location', xtype:'templatecolumn', tpl:'{chromosome}:{start}-{end}',flex:2},
						{header : 'Strand',dataIndex: 'strand',flex:0.7},
						{header : 'Sequence',dataIndex: 'sequence',flex:2}
		             ];
		this.snpsGrid = this.doGrid(columns,fields,modelName,groupField);
		this.snpsGrid.store.loadData(data);
    }
    return this.snpsGrid;
};
TranscriptInfoWidget.prototype.get3Dprotein = function(data){
	var _this=this;
    if(this.p3dProtein==null){
    	//ws
//    	
      	this.p3dProtein = Ext.create('Ext.tab.Panel',{
      		title:"3D Protein Viewer",
      		border:false,
      		cls:'panel-border-left',
      		flex:3,
//    		bodyPadding:5,
      		autoScroll:true
//      		items:items
      	});
    	
//		$.get('http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/'+_this.feature.feature.stableId+'/xref?dbname=pdb', function(data){
    
    	var pdbs = [];
    	$.ajax({
//    		  url: 'http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/brca2/xref?dbname=pdb',
    		  url: 'http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/'+this.feature.feature.stableId+'/xref?dbname=pdb',
//    		  data: data,
//    		  dataType: dataType,
    		  async:false,
    		  success: function(data){
    			if(data!=""){
//      	    		console.log(data.trim());
      	    		pdbs = data.trim().split("\n");
//      	    		console.log(pdbs);
      	    		
      	    		for ( var i = 0; i < pdbs.length; i++) {
      	    			var pdb_name=pdbs[i].trim();
      	    			var pan = Ext.create('Ext.panel.Panel',{
      	    				title:pdb_name,
      	    				bodyCls:'background-black',
      	    				html:'<canvas class="ChemDoodleWebComponent" id="pdb_canvas_'+pdb_name+'" width="600" height="600" style="width: 600px; height: 600px; ">This browser does not support HTML5/Canvas.</canvas>',
      	    				listeners:{
      	    					afterrender:function(este){
      	    						// JavaScript Document
      	    						var pdb_name=este.title;
      	    						
      	    				    	ChemDoodle.default_backgroundColor = '#000000';
      	    				    	
      	    				    	var pdb = new ChemDoodle.TransformCanvas3D('pdb_canvas_'+pdb_name, 300, 300);
      	    				    	if(!pdb.gl){
      	    				    	  pdb.emptyMessage = 'Your browser does not support WebGL';
      	    				    	  pdb.displayMessage();
      	    				    	}else{
      	    					    	pdb.specs.set3DRepresentation('Ball and Stick');
      	    					    	pdb.specs.proteins_ribbonCartoonize = true;
      	    					    	pdb.handle = null;
      	    					    	pdb.timeout = 15;
      	    					    	pdb.startAnimation = ChemDoodle._AnimatorCanvas.prototype.startAnimation;
      	    					    	pdb.stopAnimation = ChemDoodle._AnimatorCanvas.prototype.stopAnimation;
      	    					    	pdb.isRunning = ChemDoodle._AnimatorCanvas.prototype.isRunning;
      	    					    	pdb.dblclick = ChemDoodle.RotatorCanvas.prototype.dblclick;
      	    					    	pdb.nextFrame = function(delta){
      	    					    		var matrix = [];
      	    					    		mat4.identity(matrix);
      	    					    		var change = delta/1000;
      	    					    	        var increment = Math.PI/15;
      	    					    		mat4.rotate(matrix, increment*change, [ 1, 0, 0 ]);
      	    					    		mat4.rotate(matrix, increment*change, [ 0, 1, 0 ]);
      	    					    		mat4.rotate(matrix, increment*change, [ 0, 0, 1 ]);
      	    					    		mat4.multiply(this.rotationMatrix, matrix);
      	    					    	};
      	    					    	
//      	    					    	http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/brca2/xref?dbname=pdb
//      	    				    	var mol = ChemDoodle.readPDB('HEADER    PLANT SEED PROTEIN                      30-APR-81   1CRN                                                                       \nDBREF  1CRN A    1    46  UNP    P01542   CRAM_CRAAB       1     46             \nSEQRES   1 A   46  THR THR CYS CYS PRO SER ILE VAL ALA ARG SER ASN PHE          \nSEQRES   2 A   46  ASN VAL CYS ARG LEU PRO GLY THR PRO GLU ALA ILE CYS          \nSEQRES   3 A   46  ALA THR TYR THR GLY CYS ILE ILE ILE PRO GLY ALA THR          \nSEQRES   4 A   46  CYS PRO GLY ASP TYR ALA ASN                                  \nHELIX    1  H1 ILE A    7  PRO A   19  13/10 CONFORMATION RES 17,19       13    \nHELIX    2  H2 GLU A   23  THR A   30  1DISTORTED 3/10 AT RES 30           8    \nSHEET    1  S1 2 THR A   1  CYS A   4  0                                        \nSHEET    2  S1 2 CYS A  32  ILE A  35 -1                                        \nSSBOND   1 CYS A    3    CYS A   40                          1555   1555  2.00  \nSSBOND   2 CYS A    4    CYS A   32                          1555   1555  2.04  \nSSBOND   3 CYS A   16    CYS A   26                          1555   1555  2.05  \nCRYST1   40.960   18.650   22.520  90.00  90.77  90.00 P 1 21 1      2          \nORIGX1      1.000000  0.000000  0.000000        0.00000                         \nORIGX2      0.000000  1.000000  0.000000        0.00000                         \nORIGX3      0.000000  0.000000  1.000000        0.00000                         \nSCALE1      0.024414  0.000000 -0.000328        0.00000                         \nSCALE2      0.000000  0.053619  0.000000        0.00000                         \nSCALE3      0.000000  0.000000  0.044409        0.00000                         \nATOM      1  N   THR A   1      17.047  14.099   3.625  1.00 13.79           N  \nATOM      2  CA  THR A   1      16.967  12.784   4.338  1.00 10.80           C  \nATOM      3  C   THR A   1      15.685  12.755   5.133  1.00  9.19           C  \nATOM      4  O   THR A   1      15.268  13.825   5.594  1.00  9.85           O  \nATOM      5  CB  THR A   1      18.170  12.703   5.337  1.00 13.02           C  \nATOM      6  OG1 THR A   1      19.334  12.829   4.463  1.00 15.06           O  \nATOM      7  CG2 THR A   1      18.150  11.546   6.304  1.00 14.23           C  \nATOM      8  N   THR A   2      15.115  11.555   5.265  1.00  7.81           N  \nATOM      9  CA  THR A   2      13.856  11.469   6.066  1.00  8.31           C  \nATOM     10  C   THR A   2      14.164  10.785   7.379  1.00  5.80           C  \nATOM     11  O   THR A   2      14.993   9.862   7.443  1.00  6.94           O  \nATOM     12  CB  THR A   2      12.732  10.711   5.261  1.00 10.32           C  \nATOM     13  OG1 THR A   2      13.308   9.439   4.926  1.00 12.81           O  \nATOM     14  CG2 THR A   2      12.484  11.442   3.895  1.00 11.90           C  \nATOM     15  N   CYS A   3      13.488  11.241   8.417  1.00  5.24           N  \nATOM     16  CA  CYS A   3      13.660  10.707   9.787  1.00  5.39           C  \nATOM     17  C   CYS A   3      12.269  10.431  10.323  1.00  4.45           C  \nATOM     18  O   CYS A   3      11.393  11.308  10.185  1.00  6.54           O  \nATOM     19  CB  CYS A   3      14.368  11.748  10.691  1.00  5.99           C  \nATOM     20  SG  CYS A   3      15.885  12.426  10.016  1.00  7.01           S  \nATOM     21  N   CYS A   4      12.019   9.272  10.928  1.00  3.90           N  \nATOM     22  CA  CYS A   4      10.646   8.991  11.408  1.00  4.24           C  \nATOM     23  C   CYS A   4      10.654   8.793  12.919  1.00  3.72           C  \nATOM     24  O   CYS A   4      11.659   8.296  13.491  1.00  5.30           O  \nATOM     25  CB  CYS A   4      10.057   7.752  10.682  1.00  4.41           C  \nATOM     26  SG  CYS A   4       9.837   8.018   8.904  1.00  4.72           S  \nATOM     27  N   PRO A   5       9.561   9.108  13.563  1.00  3.96           N  \nATOM     28  CA  PRO A   5       9.448   9.034  15.012  1.00  4.25           C  \nATOM     29  C   PRO A   5       9.288   7.670  15.606  1.00  4.96           C  \nATOM     30  O   PRO A   5       9.490   7.519  16.819  1.00  7.44           O  \nATOM     31  CB  PRO A   5       8.230   9.957  15.345  1.00  5.11           C  \nATOM     32  CG  PRO A   5       7.338   9.786  14.114  1.00  5.24           C  \nATOM     33  CD  PRO A   5       8.366   9.804  12.958  1.00  5.20           C  \nATOM     34  N   SER A   6       8.875   6.686  14.796  1.00  4.83           N  \nATOM     35  CA  SER A   6       8.673   5.314  15.279  1.00  4.45           C  \nATOM     36  C   SER A   6       8.753   4.376  14.083  1.00  4.99           C  \nATOM     37  O   SER A   6       8.726   4.858  12.923  1.00  4.61           O  \nATOM     38  CB  SER A   6       7.340   5.121  15.996  1.00  5.05           C  \nATOM     39  OG  SER A   6       6.274   5.220  15.031  1.00  6.39           O  \nATOM     40  N   ILE A   7       8.881   3.075  14.358  1.00  4.94           N  \nATOM     41  CA  ILE A   7       8.912   2.083  13.258  1.00  6.33           C  \nATOM     42  C   ILE A   7       7.581   2.090  12.506  1.00  5.32           C  \nATOM     43  O   ILE A   7       7.670   2.031  11.245  1.00  6.85           O  \nATOM     44  CB  ILE A   7       9.207   0.677  13.924  1.00  8.43           C  \nATOM     45  CG1 ILE A   7      10.714   0.702  14.312  1.00  9.78           C  \nATOM     46  CG2 ILE A   7       8.811  -0.477  12.969  1.00 11.70           C  \nATOM     47  CD1 ILE A   7      11.185  -0.516  15.142  1.00  9.92           C  \nATOM     48  N   VAL A   8       6.458   2.162  13.159  1.00  5.02           N  \nATOM     49  CA  VAL A   8       5.145   2.209  12.453  1.00  6.93           C  \nATOM     50  C   VAL A   8       5.115   3.379  11.461  1.00  5.39           C  \nATOM     51  O   VAL A   8       4.664   3.268  10.343  1.00  6.30           O  \nATOM     52  CB  VAL A   8       3.995   2.354  13.478  1.00  9.64           C  \nATOM     53  CG1 VAL A   8       2.716   2.891  12.869  1.00 13.85           C  \nATOM     54  CG2 VAL A   8       3.758   1.032  14.208  1.00 11.97           C  \nATOM     55  N   ALA A   9       5.606   4.546  11.941  1.00  3.73           N  \nATOM     56  CA  ALA A   9       5.598   5.767  11.082  1.00  3.56           C  \nATOM     57  C   ALA A   9       6.441   5.527   9.850  1.00  4.13           C  \nATOM     58  O   ALA A   9       6.052   5.933   8.744  1.00  4.36           O  \nATOM     59  CB  ALA A   9       6.022   6.977  11.891  1.00  4.80           C  \nATOM     60  N   ARG A  10       7.647   4.909  10.005  1.00  3.73           N  \nATOM     61  CA  ARG A  10       8.496   4.609   8.837  1.00  3.38           C  \nATOM     62  C   ARG A  10       7.798   3.609   7.876  1.00  3.47           C  \nATOM     63  O   ARG A  10       7.878   3.778   6.651  1.00  4.67           O  \nATOM     64  CB  ARG A  10       9.847   4.020   9.305  1.00  3.95           C  \nATOM     65  CG  ARG A  10      10.752   3.607   8.149  1.00  4.55           C  \nATOM     66  CD  ARG A  10      11.226   4.699   7.244  1.00  5.89           C  \nATOM     67  NE  ARG A  10      12.143   5.571   8.035  1.00  6.20           N  \nATOM     68  CZ  ARG A  10      12.758   6.609   7.443  1.00  7.52           C  \nATOM     69  NH1 ARG A  10      12.539   6.932   6.158  1.00 10.68           N  \nATOM     70  NH2 ARG A  10      13.601   7.322   8.202  1.00  9.48           N  \nATOM     71  N   SER A  11       7.186   2.582   8.445  1.00  5.19           N  \nATOM     72  CA  SER A  11       6.500   1.584   7.565  1.00  4.60           C  \nATOM     73  C   SER A  11       5.382   2.313   6.773  1.00  4.84           C  \nATOM     74  O   SER A  11       5.213   2.016   5.557  1.00  5.84           O  \nATOM     75  CB  SER A  11       5.908   0.462   8.400  1.00  5.91           C  \nATOM     76  OG  SER A  11       6.990  -0.272   9.012  1.00  8.38           O  \nATOM     77  N   ASN A  12       4.648   3.182   7.446  1.00  3.54           N  \nATOM     78  CA  ASN A  12       3.545   3.935   6.751  1.00  4.57           C  \nATOM     79  C   ASN A  12       4.107   4.851   5.691  1.00  4.14           C  \nATOM     80  O   ASN A  12       3.536   5.001   4.617  1.00  5.52           O  \nATOM     81  CB  ASN A  12       2.663   4.677   7.748  1.00  6.42           C  \nATOM     82  CG  ASN A  12       1.802   3.735   8.610  1.00  8.25           C  \nATOM     83  OD1 ASN A  12       1.567   2.613   8.165  1.00 12.72           O  \nATOM     84  ND2 ASN A  12       1.394   4.252   9.767  1.00  9.92           N  \nATOM     85  N   PHE A  13       5.259   5.498   6.005  1.00  3.43           N  \nATOM     86  CA  PHE A  13       5.929   6.358   5.055  1.00  3.49           C  \nATOM     87  C   PHE A  13       6.304   5.578   3.799  1.00  3.40           C  \nATOM     88  O   PHE A  13       6.136   6.072   2.653  1.00  4.07           O  \nATOM     89  CB  PHE A  13       7.183   6.994   5.754  1.00  5.48           C  \nATOM     90  CG  PHE A  13       7.884   8.006   4.883  1.00  5.57           C  \nATOM     91  CD1 PHE A  13       8.906   7.586   4.027  1.00  6.99           C  \nATOM     92  CD2 PHE A  13       7.532   9.373   4.983  1.00  6.52           C  \nATOM     93  CE1 PHE A  13       9.560   8.539   3.194  1.00  8.20           C  \nATOM     94  CE2 PHE A  13       8.176  10.281   4.145  1.00  6.34           C  \nATOM     95  CZ  PHE A  13       9.141   9.845   3.292  1.00  6.84           C  \nATOM     96  N   ASN A  14       6.900   4.390   3.989  1.00  3.64           N  \nATOM     97  CA  ASN A  14       7.331   3.607   2.791  1.00  4.31           C  \nATOM     98  C   ASN A  14       6.116   3.210   1.915  1.00  3.98           C  \nATOM     99  O   ASN A  14       6.240   3.144   0.684  1.00  6.22           O  \nATOM    100  CB  ASN A  14       8.145   2.404   3.240  1.00  5.81           C  \nATOM    101  CG  ASN A  14       9.555   2.856   3.730  1.00  6.82           C  \nATOM    102  OD1 ASN A  14      10.013   3.895   3.323  1.00  9.43           O  \nATOM    103  ND2 ASN A  14      10.120   1.956   4.539  1.00  8.21           N  \nATOM    104  N   VAL A  15       4.993   2.927   2.571  1.00  3.76           N  \nATOM    105  CA  VAL A  15       3.782   2.599   1.742  1.00  3.98           C  \nATOM    106  C   VAL A  15       3.296   3.871   1.004  1.00  3.80           C  \nATOM    107  O   VAL A  15       2.947   3.817  -0.189  1.00  4.85           O  \nATOM    108  CB  VAL A  15       2.698   1.953   2.608  1.00  4.71           C  \nATOM    109  CG1 VAL A  15       1.384   1.826   1.806  1.00  6.67           C  \nATOM    110  CG2 VAL A  15       3.174   0.533   3.005  1.00  6.26           C  \nATOM    111  N   CYS A  16       3.321   4.987   1.720  1.00  3.79           N  \nATOM    112  CA  CYS A  16       2.890   6.285   1.126  1.00  3.54           C  \nATOM    113  C   CYS A  16       3.687   6.597  -0.111  1.00  3.48           C  \nATOM    114  O   CYS A  16       3.200   7.147  -1.103  1.00  4.63           O  \nATOM    115  CB  CYS A  16       3.039   7.369   2.240  1.00  4.58           C  \nATOM    116  SG  CYS A  16       2.559   9.014   1.649  1.00  5.66           S  \nATOM    117  N   ARG A  17       4.997   6.227  -0.100  1.00  3.99           N  \nATOM    118  CA  ARG A  17       5.895   6.489  -1.213  1.00  3.83           C  \nATOM    119  C   ARG A  17       5.738   5.560  -2.409  1.00  3.79           C  \nATOM    120  O   ARG A  17       6.228   5.901  -3.507  1.00  5.39           O  \nATOM    121  CB  ARG A  17       7.370   6.507  -0.731  1.00  4.11           C  \nATOM    122  CG  ARG A  17       7.717   7.687   0.206  1.00  4.69           C  \nATOM    123  CD  ARG A  17       7.949   8.947  -0.615  1.00  5.10           C  \nATOM    124  NE  ARG A  17       9.212   8.856  -1.337  1.00  4.71           N  \nATOM    125  CZ  ARG A  17       9.537   9.533  -2.431  1.00  5.28           C  \nATOM    126  NH1 ARG A  17       8.659  10.350  -3.032  1.00  6.67           N  \nATOM    127  NH2 ARG A  17      10.793   9.491  -2.899  1.00  6.41           N  \nATOM    128  N   LEU A  18       5.051   4.411  -2.204  1.00  4.70           N  \nATOM    129  CA  LEU A  18       4.933   3.431  -3.326  1.00  5.46           C  \nATOM    130  C   LEU A  18       4.397   4.014  -4.620  1.00  5.13           C  \nATOM    131  O   LEU A  18       4.988   3.755  -5.687  1.00  5.55           O  \nATOM    132  CB  LEU A  18       4.196   2.184  -2.863  1.00  6.47           C  \nATOM    133  CG  LEU A  18       4.960   1.178  -1.991  1.00  7.43           C  \nATOM    134  CD1 LEU A  18       3.907   0.097  -1.634  1.00  8.70           C  \nATOM    135  CD2 LEU A  18       6.129   0.606  -2.768  1.00  9.39           C  \nATOM    136  N   PRO A  19       3.329   4.795  -4.543  1.00  4.28           N  \nATOM    137  CA  PRO A  19       2.792   5.376  -5.797  1.00  5.38           C  \nATOM    138  C   PRO A  19       3.573   6.540  -6.322  1.00  6.30           C  \nATOM    139  O   PRO A  19       3.260   7.045  -7.422  1.00  9.62           O  \nATOM    140  CB  PRO A  19       1.358   5.766  -5.472  1.00  5.87           C  \nATOM    141  CG  PRO A  19       1.223   5.694  -3.993  1.00  6.47           C  \nATOM    142  CD  PRO A  19       2.421   4.941  -3.408  1.00  6.45           C  \nATOM    143  N   GLY A  20       4.565   7.047  -5.559  1.00  4.94           N  \nATOM    144  CA  GLY A  20       5.366   8.191  -6.018  1.00  5.39           C  \nATOM    145  C   GLY A  20       5.007   9.481  -5.280  1.00  5.03           C  \nATOM    146  O   GLY A  20       5.535  10.510  -5.730  1.00  7.34           O  \nATOM    147  N   THR A  21       4.181   9.438  -4.262  1.00  4.10           N  \nATOM    148  CA  THR A  21       3.767  10.609  -3.513  1.00  3.94           C  \nATOM    149  C   THR A  21       5.017  11.397  -3.042  1.00  3.96           C  \nATOM    150  O   THR A  21       5.947  10.757  -2.523  1.00  5.82           O  \nATOM    151  CB  THR A  21       2.992  10.188  -2.225  1.00  4.13           C  \nATOM    152  OG1 THR A  21       2.051   9.144  -2.623  1.00  5.45           O  \nATOM    153  CG2 THR A  21       2.260  11.349  -1.551  1.00  5.41           C  \nATOM    154  N   PRO A  22       4.971  12.703  -3.176  1.00  5.04           N  \nATOM    155  CA  PRO A  22       6.143  13.513  -2.696  1.00  4.69           C  \nATOM    156  C   PRO A  22       6.400  13.233  -1.225  1.00  4.19           C  \nATOM    157  O   PRO A  22       5.485  13.061  -0.382  1.00  4.47           O  \nATOM    158  CB  PRO A  22       5.703  14.969  -2.920  1.00  7.12           C  \nATOM    159  CG  PRO A  22       4.676  14.893  -3.996  1.00  7.03           C  \nATOM    160  CD  PRO A  22       3.964  13.567  -3.811  1.00  4.90           C  \nATOM    161  N   GLU A  23       7.728  13.297  -0.921  1.00  5.16           N  \nATOM    162  CA  GLU A  23       8.114  13.103   0.500  1.00  5.31           C  \nATOM    163  C   GLU A  23       7.427  14.073   1.410  1.00  4.11           C  \nATOM    164  O   GLU A  23       7.036  13.682   2.540  1.00  5.11           O  \nATOM    165  CB  GLU A  23       9.648  13.285   0.660  1.00  6.16           C  \nATOM    166  CG  GLU A  23      10.440  12.093   0.063  1.00  7.48           C  \nATOM    167  CD  GLU A  23      11.941  12.170   0.391  1.00  9.40           C  \nATOM    168  OE1 GLU A  23      12.416  13.225   0.681  1.00 10.40           O  \nATOM    169  OE2 GLU A  23      12.539  11.070   0.292  1.00 13.32           O  \nATOM    170  N   ALA A  24       7.212  15.334   0.966  1.00  4.56           N  \nATOM    171  CA  ALA A  24       6.614  16.317   1.913  1.00  4.49           C  \nATOM    172  C   ALA A  24       5.212  15.936   2.350  1.00  4.10           C  \nATOM    173  O   ALA A  24       4.782  16.166   3.495  1.00  5.64           O  \nATOM    174  CB  ALA A  24       6.605  17.695   1.246  1.00  5.80           C  \nATOM    175  N   ILE A  25       4.445  15.318   1.405  1.00  4.37           N  \nATOM    176  CA  ILE A  25       3.074  14.894   1.756  1.00  5.44           C  \nATOM    177  C   ILE A  25       3.085  13.643   2.645  1.00  4.32           C  \nATOM    178  O   ILE A  25       2.315  13.523   3.578  1.00  4.72           O  \nATOM    179  CB  ILE A  25       2.204  14.637   0.462  1.00  6.42           C  \nATOM    180  CG1 ILE A  25       1.815  16.048  -0.129  1.00  7.50           C  \nATOM    181  CG2 ILE A  25       0.903  13.864   0.811  1.00  7.65           C  \nATOM    182  CD1 ILE A  25       0.756  16.761   0.757  1.00  7.80           C  \nATOM    183  N   CYS A  26       4.032  12.764   2.313  1.00  3.92           N  \nATOM    184  CA  CYS A  26       4.180  11.549   3.187  1.00  4.37           C  \nATOM    185  C   CYS A  26       4.632  11.944   4.596  1.00  3.95           C  \nATOM    186  O   CYS A  26       4.227  11.252   5.547  1.00  4.74           O  \nATOM    187  CB  CYS A  26       5.038  10.518   2.539  1.00  4.63           C  \nATOM    188  SG  CYS A  26       4.349   9.794   1.022  1.00  5.61           S  \nATOM    189  N   ALA A  27       5.408  13.012   4.694  1.00  3.89           N  \nATOM    190  CA  ALA A  27       5.879  13.502   6.026  1.00  4.43           C  \nATOM    191  C   ALA A  27       4.696  13.908   6.882  1.00  4.26           C  \nATOM    192  O   ALA A  27       4.528  13.422   8.025  1.00  5.44           O  \nATOM    193  CB  ALA A  27       6.880  14.615   5.830  1.00  5.36           C  \nATOM    194  N   THR A  28       3.827  14.802   6.358  1.00  4.53           N  \nATOM    195  CA  THR A  28       2.691  15.221   7.194  1.00  5.08           C  \nATOM    196  C   THR A  28       1.672  14.132   7.434  1.00  4.62           C  \nATOM    197  O   THR A  28       0.947  14.112   8.468  1.00  7.80           O  \nATOM    198  CB  THR A  28       1.986  16.520   6.614  1.00  6.03           C  \nATOM    199  OG1 THR A  28       1.664  16.221   5.230  1.00  7.19           O  \nATOM    200  CG2 THR A  28       2.914  17.739   6.700  1.00  7.34           C  \nATOM    201  N   TYR A  29       1.621  13.190   6.511  1.00  5.01           N  \nATOM    202  CA  TYR A  29       0.715  12.045   6.657  1.00  6.60           C  \nATOM    203  C   TYR A  29       1.125  11.125   7.815  1.00  4.92           C  \nATOM    204  O   TYR A  29       0.286  10.632   8.545  1.00  7.13           O  \nATOM    205  CB  TYR A  29       0.755  11.229   5.322  1.00  9.66           C  \nATOM    206  CG  TYR A  29      -0.203  10.044   5.354  1.00 11.56           C  \nATOM    207  CD1 TYR A  29      -1.547  10.337   5.645  1.00 12.85           C  \nATOM    208  CD2 TYR A  29       0.193   8.750   5.100  1.00 14.44           C  \nATOM    209  CE1 TYR A  29      -2.496   9.329   5.673  1.00 16.61           C  \nATOM    210  CE2 TYR A  29      -0.801   7.705   5.156  1.00 17.11           C  \nATOM    211  CZ  TYR A  29      -2.079   8.031   5.430  1.00 19.99           C  \nATOM    212  OH  TYR A  29      -3.097   7.057   5.458  1.00 28.98           O  \nATOM    213  N   THR A  30       2.470  10.984   7.995  1.00  5.31           N  \nATOM    214  CA  THR A  30       2.986   9.994   8.950  1.00  5.70           C  \nATOM    215  C   THR A  30       3.609  10.505  10.230  1.00  6.28           C  \nATOM    216  O   THR A  30       3.766   9.715  11.186  1.00  8.77           O  \nATOM    217  CB  THR A  30       4.076   9.103   8.225  1.00  6.55           C  \nATOM    218  OG1 THR A  30       5.125  10.027   7.824  1.00  6.57           O  \nATOM    219  CG2 THR A  30       3.493   8.324   7.035  1.00  7.29           C  \nATOM    220  N   GLY A  31       3.984  11.764  10.241  1.00  4.99           N  \nATOM    221  CA  GLY A  31       4.769  12.336  11.360  1.00  5.50           C  \nATOM    222  C   GLY A  31       6.255  12.243  11.106  1.00  4.19           C  \nATOM    223  O   GLY A  31       7.037  12.750  11.954  1.00  6.12           O  \nATOM    224  N   CYS A  32       6.710  11.631   9.992  1.00  4.30           N  \nATOM    225  CA  CYS A  32       8.140  11.694   9.635  1.00  4.89           C  \nATOM    226  C   CYS A  32       8.500  13.141   9.206  1.00  5.50           C  \nATOM    227  O   CYS A  32       7.581  13.949   8.944  1.00  5.82           O  \nATOM    228  CB  CYS A  32       8.504  10.686   8.530  1.00  4.66           C  \nATOM    229  SG  CYS A  32       8.048   8.987   8.881  1.00  5.33           S  \nATOM    230  N   ILE A  33       9.793  13.410   9.173  1.00  6.02           N  \nATOM    231  CA  ILE A  33      10.280  14.760   8.823  1.00  5.24           C  \nATOM    232  C   ILE A  33      11.346  14.658   7.743  1.00  5.16           C  \nATOM    233  O   ILE A  33      11.971  13.583   7.552  1.00  7.19           O  \nATOM    234  CB  ILE A  33      10.790  15.535  10.085  1.00  5.49           C  \nATOM    235  CG1 ILE A  33      12.059  14.803  10.671  1.00  6.85           C  \nATOM    236  CG2 ILE A  33       9.684  15.686  11.138  1.00  6.45           C  \nATOM    237  CD1 ILE A  33      12.733  15.676  11.781  1.00  8.94           C  \nATOM    238  N   ILE A  34      11.490  15.773   7.038  1.00  5.52           N  \nATOM    239  CA  ILE A  34      12.552  15.877   6.036  1.00  6.82           C  \nATOM    240  C   ILE A  34      13.590  16.917   6.560  1.00  6.92           C  \nATOM    241  O   ILE A  34      13.168  18.006   6.945  1.00  9.22           O  \nATOM    242  CB  ILE A  34      11.987  16.360   4.681  1.00  8.11           C  \nATOM    243  CG1 ILE A  34      10.914  15.338   4.163  1.00  9.59           C  \nATOM    244  CG2 ILE A  34      13.131  16.517   3.629  1.00  9.73           C  \nATOM    245  CD1 ILE A  34      10.151  16.024   2.938  1.00 13.41           C  \nATOM    246  N   ILE A  35      14.856  16.493   6.536  1.00  7.06           N  \nATOM    247  CA  ILE A  35      15.930  17.454   6.941  1.00  7.52           C  \nATOM    248  C   ILE A  35      16.913  17.550   5.819  1.00  6.63           C  \nATOM    249  O   ILE A  35      17.097  16.660   4.970  1.00  7.90           O  \nATOM    250  CB  ILE A  35      16.622  16.995   8.285  1.00  8.07           C  \nATOM    251  CG1 ILE A  35      17.360  15.651   8.067  1.00  9.41           C  \nATOM    252  CG2 ILE A  35      15.592  16.974   9.434  1.00  9.46           C  \nATOM    253  CD1 ILE A  35      18.298  15.206   9.219  1.00  9.85           C  \nATOM    254  N   PRO A  36      17.664  18.669   5.806  1.00  8.07           N  \nATOM    255  CA  PRO A  36      18.635  18.861   4.738  1.00  8.78           C  \nATOM    256  C   PRO A  36      19.925  18.042   4.949  1.00  8.31           C  \nATOM    257  O   PRO A  36      20.593  17.742   3.945  1.00  9.09           O  \nATOM    258  CB  PRO A  36      18.945  20.364   4.783  1.00  9.67           C  \nATOM    259  CG  PRO A  36      18.238  20.937   5.908  1.00 10.15           C  \nATOM    260  CD  PRO A  36      17.371  19.900   6.596  1.00  9.53           C  \nATOM    261  N   GLY A  37      20.172  17.730   6.217  1.00  8.48           N  \nATOM    262  CA  GLY A  37      21.452  16.969   6.513  1.00  9.20           C  \nATOM    263  C   GLY A  37      21.143  15.478   6.427  1.00 10.41           C  \nATOM    264  O   GLY A  37      20.138  15.023   5.878  1.00 12.06           O  \nATOM    265  N   ALA A  38      22.055  14.701   7.032  1.00  9.24           N  \nATOM    266  CA  ALA A  38      22.019  13.242   7.020  1.00  9.24           C  \nATOM    267  C   ALA A  38      21.944  12.628   8.396  1.00  9.60           C  \nATOM    268  O   ALA A  38      21.869  11.387   8.435  1.00 13.65           O  \nATOM    269  CB  ALA A  38      23.246  12.697   6.275  1.00 10.43           C  \nATOM    270  N   THR A  39      21.894  13.435   9.436  1.00  8.70           N  \nATOM    271  CA  THR A  39      21.936  12.911  10.809  1.00  9.46           C  \nATOM    272  C   THR A  39      20.615  13.191  11.521  1.00  8.32           C  \nATOM    273  O   THR A  39      20.357  14.317  11.948  1.00  9.89           O  \nATOM    274  CB  THR A  39      23.131  13.601  11.593  1.00 10.72           C  \nATOM    275  OG1 THR A  39      24.284  13.401  10.709  1.00 11.66           O  \nATOM    276  CG2 THR A  39      23.340  12.935  12.962  1.00 11.81           C  \nATOM    277  N   CYS A  40      19.827  12.110  11.642  1.00  7.64           N  \nATOM    278  CA  CYS A  40      18.504  12.312  12.298  1.00  8.05           C  \nATOM    279  C   CYS A  40      18.684  12.451  13.784  1.00  7.63           C  \nATOM    280  O   CYS A  40      19.533  11.718  14.362  1.00  9.64           O  \nATOM    281  CB  CYS A  40      17.582  11.117  11.996  1.00  7.80           C  \nATOM    282  SG  CYS A  40      17.199  10.929  10.237  1.00  7.30           S  \nATOM    283  N   PRO A  41      17.880  13.266  14.426  1.00  8.00           N  \nATOM    284  CA  PRO A  41      17.924  13.421  15.877  1.00  8.96           C  \nATOM    285  C   PRO A  41      17.392  12.206  16.594  1.00  9.06           C  \nATOM    286  O   PRO A  41      16.652  11.368  16.033  1.00  8.82           O  \nATOM    287  CB  PRO A  41      17.076  14.658  16.145  1.00 10.39           C  \nATOM    288  CG  PRO A  41      16.098  14.689  14.997  1.00 10.99           C  \nATOM    289  CD  PRO A  41      16.859  14.150  13.779  1.00 10.49           C  \nATOM    290  N   GLY A  42      17.728  12.124  17.884  1.00  7.55           N  \nATOM    291  CA  GLY A  42      17.334  10.956  18.691  1.00  8.00           C  \nATOM    292  C   GLY A  42      15.875  10.688  18.871  1.00  7.22           C  \nATOM    293  O   GLY A  42      15.434   9.550  19.166  1.00  8.41           O  \nATOM    294  N   ASP A  43      15.036  11.747  18.715  1.00  5.54           N  \nATOM    295  CA  ASP A  43      13.564  11.573  18.836  1.00  5.85           C  \nATOM    296  C   ASP A  43      12.936  11.227  17.470  1.00  5.87           C  \nATOM    297  O   ASP A  43      11.720  11.040  17.428  1.00  7.29           O  \nATOM    298  CB  ASP A  43      12.933  12.737  19.580  1.00  6.72           C  \nATOM    299  CG  ASP A  43      13.140  14.094  18.958  1.00  8.59           C  \nATOM    300  OD1 ASP A  43      14.109  14.303  18.212  1.00  9.59           O  \nATOM    301  OD2 ASP A  43      12.267  14.963  19.265  1.00 11.45           O  \nATOM    302  N   TYR A  44      13.725  11.174  16.425  1.00  5.22           N  \nATOM    303  CA  TYR A  44      13.257  10.745  15.081  1.00  5.56           C  \nATOM    304  C   TYR A  44      14.275   9.687  14.612  1.00  4.61           C  \nATOM    305  O   TYR A  44      14.930   9.862  13.568  1.00  6.04           O  \nATOM    306  CB  TYR A  44      13.200  11.914  14.071  1.00  5.41           C  \nATOM    307  CG  TYR A  44      12.000  12.819  14.399  1.00  5.34           C  \nATOM    308  CD1 TYR A  44      12.119  13.853  15.332  1.00  6.59           C  \nATOM    309  CD2 TYR A  44      10.775  12.617  13.762  1.00  5.94           C  \nATOM    310  CE1 TYR A  44      11.045  14.675  15.610  1.00  5.97           C  \nATOM    311  CE2 TYR A  44       9.676  13.433  14.048  1.00  5.17           C  \nATOM    312  CZ  TYR A  44       9.802  14.456  14.996  1.00  5.96           C  \nATOM    313  OH  TYR A  44       8.740  15.265  15.269  1.00  8.60           O  \nATOM    314  N   ALA A  45      14.342   8.640  15.422  1.00  4.76           N  \nATOM    315  CA  ALA A  45      15.445   7.667  15.246  1.00  5.89           C  \nATOM    316  C   ALA A  45      15.171   6.533  14.280  1.00  6.67           C  \nATOM    317  O   ALA A  45      16.093   5.705  14.039  1.00  7.56           O  \nATOM    318  CB  ALA A  45      15.680   7.099  16.682  1.00  6.82           C  \nATOM    319  N   ASN A  46      13.966   6.502  13.739  1.00  5.80           N  \nATOM    320  CA  ASN A  46      13.512   5.395  12.878  1.00  6.15           C  \nATOM    321  C   ASN A  46      13.311   5.853  11.455  1.00  6.61           C  \nATOM    322  O   ASN A  46      13.733   6.929  11.026  1.00  7.18           O  \nATOM    323  CB  ASN A  46      12.266   4.769  13.501  1.00  7.27           C  \nATOM    324  CG  ASN A  46      12.538   4.304  14.922  1.00  7.98           C  \nATOM    325  OD1 ASN A  46      11.982   4.849  15.886  1.00 11.00           O  \nATOM    326  ND2 ASN A  46      13.407   3.298  15.015  1.00 10.32           N  \nATOM    327  OXT ASN A  46      12.703   4.973  10.746  1.00  7.86           O  \nTER     328      ASN A  46                                                      \nCONECT   20  282                                                                \nCONECT   26  229                                                                \nCONECT  116  188                                                                \nCONECT  188  116                                                                \nCONECT  229   26                                                                \nCONECT  282   20                                                                \nMASTER      227    0    0    2    2    1    0    6  327    1    6    4          \nEND                                                                             \n', 1);
      						    		$.get('http://www.rcsb.org/pdb/files/'+pdb_name+'.pdb', function(data) {			
      						    			var mol = ChemDoodle.readPDB(data);
      						    			pdb.loadMolecule(mol);
      						    			pdb.startAnimation();
      						    		});
      	    				    	}
      	    					}
      	    				}
      	    			});
      	    			
      	    			_this.p3dProtein.add(pan);
      	    		}
    			}
    			else{
    				_this.p3dProtein.setTitle('No proteins found');
    			}


  	    	}
    	});
    	
//    	$.get('http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/brca2/xref?dbname=pdb', 
    	
    	
    	
    	
//    	http://www.rcsb.org/pdb/files/1A17.pdb
    	
//    	http://www.rcsb.org/pdb/files/AAAA.pdb
    	
//		var pan = Ext.create('Ext.panel.Panel',{
//			title:"3D Protein Viewer",
//	        border:false,
//	        cls:'panel-border-left',
//			flex:3,
//			bodyPadding:5,
//			autoScroll:true,
//			html:'<canvas class="ChemDoodleWebComponent" id="pdb_canvas_prueba" width="600" height="600" style="width: 600px; height: 600px; ">This browser does not support HTML5/Canvas.</canvas>',
//
//		});

    }
    return this.p3dProtein;

};

TranscriptInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function (evt){
		_this.dataReceived(JSON.parse(cellBaseDataAdapter.toJSON()));//TODO
	});
	cellBaseDataAdapter.fill("feature","transcript", this.feature.feature.stableId, "fullinfo");
};
TranscriptInfoWidget.prototype.dataReceived = function (data){
	this.data=data[0];
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};



VCFVariantInfoWidget.prototype.draw = InfoWidget.prototype.draw;
VCFVariantInfoWidget.prototype.render = InfoWidget.prototype.render;
VCFVariantInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
VCFVariantInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
VCFVariantInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
VCFVariantInfoWidget.prototype.getVCFVariantTemplate = InfoWidget.prototype.getVCFVariantTemplate;

function VCFVariantInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "VCF variant Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

VCFVariantInfoWidget.prototype.getdataTypes = function (){
	return dataTypes=[
	            { text: "Genomic", children: [
	                { text: "Information"}
	            ] }
	        ];
};
VCFVariantInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Information":  this.panel.add(this.getInfoPanel(this.data).show()); break;
			case "Consequence Type": break;
			case "Population": break;
		}
	}
};

VCFVariantInfoWidget.prototype.getInfoPanel = function(data){
    if(this.infoPanel==null){

    	var tpl = this.getVCFVariantTemplate();

		this.infoPanel = Ext.create('Ext.panel.Panel',{
			title:"Information",
	        border:false,
	        cls:'panel-border-left',
			flex:3,    
			bodyPadding:10,
			data:data,
			tpl:tpl
		});

    }
    return this.infoPanel;
};

VCFVariantInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
	
	this.dataReceived(this.feature);
};

VCFVariantInfoWidget.prototype.dataReceived = function (data){
	this.data = data.feature;
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};
function CellBaseManager(species, args) {
//	console.log(species);

	// these 3 parameters can be modified 
//	this.host = "http://ws.bioinfo.cipf.es/celldb/rest";
	this.host = "http://ws.bioinfo.cipf.es/cellbase/rest";
	this.version = "v1";
	this.species = species;
	
//	if(args != null) {
//		
//	}
//		this.host = 'http://localhost:8080/celldb/rest';

	CELLBASEHOST=this.host;
	
	
	this.category = null;
	this.subcategory = null;

	// commons query params
	this.contentformat = "jsonp";
	this.fileformat = "";
	this.outputcompress = false;
	this.dataType = "script";

	this.query = "";
	this.resource = "";

	this.async = true;
	
	//Queue of queries
	this.maxQuery = 20;
	this.numberQueries = 0;
	this.results = new Array();
	this.resultsCount = new Array();
	this.batching = false;
	
	//Events
	this.completed = new Event();
	this.successed = new Event();
	this.batchSuccessed = new Event();
	this.error = new Event();

	this.setVersion = function(version){
		this.version = version;
	},
	
	this.setSpecies = function(specie){
		this.species = specie;
	},
	
	this.getVersion = function(){
		return this.version;
	},
	
	this.getSpecies = function(){
		return this.species;
	},
	
	
	
	/** Cross-domain requests and dataType: "jsonp" requests do not support synchronous operation. 
	 * Note that synchronous requests may temporarily lock the browser, disabling any actions while the request is active. **/
	this.setAsync = function(async){
		this.async = async;
	},

	this.getUrl = function() {
		if (this.query != null) {
		
			return this.host + "/" + this.version + "/" + this.species + "/"+ this.category + "/" + this.subcategory + "/" + this.query+ "/" + this.resource; // + "?contentformat=" + this.contentformat;
		} else {
			return this.host + "/" + this.version + "/" + this.species + "/"+ this.category + "/" + this.subcategory + "/"+ this.resource; // + "?contentformat=" +;
		}

	},

	this.get = function(category, subcategory, query, resource, callbackFunction) {
		if(query instanceof Array){
				this.batching = true;
				this.results= new Array();
				this.getMultiple(category, subcategory, query, resource);
		}
		else{
				query = new String(query);
				query = query.replace(/\s/g, "");
				var querySplitted = query.split(",");
				if (this.maxQuery <querySplitted.length){
					this.batching = true;
					this.getMultiple(category, subcategory, querySplitted, resource, callbackFunction);
				}
				else{
					this.batching = false;
					this.getSingle(category, subcategory, query, resource, callbackFunction);
				}
		}
	},
//	this.getAllSpecies = function() {
//		
//		//Este código todavía no funciona xq el this._callServer(url) cellBase no tiene una respuesta preparada para this._callServer(url)
//		//es decir, no devuelve jsonp, cuando este todo implementado ya merecerá la pena hacerlo bien
//		var url = this.host + "/" + this.version + "/species";
//		this._callServer(url);
//	},
	this._joinToResults = function(response){
		this.resultsCount.push(true);
		this.results[response.id] = response.data;
		if (this.numberQueries == this.resultsCount.length){
			var result = new Array();
			
			for (var i = 0; i< this.results.length; i++){
				for (var j = 0; j< this.results[i].length; j++){
					result.push(this.results[i][j]);
				}
			}
			this.successed.notify(result);
		}
	},
	
	this.getSingle = function(category, subcategory, query, resource, batchID, callbackFunction) {
		this.category = category;
		this.subcategory = subcategory;
		this.query = query;
		this.resource = resource;
		var url = this.getUrl();
		this._callServer(url, batchID, callbackFunction);
	},
	
	this.getMultiple = function(category, subcategory, queryArray, resource, callbackFunction) {
		var pieces = new Array();
		//Primero dividimos el queryArray en trocitos tratables
		if (queryArray.length > this.maxQuery){
			for (var i = 0; i < queryArray.length; i=i+this.maxQuery){
				pieces.push(queryArray.slice(i, i+(this.maxQuery)));
			}
		}
		
		this.numberQueries = pieces.length;
		var _this = this;
		
		this.batchSuccessed.addEventListener(function (evt, response){
			_this._joinToResults(response);
		});	
		
		for (var i = 0; i < pieces.length; i++){
		//	this.get(category, subcategory, pieces[i].toString(), resource);
			this.results.push(new Array());
			this.getSingle(category, subcategory, pieces[i].toString(), resource, i);
		}
	},


	this._callServer = function(url, batchID, callbackFunction) {
//		console.log(url+"?contentformat="+this.contentformat+"&outputcompress="+this.outputcompress+"&callbackParam=reponse");
		var _this = this;
		$.ajax( {
			url : url,
			type : "GET",
			async : this.async,
			data : {
				of : this.contentformat,
				outputcompress : this.outputcompress,
				callbackParam :  "response"
			},
			dataType : this.dataType,
			jsonp : "callback",
			success : function() {
				
				if( typeof( response ) != 'undefined'  ){
					if (callbackFunction!=null){
						callbackFunction(response);
					}
					
					if (_this.batching){
						_this.batchSuccessed.notify({data:response, id:batchID});
					}else{
						_this.successed.notify(response);
					}
				}
				else{
					_this.error.notify();
				}
				
			},
			complete : function() {
				_this.completed.notify();
				
			},
			error : function() {
				_this.error.notify();
				
			}
		});
	};
}
ExpressionGenomicAttributesWidget.prototype.draw = GenomicAttributesWidget.prototype.draw;
ExpressionGenomicAttributesWidget.prototype.getMainPanel = GenomicAttributesWidget.prototype.getMainPanel;
ExpressionGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
ExpressionGenomicAttributesWidget.prototype.drawKaryotype = GenomicAttributesWidget.prototype.drawKaryotype;
ExpressionGenomicAttributesWidget.prototype.makeGrid = GenomicAttributesWidget.prototype.makeGrid;
ExpressionGenomicAttributesWidget.prototype.getKaryotypePanelId = GenomicAttributesWidget.prototype.getKaryotypePanelId;
ExpressionGenomicAttributesWidget.prototype.onAdditionalInformationClick = GenomicAttributesWidget.prototype.onAdditionalInformationClick;


function ExpressionGenomicAttributesWidget(species, args){
	if (args == null){
		args = new Object();
	}
	args.columnsCount = 2;
	args.title = "Expression";
	args.tags = ["expression"];
	args.featureType = 'gene';
	args.listWidgetArgs = {title:"Filter",action:'filter'};
	GenomicAttributesWidget.prototype.constructor.call(this, species, args);
};

ExpressionGenomicAttributesWidget.prototype.fill = function (queryNames){
	var _this = this;
	
	var normalized = Normalizer.normalizeArray(values);
	var colors = [];
	for ( var i = 0; i < normalized.length; i++) {
		if (!isNaN(parseFloat(values[i]))){
			colors.push( Colors.getColorByScoreValue(normalized[i]).HexString());
		}
		else{
			colors.push( "#000000");
		}
	}
	
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function(sender){		
		_this.karyotypePanel.setLoading("Retrieving data");
		
		for (var i = 0; i < cellBaseDataAdapter.dataset.toJSON().length; i++) {
			_this.karyotypeWidget.mark(cellBaseDataAdapter.dataset.toJSON()[i],  colors[i]);
		}
		_this.query = {"dataset": cellBaseDataAdapter.dataset, "resource":queryNames }; 
		_this.features=cellBaseDataAdapter.dataset.toJSON();
		_this.karyotypePanel.setLoading(false);
		_this.filtersButton.enable();
		_this.addTrackButton.enable();
	});
	cellBaseDataAdapter.fill("feature", "gene", queryNames.toString(), "info");
};

ExpressionGenomicAttributesWidget.prototype.dataChange = function (items){
	try{
				var _this = this;
				this.karyotypePanel.setLoading("Connecting to Database");
				this.karyotypeWidget.unmark();
				var _this=this;
				var externalNames = [];
				values = [];
				
				for (var i = 0; i < items.length; i++) {
					externalNames.push(items[i].data[0]);
					values.push(items[i].data[1]);
					
				}	
				
				if (items.length > 0){
					this.fill(externalNames, values);
				}
	}
	catch(e){
		alert(e);
		this.panel.setLoading(false);
	}
};ExpressionNetworkAttributesWidget.prototype.draw = NetworkAttributesWidget.prototype.draw;
ExpressionNetworkAttributesWidget.prototype.render = NetworkAttributesWidget.prototype.render;
ExpressionNetworkAttributesWidget.prototype.render = NetworkAttributesWidget.prototype.render;
ExpressionNetworkAttributesWidget.prototype.makeGrid = NetworkAttributesWidget.prototype.makeGrid;

ExpressionNetworkAttributesWidget.prototype.getDetailPanel = NetworkAttributesWidget.prototype.getDetailPanel;
ExpressionNetworkAttributesWidget.prototype.getNetworkPanelId = NetworkAttributesWidget.prototype.getNetworkPanelId;
ExpressionNetworkAttributesWidget.prototype.drawNetwork = NetworkAttributesWidget.prototype.drawNetwork;
ExpressionNetworkAttributesWidget.prototype.dataChanged = NetworkAttributesWidget.prototype.dataChanged;
ExpressionNetworkAttributesWidget.prototype.getFoundVertices = NetworkAttributesWidget.prototype.getFoundVertices;
ExpressionNetworkAttributesWidget.prototype.getVertexAttributesByName = NetworkAttributesWidget.prototype.getVertexAttributesByName;
//ExpressionNetworkAttributesWidget.prototype.getButtons = NetworkAttributesWidget.prototype.getButtons;


function ExpressionNetworkAttributesWidget(args){
	if (args == null){
		args = new Object();
	}
	this.id = "ExpressionNetworkAttributes_" + Math.random();
	args.columnsCount = 2;
	args.title = "Expression";
	args.tags = ["expression"];
	NetworkAttributesWidget.prototype.constructor.call(this, args);
	
	/** EVENTS **/
	this.applyColors = new Event();
};

ExpressionNetworkAttributesWidget.prototype.getButtons = function (){
	var _this = this;
	

	this.rescaleCheckBox =  Ext.create('Ext.form.field.Checkbox', {
        boxLabel : 'Rescale',
        padding:'0 0 5 5',
        disabled:true,
        listeners: {
		       scope: this,
		       change: function(sender, newValue, oldValue){
		       			_this.onDataChanged(_this.attributesPanel.grid.store.getRange());
		       		}
     	}
	});
	
	this.attributesPanel.barInfo.insert(0,this.rescaleCheckBox);
	
	this.attributesPanel.onFileRead.addEventListener(function(){
		_this.rescaleCheckBox.enable();
	});
	
	return [
		    {text:'Apply Colors', handler: function(){_this.applyColors.notify(); _this.panel.close();}},
		    {text:'Close', handler: function(){_this.panel.close();}}];
	
};

ExpressionNetworkAttributesWidget.prototype.onDataChanged = function (data){

	var rescale = this.rescaleCheckBox.getValue();
	this.verticesSelected.notify(this.getFoundVertices());
	this.networkWidget.deselectNodes();
	this.networkWidget.selectVerticesByName(this.getFoundVertices());
	
	var values = new Array();
	var ids = new Array();
	for(var i=0; i< data.length; i++){
		var node = this.graphDataset.getVertexByName(data[i].data["0"]);
		var value = data[i].data["1"];
		if ((node != null)&& (!isNaN(parseFloat(value)))){
			if (rescale){
				if (parseFloat(value) < 0){
					value = Math.log(Math.abs(value))/Math.log(2)* -1;
				}
				else{
					value = Math.log(Math.abs(value))/Math.log(2);
				}
				values.push(value);
			}
			else{
				values.push(value);
			}
			ids.push(data[i].data["0"]);
		}
	}

//	console.log(values);
	
	
	var normalized = Normalizer.normalizeArray(values);
	
//	console.log(normalized);
	
	var colors = [];
	for ( var i = 0; i < normalized.length; i++) {
		if (!isNaN(parseFloat(values[i]))){
			colors.push( Colors.getColorByScoreValue(normalized[i]).HexString());
		}
		else{
			colors.push( "#000000");
		}
	}
	
	for ( var vertexId in ids) {
		var vertices = this.dataset.getVertexByName(ids[vertexId]);
		for ( var i = 0; i < vertices.length; i++) {
			this.formatter.getVertexById(vertices[i].getId()).getDefault().setFill(colors[vertexId]);
		}
		
	}
	
};function GenomicAttributesWidget(species, args){
	var _this=this;
	this.id = "GenomicAttributesWidget_" + Math.random();
	
	this.species=species;
	
	
	this.title = "None";
	this.featureType = "gene";
	
	this.columnsCount = null; /** El numero de columns que el attributes widget leera del fichero, si null lo leera entero **/
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.columnsCount!= null){
        	this.columnsCount = args.columnsCount;       
        }
        if (args.featureType!= null){
        	this.featureType = args.featureType;       
        }
    }
    
	this.listWidget = new ListWidget(args.listWidgetArgs);
	
    this.karyotypeWidget = new KaryotypePanel(this.getKaryotypePanelId(), this.species, {"top":10, "width":1000, "height": 300, "trackWidth":15});
	this.attributesPanel = new AttributesPanel({height: 240, columnsCount: this.columnsCount,wum:args.wum,tags:args.tags});
	
	/** Event **/
	this.onMarkerClicked = new Event(this);
	this.onTrackAddAction = new Event(this);
	
	
	/**Atach events i listen**/
	this.attributesPanel.onDataChange.addEventListener(function(sender,data){
		_this.dataChange(data);
	});
	
	this.karyotypeWidget.onMarkerClicked.addEventListener(function(sender,feature){
		_this.onMarkerClicked.notify(feature); 
	});
	
	
	
};

GenomicAttributesWidget.prototype.draw = function (){
	var _this=this;
	if (this.panel == null){
		
		this.karyotypePanel  = Ext.create('Ext.panel.Panel', {
			height:350,
			maxHeight:350,
			border:0,
			bodyPadding: 15,
			padding:'0 0 0 0',
			html:'<div id="' + this.getKaryotypePanelId() +'" ><div>'
		});
		
		this.filtersButton = Ext.create('Ext.button.Button', {
			 text: 'Additional Filters',
			 disabled:true,
			 listeners: {
			       scope: this,
			       click: function(){this.onAdditionalInformationClick();}
	        }
		});
		
		this.addTrackButton = Ext.create('Ext.button.Button', {
			text:'Add Track',
			disabled:true,
			handler: function(){ 
				_this.onTrackAddAction.notify({"features":_this.features,"trackName":_this.attributesPanel.fileName});
				}
		});
		
		this.panel  = Ext.create('Ext.ux.Window', {
			title : this.title,
			resizable: false,
			minimizable :true,
			constrain:true,
			closable:true,
			items: [this.attributesPanel.getPanel(),this.karyotypePanel],
			width: 1035,
		    height: 653,
		    buttonAlign:'left',
			buttons:[this.addTrackButton,'->',
			         {text:'Close', handler: function(){_this.panel.close();}}],
	 		listeners: {
		    	scope: this,
		    	minimize:function(){
					this.panel.hide();
		       	},
		      	destroy: function(){
		       		delete this.panel;
		      	}
	    	}
		});
		this.attributesPanel.barField.add(this.filtersButton);
		this.panel.setLoading();
		this.drawKaryotype();
	}	
	this.panel.show();
		
};

GenomicAttributesWidget.prototype.getMainPanel = function (){
	var _this=this;
	if (this.panel == null){
		
		this.karyotypePanel  = Ext.create('Ext.panel.Panel', {
			height:350,
			maxHeight:350,
			border:0,
			bodyPadding: 15,
			padding:'0 0 0 0',
			html:'<div id="' + this.getKaryotypePanelId() +'" ><div>'
		});
		
		this.filtersButton = Ext.create('Ext.button.Button', {
			 text: 'Additional Filters',
			 disabled:true,
			 listeners: {
			       scope: this,
			       click: function(){this.onAdditionalInformationClick();}
	        }
		});
		
		this.addTrackButton = Ext.create('Ext.button.Button', {
			text:'Add Track',
			disabled:true,
			handler: function(){ 
				_this.onTrackAddAction.notify({"features":_this.features,"trackName":_this.attributesPanel.fileName});
				}
		});
		
//		this.panel  = Ext.create('Ext.ux.Window', {
//			title : this.title,
//			resizable: false,
//			minimizable :true,
//			constrain:true,
//			closable:true,
//			items: [this.attributesPanel.getPanel(),this.karyotypePanel],
//			width: 1035,
//		    height: 653,
//		    buttonAlign:'left',
//			buttons:[this.addTrackButton,'->',
//			         {text:'Close', handler: function(){_this.panel.close();}}],
//	 		listeners: {
//		    	scope: this,
//		    	minimize:function(){
//					this.panel.hide();
//		       	},
//		      	destroy: function(){
//		       		delete this.panel;
//		      	}
//	    	}
//		});
		this.attributesPanel.getPanel();
		this.attributesPanel.barField.add(this.filtersButton);
//		this.panel.setLoading();
		this.drawKaryotype();
	}	
	return [this.attributesPanel.getPanel(),this.karyotypePanel];
		
};

GenomicAttributesWidget.prototype.fill = function (queryNames){
	
	var _this = this;
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function(sender){
		_this.karyotypePanel.setLoading("Retrieving data");
		for (var i = 0; i < cellBaseDataAdapter.dataset.toJSON().length; i++) {
				_this.karyotypeWidget.mark(cellBaseDataAdapter.dataset.toJSON()[i]);
				
		}
		_this.features=cellBaseDataAdapter.dataset.toJSON();
		_this.query = {"dataset": cellBaseDataAdapter.dataset, "resource":queryNames }; 
		_this.karyotypePanel.setLoading(false);
		_this.filtersButton.enable();
		_this.addTrackButton.enable();
		
	});
	cellBaseDataAdapter.fill("feature", this.featureType, queryNames.toString(), "info");
};

GenomicAttributesWidget.prototype.dataChange = function (items){
		try{
					var _this = this;
					
					this.karyotypePanel.setLoading("Connecting to Database");
					this.karyotypeWidget.unmark();
					var _this=this;
					var externalNames = [];
					
					for (var i = 0; i < items.length; i++) {
						externalNames.push(items[i].data[0]);
					}	
					
					if (items.length > 0){
						this.fill(externalNames);
					}
					else{
						this.karyotypePanel.setLoading(false);
					}
		}
		catch(e){
			alert(e);
			
		}
		finally{
			this.karyotypePanel.setLoading(false);
		}
};

GenomicAttributesWidget.prototype.drawKaryotype = function (){
		/** Karyotype Widget **/
		var _this = this;
		var karyotypeCellBaseDataAdapter = new KaryotypeCellBaseDataAdapter(this.species);
		
		karyotypeCellBaseDataAdapter.successed.addEventListener(function(evt, data){
			_this.karyotypeWidget.onRendered.addEventListener(function(evt, data){
//				_this.panel.setLoading(false);
			});
			
			_this.karyotypeWidget.onClick.addEventListener(function(evt, data){
			});
			
			_this.karyotypeWidget.draw(karyotypeCellBaseDataAdapter.chromosomeNames, karyotypeCellBaseDataAdapter.dataset.json);
			
		});
		karyotypeCellBaseDataAdapter.fill();
};

GenomicAttributesWidget.prototype.getKaryotypePanelId = function (){
	return this.id + "_karyotypePanel";	
};

GenomicAttributesWidget.prototype.onAdditionalInformationClick = function (){
	var _this=this;
	this.listWidget.draw(this.query.dataset.toJSON(), this.query.resource);
	this.listWidget.onFilterResult.addEventListener(function(sender,data){
		_this.attributesPanel.store.clearFilter();
		_this.attributesPanel.store.filter(function(item){
			for(var i = 0; i < data.length; i++){
				if(data[i].data.stableId == item.data["0"]){
					return true;
				}
			}
		});
	});
};
NetworkAttributesWidget.prototype.render = AttributesWidget.prototype.render;
NetworkAttributesWidget.prototype.getButtons = AttributesWidget.prototype.getButtons;

function NetworkAttributesWidget(args){
	if(args == null){
		var args={};
	};
	var height = args.height*0.5;
	var width = args.width*0.5;
	args.borderCls="";
	args.tags = ["sif|json"];
//	AttributesWidget.prototype.constructor.call(this, {height:675, width:800, title:args.title});
	AttributesWidget.prototype.constructor.call(this, {height:height+325+75, width:width+24, title:args.title});
//	this.width=800;
//	this.height=675;
	this.networkHeigth = height;
	this.networkWidth = width;
	this.networkPanelId = "NetworkAttributesWidget_" + Math.ceil(Math.random()*1000);
};



NetworkAttributesWidget.prototype.getNetworkPanelId = function (){
	return this.networkPanelId;
};

NetworkAttributesWidget.prototype.getDetailPanel = function (){
//	return   Ext.create('Ext.panel.Panel', {
//		height:285,
////		maxHeight:350,
//		border:0,
////		bodyPadding: 15,
//		padding:'0 0 0 0',
//		html:'<div id="' + this.getNetworkPanelId() +'" ><div>'
//	});
	
	return Ext.create('Ext.container.Container', {
		padding:5,
		flex:1,
		height:this.networkHeigth,
		style:"background: #eee;",
		cls:'x-unselectable',
		html:'<div id="' + this.getNetworkPanelId() +'" style="border:1px solid #bbb;" ><div>'
	});
	
};

NetworkAttributesWidget.prototype.drawNetwork = function (targetId, dataset, formatter, layout){
	this.dataset =	dataset.clone();

	this.formatter = new NetworkDataSetFormatter({width:400, height:200});
	this.formatter.loadFromJSON(this.dataset, formatter.toJSON());
	
	var vertices = this.dataset.getVertices();
	for ( var vertex in vertices) {
		var size = this.formatter.getVertexById(vertex).getDefault().getSize();
		this.formatter.getVertexById(vertex).getDefault().setSize(size*0.3);
	}
	
	var edges = this.dataset.getEdges();
	for ( var edge in edges) {
		var size = this.formatter.getEdgeById(edge).getDefault().getStrokeWidth();
		this.formatter.getEdgeById(edge).getDefault().setStrokeWidth(size*0.3);
	}
	
	var dsLayout = new LayoutDataset();
	dsLayout.loadFromJSON(this.dataset, layout.toJSON());
	
	this.networkWidget = new NetworkWidget({targetId: targetId, label:false});
	this.networkWidget.draw(this.dataset, this.formatter, dsLayout);
	this.networkWidget.getFormatter().resize(this.networkWidth, this.networkHeigth);
};

NetworkAttributesWidget.prototype.draw = function (graphDataset, formatter, layout){
	var _this=this;
	this.render();
	
	/** Data for search in attributes **/
	this.attributes = new Object();
	
	/** Events **/
	this.verticesSelected = new Event(this);

	this.graphDataset = graphDataset;
	
	this.found = Ext.create('Ext.button.Button', {
		 text: 'Nodes found',
		 hidden:true,
		 listeners: {
		 	scope: this,
		 	click: function(){
		 		new InputListWidget({title:"Features found", headerInfo:"This nodes were found in the Graph"}).draw(this.foundNodes.join('\n'));
			}
	    }
	});
	this.notFound = Ext.create('Ext.button.Button', {
		 text: 'nodes not found',
		 hidden:true,
		 listeners: {
		 	scope: this,
		 	click: function(){
		 		new InputListWidget({title:"Features not found", headerInfo:"This nodes were not found in the grpah"}).draw(this.notFoundNodes.join('\n'));
			}
	    }
	});
	
	this.attributesPanel.barInfo.insert(2, this.notFound);
	this.attributesPanel.barInfo.insert(2, this.found);
	
	this.attributesPanel.onDataChange.addEventListener(function (sender, data){
		_this.dataChanged(data);
	});	
	
	
	this.drawNetwork(this.getNetworkPanelId(), graphDataset, formatter, layout);
};

NetworkAttributesWidget.prototype.getVertexAttributesByName = function (name){
	var attributes = this.attributesPanel.getData();
	var results = new Array();
	if(attributes != null){
		for ( var i = 0; i < attributes.length; i++) {
			if (attributes[i][0] == name){
				results.push(attributes[i]);
			}
		}
		return results;
	}
	else{
		return name;
	}
};


NetworkAttributesWidget.prototype.dataChanged = function (data){
	this.foundNodes=[];
	this.notFoundNodes=[];
	for(var i=0; i< data.length; i++){
		var node = this.graphDataset.getVertexByName(data[i].data["0"]);
		if(node==null){
			this.notFoundNodes.push(data[i].data["0"]);
		}else{
			this.foundNodes.push(data[i].data["0"]);
		}
	}
	this.found.setText('<span class="dis">' + this.foundNodes.length + ' results found </span> ');
	this.found.show();
	if (this.notFoundNodes.length > 0){
		this.notFound.setText('<span class="err">'  + this.notFoundNodes.length +' features not found</span>');
		this.notFound.show();
	}
	
	this.onDataChanged(data);
	
};

NetworkAttributesWidget.prototype.onDataChanged = function (data){
	this.verticesSelected.notify(this.getFoundVertices());
	this.networkWidget.deselectNodes();
	this.networkWidget.selectVerticesByName(this.getFoundVertices());
};

NetworkAttributesWidget.prototype.getFoundVertices = function (){
	return this.foundNodes;
};
function AttributesPanel(args){
	var _this= this;
	this.targetId = null;
	this.id = "AttributesPanel_" + Math.round(Math.random()*10000000);
	
	this.title = null;
	this.width = 1023;
	this.height = 628;
	this.wum = true;
	this.tags = [];
	this.borderCls='panel-border-bottom';
	
	this.columnsCount = null;
	if (args != null){
		if (args.wum!= null){
        	this.wum = args.wum;       
        }
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
        if (args.columnsCount!= null){
        	this.columnsCount = args.columnsCount;       
        }
        if (args.borderCls!= null){
        	this.borderCls = args.borderCls;       
        }
        if (args.tags!= null){
        	this.tags = args.tags;       
        }
    }
        
	/** create widgets **/
	this.browserData = new BrowserDataWidget();
    
	
    /** Events i send **/
    this.onDataChange = new Event(this);
    this.onFileRead = new Event(this);
    
    /** Events i listen **/
    this.browserData.adapter.onReadData.addEventListener(function (sender, data){
		var tabularFileDataAdapter = new TabularFileDataAdapter({comment:"#"});
		tabularFileDataAdapter.parse(data.data);
		_this.makeGrid(tabularFileDataAdapter);
		_this.uptadeTotalFilteredRowsInfo(tabularFileDataAdapter.lines.length);
		_this.uptadeTotalRowsInfo(tabularFileDataAdapter.lines.length);
		_this.fileNameLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
	});	
};

AttributesPanel.prototype.draw = function (){
	var panel = this.getPanel();
	
	if (this.targetId != null){
		panel.render(this.targetId);
	}
};

AttributesPanel.prototype.uptadeTotalRowsInfo = function (linesCount){
	this.infoLabel.setText('<span class="dis">Total rows: </span><span class="emph">' + linesCount + '</span>',false);
	
};

AttributesPanel.prototype.uptadeTotalFilteredRowsInfo = function (filteredCount){
	this.infoLabel2.setText('<span class="dis">Filtered rows: </span><span class="emph">' + filteredCount + '</span>',false);
};

AttributesPanel.prototype.sessionInitiated = function (){
	if(this.btnBrowse!=null){
		this.btnBrowse.enable();
	}
};

AttributesPanel.prototype.sessionFinished = function (){
	if(this.btnBrowse!=null){
		this.btnBrowse.disable();
	}
};

AttributesPanel.prototype.getPanel = function (){
	var _this=this;
	if (this.panel == null){
		this.expresionAnalysisUploadFieldFile = Ext.create('Ext.form.field.File', {
			msgTarget : 'side',
//			flex:1,
			width:75,
			emptyText: 'Choose a local file',
	        allowBlank: false,
			buttonText : 'Browse local',
			buttonOnly : true,
			listeners : {
				scope:this,
				change :function() {
						_this.panel.setLoading("Reading file");
						try{
							var dataAdapter = new TabularFileDataAdapter({comment:"#"});
							var file = document.getElementById(this.expresionAnalysisUploadFieldFile.fileInputEl.id).files[0];
							_this.fileName = file.name;
							_this.fileNameLabel.setText('<span class="emph">'+ file.name +'</span> <span class="info">(local)</span>',false);
							dataAdapter.loadFromFile(file);
							
							dataAdapter.onRead.addEventListener(function(sender, id) {
									_this.makeGrid(dataAdapter);
									_this.uptadeTotalFilteredRowsInfo(dataAdapter.lines.length);
									_this.uptadeTotalRowsInfo(dataAdapter.lines.length);
									_this.panel.setLoading(false);
									_this.onFileRead.notify();
							});
						}
						catch(e){
							alert(e);
							_this.panel.setLoading(false);
						}
					
				}
			}
		});
		this.barField = Ext.create('Ext.toolbar.Toolbar');
		this.barInfo = Ext.create('Ext.toolbar.Toolbar',{dock:'bottom'});
		this.barHelp = Ext.create('Ext.toolbar.Toolbar',{dock:'top'});
		
		
		this.clearFilter = Ext.create('Ext.button.Button', {
			 text: 'Clear filters',
			 disabled:true,
			 listeners: {
			       scope: this,
			       click: function(){
			       			if(this.grid.filters!=null){
			       				this.grid.filters.clearFilters();
			       				this.store.clearFilter();
			       			}
			       		}
	        }
		});
			
		
		this.helpLabel = Ext.create('Ext.toolbar.TextItem', {
			html:'<span class="dis">Click on the header down arrow to filter by column</span>'
		});
		this.fileNameLabel = Ext.create('Ext.toolbar.TextItem', {
			html:'<span class="emph">Select a <span class="info">local</span> file or a <span class="info">server</span> file from your account.</span>'
		});
		this.infoLabel = Ext.create('Ext.toolbar.TextItem', {
			html:'&nbsp;'
		});
		this.infoLabel2 = Ext.create('Ext.toolbar.TextItem', {
			html:'&nbsp;'//'<span class="info">No file selected</span>'
		});
		
		this.barField.add(this.expresionAnalysisUploadFieldFile);
		this.barInfo.add('->',this.infoLabel,this.infoLabel2);
		this.barHelp.add(this.fileNameLabel,'->',this.helpLabel);
		
		this.store = Ext.create('Ext.data.Store', {
			fields:["1","2"],
			data:[]
		});
		this.grid = Ext.create('Ext.grid.Panel', {
		    store: this.store,
		    disabled:true,
		    border:0,
		    columns:[{header:"Column 1",dataIndex:"1"},{header:"Column 2",dataIndex:"2"}]
		});
		
		this.panel  = Ext.create('Ext.panel.Panel', {
			title : this.title,
			border:false,
			layout: 'fit',
			cls:this.borderCls,
			items: [this.grid],
			tbar:this.barField,
			width: this.width,
		    height:this.height,
		    maxHeight:this.height,
			buttonAlign:'right',
	 		listeners: {
		    	scope: this,
		    	minimize:function(){
					this.panel.hide();
		       	},
		      	destroy: function(){
		       		delete this.panel;
		      	}
	    	}
		});
		this.panel.addDocked(this.barInfo);
		this.panel.addDocked(this.barHelp );
		
	}	
	
	
	if(this.wum){
			this.btnBrowse = Ext.create('Ext.button.Button', {
		        text: 'Browse server',
		        disabled:true,
//		        iconCls:'icon-local',
//		        cls:'x-btn-default-small',
		        listeners: {
				       scope: this,
				       click: function (){
				    	   		this.browserData.draw($.cookie('bioinfo_sid'),this.tags);
				       		}
		        }
			});
			
			this.barField.add(this.btnBrowse);
			
			if($.cookie('bioinfo_sid') != null){
				this.sessionInitiated();
			}else{
				this.sessionFinished();
			}
	}
	this.barField.add('-',this.clearFilter);
	
	return this.panel;
};


AttributesPanel.prototype.getData = function (){
	return this.data;
};

AttributesPanel.prototype.makeGrid = function (dataAdapter){
		var _this = this;
		this.data = dataAdapter.lines;
	
		var fields = [];
		var columns = [];
		var filtros = [];
		
		if (this.columnsCount == null){
			this.columnsCount = this.data[0].length;
		}
//		for(var i=0; i< data[0].length; i++){
		for(var i=0; i< this.columnsCount; i++){
			var type = dataAdapter.getHeuristicTypeByColumnIndex(i);
			fields.push({"name": i.toString(),type:type});
			columns.push({header: "Column "+i.toString(), dataIndex:i.toString(), flex:1,filterable: true,  filter: {type:type}});
			filtros.push({type:type, dataIndex:i.toString()});
		}
		this.store = Ext.create('Ext.data.Store', {
		    fields: fields,
		    data: this.data,
		    listeners:{
		    	scope:this,
		    	datachanged:function(store){
		    		var items = store.getRange();
		    		this.uptadeTotalFilteredRowsInfo(store.getRange().length);
		    		this.onDataChange.notify(store.getRange());
		    	}
		    }
		});
		
		var filters = {
        ftype: 'filters',
        local: true,
        filters: filtros
    	};
		
    	if(this.grid!=null){
			this.panel.remove(this.grid);
		}
    	
		this.grid = Ext.create('Ext.grid.Panel', {
		    store: this.store,
		    columns:columns,
//		    height:164,
//		    maxHeight:164,
//		    height:this.height,
//		    maxHeight:this.height,
		    border:0,
		    features: [filters]
		});
		this.panel.insert(0,this.grid);
		this.clearFilter.enable();
};GenotypeGenomicAttributesWidget.prototype.draw = GenomicAttributesWidget.prototype.draw;
GenotypeGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
GenotypeGenomicAttributesWidget.prototype.drawKaryotype = GenomicAttributesWidget.prototype.drawKaryotype;
GenotypeGenomicAttributesWidget.prototype.makeGrid = GenomicAttributesWidget.prototype.makeGrid;
GenotypeGenomicAttributesWidget.prototype.getKaryotypePanelId = GenomicAttributesWidget.prototype.getKaryotypePanelId;
GenotypeGenomicAttributesWidget.prototype.dataChange = GenomicAttributesWidget.prototype.dataChange;
GenotypeGenomicAttributesWidget.prototype.fill = GenomicAttributesWidget.prototype.fill;
GenotypeGenomicAttributesWidget.prototype.onAdditionalInformationClick = GenomicAttributesWidget.prototype.onAdditionalInformationClick;

function GenotypeGenomicAttributesWidget(species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Genotype";
	args.tags = ["genotype"];
	args.featureType = 'snp';
	args.listWidgetArgs = {title:'Filter',action:'filter', gridFields:["name", "variantAlleles", "ancestralAllele", "mapWeight",  "position", "sequence"]};
	GenomicAttributesWidget.prototype.constructor.call(this, species, args);
};


ExpressionGenomicAttributesWidget.prototype.draw = GenomicAttributesWidget.prototype.draw;
ExpressionGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
ExpressionGenomicAttributesWidget.prototype.drawKaryotype = GenomicAttributesWidget.prototype.drawKaryotype;
ExpressionGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
ExpressionGenomicAttributesWidget.prototype.makeGrid = GenomicAttributesWidget.prototype.makeGrid;
ExpressionGenomicAttributesWidget.prototype.getKaryotypePanelId = GenomicAttributesWidget.prototype.getKaryotypePanelId;
ExpressionGenomicAttributesWidget.prototype.dataChange = GenomicAttributesWidget.prototype.dataChange;


function ExpressionGenomicAttributesWidget(targetId, widgetId, args){
	GenomicAttributesWidget.prototype.constructor.call(this, targetId, widgetId, args);
    this.karyotypeWidget = new KaryotypePanel(this.getKaryotypePanelId(), this.getKaryotypePanelId(), {"top":10, "width":1000, "height": 300, "trackWidth":15});
};


ExpressionGenomicAttributesWidget.prototype.dataChange = function (items){
	try{
				console.log(items);
				var _this = this;
				this.karyotypePanel.setLoading("Connecting to Database");
				this.karyotypeWidget.unmark();
				var _this=this;
				var externalNames = [];
				
				if (items.length > 0){
					for (var i = 0; i < items.length; i++) {
						externalNames.push(items[i].data[0]);
					}	
					
					
					var cellBaseDataAdapter = new CellBaseDataAdapter();
					cellBaseDataAdapter.successed.addEventListener(function(sender){		
						_this.karyotypePanel.setLoading("Retrieving data");
						for (var i = 0; i < cellBaseDataAdapter.dataset.toJSON().length; i++) {
								_this.karyotypeWidget.mark(cellBaseDataAdapter.dataset.toJSON()[i]);
						}
						_this.karyotypePanel.setLoading(false);
					});
					cellBaseDataAdapter.fill("feature", "gene", externalNames.toString(), "info");
				}
	}
	catch(e){
		alert(e);
		this.panel.setLoading(false);
	}
};


function AttributesWidget(args){
	this.id = "AttributesWidget_" + Math.random();
	this.title = "";
	this.width = 1025;
	this.height = 628;
	
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
	this.attributesPanel = new AttributesPanel({borderCls:args.borderCls, height:325});
};

AttributesWidget.prototype.draw = function (){
	this.render();
};

AttributesWidget.prototype.getDetailPanel = function (){
	return {};
};

AttributesWidget.prototype.getButtons = function (){
	var _this=this;
	return [{text:'Close', handler: function(){_this.panel.close();}}];
};


AttributesWidget.prototype.render = function (){
	var _this = this;
	if (this.panel == null){
		this.panel  = Ext.create('Ext.ux.Window', {
			title : this.title,
			resizable: false,
			constrain:true,
			closable:true,
			collapsible:true,
			layout: { type: 'vbox',align: 'stretch'},
			items: [this.attributesPanel.getPanel(), this.getDetailPanel()],
			width: this.width,
		    height:this.height,
			buttonAlign:'right',
			buttons:this.getButtons(),
	 		listeners: {
		    	scope: this,
		    	minimize:function(){
					this.panel.hide();
		       	},
		      	destroy: function(){
		       		delete this.panel;
		      	}
	    	}
		});
		this.panel.setLoading();
	}	
	this.panel.show();
};
function ChartWidget(args) {
	var this_ = this;
	this.id = "ChartWidget_" + Math.round(Math.random() * 10000000);

	this.title = null;
	this.width = 750;
	this.height = 300;

	if (args != null) {
		if (args.title != null) {
			this.title = args.title;
		}
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
	}
};

ChartWidget.prototype.getStore = function() {
	return this.store;
};

ChartWidget.prototype.getChart = function(fields) {
	
	Ext.define('ChromosomeChart', {
	    extend: 'Ext.data.Model',
	    fields: fields
	});
	
	this.store = Ext.create('Ext.data.Store', {
		 model: 'ChromosomeChart',
		 autoLoad : false
	});
	
	var dibujo = Ext.create('Ext.chart.Chart', {
		animate : true,
		shadow : true,
		store : this.store,
		width : this.width,
		height : this.height,
		axes : [{
					position : 'left',
					fields : [fields[0]],
					title : fields[0],
					grid:true,
					type : 'Numeric',
	                minimum: 0 //si no se pone, peta
				}, {
					title : fields[1],
					type : 'category',
					position : 'bottom',
					fields : [fields[1]],
//					width : 10,
					label : {
						rotate : {
							degrees : 270
						}
					}
				}],
		series : [{
					type : 'column',
					axis: 'left',
					gutter: 80,
					yField : fields[0],
					xField : fields[1],
	                style: {
	                    fill: '#38B8BF'
	                }
				}]
	});
	return dibujo;
};//GenomicListWidget.prototype._render 				=       ListWidget.prototype._render;
GenomicListWidget.prototype.draw 				=       ListWidget.prototype.draw;
GenomicListWidget.prototype.getActionButton 			=       ListWidget.prototype.getActionButton;


function GenomicListWidget(args) {
	ListWidget.prototype.constructor.call(this, args);
	this.listPanel = new GenomicListPanel({title:false,gridFields:args.gridFields});
	this.onSelected = this.listPanel.onSelected;
	this.onFilterResult = this.listPanel.onFilterResult;
	
	this.onTrackAddAction = new Event();
	
	
};



GenomicListWidget.prototype._render = function() {
	var _this = this;
	if(this.panel==null){
		this.localizeButton = Ext.create('Ext.button.Button', {
			minWidth : 80,
			text : 'OK',
			disabled:true,
			handler : function() {
					_this.listPanel.onSelected.notify(_this.listPanel.grid.getSelectionModel().getSelection()[0].data);
					_this.panel.hide();
			}
		});
		this.filterButton = Ext.create('Ext.button.Button', {
			minWidth : 80,
			text : 'OK',
			handler : function() {
					_this.listPanel.onFilterResult.notify(_this.listPanel.store.getRange());
					_this.panel.hide();
			}
		});
		var buttonRigthMargin = 375;
		
		
		this.panel = Ext.create('Ext.ux.Window', {
			title : this.title,
			taskbar:Ext.getCmp(this.args.viewer.id+'uxTaskbar'),
			resizable: false,
			constrain:true,
			closable:true,
			layout: 'fit',
			minimizable :true,
			width: this.width,
			height:this.height,
			items : [ this.listPanel.grid ],
			buttonAlign:'right',
			buttons:[
			         {text:'Add Track', handler: function(){_this.onTrackAddAction.notify(_this.listPanel.features);}, margin:"0 " + buttonRigthMargin  +" 0 0 "},
			         this.getActionButton(this.action),
			         {text:'Close', handler: function(){_this.panel.close();}}
			],
			 listeners: {
			       scope: this,
			       minimize:function(){
			       		this.panel.hide();
			       },
			       destroy: function(){
			       		delete this.panel;
			       }
	      }
		});
	}
};function ListWidget(args) {
	this.targetId = null;
	this.id = "ListWidget_" + Math.round(Math.random()*10000000);
		
	this.width = 1000;
	this.height = 500;
	this.action = 'localize';
	this.title='';
	
	this.args = args;
	
//	if (args == null){
//		args = {};
//	}
		
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
        if (args.action!= null){
        	this.action = args.action;       
        }
    }
	
	this.listPanel = new ListPanel({title:false,gridFields:args.gridFields});
	this.onSelected=this.listPanel.onSelected;
	this.onFilterResult=this.listPanel.onFilterResult;
	
};

ListWidget.prototype._render = function() {
	var _this = this;
	if(this.panel==null){
		this.localizeButton = Ext.create('Ext.button.Button', {
			minWidth : 80,
			text : 'OK',
			disabled:true,
			handler : function() {
					_this.listPanel.onSelected.notify(_this.listPanel.grid.getSelectionModel().getSelection()[0].data);
					_this.panel.hide();
			}
		});
		this.filterButton = Ext.create('Ext.button.Button', {
			minWidth : 80,
			text : 'OK',
			handler : function() {
					_this.listPanel.onFilterResult.notify(_this.listPanel.store.getRange());
					_this.panel.hide();
			}
		});
		
		this.panel = Ext.create('Ext.ux.Window', {
			title : this.title,
			taskbar:Ext.getCmp(this.args.viewer.id+'uxTaskbar'),
			resizable: false,
			constrain:true,
			closable:true,
			layout: 'fit',
			minimizable :true,
			width: this.width,
			height:this.height,
			items : [ this.listPanel.grid ],
			buttonAlign:'right',
			buttons:[
//			         {text:'aaa', handler: function(){},margin:"0 50 0 0 "},
			         this.getActionButton(this.action),
					{text:'Close', handler: function(){_this.panel.close();}}
			],
			 listeners: {
			       scope: this,
			       minimize:function(){
			       		this.panel.hide();
			       },
			       destroy: function(){
			       		delete this.panel;
			       }
	      }
		});
	}
};

ListWidget.prototype.draw = function(features, queries) {
	var _this = this;
	this.listPanel.draw(features, queries);
	this.listPanel.grid.getSelectionModel().on('selectionchange',function(){
		if(_this.listPanel.grid.getSelectionModel().hasSelection()){
			_this.localizeButton.enable();
		}else{
			_this.localizeButton.disable();
		}
	});
	this._render();
	this.panel.show();
};

ListWidget.prototype.getActionButton = function(action) {
	switch (action){
		case "localize": return this.localizeButton; break;
		case "filter": this.listPanel.localizeButton.disable().hide(); return this.filterButton; break;
	};
};function ListPanel(args) {
	this.targetId = null;
	this.id = "ListPanel_" + Math.round(Math.random()*10000000);
		
	this.title = "List of Genes";
	this.width = 1000;
	this.height = 500;
	this.borderCls='panel-border-bottom';
	
	this.gridFields = [ 'externalName', 'stableId', 'biotype','position', 'strand', 'description' ];
		
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
        if (args.gridFields != null){
        	this.gridFields = args.gridFields;
        }
        if (args.borderCls!= null){
        	this.borderCls = args.borderCls;       
        }
        
    }
	
	this.onSelected = new Event(this);
	this.onFilterResult = new Event(this);
	
	
};

ListPanel.prototype._getGeneGrid = function() {
	var _this = this;
//	if(this.grid==null){
		var fields = this.gridFields;
		
		var filters = [];
		var columns = new Array();
		
		for(var i=0; i<fields.length; i++){
			filters.push({type:'string', dataIndex:fields[i]});
			columns.push({header:this.gridFields[i], dataIndex:this.gridFields[i], flex:1});
		}
		
		this.store = Ext.create('Ext.data.Store', {
			fields : fields,
			groupField : 'biotype',
			autoload : false
		});

	
		var filters = {
	        ftype: 'filters',
	        local: true, // defaults to false (remote filtering)
	        filters: filters
	    };
		
	    this.infoToolBar = Ext.create('Ext.toolbar.Toolbar');
		this.infoLabelOk = Ext.create('Ext.toolbar.TextItem', {
			html : '&nbsp;'
		});
		this.infoLabelNotFound = Ext.create('Ext.toolbar.TextItem', {
			html : '&nbsp;'
		});
		this.clearFilter = Ext.create('Ext.button.Button', {
			 text: 'Clear filters',
			 listeners: {
			 	scope: this,
			 	click: function(){
			 		if(this.grid.filters!=null){
						this.grid.filters.clearFilters();
			 		}
				}
		    }
		});
		this.found = Ext.create('Ext.button.Button', {
			 text: 'Features found',
			 hidden:true,
			 listeners: {
			 	scope: this,
			 	click: function(){
			 		new InputListWidget({title:"Features found", headerInfo:"This features were found in the database"}).draw(this.queriesFound.join('\n'));
				}
		    }
		});
		this.notFound = Ext.create('Ext.button.Button', {
			 text: 'Features not found',
			 hidden:true,
			 listeners: {
			 	scope: this,
			 	click: function(){
			 		new InputListWidget({title:"Features not found", headerInfo:"This features were not found in the database"}).draw(this.queriesNotFound.join('\n'));
				}
		    }
		});
		this.exportButton = Ext.create('Ext.button.Button', {
			text : 'Export to Text',
			handler : function() {
    	 		new InputListWidget({width:1100, title:"VCS content", headerInfo:"Export results"}).draw(_this._getStoreContent());
     		}
		});
		this.localizeButton = Ext.create('Ext.button.Button', {
			text : 'Localize on karyotype',
			handler : function() { _this._localize();}
		});
		this.infoToolBar.add([ '->',this.exportButton,this.localizeButton,'-',this.found,this.notFound,this.clearFilter]);
	    
		
		this.grid = Ext.create('Ext.grid.Panel', {
			border:0,
			store : this.store,
			features: [filters],
			bbar:this.infoToolBar,
			columns : columns,
			selModel: {
                mode: 'SINGLE'
            }
		});		
	return this.grid;
};

ListPanel.prototype._localize = function() {
	var _this = this;
	
	var karyotypePanelWindow = new KaryotypePanelWindow();
	karyotypePanelWindow.onRendered.addEventListener(function(evt, feature) {
		var results = new Array();
		for ( var i = 0; i < _this.original.length; i++) {
			for ( var j = 0; j < _this.original[i].length; j++) {
				results.push(_this.original[i][j]);
			}
		}
		karyotypePanelWindow.mark(results);
	});

	karyotypePanelWindow.onMarkerChanged.addEventListener(function(evt, data) {
		_this.onSelected.notify(data);
	});
	karyotypePanelWindow.draw();
};

ListPanel.prototype.setTextInfoBar = function(resultsCount, featuresCount, noFoundCount) {
	this.found.setText('<span class="dis">' + resultsCount + ' results found </span> ');
	this.found.show();
	if (noFoundCount > 0){
		this.notFound.setText('<span class="err">'  + noFoundCount +' features not found</span>');
		this.notFound.show();
	}
};

ListPanel.prototype._getStoreContent = function() {
	var text = new String();
		for ( var i = 0; i < this.store.data.items.length; i++) {
			var header = new String();
			if (i == 0){
				for ( var j = 0; j < this.gridFields.length; j++) {
					header = header + this.gridFields[j] + "\t";
				}
				header = header + "\n";
			}
			var row = header;
			for ( var j = 0; j < this.gridFields.length; j++) {
				row = row + this.store.data.items[i].data[ this.gridFields[j]] + "\t";
			}
				
			row = row + "\n";
			text = text + row;
		}
	return text;
};

ListPanel.prototype._render = function() {
	var _this = this;
	if(this.panel==null){
		this.panel = Ext.create('Ext.panel.Panel', {
		    height:240,
		    layout:'fit',
		    cls:this.borderCls,
			title : this.title,
			border:false
		});
	}
	this.panel.add(this._getGeneGrid());
};

ListPanel.prototype.draw = function(features, queries) {
	this._render();
	
	if ((queries instanceof Array) == false){
		queries = queries.split(",");
	}
	this.original = features;
	this.queriesNotFound=[];
	this.queriesFound=[];
	var notFoundCount = 0;
	var results = new Array();

	for ( var i = 0; i < features.length; i++) {
		if (features[i].length == 0){
			notFoundCount++; 
			this.queriesNotFound.push(queries[i]);
		}else{
			this.queriesFound.push(queries[i]);
		}
		
		for ( var j = 0; j < features[i].length; j++) {
			features[i][j].position = features[i][j].chromosome + ":"+ features[i][j].start + "-" + features[i][j].end;
			results.push(features[i][j]);
		}
	}
	
	this.features = results;

	this.setTextInfoBar(results.length, this.original.length, notFoundCount);
	
	this.store.loadData(results, false);
};GenomicListPanel.prototype._getGeneGrid 				=       ListPanel.prototype._getGeneGrid;
GenomicListPanel.prototype._localize 				=       ListPanel.prototype._localize;
GenomicListPanel.prototype.setTextInfoBar 			=       ListPanel.prototype.setTextInfoBar;
GenomicListPanel.prototype._getStoreContent 			=       ListPanel.prototype._getStoreContent;
GenomicListPanel.prototype._render  					=       ListPanel.prototype._render;
GenomicListPanel.prototype.draw  					=       ListPanel.prototype.draw;

function GenomicListPanel(args) {
	ListPanel.prototype.constructor.call(this, args);
};


function TextWindowWidget(args){
	this.windows = new Array();
};

TextWindowWidget.prototype.draw = function(text){
//	this.windows.push( window.open(''+self.location,"Bioinformatics",config="height="+500+",width="+800+" ,font-size=8, resizable=yes, toolbar=1, menubar=1"));
//	this.windows[this.windows.length-1].document.write("<title>"+ "asdasda" +"</title>");
//	this.windows[this.windows.length-1].document.write(text);
//	this.windows[this.windows.length-1].document.close();
	
	
	myRef = window.open('data:text/csv,field1%2Cfield2%0Afoo%2Cbar%0Agoo%2Cgai%0A','mywin',
	'left=20,top=20,width=500,height=200');
	
	myRef.document.write(text);
};


function ClienSideDownloaderWindowWidget(args){
	this.windows = new Array();
};

ClienSideDownloaderWindowWidget.prototype.draw = function(text, content){
//	myRef = window.open('data:text/csv,field1%2Cfield2%0Afoo%2Cbar%0Agoo%2Cgai%0A','mywin', 'left=20,top=20,width=500,height=200');
	
	myRef = window.open('data:text/csv,' + content,'mywin', 'left=20,top=20,width=500,height=200');
	
	myRef.document.write(text);
};	/*Nuevo tipo ventana*/
	Ext.define("Ext.ux.Window",{
		extend:"Ext.window.Window",
		minimizable:true,
		constrain:true,
		collapsible:true,
		initComponent: function () {
			this.callParent();
			if(this.taskbar!=null){//si no existe, las ventanas funcionan como hasta ahora
				this.zIndexManager = this.taskbar.winMgr;
				this.iconCls='icon-grid';
				this.button=Ext.create('Ext.button.Button', {
					text:this.title,
					window:this,
					iconCls : this.iconCls,
					handler:function(){
						if(this.window.zIndexManager.front==this.window){
							this.window.minimize();
						}else{
							this.window.show();
						}
					}
				});
				this.taskbar.add(this.button);
				
				
				this.contextMenu = new Ext.menu.Menu({
					items: [{
						text: 'Close',
						window:this,
						iconCls:'tools-icons x-tool-close',
						handler:function(){this.window.close();}
					}]
				});
				this.button.getEl().on('contextmenu', function(e){
													e.preventDefault();
													this.contextMenu.showAt(e.getX(),e.getY()-10-(this.contextMenu.items.length)*25);
													},this);
				
				this.button.on('destroy', function(){this.window.close();});
				
				//Taskbar button can be destroying
				this.on('destroy',function(){if(this.button.destroying!=true){this.button.destroy();}});
				
				this.on('minimize',function(){this.hide();});
				this.on('deactivate',function(){
					if(this.zIndexManager && this.zIndexManager.front.ghostPanel){
						this.zIndexManager.unregister(this.zIndexManager.front.ghostPanel);
					}
					this.button.toggle(false);
				});
				this.on('activate',function(){this.button.toggle(true);});
				
			}
		}
	});function FilterPanel(args){
	var this_=this;
	this.id = "FilterPanel_" + Math.round(Math.random()*10000000);
	this.targetId = null;
	
	this.title=null;
	this.width=null;
	this.height=null;
	
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
};
FilterPanel.prototype.draw = function (arr){
	var arr = ["manzanas","pera","meloconton","sandia","melon","naranja","manzanas","pera","meloconton","sandia","melon","naranja","manzanas","pera","meloconton","sandia","melon","naranja"];
	this.render(arr);
	
	if (this.targetId != null){
		this.panel.render(this.targetId);
	}
	
};
FilterPanel.prototype.render = function (arr){

	var items = [];
	for (var i = 0; i < arr.length; i++) {
		items.push({boxLabel:arr[i],checked:true});
	}
	
	if (this.panel == null){
		this.panel = Ext.create('Ext.panel.Panel', {
			title: this.title,
		    width: this.width,
		    height: this.height,
		    layout: 'vbox',
		    defaultType: 'checkboxfield',
		    items: items
		});
	}
};function InputListWidget(args) {
	this.id = "InputListWidget" + Math.round(Math.random()*10000000);
		
	this.title = "List";
	this.width = 500;
	this.height = 350;
	this.headerInfo = 'Write a list separated only by lines';
	
	this.args=args;
	
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
        if (args.headerInfo!= null){
        	this.headerInfo = args.headerInfo;       
        }
    }
	
	this.onOk = new Event(this);
};


InputListWidget.prototype.draw = function(text){
	var _this = this;
	
	if (text == null){
		text = new String();
	}
	
	if (this.panel == null){
		this.infobar = Ext.create('Ext.toolbar.Toolbar',{cls:"bio-border-false"});
		this.infoLabel = Ext.create('Ext.toolbar.TextItem', {
				html:this.headerInfo
		});
		this.infobar.add(this.infoLabel);
		this.editor = Ext.create('Ext.form.field.TextArea', {
				id:this.id + "genelist_preview",
	       	 	xtype: 'textarea',
	        	name: 'file',
	        	margin:"-1",
				width : this.width,
				height : this.height,
	        	enableKeyEvents:true,
	        	cls: 'dis',
	        	style:'normal 6px tahoma, arial, verdana, sans-serif',
	        	value: text,
	        	listeners: {
				       scope: this,
				       change: function(){
//				       			var re = /\n/g;
//				       			for( var i = 1; re.exec(this.editor.getValue()); ++i );
//				       			this.infoLabel.setText('<span class="ok">'+i+'</span> <span class="info"> Features detected</span>',false);
				       			this.validate();
				       }
				       
		        }
		});
		var form = Ext.create('Ext.panel.Panel', {
			border : false,
			items : [this.infobar,this.editor]
		});
		
		this.okButton = Ext.create('Ext.button.Button', {
			 text: 'Ok',
			 disabled:true,
			 listeners: {
			       scope: this,
			       click: function(){
			       			var geneNames = Ext.getCmp(this.id + "genelist_preview").getValue().split("\n");
							this.onOk.notify(geneNames);
							_this.panel.close();
			       		}
	        }
		});  
		
		this.panel = Ext.create('Ext.ux.Window', {
			title : this.title,
			taskbar:Ext.getCmp(this.args.viewer.id+'uxTaskbar'),
			layout: 'fit',
			resizable: false,
			collapsible:true,
			constrain:true,
			closable:true,
			items : [ form ],
			buttons : [ this.okButton, {text : 'Cancel',handler : function() {_this.panel.close();}} ],
			listeners: {
				       scope: this,
				       destroy: function(){
				       		delete this.panel;
				       }
		        }
		});
	}
	this.panel.show();
	
};

InputListWidget.prototype.validate = function (){
	if (this.editor.getValue()!="") {
		this.okButton.enable();
	}else{
		this.okButton.disable();
	}
};
/*

Normalizacion de datos para dibujar colores
Issues:
		No sé como debería llamarse esta libreria
		No sé si ya existe una funciçon en javascript que lo haga


*/


var Normalizer = new function()
{
   this.normalizeArray = function (arrayData)
   {
	   
	   return this.standardizeArray(this.normal(arrayData));
	   
//	  var result = this._getMaxAndMin(arrayData);
//	  var min =result[0];
//	  var max = result[1];
//	
//
//	  //los hacemos todos positivos
//	  for (var i = 0; i< arrayData.length; i++)
//	  {
//		 arrayData[i]= Math.abs(min) + parseFloat(arrayData[i]);
//	  }
//	 
//	  var result = this._getMaxAndMin(arrayData);
//	  var min =result[0];
//	  var max = result[1];
//	  
//	  
//	  var resultArray = new Array();
//	  for (var i = 0; i< arrayData.length; i++)
//	  {
//		  resultArray.push(arrayData[i]*1/max);
//	  }
//	  return resultArray;
   };
   
   this.normal = function(arrayData){
		var mean = this._getMean(arrayData);
		var deviation = this._getStdDeviation(arrayData);
		var result = this._getMaxAndMin(arrayData);
		var min = result[0];
		var max = result[1];
		
		var resultArray = new Array();
	    for (var i = 0; i< arrayData.length; i++) {
	    	if (deviation!=0){
	    		resultArray.push((arrayData[i]-mean)/deviation);
	    	}else{
	    		resultArray.push(arrayData[i]);
	    	}
	    }
	    return resultArray;
   };

   this.standardizeArray = function(arrayData)
   {
		var result = this._getMaxAndMin(arrayData);
		var min = result[0];
		var max = result[1];
		
		var offset = ( min <= 0 ) ? Math.abs(min) : (-1 * min);
		var resultArray = new Array();
	    for (var i = 0; i< arrayData.length; i++) {
	    	if(max + offset!=0){
	    		resultArray.push((arrayData[i] + offset) / (max + offset));
	    	}else{
	    		resultArray.push(arrayData[i]+offset);
	    	}
	    }
	    return resultArray;
   };


   this._getMean = function(arrayData) {
		var sum = 0;
		for (var i = 0; i< arrayData.length; i++) {
			sum = sum + parseFloat(arrayData[i]);
		}
		return sum/arrayData.length;
	};
	
   this._getStdDeviation = function(arrayData) {
	   var mean = this._getMean(arrayData);
	   var acum = 0.0;
	   for(var i=0; i<arrayData.length; i++) {
		   acum += Math.pow(parseFloat(arrayData[i]) - mean, 2);
	   }
	   return Math.sqrt(acum/arrayData.length);
   };

   this._getMaxAndMin = function(arrayData){
	   var min = Number.MAX_VALUE;
	   var max = Number.MIN_VALUE;
	   
	   for (var i = 0; i< arrayData.length; i++){
		   if (arrayData[i] < min) min =  parseFloat(arrayData[i]);
		   
		   if (arrayData[i] > max) max =  parseFloat(arrayData[i]);
	   }
	   
	   return [min, max];
   };
};
//****   EVENT INTERFACE ****//
/*var Event = function (sender) {
    this._sender = sender;
    this._listeners = [];
};*/

function Event(sender) {
    this._sender = sender;
    this._listeners = [];
};

 
Event.prototype = {
    addEventListener : function (listener) {
        this._listeners.push(listener);
    },
    notify : function (args) {
        for (var i = 0; i < this._listeners.length; i++) {
            this._listeners[i](this._sender, args);
        }
    }
};
var Colors = new function()
{
   this.hashColor = [];
   this.getColorByScoreArrayValue = function (arrayScore)
   {
	   var array = new Array();
	   
	   for (var i = 0; i< arrayScore.length; i++)
	   {
		
		   var color = this.getColorByScoreValue(arrayScore[i]);
		   array.push( color);
		
	   }
	   return array;  
   };
   
   this.getHexStringByScoreArrayValue = function (arrayScore)
   {
	   var arrayColor = this.getColorByScoreArrayValue(arrayScore); 
	   var arrayHex = new Array();
	   for (var i = 0; i< arrayColor.length; i++)
	   {
		   arrayHex.push( arrayColor[i].HexString());
	   }
	   return arrayHex;   
   };
  
   this.getColorByScoreValue = function (score)
   {

		var truncate = score.toString().substr(0,4);
		if (this.hashColor[truncate]!=null)
		{
			return this.hashColor[truncate];
		}


		if(isNaN(score)) {
			return Colors.ColorFromRGB(0,0,0);
		}
		var value;
	
		var from, to;
		if(score < 0.5) {
			from = Colors.ColorFromRGB(0,0,255);
			to = Colors.ColorFromRGB(255,255,255);
			value = (score * 2);
		} else {
			from = Colors.ColorFromRGB(255,255,255);
			to = Colors.ColorFromRGB(255,0,0);			
			value = (score * 2) - 1;
		}

		var x = value;
		var y = 1.0 - value;
		var color = Colors.ColorFromRGB(y * from.Red() + x * to.Red(), y * from.Green() + x * to.Green(), y * from.Blue() + x * to.Blue());

		this.hashColor[truncate] = color;

		return color;
	};
	
  this.ColorFromHSV = function(hue, sat, val)
  {
    var color = new Color();
    color.SetHSV(hue,sat,val);
    return color;
  };

  this.ColorFromRGB = function(r, g, b)
  {
    var color = new Color();
    color.SetRGB(r,g,b);
    return color;
  };

  this.ColorFromHex = function(hexStr)
  {
    var color = new Color();
    color.SetHexString(hexStr);
    return color;
  };

  function Color() {
    //Stored as values between 0 and 1
    var red = 0;
    var green = 0;
    var blue = 0;
    
    //Stored as values between 0 and 360
    var hue = 0;
    
    //Strored as values between 0 and 1
    var saturation = 0;
    var value = 0;
     
    this.SetRGB = function(r, g, b)
    {
      red = r/255.0;
      green = g/255.0;
      blue = b/255.0;
      calculateHSV();
    };
    
    this.Red = function() { return Math.round(red*255); };
    
    this.Green = function() { return Math.round(green*255); };
    
    this.Blue = function() { return Math.round(blue*255); };
    
    this.SetHSV = function(h, s, v)
    {
      hue = h;
      saturation = s;
      value = v;
      calculateRGB();
    };
      
    this.Hue = function()
    { return hue; };
      
    this.Saturation = function()
    { return saturation; };
      
    this.Value = function()
    { return value; };
     
    this.SetHexString = function(hexString)
    {
      if(hexString == null || typeof(hexString) != "string")
      {
        this.SetRGB(0,0,0);
        return;
      }
       
      if (hexString.substr(0, 1) == '#')
        hexString = hexString.substr(1);
        
      if(hexString.length != 6)
      {
        this.SetRGB(0,0,0);
        return;
      }
          
      var r = parseInt(hexString.substr(0, 2), 16);
      var g = parseInt(hexString.substr(2, 2), 16);
      var b = parseInt(hexString.substr(4, 2), 16);
      if (isNaN(r) || isNaN(g) || isNaN(b))
      {
        this.SetRGB(0,0,0);
        return;
      }
        
      this.SetRGB(r,g,b);  
    };
      
    this.HexString = function()
    {
    
      var rStr = this.Red().toString(16);
      if (rStr.length == 1)
        rStr = '0' + rStr;
      var gStr = this.Green().toString(16);
      if (gStr.length == 1)
        gStr = '0' + gStr;
      var bStr = this.Blue().toString(16);
      if (bStr.length == 1)
        bStr = '0' + bStr;
      return ('#' + rStr + gStr + bStr).toUpperCase();
    };
    
    this.Complement = function()
    {
      var newHue = (hue >= 180) ? hue - 180 : hue + 180;
      var newVal = (value * (saturation - 1) + 1);
      var newSat = (value*saturation) / newVal;
      var newColor = new Color();
      newColor.SetHSV(newHue, newSat, newVal);
      return newColor; 
    } ;
    
    function calculateHSV()
    {
      var max = Math.max(Math.max(red, green), blue);
      var min = Math.min(Math.min(red, green), blue);
      
      value = max;
      
      saturation = 0;
      if(max != 0)
        saturation = 1 - min/max;
        
      hue = 0;
      if(min == max)
        return;
      
      var delta = (max - min);
      if (red == max)
        hue = (green - blue) / delta;
      else if (green == max)
        hue = 2 + ((blue - red) / delta);
      else
        hue = 4 + ((red - green) / delta);
      hue = hue * 60;
      if(hue < 0)
        hue += 360;
    }
    
    function calculateRGB()
    {
      red = value;
      green = value;
      blue = value;
      
      if(value == 0 || saturation == 0)
        return;
      
      var tHue = (hue / 60);
      var i = Math.floor(tHue);
      var f = tHue - i;
      var p = value * (1 - saturation);
      var q = value * (1 - saturation * f);
      var t = value * (1 - saturation * (1 - f));
      switch(i)
      {
        case 0:
          red = value; green = t;       blue = p;
          break;
        case 1:
          red = q; green = value; blue = p;
          break;
        case 2:
          red = p; green = value; blue = t;
          break;
        case 3:
          red = p; green = q; blue = value;
          break;
        case 4:
          red = t; green = p;   blue = value;
          break;
        default:
          red = value; green = p;       blue = q;
          break;
      }
    }
  }
}
();

/*
 * String buffer
 */
// Constructor
function StringBuffer() {
	this.buffer = [];
};
// append
StringBuffer.prototype.append = function(string){
	this.buffer.push(string);
	return this;
};
// appendln
StringBuffer.prototype.appendln = function(string){
	this.buffer.push(string + "\n");
	return this;
};
// toString
StringBuffer.prototype.toString = function() {
	return this.buffer.join("");
};var Geometry =
{
		
	/** From tow points obtains the angles formed with the cartesian side **/
	getAngleBetweenTwoPoints : function(x1, y1, x2, y2){
		//var m = (y1 - y2)/ (x1 - x2);
		return Math.atan2(y2-y1, x2-x1);
	},
	
	getAdjacentSideOfRectangleRight : function(angle, hypotenuse){
		return Math.abs(Math.cos(angle)*hypotenuse);
	},
	
	getOppositeSideOfRectangleRight : function(angle, hypotenuse){
		return Math.abs(Math.sin(angle)*hypotenuse);
	},
	
	toDegree: function(radian){
		return radian*180/Math.PI;
		
	}
	
	
};
var SHAPE=0;
var SQUARE=1;
var RECTANGLE=2;
var ROUNDEDREC=3;
var CIRCLE=4;
var TRIANGLE=5;
var PANEL=6;
var TEXT=7;
var LINE=9;

var VERTICAL =0;
var HORIZONTAL = 1;


//LIBRERIA DE GRAPHICS PARA CANVAS


function Point(x, y)
{
	this.x=x;
	this.y=y;
}
Point.prototype.getDistance = function(point) {
	
    var dx= Math.pow(this.x- point.x, 2);
	var dy= Math.pow(this.y- point.y, 2);
	return Math.sqrt(dx+dy);
};



function Shape (top, left) {
    this.top = top;
    this.left = left;
	this.color="#000000";
	this.canvas = null;
	this.visible=true;
	this.type=SHAPE;
	
	this.borderColor="#000000";
	this.borderWidth= 0 ;
   
}
Shape.prototype.toString = function() {
    return this.type+': '+this.top + ' ' + this.left;
};

Shape.prototype.setBorderColor = function(color) {
   this.borderColor=color;
};

Shape.prototype.setBorderWidth = function(size) {
	   this.borderWidth=size;
};




Shape.prototype.setColor = function(color) {
    this.color=color;
};

Shape.prototype.render = function(canvas) {
    this.canvas=canvas;
	
};

Shape.prototype.setVisible = function(visible) {
    this.visible=visible;
};




/********** Rectangulo  ****************/
function Rectangle(top, left, height,width) {
	
 	Shape.call(this, top, left);
    this.width = width;
	this.height=height; 
	this.type=RECTANGLE;
	
}

Rectangle.prototype = new Shape;
Rectangle.prototype.constructor = Rectangle;
Rectangle.prototype.render = function(canvas) {
				if (!this.visible) return;
				canvas.save();
				
					
				canvas.lineWidth   = 2;
				canvas.strokeStyle = "#000000"; 
				canvas.beginPath();  
				canvas.moveTo(this.left,this.top);  
				canvas.lineTo(this.left  + this.width ,this.top); 
				canvas.lineTo(this.left + this.width ,this.top + this.height ); 
				canvas.lineTo(this.left ,this.top + this.height ); 
				canvas.closePath();
				canvas.stroke();
				


				canvas.fillStyle = this.color;	
				//canvas.clearRect(this.left, this.top, this.width, this.height);
				
				canvas.fillRect(this.left, this.top, this.width, this.height);
				//canvas.strokeStyle = "#000000"; 
				//canvas.strokeRect(this.left, this.top, this.width, this.height);
			
				
				canvas.restore();
};

Rectangle.prototype.remove = function() {			
				this.canvas.clearRect(this.left, this.top, this.width, this.height);		
};


Rectangle.prototype.contains = function(x,y) {
				if (y>=this.left && y<=this.width+this.left)
				{
					if (x>=this.top && x<=this.height+this.top)
					{
						return true;
					}
					else
						return false;				
				}	
				else
					return false;
};



/********** RoundedRec  ****************/
function RoundedRec(left, top, width, height, radio) {
	
 	Rectangle.call(this, top, left, height, width);
    this.radio=radio;
	this.type=ROUNDEDREC;
	
}

RoundedRec.prototype = new Rectangle;
RoundedRec.prototype.constructor = RoundedRec;

RoundedRec.prototype.render = function(canvas) {
				if (!this.visible) return;
				canvas.save();
				canvas.fillStyle = this.color;	
				canvas.beginPath();  
				canvas.moveTo(this.left,this.top+this.radio);  
				canvas.lineTo(this.left,this.top+this.height-this.radio);  
				canvas.quadraticCurveTo(this.left,this.top+this.height,this.left+this.radio,this.top+this.height);  
				canvas.lineTo(this.left+this.width-this.radio,this.top+this.height);  
				canvas.quadraticCurveTo(this.left+this.width,this.top+this.height,this.left+this.width,this.top+this.height-this.radio);  
				canvas.lineTo(this.left+this.width,this.top+this.radio);  
				canvas.quadraticCurveTo(this.left+this.width,this.top,this.left+this.width-this.radio,this.top);  
				canvas.lineTo(this.left+this.radio,this.top);  
				canvas.quadraticCurveTo(this.left,this.top,this.left,this.top+this.radio);  
				canvas.fill();	
				if (this.borderWidth!=0)
				{
					canvas.strokeStyle = this.borderColor; 
					canvas.lineWidth   = this.borderWidth;
					canvas.stroke();
				}
				canvas.restore();
			
				
};






/*********   CUADRADO   ***************/
function Square(left, top, lado) {
	
 	Shape.call(this, top, left);
    this.height = lado;  
	this.width = lado;  
	this.type=SQUARE;
}

Square.prototype = new Shape;
Square.prototype.constructor = Square;

Square.prototype.remove = function() {
				this.canvas.clearRect(this.top, this.left, this.width, this.height);
};


Square.prototype.render = function(canvas) {
				Shape.prototype.render.call(this, canvas);
				if (!this.visible) return;
				canvas.save();
					
				canvas.fillStyle = this.color;	
				canvas.fillRect(this.top, this.left, this.width, this.height);
				if (this.borderWidth!=0)
				{
					canvas.strokeStyle = this.borderColor; 
					canvas.lineWidth   = this.borderWidth;
					canvas.strokeRect(this.top, this.left, this.width, this.height);
				}
				canvas.restore();				
};

Square.prototype.contains = function(x,y) {
				if (y>=this.left && y<=this.width+this.left)
				{
					if (x>=this.top && x<=this.height+this.top)
					{
						return true;
					}
					else
						return false;
					}	
				else
					return false;
};


/***********  CIRCULO  **********/
function Circle(left, top, Radio) {
 	Shape.call(this, top, left);
    this.radio = Radio; 
	this.type=CIRCLE;	
}

Circle.prototype = new Shape;
Circle.prototype.constructor = Circle;

Circle.prototype.render = function(canvas) {
				Shape.prototype.render.call(this, canvas);
				if (!this.visible) return;
				canvas.save();
				canvas.beginPath();
				canvas.fillStyle = this.color;	
				canvas.arc(this.top+this.radio, this.left+this.radio, this.radio, 0, Math.PI*2, true);	
				
				if (this.borderWidth!=0)
				{
					canvas.strokeStyle = this.borderColor; 
					canvas.lineWidth   = this.borderWidth;
					canvas.stroke();
				}
				canvas.closePath();
				canvas.fill();
				canvas.restore();				
};


Circle.prototype.contains = function(x,y) {
				var point = new Point(x,y);
				var distancia = point.getDistance(new Point(this.top+this.radio, this.left+this.radio));
				if (distancia<=this.radio) return true;
				else return false;
};


/********** Triangulo  ****************/
function Triangle(x1, y1, x2, y2, x3,y3) {
   Shape.call(this, x1, y1);
   this.x1=x1;
   this.y1=y1;
   this.x2=x2;
   this.y2=y2;
   this.x3=x3;
   this.y3=y3;
   this.type=TRIANGLE;
	
}

Triangle.prototype = new Shape;
Triangle.prototype.constructor = Triangle;
Triangle.prototype.render = function(canvas) {
	if (!this.visible) return;
	canvas.save();
	canvas.fillStyle = this.color;	
	canvas.beginPath();  
	canvas.moveTo(this.x1,this.y1);  
	canvas.lineTo(this.x2, this.y2); 
	canvas.lineTo(this.x3, this.y3);
	canvas.closePath();
	canvas.fill();	
	if (this.borderWidth!=0)
	{
		canvas.strokeStyle = this.borderColor; 
		canvas.lineWidth   = this.borderWidth;
		canvas.stroke();
	}
	canvas.restore();
};

Triangle.prototype.toString = function() {
	return this.type;
};


Triangle.prototype.contains = function(x,y) {
				
					return false;
};





/********* Text ************/
function Text(left, top, text) {
 	Shape.call(this, top, left);
    this.text=text;
	this.type=TEXT;	
	this.orientation=HORIZONTAL;


}


function Text(top, left, text, orientation) {
 	Shape.call(this, top, left);
    this.text=text;
	this.type=TEXT;	
	this.orientation=orientation;
	

}

Text.prototype = new Shape;
Text.prototype.constructor = Text;



Text.prototype.setFont = function(font) {
	this.font=font;
};


Text.prototype.render = function(canvas) {
	
	canvas.save();
	
	canvas.fillStyle    = this.color;
	canvas.font         = this.font;
	canvas.textBaseline = 'top';
	
	
	var dim = canvas.measureText(this.text);

	if (this.orientation!=HORIZONTAL)
	{
    	canvas.rotate(-Math.PI/2);	
		canvas.translate(-this.top,this.left);
	}
	else
	{
		
		//canvas.translate(this.top,this.left);
	}
	
	canvas.fillText (this.text, 0, 0);
	canvas.restore();
};





/*********   LINE   ***************/
function Line(pointX, pointY) {
	
 	Shape.call(this, pointX.x, pointX.y);
	this.point=pointY;
	this.type=LINE;
	this.color="#FFCCFF";
}

Line.prototype = new Shape;
Line.prototype.constructor = Line;

Line.prototype.remove = function() {
				this.canvas.clearRect(this.top, this.left, 1, 1);
};


Line.prototype.render = function(canvas) {
				Shape.prototype.render.call(this, canvas);
				
				canvas.save();
					
				canvas.fillStyle = this.color;	
				
				canvas.beginPath();  
				canvas.moveTo(this.left,this.top);  
				canvas.lineTo(this.point.x, this.point.y); 
				canvas.closePath();
				canvas.stroke();
				
				canvas.restore();				
};



var SVG =
{
		svgns : 'http://www.w3.org/2000/svg',
		xlinkns : "http://www.w3.org/1999/xlink",

	createSVGCanvas: function(parentNode, attributes)
	{
		attributes.push( ['xmlns', SVG.svgns], ['xmlns:xlink', 'http://www.w3.org/1999/xlink']);
		var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this._setProperties(svg, attributes);
		parentNode.appendChild( svg);
		return svg;
		
	}, 
	
	createRectangle : function (x, y, width, height,  attributes){
				var rect = document.createElementNS(this.svgns, "rect");
				rect.setAttribute("x",x);		
				rect.setAttribute("y",y);	
				rect.setAttribute("width",width);		
				rect.setAttribute("height",height);	
				SVG._setProperties(rect, attributes);
				return rect;
	},
	
	drawImage64 : function (x, y, width, height, base64, svgNode, attributes) {
		var node = SVG.createImage64(x, y, width, height, base64, attributes);
		svgNode.appendChild(node);
		return node;
	},
	
	createImage64 : function (x, y, width, height, base64,  attributes)	{
				var img = document.createElementNS(this.svgns, "image");
				img.setAttribute("x",x);		
				img.setAttribute("y",y);	
				img.setAttribute("width",width);		
				img.setAttribute("height",height);	
				img.setAttribute("xlink:href",base64);	
				SVG._setProperties(img, attributes);
				return img;
	},
	
	createLine:  function (x1, y1, x2, y2, attributes){
				var line = document.createElementNS(this.svgns,"line");
				line.setAttribute("x1",x1);		
				line.setAttribute("y1",y1);	
				line.setAttribute("x2", x2);	
				line.setAttribute("y2", y2);
				SVG._setProperties(line, attributes);
				return line;
	},
	
	createClip:  function (id, nodeToClip, attributes){
				var clip = document.createElementNS(this.svgns,"clipPath");
				clip.setAttribute("id",id);
				clip.appendChild(nodeToClip);
				return clip;
	},
	
	drawClip : function (id, nodeToClip, svgNode) {
		var node = SVG.createClip(id, nodeToClip);
		svgNode.appendChild(node);
		return node;
	},

	drawRectangle : function (cx, cy, width, height, svgNode, attributes) {
		try{
			var node = SVG.createRectangle(cx, cy, width, height, attributes);
			svgNode.appendChild(node);
		}
		catch(e){
			
			console.log("-------------------- ");
			console.log("Error on drawRectangle " + e);
			console.log(attributes);
			console.log("-------------------- ");
		}
			return node;
	},
	
	createEllipse : function (x, y, rx, ry,  attributes){
				var rect = document.createElementNS(this.svgns, "ellipse");
				rect.setAttribute("cx",x);		
				rect.setAttribute("cy",y);
				rect.setAttribute("rx",rx);		
				rect.setAttribute("ry",ry);	
				SVG._setProperties(rect, attributes);
				return rect;
 	},
	
	drawEllipse : function (cx, cy, rx, ry, svgNode, attributes) {
		var node = SVG.createEllipse(cx, cy, rx, ry, attributes);
		svgNode.appendChild(node);
		return node;
	},
	
	drawImage : function (x, y, canvasSVG, attributes) {
				var image = document.createElementNS(this.svgns, "image");
				image.setAttribute("x",x);		
				image.setAttribute("y",y);		
				canvasSVG.appendChild(image);
				SVG._setProperties(image, attributes);
	},

	drawLine : function (x1, y1, x2, y2, nodeSVG, attributes) {
		try{
				var line = SVG.createLine(x1, y1, x2, y2, attributes);
				nodeSVG.appendChild(line);
		}catch(e){
			debugger;
		}
				return line;
	},
	
	
	 drawPath: function (d, nodeSVG, attributes) {
        var path = SVG.createPath(d, attributes);
        nodeSVG.appendChild(path);
        return path;
	},

	 createPoligon : function (points,  attributes){
        var poligon = document.createElementNS(this.svgns, "polygon");
        poligon.setAttribute("points",points);
        SVG._setProperties(poligon, attributes);
        return poligon;
    },
    
    drawPoligon : function (points,  canvasSVG, attributes){
    	var poligon = SVG.createPoligon(points, attributes);
    	canvasSVG.appendChild(poligon);
		return poligon;
    },
	//<polygon points="20,420, 300,420 160,20" />
	
	createPath : function (d,  attributes){
         var path = document.createElementNS(this.svgns, "path");
         path.setAttribute("d",d);
         SVG._setProperties(path, attributes);
         return path;
     },

	drawCircle : function (x, y, radio, canvasSVG, attributes) {
	
				var newText = document.createElementNS(this.svgns,"circle");
				newText.setAttribute("cx",x);		
				newText.setAttribute("cy",y);	
				newText.setAttribute("r",radio);	
				
				canvasSVG.appendChild(newText);
				this._setProperties(newText, attributes);	
				return newText;
	},
	
	
	_setProperties: function(node, attributes)
	{
		if (attributes instanceof Array){
				for (var i=0; i< attributes.length; i++)
				{
					node.setAttribute(attributes[i][0], attributes[i][1]);
				}
		}
		else{
			for ( var key in attributes){
				node.setAttribute(key, attributes[key]);
			}
		}
	},

/*	drawPath: function(pointsArray, canvasSVG, attributes){
				var path = document.createElementNS(this.svgns,"polyline");
				path.setAttribute ('id', id);
				
				var d= pointsArray[0].x+ " "+ pointsArray[0].y;
				for (var i=1; i< pointsArray.length; i++)
				{
						d=d+" "+pointsArray[i].x+" "+pointsArray[i].y; 
				}
				path.setAttribute ('points', d);
				canvasSVG.appendChild(path);
	},*/

	createText : function (x, y, text, attributes) {
				var node = document.createElementNS(this.svgns,"text");
				node.setAttributeNS(null , "x",x);		
				node.setAttributeNS(null, "y",y);	
				
				var textNode = document.createTextNode(text);
				node.appendChild(textNode);
				
				this._setProperties(node, attributes);
				return node;
	},
	
	drawText : function (x, y, text, canvasSVG, attributes) {
				var text = SVG.createText(x, y, text, attributes);
				canvasSVG.appendChild(text);
				return text;
	},



	drawGroup: function(svgNode, attributes)
	{
		 var group = SVG.createGroup(attributes);
		 svgNode.appendChild(group);
		 return group;
	},
			
	createGroup: function(attributes){
				var group = document.createElementNS(this.svgns,"g");
				this._setProperties(group, attributes);	
				return group;
	}
			
};



var CanvasToSVG = {
		
	convert: function(sourceCanvas, targetSVG, x, y, id, attributes) {
		
		var img = this._convert(sourceCanvas, targetSVG, x, y, id);
		
		for (var i=0; i< attributes.length; i++)
		{
			img.setAttribute(attributes[i][0], attributes[i][1]);
		}
	},
	
	_convert: function(sourceCanvas, targetSVG, x, y, id) {
		var svgNS = "http://www.w3.org/2000/svg";
		var xlinkNS = "http://www.w3.org/1999/xlink";
		// get base64 encoded png from Canvas
		var image = sourceCanvas.toDataURL();

		// must be careful with the namespaces
		var svgimg = document.createElementNS(svgNS, "image");

		svgimg.setAttribute('id', id);
	
		//svgimg.setAttribute('class', class);
		//svgimg.setAttribute('xlink:href', image);
		svgimg.setAttributeNS(xlinkNS, 'xlink:href', image);
		

		

		svgimg.setAttribute('x', x ? x : 0);
		svgimg.setAttribute('y', y ? y : 0);
		svgimg.setAttribute('width', sourceCanvas.width);
		svgimg.setAttribute('height', sourceCanvas.height);
		//svgimg.setAttribute('cursor', 'pointer');
		svgimg.imageData = image;
	
		targetSVG.appendChild(svgimg);
		return svgimg;
	},
	
	importSVG: function(sourceSVG, targetCanvas) {
	    svg_xml = sourceSVG;//(new XMLSerializer()).serializeToString(sourceSVG);
	    var ctx = targetCanvas.getContext('2d');

	    var img = new Image();
	    img.src = "data:image/svg+xml;base64," + btoa(svg_xml);
//	    img.onload = function() {
	        ctx.drawImage(img, 0, 0);
//	    };
	}
	
};
/*
Graph.prototype.importSVG = function(sourceSVG, targetCanvas) {
	sourceSVG = this._svg;
	targetCanvas = document.createElement('canvas'); 
    // https://developer.mozilla.org/en/XMLSerializer
    svg_xml = (new XMLSerializer()).serializeToString(sourceSVG);
    var ctx = targetCanvas.getContext('2d');
    // this is just a JavaScript (HTML) image
    var img = new Image();
    // http://en.wikipedia.org/wiki/SVG#Native_support
    // https://developer.mozilla.org/en/DOM/window.btoa
    img.src = "data:image/svg+xml;base64," + btoa(svg_xml);
    img.onload = function() {
        // after this, Canvas’ origin-clean is DIRTY
        ctx.drawImage(img, 0, 0);
    }
};
*/var userUI = new function()
{
	this.clientMessages =  { info:[], warning:[], error:[]};
	
	this.getUser = function() {
		return  wc_getFullUser();
	};
	
	this.getUserInfo = function() {
		return  wc_getUserInfo();
	};
	
	this.getServerMessages  = function() {
		return wc_getMessages();
	};
	
	this.getClientMessages  = function() {
		return this.clientMessages;
	};
	
	this.addWarningMessage  = function(message) {
		this.clientMessages.warning.push(message);
	};
	
	this.addErrorMessage  = function(message) {
		this.clientMessages.error.push(message);
	};
	
	this.addInfoMessage  = function(message) {
		this.clientMessages.info.push(message);
	};
	
	this.clearAllClientMessages = function()
	{
		this.clientMessages = { info:[], warning:[], error:[]};	
	};
	
	this.getData = function()
	{
			return wc_getOwnedDataList();
	};
	
	this.getJobData = function(jobId)
	{
			var datalist = wc_getOwnedDataList();
			var dataInJob= new Array();
			
			if (datalist==null ) return dataInJob;
			
			for (var i = 0; i< datalist.length; i++)
			{
					if (datalist[i].jobId == jobId)
					{
						dataInJob.push(datalist[i]);	
					}
			}
			return dataInJob;
	};
};
      
  


function getSO(){
   	
   	var navInfo = window.navigator.appVersion.toLowerCase();
   	var so = 'Unknown';    
    if(navInfo.indexOf('win') != -1){  
    	so = 'Windows';  
    }else if(navInfo.indexOf('x11') != -1){  
		so = 'Linux';
	}else if(navInfo.indexOf('mac') != -1){  
		so = 'Macintosh'; 
	}
	return so;  
  }  


/**

BROWSER: encapsula todos los métodos que nos dan información sobre el navegador

**/
var Browser = {};

Browser.getappCodeName = function() {
	return navigator.appCodeName;
};

Browser.getappVersion = function() {
	return navigator.appVersion;
};

Browser.cookieEnabled = function() {
	return navigator.cookieEnabled;
};

Browser.getPlatform = function() {
	return navigator.platform;
};

Browser.getuserAgent = function() {
	return navigator.userAgent;
};



  function getBrowser(){
  var version ='';
  var browser='';
  	$.each($.browser, function(i, val){
		
		if (i == 'version'){
			version=val;
		}
		if (val == true){
			browser = i;
		}
  	});
	return "Browser: "+ browser + " V."+ version;
  }
  
  
  function getBrowserName(){
  var version ='';
  var browser='';
  	$.each($.browser, function(i, val){
		if (val == true){
			browser = i;
		}
  	});
	return browser;
  }
  var Config = function(cookieName){
	
	// cookie name
	var cookieName = cookieName;
	
	/*
	 * COOKIE MANAGEMENT
	 */

	this.save = function (){
	    	//alert("stringify: " +  JSON.stringify(this));
		$.cookie(cookieName, JSON.stringify(this));
		//var aux = JSON.parse($.cookie(cookieName));
	};
	
	this.finalize = function (){	
		$.cookie(cookieName, null);		
		// this.prototype = null;
	};
	
	/*
	 * GETTERS AND SETTERS  
	 */
	
	this.set = function(key,value){		
		this[key] = value;
		this.save();
	};
	
	this.get = function(key){
		return this[key];
	};
	
	// init
	if($.cookie(cookieName)!=null) {	    	
		// getting old properties
		var aux = JSON.parse($.cookie(cookieName));
		// setting old properties to new object
		for (var key in aux){
		    if(key!="save" && key!="finalize" && key!="get" && key!="set"){
		    	this[key] = aux[key];
		    }
		}
	};
	
	// initial save
	this.save();

};

/*
    http://www.JSON.org/json2.js
    2009-09-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
var PUBMED_RSS;
var BIOINFO_RSS;

var FEED_OBJECT;
var NUMBER_OF_FEEDS=0;

function initFeedUrls(){
	
	// Pubmed
	PUBMED_RSS = {};
	PUBMED_RSS["babelomics"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=18A2e0_HeVtQ9k4iNuwfZFSuh5Ck38BCLWW3Wrlll4hWvJ8AtH";
	PUBMED_RSS["gepas"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1JKSd2KF3MGnV8mU6zDJ5PPH9-xMKOjyzBOmIeDyef9oPjR19C";
	PUBMED_RSS["fatigo"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=14GVrEVieJsBLt8q3l7R_YRQF8Tljz7pDcLCPmsBXT7C3vcMrI";
	PUBMED_RSS["fatiscan"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=18ervbTh5AP3vfhgpfpT8nuS-nlu-HGIjZU1IFPR3fJ15OKAOb";
	PUBMED_RSS["gesbap"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1Rkszs2HVZ2QHM3VV-sfTuWBxZ3syAewBayCSYb3ariok2b1DW";
	PUBMED_RSS["genecodis"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1h7Su3P88Y-s0IJD2PR7EPdYjWx0n1H8LGb-Zm150P3-TFVERh";
	PUBMED_RSS["blast2go"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1HC7gWvsJppOwqCZp0h91Mvqp-QMP15A6Y7Qg2jKNZy3Ap4gfa";
	PUBMED_RSS["snow"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1FU_ZGTY7E6tYYsWpRpUfCUmW163CN4E08cHCccdpHbJvTmgv7";
		
	// Bioinfo
	BIOINFO_RSS = {};
	BIOINFO_RSS["babelomics"] = "http://bioinfo.cipf.es/taxonomy/term/53/feed/xml";
	BIOINFO_RSS["gepas"] = "http://bioinfo.cipf.es/taxonomy/term/52/feed/xml";
	BIOINFO_RSS["fatiscan"] = "http://bioinfo.cipf.es/taxonomy/term/65/feed/xml";
	BIOINFO_RSS["snow"] = "http://bioinfo.cipf.es/taxonomy/term/50/feed/xml";
	
}

function loadFeedByTags(tags, container){	
	// de tags a urls
	var input = new StringBuffer();
	input.append("<div id ='referencesContainer' class='feed-content'>");
	input.append("	<table style='width:100%; height:100%'>");
	input.append("		<tr valign='middle'>");
	input.append("			<td align='center'>loading references...<img src='resources/images/icons/Waiting.gif' alt='' /></td>");
	input.append("		</tr>");
	input.append("	</table>");                
	input.append("</div> ");
	
	$("#" + container + "_references").append(input.toString());
	var urls = fromTags2Urls(tags);	
	// 
	FEED_OBJECT = [];
	loadUrlFeeds(urls,0,'referencesContainer');
}


function fromTags2Urls(tags){
	var tag;
	var urlContainer = [];
	if(tags.length>0){
		for(var i=0; i<tags.length; i++){
			tag = tags[i];
			if (!PUBMED_RSS)initFeedUrls();
			if (PUBMED_RSS[tag]){
				urlContainer = urlContainer.concat(PUBMED_RSS[tag]);
			}
		}
	}
	return urlContainer;
}

function loadUrlFeeds(urls,pos,container){	
	var curl = urls[pos];
	var success = function(feed){		
		// concat feed
		if(feed!=null){
			FEED_OBJECT = FEED_OBJECT.concat(feed);
		}
		// prepare next
		pos++;
	    if(pos<urls.length){
	    	loadUrlFeeds(urls,pos,container);
	    } else {
	    	renderFeeds(container);
	    }
	};
	$.jGFeed(curl,success);	
}

function renderFeeds(container){
	var input = new StringBuffer();
	var entries = [];
	var entryHash = [];
	if (FEED_OBJECT!=null && FEED_OBJECT.length>0){
		  for(var i=0; i<FEED_OBJECT.length; i++){
			  var feeds = FEED_OBJECT[i];			  
			  for(var j=0; j<feeds.entries.length; j++){
				  var entry = feeds.entries[j];
				  if(entryHash[entry.title]){
					  // NOTHING??
				  } else {
					  entryHash[entry.title] = true;
					  entries = entries.concat(feeds.entries[j]);
				  }
				  //entries = entries.concat(feeds.entries[j]);
			  }
		  }
		  // remove duplicates, etc...
			  
		  //
		  input.appendln( "<div>&nbsp;</div>");
		  input.appendln( "<div>&nbsp;</div>");
		  input.appendln( "<div>&nbsp;</div>");
		  input.append("<span class='references-title'>References</span>");
		  input.append("<ul>");
		  for(var j=0; j<entries.length; j++){
			  var entry = entries[j];
			  
			  input.append("<li>");
			
			  //Please include the following publications in your references: 
			  //input.append("		<span>" + entry.content.replace("/node","http://bioinfo.cipf.es/node").replace("/publications","http://bioinfo.cipf.es/publications") + "</span>");
			  
			  
			  input.append("<span>" + entry.author + ". </span>");
			  input.append("<span class='feed-content'><a href='" + entry.link + "'  target='_blank'> " + entry.title + "</a></span>");
			  input.append("<span>" + entry.categories + "</span>");
			
			  
			  var linksCaptures = entry.content.split("<a");
			  for (var i = 0 ; i < linksCaptures.length;i++){
				  var endOfLink = linksCaptures[i].lastIndexOf("</a>");
				  linksCaptures[i] = linksCaptures[i].substring(0, endOfLink);
			  }
			  
			  input.append("<div class='feed-link'><a class='text-show feed-link'>...see PubMed links</a>");
			  input.append("	<span class='text-hide feed-content'>");
				  for (var i = 0 ; i < linksCaptures.length;i++){
					  if (linksCaptures[i] != null && linksCaptures[i] != ""){
					  input.append("<a target='_blank'");
					  input.append(linksCaptures[i]);
					  input.append("</a>");
					  }
				  	}
			  input.append("	</spam>");
			  input.append("</div>");
			  
			  input.append("</li>");
			  input.appendln( "<div>&nbsp;</div>");
		  }		  
		  input.append("</ul>");
	
	} else {
		input.append("<div class='feed-content'>no feeds found</div");
	}
	$("#" + container).html(input.toString());
	initReadMore();
}


//function loadFeedReaderFromPubMed(){
//	var hashData = new Array();
//	hashData["babelomics"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1xMHPfv-Z-Bhf-TI-j1PQsgpj_MAo4FDJ3YF7uT1krJiKj7Y-e";
//	//fatigo j. dopazo
//	hashData["fatigo"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=14GVrEVieJsBLt8q3l7R_YRQF8Tljz7pDcLCPmsBXT7C3vcMrI";
//	
//	//Gene set analysis Medina I Dopazo J
//	hashData["fatiscan"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=18ervbTh5AP3vfhgpfpT8nuS-nlu-HGIjZU1IFPR3fJ15OKAOb";
//	//gesbap Dopazo J
//	hashData["gesbap"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1Rkszs2HVZ2QHM3VV-sfTuWBxZ3syAewBayCSYb3ariok2b1DW";
//	//ordered bu pubDate 
//	hashData["genecodis"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=10mYP7P18fge0rER3CvMpe8a7xjxhumSgrTV3cWqjwSUV7EEJy";
//	//snow
//	hashData["blast2go"] = "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/erss.cgi?rss_guid=1HC7gWvsJppOwqCZp0h91Mvqp-QMP15A6Y7Qg2jKNZy3Ap4gfa";
//	PUBMED_RSS = hashData;
//	
//}
//
//function loadFeedReaderFromBioinfo(){
//	var hashData = new Array();
//	hashData["babelomics"] = "http://bioinfo.cipf.es/taxonomy/term/53/feed/xml";
//	//fatigo j. dopazo
//	
//	hashData["gepas"] = "http://bioinfo.cipf.es/taxonomy/term/52/feed/xml";
//	
//	//Gene set analysis Medina I Dopazo J
//	hashData["fatiscan"] = "http://bioinfo.cipf.es/taxonomy/term/65/feed/xml";
//	
//	//snow
//	hashData["snow"] = "http://bioinfo.cipf.es/taxonomy/term/50/feed/xml";
//	BIOINFO_RSS = hashData;
//	
//}

//
//function loadFeedByTagsR(tags, idContainer,i){
//	NUMBER_OF_FEEDS = 0;
//	FEED_OBJECT = [];
////	recursiveme(0,tag,tags,idContainer,i);	 
//}
//
//function recursiveme(j,actualTag,tags,idContainer,i){
//	
// if (j < urlContainer.length){
//	
//	var urlLocal = urlContainer[j];
//	
//	$.jGFeed(urlLocal,function(feeds){
//		var urlLocalinter = urlLocal;
//	  // Check for errors
//	  if(!feeds){
//	    // there was an error
//		  NUMBER_OF_FEEDS++;
//	    return false;
//	  } 
//	
//	  if (PUBMED_RSS[actualTag] == urlLocalinter){
//	
//		  for (var h = 0; h<feeds.entries.length;h++){
//			  feeds.entries[h].rss="pubmed";
//		  }
//	  }
//	  else if (BIOINFO_RSS[actualTag]== urlLocalinter){
//		 
//		  for (var g = 0; g<feeds.entries.length;g++){
//			  feeds.entries[g].rss="bioinfo";
//		  }
//	  }  
//	  FEED_OBJECT = FEED_OBJECT.concat(feeds.entries);
//	  NUMBER_OF_FEEDS++;
//	  
//	  completeFeed(idContainer,urlContainer.length);
//	  j++;
//	 
//	  recursiveme(j, actualTag,tags, idContainer,i);
//	}, 100);
//}
// else {
//	 
//	i++;
//	 (loadFeedByTagsR(tags,idContainer,i));
// }
//}
//
//function completeFeed(idContainer, callBack_flag){
//	if (NUMBER_OF_FEEDS == callBack_flag){
//	 var tmpStr = new StringBuffer();
//	tmpStr.append("<table id = 'tb_"+idContainer+"' class='entrada'> ");
//	  for(var i=0; i<FEED_OBJECT.length; i++){
//	    var entry = FEED_OBJECT[i];
//	    var hashData = new Array();
//		  hashData[entry.title] = "true";
//		tmpStr.append("<tr><td> ");
//		
//		//title
//		//link
//		//author
//		//publish date null
//		//contentSnippet
//		//content: no merece
////		alert("link"+entry.link);
////		alert("date"+entry.publishedDate);
////		alert("date"+entry.publishedDate);
////		alert("contentSnippet"+entry.contentSnippet);
////		alert("content"+entry.content);
//		//tmpStr.append("<div class='contenido'><a href='"+entry.link+"' target='_blank'>"+ entry.title + "</a></div>");
//		if (entry.rss=="pubmed"){
//		tmpStr.append("<br/>");
//		tmpStr.append("<div class='feed-content'><a class='text-show wum-data-link'>...see PubMed references</a><span class='text-hide'>"+ entry.content.replace("/node","http://bioinfo.cipf.es/node").replace("/publications","http://bioinfo.cipf.es/publications") + "</span></div>");
//		}
//		
//		if (entry.rss=="bioinfo"){
//			tmpStr.append("<br/>");
//			tmpStr.append("<div class='feed-content'><a class='text-show wum-data-link'>...see our references</a><span class='text-hide'>"+ entry.content.replace("/node","http://bioinfo.cipf.es/node").replace("/publications","http://bioinfo.cipf.es/publications") + "</span></div>");
//			}
//		
//		//tmpStr.append("<div class='feed-content'>"+ entry.content + "</div>");
//		//var fecha = entry.publishedDate.split(" ");
//		//tmpStr.append("<div class='fecha'> " + fecha[1]+ " " +fecha[2]+" " + fecha[3]+ " "+ fecha[4]+"</div>");
//		//tmpStr.append("</td></tr> ");
//	  }
//	  tmpStr.append("</table> ");
//	  $("#"+idContainer).append(tmpStr.toString());
//	}
//	
//}

 Math.sha1Hash = function(msg)
 {
     // constants [§4.2.1]
     var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];


     // PREPROCESSING 
  
     msg += String.fromCharCode(0x80); // add trailing '1' bit (+ 0's padding) to string [§5.1.1]

     // convert string msg into 512-bit/16-integer blocks arrays of ints [§5.2.1]
     var l = msg.length/4 + 2;  // length (in 32-bit integers) of msg + ‘1’ + appended length
     var N = Math.ceil(l/16);   // number of 16-integer-blocks required to hold 'l' ints
     var M = new Array(N);
     for (var i=0; i<N; i++) {
         M[i] = new Array(16);
         for (var j=0; j<16; j++) {  // encode 4 chars per integer, big-endian encoding
             M[i][j] = (msg.charCodeAt(i*64+j*4)<<24) | (msg.charCodeAt(i*64+j*4+1)<<16) | 
                       (msg.charCodeAt(i*64+j*4+2)<<8) | (msg.charCodeAt(i*64+j*4+3));
         }
     }
     // add length (in bits) into final pair of 32-bit integers (big-endian) [5.1.1]
     // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
     // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
     M[N-1][14] = ((msg.length-1)*8) / Math.pow(2, 32); M[N-1][14] = Math.floor(M[N-1][14]);
     M[N-1][15] = ((msg.length-1)*8) & 0xffffffff;

     // set initial hash value [§5.3.1]
     var H0 = 0x67452301;
     var H1 = 0xefcdab89;
     var H2 = 0x98badcfe;
     var H3 = 0x10325476;
     var H4 = 0xc3d2e1f0;

     // HASH COMPUTATION [§6.1.2]

     var W = new Array(80); var a, b, c, d, e;
     for (var i=0; i<N; i++) {

         // 1 - prepare message schedule 'W'
         for (var t=0;  t<16; t++) W[t] = M[i][t];
         for (var t=16; t<80; t++) W[t] = Math.ROTL(W[t-3] ^ W[t-8] ^ W[t-14] ^ W[t-16], 1);

         // 2 - initialise five working variables a, b, c, d, e with previous hash value
         a = H0; b = H1; c = H2; d = H3; e = H4;

         // 3 - main loop
         for (var t=0; t<80; t++) {
             var s = Math.floor(t/20); // seq for blocks of 'f' functions and 'K' constants
             var T = (Math.ROTL(a,5) + Math.f(s,b,c,d) + e + K[s] + W[t]) & 0xffffffff;
             e = d;
             d = c;
             c = Math.ROTL(b, 30);
             b = a;
             a = T;
         }

         // 4 - compute the new intermediate hash value
         H0 = (H0+a) & 0xffffffff;  // note 'addition modulo 2^32'
         H1 = (H1+b) & 0xffffffff; 
         H2 = (H2+c) & 0xffffffff; 
         H3 = (H3+d) & 0xffffffff; 
         H4 = (H4+e) & 0xffffffff;
     }

     return H0.toHexStr() + H1.toHexStr() + H2.toHexStr() + H3.toHexStr() + H4.toHexStr();
 };

 //
 // function 'f' [§4.1.1]
 //
 Math.f = function(s, x, y, z) 
 {
     switch (s) {
     case 0: return (x & y) ^ (~x & z);           // Ch()
     case 1: return x ^ y ^ z;                    // Parity()
     case 2: return (x & y) ^ (x & z) ^ (y & z);  // Maj()
     case 3: return x ^ y ^ z;                    // Parity()
     }
 };

 //
 // rotate left (circular left shift) value x by n positions [§3.2.5]
 //
 Math.ROTL = function(x, n)
 {
     return (x<<n) | (x>>>(32-n));
 }

 //
 // extend Number class with a tailored hex-string method 
 //   (note toString(16) is implementation-dependant, and 
 //   in IE returns signed numbers when used on full words)
 //
 Number.prototype.toHexStr = function()
 {
     var s="", v;
     for (var i=7; i>=0; i--) { v = (this>>>(i*4)) & 0xf; s += v.toString(16); }
     return s;
 }

 	
function SVGComponent (componentID, targetNode,  args) {

	/** Groups and layers */
	this.SVGComponentNodeGroup = null;
	this.mainNodeGroup = null;
	this.labelNodeGroup = null;
	
	/** target */
	this.targetID = targetNode.id;
	
	/** Coordenates with default Setting */
	this.bottom = 30;
	this.top = 0;
	this.left = 100;
	this.right = 900;
	this.width = 1100;
	this.height = 50;
	this.svgHeight = this.height;
	
	
	
	/** Optional parameters */
	this.backgroundColor = "#FFFFFF";
	this.titleColor = "#000000";
	this.overflow = false;
	
	/** Optional parameters: title */
	this.title  = false;
	this.titleName = null;
	this.titleFontSize = 10;
	
	/** Processing optional parameters */
	if (args!=null){
		if (args.bottom!=null){
			this.bottom = args.bottom;		
		}
		if (args.top!=null){
			this.top = args.top;		
		}
		if (args.left!=null){
			this.left = args.left;		
		}
		if (args.right!=null){
			this.right = args.right;		
		}
		if (args.width!=null){
			this.width = args.width;		
		}
		if (args.height!=null){
			this.height = args.height;	
			this.svgHeight = args.height;		
		}
		if (args.svgHeight!=null){
			this.svgHeight = args.svgHeight;		
		}
		
		if (args.backgroundColor!=null){
			this.backgroundColor = args.backgroundColor;		
		}
		if (args.titleFontSize!=null){
			this.titleFontSize = args.titleFontSize;		
		}
		if (args.titleColor!=null){
			this.titleColor = args.titleColor;	
		}
		if (args.title!=null){
			this.title = true;
			this.titleName = args.title;
		}
		if (args.overflow!=null){
			this.overflow = args.overflow;
		}
	}
	
	/** id manage */
	this.id = SVGComponenterID;	
	this.idSVGComponent = this.id + "_Features";
	this.namesID = this.id + "_Names";
	this.idMain = this.id + "_Main";
	
	/** Events */
	this.click = new Event(this);
	
};




SVGComponent.prototype.createSVGDom = function(targetID, id, width, height, backgroundColor ) {
	var container = document.getElementById(targetID);
	if (this.overflow){
		container.setAttribute("overflow-y", "auto");
	}
	
	this._svg = SVG.createSVGCanvas(container, [["id", id], ["height", this.svgHeight], ["width", this.right]]);
	var rect = SVG.drawRectangle(this.left, 0, this.right - this.left , this.svgHeight, this._svg, [["fill", backgroundColor],[id, id + "_background"]]);
	
	return this._svg;
};



SVGComponent.prototype.mouseClick = function(event){};
SVGComponent.prototype.mouseMove = function(event){};
SVGComponent.prototype.mouseDown = function(event){};
SVGComponent.prototype.mouseUp = function(event){};


SVGComponent.prototype.init = function(){
	this._svg = this.createSVGDom(this.targetID, this.id, this.width, this.height, this.backgroundColor);
	this.mainNodeGroup = SVG.drawGroup(this._svg, [["id", this.idMain]]);
	this.SVGComponentNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idSVGComponent]]);
	this.labelNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idLabels]]);
	
	/** SVG Events listener */
	var _this = this;
	this._svg.addEventListener("click", function(event) {_this.mouseClick(event); }, false);
    this._svg.addEventListener("mousemove", function(event) { _this.mouseMove(event, _this); }, false);
    this._svg.addEventListener("mousedown", function(event) { _this.mouseDown(event, _this); }, false);
    this._svg.addEventListener("mouseup", function(event) { _this.mouseUp(event, _this); }, false);

};

/* CONTROLLER */
function GraphController(plotGraph, targetId, width, height, id) {
  
   this._model = plotGraph;
   this.id = id;
   this.targetId = targetId;
   this.interactomeId = "";

   this._layouts = new Array();
   
   this._layoutIndex = 0;
   this._showNodeLabels = true;
   this.height = height;
   this.width = width ;

   this.graphScale = 1;
   this.nodeScale = 1;

   this.nodeIdClicked = null;//This is the variable with the clicked node
   this.edgeIdClicked = null;//This is the variable with the clicked edge
   this.actionClick = 0; // 0 = move node; 1 = source edge node; 2 = target edge node
   this.canvasClicked = false;//it says whether canvas has been clicked or not 
   this.layoutCoordenates = new Array();

    this.init();
    this.svg = this.drawStaticHTML();
	
    this._view = new GraphView(this,this.svg,  width, height, id);

    //Labels
    this._showNodeLabels = true;
    
    var _this = this;

    this._view.nodeMoving.addEventListener(function (sender, nodeID){
			_this.nodeMoving(nodeID);
    });
    
    this._view.nodeClick.addEventListener(function (sender, nodeID){
		_this.nodeClicked(nodeID);
    });
    
    this._view.edgeClick.addEventListener(function (sender, nodeID){
		_this.edgeClicked(nodeID);
    });
    this._view.canvasClick.addEventListener(function (sender){
		_this.clickOnCanvas();
    });
    
    this._view.canvasMovingEvent.addEventListener(function (sender, coordenates){
    	 _this.canvasMoving(coordenates);
    });
    //Events
     this.nodeClick = new Event();
     this.edgeClick = new Event();
    this.canvasClick = new Event();
};

GraphController.prototype = {
	
    getSelectedNodeId : function(){
		return this._view.selectedNode;
    },
    getSelectedEdgeId : function(){
		return this._view.selectedEdge;
    },
    
    deserializer : function(jsonbject){
//    	var jsonbject = JSON.parse(json);
    	this._coordenates = jsonbject.Graph.coordenates;
    	this._shape = jsonbject.Graph.shape;
    	this._color = jsonbject.Graph.color;
    	this._size = jsonbject.Graph.size;
    	this._opacity = jsonbject.Graph.opacity;
    	this._id_title = jsonbject.Graph.id_title;
    	
    	this._nodeStrokeWidth = jsonbject.Graph.nodeStrokeWidth;
    	this._colorOfEdges = jsonbject.Graph.colorOfEdges;
    	this._deletedEdges = this._deserializerBooleans(jsonbject.Graph.deletedEdges);
    	this._deletedNodes = this._deserializerBooleans(jsonbject.Graph.deletedNodes);
    	this._visible = this._deserializerBooleans(jsonbject.Graph.visible);
    	this._visibleEdges = this._deserializerBooleans(jsonbject.Graph.visibleEdges);
    	
    	//this._edgesOfNode = jsonbject.controller.edgesOfNode;
    	
    },
    _deserializerBooleans : function(jsonMap){
	var controllerMap = new Array();
	for(key in jsonMap){
		if(jsonMap[key] == "true")
			controllerMap[key] = true;
		if(jsonMap[key] == "false")
			controllerMap[key] = false;	
	}
	return controllerMap;
    },
    serializer : function(){
    	var json = new StringBuffer();
    	json.append("{");
    	json.append("\"Graph\" : { \"nodes\" : [");
	for(var i = 0; i < this._model._nodes.length; i++){

		var node = this._model._nodes[i];
		var nodeId = this._model._nodes[i].id.replace(this.interactomeId, "");
		json.append("{");
		json.append("\"id\":\""+nodeId+"\",");
		json.append("\"edgesIndexes\":[");
		for(var j = 0; j < node.edgesIndexes.length; j++){
			json.append("\""+node.edgesIndexes[j]+"\"");
			if(j != node.edgesIndexes.length-1)
				json.append(",");
		}
		json.append("]}");
		if(i != this._model._nodes.length-1)
			json.append(",");
	}
	json.append("],\"edges\":[");
	for(var i = 0; i < this._model._edges.length; i++){
		var edge = this._model._edges[i];
		var edgeId = this._model._edges[i].id.replace(this.interactomeId, "");
		json.append("{");
		json.append("\"id\":\""+edgeId+"\",");
		json.append("\"source\":\""+edge.source.replace(this.interactomeId, "")+"\",");
		json.append("\"target\":\""+edge.target.replace(this.interactomeId, "")+"\",");
		json.append("\"type\":\""+edge.type+"\"}");
		if(i != this._model._edges.length-1)
			json.append(",");
	}
	json.append("],");
    	json.append(this._serializeCoordenatesToJSON("coordenates", this._coordenates, true));
    	json.append(this._serializeHashMaptoJSON("shape", this._shape, true));
    	json.append(this._serializeHashMaptoJSON("color", this._color, true));
    	json.append(this._serializeHashMaptoJSON("size", this._size, true));
    	json.append(this._serializeHashMaptoJSON("opacity", this._opacity, true));
    	json.append(this._serializeHashMaptoJSON("visible", this._visible, true));
	json.append(this._serializeHashMaptoJSON("id_title", this._id_title, true));
    	//json.append(this._serializeHashMaptoJSON("edgesOfNode", this._edgesOfNode, true));
    	json.append(this._serializeHashMaptoJSON("nodeStrokeWidth", this._nodeStrokeWidth, true));
    	json.append(this._serializeHashMaptoJSON("colorOfEdges", this._colorOfEdges, true));
    	json.append(this._serializeHashMaptoJSON("deletedEdges", this._deletedEdges, true));
    	json.append(this._serializeHashMaptoJSON("deletedNodes", this._deletedNodes, true));
    	json.append(this._serializeHashMaptoJSON("visibleEdges", this._visibleEdges, true));
    	json.append(this._serializeHashMaptoJSON("nodeStrokeWidth", this._nodeStrokeWidth, false));
    	
    	
    	//end of controller
    	json.append("}");
    	
    	//end of json
    	json.append("}");
    	return json.toString();
    },
    _serializeCoordenatesToJSON : function(propertyTitle, hashMap, hasContinuation){
    	var json = new StringBuffer();
    	json.append("\""+propertyTitle+"\" : {");
    	var records = new Array();
    	for ( var key in hashMap) {
    		records.push("\""+key+"\" : " + "["+ hashMap[key][0] + ","+ hashMap[key][1] + "]");  
		}
    	
    	for ( var i = 0; i < records.length - 1; i ++) {
    			json.append(records[i] + ",");
		}
    	json.append(records[records.length - 1]);
    	//end of coordenates
    	if (hasContinuation){
    		json.append("},");
    	}
    	else{
    		json.append("}");
    	}
    	return json;
    },
    _serializeHashMaptoJSON : function(propertyTitle, hashMap, hasContinuation){
    	var json = new StringBuffer();
    	json.append("\""+propertyTitle+"\" : {");
    	var records = new Array();
    	for ( var key in hashMap) {
    		records.push("\""+key+"\" : " + "\""+ hashMap[key] + "\"");  
		}
    	
    	for ( var i = 0; i < records.length - 1; i ++) {
    			json.append(records[i] + ",");
		}
    	json.append(records[records.length - 1]);
    	//end of coordenates
    	if (hasContinuation){
    		json.append("},");
    	}
    	else{
    		json.append("}");
    	}
    	return json;
    },
    
    init : function(){
    	this.setLayouts(this._model.layouts[0]);
    	// Nodes stuff
	this._coordenates = new Array(this._model.getNodes().length);
	this._shape = new Array(this._model.getNodes().length);
	this._size = new Array(this._model.getNodes().length);
	this._color = new Array(this._model.getNodes().length);
	this._opacity = new Array(this._model.getNodes().length);
	this._visible = new Array(this._model.getNodes().length);
	this._nodeStrokeWidth = new Array(this._model.getNodes().length);
	this._id_title = new Array(this._model.getNodes().length);

	//this._edgesOfNode = new Array(this._model.getNodes().length);
	this._deletedNodes = new Array(this._model.getNodes().length);
	this._deletedEdges = new Array(this._model.getEdges().length);
	this._colorOfEdges = new Array(this._model.getEdges().length);
		
	    this.setDefaultVisibility();
	    this.setDefaultSize();
	    this.setDefaultShape();
	    this.setDefaultColorNode();
	    this.setDefaultOpacity();
	    this.setDefaultNodeStrokeWidth();
	    this.setDefaultIdTitle();
	    //this.setEdgesOfNode();
	    this.setDefaultDeletedNodes();
	    this.setDefaultDeletedEdges();
	    this.setDefaultColorEdges();
	  
	    // Those are the attributes for edges
	   	this._visibleEdges = new Array(this._model.getEdges().length);
	   	
	   	this.setDefaultEdgeVisibility();
	  for (var i=0; i< this._model._nodes.length; i++){  
			var nodeId = this._model._nodes[i].id;
			this.setCoordenates(nodeId ,this._model._nodes[i].cx[0]*(this.width-100)+50, this._model._nodes[i].cy[0]*(this.height-100)+50 );
	   }
				
    },
	
	drawStaticHTML : function(){
		document.getElementById(this.targetId).innerHTML = "";
		this.svg = SVG.createSVGCanvas(document.getElementById(this.targetId), [["id", this.id],["viewBox", "0 0 "+this.width+" "+this.height], ["style", "top:0px; left:0px; width:"+this.width+"px; height:"+this.height+"px; cursor:all-scroll;background-repeat:no-repeat"]]);
		SVG.drawRectangle(0, 0, this.width, this.height, this.svg, [["fill", "white"], ["id", "background"],["opacity", "0"]]); 
		SVG.drawGroup(this.svg, [["id", "labels"]]);
		SVG.drawGroup(this.svg, [["id", "edges"]]);
		SVG.drawGroup(this.svg, [["id", "canvas"]]);
		return this.svg;
		
		
	},
	
    hideNodeLabels : function(){
    	 this._showNodeLabels = false;
    	 this._view.nodeLabelShow= false;
    	 this._view.clearLabels();
    },
	
    changeLayout : function (indexLayout){ 
		this._layoutIndex = indexLayout;
		
		for (var i=0; i< this._model.getNodes().length; i++){  
			var coordenateX =  this._model.Graph.nodes[i].cx[indexLayout];
			var coordenateY =   this._model.Graph.nodes[i].cy[indexLayout];
			
			var scaledX =  parseFloat(this.layoutCoordenates[indexLayout][i][0])*(this.width-100)+50;
			var scaledY = parseFloat(this.layoutCoordenates[indexLayout][i][1])*(this.height-100)+50;
			this.setCoordenates(this._model.getNodes()[i].getId() , Math.ceil(scaledX),  Math.ceil(scaledY) );
		}
		
		this.draw();
    },
    
    setLayouts : function(layout){
		  this._layouts = layout;
		  this.layoutCoordenates = new Array(this._layouts.length);
		  for (var j=0; j<this._layouts.length; j++)
		  {
				 this.layoutCoordenates[j] = this._model.layoutCoordenates; //new Array(this.json.Graph.nodes.length);
				
		   }

    },



    setBackgroundColor : function(color){
		this._view.getBackground().setAttribute("fill", color);
    },
    
    getBackgroundColor : function(){
		return this._view.getBackground().getAttribute("fill");
    },
    
    
    nodeClicked : function(nodeId){
	    this.nodeClick.notify();
    },
    edgeClicked : function(edgeId){
	    this.edgeClick.notify();
    },
    clickOnCanvas : function(){
	    this.canvasClick.notify();
    },
    
    draw : function()
    {
			this._view.clearAll();
			/*this.drawNodes();
			this.drawEdges();
			if (this._showNodeLabels){
				//this._view.showNodeLabels();
				this._view.clearLabels();
				this._view.renderNodeLabels();*/
			this.drawNodes();
			this.drawEdges();
			if (this._showNodeLabels){
				this._view.showNodeLabels(this);
			}
			
	
    },
    
    showNodeLabels: function() 
    {
		this._showNodeLabels = true;
		this._view.showNodeLabels(this);	
    },
    
   setDefaultOpacity : function(){
		for (var i=0; i< this._model.getNodes().length; i++){
			  this._opacity[this._model.getNodes()[i].id] = this._model.getNodes()[i].opacity;
		}
    },
    
    setDefaultSize : function(){
		for (var i=0; i< this._model.getNodes().length; i++){
			  this._size[this._model.getNodes()[i].id] = this._model.getNodes()[i].size;
		}
    },
    
    setDefaultVisibility : function()
    {
		for (var i=0; i< this._model.getNodes().length; i++){
			  this._visible[this._model.getNodes()[i].id] = true;
		}
    },
    
    setDefaultShape : function()
    {
		for (var i=0; i< this._model.getNodes().length; i++){
			  this._shape[this._model.getNodes()[i].id] =  this._model.getNodes()[i].shape;
		}
    },
    
    setDefaultColorNode : function()
    {
		for (var i=0; i< this._model.getNodes().length; i++){
			   this._color[this._model.getNodes()[i].id] =  this._model.getNodes()[i].color;
		}
    },
    setDefaultNodeStrokeWidth : function()
    {
		for (var i=0; i< this._model.getNodes().length; i++){
			   this._nodeStrokeWidth[this._model.getNodes()[i].id] =  this._model.getNodes()[i].nodeStrokeWidth;
		}
    },
    setDefaultIdTitle : function()
    {
		for (var i=0; i< this._model.getNodes().length; i++){
			   this._id_title[this._model.getNodes()[i].id] =  this._model.getNodes()[i].title;
		}
    },
    /*setEdgesOfNode : function()
    {
		for (var i=0; i< this._model.getNodes().length; i++){
			   this._edgesOfNode[this._model.getNodes()[i].id] =  this._model.getNodes()[i].edgesIndexes;
		}
    },*/
    setDefaultEdgeVisibility : function()
    {
		for (var i=0; i< this._model.getEdges().length; i++){
			  this._visibleEdges[this._model.getEdges()[i].id] = true;
		}
    },
    setDefaultDeletedNodes : function()
    {
		for (var i=0; i< this._model.getNodes().length; i++){
			   this._deletedNodes[this._model.getNodes()[i].id] =  false;
		}
    },
    setDefaultDeletedEdges : function()
    {
		for (var i=0; i< this._model.getEdges().length; i++){
			  this._deletedEdges[this._model.getEdges()[i].id] = false;
		}
    },
    setDefaultColorEdges : function()
    {
		for (var i=0; i< this._model.getEdges().length; i++){
			  this._colorOfEdges[this._model.getEdges()[i].id] = "black";
		}
    },
    //Cuando un nodo se mueve se deberia
    //			1.- Actualizar sus coordenadas
    //			2.- Borrar sus aristas
    //			3.- Redibujar sus aristas
    nodeMoving: function(nodeID){
			var node = this.getNode(nodeID);
			var newCoordenates = this._view.getCoordenates(nodeID);
			
			this._view.getNodeView(nodeID)._coordenates = newCoordenates;
			this._view.getNodeView(nodeID).cx = newCoordenates[0];
			this._view.getNodeView(nodeID).cy = newCoordenates[1];
			this._view.getNodeView(nodeID).clearLabel();
			this.updateCoordenates(nodeID, newCoordenates);
			
			if (this._showNodeLabels){
				this._view.getNodeView(nodeID).renderLabel();
			}
			
			if ((node=="undefined")||(node==null)) return;

			this._view.clearEdges();
			this.drawEdges();
			
    },
    
    canvasMoving: function(coordenates){
    	    	var dx = coordenates[0];
    	 	var dy =   coordenates[1];
    	 	 this.translateX(dx);
		     this.translateY(dy);
		      
    },

    updateCoordenates : function(nodeID, coordenates){
		var index = this._model.getNodeIndex(nodeID);
		this._coordenates[nodeID]= [ parseFloat(coordenates[0]), parseFloat(coordenates[1]) ];
    },
    
    
    zoomIn : function(){
    	for (var nodeID in interactomeViewerViz.controller._coordenates) {
    		this._coordenates[nodeID]= [ this._coordenates[nodeID][0]*2, this._coordenates[nodeID][1]*2 ];
    	}
		
		this.draw();
    },
    
    zoomOut : function(){
    	for (var nodeID in interactomeViewerViz.controller._coordenates) {
    		this._coordenates[nodeID]= [ this._coordenates[nodeID][0]/2, this._coordenates[nodeID][1]/2 ];
    	}
		
		this.draw();
    },
    
    
    


    setSVG : function (svg)
    {
		this._view.setSVG(svg);
    },
  

    setCoordenates : function (nodeId, posX, posY) {
    	this._coordenates[nodeId] = [posX, posY];
    },

    scale : function(value){
	   
		this.graphScale = value;
		for (var i=0; i< this._coordenates.length; i++)
		{
			  this._coordenates[i][0] = this._coordenates[i][0]*value;
			  this._coordenates[i][1] = this._coordenates[i][1]*value;
		}
		
		for (var i=0; i< this._model.getNodes().length; i++){
	
			  this._size[i] = this._size[i]*value;
		}
	
		this._view.radio= this._view.radio*value;
		this.draw();

    },
    translateX : function(value)
    {
		
		var local_nodes = this._model.getNodes();
		for (var i = 0; i< local_nodes.length; i++)
		{
		  	this._coordenates[local_nodes[i].id][0] =  parseFloat(this._coordenates[local_nodes[i].id][0]) + parseFloat(value);
		}
		
		this.draw();

    },
    translateY : function(value)
    {

		var local_nodes = this._model.getNodes();
		for (var i = 0; i< local_nodes.length; i++)
		{
		  	this._coordenates[local_nodes[i].id][1] =  parseFloat(this._coordenates[local_nodes[i].id][1]) + parseFloat(value);
		}
		
		this.draw();
		
		

    },

    drawNodes : function(){
	    this._view.drawNodes(this._model.getNodes(), this._coordenates, this);
    },
    
    
    renderEdge : function(edgeId)
    {
		
		var edge = this.getEdge(edgeId);
		if (edge != null){
		  var coordenatesSource = this.getNodeCoordenates(edge.source);
		  var coordenatesTarget = this.getNodeCoordenates(edge.target);
		  if(coordenatesSource != null && coordenatesTarget!=null){
			  var color = this._colorOfEdges[edgeId];
			  this._view.renderEdge(edge, this.getNode(edge.source), coordenatesSource, this.getNode(edge.target), coordenatesTarget, color, this );
		  }
		 }
    },

    drawEdges : function()
    {
		for (var i = 0; i< this._model.getEdges().length; i++){
			this.renderEdge(this._model.getEdges()[i].id);
		}
    },

    getEdge :function (edgeId){
		return this._model.getEdge(edgeId);
    },


    getNode :function (nodeId){
		
		return this._model.getNode(nodeId);
    },

    getNodeIndex : function (nodeId){
		
		return this._model.getNodeIndex(nodeId);
    },
    getNodeSize :function (nodeId)
    {
    	return this._size[nodeId];
    },
    getNodeShape :function (nodeId)
    {
		return this._shape[nodeId];
    },
     getNodeColor :function (nodeId)
    {
		return this._color[nodeId];
    },
    getOpacity :function (nodeId)
    {
		return this._opacity[nodeId];
    },
    getNodeCoordenates :function (nodeId)
    {
		return this._coordenates[nodeId];
    },
    getNodeStrokeWidth :function (nodeId)
    {
		return this._nodeStrokeWidth[nodeId];
    },
    getTitle :function (nodeId){
		return this._id_title[nodeId];
    },
    random : function ()
    {
		for (var i = 0; i< this._model.getNodes().length; i++)
		{  
			 this._coordenates[i] = [Math.floor(Math.random()*this.height), Math.floor(Math.random()*this.width)];
		}
		this.draw();
	
    },
    
    getModel : function()
    {
		return this._model;
	},
    
    addNode : function(id, title, posX, posY, color, visibility, opacity, size, shape, nodeStrokeWidth ){
		var coorX = new Array();
		var coorY = new Array();
		coorX.push(posX);
		coorY.push(posY);
		var coorXY = new Array();
		coorXY.push(posX);
		coorXY.push(posY);
		
		var node = new PlotNode( id, title, coorX, coorY, new Array(),{"color":color, "size":size, "opacity":opacity, "shape":shape, "nodeStrokeWidth":nodeStrokeWidth});			
		
		var nodes = this._model.getNodes();
		var nodesId = this._model.getNodesId();
		nodesId[id] = nodes.length;
		nodes.push(node);
		this._coordenates[id] = coorXY;
		this._color[id] = color;
		this._visible[id] = visibility;
		this._opacity[id] = opacity;
		this._size[id] = size;
		this._shape[id] = shape;
		this._nodeStrokeWidth[id] = nodeStrokeWidth;
		this._deletedNodes[id] = false;
		this._id_title[id] = title;
		
		this.draw();
		return node;
	},
	
	addEdge : function(edgeName, sourceID, targetID){
		var source_node = this.getNode(sourceID);
		var target_node = this.getNode(targetID);
		var edges = this.getModel().getEdges();
		var edgesId = this.getModel().getEdgesId();
		//var edgeName = "e-"+source_node.id+"-"+target_node.id;
		
		var edgePlot = new PlotEdge( edgeName,  source_node.id,  target_node.id, { "visibility":true});
		var i = this.getModel().getEdges().length;
		edgesId[edgeName]= i;
		edges.push(edgePlot);
		this.getModel().setEdges(edges);
		this.getModel().setEdgesId(edgesId);
		
		this._visibleEdges[edgeName] = true; 
		this._deletedEdges[edgeName] = false;
		this._colorOfEdges[edgeName] = "black";
	
		//add edgesIndexes to nodes		
    	 	source_node.edgesIndexes.push(edgeName);
		target_node.edgesIndexes.push(edgeName);
		
		this.draw();
	}
};
// JavaScript Document

function randomLayout() {
	
	this.sifFieldsString = new Array();
	
	this.nodes = new Array();
	this.edges = new Array();
	this.nodesId = new Object();
	this.edgesId = new Object();
	//this.layoutCoordenates = new Array();
	
	
	this.loadSIF = function(sifString){
		var lineBreak = sifString.split("\n");	
		for (var i = 0; i < lineBreak.length; i++){
			
			if (lineBreak[i].length>0){
					var trimmed = lineBreak[i].replace(/^\s*|\s*$/g,"");
					var field =trimmed.replace(/\s/g,'**%**').split("**%**");
					if (field.length>0){
						this.sifFieldsString.push( field);
					}
			}
		}
		this.init();
	};
	
	this.addEdge = function(nodeIndex, edge){
		this.nodes[nodeIndex].edgesIndexes.push(edge);
	};

	this._calculateCoordenates= function(index,id, args){
		var cx = new Array();
		var cy = new Array();
		cx.push(Math.random());
		cy.push(Math.random());
		return new PlotNode(id, id, cx, cy, new Array());
	};
	
	
	this.init = function(){
		for (var i = 0; i < this.sifFieldsString.length; i++){
			var id =this.sifFieldsString[i][0];
			
			var  node = this._calculateCoordenates(i,id);
			this.nodes.push(node);
			//this.layoutCoordenates.push([node.cx, node.cy]);
			this.nodesId[id] = i;
		}
		
		//adding edges to nodes field from 1 to last one
		for (var nodeIndex = 0; nodeIndex < this.sifFieldsString.length; nodeIndex++){
			for (var j = 2; j < this.sifFieldsString[nodeIndex].length; j++){
					var from =this.sifFieldsString[nodeIndex][0];
					var to =this.sifFieldsString[nodeIndex][j];
					var edgeid = "edge_" + from + "_" + to;
					this.addEdge(nodeIndex, edgeid);	
					this.edges.push(new PlotEdge(edgeid, from, to));
					this.edgesId[edgeid] = this.edges.length-1;
			}		
		}
	};
	
	this.toObject = function(){
		return new PlotGraph(this.nodes, this.nodesId, this.edges, this.edgesId , ["random"]);
	};
	
}



function twoLayout() {
	randomLayout.prototype.constructor.call(this);
	this.classesType = new Array();
	this.classes = new Object();
	this.classesIndex = new Object();


	this._calculateCoordenates = function(index, id, args){
	
		
			if (this.classesType.length == 2)
			{
				var cx = new Array();
				var cy = new Array();
				cx.push(Math.random());
				if (this.classes[id] == this.classesType[0]){
					cy.push(0.2);
				}
				else{
					cy.push(0.8);
				}
			}
			

			return new PlotNode(id, id, cx, cy, new Array());
	};
	
	
	
	this.loadSIF = function(sifString){
	
	     var lineBreak = sifString.split("\n");	
		for (var i = 0; i < lineBreak.length; i++){
			
			if (lineBreak[i].length>0){
					var trimmed = lineBreak[i].replace(/^\s*|\s*$/g,"");
					var field =trimmed.replace(/\s/g,'**%**').split("**%**");
					if (field.length>0){
						var className = field[field.length-1]; 
						this.addClass(className);
						this.classes[field[0]] = className;
						this.classesIndex[className].push(field[0]);
					
						var fieldFiltered = field.slice(0, field.length-2);
						this.sifFieldsString.push(fieldFiltered);
						
						
						
					}
			}
		}
		this.init();
		
	};


	this.addClass = function(className){
		for (var i = 0; i < this.classesType.length; i++){
			if (this.classesType[i] == className){
				return;	
			}
		}
		this.classesType.push(className);
		this.classesIndex[className] = new Array();
	};
};

twoLayout.prototype = new randomLayout();
twoLayout.prototype.constructor=randomLayout;
twoLayout.prototype.parent = randomLayout.prototype;



function RankedTwoLayout() {
	twoLayout.prototype.constructor.call(this);
	
	//El node level es la clase del nodo, es decir, n� edges de entrada + n� edges de salida
	this.nodeLevel = new Object();
	this.maxLevelPerClass = new Object();
	this.nodeLevelSorter = new Array();
	
	this.nodesProcessedPerClasse = new Object();

	this.addClass = function(className){
		for (var i = 0; i < this.classesType.length; i++){
			if (this.classesType[i] == className){
				return;	
			}
		}
		this.classesType.push(className);
		this.classesIndex[className] = new Array();
		this.maxLevelPerClass[className] = 0;
		this.nodesProcessedPerClasse[className] = 0;
	};
	
	
	this._calculateCoordenates = function(index, id, justCreateNode){
			if (this.classesType.length == 2){
				var cx = new Array();
				var cy = new Array();
				
				
				
				if (!justCreateNode)
				{
					var className = this.classes[id];
					var maxClass = this.maxLevelPerClass[className];
					var nodeLevel = this.nodeLevel[id];
					
					 
					
					var step = (1/this.classesIndex[className].length);
					
					//var value = nodeLevel/maxClass; 
					cx.push(this.nodesProcessedPerClasse[className]*step);
					
					this.nodesProcessedPerClasse[className]++;
					
				
					if (this.classes[id] == this.classesType[0]){
						//cy.push(0.2 + (this.nodesProcessedPerClasse[className]*0.3)/(maxClass*10));
						cy.push(0.1);
					}
					else{
						cy.push(0.9);
					}
				}
			}
			return new PlotNode(id, id, cx, cy, new Array());
	};
	
	this.loadSIF = function(sifString){
	
	     var lineBreak = sifString.split("\n");	
		for (var i = 0; i < lineBreak.length; i++){
			
			if (lineBreak[i].length>0){
					var trimmed = lineBreak[i].replace(/^\s*|\s*$/g,"");
					var field =trimmed.replace(/\s/g,'**%**').split("**%**");
					if (field.length>0){
						var className = field[field.length-1]; 
						this.addClass(className);
						this.classes[field[0]] = className;
						this.classesIndex[className].push(field[0]);
						var fieldFiltered = field.slice(0, field.length-2);
						this.sifFieldsString.push(fieldFiltered);	
					}
			}
		}
		this.init();
	};
	
	this.init = function(){
		
		for (var i = 0; i < this.sifFieldsString.length; i++){
			var id =this.sifFieldsString[i][0];
			var  node = this._calculateCoordenates(i,id, true);
			this.nodes.push(node);
			//this.layoutCoordenates.push([node.cx, node.cy]);
			this.nodesId[id] = i;
			this.nodeLevel[id] = 0;
		}
		
		//adding edges to nodes field from 1 to last one
		for (var nodeIndex = 0; nodeIndex < this.sifFieldsString.length; nodeIndex++){
			for (var j = 2; j < this.sifFieldsString[nodeIndex].length; j++){
					var from =this.sifFieldsString[nodeIndex][0];
					var to =this.sifFieldsString[nodeIndex][j];
					var edgeid = "edge_" + from + "_" + to;
					this.addEdge(nodeIndex, edgeid);	
					this.edges.push(new PlotEdge(edgeid, from, to));
					this.edgesId[edgeid] = this.edges.length-1;
					
					
					//solo rankean si proceden de diferentes clases
					if (this.classes[from]!=this.classes[to])
					{
						this.nodeLevel[from]++;//; = level ++; //this.nodeLevel[from] ++; 
						this.nodeLevel[to]++;// = this.nodeLevel[to] ++; 
						
						var classFrom = this.classes[from];
						var classTo = this.classes[to];
						
						if (this.maxLevelPerClass[classFrom]<this.nodeLevel[from]){
							this.maxLevelPerClass[classFrom] =this.nodeLevel[from];
						}
						
						if (this.maxLevelPerClass[classTo]<this.nodeLevel[to]){
							this.maxLevelPerClass[classTo] =this.nodeLevel[to];
						}	
					}
			}		
		}
		
		//A�adimos y ordenamos los nodos segun mayor node level
		for (var i = 0; i < this.sifFieldsString.length; i++){
			var nodeId =this.sifFieldsString[i][0];
			this.nodeLevelSorter.push([this.nodeLevel[nodeId], nodeId]);
		}
		this.nodeLevelSorter.sort();
		
		this.nodes = new Array();
		for (var i = 0; i < this.nodeLevelSorter.length; i++){
			var id =this.nodeLevelSorter[i][1];
			var  node = this._calculateCoordenates(i,id, false);
			this.nodes.push(node);
			//this.layoutCoordenates.push([node.cx, node.cy]);
			this.nodesId[id] = i;
		}
		
		
		
	};




};

RankedTwoLayout.prototype = new twoLayout();
RankedTwoLayout.prototype.constructor=twoLayout;
RankedTwoLayout.prototype.parent = twoLayout.prototype;






/*** HIVE PLOT ***/

function HivePlot(args) {
	
	RankedTwoLayout.prototype.constructor.call(this);
	
	
	this.edgeType = "line";
	this.classColor = null;
	console.log(args);
	if (args!= null)
	{
		if (args.edgeType != null){
			this.edgeType = args.edgeType;
		}
		
		if (args.classColor != null){
			this.classColor = args.classColor;
		}
	}
	
	
	this.addClass = function(className){
		for (var i = 0; i < this.classesType.length; i++){
			if (this.classesType[i] == className){
				return;	
			}
		}
		this.classesType.push(className);
		this.classesIndex[className] = new Array();
		this.maxLevelPerClass[className] = 0;
		this.nodesProcessedPerClasse[className] = 0;
	};
	
	this._calculateCoordenates = function(index, id, justCreateNode){
		
				var cx = new Array();
				var cy = new Array();
				
		
		
				var className = this.classes[id];
				if (!justCreateNode)
				{
					
					var maxClass = this.maxLevelPerClass[className];
					var nodeLevel = this.nodeLevel[id];	
					var step = (1/this.classesIndex[className].length);
					this.nodesProcessedPerClasse[className]++;
					
				
					//VERTICAL
					if (this.classes[id] == this.classesType[0]){
						cx.push(0.5);
						var y = (0.6/this.classesIndex[className].length)*(this.classesIndex[className].length - this.nodesProcessedPerClasse[className]);
						cy.push(y);
					}
					
					//RIGHT
					if (this.classes[id] == this.classesType[1]){
						cx.push(0.5 + (0.5/this.classesIndex[className].length)*this.nodesProcessedPerClasse[className]);
						var y = 0.6 + (0.4/this.classesIndex[className].length)*this.nodesProcessedPerClasse[className];
						cy.push(y);
					}
					
					//LEFT
					if (this.classes[id] == this.classesType[2]){
						cx.push(0.5 - (0.5/this.classesIndex[className].length)*this.nodesProcessedPerClasse[className]);
						var y = 0.6 + (0.4/this.classesIndex[className].length)*this.nodesProcessedPerClasse[className];
						cy.push(y);
					}
				}
			
			return new PlotNode(id, id, cx, cy, new Array(), {"color":this.classColor[className]});
	};
	
	this.getEdgeLocation = function(classSource, classTarget)
	{
	
			if (classSource == this.classesType[0] ){
					if (classTarget == this.classesType[1]){
						return "AreaB";
					}
					if (classTarget == this.classesType[2]){
						return "AreaA";
					}
			}
			
			if (classSource == this.classesType[1] ){
					if (classTarget == this.classesType[0]){
						return "AreaB";
					}
					if (classTarget == this.classesType[2]){
						return "AreaC";
					}
			}
			
			if (classSource == this.classesType[2] ){
					if (classTarget == this.classesType[0]){
						return "AreaA";
					}
					if (classTarget == this.classesType[1]){
						return "AreaC";
					}
			}
		
		
	};
	
	this.init = function(){
		
		for (var i = 0; i < this.sifFieldsString.length; i++){
			var id =this.sifFieldsString[i][0];
			var  node = this._calculateCoordenates(i,id, true);
			this.nodes.push(node);
			//this.layoutCoordenates.push([node.cx, node.cy]);
			this.nodesId[id] = i;
			this.nodeLevel[id] = 0;
		}
		
		//adding edges to nodes field from 1 to last one
		for (var nodeIndex = 0; nodeIndex < this.sifFieldsString.length; nodeIndex++){
			for (var j = 2; j < this.sifFieldsString[nodeIndex].length; j++){
					var from =this.sifFieldsString[nodeIndex][0];
					var to =this.sifFieldsString[nodeIndex][j];
					var edgeid = "edge_" + from + "_" + to;
					this.addEdge(nodeIndex, edgeid);	
					
					
					var classFrom = this.classes[from];
					var classTo = this.classes[to];
					
				
					this.edges.push(new PlotEdge(edgeid, from, to, {"type":this.edgeType, "area":this.getEdgeLocation(classFrom, classTo), "classesNumber":3, "opacity":0.5}));
					this.edgesId[edgeid] = this.edges.length-1;
					
					
					//solo rankean si proceden de diferentes clases
					if (this.classes[from]!=this.classes[to])
					{
						this.nodeLevel[from]++;//; = level ++; //this.nodeLevel[from] ++; 
						this.nodeLevel[to]++;// = this.nodeLevel[to] ++; 
						
						
						
						if (this.maxLevelPerClass[classFrom]<this.nodeLevel[from]){
							this.maxLevelPerClass[classFrom] =this.nodeLevel[from];
						}
						
						if (this.maxLevelPerClass[classTo]<this.nodeLevel[to]){
							this.maxLevelPerClass[classTo] =this.nodeLevel[to];
						}	
						
					}
					else{
						this.edges.pop();
					}
			}		
		}
		
		//A�adimos y ordenamos los nodos segun mayor node level
		for (var i = 0; i < this.sifFieldsString.length; i++){
			var nodeId =this.sifFieldsString[i][0];
			this.nodeLevelSorter.push([this.nodeLevel[nodeId], nodeId]);
		}
		this.nodeLevelSorter.reverse().sort();
		
		
		this.nodes = new Array();
		for (var i = 0; i < this.nodeLevelSorter.length; i++){
			var id =this.nodeLevelSorter[i][1];
			var  node = this._calculateCoordenates(i,id, false);
			this.nodes.push(node);
			//this.layoutCoordenates.push([node.cx, node.cy]);
			this.nodesId[id] = i;
		}
		
		
		
	};
};

HivePlot.prototype = new RankedTwoLayout();
HivePlot.prototype.constructor=RankedTwoLayout;
HivePlot.prototype.parent = RankedTwoLayout.prototype;











function PlotGraph(nodes, nodesId, edges, edgesId, layouts){

	this._nodes = nodes;
	this._edges = edges;
	this.nodesId = nodesId;
	this.edgesId = edgesId;
	this.layouts = layouts;
	
	this.getNodes = function(){
		return this._nodes;
	};
	this.getNodesId = function(){
		return this.nodesId;
	};
	this.setNodes = function(nodes){
		this._nodes = nodes;
	};
	this.getNode = function(nodeId){
		return this._nodes[this.nodesId[nodeId]];
	};
	this.getNodeIndex = function(nodeId){
		return this.nodesId[nodeId];
	};
	this.getEdges = function(){
		return this._edges;
	};
	this.getEdgesId = function(){
		return this.edgesId;
	};
	this.getEdge = function(edgeId){
		return this._edges[this.edgesId[edgeId]];
	};
	this.setEdges = function(edges){
		this._edges = edges;
	};
	this.setEdgesId = function(edgesId){
		this.edgesId = edgesId;
	};
	this.getEdgesFromNode = function(nodeId){
		var edges = new Array();
		for (var i = 0; i< this._nodes[this.nodesId[nodeId]].edgesIndexes.length; i++){
			var edgeIndex =this._nodes[this.nodesId[nodeId]].edgesIndexes[i];
			edges.push(this.getEdge(edgeIndex));
		}
		return edges;
	};
}

/*
	args:
			type: line, bezier
*/
function PlotEdge(id, from, to, args){
	
		this.id = id;
		this.source = from;
		this.target = to;
		
		this.type = "line";
		this.area = null;
		this.classesNumber = null;
		this.color = "black";
		this.opacity =  1;
	
		if (args!= null){
			if (args.type != null){
				this.type = args.type;
			}
			if (args.area != null){
				this.area = args.area;
			}
			if (args.area != null){
				this.classesNumber = args.classesNumber;
			}
			if (args.color != null){
				this.color = args.color;
			}
			if (args.opacity != null){
				this.opacity = args.opacity;
			}
			if (args.visibility != null){
				this.visibility = args.visibility;
			}
		}
		
		this.getSource = function(){
			return this.source;	
		};
		this.getTarget = function(){
			return this.target;	
		};
		this.getId = function(){
			return this.id;	
		};
}

function PlotNode(id, title, cxArray, cyArray, edgesIndexes, args){
			this.id = id;
			this.title = title;
			this.cx = cxArray;
			this.cy = cyArray;
			this.edgesIndexes = edgesIndexes;
	
			this.color = "black";
			this.size = 3;
			this.opacity = 1;
			this.shape = "ci";
			
			if (args!= null){
				if (args.color != null){
					this.color = args.color;
				}
				if (args.size != null){
					this.size = args.size;
				}
				if (args.opacity != null){
					this.opacity= args.opacity;
				}
				if (args.shape != null){
					this.shape= args.shape;
				}
				if (args.nodeStrokeWidth != null){
					this.nodeStrokeWidth= args.nodeStrokeWidth;
				}
			}
}





function randomSIF(nodesNumber, classesCount)
{
	var sif = "";
	var sifLinear = "";
	var sif3 = "";
	
	for (var i = 0; i< nodesNumber; i++)
	{
		sif = sif +"node_"+ i + " type_" + i+ " ";
		sifLinear = sifLinear +"node_"+ i + " type_" + i+ " ";
		sif3 = sif3 +"node_"+ i + " type_" + i+ " ";
		var edgesNumber = Math.ceil(Math.random()*(nodesNumber/100));
		
		if (i%10==0){
				for (var j = 0; j< edgesNumber*10; j++){
					var line =  "node_" + Math.ceil(Math.random()*(nodesNumber-1)) +" "; 
					sif = sif + line;
					sifLinear = sifLinear + line;
					sif3 = sif3 + line;
				}
			
		}
		else{
			for (var j = 0; j< edgesNumber; j++){
				var line =  "node_" + Math.ceil(Math.random()*(nodesNumber-1)) +" "; 
				sif = sif + line;
				sifLinear = sifLinear + line;
				sif3 = sif3 + line;
			}
		}
		
		
		if (i%2==0)
		{
			sifLinear = sifLinear + "class "+ "class" +"1";
			sif3 = sif3 + "class "+ "class" + "1";
		}
		else
		{
			sifLinear = sifLinear + "class "+ "class" + Math.ceil(Math.random()* classesCount);
			sif3 = sif3 + "class "+ "class" + Math.ceil(Math.random()* 3);
		}
		
		sifLinear = sifLinear +"\n";
		sif3 = sif3 +"\n";
		sif = sif +"\n";
	}
	return [sif, sifLinear, sif3];
	
}
function GraphViewNode(graphView, node, coordenates, size, color, shape, opacity, noseStrokeWidth) {
	
   this.node = node;
   this._graphView = graphView;
   	this.cx = Math.ceil(coordenates[0]);
   	this.cy = Math.ceil(coordenates[1]);
   	
   
   this.r = size;

   this.color = "black";
   if (color!=null){
	   	this.color = color;   
   }
   this.size= size;
   this.shape = "ci";
   
   if (shape!=null){
		this.shape=shape;   
   }

   this.opacity = opacity;
   this.svgNode = null;
   this.svgLabel = null;

   this.noseStrokeWidth = "1";
   if (noseStrokeWidth!=null){
	   	this.noseStrokeWidth = noseStrokeWidth;   
  }
   this.over = new Event(this);
   this.mouseout = new Event(this);
   this.mousedown = new Event(this);
   this.mouseup = new Event(this);
   this.click = new Event(this);
   this.dblclick = new Event(this);
   this.moving = new Event(this);


     //Attributes for dragging and grop
    this.TrueCoords = null;
    this.GrabPoint = null;

    this.targetElement = null;
   
};

GraphViewNode.prototype = {

    getRadio: function(){
		return this._graphView._controller.getNodeSize(this.node.getId());
    },
    
    render : function (svg){
			this.svg = svg;
			if (this.shape == 'sq'){
	            var lado = this.r*2;
	            var posX = this.cx - this.r;
	            var posY = this.cy - this.r;
	            var attributes = [['id', this.node.id], ['class', 'NODE'],['fill', this.color],['z-index','10'], ['opacity', this.opacity], ['x', posX], ['y', posY], ['width', lado], ['height', lado], ['stroke', 'black' ], ['stroke-width',  this.noseStrokeWidth]];
	            this.svgNode = SVG.drawRectangle(posX, posY, lado, lado, this.getCanvas(), attributes);
	        }
	        
	        if (this.shape == 'ci'){
	            var attributes = [['id', this.node.id], ['class', 'NODE'],['fill', this.color],['z-index','10'], ['opacity', this.opacity],  ['stroke', 'black' ], ['stroke-width',  this.noseStrokeWidth]];
	            this.svgNode = SVG.drawCircle(this.cx, this.cy, this.r, this.getCanvas(), attributes);
	            //SVG.drawCircle(this.cx, this.cy, this.r, this.getCanvas(), attributes);
	            
	        }
	        this.attachEvents(document.getElementById(this.node.id));
	       
    },
    
    renderLabel : function (){
    	var x = this.cx-this.r;
    	var y = 0;
    	
    	if (this.shape == 'ci'){
    		y = parseFloat(this.cy)+parseFloat(this.r)+10;
		}
    	if (this.shape == 'sq'){
    		y = parseFloat(this.cy)+parseFloat(this.r)+17;
        }

    	this.svgLabel = SVG.drawText(x, y, this.node.title,  this.getLabelCanvas(), [['opacity', this.opacity],["id", "label_" + this.node.id],["font-size", "10"],["class", "label"]]);
    	return this.svgLabel;
    	
    	//drawText(x, y, this.node.id,  this.getLabelCanvas(), [["id", "label_" + this.node.id],["font-size", "10"],["class", "label"],["pointers", "none"],['opacity', this.opacity]]);
        
			
    },
    
    clearLabel : function ( ){

    	if (this.svgLabel!=null){
    		this._graphView.clearLabel("label_" + this.node.id);
    		
    	}
    	
    },
    
    init : function(){
		this.TrueCoords = this.svg.createSVGPoint();
		this.GrabPoint = this.svg.createSVGPoint();
    },
    
    getCanvas : function(){
	for (j=0; j<this.svg.childNodes.length; j++){
		if (this.svg.childNodes[j].id == "canvas"){
			  return ( this.svg.childNodes[j]);
		}	
	}
    },
    
    getLabelCanvas : function(){
	for (j=0; j<this.svg.childNodes.length; j++){
		if (this.svg.childNodes[j].id == "labels"){
			  return ( this.svg.childNodes[j]);
		}	
	}
    },
    
    attachEvents : function(object){
	var _this = this;
	object.onclick = (function (evt) {
		_this._graphView.selectedNodeEvent(evt.target.id);
	});
	
	object.ondblclick = (function (evt){
		_this._graphView.selectedNode = evt.target.id;
		_this._graphView._controller.nodeDblClicked(evt.target.id);    
	});
	
	/*object.onmouseover = (function (evt) {
	      document.getElementById( evt.target.id).setAttribute("stroke", "white");
	      document.getElementById( evt.target.id).setAttribute("cursor", "pointer");
	});*/
    }
};



function GraphView(controller, svg, width, height) {
   // this._model = model;
    this._controller = controller;
    this.svg = svg;
 
   this.svgs = new Array();
   this.svgs.push(svg);
   this.canvas = new Array();
   this.getCanvas();


    this.width = width;
    this.height = height;
 

    this.graphViewNodes = new Object();
    var _this = this;

    this.svgNodeLabel = new Object();
    
    //Nodes moving
    this.nodeIDMoving = null; //me guardo el node que esta siendo arrastrado en este momento
    this.nodeMoving = new Event();
    
    this.selectedNode  = null;
    this.selectedEdge  = null;
   // this.nodeLabelShow = controller._showNodeLabels;
  //  this.nodeLabelShow = false;
   
    //Canvas moving
    this.canvasMoving = false;
    this.canvasClicked = true;
    
    this.translate = new Event();
    this.canvasMovingEvent = new Event();
    this.nodeClick = new Event();
    this.edgeClick = new Event();
    this.canvasClick = new Event();

    //this.svg.addEventListener("mouseclick", function(event) { _this.mouseclick(event, _this); }, false);
    this.svg.addEventListener("mousemove", function(event) { _this.mouseMove(event, _this); }, false);
    this.svg.addEventListener("mousedown", function(event) { _this.mouseDown(event, _this); }, false);
    this.svg.addEventListener("mouseup", function(event) { _this.mouseUp(event, _this); }, false);
    this.attachEvents(document.getElementById(this.svg.id));
    
};
 



GraphView.prototype = {

	//EVENTS node click from graphViewNode
	selectedNodeEvent : function(id){
		this.selectedNode = id;
		//this._controller.nodeClicked(id);
		this.nodeClick.notify(id);
		//this.cleanColorEdge();
		this.canvasClicked = false;
		this._controller.draw();
	},
	selectedEdgeEvent : function(id){
		this.selectedEdge = id;
		//this._controller.edgeClicked(id);
		this.edgeClick.notify(id);
		//this.cleanStrokeNode();
		this.canvasClicked = false;
		//this._controller.draw();
	},
	canvasClickedEvent : function(){
		if(this.canvasClicked == true){
			//this.cleanStrokeNode();
			//this.cleanColorEdge();
			this._controller.draw();
			this._controller.nodeIdClicked = null;
			this._controller.edgeIdClicked = null;
			this._controller.actionClick = 0;
			this.canvasClick.notify();
		}
		
	},
	attachEvents : function(object){
		
    	var _this = this;
    	object.onclick = (function (evt) {
    		_this.canvasClickedEvent(evt.target.id);
    	});
    },
	getSelectedNode: function()
	{
		return this.selectedNode;
		
	},
	getSelectedEdge: function()
	{
		return this.selectedEdge;
		
	},
    showNodeLabels : function (controller){
		
		this.renderNodeLabels(controller); 
	//	this.nodeLabelShow = true;
    },
    clearNodeLabels : function (){
//		this.nodeLabelShow = false;
		this.clearLabels();
	 
    },
    
    renderNodeLabels : function(controller){
    	 for (nodeid in this.graphViewNodes){
    		 var nodeView =this.graphViewNodes[nodeid];
			 for (var j=0; j< this.svgs.length; j++){
				 	var coordenates = controller._coordenates[nodeid];
				 	var nodeSvgLabel =  this.graphViewNodes[nodeid].renderLabel( );
			        this.svgNodeLabel[this.graphViewNodes[nodeid].node.id] = nodeSvgLabel;
			 }
    	 }
    },
    
    
    mouseDown : function (evt){
	      //En caso hago click sobre el canvas
	      this.canvasGrabPoint = this.svg.createSVGPoint();
	      this.TrueCoords = this.GetTrueCoords(evt, this.svg);
	      this.canvasGrabPoint.x = this.TrueCoords.x;
	      this.canvasGrabPoint.y = this.TrueCoords.y;
	      this.canvasMoving = true;
	      if (evt.target.getAttribute("class") == "NODE"){
		      this.TrueCoords = this.GetTrueCoords(evt, this.svg);
		      this.GrabPoint = this.svg.createSVGPoint();
		      this.targetElement = evt.target;
		      this.DragTarget  = this.targetElement;
		      this.DragTarget.parentNode.appendChild( this.DragTarget );
		      var transMatrix = this.DragTarget.getCTM();
		     
		      this.GrabPoint.x = this.TrueCoords.x - Number(transMatrix.e);
		      this.GrabPoint.y = this.TrueCoords.y - Number(transMatrix.f);
		      this.canvasMoving = false;
		     // this.cleanColorEdge();
	      }
	      else if(evt.target.getAttribute("class") != "NODE" && evt.target.getAttribute("class") != "EDGE")
	    	  this.canvasClicked = true;
    },

    mouseUp : function (evt){
		  this.canvasMoving = false;
		  if ( this.DragTarget ){
   /* mouseUp : function (evt)
    {
    	  this.nodeLabelShow = this._controller._showNodeLabels;
		  this.canvasMoving = false;
		  if ( this.DragTarget ){
			  
			//  if(this._controller._showNodeLabels){
		      if (this.nodeLabelShow){
					this.clearNodeLabels();
					this.showNodeLabels();
		      }*/
		      var targetElement = evt.target;
		      this.DragTarget.setAttributeNS(null, 'pointer-events', 'all');
		      this.DragTarget = null;
		  }
    },

    mouseMove : function (evt)
    {
		this.TrueCoords = this.GetTrueCoords(evt, this.svg);
		//this.nodeLabelShow = this._controller._showNodeLabels;
 
		if (this.canvasMoving)
		{
		      var point = this.GetTrueCoords(evt, this.svg);
		     
		      var dx =parseFloat(point.x) - parseFloat(this.canvasGrabPoint.x) ;
		      var dy =parseFloat(point.y) - parseFloat(this.canvasGrabPoint.y) ;
	
		      this.canvasGrabPoint.x  = point.x;
		      this.canvasGrabPoint.y  = point.y;
		  
	 	     
		      
			  this.canvasMovingEvent.notify([dx, dy]);
		      
		      
		      
		      //if(this._controller._showNodeLabels){
//		      if (this.nodeLabelShow){
//					this.clearNodeLabels();
//					this.showNodeLabels();
//		      }
		      return;
		}

		if (this.DragTarget)
	        {
			
			
			  var x =   this.DragTarget.getAttribute("cx");
			  var y =   this.DragTarget.getAttribute("cy");
	  		  this.DragTarget.setAttribute('cx', this.TrueCoords.x);
			  this.DragTarget.setAttribute('cy', this.TrueCoords.y);
			  this.DragTarget.setAttribute('x', this.TrueCoords.x);
			  this.DragTarget.setAttribute('y', this.TrueCoords.y);
			  this.nodeIDMoving = this.DragTarget.id;
			  this.nodeMoving.notify( this.DragTarget.id);
	         }
	},
	mouseclick : function(evt) {
    },
    getBackground : function()
    {
	      for (j=0; j<this.svg.childNodes.length; j++)
	      {
		     if (this.svg.childNodes[j].id == "background")
		     {
			        return this.svg.childNodes[j];
		     }	
	      }
    },
    /**
	Dentro de cada elemento svg existe un grupo <g> con id = canvas en el cual insertaremos los objetos
	Esta funcion recorre todo el vector svgs buscando esos canvas y los inserta en this.canvas
    **/
    getCanvas : function()
    {
		this.canvas = new Array();
		for (var i=0; i < this.svgs.length; i++)
		{
		      for (j=0; j<this.svgs[i].childNodes.length; j++)
		      {
			     if (this.svgs[i].childNodes[j].id == "canvas")
			     {
				        this.canvas.push( this.svgs[i].childNodes[j]);
			     }	
		      }
		}
    },
    
    getCanvasEdge : function()
    {
	    for (j=0; j<this.svg.childNodes.length; j++)
	    {
		    
		     if (this.svg.childNodes[j].id == "edges")
		     {
			      return this.svg.childNodes[j];
		     }	
	      }
    },
    
    getCanvasLabels : function(){
	    for (j=0; j<this.svg.childNodes.length; j++){
		     if (this.svg.childNodes[j].id == "labels")
		     {
			      return this.svg.childNodes[j];
		     }	
	      }
    },
    
    
    clearLabels: function(){
    	  var canvas = this.getCanvasLabels();
	      while (canvas.childNodes.length>0) {  
	    	  canvas.removeChild(canvas.childNodes[0]);
	      }
    },
    
    clearEdges: function(){
    	  var canvas = this.getCanvasEdge();
	      while (canvas.childNodes.length>0)
	      {  
	    	  canvas.removeChild(canvas.childNodes[0]);
	      }
    },

    drawNodes : function(nodes, coordenates, controller){
	  this.graphViewNodes = new Object();
	  for (var i=0; i< nodes.length; i++){
		  
		var id = nodes[i].id;
		var size = controller.getNodeSize(id);
		var color = controller.getNodeColor(id);
		var shape = controller.getNodeShape(id);
		var opacity = controller.getOpacity(id);
		var title = controller.getTitle(id);
		nodes[i].title = title;
		//var opacity = this._controller.getOpacity(id);
		var nodeStrokeWidth = controller.getNodeStrokeWidth(id);
		//console.log(id+" deletedNodes: "+controller._deletedNodes[id]);
		if(controller._deletedNodes[id] == false){
			//console.log(id+" _visible: "+controller._visible[id]);
			if (controller._visible[id] == true){
				var nodeView = new GraphViewNode(this, nodes[i], coordenates[id], size, color, shape, opacity, nodeStrokeWidth);
			}
			else{
				var nodeView = new GraphViewNode(this, nodes[i], coordenates[id], size, color, shape, 0, nodeStrokeWidth);
			}
			this.graphViewNodes[id] = (nodeView);	
		}
		

	  }
	  this.renderAllNodes();
	 
    },
    
    
    clearAll : function (id)
    {
		for (var i=0; i < this.canvas.length; i++){
		    while (this.canvas[i].childNodes.length>0){
		    	this.canvas[i].removeChild(this.canvas[i].childNodes[0]);
		    }
		}
		this.clearEdges();
		this.clearLabels();

    },
    
    clearCanvasElement : function (id){
		for (var i=0; i < this.canvas.length; i++){
		      for (j=0; j<this.canvas[i].childNodes.length; j++)
		      {	  
			     if (this.canvas[i].childNodes[j].id == id)
			     {
				        this.canvas[i].removeChild( this.canvas[i].childNodes[j]);
			     }	
		      }
		}
    },

    getElementByIdOnCanvas : function(id)
    {
	      for (j=0; j<this.canvas[0].childNodes.length; j++){	  
		     if (this.canvas[0].childNodes[j].id == id){
			       return this.canvas[0].childNodes[j];		
		     }	
	      }
	      return null;
    },

    getNodeView: function (id){
    	return this.graphViewNodes[id];
    },
    
    
    getCoordenates : function(nodeID) {
			var element = this.getElementByIdOnCanvas(nodeID);
			var cx, cy;
			cx = (element.getAttribute("cx"));
			cy = (element.getAttribute("cy"));
			return [cx, cy];
	
    },  

    clearEdge : function(edgeId)
    {
		var canvas = this.getCanvasEdge();
		for (var i=0; i< canvas.childNodes.length; i++){
		      if (canvas.childNodes[i].id == edgeId){
			    canvas.removeChild(canvas.childNodes[i]);
		      }
		}
    },
    
    clearLabel : function(labelId){
			var canvas = this.getCanvasLabels();
			for (var i=0; i< canvas.childNodes.length; i++){
			      if (canvas.childNodes[i].id == labelId){
				    canvas.removeChild(canvas.childNodes[i]);
			      }
			}
    },

    setSVG : function (svg){
		this.svgs.push(svg);
		this.getCanvas();
    },


    renderAllNodeOnNoMainCanvas : function (node, coordenates) {
	  var _this = this;
	  for (var i=0; i< this.graphViewNodes.length; i++)
	  {
		 var nodeView =this.graphViewNodes[i];
		 for (var j=1; j< this.svgs.length; j++){
			this.graphViewNodes[i].render(this.svgs[j]);
		 }
	  }
    },
    
    renderAllNodes : function (node, coordenates){
    for (id in this.graphViewNodes){
    		this.graphViewNodes[id].render(this.svg);
    	}
    },

    renderEdge : function (edge, node1, coordenates1, node2, coordenates2, color, controller) {
      var nodeView1 = new GraphViewNode(this, node1, coordenates1, this.radio);
	  var nodeView2 = new GraphViewNode(this, node2, coordenates2, this.radio);
	  var edgeView = new EdgeViewNode(this,edge, nodeView1, nodeView2,color);
	  if(controller._deletedEdges[edgeView.edge.id] == false)
		  if(controller._visibleEdges[edgeView.edge.id] == true)
			  for (var i=0; i< this.svgs.length; i++){
				edgeView.render(this.svgs[i]);
			  }
    },


   GetTrueCoords : function (evt, SVGRoot){
		var TrueCoords = this.svg.createSVGPoint();
		TrueCoords.x = this.getMouseCoords(evt, SVGRoot).x;//evt.clientX ;
		TrueCoords.y = this.getMouseCoords(evt, SVGRoot).y;
		return TrueCoords;
    },

     //hopefully return the mouse coordinates inside parent element
     getMouseCoords : function(e, parent) {
		var x, y;
		muna = parent;
		if (document.getBoxObjectFor) {
			// sorry for the deprecated use here, but see below
			var boxy = document.getBoxObjectFor(parent);
			x = e.pageX - boxy.x;
			y = e.pageY - boxy.y;
		} 
		else if (parent.getBoundingClientRect) {
			// NOTE: buggy for FF 3.5: https://bugzilla.mozilla.org/show_bug.cgi?id=479058
			/* I have also noticed that the returned coordinates may change unpredictably
			after the DOM is modified by adding some children to the SVG element */
			var lefttop = parent.getBoundingClientRect();
			//console.log(parent.id + " " + lefttop.left + " " + lefttop.top);
			x = e.clientX - Math.floor(lefttop.left);
			y = e.clientY - Math.floor(lefttop.top);
		} else {
			x = e.pageX - (parent.offsetLeft || 0);
			y = e.pageY - (parent.offsetTop || 0);
		}
	
		return { x: x, y: y };
	}




};

function EdgeViewNode(graphView, edge, nodeViewSource, nodeViewTarget, strokeColor) {
   this.edge = edge;
   this.nodeViewSource = nodeViewSource;
   this.nodeViewTarget = nodeViewTarget;
   this._graphView = graphView;
   this.strokeColor = strokeColor;
   this.click = new Event(this);
};

EdgeViewNode.prototype = {
    render : function (svg){
	      this.svg= svg;
	      var x1 = Math.ceil( this.nodeViewSource.cx);
	      var y1 =  Math.ceil(this.nodeViewSource.cy);
	      var x2 =  Math.ceil(this.nodeViewTarget.cx);
	      var y2 =  Math.ceil(this.nodeViewTarget.cy);
	    
	      
	    if (this.nodeViewSource.node.id == this.nodeViewTarget.node.id){   
	        
	        var nodeSize = this.nodeViewSource.node.size;
	        var  x11 = x1 -(nodeSize/2);
	        var y11 = y1 -(nodeSize/2);
	        
	        var  x12 = x1 + (nodeSize/2);
	        var y12 = y1 -(nodeSize/2);
	        
	        var curvePointX = (x12 - x11)/2 + x11;
	        var curvePointY = y1 - (nodeSize*2);
	        
	        var d = "M" + x11 + "," + y11 + " T" + curvePointX + "," +curvePointY + " " +  x12+ "," + y12 ;
	    	var attributes = [['x1', x1],['x2', x2], ['y1', y1], ['y2', y2],["fill", "none"],["stroke-width", "2"],['id', this.edge.getId()], ['stroke', this.strokeColor], ['opacity',0.5], ['class', 'EDGE']];
	        //var attributes = [['id', this.edge.getId()], ['stroke', 'black'],["fill", "none"],['opacity', this.edge.opacity], ['class', 'EDGE']];
			SVG.drawPath(d, this.getCanvas(), attributes);
			this.attachEvents(document.getElementById(this.edge.id));
			
	    }
	    else{
				if (this.edge.type == "line"){
					//var attributes = [['x1', x1],['x2', x2], ['y1', y1], ['y2', y2],["stroke-width", "2"],['id', this.edge.getId()],['fill',this.strokeColor ], ['stroke', this.strokeColor], ['opacity',0.5], ['class', 'EDGE']];
					var attributes = [['x1', x1],['x2', x2], ['y1', y1], ['y2', y2],["stroke-width", "2"],['id', this.edge.getId()],['fill',this.strokeColor ], ['stroke', this.strokeColor], ['opacity',0.5], ['class', 'EDGE']];
					drawLine(attributes , this.getCanvas()); 
					this.attachEvents(document.getElementById(this.edge.id));
				}
				
				if (this.edge.type == "bezier"){
					
					if (this.edge.classesNumber== 3){
						var attributes = [['id', this.edge.getId()], ['stroke', 'black'],["fill", "none"],['opacity', this.edge.opacity], ['class', 'EDGE']];
						var minX = 0;Math.min(x1, x2);
						var minY = 0;Math.min(y1, y2);
						
						if (this.edge.area=="AreaA"){
								minX = Math.min(x1, x2) ;
								minY = Math.min(y1, y2);
						}
						
						if (this.edge.area=="AreaB"){
								 minX = Math.max(x1, x2);
								minY = Math.min(y1, y2);
						}
						
						if (this.edge.area=="AreaC"){
								 minX =(x2-x1)/2+ x1;
								minY =  Math.max(y1, y2);
						}
						
						var d = "M" + x1 + "," + y1 + " Q" + minX + "," +minY + " " +  x2+ "," + y2 ;
						SVG.drawPath(d, this.getCanvas(), attributes);
						this.attachEvents(document.getElementById(this.edge.id));
					}
				}
	    }
		
		
    },


    getCanvas : function(){
		for (j=0; j<this.svg.childNodes.length; j++){
			if (this.svg.childNodes[j].id == "edges"){
				  return ( this.svg.childNodes[j]);
			}	
		}
    },
    attachEvents : function(object){
    	var _this = this;
    	object.onclick = (function (evt) {
    		_this._graphView.selectedEdgeEvent(evt.target.id);
    	});
    }
};



function ellipse(args){
	var required = ["center", "xRadius", "yRadius", "steps"];

	args.begin=0;
	

	var arcLength=(Math.PI * 2) / (args.steps);
	var angle = new Array();
	
	
	for(var i=0; i<args.steps; i++)	angle[i] = (arcLength * i) + args.begin;
	
	
	var pointArray = new Array();
	for(var j=0; j<args.steps; j++){
		var point=new Array();
		var x = args.xRadius * Math.cos(angle[j]);
		var y = args.yRadius * Math.sin(angle[j]);

		  
		var out = {x:Math.round(parseInt(x) + parseInt(args.center.x)), y:Math.round( parseInt(y) +  parseInt(args.center.y)), idx:j};
		pointArray[j] = out;
	}
	return pointArray;
};






//Math

function calculateDistanceBetweenTwoPoints(x1, y1, x2, y2)
{
	var pow1 = Math.pow((x2 - x1), 2);
	var pow2 =  Math.pow((y2 - y1), 2);
	return  Math.sqrt(pow1 + pow2);
}

function calculateAngleBetweenTwoPoints(x1, y1, x2, y2){
     	return Math.atan2((y2-y1),(x2-x1))*180/Math.PI;
}



function drawLine(attributes , svg) {
	var line = document.createElementNS("http://www.w3.org/2000/svg","line");
	setProperties(line, attributes);
	svg.appendChild(line);	
	return line;
}
/*
function drawText  (x, y, text, canvasSVG, attributes) {
			
	var newText = document.createElementNS("http://www.w3.org/2000/svg", "text");
	newText.setAttributeNS(null, "x",x);		
	newText.setAttributeNS(null, "y",y);	

	var textNode = document.createTextNode(text);
	newText.appendChild(textNode);
	
	canvasSVG.appendChild(newText);

	for (var i=0; i< attributes.length; i++)
	{
		newText.setAttributeNS(null, attributes[i][0], attributes[i][1]);
	}
}
*/

function drawRect(attributes , svg){
	  var rect = document.createElementNS("http://www.w3.org/2000/svg","rect");
	  setProperties(rect, attributes);
	  svg.appendChild(rect);	
	  return rect;
}

function drawCircle(attributes , svg){
	  var circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
	  setProperties(circle, attributes);
	  svg.appendChild(circle);	
	  return circle;
}

function setProperties (element, attributes) {
	for (var i=0; i< attributes.length; i++){
		element.setAttribute(attributes[i][0], attributes[i][1]);
	}
}


/*
 * Clase gestiona la insercciÃ³n, eliminaciÃ³n de los elementos en el DOM
 * 
 * Vital hacerla SIEMPRE compatible hacia atrÃ¡s
 * 
 * Last update: 28-10-2010
 * 
 */


var DOM = {};

DOM.createNewElement = function(type, nodeParent, attributes)
{
	
	var node = document.createElement(type);
	for (var i=0; i<attributes.length; i++)
	{
		node.setAttribute(attributes[i][0], attributes[i][1]);
	}
	nodeParent.appendChild(node);
	return node;
		
};

DOM.createTextNode = function(text, nodeParent)
{
	var aText = document.createTextNode(text);
	nodeParent.appendChild(aText);
	return aText;

		
};

DOM.removeChilds = function(targetID)
{
	
	var parent = document.getElementById(targetID);
	while (parent.childNodes.length>0)
	{
	      parent.removeChild(parent.childNodes[0]);

	}
};

DOM.select = function(targetID)
{
  return document.getElementById(targetID);
//  return $("#"+targetID);
};// JavaScript Document
function Track(trackerID, targetNode,  args) {
	this.args = args;
	
	/** Groups and layers */
	this.trackNodeGroup = null;
	this.mainNodeGroup = null;
	this.labelNodeGroup = null;
	
	this.internalId = Math.round(Math.random()*10000000); // internal id for this class
	
	/** target */
    if(targetNode != null){
            this.targetID = targetNode.id;
    }

	
    
	/** Coordenates with default Setting */
	this.top = 0;
	this.left = 100;
	this.right = 900;
	this.width = 1100;
	this.height = 50;
	this.originalTop = this.top;
	this.originalHeight = this.height;
	
	/** Max height para los tracks que aunmentan el height dinamicamente cargando las features **/
	this.maxHeight = this.height;
	
	/** real start and end */
	if (args != null){
		this.start = args.start;
		this.end = args.end;
	}
	else{
		this.start = 0;
	}

	/** pixelPerposition **/
	this.pixelRatio = 5; /** it means 1 position it is represented using 5 pixels **/
	
	/** Optional parameters */
	this.backgroundColor = "#FFFFFF";
	this.titleColor = "#000000";
	this.overflow = false;
	
	/** Optional parameters: title */
	this.title  = null;
	this.titleName = null;
	this.titleFontSize = 10;
	this.titleWidth = 50;
	this.titleHeight = 12;
	this.floating = false;
	this.repeatLabel = null; /** es un float que indica cada cuantos pixeles se va a repetir la label sobre el track **/
	
	this.isAvalaible = true; /** Si el track no puede mostrarse a cierta resolucion isAvalaible pasa a ser falso y dibujariamos solamnente el titulo**/
	this.isNotAvalaibleMessage = "This level of zoom isn't appropiate for this track";
	
	
	this.labelFontSize = null;
	
	/** Processing optional parameters */
	if (args!=null){
		if (args.left!=null){
			this.left = args.left;		
		}
		
		if (args.top!=null){
			this.top = args.top;	
			this.originalTop = this.top;
		}
		if (args.left!=null){
			this.left = args.left;		
		}
		
		if (args.right!=null){
			this.right = args.right;		
		}
		if (args.width!=null){
			this.width = args.width;		
		}
		if (args.floating!=null){
			this.floating = args.floating;		
		}
		if (args.height!=null){
			this.height = args.height;	
			this.originalHeight = args.height;
			this.maxHeight = args.height;
		}
		if (args.backgroundColor!=null){
			this.backgroundColor = args.backgroundColor;		
		}
		
		if (args.titleWidth!=null){
			this.titleWidth = args.titleWidth;		
		}
		if (args.titleFontSize!=null){
			this.titleFontSize = args.titleFontSize;		
		}
		if (args.titleHeight!=null){
			this.titleHeight = args.titleHeight;		
		}
		if (args.titleColor != null){
			this.titleColor = args.titleColor;	
		}
		if (args.title != null){
			this.title = true;
			this.titleName = args.title;
		}
		if (args.overflow != null){
			this.overflow = args.overflow;
		}
		if (args.pixelRatio != null){
			this.pixelRatio = args.pixelRatio;
		}
		if (args.labelFontSize != null){
			this.labelFontSize = args.labelFontSize;
		}
		
		if (args.repeatLabel != null){
			this.repeatLabel = args.repeatLabel;
		}
		
		if (args.isAvalaible!=null){
			this.isAvalaible = args.isAvalaible;		
		}
		if (args.isNotAvalaibleMessage!=null){
			this.isNotAvalaibleMessage = args.isNotAvalaibleMessage;		
		}
	}
	
	/** id manage */
	this.id = trackerID;	
	this.idTrack = this.id + "_Features";
	this.idNames = this.id + "_Names";
	this.idMain = this.id + "_Main";
	this.idBackground = this.id + "_background";
	this.idTitleGroup = this.id + "_title_group";
	/** Events */
	this.click = new Event(this);
	
};

//Track.prototype._getViewBoxCoordenates = function() {
//	return 0 +" " +  "10 " + this.width + " " + this.height;
//};
//
//Track.prototype._goToCoordinate = function(start) {
//	var viewBox =   (start * this.pixelRatio) +" " +  "10 " + this.width + " " + this.height;
//	this._svg.setAttribute("viewBox", viewBox);108,447,501

//};

Track.prototype._getViewBoxCoordenates  = function(id, width, height, backgroundColor ) {
	return "0 10 " + this.width  + " " + this.height;
};

Track.prototype.createSVGDom = function(id, width, height, backgroundColor ) {
	/** Si es null es porque estamos usando el track en modo standalone sin trackCanvas **/
	if (this._svg == null){
		this._svg = SVG.createSVGCanvas(DOM.select(this.targetID), [["viewBox", this._getViewBoxCoordenates()],["preserveAspectRatio", "none"],["id", id], ["height", this.height], ["width", this.width]]);
	}
	
	/** Creating groupds **/
	this.mainNodeGroup = SVG.drawGroup(this._svg, [["id", this.idMain]]);
	this.backgroundNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idBackground]]);
	this.trackNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idTrack]]);
	this.labelNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idNames]]);
	this.titleNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idTitleGroup]]);
	
	/** background rectangle for giving colors **/
//	var rect = SVG.drawRectangle(0, this.top, this.width , this.height, this.backgroundNodeGroup, [["fill", backgroundColor],[id, id + "_background"]]);
	this.drawBackground();
	return this._svg;
};

Track.prototype.drawBackground = function() {
//	var rect = SVG.drawRectangle(0, this.top, this.width , this.height, this.backgroundNodeGroup, [["fill", this.backgroundColor],[id, id + "_background"]]);
//	this.backgroundNode =  SVG.drawRectangle(0, this.top, this.viewBoxModule , this.height, this.backgroundNodeGroup, [["stroke", "#000000"],["opacity", 0.5],["fill", this.backgroundColor],[id, id + "_background"]]);
};

Track.prototype.getBackgroundNode = function() {
	return this.backgroundNode;
};


Track.prototype.init = function(){
	this._svg = this.createSVGDom(this.id, this.width, this.height, this.backgroundColor);
	
	/** SVG Events listener */
	var _this = this;

};

Track.prototype.clear = function(){
	if(this.mainNodeGroup != null){
		 while (this.mainNodeGroup.childNodes.length>0){
		 	this.mainNodeGroup.removeChild(this.mainNodeGroup.childNodes[0]);
	    }
	}
};

/** SVG COORDENATES **/
Track.prototype._getSVGCoordenates = function(evt){
	var p = this._svg.createSVGPoint();
    p.x = evt.clientX;
    p.y = evt.clientY;
    
    var m = this._svg.getScreenCTM(document.documentElement);
    p = p.matrixTransform(m.inverse());
    return p;
};

FeatureTrack.prototype.createSVGDom 			=    	Track.prototype.createSVGDom;
FeatureTrack.prototype.init 					=    	Track.prototype.init;
FeatureTrack.prototype.mouseMove 				=       Track.prototype.mouseMove;
FeatureTrack.prototype.mouseUp 					=     	Track.prototype.mouseUp;
FeatureTrack.prototype.mouseClick 				=       Track.prototype.mouseClick;
FeatureTrack.prototype.mouseDown 				=       Track.prototype.mouseDown;
FeatureTrack.prototype._getViewBoxCoordenates 	=       Track.prototype._getViewBoxCoordenates;
FeatureTrack.prototype._goToCoordinate 			=      	Track.prototype._goToCoordinate;
FeatureTrack.prototype._startDragging 			=       Track.prototype._startDragging;
FeatureTrack.prototype._dragging 				=       Track.prototype._dragging;
FeatureTrack.prototype._getSVGCoordenates 		=       Track.prototype._getSVGCoordenates;
FeatureTrack.prototype._stopDragging 			=       Track.prototype._stopDragging;
FeatureTrack.prototype.clear 					=       Track.prototype.clear;
FeatureTrack.prototype.drawBackground  			=       Track.prototype.drawBackground;


function FeatureTrack (trackerID, targetNode, species, args) {
	Track.prototype.constructor.call(this, trackerID, targetNode, args);
	
	this.species = species;
	
	/** features */
	this.features = null;
	
	/** Optional parameters */
//	this.featureHeight = 4;
	
	/** Modulo que indica el tamaño maximo del ViewBox porque a tamaños de cientos de millones se distorsiona, parece un bug de SVG **/
	this.viewBoxModule = null;
	
	/** blocks */
	this.avoidOverlapping = false;
	this.pixelSpaceBetweenBlocks = 0;
	
	
	/** Features duplicates **/
	this.allowDuplicates = true;
	this.featuresID = new Object(); /** guardamos en esta estructura un id por feature para detectar si tengo alguna duplicada **/
	this.label = false;
	
	/** If true el trackcanvas renderizara su label en el middle point **/
	this.showLabelsOnMiddleMarker = false;
	
	
	this.forceColor = null;
	
	
	this.labelHeight = 12;
	this.separatorBetweenQueue = 4;
	
	/** Processing optional parameters */
	if (args!=null){
		if (args.showLabelsOnMiddleMarker != null){
			this.showLabelsOnMiddleMarker = args.showLabelsOnMiddleMarker;
		}
		
		if (args.queueHeight != null){
			this.queueHeight = args.queueHeight;
		}
		
		if (args.labelHeight != null){
			this.labelHeight = args.labelHeight;
		}
		
		if (args.featureHeight!=null){
			this.featureHeight = args.featureHeight;	
		}
		
		if (args.forceColor != null) {
			this.forceColor = args.forceColor;
		}
		
		if (args.avoidOverlapping !=null){
			this.avoidOverlapping = args.avoidOverlapping;
		}
		if (args.pixelSpaceBetweenBlocks !=null){
			this.pixelSpaceBetweenBlocks = args.pixelSpaceBetweenBlocks;
		}
		
		if (args.viewBoxModule!=null){
			this.viewBoxModule = args.viewBoxModule;
		}
		if (args.allowDuplicates != null){
			this.allowDuplicates = args.allowDuplicates;
		}
		
		if (args.label != null){
			this.label = args.label;
		}
		
//		if (args.notListenToMoving != null){
//			this.notListenToMoving = args.notListenToMoving;
//		}
	}
	
	/** Queues */
	this.queues = new Array();
	this.queues[0] = new Array();
	
	
	this.queueHeight = this.labelHeight + this.featureHeight;
	
//	this.featureQueue = new Object(); // Hashmap  [index_feature -> indexQueuetoDraw] 
	
	this.positions = new Object();
	
	/** EVENTS **/
	this.onClick = new Event(this);
	this.onMouseOver = new Event(this);
	this.onMouseOut = new Event(this);
	this.onMaximumHeightChanged = new Event(this);
	
};



/** True si dos bloques se solapan */
FeatureTrack.prototype._overlapBlocks = function(block1, block2){
	var spaceBlock = this.pixelSpaceBetweenBlocks / this.pixelRatio;
	
	if ((block1.start  < block2.end + spaceBlock) && (block1.end  + spaceBlock > block2.start)){
		return true;
	}
	return false;
};

FeatureTrack.prototype._setTextAttributes = function(feature) {
	var attributes = [["fill", "black"],["id", this.id+"_" + feature.id],["cursor", "pointer"], ["font-size", this.labelSize]];
	return attributes;
};

///** Busca disponibilidad de espacio y devuelve el indice del layer donde debe insertarse */
FeatureTrack.prototype._searchSpace = function(block1){
	for (var i = 0; i < this.queues.length; i++ ){
		var overlapping = new Array();
		for (var j = 0; j < this.queues[i].length; j++ ){
			var block2 = this.queues[i][j];
			overlapping.push((this._overlapBlocks(block1, block2)));	
			overlapping.push((this._overlapBlocks(block2, block1)));	
		}
	
		/** no se solapa con ningun elemento entonces devuelvo la capa */ 
		if (overlapping.valueOf(overlapping).indexOf(true)==-1){
			return i;
		}
	}
	/** no me cabe en ninguna capa entonces creo una nueva */
	this.queues.push(new Array());
//	this.height = this.height + (this.queues.length* this.featureHeight);
	/** no hemos encontrado ningun espacio en ninguna cola anterior */
	return this.queues.length - 1;
};


FeatureTrack.prototype.drawLabelByPosition = function(chromosome, start, end){
};


FeatureTrack.prototype.appendFeatures = function(data){
	var features = data.toJSON();
	this.drawFeatures(features);
};

FeatureTrack.prototype.isFeatureDuplicated = function(feature){
	return this.featuresID[feature.start + "_" + feature.end];
};

FeatureTrack.prototype.moveY = function(realMove){
	this.mainNodeGroup.setAttribute("transform", "translate(0, " + realMove + ")");
};

FeatureTrack.prototype.drawFeatures = function(features){
	this.queues = new Array();
	this.queues.push(new Array());

	for (var i = 0; i < features.length;  i++){
		if (!this.allowDuplicates){
			if (this.isFeatureDuplicated(features[i])){
				continue;
			}
			else{
				this.featuresID[features[i].start + "_" + features[i].end] = true;
			}
		}
		
		var queueToDraw = 0;
		if (this.avoidOverlapping){
			queueToDraw = this._searchSpace(features[i]);
		}
		else{
			queueToDraw = 0;
		}
		
		/** Insertamos en la cola para marcar el espacio reservado */
		this.queues[queueToDraw].push(features[i]);
		this.drawFeaturesInQueue(features[i], queueToDraw);
	}
	
	this._updateTop();
};

FeatureTrack.prototype.drawLabelAtPosition = function(genomicPositionX, features){
};

FeatureTrack.prototype.drawFeaturesInQueue = function(feature, queueToDraw){
	var attributes = this._setAttributes(feature);
	var featureWidth = ((feature.end - feature.start) + 1) * this.pixelRatio;
	if ( (feature.end - feature.start) < 0){
		featureWidth= ((feature.start - feature.end)) * this.pixelRatio;
	}
	
	var startPoint = (feature.start - 1) * this.pixelRatio;
	var top = this.top + (queueToDraw * this.featureHeight);
	
	if (this.label){
	   top = this.top + (queueToDraw * (this.featureHeight + this.labelHeight + this.separatorBetweenQueue));
	}
	
	
	var start = (startPoint % this.viewBoxModule);
	this._drawFeature(start, top,  Math.ceil(featureWidth), attributes, feature);
};



FeatureTrack.prototype._updateTop = function(){
	var height = this.height;
	
	if (this.avoidOverlapping) {
		var originalHeight = this.height;
		if (this.label){
			height = ((this.featureHeight + this.labelHeight + this.separatorBetweenQueue) * this.queues.length);
		}
		else{
			height = ((this.featureHeight)*this.queues.length);
		}
	}
	
	if (this.maxHeight < height){
		this.maxHeight = height;
		this.onMaximumHeightChanged.notify();
	}
	if(this.backgroundNode != null){
		this.backgroundNode.setAttribute("height", this.maxHeight);
	}
	this.height = this.maxHeight;
};



FeatureTrack.prototype._getFeatureWidth = function(feature){
	if ((feature.end - feature.start) == 0) return ((feature.end +1)- feature.start)*this.pixelRatio;
	return (feature.end - feature.start) * this.pixelRatio;
};

FeatureTrack.prototype._convertGenomePositionToPixelPosition = function(position){
	return ((position -1) * this.pixelRatio) % this.viewBoxModule;
};


FeatureTrack.prototype._setAttributes = function(feature){
	var attributes = [["id", this.id+"_" + feature.name], ["style", "cursor:pointer"]];
	attributes.push(["fill-opacity", feature.getDefault().getOpacity()]);
	
	attributes.push(["stroke", feature.getDefault().getStroke()]);
	attributes.push(["stroke-width", feature.getDefault().getStrokeWidth()]);
	attributes.push(["stroke-opacity", feature.getDefault().getStrokeOpacity()]);
	
	if (this.forceColor == null) {
		attributes.push( [ "fill", feature.getDefault().getFill() ]);
	} else {
		attributes.push( [ "fill", this.forceColor ]);
	}
	
	return attributes;
};

FeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
		var _this = this;
		if (featureWidth <= 1) {
			featureWidth = 2;
		}
		this.positions[Math.ceil(startPoint)] = true;
		var nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), top , featureWidth, this.featureHeight, this.trackNodeGroup, attributes);
	
		if (this.label) {
			this._renderLabel(Math.ceil(startPoint) ,  Math.ceil(top) + (this.featureHeight + this.labelHeight) , feature.label, this._setTextAttributes(feature), feature);
		}
};


FeatureTrack.prototype._renderLabel = function(start, top, label, attributes, formatter){
	var _this = this;
	var SVGNode = SVG.drawText(start , top , label, this.labelNodeGroup, attributes);
	SVGNode.addEventListener("click", function() {
		_this.onClick.notify(formatter);
		try{
			var gridFields = [];
			for (key in formatter.feature ){
				gridFields.push(key);		
			}
//			var window = new ListWidget({title:formatter.label, gridFields:gridFields});
//			window.draw([[formatter.feature]],[formatter.label]);
			if (formatter instanceof SNPFeatureFormatter){
				new SnpInfoWidget(null, _this.species).draw(formatter);
			}
			if (formatter instanceof VCFFeatureFormatter){
				new VCFVariantInfoWidget(null, _this.species).draw(formatter);
			}
			
		}catch(e){
			console.log(e);
		}

	}, true);
	
	SVGNode.addEventListener("mouseover", function(ev) {
//TODO  done
//console.log(ev);
		_this.tooltippanel = new TooltipPanel();
		_this.tooltippanel.getPanel(formatter).showAt(ev.clientX,ev.clientY);
	}, true);
	SVGNode.addEventListener("mouseout", function() {
//TODO done
		_this.tooltippanel.destroy();
	}, true);
	
};

FeatureTrack.prototype.getIdToPrint = function(feature){
	return feature.id;
};

FeatureTrack.prototype._render = function() {
	this.init();
	if (this.isAvalaible){
		if (this.features != null){
			this.drawFeatures(this.features);
		}
	}
};

FeatureTrack.prototype.moveTitle = function(movement) {
	if (this.title){
			
			var movementOld = parseFloat(this.titleNodeGroup.getAttribute("moveX"));
//			var desplazamiento = parseFloat((parseFloat(movement) + parseFloat(movementOld)));
			if (!movementOld){
				desplazamiento = (movement);
			}
			else{
				desplazamiento = parseFloat((parseFloat(movement) + parseFloat(movementOld)));
			}
			
			this.titleNodeGroup.setAttribute("transform", "translate("+ -desplazamiento + ", 0)");
			this.titleNodeGroup.setAttribute("moveX", desplazamiento);
	}
};


FeatureTrack.prototype.drawTitle = function(midlle, args){
	var widthLine = 1;
	if (args != null){
		if (args.width != null){
			widthLine = args.width;
		}
	}
	
	var coordenateX = this._convertGenomePositionToPixelPosition(midlle);
		
		
	if (this.titleRectangle != null){
		this.titleRectangle.parentNode.removeChild(this.titleRectangle);
	}
	
	if (this.titleText != null){
		this.titleText.parentNode.removeChild(this.titleText);
	}
	
	if (this.isAvalaible){
		var attributes = [["fill", "#FFFFFF"], ["stroke", "#000000"], ["opacity", 0.7], ["rx", 4], ["ry", 4], ["id"]];
		this.titleRectangle = SVG.drawRectangle(coordenateX , this.top, this.titleWidth , this.height, this.titleNodeGroup, attributes);
		this.titleText = SVG.drawText(coordenateX + 2, this.top + this.titleHeight - 3, this.titleName, this.titleNodeGroup, [["font-size", this.titleFontSize]]);
	}
	else{
		var attributes = [["fill", "#FFFFCC"], ["stroke", "#000000"], ["opacity", 0.7], ["rx", 0], ["ry", 0]];
		SVG.drawRectangle(coordenateX , this.top, this.width , this.height, this.titleNodeGroup, attributes);
		SVG.drawText(coordenateX + 2, this.top + this.height - 4, this.titleName + ": " + this.isNotAvalaibleMessage, this.titleNodeGroup, [["font-size", this.titleFontSize]]);
	}
};


//FeatureTrack.prototype.drawTitle = function(start) {
//	var x = start + 20;
//	var y =  (this.top + this.height);
//	var pos = this._convertGenomePositionToPixelPosition(start) + 10;
//	
//	if (this.isAvalaible){
//		var attributes = [["fill", "#FFFFFF"], ["stroke", "#000000"], ["opacity", 0.7], ["rx", 4], ["ry", 4]];
//		SVG.drawRectangle(pos , this.top, this.titleWidth , this.height, this.titleNodeGroup, attributes);
//		SVG.drawText(pos + 2, this.top + this.titleHeight - 3, this.titleName, this.titleNodeGroup, [["font-size", this.titleFontSize]]);
//	}
//	else{
//		var attributes = [["fill", "#FFFFCC"], ["stroke", "#000000"], ["opacity", 0.7], ["rx", 0], ["ry", 0]];
//		SVG.drawRectangle(pos , this.top, this.width , this.height, this.titleNodeGroup, attributes);
//		SVG.drawText(pos + 2, this.top + this.height - 4, this.titleName + ": " + this.isNotAvalaibleMessage, this.titleNodeGroup, [["font-size", this.titleFontSize]]);
//	}
//	
//	
//};



FeatureTrack.prototype._addFeatures = function(data) {
	this.features = data.toJSON();
	this.featuresIndex = new Object();
};

//FeatureTrack.prototype._addFeatures = function (data){
//	/** features */
//	this.features = data.toJSON()[0];
//};

/** svgNodeGroup: es el nodo svg donde este objecto track sera renderizado **/
FeatureTrack.prototype.draw = function (data, svgNodeGroup, top){
	this.top = top;
	
	if (svgNodeGroup != null){
		this._svg = svgNodeGroup;
	}

	if (data.toJSON() != null){
		this._addFeatures(data);
	}
	
	this._render();
};


/** EVENTS */
FeatureTrack.prototype.mouseclick = function(evt) {
};


function SNPFeatureTrack (rulerID,targetID, species, args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID, species, args);
	
	this.opacity = null;
	this.forceColor = null;
	
	if (args != null){
		if (args.opacity != null){
			this.opacity = args.opacity;
		}
		
		if (args.forceColor != null){
			this.forceColor = args.forceColor;
		}
		
	}
	this.positions = new Object();
}


SNPFeatureTrack.prototype._renderLabel =    FeatureTrack.prototype._renderLabel;
SNPFeatureTrack.prototype.getIdToPrint =    FeatureTrack.prototype.getIdToPrint;
SNPFeatureTrack.prototype.changeView =      FeatureTrack.prototype.changeView;
SNPFeatureTrack.prototype.render =          FeatureTrack.prototype.render;
SNPFeatureTrack.prototype.init =            FeatureTrack.prototype.init;
SNPFeatureTrack.prototype.createSVGDom =    FeatureTrack.prototype.createSVGDom;
SNPFeatureTrack.prototype._getTopText =     FeatureTrack.prototype._getTopText;
SNPFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
SNPFeatureTrack.prototype._searchSpace =    FeatureTrack.prototype._searchSpace;
SNPFeatureTrack.prototype.drawTitle =       FeatureTrack.prototype.drawTitle;
SNPFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
SNPFeatureTrack.prototype.mouseclick =      FeatureTrack.prototype.mouseclick;
SNPFeatureTrack.prototype.getById =         FeatureTrack.prototype.getById;
SNPFeatureTrack.prototype.draw =            FeatureTrack.prototype.draw;
SNPFeatureTrack.prototype.drawFeatures =    FeatureTrack.prototype.drawFeatures;
SNPFeatureTrack.prototype._overlapBlocks =  FeatureTrack.prototype._overlapBlocks;
SNPFeatureTrack.prototype._render =       FeatureTrack.prototype._render;
SNPFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
SNPFeatureTrack.prototype._getViewBoxCoordenates 	=       FeatureTrack.prototype._getViewBoxCoordenates;
SNPFeatureTrack.prototype._getFeatureWidth 	=       FeatureTrack.prototype._getFeatureWidth;
SNPFeatureTrack.prototype._updateTop 	=       FeatureTrack.prototype._updateTop;
SNPFeatureTrack.prototype.clear 	=       FeatureTrack.prototype.clear;
SNPFeatureTrack.prototype.drawBackground 	=       FeatureTrack.prototype.drawBackground;
SNPFeatureTrack.prototype.moveTitle 	=       FeatureTrack.prototype.moveTitle;
SNPFeatureTrack.prototype.appendFeatures 	=       FeatureTrack.prototype.appendFeatures;
SNPFeatureTrack.prototype.drawFeaturesInQueue = FeatureTrack.prototype.drawFeaturesInQueue;
SNPFeatureTrack.prototype._setAttributes = FeatureTrack.prototype._setAttributes;
SNPFeatureTrack.prototype._setTextAttributes = FeatureTrack.prototype._setTextAttributes;
//SNPFeatureTrack.prototype._drawFeature = FeatureTrack.prototype._drawFeature;

SNPFeatureTrack.prototype.addFeatures  = function(data){
	var features = data.toJSON();
	this.drawFeatures(features);
};


SNPFeatureTrack.prototype._addFeatures = function(data){
	/** features */
	this.features = data.toJSON();
	this.featuresIndex = new Object();
};

SNPFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
	var _this = this;
	if (featureWidth <= 1) {
		featureWidth = 2;
	}
	
	
	this.positions[Math.ceil(startPoint)] = true;
	var nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), top , featureWidth, this.featureHeight, this.trackNodeGroup, attributes);
	
	
	
	if (this.label) {
		this._renderLabel(Math.ceil(startPoint) ,  Math.ceil(top) + (this.featureHeight + this.labelHeight) , feature.label, this._setTextAttributes(feature), feature);
		
		if (feature.base != null){
			var snpLength = feature.base.length;
			var snpSize = featureWidth/snpLength;
			for ( var i = 0; i < snpLength; i++) {
				SVG.drawText((i*snpSize) + startPoint + 2 , Math.ceil(top) + 8, feature.base[i], this.labelNodeGroup, [["font-size", "8"], ["fill", "black"]]);
			}
		}
	}
};






VCFFeatureTrack.prototype.getIdToPrint = FeatureTrack.prototype.getIdToPrint;
VCFFeatureTrack.prototype.changeView = FeatureTrack.prototype.changeView;
VCFFeatureTrack.prototype.render = FeatureTrack.prototype.render;
VCFFeatureTrack.prototype.init = FeatureTrack.prototype.init;
VCFFeatureTrack.prototype.createSVGDom = FeatureTrack.prototype.createSVGDom;
VCFFeatureTrack.prototype._getTopText = FeatureTrack.prototype._getTopText;
VCFFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
VCFFeatureTrack.prototype._searchSpace = FeatureTrack.prototype._searchSpace;
VCFFeatureTrack.prototype.drawTitle = FeatureTrack.prototype.drawTitle;
VCFFeatureTrack.prototype.mouseMove = FeatureTrack.prototype.mouseMove;
VCFFeatureTrack.prototype.mouseclick = FeatureTrack.prototype.mouseclick;
VCFFeatureTrack.prototype.getById = FeatureTrack.prototype.getById;
VCFFeatureTrack.prototype.draw = FeatureTrack.prototype.draw;
VCFFeatureTrack.prototype.getFeatureColor = FeatureTrack.prototype.getFeatureColor;
VCFFeatureTrack.prototype.drawFeatures = FeatureTrack.prototype.drawFeatures;
VCFFeatureTrack.prototype._overlapBlocks = FeatureTrack.prototype._overlapBlocks;
VCFFeatureTrack.prototype._render = FeatureTrack.prototype._render;
VCFFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
VCFFeatureTrack.prototype._getViewBoxCoordenates = FeatureTrack.prototype._getViewBoxCoordenates;
VCFFeatureTrack.prototype._getFeatureWidth = FeatureTrack.prototype._getFeatureWidth;
VCFFeatureTrack.prototype.clear = FeatureTrack.prototype.clear;
VCFFeatureTrack.prototype.drawBackground = FeatureTrack.prototype.drawBackground;
VCFFeatureTrack.prototype.moveTitle = FeatureTrack.prototype.moveTitle;
VCFFeatureTrack.prototype._setAttributes = FeatureTrack.prototype._setAttributes;
VCFFeatureTrack.prototype._setTextAttributes = FeatureTrack.prototype._setTextAttributes;
VCFFeatureTrack.prototype._updateTop = FeatureTrack.prototype._updateTop;
//VCFFeatureTrack.prototype._drawFeature = FeatureTrack.prototype._drawFeature;
VCFFeatureTrack.prototype.drawFeaturesInQueue = FeatureTrack.prototype.drawFeaturesInQueue;
VCFFeatureTrack.prototype._renderLabel = FeatureTrack.prototype._renderLabel;

function VCFFeatureTrack(rulerID, targetID, args) {
	FeatureTrack.prototype.constructor.call(this, rulerID, targetID, args);


	/*if (args != null) {
	}*/
	
	this.positions = new Object();
	this.counter = 0;
	
	console.log(this.featureHeight);
}

VCFFeatureTrack.prototype.appendFeatures = function(data) {
	var features = data.toJSON();
	this.drawFeatures(features);
};

VCFFeatureTrack.prototype._addFeatures = function(data) {
	this.features = data.toJSON();
	this.featuresIndex = new Object();
};


VCFFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
	var _this = this;
	if (featureWidth <= 1) {
		featureWidth = 2;
	}
	this.positions[Math.ceil(startPoint)] = true;
	var nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), top , featureWidth, this.featureHeight, this.trackNodeGroup, attributes);
	
	
	if (feature.base != null){
		var snpLength = feature.base.length;
		var snpSize = featureWidth/snpLength;
		for ( var i = 0; i < snpLength; i++) {
			SVG.drawText((i*snpSize) + startPoint + 2 , Math.ceil(top) + 8, feature.base[i], this.labelNodeGroup, [["font-size", "8"],["fill", "#ffffff"]]);
		}
	}
	
	if (this.label) {
		this._renderLabel(Math.ceil(startPoint) ,  Math.ceil(top) + (this.featureHeight + this.labelHeight) , feature.label, this._setTextAttributes(feature), feature);
	}
};

function GeneFeatureTrack (rulerID,targetID,  args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID,  args);
	
	this.opacity = null;
	this.forceColor = null;
	
	if (args != null){
		if (args.opacity != null){
			this.opacity = args.opacity;
		}
		
		if (args.forceColor != null){
			this.forceColor = args.forceColor;
		}
		
	}
	
}


GeneFeatureTrack.prototype.isFeatureDuplicated =    FeatureTrack.prototype.isFeatureDuplicated;
GeneFeatureTrack.prototype.getIdToPrint =    FeatureTrack.prototype.getIdToPrint;
GeneFeatureTrack.prototype.changeView =      FeatureTrack.prototype.changeView;
GeneFeatureTrack.prototype.render =          FeatureTrack.prototype.render;
GeneFeatureTrack.prototype.init =            FeatureTrack.prototype.init;
GeneFeatureTrack.prototype.createSVGDom =    FeatureTrack.prototype.createSVGDom;
GeneFeatureTrack.prototype._getTopText =     FeatureTrack.prototype._getTopText;
GeneFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
GeneFeatureTrack.prototype._searchSpace =    FeatureTrack.prototype._searchSpace;
GeneFeatureTrack.prototype.drawTitle =       FeatureTrack.prototype.drawTitle;
GeneFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
GeneFeatureTrack.prototype.mouseclick =      FeatureTrack.prototype.mouseclick;
GeneFeatureTrack.prototype.getById =         FeatureTrack.prototype.getById;
GeneFeatureTrack.prototype.draw =            FeatureTrack.prototype.draw;
GeneFeatureTrack.prototype.getFeatureColor = FeatureTrack.prototype.getFeatureColor;
GeneFeatureTrack.prototype.drawFeatures =    FeatureTrack.prototype.drawFeatures;
GeneFeatureTrack.prototype._overlapBlocks =  FeatureTrack.prototype._overlapBlocks;
GeneFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
GeneFeatureTrack.prototype.mouseUp =      	 FeatureTrack.prototype.mouseUp;
GeneFeatureTrack.prototype.mouseClick =      FeatureTrack.prototype.mouseClick;
GeneFeatureTrack.prototype.mouseDown =       FeatureTrack.prototype.mouseDown;
GeneFeatureTrack.prototype._render =       FeatureTrack.prototype._render;
GeneFeatureTrack.prototype._addFeatures =       FeatureTrack.prototype._addFeatures;
GeneFeatureTrack.prototype._setAttributes = FeatureTrack.prototype._setAttributes;
GeneFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
GeneFeatureTrack.prototype._getViewBoxCoordenates 	=       FeatureTrack.prototype._getViewBoxCoordenates;
GeneFeatureTrack.prototype._getFeatureWidth 	=       FeatureTrack.prototype._getFeatureWidth;
GeneFeatureTrack.prototype._updateTop 	=       FeatureTrack.prototype._updateTop;
GeneFeatureTrack.prototype.clear 	=       FeatureTrack.prototype.clear;
GeneFeatureTrack.prototype.drawBackground 	=       FeatureTrack.prototype.drawBackground;
GeneFeatureTrack.prototype.moveTitle 	=       FeatureTrack.prototype.moveTitle;

GeneFeatureTrack.prototype.addFeatures = function(data){
	var features = data.toJSON();
	this.drawFeatures(features);
};


GeneFeatureTrack.prototype._addFeatures = function(data){
	/** features */
	this.features = data.toJSON();
	this.featuresIndex = new Object();
};



GeneFeatureTrack.prototype._setAttributes = function(feature){
	
	var attributes = [["id", this.id], ["font-size", feature.getDefault().args.fontSize]];
	
	if (this.opacity == null){
		attributes.push(["opacity", feature.getDefault().getOpacity()]);
	}
	else{
		attributes.push(["opacity", this.opacity]);
	}
	
	if (this.forceColor == null){
		attributes.push(["fill", feature.getDefault().getFill()]);
	}
	else{
		attributes.push(["fill", this.forceColor]);
	}
	
	attributes.push(["stroke", "black"]);
	attributes.push(["stroke-width", "1"]);
	return attributes;
};

GeneFeatureTrack.prototype._setTextAttributes = function(feature){
	var color = this.getFeatureColor(feature);
	var attributes = [["fill", "black"],["id", this.id+"_" + feature.start], ["font-size", feature.getDefault().args.fontSize]];
	return attributes;
};


GeneFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
	var nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), Math.ceil(top), featureWidth, this.featureHeight, this.trackNodeGroup, attributes);
	
	
//	var nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), Math.ceil(top) + (this.height - this.featureHeight), featureWidth, this.featureHeight, this.trackNodeGroup, attributes);
//	SVG.drawText(Math.ceil(startPoint),  Math.ceil(top) + (this.height - this.featureHeight) - 2 , feature.label, this.trackNodeGroup, this._setTextAttributes(feature));
	
	

	var _this = this;
	nodeSVG.addEventListener("mouseover", function(){}, true);
};


function TrackCanvas(trackerID, targetNode, args) {
	/** Groups and layers */
	this.tracksGroup = null;

	/** target */
	this.targetID = targetNode.id;

	this.args = args;

	/** Coordenates with default Setting */
	this.top = 0;
	this.left = 100;
	this.right = 900;
	this.width = 1100;
	this.height = 50;

	/** real start and end */
	this.startViewBox = args.start;
	this.endViewBox = args.end;

	/** Tracks **/
	this.trackList = new Array();
	this.trackRendered = new Array();
	this.trackRenderedName = new Array();
	
	this.regionAdapterList = new Array();

	/** Pixel Ratio and zoom **/
	this.pixelRatio = 5;
	this.zoom = 1;
	this.viewBoxModule = 700;

	/** Dragging **/
	this.allowDragging = false;
	this.isDragging = false;
	this.dragPoint = null;

	/** Optional parameters */
	this.backgroundColor = "#FFFFFF";
	this.titleColor = "#000000";
	this.overflow = false;

	/** Optional parameters: title */
	this.title = false;
	this.titleName = null;
	this.titleFontSize = 10;
	
	/** Y moving ***/
	this.enableMovingY = false;
	
	/** Moving canvas provoke que los tracks con el flag showLabelsOnMiddleMarker se muevan **/
	this.allowLabelMoving = true;
	
	/** Flag to solver marker bug */
	this.isBeenRenderized = true; /** true si estoy renderizando por primera vez el trackcanvas **/
	/** Processing optional parameters */
	if (args != null) {
		if (args.top != null) {
			this.top = args.top;
		}
		if (args.left != null) {
			this.left = args.left;
		}
		if (args.right != null) {
			this.right = args.right;
		}
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.backgroundColor != null) {
			this.backgroundColor = args.backgroundColor;
		}
		if (args.titleFontSize != null) {
			this.titleFontSize = args.titleFontSize;
		}
		if (args.allowDragging != null) {
			this.allowDragging = args.allowDragging;
		}
		if (args.titleColor != null) {
			this.titleColor = args.titleColor;
		}
		if (args.title != null) {
			this.title = true;
			this.titleName = args.title;
		}
		if (args.overflow != null) {
			this.overflow = args.overflow;
		}
		if (args.pixelRatio != null) {
			this.pixelRatio = args.pixelRatio;
		}
		if (args.viewBoxModule != null) {
			this.viewBoxModule = args.viewBoxModule;
		}
		if (args.zoom != null) {
			this.zoom = args.zoom;
		}
	}

	/** Info Panel */
	this.textLines = new Array();

	/** id manage */
	this.id = trackerID;
	this.idMain = this.id + "_Main";
	this.moveY = 0;
//	this.ruleTracks = new Array();

	/** Events */
//	this.click = new Event(this);//NOT USED
//	this.selecting = new Event(this);//NOT USED
	this.onMove = new Event(this);
	this.afterDrag = new Event(this);
	this.onRender = new Event(this);

};

TrackCanvas.prototype.createSVGDom = function(targetID, id, width, height, backgroundColor) {
	var container = DOM.select(targetID);
	this._svg = SVG.createSVGCanvas(container, [
	        [ "viewBox", "0 10 " + this.width + " " + this.height ],
			[ "preserveAspectRatio", "none" ], [ "id", id ],
			[ "height", this.height ], [ "width", this.width ] , [ "background-color", "green" ]]);

	/** Creating groups **/
	this.tracksGroup = SVG.drawGroup(this._svg, [ [ "id", this.idMain ],[ "transform", "scale(" + this.zoom + ")" ] ]);
	
	SVG.drawRectangle(0,0, this.viewBoxModule, this.height, this.tracksGroup, [["fill", "white"]]);
	return this._svg;
};

TrackCanvas.prototype.mouseClick = function(event) {
	alert("click");
};
TrackCanvas.prototype.mouseMove = function(event) {
	if (this.allowDragging){
		this._dragging(event);
		
		this.moveLabelsFeatureSelected();
	}
};

TrackCanvas.prototype.moveLabelsFeatureSelected = function() {
	
	if (this.allowLabelMoving){
		for ( var i = 0; i < this.trackList.length; i++) {
			if(this.trackList[i].showLabelsOnMiddleMarker){
				this.trackList[i].drawLabelAtPosition(this.getMiddlePoint(), this.regionAdapterList[i].getFeaturesByPosition(this.getMiddlePoint()));
			}
		}
	}
};

TrackCanvas.prototype.mouseDown = function(event) {
	if (this.allowDragging){
		this._startDragging(event);
	}
};
TrackCanvas.prototype.mouseUp = function(event) {
	if (this.allowDragging){
		this._afterDrag(event);
		
	}
};

TrackCanvas.prototype.init = function() {
	this._svg = this.createSVGDom(this.targetID, this.id, this.width, this.height, this.backgroundColor);

	/** SVG Events listener */
	var _this = this;
	//	this._svg.addEventListener("click", function(event) {_this.mouseClick(event); }, false);
	this._svg.addEventListener("mousemove", function(event) {
		_this.mouseMove(event, _this);
	}, false);
	this._svg.addEventListener("mousedown", function(event) {
		_this.mouseDown(event, _this);
	}, false);
	this._svg.addEventListener("mouseup", function(event) {
		_this.mouseUp(event, _this);
	}, false);
	
//	this._svg.addEventListener("mouseout", function(event) {
//		_this.mouseUp(event, _this);
//	}, false);
	
};

TrackCanvas.prototype._getTrackFromInternalRegionId = function(internalRegionId) {
	for ( var i = 0; i < this.regionAdapterList.length; i++) {
		if (this.regionAdapterList[i] != null) {
			if (this.regionAdapterList[i].internalId == internalRegionId) {
				return this.trackList[i];
			}
		}
	}
	return null;
};

TrackCanvas.prototype._formatData = function(regionAdapter) {
	/** DAS  **/
	if (regionAdapter instanceof DasRegionDataAdapter) {
		console.log("regionAdapter instanceof DasRegionDataAdapter");
//		var formatters = new ArrayRegionCellBaseDataAdapter();
//		for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
//			formatters.push(new DASFeatureFormatter(regionAdapter.dataset.json[0][i]));
//		}
//		regionAdapter.dataset.json = formatters;
	}
	
	
	if (regionAdapter instanceof GeneRegionCellBaseDataAdapter) {
		var geneBlockManager = new GeneBlockManager();
		regionAdapter.dataset.json = geneBlockManager.toDatasetFormatter(regionAdapter.dataset.json);
	}

	
	/** VCF  **/
	if (regionAdapter instanceof VCFLocalRegionDataAdapter) {
		var formatters = new Array();
		for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
			formatters.push(new VCFFeatureFormatter(regionAdapter.dataset.json[0][i]));
		}
		regionAdapter.dataset.json = formatters;
	}
	
	/** GFF **/
	if (regionAdapter instanceof GFFLocalRegionDataAdapter) {
		var formatters = new Array();
		for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
			formatters.push(new GFFFeatureFormatter(regionAdapter.dataset.json[0][i]));
		}
		regionAdapter.dataset.json = formatters;
	}
	
	/** BED **/
	if (regionAdapter instanceof BEDLocalRegionDataAdapter) {
		var formatters = new Array();
		for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
			formatters.push(new BEDFeatureFormatter(regionAdapter.dataset.json[0][i]));
		}
		regionAdapter.dataset.json = formatters;
	}

	/** RULE  **/
	if (regionAdapter instanceof RuleRegionDataAdapter) {
		var formatters = new Array();
		for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
			formatters.push(new MarkerRuleFeatureFormatter(regionAdapter.dataset.json[0][i]));
		}
		regionAdapter.dataset.json = formatters;
	}
	
	if (regionAdapter instanceof RegionCellBaseDataAdapter) {
		var formatters = new Array();

		if (regionAdapter.resource.toLowerCase().indexOf("histogram=true") != -1){
			return regionAdapter;
		}
		
		if (regionAdapter.resource == "gene") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new GeneFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "tfbs") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new TfbsFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "mirnatarget") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new MiRNAFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "regulatory?type=open chromatin") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new GenericFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "regulatory?type=HISTONE") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new GenericFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "regulatory?type=Polymerase") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new GenericFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		

		if (regionAdapter.resource == "snp") {

			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new SNPFeatureFormatter(
						regionAdapter.dataset.json[0][i]));
			}
		}

		if (regionAdapter.resource == "cytoband") {

			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new CytobandFeatureFormatter(
						regionAdapter.dataset.json[0][i]));
			}
		}

		if (regionAdapter.resource == "transcript") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new TranscriptFeatureFormatter(
						regionAdapter.dataset.json[0][i]));
			}
		}

		if (regionAdapter.resource == "exon") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new ExonFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}

		if (regionAdapter.resource == "conservedregion") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new GenericFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "sequence") {
			var formatters = new Array();

			for ( var i = 0; i < regionAdapter.dataset.json[0].sequence.length; i++) {
				var pos = (regionAdapter.dataset.json[0].start + i) + 1;
				formatters.push(new SequenceFormatter( {
					"start" : pos,
					"end" : pos,
					"base" : regionAdapter.dataset.json[0].sequence[i]
				}));
			}
		}
		regionAdapter.dataset.json = formatters;
	}
	
	return regionAdapter;
};

TrackCanvas.prototype._trackRendered = function() {
	for ( var i = 0; i < this.trackRendered.length; i++) {
		if (this.trackRendered[i] == false) {
			this.trackRendered[i] = true;
			return;
		}
	}
};

TrackCanvas.prototype._areAllTracksRendered = function() {
	for ( var i = 0; i < this.trackRendered.length; i++) {
		if (this.trackRendered[i] == false) {
			return false;
		}
	}
	return true;
};

TrackCanvas.prototype._drawTrack = function(chromosome, start, end, track, regionAdapter) {
		var _this = this;
		track.viewBoxModule = this.viewBoxModule;
	
		if (track.isAvalaible){
			 
			regionAdapter.successed.addEventListener(function(evt, data) {
				 _this._formatData(regionAdapter);
				/** trackRender es una array donde indico con true/track ha sido renderizado o false que no lo ha sido
				 * de esta manera controlo cuando todos los track hayan sido renderizados porder dibujar la regla **/
				 
				_this.trackRenderedName.push(regionAdapter);
				_this._trackRendered();
				/** Si todos han sido rendrizados dibujo la regla **/
				
				if (_this._areAllTracksRendered()) {
					_this.drawRules(chromosome, start, end);
				}
				
			});
			regionAdapter.preloadSuccess.addEventListener(function(evt, data) {
				var track = _this._getTrackFromInternalRegionId(evt.internalId);
				regionAdapter = _this._formatData(regionAdapter);

				track.appendFeatures(regionAdapter.dataset);
	
			});
	
			this.onMove.addEventListener(function(evt, data) {
				data.middle = Math.ceil(data.middle) + 1;
				regionAdapter.setIntervalView(chromosome, Math.ceil(data.middle));
				if (regionAdapter instanceof RuleRegionDataAdapter){
					_this.selectPaintOnRules(data.middle);
				}
				
				
			});
//			console.log("trackerID"+track.trackerID+"  "+regionAdapter.resource);
//			console.log(track);
			regionAdapter.fill(chromosome, start, end, regionAdapter.resource);
		}
		else{
			_this.trackRenderedName.push(regionAdapter);
			_this._trackRendered();
			
			if (_this._areAllTracksRendered()) {
				_this.drawRules(chromosome, start, end);
			}
//			console.log(_this._areAllTracksRendered());
		}
};

TrackCanvas.prototype.selectPaintOnRules = function(middle) {
	for ( var i = 0; i < this.getRulerTrack().length; i++) {
		if (this.pixelRatio < 1){
			this.getRulerTrack()[i].select(middle);
		}
		else{
			this.getRulerTrack()[i].select(middle, {width:this.pixelRatio});
		}
	}
};

TrackCanvas.prototype.getRulerTrack = function() {
	var rules = new Array();
	for ( var i = 0; i < this.trackList.length; i++) {
		if (this.trackList[i] instanceof RuleFeatureTrack){
			rules.push(this.trackList[i]);
		}
	}
	return rules;
};

TrackCanvas.prototype.getMiddlePoint = function() {
	return Math.ceil(this.middle) + 1;
};

TrackCanvas.prototype.drawRules = function(chromosome, start, end) {
	for ( var i = 0; i < this.trackList.length; i++) {
			var top = this._getTopTrack(this.trackList[i]);
			this.trackList[i].draw(this.regionAdapterList[i].dataset,this.tracksGroup, top);
			this._drawTitle(i);
	}
	this._goToCoordinateX(this.start);
	this.onRender.notify();
};

TrackCanvas.prototype._drawTitle = function(i) {
//			var top = this._getTopTrack(this.trackList[i]);
			if (this.trackList[i].title != null) {
				var middle = this.start + ((this.width / this.pixelRatio) / 2);
				if (middle == null) {
					this.trackList[i].drawTitle(10);
				} 
				else {
					var left = (this.width / 2) / this.pixelRatio;
					this.trackList[i].drawTitle(middle - left + 1 );
				}
			}
};


TrackCanvas.prototype.draw = function(chromosome, start, end) {
	this.start = start;
	this.end = end;
	this.chromosome = chromosome;
	this.startViewBox = (start * this.pixelRatio) % this.viewBoxModule;
	this.endViewBox = (end * this.pixelRatio) % this.viewBoxModule;

	for ( var i = 0; i < this.regionAdapterList.length; i++) {
			var track = this.trackList[i];
			var regionAdapter = this.regionAdapterList[i];
			regionAdapter.successed = new Event(regionAdapter);
			regionAdapter.preloadSuccess = new Event(regionAdapter);
			this._drawTrack(chromosome, start, end, track, regionAdapter);
	}
};

TrackCanvas.prototype.clear = function() {
	DOM.removeChilds(this.targetID);
};

TrackCanvas.prototype.addTrack = function(track, regionDataAdapter) {
	this.trackList.push(track);
	this.trackRendered.push(false);
	this.regionAdapterList.push(regionDataAdapter);
};



TrackCanvas.prototype._getTopTrack = function(track) {
	var top = this.top;
	for ( var i = 0; i < this.trackList.length; i++) {
		if (this.trackList[i].internalId == track.internalId) {
			return top + this.trackList[i].top;
		}
		top = top + this.trackList[i].height + this.trackList[i].originalTop;
	}
	return top;
};


/** DRAGGING **/
TrackCanvas.prototype._goToCoordinateX = function(position) {
	this.start = position;
	var startZoom = (this.start * this.pixelRatio) % this.viewBoxModule;
	var viewBox = startZoom + " " + "10 " + this.width + " " + this.height;
	this._svg.setAttribute("viewBox", viewBox);

	/** He cambiado esto por el slave **/
	if (this.isBeenRenderized){
		this.middle = this.start + (this.end - this.start)/2;
		this.isBeenRenderized = false;
	}
	else{
		this.middle = this.start + ((this.width / this.pixelRatio) / 2);
	}

	this.onMove.notify( {
		"chromosome" : this.chromosome,
		"start" : this.start,
		"end" : this.end,
		"middle" : this.middle
	});

};

TrackCanvas.prototype._moveCoordinateX = function(move) {
	for ( var i = 0; i < this.trackList.length; i++) {
		if ((this.trackList[i].title) != null) {
//			if (parseFloat(this.pixelRatio) < 1){
				this.trackList[i].moveTitle(-move);
//			}
//			else{
//				this._drawTitle(i);
//			}
		}
	}

	var newStart = move / this.pixelRatio;
	this._goToCoordinateX(Math.ceil(this.start + newStart));
};

TrackCanvas.prototype._moveCoordinateY = function(move) {
	var realMove = (-1 * move) + this.moveY;
	if (realMove < this.top) {
		this.tracksGroup.setAttribute("transform", "translate(0, " + realMove+ ")");
		this.realMove = realMove;

		for ( var i = 0; i < this.trackList.length; i++) {
			if (this.trackList[i].floating){
				this.trackList[i].moveY(-realMove);
			}
		}
	} else {
		this.realMove = 0;
	}
};

TrackCanvas.prototype._startDragging = function(evt) {
	this.isDragging = true;
	var point = this._getSVGCoordenates(evt);
	this.dragPoint = {
		"x" : point.x,
		"y" : point.y
	};
};

TrackCanvas.prototype._afterDrag = function(evt) {
	this.isDragging = false;
	this.dragPoint = null;
	this.moveY = this.realMove;
	this.afterDrag.notify(this.middle);
	
	
	
};

TrackCanvas.prototype.setZoom = function(zoom) {
	this.zoom = zoom;
	this.tracksGroup.setAttribute("transform", "scale(" + zoom + ")");
	this._goToCoordinateX(this.startViewBox);
};

TrackCanvas.prototype._dragging = function(evt) {
	if (this.isDragging) {
		var actualPointSVG = this._getSVGCoordenates(evt);
		
		var moveX = this.dragPoint.x - actualPointSVG.x;
		var moveY = this.dragPoint.y - actualPointSVG.y;
		
		this._moveCoordinateX(moveX);
		if(this.enableMovingY){
			this._moveCoordinateY(Math.ceil(moveY));
		}
	}

};

/** SVG COORDENATES **/
TrackCanvas.prototype._getSVGCoordenates = function(evt) {
	var p = this._svg.createSVGPoint();
	p.x = evt.clientX;
	p.y = evt.clientY;

	var m = this._svg.getScreenCTM(document.documentElement);
	p = p.matrixTransform(m.inverse());
	return p;
};

function SequenceFeatureTrack (rulerID,targetID, species, args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID, species, args);
	this.avoidOverlapping = false;
	
}

SequenceFeatureTrack.prototype.getIdToPrint =    						FeatureTrack.prototype.getIdToPrint;
SequenceFeatureTrack.prototype.changeView =      						FeatureTrack.prototype.changeView;
SequenceFeatureTrack.prototype.render =          						FeatureTrack.prototype.render;
SequenceFeatureTrack.prototype.init =            						FeatureTrack.prototype.init;
SequenceFeatureTrack.prototype.createSVGDom =    						FeatureTrack.prototype.createSVGDom;
SequenceFeatureTrack.prototype._getTopText =     						FeatureTrack.prototype._getTopText;
SequenceFeatureTrack.prototype._getTopFeatures = 						FeatureTrack.prototype._getTopFeatures;
SequenceFeatureTrack.prototype._searchSpace =    						FeatureTrack.prototype._searchSpace;
SequenceFeatureTrack.prototype.drawTitle =       						FeatureTrack.prototype.drawTitle;
SequenceFeatureTrack.prototype.mouseMove =       						FeatureTrack.prototype.mouseMove;
SequenceFeatureTrack.prototype.mouseclick =      						FeatureTrack.prototype.mouseclick;
SequenceFeatureTrack.prototype.getById =         						FeatureTrack.prototype.getById;
SequenceFeatureTrack.prototype.draw =            						FeatureTrack.prototype.draw;
SequenceFeatureTrack.prototype.drawFeatures =    						FeatureTrack.prototype.drawFeatures;
SequenceFeatureTrack.prototype._overlapBlocks =  						FeatureTrack.prototype._overlapBlocks;
SequenceFeatureTrack.prototype.mouseMove =       						FeatureTrack.prototype.mouseMove;
SequenceFeatureTrack.prototype.mouseUp =      	 						FeatureTrack.prototype.mouseUp;
SequenceFeatureTrack.prototype.mouseClick =      						FeatureTrack.prototype.mouseClick;
SequenceFeatureTrack.prototype.mouseDown =       						FeatureTrack.prototype.mouseDown;
SequenceFeatureTrack.prototype._render =       							FeatureTrack.prototype._render;
SequenceFeatureTrack.prototype._convertGenomePositionToPixelPosition =  FeatureTrack.prototype._convertGenomePositionToPixelPosition;
SequenceFeatureTrack.prototype._getFeatureWidth 	=       			FeatureTrack.prototype._getFeatureWidth;
SequenceFeatureTrack.prototype._updateTop 	=       					FeatureTrack.prototype._updateTop;
SequenceFeatureTrack.prototype.clear 			=       				FeatureTrack.prototype.clear;
SequenceFeatureTrack.prototype.drawBackground  =          				FeatureTrack.prototype.drawBackground;
SequenceFeatureTrack.prototype.moveTitle  =          				    FeatureTrack.prototype.moveTitle;
SequenceFeatureTrack.prototype.drawFeaturesInQueue = FeatureTrack.prototype.drawFeaturesInQueue;

SequenceFeatureTrack.prototype.appendFeatures = function(data){
	this.features = data.toJSON();
	this.drawFeatures(this.features);
};



SequenceFeatureTrack.prototype._addFeatures = function(data){
	/** features */
	this.features = data.toJSON();
//	this.features = this._convertSequenceToFeatures(data.toJSON()[0].start, data.toJSON()[0].sequence);
	this.featuresIndex = new Object();
};

SequenceFeatureTrack.prototype._setAttributes = function(feature){
//	debugger
	var attributes = [["fill", feature.getDefault().getFill()],["id", this.id+"_" + feature.start], ["font-size", "10"]];
	attributes.push(["opacity", "1"]);
	return attributes;
};



SequenceFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
	
	attributes.push(["opacity", 0.8]);
	attributes.push(["stroke", "black"]);
	
	var nodeSVG = SVG.drawRectangle( startPoint , Math.ceil(top), this.pixelRatio, this.featureHeight, this.trackNodeGroup, attributes);
	SVG.drawText(startPoint + 2 , Math.ceil(top) + 8, feature.label, this.labelNodeGroup, [["font-size", "8"]]);
};

SequenceFeatureTrack.prototype.getTextId = function(startPoint){
	return "id_seq_" + startPoint;
};

SequenceFeatureTrack.prototype._textId = function(startPoint, top, featureWidth, attributes, feature){
	SVG.drawText(Math.ceil(startPoint) + 2, Math.ceil(top) + 8, feature.base, this.trackNodeGroup, [["font-size", "8"], ["id", this.getTextId(startPoint)]]);
};

SequenceFeatureTrack.prototype._removeTextBase = function(startPoint, top, featureWidth, attributes, feature){
	this.trackNodeGroup.removeChild(DOM.select(this.getTextId(startPoint)));
};

SequenceFeatureTrack.prototype._drawTextBase = function(startPoint, top, featureWidth, attributes, feature){
	SVG.drawText(Math.ceil(startPoint) + 2, Math.ceil(top) + 8, feature.base, this.trackNodeGroup, [["font-size", "8"], ["id", "id_seq_" + startPoint]]);
};



function RuleFeatureTrack (rulerID,targetID, species, args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID, species,  args);
	this.horizontalRuleDrawn = false;
	
//	this.pixelRatio = 0.001;
	this.ruleHeight = this.height;
	this.expandRuleHeight = this.height;
	/** Estos attributos tb tedeberia de tenerlo su dataadapter **/
//	this.space = 100;
//	this.maxChromosomeSize = 255000000;
//	this.ratio = this.space / this.pixelRatio; 	
	
	this.horizontalRuleTop = this.height - 2;
	
	if (args != null){
		if (args.expandRuleHeight != null){
			this.ruleHeight = args.expandRuleHeight;
		}
		
		if (args.space != null){
			this.space = args.space;
		}
	}

//	this.start = this.start - ((this.end - this.start) * 4);
//	this.end = this.end + ((this.end - this.start) * 4);
//	
	this.allowDuplicates = true;
	this.quarter = (this.end - this.start)/4;
	
	
	this.selectedMiddleLine = null;
	
}

RuleFeatureTrack.prototype.getIdToPrint =    FeatureTrack.prototype.getIdToPrint;
RuleFeatureTrack.prototype.render =          FeatureTrack.prototype.render;
RuleFeatureTrack.prototype._getTopText =     FeatureTrack.prototype._getTopText;
RuleFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
RuleFeatureTrack.prototype._searchSpace =    FeatureTrack.prototype._searchSpace;
RuleFeatureTrack.prototype.drawTitle =       FeatureTrack.prototype.drawTitle;
RuleFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
RuleFeatureTrack.prototype.mouseclick =      FeatureTrack.prototype.mouseclick;
RuleFeatureTrack.prototype.getById =         FeatureTrack.prototype.getById;
RuleFeatureTrack.prototype.draw =            FeatureTrack.prototype.draw;
RuleFeatureTrack.prototype.drawFeatures =    FeatureTrack.prototype.drawFeatures;
RuleFeatureTrack.prototype._overlapBlocks =  FeatureTrack.prototype._overlapBlocks;
RuleFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
RuleFeatureTrack.prototype.mouseUp =      	 FeatureTrack.prototype.mouseUp;
RuleFeatureTrack.prototype.mouseClick =      FeatureTrack.prototype.mouseClick;
RuleFeatureTrack.prototype.mouseDown =       FeatureTrack.prototype.mouseDown;
RuleFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
RuleFeatureTrack.prototype._render =       FeatureTrack.prototype._render;
RuleFeatureTrack.prototype._getFeatureWidth 	=       FeatureTrack.prototype._getFeatureWidth;
//RuleFeatureTrack.prototype.addFeatures 	=       FeatureTrack.prototype.addFeatures;
RuleFeatureTrack.prototype._updateTop 	=       FeatureTrack.prototype._updateTop;
RuleFeatureTrack.prototype.drawBackground 	=       FeatureTrack.prototype.drawBackground;
RuleFeatureTrack.prototype.isFeatureDuplicated 	=       FeatureTrack.prototype.isFeatureDuplicated;
RuleFeatureTrack.prototype.clear 	=       FeatureTrack.prototype.clear;
RuleFeatureTrack.prototype.init 	=       FeatureTrack.prototype.init;
RuleFeatureTrack.prototype.createSVGDom 	=       FeatureTrack.prototype.createSVGDom;
RuleFeatureTrack.prototype.moveY 	=       FeatureTrack.prototype.moveY;
RuleFeatureTrack.prototype._setAttributes 	=       FeatureTrack.prototype._setAttributes;
RuleFeatureTrack.prototype.moveTitle 	=       FeatureTrack.prototype.moveTitle;
RuleFeatureTrack.prototype.drawFeaturesInQueue 	=       FeatureTrack.prototype.drawFeaturesInQueue;


RuleFeatureTrack.prototype.appendFeatures = function(features){
	this.drawFeatures(features.toJSON());
};

RuleFeatureTrack.prototype._addFeatures = function(data){
	this.features =  data.toJSON();//this._getFeaturesFromRegion(this.start, this.end);//new Array();
	this.horizontalRuleDrawn = false;
};


RuleFeatureTrack.prototype.getFeatureColor = function(feature){
	return "#000000";
};


RuleFeatureTrack.prototype.select = function(midlle, args){
	var widthLine = 1;
	if (args != null){
		if (args.width != null){
			widthLine = args.width;
		}
		
	}
	
	if (this.selectedMiddleLine != null){
		this.selectedMiddleLine.parentNode.removeChild(this.selectedMiddleLine);
	}
	
	if (this.textMiddleLine != null){
		this.textMiddleLine.parentNode.removeChild(this.textMiddleLine);
	}
	
	if( this.trackNodeGroup != null){
	
		var attributes = [["fill", "green"],["stroke-width", "1"], ["opacity",0.5]];
		var coordenateX = this._convertGenomePositionToPixelPosition(midlle);
//		this.selectedMiddleLine = SVG.drawLine(Math.ceil(coordenateX),  this.top + this.horizontalRuleTop, Math.ceil(coordenateX), this.ruleHeight + 10000, this.trackNodeGroup, attributes);
		this.selectedMiddleLine = SVG.drawRectangle((coordenateX)  ,  this.top + this.horizontalRuleTop, widthLine, this.ruleHeight + 10000, this.trackNodeGroup, attributes);
		this.textMiddleLine = SVG.drawText(Math.ceil(coordenateX) - 15, this.top + this.horizontalRuleTop, this._prettyNumber(midlle), this.trackNodeGroup, [["font-size", "9"], ["fill", "green"]]);
	}
};


RuleFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
	if (this.trackNodeGroup != null){
		if (feature.isLabeled){
			SVG.drawText(Math.ceil(startPoint) + 2, top + 10 , this._prettyNumber(feature.start), this.labelNodeGroup, [["font-size", "10"]]);
			SVG.drawLine(Math.ceil(startPoint), top, Math.ceil(startPoint), this.ruleHeight + 10000, this.trackNodeGroup, [["stroke", "#000000"], ["opacity",feature.getDefault().getOpacity()]]);
		}
		else{
			//Es una linea divisoria
			SVG.drawLine(Math.ceil(startPoint),  top + this.horizontalRuleTop, Math.ceil(startPoint), this.ruleHeight + 10000, this.trackNodeGroup, [["stroke", "#000000"], ["opacity",feature.getDefault().getOpacity()]]);
		}
		
		if (!this.horizontalRuleDrawn){
			var lastPositionRec = this.viewBoxModule;
			if ((260000000*this.pixelRatio) < this.viewBoxModule){
				lastPositionRec = 260000000*this.pixelRatio;
			} 
			SVG.drawRectangle(0, top, lastPositionRec, this.height, this.trackNodeGroup, [["fill", "gray"], ["stroke", "#000000"], ["opacity", 0.5]]);
			this.horizontalRuleDrawn = true;
		}
	}
	

};

RuleFeatureTrack.prototype._prettyNumber = function addCommas(nStr){
	nStr = Math.ceil(nStr)+ '';
//	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
};

function MultiFeatureTrack (rulerID,targetID, species, args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID, species, args);
	
	this.queueHeight = 14;
	this.pixelSpaceBetweenBlocks = 80;
	this.showTranscripts = true;
	this.avoidOverlapping = true;
	
	this.showDetailGeneLabel = false;
	
	this.showExonLabel = false;
	this.onMouseOverShitExonTranscriptLabel = false;
	
	this.extraSpaceProducedByLabelAbove = 6;
	
	this.geneBlockManager = null;
	
	this.labelHeight = 12;
	this.separatorBetweenQueue = 4;
	this.labelSize = 18;
	
	if (args != null){
		if (args.showExonLabel != null){
			this.showExonLabel = args.showExonLabel;
		}
		if (args.onMouseOverShitExonTranscriptLabel != null){
			this.onMouseOverShitExonTranscriptLabel = args.onMouseOverShitExonTranscriptLabel;
		}
		
		if (args.queueHeight != null){
			this.queueHeight = args.queueHeight;
		}
		if (args.labelSize != null){
			this.labelSize = args.labelSize;
		}
		if (args.labelHeight != null){
			this.labelHeight = args.labelHeight;
		}
		
		if (args.pixelSpaceBetweenBlocks != null){
			this.pixelSpaceBetweenBlocks = args.pixelSpaceBetweenBlocks;
		}
		
		if (args.showTranscripts != null){
			this.showTranscripts = args.showTranscripts;
		}
		
		if (args.labelsNearEye != null){
			this.labelsNearEye = args.labelsNearEye;
		}
		
		if (args.showDetailGeneLabel != null){
			this.showDetailGeneLabel = args.showDetailGeneLabel;
		}
	}
	
	this.queues = new Array();
	this.queues.push(new Array());
}



//MultiFeatureTrack.prototype._setTextAttributes =    FeatureTrack.prototype._setTextAttributes;
//MultiFeatureTrack.prototype._renderLabel =    FeatureTrack.prototype._renderLabel;
MultiFeatureTrack.prototype.getIdToPrint =    FeatureTrack.prototype.getIdToPrint;
MultiFeatureTrack.prototype.changeView =      FeatureTrack.prototype.changeView;
MultiFeatureTrack.prototype.init =            FeatureTrack.prototype.init;
MultiFeatureTrack.prototype.createSVGDom =    FeatureTrack.prototype.createSVGDom;
MultiFeatureTrack.prototype._getTopText =     FeatureTrack.prototype._getTopText;
MultiFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
MultiFeatureTrack.prototype.select = FeatureTrack.prototype.select;
//MultiFeatureTrack.prototype._searchSpace =    FeatureTrack.prototype._searchSpace;
MultiFeatureTrack.prototype.drawTitle =       FeatureTrack.prototype.drawTitle;
MultiFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
MultiFeatureTrack.prototype.mouseclick =      FeatureTrack.prototype.mouseclick;
MultiFeatureTrack.prototype.getById =         FeatureTrack.prototype.getById;
MultiFeatureTrack.prototype.draw =            FeatureTrack.prototype.draw;
MultiFeatureTrack.prototype.getFeatureColor = FeatureTrack.prototype.getFeatureColor;
MultiFeatureTrack.prototype._overlapBlocks =  FeatureTrack.prototype._overlapBlocks;
MultiFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
MultiFeatureTrack.prototype.mouseUp =      	  FeatureTrack.prototype.mouseUp;
MultiFeatureTrack.prototype.mouseClick =      FeatureTrack.prototype.mouseClick;
MultiFeatureTrack.prototype.mouseDown =       FeatureTrack.prototype.mouseDown;
MultiFeatureTrack.prototype._addFeatures =    FeatureTrack.prototype._addFeatures;
MultiFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
MultiFeatureTrack.prototype._getViewBoxCoordenates 	=       FeatureTrack.prototype._getViewBoxCoordenates;
MultiFeatureTrack.prototype._getFeatureWidth 	=       FeatureTrack.prototype._getFeatureWidth;
MultiFeatureTrack.prototype.drawBackground  =          FeatureTrack.prototype.drawBackground;
MultiFeatureTrack.prototype.moveTitle 	=       FeatureTrack.prototype.moveTitle;
//MultiFeatureTrack.prototype._updateTop 	=       FeatureTrack.prototype._updateTop;
//MultiFeatureTrack.prototype._setAttributes 	=       FeatureTrack.prototype._setAttributes;


MultiFeatureTrack.prototype._renderLabel = function(start, top, label, attributes, formatter){
	return SVG.drawText(start , top , label, this.labelNodeGroup, attributes);
};

MultiFeatureTrack.prototype._setTextAttributes = function(feature) {
	var attributes = [["fill", "black"],["id", this.id+"_" + feature.id],["cursor", "pointer"], ["font-size", this.labelSize]];
	
	if ((feature instanceof TranscriptFeatureFormatter)&& this.showExonLabel){
		attributes.push(["opacity", 0]);
	}
	
	if ((feature instanceof ExonFeatureFormatter)&& this.onMouseOverShitExonTranscriptLabel){
		attributes.push(["opacity", 0]);
	}
	
	if ((feature instanceof ExonFeatureFormatter)&& !this.showExonLabell){
		attributes.push(["opacity", 0]);
	}
	return attributes;
};

MultiFeatureTrack.prototype.drawLabelAtPosition = function(genomicPositionX, features){
	var keys = new Array();
	var hide = new Array();
	for ( var i = 0; i < features.length; i++) {
		if (features[i+1]!= null){
			if (features[i+1] instanceof ExonFeatureFormatter){
				hide.push(features[i].getId());
				continue;
			}
		}
		keys.push(features[i].getId());
	}
	
	for ( var i = 0; i < this.labelNodeGroup.childElementCount; i++) {
		this.labelNodeGroup.childNodes[i].setAttribute("opacity", 0);
		for ( var j = 0; j < keys.length; j++) {
			if (keys[j].indexOf(this.labelNodeGroup.childNodes[i].getAttribute("id").replace(this.id +"_", "")) != -1){
				this.labelNodeGroup.childNodes[i].setAttribute("x", this._convertGenomePositionToPixelPosition(genomicPositionX));
				this.labelNodeGroup.childNodes[i].setAttribute("opacity", 1);
				continue;
			}
		
		}
		
		for ( var j = 0; j < hide.length; j++) {
			if (hide[j].indexOf(this.labelNodeGroup.childNodes[i].getAttribute("id").replace(this.id +"_", "")) != -1){
				this.labelNodeGroup.childNodes[i].setAttribute("opacity", 0);
				continue;
			}
		}
	}
};


MultiFeatureTrack.prototype._updateTop = function(){
	var height = this.height;
	
	if (this.avoidOverlapping) {
		var originalHeight = this.height;
		if (this.label){
			height = ((this.featureHeight + this.labelHeight + this.separatorBetweenQueue) * this.queues.length);
		}
		else{
			height = ((this.featureHeight)*this.queues.length);
		}
	}
	
	
	if (this.maxHeight < height){
		this.maxHeight = height;
		this.onMaximumHeightChanged.notify();
	}
	if(this.backgroundNode != null){
		this.backgroundNode.setAttribute("height", this.maxHeight);
	}
	this.height = this.maxHeight;
};

MultiFeatureTrack.prototype.appendFeatures = function(data){
	var features = data.toJSON();
	this.drawFeatures(features);
};

MultiFeatureTrack.prototype.clear = function(){
	if(this.mainNodeGroup != null){
		 while (this.mainNodeGroup.childNodes.length>0){
			 	this.mainNodeGroup.removeChild(this.mainNodeGroup.childNodes[0]);
		 }
	}
	this.featuresID = new Object();
	this.maxHeight = this.originalHeight;
};


MultiFeatureTrack.prototype._addFeatures = function(data){
	if (this.geneBlockManager == null){
		this.geneBlockManager = new GeneBlockManager();
	}
	
	if ((data.toJSON().lenth != 0) && !(data.toJSON()[0]) instanceof GeneFeatureFormatter){
		var formatters = this.geneBlockManager.toDatasetFormatter(data.toJSON());
		this.features = formatters;
		this.featuresIndex = new Object();
	}
	else{
		this.features = data.toJSON();
		this.featuresIndex = new Object();
		
	}
};

MultiFeatureTrack.prototype._setAttributes = function(feature, filled){
	var attributes = [["id", this.id+"_" + feature.name], ["style", "cursor:pointer"]];
	attributes.push(["fill-opacity", feature.getDefault().getOpacity()]);
	attributes.push(["stroke", feature.getDefault().getStroke()]);
	attributes.push(["stroke-width", feature.getDefault().getStrokeWidth()]);
	attributes.push(["stroke-opacity", feature.getDefault().getStrokeOpacity()]);
	
	if (filled != null){
		if(!filled){
			attributes.push( [ "fill", "white" ]);
		}
	}
	else{
		if (this.forceColor == null) {
			attributes.push( [ "fill", feature.getDefault().getFill() ]);
		} else {
			attributes.push( [ "fill", this.forceColor ]);
		}
	}
	
	return attributes;
};


//MultiFeatureTrack.prototype._setTextAttributes = function(feature){
//	var attributes = [["fill", "black"],["id", this.id+"_" + feature.start],["cursor", "pointer"], ["font-size", this.labelSize]];
//	return attributes;
//};



/** True si dos bloques se solapan */
//MultiFeatureTrack.prototype._overlapBlocks = function(block1, block2){
//	var spaceBlock = this.pixelSpaceBetweenBlocks / this.pixelRatio;
//	
//	if ((block1.start  < block2.end + spaceBlock) && (block1.end  + spaceBlock > block2.start)){
//		return true;
//	}
//	return false;
//};

/** Busca disponibilidad de espacio y devuelve el indice del layer donde debe insertarse */
MultiFeatureTrack.prototype._searchSpace = function(block1, minQueue){
	for (var i = minQueue; i < this.queues.length; i++ ){
		var overlapping = new Array();
		for (var j = 0; j < this.queues[i].length; j++ ){
			var block2 = this.queues[i][j];
			overlapping.push((this._overlapBlocks(block1, block2)));	
			overlapping.push((this._overlapBlocks(block2, block1)));	
		}
	
		/** no se solapa con ningun elemento entonces devuelvo la capa */ 
		if (overlapping.valueOf(overlapping).indexOf(true)==-1){
			return i;
		}
	}
	/** no me cabe en ninguna capa entonces creo una nueva */
	this.queues.push(new Array());
	/** no hemos encontrado ningun espacio en ninguna cola anterior */
	return this.queues.length - 1;
};

MultiFeatureTrack.prototype.isFeatureDuplicated = function(feature){
	return (this.featuresID[feature.id] != null);
};


MultiFeatureTrack.prototype._render = function() {
	this.init();
	if (this.isAvalaible){
		if (this.features != null){
			this.drawFeatures(this.features);
		}
	}
	this.queues = new Array();
	this.queues.push(new Array());
};

MultiFeatureTrack.prototype.drawFeatures = function(features){
	if (features.length > 0){
		if ((features[0] instanceof GeneFeatureFormatter)==false){
				var geneBlockManager = new GeneBlockManager();
				var formatters = geneBlockManager.toDatasetFormatter(features);
				features = formatters;
		}
	}


	for (var i = 0; i < features.length;  i++){
		var feature = features[i];
		if (!this.allowDuplicates){
			if (this.isFeatureDuplicated(features[i])){
				continue;
			}
			else{
				this.featuresID[features[i].id] = true;
			}
		}
		
		if (feature instanceof GeneFeatureFormatter){
			var geneQueueToDraw = this._searchSpace(feature, 0); 
			
			/** Insertamos en la cola para marcar el espacio reservado */
			this.queues[geneQueueToDraw].push(feature);
			this.drawFeaturesInQueue(feature, geneQueueToDraw);
			
			if (feature.transcript != null){
				var nTrancsripts = feature.transcript.length;
				if (this.showTranscripts){
					for ( var t = 0; t < feature.transcript.length; t++) {
						var transcript =  feature.transcript[t];
						var queueToDraw = this._searchSpace(transcript, Math.ceil(geneQueueToDraw) + 1); 
						
						/** Insertamos en la cola para marcar el espacio reservado */
						this.queues[queueToDraw].push(transcript);
						this.drawFeaturesInQueue(transcript, queueToDraw);
						for ( var j = 0; j < transcript.exon.length; j++) {
							this.drawFeaturesInQueue(transcript.exon[j], queueToDraw, transcript);
						}
					}
				}
			}
		}
	}
	
	this._updateTop();
};


/** Si es un exon le pasamos el transcript para determinar las zonas de coding protein **/
MultiFeatureTrack.prototype.drawFeaturesInQueue = function(feature, queueToDraw, transcript){
	var featureWidth = ((feature.end ) - feature.start + 1) * this.pixelRatio;
	var startPoint = (feature.start - 1) * this.pixelRatio;
	var top = this.top + (queueToDraw * this.featureHeight);
	
	if (this.label){
		   top = this.top + (queueToDraw * (this.featureHeight + this.labelHeight + this.separatorBetweenQueue));
	}
	
	if (transcript == null){
		this._drawFeature((startPoint % this.viewBoxModule), top,  Math.ceil(featureWidth), this._setAttributes(feature), feature);
	}
	else{

		var start = (startPoint % this.viewBoxModule);
		var FILL = this._setAttributes(feature);
		var NOFILL = this._setAttributes(feature, false);
		
		/** Rellenamos todo el exon porque todo el exon esta dentro de la zona coding**/
		if ((transcript.feature.codingRegionStart <= feature.start)&&(transcript.feature.codingRegionEnd >= feature.end)){
			this._drawFeature(start, top,  Math.ceil(featureWidth),  FILL, feature);
			return;
		}
		
		/** Se deja en blanco por que esta fuera del rango**/
		if ((feature.start >= transcript.feature.codingRegionEnd)||(feature.end <= transcript.feature.codingRegionStart)){
			this._drawFeature(start, top,  Math.ceil(featureWidth),  NOFILL, feature);
			return;
		}
		
		var pixelCodingRegionStart = this._convertGenomePositionToPixelPosition(transcript.feature.codingRegionStart);
		var pixelCodingRegionEnd = this._convertGenomePositionToPixelPosition(transcript.feature.codingRegionEnd) ;
		
		var pixelFeatureStart =  this._convertGenomePositionToPixelPosition(feature.start);
		var pixelFeatureEnd =  this._convertGenomePositionToPixelPosition(feature.end + 1);
		
		
		/** Parcialmente rellena**/
		if ((feature.start <= transcript.feature.codingRegionStart)&&(feature.end <= transcript.feature.codingRegionEnd)){
			this._drawFeature(pixelFeatureStart, top, pixelCodingRegionStart - start,  NOFILL, feature);
			this._drawFeature(pixelCodingRegionStart, top, pixelFeatureEnd - pixelCodingRegionStart,  FILL, feature);
			return;
		}
		
		/** Parcialmente rellena**/
		if ((feature.start >= transcript.feature.codingRegionStart)&&(feature.end >= transcript.feature.codingRegionEnd)){
			this._drawFeature(pixelCodingRegionEnd, top, pixelFeatureEnd - pixelCodingRegionEnd,  NOFILL, feature);
			this._drawFeature(pixelFeatureStart, top,  pixelCodingRegionEnd - pixelFeatureStart,  FILL, feature);
			return;
		}
		
		/** Todo el coding protein esta dentro del exon**/
		if ((feature.start <= transcript.feature.codingRegionStart)&&(feature.end >= transcript.feature.codingRegionEnd)){
			this._drawFeature(pixelFeatureStart, top, pixelCodingRegionStart - pixelFeatureStart,  NOFILL, feature);
			this._drawFeature(pixelCodingRegionEnd, top, pixelFeatureEnd - pixelCodingRegionEnd,  NOFILL, feature);
			this._drawFeature(pixelCodingRegionStart, top, pixelCodingRegionEnd - pixelCodingRegionStart,  FILL, feature);
			return;
			
		}
		
	}
};


MultiFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
	var _this = this;
	
	var nodeSVG;
	
	if (feature instanceof TranscriptFeatureFormatter){
		SVG.drawLine(startPoint, top + (this.featureHeight/2), startPoint + Math.ceil(featureWidth), top + (this.featureHeight/2), this.trackNodeGroup, this._setAttributes(feature));
	}
	else{
		nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), Math.ceil(top), featureWidth, this.featureHeight, this.trackNodeGroup, attributes);
		nodeSVG.addEventListener("mouseover", function(ev){_this._featureOver(feature, this, ev);}, true);
		nodeSVG.addEventListener("mouseout", function(ev){_this._featureOut(feature, this, ev);}, true);
		nodeSVG.addEventListener("click", function(ev){ _this.clickOn(feature, this, ev);}, true);
	}
	
	if (this.label){
		var label = this.getLabel(feature);
		if (label != null){
			var textSVG = this._renderLabel(Math.ceil(startPoint) ,  Math.ceil(top) + (this.featureHeight + this.labelHeight) , label, this._setTextAttributes(feature));
			textSVG.addEventListener("mouseover", function(ev){_this._featureOver(feature, this, ev);}, true);
			textSVG.addEventListener("mouseout", function(ev){_this._featureOut(feature, this, ev);}, true);
			textSVG.addEventListener("click", function(ev){  _this.clickOn(feature, this, ev); }, true);
		}
	}
};

MultiFeatureTrack.prototype.getLabel = function (feature){
	var label = feature.label;
	if(feature instanceof GeneFeatureFormatter){
		if (this.showDetailGeneLabel){
			return feature.getDetailLabel();
		}
	}
	
	if(feature instanceof ExonFeatureFormatter){
		if (this.showExonLabel){
			return feature.label;
		}
		else{
			return "";
		}
	}
	if(feature instanceof TranscriptFeatureFormatter){
			return feature.label;
	}
	return label;
};


MultiFeatureTrack.prototype.clickOn = function (feature){
	
	if (feature instanceof ExonFeatureFormatter){
		//TODO por ahora no es necesario ExonInfoWidget
	}
	
	if (feature instanceof TranscriptFeatureFormatter){
		new TranscriptInfoWidget(null,this.species).draw(feature);
	}
			
	if (feature instanceof GeneFeatureFormatter){
		new GeneInfoWidget(null,this.species).draw(feature);
	}
	
	this.onClick.notify(feature);
};


MultiFeatureTrack.prototype._featureOut = function(feature, node, ev){
	node.setAttribute("stroke-width", "0.5");
	node.setAttribute("opacity", this.lastOpacity);
//TODO done	Que desaparezca
	this.tooltippanel.destroy();
};

MultiFeatureTrack.prototype._featureOver = function(feature, node, ev){
//	console.log(ev);
	this.lastOpacity = node.getAttribute("opacity");
	node.setAttribute("stroke-width", "1");
	node.setAttribute("opacity", "0.6");
//TODO done
	this.tooltippanel = new TooltipPanel();
	this.tooltippanel.getPanel(feature).showAt(ev.clientX,ev.clientY);
};

function CytobandFeatureTrack (rulerID,targetID,  args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID,  args);
	
	this.opacity = null;
	this.forceColor = null;
	
	if (args != null){
		if (args.opacity != null){
			this.opacity = args.opacity;
		}
		
		if (args.forceColor != null){
			this.forceColor = args.forceColor;
		}
		
	}
	this.positions = new Object();
}

CytobandFeatureTrack.prototype._renderLabel =    FeatureTrack.prototype._renderLabel;
CytobandFeatureTrack.prototype.isFeatureDuplicated =    FeatureTrack.prototype.isFeatureDuplicated;
CytobandFeatureTrack.prototype.getIdToPrint =    FeatureTrack.prototype.getIdToPrint;
CytobandFeatureTrack.prototype.changeView =      FeatureTrack.prototype.changeView;
CytobandFeatureTrack.prototype.render =          FeatureTrack.prototype.render;
CytobandFeatureTrack.prototype.init =            FeatureTrack.prototype.init;
CytobandFeatureTrack.prototype.createSVGDom =    FeatureTrack.prototype.createSVGDom;
CytobandFeatureTrack.prototype._getTopText =     FeatureTrack.prototype._getTopText;
CytobandFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
CytobandFeatureTrack.prototype._searchSpace =    FeatureTrack.prototype._searchSpace;
CytobandFeatureTrack.prototype.drawTitle =       FeatureTrack.prototype.drawTitle;
CytobandFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
CytobandFeatureTrack.prototype.mouseclick =      FeatureTrack.prototype.mouseclick;
CytobandFeatureTrack.prototype.getById =         FeatureTrack.prototype.getById;
CytobandFeatureTrack.prototype.draw =            FeatureTrack.prototype.draw;
//CytobandFeatureTrack.prototype.getFeatureColor = FeatureTrack.prototype.getFeatureColor;
CytobandFeatureTrack.prototype.drawFeatures =    FeatureTrack.prototype.drawFeatures;
CytobandFeatureTrack.prototype._overlapBlocks =  FeatureTrack.prototype._overlapBlocks;
CytobandFeatureTrack.prototype._render =       FeatureTrack.prototype._render;
CytobandFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
CytobandFeatureTrack.prototype._getViewBoxCoordenates 	=       FeatureTrack.prototype._getViewBoxCoordenates;
CytobandFeatureTrack.prototype._getFeatureWidth 	=       FeatureTrack.prototype._getFeatureWidth;
CytobandFeatureTrack.prototype._updateTop 	=       FeatureTrack.prototype._updateTop;
CytobandFeatureTrack.prototype.clear 	=       FeatureTrack.prototype.clear;
CytobandFeatureTrack.prototype.drawBackground 	=       FeatureTrack.prototype.drawBackground;
CytobandFeatureTrack.prototype.moveTitle 	=       FeatureTrack.prototype.moveTitle;
CytobandFeatureTrack.prototype.moveY 	=       FeatureTrack.prototype.moveY;
CytobandFeatureTrack.prototype.drawFeaturesInQueue 	=       FeatureTrack.prototype.drawFeaturesInQueue;
CytobandFeatureTrack.prototype._setTextAttributes 	=       FeatureTrack.prototype._setTextAttributes;
CytobandFeatureTrack.prototype._setAttributes 	=       FeatureTrack.prototype._setAttributes;
CytobandFeatureTrack.prototype._drawFeature 	=       FeatureTrack.prototype._drawFeature;
CytobandFeatureTrack.prototype.appendFeatures 	=       FeatureTrack.prototype.appendFeatures;




CytobandFeatureTrack.prototype._addFeatures = function(data){
	/** features */
	this.features = data.toJSON();
	this.featuresIndex = new Object();
};





function RegionFeatureTrack (rulerID,targetID,  args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID,  args);
	
	this.opacity = null;
	this.forceColor = null;
	
	if (args != null){
		if (args.opacity != null){
			this.opacity = args.opacity;
		}
		
		if (args.forceColor != null){
			this.forceColor = args.forceColor;
		}
		
	}
	this.positions = new Object();
}



RegionFeatureTrack.prototype.getIdToPrint =    FeatureTrack.prototype.getIdToPrint;
RegionFeatureTrack.prototype.changeView =      FeatureTrack.prototype.changeView;
RegionFeatureTrack.prototype.render =          FeatureTrack.prototype.render;
RegionFeatureTrack.prototype.init =            FeatureTrack.prototype.init;
RegionFeatureTrack.prototype.createSVGDom =    FeatureTrack.prototype.createSVGDom;
RegionFeatureTrack.prototype._getTopText =     FeatureTrack.prototype._getTopText;
RegionFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
RegionFeatureTrack.prototype._searchSpace =    FeatureTrack.prototype._searchSpace;
RegionFeatureTrack.prototype.drawTitle =       FeatureTrack.prototype.drawTitle;
RegionFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
RegionFeatureTrack.prototype.mouseclick =      FeatureTrack.prototype.mouseclick;
RegionFeatureTrack.prototype.getById =         FeatureTrack.prototype.getById;
RegionFeatureTrack.prototype.draw =            FeatureTrack.prototype.draw;
RegionFeatureTrack.prototype.getFeatureColor = FeatureTrack.prototype.getFeatureColor;
RegionFeatureTrack.prototype.drawFeatures =    FeatureTrack.prototype.drawFeatures;
RegionFeatureTrack.prototype._overlapBlocks =  FeatureTrack.prototype._overlapBlocks;
RegionFeatureTrack.prototype._render =       FeatureTrack.prototype._render;
RegionFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
RegionFeatureTrack.prototype._getViewBoxCoordenates 	=       FeatureTrack.prototype._getViewBoxCoordenates;
RegionFeatureTrack.prototype._getFeatureWidth 	=       FeatureTrack.prototype._getFeatureWidth;
//RegionFeatureTrack.prototype._updateTop 	=       FeatureTrack.prototype._updateTop;
RegionFeatureTrack.prototype.clear 	=       FeatureTrack.prototype.clear;
RegionFeatureTrack.prototype.drawBackground 	=       FeatureTrack.prototype.drawBackground;
RegionFeatureTrack.prototype.moveTitle 	=       FeatureTrack.prototype.moveTitle;
RegionFeatureTrack.prototype.moveY 	=       FeatureTrack.prototype.moveY;



RegionFeatureTrack.prototype.appendFeatures  = function(data){
	var features = data.toJSON();
	this.drawFeatures(features);
};


RegionFeatureTrack.prototype._addFeatures = function(data){
	/** features */
	this.features = data.toJSON();
	this.featuresIndex = new Object();
};

RegionFeatureTrack.prototype._updateTop = function(){
	
	var height = this.height;
	if (this.avoidOverlapping) {
		var originalHeight = this.height;
//		for ( var i = 0; i < this.queues.length; i++) {
//			height = height + this.queueHeight;
//		}
		height = this.featureHeight + (12 * this.queues.length);
	}
	
	if (this.maxHeight < height){
		this.maxHeight = height;
	}
	
	this.height = this.maxHeight;
	
	if(this.backgroundNode != null){
		this.backgroundNode.setAttribute("height", this.maxHeight);
	}
};

RegionFeatureTrack.prototype._setAttributes = function(feature){
	var attributes = [["id", this.id + "_" + feature.start + "_" + feature.id], ["font-size", feature.getDefault().args.fontSize]];
	
	attributes.push(["fill", "red"]);
	attributes.push(["opacity", "0.6"]);
	attributes.push(["stroke", "black"]);
	attributes.push(["stroke-width", "1"]);
	return attributes;
};

RegionFeatureTrack.prototype._setTextAttributes = function(feature){
	var color = this.getFeatureColor(feature);
	var attributes = [["fill", "black"],["id", this.id+"_" + feature.start], ["cursor", "pointer"],["font-size", feature.getDefault().args.fontSize]];
	return attributes;
};


RegionFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
//	if (this.positions[Math.ceil(startPoint)] != null){
//		console.log("Repedito " + feature.id );
//		return;
//	}
	
	this.positions[Math.ceil(startPoint)] = true;
	var nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), top, Math.abs(featureWidth) , Math.abs(this.featureHeight) , this.trackNodeGroup, attributes);
	if(this.label){
		var textSVG = SVG.drawText(Math.ceil(startPoint), (Math.ceil(top) + 2*this.featureHeight)-2 , feature.label, this.trackNodeGroup, this._setTextAttributes(feature));
		var _this = this;
		textSVG.addEventListener("click", function(){ _this.onClick.notify(feature);}, true);
	}
};



HistogramFeatureTrack.prototype.getIdToPrint =    FeatureTrack.prototype.getIdToPrint;
HistogramFeatureTrack.prototype.changeView =      FeatureTrack.prototype.changeView;
HistogramFeatureTrack.prototype.render =          FeatureTrack.prototype.render;
HistogramFeatureTrack.prototype.init =            FeatureTrack.prototype.init;
HistogramFeatureTrack.prototype.createSVGDom =    FeatureTrack.prototype.createSVGDom;
HistogramFeatureTrack.prototype._getTopText =     FeatureTrack.prototype._getTopText;
HistogramFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
HistogramFeatureTrack.prototype._searchSpace =    FeatureTrack.prototype._searchSpace;
HistogramFeatureTrack.prototype.drawTitle =       FeatureTrack.prototype.drawTitle;
HistogramFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
HistogramFeatureTrack.prototype.mouseclick =      FeatureTrack.prototype.mouseclick;
HistogramFeatureTrack.prototype.getById =         FeatureTrack.prototype.getById;
HistogramFeatureTrack.prototype.draw =            FeatureTrack.prototype.draw;
HistogramFeatureTrack.prototype.getFeatureColor = FeatureTrack.prototype.getFeatureColor;
HistogramFeatureTrack.prototype.drawFeatures =    FeatureTrack.prototype.drawFeatures;
HistogramFeatureTrack.prototype._overlapBlocks =  FeatureTrack.prototype._overlapBlocks;
HistogramFeatureTrack.prototype._render =       								FeatureTrack.prototype._render;
HistogramFeatureTrack.prototype._convertGenomePositionToPixelPosition = 		FeatureTrack.prototype._convertGenomePositionToPixelPosition;
HistogramFeatureTrack.prototype._getViewBoxCoordenates 	=       			FeatureTrack.prototype._getViewBoxCoordenates;
HistogramFeatureTrack.prototype._getFeatureWidth 	=       					FeatureTrack.prototype._getFeatureWidth;
HistogramFeatureTrack.prototype.clear 			=       					FeatureTrack.prototype.clear;
HistogramFeatureTrack.prototype.drawBackground  =          					FeatureTrack.prototype.drawBackground;
HistogramFeatureTrack.prototype.moveTitle 	=       FeatureTrack.prototype.moveTitle;
HistogramFeatureTrack.prototype.isFeatureDuplicated =    FeatureTrack.prototype.isFeatureDuplicated;
HistogramFeatureTrack.prototype.drawFeaturesInQueue 	=       FeatureTrack.prototype.drawFeaturesInQueue;


function HistogramFeatureTrack (rulerID,targetID, species, args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID, species, args);
	
	this.opacity = null;
	this.forceColor = null;
	this.intervalSize = 2000000;
	if (args != null){
		if (args.opacity != null){
			this.opacity = args.opacity;
		}
		
		if (args.forceColor != null){
			this.forceColor = args.forceColor;
		}
		
		if (args.intervalSize != null){
			this.intervalSize = args.intervalSize;
		}
		
	}
	this.positions = new Object();
	this.allowDuplicates = true;
//	this.counter = 0;
}

HistogramFeatureTrack.prototype.getFeaturesInterval  = function(features){
	var boxesFeatures = new Array();
	var size =this.intervalSize;
	
	if (features.length > 0){
		var start = features[0].start;
		var end = features[features.length -1].end;
		var position = start;
		
		while(position < end){
			boxesFeatures.push({start: position, end:position + size, value:0});
			position = position + size;
		}
		
		var boxIndex = 0;
		var max = 0;
		for ( var i = 0; i < features.length; i++) {
			for ( var j = boxIndex; j < boxesFeatures.length; j++) {
				if ((boxesFeatures[j].start < features[i].end)&&((boxesFeatures[j].end > features[i].start))){
					boxesFeatures[j].value = boxesFeatures[j].value + 1;
					if (boxesFeatures[j].value > max){
						max = boxesFeatures[j].value;
					}
					boxIndex = j;
				}
			}
		}
	}

	for ( var i = 0; i < boxesFeatures.length; i++) {
		boxesFeatures[i].value = boxesFeatures[i].value/max;
	}
	
	return boxesFeatures;
};


HistogramFeatureTrack.prototype.appendFeatures  = function(data){
//	var features = data.toJSON().sort(this.sort);
//	this.drawFeatures(this.getFeaturesInterval(features));
	
	var features = data.toJSON();
	this.drawFeatures(features);
};

HistogramFeatureTrack.prototype.sort = function(a, b){
	return a.start - b.start;
};

HistogramFeatureTrack.prototype._addFeatures = function(data){
//	this.features = data.toJSON().sort(this.sort);
//	this.features = this.getFeaturesInterval(this.features);
	this.featuresIndex = new Object();
	this.features = data.toJSON();
};

HistogramFeatureTrack.prototype._updateTop = function(){
	if (this.avoidOverlapping) {
		var originalHeight = this.height;
		for ( var i = 0; i < this.queues.length; i++) {
			this.height = this.height + this.featureHeight;
		}
	}
};

HistogramFeatureTrack.prototype._setAttributes = function(feature){
	var attributes = [["id", this.id + "_" + feature.start + "_" + feature.id]];
	if (this.forceColor != null){
		attributes.push(["fill", this.forceColor]);
	}
	else{
		attributes.push(["fill", "red"]);
	}
	return attributes;
};


HistogramFeatureTrack.prototype._setTextAttributes = function(feature){
	var attributes = [["fill", "black"],["id", this.id+"_" + feature.start], ["cursor", "pointer"]];
	return attributes;
};


HistogramFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
	var _this = this;
	if (featureWidth < 0){featureWidth = 2;}
	this.positions[Math.ceil(startPoint)] = true;
	
	var nodeSVG;
	if (feature.value == null){
		nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), top + (this.featureHeight - ( feature.value*Math.abs(this.featureHeight))), featureWidth , feature.value*Math.abs(this.featureHeight) , this.trackNodeGroup, attributes);
	}
	else{
		nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), top + (this.featureHeight - ( feature.value*Math.abs(this.featureHeight))), featureWidth , feature.value*Math.abs(this.featureHeight) , this.trackNodeGroup, attributes);
	}
	
	if (this.label){
		var textSVG = SVG.drawText(Math.ceil(startPoint) + 12, Math.ceil(top) + this.featureHeight , feature.label, this.labelNodeGroup, this._setTextAttributes(feature));
		textSVG.addEventListener("click", function(){ _this.onClick.notify(feature);}, true);
	}
	
};



VCFFeatureTrack.prototype.getIdToPrint = FeatureTrack.prototype.getIdToPrint;
VCFFeatureTrack.prototype.changeView = FeatureTrack.prototype.changeView;
VCFFeatureTrack.prototype.render = FeatureTrack.prototype.render;
VCFFeatureTrack.prototype.init = FeatureTrack.prototype.init;
VCFFeatureTrack.prototype.createSVGDom = FeatureTrack.prototype.createSVGDom;
VCFFeatureTrack.prototype._getTopText = FeatureTrack.prototype._getTopText;
VCFFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
VCFFeatureTrack.prototype._searchSpace = FeatureTrack.prototype._searchSpace;
VCFFeatureTrack.prototype.drawTitle = FeatureTrack.prototype.drawTitle;
VCFFeatureTrack.prototype.mouseMove = FeatureTrack.prototype.mouseMove;
VCFFeatureTrack.prototype.mouseclick = FeatureTrack.prototype.mouseclick;
VCFFeatureTrack.prototype.getById = FeatureTrack.prototype.getById;
VCFFeatureTrack.prototype.draw = FeatureTrack.prototype.draw;
VCFFeatureTrack.prototype.getFeatureColor = FeatureTrack.prototype.getFeatureColor;
VCFFeatureTrack.prototype.drawFeatures = FeatureTrack.prototype.drawFeatures;
VCFFeatureTrack.prototype._overlapBlocks = FeatureTrack.prototype._overlapBlocks;
VCFFeatureTrack.prototype._render = FeatureTrack.prototype._render;
VCFFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
VCFFeatureTrack.prototype._getViewBoxCoordenates = FeatureTrack.prototype._getViewBoxCoordenates;
VCFFeatureTrack.prototype._getFeatureWidth = FeatureTrack.prototype._getFeatureWidth;
VCFFeatureTrack.prototype.clear = FeatureTrack.prototype.clear;
VCFFeatureTrack.prototype.drawBackground = FeatureTrack.prototype.drawBackground;
VCFFeatureTrack.prototype.moveTitle = FeatureTrack.prototype.moveTitle;
VCFFeatureTrack.prototype._setAttributes = FeatureTrack.prototype._setAttributes;
VCFFeatureTrack.prototype._setTextAttributes = FeatureTrack.prototype._setTextAttributes;
VCFFeatureTrack.prototype._updateTop = FeatureTrack.prototype._updateTop;
//VCFFeatureTrack.prototype._drawFeature = FeatureTrack.prototype._drawFeature;
VCFFeatureTrack.prototype.drawFeaturesInQueue = FeatureTrack.prototype.drawFeaturesInQueue;
VCFFeatureTrack.prototype._renderLabel = FeatureTrack.prototype._renderLabel;

function VCFFeatureTrack(rulerID, targetID, args) {
	FeatureTrack.prototype.constructor.call(this, rulerID, targetID, args);


	/*if (args != null) {
	}*/
	
	this.positions = new Object();
	this.counter = 0;
	
	console.log(this.featureHeight);
}

VCFFeatureTrack.prototype.appendFeatures = function(data) {
	var features = data.toJSON();
	this.drawFeatures(features);
};

VCFFeatureTrack.prototype._addFeatures = function(data) {
	this.features = data.toJSON();
	this.featuresIndex = new Object();
};


VCFFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
	var _this = this;
	if (featureWidth <= 1) {
		featureWidth = 2;
	}
	this.positions[Math.ceil(startPoint)] = true;
	var nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), top , featureWidth, this.featureHeight, this.trackNodeGroup, attributes);
	
	
	if (feature.base != null){
		var snpLength = feature.base.length;
		var snpSize = featureWidth/snpLength;
		for ( var i = 0; i < snpLength; i++) {
			SVG.drawText((i*snpSize) + startPoint + 2 , Math.ceil(top) + 8, feature.base[i], this.labelNodeGroup, [["font-size", "8"],["fill", "#ffffff"]]);
		}
	}
	
	if (this.label) {
		this._renderLabel(Math.ceil(startPoint) ,  Math.ceil(top) + (this.featureHeight + this.labelHeight) , feature.label, this._setTextAttributes(feature), feature);
	}
};
ChromosomeFeatureTrack.prototype.createSVGDom =       FeatureTrack.prototype.createSVGDom;
ChromosomeFeatureTrack.prototype.init =      		   FeatureTrack.prototype.init;
ChromosomeFeatureTrack.prototype.draw =      		   FeatureTrack.prototype.draw;
ChromosomeFeatureTrack.prototype._render =      	   FeatureTrack.prototype._render;
ChromosomeFeatureTrack.prototype.getById =      	   FeatureTrack.prototype.getById;
//ChromosomeFeatureTrack.prototype.mouseMove =          FeatureTrack.prototype.mouseMove;
//ChromosomeFeatureTrack.prototype.mouseUp =      	   FeatureTrack.prototype.mouseUp;
//ChromosomeFeatureTrack.prototype.mouseClick =         FeatureTrack.prototype.mouseClick;
//ChromosomeFeatureTrack.prototype.mouseDown =          FeatureTrack.prototype.mouseDown;
ChromosomeFeatureTrack.prototype._getViewBoxCoordenates =          FeatureTrack.prototype._getViewBoxCoordenates;
ChromosomeFeatureTrack.prototype._getSVGCoordenates 		=       FeatureTrack.prototype._getSVGCoordenates;
ChromosomeFeatureTrack.prototype.drawBackground =          FeatureTrack.prototype.drawBackground;

// JavaScript Document
function ChromosomeFeatureTrack (trackerID, targetID, species, args) {
	FeatureTrack.prototype.constructor.call(this, trackerID, targetID, species, args);

	//To optional
	this.selectcolor = "#33FF33";
	this.markcolor = "#FF3333";
	this.radio = 3;
	
	this.markers = new Object();
	this.start = 1;
	
	
	//Optional parameters
	this.labelChromosome = false;
	this.vertical = false;
	this.rounded = 7;
	this.label = false;
	//this.backgroundcolor= "white";
		
	this.maxFeatureEnd = 1;
	
	//Processing optional parameters
	if (args!=null){
		if (args.label!=null){
			this.label = args.label;
		}
		if (args.labelChromosome!=null){
			this.labelChromosome = args.labelChromosome;	
		}
		
		if (args.vertical!=null){
			this.vertical = args.vertical;	
		}
		
		if (args.rounded!=null){
			this.rounded = args.rounded;	
		}
		
		if (args.bottom!=null){
			this.bottom = args.bottom;	
		}
	}
	
	this.onMarkerClicked = new Event(this);
	
	/** Selector moving **/
	this.selector = new Object();
	this.selector.selectorIsMoving = false;
	this.selector.selectorSVG = null;
	this.selector.selectorBorder = null;
	this.selector.start = null;
	this.selector.end = null;
	this.selector.mouseOffsetX = null;

};

ChromosomeFeatureTrack.prototype.getCentromeros = function(){
	var centromeros = new Array();
	for (var i = 0; i < this.features.length;  i++){
		if (this.features[i].stain == "acen"){
			centromeros.push(this.features[i]);
		}
	}
	return centromeros;
}; 

ChromosomeFeatureTrack.prototype.getEnd = function(features) {
	var end = 0;
	for (var i = 0; i < features.length;  i++){
		if (features[i].end>end){
			end = features[i].end;
		}
	}
	return end;
};

ChromosomeFeatureTrack.prototype.getColorByStain = function(feature) {
	if (feature.stain == ('gneg')){
		return "white";
	}
	if (feature.stain == ('stalk')){
		return "#666666";
	}
	if (feature.stain == ('gvar')){
		return "#CCCCCC";
	}
	
	if (feature.stain.indexOf('gpos') != -1){
		var value = feature.stain.replace("gpos", "");
		
		if (value == 25){
			return "silver";
		}
		if (value == 50){
			return "gray";
		}
		if (value == 75){
			return "darkgray";
		}
		if (value == 100){
			return "black";
		}
	}
	
	if (feature.stain=="acen"){
		return "blue";
	}
	return "purple";
};

ChromosomeFeatureTrack.prototype.getPixelScale = function(){
	var pixelInc;
	if (this.vertical){
		pixelInc = (this.bottom - this.top)/(this.end - this.start);
	}
	else{
		pixelInc = (this.right - this.left)/(this.end - this.start);
	}
	return pixelInc;
};


ChromosomeFeatureTrack.prototype.setBackgroundColor = function(color) {
	this.backgroundSVGNode.setAttribute("fill", color);
	if (color=="white"){
		this.backgroundSVGNode.setAttribute("stroke", "white");
	}
	else{
		
		this.backgroundSVGNode.setAttribute("stroke", "black");
	}
};


ChromosomeFeatureTrack.prototype.unmark = function() {
	for ( var id in this.markers) {
		 this.trackNodeGroup.removeChild(DOM.select(id));
	}
	this.markers = new Object();
};

ChromosomeFeatureTrack.prototype.getMarkIDFromFeature = function(feature) {
	var id = feature.chromosome + "_" + feature.start + "_" + feature.end;
	this.markers[id] = feature;
	return id;
};


ChromosomeFeatureTrack.prototype.mark = function(feature, color) {
	var _this = this;
	
	var pixelInc = this.getPixelScale();
	var start = feature.start;
	var end = feature.end;
	var width = (end - start)*pixelInc;
	
	
	if (start == end){
		width = 1;
	}
	
	var markerColor = this.markcolor;
	
	if (color != null){
		 this.markcolor = color;
	}
	
	if (this.vertical){
		var top = this.top + start*pixelInc;
		var height = (end - start)*pixelInc ;
		var attributes = [["stroke", "black"],["stroke-width", "1"],["id", this.getMarkIDFromFeature(feature)], ["fill", this.markcolor], ["opacity", "1"],["cursor", "pointer"]];
		
		var node = SVG.drawPoligon([[this.right + 6, top - 3] , [this.right, top],  [this.right + 6, top + 3]], this.trackNodeGroup, attributes);
		
		node.addEventListener("click", function(evt){ 
			
//			if (_this.vertical){
				_this.onMarkerClicked.notify(_this.markers[node.id]);
//			}
//			else{
//				var point = _this._getSVGCoordenates(evt);
//				var genomicPosition = Math.ceil((point.x - _this.left)/ _this.pixelInc);
//				_this.click.notify(genomicPosition);
//			}
			
		
		}, true);
		
	}
	else{
		var left = this.left + start*pixelInc;
		var attributes = [["id", this.markers.length], ["fill", this.markcolor], ["opacity", "1"]];
		SVG.drawRectangle(left, this.top, width, (this.bottom - this.top) + this.radio + 5, this.trackNodeGroup, attributes);
		var attributes = [["id", id], ["fill", this.markcolor], ["opacity", "1"],["stroke", "black"]];
		SVG.drawCircle(left , (this.bottom) + this.radio + 5, this.radio, this.trackNodeGroup, attributes);
	}
};

ChromosomeFeatureTrack.prototype.getSelectorId = function() {
	return this.id + "_selector";
};
ChromosomeFeatureTrack.prototype.deselect = function() {
		var id = this.getSelectorId();
	
		if (DOM.select(id) != null){
			 this.trackNodeGroup.removeChild(this.selector.selectorSVG);
//			 this.trackNodeGroup.removeChild(this.selector.selectorBorder);
			 
		}
};

ChromosomeFeatureTrack.prototype.mouseMove = function(evt){
	if (this.selector.selectorIsMoving){
		if (this.selector.selectorSVG != null){
			var offsetX = this.getSVGCoordenates(evt).x - this.selector.mouseOffsetX;
			var pixelRatio = this.getPixelScale();
			var genomicMovement =  parseFloat(this.selector.start) + parseFloat(Math.ceil(offsetX/pixelRatio));
			var size = this.selector.end - this.selector.start;
			var end = genomicMovement + size;
			this.select(genomicMovement, end);
			this.selector.mouseOffsetX = this.getSVGCoordenates(evt).x;
		}
	}		
};

ChromosomeFeatureTrack.prototype.mouseDown = function(evt){
	this.selector.selectorIsMoving = true;
	this.selector.mouseOffsetX = this.getSVGCoordenates(evt).x;
	
	
};

ChromosomeFeatureTrack.prototype.mouseUp = function(evt){
	this.selector.selectorIsMoving = false;
	this.click.notify(this.selector.start + (this.selector.end - this.selector.start)/2);
};
	
ChromosomeFeatureTrack.prototype.select = function(start, end) {
	var _this = this;
	this.selector.id = this.getSelectorId(); 
	this.selector.start = start;
	this.selector.end = end;
	
	if (end > this.maxFeatureEnd){
		if ((this.maxFeatureEnd - start)*pixelInc > 0){
			end = this.maxFeatureEnd;
		}
	}
	
	this.deselect();
	
	if (this.trackNodeGroup != null){
		var pixelInc = this.getPixelScale();
		
		if (this.vertical){
			pixelInc = this.getPixelScale();
			var top =   Math.ceil(this.top + pixelInc * (start)); //this.top + start*pixelInc;
			var height = (end - start)*pixelInc ;
			var attributes = [["stroke", "black"],["stroke-width", "1"],["id", this.selector.id], ["cursor", "move"], ["fill", this.selectcolor], ["opacity", "1"]];
			this.selector.selectorSVG = SVG.drawPoligon([[0, top - 5] , [this.left, top],  [0, top + 5]], this.trackNodeGroup, attributes);
			
		}
		else{
			
			var left = this.left + start*pixelInc;
			var width = Math.ceil((end - start)*pixelInc);
			var attributes = [["stroke", "red"],["stroke-width", "1"],["id", this.selector.id], ["cursor", "move"], ["fill", this.selectcolor], ["fill-opacity", "0.1"]];
			this.selector.selectorSVG = SVG.drawRectangle(left, this.top + 6 , width, (this.bottom - this.top), this.trackNodeGroup, attributes);
			
//			this.selector.selectorBorder
			
//			this.selector.selectorSVG.addEventListener("click", function(evt){ }, true);
			
			this.selector.selectorSVG.addEventListener("mousemove", function(event) { _this.mouseMove(event, _this); }, false);
			this.selector.selectorSVG.addEventListener("mousedown", function(event) { _this.mouseDown(event, _this); }, false);
			this.selector.selectorSVG.addEventListener("mouseup", function(event) { _this.mouseUp(event, _this); }, false);
			
		}
	}
};

ChromosomeFeatureTrack.prototype.drawFeatures = function() {
	var _this = this;
	var centromeros = this.getCentromeros();
	
	this.pixelInc = this.getPixelScale();
	
	var endFirstCentromero = 0;
	
	if (centromeros.length != 0){
	  endFirstCentromero =  centromeros[0].end * this.pixelInc;
	  this.centromerosVisited = false;
	}
	else{
		this.centromerosVisited = true;
	}
	
	
	var attributesClip = [["stroke", "black"],["stroke-width", "1"],["id", "clip"], ["fill", "pink"], ["rx", this.rounded], ["ry",  this.rounded], ["z-index", "0"]];
	
	//Dibujamos la lineas del contenedor
	if (this.vertical){
		
		this.featureHeight = this.right - this.left - 1;
		
		var rectTop = endFirstCentromero + this.top ;
		var rectHeight = this.bottom - endFirstCentromero - this.top ;// this.bottom -  this.top ;// this.bottom -  this.top - border ;
		
		var rect = SVG.createRectangle( this.left, rectTop,  this.featureHeight, rectHeight, attributesClip);
		this.trackNodeGroup.appendChild(rect);
		
		
		rect = SVG.createRectangle(this.left, rectTop, this.featureHeight, rectHeight, attributesClip);
		this.trackNodeGroup.appendChild(rect);
		
		var clip = SVG.drawClip("clip_1"+this.id, rect, this.trackNodeGroup);
		this.groupNodeFirstCentromero = SVG.drawGroup(this.trackNodeGroup, [["id", "clip_group"], ["clip-path", "url(#clip_1" +this.id+")"]]);
		
		
		//Segundo Centromero
		var rectTop = this.top;
		var rectHeight =  endFirstCentromero;
		
		
		rect = SVG.createRectangle(this.left, rectTop + 1,  this.featureHeight, rectHeight, attributesClip);
		this.trackNodeGroup.appendChild(rect);
		
		
		rect = SVG.createRectangle(this.left, rectTop + 1, this.featureHeight, rectHeight, attributesClip);
		this.trackNodeGroup.appendChild(rect);
		
		clip = SVG.drawClip("clip_2"+this.id, rect, this.trackNodeGroup);
		groupNodeSecondCentromero = SVG.drawGroup(this.trackNodeGroup, [["id", "clip_group"], ["clip-path", "url(#clip_2" +this.id+")"]]);
	}
	else
	{
		
		this.featureHeight = Math.ceil(this.bottom - this.top);
		
		var rect = SVG.createRectangle(this.left , this.top + 6, endFirstCentromero,  this.featureHeight ,attributesClip);
		this.trackNodeGroup.appendChild(rect);
		
		rect = SVG.createRectangle( this.left , this.top + 6, endFirstCentromero,  this.featureHeight ,attributesClip);
		this.trackNodeGroup.appendChild(rect);
		
		var clip = SVG.drawClip("clip_1"+this.id, rect, this.trackNodeGroup);
		this.groupNodeFirstCentromero = SVG.drawGroup(this.trackNodeGroup, [["id", "clip_group"], ["clip-path", "url(#clip_1" +this.id+")"]]);
		
		
		//Segundo Centromero
		var rectLeft = Math.ceil(endFirstCentromero + this.left);// this.left + border;
		var rectWidth =  Math.ceil(this.right - endFirstCentromero - this.left - 2); //this.left + this.right - border;
		
		
		rect = SVG.createRectangle(rectLeft, this.top + 6,  rectWidth, this.featureHeight, attributesClip);
		this.trackNodeGroup.appendChild(rect);
		
		rect = SVG.createRectangle(rectLeft, this.top + 6, rectWidth, this.featureHeight, attributesClip);
		this.trackNodeGroup.appendChild(rect);
		
		clip = SVG.drawClip("clip_2"+this.id, rect, this.trackNodeGroup);
		groupNodeSecondCentromero = SVG.drawGroup(this.trackNodeGroup, [["id", "clip_group"], ["clip-path", "url(#clip_2" +this.id+")"]]);
		
	}
	
	
	for (var i = 0; i < this.features.length;  i++)
	{
		var feature = this.features[i];
		this._drawCytoband(feature);
		
		if (i == 0){
			if (this.label){
				var textAttr = [["id", this.id_ + "title"],["font-size", "9"]];
				if (this.vertical){
					SVG.drawText(this.left  , this.height, feature.chromosome, this.labelNodeGroup, textAttr);
				}
			}
		}
	}
};
	
ChromosomeFeatureTrack.prototype._drawCytoband = function (feature){
	var _this = this;
	var color = stroke = this.getColorByStain(feature);
	var node = null;
	var exonWidth = (this.pixelInc  * (feature.end - feature.start));
	
	var attributes = [["fill", color],["id", this.id+"_" + feature.cytoband] , ["z-index", "10"],["stroke", stroke], ["style", "cursor:pointer"]];

	if (this.maxFeatureEnd < feature.end){
		this.maxFeatureEnd = feature.end;
	}
	
	if (this.vertical){
		node = SVG.createRectangle( Math.ceil(this.left), Math.ceil(this.top + this.pixelInc  * (feature.start - this.start)) , Math.ceil(this.right-this.left) , Math.ceil(exonWidth) ,  attributes);
		if (!this.centromerosVisited){
			groupNodeSecondCentromero.appendChild(node);
		}
		else{
			this.groupNodeFirstCentromero.appendChild(node);
		}
	}
	else{
		node = SVG.createRectangle(Math.ceil(this.left + this.pixelInc  * (feature.start - this.start)), this.top , exonWidth , Math.ceil(this.featureHeight) + 6  ,attributes);
		if (!this.centromerosVisited){
			this.groupNodeFirstCentromero.appendChild(node);
		}
		else{
			groupNodeSecondCentromero.appendChild(node);
		}
		
		
		if (this.label){
			var textAttr = [["fill", "black"],["id", this.id_ + "title"] ,["opacity", "1"],["font-size", "7"]];
			var x = this.left + this.pixelInc  * ((feature.start + (feature.end - feature.start)/2) - this.start);
			var y = this.height + 10;
			textAttr.push(["transform", "translate("+ x +", " + y + "), rotate(270)"]);
			SVG.drawText(0, 0, feature.cytoband, this.labelNodeGroup, textAttr);
		}
	}

	node.addEventListener("click", function(evt){ 
		if (_this.vertical){
			_this.click.notify(feature);
		}
		else{
			var point = _this._getSVGCoordenates(evt);
			var genomicPosition = Math.ceil((point.x - _this.left)/ _this.pixelInc);
			_this.click.notify(genomicPosition);
		}
	}, true);
	
	if (feature.stain=="acen"){
		this.centromerosVisited = true;
	}
};

ChromosomeFeatureTrack.prototype.draw = function (data){
	/** features */
	this.features = data.toJSON()[0];
	this.featuresIndex = new Object();
	
	/** Features dibujadas, me guardo las coordenadas donde pinto algo, para por ejemplo los SNP, 
	 * no tener que repetir si estan en la misma region */
	this.printedFeature = new Object();
	
	if (this.features != null){
		for (var i = 0; i< this.features.length; i++){
			this.featuresIndex[this.features[i].id]= i;
		}
		this.end = this.getEnd(this.features);
	}
	this._render();
};


/** SVG COORDENATES **/
ChromosomeFeatureTrack.prototype.getSVGCoordenates = function(evt){
	var p = this._svg.createSVGPoint();
    p.x = evt.clientX;
    p.y = evt.clientY;
    
    var m = this._svg.getScreenCTM(document.documentElement);
    p = p.matrixTransform(m.inverse());
    return p;
};

function FeatureFormatter(id, defaultFormat, selectedFormat, overFormat, draggingFormat){
	this.id =  id;
	this.internalId =  Math.random();
	
	this.args = new Object();
	
	this.defaultFormat = new ItemFeatureFormat(defaultFormat);
	
	if(selectedFormat != null){
		this.selected = new ItemFeatureFormat(selectedFormat);
	}
	else{
		this.selected = new ItemFeatureFormat(defaultFormat);
	}
	
	if(overFormat != null){
		this.over = new ItemFeatureFormat(overFormat);
	}
	else{
		this.over = new ItemFeatureFormat(defaultFormat);
	}
	
	if(draggingFormat != null){
		this.dragging = new ItemFeatureFormat(draggingFormat);
	}
	else{
		this.dragging = new ItemFeatureFormat(defaultFormat);
	}
	
	//Events
	this.stateChanged  = new Event(this);

	
	//Attaching events
	var _this = this;
	this._setEvents();
};

FeatureFormatter.prototype.getType = function(){
	return this.args.type;
};


FeatureFormatter.prototype.toJSON = function(){
	var json = this.args;
	json.defaultFormat = this.getDefault().toJSON();
	json.over = this.getOver().toJSON();
	json.selected = this.getSelected().toJSON();
	json.dragging = this.getDragging().toJSON();
	json.id = this.id;
	return json;
};

FeatureFormatter.prototype.loadFromJSON = function(json){
	this.args = json;
	this.defaultFormat = new ItemFeatureFormat(json.defaultFormat);
	this.over = new ItemFeatureFormat(json.over);
	this.selected = new ItemFeatureFormat(json.selected);
	this.dragging = new ItemFeatureFormat(json.dragging);
	this._setEvents();
};

FeatureFormatter.prototype._setEvents = function(){
	//Attaching events
	var _this = this;
	
	this.defaultFormat.changed.addEventListener(function (sender, item){
		_this.over.setSize(_this.defaultFormat.getSize());
		_this.selected.setSize(_this.defaultFormat.getSize());
		_this.dragging.setSize(_this.defaultFormat.getSize());
		_this.stateChanged.notify(_this);
	});
	
	this.selected.changed.addEventListener(function (sender, item){
		_this.stateChanged.notify(_this);
	});
	
	this.over.changed.addEventListener(function (sender, item){
		_this.stateChanged.notify(_this);
	});
	
	this.dragging.changed.addEventListener(function (sender, item){
		_this.stateChanged.notify(_this);
	});
};

/** Getters **/
FeatureFormatter.prototype.getId = function(){return this.id;};
FeatureFormatter.prototype.getDefault = function(){return this.defaultFormat;};
FeatureFormatter.prototype.getSelected = function(){return this.selected;};
FeatureFormatter.prototype.getOver = function(){return this.over;};
FeatureFormatter.prototype.getDragging = function(){return this.dragging;};

function ItemFeatureFormat(args){
	this.defaultFormat = new Object();
	this.args = new Object();
	this.args.title = new Object();
	//Defult properties
	this.args.hidden = false;
	this.args.stroke = "black";
	this.args.strokeOpacity = 0.8;
	this.args.strokeWidth = 1;
	this.args.fill = "white";
	this.args.size = 1;
	this.args.opacity = 1;
	this.args.fontSize = "8";
	this.args.fontColor = "black";
	
	/** For directed edge with arrow **/ 
	//this.args.arrowSize = 1;
	
	if (args != null){
		if (args.opacity != null){
			this.args.opacity = args.opacity;
		}
		if (args.size != null){
			this.args.size = args.size;
		}
		if (args.hidden != null){
			this.args.hidden = args.hidden;
		}
		if (args.stroke != null){
			this.args.stroke = args.stroke;
		}
		if (args.strokeOpacity != null){
			this.args.strokeOpacity = args.strokeOpacity;
		}
		if (args.strokeWidth!=null){
			this.args.strokeWidth = args.strokeWidth;
		}
		if (args.shape!=null){
			this.args.shape = args.shape;
		}
		if (args.fill!=null){
			this.args.fill = args.fill;
		}
//		if (args.title!=null){
			if (args.fontSize!=null){
				this.args.fontSize = args.fontSize;
			}
//			if (args.title.fill!=null){
//				this.args.fill = args.fill;
//			}
//		}
	
	}
	
	this.changed = new Event();
};

ItemFeatureFormat.prototype.toJSON = function(){
	if(this.args.strokeOpacity != null){
		this.args["stroke-opacity"] = this.args.strokeOpacity;
		delete this.args.strokeOpacity;
	}
	if(this.args.strokeWidth != null){
		this.args["stroke-width"] = this.args.strokeWidth;
		delete this.args.strokeWidth;
	}

	if(this.args.title.fontColor != null){
		this.args.title["font-color"] = this.args.title.fontColor;
	}
	else{
		this.args.title["font-color"] = this.args.fontColor;//;this.args.title.fontColor;
	}
	
	if(this.args.title.fontSize != null){
		this.args.title["font-size"] = this.args.title.fontSize;//;this.args.title.fontColor;
	}
	else{ 
		this.args.title["font-size"] = this.args.fontSize;//;this.args.title.fontColor;
	}
	//return this.args;
	return this.args;
};

ItemFeatureFormat.prototype.getAttribute = function(name){return this.args[name];};

//Getters and Setters
ItemFeatureFormat.prototype.setVisible = function(visible){
	if (this.args.visible != visible){
		this.args.visible = visible;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getVisible = function(){return this.args.visible;};

ItemFeatureFormat.prototype.setHidden = function(hidden){
	if (this.args.hidden != hidden){
		this.args.hidden = hidden;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getHidden = function(){return this.args.hidden;};


ItemFeatureFormat.prototype.setStroke = function(stroke){
	if (this.args.stroke != stroke){
		this.args.stroke = stroke;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getStroke = function(){return this.args.stroke;};

ItemFeatureFormat.prototype.setStrokeOpacity = function(strokeOpacity){
	if (this.args.strokeOpacity != strokeOpacity){
		this.args.strokeOpacity = strokeOpacity;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getStrokeOpacity = function(){return this.args["stroke-opacity"];};

ItemFeatureFormat.prototype.setStrokeWidth = function(strokeWidth){
	if (this.args.strokeWidth != strokeWidth){
		this.args.strokeWidth = strokeWidth;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getStrokeWidth = function(){return this.args.strokeWidth;};

ItemFeatureFormat.prototype.setFill = function(fill){
	if (this.args.fill != fill){
		this.args.fill = fill;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getFill = function(){return this.args.fill;};

ItemFeatureFormat.prototype.setSize = function(size){
	if (this.args.size != size){
		this.args.size = size;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getSize = function(){return this.args.size;};

ItemFeatureFormat.prototype.setOpacity = function(opacity){
	if (this.args.opacity != opacity){
		this.args.opacity = opacity;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getOpacity = function(){return this.args.opacity;};

ItemFeatureFormat.prototype.getArrowSize = function(){return this.args.arrowSize;};

ItemFeatureFormat.prototype.setArrowSize = function(arrowSize){
	if (this.args.arrowSize != arrowSize){
		this.args.arrowSize = arrowSize;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getFontSize = function(){return this.args.title.fontSize;};

ItemFeatureFormat.prototype.setFontSize = function(fontSize){

	if (this.args.title.fontSize != fontSize){
		this.args.title.fontSize = fontSize;
		this.changed.notify(this);
	}
};





GeneFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
GeneFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
GeneFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
GeneFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
GeneFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging; 
GeneFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId; 
GeneFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON; 
GeneFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON; 
GeneFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents; 

function GeneFeatureFormatter(gene){
	if (gene != null){
		this.feature = gene;
		this.start = gene.start;
		this.end = gene.end;
		this.label = this.getLabel();
		this.args = new Object();
		this.args.object = gene;
		this.args.title = new Object();
		this.args.stroke = "#000000";
//		this.args.strokeOpacity = 0.8;
		this.args.strokeWidth = 0.5;
		this.args.fill = "#"+this._getColor(gene);
		this.args.opacity = 1;
		FeatureFormatter.prototype.constructor.call(this, this.getId(), this.args);
	}
};

GeneFeatureFormatter.prototype.getId = function(){
	return this.feature.stableId + "_" + this.feature.start + "_" + this.feature.end;
};

GeneFeatureFormatter.prototype.getName = function(){
	return this.feature.stableId;
};

GeneFeatureFormatter.prototype.getLabel = function(){
	var label = this.feature.externalName;
	
//	if (GENOMEMAPS_CONFIG.showFeatureStableId != null){
//		if (GENOMEMAPS_CONFIG.showFeatureStableId == true){
//			label = this.feature.stableId;
//		}
//		
//	}

	if (this.feature.strand == -1){
		label = "< " +label;
	}
	
	if (this.feature.strand == 1){
		label = label + " >";
	}
	return label;
};

GeneFeatureFormatter.prototype.getDetailLabel = function(){
	//Remove "_" and UpperCase first letter
	var name = this.feature.biotype.replace(/_/gi, " ");
	name = name.charAt(0).toUpperCase() + name.slice(1);
	return this.getLabel() + " [" + name + "] ";// + this.feature.start; 
};

GeneFeatureFormatter.prototype.getBioTypeColors = function(){
	var colors = new Object();

	//TODO buscar los colores en ensembl!
	colors[new String("protein_coding")] = "a00000";
	colors[new String("processed_transcript")] = "0000ff";
	colors[new String("pseudogene")] = "666666";
	colors[new String("miRNA")] = "8b668b";//TODO falta
	colors[new String("snRNA")] = "8b668b";
	colors[new String("snoRNA")] = "8b668b";//TODO falta
	colors[new String("lincRNA")] = "8b668b";
	
	colors[new String("other")] = "ffffff";
	return colors;
};

GeneFeatureFormatter.prototype._getColor = function(gene){
//	console.log(gene.biotype + " " + this.getBioTypeColors()[gene.biotype]);
	if (gene.biotype.indexOf("pseudogene") != -1){
		return this.getBioTypeColors()["pseudogene"];
	}
	
	if (this.getBioTypeColors()[gene.biotype] == null){
		return this.getBioTypeColors()["other"];
	}
	
	
	return this.getBioTypeColors()[gene.biotype];
};


TranscriptFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
TranscriptFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
TranscriptFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
TranscriptFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
TranscriptFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging; 
TranscriptFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId; 
TranscriptFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON; 
TranscriptFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON; 
TranscriptFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents; 

function TranscriptFeatureFormatter(transcript){
	this.feature = transcript;
	this.start = transcript.start;
	this.end =  transcript.end;
	this.label =  this.getLabel();
	
	this.exon = new Array();
	for ( var i = 0; i < transcript.exon.length; i++) {
		this.exon.push(new ExonFeatureFormatter(transcript.exon[i], transcript));
	}
	this.args = new Object();
	this.args.title = new Object();
	this.args.hidden = false;
	this.args.stroke = "black";//this.getBioTypeColors()[transcript.biotype.toUpperCase()];//"black";
	this.args.strokeWidth = 1;
	this.args.fill = this.getBioTypeColors()[transcript.biotype.toUpperCase()];//"black";
	this.args.size = 1;
	this.args.opacity = 0.5;
	this.args.fontSize = 10;
	this.args.fontColor = "#FFFFFF";
	
//	[["stroke-width", "0.5"], ["fill", "black"], ["stroke", "black"]]
	 
	//TODO doing
	this.showFeatureStableId = true;
	 
	FeatureFormatter.prototype.constructor.call(this, this.getId(), this.args);
};

TranscriptFeatureFormatter.prototype.getName = function(){
	return this.feature.stableId;
};

TranscriptFeatureFormatter.prototype.getId = function(){
	return this.feature.stableId + "_" + this.feature.start + "_" + this.feature.end;
};

TranscriptFeatureFormatter.prototype.getBioTypeColors = function(){
	var colors = new Object();
	colors[new String("protein_coding").toUpperCase()] = "21610B";
	colors[new String("pseudogene").toUpperCase()] = "ffcc00";
	colors[new String("snRNA").toUpperCase()] = "424242";
	colors[new String("lincRNA").toUpperCase()] = "8A0886";
	colors[new String("processed_transcript").toUpperCase()] = "ff9900";
	
	colors[new String("other").toUpperCase()] = "FFFFFF";
	return colors;
};

TranscriptFeatureFormatter.prototype.getLabel = function(){
	var label = this.feature.externalName;
//	if (GENOMEMAPS_CONFIG.showFeatureStableId != null){
//		if (GENOMEMAPS_CONFIG.showFeatureStableId == true){
//			label = this.feature.stableId;
//		}
//	}
//	if (this.showFeatureStableId == true){
//		label = this.feature.stableId;
//	}
//	
	
	if (this.feature.strand == -1){
		label = "< " + label;
	}
	
	if (this.feature.strand == 1){
		label = label + " >";
	}
	
	var name = this.feature.biotype.replace(/_/gi, " ");
	name = name.charAt(0).toUpperCase() + name.slice(1);
	label = label + " [" + name + "]" ;
	return label;
};


ExonFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
ExonFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
ExonFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
ExonFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
ExonFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging; 
ExonFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId; 
ExonFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON; 
ExonFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON; 
ExonFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents; 

function ExonFeatureFormatter(exon, transcript){
	this.feature = exon;
	this.start = exon.start;
	this.end =  exon.end;
	this.label = exon.stableId;
	this.args = new Object();
	this.args.title = new Object();
	this.args.hidden = false;
	this.args.opacity = 1;
	this.args.strokeOpacity = 1;
	this.args.fill = "#FF0033";
	this.args.stroke = "#3B0B0B";
	

	this.args.strokeWidth = 1;
	this.args.size = 1;
	this.args.fontSize = 10;
	this.args.fontColor = "#FFFFFF";
	FeatureFormatter.prototype.constructor.call(this, this.getId(), this.args);
};

ExonFeatureFormatter.prototype.getName = function(){
	return this.feature.stableId;
};

ExonFeatureFormatter.prototype.getId = function(){
	return this.feature.stableId + "_" + this.feature.start + "_" + this.feature.end;
};

SNPFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
SNPFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
SNPFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
SNPFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
SNPFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging; 
SNPFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId; 
SNPFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON; 
SNPFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON; 
SNPFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents; 

function SNPFeatureFormatter(snp){
//<<<<<<< HEAD
//	this.feature = snp;
//	this.start = snp.start;
//	this.end =  snp.end;
//	this.label = snp.name + " (" + snp.alleleString +")";// strand:" + snp.strand ;
//	this.base = snp.alleleString.split("/")[1]; // example:  "A/AT"  or  "ATTT/G"
//	
//	this.args = new Object();
//	this.args.stroke = "#000000";
//	this.args.strokeOpacity = 1;
//	this.args.strokeWidth = 1;
//	this.args.fill = "#FF3333";
//	//this.args.fill = "#000000";
//	this.args.opacity = 1;
//	
//	FeatureFormatter.prototype.constructor.call(this, snp.name, this.args);
//=======
	if (snp != null){
		this.feature = snp;
		this.start = snp.start;
		this.end =  snp.end;
		this.label = snp.name + " (" + snp.alleleString +")" ;
		this.base = snp.alleleString.split("/")[1]; // example:  "A/AT"  or  "ATTT/G"
		
		this.args = new Object();
		this.args.stroke = "#f55959";
		this.args.strokeOpacity = 1;
		this.args.strokeWidth = 1;
		this.args.fill = this._getColor(snp); //"#f55959";
		//this.args.fill = "#000000";
		this.args.opacity = 1;
		
		FeatureFormatter.prototype.constructor.call(this, snp.name, this.args);
	}
//>>>>>>> eb4c9a6c00ef8bad1669b8a0b362a1b9335ffac6
};

SNPFeatureFormatter.prototype.getName = function(){
	return this.feature.name;
};

SNPFeatureFormatter.prototype.getFeatureColor = function(base){
	if (base == "A") return "#90EE90";
	if (base == "T") return "#E066FF";
	if (base == "G") return "#FFEC8B";
	if (base == "C") return "#B0C4DE";
	return "#CC00CC";
};
SNPFeatureFormatter.prototype.getBioTypeColors = function(){
	//TODO
	var colors = new Object();
	colors[new String("2KB_upstream_variant")] = "a2b5cd";				//TODO done Upstream
	colors[new String("5KB_upstream_variant")] = "a2b5cd";				//TODO done Upstream
	colors[new String("500B_downstream_variant")] = "a2b5cd";			//TODO done Downstream
	colors[new String("5KB_downstream_variant")] = "a2b5cd";			//TODO done Downstream
	colors[new String("3_prime_UTR_variant")] = "7ac5cd";				//TODO done 3 prime UTR
	colors[new String("5_prime_UTR_variant")] = "7ac5cd";				//TODO done 5 prime UTR
	colors[new String("coding_sequence_variant")] = "458b00";			//TODO done Coding unknown
	colors[new String("complex_change_in_transcript")] = "00fa9a";		//TODO done Complex in/del
	colors[new String("frameshift_variant")] = "ff69b4";				//TODO done Frameshift coding
	colors[new String("incomplete_terminal_codon_variant")] = "ff00ff";	//TODO done Partial codon
	colors[new String("inframe_codon_gain")] = "ffd700";				//TODO done Non-synonymous coding
	colors[new String("inframe_codon_loss")] = "ffd700";				//TODO done Non-synonymous coding
	colors[new String("initiator_codon_change")] = "ffd700";			//TODO done Non-synonymous coding
	colors[new String("non_synonymous_codon")] = "ffd700";				//TODO done Non-synonymous coding
	colors[new String("intergenic_variant")] = "636363";				//TODO done Intergenic
	colors[new String("intron_variant")] = "02599c";					//TODO done Intronic
	colors[new String("mature_miRNA_variant")] = "458b00";				//TODO done Within mature miRNA
	colors[new String("nc_transcript_variant")] = "32cd32";				//TODO done Within non-coding gene
	colors[new String("splice_acceptor_variant")] = "ff7f50";			//TODO done Essential splice site
	colors[new String("splice_donor_variant")] = "ff7f50";				//TODO done Essential splice site
	colors[new String("splice_region_variant")] = "ff7f50";				//TODO done Splice site
	colors[new String("stop_gained")] = "ff0000";						//TODO done Stop gained
	colors[new String("stop_lost")] = "ff0000";							//TODO done Stop lost
	colors[new String("stop_retained_variant")] = "76ee00";				//TODO done Synonymous coding
	colors[new String("synonymous_codon")] = "76ee00";					//TODO done Synonymous coding
	
	colors[new String("other")] = "ffffff";
	return colors;
};

SNPFeatureFormatter.prototype._getColor = function(snp){
	return this.getBioTypeColors()[snp.displaySoConsequence];
};




SequenceFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
SequenceFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
SequenceFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
SequenceFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
SequenceFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging; 
SequenceFormatter.prototype.getId = FeatureFormatter.prototype.getId; 
SequenceFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON; 
SequenceFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON; 
SequenceFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents; 

function SequenceFormatter(sequence){
	this.start = sequence.start;
	this.end =  sequence.end;
	this.label = sequence.base;//exon.stableId;
	
	this.args = new Object();
	this.args.title = new Object();
	this.args.hidden = false;
	this.args.stroke = "#FFFFFF";
	this.args.strokeOpacity = 0.6;
	this.args.strokeWidth = 1;
	this.args.fill = this.getFeatureColor(sequence.base);
	this.args.size = 1;
	this.args.opacity = 0.6;
	this.args.fontSize = 10;
	this.args.fontColor = "#FFFFFF";
	
	FeatureFormatter.prototype.constructor.call(this, sequence.start, this.args);
};

SequenceFormatter.prototype.getName = function(){
	return this.label;
};

SequenceFormatter.prototype.getFeatureColor = function(base){
	if (base == "A") return "#90EE90";
	if (base == "T") return "#E066FF";
	if (base == "G") return "#FFEC8B";
	if (base == "C") return "#B0C4DE";
	return "#CC00CC";
};

VCFFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
VCFFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
VCFFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
VCFFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
VCFFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
VCFFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
VCFFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
VCFFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
VCFFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function VCFFeatureFormatter(feature){
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end-1;
        this.label = feature.label;//exon.stableId;
        this.base = feature.alt;
        
        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.stroke = "#000000";
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 0.1;
        this.args.fill = "purple";
        this.args.size = 1;
        this.args.opacity = 1;
        
        this.feature.samples = feature.all[9];
        
        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};

VCFFeatureFormatter.prototype.getName = function(){
	return this.feature.chromosome+":"+this.feature.start+"-"+this.feature.alt;
};

GFFFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
GFFFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
GFFFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
GFFFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
GFFFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
GFFFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
GFFFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
GFFFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
GFFFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function GFFFeatureFormatter(feature){
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end;
        this.label = feature.label;//exon.stableId;

        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.stroke = "blue";
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 0.4;
        this.args.fill = "purple";
        this.args.size = 1;
        
        if (feature.score != null){
        	this.args.opacity = (1 * feature.score)/1000;
        }
        else{
        	this.args.opacity = 0.5;
        }
        
        this.args.fontColor = "blue";

        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};


GFFFeatureFormatter.prototype.getName = function(){
	return this.label;
};

BEDFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
BEDFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
BEDFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
BEDFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
BEDFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
BEDFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
BEDFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
BEDFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
BEDFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function BEDFeatureFormatter(feature){
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end;
        this.label = feature.label;//exon.stableId;
        this.score = feature.score;
        if(this.score<0){this.score = 0;}
        if(this.score>1000){this.score = 1000;}
        var gray = Math.abs(Math.ceil(this.score*0.255)-255).toString(16);
        
        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 1;
        this.args.fill =  "#"+gray+gray+gray;
        this.args.stroke = '#000000';
        
        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};

BEDFeatureFormatter.prototype.getName = function(){
	return this.label;
};


CytobandFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
CytobandFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
CytobandFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
CytobandFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
CytobandFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
CytobandFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
CytobandFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
CytobandFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
CytobandFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function CytobandFeatureFormatter(cytoband){
		this.feature = cytoband;
        this.start = cytoband.start;
        this.end =  cytoband.end;
        this.label = cytoband.cytoband;//exon.stableId;

        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.stroke = "#000000";
        this.args.strokeOpacity = 0.1;
        this.args.strokeWidth = 0.5;
        this.args.fill = this.getColor(cytoband);
        this.args.size = 1;
        this.args.opacity = 1;
    	this.args.fontSize = 10;
        this.args.fontColor = "blue";

        FeatureFormatter.prototype.constructor.call(this, cytoband.cytoband, this.args);
};

CytobandFeatureFormatter.prototype.getColor = function(feature) {
	if (feature.stain == ('gneg')){
		return "white";
	}
	if (feature.stain == ('stalk')){
		return "#666666";
	}
	if (feature.stain == ('gvar')){
		return "#CCCCCC";
	}
	
	if (feature.stain.indexOf('gpos') != -1){
		var value = feature.stain.replace("gpos", "");
		
		if (value == 25){
			return "silver";
		}
		if (value == 50){
			return "gray";
		}
		if (value == 75){
			return "darkgray";
		}
		if (value == 100){
			return "black";
		}
	}
	
	if (feature.stain=="acen"){
		return "blue";
	}
	return "purple";
};


MarkerRuleFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
MarkerRuleFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
MarkerRuleFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
MarkerRuleFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
MarkerRuleFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging; 
MarkerRuleFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId; 
MarkerRuleFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON; 
MarkerRuleFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON; 
MarkerRuleFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents; 

function MarkerRuleFeatureFormatter(marker){
	this.start = marker.start;
	this.end =  marker.end;
	this.label = this.start;//exon.stableId;
	
	this.isLabeled = false;
	
	this.args = new Object();
	this.args.title = new Object();
	this.args.hidden = false;
	this.args.stroke = "#FFFFFF";
	this.args.strokeOpacity = 0.6;
	this.args.strokeWidth = 1;
	this.args.fill = "black";
	this.args.size = 1;
	this.args.opacity = 0.1;
	if (marker.label){
		this.isLabeled = true;
		this.args.opacity = 0.2;
	}
	
	this.args.fontSize = 10;
	this.args.fontColor = "#FFFFFF";
	
	FeatureFormatter.prototype.constructor.call(this, marker.start, this.args);
};


DASFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
DASFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
DASFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
DASFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
DASFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
DASFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
DASFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
DASFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
DASFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function DASFeatureFormatter(feature){
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end;
        this.label = feature.id;//exon.stableId;

        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.stroke = "#FFFFFF";
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 1;
        this.args.fill = "purple";
        this.args.size = 1;
        this.args.opacity = "1";
        this.args.fontSize = 10;
        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};


GenericFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
GenericFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
GenericFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
GenericFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
GenericFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
GenericFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
GenericFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
GenericFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
GenericFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function GenericFeatureFormatter(feature){
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end;
        this.label = this.getLabel(feature);//exon.stableId;
        this.base = feature.alt;
        
        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.stroke = "#000000";
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 0.1;
        this.args.fill = "purple";
        this.args.size = 1;
        this.args.opacity = 1;

        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};

GenericFeatureFormatter.prototype.getLabel = function(feature) {
	if (feature.externalName != null){
		return feature.externalName;
	}
	
	if (feature.stableId != null){
		return feature.stableId;
	}
	
	if (feature.name != null){
		return feature.name;
	}
	
	if (feature.label != null){
		return feature.label;
	}
	
	return feature.chromosome + ":" + feature.start + "-" + feature.end;
	
};



TfbsFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
TfbsFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
TfbsFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
TfbsFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
TfbsFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
TfbsFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
TfbsFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
TfbsFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
TfbsFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function TfbsFeatureFormatter(feature){
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end;
        this.label = this.getLabel(feature);//exon.stableId;
        this.base = feature.alt;
        this.args = new Object();
        this.args.stroke = "#000000";
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 0.5;
        this.args.fill = this.getColors()[feature.cellType];
        this.args.opacity = 1;

        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};

TfbsFeatureFormatter.prototype.getName = function(){
	return this.feature.tfName;
};

TfbsFeatureFormatter.prototype.getLabel = function(feature) {
	return feature.tfName + " [" + feature.cellType + "]";
};

TfbsFeatureFormatter.prototype.getColors = function(){
	var colors = new Object();

	//TODO buscar los colores en ensembl!
	colors[new String("CD4")] = "38610B";
	colors[new String("GM06990")] = "4B8A08";
	colors[new String("GM12878")] = "5FB404";
	colors[new String("H1ESC")] = "74DF00";//TODO falta
	colors[new String("HeLa-S3")] = "80FF00";
	colors[new String("HepG2")] = "9AFE2E";//TODO falta
	colors[new String("HUVEC")] = "ACFA58";
	colors[new String("IMR90")] = "BEF781";//TODO falta
	colors[new String("K562")] = "E1F5A9";
	colors[new String("K562b")] = "ECF6CE";//TODO falta
	colors[new String("NHEK")] = "F1F8E0";
	
	colors[new String("other")] = "ffffff";
	return colors;
};

/** miRNA **/
MiRNAFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
MiRNAFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
MiRNAFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
MiRNAFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
MiRNAFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
MiRNAFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
MiRNAFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
MiRNAFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
MiRNAFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function MiRNAFeatureFormatter(feature){
	console.log(feature);
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end;
        this.label = this.getLabel(feature);//exon.stableId;
        this.base = feature.alt;
        
        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.stroke = "#000000";
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 0.1;
        this.args.fill = "purple";
        this.args.size = 1;
        this.args.opacity = 1;

        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};

MiRNAFeatureFormatter.prototype.getLabel = function(feature) {
	return feature.mirbaseId + "[" + feature.geneTargetName + "]";
	
};



function GeneBlockManager () {
	this.data = new Object();
	this.data.queues = new Array();
	this.data.queues[0] = new Array();
	this.data.transcriptQueueCount = new Object();
	
	this.data.transcriptQueue = new Array();
	
};

GeneBlockManager.prototype.getGenesTrackCount = function(){
	return this.data.queues.length;
};


GeneBlockManager.prototype.getFeaturesFromGeneTrackIndex = function(index){
	return this.data.queues[index];
};

GeneBlockManager.prototype.toJSON = function(){
	return this.data;
};


GeneBlockManager.prototype.init = function(dataset){
	this.data.features = dataset;
	var features = this.data.features;
	for (var i = 0; i < features.length;  i++){
		var queueToDraw = this._searchSpace(features[i], this.data.queues);
		/** Insertamos en la cola para marcar el espacio reservado */
		this.data.queues[queueToDraw].push(features[i]);
		
		if (this.data.transcriptQueue[queueToDraw] == null){
			this.data.transcriptQueue.push(new Array());
		}

		this.data.TranscriptQueuesTest = new Array();
		for ( var j = 0; j < features[i].transcript.length; j++) {
			
			var featureAux = {"start": features[i].transcript[j].exon[0].start, "end":features[i].transcript[j].exon[features[i].transcript[j].exon.length -1 ].end};
			var queueTranscriptToDraw = this._searchSpace(featureAux, this.data.TranscriptQueuesTest);
			this.data.TranscriptQueuesTest[queueTranscriptToDraw].push(featureAux);
			
			if (this.data.transcriptQueue[queueToDraw][queueTranscriptToDraw] == null){
				this.data.transcriptQueue[queueToDraw].push(new Array());
			}
			this.data.transcriptQueue[queueToDraw][queueTranscriptToDraw].push(features[i].transcript[j]);
		}
		
	}
	return this.data.queues[queueToDraw].length;
};





/** True si dos bloques se solapan */
GeneBlockManager.prototype._overlapBlocks = function(block1, block2){
	if ((block1.start <= block2.end) && (block1.end >= block2.start)){
		return true;
	}
	return false;
};

/** Busca disponibilidad de espacio y devuelve el indice del layer donde debe insertarse */
GeneBlockManager.prototype._searchSpace = function(block1, queues){
//	var candidates = new Array();
	
	for (var i = 0; i < queues.length; i++ ){
//		console.log("Checking queueu " + i);
		var overlapping = new Array();
		for (var j = 0; j < queues[i].length; j++ ){
			var block2 = queues[i][j];
			overlapping.push((this._overlapBlocks(block1, block2)));	
//			overlapping.push((this._overlapBlocks(block2, block1)));	
		}
	
//		console.log(overlapping);
		/** no se solapa con ningun elemento de la cola i entonces devuelvo la capa */ 
		if (overlapping.valueOf(overlapping).indexOf(true)==-1){
//			console.log("inserto en: " + i);
//			console.log(overlapping);
//			candidates.push(i);
			return i;
		}
	}
	
	/*for ( var i = 0; i < candidates.length; i++) {
		var maxDistance = Number.MIN_VALUE;
		var farCandidate = 0;
		var distances = new Array();
		debugger
		if (candidates.length >1){
			var distance = Number.MIN_VALUE;
			
			for ( var j = 0; j < queues[candidates[i]].length; j++) {
				if (queues[candidates[i]][j].end < block1.start){
					distance = block1.start - queues[candidates[i]][j].end;
				}
				else{
					distance = queues[candidates[i]][j].start -  block1.end;
				}
				distances.push(distance);
				if (distance > maxDistance){
					maxDistance = distance;
					farCandidate = j;
				}
			}
		}
		console.log(candidates);
		console.log("far distances: " + distances);
		console.log("far distance: " + maxDistance);
		console.log("candidate: " + farCandidate);
		return candidates[farCandidate];
	}
	*/
	
	/** no me cabe en ninguna capa entonces creo una nueva */
	queues.push(new Array());
//	console.log("Neuva en: " + queues.length);
	/** no hemos encontrado ningun espacio en ninguna cola anterior */
	return queues.length - 1;
};GeneBlockManager.prototype.loadFromJSON = DataSet.prototype.loadFromJSON;
GeneBlockManager.prototype.loadFromFile = DataSet.prototype.loadFromFile;
GeneBlockManager.prototype.loadFromURL  = DataSet.prototype.loadFromURL;
//GeneBlockManager.prototype.validate  = 	    DataSet.prototype.validate;

function GeneBlockManager () {
	this.data = new Object();
};

GeneBlockManager.prototype.getGenesTrackCount = function(){
	return this.data.queues.length;
};


GeneBlockManager.prototype.getFeaturesFromGeneTrackIndex = function(index){
	return this.data.queues[index];
};

GeneBlockManager.prototype.toJSON = function(){
	return this.data;
};
GeneBlockManager.prototype.validate = function(){
	return true;
};

GeneBlockManager.prototype.sort = function(a, b){
	return (b.end - b.start) - (a.end - a.start);
};

GeneBlockManager.prototype.toDatasetFormatter = function(dataset){
	var features = new Array();
	try{
		for ( var i = 0; i < dataset.length; i++) {
			var geneFormatter = new GeneFeatureFormatter(dataset[i]);
			features.push(geneFormatter);
			if (dataset[i].transcript != null){
				var transcripts = dataset[i].transcript; //dataset[i].transcript.sort(this.sort);
				for ( var j = 0; j < transcripts.length; j++) {
					if (geneFormatter.transcript == null){
						geneFormatter.transcript = new Array();
					}
					geneFormatter.transcript.push(new TranscriptFeatureFormatter(dataset[i].transcript[j]));
				}
			}
		}
	}
	catch(e)
	{
		alert("ERROR: GeneBlockManager: " + e);
	}
	return features;
//	return this;
};
VCFFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
VCFFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
VCFFileWidget.prototype.draw = FileWidget.prototype.draw;
VCFFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
VCFFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;

function VCFFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "VCF";
	args.tags = ["vcf"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
    this.chartWidgetQuality = new ChartWidget({height:300});
};

VCFFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"]),
	        this.chartWidgetQuality.getChart(["features","quality"])];
};



VCFFileWidget.prototype.loadFileFromLocal = function(file){
	var vcfAdapter = new VCFFileDataAdapter();
	this._fileLoad(vcfAdapter);
	vcfAdapter.loadFromFile(file);
};

VCFFileWidget.prototype._fileLoad = function(vcfAdapter){
	var _this = this;
	vcfAdapter.onRead.addEventListener(function(sender, id) {
		_this.dataAdapter = new VCFLocalRegionDataAdapter();
		_this.dataAdapter.loadFromFileDataAdapter(sender);
		
		var datastore = new Array();
	 	for ( var chromosome in _this.dataAdapter.featuresByChromosome) {
			datastore.push({ features: _this.dataAdapter.featuresByChromosome[chromosome].length, chromosome: chromosome });
		}
		
		var qualityStore = new Array();
		for ( var range in _this.dataAdapter.qualitycontrol) {
		
			qualityStore.push({features: _this.dataAdapter.qualitycontrol[range],  quality:range });
		}
		
	 	_this.chartWidgetByChromosome.getStore().loadData(datastore);
	 	_this.chartWidgetQuality.getStore().loadData(qualityStore);
	 	
	 	
	 	_this.panel.setLoading(false);
	 	_this.featureCountLabel.setText("Features count: " + _this.dataAdapter.features.length, false);
	 	_this.btnOk.enable();
	});
};

VCFFileWidget.prototype.loadFileFromServer = function(data){
	var vcfAdapter = new VCFFileDataAdapter();
	this._fileLoad(vcfAdapter);
	vcfAdapter.loadFromContent(data.data);
};function FileWidget(args){
	var _this=this;
	this.targetId = null;
	this.id = "FileWidget_" + Math.round(Math.random()*100000);
	this.wum = true;
	this.tags = [];
	
	this.args = args;
	
	if (args != null){
		if (args.targetId!= null){
			this.targetId = args.targetId;       
		}
		if (args.title!= null){
			this.title = args.title;    
			this.id = this.title+this.id;
		}
		if (args.wum!= null){
			this.wum = args.wum;    
		}
        if (args.tags!= null){
        	this.tags = args.tags;       
        }
	}
	
	this.dataAdapter = null;
	this.onOk = new Event(this);
	
	this.browserData = new BrowserDataWidget();
	/** Events i listen **/
	this.browserData.onSelect.addEventListener(function (sender, data){
		_this.trackNameField.setValue(data.filename);
		_this.fileNameLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
		_this.panel.setLoading();
	});	
    this.browserData.adapter.onReadData.addEventListener(function (sender, data){
    	_this.trackNameField.setValue(data.filename);
    	_this.fileNameLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
    	_this.loadFileFromServer(data);
	});	
};

FileWidget.prototype.getTitleName = function(){
	return this.trackNameField.getValue();
};


FileWidget.prototype.getFileFromServer = function(){
	//abstract method
};

FileWidget.prototype.loadFileFromLocal = function(){
	//abstract method
};

FileWidget.prototype.getChartItems = function(){
	//abstract method
	return [];
};

FileWidget.prototype.getFileUpload = function(){
	var _this = this;
	this.uploadField = Ext.create('Ext.form.field.File', {
		msgTarget : 'side',
//		flex:1,
		width:75,
		emptyText: 'Choose a local file',
        allowBlank: false,
		buttonText : 'Browse local',
		buttonOnly : true,
		listeners : {
			change : {
				fn : function() {
					_this.panel.setLoading();
			
					var file = document.getElementById(_this.uploadField.fileInputEl.id).files[0];
					_this.trackNameField.setValue(file.fileName);
					_this.fileNameLabel.setText('<span class="emph">'+ file.name +'</span> <span class="info">(local)</span>',false);
					_this.loadFileFromLocal(file);

				}
			}
		}
	});
	return this.uploadField;
};


FileWidget.prototype.draw = function(){
	var _this = this;
	
	if (this.openDialog == null){
	
		/** Bar for the chart **/
		var featureCountBar = Ext.create('Ext.toolbar.Toolbar');
		this.featureCountLabel = Ext.create('Ext.toolbar.TextItem', {
			html:'<span class="dis">No file loaded</span>'
		});
		featureCountBar.add([this.featureCountLabel]);
		
		/** Bar for the file upload browser **/
		var browseBar = Ext.create('Ext.toolbar.Toolbar',{cls:'bio-border-false'});
		browseBar.add(this.getFileUpload());
		
		this.panel = Ext.create('Ext.panel.Panel', {
			border: false,
			cls:'panel-border-top panel-border-bottom',
	//		padding: "0 0 10 0",
			title: "Previsualization",
		    items : this.getChartItems(),
		    bbar:featureCountBar
		});
		
	//	var colorPicker = Ext.create('Ext.picker.Color', {
	//	    value: '993300',  // initial selected color
	//	    listeners: {
	//	        select: function(picker, selColor) {
	//	            alert(selColor);
	//	        }
	//	    }
	//	});
		this.trackNameField = Ext.create('Ext.form.field.Text',{
			name: 'file',
            fieldLabel: 'Track Name',
            allowBlank: false,
            value: 'New track from '+this.title+' file',
            emptyText: 'Choose a name',
            flex:1
		});
		
		var panelSettings = Ext.create('Ext.panel.Panel', {
			border: false,
			layout: 'hbox',
			bodyPadding: 10,
		    items : [this.trackNameField]	 
		});
		
		
		if(this.wum){
			this.btnBrowse = Ext.create('Ext.button.Button', {
		        text: 'Browse server',
		        disabled:true,
//		        iconCls:'icon-local',
//		        cls:'x-btn-default-small',
		        handler: function (){
	    	   		_this.browserData.draw($.cookie('bioinfo_sid'),_this.tags);
	       		}
			});
			
			browseBar.add(this.btnBrowse);
			
			if($.cookie('bioinfo_sid') != null){
				this.sessionInitiated();
			}else{
				this.sessionFinished();
			}
		}
		
		this.fileNameLabel = Ext.create('Ext.toolbar.TextItem', {
			html:'<span class="emph">Select a <span class="info">local</span> file or a <span class="info">server</span> file from your account.</span>'
		});
		browseBar.add(['->',this.fileNameLabel]);
		
		
		
		this.btnOk = Ext.create('Ext.button.Button', {
			text:'Ok',
			disabled:true,
			handler: function(){ 
				_this.onOk.notify({title:_this.getTitleName(), dataAdapter:_this.dataAdapter});
				_this.openDialog.close();
			}
		});
		
		this.openDialog = Ext.create('Ext.ux.Window', {
			title : 'Open '+this.title+' file',
			taskbar:Ext.getCmp(this.args.viewer.id+'uxTaskbar'),
			width : 800,
	//		bodyPadding : 10,
			resizable:false,
			items : [browseBar, this.panel, panelSettings],
			buttons:[this.btnOk, 
			         {text:'Cancel', handler: function(){_this.openDialog.close();}}],
			listeners: {
			    	scope: this,
			    	minimize:function(){
						this.openDialog.hide();
			       	},
			      	destroy: function(){
			       		delete this.openDialog;
			      	}
		    	}
		});
		
	}
	this.openDialog.show();
};

FileWidget.prototype.sessionInitiated = function (){
	if(this.btnBrowse!=null){
		this.btnBrowse.enable();
	}
};
FileWidget.prototype.sessionFinished = function (){
	if(this.btnBrowse!=null){
		this.btnBrowse.disable();
	}
};GFFFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
GFFFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
GFFFileWidget.prototype.draw = FileWidget.prototype.draw;
GFFFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
GFFFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;

function GFFFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "GFF";
	args.tags = ["gff"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
};

GFFFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"])];
};

GFFFileWidget.prototype.loadFileFromLocal = function(file){
	var gffAdapter = new GFFFileDataAdapter();
	this._fileLoad(gffAdapter);
	gffAdapter.loadFromFile(file);
};

GFFFileWidget.prototype._fileLoad = function(gffAdapter){
	var _this = this;
	gffAdapter.onRead.addEventListener(function(sender, id) {
		_this.dataAdapter = new GFFLocalRegionDataAdapter();
		_this.dataAdapter.loadFromFileDataAdapter(sender);
		
		var datastore = new Array();
	 	for ( var chromosome in _this.dataAdapter.featuresByChromosome) {
			datastore.push({ features: _this.dataAdapter.featuresByChromosome[chromosome].length, chromosome: chromosome });
		}
		
	 	_this.chartWidgetByChromosome.getStore().loadData(datastore);
	 	_this.panel.setLoading(false);
	 	_this.featureCountLabel.setText("Features count: " + _this.dataAdapter.features.length, false);
	 	_this.btnOk.enable();
	});
};

GFFFileWidget.prototype.loadFileFromServer = function(data){
	var gffAdapter = new GFFFileDataAdapter();
	this._fileLoad(gffAdapter);
	gffAdapter.loadFromContent(data.data);
};BEDFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
BEDFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
BEDFileWidget.prototype.draw = FileWidget.prototype.draw;
BEDFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
BEDFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;;

function BEDFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "BED";
	args.tags = ["bed"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
};

BEDFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"])];
};

BEDFileWidget.prototype.loadFileFromLocal = function(file){
	var bedAdapter = new BEDFileDataAdapter();
	this._fileLoad(bedAdapter);
	bedAdapter.loadFromFile(file);
};

BEDFileWidget.prototype._fileLoad = function(bedAdapter){
	var _this = this;
	bedAdapter.onRead.addEventListener(function(sender, id) {
		_this.dataAdapter = new BEDLocalRegionDataAdapter();
		_this.dataAdapter.loadFromFileDataAdapter(sender);
		
		var datastore = new Array();
	 	for ( var chromosome in _this.dataAdapter.featuresByChromosome) {
			datastore.push({ features: _this.dataAdapter.featuresByChromosome[chromosome].length, chromosome: chromosome });
		}
	 	
	 	_this.chartWidgetByChromosome.getStore().loadData(datastore);
	 	_this.panel.setLoading(false);
	 	_this.featureCountLabel.setText("Features count: " + _this.dataAdapter.features.length, false);
	 	_this.btnOk.enable();
	});
};

BEDFileWidget.prototype.loadFileFromServer = function(data){
	var bedAdapter = new BEDFileDataAdapter();
	this._fileLoad(bedAdapter);
	bedAdapter.loadFromContent(data.data);
};
function UrlWidget(args){
	var _this=this;
	this.id = "UrlWidget_" + Math.round(Math.random()*10000000);
	this.targetId = null;
	
	this.title = "Custom url";
	this.width = 500;
	this.height = 400;
	
	if (args != null){
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
	
	this.onAdd = new Event(this);
};

UrlWidget.prototype.draw = function (){
	if(this.panel==null){
		this.render();
	}
	this.panel.show();
};

UrlWidget.prototype.render = function (){
	var _this=this;
	
    this.urlField = Ext.create('Ext.form.field.Text',{
    	margin:"0 2 2 0",
    	labelWidth : 30,
    	flex:1,
    	fieldLabel : 'URL',
		emptyText: 'enter a valid url',
		value : "http://www.ensembl.org/das/Homo_sapiens.GRCh37.gene/features",
		listeners : { change: {fn: function(){ var dasName = this.value.split('/das/')[1].split('/')[0];
											   _this.trackNameField.setValue(dasName); }}
		}
    });
    this.checkButton = Ext.create('Ext.button.Button',{
		text : 'Check',
		handler : function() {
			_this.form.setLoading();
			var dasDataAdapter = new DasRegionDataAdapter({
				url : _this.urlField.getValue()
			});

			dasDataAdapter.successed.addEventListener(function() {
				_this.contentArea.setValue(dasDataAdapter.xml);
				_this.form.setLoading(false);
			});

			dasDataAdapter.onError.addEventListener(function() {
				_this.contentArea.setValue("XMLHttpRequest cannot load. This server is not allowed by Access-Control-Allow-Origin");
				_this.form.setLoading(false);
			});
			dasDataAdapter.fill(1, 1, 1);
		}
    });
	this.trackNameField = Ext.create('Ext.form.field.Text',{
		name: 'file',
//        fieldLabel: 'Track name',
        allowBlank: false,
        value: _this.urlField.value.split('/das/')[1].split('/')[0],
        emptyText: 'Choose a name',
        flex:1
	});
	this.panelSettings = Ext.create('Ext.panel.Panel', {
		layout: 'hbox',
		border:false,
		title:'Track name',
		cls:"panel-border-top",
		bodyPadding: 10,
	    items : [this.trackNameField]	 
	});
	this.contentArea = Ext.create('Ext.form.field.TextArea',{
		margin:"-1",
		width : this.width,
		height : this.height
	});
	this.infobar = Ext.create('Ext.toolbar.Toolbar',{height:28,cls:"bio-border-false"});
	this.infobar.add(this.urlField);
	this.infobar.add(this.checkButton);
	this.form = Ext.create('Ext.panel.Panel', {
		border : false,
		items : [this.infobar,this.contentArea,this.panelSettings]
	});
	
	this.panel = Ext.create('Ext.ux.Window', {
		title : this.title,
		layout: 'fit',
		resizable:false,
		items : [this.form],
		buttons : [{
			text : 'Add',
			handler : function() {
				_this.onAdd.notify({name:_this.trackNameField.getValue(),url:_this.urlField.getValue()});
				_this.panel.close();
			}
		},{text : 'Cancel',handler : function() {_this.panel.close();}}
		],
		listeners: {
	      	destroy: function(){
	       		delete _this.panel;
	      	}
    	}
	});
};function MasterSlaveGenomeViewer(trackerID, targetId,  args) {
	this.targetId = targetId;
	this.id = trackerID + Math.random();
	this.width = 1300;
	this.height = 700;
	
	this.slaveHeight = this.height;
	this.masterHeight = this.height;
	
	
	this.masterWindowSize = 1000000;
	
	if (args != null){
		if (args.width != null){
			this.width = args.width;
		}
		if (args.height != null){
			this.height = args.height;
		}
		if (args.masterHeight != null){
			this.masterHeight = args.height;
		}
		if (args.slaveHeight != null){
			this.slaveHeight = args.height;
		}
		
	}
	this.pixelRatio = 0.0005; //0.001;

	this.zoomLevels = new Array();
	for ( var i = 1; i <= 10; i++) {
		this.zoomLevels[i] = this.pixelRatio * (i*2);
	}
	this.zoomLevels[0.1] = this.pixelRatio;
	this.genomeWidget = null;
	
	 /** Events **/
    this.markerChanged = new Event(this);

	
	
	
	
};

MasterSlaveGenomeViewer.prototype.getZoomFactor = function(value) {
	return this.zoomLevels[value/10];
};


MasterSlaveGenomeViewer.prototype.getMasterId = function() {
	return this.id + "_master";
};

MasterSlaveGenomeViewer.prototype.getSlaveId = function() {
	return this.id + "_slave";
};

MasterSlaveGenomeViewer.prototype.getMasterStart = function() {
	return this.position - (this.masterWindowSize);
};

MasterSlaveGenomeViewer.prototype.getMasterEnd = function() {
	return this.position + (this.masterWindowSize);
};


MasterSlaveGenomeViewer.prototype.init = function() {
//	var master = DOM.createNewElement("DIV", DOM.select(this.getMasterId()), [["width", this.width], ["height", this.height]]);
};

MasterSlaveGenomeViewer.prototype.goTo = function(chromosome, position) {
	this.clear();
	this.chromosome = chromosome;
	this.position = position;

	this._drawMaster();
	this._drawSlave(this.position);
};


MasterSlaveGenomeViewer.prototype.zoomIn = function() {
	this.position = this.genomeWidget.trackCanvas.getMiddlePoint();
//	this.pixelRatio = this.pixelRatio + 0.02;
	this.pixelRatio = this.pixelRatio * 1.5;
	this.clear();
	this.genomeWidget.trackCanvas._goToCoordinateX( this.position - (this.genomeWidget.trackCanvas.width/2) / this.pixelRatio);
	console.log("PIXEL RATIO " + this.pixelRatio);
};


MasterSlaveGenomeViewer.prototype.zoom = function(value) {
	if (value > 50){
			this.pixelRatio = this.pixelRatio * (1.5* ((value/4)/10));
	}
	else{
			this.pixelRatio = this.pixelRatio / (1.5* ((value/4)/10));
	}
	this.pixelRatio = this.getZoomFactor(value);
	this.position = this.genomeWidget.trackCanvas.getMiddlePoint();
	
	this.clear();
	this.genomeWidget.trackCanvas._goToCoordinateX( this.position - (this.genomeWidget.trackCanvas.width/2) / this.pixelRatio);
	
};

MasterSlaveGenomeViewer.prototype.zoomOut = function() {
	
	this.position = this.genomeWidget.trackCanvas.getMiddlePoint();
//	this.pixelRatio = this.pixelRatio - 0.002;
	this.pixelRatio = this.pixelRatio / 1.5;
	this.clear();
	this.genomeWidget.trackCanvas._goToCoordinateX( this.position - (this.genomeWidget.trackCanvas.width/2) / this.pixelRatio);
	console.log("PIXEL RATIO " + this.pixelRatio);
};

MasterSlaveGenomeViewer.prototype.clear = function() {
	this.genomeWidget.clear();
	this._drawMaster();
};

MasterSlaveGenomeViewer.prototype._createMaster = function() {


    var newGenomeWidget = new GenomeWidget(this.id + "master", this.getMasterId(),
                    {
                            "pixelRatio":this.pixelRatio,
                            "width":this.width,
                            "height":  this.height,
                            "showTranscripts": this.showTranscripts,
                            "showExons": this.showExons,
                            "showSNPTrack" : this.showSNPTrack
                    });

    if (this.genomeWidget != null){
            newGenomeWidget.trackList = this.genomeWidget.trackList;
            newGenomeWidget.dataAdapterList = this.genomeWidget.dataAdapterList;
            for ( var i = 0; i < newGenomeWidget.dataAdapterList.length; i++) {
                    newGenomeWidget.dataAdapterList.preloadSuccess = new Event();
                    newGenomeWidget.dataAdapterList.successed = new Event();
            }
    }

    return newGenomeWidget;
};



MasterSlaveGenomeViewer.prototype._drawMaster = function() {
//	this.genomeWidget = new GenomeWidget(this.id + "master", this.getMasterId(), {"pixelRatio":this.pixelRatio,  "width":this.width, "height":  this.height});
//	this.genomeWidget.draw(this.chromosome, this.getMasterStart(), this.getMasterEnd());
//	var _this = this;
//	this.genomeWidget.onClick.addEventListener(function (evt, feature){
//	    	console.log(feature);
//	});
//	
//	this.genomeWidget.markerChanged.addEventListener(function (evt, data){
//		_this.updateSlave(data);
//	});
	  this.genomeWidget = this._createMaster();
      this.genomeWidget.draw(this.chromosome, this.getMasterStart(), this.getMasterEnd());
      this._attachMasterEvents();

	
	
	
};

MasterSlaveGenomeViewer.prototype._attachMasterEvents = function() {
    var _this = this;
    this.genomeWidget.onClick.addEventListener(function (evt, feature){
//          console.log(feature);
    });

    this.genomeWidget.markerChanged.addEventListener(function (evt, data){
            _this.updateSlave(data);
            _this.chromosome = _this.genomeWidget.chromosome;
            _this.position = data;
            _this.markerChanged.notify();
    });
};


MasterSlaveGenomeViewer.prototype.addTrackMaster = function(track, dataAdapter) {
  this.genomeWidget = this._createMaster();
  this.genomeWidget.addTrack(track, dataAdapter);
//    this.masterGenomeWidget.draw(this.chromosome, this.getMasterStart(), this.getMasterEnd());
    this._attachMasterEvents();
};



MasterSlaveGenomeViewer.prototype._drawSlave = function(position) {
	DOM.removeChilds(this.getSlaveId());
	this.detailViewer = new SequenceGenomeWidget(this.id +"detail", this.getSlaveId(), {"width":this.width});
	this.detailViewer.draw(this.chromosome, position - 100, position + 100);
	
};

MasterSlaveGenomeViewer.prototype.draw = function(chromosome, position) {
	this.chromosome = chromosome;
	this.position = position;
	this.init();

	this._drawMaster();
	this._drawSlave(this.position);
};

MasterSlaveGenomeViewer.prototype.updateSlave = function(position) {
	this._drawSlave(position);
	this.detailViewer.trackCanvas._goToCoordinateX(position - ((this.detailViewer.trackCanvas.width/this.detailViewer.trackCanvas.pixelRatio)/2));
};// JavaScript Document
function KaryotypePanelWindow(species,args){
	var _this = this;
	this.id = "KaryotypePanelWindow_" + Math.random();
	this.karyotypeWidget = new KaryotypePanel(this.getKaryotypePanelId(), species, {"top":10, "width":1000, "height": 300, "trackWidth":15});
	this.karyotypeCellBaseDataAdapter = new KaryotypeCellBaseDataAdapter(species);
	
	this.args = args;
	
	this.onRendered = new Event();
	this.onMarkerChanged = new Event();
	
	this.karyotypeCellBaseDataAdapter.successed.addEventListener(function(evt, data){
		_this.karyotypeWidget.onRendered.addEventListener(function(evt, data){
			_this.onRendered.notify();
		});
		
		_this.karyotypeWidget.onClick.addEventListener(function(evt, data){
			_this.onMarkerChanged.notify(data);
		});
		
		_this.karyotypeWidget.draw(_this.karyotypeCellBaseDataAdapter.chromosomeNames, _this.karyotypeCellBaseDataAdapter.dataset.json);	

	});
	
};

KaryotypePanelWindow.prototype.select = function(chromosome, start, end){
	this.karyotypeWidget.select(chromosome, start, end);
};

KaryotypePanelWindow.prototype.mark = function(features){
	this.karyotypeWidget.mark(features);
};


KaryotypePanelWindow.prototype.draw = function(){
	if(this.panel==null){
		this.render();
	}
	this.panel.show();
};

KaryotypePanelWindow.prototype.getKaryotypePanel = function(){
	if(this.karyotypePanel==null){
		
		var helpLabel = Ext.create('Ext.toolbar.TextItem', {
			html:'<span class="dis">Click on chromosome to go</span>'
		});
		var infobar = Ext.create('Ext.toolbar.Toolbar',{dock: 'top'});
		infobar.add(helpLabel);
		
		this.karyotypePanel  = Ext.create('Ext.panel.Panel', {
			height:350,
			maxHeight:350,
			border:false,
			bodyPadding: 15,
			padding:'0 0 0 0',
			html:'<div id="' + this.getKaryotypePanelId() +'" ><div>',
			dockedItems: [infobar]
		});
	}
	return this.karyotypePanel;
};

KaryotypePanelWindow.prototype.render = function(){
	var _this = this;
	
	this.panel = Ext.create('Ext.ux.Window', {
		title: 'Karyotype',
		resizable:false,
		taskbar:Ext.getCmp(this.args.viewer.id+'uxTaskbar'),
		constrain:true,
		animCollapse: true,
		width: 1050,
		height: 412,
		minWidth: 300,
		minHeight: 200,
		layout: 'fit',
		items: [this.getKaryotypePanel()],
		buttonAlign:'center',
		buttons:[{ text: 'Close', handler: function(){_this.panel.close();}}],
 		listeners: {
	      	destroy: function(){
	       		delete _this.panel;
	      	}
    	}
	});
	this.karyotypeCellBaseDataAdapter.fill();
};

KaryotypePanelWindow.prototype.getKaryotypePanelId = function (){
	return this.id+"_karyotypePanel";	
};// JavaScript Document
function KaryotypePanel(targetID, species, args){
	this.id = targetID+Math.round(Math.random()*10000);
	this.targetId = targetID;
	
	this.species=species;
	
	this.width = 500;
	this.height = 300;
	
	
	if (args!=null){
		if (args.height!=null){
			this.height = args.height;
		}
		if (args.width!=null){
			this.width = args.width;
		}
		
		if (args.trackWidth!=null){
			this.trackWidth = args.trackWidth;
		}
		
	}
	
	//Events 
	this.onClick = new Event(this);
	this.onRendered = new Event(this);
	this.onMarkerClicked = new Event(this);
};


KaryotypePanel.prototype.getTrackId = function(index){
	return this.id + "_track_" + index;
};


KaryotypePanel.prototype.init = function(){
	
	this.containerTable = DOM.createNewElement("table", DOM.select(this.targetId), [["id", this.id+"_table"], ["width", this.width], ["height", this.height]]);
	tr = DOM.createNewElement("tr", this.containerTable, [["width", this.width],["style", "vertical-align:bottom"]]);
	for ( var i = 0; i < this.features.length; i++) {
		var td = DOM.createNewElement("td", tr, [["style", "vertical-align:bottom"],["id", this.getTrackId(i)]]);
	}
};

KaryotypePanel.prototype.drawFeatures = function(){
	var _this = this;
	var size = this.width/this.features.length;
	
		this.panels = new Object();
		for ( var i = 0; i < this.features.length; i++) {
				var bottom = (this.chromosomeSize[i] * this.height) - 10;
				
				var verticalTrack =  new ChromosomeFeatureTrack(this.id + "chr" + this.chromosomesNames[i], document.getElementById( this.getTrackId(i)), this.species,{
					top:10, 
					bottom:bottom, 
					left:12, 
					right:25,  
					width: size, 
					height: this.chromosomeSize[i] * this.height,
					 "labelChromosome":true, 
					 label:true, 
					 "vertical":true, 
					 "rounded":2,
					 "backgroundcolor":"yellow"	
				});	
				_this.panels[this.chromosomesNames[i]] = verticalTrack;
				
				var dataset = new DataSet();
				dataset.loadFromJSON([this.features[i]]);
				verticalTrack.draw(dataset);
				
				_this.panels[this.chromosomesNames[i]].click.addEventListener(function (evt, cytoband){
					var position = (cytoband.end - cytoband.start)/2 + cytoband.start;
					_this.select(cytoband.chromosome, position, position + 2000000 );
					_this.onClick.notify(cytoband);
				});
				
				_this.panels[this.chromosomesNames[i]].onMarkerClicked.addEventListener(function (evt, feature){
					_this.onMarkerClicked.notify(feature);
				});
				
		}
		this.onRendered.notify();
};

KaryotypePanel.prototype.select = function(chromosome, start, end){
	for ( var i = 0; i < this.chromosomesNames.length; i++) {
		this.panels[this.chromosomesNames[i]].deselect();
	}
	
	this.panels[chromosome].select(start, end);
};

KaryotypePanel.prototype.mark = function(features, color){
	
	for ( var i = 0; i < features.length; i++) {
		if (this.panels[features[i].chromosome] != null){
			this.panels[features[i].chromosome].mark(features[i], color);
		}
	}
};

KaryotypePanel.prototype.unmark = function(){
	for (var panel in this.panels){
		this.panels[panel].unmark();
	}
		
};


KaryotypePanel.prototype.draw = function(names, chromosomes){
	this.features = chromosomes;
	this.chromosomesNames = names;
	
	this.chromosomeSize = new Array();
	this.maxChromosomeSize = 0;
	for ( var i = 0; i < this.features.length; i++) {
		this.chromosomeSize.push(this.features[i][this.features[i].length-1].end);
		if (this.maxChromosomeSize < this.features[i][this.features[i].length-1].end){
			this.maxChromosomeSize = this.features[i][this.features[i].length-1].end;
		}
	}
	
	for ( var i = 0; i < this.features.length; i++) {
		this.chromosomeSize[i] = (this.chromosomeSize[i] / this.maxChromosomeSize);
	}
	
	this.init();
	this.drawFeatures();
};

function TooltipPanel(args){
	this.id = "TooltipPanel" + Math.round(Math.random()*10000000);
	this.targetId = null;
	this.width = 100;
	this.height = 60;
	
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
};

TooltipPanel.prototype.getPanel = function(item){
	var _this=this;
	
	if (this.panel == null){
		this.panel = Ext.create('Ext.tip.Tip',{
			html:this._getItemInfo(item)
		});
	}	
	return this.panel;
};

TooltipPanel.prototype.destroy = function(){
	this.panel.destroy();
};

TooltipPanel.prototype._getItemInfo = function(item){
//	console.log(item);
	var str = "";
	if(item instanceof GeneFeatureFormatter || 
	   item instanceof TranscriptFeatureFormatter || 
	   item instanceof ExonFeatureFormatter || 
	   item instanceof SNPFeatureFormatter|| 
	   item instanceof TfbsFeatureFormatter ){
		str = '<span class="ssel">'+item.getName()+'</span><br>'+
		'start: <span class="emph">'+item.start+'</span><br>'+
		'end:  <span class="emph">'+item.end+'</span><br>'+
		'length: <span class="info">'+(item.end-item.start+1)+'</span><br>';
		
	}
	if(item instanceof VCFFeatureFormatter){
		str = '<span class="ssel">'+item.getName()+'</span><br>';
	}
	return str;
};
function KaryotypeHorizontalMarkerWidget(){
	this.id = "GV_";
	this.width = 600;
	this.height = 700;
	this.tabPanelHeight = 250;
	this.topPanelHeight = 600;

	
//	this.karyotypeWidget = new KaryotypePanel("human", "container_map_karyotype", {"width":this.width, "height": this.tabPanelHeight - 50, "trackWidth":15});
	this.genomeWidget = new GenomeWidget("id", "container_map", {width:100,  "height":this.topPanelHeight} );
	

	var _this = this;
//	this.karyotypeWidget.onClick.addEventListener(function (evt, feature){
////		_this.genomeWidget.draw(feature.chromosome, feature.start);
//		_this.goTo(feature.chromosome, feature.start);
//	});

	this.genomeWidgetProperties = new GenomeWidgetProperties({windowSize:1000000, pixelRatio: 0.00001});
	
	var sequenceTrack =  new SequenceFeatureTrack( this.id + "sequence", this.tracksPanel, {
		top:0, 
		left:0, 
		right:this.width,  
		width:this.width, 
		height:20, 
		featureHeight:12, 
		avoidOverlapping : false,
		backgroundColor: '#FFFFFF'
	});
	this.genomeWidgetProperties.addTrackByZoom(100, 100, sequenceTrack, new RegionCellBaseDataAdapter({resource: "sequence"}));
	
//	var snpTrack =  new SNPFeatureTrack( this.id + "_snp",  this.tracksPanel, {
//		top:0, 
//		left:0, 
//		right:this.width,  
//		width:this.width, 
//		height:30, 
//		featureHeight:10, 
//		opacity : 1,
//		avoidOverlapping : true,
//		pixelSpaceBetweenBlocks: 100,
//		backgroundColor: '#FFFFFF'
//	});
//	this.genomeWidgetProperties.addTrackByZoom(100, 100, snpTrack, new RegionCellBaseDataAdapter({resource: "snp"}));
	
	var cytobandTrack =  new CytobandFeatureTrack( this.id + "_cytoband",  this.tracksPanel, {
		top:0, 
		left:0, 
		height:20, 
		title:"Cytoband",
		titleFontSize:9,
		label:false,
		featureHeight:8, 
		opacity : 1,
		backgroundColor: '#FFFFFF'
	});
	this.genomeWidgetProperties.addTrackByZoom(0, 0, cytobandTrack, new RegionCellBaseDataAdapter({resource: "cytoband"}));
	var cytobandTrack2 =  new CytobandFeatureTrack( this.id + "_cytoband",  this.tracksPanel, {
		top:0, 
		left:0, 
		height:20, 
		title:"Cytoband",
		titleFontSize:9,
		label:true,
		featureHeight:8, 
		opacity : 1,
		backgroundColor: '#FFFFFF'
	});
	this.genomeWidgetProperties.addTrackByZoom(10, 100, cytobandTrack2, new RegionCellBaseDataAdapter({resource: "cytoband"}));
	
	
	 var multitrack = new HistogramFeatureTrack( this.id +"_multiTrack", this.tracksPanel, {
		 	top:5, 
			left:0, 
			height:20, 
			featureHeight:18, 
			queueHeight : 18,
			title:"GENES",
			titleFontSize:9,
			showTranscripts: false,
			allowDuplicates:true,
			backgroundColor: '#FFFFFF', 
			label:false,
			pixelSpaceBetweenBlocks : 1,
			showDetailGeneLabel:false,
			forceColor: "blue",
			intervalSize:1000000
		});

	this.genomeWidgetProperties.addTrackByZoom(0, 0, multitrack, new GeneRegionCellBaseDataAdapter({obtainTranscripts:false}));
	
	 var multitrack = new HistogramFeatureTrack( this.id +"_multiTrack", this.tracksPanel, {
		 	top:5, 
			left:0, 
			height:20, 
			featureHeight:18, 
			queueHeight : 18,
			title:"GENES",
			titleFontSize:9,
			showTranscripts: false,
			allowDuplicates:true,
			backgroundColor: '#FFFFFF', 
			label:false,
			pixelSpaceBetweenBlocks : 1,
			showDetailGeneLabel:false,
			forceColor: "blue",
			intervalSize:100000
		});

	this.genomeWidgetProperties.addTrackByZoom(10, 10, multitrack, new GeneRegionCellBaseDataAdapter({obtainTranscripts:false}));
	
	 var multitrack3 = new MultiFeatureTrack( this.id +"_multiTrack", this.tracksPanel, {
		 	top:5, 
			left:0, 
			height:10, 
			featureHeight:7, 
			queueHeight : 10,
			title:"GENES",
			titleFontSize:9,
			showTranscripts: false,
			allowDuplicates:false,
			backgroundColor: '#FFFFFF', 
			label:false,
			pixelSpaceBetweenBlocks : 1,
			showDetailGeneLabel:false
		});

	this.genomeWidgetProperties.addTrackByZoom(20, 40, multitrack3, new GeneRegionCellBaseDataAdapter({obtainTranscripts:false}));
	
	 var multitrack4 = new MultiFeatureTrack( this.id +"_multiTrack", this.tracksPanel, {
		 top:5,  
			left:0, 
			height:10, 
			featureHeight:7, 
			queueHeight : 10,
			title:"GENES",
			titleFontSize:9,
			showTranscripts: false,
			allowDuplicates:false,
			backgroundColor: '#FFFFFF', 
			label:true,
			pixelSpaceBetweenBlocks : 200,
			showDetailGeneLabel:false
		});

	this.genomeWidgetProperties.addTrackByZoom(50, 60, multitrack4, new GeneRegionCellBaseDataAdapter({obtainTranscripts:false}));
	
	
	 var multitrack2 = new MultiFeatureTrack( this.id +"_multiTrack", this.tracksPanel, {
		 top:5,  
			left:0, 
			height:10, 
			featureHeight:6, 
			queueHeight : 10,
			title:"GENES",
			titleFontSize:9,
			labelFontSize:8,
			showTranscripts: true,
			allowDuplicates:false,
			backgroundColor: '#FFFFFF', 
			label:true,
			pixelSpaceBetweenBlocks : 200,
			showDetailGeneLabel:true
		});
	this.genomeWidgetProperties.addTrackByZoom(70, 90, multitrack2, new GeneRegionCellBaseDataAdapter());
};






KaryotypeHorizontalMarkerWidget.prototype.draw = function(chromosome, position){
	
	
	this.chromosome = chromosome;
	this.position = position;

	
	var center = Ext.create('Ext.panel.Panel', {
		layout : 'vbox',
		region: 'center',
		margins:'0 0 0 5',
		items:[
//		       this.getMainMenu(),
		       this.getTopPanel()
//		       this.getMiddleMenu(),
//		       this.getBotPanel()
		      ]
	});


	var port = Ext.create('Ext.container.Viewport', {
		layout: 'border',
		items: [
		        center
		        ]
	});


//	this.genomeWidget.draw(this.chromosome, this.position);
	this._drawMasterKaryotypeHorizontalMarkerWidget(this.chromosome,this.position - (this.genomeWidgetProperties.windowSize), this.position + (this.genomeWidgetProperties.windowSize));
	
	

};




/** Drawing master Genome Viewer **/
KaryotypeHorizontalMarkerWidget.prototype.getMasterId = function() {
	return this.id + "_master";
};

KaryotypeHorizontalMarkerWidget.prototype.zoom = function(value) {
//	for ( var i = 0; i < this.genomeWidgetProperties.getTrackByZoom(value).length; i++) {
//		this.genomeWidgetProperties.windowSize = this.genomeWidgetProperties.minWindowSize;
//		this.genomeWidgetProperties._pixelRatio = 10; 
//		this.addMasterTrack(this.genomeWidgetProperties.getTrackByZoom(value)[i], this.genomeWidgetProperties.getDataAdapterByZoom(value)[i]);
//	}
	this.position = this.genomeWidget.getMiddlePoint();
	this.refreshMasterKaryotypeHorizontalMarkerWidget();
	this.genomeWidget.trackCanvas._goToCoordinateX( this.position - (this.genomeWidget.trackCanvas.width/2) / this.genomeWidgetProperties.getPixelRatio());
};

KaryotypeHorizontalMarkerWidget.prototype.goTo = function(chromosome, position) {
	this.chromosome = chromosome;
	this.position = position;
	this.refreshMasterKaryotypeHorizontalMarkerWidget();
};

KaryotypeHorizontalMarkerWidget.prototype.refreshMasterKaryotypeHorizontalMarkerWidget = function() {
	this.genomeWidget.clear();
//	this._drawMasterKaryotypeHorizontalMarkerWidget(this.chromosome,this.position - (this.genomeWidgetProperties.windowSize), this.position + (this.genomeWidgetProperties.windowSize));
	this._drawMasterKaryotypeHorizontalMarkerWidget();
};

KaryotypeHorizontalMarkerWidget.prototype.addMasterTrack = function(track, dataAdapter) {
	this.genomeWidgetProperties.getCustomTracks().push(track);
	this.genomeWidgetProperties.getCustomDataAdapters().push(dataAdapter);
	this._drawMasterKaryotypeHorizontalMarkerWidget();
//	this.position = this.genomeWidget.getMiddlePoint();
//	this.refreshMasterKaryotypeHorizontalMarkerWidget();
//	this.genomeWidget.trackCanvas._goToCoordinateX( this.position - (this.genomeWidget.trackCanvas.width/2) / this.genomeWidgetProperties.pixelRatio);
	
//	this.zoom(0);
};

KaryotypeHorizontalMarkerWidget.prototype._drawMasterKaryotypeHorizontalMarkerWidget = function() {
		var _this = this;
		this.genomeWidget = new GenomeWidget(this.id + "master", this.getMasterId(), {
		                pixelRatio: 0.000002,//this.genomeWidgetProperties.getPixelRatio(),
		                width:this.width,
		                height:  this.height
		        });

		/** Reseteamos las propiedades top y height a los originales asi como los datasets **/
		for ( var i = 0; i < this.genomeWidgetProperties.getCustomTracks().length; i++) {
			this.genomeWidgetProperties.getCustomTracks()[i].top = this.genomeWidgetProperties.getCustomTracks()[i].originalTop;
			this.genomeWidgetProperties.getCustomTracks()[i].height = this.genomeWidgetProperties.getCustomTracks()[i].originalHeight;
			this.genomeWidgetProperties.getCustomTracks()[i].clear();
			this.genomeWidgetProperties.getCustomDataAdapters()[i].datasets = new Object();
			this.genomeWidget.addTrack(this.genomeWidgetProperties.getCustomTracks()[i], this.genomeWidgetProperties.getCustomDataAdapters()[i]);
			
		 }
		
		var zoom = this.genomeWidgetProperties.getZoom();

		for ( var i = 0; i < this.genomeWidgetProperties.getTrackByZoom(zoom).length; i++) {
			var track =  this.genomeWidgetProperties.getTrackByZoom(zoom)[i];
			track.top = track.originalTop;
			track.height = track.originalHeight;
			track.clear();
			
			this.genomeWidgetProperties.getDataAdapterByZoom(zoom)[i].datasets = new Object();
			this.genomeWidget.addTrack(track, this.genomeWidgetProperties.getDataAdapterByZoom(zoom)[i]);
			
		}
		
		
		var start = Math.ceil(this.position - (this.genomeWidgetProperties.windowSize));
		var end = Math.ceil(this.position +  (this.genomeWidgetProperties.windowSize));
		
		if (start < 0){ start = 0;}
		
		this.genomeWidget.draw(this.chromosome, start, end);
		
		
};


/** PANELS**/
KaryotypeHorizontalMarkerWidget.prototype.getTopPanel = function() {	
	return Ext.create('Ext.panel.Panel', {
							width: this.width,
							height: this.topPanelHeight,
							margins:'0 5 2 5',
							html:'<div id = "'+ this.getMasterId() +'"></div>'
	});
};
function GenomeWidgetProperties(species,args) {
	this.args = args;
	
	this.species=species;
	this.windowSize = 10000000;
	
	this.minWindowSize = 100;
	this.maxWindowSize = 100000000;
	
	this._pixelRatio = 0.0005; 
	this.showTranscripts = false;
	
	this._zoom = 0;
    
	/** General parameters TRACKS CONFIG **/
	this.labelHeight = 10;
	this.labelSize = 10;
	this.featureHeight = 4;
	
	if (args != null){
		if (args.windowSize != null){
			this.windowSize = args.windowSize;
		}
		if (args.id != null){
			this.id = args.id;
		}
		
		if (args._pixelRatio != null){
			this._pixelRatio = args._pixelRatio;
		}
		
		if (args.showTrancsripts != null){
			this.showTrancsripts = args.showTranscripts;
		}
		
		if (args.showExons != null){
			this.showExons = args.showExons;
		}
	}
	
	this._zoomLevels = new Object();
	this._windowSizeLevels = new Object();
	this._zoomTracks = new Object();
	this._zoomDataAdapters = new Object();
	
	for ( var i = 0; i <= 100; i = i + 10) { 
		this._zoomTracks[i] = new Array();
		this._zoomDataAdapters[i] = new Array();
	}
	
	this.tracks = new Object();
	this.customTracks = new Array();
	this.customDataAdapters = new Array();
	this.init();
};

GenomeWidgetProperties.prototype.getWindowSize = function(zoomFactor){
	return this._windowSizeLevels[zoomFactor];
};
GenomeWidgetProperties.prototype.init = function(){
	this._zoomLevels[0] =  1/200000;
	this._zoomLevels[10] = 1/50000;
//	this._zoomLevels[20] = 1/25000;
//	this._zoomLevels[30] =  0.00005*16;
	this._zoomLevels[20] = 0.00005*16;
	this._zoomLevels[30] = 0.00005*16;
	this._zoomLevels[40] = 0.00005*64;
	this._zoomLevels[50] = 0.00005*128;
	this._zoomLevels[60] = 0.00005*256;
	this._zoomLevels[70] = 0.00005*512;
	this._zoomLevels[80] = 0.00005*1024;
	this._zoomLevels[90] = 0.00005*2048;
	this._zoomLevels[100] = 10;
	
	this._windowSizeLevels[0] = 130000000;
	this._windowSizeLevels[10] = 40000000;
//	this._windowSizeLevels[20] = 20000000;
//	this._windowSizeLevels[30] = 750000;
	this._windowSizeLevels[20] = 750000;
	this._windowSizeLevels[30] = 750000;
	this._windowSizeLevels[40] = 750000/4;
	this._windowSizeLevels[50] = 750000/8;
	this._windowSizeLevels[60] = 750000/16;
	this._windowSizeLevels[70] = 750000/32;
	this._windowSizeLevels[80] = 750000/64;
	this._windowSizeLevels[90] = 750000/128;
	this._windowSizeLevels[100] = 100;
	
	this._zoom =  40;
	this._pixelRatio = this._zoomLevels[this._zoom];
	this.windowSize = this._windowSizeLevels[this._zoom];

	
	for ( var i = 0; i <= 100; i = i + 10) {
		  var rule = new RuleFeatureTrack( this.id + "_ruleTrack", this.tracksPanel, this.species,{
				top:10, 
				left:0, 
				height:20, 
				expandRuleHeight : 1500,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				floating:true
//				title:'Ruler'
			});
		
		  this.addTrackByZoom(i, i, rule, new RuleRegionDataAdapter({pixelRatio: this._zoomLevels[i]}));
	}
	this.addNativeTracks();

};

GenomeWidgetProperties.prototype.setLabelHeight = function(value){
//labelHeight : this.labelHeight,
//featureHeight : 10,
//labelSize : this.labelSize,
	for ( var zoom in this._zoomTracks) {
		var tracks = this._zoomTracks[zoom];
		for ( var j = 0; j < tracks.length; j++) {
			tracks[j].labelHeight = value;
			tracks[j].labelSize = value;
		}
//		console.log(tracks);
	}
	
};


GenomeWidgetProperties.prototype.addCustomTrackByZoom = function(minZoom, maxZoom, track, dataAdapter){
	if (track.titleName.length > 5) {
		track.titleWidth = track.titleName.length * 5;
	}
	else{
		track.titleWidth = 25;
	}
	
	this.customTracks.push(track);
	
	if ((track instanceof HistogramFeatureTrack) == false && (track instanceof SNPFeatureTrack) == false){
		track.labelHeight = this.labelHeight;
		track.featureHeight = this.featureHeight;
	}
	
	this.addTrackByZoom(minZoom, maxZoom, track, dataAdapter);
};

GenomeWidgetProperties.prototype.addTrackByZoom = function(minZoom, maxZoom, track, dataAdapter){
	if (this.tracks[track.titleName] == null){
		this.tracks[track.titleName] = true;
	}
	
	for ( var i = minZoom; i <= maxZoom; i = i + 10) { 
		this._zoomTracks[i].push(track);
		this._zoomDataAdapters[i].push(dataAdapter);
	}
};

GenomeWidgetProperties.prototype.getTrackByZoom = function(zoom){
	var tracksByZoomVisible = new Array();
	for ( var i = 0; i < this._zoomTracks[zoom].length; i++) {
		if (this.tracks[this._zoomTracks[zoom][i].titleName] == true){
			tracksByZoomVisible.push(this._zoomTracks[zoom][i]);
		}
	}
	return 	tracksByZoomVisible;
	
};

GenomeWidgetProperties.prototype.getDataAdapterByZoom = function(zoom){
	var tracksByZoomVisible = new Array();
	for ( var i = 0; i < this._zoomTracks[zoom].length; i++) {
		if (this.tracks[this._zoomTracks[zoom][i].titleName] == true){
			tracksByZoomVisible.push(this._zoomDataAdapters[zoom][i]);
		}
	}
	
	return 	tracksByZoomVisible;
};



GenomeWidgetProperties.prototype.getPixelRatio = function(){
	return this._zoomLevels[this.getZoom()];
};

GenomeWidgetProperties.prototype.setZoom = function(zoom){
	this._zoom = zoom;
	this._pixelRatio =  this.getPixelRatioByZoomLevel(this.getZoom());
	this.windowSize = this._windowSizeLevels[zoom];
};


GenomeWidgetProperties.prototype.getZoom = function(){
	return this._zoom;
};

GenomeWidgetProperties.prototype.getPixelRatioByZoomLevel = function(zoom){
	if(zoom == 100) return 10;
	return this._zoomLevels[zoom];
};

GenomeWidgetProperties.prototype.getCustomTracks = function(){
	return this.customTracks;
};

GenomeWidgetProperties.prototype.getCustomDataAdapters = function(){
	return this.customDataAdapters;
};


GenomeWidgetProperties.prototype.addNativeTracks = function(){
	this.addSequenceTracks();
	this.addSNPTracks();
	this.addCytobandTracks();
	this.addMultifeatureTracks();
	this.addTFBSTracks();
	this.addHistoneTracks();
	this.addPolymeraseTracks();
	this.addOpenChromatinTracks();
	this.addMirnaTargetTracks();
	
	this.addConservedRegionsTracks();
	
	/** Set visibility **/
	this.tracks["SNP"] = false;
	this.tracks["Sequence"] = false;
	this.tracks["Cytoband"] = false;
	
	this.tracks["Histone"] = false;
	this.tracks["Open Chromatin"] = false;
	this.tracks["Polymerase"] = false;
	this.tracks["TFBS"] = false;
	this.tracks["miRNA targets"] = false;
	//TODO doing
	this.tracks["Conserved regions"] = false;
};


/** SNP TRACKS **/
GenomeWidgetProperties.prototype.addSNPTracks = function(){
		var snpTrack = new SNPFeatureTrack(this.id + "snp",this.tracksPanel, this.species, {
			top : 5,
			left : 0,
			label : true,
			title : "SNP",
			height : 20,
			isAvalaible : false
		});
		this.addTrackByZoom(0, 80, snpTrack,new RegionCellBaseDataAdapter(this.species,{resource : "snp"}));
		
		var snpTrack = new SNPFeatureTrack(this.id + "snp",this.tracksPanel, this.species,{
			top : 5,
			left : 0,
			label : false,
			title : "SNP",
			height : 20,
			labelHeight : this.labelHeight,
			featureHeight : 10,
			labelSize : this.labelSize,
			pixelSpaceBetweenBlocks : 150,
			avoidOverlapping : false,
			backgroundColor : '#FFFFFF'
		});
		this.addTrackByZoom(90, 90, snpTrack,new RegionCellBaseDataAdapter(this.species,{resource : "snp"}));
		
		var snpTrack = new SNPFeatureTrack(this.id + "snp",this.tracksPanel, this.species,{
			top : 5,
			left : 0,
			label : true,
			title : "SNP",
			height : 20,
			labelHeight : this.labelHeight,
			featureHeight : 10,
			labelSize : this.labelSize,
			pixelSpaceBetweenBlocks : 150,
			avoidOverlapping : true,
			backgroundColor : '#FFFFFF'
		});
		this.addTrackByZoom(100, 100, snpTrack,new RegionCellBaseDataAdapter(this.species,{resource : "snp"}));
};

/** SEQUENCE TRACKS **/
GenomeWidgetProperties.prototype.addSequenceTracks = function(){
	var sequenceTrack = new SequenceFeatureTrack(this.id + "sequence", this.tracksPanel, this.species,{
		top : 20,
		title : "Sequence",
		height : 15,
		featureHeight : 12,
		avoidOverlapping : false,
		backgroundColor : '#FFFFFF',
		isAvalaible: false
	});
	this.addTrackByZoom(0, 90, sequenceTrack,new RegionCellBaseDataAdapter(this.species));
	
	var sequenceTrack = new SequenceFeatureTrack(this.id + "sequence", this.tracksPanel, this.species,{
				top : 20,
				title : "Sequence",
				height : 15,
				featureHeight : 12,
				avoidOverlapping : false,
				backgroundColor : '#FFFFFF'
	});
	this.addTrackByZoom(100, 100, sequenceTrack,new RegionCellBaseDataAdapter(this.species,{resource : "sequence"}));
};

/** CYTOBAND TRACKS **/
GenomeWidgetProperties.prototype.addCytobandTracks = function(){
	
	var cytobandTrack = new FeatureTrack(this.id + "_cytoband", this.tracksPanel, this.species,{
					top : 10,
					height : 20,
					labelHeight : this.labelHeight,
					featureHeight : this.featureHeight,
					labelSize : this.labelSize,
					title : "Cytoband",
					allowDuplicates : true,
					label : false
			});
	this.addTrackByZoom(0, 0, cytobandTrack,new RegionCellBaseDataAdapter(this.species,{resource : "cytoband"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_cytoband", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Cytoband",
				allowDuplicates : true,
				label : true
			});
	this.addTrackByZoom(10, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "cytoband"}));
};





/** MIRNA TARGETS **/
GenomeWidgetProperties.prototype.addMirnaTargetTracks = function(){
	var color = "#298A08";
//	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, {
//		top : 20,
//		left : 0,
//		height : 20,
//		featureHeight : 18,
//		title : "miRNA targets",
//		titleFontSize : 9,
//		titleWidth : 70,
//		showTranscripts : false,
//		allowDuplicates : true,
//		backgroundColor : '#FFFFFF',
//		label : false,
//		pixelSpaceBetweenBlocks : 1,
//		showDetailGeneLabel : false,
//		forceColor : color,
//		intervalSize : 500000,
//		isAvalaible : false
//		
//	});
//	this.addTrackByZoom(0, 0, multitrack,new RegionCellBaseDataAdapter({resource : "mirnatarget"}));
//	
//	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, {
//		top : 20,
//		left : 0,
//		height : 20,
//		featureHeight : 18,
//		title : "miRNA targets",
//		titleFontSize : 9,
//		titleWidth : 70,
//		showTranscripts : false,
//		allowDuplicates : true,
//		backgroundColor : '#FFFFFF',
//		label : false,
//		pixelSpaceBetweenBlocks : 1,
//		showDetailGeneLabel : false,
//		forceColor : color,
//		intervalSize : 250000,
//		isAvalaible : false
//	});
//	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter({resource : "mirnatarget"}));
//
//	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, {
//		top : 20,
//		left : 0,
//		height : 20,
//		featureHeight : 18,
//		title : "miRNA targets",
//		titleFontSize : 9,
//		titleWidth : 100,
//		backgroundColor : '#FFFFFF',
//		label : false,
//		pixelSpaceBetweenBlocks : 1,
//		forceColor : color,
//		intervalSize :125000/16,
//		isAvalaible : false
//	});
//	this.addTrackByZoom(20, 20, multitrack,new RegionCellBaseDataAdapter({resource : "mirnatarget"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs",this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "miRNA targets",
				allowDuplicates : false,
				label : false,
				pixelSpaceBetweenBlocks : 0,
				avoidOverlapping : true,
				isAvalaible : false
			});
	this.addTrackByZoom(0, 70, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "mirnatarget"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "miRNA targets",
				allowDuplicates : false,
				label : true,
				pixelSpaceBetweenBlocks : 100,
				avoidOverlapping : true,
				showLabelsOnMiddleMarker :true
			});
	this.addTrackByZoom(80, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "mirnatarget"}));
};

/** OPEN CHROMATIN **/
GenomeWidgetProperties.prototype.addOpenChromatinTracks = function(){
	var color = "#298A08";
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Open Chromatin",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 500000
	});
	this.addTrackByZoom(0, 0, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=open chromatin"}));
	
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Open Chromatin",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 250000
	});
	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=open chromatin"}));

	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Open Chromatin",
		titleFontSize : 9,
		titleWidth : 100,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		forceColor : color,
		intervalSize :125000/16
	});
	this.addTrackByZoom(20, 20, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=open chromatin"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Open Chromatin",
				allowDuplicates : true,
				label : false,
				pixelSpaceBetweenBlocks : 0,
				avoidOverlapping : true
			});
	this.addTrackByZoom(30, 90, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=open chromatin"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Open Chromatin",
				allowDuplicates : true,
				label : true,
				pixelSpaceBetweenBlocks : 100,
				avoidOverlapping : true,
				showLabelsOnMiddleMarker :true
			});
	this.addTrackByZoom(100, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=open chromatin"}));
	
};




/** Polymerasa **/
GenomeWidgetProperties.prototype.addPolymeraseTracks = function(){
	var color = "#298A08";
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Polymerase",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 500000
	});
	this.addTrackByZoom(0, 0, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Polymerase"}));
	
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Polymerase",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 250000
	});
	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Polymerase"}));
	

	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Polymerase",
		titleFontSize : 9,
		titleWidth : 70,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		forceColor : color,
		intervalSize :125000/16
	});
	this.addTrackByZoom(20, 20, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Polymerase"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Polymerase",
				allowDuplicates : true,
				label : false,
				pixelSpaceBetweenBlocks : 0,
				avoidOverlapping : true
			});
	this.addTrackByZoom(30, 90, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Polymerase"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Polymerase",
				allowDuplicates : true,
				label : true,
				pixelSpaceBetweenBlocks : 100,
				avoidOverlapping : true
			});
	this.addTrackByZoom(100, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Polymerase"}));
	
};




/** HISTONES **/
GenomeWidgetProperties.prototype.addHistoneTracks = function(){
	var color = "#298A08";
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 40,
		featureHeight : 40,
		title : "Histone",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color
//		intervalSize : 500000
	});
//	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter({resource : "gene?histogram=true&interval=125000"}));
	this.addTrackByZoom(0, 0, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=HISTONE&histogram=true&interval=250000"}));
	
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 40,
		featureHeight : 40,
		title : "Histone",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 250000
	});
//	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter({resource : "regulatory?type=HISTONE"}));
	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=HISTONE&histogram=true&interval=125000"}));
	

	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Histone",
		titleFontSize : 9,
		titleWidth : 70,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		forceColor : color,
		intervalSize :125000/16
	});
	this.addTrackByZoom(20, 20, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=HISTONE"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Histone",
				allowDuplicates : true,
				label : false,
				pixelSpaceBetweenBlocks : 0,
				avoidOverlapping : true
			});
	this.addTrackByZoom(30, 90, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=HISTONE"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Histone",
				allowDuplicates : true,
				label : true,
				pixelSpaceBetweenBlocks : 100,
				avoidOverlapping : true
			});
	this.addTrackByZoom(100, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=HISTONE"}));
	
};

/** TFBS TRACKS **/
GenomeWidgetProperties.prototype.addTFBSTracks = function(){
	var color = "#298A08";
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "TFBS",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 500000
	});
	this.addTrackByZoom(0, 0, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "tfbs"}));
	
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "TFBS",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 250000
	});
	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "tfbs"}));
	

	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "TFBS",
		titleFontSize : 9,
		titleWidth : 70,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		forceColor : color,
		intervalSize :125000/16
	});
	this.addTrackByZoom(20, 20, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "tfbs"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "TFBS",
				allowDuplicates : true,
				label : false,
				pixelSpaceBetweenBlocks : 0,
				avoidOverlapping : true
			});
	this.addTrackByZoom(30, 90, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "tfbs"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "TFBS",
				allowDuplicates : true,
				label : true,
				pixelSpaceBetweenBlocks : 100,
				avoidOverlapping : true
			
			});
	this.addTrackByZoom(100, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "tfbs"}));
	
};



/** CONSERVED REGIONS **/  //TODO
GenomeWidgetProperties.prototype.addConservedRegionsTracks = function(){
	var cytobandTrack2 = new FeatureTrack(this.id + "_conservedregion", this.tracksPanel, this.species,{
		top : 10,
		height : 20,
		labelHeight : this.labelHeight,
		featureHeight : this.featureHeight,
		labelSize : this.labelSize,
		allowDuplicates : true,
		label : false,
		titleWidth : 92,
		pixelSpaceBetweenBlocks : 0,
		avoidOverlapping : true,
		title : 'Conserved regions'
	});
	this.addTrackByZoom(0, 50, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "conservedregion"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_conservedregion", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				allowDuplicates : true,
				label : true,
				titleWidth : 92,
				pixelSpaceBetweenBlocks : 0,
				avoidOverlapping : true,
				title : 'Conserved regions'
			});
	this.addTrackByZoom(60, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "conservedregion"}));
	
};




/** MULTIFEATURE TRACKS **/
GenomeWidgetProperties.prototype.addMultifeatureTracks = function(){
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 40,
		featureHeight : 40,
		title : "Gene/Transcript",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : "blue"
//		intervalSize : 500000
	});
	this.addTrackByZoom(0, 10, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "gene?histogram=true&interval=250000"}));
//	this.addTrackByZoom(0, 0, multitrack,new GeneRegionCellBaseDataAdapter({obtainTranscripts : false}));
	
//	var multitrack1 = new HistogramFeatureTrack(this.id + "_multiTrack",
//			this.tracksPanel, {
//				top : 20,
//				left : 0,
//				height : 40,
//				featureHeight : 40,
//				title : "Gene/Transcript",
//				titleFontSize : 9,
//				titleWidth : 70,
//				showTranscripts : false,
//				allowDuplicates : true,
//				backgroundColor : '#FFFFFF',
//				label : false,
//				pixelSpaceBetweenBlocks : 1,
//				showDetailGeneLabel : false,
//				forceColor : "blue"
////				intervalSize : 150000
//			});
//	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter({resource : "gene?histogram=true&interval=125000"}));
//	this.addTrackByZoom(10, 10, multitrack1,new GeneRegionCellBaseDataAdapter({obtainTranscripts : false}));
	
	
	var multitrack2 = new MultiFeatureTrack(this.id + "_multiTrack", this.tracksPanel, this.species,{
				top : 20,
				left : 0,
				height : 10,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				
				title : "Gene/Transcript",
				titleWidth : 70,
				titleFontSize : 9,
				showTranscripts : false,
				allowDuplicates : false,
				backgroundColor : '#FFFFFF',
				label : false,
				pixelSpaceBetweenBlocks : 1,
				showDetailGeneLabel : false,
				isAvalaible : true
			});

	this.addTrackByZoom(20, 20, multitrack2,new GeneRegionCellBaseDataAdapter(this.species,{obtainTranscripts : false}));
	
	var multitrack2 = new MultiFeatureTrack(this.id + "_multiTrack", this.tracksPanel, this.species,{
				top : 20,
				left : 0,
				height : 10,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				
				title : "Gene/Transcript",
				titleWidth : 70,
				titleFontSize : 9,
				showTranscripts : false,
				allowDuplicates : false,
				backgroundColor : '#FFFFFF',
				label : true,
				pixelSpaceBetweenBlocks : this.labelSize * 7,
				showDetailGeneLabel : false,
				isAvalaible : true
			});

	this.addTrackByZoom(30, 40, multitrack2,new GeneRegionCellBaseDataAdapter(this.species,{obtainTranscripts : false}));

	var multitrack3 = new MultiFeatureTrack(this.id + "_multiTrack", this.tracksPanel, this.species,{
				top : 20,
				left : 0,
				height : 10,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Gene/Transcript",
				titleFontSize : 9,
				titleWidth : 70,
				showTranscripts : false,
				allowDuplicates : false,
				backgroundColor : '#FFFFFF',
				label : true,
				pixelSpaceBetweenBlocks : 200,
				showDetailGeneLabel : true
			});

	this.addTrackByZoom(50, 60, multitrack3,new GeneRegionCellBaseDataAdapter(this.species,{obtainTranscripts : false}));

	var multitrack4 = new MultiFeatureTrack(this.id + "_multiTrack", this.tracksPanel, this.species,{
				top : 20,
				left : 0,
				height : 10,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Gene/Transcript",
				titleWidth : 70,
				titleFontSize : 9,
				showTranscripts : true,
				showExonLabel : false,
				allowDuplicates : false,
				backgroundColor : '#FFFFFF',
				label : true,
				pixelSpaceBetweenBlocks : 200,
				showDetailGeneLabel : true
			});

	this.addTrackByZoom(70, 70, multitrack4,new GeneRegionCellBaseDataAdapter(this.species,{obtainTranscripts : true}));
	
	var multitrack4 = new MultiFeatureTrack(this.id + "_multiTrack", this.tracksPanel, this.species,{
				top : 20,
				left : 0,
				height : 10,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Gene/Transcript",
				titleWidth : 70,
				titleFontSize : 9,
				showTranscripts : true,
				showExonLabel : false,
				allowDuplicates : false,
				backgroundColor : '#FFFFFF',
				label : true,
				pixelSpaceBetweenBlocks : 200,
				showDetailGeneLabel : true
			});

	this.addTrackByZoom(80, 80, multitrack4,new GeneRegionCellBaseDataAdapter(this.species,{obtainTranscripts : true}));

	var multitrack5 = new MultiFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 10,
		left : 0,
		height : 10,
		labelHeight : this.labelHeight,
		featureHeight : this.featureHeight,
		labelSize : this.labelSize,
		title : "Gene/Transcript",
		titleWidth : 70,
		titleFontSize : 9,
		labelFontSize : 8,
		showTranscripts : true,
		allowDuplicates : false,
		backgroundColor : '#FFFFFF',
		label : true,
		pixelSpaceBetweenBlocks : 200,
		showDetailGeneLabel : true
	});
	this.addTrackByZoom(90, 90, multitrack5,new GeneRegionCellBaseDataAdapter(this.species));

	var multitrack5 = new MultiFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
				top : 10,
				left : 0,
				height : 10,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Gene/Transcript",
				titleWidth : 70,
				titleFontSize : 9,
				labelFontSize : 8,
				showTranscripts : true,
				allowDuplicates : false,
				backgroundColor : '#FFFFFF',
				label : true,
				pixelSpaceBetweenBlocks : 200,
				showDetailGeneLabel : true,
				showLabelsOnMiddleMarker :true,
				showExonLabel : true,
				onMouseOverShitExonTranscriptLabel:true
			});
	this.addTrackByZoom(100, 100, multitrack5,new GeneRegionCellBaseDataAdapter(this.species));
	
};





function GenomeWidget(trackerID, targetId,  args) {
	this.id = trackerID;
	this.targetId = targetId;
	
	this.pixelRatio = 0.001;
	
	this.width = 100;
	this.height = 500;
	
	/** Chromosome Position **/
	this.chromosome = null;
	this.start = null;
	this.end = null;
	this.viewBoxModule = 7000000;
	
	/** Drag and drop **/
	this.allowDragging = true;
	
//	this.ruleNotListenMoving = true;
	
	if (args != null){
		if (args.width != null){
			this.width = args.width;
		}
		if (args.height != null){
			this.height = args.height;
		}
		if (args.pixelRatio != null){
			this.pixelRatio = args.pixelRatio;
		}
		if (args.viewBoxModule != null){
			this.viewBoxModule = args.viewBoxModule;
		}
		
		if (args.allowDragging != null) {
			this.allowDragging = args.allowDragging;
		}
		
//		if (args.ruleNotListenMoving != null){
//			this.ruleNotListenMoving = args.ruleNotListenMoving;
//		}
	}
	
	 this.trackList = new Array();
     this.dataAdapterList = new Array();

     
	this.trackCanvas = null;
	
	/** EVENTS **/
	this.onMarkerChange = new Event(this);
	this.onClick = new Event(this);
	this.onRender = new Event(this);
	this.onMove = new Event(this);
	
};

GenomeWidget.prototype.clear = function() {
	this.trackCanvas.clear();
};

GenomeWidget.prototype.init = function(){
	DOM.removeChilds(this.targetId);
	this.tracksPanel = DOM.createNewElement("div", document.getElementById(this.targetId), [["id", "detail_tracks_container"]]);
};

GenomeWidget.prototype.getviewBoxModule = function(){
	var viewBoxModule = this.viewBoxModule;
	
	var counter = 2000000;
	while (((this.end*this.pixelRatio) % viewBoxModule) < ((this.start*this.pixelRatio) % viewBoxModule)){
		counter = counter + counter;
		viewBoxModule = parseFloat(viewBoxModule) + counter;
	}
	
	return viewBoxModule;
};

GenomeWidget.prototype.getMiddlePoint = function(){
	return this.trackCanvas.getMiddlePoint();
};

GenomeWidget.prototype.addTrack = function(track, dataAdapter){
    this.trackList.push(track);
    this.dataAdapterList.push(dataAdapter);
};

GenomeWidget.prototype.draw = function(chromosome, start, end){
	this.chromosome = chromosome;
	this.start = start;
	this.end = end;
	
	var _this = this;
	this.init();
	this.trackCanvas =  new TrackCanvas(this.id + "_canvas", document.getElementById(this.targetId), {
		top:0, 
		left:0, 
		right:this.width,  
		width:this.width, 
		height:this.height, 
		start: this.start, 
		end: this.end,
		backgroundColor: "#FFCCFF", 
		pixelRatio:this.pixelRatio,
		viewBoxModule: this.getviewBoxModule(),
		allowDragging :this.allowDragging
	});
	
    this.trackCanvas.init();
    
    this.trackCanvas.afterDrag.addEventListener(function (evt, data){
	});
    
    this.trackCanvas.onMove.addEventListener(function (evt, data){
    	_this.onMarkerChange.notify(data);
	});
    
    for ( var i = 0; i < this.trackList.length; i++) {
    	this.trackList[i].viewBoxModule = this.getviewBoxModule();
    	this.trackList[i].pixelRatio = this.pixelRatio;
    	this.trackList[i].targetID = document.getElementById(this.targetId);
    	    
    	 this.trackCanvas.addTrack(this.trackList[i], this.dataAdapterList[i]);
	}
    
    var _this = this;
    this.trackCanvas.onRender.addEventListener(function (evt){
		 _this.onRender.notify();
	 });
    
//    console.log(this.getviewBoxModule());
    this.trackCanvas.draw(this.chromosome, this.start, this.end);
    
   
};function LegendPanel(args){
	this.width = 200;
	this.height = 250;
	
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
	
	
};

LegendPanel.prototype.getColorItems = function(legend){
	panelsArray = new Array();
	
	for ( var item in legend) {
//		var color = legend[item].toString().replace("#", "");
//		var cp = new Ext.picker.Color();
//		cp.width = 20;
//		cp.colors = [color];

		var size=15;
		var color = Ext.create('Ext.draw.Component', {
        width: size,
        height: size,
        items:[{
				type: 'rect',
				fill: legend[item],
				x:0,y:0,
				width: size,
				height : size
				}]
		});
		
		//Remove "_" and UpperCase first letter
		var name = item.replace(/_/gi, " ");
		name = name.charAt(0).toUpperCase() + name.slice(1);
		
		var panel = Ext.create('Ext.panel.Panel', {
			height:size,
			border:false,
			flex:1,
			margin:"1 0 0 1",
		    layout: {type: 'hbox',align:'stretch' },
		    items: [color, {xtype: 'tbtext',text:name, margin:"1 0 0 3"} ]
		});
		
		panelsArray.push(panel);
	}
	
	return panelsArray;
};




LegendPanel.prototype.getPanel = function(legend){
	var _this=this;
	
	if (this.panel == null){
		
		var items = this.getColorItems(legend);
		
		this.panel  = Ext.create('Ext.panel.Panel', {
			bodyPadding:'0 0 0 2',
			border:false,
			layout: {
		        type: 'vbox',
		        align:'stretch' 
		    },
			items:items,
			width:this.width,
			height:items.length*20
		});		
	}	
	
	return this.panel;
};

LegendPanel.prototype.getButton = function(legend){
	var _this=this;
	
	if (this.button == null){
		
		this.button = Ext.create('Ext.button.Button', {
			text : this.title,
			menu : {
					items: [this.getPanel(legend)]
				}
		});
	}	
	return this.button;
	
	
};function LegendWidget(args){
	
	this.width = 300;
	this.height = 300;
	this.title = "Legend";
	
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
	
	this.legendPanel = new LegendPanel();
	
};

LegendWidget.prototype.draw = function(legend){
	var _this = this;
	if(this.panel==null){
		
		var item = this.legendPanel.getPanel(legend);
	
		this.panel = Ext.create('Ext.ux.Window', {
			title : this.title,
			resizable: false,
			constrain:true,
			closable:true,
			width: item.width+10,
			height: item.height+70,
			items : [item],
			buttonAlign:'right',
			 layout: {
		        type: 'hbox',
		        align:'stretch' 
		    },
			buttons:[
					{text:'Close', handler: function(){_this.panel.close();}}
			]
		});
	}
	this.panel.show();
	
	
};function GenomeViewer(targetId, species, args) {
	var _this=this;
	this.id = "GenomeViewer:"+ Math.round(Math.random()*10000);
	
	this.menuBar = null;
	
	// if not provided on instatiation
	this.width =  $(document).width();
	this.height = $(document).height();
	this.targetId=null;
	
	//Default species
	this.species="hsa";
	this.speciesName="Homo sapiens";
	
	//Setting paramaters
	if (targetId != null){
		this.targetId=targetId;
	}
	if (species != null) {
		this.species = species.species;
		this.speciesName = species.name;
		this.chromosome=species.chromosome;
		this.position=species.position;
	}
	if (args != null){
		if(args.description != null){
			args.description = "beta";
		}
		if(args.menuBar != null){
			this.menuBar = args.menuBar;
		}
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.pluginsMenu != null) {
			this.pluginsMenu = args.pluginsMenu;
		}
	}

	//Events i send
	this.onSpeciesChange = new Event();
	
	console.log(this.width+"x"+this.height);
	console.log(this.targetId);
	console.log(this.id);

	
	
	this.genomeWidget = null;// new GenomeWidget(this.id + "id",
//	this.chromosomeGenomeWidget = null;
	this.genomeWidgetProperties = new GenomeWidgetProperties(this.species,{
				windowSize : 1000000,
				pixelRatio : 0.0005,
				id:this.id
	});
	
	//Events i listen
	this.onSpeciesChange.addEventListener(function(sender,data){
		_this.setLocation(data.chromosome,data.position);
		_this.species=data.species;
		_this.speciesName=data.name;
		Ext.getCmp(_this.id+"speciesMenuButton").setText(_this.speciesName);
		Ext.example.msg('Species', _this.speciesName+' selected.');
		
		Ext.getCmp(_this.id + "chromosomeMenuButton").menu = _this._getChromosomeMenu();

		_this.genomeWidgetProperties = new GenomeWidgetProperties(_this.species,{
			windowSize : 1000000,
			pixelRatio : 0.0005,
			id:_this.id
		});

		if(_this.targetId!=null){
			_this.draw();
		}
	});
	
	this.customTracksAddedCount = 1;
	/** position molona 1: 211615616 **/
	$(window).resize(function(ev,width,height) {

	});	
	
	//TODO check first if chromosome exists on the new specie
	this.chromosome = 13;
	this.position = 32889611;
	
	
	this.drawing=0;
};
GenomeViewer.prototype.setMenuBar = function(menuBar){
	this.menuBar = menuBar;
};

GenomeViewer.prototype.draw = function(){
	if(this.targetId!=null){
		this._getPanel(this.width,this.height);
	}
	this._render();
	
	//this.setZoom(70);
	//this.setLocation(1, 211615616);
};

GenomeViewer.prototype._render = function() {
	var start = this.position - (this.genomeWidgetProperties.windowSize);
	var end = this.position + (this.genomeWidgetProperties.windowSize);
	
	this._drawGenomeViewer();
	
	this.drawChromosome(this.chromosome, start, end);
	this._setScaleLabels();
};


//Gets the panel containing all genomeViewer
GenomeViewer.prototype._getPanel = function(width,height) {
	var _this=this;
	if(this._panel == null){
		var items = [];
		if(this.menuBar!=null){
			items.push(this.menuBar);
		}
		items.push(this._getNavigationBar());
		items.push(this._getChromosomePanel());
		items.push(this._getWindowSizePanel());
		items.push(this._getTracksPanel());
		items.push(this._getBottomBar());
		
		this._panel = Ext.create('Ext.panel.Panel', {
			renderTo:this.targetId,
	    	border:false,
	    	width:width,
	    	height:height,
			cls:'x-unselectable',
			layout: { type: 'vbox',align: 'stretch'},
			region : 'center',
			margins : '0 0 0 0',
			border : false,
			items :items
		});
	}
	
	return this._panel;
};

GenomeViewer.prototype.setSize = function(width,height) {
	if(width<500){width=500;}
	if(width>2400){width=2400;}//if bigger does not work TODO why?
	this.width=width;
	this.height=height;
	this._getPanel().setSize(width,height);
	this.draw();
};


//NAVIGATION BAR
//Creates the species empty menu if not exist and returns it
GenomeViewer.prototype._getSpeciesMenu = function() {
	//items must be added by using  setSpeciesMenu()
	if(this._specieMenu == null){
		this._specieMenu = Ext.create('Ext.menu.Menu', {
			margin : '0 0 10 0',
			floating : true,
			items : []
		});
	}
	return this._specieMenu;
};
//Sets the species buttons in the menu
GenomeViewer.prototype.setSpeciesMenu = function(speciesObj) {
	var _this = this;
	//Auto generate menu items depending of AVAILABLE_SPECIES config
	var menu = this._getSpeciesMenu();
	menu.hide();//Hide the menu panel before remove
	menu.removeAll(); // Remove the old species
	for ( var i = 0; i < speciesObj.length; i++) {
		menu.add({
					text:speciesObj[i].name,
					speciesObj:speciesObj[i],
					handler:function(este){
						//can't use the i from the FOR so i create the object again
						_this.setSpecies(este.speciesObj);
				}
		});
	};
};
//Sets the new specie and fires an event
GenomeViewer.prototype.setSpecies = function(text){
	this.onSpeciesChange.notify(text);
};

GenomeViewer.prototype._getChromosomeMenu = function() {
	var _this = this;
	var chrStore= Ext.create('Ext.data.Store', {
		fields: ["name"],
		autoLoad:false
	});
	/*Chromolendar*/
 	var chrView = Ext.create('Ext.view.View', {
	    store : chrStore,
        selModel: {
            mode: 'SINGLE',
            listeners: {
                selectionchange:function(este,selNodes){
                	_this.setChromosome(selNodes[0].data.name);
                	chromosomeMenu.hide();
                }
            }
        },
        cls: 'list',
     	trackOver: true,
        overItemCls: 'list-item-hover',
        itemSelector: '.chromosome-item', 
        tpl: '<tpl for="."><div style="float:left" class="chromosome-item">{name}</div></tpl>'
//	        tpl: '<tpl for="."><div class="chromosome-item">chr {name}</div></tpl>'
    });
 	var chrContainer = Ext.create('Ext.container.Container', {
 		width:125,
//	 		height:300,
 		autoScroll:true,
 		style:'background-color:#fff',
 		items : [chrView]
 	});
	/*END chromolendar*/
 	
 	var chromosomeMenu = Ext.create('Ext.menu.Menu', {
//			width:100,
 		almacen :chrStore,
		items : [chrContainer]
	});
	
	//Load Chromosomes for his menu
	var karyotypeCellBaseDataAdapter = new KaryotypeCellBaseDataAdapter(this.species);
	karyotypeCellBaseDataAdapter.successed.addEventListener(function() {
		var chromosomeData = [];
		for (var i = 0; i < karyotypeCellBaseDataAdapter.chromosomeNames.length; i++) {
			chromosomeData.push({'name':karyotypeCellBaseDataAdapter.chromosomeNames[i]});
		}
		chrStore.loadData(chromosomeData);
		
	});
	karyotypeCellBaseDataAdapter.fill();
	
	return chromosomeMenu;
};


GenomeViewer.prototype._showKaryotypeWindow = function() {
	var _this = this;
	
	var karyotypePanelWindow = new KaryotypePanelWindow(this.species,{viewer:this});
	
	/** Events i listen **/
	karyotypePanelWindow.onRendered.addEventListener(function(evt, feature) {
		karyotypePanelWindow.select(_this.chromosome, _this.position, _this.position);
	});
	karyotypePanelWindow.onMarkerChanged.addEventListener(function(evt, data) {
		_this.setLocation(data.chromosome, data.start);
	});
	
	karyotypePanelWindow.draw();
};


GenomeViewer.prototype._getZoomSlider = function() {
	var _this = this;
	if(this._zoomSlider==null){
		this._zoomSlider = Ext.create('Ext.slider.Single', {
			id : this.id + ' zoomSlider',
			width : 200,
			minValue : 0,
			hideLabel : false,
			maxValue : 100,
			value : _this.genomeWidgetProperties.getZoom(),
			useTips : true,
			increment : 10,
			tipText : function(thumb) {
				return Ext.String.format('<b>{0}%</b>', thumb.value);
			}
		});
		
		this._zoomSlider.on("changecomplete", function(slider, newValue) {
			_this._handleNavigationBar("ZOOM", newValue);
		});
	}
	return this._zoomSlider;
};




//Action for buttons located in the NavigationBar
GenomeViewer.prototype._handleNavigationBar = function(action, args) {
	var _this = this;
    if (action == 'OptionMenuClick'){
            this.genomeWidget.showTranscripts = Ext.getCmp("showTranscriptCB").checked;
            this.genomeWidgetProperties.setShowTranscripts(Ext.getCmp("showTranscriptCB").checked);
            this.refreshMasterGenomeViewer();
    }
    if (action == 'ZOOM'){
    	this.setZoom(args);
    }
    if (action == 'GoToGene'){
        var geneName = Ext.getCmp(this.id+'tbGene').getValue();
        this.openGeneListWidget(geneName);
        
    }
    if (action == '+'){
    	   var zoom = this.genomeWidgetProperties.getZoom();
    	   if (zoom < 100){
    		   this.setZoom(zoom + 10);
    	   }
    }
    if (action == '-'){
    	 var zoom = this.genomeWidgetProperties.getZoom();
  	   if (zoom >= 10){
  		   this.setZoom(zoom - 10);
  	   }
    }
    
    if (action == 'Go'){
    	var value = Ext.getCmp(this.id+'tbCoordinate').getValue();
        var position = value.split(":")[1];
        this.chromosome = value.split(":")[0];
        
        this.setLocation(this.chromosome, position);
    }
    
    
    if (action == '<'){
        var position = Ext.getCmp(this.id+'tbCoordinate').getValue();
        this.setLocation(this.chromosome, this.position - (this.genomeWidgetProperties.windowSize/2));
    }
    
    
    if (action == '>'){
        var position = Ext.getCmp(this.id+'tbCoordinate').getValue();
        this.setLocation(this.chromosome, this.position + (this.genomeWidgetProperties.windowSize/2));
    }
};






GenomeViewer.prototype._getNavigationBar = function() {
	var _this = this;
	

	
	var toolbar = Ext.create('Ext.toolbar.Toolbar', {
		cls:"bio-toolbar",
		height:35,
		enableOverflow:true,//if the field is hidden getValue() reads "" because seems the hidden field is a different object
		border:0,
		items : [
		         {
		        	 id:this.id+"speciesMenuButton",
		        	 text : this.speciesName,
		        	 menu: this._getSpeciesMenu()			
		         },{
		        	 id: this.id + "chromosomeMenuButton",
		        	 text : 'Chromosome',
		        	 menu: this._getChromosomeMenu()			
		         },{
		        	 text : 'Karyotype',
		        	 handler:function() {
		        		 _this._showKaryotypeWindow();
		        	 }
		         },{
		        	 text : '<',
		        	 margin : '0 0 0 15',
		        	 handler : function() {
		        		 _this._handleNavigationBar('<');
		        	 }
		         }, {
		        	 margin : '0 0 0 5',
		        	 iconCls:'icon-zoom-out',
		        	 handler : function() {
		        		 _this._handleNavigationBar('-');
		        	 }
		         }, 
		         this._getZoomSlider(), 
		         {
		        	 margin:'0 5 0 0',
		        	 iconCls:'icon-zoom-in',
		        	 handler :  function() {
		        		 _this._handleNavigationBar('+');
		        	 }
		         },{
		        	 text : '>',
		        	 handler : function() {
		        		 _this._handleNavigationBar('>');
		        	 }
		         },'->',{
		        	 xtype : 'label',
		        	 text : 'Position:',
		        	 margins : '0 0 0 10'
		         },{
		        	 xtype : 'textfield',
		        	 id : this.id+'tbCoordinate',
		        	 text : this.chromosome + ":" + this.position,
		        	 listeners:{
		        		 specialkey: function(field, e){
		        			 if (e.getKey() == e.ENTER) {
		        				 _this._handleNavigationBar('Go');
		        			 }
		        		 }
		        	 }
		         },{
		        	 text : 'Go',
		        	 handler : function() {
		        		 _this._handleNavigationBar('Go');
		        	 }
		         },{
		        	 xtype : 'label',
		        	 text : 'Search:',
		        	 margins : '0 0 0 10'
		         },{
		        	 xtype : 'textfield',
		        	 id : this.id+'tbGene',
		        	 emptyText:'gene, protein, transcript',
		        	 name : 'field1',
		        	 listeners:{
		        		 specialkey: function(field, e){
		        			 if (e.getKey() == e.ENTER) {
		        				 _this._handleNavigationBar('GoToGene');
		        			 }
		        		 }
		        	 }
		         },{
		        	 text : 'Go',
		        	 handler : function() {
		        		 _this._handleNavigationBar('GoToGene');
		        	 }
		         }]
	});
	return toolbar;
};
//NAVIGATION BAR

//CHROMOSOME PANEL
//Sets the newChromosome and changes Location to same with on different chromosome
GenomeViewer.prototype.setChromosome = function(chromosome) {
	this.setLocation(chromosome, this.position);
	this._setChromosomeLabel(chromosome);
};
GenomeViewer.prototype._setChromosomeLabel = function(chromosome) {
//	var text = '<span class="ssel">'+this.species+'</span>'+"<br>Chromosome "+ chromosome;
	document.getElementById(this._getChromosomeLabelID()).innerHTML = "Chromosome&nbsp;"+ chromosome;
	Ext.getCmp(this.id + "chromosomeMenuButton").setText("Chromosome "+ chromosome );
};
//CHROMOSOME PANEL
GenomeViewer.prototype._getChromosomeContainerID = function() {
	return this.id + "container_map_one_chromosome";
};

GenomeViewer.prototype._getChromosomeLabelID = function() {
	return this.id + "chromosome_label_id";
};
GenomeViewer.prototype._getChromosomePanel = function() {
	
	var label = Ext.create('Ext.container.Container', {
		id:this._getChromosomeLabelID(),
		margin:5
	});
	var svg = Ext.create('Ext.container.Container', {
		id:this._getChromosomeContainerID(),
		margin:10
	});
	return Ext.create('Ext.container.Container', {
		height : 70,
	    layout: {type: 'table', columns: 2},
		items:[label,svg]
//		html : '<br/><table style="border:0px" ><tr><td id="'
//				+ this._getChromosomeLabelID()
//				+ '" style="padding-left: 8px">Chromosome&nbsp;15</td><td><div id="'
//				+ this._getChromosomeContainerID() + '"></td></tr></div>'
	});
};
//CHROMOSOME PANEL


//WINDOWSIZE PANEL
GenomeViewer.prototype._getWindowSizePanel = function() {
	var windowSizeLabel = Ext.create('Ext.toolbar.TextItem', {
		id:this.id+"windowSizeLabel",
		text:'window Size'
	});
	return Ext.create('Ext.container.Container', {
		style:'text-align:center;',
		height : 20,
		items:windowSizeLabel
	});
};
//WINDOWSIZE PANEL




//TOP PANEL
GenomeViewer.prototype._getTracksPanelID = function() {
	return this.id+"master";
};

GenomeViewer.prototype._getTracksPanel = function() {
	if (this._mainPanel == null) {
		this._mainPanel = Ext.create('Ext.panel.Panel', {
			autoScroll:true,
			flex: 1,  
			border:false,
//			margins:'0 5 2 0',
			html:'<div height=2000px; overflow-y="scroll"; id = "'+ this._getTracksPanelID() +'"></div>'
		});
	}
	return this._mainPanel;
};
//TOP PANEL


//BOTTOM BAR

GenomeViewer.prototype._getBottomBar = function() {
	var geneFeatureFormatter = new GeneFeatureFormatter();
	var snpFeatureFormatter = new SNPFeatureFormatter();
	var geneLegendPanel = new LegendPanel({title:'Gene legend'});
	var snpLegendPanel = new LegendPanel({title:'SNP legend'});
//	legendPanel.getPanel(geneFeatureFormatter.getBioTypeColors());
//	legendPanel.getColorItems(geneFeatureFormatter.getBioTypeColors());
	
	var scaleLabel = Ext.create('Ext.draw.Component', {
		id:this.id+"scaleLabel",
        width: 100,
        height: 20,
        items:[
            {type: 'text',text: 'Scale number',fill: '#000000',x: 10,y: 5,width: 5, height: 20},
            {type: 'rect',fill: '#000000',x: 0,y: 0,width: 2, height: 20},
			{type: 'rect',fill: '#000000',x: 2,y: 12, width: 100,height: 3},
			{type: 'rect',fill: '#000000',x: 101,y: 0, width: 2,height: 20}
		]
	});
//	scale.surface.items.items[0].setAttributes({text:'num'},true);
	var taskbar = Ext.create('Ext.toolbar.Toolbar', {
		id:this.id+'uxTaskbar',
		winMgr: new Ext.ZIndexManager(),
		enableOverflow:true,
		cls: 'bio-hiddenbar',
		height:28,
		flex:1
	});
	var legendBar = Ext.create('Ext.toolbar.Toolbar', {
		cls: 'bio-hiddenbar',
		width:300,
		height:28,
		items : [scaleLabel, 
		         '-',
		         geneLegendPanel.getButton(geneFeatureFormatter.getBioTypeColors()),
		         snpLegendPanel.getButton(snpFeatureFormatter.getBioTypeColors()),
		         '->']
	});
	
	var bottomBar = Ext.create('Ext.container.Container', {
		layout:'hbox',
		cls:"bio-botbar x-unselectable",
		height:30,
		items : [taskbar,legendBar]
	});
	return bottomBar;
};
//BOTTOM BAR





GenomeViewer.prototype.openListWidget = function(category, subcategory, query, resource, title, gridField) {
	var _this = this;
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function(evt, data) {
		
		var genomicListWidget = new GenomicListWidget({title:title, gridFields:gridField,viewer:_this});
		genomicListWidget.draw(cellBaseDataAdapter.dataset.toJSON(), query );
		
		genomicListWidget.onSelected.addEventListener(function(evt, feature) {
			if (feature != null) {
				if (feature.chromosome != null) {
					_this.setLocation(feature.chromosome, feature.start);
				}
			}
		});
		
		genomicListWidget.onTrackAddAction.addEventListener(function(evt, features) {
			if (features != null) {
				_this.addTrackFromFeatures(features);
			}
		});
	});
	cellBaseDataAdapter.fill(category, subcategory, query, resource);
};






GenomeViewer.prototype.openGeneListWidget = function(geneName) {
	this.openListWidget("feature", "gene", geneName.toString(), "info", "Gene List");
};

GenomeViewer.prototype.openTranscriptListWidget = function(name) {
	this.openListWidget("feature", "transcript", name.toString(), "info", "Transcript List", ["externalName","stableId", "biotype", "chromosome", "start", "end", "strand", "description"]);
};

GenomeViewer.prototype.openExonListWidget = function(geneName) {
	var _this = this;
	var cellBase = new CellBaseDataAdapter(this.species);
	cellBase.successed.addEventListener(function(evt, data) {
		var window = new GenomicListWidget({title:'Exon List', gridFields:["stableId", "chromosome","start", "end", "strand"]});	
		var array = new Array();
		array.push(cellBase.dataset.toJSON());
		window.draw(array, geneName );
		window.onSelected.addEventListener(function(evt, feature) {
			if (feature != null) {
				if (feature.chromosome != null) {
					_this.setLocation(feature.chromosome, feature.start);
				}
			}
		});
		
		
	});
	cellBase.fill("feature", "exon", geneName.toString(), "info");
};

GenomeViewer.prototype.openSNPListWidget = function(snpName) {
	this.openListWidget("feature", "snp", snpName.toString(), "info", "SNP List", ["name", "variantAlleles", "ancestralAllele", "mapWeight",  "position", "sequence"]);
};

GenomeViewer.prototype.openGOListWidget = function(goList) {
	var _this = this;
	var cellBase = new CellBaseDataAdapter(this.species);
	cellBase.successed.addEventListener(function(evt, data) {
		
		var geneNames = new Array();
		for (var i = 0; i < cellBase.dataset.toJSON()[0].length; i++){
			geneNames.push(cellBase.dataset.toJSON()[0][i].displayId);
		}
		_this.openGeneListWidget(geneNames);
	});
	cellBase.fill("feature", "id", goList.toString(), "xref?dbname=ensembl_gene&");
};



GenomeViewer.prototype.drawChromosome = function(chromosome, start, end) {
	this._setChromosomeLabel(chromosome);
	DOM.removeChilds(this._getChromosomeContainerID());
	var width = this.width - 100;
	this.chromosomeFeatureTrack = new ChromosomeFeatureTrack(this.id + "chr", document.getElementById(this._getChromosomeContainerID()), this.species,{
				top : 5,
				bottom : 20,
				left : 10,
				right : width - 100,
				width : width,
				height : 40,
				label : true,
				"vertical" : false,
				"rounded" : 4
			});

	var _this = this;
	var dataAdapter = new RegionCellBaseDataAdapter(this.species,{resource : "cytoband"});
	dataAdapter.successed.addEventListener(function(evt, data) {
				_this.chromosomeFeatureTrack.draw(dataAdapter.dataset);
				_this.chromosomeFeatureTrack.click.addEventListener(function(evt, data) {
							_this.setLocation(_this.chromosome, data);
						});
			});

	dataAdapter.fill(chromosome, 1, 260000000, "cytoband");
};


GenomeViewer.prototype._setScaleLabels = function() {
	var value = Math.floor(100/this.genomeWidgetProperties.getPixelRatio()) + " nt ";
	Ext.getCmp(this.id+"scaleLabel").surface.items.items[0].setAttributes({text:value},true);
	
	var value10 = "Viewing "+Math.floor(100/this.genomeWidgetProperties.getPixelRatio())*10 + " nts ";
	Ext.getCmp(this.id+"windowSizeLabel").setText(value10);
};

GenomeViewer.prototype.setZoom = function(value) {
	this.genomeWidgetProperties.setZoom(value);
	
	this.position = this.genomeWidget.getMiddlePoint();
	this._getZoomSlider().setValue(value);
	
	this.genomeWidget.trackCanvas._goToCoordinateX(this.position- (this.genomeWidget.trackCanvas.width / 2)/ this.genomeWidgetProperties.getPixelRatio());
	this._setScaleLabels();
	this.refreshMasterGenomeViewer();
};


GenomeViewer.prototype.setLocation = function(chromosome, position) {
	this.chromosome = chromosome;
	this.position = Math.ceil(position);
	
	this.drawChromosome(this.chromosome, 1, 26000000);
	this.refreshMasterGenomeViewer();
};


GenomeViewer.prototype._setPositionField = function(chromosome, position) {
	if (position == NaN){
		position = 1000000;
	}
	if (position < 0){
		Ext.getCmp(this.id+'tbCoordinate').setValue(chromosome + ":" + 0);
	}
	else{
		Ext.getCmp(this.id+'tbCoordinate').setValue( chromosome + ":" + Math.ceil(position));
	}
};



GenomeViewer.prototype._getWindowsSize = function() {
	var zoom = this.genomeWidgetProperties.getZoom();
	return this.genomeWidgetProperties.getWindowSize(zoom);
};

GenomeViewer.prototype.refreshMasterGenomeViewer = function() {
	this.updateRegionMarked(this.chromosome, this.position);
	this._drawGenomeViewer();
	
};

GenomeViewer.prototype._drawGenomeViewer = function() {
	//This method filters repetitive calls to _drawOnceGenomeViewer
	var _this = this;
	_this.drawing += 1;
	setTimeout(function() {
		_this.drawing -= 1;
		if(_this.drawing==0){
			_this._drawOnceGenomeViewer();
		}
	},300);
};
GenomeViewer.prototype._drawOnceGenomeViewer = function() {
	var _this = this;
	this._getPanel().setLoading("Retrieving data");
//	this.updateTracksMenu();

	if(this.genomeWidget!=null){
		this.genomeWidget.clear();
	}
	
	this.genomeWidget = new GenomeWidget(this.id + "master", this._getTracksPanelID(), {
	                pixelRatio: this.genomeWidgetProperties.getPixelRatio(),
	                width:this.width-15,
//	                height:  this.height
	                height:  2000
	        });

	var zoom = this.genomeWidgetProperties.getZoom();

	
	if (this.genomeWidgetProperties.getTrackByZoom(zoom).length > 0){
		for ( var i = 0; i < this.genomeWidgetProperties.getTrackByZoom(zoom).length; i++) {
			var track =  this.genomeWidgetProperties.getTrackByZoom(zoom)[i];
			track.top = track.originalTop;
			track.height = track.originalHeight;
			track.clear();
			this.genomeWidgetProperties.getDataAdapterByZoom(zoom)[i].datasets = new Object();
			this.genomeWidget.addTrack(track, this.genomeWidgetProperties.getDataAdapterByZoom(zoom)[i]);
		}
		
		var start = Math.ceil(this.position - (this._getWindowsSize()));// - (this._getWindowsSize()/6);
		var end = Math.ceil(this.position +   (this._getWindowsSize()));// - (this._getWindowsSize()/6);
		
		if (start < 0){ start = 0;}
		this.genomeWidget.onMarkerChange.addEventListener(function (evt, middlePosition){
			var window = _this.genomeWidgetProperties.windowSize/2;
			var start = middlePosition.middle - window;
			if (start < 0 ){start = 0;}
			_this.updateRegionMarked(_this.chromosome, middlePosition.middle);
		});
		 
		this.genomeWidget.onRender.addEventListener(function (evt){
//			 console.log("test");
			_this._getPanel().setLoading(false);
			_this.genomeWidget.trackCanvas.selectPaintOnRules(_this.position);

		 });
		 
		this._setPositionField(this.chromosome, this.position);
		this.genomeWidget.draw(this.chromosome, start, end);

		
	}
	else{
		_this._getPanel().setLoading("No tracks to display");
	}
	
};


GenomeViewer.prototype.updateRegionMarked = function(chromosome, middlePosition) {
	var window = this.genomeWidgetProperties.windowSize / 2;

	var start = middlePosition - window;
	if (start < 0) {
		start = 0;
	}
	var end = middlePosition + window;

	this.chromosomeFeatureTrack.select(start, end);
	
//	this.chromosomeFeatureTrack.mark({chromosome:this.chromosome, start:this.position, end:this.position}, "red");
};



/** DAS MENU * */
GenomeViewer.prototype.loadDASTrack = function(name, url) {
//	var counter = 1;	
//	while (this.genomeWidgetProperties.tracks[name] != null)
//	{
//		counter++;
//		var aux =  name + "("+ counter+")";
//		if(this.genomeWidgetProperties.tracks[aux] == null){
//			name =aux;
//		}
//	}
	
	if(this.genomeWidgetProperties.tracks[name] == undefined){
		
		var dasDataAdapter2 = new DasRegionDataAdapter({url : url});
		
		var dasTrack1 = new FeatureTrack("vcf", null, this.species,{
			top : 10,
			left : 0,
			height : 10,
//			labelHeight : 12,
//			featureHeight : 12,
			title : name,
			opacity : 0.9,
			titleFontSize : 9,
			forceColor : "purple",
			label : true,
			avoidOverlapping : true,
			pixelSpaceBetweenBlocks : 100,
			allowDuplicates : true,
			backgroundColor : "#FCFFFF",
			isAvalaible : false
		});
		this.genomeWidgetProperties.addCustomTrackByZoom(0, 50, dasTrack1,dasDataAdapter2);
		var dasTrack = new FeatureTrack("vcf", null, this.species,{
			top : 10,
			left : 0,
			height : 10,
//			labelHeight : 10,
//			featureHeight :10,
			title : name,
			titleFontSize : 9,
			forceColor : "#000000",
			label : true,
			avoidOverlapping : true,
			pixelSpaceBetweenBlocks : 100,
			allowDuplicates : true,
			backgroundColor : "#FCFFFF",
			isAvalaible : false
		});
		this.genomeWidgetProperties.addCustomTrackByZoom(60, 100, dasTrack,dasDataAdapter2);
	}
	
//	this.refreshMasterGenomeViewer();
};

//TODO aqui estaba getDasMenu


GenomeViewer.prototype.addFeatureTrack = function(title, dataadapter) {
	var _this = this;
	this._getPanel().setLoading();
	if (dataadapter != null) {
		
		var vcfTrack = new HistogramFeatureTrack("vcf", null, this.species,{
			top : 20,
			left : 0,
			height : 20,
			featureHeight : 18,
			title : title,
			titleFontSize : 9,
			titleWidth : 70,
			label : false,
			forceColor : "purple",
			intervalSize : 500000
		});
		
		_this.genomeWidgetProperties.addCustomTrackByZoom(0, 0, vcfTrack, dataadapter);

		var vcfTrack3 = new HistogramFeatureTrack("vcf", null, this.species,{
					top : 20,
					left : 0,
					height : 20,
					featureHeight : 18,
					title : title,
					titleFontSize : 9,
					titleWidth : 70,
					label : false,
					forceColor : "purple",
					intervalSize : 150000
				});
		_this.genomeWidgetProperties.addCustomTrackByZoom(10, 20, vcfTrack3, dataadapter);
		
		var vcfTrack2 = new FeatureTrack("vcf", null, this.species,{
					top : 10,
					left : 0,
					height : 10,
					title : title,
					label : false,
					avoidOverlapping : true,
					pixelSpaceBetweenBlocks : 1,
					allowDuplicates : true
				});
		_this.genomeWidgetProperties.addCustomTrackByZoom(30, 80, vcfTrack2, dataadapter);

		var vcfTrack2 = new FeatureTrack("vcf", null, this.species,{
					top : 10,
					left : 0,
					height : 10,
					title : title,
//					forceColor : "purple",
					label : true,
					avoidOverlapping : true,
					pixelSpaceBetweenBlocks : 75,
					allowDuplicates : true
				});
		_this.genomeWidgetProperties.addCustomTrackByZoom(90, 90, vcfTrack2, dataadapter);
		
		var vcfTrack100 = new SNPFeatureTrack("vcf", null, this.species,{
			top : 10,
			left : 0,
			height : 20,
			title : title,
			featureHeight:10,
//			forceColor : "purple",
			label : true,
			avoidOverlapping : true,
			pixelSpaceBetweenBlocks : 75,
			allowDuplicates : true
		});
		_this.genomeWidgetProperties.addCustomTrackByZoom(100, 100, vcfTrack100, dataadapter);
		
		_this._drawGenomeViewer();
		
	}
};








GenomeViewer.prototype.addTrackFromFeatures = function(features, trackName) {
	var localRegionAdapter = new LocalRegionDataAdapter();
	localRegionAdapter.loadFromFeatures(features);
	
	if(trackName==null){trackName="";}
	
	this.addFeatureTrack( trackName.substr(0,20) + " #" +this.customTracksAddedCount,localRegionAdapter);
	this.customTracksAddedCount++;
};

GenomeViewer.prototype.addTrackFromFeaturesList = function(data) {
	var features = new Array();
	
	for ( var i = 0; i < data.features.length; i++) {
		for ( var j = 0; j < data.features[i].length; j++) {
			features.push(data.features[i][j]);
		}
	}
	this.addTrackFromFeatures(features, data.trackName);
};


////TODO DEPRECATED
///** TRACKS * */
//GenomeViewer.prototype.updateTracksMenu = function() {
//	var _this = this;
//	
//	if (this.tracks == null){
//		this.tracks = new Object();
//	}
//	
//	for ( var i = 0; i < this.genomeWidgetProperties.customTracks.length; i++) {
//		if (this.tracks[ this.genomeWidgetProperties.customTracks[i].titleName] == null){
//			this.tracksMenu.add({
//				text : this.genomeWidgetProperties.customTracks[i].titleName,
//				checked : this.genomeWidgetProperties.customTracks[i].title,
//				handler : function() {
//					_this.genomeWidgetProperties.tracks[this.text] = this.checked;
//					_this.refreshMasterGenomeViewer();
//				}
//			});
//			
//			this.tracks[this.genomeWidgetProperties.customTracks[i].titleName] = true;
//		}
//	}
////	for (var trackName in this.genomeWidgetProperties.customTracks) {
////		this.tracksMenu.add({
////					text : trackName,
////					checked : this.genomeWidgetProperties.tracks[trackName],
////					handler : function() {
////						_this.genomeWidgetProperties.tracks[this.text] = this.checked;
////						_this.refreshMasterGenomeViewer();
////					}
////				});
////	}
//};



//TODO MOVIDO A GENOMEMAPS
