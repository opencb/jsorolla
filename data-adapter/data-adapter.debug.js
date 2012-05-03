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
				continue
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
		
		if (fileDataAdapter.lines[i][3] == 57649472 ){debugger}
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



