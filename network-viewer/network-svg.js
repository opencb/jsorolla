/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

function NetworkSvg (parent, networkData, args) {
	var _this = this;
	this.id = "graph_"+Math.round(Math.random()*10000000);
	
	this.countSelectedNodes = 0;
	this.countSelectedEdges = 0;
	this.bgColor = "white";
	
	if (args != null){
		if(args.width != null){
			this.width = args.width;
		}
		if(args.height != null){
			this.height = args.height;
		}
		if(args.bgColor != null){
			this.bgColor = args.bgColor;
		}
		if (args.species != null){
			this.species = args.species;
		}
	}
	
	/** Network Data object **/
	this.networkData = networkData;
	
	/** Network Background object **/
	this.networkBackgroundSettings = new NetworkBackgroundSettings(this);
	
	/** Action mode **/
	this.mode = "select"; // Valid values: select, add, delete, join
	
	/** Draw default values **/
	this.nodeShape = "circle";
	this.nodeSize = 7;
	this.nodeColor = "#993300";
	this.nodeStrokeColor = "#000000";
	this.nodeStrokeSize = 1;
	this.nodeOpacity = 1;
	this.nodeLabel = "";
	this.edgeLabel = "";
	this.edgeType = "directed";
	
	/** Objects Graph **/
	this.nodeSvgList = {};
	this.edgeSvgList = {};
	this.selectedNodes = {};
	this.selectedEdges = {};
	
	this.onNodeClick = new Event(this);
	this.onEdgeClick = new Event(this);
	this.onCanvasClick = new Event(this);
	this.onSelectionChange = new Event(this);
    
    
    /** SVG init **/
    this.svg = SVG.init(parent,{
		"id": this.id,
		"width": this.width,
		"height": this.height
	});
    
    $(this.svg).mousedown(function(event){
    	if(!event.target.getAttribute("shape") && !event.target.getAttribute("type")){
    		_this.canvasMouseDown(event);
    	}
    });
    $(this.svg).mouseup(function(event){
    	if(!event.target.getAttribute("shape") && !event.target.getAttribute("type")){
    		_this.canvasMouseUp(event);
    	}
    });
    
    this.initSVG();
};

NetworkSvg.prototype.initSVG = function(){
	this.defs = SVG.addChild(this.svg, "defs", {});
	
	this.background = SVG.addChild(this.svg, "rect",{
		"id":"background",
		"width":"100%",
		"height":"100%",
		"fill":this.bgColor
	});
	
	this.backgroundImage = SVG.addChildImage(this.svg,{
		"id":"backgroundImage"
	});
};

NetworkSvg.prototype.refresh = function(networkData){
	if(networkData != null) {
		this.networkData = networkData;
	}
	
	this.nodeSvgList = {};
	this.edgeSvgList = {};
	
	// Empty SVG and set background
	while (this.svg.firstChild) {
		this.svg.removeChild(this.svg.firstChild);
	}
	
	this.initSVG();
	
	console.log(this.networkData);
	// loop over rendered nodes
	for (var node in this.networkData.nodes){
		
		// get config for this node type
		var typeArgs = NODE_TYPES[this.networkData.nodes[node].type];
		
		this.addNode({
			"id":node,
			"shape":this.networkData.nodes[node].metainfo.shape || typeArgs.shape,
			"size":this.networkData.nodes[node].metainfo.size || typeArgs.size,
			"color":this.networkData.nodes[node].metainfo.color || typeArgs.color,
			"strokeColor":this.networkData.nodes[node].metainfo.strokeColor || typeArgs.strokeColor,
			"strokeSize":this.networkData.nodes[node].metainfo.strokeSize || typeArgs.strokeSize,
			"opacity":this.networkData.nodes[node].metainfo.opacity || typeArgs.opacity,
			"label":this.networkData.nodes[node].name || "",
			"x":this.networkData.nodes[node].metainfo.x || typeArgs.x,
			"y":this.networkData.nodes[node].metainfo.y || typeArgs.y
		});
	}
	
	// loop over rendered edges
	for (var edge in this.networkData.edges){
		this.addEdge({
			"id":edge,
			"source":this.networkData.edges[edge].source,
			"target":this.networkData.edges[edge].target,
			"type":this.networkData.edges[edge].type,
			"x1":this.networkData.edges[edge].metainfo.x1 || 0,
			"y1":this.networkData.edges[edge].metainfo.y1 || 0,
			"x2":this.networkData.edges[edge].metainfo.x2 || 0,
			"y2":this.networkData.edges[edge].metainfo.y2 || 0,
			"markerArrow":this.networkData.edges[edge].metainfo.markerArrow //|| "url(#arrow-"+this.networkData.edges[edge].type+"-14)"
		});
	}
};

NetworkSvg.prototype.addNode = function(args, fromClick){
	var _this = this;
	var nodeId = args.id;
	
	if(fromClick){
		// Add info to networkData
		nodeId = this.networkData.addNode({
			"name":args.label,
			"type":"none",
			"metainfo":args
		});
	}
	
	/** SVG **/
	var nodeGroup = SVG.addChild(this.svg, "g", {"cursor":"pointer"});
	
	var customShape = args.shape;
	var attrX = "cx";
	var attrY = "cy";
	if(args.shape != "circle" && args.shape != "ellipse"){
		args.shape = "rect";
		attrX = "x";
		attrY = "y";
	}
	var svgArgs = this.getSvgArgs(customShape, nodeId, args);
	
	var nodeSvg = SVG.addChild(nodeGroup, args.shape, svgArgs);
	
	var textOffset = (parseInt(nodeSvg.getAttribute("height")) + 10) || (parseInt(nodeSvg.getAttribute("r") || nodeSvg.getAttribute("ry") || 0)*2 + 10);
	var nodeText = SVG.addChild(nodeGroup, "text", {
		"id":nodeId,
		"x":args.x,
		"y":args.y + textOffset,
		"font-size":10,
		"class":"nodeLabel",
		"fill":"green"
	});
	nodeText.textContent = args.label;
	
	// attach click event
//	$(nodeSvg).click(function(event){_this.nodeClick(event, this.id);});
	
	// attach move event
	$(nodeSvg).mousedown(function(event) {
		_this.nodeClick(event, this.id);
		
//		var downX = event.clientX;
//		var downY = event.clientY;
//		var clickShapeOffsetX = downX - nodeSvg.getAttribute(attrX);
//		var clickShapeOffsetY = downY - nodeSvg.getAttribute(attrY);
//		var clickTextOffsetX = downX - nodeText.getAttribute("x");
//		var clickTextOffsetY = downY - nodeText.getAttribute("y");
//		var lastX = 0, lastY = 0, edgeOffsetX = 0, edgeOffsetY = 0;
//		
//		// if is rect calculate the figure center for move edges
//		if(attrX == "x"){
//			edgeOffsetX = parseInt(nodeSvg.getAttribute("width")/2);
//			edgeOffsetY = parseInt(nodeSvg.getAttribute("height")/2);
//		}
//		
//		$(_this.svg).mousemove(function(event){
//			if(_this.mode == "select"){
//				var newX = (downX + event.clientX);
//				var newY = (downY + event.clientY);
//				if(newX!=lastX || newY!=lastY){
//					nodeSvg.setAttribute(attrX, event.clientX - clickShapeOffsetX);
//					nodeSvg.setAttribute(attrY, event.clientY - clickShapeOffsetY);
//					
//					nodeText.setAttribute("x", event.clientX - clickTextOffsetX);
//					nodeText.setAttribute("y", event.clientY - clickTextOffsetY);
//					
//					//move edges in
//					for ( var i=0, len=_this.nodeSvgList[nodeSvg.id].edgesIn.length; i<len; i++) {
////						var edgeId = _this.nodeSvgList[nodeSvg.id].edgesIn[i]+"-"+nodeSvg.id;
//						var edgeId = _this.nodeSvgList[nodeSvg.id].edgesIn[i];
//						_this.edgeSvgList[edgeId].setAttribute("x2", event.clientX - clickShapeOffsetX + edgeOffsetX);
//						_this.edgeSvgList[edgeId].setAttribute("y2", event.clientY - clickShapeOffsetY + edgeOffsetY);
//					}
//					
//					//move edges out
//					for ( var i=0, len=_this.nodeSvgList[nodeSvg.id].edgesOut.length; i<len; i++) {
////						var edgeId = nodeSvg.id+"-"+_this.nodeSvgList[nodeSvg.id].edgesOut[i];
//						var edgeId = _this.nodeSvgList[nodeSvg.id].edgesOut[i];
//						_this.edgeSvgList[edgeId].setAttribute("x1", event.clientX - clickShapeOffsetX + edgeOffsetX);
//						_this.edgeSvgList[edgeId].setAttribute("y1", event.clientY - clickShapeOffsetY + edgeOffsetY);
//					}
//					
//					lastX = newX;
//					lastY = newY;
//				}
//			}
//		});
	});
	$(nodeSvg).mouseup(function(event) {
		if(_this.mode == "select") $(_this.svg).off('mousemove');
	});
	
	// add to svg node list
	this.nodeSvgList[nodeId] = nodeGroup;
	this.nodeSvgList[nodeId].edgesIn = [];
	this.nodeSvgList[nodeId].edgesOut = [];
	/** /SVG **/
};

