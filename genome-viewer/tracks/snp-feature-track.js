
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






