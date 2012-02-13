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

