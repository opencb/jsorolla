
function RuleFeatureTrack (rulerID,targetID, species, args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID, species,  args);
	this.horizontalRuleDrawn = false;
	
//	this.pixelRatio = 0.001;
	this.ruleHeight = this.height;
	this.expandRuleHeight = this.height;
	/** Estos attributos tb tedeberia de tenerlo su dataadapter **/
//	this.space = 100;
//	this.maxChromosomeSize = 255000000;
//	this.ratio = this.space / this.pixelRatio; 	
	
	this.horizontalRuleTop = this.height - 2;
	
	if (args != null){
		if (args.expandRuleHeight != null){
			this.ruleHeight = args.expandRuleHeight;
		}
		
		if (args.space != null){
			this.space = args.space;
		}
	}

//	this.start = this.start - ((this.end - this.start) * 4);
//	this.end = this.end + ((this.end - this.start) * 4);
//	
	this.allowDuplicates = true;
	this.quarter = (this.end - this.start)/4;
	
	
	this.selectedMiddleLine = null;
	
}

RuleFeatureTrack.prototype.getIdToPrint =    FeatureTrack.prototype.getIdToPrint;
RuleFeatureTrack.prototype.render =          FeatureTrack.prototype.render;
RuleFeatureTrack.prototype._getTopText =     FeatureTrack.prototype._getTopText;
RuleFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
RuleFeatureTrack.prototype._searchSpace =    FeatureTrack.prototype._searchSpace;
RuleFeatureTrack.prototype.drawTitle =       FeatureTrack.prototype.drawTitle;
RuleFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
RuleFeatureTrack.prototype.mouseclick =      FeatureTrack.prototype.mouseclick;
RuleFeatureTrack.prototype.getById =         FeatureTrack.prototype.getById;
RuleFeatureTrack.prototype.draw =            FeatureTrack.prototype.draw;
RuleFeatureTrack.prototype.drawFeatures =    FeatureTrack.prototype.drawFeatures;
RuleFeatureTrack.prototype._overlapBlocks =  FeatureTrack.prototype._overlapBlocks;
RuleFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
RuleFeatureTrack.prototype.mouseUp =      	 FeatureTrack.prototype.mouseUp;
RuleFeatureTrack.prototype.mouseClick =      FeatureTrack.prototype.mouseClick;
RuleFeatureTrack.prototype.mouseDown =       FeatureTrack.prototype.mouseDown;
RuleFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
RuleFeatureTrack.prototype._render =       FeatureTrack.prototype._render;
RuleFeatureTrack.prototype._getFeatureWidth 	=       FeatureTrack.prototype._getFeatureWidth;
//RuleFeatureTrack.prototype.addFeatures 	=       FeatureTrack.prototype.addFeatures;
RuleFeatureTrack.prototype._updateTop 	=       FeatureTrack.prototype._updateTop;
RuleFeatureTrack.prototype.drawBackground 	=       FeatureTrack.prototype.drawBackground;
RuleFeatureTrack.prototype.isFeatureDuplicated 	=       FeatureTrack.prototype.isFeatureDuplicated;
RuleFeatureTrack.prototype.clear 	=       FeatureTrack.prototype.clear;
RuleFeatureTrack.prototype.init 	=       FeatureTrack.prototype.init;
RuleFeatureTrack.prototype.createSVGDom 	=       FeatureTrack.prototype.createSVGDom;
RuleFeatureTrack.prototype.moveY 	=       FeatureTrack.prototype.moveY;
RuleFeatureTrack.prototype._setAttributes 	=       FeatureTrack.prototype._setAttributes;
RuleFeatureTrack.prototype.moveTitle 	=       FeatureTrack.prototype.moveTitle;
RuleFeatureTrack.prototype.drawFeaturesInQueue 	=       FeatureTrack.prototype.drawFeaturesInQueue;


RuleFeatureTrack.prototype.appendFeatures = function(features){
	this.drawFeatures(features.toJSON());
};

RuleFeatureTrack.prototype._addFeatures = function(data){
	this.features =  data.toJSON();//this._getFeaturesFromRegion(this.start, this.end);//new Array();
	this.horizontalRuleDrawn = false;
};


RuleFeatureTrack.prototype.getFeatureColor = function(feature){
	return "#000000";
};


RuleFeatureTrack.prototype.select = function(midlle, args){
	var widthLine = 1;
	if (args != null){
		if (args.width != null){
			widthLine = args.width;
		}
		
	}
	
	if (this.selectedMiddleLine != null){
		this.selectedMiddleLine.parentNode.removeChild(this.selectedMiddleLine);
	}
	
	if (this.textMiddleLine != null){
		this.textMiddleLine.parentNode.removeChild(this.textMiddleLine);
	}
	
	if( this.trackNodeGroup != null){
	
		var attributes = [["fill", "green"],["stroke-width", "1"], ["opacity",0.5]];
		var coordenateX = this._convertGenomePositionToPixelPosition(midlle);
//		this.selectedMiddleLine = SVG.drawLine(Math.ceil(coordenateX),  this.top + this.horizontalRuleTop, Math.ceil(coordenateX), this.ruleHeight + 10000, this.trackNodeGroup, attributes);
		this.selectedMiddleLine = SVG.drawRectangle((coordenateX)  ,  this.top + this.horizontalRuleTop, widthLine, this.ruleHeight + 10000, this.trackNodeGroup, attributes);
		this.textMiddleLine = SVG.drawText(Math.ceil(coordenateX) - 15, this.top + this.horizontalRuleTop, this._prettyNumber(midlle), this.trackNodeGroup, [["font-size", "9"], ["fill", "green"]]);
	}
};


RuleFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
	if (this.trackNodeGroup != null){
		if (feature.isLabeled){
			SVG.drawText(Math.ceil(startPoint) + 2, top + 10 , this._prettyNumber(feature.start), this.labelNodeGroup, [["font-size", "10"]]);
			SVG.drawLine(Math.ceil(startPoint), top, Math.ceil(startPoint), this.ruleHeight + 10000, this.trackNodeGroup, [["stroke", "#000000"], ["opacity",feature.getDefault().getOpacity()]]);
		}
		else{
			//Es una linea divisoria
			SVG.drawLine(Math.ceil(startPoint),  top + this.horizontalRuleTop, Math.ceil(startPoint), this.ruleHeight + 10000, this.trackNodeGroup, [["stroke", "#000000"], ["opacity",feature.getDefault().getOpacity()]]);
		}
		
		if (!this.horizontalRuleDrawn){
			var lastPositionRec = this.viewBoxModule;
			if ((260000000*this.pixelRatio) < this.viewBoxModule){
				lastPositionRec = 260000000*this.pixelRatio;
			} 
			SVG.drawRectangle(0, top, lastPositionRec, this.height, this.trackNodeGroup, [["fill", "gray"], ["stroke", "#000000"], ["opacity", 0.5]]);
			this.horizontalRuleDrawn = true;
		}
	}
	

};

RuleFeatureTrack.prototype._prettyNumber = function addCommas(nStr){
	nStr = Math.ceil(nStr)+ '';
//	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
};

