// JavaScript Document
function Track(trackerID, targetNode,  args) {
	this.args = args;
	
	/** Groups and layers */
	this.trackNodeGroup = null;
	this.mainNodeGroup = null;
	this.labelNodeGroup = null;
	
	this.internalId = Math.round(Math.random()*10000000); // internal id for this class
	
	/** target */
    if(targetNode != null){
            this.targetID = targetNode.id;
    }

	
    
	/** Coordenates with default Setting */
	this.top = 0;
	this.left = 100;
	this.right = 900;
	this.width = 1100;
	this.height = 50;
	this.originalTop = this.top;
	this.originalHeight = this.height;
	
	/** Max height para los tracks que aunmentan el height dinamicamente cargando las features **/
	this.maxHeight = this.height;
	
	/** real start and end */
	if (args != null){
		this.start = args.start;
		this.end = args.end;
	}
	else{
		this.start = 0;
	}

	/** pixelPerposition **/
	this.pixelRatio = 5; /** it means 1 position it is represented using 5 pixels **/
	
	/** Optional parameters */
	this.backgroundColor = "#FFFFFF";
	this.titleColor = "#000000";
	this.overflow = false;
	
	/** Optional parameters: title */
	this.title  = null;
	this.titleName = null;
	this.titleFontSize = 10;
	this.titleWidth = 50;
	this.titleHeight = 12;
	this.floating = false;
	this.repeatLabel = null; /** es un float que indica cada cuantos pixeles se va a repetir la label sobre el track **/
	
	this.isAvalaible = true; /** Si el track no puede mostrarse a cierta resolucion isAvalaible pasa a ser falso y dibujariamos solamnente el titulo**/
	this.isNotAvalaibleMessage = "This level of zoom isn't appropiate for this track";
	
	
	this.labelFontSize = null;
	
	/** Processing optional parameters */
	if (args!=null){
		if (args.left!=null){
			this.left = args.left;		
		}
		
		if (args.top!=null){
			this.top = args.top;	
			this.originalTop = this.top;
		}
		if (args.left!=null){
			this.left = args.left;		
		}
		
		if (args.right!=null){
			this.right = args.right;		
		}
		if (args.width!=null){
			this.width = args.width;		
		}
		if (args.floating!=null){
			this.floating = args.floating;		
		}
		if (args.height!=null){
			this.height = args.height;	
			this.originalHeight = args.height;
			this.maxHeight = args.height;
		}
		if (args.backgroundColor!=null){
			this.backgroundColor = args.backgroundColor;		
		}
		
		if (args.titleWidth!=null){
			this.titleWidth = args.titleWidth;		
		}
		if (args.titleFontSize!=null){
			this.titleFontSize = args.titleFontSize;		
		}
		if (args.titleHeight!=null){
			this.titleHeight = args.titleHeight;		
		}
		if (args.titleColor != null){
			this.titleColor = args.titleColor;	
		}
		if (args.title != null){
			this.title = true;
			this.titleName = args.title;
		}
		if (args.overflow != null){
			this.overflow = args.overflow;
		}
		if (args.pixelRatio != null){
			this.pixelRatio = args.pixelRatio;
		}
		if (args.labelFontSize != null){
			this.labelFontSize = args.labelFontSize;
		}
		
		if (args.repeatLabel != null){
			this.repeatLabel = args.repeatLabel;
		}
		
		if (args.isAvalaible!=null){
			this.isAvalaible = args.isAvalaible;		
		}
		if (args.isNotAvalaibleMessage!=null){
			this.isNotAvalaibleMessage = args.isNotAvalaibleMessage;		
		}
	}
	
	/** id manage */
	this.id = trackerID;	
	this.idTrack = this.id + "_Features";
	this.idNames = this.id + "_Names";
	this.idMain = this.id + "_Main";
	this.idBackground = this.id + "_background";
	this.idTitleGroup = this.id + "_title_group";
	/** Events */
	this.click = new Event(this);
	
};

//Track.prototype._getViewBoxCoordenates = function() {
//	return 0 +" " +  "10 " + this.width + " " + this.height;
//};
//
//Track.prototype._goToCoordinate = function(start) {
//	var viewBox =   (start * this.pixelRatio) +" " +  "10 " + this.width + " " + this.height;
//	this._svg.setAttribute("viewBox", viewBox);108,447,501

//};

Track.prototype._getViewBoxCoordenates  = function(id, width, height, backgroundColor ) {
	return "0 10 " + this.width  + " " + this.height;
};

Track.prototype.createSVGDom = function(id, width, height, backgroundColor ) {
	/** Si es null es porque estamos usando el track en modo standalone sin trackCanvas **/
	if (this._svg == null){
		this._svg = SVG.createSVGCanvas(DOM.select(this.targetID), [["viewBox", this._getViewBoxCoordenates()],["preserveAspectRatio", "none"],["id", id], ["height", this.height], ["width", this.width]]);
	}
	
	/** Creating groupds **/
	this.mainNodeGroup = SVG.drawGroup(this._svg, [["id", this.idMain]]);
	this.backgroundNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idBackground]]);
	this.trackNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idTrack]]);
	this.labelNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idNames]]);
	this.titleNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idTitleGroup]]);
	
	/** background rectangle for giving colors **/
//	var rect = SVG.drawRectangle(0, this.top, this.width , this.height, this.backgroundNodeGroup, [["fill", backgroundColor],[id, id + "_background"]]);
	this.drawBackground();
	return this._svg;
};

Track.prototype.drawBackground = function() {
//	var rect = SVG.drawRectangle(0, this.top, this.width , this.height, this.backgroundNodeGroup, [["fill", this.backgroundColor],[id, id + "_background"]]);
//	this.backgroundNode =  SVG.drawRectangle(0, this.top, this.viewBoxModule , this.height, this.backgroundNodeGroup, [["stroke", "#000000"],["opacity", 0.5],["fill", this.backgroundColor],[id, id + "_background"]]);
};

Track.prototype.getBackgroundNode = function() {
	return this.backgroundNode;
};


Track.prototype.init = function(){
	this._svg = this.createSVGDom(this.id, this.width, this.height, this.backgroundColor);
	
	/** SVG Events listener */
	var _this = this;

};

Track.prototype.clear = function(){
	if(this.mainNodeGroup != null){
		 while (this.mainNodeGroup.childNodes.length>0){
		 	this.mainNodeGroup.removeChild(this.mainNodeGroup.childNodes[0]);
	    }
	}
};

/** SVG COORDENATES **/
Track.prototype._getSVGCoordenates = function(evt){
	var p = this._svg.createSVGPoint();
    p.x = evt.clientX;
    p.y = evt.clientY;
    
    var m = this._svg.getScreenCTM(document.documentElement);
    p = p.matrixTransform(m.inverse());
    return p;
};

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


function SNPFeatureTrack (rulerID,targetID, species, args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID, species, args);
	
	this.opacity = null;
	this.forceColor = null;
	
	if (args != null){
		if (args.opacity != null){
			this.opacity = args.opacity;
		}
		
		if (args.forceColor != null){
			this.forceColor = args.forceColor;
		}
		
	}
	this.positions = new Object();
}


SNPFeatureTrack.prototype._renderLabel =    FeatureTrack.prototype._renderLabel;
SNPFeatureTrack.prototype.getIdToPrint =    FeatureTrack.prototype.getIdToPrint;
SNPFeatureTrack.prototype.changeView =      FeatureTrack.prototype.changeView;
SNPFeatureTrack.prototype.render =          FeatureTrack.prototype.render;
SNPFeatureTrack.prototype.init =            FeatureTrack.prototype.init;
SNPFeatureTrack.prototype.createSVGDom =    FeatureTrack.prototype.createSVGDom;
SNPFeatureTrack.prototype._getTopText =     FeatureTrack.prototype._getTopText;
SNPFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
SNPFeatureTrack.prototype._searchSpace =    FeatureTrack.prototype._searchSpace;
SNPFeatureTrack.prototype.drawTitle =       FeatureTrack.prototype.drawTitle;
SNPFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
SNPFeatureTrack.prototype.mouseclick =      FeatureTrack.prototype.mouseclick;
SNPFeatureTrack.prototype.getById =         FeatureTrack.prototype.getById;
SNPFeatureTrack.prototype.draw =            FeatureTrack.prototype.draw;
SNPFeatureTrack.prototype.drawFeatures =    FeatureTrack.prototype.drawFeatures;
SNPFeatureTrack.prototype._overlapBlocks =  FeatureTrack.prototype._overlapBlocks;
SNPFeatureTrack.prototype._render =       FeatureTrack.prototype._render;
SNPFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
SNPFeatureTrack.prototype._getViewBoxCoordenates 	=       FeatureTrack.prototype._getViewBoxCoordenates;
SNPFeatureTrack.prototype._getFeatureWidth 	=       FeatureTrack.prototype._getFeatureWidth;
SNPFeatureTrack.prototype._updateTop 	=       FeatureTrack.prototype._updateTop;
SNPFeatureTrack.prototype.clear 	=       FeatureTrack.prototype.clear;
SNPFeatureTrack.prototype.drawBackground 	=       FeatureTrack.prototype.drawBackground;
SNPFeatureTrack.prototype.moveTitle 	=       FeatureTrack.prototype.moveTitle;
SNPFeatureTrack.prototype.appendFeatures 	=       FeatureTrack.prototype.appendFeatures;
SNPFeatureTrack.prototype.drawFeaturesInQueue = FeatureTrack.prototype.drawFeaturesInQueue;
SNPFeatureTrack.prototype._setAttributes = FeatureTrack.prototype._setAttributes;
SNPFeatureTrack.prototype._setTextAttributes = FeatureTrack.prototype._setTextAttributes;
//SNPFeatureTrack.prototype._drawFeature = FeatureTrack.prototype._drawFeature;

SNPFeatureTrack.prototype.addFeatures  = function(data){
	var features = data.toJSON();
	this.drawFeatures(features);
};


SNPFeatureTrack.prototype._addFeatures = function(data){
	/** features */
	this.features = data.toJSON();
	this.featuresIndex = new Object();
};

SNPFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
	var _this = this;
	if (featureWidth <= 1) {
		featureWidth = 2;
	}
	
	
	this.positions[Math.ceil(startPoint)] = true;
	var nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), top , featureWidth, this.featureHeight, this.trackNodeGroup, attributes);
	
	
	
	if (this.label) {
		this._renderLabel(Math.ceil(startPoint) ,  Math.ceil(top) + (this.featureHeight + this.labelHeight) , feature.label, this._setTextAttributes(feature), feature);
		
		if (feature.base != null){
			var snpLength = feature.base.length;
			var snpSize = featureWidth/snpLength;
			for ( var i = 0; i < snpLength; i++) {
				SVG.drawText((i*snpSize) + startPoint + 2 , Math.ceil(top) + 8, feature.base[i], this.labelNodeGroup, [["font-size", "8"], ["fill", "black"]]);
			}
		}
	}
};






