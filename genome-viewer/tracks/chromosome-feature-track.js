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