NetworkSvg.prototype.removeNode = function(nodeId, onlySVG) {
	/** SVG **/
	// remove node input edges
	for ( var i=0, leni=this.nodeSvgList[nodeId].edgesIn.length; i<leni; i++) {
//		var sourceNode = this.nodeSvgList[nodeId].edgesIn[i];
//		var edgeId = sourceNode+"-"+nodeId;
		var edgeId = this.nodeSvgList[nodeId].edgesIn[i];
		var sourceNode = this.edgeSvgList[edgeId].getAttribute("source");
		this.svg.removeChild(this.edgeSvgList[edgeId]);
		delete this.edgeSvgList[edgeId];
		if(!onlySVG) {
			this.networkData.removeEdge(edgeId); //remove from NetworkData
		}
		
		// remove edge from source node
		for ( var j=0, lenj=this.nodeSvgList[sourceNode].edgesOut.length; j<lenj; j++) {
			if(this.nodeSvgList[sourceNode].edgesOut[j] == edgeId){
				this.nodeSvgList[sourceNode].edgesOut.splice(j, 1);
				break;
			}
		}
	}
	
	// remove node out edges
	for ( var i=0, len=this.nodeSvgList[nodeId].edgesOut.length; i<len; i++) {
//		var targetNode = this.nodeSvgList[nodeId].edgesOut[i];
//		var edgeId = nodeId+"-"+targetNode;
		var edgeId = this.nodeSvgList[nodeId].edgesOut[i];
		var targetNode = this.edgeSvgList[edgeId].getAttribute("target");
		this.svg.removeChild(this.edgeSvgList[edgeId]);
		delete this.edgeSvgList[edgeId];
		if(!onlySVG) {
			this.networkData.removeEdge(edgeId); //remove from NetworkData
		}
		
		// remove edge from target node
		for ( var j=0, lenj=this.nodeSvgList[targetNode].edgesIn.length; j<lenj; j++) {
			if(this.nodeSvgList[targetNode].edgesIn[j] == edgeId){
				this.nodeSvgList[targetNode].edgesIn.splice(j, 1);
				break;
			}
		}
	}
	
	// remove node
	this.svg.removeChild(this.nodeSvgList[nodeId]);
	delete this.nodeSvgList[nodeId];
	/** /SVG **/
	
	/** Data **/
	if(!onlySVG) {
		this.networkData.removeNode(nodeId);
	}
	/** /Data **/
};

NetworkSvg.prototype.filterNodes = function(nodeList){
	this.deselectAllNodes();
	
	//Delete nodes that not are in list
	for(var node in this.nodeSvgList){
		if(!nodeList[node]) {
			this.removeNode(node, true);
		}
	}
};

NetworkSvg.prototype.moveNode = function(nodeId, newX, newY){
	//move node
	var figure = this.nodeSvgList[nodeId].childNodes[0];
	if(figure.hasAttribute("x")){
		figure.setAttribute("x", newX);
		figure.setAttribute("y", newY);
	}else{
		figure.setAttribute("cx", newX);
		figure.setAttribute("cy", newY);
	}
	
	//move label
	var textOffsetX = parseInt(figure.getAttribute("r") || figure.getAttribute("rx") || 0);
	var textOffsetY = parseInt(figure.getAttribute("height") || figure.getAttribute("r") || figure.getAttribute("ry") || 0) + 10;
	var label = this.nodeSvgList[nodeId].childNodes[1];
	label.setAttribute("x", newX - textOffsetX);
	label.setAttribute("y", newY + textOffsetY);
	
	var edgeOffsetX = parseInt(figure.getAttribute("width") || 0)/2;
	var edgeOffsetY = parseInt(figure.getAttribute("height") || 0)/2;
	//move edges in
	for ( var i=0, len=this.nodeSvgList[nodeId].edgesIn.length; i<len; i++) {
		var edgeId = this.nodeSvgList[nodeId].edgesIn[i];
		this.edgeSvgList[edgeId].setAttribute("x2", newX + edgeOffsetX);
		this.edgeSvgList[edgeId].setAttribute("y2", newY + edgeOffsetY);
	}
	
	//move edges out
	for ( var i=0, len=this.nodeSvgList[nodeId].edgesOut.length; i<len; i++) {
		var edgeId = this.nodeSvgList[nodeId].edgesOut[i];
		this.edgeSvgList[edgeId].setAttribute("x1", newX + edgeOffsetX);
		this.edgeSvgList[edgeId].setAttribute("y1", newY + edgeOffsetY);
	}
};