VCFFeatureTrack.prototype.getIdToPrint = FeatureTrack.prototype.getIdToPrint;
VCFFeatureTrack.prototype.changeView = FeatureTrack.prototype.changeView;
VCFFeatureTrack.prototype.render = FeatureTrack.prototype.render;
VCFFeatureTrack.prototype.init = FeatureTrack.prototype.init;
VCFFeatureTrack.prototype.createSVGDom = FeatureTrack.prototype.createSVGDom;
VCFFeatureTrack.prototype._getTopText = FeatureTrack.prototype._getTopText;
VCFFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
VCFFeatureTrack.prototype._searchSpace = FeatureTrack.prototype._searchSpace;
VCFFeatureTrack.prototype.drawTitle = FeatureTrack.prototype.drawTitle;
VCFFeatureTrack.prototype.mouseMove = FeatureTrack.prototype.mouseMove;
VCFFeatureTrack.prototype.mouseclick = FeatureTrack.prototype.mouseclick;
VCFFeatureTrack.prototype.getById = FeatureTrack.prototype.getById;
VCFFeatureTrack.prototype.draw = FeatureTrack.prototype.draw;
VCFFeatureTrack.prototype.getFeatureColor = FeatureTrack.prototype.getFeatureColor;
VCFFeatureTrack.prototype.drawFeatures = FeatureTrack.prototype.drawFeatures;
VCFFeatureTrack.prototype._overlapBlocks = FeatureTrack.prototype._overlapBlocks;
VCFFeatureTrack.prototype._render = FeatureTrack.prototype._render;
VCFFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
VCFFeatureTrack.prototype._getViewBoxCoordenates = FeatureTrack.prototype._getViewBoxCoordenates;
VCFFeatureTrack.prototype._getFeatureWidth = FeatureTrack.prototype._getFeatureWidth;
VCFFeatureTrack.prototype.clear = FeatureTrack.prototype.clear;
VCFFeatureTrack.prototype.drawBackground = FeatureTrack.prototype.drawBackground;
VCFFeatureTrack.prototype.moveTitle = FeatureTrack.prototype.moveTitle;
VCFFeatureTrack.prototype._setAttributes = FeatureTrack.prototype._setAttributes;
VCFFeatureTrack.prototype._setTextAttributes = FeatureTrack.prototype._setTextAttributes;
VCFFeatureTrack.prototype._updateTop = FeatureTrack.prototype._updateTop;
//VCFFeatureTrack.prototype._drawFeature = FeatureTrack.prototype._drawFeature;
VCFFeatureTrack.prototype.drawFeaturesInQueue = FeatureTrack.prototype.drawFeaturesInQueue;
VCFFeatureTrack.prototype._renderLabel = FeatureTrack.prototype._renderLabel;

function VCFFeatureTrack(rulerID, targetID, args) {
	FeatureTrack.prototype.constructor.call(this, rulerID, targetID, args);


	/*if (args != null) {
	}*/
	
	this.positions = new Object();
	this.counter = 0;
	
	console.log(this.featureHeight);
}

VCFFeatureTrack.prototype.appendFeatures = function(data) {
	var features = data.toJSON();
	this.drawFeatures(features);
};

VCFFeatureTrack.prototype._addFeatures = function(data) {
	this.features = data.toJSON();
	this.featuresIndex = new Object();
};


VCFFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
	var _this = this;
	if (featureWidth <= 1) {
		featureWidth = 2;
	}
	this.positions[Math.ceil(startPoint)] = true;
	var nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), top , featureWidth, this.featureHeight, this.trackNodeGroup, attributes);
	
	
	if (feature.base != null){
		var snpLength = feature.base.length;
		var snpSize = featureWidth/snpLength;
		for ( var i = 0; i < snpLength; i++) {
			SVG.drawText((i*snpSize) + startPoint + 2 , Math.ceil(top) + 8, feature.base[i], this.labelNodeGroup, [["font-size", "8"],["fill", "#ffffff"]]);
		}
	}
	
	if (this.label) {
		this._renderLabel(Math.ceil(startPoint) ,  Math.ceil(top) + (this.featureHeight + this.labelHeight) , feature.label, this._setTextAttributes(feature), feature);
	}
};

function GeneFeatureTrack (rulerID,targetID,  args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID,  args);
	
	this.opacity = null;
	this.forceColor = null;
	
	if (args != null){
		if (args.opacity != null){
			this.opacity = args.opacity;
		}
		
		if (args.forceColor != null){
			this.forceColor = args.forceColor;
		}
		
	}
	
}


GeneFeatureTrack.prototype.isFeatureDuplicated =    FeatureTrack.prototype.isFeatureDuplicated;
GeneFeatureTrack.prototype.getIdToPrint =    FeatureTrack.prototype.getIdToPrint;
GeneFeatureTrack.prototype.changeView =      FeatureTrack.prototype.changeView;
GeneFeatureTrack.prototype.render =          FeatureTrack.prototype.render;
GeneFeatureTrack.prototype.init =            FeatureTrack.prototype.init;
GeneFeatureTrack.prototype.createSVGDom =    FeatureTrack.prototype.createSVGDom;
GeneFeatureTrack.prototype._getTopText =     FeatureTrack.prototype._getTopText;
GeneFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
GeneFeatureTrack.prototype._searchSpace =    FeatureTrack.prototype._searchSpace;
GeneFeatureTrack.prototype.drawTitle =       FeatureTrack.prototype.drawTitle;
GeneFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
GeneFeatureTrack.prototype.mouseclick =      FeatureTrack.prototype.mouseclick;
GeneFeatureTrack.prototype.getById =         FeatureTrack.prototype.getById;
GeneFeatureTrack.prototype.draw =            FeatureTrack.prototype.draw;
GeneFeatureTrack.prototype.getFeatureColor = FeatureTrack.prototype.getFeatureColor;
GeneFeatureTrack.prototype.drawFeatures =    FeatureTrack.prototype.drawFeatures;
GeneFeatureTrack.prototype._overlapBlocks =  FeatureTrack.prototype._overlapBlocks;
GeneFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
GeneFeatureTrack.prototype.mouseUp =      	 FeatureTrack.prototype.mouseUp;
GeneFeatureTrack.prototype.mouseClick =      FeatureTrack.prototype.mouseClick;
GeneFeatureTrack.prototype.mouseDown =       FeatureTrack.prototype.mouseDown;
GeneFeatureTrack.prototype._render =       FeatureTrack.prototype._render;
GeneFeatureTrack.prototype._addFeatures =       FeatureTrack.prototype._addFeatures;
GeneFeatureTrack.prototype._setAttributes = FeatureTrack.prototype._setAttributes;
GeneFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
GeneFeatureTrack.prototype._getViewBoxCoordenates 	=       FeatureTrack.prototype._getViewBoxCoordenates;
GeneFeatureTrack.prototype._getFeatureWidth 	=       FeatureTrack.prototype._getFeatureWidth;
GeneFeatureTrack.prototype._updateTop 	=       FeatureTrack.prototype._updateTop;
GeneFeatureTrack.prototype.clear 	=       FeatureTrack.prototype.clear;
GeneFeatureTrack.prototype.drawBackground 	=       FeatureTrack.prototype.drawBackground;
GeneFeatureTrack.prototype.moveTitle 	=       FeatureTrack.prototype.moveTitle;

GeneFeatureTrack.prototype.addFeatures = function(data){
	var features = data.toJSON();
	this.drawFeatures(features);
};


GeneFeatureTrack.prototype._addFeatures = function(data){
	/** features */
	this.features = data.toJSON();
	this.featuresIndex = new Object();
};



GeneFeatureTrack.prototype._setAttributes = function(feature){
	
	var attributes = [["id", this.id], ["font-size", feature.getDefault().args.fontSize]];
	
	if (this.opacity == null){
		attributes.push(["opacity", feature.getDefault().getOpacity()]);
	}
	else{
		attributes.push(["opacity", this.opacity]);
	}
	
	if (this.forceColor == null){
		attributes.push(["fill", feature.getDefault().getFill()]);
	}
	else{
		attributes.push(["fill", this.forceColor]);
	}
	
	attributes.push(["stroke", "black"]);
	attributes.push(["stroke-width", "1"]);
	return attributes;
};

GeneFeatureTrack.prototype._setTextAttributes = function(feature){
	var color = this.getFeatureColor(feature);
	var attributes = [["fill", "black"],["id", this.id+"_" + feature.start], ["font-size", feature.getDefault().args.fontSize]];
	return attributes;
};


GeneFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
	var nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), Math.ceil(top), featureWidth, this.featureHeight, this.trackNodeGroup, attributes);
	
	
//	var nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), Math.ceil(top) + (this.height - this.featureHeight), featureWidth, this.featureHeight, this.trackNodeGroup, attributes);
//	SVG.drawText(Math.ceil(startPoint),  Math.ceil(top) + (this.height - this.featureHeight) - 2 , feature.label, this.trackNodeGroup, this._setTextAttributes(feature));
	
	

	var _this = this;
	nodeSVG.addEventListener("mouseover", function(){}, true);
};


function TrackCanvas(trackerID, targetNode, args) {
	/** Groups and layers */
	this.tracksGroup = null;

	/** target */
	this.targetID = targetNode.id;

	this.args = args;

	/** Coordenates with default Setting */
	this.top = 0;
	this.left = 100;
	this.right = 900;
	this.width = 1100;
	this.height = 50;

	/** real start and end */
	this.startViewBox = args.start;
	this.endViewBox = args.end;

	/** Tracks **/
	this.trackList = new Array();
	this.trackRendered = new Array();
	this.trackRenderedName = new Array();
	
	this.regionAdapterList = new Array();

	/** Pixel Ratio and zoom **/
	this.pixelRatio = 5;
	this.zoom = 1;
	this.viewBoxModule = 700;

	/** Dragging **/
	this.allowDragging = false;
	this.isDragging = false;
	this.dragPoint = null;

	/** Optional parameters */
	this.backgroundColor = "#FFFFFF";
	this.titleColor = "#000000";
	this.overflow = false;

	/** Optional parameters: title */
	this.title = false;
	this.titleName = null;
	this.titleFontSize = 10;
	
	/** Y moving ***/
	this.enableMovingY = false;
	
	/** Moving canvas provoke que los tracks con el flag showLabelsOnMiddleMarker se muevan **/
	this.allowLabelMoving = true;
	
	/** Flag to solver marker bug */
	this.isBeenRenderized = true; /** true si estoy renderizando por primera vez el trackcanvas **/
	/** Processing optional parameters */
	if (args != null) {
		if (args.top != null) {
			this.top = args.top;
		}
		if (args.left != null) {
			this.left = args.left;
		}
		if (args.right != null) {
			this.right = args.right;
		}
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.backgroundColor != null) {
			this.backgroundColor = args.backgroundColor;
		}
		if (args.titleFontSize != null) {
			this.titleFontSize = args.titleFontSize;
		}
		if (args.allowDragging != null) {
			this.allowDragging = args.allowDragging;
		}
		if (args.titleColor != null) {
			this.titleColor = args.titleColor;
		}
		if (args.title != null) {
			this.title = true;
			this.titleName = args.title;
		}
		if (args.overflow != null) {
			this.overflow = args.overflow;
		}
		if (args.pixelRatio != null) {
			this.pixelRatio = args.pixelRatio;
		}
		if (args.viewBoxModule != null) {
			this.viewBoxModule = args.viewBoxModule;
		}
		if (args.zoom != null) {
			this.zoom = args.zoom;
		}
	}

	/** Info Panel */
	this.textLines = new Array();

	/** id manage */
	this.id = trackerID;
	this.idMain = this.id + "_Main";
	this.moveY = 0;
