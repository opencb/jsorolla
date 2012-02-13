
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