NetworkSvg.prototype.addEdgeFromClick = function(nodeId){
	var _this = this;
	
	/** SVG **/
	if(this.joinSourceNode == null){
		this.joinSourceNode = nodeId;
		var figure = this.nodeSvgList[this.joinSourceNode].childNodes[0];
		this.joinSourceX = figure.getAttribute("x") || figure.getAttribute("cx");
		this.joinSourceY = figure.getAttribute("y") || figure.getAttribute("cy");
		
		// if is rect calculate the figure center
		if(figure.hasAttribute("x")){ 
			this.joinSourceX = parseInt(this.joinSourceX) + parseInt(figure.getAttribute("width"))/2;
			this.joinSourceY = parseInt(this.joinSourceY) + parseInt(figure.getAttribute("height"))/2;
		}
		
		this.edgeSvg = SVG.addChild(this.svg, "line", {
			"id":this.networkData.edgeId,
			"source":this.joinSourceNode,
			"type":this.edgeType,
			"x1":this.joinSourceX,
			"y1":this.joinSourceY,
			"x2":this.joinSourceX,
			"y2":this.joinSourceY,
			"stroke":"red",
			"stroke-width":"0.5",
			"cursor":"pointer"
//			"marker-end":"url(#Arrow)"
		},2);
		
		$(this.svg).mousemove(function(event){
			var offsetX = (event.clientX - $(_this.svg).offset().left);
			var offsetY = (event.clientY - $(_this.svg).offset().top);
			_this.edgeSvg.setAttribute("x2", offsetX);
			_this.edgeSvg.setAttribute("y2", offsetY);
		});
	} else{
		$(this.svg).off('mousemove');
		var joinTargetNode = nodeId;
		var figure = this.nodeSvgList[joinTargetNode].childNodes[0];
		var joinTargetX = figure.getAttribute("x") || figure.getAttribute("cx");
		var joinTargetY = figure.getAttribute("y") || figure.getAttribute("cy");
		
		// if is rect calculate the figure center
		if(figure.hasAttribute("x")){
			joinTargetX = parseInt(joinTargetX) + parseInt(figure.getAttribute("width"))/2;
			joinTargetY = parseInt(joinTargetY) + parseInt(figure.getAttribute("height"))/2;
			var a = parseInt(figure.getAttribute("width"));
			var b = parseInt(figure.getAttribute("height"));
			var tipOffset = Math.floor(parseInt(Math.sqrt(a*a+b*b))/2);
		}else{
			var tipOffset = parseInt(figure.getAttribute("r")) || parseInt(figure.getAttribute("rx"));
		}

		this.edgeSvg.setAttribute("stroke", "black");
		
		// if not exists this marker, add new one to defs
		var markerArrowId = "#arrow-"+this.edgeType+"-"+tipOffset;
		if($(markerArrowId).length == 0){
			this.addArrowShape(this.edgeType, tipOffset);
		}
		this.edgeSvg.setAttribute("marker-end", "url("+markerArrowId+")");

		// if not exists this marker, add new one to defs
		var edgeId = this.networkData.edgeId;
		var markerLabelId = "#edgeLabel-"+edgeId;
		if($(markerLabelId).length == 0){
			this.addEdgeLabel(edgeId, this.edgeLabel);
		}
		this.edgeSvg.setAttribute("marker-start", "url("+markerLabelId+")");
		this.edgeSvg.setAttribute("label", this.edgeLabel);
		
		this.edgeSvg.setAttribute("x2", joinTargetX);
		this.edgeSvg.setAttribute("y2", joinTargetY);
		
//		var edgeId = this.joinSourceNode+"-"+joinTargetNode;
//		this.edgeSvg.setAttribute("id", edgeId);
		this.edgeSvg.setAttribute("target", joinTargetNode);
		
		this.edgeSvgList[edgeId] = this.edgeSvg;
		this.nodeSvgList[this.joinSourceNode].edgesOut.push(edgeId);
		this.nodeSvgList[joinTargetNode].edgesIn.push(edgeId);
		
		$(this.edgeSvg).click(function(event){_this.edgeClick(event, this.id);});
		
		/** Data **/
//		var directed = true;
//		if(this.edgeType == "undirected") directed = false;
		var args = {
					"weight":1,
					"x1":this.joinSourceX,
					"y1":this.joinSourceY,
					"x2":joinTargetX,
					"y2":joinTargetY,
					"markerArrow": "url("+markerArrowId+")",
					"markerLabel": "url("+markerLabelId+")"
					};
		this.networkData.addEdge(this.joinSourceNode, joinTargetNode, this.edgeType, this.edgeLabel, args);
		/** /Data **/
		
		// reset join
		this.joinSourceNode = null;
	}
	/** /SVG **/
};

NetworkSvg.prototype.addEdge = function(args){
	/** SVG **/
//	var edgeType = args.markerEnd.split('-')[1];
	
	var tipOffset = 14;
	if(!args.markerArrow) {
		var figure = this.nodeSvgList[args.target].childNodes[0];
		// if is rect calculate the figure center
		if(figure.hasAttribute("x")){
			var a = parseInt(figure.getAttribute("width"));
			var b = parseInt(figure.getAttribute("height"));
			tipOffset = Math.floor(parseInt(Math.sqrt(a*a+b*b))/2);
		}else{
			tipOffset = parseInt(figure.getAttribute("r")) || parseInt(figure.getAttribute("rx"));
		}
	}
	else {
		tipOffset = args.markerArrow.split('-')[2].slice(0,-1);
	}
	
	// if not exists this marker, add new one to defs
	var markerArrowId = "#arrow-"+args.type+"-"+tipOffset;
	if($(markerArrowId).length == 0){
		this.addArrowShape(args.type, tipOffset);
	}
	
	this.edgeSvg = SVG.addChild(this.svg, "line", {
		"id":args.id,
		"source":args.source,
		"target":args.target,
		"type":args.type,
		"x1":args.x1,
		"y1":args.y1,
		"x2":args.x2,
		"y2":args.y2,
		"stroke":"black",
		"stroke-width":"0.5",
		"cursor":"pointer",
		"marker-end":"url("+markerArrowId+")"
	},2);
	
	$(this.edgeSvg).click(function(event){_this.edgeClick(event, this.id);});
	
	this.edgeSvgList[args.id] = this.edgeSvg;
//	var sourceNode = args.id.split('-')[0];
//	var targetNode = args.id.split('-')[1];

	this.nodeSvgList[args.source].edgesOut.push(args.id);
	this.nodeSvgList[args.target].edgesIn.push(args.id);
	/** /SVG **/
};

NetworkSvg.prototype.removeEdge = function(edgeId){
	var sourceNode = this.edgeSvgList[edgeId].getAttribute("source");
	var targetNode = this.edgeSvgList[edgeId].getAttribute("target");
	
	// remove from source and target
	for(var i=0, len=this.nodeSvgList[sourceNode].edgesOut.length; i<len; i++) {
		if(this.nodeSvgList[sourceNode].edgesOut[i] == edgeId){
			this.nodeSvgList[sourceNode].edgesOut.splice(i, 1);
			break;
		}
	}
	for(var i=0, leni=this.nodeSvgList[targetNode].edgesIn.length; i<leni; i++) {
		if(this.nodeSvgList[targetNode].edgesIn[i] == edgeId){
			this.nodeSvgList[targetNode].edgesIn.splice(i, 1);
			break;
		}
	}
	
	this.svg.removeChild(this.edgeSvgList[edgeId]);
	delete this.edgeSvgList[edgeId];
	
	// remove from NetworkData
	this.networkData.removeEdge(edgeId);
};

NetworkSvg.prototype.getSvgArgs = function(shape, nodeId, args){
	var svgArgs = {};
	switch (shape) {
	case "square":
		svgArgs = {
			"id":nodeId,
			"shape":shape,
			"nodeSize":args.size,
			"nodeLabel":args.label,
			"x":args.x,
			"y":args.y,
			"width":4*args.size,
			"height":4*args.size,
			"fill":args.color,
			"stroke":args.strokeColor,
			"stroke-width":args.strokeSize,
			"opacity":args.opacity
		};
		break;
	case "rectangle":
		svgArgs = {
			"id":nodeId,
			"shape":shape,
			"nodeSize":args.size,
			"nodeLabel":args.label,
			"x":args.x,
			"y":args.y,
			"width":7*args.size,
			"height":4*args.size,
			"fill":args.color,
			"stroke":args.strokeColor,
			"stroke-width":args.strokeSize,
			"opacity":args.opacity
	};
		break;
	case "circle":
		var radius = 2*args.size;
		svgArgs = {
			"id":nodeId,
			"shape":shape,
			"nodeSize":args.size,
			"nodeLabel":args.label,
			"cx":args.x + radius,
			"cy":args.y + radius,
			"r":radius,
			"fill":args.color,
			"stroke":args.strokeColor,
			"stroke-width":args.strokeSize,
			"opacity":args.opacity
		};
		break;
	case "ellipse":
		var radius = 2*args.size;
		svgArgs = {
			"id":nodeId,
			"shape":shape,
			"nodeSize":args.size,
			"nodeLabel":args.label,
			"cx":args.x + radius,
			"cy":args.y + radius,
			"rx":radius,
			"ry":1.5*args.size,
			"fill":args.color,
			"stroke":args.strokeColor,
			"stroke-width":args.strokeSize,
			"opacity":args.opacity
		};
		break;
	}
	
	return svgArgs;
};

