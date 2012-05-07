var SVG =
{
		svgns : 'http://www.w3.org/2000/svg',
		xlinkns : "http://www.w3.org/1999/xlink",

	createSVGCanvas: function(parentNode, attributes)
	{
		attributes['xmlns'] = SVG.svgns;
		attributes['xmlns:xlink'] = SVG.xlinkns;
//		attributes.push( ['xmlns', SVG.svgns], ['xmlns:xlink', 'http://www.w3.org/1999/xlink']);
		var svg = document.createElementNS(SVG.svgns, "svg");
		this._setProperties(svg, attributes);
		parentNode.appendChild(svg);
		return svg;
	}, 
	
	//Shape types : rect, circle, ellipse, line, polyline, polygon 
	createElement : function (svgNode, shapeName, attributes) {
		try{
			if(attributes.width<0){
				console.log("BIOINFO Warn: on SVG.createRectangle: width is negative, will be set to 0");
				attributes.width=0;
			}
			if(attributes.height<0){
				console.log("BIOINFO Warn: on SVG.createRectangle: height is negative, will be set to 0");
				attributes.height=0;
			}
			
			var shape = document.createElementNS(this.svgns, shapeName);
			SVG._setProperties(shape, attributes);
			svgNode.appendChild(shape);
		}
		catch(e){
			console.log("-------------------- ");
			console.log("Error on drawRectangle " + e);
			console.log(attributes);
			console.log("-------------------- ");
		}
		return shape;
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


	drawImage : function (x, y, canvasSVG, attributes) {
		var image = document.createElementNS(this.svgns, "image");
		image.setAttribute("x",x);		
		image.setAttribute("y",y);		
		canvasSVG.appendChild(image);
		SVG._setProperties(image, attributes);
	},

	drawPath: function (d, nodeSVG, attributes) {
		var path = SVG.createPath(d, attributes);
		nodeSVG.appendChild(path);
		return path;
	},
	createPath : function (d,  attributes){
		var path = document.createElementNS(this.svgns, "path");
		path.setAttribute("d",d);
		SVG._setProperties(path, attributes);
		return path;
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
	
	
//	createRectangle : function (attributes){
//				//FIXME
////				console.log("x:"+x+"   "+"y:"+y+"   "+"w:"+width+"   "+"h:"+height+"   "+"attr:"+attributes);
//				if(attributes.width<0){
//					console.log("BIOINFO Warn: on SVG.createRectangle: width is negative, will be set to 0");
//					attributes.width=0;
//				}
//				if(attributes.height<0){
//					console.log("BIOINFO Warn: on SVG.createRectangle: height is negative, will be set to 0");
//					attributes.height=0;
//				}
//				
//				var rect = document.createElementNS(this.svgns, "rect");
////				rect.setAttribute("x",x);		
////				rect.setAttribute("y",y);	
////				rect.setAttribute("width",width);		
////				rect.setAttribute("height",height);	
//				SVG._setProperties(rect, attributes);
//				return rect;
//	},
//	

	
//	drawRectangle : function (svgNode, attributes) {
//		try{
//			if(attributes.width<0){
//				console.log("BIOINFO Warn: on SVG.createRectangle: width is negative, will be set to 0");
//				attributes.width=0;
//			}
//			if(attributes.height<0){
//				console.log("BIOINFO Warn: on SVG.createRectangle: height is negative, will be set to 0");
//				attributes.height=0;
//			}
//			
//			var rect = document.createElementNS(this.svgns, "rect");
//			SVG._setProperties(rect, attributes);
////			var node = SVG.createRectangle(attributes);
//			svgNode.appendChild(rect);
//		}
//		catch(e){
//			
//			console.log("-------------------- ");
//			console.log("Error on drawRectangle " + e);
//			console.log(attributes);
//			console.log("-------------------- ");
//		}
//		return rect;
//	},
	
//	drawCircle : function (x, y, radio, canvasSVG, attributes) {
//		
//		var newText = document.createElementNS(this.svgns,"circle");
//		newText.setAttribute("cx",x);		
//		newText.setAttribute("cy",y);	
//		newText.setAttribute("r",radio);	
//		
//		canvasSVG.appendChild(newText);
//		this._setProperties(newText, attributes);	
//		return newText;
//	},
	
//	createEllipse : function (x, y, rx, ry,  attributes){
//		var rect = document.createElementNS(this.svgns, "ellipse");
//		rect.setAttribute("cx",x);		
//		rect.setAttribute("cy",y);
//		rect.setAttribute("rx",rx);		
//		rect.setAttribute("ry",ry);	
//		SVG._setProperties(rect, attributes);
//		return rect;
//	},
//
//	drawEllipse : function (cx, cy, rx, ry, svgNode, attributes) {
//		var node = SVG.createEllipse(cx, cy, rx, ry, attributes);
//		svgNode.appendChild(node);
//		return node;
//	},


	
//	createLine:  function (x1, y1, x2, y2, attributes){
//				var line = document.createElementNS(this.svgns,"line");
//				line.setAttribute("x1",x1);		
//				line.setAttribute("y1",y1);	
//				line.setAttribute("x2", x2);	
//				line.setAttribute("y2", y2);
//				SVG._setProperties(line, attributes);
//				return line;
//	},
//	drawLine : function (x1, y1, x2, y2, nodeSVG, attributes) {
//		try{
//			var line = SVG.createLine(x1, y1, x2, y2, attributes);
//			nodeSVG.appendChild(line);
//		}catch(e){
//			debugger;
//		}
//		return line;
//	},
	


//	 createPoligon : function (points,  attributes){
//        var poligon = document.createElementNS(this.svgns, "polygon");
//        poligon.setAttribute("points",points);
//        SVG._setProperties(poligon, attributes);
//        return poligon;
//    },
//    
//    drawPoligon : function (points,  canvasSVG, attributes){
//    	var poligon = SVG.createPoligon(points, attributes);
//    	canvasSVG.appendChild(poligon);
//		return poligon;
//    },
	//<polygon points="20,420, 300,420 160,20" />
	


	
	


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

//	createText : function (x, y, text, attributes) {
//				var node = document.createElementNS(this.svgns,"text");
//				node.setAttributeNS(null , "x",x);		
//				node.setAttributeNS(null, "y",y);	
//				
//				var textNode = document.createTextNode(text);
//				node.appendChild(textNode);
//				
//				this._setProperties(node, attributes);
//				return node;
//	},
//	
//	drawText : function (x, y, text, canvasSVG, attributes) {
//				var text = SVG.createText(x, y, text, attributes);
//				canvasSVG.appendChild(text);
//				return text;
//	},



//	drawGroup: function(svgNode, attributes)
//	{
//		 var group = SVG.createGroup(attributes);
//		 svgNode.appendChild(group);
//		 return group;
//	},
//			
//	createGroup: function(attributes){
//				var group = document.createElementNS(this.svgns,"g");
//				this._setProperties(group, attributes);	
//				return group;
//	},
	
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
*/

