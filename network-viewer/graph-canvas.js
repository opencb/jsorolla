function GraphCanvas (componentID, targetNode,  args) {
	this.args = new Object();
	/** target */
	this.targetID = targetNode.id;
	
	/** id manage */
	this.id = componentID;	
	this.args.idGraph = this.id + "main";
	this.args.idBackgroundNode = this.id + "background";
	
	
	this.args.idEdgesGraph = this.id + "edges";
	this.args.idNodesGraph = this.id + "vertices";
	this.args.idLabelGraph = this.id + "label";
	this.args.idBackground = this.id + "background";

	/** Objects Graph **/
	this.dataset = null;
	this.formatter = null;
	this.layout = null;
	
	/** Drawing **/
	this.circleDefaultRadius = 2;
	this.squareDefaultSide = this.circleDefaultRadius*1.5;
	
	/** Directed Arrow **/
	this.arrowDefaultSize = this.circleDefaultRadius;
	 
	/** Groups **/
	this.GraphGroup = null;
	this.GraphNodeGroup = null;
	this.GraphLabelGroup = null;
	this.GraphBackground = null;
	
	/** SETTINGS FLAGS **/
	this.args.draggingCanvasEnabled = true; //Flag to set if the canvas can be dragged
	this.args.multipleSelectionEnabled = false;
	this.args.interactive = true;
	this.args.labeled = false;
	this.args.linkEnabled = false;
	
	/** If numberEdge > maxNumberEdgesMoving then only it will move edges when mouse up **/
	this.args.maxNumberEdgesMoving = 3;
	this.args.maxNumberEdgesFiringEvents = 50;
	 
	/** Linking edges **/
	this.args.linking = false;
	this.linkStartX = 0;
	this.linkStartY = 0;
	this.linkSVGNode = null;
	this.linkNodeSource = null;
	this.linkNodeTarget = null;
	
	
	/** Dragging Control **/
	this.draggingElement = null;
	this.dragging = false;
	this.nMouseOffsetX = 0;
    this.nMouseOffsetY = 0;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.desplazamientoX = 0;
    this.desplazamientoY = 0;
    
    /** Selection Control **/
    this.selecting = false;
    this.selectorX = null;
    this.selectorY = null;
    this.selectorSVGNode = null;
    
    /** Node status **/
    this.args.isVertexSelected = new Object();
    this.args.selectedVertices = new Array();
 
    /** Edges status **/
    this.args.isEdgeSelected = new Object();
    //this.args.selectedEdges = new Array();
     
    
    if (args != null){
    	if (args.multipleSelectionEnabled != null){
    		this.args.multipleSelectionEnabled = args.multipleSelectionEnabled;
    		this.args.draggingCanvasEnabled = !(this.args.multipleSelectionEnabled);
    	}
    	if (args.draggingCanvasEnabled != null){
    		this.args.draggingCanvasEnabled = args.draggingCanvasEnabled;
    		this.args.multipleSelectionEnabled = !(this.args.draggingCanvasEnabled);
    	}
    	if (args.interactive != null){
    		this.args.interactive = args.interactive;
    	}
    	if (args.labeled != null){
    		this.args.labeled = args.labeled;
    	}
		if (args.species != null) {
			this.species = args.species;
		}
    	
    }
    
    
    /** Hashmap with the svg node labels **/
    this.svgLabels = new Object();
    
    
    /** EVENTS **/
    this.onVertexOut = new Event(this);
    this.onVertexOver = new Event(this);
    this.onVertexSelect = new Event(this);
    this.onEdgeSelect = new Event(this);
    this.onCanvasClicked = new Event(this);
};



GraphCanvas.prototype.showLabels = function(value ) {
	this.args.labeled = value;
	this.removeLabels();
	if (value){
		this.renderLabels();
	}
};

GraphCanvas.prototype.getSelectedVertices = function( ) {
	return this.args.selectedVertices;
};

GraphCanvas.prototype.getSelectedEdges = function( ) {
	var selected = new Array();
	for ( var selectedEdge in this.args.isEdgeSelected) {
		selected.push(selectedEdge);
	}
	return selected;
	//return this.args.selectedEdges;
};

GraphCanvas.prototype.createSVGDom = function(targetID, id, width, height, backgroundColor ) {
	
	var container = document.getElementById(targetID);
//	this._svg = SVG.createSVGCanvas(container, [["style", "background-color:"+ backgroundColor+"; border: solid 1px #bbb"],["id", id], ["dragx", 0 ] , ["dragy", 0 ],["height", this.getFormatter().getHeight()], ["width", this.getFormatter().getWidth()]]);
	this._svg = SVG.createSVGCanvas(container, [["style", "background-color:"+ backgroundColor+";"],["id", id], ["dragx", 0 ] , ["dragy", 0 ],["height", this.getFormatter().getHeight()], ["width", this.getFormatter().getWidth()]]);
	//	var rect = SVG.drawRectangle(this.formatter.getLeft(), 0, this.formatter.getRight() - this.formatter.getLeft() , this.formatter.getHeight(), this._svg, [["dragx", 0], ["dragy", 0],["fill", backgroundColor],["id", this.args.idBackgroundNode]]);
	return this._svg;
};


/** MULTIPLE SELECTION **/
GraphCanvas.prototype.isMultipleSelectionEnabled = function(){
	return this.args.multipleSelectionEnabled;
};

GraphCanvas.prototype.setMultipleSelection = function(value){
	this.args.multipleSelectionEnabled = value;
	this.args.draggingCanvasEnabled = (!value);
};

GraphCanvas.prototype.setSelecting = function(value){
	this.selecting = value;
};


/** linking **/
GraphCanvas.prototype.setLinking = function(value){
	this.args.linkEnabled = value;
	this.selecting = !value;
	this.dragging = !value;
};


/** CANVAS MOVING **/
GraphCanvas.prototype.setDraggingCanvas = function(value){
	this.args.draggingCanvasEnabled = value;
	this.args.multipleSelectionEnabled = !value;
};

GraphCanvas.prototype.isDraggingCanvasEnabled = function(){
	return this.args.draggingCanvasEnabled;
};
/** ZOOM **/
GraphCanvas.prototype.getScale = function(){
	return this.getFormatter().getZoomScale();
};

GraphCanvas.prototype.setScale = function(scale){
	var graphNode = document.getElementById(this.args.idGraph);
	graphNode.setAttribute("transform", graphNode.getAttribute("transform").replace("scale("+this.getScale()+")", "scale(" + scale + ")"));
	this.getFormatter().setZoomScale(scale);
};


GraphCanvas.prototype.zoomIn = function(){
	this.setScale(this.getScale() + this.getFormatter().getZoomScaleStepFactor());
};

GraphCanvas.prototype.zoomOut = function(){
	this.setScale(this.getScale() - this.getFormatter().getZoomScaleStepFactor());

};

/** SVG COORDENATES **/
GraphCanvas.prototype.getSVGCoordenates = function(evt){
	var p = this._svg.createSVGPoint();
    p.x = evt.clientX;
    p.y = evt.clientY;
    
    var m = this._svg.getScreenCTM(document.documentElement);
    p = p.matrixTransform(m.inverse());
    return p;
};

/** SVG EVENTS **/
GraphCanvas.prototype.mouseClick = function(event){
	if (event.button == 0){
		if (!this.args.interactive){return;}
		
		if (this.isVertex(event.target)){
			this.clickNode(this.getVertexIdFromSVGId(event.target.id));
		}
		/** Como el evento mouseClick viene despues del mouse up es aqui donde manejo el tema de deseccionar los elementos que estoy dragging **/
		if (this.dragging){
			this.dragging = false;
		//	this.deselectNodes();
		}
	}
	
};