NetworkSvg.prototype.addArrowShape = function(type, offset){
	var id = "arrow-"+type+"-"+offset;
	var marker = SVG.addChild(this.defs, "marker", {
		"id":id,
		"orient":"auto",
		"style":"overflow:visible;"
	});

	switch (type) {
	case "directed":
		var arrow = SVG.addChild(marker, "polyline", {
			"transform":"scale(2) rotate(0) translate(0,0)",
			"fill":"black",
			"stroke":"black",
			"points":"-"+offset+",0 "+(-offset-14)+",-6 "+(-offset-14)+",6 -"+offset+",0"
		});
		break;
	case "odirected":
		var arrow = SVG.addChild(marker, "polyline", {
			"transform":"scale(2) rotate(0) translate(0,0)",
			"fill":"white",
			"stroke":"black",
//			"points":"-14,0 -28,-6 -28,6 -14,0"
			"points":"-"+offset+",0 "+(-offset-14)+",-6 "+(-offset-14)+",6 -"+offset+",0"
		});
		break;
	case "inhibited":
		var arrow = SVG.addChild(marker, "rect", {
			"transform":"scale(2) rotate(0) translate(0,0)",
			"fill":"black",
			"stroke":"black",
			"x":-offset-6,
			"y":-6,
			"width":6,
			"height":12
		});
		break;
	case "dot":
		var arrow = SVG.addChild(marker, "circle", {
			"transform":"scale(2) rotate(0) translate(0,0)",
			"fill":"black",
			"stroke":"black",
			"cx":-offset-6,
			"cy":0,
			"r":6
		});
		break;
	case "odot":
		var arrow = SVG.addChild(marker, "circle", {
			"transform":"scale(2) rotate(0) translate(0,0)",
			"fill":"white",
			"stroke":"black",
			"cx":-offset-6,
			"cy":0,
			"r":6
		});
		break;
	}
};

NetworkSvg.prototype.addEdgeLabel = function(edgeId, label){
	var id = "edgeLabel-"+edgeId;
	var marker = SVG.addChild(this.defs, "marker", {
		"id":id,
		"orient":"auto",
		"style":"overflow:visible;"
	});
	var text = SVG.addChild(marker, "text", {
//		"transform":"scale(2) rotate(0) translate(0,0)",
		"x":60,
		"y":16,
		"font-size":20,
		"class":"edgeLabel",
		"fill":"green"
	});
	text.textContent = label;
};

NetworkSvg.prototype.reallocateEdgesPosition = function(nodeSvg){
	var nodeId = nodeSvg.getAttribute("id");
	var x = parseInt(nodeSvg.getAttribute("x") || nodeSvg.getAttribute("cx"));
	var y = parseInt(nodeSvg.getAttribute("y") || nodeSvg.getAttribute("cy"));
	var edgeOffsetX = parseInt(nodeSvg.getAttribute("width") || 0)/2;
	var edgeOffsetY = parseInt(nodeSvg.getAttribute("height") || 0)/2;
	
	//move edges in
	for ( var i=0, len=this.nodeSvgList[nodeId].edgesIn.length; i<len; i++) {
		var edgeId = this.nodeSvgList[nodeId].edgesIn[i];
		this.edgeSvgList[edgeId].setAttribute("x2", x + edgeOffsetX);
		this.edgeSvgList[edgeId].setAttribute("y2", y + edgeOffsetY);
	}
	
	//move edges out
	for ( var i=0, len=this.nodeSvgList[nodeId].edgesOut.length; i<len; i++) {
		var edgeId = this.nodeSvgList[nodeId].edgesOut[i];
		this.edgeSvgList[edgeId].setAttribute("x1", x + edgeOffsetX);
		this.edgeSvgList[edgeId].setAttribute("y1", y + edgeOffsetY);
	}
};

NetworkSvg.prototype.reallocateInputEdgeArrows = function(nodeSvg){
	// change arrow markers of edges in
	if(nodeSvg.hasAttribute("x")){
		var a = parseInt(nodeSvg.getAttribute("width"));
		var b = parseInt(nodeSvg.getAttribute("height"));
		var tipOffset = Math.floor(parseInt(Math.sqrt(a*a+b*b))/2);
	}else{
		var tipOffset = parseInt(nodeSvg.getAttribute("r")) || parseInt(nodeSvg.getAttribute("rx"));
	}
	for(var i=0, len=this.nodeSvgList[nodeSvg.id].edgesIn.length; i<len; i++){
		var oldTipOffset = parseInt(this.edgeSvgList[i].getAttribute("marker-end").substr(-3,2));
		var edgeType = this.edgeSvgList[i].getAttribute("marker-end").split("-")[1];
		if(tipOffset != oldTipOffset){
			// if not exists this marker, add new one to defs
			var markerId = "#arrow-"+edgeType+"-"+tipOffset;
			if($(markerId).length == 0){
				this.addArrowShape(edgeType, tipOffset);
			}
			this.edgeSvgList[i].setAttribute("marker-end", "url("+markerId+")");
		}
	}
};

/** CONVERSION FUNCTIONS **/
NetworkSvg.prototype.toJson = function(){
	var json = {};
	
	// Data
	json.data = this.networkData.toJson();
	
	// Display
	json.display = {};
	json.display.nodes = {};
	json.display.edges = {};
	json.display.graph = {"width":this.width, "height":this.height, "bgColor":this.bgColor};
	
	// loop over rendered nodes
	for (var inode in this.nodeSvgList){
		var figure = this.nodeSvgList[inode].childNodes[0];
		var node = {};
		var id = parseInt(figure.getAttribute("id"));
		node.shape = figure.getAttribute("shape");
		node.size = parseInt(figure.getAttribute("nodeSize"));
		node.label = figure.getAttribute("nodeLabel");
		node.color = figure.getAttribute("fill");
		node.strokeColor = figure.getAttribute("stroke");
		node.strokeSize = figure.getAttribute("stroke-width");
		node.opacity = figure.getAttribute("opacity");
		node.x = parseInt(figure.getAttribute("x") || figure.getAttribute("cx"));
		node.x -= parseInt(figure.getAttribute("r") || figure.getAttribute("rx") || 0);
		node.y = parseInt(figure.getAttribute("y") || figure.getAttribute("cy"));
		node.y -= parseInt(figure.getAttribute("r") || figure.getAttribute("ry") || 0);
		
		json.display.nodes[id] = node;
	}
	
	// loop over rendered edges
	for (var iedge in this.edgeSvgList){
		var figure = this.edgeSvgList[iedge];
		var edge = {};
		var id = figure.getAttribute("id");
		edge.source = figure.getAttribute("source");
		edge.target = figure.getAttribute("target");
		edge.type = figure.getAttribute("type");
		edge.x1 = parseInt(figure.getAttribute("x1"));
		edge.y1 = parseInt(figure.getAttribute("y1"));
		edge.x2 = parseInt(figure.getAttribute("x2"));
		edge.y2 = parseInt(figure.getAttribute("y2"));
		edge.markerEnd = figure.getAttribute("marker-end");
		
		json.display.edges[id] = edge;
	}
	return json;
};

