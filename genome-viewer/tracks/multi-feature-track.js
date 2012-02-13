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