//	this.ruleTracks = new Array();

	/** Events */
//	this.click = new Event(this);//NOT USED
//	this.selecting = new Event(this);//NOT USED
	this.onMove = new Event(this);
	this.afterDrag = new Event(this);
	this.onRender = new Event(this);

};

TrackCanvas.prototype.createSVGDom = function(targetID, id, width, height, backgroundColor) {
	var container = DOM.select(targetID);
	this._svg = SVG.createSVGCanvas(container, [
	        [ "viewBox", "0 10 " + this.width + " " + this.height ],
			[ "preserveAspectRatio", "none" ], [ "id", id ],
			[ "height", this.height ], [ "width", this.width ] , [ "background-color", "green" ]]);

	/** Creating groups **/
	this.tracksGroup = SVG.drawGroup(this._svg, [ [ "id", this.idMain ],[ "transform", "scale(" + this.zoom + ")" ] ]);
	
	SVG.drawRectangle(0,0, this.viewBoxModule, this.height, this.tracksGroup, [["fill", "white"]]);
	return this._svg;
};

TrackCanvas.prototype.mouseClick = function(event) {
	alert("click");
};
TrackCanvas.prototype.mouseMove = function(event) {
	if (this.allowDragging){
		this._dragging(event);
		
		this.moveLabelsFeatureSelected();
	}
};

TrackCanvas.prototype.moveLabelsFeatureSelected = function() {
	
	if (this.allowLabelMoving){
		for ( var i = 0; i < this.trackList.length; i++) {
			if(this.trackList[i].showLabelsOnMiddleMarker){
				this.trackList[i].drawLabelAtPosition(this.getMiddlePoint(), this.regionAdapterList[i].getFeaturesByPosition(this.getMiddlePoint()));
			}
		}
	}
};

TrackCanvas.prototype.mouseDown = function(event) {
	if (this.allowDragging){
		this._startDragging(event);
	}
};
TrackCanvas.prototype.mouseUp = function(event) {
	if (this.allowDragging){
		this._afterDrag(event);
		
	}
	
	
	
	
	
};

TrackCanvas.prototype.init = function() {
	this._svg = this.createSVGDom(this.targetID, this.id, this.width, this.height, this.backgroundColor);

	/** SVG Events listener */
	var _this = this;
	//	this._svg.addEventListener("click", function(event) {_this.mouseClick(event); }, false);
	this._svg.addEventListener("mousemove", function(event) {
		_this.mouseMove(event, _this);
	}, false);
	this._svg.addEventListener("mousedown", function(event) {
		_this.mouseDown(event, _this);
	}, false);
	this._svg.addEventListener("mouseup", function(event) {
		_this.mouseUp(event, _this);
	}, false);
	
//	this._svg.addEventListener("mouseout", function(event) {
//		_this.mouseUp(event, _this);
//	}, false);
	


};

TrackCanvas.prototype._getTrackFromInternalRegionId = function(internalRegionId) {
	for ( var i = 0; i < this.regionAdapterList.length; i++) {
		if (this.regionAdapterList[i] != null) {
			if (this.regionAdapterList[i].internalId == internalRegionId) {
				return this.trackList[i];
			}
		}
	}
	return null;
};

TrackCanvas.prototype._formatData = function(regionAdapter) {
	/** DAS  **/
	if (regionAdapter instanceof DasRegionDataAdapter) {
		console.log("regionAdapter instanceof DasRegionDataAdapter");
//		var formatters = new ArrayRegionCellBaseDataAdapter();
//		for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
//			formatters.push(new DASFeatureFormatter(regionAdapter.dataset.json[0][i]));
//		}
//		regionAdapter.dataset.json = formatters;
	}
	
	
	if (regionAdapter instanceof GeneRegionCellBaseDataAdapter) {
		var geneBlockManager = new GeneBlockManager();
		regionAdapter.dataset.json = geneBlockManager.toDatasetFormatter(regionAdapter.dataset.json);
	}

	
	/** VCF  **/
	if (regionAdapter instanceof VCFLocalRegionDataAdapter) {
		var formatters = new Array();
		for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
			formatters.push(new VCFFeatureFormatter(regionAdapter.dataset.json[0][i]));
		}
		regionAdapter.dataset.json = formatters;
	}
	
	/** GFF **/
	if (regionAdapter instanceof GFFLocalRegionDataAdapter) {
		var formatters = new Array();
		for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
			formatters.push(new GFFFeatureFormatter(regionAdapter.dataset.json[0][i]));
		}
		regionAdapter.dataset.json = formatters;
	}
	
	/** BED **/
	if (regionAdapter instanceof BEDLocalRegionDataAdapter) {
		var formatters = new Array();
		for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
			formatters.push(new BEDFeatureFormatter(regionAdapter.dataset.json[0][i]));
		}
		regionAdapter.dataset.json = formatters;
	}

	/** RULE  **/
	if (regionAdapter instanceof RuleRegionDataAdapter) {
		var formatters = new Array();
		for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
			formatters.push(new MarkerRuleFeatureFormatter(regionAdapter.dataset.json[0][i]));
		}
		regionAdapter.dataset.json = formatters;
	}
	
	if (regionAdapter instanceof RegionCellBaseDataAdapter) {
		var formatters = new Array();

		if (regionAdapter.resource.toLowerCase().indexOf("histogram=true") != -1){
			return regionAdapter;
		}
		
		if (regionAdapter.resource == "gene") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new GeneFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "tfbs") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new TfbsFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "mirnatarget") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new MiRNAFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "regulatory?type=open chromatin") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new GenericFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "regulatory?type=HISTONE") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new GenericFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "regulatory?type=Polymerase") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new GenericFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		

		if (regionAdapter.resource == "snp") {

			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new SNPFeatureFormatter(
						regionAdapter.dataset.json[0][i]));
			}
		}

		if (regionAdapter.resource == "cytoband") {

			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new CytobandFeatureFormatter(
						regionAdapter.dataset.json[0][i]));
			}
		}

		if (regionAdapter.resource == "transcript") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new TranscriptFeatureFormatter(
						regionAdapter.dataset.json[0][i]));
			}
		}

		if (regionAdapter.resource == "exon") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new ExonFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}

		if (regionAdapter.resource == "conservedregion") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new GenericFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "sequence") {
			var formatters = new Array();

			for ( var i = 0; i < regionAdapter.dataset.json[0].sequence.length; i++) {
				var pos = (regionAdapter.dataset.json[0].start + i) + 1;
				formatters.push(new SequenceFormatter( {
					"start" : pos,
					"end" : pos,
					"base" : regionAdapter.dataset.json[0].sequence[i]
				}));
			}
		}
		regionAdapter.dataset.json = formatters;
	}
	
	return regionAdapter;
};

TrackCanvas.prototype._trackRendered = function() {
	for ( var i = 0; i < this.trackRendered.length; i++) {
		if (this.trackRendered[i] == false) {
			this.trackRendered[i] = true;
			return;
		}
	}
};

TrackCanvas.prototype._areAllTracksRendered = function() {
	for ( var i = 0; i < this.trackRendered.length; i++) {
		if (this.trackRendered[i] == false) {
			return false;
		}
	}
	return true;
};

TrackCanvas.prototype._drawTrack = function(chromosome, start, end, track, regionAdapter) {
		var _this = this;
		track.viewBoxModule = this.viewBoxModule;
	
		if (track.isAvalaible){
			regionAdapter.successed.addEventListener(function(evt, data) {
				 _this._formatData(regionAdapter);
				 
				/** trackRender es una array donde indico con true/track ha sido renderizado o false que no lo ha sido
				 * de esta manera controlo cuando todos los track hayan sido renderizados porder dibujar la regla **/
				_this.trackRenderedName.push(regionAdapter);
				_this._trackRendered();

				/** Si todos han sido rendrizados dibujo la regla **/
				if (_this._areAllTracksRendered()) {
					_this.drawRules(chromosome, start, end);
				}
				
			});
			regionAdapter.preloadSuccess.addEventListener(function(evt, data) {
				var track = _this._getTrackFromInternalRegionId(evt.internalId);
				regionAdapter = _this._formatData(regionAdapter);

				track.appendFeatures(regionAdapter.dataset);
	
			});
	
			this.onMove.addEventListener(function(evt, data) {
				data.middle = Math.ceil(data.middle) + 1;
				regionAdapter.setIntervalView(chromosome, Math.ceil(data.middle));
				if (regionAdapter instanceof RuleRegionDataAdapter){
					_this.selectPaintOnRules(data.middle);
				}
				
				
			});
//			console.log("trackerID"+track.trackerID+"  "+regionAdapter.resource);
//			console.log(track);
			regionAdapter.fill(chromosome, start, end, regionAdapter.resource);
		}
		else{
			_this.trackRenderedName.push(regionAdapter);
			_this._trackRendered();
		}
};

TrackCanvas.prototype.selectPaintOnRules = function(middle) {
	for ( var i = 0; i < this.getRuleTracks().length; i++) {
		if (this.pixelRatio < 1){
			this.getRuleTracks()[i].select(middle);
		}
		else{
			this.getRuleTracks()[i].select(middle, {width:this.pixelRatio});
		}
	}
};

TrackCanvas.prototype.getRuleTracks = function(middle) {
	var rules = new Array();
	for ( var i = 0; i < this.trackList.length; i++) {
		if (this.trackList[i] instanceof RuleFeatureTrack){
			rules.push(this.trackList[i]);
		}
	}
	return rules;
};

TrackCanvas.prototype.getMiddlePoint = function() {
	return Math.ceil(this.middle) + 1;
};

TrackCanvas.prototype.drawRules = function(chromosome, start, end) {
	for ( var i = 0; i < this.trackList.length; i++) {
			var top = this._getTopTrack(this.trackList[i]);
			this.trackList[i].draw(this.regionAdapterList[i].dataset,this.tracksGroup, top);
			this._drawTitle(i);
	}
	this._goToCoordinateX(this.start);
	this.onRender.notify();
};