//XXX DEPRECATED
NetworkSvg.prototype.loadFromJson = function(jsonStr){
	var json = JSON.parse(jsonStr);
	this.nodeSvgList = {};
	this.edgeSvgList = {};
	
	// loop over rendered nodes
	for (var node in json.display.nodes){
		this.addNode({
			"id":node,
			"shape":json.display.nodes[node].shape,
			"size":json.display.nodes[node].size,
			"color":json.display.nodes[node].color,
			"strokeColor":json.display.nodes[node].strokeColor,
			"strokeSize":json.display.nodes[node].strokeSize,
			"opacity":json.display.nodes[node].opacity,
			"label":json.display.nodes[node].label,
			"x":json.display.nodes[node].x,
			"y":json.display.nodes[node].y
		});
	}
	
	// loop over rendered edges
	for (var edge in json.display.edges){
		this.addEdge({
			"id":edge,
			"source":json.display.edges[edge].source,
			"target":json.display.edges[edge].target,
			"type":json.display.edges[edge].type,
			"x1":json.display.edges[edge].x1,
			"y1":json.display.edges[edge].y1,
			"x2":json.display.edges[edge].x2,
			"y2":json.display.edges[edge].y2,
			"markerEnd":json.display.edges[edge].markerEnd
		});
	}
};

/** LAYOUT FUNCTIONS **/
NetworkSvg.prototype.setLayoutDEPRECATED = function(type){
	switch (type) {
	case "Circle":
		var count = this.networkData.getNodesCount();
		var vertexCoordinates = this.calculateLayoutVertex(type, count);
		var aux = 0;
		for(var nodeId in this.nodeSvgList){
			var x = this.width*(0.05 + 0.85*vertexCoordinates[aux].x);
			var y = this.height*(0.05 + 0.85*vertexCoordinates[aux].y);
			this.moveNode(nodeId, x, y);
			aux++;
		}
		break;
	case "Square":
		var count = this.networkData.getNodesCount();
		var vertexCoordinates = this.calculateLayoutVertex(type, count);
		var aux = 0;
		for(var nodeId in this.nodeSvgList){
			var x = this.width*(0.05 + 0.85*vertexCoordinates[aux].x);
			var y = this.height*(0.05 + 0.85*vertexCoordinates[aux].y);
			this.moveNode(nodeId, x, y);
			aux++;
		}
		break;
	case "Random":
		for(var nodeId in this.nodeSvgList){
			var x = this.width*(0.05 + 0.85*Math.random());
			var y = this.height*(0.05 + 0.85*Math.random());
			this.moveNode(nodeId, x, y);
		}
		break;
	default:
		var dotText = this.networkData.toDot();
		var url = "http://bioinfo.cipf.es/utils/ws/rest/network/layout/"+type+".coords";
		var _this = this;
		
		$.ajax({
			async: true,
			type: "POST",
			url: url,
			dataType: "text",
			data: {
				dot: dotText
			},
			cache: false,
			success: function(data){ 
				var response = JSON.parse(data);
				for(var nodeId in response){
					var x = _this.width*(0.05 + 0.85*response[nodeId].x);
					var y = _this.height*(0.05 + 0.85*response[nodeId].y);
					_this.moveNode(nodeId, x, y);
				}
			}
		});
		break;
	}
};

NetworkSvg.prototype.calculateLayoutVertexDEPRECATED = function(type, count){
	switch (type) {
	case "Circle":
		var radius = 0.4;
		var centerX = 0.5;
		var centerY = 0.5;
		var vertexCoordinates = new Array();
		for(var i = 0; i < count; i++){
			x = centerX + radius * Math.sin(i * 2 * Math.PI/count);
			y = centerY + radius * Math.cos(i * 2 * Math.PI/count);
			vertexCoordinates.push({'x':x,'y':y});
		}
		return vertexCoordinates;
		break;

	case "Square":
		var xMin = 0.1;
		var xMax = 0.9;
		var yMin = 0.1;
		var yMax = 0.9;
		var rows = Math.sqrt(count);
		var step = (xMax - xMin) / rows;
		var vertexCoordinates = new Array();
		for(var i = 0; i < rows; i ++){
			for ( var j = 0; j < rows; j++) {
				x = i * step + xMin;
				y = j * step + yMin;
				vertexCoordinates.push({'x':x,'y':y});
			}
		}
		return vertexCoordinates;
		break;
	}
};

NetworkSvg.prototype.collapse = function(){
	var xMin = -Infinity;
	var xMax = Infinity;
	var yMin = -Infinity;
	var yMax = Infinity;

	for (var nodeId in this.selectedNodes){
		var figure = this.nodeSvgList[nodeId].childNodes[0];
		var nodeX = parseInt(figure.getAttribute("x") || figure.getAttribute("cx"));;
		var nodeY = parseInt(figure.getAttribute("y") || figure.getAttribute("cy"));
		
		if (xMin < nodeX){xMin = nodeX;}
		if (xMax > nodeX){xMax = nodeX;}
		if (yMin < nodeY){yMin = nodeY;}
		if (yMax > nodeY){yMax = nodeY;}
	}
	
	var centerX =  xMin - xMax;
	var centerY =  yMin - yMax ;
	var radius = (xMax - xMin)/4;
	
	var i = 0;
	for (var nodeId in this.selectedNodes){
		var x = centerX + radius * Math.sin(i * 2 * Math.PI/this.countSelectedNodes);
		var y = centerY + radius * Math.cos(i * 2 * Math.PI/this.countSelectedNodes);
		this.moveNode(nodeId, x, y);
		i++;
	}
};

/** SELECTION FUNCTIONS **/
NetworkSvg.prototype.selectNode = function(nodeId){
	if(this.selectedNodes[nodeId]){
		this.countSelectedNodes--;
		//Restore default color and delete from object
		this.nodeSvgList[nodeId].childNodes[0].setAttribute("fill", this.selectedNodes[nodeId]);
		delete this.selectedNodes[nodeId];
	}else{
		this.countSelectedNodes++;
		//Save the color of the node
		this.selectedNodes[nodeId] = this.nodeSvgList[nodeId].childNodes[0].getAttribute("fill");
		
		//Change the color of the node
		this.nodeSvgList[nodeId].childNodes[0].setAttribute("fill", "red");
	}
};

NetworkSvg.prototype.selectNodes = function(nodeList){
	this.setMode("select");
	this.deselectAllNodes();

	//Select nodes in list
	for(var i=0, len=nodeList.length; i<len; i++){
		this.countSelectedNodes++;
		//Save the color of the node
		this.selectedNodes[nodeList[i]] = this.nodeSvgList[nodeList[i]].childNodes[0].getAttribute("fill");

		//Change the color of the node
		this.nodeSvgList[nodeList[i]].childNodes[0].setAttribute("fill", "red");
	}
	
	this.onCanvasClick.notify();
};

NetworkSvg.prototype.selectAllNodes = function(){
	for (var nodeId in this.nodeSvgList){
		if(!this.selectedNodes[nodeId]){
			this.countSelectedNodes++;
			//Save the color of the node
			this.selectedNodes[nodeId] = this.nodeSvgList[nodeId].childNodes[0].getAttribute("fill");
			
			//Change the color of the node
			this.nodeSvgList[nodeId].childNodes[0].setAttribute("fill", "red");
		}
	}
};

NetworkSvg.prototype.deselectAllNodes = function(){
	for (var id in this.selectedNodes){
		this.countSelectedNodes--;
		//Restore default color and delete from object
		this.nodeSvgList[id].childNodes[0].setAttribute("fill", this.selectedNodes[id]);
		delete this.selectedNodes[id];
	}
};

