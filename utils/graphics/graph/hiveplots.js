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