TrackCanvas.prototype._drawTitle = function(i) {
//			var top = this._getTopTrack(this.trackList[i]);
			if (this.trackList[i].title != null) {
				var middle = this.start + ((this.width / this.pixelRatio) / 2);
				if (middle == null) {
					this.trackList[i].drawTitle(10);
				} 
				else {
					var left = (this.width / 2) / this.pixelRatio;
					this.trackList[i].drawTitle(middle - left + 1 );
				}
			}
};


TrackCanvas.prototype.draw = function(chromosome, start, end) {
	this.start = start;
	this.end = end;
	this.chromosome = chromosome;
	this.startViewBox = (start * this.pixelRatio) % this.viewBoxModule;
	this.endViewBox = (end * this.pixelRatio) % this.viewBoxModule;

	for ( var i = 0; i < this.regionAdapterList.length; i++) {
			var track = this.trackList[i];
			var regionAdapter = this.regionAdapterList[i];
			regionAdapter.successed = new Event(regionAdapter);
			regionAdapter.preloadSuccess = new Event(regionAdapter);
			this._drawTrack(chromosome, start, end, track, regionAdapter);
	}
};

TrackCanvas.prototype.clear = function() {
	DOM.removeChilds(this.targetID);
};

TrackCanvas.prototype.addTrack = function(track, regionDataAdapter) {
	this.trackList.push(track);
	this.trackRendered.push(false);
	this.regionAdapterList.push(regionDataAdapter);
};



TrackCanvas.prototype._getTopTrack = function(track) {
	var top = this.top;
	for ( var i = 0; i < this.trackList.length; i++) {
		if (this.trackList[i].internalId == track.internalId) {
			return top + this.trackList[i].top;
		}
		top = top + this.trackList[i].height + this.trackList[i].originalTop;
	}
	return top;
};


/** DRAGGING **/
TrackCanvas.prototype._goToCoordinateX = function(position) {
	this.start = position;
	var startZoom = (this.start * this.pixelRatio) % this.viewBoxModule;
	var viewBox = startZoom + " " + "10 " + this.width + " " + this.height;
	this._svg.setAttribute("viewBox", viewBox);

	/** He cambiado esto por el slave **/
	if (this.isBeenRenderized){
		this.middle = this.start + (this.end - this.start)/2;
		this.isBeenRenderized = false;
	}
	else{
		this.middle = this.start + ((this.width / this.pixelRatio) / 2);
	}

	this.onMove.notify( {
		"chromosome" : this.chromosome,
		"start" : this.start,
		"end" : this.end,
		"middle" : this.middle
	});

};

TrackCanvas.prototype._moveCoordinateX = function(move) {
	for ( var i = 0; i < this.trackList.length; i++) {
		if ((this.trackList[i].title) != null) {
//			if (parseFloat(this.pixelRatio) < 1){
				this.trackList[i].moveTitle(-move);
//			}
//			else{
//				this._drawTitle(i);
//			}
		}
	}

	var newStart = move / this.pixelRatio;
	this._goToCoordinateX(Math.ceil(this.start + newStart));
};

TrackCanvas.prototype._moveCoordinateY = function(move) {
	var realMove = (-1 * move) + this.moveY;
	if (realMove < this.top) {
		this.tracksGroup.setAttribute("transform", "translate(0, " + realMove+ ")");
		this.realMove = realMove;

		for ( var i = 0; i < this.trackList.length; i++) {
			if (this.trackList[i].floating){
				this.trackList[i].moveY(-realMove);
			}
		}
	} else {
		this.realMove = 0;
	}
};

TrackCanvas.prototype._startDragging = function(evt) {
	this.isDragging = true;
	var point = this._getSVGCoordenates(evt);
	this.dragPoint = {
		"x" : point.x,
		"y" : point.y
	};
};

TrackCanvas.prototype._afterDrag = function(evt) {
	this.isDragging = false;
	this.dragPoint = null;
	this.moveY = this.realMove;
	this.afterDrag.notify(this.middle);
	
	
	
};

TrackCanvas.prototype.setZoom = function(zoom) {
	this.zoom = zoom;
	this.tracksGroup.setAttribute("transform", "scale(" + zoom + ")");
	this._goToCoordinateX(this.startViewBox);
};

TrackCanvas.prototype._dragging = function(evt) {
	if (this.isDragging) {
		var actualPointSVG = this._getSVGCoordenates(evt);
		
		var moveX = this.dragPoint.x - actualPointSVG.x;
		var moveY = this.dragPoint.y - actualPointSVG.y;
		
		this._moveCoordinateX(moveX);
		if(this.enableMovingY){
			this._moveCoordinateY(Math.ceil(moveY));
		}
	}

};

/** SVG COORDENATES **/
TrackCanvas.prototype._getSVGCoordenates = function(evt) {
	var p = this._svg.createSVGPoint();
	p.x = evt.clientX;
	p.y = evt.clientY;

	var m = this._svg.getScreenCTM(document.documentElement);
	p = p.matrixTransform(m.inverse());
	return p;
};

function SequenceFeatureTrack (rulerID,targetID, species, args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID, species, args);
	this.avoidOverlapping = false;
	
}

SequenceFeatureTrack.prototype.getIdToPrint =    						FeatureTrack.prototype.getIdToPrint;
SequenceFeatureTrack.prototype.changeView =      						FeatureTrack.prototype.changeView;
SequenceFeatureTrack.prototype.render =          						FeatureTrack.prototype.render;
SequenceFeatureTrack.prototype.init =            						FeatureTrack.prototype.init;
SequenceFeatureTrack.prototype.createSVGDom =    						FeatureTrack.prototype.createSVGDom;
SequenceFeatureTrack.prototype._getTopText =     						FeatureTrack.prototype._getTopText;
SequenceFeatureTrack.prototype._getTopFeatures = 						FeatureTrack.prototype._getTopFeatures;
SequenceFeatureTrack.prototype._searchSpace =    						FeatureTrack.prototype._searchSpace;
SequenceFeatureTrack.prototype.drawTitle =       						FeatureTrack.prototype.drawTitle;
SequenceFeatureTrack.prototype.mouseMove =       						FeatureTrack.prototype.mouseMove;
SequenceFeatureTrack.prototype.mouseclick =      						FeatureTrack.prototype.mouseclick;
SequenceFeatureTrack.prototype.getById =         						FeatureTrack.prototype.getById;
SequenceFeatureTrack.prototype.draw =            						FeatureTrack.prototype.draw;
SequenceFeatureTrack.prototype.drawFeatures =    						FeatureTrack.prototype.drawFeatures;
SequenceFeatureTrack.prototype._overlapBlocks =  						FeatureTrack.prototype._overlapBlocks;
SequenceFeatureTrack.prototype.mouseMove =       						FeatureTrack.prototype.mouseMove;
SequenceFeatureTrack.prototype.mouseUp =      	 						FeatureTrack.prototype.mouseUp;
SequenceFeatureTrack.prototype.mouseClick =      						FeatureTrack.prototype.mouseClick;
SequenceFeatureTrack.prototype.mouseDown =       						FeatureTrack.prototype.mouseDown;
SequenceFeatureTrack.prototype._render =       							FeatureTrack.prototype._render;
SequenceFeatureTrack.prototype._convertGenomePositionToPixelPosition =  FeatureTrack.prototype._convertGenomePositionToPixelPosition;
SequenceFeatureTrack.prototype._getFeatureWidth 	=       			FeatureTrack.prototype._getFeatureWidth;
SequenceFeatureTrack.prototype._updateTop 	=       					FeatureTrack.prototype._updateTop;
SequenceFeatureTrack.prototype.clear 			=       				FeatureTrack.prototype.clear;
SequenceFeatureTrack.prototype.drawBackground  =          				FeatureTrack.prototype.drawBackground;
SequenceFeatureTrack.prototype.moveTitle  =          				    FeatureTrack.prototype.moveTitle;
SequenceFeatureTrack.prototype.drawFeaturesInQueue = FeatureTrack.prototype.drawFeaturesInQueue;

SequenceFeatureTrack.prototype.appendFeatures = function(data){
	this.features = data.toJSON();
	this.drawFeatures(this.features);
};



SequenceFeatureTrack.prototype._addFeatures = function(data){
	/** features */
	this.features = data.toJSON();
//	this.features = this._convertSequenceToFeatures(data.toJSON()[0].start, data.toJSON()[0].sequence);
	this.featuresIndex = new Object();
};

SequenceFeatureTrack.prototype._setAttributes = function(feature){
//	debugger
	var attributes = [["fill", feature.getDefault().getFill()],["id", this.id+"_" + feature.start], ["font-size", "10"]];
	attributes.push(["opacity", "1"]);
	return attributes;
};



SequenceFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
	
	attributes.push(["opacity", 0.8]);
	attributes.push(["stroke", "black"]);
	
	var nodeSVG = SVG.drawRectangle( startPoint , Math.ceil(top), this.pixelRatio, this.featureHeight, this.trackNodeGroup, attributes);
	SVG.drawText(startPoint + 2 , Math.ceil(top) + 8, feature.label, this.labelNodeGroup, [["font-size", "8"]]);
};

SequenceFeatureTrack.prototype.getTextId = function(startPoint){
	return "id_seq_" + startPoint;
};

SequenceFeatureTrack.prototype._textId = function(startPoint, top, featureWidth, attributes, feature){
	SVG.drawText(Math.ceil(startPoint) + 2, Math.ceil(top) + 8, feature.base, this.trackNodeGroup, [["font-size", "8"], ["id", this.getTextId(startPoint)]]);
};

SequenceFeatureTrack.prototype._removeTextBase = function(startPoint, top, featureWidth, attributes, feature){
	this.trackNodeGroup.removeChild(DOM.select(this.getTextId(startPoint)));
};

SequenceFeatureTrack.prototype._drawTextBase = function(startPoint, top, featureWidth, attributes, feature){
	SVG.drawText(Math.ceil(startPoint) + 2, Math.ceil(top) + 8, feature.base, this.trackNodeGroup, [["font-size", "8"], ["id", "id_seq_" + startPoint]]);
};



function RuleFeatureTrack (rulerID,targetID, species, args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID, species,  args);
	this.horizontalRuleDrawn = false;
	
//	this.pixelRatio = 0.001;
	this.ruleHeight = this.height;
	this.expandRuleHeight = this.height;
	/** Estos attributos tb tedeberia de tenerlo su dataadapter **/
//	this.space = 100;
//	this.maxChromosomeSize = 255000000;
//	this.ratio = this.space / this.pixelRatio; 	
	
	this.horizontalRuleTop = this.height - 2;
	
	if (args != null){
		if (args.expandRuleHeight != null){
			this.ruleHeight = args.expandRuleHeight;
		}
		
		if (args.space != null){
			this.space = args.space;
		}
	}