NetworkSvg.prototype.selectAdjacentNodes = function(){
	var nodeList = [];
	var visitedNodes = {};
	for (var nodeId in this.selectedNodes){
		nodeList.push(nodeId);
		visitedNodes[nodeId] = true;
		
		//loop over edges in
		for ( var i=0, len=this.nodeSvgList[nodeId].edgesIn.length; i<len; i++) {
			var edgeId = this.nodeSvgList[nodeId].edgesIn[i];
			var sourceNode = this.edgeSvgList[edgeId].getAttribute("source");
			if(!visitedNodes[sourceNode]){
				nodeList.push(sourceNode);
				visitedNodes[sourceNode] = true;
			}
		}
		
		//loop over edges out
		for ( var i=0, len=this.nodeSvgList[nodeId].edgesOut.length; i<len; i++) {
			var edgeId = this.nodeSvgList[nodeId].edgesOut[i];
			var targetNode = this.edgeSvgList[edgeId].getAttribute("target");
			if(!visitedNodes[targetNode]){
				nodeList.push(targetNode);
				visitedNodes[targetNode] = true;
			}
		}
	}
	this.selectNodes(nodeList);
};

NetworkSvg.prototype.selectNeighbourhood = function(){
	var nodeList = [];
	var edgeList = [];
	var visitedNodes = {};
	var visitedEdges = {};
	for (var nodeId in this.selectedNodes){
		if(!visitedNodes[nodeId]){
			nodeList.push(nodeId);
			visitedNodes[nodeId] = true;
		}
		
		//loop over edges in
		for ( var i=0, len=this.nodeSvgList[nodeId].edgesIn.length; i<len; i++) {
			var edgeId = this.nodeSvgList[nodeId].edgesIn[i];
			var sourceNode = this.edgeSvgList[edgeId].getAttribute("source");
			if(!visitedNodes[sourceNode]){
				nodeList.push(sourceNode);
				visitedNodes[sourceNode] = true;
			}
			
			if(!visitedEdges[edgeId]){
				edgeList.push(edgeId);
				visitedEdges[edgeId] = true;
			}
		}
		
		//loop over edges out
		for ( var i=0, len=this.nodeSvgList[nodeId].edgesOut.length; i<len; i++) {
			var edgeId = this.nodeSvgList[nodeId].edgesOut[i];
			var targetNode = this.edgeSvgList[edgeId].getAttribute("target");
			if(!visitedNodes[targetNode]){
				nodeList.push(targetNode);
				visitedNodes[targetNode] = true;
			}
			
			if(!visitedEdges[edgeId]){
				edgeList.push(edgeId);
				visitedEdges[edgeId] = true;
			}
		}
	}
	this.selectNodes(nodeList);
	this.selectEdges(edgeList);
};

NetworkSvg.prototype.checkNodeConnection = function(nodeId){
	if(!this.visitedNodes[nodeId]){
		this.nodeList.push(nodeId);
		this.visitedNodes[nodeId] = true;
		
		//loop over edges in
		for ( var i=0, len=this.nodeSvgList[nodeId].edgesIn.length; i<len; i++) {
			var edgeId = this.nodeSvgList[nodeId].edgesIn[i];
			var iNode = this.edgeSvgList[edgeId].getAttribute("source");
			this.checkNodeConnection(iNode);
			if(!this.visitedEdges[edgeId]){
				this.edgeList.push(edgeId);
				this.visitedEdges[edgeId] = true;
			}
		}
		
		//loop over edges out
		for ( var i=0, len=this.nodeSvgList[nodeId].edgesOut.length; i<len; i++) {
			var edgeId = this.nodeSvgList[nodeId].edgesOut[i];
			var iNode = this.edgeSvgList[edgeId].getAttribute("target");
			this.checkNodeConnection(iNode);
			if(!this.visitedEdges[edgeId]){
				this.edgeList.push(edgeId);
				this.visitedEdges[edgeId] = true;
			}
		}
	}
};

NetworkSvg.prototype.selectConnectedNodes = function(){
	this.nodeList = [];
	this.edgeList = [];
	this.visitedNodes = {};
	this.visitedEdges = {};
	for (var nodeId in this.selectedNodes){
		this.checkNodeConnection(nodeId);
	}
	this.selectNodes(this.nodeList);
	this.selectEdges(this.edgeList);
};

NetworkSvg.prototype.selectEdge = function(edgeId){
	//Select the edge
	if(this.selectedEdges[edgeId]){
		this.countSelectedEdges--;
		
		//Restore default color and delete from object
		this.edgeSvgList[edgeId].setAttribute("stroke", this.selectedEdges[edgeId]);
		delete this.selectedEdges[edgeId];
	}else{
		this.countSelectedEdges++;
		
		//Save the color of the node
		this.selectedEdges[edgeId] = this.edgeSvgList[edgeId].getAttribute("stroke");
		
		//Change the color of the node
		this.edgeSvgList[edgeId].setAttribute("stroke", "red");
	}
};

NetworkSvg.prototype.selectEdges = function(edgeList){
	this.deselectAllEdges();
	
	//Select nodes in list
	for(var i=0, len=edgeList.length; i<len; i++){
		this.countSelectedEdges++;
		
		//Save the color of the node
		this.selectedEdges[edgeList[i]] = this.edgeSvgList[edgeList[i]].getAttribute("stroke");
		
		//Change the color of the node
		this.edgeSvgList[edgeList[i]].setAttribute("stroke", "red");
	}
};

NetworkSvg.prototype.selectAllEdges = function(){
	for (var edgeId in this.edgeSvgList){
		if(!this.selectedEdges[edgeId]){
			this.countSelectedEdges++;
			
			//Save the color of the node
			this.selectedEdges[edgeId] = this.edgeSvgList[edgeId].getAttribute("stroke");
			
			//Change the color of the node
			this.edgeSvgList[edgeId].setAttribute("stroke", "red");
		}
	}
};

NetworkSvg.prototype.deselectAllEdges = function(){
	for (var edgeId in this.selectedEdges){
		this.countSelectedEdges--;
		//Restore default color and delete from object
		this.edgeSvgList[edgeId].setAttribute("stroke", this.selectedEdges[edgeId]);
		delete this.selectedEdges[edgeId];
	}
};

NetworkSvg.prototype.selectAll = function(){
	this.selectAllNodes();
	this.selectAllEdges();
};

NetworkSvg.prototype.getSelectedNodes = function(){
	var arraySel = [];
	for (var nodeId in this.selectedNodes){
		arraySel.push(nodeId);
	}
	return arraySel;
};

/** API FORMATTER **/
NetworkSvg.prototype.getWidth = function(){
	return this.width;
};

NetworkSvg.prototype.getHeight = function(){
	return this.height;
};


/** SETTING FUNCTIONS **/
NetworkSvg.prototype.setMode = function(mode){
	this.mode = mode;
	
	switch (mode) {
	case "add":
		this.svg.setAttribute("cursor", "url(./img/addNodeCursor.png), auto");
		break;
		
	case "join":
		this.svg.setAttribute("cursor", "url(./img/addEdgeCursor.png), auto");
		break;
		
	case "delete":
		this.svg.setAttribute("cursor", "url(./img/removeCursor.png), auto");
		break;

	default:
		this.svg.setAttribute("cursor", "default");
		break;
	}
};

NetworkSvg.prototype.setBackgroundColor = function(color){
	this.bgColor = color;
	this.background.setAttribute("fill", this.bgColor);
};

NetworkSvg.prototype.setBackgroundImage = function(image){
	this.svg.removeChild(this.backgroundImage);
	
	this.backgroundImage = SVG.addChildImage(this.svg,{
    	"id":"backgroundImage",
    	"x":"0",
    	"y":"0",
    	"width":this.width,
		"height":this.height,
		"xlink:href":image
    },1);
};

