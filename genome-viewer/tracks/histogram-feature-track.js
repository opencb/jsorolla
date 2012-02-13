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