//	this.start = this.start - ((this.end - this.start) * 4);
//	this.end = this.end + ((this.end - this.start) * 4);
//	
	this.allowDuplicates = true;
	this.quarter = (this.end - this.start)/4;
	
	
	this.selectedMiddleLine = null;
	
}

RuleFeatureTrack.prototype.getIdToPrint =    FeatureTrack.prototype.getIdToPrint;
RuleFeatureTrack.prototype.render =          FeatureTrack.prototype.render;
RuleFeatureTrack.prototype._getTopText =     FeatureTrack.prototype._getTopText;
RuleFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
RuleFeatureTrack.prototype._searchSpace =    FeatureTrack.prototype._searchSpace;
RuleFeatureTrack.prototype.drawTitle =       FeatureTrack.prototype.drawTitle;
RuleFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
RuleFeatureTrack.prototype.mouseclick =      FeatureTrack.prototype.mouseclick;
RuleFeatureTrack.prototype.getById =         FeatureTrack.prototype.getById;
RuleFeatureTrack.prototype.draw =            FeatureTrack.prototype.draw;
RuleFeatureTrack.prototype.drawFeatures =    FeatureTrack.prototype.drawFeatures;
RuleFeatureTrack.prototype._overlapBlocks =  FeatureTrack.prototype._overlapBlocks;
RuleFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
RuleFeatureTrack.prototype.mouseUp =      	 FeatureTrack.prototype.mouseUp;
RuleFeatureTrack.prototype.mouseClick =      FeatureTrack.prototype.mouseClick;
RuleFeatureTrack.prototype.mouseDown =       FeatureTrack.prototype.mouseDown;
RuleFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
RuleFeatureTrack.prototype._render =       FeatureTrack.prototype._render;
RuleFeatureTrack.prototype._getFeatureWidth 	=       FeatureTrack.prototype._getFeatureWidth;
//RuleFeatureTrack.prototype.addFeatures 	=       FeatureTrack.prototype.addFeatures;
RuleFeatureTrack.prototype._updateTop 	=       FeatureTrack.prototype._updateTop;
RuleFeatureTrack.prototype.drawBackground 	=       FeatureTrack.prototype.drawBackground;
RuleFeatureTrack.prototype.isFeatureDuplicated 	=       FeatureTrack.prototype.isFeatureDuplicated;
RuleFeatureTrack.prototype.clear 	=       FeatureTrack.prototype.clear;
RuleFeatureTrack.prototype.init 	=       FeatureTrack.prototype.init;
RuleFeatureTrack.prototype.createSVGDom 	=       FeatureTrack.prototype.createSVGDom;
RuleFeatureTrack.prototype.moveY 	=       FeatureTrack.prototype.moveY;
RuleFeatureTrack.prototype._setAttributes 	=       FeatureTrack.prototype._setAttributes;
RuleFeatureTrack.prototype.moveTitle 	=       FeatureTrack.prototype.moveTitle;
RuleFeatureTrack.prototype.drawFeaturesInQueue 	=       FeatureTrack.prototype.drawFeaturesInQueue;


RuleFeatureTrack.prototype.appendFeatures = function(features){
	this.drawFeatures(features.toJSON());
};

RuleFeatureTrack.prototype._addFeatures = function(data){
	this.features =  data.toJSON();//this._getFeaturesFromRegion(this.start, this.end);//new Array();
	this.horizontalRuleDrawn = false;
};


RuleFeatureTrack.prototype.getFeatureColor = function(feature){
	return "#000000";
};


RuleFeatureTrack.prototype.select = function(midlle, args){
	var widthLine = 1;
	if (args != null){
		if (args.width != null){
			widthLine = args.width;
		}
		
	}
	
	if (this.selectedMiddleLine != null){
		this.selectedMiddleLine.parentNode.removeChild(this.selectedMiddleLine);
	}
	
	if (this.textMiddleLine != null){
		this.textMiddleLine.parentNode.removeChild(this.textMiddleLine);
	}
	
	if( this.trackNodeGroup != null){
	
		var attributes = [["fill", "green"],["stroke-width", "1"], ["opacity",0.5]];
		var coordenateX = this._convertGenomePositionToPixelPosition(midlle);
//		this.selectedMiddleLine = SVG.drawLine(Math.ceil(coordenateX),  this.top + this.horizontalRuleTop, Math.ceil(coordenateX), this.ruleHeight + 10000, this.trackNodeGroup, attributes);
		this.selectedMiddleLine = SVG.drawRectangle((coordenateX)  ,  this.top + this.horizontalRuleTop, widthLine, this.ruleHeight + 10000, this.trackNodeGroup, attributes);
		this.textMiddleLine = SVG.drawText(Math.ceil(coordenateX) - 15, this.top + this.horizontalRuleTop, this._prettyNumber(midlle), this.trackNodeGroup, [["font-size", "9"], ["fill", "green"]]);
	}
};


RuleFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
	if (this.trackNodeGroup != null){
		if (feature.isLabeled){
			SVG.drawText(Math.ceil(startPoint) + 2, top + 10 , this._prettyNumber(feature.start), this.labelNodeGroup, [["font-size", "10"]]);
			SVG.drawLine(Math.ceil(startPoint), top, Math.ceil(startPoint), this.ruleHeight + 10000, this.trackNodeGroup, [["stroke", "#000000"], ["opacity",feature.getDefault().getOpacity()]]);
		}
		else{
			//Es una linea divisoria
			SVG.drawLine(Math.ceil(startPoint),  top + this.horizontalRuleTop, Math.ceil(startPoint), this.ruleHeight + 10000, this.trackNodeGroup, [["stroke", "#000000"], ["opacity",feature.getDefault().getOpacity()]]);
		}
		
		if (!this.horizontalRuleDrawn){
			var lastPositionRec = this.viewBoxModule;
			if ((260000000*this.pixelRatio) < this.viewBoxModule){
				lastPositionRec = 260000000*this.pixelRatio;
			} 
			SVG.drawRectangle(0, top, lastPositionRec, this.height, this.trackNodeGroup, [["fill", "gray"], ["stroke", "#000000"], ["opacity", 0.5]]);
			this.horizontalRuleDrawn = true;
		}
	}
	

};

RuleFeatureTrack.prototype._prettyNumber = function addCommas(nStr){
	nStr = Math.ceil(nStr)+ '';
//	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
};

function MultiFeatureTrack (rulerID,targetID, species, args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID, species, args);
	
	this.queueHeight = 14;
	this.pixelSpaceBetweenBlocks = 80;
	this.showTranscripts = true;
	this.avoidOverlapping = true;
	
	this.showDetailGeneLabel = false;
	
	this.showExonLabel = false;
	this.onMouseOverShitExonTranscriptLabel = false;
	
	this.extraSpaceProducedByLabelAbove = 6;
	
	this.geneBlockManager = null;
	
	this.labelHeight = 12;
	this.separatorBetweenQueue = 4;
	this.labelSize = 18;
	
	if (args != null){
		if (args.showExonLabel != null){
			this.showExonLabel = args.showExonLabel;
		}
		if (args.onMouseOverShitExonTranscriptLabel != null){
			this.onMouseOverShitExonTranscriptLabel = args.onMouseOverShitExonTranscriptLabel;
		}
		
		if (args.queueHeight != null){
			this.queueHeight = args.queueHeight;
		}
		if (args.labelSize != null){
			this.labelSize = args.labelSize;
		}
		if (args.labelHeight != null){
			this.labelHeight = args.labelHeight;
		}
		
		if (args.pixelSpaceBetweenBlocks != null){
			this.pixelSpaceBetweenBlocks = args.pixelSpaceBetweenBlocks;
		}
		
		if (args.showTranscripts != null){
			this.showTranscripts = args.showTranscripts;
		}
		
		if (args.labelsNearEye != null){
			this.labelsNearEye = args.labelsNearEye;
		}
		
		if (args.showDetailGeneLabel != null){
			this.showDetailGeneLabel = args.showDetailGeneLabel;
		}
	}
	
	this.queues = new Array();
	this.queues.push(new Array());
}



//MultiFeatureTrack.prototype._setTextAttributes =    FeatureTrack.prototype._setTextAttributes;
//MultiFeatureTrack.prototype._renderLabel =    FeatureTrack.prototype._renderLabel;
MultiFeatureTrack.prototype.getIdToPrint =    FeatureTrack.prototype.getIdToPrint;
MultiFeatureTrack.prototype.changeView =      FeatureTrack.prototype.changeView;
MultiFeatureTrack.prototype.init =            FeatureTrack.prototype.init;
MultiFeatureTrack.prototype.createSVGDom =    FeatureTrack.prototype.createSVGDom;
MultiFeatureTrack.prototype._getTopText =     FeatureTrack.prototype._getTopText;
MultiFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
MultiFeatureTrack.prototype.select = FeatureTrack.prototype.select;
//MultiFeatureTrack.prototype._searchSpace =    FeatureTrack.prototype._searchSpace;
MultiFeatureTrack.prototype.drawTitle =       FeatureTrack.prototype.drawTitle;
MultiFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
MultiFeatureTrack.prototype.mouseclick =      FeatureTrack.prototype.mouseclick;
MultiFeatureTrack.prototype.getById =         FeatureTrack.prototype.getById;
MultiFeatureTrack.prototype.draw =            FeatureTrack.prototype.draw;
MultiFeatureTrack.prototype.getFeatureColor = FeatureTrack.prototype.getFeatureColor;
MultiFeatureTrack.prototype._overlapBlocks =  FeatureTrack.prototype._overlapBlocks;
MultiFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
MultiFeatureTrack.prototype.mouseUp =      	  FeatureTrack.prototype.mouseUp;
MultiFeatureTrack.prototype.mouseClick =      FeatureTrack.prototype.mouseClick;
MultiFeatureTrack.prototype.mouseDown =       FeatureTrack.prototype.mouseDown;
MultiFeatureTrack.prototype._addFeatures =    FeatureTrack.prototype._addFeatures;
MultiFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
MultiFeatureTrack.prototype._getViewBoxCoordenates 	=       FeatureTrack.prototype._getViewBoxCoordenates;
MultiFeatureTrack.prototype._getFeatureWidth 	=       FeatureTrack.prototype._getFeatureWidth;
MultiFeatureTrack.prototype.drawBackground  =          FeatureTrack.prototype.drawBackground;
MultiFeatureTrack.prototype.moveTitle 	=       FeatureTrack.prototype.moveTitle;
//MultiFeatureTrack.prototype._updateTop 	=       FeatureTrack.prototype._updateTop;
//MultiFeatureTrack.prototype._setAttributes 	=       FeatureTrack.prototype._setAttributes;


MultiFeatureTrack.prototype._renderLabel = function(start, top, label, attributes, formatter){
	return SVG.drawText(start , top , label, this.labelNodeGroup, attributes);
};

