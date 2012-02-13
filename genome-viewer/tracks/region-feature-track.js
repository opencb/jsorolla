
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



