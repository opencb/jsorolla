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