GraphCanvas.prototype.mouseMove = function(evt){
	if (this.selecting){
			this.clearLabels();
		
			var width = (this.getSVGCoordenates(evt).x - this.selectorX);
			var height = (this.getSVGCoordenates(evt).y - this.selectorY);
			if ((width > 0)&&(height > 0)){this.displaySelection(this.selectorX, this.selectorY,  width, height);}
			if ((width > 0)&&(height < 0)){this.displaySelection(this.selectorX, this.getSVGCoordenates(evt).y,  width, Math.abs(height));}
			if ((width < 0)&&(height < 0)){this.displaySelection(this.getSVGCoordenates(evt).x, this.getSVGCoordenates(evt).y,  Math.abs(width), Math.abs(height));}
			if ((width < 0)&&(height > 0)){this.displaySelection( this.selectorX + width, this.selectorY ,  Math.abs(width), Math.abs(height));}
			
			var x1 = (parseFloat(this.selectorSVGNode.getAttribute("x")) - DOM.select(this.id).getAttribute("dragx"))/this.getFormatter().getWidth();
			var y1 = (parseFloat(this.selectorSVGNode.getAttribute("y"))  - DOM.select(this.id).getAttribute("dragy"))/this.getFormatter().getHeight();
			var x2 = (x1 + parseFloat(this.selectorSVGNode.getAttribute("width")/this.getFormatter().getWidth()));
			var y2 = (y1 + parseFloat(this.selectorSVGNode.getAttribute("height")/this.getFormatter().getHeight()));
			
			this.deselectNodes(this.getLayout());
			var verticesSelected = this.getLayout().getVerticesByArea(x1/ this.getFormatter().getZoomScale(), y1/ this.getFormatter().getZoomScale(), x2/ this.getFormatter().getZoomScale(), y2/ this.getFormatter().getZoomScale());
			for ( var i = 0; i < verticesSelected.length; i++) {
				this.selectNode(verticesSelected[i].getId());
				this.renderLabel(verticesSelected[i].getId());
			}
		
	}

	if (this.args.linking){
			 var p = this.getSVGCoordenates(evt);
			 if (this.linkSVGNode != null){
				 this.linkSVGNode.setAttribute("x2", p.x - 2);
				 this.linkSVGNode.setAttribute("y2", p.y - 2); 
			 }
	}
	
	if (this.dragging){
		    var p = this.getSVGCoordenates(evt);
	        p.x -= this.nMouseOffsetX;
	        p.y -= this.nMouseOffsetY;
	        this.desplazamientoX =  (this.getSVGCoordenates(evt).x - this.dragStartX);//  + parseFloat(DOM.select(this.id).getAttribute("dragx"));
		    this.desplazamientoY =  (this.getSVGCoordenates(evt).y - this.dragStartY);//  + parseFloat(DOM.select(this.id).getAttribute("dragy"));
		
		    if(this.draggingElement != null) {
	        	/** Click sobre el recct del banground que provoca que mueva todo el canvas **/
	        	if (this.isNodeCanvas(this.draggingElement)){

	        		var p = this.getSVGCoordenates(evt);
	        		p.x =   this.desplazamientoX ;
	        		p.y =   this.desplazamientoY;
	        		
	        		this.draggingElement.setAttribute("dragx",p.x );
		        	this.draggingElement.setAttribute("dragy", p.y);
	        		this.draggingElement = document.getElementById(this.args.idGraph);
	        		this.draggingElement.setAttribute("transform", "translate(" + p.x + "," + p.y + "), scale("+ this.getScale() +")");
	        		
	        		DOM.select(this.id).setAttribute("dragx",p.x );
	        		DOM.select(this.id).setAttribute("dragy",p.y );
	        		
	        		if (this.NodeSVGbackgroundImage!=null){
	        			this.NodeSVGbackgroundImage.setAttribute("dragx",p.x );
	        			this.NodeSVGbackgroundImage.setAttribute("dragy",p.y );
	        		}
	        	}
	        	else{
	        		if (this.isVertex(this.draggingElement)){
	        			this.selectNode(this.getVertexIdFromSVGId(this.draggingElement.id));
	        			this.desplazamientoX = this.desplazamientoX/ this.getFormatter().getZoomScale();
	        			this.desplazamientoY = this.desplazamientoY/ this.getFormatter().getZoomScale();
		        		this.moveSelectedNodes(this.desplazamientoX, this.desplazamientoY);

		        		this.dragStartX = this.getSVGCoordenates(evt).x;
		       		    this.dragStartY = this.getSVGCoordenates(evt).y;
		        	}
	        		else{
	        			if (this.isNodeBackground(this.draggingElement)){

	        				this.draggingElement.setAttribute("dragx",p.x );
	        				this.draggingElement.setAttribute("dragy",p.y );
	        				this.draggingElement = document.getElementById(this.args.idGraph);
	    	        		this.draggingElement.setAttribute("transform", "translate(" + p.x + "," + p.y + "), scale("+ this.getScale() +")");
	        			}
	        			else{
	        				this.draggingElement.setAttribute("transform", "translate(" + p.x + "," + p.y + ")");
	        			}
	        		}
	        	}
	      }
	}
};

GraphCanvas.prototype.moveSelectedNodes = function(offsetX, offsetY){
	
	for ( var i = 0; i < this.getSelectedVertices().length; i++) {
		
		var nodeId =  this.getSelectedVertices()[i];
		var svgNodeId = this.getSVGNodeId(nodeId);

		var x =  parseFloat(DOM.select(svgNodeId).getAttribute("dragx")) + parseFloat(offsetX);// -   parseFloat(DOM.select(this.id).getAttribute("dragx"));
		var y =  parseFloat(DOM.select(svgNodeId).getAttribute("dragy")) + parseFloat(offsetY);// +   parseFloat(DOM.select(this.id).getAttribute("dragy"));
		
		this._movingNode(DOM.select(svgNodeId),x,y);
	}
};


GraphCanvas.prototype.mouseDown = function(evt){
	if (evt.button == 0){
	
		/** if !no interactive mouse events do anything **/
		if (!this.args.interactive){return;}
		
		var p = this.getSVGCoordenates(evt);
		
		/** When click on canvas or background deselect all **/
		if ( this.isNodeCanvas(evt.target) || this.isNodeBackground(evt.target)){
			this.deselectNodes();
			this.deselectEdges();
			this.onCanvasClicked.notify();
		}
		
		
		/** if I am linking vertices **/
		if (this.args.linkEnabled){
			
			if (!this.args.linking ){
				this.args.linking = true;
				if(this.isVertex(evt.target)){
					this.linkStartX = p.x;
					this.linkStartY = p.y;
					this.linkSVGNode = SVG.drawLine(p.x, p.y, p.x, p.y, this._svg, {"stroke":"#FF0000"});
					this.linkNodeSource = this.getVertexIdFromSVGId(evt.target.id);
				}
			}else{
				this.linkNodeTarget = this.getVertexIdFromSVGId(evt.target.id);
				this.args.linking = false;
				this.args.linkEnabled = false;
				if (this.isVertex(evt.target)){
					this.getDataset().addEdge(this.linkNodeSource + "_" + this.linkNodeTarget,this.linkNodeSource ,  this.linkNodeTarget, {});
				}
				this.linkSVGNode.parentNode.removeChild(this.linkSVGNode);
			}
			return;
		}
		
		
		/** Id is a vertex or the canvas **/
		if (this.isVertex(evt.target) || this.isNodeCanvas(evt.target)|| this.isNodeBackground(evt.target) ){
			 this._startDragging(evt);
		}
		/** if i is  edge **/
		if (this.isEdge(evt.target)){
			this.selectEdge(this.getEdgeIdFromSVGId(evt.target.getAttribute("id")));
		}

		if (this.args.multipleSelectionEnabled){
			if (!this.dragging){
				 this.setSelecting(true);
		         this.selectorX = p.x;
		         this.selectorY =  p.y;
				 this.displaySelection(p.x, p.y, 1, 1);
			}
		}
		
	}
	if (evt.button == 1){
		this.setLinking(false);
		this.setMultipleSelection(false);
		this.selecting = false;
		 
		/** Id is a vertex or the canvas **/
		if (this.isVertex(evt.target) || this.isNodeCanvas(evt.target)|| this.isNodeBackground(evt.target) ){
			 this._startDragging(evt);
		}
	}
};

GraphCanvas.prototype.mouseUp = function(event){
	if (!this.args.interactive){return;}
	
	if (this.dragging){
		//XXX firefox fix, set to null causing some times on mouseup, infowidget is shown
		this.actualLabelId=null;
		
		this._stopDragging(event);
		if (this.isVertex(event.target)){
			var vertexId = this.getVertexIdFromSVGId(event.target.id);
			if ( this.getDataset().getVertexById(vertexId).getEdges().length >= this.args.maxNumberEdgesMoving){
				this.moveEdge(vertexId);
			}
		}
	}
	
	//XXX cheking if mouse is inside a label
	if (this.actualLabelId!=null){
		this.clickLabel(this.actualLabelId);
	}
	
	if (this.selecting){
		this.setSelecting(false);
		
		
		var x1 = (parseFloat(this.selectorSVGNode.getAttribute("x")) - DOM.select(this.id).getAttribute("dragx"))/this.getFormatter().getWidth();
		var y1 = (parseFloat(this.selectorSVGNode.getAttribute("y"))  - DOM.select(this.id).getAttribute("dragy"))/this.getFormatter().getHeight();
		var x2 = (x1 + parseFloat(this.selectorSVGNode.getAttribute("width")/this.formatter.getWidth()));
		var y2 = (y1 + parseFloat(this.selectorSVGNode.getAttribute("height")/this.formatter.getHeight()));
		
		var verticesSelected = this.getLayout().getVerticesByArea(x1/ this.getFormatter().getZoomScale, y1/ this.getFormatter().getZoomScale, x2/ this.getFormatter().getZoomScale, y2/ this.getFormatter().getZoomScale);
		
		for ( var i = 0; i < verticesSelected.length; i++) {
			this.selectNode(verticesSelected[i].getId());
		}
		
		if (this.selectorSVGNode != null){
			this._svg.removeChild(this.selectorSVGNode);
		}
		
		if (this.args.labeled){
			this.clearLabels();
			this.renderLabels();
		}
		
		this.selectorSVGNode = null;
//		this.renderLabels();
	}
};