NetworkSvg.prototype.setBackgroundImageWidth = function(width){
	this.backgroundImage.setAttribute("width", width);
};

NetworkSvg.prototype.setBackgroundImageHeight = function(height){
	this.backgroundImage.setAttribute("height", height);
};

NetworkSvg.prototype.setBackgroundImageX = function(x){
	this.backgroundImage.setAttribute("x", x);
};

NetworkSvg.prototype.setBackgroundImageY = function(y){
	this.backgroundImage.setAttribute("y", y);
};

NetworkSvg.prototype.setNodeShape = function(newShape){
	var _this = this;
	switch (this.mode) {
	case "select":
		for (var nodeId in this.selectedNodes){
			var nodeGroup = this.nodeSvgList[nodeId];
			var figure = nodeGroup.childNodes[0];
			var shape = figure.getAttribute("shape");
			if(shape != newShape){
				nodeGroup.removeChild(figure);
				
				var id = figure.getAttribute("id");
				var size = figure.getAttribute("nodeSize");
				var label = figure.getAttribute("nodeLabel") || "";
				var x = parseInt(figure.getAttribute("x") || figure.getAttribute("cx"));
				var y = parseInt(figure.getAttribute("y") || figure.getAttribute("cy"));
				x -= parseInt(figure.getAttribute("r") || figure.getAttribute("rx") || 0);
				y -= parseInt(figure.getAttribute("r") || figure.getAttribute("ry") || 0);
				var color = figure.getAttribute("fill");
				var stroke = figure.getAttribute("stroke");
				var strokeWidth = figure.getAttribute("stroke-width");
				var opacity = figure.getAttribute("opacity");
				var args = {
					"size": size,
					"label": label,
					"x": x,
					"y": y,
					"color": color,
					"strokeColor": stroke,
					"strokeSize": strokeWidth,
					"opacity": opacity
				};
				var svgArgs = this.getSvgArgs(newShape, id, args);
				var realShape = newShape;
				if(newShape != "circle" && newShape != "ellipse") realShape = "rect";
				var nodeSvg = SVG.addChild(nodeGroup, realShape, svgArgs, 0);
				
				// attach move event
				$(nodeSvg).mousedown(function(event) {
					_this.nodeClick(event, this.id);
				});
				$(nodeSvg).mouseup(function(event) {
					if(_this.mode == "select") $(_this.svg).off('mousemove');
				});
				
				this.reallocateInputEdgeArrows(nodeSvg);
			}
		}
		break;
	case "add":
		this.nodeShape = newShape;
		break;
	}
};

NetworkSvg.prototype.setNodeSize = function(newSize){
	switch (this.mode) {
	case "select":
		for (var nodeId in this.selectedNodes){
			var figure = this.nodeSvgList[nodeId].childNodes[0];
			var size = figure.getAttribute("nodeSize");
			if(size != newSize){
				figure.setAttribute("nodeSize", newSize);
				if(figure.hasAttribute("r")){
					var radius = 2*newSize;
					figure.setAttribute("r", radius);
				}else if(figure.hasAttribute("rx")){
					figure.setAttribute("rx", 2*newSize);
					figure.setAttribute("ry", 1.5*newSize);
				}else{
					if(figure.getAttribute("shape") == "square"){
						figure.setAttribute("width", 4*newSize);
						figure.setAttribute("height", 4*newSize);
					}else{
						figure.setAttribute("width", 7*newSize);
						figure.setAttribute("height", 4*newSize);
					}
					this.reallocateEdgesPosition(figure);
				}
				this.reallocateInputEdgeArrows(figure);
			}
		}
		break;
	case "add":
		this.nodeSize = newSize;
		break;
	}
};

NetworkSvg.prototype.setNodeColor = function(newColor){
	switch (this.mode) {
	case "select":
		for (var nodeId in this.selectedNodes){
			var figure = this.nodeSvgList[nodeId].childNodes[0];
			this.selectedNodes[nodeId] = newColor;
			figure.setAttribute("fill", newColor);
		}
		break;
	case "add":
		this.nodeColor = newColor;
		break;
	}
};

NetworkSvg.prototype.setNodeStrokeColor = function(newColor){
	switch (this.mode) {
	case "select":
		for (var nodeId in this.selectedNodes){
			var figure = this.nodeSvgList[nodeId].childNodes[0];
			figure.setAttribute("stroke", newColor);
		}
		break;
	case "add":
		this.nodeStrokeColor = newColor;
		break;
	}
};

NetworkSvg.prototype.setNodeStrokeSize = function(newSize){
	switch (this.mode) {
	case "select":
		for (var nodeId in this.selectedNodes){
			var figure = this.nodeSvgList[nodeId].childNodes[0];
			figure.setAttribute("stroke-width", newSize);
		}
		break;
	case "add":
		this.nodeStrokeSize = newSize;
		break;
	}
};

NetworkSvg.prototype.setNodeOpacity = function(newOpacity){
	switch (this.mode) {
	case "select":
		for (var nodeId in this.selectedNodes){
			var figure = this.nodeSvgList[nodeId].childNodes[0];
			figure.setAttribute("opacity", newOpacity);
		}
		break;
	case "add":
		this.nodeOpacity = newOpacity;
		break;
	}
};

NetworkSvg.prototype.setNodeLabel = function(newLabel){
	switch (this.mode) {
	case "select":
		for (var nodeId in this.selectedNodes){
			var figure = this.nodeSvgList[nodeId].childNodes[0];
			figure.setAttribute("nodeLabel", newLabel);
			var text = this.nodeSvgList[nodeId].childNodes[1];
			text.textContent = newLabel;
			this.networkData.attributes.setName(nodeId, newLabel);
		}
		break;
	case "add":
		this.nodeLabel = newLabel;
		break;
	}
};

NetworkSvg.prototype.setEdgeLabel = function(newLabel){
	switch (this.mode) {
	case "select":
		for (var edgeId in this.selectedEdges){
			var edgeSvg = this.edgeSvgList[edgeId];
			edgeSvg.setAttribute("label", newLabel);
			$("#edgeLabel-"+edgeId)[0].childNodes[0].textContent = newLabel;
		}
		break;
	case "join":
		this.edgeLabel = newLabel;
		break;
	}
};

NetworkSvg.prototype.setEdgeType = function(newType){
	switch (this.mode) {
	case "select":
		for (var edgeId in this.selectedEdges){
			var edgeSvg = this.edgeSvgList[edgeId];
			edgeSvg.setAttribute("type", newType);
			
			// if not exists this marker, add new one to defs
			var tipOffset = edgeSvg.getAttribute("marker-end").split('-')[2].slice(0,-1);
			var markerId = "#arrow-"+newType+"-"+tipOffset;
			if($(markerId).length == 0){
				this.addArrowShape(newType, tipOffset);
			}
			edgeSvg.setAttribute("marker-end", "url("+markerId+")");
		}
		break;
	case "join":
		this.edgeType = newType;
		break;
	}
};

NetworkSvg.prototype.setLabelSize = function(size){
	var nodeLabels = $(".nodeLabel");
	for(var i=0, len=nodeLabels.length; i<len; i++){
		nodeLabels[i].setAttribute("font-size", size);
	}
	
	var edgeLabels = $(".edgeLabel");
	for(var i=0, len=edgeLabels.length; i<len; i++){
		edgeLabels[i].setAttribute("font-size", size*2);
	}
};


