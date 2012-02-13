
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




