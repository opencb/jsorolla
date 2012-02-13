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