/** EVENT FUNCTIONS **/
NetworkSvg.prototype.canvasMouseDown = function(event){
	var _this = this;
	var offsetX = (event.clientX - $(this.svg).offset().left);
	var offsetY = (event.clientY - $(this.svg).offset().top);
	switch (this.mode) {
	case "add":
		this.addNode({
			"shape":this.nodeShape,
			"size":this.nodeSize,
			"color":this.nodeColor,
			"strokeColor":this.nodeStrokeColor,
			"strokeSize":this.nodeStrokeSize,
			"opacity":this.nodeOpacity,
			"label":this.nodeLabel,
			"x":offsetX-15,
			"y":offsetY-10
		}, true);
		break;

	case "select":
		this.selectRectDownX = offsetX;
		this.selectRectDownY = offsetY;

		this.selectRect = SVG.addChild(this.svg, "rect", {
			"x":this.selectRectDownX,
			"y":this.selectRectDownY,
			"width":0,
			"height":0,
			"opacity":0.3,
			"stroke":"orangered",
			"fill":"orange"
		});

		var lastX = 0, lastY = 0;
		$(this.svg).mousemove(function(event){
			var offsetX = (event.clientX - $(_this.svg).offset().left);
			var offsetY = (event.clientY - $(_this.svg).offset().top);
			var newX = (_this.selectRectDownX + offsetX);
			var newY = (_this.selectRectDownY + offsetY);
			if(newX!=lastX || newY!=lastY){
				if(offsetX < _this.selectRectDownX){
					_this.selectRect.setAttribute("x", offsetX);
					_this.selectXNegative = true;
				}else{
					_this.selectXNegative = false;
				}
				if(offsetY < _this.selectRectDownY){
					_this.selectRect.setAttribute("y", offsetY);
					_this.selectYNegative = true;
				}else{
					_this.selectYNegative = false;
				}
				_this.selectRect.setAttribute("width", Math.abs(offsetX - _this.selectRectDownX));
				_this.selectRect.setAttribute("height", Math.abs(offsetY - _this.selectRectDownY));

				lastX = newX;
				lastY = newY;
			}
		});
		
//		this.onCanvasClick.notify();
		break;
	}
};

NetworkSvg.prototype.canvasMouseUp = function(event){
	var offsetX = (event.clientX - $(this.svg).offset().left);
	var offsetY = (event.clientY - $(this.svg).offset().top);
	switch (this.mode) {
	case "select":
		$(this.svg).off('mousemove');

		// calculate nodes in selection
		var nodeList = [];
		var startSelectX = this.selectRectDownX;
		var startSelectY = this.selectRectDownY;
		var endSelectX = offsetX;
		var endSelectY = offsetY;
		if(this.selectXNegative){
			startSelectX = endSelectX;
			endSelectX = this.selectRectDownX;
		}
		if(this.selectYNegative){
			startSelectY = endSelectY;
			endSelectY = this.selectRectDownY;
		}
		for (var node in this.nodeSvgList){
			var figure = this.nodeSvgList[node].childNodes[0];
			var nodeStartX = parseInt(figure.getAttribute("x") || figure.getAttribute("cx"));
			var nodeStartY = parseInt(figure.getAttribute("y") || figure.getAttribute("cy"));
			nodeStartX -= parseInt(figure.getAttribute("r") || figure.getAttribute("rx") || 0);
			nodeStartY -= parseInt(figure.getAttribute("r") || figure.getAttribute("ry") || 0);
			
			var nodeEndX = nodeStartX + (parseInt(figure.getAttribute("width")) || parseInt(figure.getAttribute("r") || figure.getAttribute("rx") || 0)*2);
			var nodeEndY = nodeStartY + (parseInt(figure.getAttribute("height")) || parseInt(figure.getAttribute("r") || figure.getAttribute("ry") || 0)*2);
			
			if(startSelectX <= nodeEndX && startSelectY <= nodeEndY && endSelectX >= nodeStartX && endSelectY >= nodeStartY){
				nodeList.push(node);
			}
		}
		
		var args = null;
		if(nodeList.length == 1){
			var figure = this.nodeSvgList[nodeList[0]].childNodes[0];
			args = {
				"shape":figure.getAttribute("shape"),
				"size":figure.getAttribute("nodeSize"),
				"color":figure.getAttribute("fill"),
				"strokeWidth":figure.getAttribute("stroke-width"),
				"strokeColor":figure.getAttribute("stroke"),
				"opacity":figure.getAttribute("opacity"),
				"label":figure.getAttribute("nodeLabel") || ""
			};
		}
		
		this.svg.removeChild(this.selectRect);
		this.selectNodes(nodeList);
		this.deselectAllEdges();
		this.onCanvasClick.notify(args);
		this.onSelectionChange.notify(this.getSelectedNodes());
		break;
	}
};

NetworkSvg.prototype.nodeClick = function(event, nodeId){
	var _this = this;
	switch (this.mode) {
	case "delete":
		this.removeNode(nodeId);
		break;
	case "join":
		this.addEdgeFromClick(nodeId);
		break;
	case "select":
		if(event.ctrlKey){
			this.selectNode(nodeId);
		}else if(this.countSelectedNodes < 2 || !this.selectedNodes[nodeId]){
			this.deselectAllNodes();
			this.selectNode(nodeId);
			
			var figure = this.nodeSvgList[nodeId].childNodes[0];
			this.onNodeClick.notify({
				"shape":figure.getAttribute("shape"),
				"size":figure.getAttribute("nodeSize"),
				"color":this.selectedNodes[nodeId],
				"strokeWidth":figure.getAttribute("stroke-width"),
				"strokeColor":figure.getAttribute("stroke"),
				"opacity":figure.getAttribute("opacity"),
				"label":figure.getAttribute("nodeLabel") || ""
			});
		}
		
		if(this.selectedNodes[nodeId]){
			var downX = event.clientX;
			var downY = event.clientY;
			var lastX = 0, lastY = 0;

			//save original node position
			var nodeOrigX = {};
			var nodeOrigY = {};
			for (var nodeId in this.selectedNodes){
				var nodeSvg = _this.nodeSvgList[nodeId].childNodes[0];

				nodeOrigX[nodeId] = parseInt(nodeSvg.getAttribute("x") || nodeSvg.getAttribute("cx"));
				nodeOrigY[nodeId] = parseInt(nodeSvg.getAttribute("y") || nodeSvg.getAttribute("cy"));
			}

			$(this.svg).mousemove(function(event){
				var despX = event.clientX - downX;
				var despY = event.clientY - downY;
				var newX = (downX + event.clientX);
				var newY = (downY + event.clientY);
				if(newX!=lastX || newY!=lastY){
					for (var nodeId in _this.selectedNodes){
						var newNodeX = nodeOrigX[nodeId] + despX;
						var newNodeY = nodeOrigY[nodeId] + despY;
						_this.moveNode(nodeId, newNodeX, newNodeY);
					}
					lastX = newX;
					lastY = newY;
				}
			});
		}
		this.onSelectionChange.notify(this.getSelectedNodes());
		break;
	}
};

NetworkSvg.prototype.edgeClick = function(event, edgeId){
	switch (this.mode) {
	case "delete":
		this.removeEdge(edgeId);
		break;
	case "select":
		if(event.ctrlKey){
			this.selectEdge(edgeId);
		}else if(this.countSelectedEdges < 2 || !this.selectedEdges[edgeId]){
			this.deselectAllEdges();
			this.selectEdge(edgeId);
			
			var edgeSvg = this.edgeSvgList[edgeId];
			this.onEdgeClick.notify({
				"type":edgeSvg.getAttribute("type"),
				"label":edgeSvg.getAttribute("label") || ""
			});
		}
		break;
	}
};