MultiFeatureTrack.prototype._setTextAttributes = function(feature) {
	var attributes = [["fill", "black"],["id", this.id+"_" + feature.id],["cursor", "pointer"], ["font-size", this.labelSize]];
	
	if ((feature instanceof TranscriptFeatureFormatter)&& this.showExonLabel){
		attributes.push(["opacity", 0]);
	}
	
	if ((feature instanceof ExonFeatureFormatter)&& this.onMouseOverShitExonTranscriptLabel){
		attributes.push(["opacity", 0]);
	}
	
	if ((feature instanceof ExonFeatureFormatter)&& !this.showExonLabell){
		attributes.push(["opacity", 0]);
	}
	return attributes;
};

MultiFeatureTrack.prototype.drawLabelAtPosition = function(genomicPositionX, features){
	var keys = new Array();
	var hide = new Array();
	for ( var i = 0; i < features.length; i++) {
		if (features[i+1]!= null){
			if (features[i+1] instanceof ExonFeatureFormatter){
				hide.push(features[i].getId());
				continue;
			}
		}
		keys.push(features[i].getId());
	}
	
	for ( var i = 0; i < this.labelNodeGroup.childElementCount; i++) {
		this.labelNodeGroup.childNodes[i].setAttribute("opacity", 0);
		for ( var j = 0; j < keys.length; j++) {
			if (keys[j].indexOf(this.labelNodeGroup.childNodes[i].getAttribute("id").replace(this.id +"_", "")) != -1){
				this.labelNodeGroup.childNodes[i].setAttribute("x", this._convertGenomePositionToPixelPosition(genomicPositionX));
				this.labelNodeGroup.childNodes[i].setAttribute("opacity", 1);
				continue;
			}
		
		}
		
		for ( var j = 0; j < hide.length; j++) {
			if (hide[j].indexOf(this.labelNodeGroup.childNodes[i].getAttribute("id").replace(this.id +"_", "")) != -1){
				this.labelNodeGroup.childNodes[i].setAttribute("opacity", 0);
				continue;
			}
		}
	}
};


MultiFeatureTrack.prototype._updateTop = function(){
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

MultiFeatureTrack.prototype.appendFeatures = function(data){
	var features = data.toJSON();
	this.drawFeatures(features);
};

MultiFeatureTrack.prototype.clear = function(){
	if(this.mainNodeGroup != null){
		 while (this.mainNodeGroup.childNodes.length>0){
			 	this.mainNodeGroup.removeChild(this.mainNodeGroup.childNodes[0]);
		 }
	}
	this.featuresID = new Object();
	this.maxHeight = this.originalHeight;
};


MultiFeatureTrack.prototype._addFeatures = function(data){
	if (this.geneBlockManager == null){
		this.geneBlockManager = new GeneBlockManager();
	}
	
	if ((data.toJSON().lenth != 0) && !(data.toJSON()[0]) instanceof GeneFeatureFormatter){
		var formatters = this.geneBlockManager.toDatasetFormatter(data.toJSON());
		this.features = formatters;
		this.featuresIndex = new Object();
	}
	else{
		this.features = data.toJSON();
		this.featuresIndex = new Object();
		
	}
};

MultiFeatureTrack.prototype._setAttributes = function(feature, filled){
	var attributes = [["id", this.id+"_" + feature.name], ["style", "cursor:pointer"]];
	attributes.push(["fill-opacity", feature.getDefault().getOpacity()]);
	attributes.push(["stroke", feature.getDefault().getStroke()]);
	attributes.push(["stroke-width", feature.getDefault().getStrokeWidth()]);
	attributes.push(["stroke-opacity", feature.getDefault().getStrokeOpacity()]);
	
	if (filled != null){
		if(!filled){
			attributes.push( [ "fill", "white" ]);
		}
	}
	else{
		if (this.forceColor == null) {
			attributes.push( [ "fill", feature.getDefault().getFill() ]);
		} else {
			attributes.push( [ "fill", this.forceColor ]);
		}
	}
	
	return attributes;
};


//MultiFeatureTrack.prototype._setTextAttributes = function(feature){
//	var attributes = [["fill", "black"],["id", this.id+"_" + feature.start],["cursor", "pointer"], ["font-size", this.labelSize]];
//	return attributes;
//};



/** True si dos bloques se solapan */
//MultiFeatureTrack.prototype._overlapBlocks = function(block1, block2){
//	var spaceBlock = this.pixelSpaceBetweenBlocks / this.pixelRatio;
//	
//	if ((block1.start  < block2.end + spaceBlock) && (block1.end  + spaceBlock > block2.start)){
//		return true;
//	}
//	return false;
//};

/** Busca disponibilidad de espacio y devuelve el indice del layer donde debe insertarse */
MultiFeatureTrack.prototype._searchSpace = function(block1, minQueue){
	for (var i = minQueue; i < this.queues.length; i++ ){
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
	/** no hemos encontrado ningun espacio en ninguna cola anterior */
	return this.queues.length - 1;
};

MultiFeatureTrack.prototype.isFeatureDuplicated = function(feature){
	return (this.featuresID[feature.id] != null);
};


MultiFeatureTrack.prototype._render = function() {
	this.init();
	if (this.isAvalaible){
		if (this.features != null){
			this.drawFeatures(this.features);
		}
	}
	this.queues = new Array();
	this.queues.push(new Array());
};

MultiFeatureTrack.prototype.drawFeatures = function(features){
	if (features.length > 0){
		if ((features[0] instanceof GeneFeatureFormatter)==false){
				var geneBlockManager = new GeneBlockManager();
				var formatters = geneBlockManager.toDatasetFormatter(features);
				features = formatters;
		}
	}


	for (var i = 0; i < features.length;  i++){
		var feature = features[i];
		if (!this.allowDuplicates){
			if (this.isFeatureDuplicated(features[i])){
				continue;
			}
			else{
				this.featuresID[features[i].id] = true;
			}
		}
		
		if (feature instanceof GeneFeatureFormatter){
			var geneQueueToDraw = this._searchSpace(feature, 0); 
			
			/** Insertamos en la cola para marcar el espacio reservado */
			this.queues[geneQueueToDraw].push(feature);
			this.drawFeaturesInQueue(feature, geneQueueToDraw);
			
			if (feature.transcript != null){
				var nTrancsripts = feature.transcript.length;
				if (this.showTranscripts){
					for ( var t = 0; t < feature.transcript.length; t++) {
						var transcript =  feature.transcript[t];
						var queueToDraw = this._searchSpace(transcript, Math.ceil(geneQueueToDraw) + 1); 
						
						/** Insertamos en la cola para marcar el espacio reservado */
						this.queues[queueToDraw].push(transcript);
						this.drawFeaturesInQueue(transcript, queueToDraw);
						for ( var j = 0; j < transcript.exon.length; j++) {
							this.drawFeaturesInQueue(transcript.exon[j], queueToDraw, transcript);
						}
					}
				}
			}
		}
	}
	
	this._updateTop();
};


/** Si es un exon le pasamos el transcript para determinar las zonas de coding protein **/
MultiFeatureTrack.prototype.drawFeaturesInQueue = function(feature, queueToDraw, transcript){
	var featureWidth = ((feature.end ) - feature.start + 1) * this.pixelRatio;
	var startPoint = (feature.start - 1) * this.pixelRatio;
	var top = this.top + (queueToDraw * this.featureHeight);
	
	if (this.label){
		   top = this.top + (queueToDraw * (this.featureHeight + this.labelHeight + this.separatorBetweenQueue));
	}
	
	if (transcript == null){
		this._drawFeature((startPoint % this.viewBoxModule), top,  Math.ceil(featureWidth), this._setAttributes(feature), feature);
	}
	else{

		var start = (startPoint % this.viewBoxModule);
		var FILL = this._setAttributes(feature);
		var NOFILL = this._setAttributes(feature, false);
		
		/** Rellenamos todo el exon porque todo el exon esta dentro de la zona coding**/
		if ((transcript.feature.codingRegionStart <= feature.start)&&(transcript.feature.codingRegionEnd >= feature.end)){
			this._drawFeature(start, top,  Math.ceil(featureWidth),  FILL, feature);
			return;
		}
		
		/** Se deja en blanco por que esta fuera del rango**/
		if ((feature.start >= transcript.feature.codingRegionEnd)||(feature.end <= transcript.feature.codingRegionStart)){
			this._drawFeature(start, top,  Math.ceil(featureWidth),  NOFILL, feature);
			return;
		}
		
		var pixelCodingRegionStart = this._convertGenomePositionToPixelPosition(transcript.feature.codingRegionStart);
		var pixelCodingRegionEnd = this._convertGenomePositionToPixelPosition(transcript.feature.codingRegionEnd) ;
		
		var pixelFeatureStart =  this._convertGenomePositionToPixelPosition(feature.start);
		var pixelFeatureEnd =  this._convertGenomePositionToPixelPosition(feature.end + 1);
		
		
		/** Parcialmente rellena**/
		if ((feature.start <= transcript.feature.codingRegionStart)&&(feature.end <= transcript.feature.codingRegionEnd)){
			this._drawFeature(pixelFeatureStart, top, pixelCodingRegionStart - start,  NOFILL, feature);
			this._drawFeature(pixelCodingRegionStart, top, pixelFeatureEnd - pixelCodingRegionStart,  FILL, feature);
			return;
		}
		
		/** Parcialmente rellena**/
		if ((feature.start >= transcript.feature.codingRegionStart)&&(feature.end >= transcript.feature.codingRegionEnd)){
			this._drawFeature(pixelCodingRegionEnd, top, pixelFeatureEnd - pixelCodingRegionEnd,  NOFILL, feature);
			this._drawFeature(pixelFeatureStart, top,  pixelCodingRegionEnd - pixelFeatureStart,  FILL, feature);
			return;
		}
		
		/** Todo el coding protein esta dentro del exon**/
		if ((feature.start <= transcript.feature.codingRegionStart)&&(feature.end >= transcript.feature.codingRegionEnd)){
			this._drawFeature(pixelFeatureStart, top, pixelCodingRegionStart - pixelFeatureStart,  NOFILL, feature);
			this._drawFeature(pixelCodingRegionEnd, top, pixelFeatureEnd - pixelCodingRegionEnd,  NOFILL, feature);
			this._drawFeature(pixelCodingRegionStart, top, pixelCodingRegionEnd - pixelCodingRegionStart,  FILL, feature);
			return;
			
		}
		
	}
};


MultiFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
	var _this = this;
	
	var nodeSVG;
	
	if (feature instanceof TranscriptFeatureFormatter){
		SVG.drawLine(startPoint, top + (this.featureHeight/2), startPoint + Math.ceil(featureWidth), top + (this.featureHeight/2), this.trackNodeGroup, this._setAttributes(feature));
	}
	else{
		nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), Math.ceil(top), featureWidth, this.featureHeight, this.trackNodeGroup, attributes);
		nodeSVG.addEventListener("mouseover", function(ev){_this._featureOver(feature, this, ev);}, true);
		nodeSVG.addEventListener("mouseout", function(ev){_this._featureOut(feature, this, ev);}, true);
		nodeSVG.addEventListener("click", function(ev){ _this.clickOn(feature, this, ev);}, true);
	}
	
	if (this.label){
		var label = this.getLabel(feature);
		if (label != null){
			var textSVG = this._renderLabel(Math.ceil(startPoint) ,  Math.ceil(top) + (this.featureHeight + this.labelHeight) , label, this._setTextAttributes(feature));
			textSVG.addEventListener("mouseover", function(ev){_this._featureOver(feature, this, ev);}, true);
			textSVG.addEventListener("mouseout", function(ev){_this._featureOut(feature, this, ev);}, true);
			textSVG.addEventListener("click", function(ev){  _this.clickOn(feature, this, ev); }, true);
		}
	}
};