/** SELECTION **/
GraphCanvas.prototype.displaySelection = function(x, y, width, height){
	if (this.selectorSVGNode != null){
		this.selectorSVGNode.setAttribute("x", x);
		this.selectorSVGNode.setAttribute("y", y);
		this.selectorSVGNode.setAttribute("width", width);
		this.selectorSVGNode.setAttribute("height", height);
	}
	else{
		this.selectorSVGNode = SVG.drawRectangle(x, y, width, height, this._svg, {"fill":"red","stroke":"black", "opacity":"0.2", "stroke-opacity":"1"});
	}
};

/** DRAGGING **/
GraphCanvas.prototype._startDragging = function(evt){
 	if (!this.isDraggingCanvasEnabled()){
 		if (this.isNodeCanvas(evt.target)){
 			this.draggingElement = null;
 		}
 	 }
 
     if(this.isVertex(evt.target)|| (this.isNodeBackground(evt.target)&&(this.isDraggingCanvasEnabled())) ||(this.isNodeCanvas(evt.target)&&(this.isDraggingCanvasEnabled()))) {
    	 evt.target.style.cursor="move";
    	 this.clearLabels();
    	 this.draggingElement = evt.target;
    	 
    	 this.dragging = true;
         var p = this.getSVGCoordenates(evt);
         
         this.nMouseOffsetX = p.x - parseInt(evt.target.getAttribute("dragx"));
         this.nMouseOffsetY = p.y - parseInt(evt.target.getAttribute("dragy")); 
         
         if (this.isVertex(evt.target)){
        	 this.dragStartX = parseInt(this.draggingElement.getAttribute("dragx"))*this.getFormatter().getZoomScale() + parseFloat(DOM.select(this.id).getAttribute("dragx"));
        	 this.dragStartY = parseInt(this.draggingElement.getAttribute("dragy"))*this.getFormatter().getZoomScale() + parseFloat(DOM.select(this.id).getAttribute("dragy"));
         }
         else{
        	 this.dragStartX = p.x - parseInt(this.draggingElement.getAttribute("dragx"));// + parseFloat(DOM.select(this.id).getAttribute("dragx"));
        	 this.dragStartY = p.y - parseInt(this.draggingElement.getAttribute("dragy"));// + parseFloat(DOM.select(this.id).getAttribute("dragy"));
          }
 	}
};
	

GraphCanvas.prototype._stopDragging = function(event){
	event.target.style.cursor="";
	
	this.nMouseOffsetX = 0;
	this.nMouseOffsetX = 0;
	/** despues del evento up viene el evento click entonces acabo el dragging en el mouseclick **/
	this.dragging = false;
	this.draggingElement = null;
	this.renderLabels();
	
	this.setLinking(false);
	this.setMultipleSelection(true);
	this.selecting = false;
	
};

/** Move the edges of the vertex with the vertexId indicado **/
GraphCanvas.prototype.moveEdge = function(vertexId){
	var x = this.getLayout().getNodeById(vertexId).x * this.getFormatter().getWidth();
	var y = this.getLayout().getNodeById(vertexId).y * this.getFormatter().getHeight();
	
	/** Moving edges out **/ 
	for (var i = 0; i < this.getDataset().getVertexById(vertexId).getEdgesOut().length; i++){
		var edgeId = this.getDataset().getVertexById(vertexId).getEdgesOut()[i].getId();
		var svgEdgeId = this.getSVGEdgeId(edgeId);
		var edgeFormatter = this.getFormatter().getEdgeById(edgeId);
		if(edgeFormatter instanceof LineEdgeGraphFormatter){
			DOM.select(svgEdgeId + "_shadow").setAttribute("x2", x);
			DOM.select(svgEdgeId + "_shadow").setAttribute("y2", y);
			DOM.select(svgEdgeId).setAttribute("x2", x);
			DOM.select(svgEdgeId).setAttribute("y2", y);
		}
		
		if((edgeFormatter instanceof DirectedLineEdgeGraphFormatter) || (edgeFormatter instanceof OdirectedLineEdgeGraphFormatter) || (edgeFormatter instanceof OdotDirectedLineEdgeGraphFormatter) ||(edgeFormatter instanceof DotDirectedLineEdgeGraphFormatter) ||(edgeFormatter instanceof  CutDirectedLineEdgeGraphFormatter)){
			this.removeEdge(edgeId);
			this.renderEdge(edgeId);
		}
	}
	
	/** Moving edges in **/ 
	for (var i = 0; i < this.getDataset().getVertexById(vertexId).getEdgesIn().length; i++){
		var edgeId = this.getDataset().getVertexById(vertexId).getEdgesIn()[i].getId();
		var svgEdgeId = this.getSVGEdgeId(edgeId);
		var edgeFormatter = this.getFormatter().getEdgeById(edgeId);
		if(edgeFormatter instanceof LineEdgeGraphFormatter){
			DOM.select(svgEdgeId).setAttribute("x1", x);
			DOM.select(svgEdgeId).setAttribute("y1", y);
			DOM.select(svgEdgeId + "_shadow").setAttribute("x1", x);
			DOM.select(svgEdgeId + "_shadow").setAttribute("y1", y);
		}
		
		if((edgeFormatter instanceof DirectedLineEdgeGraphFormatter) || (edgeFormatter instanceof OdirectedLineEdgeGraphFormatter) || (edgeFormatter instanceof OdotDirectedLineEdgeGraphFormatter)  || (edgeFormatter instanceof DotDirectedLineEdgeGraphFormatter) ||(edgeFormatter instanceof  CutDirectedLineEdgeGraphFormatter)){
			this.removeEdge(edgeId);
			this.renderEdge(edgeId);
		}
		
		if(edgeFormatter instanceof BezierEdgeGraphFormatter){
			var radius = this.getFormatter().getVertexById(vertexId).getDefault().getSize() * this.getFormatter().getNodesMaxSize();
			var d = this.calculateCoordenatesBezier(radius, x, y);
			DOM.select(svgEdgeId).setAttribute("d", d);
		}
	}
};


GraphCanvas.prototype.moveNode = function(vertexId){
	var x = this.getLayout().getNodeById(vertexId).x * this.getFormatter().getWidth();
	var y = this.getLayout().getNodeById(vertexId).y * this.getFormatter().getHeight();
	var svgNodeElement = DOM.select(this.getSVGNodeId(vertexId));
	
	svgNodeElement.setAttribute("dragx", x);
	svgNodeElement.setAttribute("dragy", y);
	svgNodeElement.setAttribute("transform", "translate(" + x + "," + y + "), scale("+this.getFormatter().getVertexById(vertexId).getDefault().getSize()+")");
	
	if ( this.getDataset().getVertexById(vertexId).getEdges().length < this.args.maxNumberEdgesMoving){
		this.moveEdge(vertexId);
	}
};

GraphCanvas.prototype._movingNode = function(svgNodeElement, x, y){
	var vertexId = this.getVertexIdFromSVGId(svgNodeElement.getAttribute("id"));
	
	this.getLayout().getNodeById(vertexId).setCoordinates(x/this.getFormatter().getWidth(), y/this.getFormatter().getHeight());
	this.desplazamientoX = 0;
	this.desplazamientoY = 0;
	this.removeLabel(vertexId);
	this.renderLabel(vertexId);
};

/** INIT **/
GraphCanvas.prototype.init = function(){
	
	this._svg = this.createSVGDom(this.targetID, this.id, this.getFormatter().getWidth(), this.getFormatter().getHeight(), this.getFormatter().getBackgroundColor());
	this.GraphGroup = SVG.drawGroup(this._svg, [["id", this.args.idGraph], ["transform", "translate(0,0), scale(1)"]]);
	this.GraphBackground = SVG.drawGroup(this.GraphGroup, [["id", this.args.idBackground ]]);
	this.GraphEdgeGroup = SVG.drawGroup(this.GraphGroup, [["id", this.args.idEdgesGraph]]);
	this.GraphNodeGroup = SVG.drawGroup(this.GraphGroup, [["id", this.args.idNodesGraph]]);
	this.GraphLabelGroup = SVG.drawGroup(this.GraphGroup, [["id", this.args.idLabelGraph]]);
	
	if ((this.getFormatter().getBackgroundImage()!=null)&&(this.getFormatter().getBackgroundImage()!="")){
		this.setBackgroundImage(this.getFormatter().getBackgroundImage());
	}
	/** SVG Events listener */
	var _this = this;
	this._svg.addEventListener("click", function(event) {_this.mouseClick(event);}, false);
    this._svg.addEventListener("mousemove", function(event) { _this.mouseMove(event, _this); }, false);
    this._svg.addEventListener("mousedown", function(event) { _this.mouseDown(event, _this); }, false);
    this._svg.addEventListener("mouseup", function(event) { _this.mouseUp(event, _this);}, false);


};

/*
GraphCanvas.prototype.backgroungToSVG = function(){
	var _this = this;
	var canvas = document.createElement('canvas');
	canvas.setAttribute("id", "canvas");
	canvas.width = this.formatter.getWidth();
	canvas.height = this.formatter.getHeight();
	
	this._svg.parentNode.parentNode.appendChild(canvas);
	var ctx = document.getElementById('canvas').getContext('2d');
	var img = new Image();
	
	img.src = this.formatter.getBackgroundImage();
	ctx.drawImage(img,0,0 ,_this.formatter.getWidth(), _this.formatter.getHeight()); 
	
	
	img.onload  = function() { 
			canvas.parentNode.removeChild(canvas);
	}
	
	this.NodeSVGbackgroundImage.setAttribute("xlink:href", document.getElementById("canvas").toDataURL());
	this.NodeSVGbackgroundImage.removeAttribute("href");
	 
	//
	 
};*/
 
