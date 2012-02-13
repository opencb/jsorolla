
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
    		this._coordenates[nodeID]= [ this._coordenates[nodeID][0]*2, this._coordenates[nodeID][1]*2, ];
    	}
		
		this.draw();
    },
    
    zoomOut : function(){
    	for (var nodeID in interactomeViewerViz.controller._coordenates) {
    		this._coordenates[nodeID]= [ this._coordenates[nodeID][0]/2, this._coordenates[nodeID][1]/2, ];
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