MultiFeatureTrack.prototype.getLabel = function (feature){
	var label = feature.label;
	if(feature instanceof GeneFeatureFormatter){
		if (this.showDetailGeneLabel){
			return feature.getDetailLabel();
		}
	}
	
	if(feature instanceof ExonFeatureFormatter){
		if (this.showExonLabel){
			return feature.label;
		}
		else{
			return "";
		}
	}
	if(feature instanceof TranscriptFeatureFormatter){
			return feature.label;
	}
	return label;
};


MultiFeatureTrack.prototype.clickOn = function (feature){
	
	if (feature instanceof ExonFeatureFormatter){
		//TODO por ahora no es necesario ExonInfoWidget
	}
	
	if (feature instanceof TranscriptFeatureFormatter){
		new TranscriptInfoWidget(null,this.species).draw(feature);
	}
			
	if (feature instanceof GeneFeatureFormatter){
		new GeneInfoWidget(null,this.species).draw(feature);
	}
	
	this.onClick.notify(feature);
};


MultiFeatureTrack.prototype._featureOut = function(feature, node, ev){
	node.setAttribute("stroke-width", "0.5");
	node.setAttribute("opacity", this.lastOpacity);
//TODO done	Que desaparezca
	this.tooltippanel.destroy();
};

MultiFeatureTrack.prototype._featureOver = function(feature, node, ev){
//	console.log(ev);
	this.lastOpacity = node.getAttribute("opacity");
	node.setAttribute("stroke-width", "1");
	node.setAttribute("opacity", "0.6");
//TODO done
	this.tooltippanel = new TooltipPanel();
	this.tooltippanel.getPanel(feature).showAt(ev.clientX,ev.clientY);
};

function CytobandFeatureTrack (rulerID,targetID,  args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID,  args);
	
	this.opacity = null;
	this.forceColor = null;
	
	if (args != null){
		if (args.opacity != null){
			this.opacity = args.opacity;
		}
		
		if (args.forceColor != null){
			this.forceColor = args.forceColor;
		}
		
	}
	this.positions = new Object();
}

CytobandFeatureTrack.prototype._renderLabel =    FeatureTrack.prototype._renderLabel;
CytobandFeatureTrack.prototype.isFeatureDuplicated =    FeatureTrack.prototype.isFeatureDuplicated;
CytobandFeatureTrack.prototype.getIdToPrint =    FeatureTrack.prototype.getIdToPrint;
CytobandFeatureTrack.prototype.changeView =      FeatureTrack.prototype.changeView;
CytobandFeatureTrack.prototype.render =          FeatureTrack.prototype.render;
CytobandFeatureTrack.prototype.init =            FeatureTrack.prototype.init;
CytobandFeatureTrack.prototype.createSVGDom =    FeatureTrack.prototype.createSVGDom;
CytobandFeatureTrack.prototype._getTopText =     FeatureTrack.prototype._getTopText;
CytobandFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
CytobandFeatureTrack.prototype._searchSpace =    FeatureTrack.prototype._searchSpace;
CytobandFeatureTrack.prototype.drawTitle =       FeatureTrack.prototype.drawTitle;
CytobandFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
CytobandFeatureTrack.prototype.mouseclick =      FeatureTrack.prototype.mouseclick;
CytobandFeatureTrack.prototype.getById =         FeatureTrack.prototype.getById;
CytobandFeatureTrack.prototype.draw =            FeatureTrack.prototype.draw;
//CytobandFeatureTrack.prototype.getFeatureColor = FeatureTrack.prototype.getFeatureColor;
CytobandFeatureTrack.prototype.drawFeatures =    FeatureTrack.prototype.drawFeatures;
CytobandFeatureTrack.prototype._overlapBlocks =  FeatureTrack.prototype._overlapBlocks;
CytobandFeatureTrack.prototype._render =       FeatureTrack.prototype._render;
CytobandFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
CytobandFeatureTrack.prototype._getViewBoxCoordenates 	=       FeatureTrack.prototype._getViewBoxCoordenates;
CytobandFeatureTrack.prototype._getFeatureWidth 	=       FeatureTrack.prototype._getFeatureWidth;
CytobandFeatureTrack.prototype._updateTop 	=       FeatureTrack.prototype._updateTop;
CytobandFeatureTrack.prototype.clear 	=       FeatureTrack.prototype.clear;
CytobandFeatureTrack.prototype.drawBackground 	=       FeatureTrack.prototype.drawBackground;
CytobandFeatureTrack.prototype.moveTitle 	=       FeatureTrack.prototype.moveTitle;
CytobandFeatureTrack.prototype.moveY 	=       FeatureTrack.prototype.moveY;
CytobandFeatureTrack.prototype.drawFeaturesInQueue 	=       FeatureTrack.prototype.drawFeaturesInQueue;
CytobandFeatureTrack.prototype._setTextAttributes 	=       FeatureTrack.prototype._setTextAttributes;
CytobandFeatureTrack.prototype._setAttributes 	=       FeatureTrack.prototype._setAttributes;
CytobandFeatureTrack.prototype._drawFeature 	=       FeatureTrack.prototype._drawFeature;
CytobandFeatureTrack.prototype.appendFeatures 	=       FeatureTrack.prototype.appendFeatures;




CytobandFeatureTrack.prototype._addFeatures = function(data){
	/** features */
	this.features = data.toJSON();
	this.featuresIndex = new Object();
};





function RegionFeatureTrack (rulerID,targetID,  args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID,  args);
	
	this.opacity = null;
	this.forceColor = null;
	
	if (args != null){
		if (args.opacity != null){
			this.opacity = args.opacity;
		}
		
		if (args.forceColor != null){
			this.forceColor = args.forceColor;
		}
		
	}
	this.positions = new Object();
}



RegionFeatureTrack.prototype.getIdToPrint =    FeatureTrack.prototype.getIdToPrint;
RegionFeatureTrack.prototype.changeView =      FeatureTrack.prototype.changeView;
RegionFeatureTrack.prototype.render =          FeatureTrack.prototype.render;
RegionFeatureTrack.prototype.init =            FeatureTrack.prototype.init;
RegionFeatureTrack.prototype.createSVGDom =    FeatureTrack.prototype.createSVGDom;
RegionFeatureTrack.prototype._getTopText =     FeatureTrack.prototype._getTopText;
RegionFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
RegionFeatureTrack.prototype._searchSpace =    FeatureTrack.prototype._searchSpace;
RegionFeatureTrack.prototype.drawTitle =       FeatureTrack.prototype.drawTitle;
RegionFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
RegionFeatureTrack.prototype.mouseclick =      FeatureTrack.prototype.mouseclick;
RegionFeatureTrack.prototype.getById =         FeatureTrack.prototype.getById;
RegionFeatureTrack.prototype.draw =            FeatureTrack.prototype.draw;
RegionFeatureTrack.prototype.getFeatureColor = FeatureTrack.prototype.getFeatureColor;
RegionFeatureTrack.prototype.drawFeatures =    FeatureTrack.prototype.drawFeatures;
RegionFeatureTrack.prototype._overlapBlocks =  FeatureTrack.prototype._overlapBlocks;
RegionFeatureTrack.prototype._render =       FeatureTrack.prototype._render;
RegionFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
RegionFeatureTrack.prototype._getViewBoxCoordenates 	=       FeatureTrack.prototype._getViewBoxCoordenates;
RegionFeatureTrack.prototype._getFeatureWidth 	=       FeatureTrack.prototype._getFeatureWidth;
//RegionFeatureTrack.prototype._updateTop 	=       FeatureTrack.prototype._updateTop;
RegionFeatureTrack.prototype.clear 	=       FeatureTrack.prototype.clear;
RegionFeatureTrack.prototype.drawBackground 	=       FeatureTrack.prototype.drawBackground;
RegionFeatureTrack.prototype.moveTitle 	=       FeatureTrack.prototype.moveTitle;
RegionFeatureTrack.prototype.moveY 	=       FeatureTrack.prototype.moveY;



RegionFeatureTrack.prototype.appendFeatures  = function(data){
	var features = data.toJSON();
	this.drawFeatures(features);
};


RegionFeatureTrack.prototype._addFeatures = function(data){
	/** features */
	this.features = data.toJSON();
	this.featuresIndex = new Object();
};

RegionFeatureTrack.prototype._updateTop = function(){
	
	var height = this.height;
	if (this.avoidOverlapping) {
		var originalHeight = this.height;
//		for ( var i = 0; i < this.queues.length; i++) {
//			height = height + this.queueHeight;
//		}
		height = this.featureHeight + (12 * this.queues.length);
	}
	
	if (this.maxHeight < height){
		this.maxHeight = height;
	}
	
	this.height = this.maxHeight;
	
	if(this.backgroundNode != null){
		this.backgroundNode.setAttribute("height", this.maxHeight);
	}
};

RegionFeatureTrack.prototype._setAttributes = function(feature){
	var attributes = [["id", this.id + "_" + feature.start + "_" + feature.id], ["font-size", feature.getDefault().args.fontSize]];
	
	attributes.push(["fill", "red"]);
	attributes.push(["opacity", "0.6"]);
	attributes.push(["stroke", "black"]);
	attributes.push(["stroke-width", "1"]);
	return attributes;
};

RegionFeatureTrack.prototype._setTextAttributes = function(feature){
	var color = this.getFeatureColor(feature);
	var attributes = [["fill", "black"],["id", this.id+"_" + feature.start], ["cursor", "pointer"],["font-size", feature.getDefault().args.fontSize]];
	return attributes;
};


RegionFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
//	if (this.positions[Math.ceil(startPoint)] != null){
//		console.log("Repedito " + feature.id );
//		return;
//	}
	
	this.positions[Math.ceil(startPoint)] = true;
	var nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), top, Math.abs(featureWidth) , Math.abs(this.featureHeight) , this.trackNodeGroup, attributes);
	if(this.label){
		var textSVG = SVG.drawText(Math.ceil(startPoint), (Math.ceil(top) + 2*this.featureHeight)-2 , feature.label, this.trackNodeGroup, this._setTextAttributes(feature));
		var _this = this;
		textSVG.addEventListener("click", function(){ _this.onClick.notify(feature);}, true);
	}
};