GraphCanvas.prototype.setBackgroundImage = function(){
		if (this.NodeSVGbackgroundImage != null){
			this.NodeSVGbackgroundImage.parentNode.removeChild(this.NodeSVGbackgroundImage);
		} 
		
		/**/
//		console.log(document.getElementById(this.targetID));
//		console.log($('#' + this.targetID));
//		console.log(this.targetID);
		/**/
		
		$('#' + this.targetID).svg();
		$('#' + this.targetID).svg("get");
		
		$('#' + this.targetID).svg("get")._svg = document.getElementById(this.id);

		var svg = $('#' + this.targetID).svg("get");
		this.NodeSVGbackgroundImage = svg.image(0, 0, this.getFormatter().getWidth(), this.getFormatter().getHeight(), this.getFormatter().getBackgroundImage());
		this.NodeSVGbackgroundImage.setAttribute("id", this.args.idBackgroundNode);
		
		this.NodeSVGbackgroundImage.setAttribute("x", 0);
		this.NodeSVGbackgroundImage.setAttribute("y", 0);
		
		this.NodeSVGbackgroundImage.setAttribute("dragx", 0);
		this.NodeSVGbackgroundImage.setAttribute("dragy", 0);
		
		if (this.getFormatter().args.backgroundImageHeight != null){
			this.NodeSVGbackgroundImage.setAttribute("height", this.getFormatter().args.backgroundImageHeight);
		}
		if (this.getFormatter().args.backgroundImageWidth != null){
			this.NodeSVGbackgroundImage.setAttribute("width", this.getFormatter().args.backgroundImageWidth);
		}
		
		if (this.getFormatter().args.backgroundImageX != null){
			this.NodeSVGbackgroundImage.setAttribute("x", this.getFormatter().args.backgroundImageX);
		}
		if (this.getFormatter().args.backgroundImageY != null){
			this.NodeSVGbackgroundImage.setAttribute("y", this.getFormatter().args.backgroundImageY);
		}
		
		
		this.GraphBackground.appendChild(this.NodeSVGbackgroundImage);
		this.NodeSVGbackgroundImage.removeAttribute("href");
	    this.NodeSVGbackgroundImage.setAttribute("xlink:href", this.getFormatter().getBackgroundImage());
};

GraphCanvas.prototype.removeBackgroundImage = function(){
	if (this.NodeSVGbackgroundImage != null){
		this.NodeSVGbackgroundImage.parentNode.removeChild(this.NodeSVGbackgroundImage);
	} 
};

GraphCanvas.prototype._setBackgroundColor = function(color){
	var attributes = [["fill", color]];
	SVG.drawRectangle(0,0, this.getFormatter().getWidth(), this.getFormatter().getHeight(), this.GraphBackground, attributes);
};

/** Serialize **/
GraphCanvas.prototype.toJSON = function(){
	var json = new Object();
	json.dataset = new Object();
	json.formatter = new Object();
	json.layout = new Object();
	json.dataset = this.getDataset().toJSON();
	json.formatter  = this.getFormatter().toJSON();
	json.layout = this.getLayout().toJSON();
	return json;
};

GraphCanvas.prototype.toHTML = function(){
	//this.backgroungToSVG();
	var html = this._svg.parentElement.innerHTML;
	
	var start = html.indexOf("<svg");
	var end = html.indexOf("</svg>") + 6;
	
	return html.substr(start, end);
};

/** DRAW **/
GraphCanvas.prototype.draw = function(graphdataset, graphformatter, graphlayout){
	this.setDataset(graphdataset);
	this.setFormatter(graphformatter);
	this.setLayout(graphlayout);
	
	var _this = this;
	this.getFormatter().changed.addEventListener(function (sender, item){
		_this.removeNode(item.getId());
		_this.renderNode(item.getId());
		if (_this.args.labeled){
			_this.removeLabel(item.getId());
			_this.renderLabel(item.getId());
		}
	
	});
	//TODO
	this.getFormatter().edgeChanged.addEventListener(function (sender, item){
		_this.removeEdge(item.getId());
		_this.renderEdge(item.getId());
	});
	
	this.getFormatter().resized.addEventListener(function (sender, item){
		_this.resize(_this.getFormatter().getWidth(), _this.getFormatter().getHeight());
	});

	this.getFormatter().backgroundImageChanged.addEventListener(function (sender, item){
		_this.setBackgroundImage(_this.getFormatter().getBackgroundImage());
	});
	
	this.getFormatter().backgroundColorChanged.addEventListener(function (sender, item){
		_this._setBackgroundColor(_this.getFormatter().getBackgroundColor());
	});
	
	this.getLayout().changed.addEventListener(function (sender, item){
		_this.moveNode(item.getId());
		_this.moveEdge(item.getId());
		if (_this.args.labeled){
			_this.removeLabel(item.getId());
			_this.renderLabel(item.getId());
		}
	});
	
	this.getDataset().newVertex.addEventListener(function (sender, item){
	
		_this.renderNode(item.getId());
		if (_this.args.labeled){
			_this.renderLabel(item.getId());
		}
	});
	
	this.getDataset().newEdge.addEventListener(function (sender, item){
		_this.renderEdge(item.getId());
	});
	
	this.getDataset().vertexDeleted.addEventListener(function (sender, item){
		_this.removeNode(item.getId());
		if (_this.args.labeled){
			_this.removeLabel(item.getId());
		}
	});
	
	this.getDataset().edgeDeleted.addEventListener(function (sender, item){
		_this.removeEdge(item.getId());
	});
	
	this.getDataset().vertexNameChanged.addEventListener(function (sender, args){
		if (_this.args.labeled){
			_this.removeLabel(args.item.getId());
			_this.removeLabel(args.item.getId());
			_this.renderLabel(args.item.getId());
		}
	});
	this.init();
	this.render();
};

GraphCanvas.prototype.render = function(){
	for ( var id in this.getDataset().getVertices()) {
		this.renderNode(id);
	}
	this.renderLabels();
	this.renderEdges();
};

GraphCanvas.prototype.renderLabels = function(){
	if (this.args.labeled){
		for ( var id in this.getDataset().getVertices()) {
			this.renderLabel(id);
		}
	}
};

GraphCanvas.prototype.removeLabels = function(){
		for ( var id in this.getDataset().getVertices()) {
			this.removeLabel(id);
		}
};

/** Utilities method for nodes **/
GraphCanvas.prototype.isNodeCanvas = function(node){
	return ((node.id == this.args.idGraph)||(node.id == this.id));
};

GraphCanvas.prototype.isNodeBackground = function(node){
	return ((node.id == this.args.idBackgroundNode));
};

GraphCanvas.prototype.isVertex = function(node){
	if ( node.getAttribute("id") != null){
		if (node.getAttribute("id").indexOf("_v_") != -1){
			return true;
		}
	}
	return false;
};

GraphCanvas.prototype.isLabel = function(node){
	if ( node.getAttribute("id") != null){
		if (node.getAttribute("id").indexOf("_l_") != -1){
			return true;
		}
	}
	return false;
};


GraphCanvas.prototype.isEdge = function(node){
	if ( node.getAttribute("id") != null){
		if (node.getAttribute("id").indexOf("_e_") != -1){
			return true;
		}
	}
	return false;
};

/** Resize **/
GraphCanvas.prototype.resize= function(width, height){
//	this._svg.setAttribute("width", width);
//	this._svg.setAttribute("height", height);
	if (this.NodeSVGbackgroundImage != null){
		this.NodeSVGbackgroundImage.setAttribute("width", width);
		this.NodeSVGbackgroundImage.setAttribute("height", height);
	}
	
	this._svg.setAttribute("width", width );
	this._svg.setAttribute("height", height);
	
	this.clearCanvas();
	this.render();
};

GraphCanvas.prototype.clearCanvas= function(){
	DOM.removeChilds(this.GraphEdgeGroup.getAttribute("id"));
	DOM.removeChilds(this.GraphNodeGroup.getAttribute("id"));
	this.clearLabels();
};

GraphCanvas.prototype.clearLabels = function(){
	DOM.removeChilds(this.GraphLabelGroup.getAttribute("id"));
};


/** ID'S converter **/
GraphCanvas.prototype.getSVGNodeId= function(nodeId){
	return this.id + "_v_" + nodeId;
};

GraphCanvas.prototype.getSVGEdgeId= function(edgeId){
	return this.id + "_e_" + edgeId;
};

GraphCanvas.prototype.getSVGArrowEdgeId= function(edgeId){
	return this.id + "_arrow_" + edgeId;
};

GraphCanvas.prototype.getSVGLabelId= function(edgeId){
	return this.id + "_l_" + edgeId;
};

GraphCanvas.prototype.blinkVertexById = function(vertexId){
	$("#" + this.getSVGNodeId(vertexId)).fadeIn().fadeOut().fadeIn().fadeOut().fadeIn().fadeOut();
};


