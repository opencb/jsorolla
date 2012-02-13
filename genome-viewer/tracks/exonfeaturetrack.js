
function ExonFeatureTrack (rulerID,targetID,  args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID,  args);
	this.drawBlocks = true;
	this.sizeBetweenBlocks = 90;
	
}


ExonFeatureTrack.prototype.getIdToPrint =    FeatureTrack.prototype.getIdToPrint;
ExonFeatureTrack.prototype.changeView =      FeatureTrack.prototype.changeView;
ExonFeatureTrack.prototype.render =          FeatureTrack.prototype.render;
ExonFeatureTrack.prototype.init =            FeatureTrack.prototype.init;
ExonFeatureTrack.prototype.createSVGDom =    FeatureTrack.prototype.createSVGDom;
ExonFeatureTrack.prototype._getTopText =     FeatureTrack.prototype._getTopText;
ExonFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
ExonFeatureTrack.prototype._searchSpace =    FeatureTrack.prototype._searchSpace;
ExonFeatureTrack.prototype.drawTitle =       FeatureTrack.prototype.drawTitle;
ExonFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
ExonFeatureTrack.prototype.mouseclick =      FeatureTrack.prototype.mouseclick;
ExonFeatureTrack.prototype.getById =         FeatureTrack.prototype.getById;
ExonFeatureTrack.prototype.draw =            FeatureTrack.prototype.draw;
ExonFeatureTrack.prototype.getFeatureColor = FeatureTrack.prototype.getFeatureColor;
ExonFeatureTrack.prototype.drawFeatures =    FeatureTrack.prototype.drawFeatures;
ExonFeatureTrack.prototype._overlapBlocks =  FeatureTrack.prototype._overlapBlocks;
ExonFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
ExonFeatureTrack.prototype.mouseUp =      	 FeatureTrack.prototype.mouseUp;
ExonFeatureTrack.prototype.mouseClick =      FeatureTrack.prototype.mouseClick;
ExonFeatureTrack.prototype.mouseDown =       FeatureTrack.prototype.mouseDown;
ExonFeatureTrack.prototype._render =       FeatureTrack.prototype._render;
ExonFeatureTrack.prototype._addFeatures =       FeatureTrack.prototype._addFeatures;
ExonFeatureTrack.prototype._setAttributes = FeatureTrack.prototype._addFeatures;
ExonFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
ExonFeatureTrack.prototype._getFeatureWidth 	=       FeatureTrack.prototype._getFeatureWidth;

ExonFeatureTrack.prototype.addFeatures = function(data){
	this.drawFeatures(data[0]);
};


ExonFeatureTrack.prototype._addFeatures = function(data){
	/** features */
	this.features = data.toJSON()[0];
	this.featuresIndex = new Object();
};

ExonFeatureTrack.prototype._setAttributes = function(feature){
	var color = this.getFeatureColor(feature);
	var attributes = [["fill", color],["id", this.id+"_" + feature.start], ["font-size", "10"]];
	attributes.push(["opacity", "1"]);
	attributes.push(["stroke", "black"]);
	attributes.push(["stroke-width", "0.5"]);
	return attributes;
};



ExonFeatureTrack.prototype.getFeatureColor = function(){
	return "red";
};

ExonFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
	var nodeSVG	 = SVG.drawRectangle(Math.ceil(startPoint), Math.ceil(top), featureWidth, this.featureHeight, this.trackNodeGroup, attributes);
	
	var _this = this;
	nodeSVG.addEventListener("mouseover", function(){ console.log(feature);}, false);
};


