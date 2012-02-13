


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