GraphCanvas.prototype.getVertexIdFromSVGId = function(svgVertexId){
	return svgVertexId.replace(this.id, "").replace("_v_", "");
};

GraphCanvas.prototype.getEdgeIdFromSVGId = function(svgEdgeId){
	return svgEdgeId.replace(this.id, "").replace("_e_", "");
};

/** VERTEX **/
GraphCanvas.prototype.getVertexById = function(id){
	return document.getElementById(this.getSVGNodeId(id));
};

GraphCanvas.prototype.renderNodes = function(){
	for ( var id in this.getDataset().getVertices()) {
		this.renderNode(id);
	}
};

GraphCanvas.prototype.overNode = function(nodeId){
	if (!this.args.interactive){return;}
	/** If selected we don't change the format **/
	if (this.args.isVertexSelected[nodeId] == null){
		var args = this.getFormatter().getVertexById(nodeId).getOver();
		args.args["cursor"] = 'pointer';
		this.changeVertexFormat(nodeId, args);
	}
};

GraphCanvas.prototype.outNode = function(nodeId){
	if (!this.args.interactive){return;}
	
	/** If selected we don't change the format **/
	if (this.args.isVertexSelected[nodeId] == null){
		this.changeVertexFormat(nodeId, this.getFormatter().getVertexById(nodeId).getDefault());
	}
};

GraphCanvas.prototype.clickLabel = function(nodeId){
	var vertex = this.getDataset().getVertexById(nodeId);
	switch (vertex.type){
		case "tf": new TFInfoWidget(null,this.species).draw(vertex); break;
		case "mirna": new MirnaInfoWidget(null,this.species).draw(vertex); break;
		case "gene": new GeneInfoWidget(null,this.species).draw(vertex); break;
	}
};

GraphCanvas.prototype.overLabel = function(nodeId){
	//XXX cheking if mouse is inside a label
	this.actualLabelId=nodeId;
	
	this.overNode(nodeId);
	this.svgLabels[nodeId].setAttribute("cursor", "pointer");
};

GraphCanvas.prototype.outLabel = function(nodeId){
	//XXX cheking if mouse is inside a label
	this.actualLabelId=null;
	
	this.outNode(nodeId);
//	this.svgLabels[nodeId].setAttribute("cursor", "");
};




GraphCanvas.prototype.clickNode = function(nodeId){
	if (!this.args.interactive){return;}
	
		/** si el evento se dispara oprque estaba dragging entonces no activo nada **/
		if (this.args.isVertexSelected[nodeId] == null){
			this.selectNode(nodeId);
		}
		else{
			this.deselectNode(nodeId);
		}
};

GraphCanvas.prototype.selectNode = function(nodeId){
	for ( var i = 0; i <  this.args.selectedVertices.length; i++) {
		var format = this.getFormatter().getVertexById(nodeId).getSelected();
		format.opacity = 0.2;
		this.changeVertexFormat(nodeId, this.getFormatter().getVertexById(nodeId).getSelected());
	}
	
	if (this.args.isVertexSelected[nodeId] == null){
		var format = this.getFormatter().getVertexById(nodeId).getSelected();
		format.opacity = 1;
		this.changeVertexFormat(nodeId, this.getFormatter().getVertexById(nodeId).getSelected());
		this.args.selectedVertices.push(nodeId);
		this.args.isVertexSelected[nodeId] = this.args.selectedVertices.length - 1;
		this.onVertexSelect.notify(nodeId);
	}
};

GraphCanvas.prototype.selectAllEdges = function(){
	this.deselectNodes();
	this.deselectEdges();
	
	for ( var edgesId in this.getDataset().edges) {
		this.selectEdge(edgesId);
	}
};

GraphCanvas.prototype.selectAllNodes = function(){
	this.deselectNodes();
	this.deselectEdges();
	
	for ( var vertexId in this.getDataset().vertices) {
		this.selectNode(vertexId);
	}
};

GraphCanvas.prototype.selectAll = function(){
	this.deselectNodes();
	this.deselectEdges();
	
	for ( var vertexId in this.getDataset().vertices) {
		this.selectNode(vertexId);
	}
	
	for ( var edgesId in this.getDataset().edges) {
		this.selectEdge(edgesId);
	}
};


GraphCanvas.prototype.selectEdge = function(edgeId){
	if (this.args.isEdgeSelected[edgeId] == null){
		this.changeEdgeFormat(edgeId, this.getFormatter().getEdgeById(edgeId).getSelected());
		//this.args.selectedEdges.push(edgeId);
		this.args.isEdgeSelected[edgeId] = true; //this.args.selectedEdges.length - 1;
		this.onEdgeSelect.notify(edgeId);
	}
};

GraphCanvas.prototype.selectEdges = function(edges){

	for ( var i = 0; i < edges.length; i++) {
		this.selectEdge(edges[i]);
	}
};

GraphCanvas.prototype.deselectNode = function(nodeId){
	if (this.args.isVertexSelected[nodeId] != null){
		this.changeVertexFormat(nodeId, this.getFormatter().getVertexById(nodeId).getDefault());
		this.args.selectedVertices.splice(this.args.isVertexSelected[nodeId], 1);
		var index = this.args.isVertexSelected[nodeId];
		delete this.args.isVertexSelected[nodeId];
		
		for ( var vertex in this.args.isVertexSelected) {
			if (this.args.isVertexSelected[vertex] > index){
				this.args.isVertexSelected[vertex] = this.args.isVertexSelected[vertex] - 1;
			}
		}
	}
};

GraphCanvas.prototype.deselectNodes = function(){
	var selected = JSON.parse(JSON.stringify(this.getSelectedVertices()));
	for ( var i = 0; i < selected.length; i++) {
		this.deselectNode(selected[i]);
	}
};
GraphCanvas.prototype.selectNodes = function(idNodes){
	
	for ( var i = 0; i < idNodes.length; i++) {
		this.selectNode(idNodes[i]);
	}  
	
//	for ( var vertex in this.args.isVertexSelected) {
//		if (this.args.isVertexSelected[vertex] > index){
//			this.args.isVertexSelected[vertex] = this.args.isVertexSelected[vertex] - 1;
//		}
//	}
	
	
};

GraphCanvas.prototype.changeVertexFormat = function(nodeId, format){
	var svgNode = DOM.select(this.getSVGNodeId(nodeId));
	if (svgNode != null){
		var properties = format.toJSON();
		for ( var item in properties) {
			svgNode.setAttribute(item, properties[item]);
		}
		
		if (this.getFormatter().getVertexById(nodeId) instanceof CircleVertexGraphFormatter){
			var transform = "translate("+svgNode.getAttribute("dragx")+","+svgNode.getAttribute("dragy") +"), scale("+ format.getSize()+")";
			svgNode.setAttribute("transform", transform);
		}
	}
};


GraphCanvas.prototype.renderLabel = function(nodeId){
		var x = Math.ceil(this.getLayout().getNodeById(nodeId).x* this.getFormatter().getWidth());
		var y = Math.ceil(this.getLayout().getNodeById(nodeId).y*this.getFormatter().getHeight());
		
		var svgAttributesNode = JSON.parse(JSON.stringify(this.getFormatter().getVertexById(nodeId).getDefault().toJSON().title));
		svgAttributesNode.id = this.getSVGLabelId(this.getDataset().getVertexById(nodeId).getId());
		svgAttributesNode.dx = (-1)*(this.getDataset().getVertexById(nodeId).getName().length*svgAttributesNode["font-size"])/4;
		
		svgAttributesNode.dy = parseFloat((this.getFormatter().getVertexById(nodeId).getDefault().getSize())) + parseFloat(svgAttributesNode["font-size"]) + parseFloat(this.getFormatter().getVertexById(nodeId).getDefault().getStrokeWidth());
		
		
		svgAttributesNode.dragx =  Math.ceil(this.getLayout().getNodeById(nodeId).x * this.getFormatter().getWidth()); 
	
		
		
		var gragy = parseFloat(this.getFormatter().getVertexById(nodeId).getDefault().getSize())  + Math.ceil(this.getLayout().getNodeById(nodeId).y * this.getFormatter().getHeight()); 
		svgAttributesNode.dragy = gragy; 
		svgAttributesNode.transform = "translate("+ svgAttributesNode.dragx + "," + svgAttributesNode.dragy +")";//, scale("+this.formatter.getVertexById(nodeId).getDefault().getSize()+")";
		
		var nodeSVG = SVG.drawText(0,0, this.getDataset().getVertexById(nodeId).getName(), this.GraphLabelGroup, svgAttributesNode);
		
		this.svgLabels[nodeId] = nodeSVG;
		
		//XXX if not set to true, the click event does not work	
//		this.dragging = true;
		/** Events for the SVG node **/
		var _this = this;
		if (nodeSVG != null){
//			nodeSVG.addEventListener("click", function(){ _this.clickLabel(nodeId);},false);
			nodeSVG.addEventListener("mouseover", function(){ _this.overLabel(nodeId);} , false);
			nodeSVG.addEventListener("mouseout", function() { _this.outLabel(nodeId);}, false);
		}
		
};

