
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


