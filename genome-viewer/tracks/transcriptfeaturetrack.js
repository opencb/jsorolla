function TranscriptFeatureTrack (rulerID,targetID,  args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID,  args);
	this.drawBlocks = true;
	this.sizeBetweenBlocks = 90;
	
}


TranscriptFeatureTrack.prototype.getIdToPrint =    FeatureTrack.prototype.getIdToPrint;
TranscriptFeatureTrack.prototype.changeView =      FeatureTrack.prototype.changeView;
TranscriptFeatureTrack.prototype.render =          FeatureTrack.prototype.render;
TranscriptFeatureTrack.prototype.init =            FeatureTrack.prototype.init;
TranscriptFeatureTrack.prototype.createSVGDom =    FeatureTrack.prototype.createSVGDom;
TranscriptFeatureTrack.prototype._getTopText =     FeatureTrack.prototype._getTopText;
TranscriptFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
TranscriptFeatureTrack.prototype._searchSpace =    FeatureTrack.prototype._searchSpace;
TranscriptFeatureTrack.prototype.drawTitle =       FeatureTrack.prototype.drawTitle;
TranscriptFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
TranscriptFeatureTrack.prototype.mouseclick =      FeatureTrack.prototype.mouseclick;
TranscriptFeatureTrack.prototype.getById =         FeatureTrack.prototype.getById;
TranscriptFeatureTrack.prototype.draw =            FeatureTrack.prototype.draw;
TranscriptFeatureTrack.prototype.getFeatureColor = FeatureTrack.prototype.getFeatureColor;
TranscriptFeatureTrack.prototype.drawFeatures =    FeatureTrack.prototype.drawFeatures;
TranscriptFeatureTrack.prototype._overlapBlocks =  FeatureTrack.prototype._overlapBlocks;
TranscriptFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
TranscriptFeatureTrack.prototype.mouseUp =      	 FeatureTrack.prototype.mouseUp;
TranscriptFeatureTrack.prototype.mouseClick =      FeatureTrack.prototype.mouseClick;
TranscriptFeatureTrack.prototype.mouseDown =       FeatureTrack.prototype.mouseDown;
TranscriptFeatureTrack.prototype._render =       FeatureTrack.prototype._render;
TranscriptFeatureTrack.prototype._addFeatures =       FeatureTrack.prototype._addFeatures;
TranscriptFeatureTrack.prototype._setAttributes = FeatureTrack.prototype._addFeatures;
TranscriptFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
TranscriptFeatureTrack.prototype._getFeatureWidth 	=       FeatureTrack.prototype._getFeatureWidth;

TranscriptFeatureTrack.prototype.addFeatures = function(data){
	this.drawFeatures(data[0]);
};


TranscriptFeatureTrack.prototype._addFeatures = function(data){
	/** features */
	this.features = data.toJSON()[0];
	this.featuresIndex = new Object();
};

TranscriptFeatureTrack.prototype._setAttributes = function(feature){
	var color = this.getFeatureColor(feature);
	var attributes = [["fill", color],["id", this.id+"_" + feature.start], ["font-size", "10"]];
	attributes.push(["opacity", "1"]);
	attributes.push(["stroke", "black"]);
	attributes.push(["stroke-width", "0.5"]);
	return attributes;
};

TranscriptFeatureTrack.prototype._setExonAttributes = function(feature){
	var color = this.getFeatureColor(feature);
	var attributes = [["fill", "red"],["id", this.id+"_" + feature.start], ["font-size", "10"]];
	attributes.push(["opacity", "1"]);
	attributes.push(["stroke", "black"]);
	attributes.push(["stroke-width", "0.5"]);
	return attributes;
};


TranscriptFeatureTrack.prototype.getFeatureColor = function(){
	return "orange";
};

TranscriptFeatureTrack.prototype._setTextAttributes = function(feature){
	var color = this.getFeatureColor(feature);
	var attributes = [["fill", "black"],["id", this.id+"_" + feature.start], ["font-size", this.titleFontSize]];
	attributes.push(["opacity", "1"]);
	return attributes;
};

TranscriptFeatureTrack.prototype._drawExon = function(startPoint, top, featureWidth, attributes, feature){
	
};


TranscriptFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
//	SVG.drawRectangle(Math.ceil(startPoint), Math.ceil(top + 1), featureWidth, this.featureHeight - 2, this.trackNodeGroup, attributes);
	
	
	if (feature.exon != null){
		
		
		var previousEnd = null;
		var heightLine = this.featureHeight/2;
		for ( var i = 0; i < feature.exon.length; i++) {
			
			var startPointExon = this._convertGenomePositionToPixelPosition(feature.exon[i].start);
			var featureWidthExon = this._getFeatureWidth(feature.exon[i]);//.end - features[i].start) * this.pixelRatio;
			
			SVG.drawRectangle(Math.ceil(startPointExon), Math.ceil(top), featureWidthExon, this.featureHeight, this.trackNodeGroup, this._setExonAttributes(feature.exon[i]));
			if (i == 0){
				var startPoint = this._convertGenomePositionToPixelPosition(feature.exon[i].start);
				SVG.drawText(Math.ceil(startPoint) + 3,  Math.ceil(top) + this.height - 2, feature.externalName, this.trackNodeGroup, this._setTextAttributes(feature));
				}
			else{
						SVG.drawLine(previousEnd, top + heightLine, Math.ceil(startPointExon), top + heightLine , this.trackNodeGroup, this._setExonAttributes(feature.exon[i]));
			}
			
			
			previousEnd = startPointExon + featureWidthExon;
		}
//		for ( var i = 0; i < feature.exon.length; i++) {
//			var startPoint = this._convertGenomePositionToPixelPosition(feature.exon[i].start);
//			var featureWidth = this._getFeatureWidth(feature.exon[i]);//.end - features[i].start) * this.pixelRatio;
//			SVG.drawRectangle(Math.ceil(startPoint), Math.ceil(top), featureWidth, this.featureHeight, this.trackNodeGroup, this._setExonAttributes(feature.exon[i]));
//		}
	}
};