GraphCanvas.prototype.removeLabel = function(labelId){
	if (DOM.select(this.getSVGLabelId(labelId))!=null){
		DOM.select(this.getSVGLabelId(labelId)).parentNode.removeChild(DOM.select(this.getSVGLabelId(labelId)));
	}
};

GraphCanvas.prototype.renderNode = function(nodeId){
	
	var svgAttributesNode = JSON.parse(JSON.stringify(this.getFormatter().getVertexById(nodeId).getDefault().toJSON()));
	svgAttributesNode.dragx =  Math.ceil(this.getLayout().getNodeById(nodeId).x * this.getFormatter().getWidth()); 
	svgAttributesNode.dragy = Math.ceil(this.getLayout().getNodeById(nodeId).y * this.getFormatter().getHeight()); 
	svgAttributesNode.transform = "translate("+ svgAttributesNode.dragx + "," + svgAttributesNode.dragy +"), scale("+this.getFormatter().getVertexById(nodeId).getDefault().getSize()+")";
	svgAttributesNode.id = this.getSVGNodeId(nodeId);
	
	
	var nodeSVG;
	
	
	if (this.getFormatter().getVertexById(nodeId) instanceof CircleVertexGraphFormatter){
		nodeSVG = SVG.drawCircle(0 ,0 , this.circleDefaultRadius, this.GraphNodeGroup, svgAttributesNode);
	}
	
	if (this.getFormatter().getVertexById(nodeId) instanceof SquareVertexGraphFormatter){
		//nodeSVG = SVG.drawRectangle(0 - (this.circleDefaultRadius) ,0 - (this.formatter.getVertexById(nodeId).getDefault().getSize()) , (this.getFormatter().getVertexById(nodeId).getDefault().getSize()*2),  (this.getFormatter().getVertexById(nodeId).getDefault().getSize()*2), this.GraphNodeGroup, svgAttributesNode);
		nodeSVG = SVG.drawRectangle(0 - (this.circleDefaultRadius) ,0 - (this.circleDefaultRadius) , (this.circleDefaultRadius*2),  (this.circleDefaultRadius*2), this.GraphNodeGroup, svgAttributesNode);
	}
	
	if (this.getFormatter().getVertexById(nodeId) instanceof EllipseVertexGraphFormatter){
		nodeSVG = SVG.drawEllipse(0  ,0 , this.circleDefaultRadius*1.5,  this.circleDefaultRadius, this.GraphNodeGroup, svgAttributesNode);
	}
	
	if (this.getFormatter().getVertexById(nodeId) instanceof RectangleVertexGraphFormatter){
		//nodeSVG = SVG.drawRectangle(0 - (this.circleDefaultRadius) ,0 - ((this.circleDefaultRadius*2)/2) , (this.circleDefaultRadius*2),  (this.circleDefaultRadius), this.GraphNodeGroup, svgAttributesNode);
		nodeSVG = SVG.drawRectangle(0 - (this.circleDefaultRadius*1.5) ,0 - (this.circleDefaultRadius) , (this.circleDefaultRadius*2*1.5),  (this.circleDefaultRadius*2), this.GraphNodeGroup, svgAttributesNode);

	}
	
	if (this.getFormatter().getVertexById(nodeId) instanceof RoundedVertexGraphFormatter){
		svgAttributesNode.ry = 2;// this.formatter.getVertexById(nodeId).getDefault().getSize()/4;
		svgAttributesNode.rx = 2;// this.formatter.getVertexById(nodeId).getDefault().getSize()/4;
		nodeSVG = SVG.drawRectangle(0 - (this.circleDefaultRadius*1.5) ,0 - (this.circleDefaultRadius) , (this.circleDefaultRadius*2*1.5),  (this.circleDefaultRadius*2), this.GraphNodeGroup, svgAttributesNode);
	}
	
	//<polygon fill="violet" stroke="violet" points="935.972,-363.757 935.972,-380.243 914.9,-391.9 885.1,-391.9 864.028,-380.243 864.028,-363.757 885.1,-352.1 914.9,-352.1 935.972,-363.757"/> 
	
	if (this.getFormatter().getVertexById(nodeId) instanceof OctagonVertexGraphFormatter){
		svgAttributesNode.ry = 2;
		svgAttributesNode.rx = 2;
		nodeSVG = SVG.drawRectangle(0 - (this.circleDefaultRadius*1.5) ,0 - (this.circleDefaultRadius) , (this.circleDefaultRadius*2*1.5),  (this.circleDefaultRadius*2), this.GraphNodeGroup, svgAttributesNode);
	}
	
	nodeSVG.internalId = nodeId;
	//
	var _this = this;
	
	
	/** Events for the SVG node **/
	if (nodeSVG != null){
		nodeSVG.addEventListener("mouseover", function(){
					_this.onVertexOver.notify(nodeId); _this.overNode(nodeId); 
		}, false);
		nodeSVG.addEventListener("mouseout", function(){_this.onVertexOut.notify(nodeId); _this.outNode(nodeId);}, false);
//		nodeSVG.addEventListener("click", function(){_this.clickNode(nodeId);}, false);
	}
};

GraphCanvas.prototype.removeNode = function(nodeId){
	DOM.select(this.getSVGNodeId(nodeId)).parentNode.removeChild(DOM.select(this.getSVGNodeId(nodeId)));
	if (this.args.labeled){
		this.removeLabel(nodeId);
	}
};

/** REMOVING **/
GraphCanvas.prototype.removeSelected  = function(){
	/** El orden importa **/
	this.removeSelectedEdges();
	this.removeSelectedNode();
	
};

GraphCanvas.prototype.removeSelectedNode = function(){
	var selected = JSON.parse(JSON.stringify(this.getSelectedVertices()));
	this.deselectNodes();
	var sorted = selected.sort(function(a,b){return a - b;});
	for ( var i = 0; i < sorted.length; i++) {
		if (this.getDataset().getVertexById(sorted[i])!=null){
				this.getDataset().getVertexById(sorted[i]).remove();
		}
	}
};

/** EDGES **/
GraphCanvas.prototype.removeEdge = function(edgeId){
	if (DOM.select(this.getSVGEdgeId(edgeId))!=null){
		DOM.select(this.getSVGEdgeId(edgeId)).parentNode.removeChild(DOM.select(this.getSVGEdgeId(edgeId)));
	}
	
	if (DOM.select(this.getSVGEdgeId(edgeId) + "_shadow")!=null){
		DOM.select(this.getSVGEdgeId(edgeId) + "_shadow").parentNode.removeChild(DOM.select(this.getSVGEdgeId(edgeId) + "_shadow"));
	}

	if (DOM.select(this.getSVGArrowEdgeId(edgeId))!= null){
		DOM.select(this.getSVGArrowEdgeId(edgeId)).parentNode.removeChild(DOM.select(this.getSVGArrowEdgeId(edgeId)));
	}
};

GraphCanvas.prototype.overEdge = function(edgeId){
	if ((!this.args.interactive)|| this.dragging || this.selecting){return;}
	
	/** If selected we don't change the format **/
	if (this.args.isEdgeSelected[edgeId] == null){
		var format = this.getFormatter().getEdgeById(edgeId).getOver();
		format.args["cursor"] = "pointer";
		this.changeEdgeFormat(edgeId, format);
	}
};

GraphCanvas.prototype.outEdge = function(edgeId){
	if (!this.args.interactive){return;}
	
	/** If selected we don't change the format **/
	if (this.args.isEdgeSelected[edgeId] == null){
		this.changeEdgeFormat(edgeId, this.getFormatter().getEdgeById(edgeId).getDefault());
	}
};

GraphCanvas.prototype.changeEdgeFormat = function(edgeId, format){
	var svgEdge = DOM.select(this.getSVGEdgeId(edgeId) + "_shadow");
	if (svgEdge != null){
		var properties = format.toJSON();
		for ( var item in properties) {
			svgEdge.setAttribute(item, properties[item]);
		}
	}
};

GraphCanvas.prototype.deselectEdge = function(edgeID){
	if (this.args.isEdgeSelected[edgeID] != null){
		this.changeEdgeFormat(edgeID, this.getFormatter().getEdgeById(edgeID).getDefault());
		var index = this.args.isEdgeSelected[edgeID];
		delete this.args.isEdgeSelected[edgeID];
	}
};

GraphCanvas.prototype.deselectEdges = function(){
	var selected = JSON.parse(JSON.stringify(this.getSelectedEdges()));
	for ( var i = 0; i < selected.length; i++) {
		this.deselectEdge(selected[i]);
	}
};

GraphCanvas.prototype.removeSelectedEdges = function(){
	var selected = JSON.parse(JSON.stringify(this.getSelectedEdges()));
	this.deselectEdges();
	for ( var i = 0; i < selected.length; i++) {
		if ( this.getDataset().getEdgeById(selected[i])!=null){
			this.getDataset().getEdgeById(selected[i]).remove();
		}
	}
};