HistogramFeatureTrack.prototype.getIdToPrint =    FeatureTrack.prototype.getIdToPrint;
HistogramFeatureTrack.prototype.changeView =      FeatureTrack.prototype.changeView;
HistogramFeatureTrack.prototype.render =          FeatureTrack.prototype.render;
HistogramFeatureTrack.prototype.init =            FeatureTrack.prototype.init;
HistogramFeatureTrack.prototype.createSVGDom =    FeatureTrack.prototype.createSVGDom;
HistogramFeatureTrack.prototype._getTopText =     FeatureTrack.prototype._getTopText;
HistogramFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
HistogramFeatureTrack.prototype._searchSpace =    FeatureTrack.prototype._searchSpace;
HistogramFeatureTrack.prototype.drawTitle =       FeatureTrack.prototype.drawTitle;
HistogramFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
HistogramFeatureTrack.prototype.mouseclick =      FeatureTrack.prototype.mouseclick;
HistogramFeatureTrack.prototype.getById =         FeatureTrack.prototype.getById;
HistogramFeatureTrack.prototype.draw =            FeatureTrack.prototype.draw;
HistogramFeatureTrack.prototype.getFeatureColor = FeatureTrack.prototype.getFeatureColor;
HistogramFeatureTrack.prototype.drawFeatures =    FeatureTrack.prototype.drawFeatures;
HistogramFeatureTrack.prototype._overlapBlocks =  FeatureTrack.prototype._overlapBlocks;
HistogramFeatureTrack.prototype._render =       								FeatureTrack.prototype._render;
HistogramFeatureTrack.prototype._convertGenomePositionToPixelPosition = 		FeatureTrack.prototype._convertGenomePositionToPixelPosition;
HistogramFeatureTrack.prototype._getViewBoxCoordenates 	=       			FeatureTrack.prototype._getViewBoxCoordenates;
HistogramFeatureTrack.prototype._getFeatureWidth 	=       					FeatureTrack.prototype._getFeatureWidth;
HistogramFeatureTrack.prototype.clear 			=       					FeatureTrack.prototype.clear;
HistogramFeatureTrack.prototype.drawBackground  =          					FeatureTrack.prototype.drawBackground;
HistogramFeatureTrack.prototype.moveTitle 	=       FeatureTrack.prototype.moveTitle;
HistogramFeatureTrack.prototype.isFeatureDuplicated =    FeatureTrack.prototype.isFeatureDuplicated;
HistogramFeatureTrack.prototype.drawFeaturesInQueue 	=       FeatureTrack.prototype.drawFeaturesInQueue;


function HistogramFeatureTrack (rulerID,targetID, species, args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID, species, args);
	
	this.opacity = null;
	this.forceColor = null;
	this.intervalSize = 2000000;
	if (args != null){
		if (args.opacity != null){
			this.opacity = args.opacity;
		}
		
		if (args.forceColor != null){
			this.forceColor = args.forceColor;
		}
		
		if (args.intervalSize != null){
			this.intervalSize = args.intervalSize;
		}
		
	}
	this.positions = new Object();
	this.allowDuplicates = true;
//	this.counter = 0;
}

HistogramFeatureTrack.prototype.getFeaturesInterval  = function(features){
	var boxesFeatures = new Array();
	var size =this.intervalSize;
	
	if (features.length > 0){
		var start = features[0].start;
		var end = features[features.length -1].end;
		var position = start;
		
		while(position < end){
			boxesFeatures.push({start: position, end:position + size, value:0});
			position = position + size;
		}
		
		var boxIndex = 0;
		var max = 0;
		for ( var i = 0; i < features.length; i++) {
			for ( var j = boxIndex; j < boxesFeatures.length; j++) {
				if ((boxesFeatures[j].start < features[i].end)&&((boxesFeatures[j].end > features[i].start))){
					boxesFeatures[j].value = boxesFeatures[j].value + 1;
					if (boxesFeatures[j].value > max){
						max = boxesFeatures[j].value;
					}
					boxIndex = j;
				}
			}
		}
	}

	for ( var i = 0; i < boxesFeatures.length; i++) {
		boxesFeatures[i].value = boxesFeatures[i].value/max;
	}
	
	return boxesFeatures;
};


HistogramFeatureTrack.prototype.appendFeatures  = function(data){
//	var features = data.toJSON().sort(this.sort);
//	this.drawFeatures(this.getFeaturesInterval(features));
	
	var features = data.toJSON();
	this.drawFeatures(features);
};

HistogramFeatureTrack.prototype.sort = function(a, b){
	return a.start - b.start;
};

HistogramFeatureTrack.prototype._addFeatures = function(data){
//	this.features = data.toJSON().sort(this.sort);
//	this.features = this.getFeaturesInterval(this.features);
	this.featuresIndex = new Object();
	this.features = data.toJSON();
};

HistogramFeatureTrack.prototype._updateTop = function(){
	if (this.avoidOverlapping) {
		var originalHeight = this.height;
		for ( var i = 0; i < this.queues.length; i++) {
			this.height = this.height + this.featureHeight;
		}
	}
};

HistogramFeatureTrack.prototype._setAttributes = function(feature){
	var attributes = [["id", this.id + "_" + feature.start + "_" + feature.id]];
	if (this.forceColor != null){
		attributes.push(["fill", this.forceColor]);
	}
	else{
		attributes.push(["fill", "red"]);
	}
	return attributes;
};


HistogramFeatureTrack.prototype._setTextAttributes = function(feature){
	var attributes = [["fill", "black"],["id", this.id+"_" + feature.start], ["cursor", "pointer"]];
	return attributes;
};


HistogramFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
	var _this = this;
	if (featureWidth < 0){featureWidth = 2;}
	this.positions[Math.ceil(startPoint)] = true;
	
	var nodeSVG;
	if (feature.value == null){
		nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), top + (this.featureHeight - ( feature.value*Math.abs(this.featureHeight))), featureWidth , feature.value*Math.abs(this.featureHeight) , this.trackNodeGroup, attributes);
	}
	else{
		nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), top + (this.featureHeight - ( feature.value*Math.abs(this.featureHeight))), featureWidth , feature.value*Math.abs(this.featureHeight) , this.trackNodeGroup, attributes);
	}
	
	if (this.label){
		var textSVG = SVG.drawText(Math.ceil(startPoint) + 12, Math.ceil(top) + this.featureHeight , feature.label, this.labelNodeGroup, this._setTextAttributes(feature));
		textSVG.addEventListener("click", function(){ _this.onClick.notify(feature);}, true);
	}
	
};



VCFFeatureTrack.prototype.getIdToPrint = FeatureTrack.prototype.getIdToPrint;
VCFFeatureTrack.prototype.changeView = FeatureTrack.prototype.changeView;
VCFFeatureTrack.prototype.render = FeatureTrack.prototype.render;
VCFFeatureTrack.prototype.init = FeatureTrack.prototype.init;
VCFFeatureTrack.prototype.createSVGDom = FeatureTrack.prototype.createSVGDom;
VCFFeatureTrack.prototype._getTopText = FeatureTrack.prototype._getTopText;
VCFFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
VCFFeatureTrack.prototype._searchSpace = FeatureTrack.prototype._searchSpace;
VCFFeatureTrack.prototype.drawTitle = FeatureTrack.prototype.drawTitle;
VCFFeatureTrack.prototype.mouseMove = FeatureTrack.prototype.mouseMove;
VCFFeatureTrack.prototype.mouseclick = FeatureTrack.prototype.mouseclick;
VCFFeatureTrack.prototype.getById = FeatureTrack.prototype.getById;
VCFFeatureTrack.prototype.draw = FeatureTrack.prototype.draw;
VCFFeatureTrack.prototype.getFeatureColor = FeatureTrack.prototype.getFeatureColor;
VCFFeatureTrack.prototype.drawFeatures = FeatureTrack.prototype.drawFeatures;
VCFFeatureTrack.prototype._overlapBlocks = FeatureTrack.prototype._overlapBlocks;
VCFFeatureTrack.prototype._render = FeatureTrack.prototype._render;
VCFFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
VCFFeatureTrack.prototype._getViewBoxCoordenates = FeatureTrack.prototype._getViewBoxCoordenates;
VCFFeatureTrack.prototype._getFeatureWidth = FeatureTrack.prototype._getFeatureWidth;
VCFFeatureTrack.prototype.clear = FeatureTrack.prototype.clear;
VCFFeatureTrack.prototype.drawBackground = FeatureTrack.prototype.drawBackground;
VCFFeatureTrack.prototype.moveTitle = FeatureTrack.prototype.moveTitle;
VCFFeatureTrack.prototype._setAttributes = FeatureTrack.prototype._setAttributes;
VCFFeatureTrack.prototype._setTextAttributes = FeatureTrack.prototype._setTextAttributes;
VCFFeatureTrack.prototype._updateTop = FeatureTrack.prototype._updateTop;
//VCFFeatureTrack.prototype._drawFeature = FeatureTrack.prototype._drawFeature;
VCFFeatureTrack.prototype.drawFeaturesInQueue = FeatureTrack.prototype.drawFeaturesInQueue;
VCFFeatureTrack.prototype._renderLabel = FeatureTrack.prototype._renderLabel;

function VCFFeatureTrack(rulerID, targetID, args) {
	FeatureTrack.prototype.constructor.call(this, rulerID, targetID, args);


	/*if (args != null) {
	}*/
	
	this.positions = new Object();
	this.counter = 0;
	
	console.log(this.featureHeight);
}

VCFFeatureTrack.prototype.appendFeatures = function(data) {
	var features = data.toJSON();
	this.drawFeatures(features);
};

VCFFeatureTrack.prototype._addFeatures = function(data) {
	this.features = data.toJSON();
	this.featuresIndex = new Object();
};


VCFFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
	var _this = this;
	if (featureWidth <= 1) {
		featureWidth = 2;
	}
	this.positions[Math.ceil(startPoint)] = true;
	var nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), top , featureWidth, this.featureHeight, this.trackNodeGroup, attributes);
	
	
	if (feature.base != null){
		var snpLength = feature.base.length;
		var snpSize = featureWidth/snpLength;
		for ( var i = 0; i < snpLength; i++) {
			SVG.drawText((i*snpSize) + startPoint + 2 , Math.ceil(top) + 8, feature.base[i], this.labelNodeGroup, [["font-size", "8"],["fill", "#ffffff"]]);
		}
	}
	
	if (this.label) {
		this._renderLabel(Math.ceil(startPoint) ,  Math.ceil(top) + (this.featureHeight + this.labelHeight) , feature.label, this._setTextAttributes(feature), feature);
	}
};
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