GraphCanvas.prototype.renderEdge = function(edgeId){
	var svgAttributesEdge = this.getFormatter().getEdgeById(edgeId).getDefault().toJSON();
	var edge = this.getDataset().getEdgeById(edgeId);
	
	var svgNodeTarget = this.getVertexById(edge.getNodeTarget().getId());
	var svgNodeSource = this.getVertexById(edge.getNodeSource().getId());
	svgAttributesEdge.id = this.getSVGEdgeId(edge.getId()) + "_shadow";
	
	
	var svgEdge = null;
	
	if (this.getFormatter().getEdgeById(edgeId) instanceof LineEdgeGraphFormatter){
		var coordenateSourceX = svgNodeSource.getAttribute("dragx");
		var coordenateSourceY = svgNodeSource.getAttribute("dragy");
		var coordenateTargetX = svgNodeTarget.getAttribute("dragx");
		var coordenateTargetY =  svgNodeTarget.getAttribute("dragy");
		
		SVG.drawLine(coordenateSourceX, coordenateSourceY, coordenateTargetX, coordenateTargetY,  this.GraphEdgeGroup, svgAttributesEdge);
		var attributesShadow = new Object();
		attributesShadow.id = this.getSVGEdgeId(edge.getId());
		attributesShadow["stroke-opacity"] = 0;
		attributesShadow["stroke-width"] = 4;
		attributesShadow["stroke"] = "black";
		svgEdge = SVG.drawLine(svgNodeSource.getAttribute("dragx") ,svgNodeSource.getAttribute("dragy"), svgNodeTarget.getAttribute("dragx"), svgNodeTarget.getAttribute("dragy"), this.GraphEdgeGroup, attributesShadow);
	}
	
	if(this.getFormatter().getEdgeById(edgeId) instanceof BezierEdgeGraphFormatter){
		var nodeId = edge.getNodeTarget().getId();
		var nodeSize = this.formatter.getVertexById(nodeId).getDefault().getSize() * this.getFormatter().getNodesMaxSize();
		svgAttributesEdge.fill = "none";
		svgAttributesEdge.id = this.getSVGEdgeId(edgeId);
		var d = this.calculateCoordenatesBezier(nodeSize, svgNodeSource.getAttribute("dragx") ,svgNodeSource.getAttribute("dragy"));
		svgEdge = SVG.drawPath(d, this.GraphEdgeGroup, svgAttributesEdge);
	};

	if ((this.getFormatter().getEdgeById(edgeId) instanceof DirectedLineEdgeGraphFormatter)|| (this.getFormatter().getEdgeById(edgeId) instanceof CutDirectedLineEdgeGraphFormatter) || (this.getFormatter().getEdgeById(edgeId) instanceof DotDirectedLineEdgeGraphFormatter) || (this.getFormatter().getEdgeById(edgeId) instanceof OdotDirectedLineEdgeGraphFormatter) || (this.getFormatter().getEdgeById(edgeId) instanceof OdirectedLineEdgeGraphFormatter)){
		var coordenateSourceX = svgNodeSource.getAttribute("dragx");
		var coordenateSourceY = svgNodeSource.getAttribute("dragy");
		var coordenateTargetX = svgNodeTarget.getAttribute("dragx");
		var coordenateTargetY =  svgNodeTarget.getAttribute("dragy");
		
		var offset = parseFloat(this.getFormatter().getVertexById(this.getDataset().getEdgeById(edgeId).getNodeTarget().getId()).getDefault().getSize() *  this.circleDefaultRadius);
		var point = this._calculateEdgePointerPosition(coordenateSourceX, coordenateSourceY, coordenateTargetX, coordenateTargetY, offset);
		coordenateTargetX = point.x;
		coordenateTargetY = point.y;
		SVG.drawLine(coordenateSourceX ,coordenateSourceY,coordenateTargetX, coordenateTargetY, this.GraphEdgeGroup, svgAttributesEdge);
	
		var attributesShadow = new Object();
		attributesShadow.id = this.getSVGEdgeId(edge.getId());
		attributesShadow["stroke-opacity"] = 0;
		attributesShadow["stroke-width"] = 4;
		attributesShadow["stroke"] = "black";
		svgEdge = SVG.drawLine(coordenateSourceX ,coordenateSourceY,coordenateTargetX, coordenateTargetY, this.GraphEdgeGroup, attributesShadow);
	}
	
	if(this.getFormatter().getEdgeById(edgeId) instanceof DirectedLineEdgeGraphFormatter || (this.getFormatter().getEdgeById(edgeId) instanceof OdirectedLineEdgeGraphFormatter)){
		var coordenateSourceX = svgNodeSource.getAttribute("dragx");
		var coordenateSourceY = svgNodeSource.getAttribute("dragy");
		var coordenateTargetX = svgNodeTarget.getAttribute("dragx");
		var coordenateTargetY =  svgNodeTarget.getAttribute("dragy");
		
		var point = this._calculateEdgePointerPosition(coordenateSourceX, coordenateSourceY, coordenateTargetX, coordenateTargetY, offset);
		coordenateTargetX = point.x;
		coordenateTargetY = point.y;
		
		var angle = Geometry.toDegree(point.angle) + 90;
		this.arrowDefaultSize = this.getFormatter().getEdgeById(edgeId).getArrowSize(); //getDefault().getArrowSize();
		var d = "-"+ this.arrowDefaultSize +",0 0,-"+parseFloat(this.arrowDefaultSize)*2+" "+ this.arrowDefaultSize +",0";
		
		var attributes;

		if (this.getFormatter().getEdgeById(edgeId) instanceof DirectedLineEdgeGraphFormatter ){
			attributes = [["fill", this.getFormatter().getEdgeById(edgeId).getDefault().getStroke()], ["stroke", this.getFormatter().getEdgeById(edgeId).getDefault().getStroke()], ["id", this.getSVGArrowEdgeId(edgeId)]];
		}
		else{
			attributes = [["fill", "#FFFFFF"], ["stroke", this.getFormatter().getEdgeById(edgeId).getDefault().getStroke()], ["id", this.getSVGArrowEdgeId(edgeId)]];
		}
		
		var flechaSVGNode = SVG.drawPoligon(d, this.GraphEdgeGroup, attributes);//, ["transform", "rotate("+angle+"), translate(0,0)"]]);
		flechaSVGNode.setAttribute("transform", " translate("+coordenateTargetX+", "+coordenateTargetY + "), rotate("+angle+")");
	};
	
	
	if(this.getFormatter().getEdgeById(edgeId) instanceof CutDirectedLineEdgeGraphFormatter){
		var coordenateSourceX = svgNodeSource.getAttribute("dragx");
		var coordenateSourceY = svgNodeSource.getAttribute("dragy");
		var coordenateTargetX = svgNodeTarget.getAttribute("dragx");
		var coordenateTargetY =  svgNodeTarget.getAttribute("dragy");
		
		var point = this._calculateEdgePointerPosition(coordenateSourceX, coordenateSourceY, coordenateTargetX, coordenateTargetY, offset);
		coordenateTargetX = point.x;
		coordenateTargetY = point.y;
		
		var angle = Geometry.toDegree(point.angle) + 90;
		
		//this.arrowDefaultSize = 2; //getDefault().getArrowSize();
		var d = "-4,0 4,0 4,-2 -4,-2";
		
		var flechaSVGNode = SVG.drawPoligon(d, this.GraphEdgeGroup, [["fill", this.getFormatter().getEdgeById(edgeId).getDefault().getStroke()], ["stroke", this.getFormatter().getEdgeById(edgeId).getDefault().getStroke()], ["id", this.getSVGArrowEdgeId(edgeId)]]);//, ["transform", "rotate("+angle+"), translate(0,0)"]]);
		flechaSVGNode.setAttribute("transform", " translate("+coordenateTargetX+", "+coordenateTargetY + "), rotate("+angle+")");
	};
	
	
	if( (this.getFormatter().getEdgeById(edgeId) instanceof DotDirectedLineEdgeGraphFormatter) || (this.getFormatter().getEdgeById(edgeId)  instanceof OdotDirectedLineEdgeGraphFormatter))  {
		var coordenateSourceX = svgNodeSource.getAttribute("dragx");
		var coordenateSourceY = svgNodeSource.getAttribute("dragy");
		var coordenateTargetX = svgNodeTarget.getAttribute("dragx");
		var coordenateTargetY =  svgNodeTarget.getAttribute("dragy");
		var point = this._calculateEdgePointerPosition(coordenateSourceX, coordenateSourceY, coordenateTargetX, coordenateTargetY, offset);
		coordenateTargetX = point.x;
		coordenateTargetY = point.y;
		var angle = Geometry.toDegree(point.angle) + 90;
	//	this.arrowDefaultSize = this.formatter.getEdgeById(edgeId).getArrowSize(); //getDefault().getArrowSize();
		var attributes = [];
		if (this.getFormatter().getEdgeById(edgeId)  instanceof OdotDirectedLineEdgeGraphFormatter){
			 attributes = [["fill", "#FFFFFF"], ["stroke", this.getFormatter().getEdgeById(edgeId).getDefault().getStroke()], ["id", this.getSVGArrowEdgeId(edgeId)]];
		}
		else{
			 attributes = [["fill", this.getFormatter().getEdgeById(edgeId).getDefault().getStroke()], ["stroke", this.getFormatter().getEdgeById(edgeId).getDefault().getStroke()], ["id", this.getSVGArrowEdgeId(edgeId)]];
		}
		var flechaSVGNode = SVG.drawCircle(0,0, 4, this.GraphEdgeGroup, attributes);
		flechaSVGNode.setAttribute("transform", " translate("+coordenateTargetX+", "+coordenateTargetY + "), rotate("+angle+")");
	};
	

	
	var _this = this;
	/** Events for the SVG edge **/
	if (svgEdge != null){
		if (this.getDataset().getEdgesCount() < this.args.maxNumberEdgesFiringEvents){
			svgEdge.addEventListener("mouseover", function(){ _this.overEdge(edgeId);}, false);
			svgEdge.addEventListener("mouseout", function(){_this.outEdge(edgeId);}, false);
		}
	}
};	

GraphCanvas.prototype._calculateEdgePointerPosition = function(sourceX, sourceY, targetX, targetY, radius){
	var angle = Geometry.getAngleBetweenTwoPoints(sourceX, sourceY, targetX, targetY);
	
	/** Suponiendo el node source que este a la derecha **/
	if ((targetX - sourceX) < 0 ){
		var b = Geometry.getAdjacentSideOfRectangleRight(angle, radius);
		targetX = parseFloat(targetX) + parseFloat(b);
		arrowX = parseFloat(targetX) + parseFloat(b) + this.arrowDefaultSize/2;
	}
	else{
		var b = Geometry.getAdjacentSideOfRectangleRight(angle, radius);
		targetX = parseFloat(targetX) - parseFloat(b);
		arrowX = parseFloat(targetX) - parseFloat(b) - this.arrowDefaultSize/2;
	}
	
	/** Suponiendo el node source que este a la arriba **/
	if ((targetY - sourceY) > 0 ){
		var a = Geometry.getOppositeSideOfRectangleRight(angle, radius);
		targetY = parseFloat(targetY) -  parseFloat(a);
		arrowY  = parseFloat(targetY) - parseFloat(a) - this.arrowDefaultSize/2;
	}
	else{
		var a = Geometry.getOppositeSideOfRectangleRight(angle, radius);
		targetY = parseFloat(targetY) +  parseFloat(a);
		arrowY  = parseFloat(targetY) + parseFloat(a) - this.arrowDefaultSize/2;
		
	}
	
	
	return {"x": arrowX, "y": arrowY, "angle" : angle};
};

GraphCanvas.prototype.calculateCoordenatesBezier = function(nodeSize, x1, y1){
	var x11 = x1 -(nodeSize/2);
    var y11 = y1 -(nodeSize/2);
    
    var x12 = parseFloat(x1) + parseFloat(nodeSize/2);
    var y12 = y1 -(nodeSize/2);
    
    var curvePointX = (x12 - x11)/2 + x11;
    var curvePointY = y1 - (nodeSize*2);
    var d = "M" + x11 + "," + y11 + " T" + curvePointX + "," +curvePointY + " " +  x12+ "," + y12 ;
    return d;
	
};

GraphCanvas.prototype.renderEdges = function(){
	for ( var edge in this.getDataset().getEdges()) {
		this.renderEdge(this.getDataset().getEdgeById(edge).getId());
		
	}
};

GraphCanvas.prototype.getLastSelectedNode = function(){
	var node = null;
	if(this.getSelectedVertices().length > 0){
		var nodeId = this.getSelectedVertices()[this.getSelectedVertices().length-1];
		node = this.getDataset().getVertexById(nodeId);
	}
	return node;
};
/*
GraphCanvas.prototype.getNodeByNameAndIndex = function(node, index){
	var nodeId = this.getDataset().verticesIndex[node][index];
	var nodeItem = this.getDataset().getVertexById(nodeId);
	return nodeItem;
};
*/

GraphCanvas.prototype.setDataset = function(dataset){
	this.dataset = dataset;
};

GraphCanvas.prototype.setFormatter = function(formatter){
	this.formatter = formatter;
};

GraphCanvas.prototype.setLayout = function(layout){
	this.layout = layout;
};



/** API **/ 
GraphCanvas.prototype.getDataset = function(){
	return this.dataset;
};

GraphCanvas.prototype.getFormatter = function(){
	return this.formatter;
};

GraphCanvas.prototype.getLayout = function(){
	return this.layout;
};

/** API DATASET **/
GraphCanvas.prototype.addVertex = function(name, args){
	this.getDataset().addNode(name, args);
};

GraphCanvas.prototype.removeVertex = function(vertexId){
	this.getDataset().getVertexById(vertexId).remove();
};

GraphCanvas.prototype.addEdge = function(edgeName, nodeSourceId, nodeTargetId, args){
	this.getDataset().addEdge(edgeName, nodeSourceId, nodeTargetId, args);
};
/*
GraphCanvas.prototype.removeEdge = function(edgeId){
	this.getDataset().getEdgeById(edgeId).remove();
};
*/

/** API FORMATTER **/
GraphCanvas.prototype.getWidth = function(){
	return this.getFormatter().getWidth();
};

GraphCanvas.prototype.getHeight = function(){
	return this.getFormatter().getHeight();
};


GraphCanvas.prototype.getBackgroundImage = function(){
	return this.getFormatter().getBackgroundImage();
};

//GraphCanvas.prototype.setBackgroundImage = function(value){
//	this.getFormatter().setBackgroundImage(value); 
//};

GraphCanvas.prototype.getBackgroundColor = function(){
	return this.getFormatter().getBackgroundColor();
};

GraphCanvas.prototype.setBackgroundColor = function(){
	this.getFormatter().setBackgroundColor(value);
};


//GraphCanvas.prototype.setEdgeFill = function(edgeId, value){
//	this.getFormatter().getEdgeById(edgeId).getDefault().setFill(value);
//};
//
//GraphCanvas.prototype.getEdgeFill = function(edgeId){
//	return this.getFormatter().getEdgeById(edgeId).getDefault().getFill();
//};



/** VERTICES FORMATTER **/
GraphCanvas.prototype.setVertexSize = function(vertexId, value){
	this.getFormatter().getVertexById(vertexId).getDefault().setSize(value);
};

GraphCanvas.prototype.getVertexSize = function(vertexId){
	return this.getFormatter().getVertexById(vertexId).getDefault().getSize();
};

GraphCanvas.prototype.setVertexStroke = function(vertexId, value){
	this.getFormatter().getVertexById(vertexId).getDefault().setStroke(value);
};

GraphCanvas.prototype.getVertexStroke = function(vertexId){
	return this.getFormatter().getVertexById(vertexId).getDefault().getStroke();
};

GraphCanvas.prototype.setVertexStrokeOpacity = function(vertexId, value){
	this.getFormatter().getVertexById(vertexId).getDefault().setStrokeOpacity(value);
};

GraphCanvas.prototype.getVertexStrokeOpacity = function(vertexId){
	return this.getFormatter().getVertexById(vertexId).getDefault().getStrokeOpacity();
};

GraphCanvas.prototype.setVertexOpacity = function(vertexId, value){
	this.getFormatter().getVertexById(vertexId).getDefault().setOpacity(value);
};

GraphCanvas.prototype.getVertexOpacity = function(vertexId){
	return this.getFormatter().getVertexById(vertexId).getDefault().getOpacity();
};

GraphCanvas.prototype.setVertexFill = function(vertexId, color){
	this.getFormatter().getVertexById(vertexId).getDefault().setFill(color);
};

GraphCanvas.prototype.getVertexFill = function(vertexId){
	return this.getFormatter().getVertexById(vertexId).getDefault().getFill();
};

/** EDGES FORMATTER **/
GraphCanvas.prototype.setEdgeSize = function(edgeId, value){
	this.getFormatter().getEdgeById(edgeId).getDefault().setSize(value);
};

GraphCanvas.prototype.getEdgeSize = function(edgeId){
	return this.getFormatter().getEdgeById(edgeId).getDefault().getSize();
};

GraphCanvas.prototype.setEdgeStroke = function(edgeId, value){
	this.getFormatter().getEdgeById(edgeId).getDefault().setStroke(value);
};

GraphCanvas.prototype.getEdgeStroke = function(edgeId){
	return this.getFormatter().getEdgeById(edgeId).getDefault().getStroke();
};

GraphCanvas.prototype.setEdgeStrokeOpacity = function(edgeId, value){
	this.getFormatter().getEdgeById(edgeId).getDefault().setStrokeOpacity(value);
};

GraphCanvas.prototype.getEdgeStrokeOpacity = function(edgeId){
	return this.getFormatter().getEdgeById(edgeId).getDefault().getStrokeOpacity();
};

GraphCanvas.prototype.setEdgeFill = function(edgeId, color){
	this.getFormatter().getEdgeById(edgeId).getDefault().setFill(color);
};

GraphCanvas.prototype.getEdgeFill = function(edgeId){
	return this.getFormatter().getEdgeById(edgeId).getDefault().getFill();
};


/** API LAYOUT **/
GraphCanvas.prototype.setCoordinates = function(vertexId, x, y){
	return this.getLayout().getEdgeById(vertexId).setCoordinates(x, y);
};






