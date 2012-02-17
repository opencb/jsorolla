function TrackCanvas(trackerID, targetNode, args) {
	/** Groups and layers */
	this.tracksGroup = null;

	/** target */
	this.targetID = targetNode.id;

	this.args = args;

	/** Coordenates with default Setting */
	this.top = 0;
	this.left = 100;
	this.right = 900;
	this.width = 1100;
	this.height = 50;

	/** real start and end */
	this.startViewBox = args.start;
	this.endViewBox = args.end;

	/** Tracks **/
	this.trackList = new Array();
	this.trackRendered = new Array();
	this.trackRenderedName = new Array();
	
	this.regionAdapterList = new Array();

	/** Pixel Ratio and zoom **/
	this.pixelRatio = 5;
	this.zoom = 1;
	this.viewBoxModule = 700;

	/** Dragging **/
	this.allowDragging = false;
	this.isDragging = false;
	this.dragPoint = null;

	/** Optional parameters */
	this.backgroundColor = "#FFFFFF";
	this.titleColor = "#000000";
	this.overflow = false;

	/** Optional parameters: title */
	this.title = false;
	this.titleName = null;
	this.titleFontSize = 10;
	
	/** Y moving ***/
	this.enableMovingY = false;
	
	/** Moving canvas provoke que los tracks con el flag showLabelsOnMiddleMarker se muevan **/
	this.allowLabelMoving = true;
	
	/** Flag to solver marker bug */
	this.isBeenRenderized = true; /** true si estoy renderizando por primera vez el trackcanvas **/
	/** Processing optional parameters */
	if (args != null) {
		if (args.top != null) {
			this.top = args.top;
		}
		if (args.left != null) {
			this.left = args.left;
		}
		if (args.right != null) {
			this.right = args.right;
		}
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.backgroundColor != null) {
			this.backgroundColor = args.backgroundColor;
		}
		if (args.titleFontSize != null) {
			this.titleFontSize = args.titleFontSize;
		}
		if (args.allowDragging != null) {
			this.allowDragging = args.allowDragging;
		}
		if (args.titleColor != null) {
			this.titleColor = args.titleColor;
		}
		if (args.title != null) {
			this.title = true;
			this.titleName = args.title;
		}
		if (args.overflow != null) {
			this.overflow = args.overflow;
		}
		if (args.pixelRatio != null) {
			this.pixelRatio = args.pixelRatio;
		}
		if (args.viewBoxModule != null) {
			this.viewBoxModule = args.viewBoxModule;
		}
		if (args.zoom != null) {
			this.zoom = args.zoom;
		}
	}

	/** Info Panel */
	this.textLines = new Array();

	/** id manage */
	this.id = trackerID;
	this.idMain = this.id + "_Main";
	this.moveY = 0;
//	this.ruleTracks = new Array();

	/** Events */
//	this.click = new Event(this);//NOT USED
//	this.selecting = new Event(this);//NOT USED
	this.onMove = new Event(this);
	this.afterDrag = new Event(this);
	this.onRender = new Event(this);

};

TrackCanvas.prototype.createSVGDom = function(targetID, id, width, height, backgroundColor) {
	var container = DOM.select(targetID);
	this._svg = SVG.createSVGCanvas(container, [
	        [ "viewBox", "0 10 " + this.width + " " + this.height ],
			[ "preserveAspectRatio", "none" ], [ "id", id ],
			[ "height", this.height ], [ "width", this.width ] , [ "background-color", "green" ]]);

	/** Creating groups **/
	this.tracksGroup = SVG.drawGroup(this._svg, [ [ "id", this.idMain ],[ "transform", "scale(" + this.zoom + ")" ] ]);
	
	SVG.drawRectangle(0,0, this.viewBoxModule, this.height, this.tracksGroup, [["fill", "white"]]);
	return this._svg;
};

TrackCanvas.prototype.mouseClick = function(event) {
	alert("click");
};
TrackCanvas.prototype.mouseMove = function(event) {
	if (this.allowDragging){
		this._dragging(event);
		
		this.moveLabelsFeatureSelected();
	}
};

TrackCanvas.prototype.moveLabelsFeatureSelected = function() {
	
	if (this.allowLabelMoving){
		for ( var i = 0; i < this.trackList.length; i++) {
			if(this.trackList[i].showLabelsOnMiddleMarker){
				this.trackList[i].drawLabelAtPosition(this.getMiddlePoint(), this.regionAdapterList[i].getFeaturesByPosition(this.getMiddlePoint()));
			}
		}
	}
};

TrackCanvas.prototype.mouseDown = function(event) {
	if (this.allowDragging){
		this._startDragging(event);
	}
};
TrackCanvas.prototype.mouseUp = function(event) {
	if (this.allowDragging){
		this._afterDrag(event);
		
	}
	
	
	
	
	
};

TrackCanvas.prototype.init = function() {
	this._svg = this.createSVGDom(this.targetID, this.id, this.width, this.height, this.backgroundColor);

	/** SVG Events listener */
	var _this = this;
	//	this._svg.addEventListener("click", function(event) {_this.mouseClick(event); }, false);
	this._svg.addEventListener("mousemove", function(event) {
		_this.mouseMove(event, _this);
	}, false);
	this._svg.addEventListener("mousedown", function(event) {
		_this.mouseDown(event, _this);
	}, false);
	this._svg.addEventListener("mouseup", function(event) {
		_this.mouseUp(event, _this);
	}, false);
	
//	this._svg.addEventListener("mouseout", function(event) {
//		_this.mouseUp(event, _this);
//	}, false);
	


};

TrackCanvas.prototype._getTrackFromInternalRegionId = function(internalRegionId) {
	for ( var i = 0; i < this.regionAdapterList.length; i++) {
		if (this.regionAdapterList[i] != null) {
			if (this.regionAdapterList[i].internalId == internalRegionId) {
				return this.trackList[i];
			}
		}
	}
	return null;
};

TrackCanvas.prototype._formatData = function(regionAdapter) {
	/** DAS  **/
	if (regionAdapter instanceof DasRegionDataAdapter) {
		console.log("regionAdapter instanceof DasRegionDataAdapter");
//		var formatters = new ArrayRegionCellBaseDataAdapter();
//		for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
//			formatters.push(new DASFeatureFormatter(regionAdapter.dataset.json[0][i]));
//		}
//		regionAdapter.dataset.json = formatters;
	}
	
	
	if (regionAdapter instanceof GeneRegionCellBaseDataAdapter) {
		var geneBlockManager = new GeneBlockManager();
		regionAdapter.dataset.json = geneBlockManager.toDatasetFormatter(regionAdapter.dataset.json);
	}

	
	/** VCF  **/
	if (regionAdapter instanceof VCFLocalRegionDataAdapter) {
		var formatters = new Array();
		for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
			formatters.push(new VCFFeatureFormatter(regionAdapter.dataset.json[0][i]));
		}
		regionAdapter.dataset.json = formatters;
	}
	
	/** GFF **/
	if (regionAdapter instanceof GFFLocalRegionDataAdapter) {
		var formatters = new Array();
		for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
			formatters.push(new GFFFeatureFormatter(regionAdapter.dataset.json[0][i]));
		}
		regionAdapter.dataset.json = formatters;
	}
	
	/** BED **/
	if (regionAdapter instanceof BEDLocalRegionDataAdapter) {
		var formatters = new Array();
		for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
			formatters.push(new BEDFeatureFormatter(regionAdapter.dataset.json[0][i]));
		}
		regionAdapter.dataset.json = formatters;
	}

	/** RULE  **/
	if (regionAdapter instanceof RuleRegionDataAdapter) {
		var formatters = new Array();
		for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
			formatters.push(new MarkerRuleFeatureFormatter(regionAdapter.dataset.json[0][i]));
		}
		regionAdapter.dataset.json = formatters;
	}
	
	if (regionAdapter instanceof RegionCellBaseDataAdapter) {
		var formatters = new Array();

		if (regionAdapter.resource.toLowerCase().indexOf("histogram=true") != -1){
			return regionAdapter;
		}
		
		if (regionAdapter.resource == "gene") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new GeneFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "tfbs") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new TfbsFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "mirnatarget") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new MiRNAFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "regulatory?type=open chromatin") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new GenericFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "regulatory?type=HISTONE") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new GenericFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "regulatory?type=Polymerase") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new GenericFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		

		if (regionAdapter.resource == "snp") {

			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new SNPFeatureFormatter(
						regionAdapter.dataset.json[0][i]));
			}
		}

		if (regionAdapter.resource == "cytoband") {

			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new CytobandFeatureFormatter(
						regionAdapter.dataset.json[0][i]));
			}
		}

		if (regionAdapter.resource == "transcript") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new TranscriptFeatureFormatter(
						regionAdapter.dataset.json[0][i]));
			}
		}

		if (regionAdapter.resource == "exon") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new ExonFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}

		if (regionAdapter.resource == "conservedregion") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new GenericFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "sequence") {
			var formatters = new Array();

			for ( var i = 0; i < regionAdapter.dataset.json[0].sequence.length; i++) {
				var pos = (regionAdapter.dataset.json[0].start + i) + 1;
				formatters.push(new SequenceFormatter( {
					"start" : pos,
					"end" : pos,
					"base" : regionAdapter.dataset.json[0].sequence[i]
				}));
			}
		}
		regionAdapter.dataset.json = formatters;
	}
	
	return regionAdapter;
};

TrackCanvas.prototype._trackRendered = function() {
	for ( var i = 0; i < this.trackRendered.length; i++) {
		if (this.trackRendered[i] == false) {
			this.trackRendered[i] = true;
			return;
		}
	}
};

TrackCanvas.prototype._areAllTracksRendered = function() {
	for ( var i = 0; i < this.trackRendered.length; i++) {
		if (this.trackRendered[i] == false) {
			return false;
		}
	}
	return true;
};

TrackCanvas.prototype._drawTrack = function(chromosome, start, end, track, regionAdapter) {
		var _this = this;
		track.viewBoxModule = this.viewBoxModule;
	
		if (track.isAvalaible){
			regionAdapter.successed.addEventListener(function(evt, data) {
				 _this._formatData(regionAdapter);
				 
				/** trackRender es una array donde indico con true/track ha sido renderizado o false que no lo ha sido
				 * de esta manera controlo cuando todos los track hayan sido renderizados porder dibujar la regla **/
				_this.trackRenderedName.push(regionAdapter);
				_this._trackRendered();

				/** Si todos han sido rendrizados dibujo la regla **/
				if (_this._areAllTracksRendered()) {
					_this.drawRules(chromosome, start, end);
				}
				
			});
			regionAdapter.preloadSuccess.addEventListener(function(evt, data) {
				var track = _this._getTrackFromInternalRegionId(evt.internalId);
				regionAdapter = _this._formatData(regionAdapter);

				track.appendFeatures(regionAdapter.dataset);
	
			});
	
			this.onMove.addEventListener(function(evt, data) {
				data.middle = Math.ceil(data.middle) + 1;
				regionAdapter.setIntervalView(chromosome, Math.ceil(data.middle));
				if (regionAdapter instanceof RuleRegionDataAdapter){
					_this.selectPaintOnRules(data.middle);
				}
				
				
			});
//			console.log("trackerID"+track.trackerID+"  "+regionAdapter.resource);
//			console.log(track);
			regionAdapter.fill(chromosome, start, end, regionAdapter.resource);
		}
		else{
			_this.trackRenderedName.push(regionAdapter);
			_this._trackRendered();
		}
};

TrackCanvas.prototype.selectPaintOnRules = function(middle) {
	for ( var i = 0; i < this.getRuleTracks().length; i++) {
		if (this.pixelRatio < 1){
			this.getRuleTracks()[i].select(middle);
		}
		else{
			this.getRuleTracks()[i].select(middle, {width:this.pixelRatio});
		}
	}
};

TrackCanvas.prototype.getRuleTracks = function(middle) {
	var rules = new Array();
	for ( var i = 0; i < this.trackList.length; i++) {
		if (this.trackList[i] instanceof RuleFeatureTrack){
			rules.push(this.trackList[i]);
		}
	}
	return rules;
};

TrackCanvas.prototype.getMiddlePoint = function() {
	return Math.ceil(this.middle) + 1;
};

TrackCanvas.prototype.drawRules = function(chromosome, start, end) {
	for ( var i = 0; i < this.trackList.length; i++) {
			var top = this._getTopTrack(this.trackList[i]);
			this.trackList[i].draw(this.regionAdapterList[i].dataset,this.tracksGroup, top);
			this._drawTitle(i);
	}
	this._goToCoordinateX(this.start);
	this.onRender.notify();
};

TrackCanvas.prototype._drawTitle = function(i) {
//			var top = this._getTopTrack(this.trackList[i]);
			if (this.trackList[i].title != null) {
				var middle = this.start + ((this.width / this.pixelRatio) / 2);
				if (middle == null) {
					this.trackList[i].drawTitle(10);
				} 
				else {
					var left = (this.width / 2) / this.pixelRatio;
					this.trackList[i].drawTitle(middle - left + 1 );
				}
			}
};


TrackCanvas.prototype.draw = function(chromosome, start, end) {
	this.start = start;
	this.end = end;
	this.chromosome = chromosome;
	this.startViewBox = (start * this.pixelRatio) % this.viewBoxModule;
	this.endViewBox = (end * this.pixelRatio) % this.viewBoxModule;

	for ( var i = 0; i < this.regionAdapterList.length; i++) {
			var track = this.trackList[i];
			var regionAdapter = this.regionAdapterList[i];
			regionAdapter.successed = new Event(regionAdapter);
			regionAdapter.preloadSuccess = new Event(regionAdapter);
			this._drawTrack(chromosome, start, end, track, regionAdapter);
	}
};

TrackCanvas.prototype.clear = function() {
	DOM.removeChilds(this.targetID);
};

TrackCanvas.prototype.addTrack = function(track, regionDataAdapter) {
	this.trackList.push(track);
	this.trackRendered.push(false);
	this.regionAdapterList.push(regionDataAdapter);
};



TrackCanvas.prototype._getTopTrack = function(track) {
	var top = this.top;
	for ( var i = 0; i < this.trackList.length; i++) {
		if (this.trackList[i].internalId == track.internalId) {
			return top + this.trackList[i].top;
		}
		top = top + this.trackList[i].height + this.trackList[i].originalTop;
	}
	return top;
};


/** DRAGGING **/
TrackCanvas.prototype._goToCoordinateX = function(position) {
	this.start = position;
	var startZoom = (this.start * this.pixelRatio) % this.viewBoxModule;
	var viewBox = startZoom + " " + "10 " + this.width + " " + this.height;
	this._svg.setAttribute("viewBox", viewBox);

	/** He cambiado esto por el slave **/
	if (this.isBeenRenderized){
		this.middle = this.start + (this.end - this.start)/2;
		this.isBeenRenderized = false;
	}
	else{
		this.middle = this.start + ((this.width / this.pixelRatio) / 2);
	}

	this.onMove.notify( {
		"chromosome" : this.chromosome,
		"start" : this.start,
		"end" : this.end,
		"middle" : this.middle
	});

};

TrackCanvas.prototype._moveCoordinateX = function(move) {
	for ( var i = 0; i < this.trackList.length; i++) {
		if ((this.trackList[i].title) != null) {
//			if (parseFloat(this.pixelRatio) < 1){
				this.trackList[i].moveTitle(-move);
//			}
//			else{
//				this._drawTitle(i);
//			}
		}
	}

	var newStart = move / this.pixelRatio;
	this._goToCoordinateX(Math.ceil(this.start + newStart));
};

TrackCanvas.prototype._moveCoordinateY = function(move) {
	var realMove = (-1 * move) + this.moveY;
	if (realMove < this.top) {
		this.tracksGroup.setAttribute("transform", "translate(0, " + realMove+ ")");
		this.realMove = realMove;

		for ( var i = 0; i < this.trackList.length; i++) {
			if (this.trackList[i].floating){
				this.trackList[i].moveY(-realMove);
			}
		}
	} else {
		this.realMove = 0;
	}
};

TrackCanvas.prototype._startDragging = function(evt) {
	this.isDragging = true;
	var point = this._getSVGCoordenates(evt);
	this.dragPoint = {
		"x" : point.x,
		"y" : point.y
	};
};

TrackCanvas.prototype._afterDrag = function(evt) {
	this.isDragging = false;
	this.dragPoint = null;
	this.moveY = this.realMove;
	this.afterDrag.notify(this.middle);
	
	
	
};

TrackCanvas.prototype.setZoom = function(zoom) {
	this.zoom = zoom;
	this.tracksGroup.setAttribute("transform", "scale(" + zoom + ")");
	this._goToCoordinateX(this.startViewBox);
};

TrackCanvas.prototype._dragging = function(evt) {
	if (this.isDragging) {
		var actualPointSVG = this._getSVGCoordenates(evt);
		
		var moveX = this.dragPoint.x - actualPointSVG.x;
		var moveY = this.dragPoint.y - actualPointSVG.y;
		
		this._moveCoordinateX(moveX);
		if(this.enableMovingY){
			this._moveCoordinateY(Math.ceil(moveY));
		}
	}

};

/** SVG COORDENATES **/
TrackCanvas.prototype._getSVGCoordenates = function(evt) {
	var p = this._svg.createSVGPoint();
	p.x = evt.clientX;
	p.y = evt.clientY;

	var m = this._svg.getScreenCTM(document.documentElement);
	p = p.matrixTransform(m.inverse());
	return p;
};

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




// JavaScript Document
function Track(trackerID, targetNode,  args) {
	this.args = args;
	
	/** Groups and layers */
	this.trackNodeGroup = null;
	this.mainNodeGroup = null;
	this.labelNodeGroup = null;
	
	this.internalId = Math.round(Math.random()*10000000); // internal id for this class
	
	/** target */
    if(targetNode != null){
            this.targetID = targetNode.id;
    }

	
    
	/** Coordenates with default Setting */
	this.top = 0;
	this.left = 100;
	this.right = 900;
	this.width = 1100;
	this.height = 50;
	this.originalTop = this.top;
	this.originalHeight = this.height;
	
	/** Max height para los tracks que aunmentan el height dinamicamente cargando las features **/
	this.maxHeight = this.height;
	
	/** real start and end */
	if (args != null){
		this.start = args.start;
		this.end = args.end;
	}
	else{
		this.start = 0;
	}

	/** pixelPerposition **/
	this.pixelRatio = 5; /** it means 1 position it is represented using 5 pixels **/
	
	/** Optional parameters */
	this.backgroundColor = "#FFFFFF";
	this.titleColor = "#000000";
	this.overflow = false;
	
	/** Optional parameters: title */
	this.title  = null;
	this.titleName = null;
	this.titleFontSize = 10;
	this.titleWidth = 50;
	this.titleHeight = 12;
	this.floating = false;
	this.repeatLabel = null; /** es un float que indica cada cuantos pixeles se va a repetir la label sobre el track **/
	
	this.isAvalaible = true; /** Si el track no puede mostrarse a cierta resolucion isAvalaible pasa a ser falso y dibujariamos solamnente el titulo**/
	this.isNotAvalaibleMessage = "This level of zoom isn't appropiate for this track";
	
	
	this.labelFontSize = null;
	
	/** Processing optional parameters */
	if (args!=null){
		if (args.left!=null){
			this.left = args.left;		
		}
		
		if (args.top!=null){
			this.top = args.top;	
			this.originalTop = this.top;
		}
		if (args.left!=null){
			this.left = args.left;		
		}
		
		if (args.right!=null){
			this.right = args.right;		
		}
		if (args.width!=null){
			this.width = args.width;		
		}
		if (args.floating!=null){
			this.floating = args.floating;		
		}
		if (args.height!=null){
			this.height = args.height;	
			this.originalHeight = args.height;
			this.maxHeight = args.height;
		}
		if (args.backgroundColor!=null){
			this.backgroundColor = args.backgroundColor;		
		}
		
		if (args.titleWidth!=null){
			this.titleWidth = args.titleWidth;		
		}
		if (args.titleFontSize!=null){
			this.titleFontSize = args.titleFontSize;		
		}
		if (args.titleHeight!=null){
			this.titleHeight = args.titleHeight;		
		}
		if (args.titleColor != null){
			this.titleColor = args.titleColor;	
		}
		if (args.title != null){
			this.title = true;
			this.titleName = args.title;
		}
		if (args.overflow != null){
			this.overflow = args.overflow;
		}
		if (args.pixelRatio != null){
			this.pixelRatio = args.pixelRatio;
		}
		if (args.labelFontSize != null){
			this.labelFontSize = args.labelFontSize;
		}
		
		if (args.repeatLabel != null){
			this.repeatLabel = args.repeatLabel;
		}
		
		if (args.isAvalaible!=null){
			this.isAvalaible = args.isAvalaible;		
		}
		if (args.isNotAvalaibleMessage!=null){
			this.isNotAvalaibleMessage = args.isNotAvalaibleMessage;		
		}
	}
	
	/** id manage */
	this.id = trackerID;	
	this.idTrack = this.id + "_Features";
	this.idNames = this.id + "_Names";
	this.idMain = this.id + "_Main";
	this.idBackground = this.id + "_background";
	this.idTitleGroup = this.id + "_title_group";
	/** Events */
	this.click = new Event(this);
	
};

//Track.prototype._getViewBoxCoordenates = function() {
//	return 0 +" " +  "10 " + this.width + " " + this.height;
//};
//
//Track.prototype._goToCoordinate = function(start) {
//	var viewBox =   (start * this.pixelRatio) +" " +  "10 " + this.width + " " + this.height;
//	this._svg.setAttribute("viewBox", viewBox);108,447,501

//};

Track.prototype._getViewBoxCoordenates  = function(id, width, height, backgroundColor ) {
	return "0 10 " + this.width  + " " + this.height;
};

Track.prototype.createSVGDom = function(id, width, height, backgroundColor ) {
	/** Si es null es porque estamos usando el track en modo standalone sin trackCanvas **/
	if (this._svg == null){
		this._svg = SVG.createSVGCanvas(DOM.select(this.targetID), [["viewBox", this._getViewBoxCoordenates()],["preserveAspectRatio", "none"],["id", id], ["height", this.height], ["width", this.width]]);
	}
	
	/** Creating groupds **/
	this.mainNodeGroup = SVG.drawGroup(this._svg, [["id", this.idMain]]);
	this.backgroundNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idBackground]]);
	this.trackNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idTrack]]);
	this.labelNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idNames]]);
	this.titleNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idTitleGroup]]);
	
	/** background rectangle for giving colors **/
//	var rect = SVG.drawRectangle(0, this.top, this.width , this.height, this.backgroundNodeGroup, [["fill", backgroundColor],[id, id + "_background"]]);
	this.drawBackground();
	return this._svg;
};

Track.prototype.drawBackground = function() {
//	var rect = SVG.drawRectangle(0, this.top, this.width , this.height, this.backgroundNodeGroup, [["fill", this.backgroundColor],[id, id + "_background"]]);
//	this.backgroundNode =  SVG.drawRectangle(0, this.top, this.viewBoxModule , this.height, this.backgroundNodeGroup, [["stroke", "#000000"],["opacity", 0.5],["fill", this.backgroundColor],[id, id + "_background"]]);
};

Track.prototype.getBackgroundNode = function() {
	return this.backgroundNode;
};


Track.prototype.init = function(){
	this._svg = this.createSVGDom(this.id, this.width, this.height, this.backgroundColor);
	
	/** SVG Events listener */
	var _this = this;

};

Track.prototype.clear = function(){
	if(this.mainNodeGroup != null){
		 while (this.mainNodeGroup.childNodes.length>0){
		 	this.mainNodeGroup.removeChild(this.mainNodeGroup.childNodes[0]);
	    }
	}
};

/** SVG COORDENATES **/
Track.prototype._getSVGCoordenates = function(evt){
	var p = this._svg.createSVGPoint();
    p.x = evt.clientX;
    p.y = evt.clientY;
    
    var m = this._svg.getScreenCTM(document.documentElement);
    p = p.matrixTransform(m.inverse());
    return p;
};

function MultiFeatureTrack (rulerID,targetID, species, args) {
	FeatureTrack.prototype.constructor.call(this, rulerID,targetID, species, args);
	
	this.queueHeight = 14;
	this.pixelSpaceBetweenBlocks = 80;
	this.showTranscripts = true;
	this.avoidOverlapping = true;
	
	this.showDetailGeneLabel = false;
	
	this.showExonLabel = false;
	this.onMouseOverShitExonTranscriptLabel = false;
	
	this.extraSpaceProducedByLabelAbove = 6;
	
	this.geneBlockManager = null;
	
	this.labelHeight = 12;
	this.separatorBetweenQueue = 4;
	this.labelSize = 18;
	
	if (args != null){
		if (args.showExonLabel != null){
			this.showExonLabel = args.showExonLabel;
		}
		if (args.onMouseOverShitExonTranscriptLabel != null){
			this.onMouseOverShitExonTranscriptLabel = args.onMouseOverShitExonTranscriptLabel;
		}
		
		if (args.queueHeight != null){
			this.queueHeight = args.queueHeight;
		}
		if (args.labelSize != null){
			this.labelSize = args.labelSize;
		}
		if (args.labelHeight != null){
			this.labelHeight = args.labelHeight;
		}
		
		if (args.pixelSpaceBetweenBlocks != null){
			this.pixelSpaceBetweenBlocks = args.pixelSpaceBetweenBlocks;
		}
		
		if (args.showTranscripts != null){
			this.showTranscripts = args.showTranscripts;
		}
		
		if (args.labelsNearEye != null){
			this.labelsNearEye = args.labelsNearEye;
		}
		
		if (args.showDetailGeneLabel != null){
			this.showDetailGeneLabel = args.showDetailGeneLabel;
		}
	}
	
	this.queues = new Array();
	this.queues.push(new Array());
}



//MultiFeatureTrack.prototype._setTextAttributes =    FeatureTrack.prototype._setTextAttributes;
//MultiFeatureTrack.prototype._renderLabel =    FeatureTrack.prototype._renderLabel;
MultiFeatureTrack.prototype.getIdToPrint =    FeatureTrack.prototype.getIdToPrint;
MultiFeatureTrack.prototype.changeView =      FeatureTrack.prototype.changeView;
MultiFeatureTrack.prototype.init =            FeatureTrack.prototype.init;
MultiFeatureTrack.prototype.createSVGDom =    FeatureTrack.prototype.createSVGDom;
MultiFeatureTrack.prototype._getTopText =     FeatureTrack.prototype._getTopText;
MultiFeatureTrack.prototype._getTopFeatures = FeatureTrack.prototype._getTopFeatures;
MultiFeatureTrack.prototype.select = FeatureTrack.prototype.select;
//MultiFeatureTrack.prototype._searchSpace =    FeatureTrack.prototype._searchSpace;
MultiFeatureTrack.prototype.drawTitle =       FeatureTrack.prototype.drawTitle;
MultiFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
MultiFeatureTrack.prototype.mouseclick =      FeatureTrack.prototype.mouseclick;
MultiFeatureTrack.prototype.getById =         FeatureTrack.prototype.getById;
MultiFeatureTrack.prototype.draw =            FeatureTrack.prototype.draw;
MultiFeatureTrack.prototype.getFeatureColor = FeatureTrack.prototype.getFeatureColor;
MultiFeatureTrack.prototype._overlapBlocks =  FeatureTrack.prototype._overlapBlocks;
MultiFeatureTrack.prototype.mouseMove =       FeatureTrack.prototype.mouseMove;
MultiFeatureTrack.prototype.mouseUp =      	  FeatureTrack.prototype.mouseUp;
MultiFeatureTrack.prototype.mouseClick =      FeatureTrack.prototype.mouseClick;
MultiFeatureTrack.prototype.mouseDown =       FeatureTrack.prototype.mouseDown;
MultiFeatureTrack.prototype._addFeatures =    FeatureTrack.prototype._addFeatures;
MultiFeatureTrack.prototype._convertGenomePositionToPixelPosition = FeatureTrack.prototype._convertGenomePositionToPixelPosition;
MultiFeatureTrack.prototype._getViewBoxCoordenates 	=       FeatureTrack.prototype._getViewBoxCoordenates;
MultiFeatureTrack.prototype._getFeatureWidth 	=       FeatureTrack.prototype._getFeatureWidth;
MultiFeatureTrack.prototype.drawBackground  =          FeatureTrack.prototype.drawBackground;
MultiFeatureTrack.prototype.moveTitle 	=       FeatureTrack.prototype.moveTitle;
//MultiFeatureTrack.prototype._updateTop 	=       FeatureTrack.prototype._updateTop;
//MultiFeatureTrack.prototype._setAttributes 	=       FeatureTrack.prototype._setAttributes;


MultiFeatureTrack.prototype._renderLabel = function(start, top, label, attributes, formatter){
	return SVG.drawText(start , top , label, this.labelNodeGroup, attributes);
};

MultiFeatureTrack.prototype._setTextAttributes = function(feature) {
	var attributes = [["fill", "black"],["id", this.id+"_" + feature.id],["cursor", "pointer"], ["font-size", this.labelSize]];
	
	if ((feature instanceof TranscriptFeatureFormatter)&& this.showExonLabel){
		attributes.push(["opacity", 0]);
	}
	
	if ((feature instanceof ExonFeatureFormatter)&& this.onMouseOverShitExonTranscriptLabel){
		attributes.push(["opacity", 0]);
	}
	
	if ((feature instanceof ExonFeatureFormatter)&& !this.showExonLabell){
		attributes.push(["opacity", 0]);
	}
	return attributes;
};

MultiFeatureTrack.prototype.drawLabelAtPosition = function(genomicPositionX, features){
	var keys = new Array();
	var hide = new Array();
	for ( var i = 0; i < features.length; i++) {
		if (features[i+1]!= null){
			if (features[i+1] instanceof ExonFeatureFormatter){
				hide.push(features[i].getId());
				continue;
			}
		}
		keys.push(features[i].getId());
	}
	
	for ( var i = 0; i < this.labelNodeGroup.childElementCount; i++) {
		this.labelNodeGroup.childNodes[i].setAttribute("opacity", 0);
		for ( var j = 0; j < keys.length; j++) {
			if (keys[j].indexOf(this.labelNodeGroup.childNodes[i].getAttribute("id").replace(this.id +"_", "")) != -1){
				this.labelNodeGroup.childNodes[i].setAttribute("x", this._convertGenomePositionToPixelPosition(genomicPositionX));
				this.labelNodeGroup.childNodes[i].setAttribute("opacity", 1);
				continue;
			}
		
		}
		
		for ( var j = 0; j < hide.length; j++) {
			if (hide[j].indexOf(this.labelNodeGroup.childNodes[i].getAttribute("id").replace(this.id +"_", "")) != -1){
				this.labelNodeGroup.childNodes[i].setAttribute("opacity", 0);
				continue;
			}
		}
	}
};


MultiFeatureTrack.prototype._updateTop = function(){
	var height = this.height;
	
	if (this.avoidOverlapping) {
		var originalHeight = this.height;
		if (this.label){
			height = ((this.featureHeight + this.labelHeight + this.separatorBetweenQueue) * this.queues.length);
		}
		else{
			height = ((this.featureHeight)*this.queues.length);
		}
	}
	
	
	if (this.maxHeight < height){
		this.maxHeight = height;
		this.onMaximumHeightChanged.notify();
	}
	if(this.backgroundNode != null){
		this.backgroundNode.setAttribute("height", this.maxHeight);
	}
	this.height = this.maxHeight;
};

MultiFeatureTrack.prototype.appendFeatures = function(data){
	var features = data.toJSON();
	this.drawFeatures(features);
};

MultiFeatureTrack.prototype.clear = function(){
	if(this.mainNodeGroup != null){
		 while (this.mainNodeGroup.childNodes.length>0){
			 	this.mainNodeGroup.removeChild(this.mainNodeGroup.childNodes[0]);
		 }
	}
	this.featuresID = new Object();
	this.maxHeight = this.originalHeight;
};


MultiFeatureTrack.prototype._addFeatures = function(data){
	if (this.geneBlockManager == null){
		this.geneBlockManager = new GeneBlockManager();
	}
	
	if ((data.toJSON().lenth != 0) && !(data.toJSON()[0]) instanceof GeneFeatureFormatter){
		var formatters = this.geneBlockManager.toDatasetFormatter(data.toJSON());
		this.features = formatters;
		this.featuresIndex = new Object();
	}
	else{
		this.features = data.toJSON();
		this.featuresIndex = new Object();
		
	}
};

MultiFeatureTrack.prototype._setAttributes = function(feature, filled){
	var attributes = [["id", this.id+"_" + feature.name], ["style", "cursor:pointer"]];
	attributes.push(["fill-opacity", feature.getDefault().getOpacity()]);
	attributes.push(["stroke", feature.getDefault().getStroke()]);
	attributes.push(["stroke-width", feature.getDefault().getStrokeWidth()]);
	attributes.push(["stroke-opacity", feature.getDefault().getStrokeOpacity()]);
	
	if (filled != null){
		if(!filled){
			attributes.push( [ "fill", "white" ]);
		}
	}
	else{
		if (this.forceColor == null) {
			attributes.push( [ "fill", feature.getDefault().getFill() ]);
		} else {
			attributes.push( [ "fill", this.forceColor ]);
		}
	}
	
	return attributes;
};


//MultiFeatureTrack.prototype._setTextAttributes = function(feature){
//	var attributes = [["fill", "black"],["id", this.id+"_" + feature.start],["cursor", "pointer"], ["font-size", this.labelSize]];
//	return attributes;
//};



/** True si dos bloques se solapan */
//MultiFeatureTrack.prototype._overlapBlocks = function(block1, block2){
//	var spaceBlock = this.pixelSpaceBetweenBlocks / this.pixelRatio;
//	
//	if ((block1.start  < block2.end + spaceBlock) && (block1.end  + spaceBlock > block2.start)){
//		return true;
//	}
//	return false;
//};

/** Busca disponibilidad de espacio y devuelve el indice del layer donde debe insertarse */
MultiFeatureTrack.prototype._searchSpace = function(block1, minQueue){
	for (var i = minQueue; i < this.queues.length; i++ ){
		var overlapping = new Array();
		for (var j = 0; j < this.queues[i].length; j++ ){
			var block2 = this.queues[i][j];
			overlapping.push((this._overlapBlocks(block1, block2)));	
			overlapping.push((this._overlapBlocks(block2, block1)));	
		}
	
		/** no se solapa con ningun elemento entonces devuelvo la capa */ 
		if (overlapping.valueOf(overlapping).indexOf(true)==-1){
			return i;
		}
	}
	/** no me cabe en ninguna capa entonces creo una nueva */
	this.queues.push(new Array());
	/** no hemos encontrado ningun espacio en ninguna cola anterior */
	return this.queues.length - 1;
};

MultiFeatureTrack.prototype.isFeatureDuplicated = function(feature){
	return (this.featuresID[feature.id] != null);
};


MultiFeatureTrack.prototype._render = function() {
	this.init();
	if (this.isAvalaible){
		if (this.features != null){
			this.drawFeatures(this.features);
		}
	}
	this.queues = new Array();
	this.queues.push(new Array());
};

MultiFeatureTrack.prototype.drawFeatures = function(features){
	if (features.length > 0){
		if ((features[0] instanceof GeneFeatureFormatter)==false){
				var geneBlockManager = new GeneBlockManager();
				var formatters = geneBlockManager.toDatasetFormatter(features);
				features = formatters;
		}
	}


	for (var i = 0; i < features.length;  i++){
		var feature = features[i];
		if (!this.allowDuplicates){
			if (this.isFeatureDuplicated(features[i])){
				continue;
			}
			else{
				this.featuresID[features[i].id] = true;
			}
		}
		
		if (feature instanceof GeneFeatureFormatter){
			var geneQueueToDraw = this._searchSpace(feature, 0); 
			
			/** Insertamos en la cola para marcar el espacio reservado */
			this.queues[geneQueueToDraw].push(feature);
			this.drawFeaturesInQueue(feature, geneQueueToDraw);
			
			if (feature.transcript != null){
				var nTrancsripts = feature.transcript.length;
				if (this.showTranscripts){
					for ( var t = 0; t < feature.transcript.length; t++) {
						var transcript =  feature.transcript[t];
						var queueToDraw = this._searchSpace(transcript, Math.ceil(geneQueueToDraw) + 1); 
						
						/** Insertamos en la cola para marcar el espacio reservado */
						this.queues[queueToDraw].push(transcript);
						this.drawFeaturesInQueue(transcript, queueToDraw);
						for ( var j = 0; j < transcript.exon.length; j++) {
							this.drawFeaturesInQueue(transcript.exon[j], queueToDraw, transcript);
						}
					}
				}
			}
		}
	}
	
	this._updateTop();
};


/** Si es un exon le pasamos el transcript para determinar las zonas de coding protein **/
MultiFeatureTrack.prototype.drawFeaturesInQueue = function(feature, queueToDraw, transcript){
	var featureWidth = ((feature.end ) - feature.start + 1) * this.pixelRatio;
	var startPoint = (feature.start - 1) * this.pixelRatio;
	var top = this.top + (queueToDraw * this.featureHeight);
	
	if (this.label){
		   top = this.top + (queueToDraw * (this.featureHeight + this.labelHeight + this.separatorBetweenQueue));
	}
	
	if (transcript == null){
		this._drawFeature((startPoint % this.viewBoxModule), top,  Math.ceil(featureWidth), this._setAttributes(feature), feature);
	}
	else{

		var start = (startPoint % this.viewBoxModule);
		var FILL = this._setAttributes(feature);
		var NOFILL = this._setAttributes(feature, false);
		
		/** Rellenamos todo el exon porque todo el exon esta dentro de la zona coding**/
		if ((transcript.feature.codingRegionStart <= feature.start)&&(transcript.feature.codingRegionEnd >= feature.end)){
			this._drawFeature(start, top,  Math.ceil(featureWidth),  FILL, feature);
			return;
		}
		
		/** Se deja en blanco por que esta fuera del rango**/
		if ((feature.start >= transcript.feature.codingRegionEnd)||(feature.end <= transcript.feature.codingRegionStart)){
			this._drawFeature(start, top,  Math.ceil(featureWidth),  NOFILL, feature);
			return;
		}
		
		var pixelCodingRegionStart = this._convertGenomePositionToPixelPosition(transcript.feature.codingRegionStart);
		var pixelCodingRegionEnd = this._convertGenomePositionToPixelPosition(transcript.feature.codingRegionEnd) ;
		
		var pixelFeatureStart =  this._convertGenomePositionToPixelPosition(feature.start);
		var pixelFeatureEnd =  this._convertGenomePositionToPixelPosition(feature.end + 1);
		
		
		/** Parcialmente rellena**/
		if ((feature.start <= transcript.feature.codingRegionStart)&&(feature.end <= transcript.feature.codingRegionEnd)){
			this._drawFeature(pixelFeatureStart, top, pixelCodingRegionStart - start,  NOFILL, feature);
			this._drawFeature(pixelCodingRegionStart, top, pixelFeatureEnd - pixelCodingRegionStart,  FILL, feature);
			return;
		}
		
		/** Parcialmente rellena**/
		if ((feature.start >= transcript.feature.codingRegionStart)&&(feature.end >= transcript.feature.codingRegionEnd)){
			this._drawFeature(pixelCodingRegionEnd, top, pixelFeatureEnd - pixelCodingRegionEnd,  NOFILL, feature);
			this._drawFeature(pixelFeatureStart, top,  pixelCodingRegionEnd - pixelFeatureStart,  FILL, feature);
			return;
		}
		
		/** Todo el coding protein esta dentro del exon**/
		if ((feature.start <= transcript.feature.codingRegionStart)&&(feature.end >= transcript.feature.codingRegionEnd)){
			this._drawFeature(pixelFeatureStart, top, pixelCodingRegionStart - pixelFeatureStart,  NOFILL, feature);
			this._drawFeature(pixelCodingRegionEnd, top, pixelFeatureEnd - pixelCodingRegionEnd,  NOFILL, feature);
			this._drawFeature(pixelCodingRegionStart, top, pixelCodingRegionEnd - pixelCodingRegionStart,  FILL, feature);
			return;
			
		}
		
	}
};


MultiFeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
	var _this = this;
	
	var nodeSVG;
	
	if (feature instanceof TranscriptFeatureFormatter){
		SVG.drawLine(startPoint, top + (this.featureHeight/2), startPoint + Math.ceil(featureWidth), top + (this.featureHeight/2), this.trackNodeGroup, this._setAttributes(feature));
	}
	else{
		nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), Math.ceil(top), featureWidth, this.featureHeight, this.trackNodeGroup, attributes);
		nodeSVG.addEventListener("mouseover", function(ev){_this._featureOver(feature, this, ev);}, true);
		nodeSVG.addEventListener("mouseout", function(ev){_this._featureOut(feature, this, ev);}, true);
		nodeSVG.addEventListener("click", function(ev){ _this.clickOn(feature, this, ev);}, true);
	}
	
	if (this.label){
		var label = this.getLabel(feature);
		if (label != null){
			var textSVG = this._renderLabel(Math.ceil(startPoint) ,  Math.ceil(top) + (this.featureHeight + this.labelHeight) , label, this._setTextAttributes(feature));
			textSVG.addEventListener("mouseover", function(ev){_this._featureOver(feature, this, ev);}, true);
			textSVG.addEventListener("mouseout", function(ev){_this._featureOut(feature, this, ev);}, true);
			textSVG.addEventListener("click", function(ev){  _this.clickOn(feature, this, ev); }, true);
		}
	}
};

MultiFeatureTrack.prototype.getLabel = function (feature){
	var label = feature.label;
	if(feature instanceof GeneFeatureFormatter){
		if (this.showDetailGeneLabel){
			return feature.getDetailLabel();
		}
	}
	
	if(feature instanceof ExonFeatureFormatter){
		if (this.showExonLabel){
			return feature.label;
		}
		else{
			return "";
		}
	}
	if(feature instanceof TranscriptFeatureFormatter){
			return feature.label;
	}
	return label;
};


MultiFeatureTrack.prototype.clickOn = function (feature){
	
	if (feature instanceof ExonFeatureFormatter){
		//TODO por ahora no es necesario ExonInfoWidget
	}
	
	if (feature instanceof TranscriptFeatureFormatter){
		new TranscriptInfoWidget(null,this.species).draw(feature);
	}
			
	if (feature instanceof GeneFeatureFormatter){
		new GeneInfoWidget(null,this.species).draw(feature);
	}
	
	this.onClick.notify(feature);
};


MultiFeatureTrack.prototype._featureOut = function(feature, node, ev){
	node.setAttribute("stroke-width", "0.5");
	node.setAttribute("opacity", this.lastOpacity);
//TODO done	Que desaparezca
	this.tooltippanel.destroy();
};

MultiFeatureTrack.prototype._featureOver = function(feature, node, ev){
//	console.log(ev);
	this.lastOpacity = node.getAttribute("opacity");
	node.setAttribute("stroke-width", "1");
	node.setAttribute("opacity", "0.6");
//TODO done
	this.tooltippanel = new TooltipPanel();
	this.tooltippanel.getPanel(feature).showAt(ev.clientX,ev.clientY);
};

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

GeneBoxFeatureTrack.prototype.createSVGDom 			=    	Track.prototype.createSVGDom;
GeneBoxFeatureTrack.prototype.init 					=    	Track.prototype.init;
GeneBoxFeatureTrack.prototype.mouseMove 				=       Track.prototype.mouseMove;
GeneBoxFeatureTrack.prototype.mouseUp 					=     	Track.prototype.mouseUp;
GeneBoxFeatureTrack.prototype.mouseClick 				=       Track.prototype.mouseClick;
GeneBoxFeatureTrack.prototype.mouseDown 				=       Track.prototype.mouseDown;
GeneBoxFeatureTrack.prototype._getViewBoxCoordenates 	=       Track.prototype._getViewBoxCoordenates;
GeneBoxFeatureTrack.prototype._goToCoordinate 			=      	Track.prototype._goToCoordinate;
GeneBoxFeatureTrack.prototype._startDragging 			=       Track.prototype._startDragging;
GeneBoxFeatureTrack.prototype._dragging 				=       Track.prototype._dragging;
GeneBoxFeatureTrack.prototype._getSVGCoordenates 		=       Track.prototype._getSVGCoordenates;
GeneBoxFeatureTrack.prototype._stopDragging 			=       Track.prototype._stopDragging;
GeneBoxFeatureTrack.prototype._render 			=       Track.prototype._render;

function GeneBoxFeatureTrack (trackerID, targetNode,  args) {
	
	Track.prototype.constructor.call(this, trackerID, targetNode,  args);
	
	this.pixelPerRatio = 10;
	this.viewBoxModule = 10;
	
	this.targetID = targetNode.id;
	
	/** features */
	this.features = null;
	
	/** Optional parameters */
	this.featureHeight = 8;
	
	/** Modulo que indica el tamaño maximo del ViewBox porque a tamaños de cientos de millones se distorsiona, parece un bug de SVG **/
	this.viewBoxModule = null;
	
	/** Processing optional parameters */
	if (args!=null){
		if (args.featureHeight!=null){
			this.featureHeight = args.featureHeight;	
		}
		if (args.blocks!=null){
			this.drawBlocks = args.blocks;
		}
		if (args.viewBoxModule!=null){
			this.viewBoxModule = args.viewBoxModule;
		}
		if (args.pixelPerRatio!=null){
			this.pixelPerRatio = args.pixelPerRatio;
		}
	}
	
	/** Gene tracks **/
	this.geneTracks = new Array();
	
	/** Transcript tracks **/
	this.transcriptTracks = new Array();
	
};


GeneBoxFeatureTrack.prototype.getNewGeneTrack = function(){
	var  titleFontSize = 5;
	if (this.pixelRatio ==  0.001){
		titleFontSize = 5;
	}
	
	if (this.pixelRatio ==  0.005){
		titleFontSize = 7;
	}
	
	return new GeneFeatureTrack( "geneTrack", DOM.select(this.targetID), {
		top:0, 
		left:0, 
		right:this.width,  
		width:this.width, 
		start: this.start, 
		end: this.end,
		height:this.getGeneTrackHeight(), 
		backgroundColor: "#FFFFFF", 
		titleColor:"#FFFFFF", 
		titleFontSize:titleFontSize, 
		featureHeight:5, 
		title:"Feature Track",
		pixelRatio:this.pixelRatio,
		viewBoxModule: this.viewBoxModule
	});
};

GeneBoxFeatureTrack.prototype.getGeneTrackHeight = function(){
	return 15;
};

GeneBoxFeatureTrack.prototype.getTranscriptTrackHeight = function(){
	return 7;
};

GeneBoxFeatureTrack.prototype.getNewTranscriptTrack = function(){
	var  titleFontSize = 5;
	if (this.pixelRatio ==  0.001){
		titleFontSize = 5;
	}
	
	if (this.pixelRatio ==  0.005){
		titleFontSize = 7;
	}
	
	return new TranscriptFeatureTrack( "geneTrack", DOM.select(this.targetID), {
		top:2, 
		left:0, 
		right:this.width,  
		width:this.width, 
		start: this.start, 
		end: this.end,
		height:this.getTranscriptTrackHeight(), 
		backgroundColor: "#FFFFFF", 
		titleColor:"#FFFFFF", 
		titleFontSize:titleFontSize, 
		featureHeight:3, 
		title:"Feature Track",
		pixelRatio:this.pixelRatio,
		viewBoxModule: this.viewBoxModule
	});
};


GeneBoxFeatureTrack.prototype.init = function(){
	for ( var i = 0; i < this.features.queues.length; i++) {
		this.geneTracks.push(this.getNewGeneTrack());
	}
};

GeneBoxFeatureTrack.prototype.changeView = function(start, end){
	this.start = start;
	this.end = end;
};

GeneBoxFeatureTrack.prototype._render = function(start, end){
	this.init();
	this.drawFeatures(this.features);
};

GeneBoxFeatureTrack.prototype.addFeatures = function(features){
	this.drawFeatures(features);
};

GeneBoxFeatureTrack.prototype.drawFeatures = function(features){
	
	var relativeTop = this.top;
	for ( var i = 0; i < this.geneTracks.length; i++) {
		
		/** Dibujamos gene a gene porque puede cambiar el top **/
		for ( var j = 0; j < this.features.queues[i].length; j++) {
			var retartTop = this.geneTracks[i].top;
			/** el primer queue de genes lo obvio porque estan bien colocados **/
			if (i>0){
				
				var geneFetaure = this.features.queues[i][j];
				var overlap = features.overlappers[geneFetaure.externalName];
				
				if ( overlap != null){
					
//					var maxTranscript = 0;
//					for ( var k = 0; k < overlap.length; k++) {
//						if (maxTranscript < overlap[k].transcript.length){
//							maxTranscript = overlap[k].transcript.length;
//						}
//						
//					}
					
					var maxTranscript = features.genePerTranscriptQueue[geneFetaure.externalName];
//					console.log("la fomula: " + features.genePerTranscriptQueue[geneFetaure.externalName]);
//					console.log(geneFetaure.externalName + " tiene overlapers de " +maxTranscript);
					relativeTop = this.top + ((this.getGeneTrackHeight()*i) + (maxTranscript+1)*this.getTranscriptTrackHeight() );

				}
			}
			
			
//			console.log("-------- Pinto gene " + this.features.queues[i][j].externalName);
			
			var array = new Array();
			array.push(this.features.queues[i][j]);
			
			this.geneTracks[i].draw(this._toDataset(array), this._svg, relativeTop);
			this.geneTracks[i].top = retartTop;
			var restartRealite = relativeTop;
			relativeTop = relativeTop + (this.geneTracks[i].height);
			
			for ( var k = 0; k < this.features.queues[i][j].transcript.length; k++) {
//				console.log("transcript of gene: " + this.features.queues[i][j].transcript[k]);
				
				this.transcriptTracks.push(this.getNewTranscriptTrack());
				
				var arrayt = new Array();
				arrayt.push(this.features.queues[i][j].transcript[k]);
				
				this.transcriptTracks[this.transcriptTracks.length -1].draw(this._toDataset(arrayt), this._svg, relativeTop);
				relativeTop = relativeTop + this.getTranscriptTrackHeight() ;
				
			}
			relativeTop = restartRealite ;
			
		}
		
		
		
		
//		relativeTop = relativeTop + (this.geneTracks[i].height);
//		
//		
//		
//		for ( var j = 0; j < this.features.transcriptQueue[i].length; j++) {
//			this.transcriptTracks.push(this.getNewTranscriptTrack());
//			this.transcriptTracks[this.transcriptTracks.length -1].draw(this._toDataset(this.features.transcriptQueue[i][j]), this._svg, relativeTop);
//			relativeTop = relativeTop + (this.transcriptTracks[this.transcriptTracks.length -1].height + 2);
//		}
	}
};

GeneBoxFeatureTrack.prototype._toDataset = function(features){
	var dataset = new DataSet();
	var data = new Array();
	data.push(features);
	dataset.json = data;
	return dataset;
};


GeneBoxFeatureTrack.prototype._addFeatures = function (data){
	this.features = data.toJSON().data;
};

/** svgNodeGroup: es el nodo svg donde este objecto track sera renderizado **/
GeneBoxFeatureTrack.prototype.draw = function (data, svgNodeGroup, top){
	if (top != null){
		this.top = this.top + top;
	}
	
	if (svgNodeGroup != null){
		this._svg = svgNodeGroup;
	}
	
	this._addFeatures(data);
	
	
	this.changeView(this.start, this.end);
	this._render();
};




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



FeatureTrack.prototype.createSVGDom 			=    	Track.prototype.createSVGDom;
FeatureTrack.prototype.init 					=    	Track.prototype.init;
FeatureTrack.prototype.mouseMove 				=       Track.prototype.mouseMove;
FeatureTrack.prototype.mouseUp 					=     	Track.prototype.mouseUp;
FeatureTrack.prototype.mouseClick 				=       Track.prototype.mouseClick;
FeatureTrack.prototype.mouseDown 				=       Track.prototype.mouseDown;
FeatureTrack.prototype._getViewBoxCoordenates 	=       Track.prototype._getViewBoxCoordenates;
FeatureTrack.prototype._goToCoordinate 			=      	Track.prototype._goToCoordinate;
FeatureTrack.prototype._startDragging 			=       Track.prototype._startDragging;
FeatureTrack.prototype._dragging 				=       Track.prototype._dragging;
FeatureTrack.prototype._getSVGCoordenates 		=       Track.prototype._getSVGCoordenates;
FeatureTrack.prototype._stopDragging 			=       Track.prototype._stopDragging;
FeatureTrack.prototype.clear 					=       Track.prototype.clear;
FeatureTrack.prototype.drawBackground  			=       Track.prototype.drawBackground;


function FeatureTrack (trackerID, targetNode, species, args) {
	Track.prototype.constructor.call(this, trackerID, targetNode, args);
	
	this.species = species;
	
	/** features */
	this.features = null;
	
	/** Optional parameters */
//	this.featureHeight = 4;
	
	/** Modulo que indica el tamaño maximo del ViewBox porque a tamaños de cientos de millones se distorsiona, parece un bug de SVG **/
	this.viewBoxModule = null;
	
	/** blocks */
	this.avoidOverlapping = false;
	this.pixelSpaceBetweenBlocks = 0;
	
	
	/** Features duplicates **/
	this.allowDuplicates = true;
	this.featuresID = new Object(); /** guardamos en esta estructura un id por feature para detectar si tengo alguna duplicada **/
	this.label = false;
	
	/** If true el trackcanvas renderizara su label en el middle point **/
	this.showLabelsOnMiddleMarker = false;
	
	
	this.forceColor = null;
	
	
	this.labelHeight = 12;
	this.separatorBetweenQueue = 4;
	
	/** Processing optional parameters */
	if (args!=null){
		if (args.showLabelsOnMiddleMarker != null){
			this.showLabelsOnMiddleMarker = args.showLabelsOnMiddleMarker;
		}
		
		if (args.queueHeight != null){
			this.queueHeight = args.queueHeight;
		}
		
		if (args.labelHeight != null){
			this.labelHeight = args.labelHeight;
		}
		
		if (args.featureHeight!=null){
			this.featureHeight = args.featureHeight;	
		}
		
		if (args.forceColor != null) {
			this.forceColor = args.forceColor;
		}
		
		if (args.avoidOverlapping !=null){
			this.avoidOverlapping = args.avoidOverlapping;
		}
		if (args.pixelSpaceBetweenBlocks !=null){
			this.pixelSpaceBetweenBlocks = args.pixelSpaceBetweenBlocks;
		}
		
		if (args.viewBoxModule!=null){
			this.viewBoxModule = args.viewBoxModule;
		}
		if (args.allowDuplicates != null){
			this.allowDuplicates = args.allowDuplicates;
		}
		
		if (args.label != null){
			this.label = args.label;
		}
		
//		if (args.notListenToMoving != null){
//			this.notListenToMoving = args.notListenToMoving;
//		}
	}
	
	/** Queues */
	this.queues = new Array();
	this.queues[0] = new Array();
	
	
	this.queueHeight = this.labelHeight + this.featureHeight;
	
//	this.featureQueue = new Object(); // Hashmap  [index_feature -> indexQueuetoDraw] 
	
	this.positions = new Object();
	
	/** EVENTS **/
	this.onClick = new Event(this);
	this.onMouseOver = new Event(this);
	this.onMouseOut = new Event(this);
	this.onMaximumHeightChanged = new Event(this);
	
};



/** True si dos bloques se solapan */
FeatureTrack.prototype._overlapBlocks = function(block1, block2){
	var spaceBlock = this.pixelSpaceBetweenBlocks / this.pixelRatio;
	
	if ((block1.start  < block2.end + spaceBlock) && (block1.end  + spaceBlock > block2.start)){
		return true;
	}
	return false;
};

FeatureTrack.prototype._setTextAttributes = function(feature) {
	var attributes = [["fill", "black"],["id", this.id+"_" + feature.id],["cursor", "pointer"], ["font-size", this.labelSize]];
	return attributes;
};

///** Busca disponibilidad de espacio y devuelve el indice del layer donde debe insertarse */
FeatureTrack.prototype._searchSpace = function(block1){
	for (var i = 0; i < this.queues.length; i++ ){
		var overlapping = new Array();
		for (var j = 0; j < this.queues[i].length; j++ ){
			var block2 = this.queues[i][j];
			overlapping.push((this._overlapBlocks(block1, block2)));	
			overlapping.push((this._overlapBlocks(block2, block1)));	
		}
	
		/** no se solapa con ningun elemento entonces devuelvo la capa */ 
		if (overlapping.valueOf(overlapping).indexOf(true)==-1){
			return i;
		}
	}
	/** no me cabe en ninguna capa entonces creo una nueva */
	this.queues.push(new Array());
//	this.height = this.height + (this.queues.length* this.featureHeight);
	/** no hemos encontrado ningun espacio en ninguna cola anterior */
	return this.queues.length - 1;
};


FeatureTrack.prototype.drawLabelByPosition = function(chromosome, start, end){
};


FeatureTrack.prototype.appendFeatures = function(data){
	var features = data.toJSON();
	this.drawFeatures(features);
};

FeatureTrack.prototype.isFeatureDuplicated = function(feature){
	return this.featuresID[feature.start + "_" + feature.end];
};

FeatureTrack.prototype.moveY = function(realMove){
	this.mainNodeGroup.setAttribute("transform", "translate(0, " + realMove + ")");
};

FeatureTrack.prototype.drawFeatures = function(features){
	this.queues = new Array();
	this.queues.push(new Array());

	for (var i = 0; i < features.length;  i++){
		if (!this.allowDuplicates){
			if (this.isFeatureDuplicated(features[i])){
				continue;
			}
			else{
				this.featuresID[features[i].start + "_" + features[i].end] = true;
			}
		}
		
		var queueToDraw = 0;
		if (this.avoidOverlapping){
			queueToDraw = this._searchSpace(features[i]);
		}
		else{
			queueToDraw = 0;
		}
		
		/** Insertamos en la cola para marcar el espacio reservado */
		this.queues[queueToDraw].push(features[i]);
		this.drawFeaturesInQueue(features[i], queueToDraw);
	}
	
	this._updateTop();
};

FeatureTrack.prototype.drawLabelAtPosition = function(genomicPositionX, features){
};

FeatureTrack.prototype.drawFeaturesInQueue = function(feature, queueToDraw){
	var attributes = this._setAttributes(feature);
	var featureWidth = ((feature.end - feature.start) + 1) * this.pixelRatio;
	if ( (feature.end - feature.start) < 0){
		featureWidth= ((feature.start - feature.end)) * this.pixelRatio;
	}
	
	var startPoint = (feature.start - 1) * this.pixelRatio;
	var top = this.top + (queueToDraw * this.featureHeight);
	
	if (this.label){
	   top = this.top + (queueToDraw * (this.featureHeight + this.labelHeight + this.separatorBetweenQueue));
	}
	
	
	var start = (startPoint % this.viewBoxModule);
	this._drawFeature(start, top,  Math.ceil(featureWidth), attributes, feature);
};



FeatureTrack.prototype._updateTop = function(){
	var height = this.height;
	
	if (this.avoidOverlapping) {
		var originalHeight = this.height;
		if (this.label){
			height = ((this.featureHeight + this.labelHeight + this.separatorBetweenQueue) * this.queues.length);
		}
		else{
			height = ((this.featureHeight)*this.queues.length);
		}
	}
	
	if (this.maxHeight < height){
		this.maxHeight = height;
		this.onMaximumHeightChanged.notify();
	}
	if(this.backgroundNode != null){
		this.backgroundNode.setAttribute("height", this.maxHeight);
	}
	this.height = this.maxHeight;
};



FeatureTrack.prototype._getFeatureWidth = function(feature){
	if ((feature.end - feature.start) == 0) return ((feature.end +1)- feature.start)*this.pixelRatio;
	return (feature.end - feature.start) * this.pixelRatio;
};

FeatureTrack.prototype._convertGenomePositionToPixelPosition = function(position){
	return ((position -1) * this.pixelRatio) % this.viewBoxModule;
};


FeatureTrack.prototype._setAttributes = function(feature){
	var attributes = [["id", this.id+"_" + feature.name], ["style", "cursor:pointer"]];
	attributes.push(["fill-opacity", feature.getDefault().getOpacity()]);
	
	attributes.push(["stroke", feature.getDefault().getStroke()]);
	attributes.push(["stroke-width", feature.getDefault().getStrokeWidth()]);
	attributes.push(["stroke-opacity", feature.getDefault().getStrokeOpacity()]);
	
	if (this.forceColor == null) {
		attributes.push( [ "fill", feature.getDefault().getFill() ]);
	} else {
		attributes.push( [ "fill", this.forceColor ]);
	}
	
	return attributes;
};

FeatureTrack.prototype._drawFeature = function(startPoint, top, featureWidth, attributes, feature){
		var _this = this;
		if (featureWidth <= 1) {
			featureWidth = 2;
		}
		this.positions[Math.ceil(startPoint)] = true;
		var nodeSVG = SVG.drawRectangle(Math.ceil(startPoint), top , featureWidth, this.featureHeight, this.trackNodeGroup, attributes);
	
		if (this.label) {
			this._renderLabel(Math.ceil(startPoint) ,  Math.ceil(top) + (this.featureHeight + this.labelHeight) , feature.label, this._setTextAttributes(feature), feature);
		}
};


FeatureTrack.prototype._renderLabel = function(start, top, label, attributes, formatter){
	var _this = this;
	var SVGNode = SVG.drawText(start , top , label, this.labelNodeGroup, attributes);
	SVGNode.addEventListener("click", function() {
		_this.onClick.notify(formatter);
		try{
			var gridFields = [];
			for (key in formatter.feature ){
				gridFields.push(key);		
			}
//			var window = new ListWidget({title:formatter.label, gridFields:gridFields});
//			window.draw([[formatter.feature]],[formatter.label]);
			if (formatter instanceof SNPFeatureFormatter){
				new SnpInfoWidget(null, _this.species).draw(formatter);
			}
			if (formatter instanceof VCFFeatureFormatter){
				new VCFVariantInfoWidget(null, _this.species).draw(formatter);
			}
			
		}catch(e){
			console.log(e);
		}

	}, true);
	
	SVGNode.addEventListener("mouseover", function(ev) {
//TODO  done
//console.log(ev);
		_this.tooltippanel = new TooltipPanel();
		_this.tooltippanel.getPanel(formatter).showAt(ev.clientX,ev.clientY);
	}, true);
	SVGNode.addEventListener("mouseout", function() {
//TODO done
		_this.tooltippanel.destroy();
	}, true);
	
};

FeatureTrack.prototype.getIdToPrint = function(feature){
	return feature.id;
};

FeatureTrack.prototype._render = function() {
	this.init();
	if (this.isAvalaible){
		if (this.features != null){
			this.drawFeatures(this.features);
		}
	}
};

FeatureTrack.prototype.moveTitle = function(movement) {
	if (this.title){
			
			var movementOld = parseFloat(this.titleNodeGroup.getAttribute("moveX"));
//			var desplazamiento = parseFloat((parseFloat(movement) + parseFloat(movementOld)));
			if (!movementOld){
				desplazamiento = (movement);
			}
			else{
				desplazamiento = parseFloat((parseFloat(movement) + parseFloat(movementOld)));
			}
			
			this.titleNodeGroup.setAttribute("transform", "translate("+ -desplazamiento + ", 0)");
			this.titleNodeGroup.setAttribute("moveX", desplazamiento);
	}
};


FeatureTrack.prototype.drawTitle = function(midlle, args){
	var widthLine = 1;
	if (args != null){
		if (args.width != null){
			widthLine = args.width;
		}
	}
	
	var coordenateX = this._convertGenomePositionToPixelPosition(midlle);
		
		
	if (this.titleRectangle != null){
		this.titleRectangle.parentNode.removeChild(this.titleRectangle);
	}
	
	if (this.titleText != null){
		this.titleText.parentNode.removeChild(this.titleText);
	}
	
	if (this.isAvalaible){
		var attributes = [["fill", "#FFFFFF"], ["stroke", "#000000"], ["opacity", 0.7], ["rx", 4], ["ry", 4], ["id"]];
		this.titleRectangle = SVG.drawRectangle(coordenateX , this.top, this.titleWidth , this.height, this.titleNodeGroup, attributes);
		this.titleText = SVG.drawText(coordenateX + 2, this.top + this.titleHeight - 3, this.titleName, this.titleNodeGroup, [["font-size", this.titleFontSize]]);
	}
	else{
		var attributes = [["fill", "#FFFFCC"], ["stroke", "#000000"], ["opacity", 0.7], ["rx", 0], ["ry", 0]];
		SVG.drawRectangle(coordenateX , this.top, this.width , this.height, this.titleNodeGroup, attributes);
		SVG.drawText(coordenateX + 2, this.top + this.height - 4, this.titleName + ": " + this.isNotAvalaibleMessage, this.titleNodeGroup, [["font-size", this.titleFontSize]]);
	}
};


//FeatureTrack.prototype.drawTitle = function(start) {
//	var x = start + 20;
//	var y =  (this.top + this.height);
//	var pos = this._convertGenomePositionToPixelPosition(start) + 10;
//	
//	if (this.isAvalaible){
//		var attributes = [["fill", "#FFFFFF"], ["stroke", "#000000"], ["opacity", 0.7], ["rx", 4], ["ry", 4]];
//		SVG.drawRectangle(pos , this.top, this.titleWidth , this.height, this.titleNodeGroup, attributes);
//		SVG.drawText(pos + 2, this.top + this.titleHeight - 3, this.titleName, this.titleNodeGroup, [["font-size", this.titleFontSize]]);
//	}
//	else{
//		var attributes = [["fill", "#FFFFCC"], ["stroke", "#000000"], ["opacity", 0.7], ["rx", 0], ["ry", 0]];
//		SVG.drawRectangle(pos , this.top, this.width , this.height, this.titleNodeGroup, attributes);
//		SVG.drawText(pos + 2, this.top + this.height - 4, this.titleName + ": " + this.isNotAvalaibleMessage, this.titleNodeGroup, [["font-size", this.titleFontSize]]);
//	}
//	
//	
//};



FeatureTrack.prototype._addFeatures = function(data) {
	this.features = data.toJSON();
	this.featuresIndex = new Object();
};

//FeatureTrack.prototype._addFeatures = function (data){
//	/** features */
//	this.features = data.toJSON()[0];
//};

/** svgNodeGroup: es el nodo svg donde este objecto track sera renderizado **/
FeatureTrack.prototype.draw = function (data, svgNodeGroup, top){
	this.top = top;
	
	if (svgNodeGroup != null){
		this._svg = svgNodeGroup;
	}

	if (data.toJSON() != null){
		this._addFeatures(data);
	}
	
	this._render();
};


/** EVENTS */
FeatureTrack.prototype.mouseclick = function(evt) {
};


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


ChromosomeFeatureTrack.prototype.createSVGDom =       FeatureTrack.prototype.createSVGDom;
ChromosomeFeatureTrack.prototype.init =      		   FeatureTrack.prototype.init;
ChromosomeFeatureTrack.prototype.draw =      		   FeatureTrack.prototype.draw;
ChromosomeFeatureTrack.prototype._render =      	   FeatureTrack.prototype._render;
ChromosomeFeatureTrack.prototype.getById =      	   FeatureTrack.prototype.getById;
//ChromosomeFeatureTrack.prototype.mouseMove =          FeatureTrack.prototype.mouseMove;
//ChromosomeFeatureTrack.prototype.mouseUp =      	   FeatureTrack.prototype.mouseUp;
//ChromosomeFeatureTrack.prototype.mouseClick =         FeatureTrack.prototype.mouseClick;
//ChromosomeFeatureTrack.prototype.mouseDown =          FeatureTrack.prototype.mouseDown;
ChromosomeFeatureTrack.prototype._getViewBoxCoordenates =          FeatureTrack.prototype._getViewBoxCoordenates;
ChromosomeFeatureTrack.prototype._getSVGCoordenates 		=       FeatureTrack.prototype._getSVGCoordenates;
ChromosomeFeatureTrack.prototype.drawBackground =          FeatureTrack.prototype.drawBackground;

// JavaScript Document
function ChromosomeFeatureTrack (trackerID, targetID, species, args) {
	FeatureTrack.prototype.constructor.call(this, trackerID, targetID, species, args);

	//To optional
	this.selectcolor = "#33FF33";
	this.markcolor = "#FF3333";
	this.radio = 3;
	
	this.markers = new Object();
	this.start = 1;
	
	
	//Optional parameters
	this.labelChromosome = false;
	this.vertical = false;
	this.rounded = 7;
	this.label = false;
	//this.backgroundcolor= "white";
		
	this.maxFeatureEnd = 1;
	
	//Processing optional parameters
	if (args!=null){
		if (args.label!=null){
			this.label = args.label;
		}
		if (args.labelChromosome!=null){
			this.labelChromosome = args.labelChromosome;	
		}
		
		if (args.vertical!=null){
			this.vertical = args.vertical;	
		}
		
		if (args.rounded!=null){
			this.rounded = args.rounded;	
		}
		
		if (args.bottom!=null){
			this.bottom = args.bottom;	
		}
	}
	
	this.onMarkerClicked = new Event(this);
	
	/** Selector moving **/
	this.selector = new Object();
	this.selector.selectorIsMoving = false;
	this.selector.selectorSVG = null;
	this.selector.selectorBorder = null;
	this.selector.start = null;
	this.selector.end = null;
	this.selector.mouseOffsetX = null;

};

ChromosomeFeatureTrack.prototype.getCentromeros = function(){
	var centromeros = new Array();
	for (var i = 0; i < this.features.length;  i++){
		if (this.features[i].stain == "acen"){
			centromeros.push(this.features[i]);
		}
	}
	return centromeros;
}; 

ChromosomeFeatureTrack.prototype.getEnd = function(features) {
	var end = 0;
	for (var i = 0; i < features.length;  i++){
		if (features[i].end>end){
			end = features[i].end;
		}
	}
	return end;
};

ChromosomeFeatureTrack.prototype.getColorByStain = function(feature) {
	if (feature.stain == ('gneg')){
		return "white";
	}
	if (feature.stain == ('stalk')){
		return "#666666";
	}
	if (feature.stain == ('gvar')){
		return "#CCCCCC";
	}
	
	if (feature.stain.indexOf('gpos') != -1){
		var value = feature.stain.replace("gpos", "");
		
		if (value == 25){
			return "silver";
		}
		if (value == 50){
			return "gray";
		}
		if (value == 75){
			return "darkgray";
		}
		if (value == 100){
			return "black";
		}
	}
	
	if (feature.stain=="acen"){
		return "blue";
	}
	return "purple";
};

ChromosomeFeatureTrack.prototype.getPixelScale = function(){
	var pixelInc;
	if (this.vertical){
		pixelInc = (this.bottom - this.top)/(this.end - this.start);
	}
	else{
		pixelInc = (this.right - this.left)/(this.end - this.start);
	}
	return pixelInc;
};


ChromosomeFeatureTrack.prototype.setBackgroundColor = function(color) {
	this.backgroundSVGNode.setAttribute("fill", color);
	if (color=="white"){
		this.backgroundSVGNode.setAttribute("stroke", "white");
	}
	else{
		
		this.backgroundSVGNode.setAttribute("stroke", "black");
	}
};


ChromosomeFeatureTrack.prototype.unmark = function() {
	for ( var id in this.markers) {
		 this.trackNodeGroup.removeChild(DOM.select(id));
	}
	this.markers = new Object();
};

ChromosomeFeatureTrack.prototype.getMarkIDFromFeature = function(feature) {
	var id = feature.chromosome + "_" + feature.start + "_" + feature.end;
	this.markers[id] = feature;
	return id;
};


ChromosomeFeatureTrack.prototype.mark = function(feature, color) {
	var _this = this;
	
	var pixelInc = this.getPixelScale();
	var start = feature.start;
	var end = feature.end;
	var width = (end - start)*pixelInc;
	
	
	if (start == end){
		width = 1;
	}
	
	var markerColor = this.markcolor;
	
	if (color != null){
		 this.markcolor = color;
	}
	
	if (this.vertical){
		var top = this.top + start*pixelInc;
		var height = (end - start)*pixelInc ;
		var attributes = [["stroke", "black"],["stroke-width", "1"],["id", this.getMarkIDFromFeature(feature)], ["fill", this.markcolor], ["opacity", "1"],["cursor", "pointer"]];
		
		var node = SVG.drawPoligon([[this.right + 6, top - 3] , [this.right, top],  [this.right + 6, top + 3]], this.trackNodeGroup, attributes);
		
		node.addEventListener("click", function(evt){ 
			
//			if (_this.vertical){
				_this.onMarkerClicked.notify(_this.markers[node.id]);
//			}
//			else{
//				var point = _this._getSVGCoordenates(evt);
//				var genomicPosition = Math.ceil((point.x - _this.left)/ _this.pixelInc);
//				_this.click.notify(genomicPosition);
//			}
			
		
		}, true);
		
	}
	else{
		var left = this.left + start*pixelInc;
		var attributes = [["id", this.markers.length], ["fill", this.markcolor], ["opacity", "1"]];
		SVG.drawRectangle(left, this.top, width, (this.bottom - this.top) + this.radio + 5, this.trackNodeGroup, attributes);
		var attributes = [["id", id], ["fill", this.markcolor], ["opacity", "1"],["stroke", "black"]];
		SVG.drawCircle(left , (this.bottom) + this.radio + 5, this.radio, this.trackNodeGroup, attributes);
	}
};

ChromosomeFeatureTrack.prototype.getSelectorId = function() {
	return this.id + "_selector";
};
ChromosomeFeatureTrack.prototype.deselect = function() {
		var id = this.getSelectorId();
	
		if (DOM.select(id) != null){
			 this.trackNodeGroup.removeChild(this.selector.selectorSVG);
//			 this.trackNodeGroup.removeChild(this.selector.selectorBorder);
			 
		}
};

ChromosomeFeatureTrack.prototype.mouseMove = function(evt){
	if (this.selector.selectorIsMoving){
		if (this.selector.selectorSVG != null){
			var offsetX = this.getSVGCoordenates(evt).x - this.selector.mouseOffsetX;
			var pixelRatio = this.getPixelScale();
			var genomicMovement =  parseFloat(this.selector.start) + parseFloat(Math.ceil(offsetX/pixelRatio));
			var size = this.selector.end - this.selector.start;
			var end = genomicMovement + size;
			this.select(genomicMovement, end);
			this.selector.mouseOffsetX = this.getSVGCoordenates(evt).x;
		}
	}		
};

ChromosomeFeatureTrack.prototype.mouseDown = function(evt){
	this.selector.selectorIsMoving = true;
	this.selector.mouseOffsetX = this.getSVGCoordenates(evt).x;
	
	
};

ChromosomeFeatureTrack.prototype.mouseUp = function(evt){
	this.selector.selectorIsMoving = false;
	this.click.notify(this.selector.start + (this.selector.end - this.selector.start)/2);
};
	
ChromosomeFeatureTrack.prototype.select = function(start, end) {
	var _this = this;
	this.selector.id = this.getSelectorId(); 
	this.selector.start = start;
	this.selector.end = end;
	
	if (end > this.maxFeatureEnd){
		if ((this.maxFeatureEnd - start)*pixelInc > 0){
			end = this.maxFeatureEnd;
		}
	}
	
	this.deselect();
	
	if (this.trackNodeGroup != null){
		var pixelInc = this.getPixelScale();
		
		if (this.vertical){
			pixelInc = this.getPixelScale();
			var top =   Math.ceil(this.top + pixelInc * (start)); //this.top + start*pixelInc;
			var height = (end - start)*pixelInc ;
			var attributes = [["stroke", "black"],["stroke-width", "1"],["id", this.selector.id], ["cursor", "move"], ["fill", this.selectcolor], ["opacity", "1"]];
			this.selector.selectorSVG = SVG.drawPoligon([[0, top - 5] , [this.left, top],  [0, top + 5]], this.trackNodeGroup, attributes);
			
		}
		else{
			
			var left = this.left + start*pixelInc;
			var width = Math.ceil((end - start)*pixelInc);
			var attributes = [["stroke", "red"],["stroke-width", "1"],["id", this.selector.id], ["cursor", "move"], ["fill", this.selectcolor], ["fill-opacity", "0.1"]];
			this.selector.selectorSVG = SVG.drawRectangle(left, this.top + 6 , width, (this.bottom - this.top), this.trackNodeGroup, attributes);
			
//			this.selector.selectorBorder
			
//			this.selector.selectorSVG.addEventListener("click", function(evt){ }, true);
			
			this.selector.selectorSVG.addEventListener("mousemove", function(event) { _this.mouseMove(event, _this); }, false);
			this.selector.selectorSVG.addEventListener("mousedown", function(event) { _this.mouseDown(event, _this); }, false);
			this.selector.selectorSVG.addEventListener("mouseup", function(event) { _this.mouseUp(event, _this); }, false);
			
		}
	}
};

ChromosomeFeatureTrack.prototype.drawFeatures = function() {
	var _this = this;
	var centromeros = this.getCentromeros();
	
	this.pixelInc = this.getPixelScale();
	
	var endFirstCentromero = 0;
	
	if (centromeros.length != 0){
	  endFirstCentromero =  centromeros[0].end * this.pixelInc;
	  this.centromerosVisited = false;
	}
	else{
		this.centromerosVisited = true;
	}
	
	
	var attributesClip = [["stroke", "black"],["stroke-width", "1"],["id", "clip"], ["fill", "pink"], ["rx", this.rounded], ["ry",  this.rounded], ["z-index", "0"]];
	
	//Dibujamos la lineas del contenedor
	if (this.vertical){
		
		this.featureHeight = this.right - this.left - 1;
		
		var rectTop = endFirstCentromero + this.top ;
		var rectHeight = this.bottom - endFirstCentromero - this.top ;// this.bottom -  this.top ;// this.bottom -  this.top - border ;
		
		var rect = SVG.createRectangle( this.left, rectTop,  this.featureHeight, rectHeight, attributesClip);
		this.trackNodeGroup.appendChild(rect);
		
		
		rect = SVG.createRectangle(this.left, rectTop, this.featureHeight, rectHeight, attributesClip);
		this.trackNodeGroup.appendChild(rect);
		
		var clip = SVG.drawClip("clip_1"+this.id, rect, this.trackNodeGroup);
		this.groupNodeFirstCentromero = SVG.drawGroup(this.trackNodeGroup, [["id", "clip_group"], ["clip-path", "url(#clip_1" +this.id+")"]]);
		
		
		//Segundo Centromero
		var rectTop = this.top;
		var rectHeight =  endFirstCentromero;
		
		
		rect = SVG.createRectangle(this.left, rectTop + 1,  this.featureHeight, rectHeight, attributesClip);
		this.trackNodeGroup.appendChild(rect);
		
		
		rect = SVG.createRectangle(this.left, rectTop + 1, this.featureHeight, rectHeight, attributesClip);
		this.trackNodeGroup.appendChild(rect);
		
		clip = SVG.drawClip("clip_2"+this.id, rect, this.trackNodeGroup);
		groupNodeSecondCentromero = SVG.drawGroup(this.trackNodeGroup, [["id", "clip_group"], ["clip-path", "url(#clip_2" +this.id+")"]]);
	}
	else
	{
		
		this.featureHeight = Math.ceil(this.bottom - this.top);
		
		var rect = SVG.createRectangle(this.left , this.top + 6, endFirstCentromero,  this.featureHeight ,attributesClip);
		this.trackNodeGroup.appendChild(rect);
		
		rect = SVG.createRectangle( this.left , this.top + 6, endFirstCentromero,  this.featureHeight ,attributesClip);
		this.trackNodeGroup.appendChild(rect);
		
		var clip = SVG.drawClip("clip_1"+this.id, rect, this.trackNodeGroup);
		this.groupNodeFirstCentromero = SVG.drawGroup(this.trackNodeGroup, [["id", "clip_group"], ["clip-path", "url(#clip_1" +this.id+")"]]);
		
		
		//Segundo Centromero
		var rectLeft = Math.ceil(endFirstCentromero + this.left);// this.left + border;
		var rectWidth =  Math.ceil(this.right - endFirstCentromero - this.left - 2); //this.left + this.right - border;
		
		
		rect = SVG.createRectangle(rectLeft, this.top + 6,  rectWidth, this.featureHeight, attributesClip);
		this.trackNodeGroup.appendChild(rect);
		
		rect = SVG.createRectangle(rectLeft, this.top + 6, rectWidth, this.featureHeight, attributesClip);
		this.trackNodeGroup.appendChild(rect);
		
		clip = SVG.drawClip("clip_2"+this.id, rect, this.trackNodeGroup);
		groupNodeSecondCentromero = SVG.drawGroup(this.trackNodeGroup, [["id", "clip_group"], ["clip-path", "url(#clip_2" +this.id+")"]]);
		
	}
	
	
	for (var i = 0; i < this.features.length;  i++)
	{
		var feature = this.features[i];
		this._drawCytoband(feature);
		
		if (i == 0){
			if (this.label){
				var textAttr = [["id", this.id_ + "title"],["font-size", "9"]];
				if (this.vertical){
					SVG.drawText(this.left  , this.height, feature.chromosome, this.labelNodeGroup, textAttr);
				}
			}
		}
	}
};
	
ChromosomeFeatureTrack.prototype._drawCytoband = function (feature){
	var _this = this;
	var color = stroke = this.getColorByStain(feature);
	var node = null;
	var exonWidth = (this.pixelInc  * (feature.end - feature.start));
	
	var attributes = [["fill", color],["id", this.id+"_" + feature.cytoband] , ["z-index", "10"],["stroke", stroke], ["style", "cursor:pointer"]];

	if (this.maxFeatureEnd < feature.end){
		this.maxFeatureEnd = feature.end;
	}
	
	if (this.vertical){
		node = SVG.createRectangle( Math.ceil(this.left), Math.ceil(this.top + this.pixelInc  * (feature.start - this.start)) , Math.ceil(this.right-this.left) , Math.ceil(exonWidth) ,  attributes);
		if (!this.centromerosVisited){
			groupNodeSecondCentromero.appendChild(node);
		}
		else{
			this.groupNodeFirstCentromero.appendChild(node);
		}
	}
	else{
		node = SVG.createRectangle(Math.ceil(this.left + this.pixelInc  * (feature.start - this.start)), this.top , exonWidth , Math.ceil(this.featureHeight) + 6  ,attributes);
		if (!this.centromerosVisited){
			this.groupNodeFirstCentromero.appendChild(node);
		}
		else{
			groupNodeSecondCentromero.appendChild(node);
		}
		
		
		if (this.label){
			var textAttr = [["fill", "black"],["id", this.id_ + "title"] ,["opacity", "1"],["font-size", "7"]];
			var x = this.left + this.pixelInc  * ((feature.start + (feature.end - feature.start)/2) - this.start);
			var y = this.height + 10;
			textAttr.push(["transform", "translate("+ x +", " + y + "), rotate(270)"]);
			SVG.drawText(0, 0, feature.cytoband, this.labelNodeGroup, textAttr);
		}
	}

	node.addEventListener("click", function(evt){ 
		if (_this.vertical){
			_this.click.notify(feature);
		}
		else{
			var point = _this._getSVGCoordenates(evt);
			var genomicPosition = Math.ceil((point.x - _this.left)/ _this.pixelInc);
			_this.click.notify(genomicPosition);
		}
	}, true);
	
	if (feature.stain=="acen"){
		this.centromerosVisited = true;
	}
};

ChromosomeFeatureTrack.prototype.draw = function (data){
	/** features */
	this.features = data.toJSON()[0];
	this.featuresIndex = new Object();
	
	/** Features dibujadas, me guardo las coordenadas donde pinto algo, para por ejemplo los SNP, 
	 * no tener que repetir si estan en la misma region */
	this.printedFeature = new Object();
	
	if (this.features != null){
		for (var i = 0; i< this.features.length; i++){
			this.featuresIndex[this.features[i].id]= i;
		}
		this.end = this.getEnd(this.features);
	}
	this._render();
};


/** SVG COORDENATES **/
ChromosomeFeatureTrack.prototype.getSVGCoordenates = function(evt){
	var p = this._svg.createSVGPoint();
    p.x = evt.clientX;
    p.y = evt.clientY;
    
    var m = this._svg.getScreenCTM(document.documentElement);
    p = p.matrixTransform(m.inverse());
    return p;
};

function GenomeBrowser(){
	
	  this.genomeViewer = new MasterSlaveGenomeViewer("id", "container_map");
	  this.karyotypeWidget = new KaryotypePanel("human", "container_map_karyotype", {"width":1000, "height":200, "trackWidth":15});
};

GenomeBrowser.prototype.draw = function(){
	var top = Ext.create('Ext.panel.Panel', {
        width: '1300',
        margins:'5 5 5 5',
        flex:3,
        //padding: '5 5 5 5',
        html:'<div id = "container_map"></div>'
		});

	var coordinatePanel = Ext.create('Ext.panel.Panel', {
        width: '1300',
        margins:'5 5 5 5',
       // height: '50px',
        //padding: '5 5 5 5',
        html:'<div id = "coordinates"><form><label >Location:&nbsp;&nbsp;</label><input type="hidden" name="db" value="core"><input name="r" id="loc_r" class="location_selector" style="width:250px" value="6:133017695-133161157" type="text">&nbsp;&nbsp;<input value="Go" type="submit" class="go-button"></form></div>'
		});  
		
		
	var bot = Ext.create('Ext.panel.Panel', {
        title:'bot',
        width: '100%',
        flex:1,
        split: true,
        html:'<div id = "container_map_karyotype" style="padding:0 0 0 200;text-align: center;width:100%;" ></div>'
		});

	 var handleAction = function(action){
			 if (action == 'ZoomIn'){
			 	genomeViewer.zoomIn();
			 }

			 if (action == 'ZoomOut'){
				 	genomeViewer.zoomOut();
				 }
			 
	       // Ext.example.msg('<b>Action</b>', 'You clicked "' + action + '"');
	    };

	    
	var menu = Ext.create('Ext.toolbar.Toolbar', {
		width: '100%',
        items: [
           /*     {
            xtype:'splitbutton',
            text: 'Menu Button',
            iconCls: 'add16',
            menu: [{text: 'Menu Item 1', handler: Ext.Function.pass(handleAction, 'Menu Item 1')}]
        },'-',*/
        {
            text: 'Zoom In',
            iconCls: 'add16',
            handler: Ext.Function.pass(handleAction, 'ZoomIn')
        },{
        	text: 'Zoom Out',
            iconCls: 'add16',
            
            handler: Ext.Function.pass(handleAction, 'ZoomOut')
        }
        //,'-',{
        //    text: 'Format',
       //     iconCls: 'add16',
          //  handler: Ext.Function.pass(handleAction, 'Format')
       // },'->',{
       //     text: 'Right',
       //     iconCls: 'add16',
          //  handler: Ext.Function.pass(handleAction, 'Right')
       // }
        ]

		});
		
	var center = Ext.create('Ext.panel.Panel', {
		layout : 'vbox',
        region: 'center',
        margins:5,
		items:[menu, top,coordinatePanel, bot]
		});

      var item2 = Ext.create('Ext.Panel', {
          title: 'Control',
          html: '&lt;empty panel&gt;',
          cls:'empty'
      });

      var item3 = Ext.create('Ext.Panel', {
          title: 'Accordion Item 3',
          html: '&lt;empty panel&gt;',
          cls:'empty'
      });

      var item4 = Ext.create('Ext.Panel', {
          title: 'Accordion Item 4',
          html: '&lt;empty panel&gt;',
          cls:'empty'
      });

      var item5 = Ext.create('Ext.Panel', {
          title: 'Accordion Item 5',
          html: '&lt;empty panel&gt;',
          cls:'empty'
      });


      
      
	var west = Ext.create('Ext.panel.Panel', {
        region: 'west',
        width: 200,
        margins:'5 5 5 5',
        split:true,
        width: 210,
        layout:'accordion',
        items: [ item2, item3, item4, item5]

		});

		
	
	var port = Ext.create('Ext.container.Viewport', {
    layout: 'border',
    items: [
    	center,
    	west
    ]
	});

  
    this.genomeViewer.draw(1, 25000000);
        

	
	
    this.karyotypeWidget.getFromCellBase();
};
	
function GenomeViewer(targetId, species, args) {
	var _this=this;
	this.id = "GenomeViewer#"+ Math.round(Math.random()*10000) +"#";
	
	this.menuBar = null;
	
	// if not provided on instatiation
	this.width =  $(document).width();
	this.height = $(document).height();
	this.targetId=null;
	
	//Default species
	this.species="hsa";
	this.speciesName="Homo sapiens";
	
	//Setting paramaters
	if (targetId != null){
		this.targetId=targetId;
	}
	if (species != null) {
		this.species = species.species;
		this.speciesName = species.name;
	}
	if (args != null){
		if(args.description != null){
			args.description = "beta";
		}
		if(args.menuBar != null){
			this.menuBar = args.menuBar;
		}
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.pluginsMenu != null) {
			this.pluginsMenu = args.pluginsMenu;
		}
	}
	//TODO Capturar el width al cambiar de tamaño y drawChromosome aver q pasa

	
	
	
	//Events i send
	this.onSpeciesChange = new Event();
	
	console.log(this.width+"x"+this.height);
	
	
	
	console.log(this.targetId);
	console.log(this.id);

	
	
	this.genomeWidget = null;// new GenomeWidget(this.id + "id",
//	this.chromosomeGenomeWidget = null;
	this.genomeWidgetProperties = new GenomeWidgetProperties(this.species,{
				windowSize : 1000000,
				pixelRatio : 0.0005,
				id:this.id
	});
	
	
	//Events i listen
	this.onSpeciesChange.addEventListener(function(sender,data){
		_this.species=data.species;
		_this.speciesName=data.name;
		Ext.getCmp(_this.id+"speciesMenuButton").setText(_this.speciesName);
		Ext.example.msg('Species', _this.speciesName+' selected.');
		
		Ext.getCmp(_this.id + "chromosomeMenuButton").menu = _this._getChromosomeMenu();

		_this.genomeWidgetProperties = new GenomeWidgetProperties(_this.species,{
			windowSize : 1000000,
			pixelRatio : 0.0005,
			id:_this.id
		});

		if(_this.targetId!=null){
			_this.draw();
		}
	});
	
	this.customTracksAddedCount = 1;
	/** position molona 1: 211615616 **/
	$(window).resize(function(ev,width,height) {

	});	
	
	//TODO check first if chromosome exists on the new specie
	this.chromosome = 13;
	this.position = 32889611;
};
GenomeViewer.prototype.setMenuBar = function(menuBar){
	this.menuBar = menuBar;
};

GenomeViewer.prototype.draw = function(){
	if(this.targetId!=null){
		this._getPanel(this.width,this.height);
	}
	this._render(this.chromosome,this.position);
	
	//this.setZoom(70);
	//this.setLocation(1, 211615616);
};

GenomeViewer.prototype._render = function(chromosome, position) {
	this.chromosome = chromosome;
	this.position = position;
	var start = this.position - (this.genomeWidgetProperties.windowSize);
	var end = this.position + (this.genomeWidgetProperties.windowSize);
	this._drawMasterGenomeViewer(this.chromosome, start, end);
	this.drawChromosome(chromosome, start, end);
	this._setScaleLabels();
};


//Gets the panel containing all genomeViewer
GenomeViewer.prototype._getPanel = function(width,height) {
	var _this=this;
	if(this._panel == null){
		var items = [];
		if(this.menuBar!=null){
			items.push(this.menuBar);
		}
		items.push(this._getNavigationBar());
		items.push(this._getChromosomePanel());
		items.push(this._getWindowSizePanel());
		items.push(this._getTracksPanel());
		items.push(this._getBottomBar());
		
		this._panel = Ext.create('Ext.panel.Panel', {
			renderTo:this.targetId,
	    	border:false,
	    	width:width,
	    	height:height,
			cls:'x-unselectable',
			layout: { type: 'vbox',align: 'stretch'},
			region : 'center',
			margins : '0 0 0 0',
			border : false,
			items :items
		});
	}
	
	return this._panel;
};

GenomeViewer.prototype.setSize = function(width,height) {
	if(width<500){width=500;}
	if(width>2400){width=2400;}//if bigger does not work TODO why?
	this.width=width;
	this.height=height;
	this._getPanel().setSize(width,height);
	this.draw();
};


//NAVIGATION BAR
//Creates the species empty menu if not exist and returns it
GenomeViewer.prototype._getSpeciesMenu = function() {
	//items must be added by using  setSpecieMenu()
	if(this._specieMenu == null){
		this._specieMenu = Ext.create('Ext.menu.Menu', {
			margin : '0 0 10 0',
			floating : true,
			items : []
		});
	}
	return this._specieMenu;
};
//Sets the species buttons in the menu
GenomeViewer.prototype.setSpecieMenu = function(speciesObj) {
	var _this = this;
	//Auto generate menu items depending of AVAILABLE_SPECIES config
	var menu = this._getSpeciesMenu();
	menu.hide();//Hide the menu panel before remove
	menu.removeAll(); // Remove the old species
	for ( var i = 0; i < speciesObj.length; i++) {
		menu.add({
					text:speciesObj[i].name,
					species:speciesObj[i].species,
					handler:function(este){
						//can't use the i from the FOR so i create the object again
						_this.setSpecie({name: este.text, species: este.species});
				}
		});
	};
};
//Sets the new specie and fires an event
GenomeViewer.prototype.setSpecie = function(text){
	this.onSpeciesChange.notify(text);
};

GenomeViewer.prototype._getChromosomeMenu = function() {
	var _this = this;
	var chrStore= Ext.create('Ext.data.Store', {
		fields: ["name"],
		autoLoad:false
	});
	/*Chromolendar*/
 	var chrView = Ext.create('Ext.view.View', {
	    store : chrStore,
        selModel: {
            mode: 'SINGLE',
            listeners: {
                selectionchange:function(este,selNodes){
                	_this.setChromosome(selNodes[0].data.name);
                	chromosomeMenu.hide();
                }
            }
        },
        cls: 'list',
     	trackOver: true,
        overItemCls: 'list-item-hover',
        itemSelector: '.chromosome-item', 
        tpl: '<tpl for="."><div style="float:left" class="chromosome-item">{name}</div></tpl>'
//	        tpl: '<tpl for="."><div class="chromosome-item">chr {name}</div></tpl>'
    });
 	var chrContainer = Ext.create('Ext.container.Container', {
 		width:125,
//	 		height:300,
 		autoScroll:true,
 		style:'background-color:#fff',
 		items : [chrView]
 	});
	/*END chromolendar*/
 	
 	var chromosomeMenu = Ext.create('Ext.menu.Menu', {
//			width:100,
 		almacen :chrStore,
		items : [chrContainer]
	});
	
	//Load Chromosomes for his menu
	var karyotypeCellBaseDataAdapter = new KaryotypeCellBaseDataAdapter(this.species);
	karyotypeCellBaseDataAdapter.successed.addEventListener(function() {
		var chromosomeData = [];
		for (var i = 0; i < karyotypeCellBaseDataAdapter.chromosomeNames.length; i++) {
			chromosomeData.push({'name':karyotypeCellBaseDataAdapter.chromosomeNames[i]});
		}
		chrStore.loadData(chromosomeData);
		
	});
	karyotypeCellBaseDataAdapter.fill();
	
	return chromosomeMenu;
};


GenomeViewer.prototype._showKaryotypeWindow = function() {
	var _this = this;
	
	var karyotypePanelWindow = new KaryotypePanelWindow(this.species,{genomeViewer:this});
	
	/** Events i listen **/
	karyotypePanelWindow.onRendered.addEventListener(function(evt, feature) {
		karyotypePanelWindow.select(_this.chromosome, _this.position, _this.position);
	});
	karyotypePanelWindow.onMarkerChanged.addEventListener(function(evt, data) {
		_this.setLocation(data.chromosome, data.start);
	});
	
	karyotypePanelWindow.draw();
};


GenomeViewer.prototype._getZoomSlider = function() {
	var _this = this;
	if(this._zoomSlider==null){
		this._zoomSlider = Ext.create('Ext.slider.Single', {
			id : this.id + ' zoomSlider',
			width : 200,
			minValue : 0,
			hideLabel : false,
			maxValue : 100,
			value : _this.genomeWidgetProperties.getZoom(),
			useTips : true,
			increment : 10,
			tipText : function(thumb) {
				return Ext.String.format('<b>{0}%</b>', thumb.value);
			}
		});
		
		this._zoomSlider.on("changecomplete", function(slider, newValue) {
			_this._handleNavigationBar("ZOOM", newValue);
		});
	}
	return this._zoomSlider;
};




//Action for buttons located in the NavigationBar
GenomeViewer.prototype._handleNavigationBar = function(action, args) {
	var _this = this;
    if (action == 'OptionMenuClick'){
            this.genomeWidget.showTranscripts = Ext.getCmp("showTranscriptCB").checked;
            this.genomeWidgetProperties.setShowTranscripts(Ext.getCmp("showTranscriptCB").checked);
            this.refreshMasterGenomeViewer();
    }
    if (action == 'ZOOM'){
    	this.setZoom(args);
    }
    if (action == 'GoToGene'){
        var geneName = Ext.getCmp(this.id+'tbGene').getValue();
        this.openGeneListWidget(geneName);
        
    }
    if (action == '+'){
    	   var zoom = this.genomeWidgetProperties.getZoom();
    	   if (zoom < 100){
    		   this.setZoom(zoom + 10);
    	   }
    }
    if (action == '-'){
    	 var zoom = this.genomeWidgetProperties.getZoom();
  	   if (zoom >= 10){
  		   this.setZoom(zoom - 10);
  	   }
    }
    
    if (action == 'Go'){
    	var value = Ext.getCmp(this.id+'tbCoordinate').getValue();
        var position = value.split(":")[1];
        this.chromosome = value.split(":")[0];
        
        this.setLocation(this.chromosome, position);
    }
    
    
    if (action == '<'){
        var position = Ext.getCmp(this.id+'tbCoordinate').getValue();
        this.setLocation(this.chromosome, this.position - (this.genomeWidgetProperties.windowSize/2));
    }
    
    
    if (action == '>'){
        var position = Ext.getCmp(this.id+'tbCoordinate').getValue();
        this.setLocation(this.chromosome, this.position + (this.genomeWidgetProperties.windowSize/2));
    }
};






GenomeViewer.prototype._getNavigationBar = function() {
	var _this = this;
	

	
	var toolbar = Ext.create('Ext.toolbar.Toolbar', {
		cls:"bio-toolbar",
		height:35,
//		enableOverflow:true,//if the field is hidden getValue() reads "" because seems the hidden field is a different object
		border:0,
		items : [
		         {
		        	 id:this.id+"speciesMenuButton",
		        	 text : this.speciesName,
		        	 menu: this._getSpeciesMenu()			
		         },{
		        	 id: this.id + "chromosomeMenuButton",
		        	 text : 'Chromosome',
		        	 menu: this._getChromosomeMenu()			
		         },{
		        	 text : 'Karyotype',
		        	 handler:function() {
		        		 _this._showKaryotypeWindow();
		        	 }
		         },{
		        	 text : '<',
		        	 margin : '0 0 0 15',
		        	 handler : function() {
		        		 _this._handleNavigationBar('<');
		        	 }
		         }, {
		        	 margin : '0 0 0 5',
		        	 iconCls:'icon-zoom-out',
		        	 handler : function() {
		        		 _this._handleNavigationBar('-');
		        	 }
		         }, 
		         this._getZoomSlider(), 
		         {
		        	 margin:'0 5 0 0',
		        	 iconCls:'icon-zoom-in',
		        	 handler :  function() {
		        		 _this._handleNavigationBar('+');
		        	 }
		         },{
		        	 text : '>',
		        	 handler : function() {
		        		 _this._handleNavigationBar('>');
		        	 }
		         },'->',{
		        	 xtype : 'label',
		        	 text : 'Position:',
		        	 margins : '0 0 0 10'
		         },{
		        	 xtype : 'textfield',
		        	 id : this.id+'tbCoordinate',
		        	 text : this.chromosome + ":" + this.position,
		        	 listeners:{
		        		 specialkey: function(field, e){
		        			 if (e.getKey() == e.ENTER) {
		        				 _this._handleNavigationBar('Go');
		        			 }
		        		 }
		        	 }
		         },{
		        	 text : 'Go',
		        	 handler : function() {
		        		 _this._handleNavigationBar('Go');
		        	 }
		         },{
		        	 xtype : 'label',
		        	 text : 'Search:',
		        	 margins : '0 0 0 10'
		         },{
		        	 xtype : 'textfield',
		        	 id : this.id+'tbGene',
		        	 emptyText:'gene, protein, transcript',
		        	 name : 'field1',
		        	 listeners:{
		        		 specialkey: function(field, e){
		        			 if (e.getKey() == e.ENTER) {
		        				 _this._handleNavigationBar('GoToGene');
		        			 }
		        		 }
		        	 }
		         },{
		        	 text : 'Go',
		        	 handler : function() {
		        		 _this._handleNavigationBar('GoToGene');
		        	 }
		         }]
	});
	return toolbar;
};
//NAVIGATION BAR

//CHROMOSOME PANEL
//Sets the newChromosome and changes Location to same with on different chromosome
GenomeViewer.prototype.setChromosome = function(chromosome) {
	this.setLocation(chromosome, this.position);
	this._setChromosomeLabel(chromosome);
};
GenomeViewer.prototype._setChromosomeLabel = function(chromosome) {
//	var text = '<span class="ssel">'+this.species+'</span>'+"<br>Chromosome "+ chromosome;
	document.getElementById(this._getChromosomeLabelID()).innerHTML = "Chromosome&nbsp;"+ chromosome;
	Ext.getCmp(this.id + "chromosomeMenuButton").setText("Chromosome "+ chromosome );
};
//CHROMOSOME PANEL
GenomeViewer.prototype._getChromosomeContainerID = function() {
	return this.id + "container_map_one_chromosome";
};

GenomeViewer.prototype._getChromosomeLabelID = function() {
	return this.id + "chromosome_label_id";
};
GenomeViewer.prototype._getChromosomePanel = function() {
	
	var label = Ext.create('Ext.container.Container', {
		id:this._getChromosomeLabelID(),
		margin:5
	});
	var svg = Ext.create('Ext.container.Container', {
		id:this._getChromosomeContainerID(),
		margin:10
	});
	return Ext.create('Ext.container.Container', {
		height : 70,
	    layout: {type: 'table', columns: 2},
		items:[label,svg]
//		html : '<br/><table style="border:0px" ><tr><td id="'
//				+ this._getChromosomeLabelID()
//				+ '" style="padding-left: 8px">Chromosome&nbsp;15</td><td><div id="'
//				+ this._getChromosomeContainerID() + '"></td></tr></div>'
	});
};
//CHROMOSOME PANEL


//WINDOWSIZE PANEL
GenomeViewer.prototype._getWindowSizePanel = function() {
	var windowSizeLabel = Ext.create('Ext.toolbar.TextItem', {
		id:this.id+"windowSizeLabel",
		text:'window Size'
	});
	return Ext.create('Ext.container.Container', {
		style:'text-align:center;',
		height : 20,
		items:windowSizeLabel
	});
};
//WINDOWSIZE PANEL




//TOP PANEL
GenomeViewer.prototype._getTracksPanelID = function() {
	return this.id+"master";
};

GenomeViewer.prototype._getTracksPanel = function() {
	if (this._mainPanel == null) {
		this._mainPanel = Ext.create('Ext.panel.Panel', {
			autoScroll:true,
			flex: 1,  
			border:false,
//			margins:'0 5 2 0',
			html:'<div height=2000px; overflow-y="scroll"; id = "'+ this._getTracksPanelID() +'"></div>'
		});
	}
	return this._mainPanel;
};
//TOP PANEL


//BOTTOM BAR

GenomeViewer.prototype._getBottomBar = function() {
	var geneFeatureFormatter = new GeneFeatureFormatter();
	var snpFeatureFormatter = new SNPFeatureFormatter();
	var geneLegendPanel = new LegendPanel({title:'Gene legend'});
	var snpLegendPanel = new LegendPanel({title:'SNP legend'});
//	legendPanel.getPanel(geneFeatureFormatter.getBioTypeColors());
//	legendPanel.getColorItems(geneFeatureFormatter.getBioTypeColors());
	
	var scaleLabel = Ext.create('Ext.draw.Component', {
		id:this.id+"scaleLabel",
        width: 100,
        height: 20,
        items:[
            {type: 'text',text: 'Scale number',fill: '#000000',x: 10,y: 5,width: 5, height: 20},
            {type: 'rect',fill: '#000000',x: 0,y: 0,width: 2, height: 20},
			{type: 'rect',fill: '#000000',x: 2,y: 12, width: 100,height: 3},
			{type: 'rect',fill: '#000000',x: 101,y: 0, width: 2,height: 20}
		]
	});
//	scale.surface.items.items[0].setAttributes({text:'num'},true);
	var taskbar = Ext.create('Ext.toolbar.Toolbar', {
		id:this.id+'uxTaskbar',
		winMgr: new Ext.ZIndexManager(),
		enableOverflow:true,
		cls: 'bio-hiddenbar',
		height:28,
		flex:1
	});
	var legendBar = Ext.create('Ext.toolbar.Toolbar', {
		cls: 'bio-hiddenbar',
		width:300,
		height:28,
		items : [scaleLabel, 
		         '-',
		         geneLegendPanel.getButton(geneFeatureFormatter.getBioTypeColors()),
		         snpLegendPanel.getButton(snpFeatureFormatter.getBioTypeColors()),
		         '->']
	});
	
	var bottomBar = Ext.create('Ext.container.Container', {
		layout:'hbox',
		cls:"bio-botbar x-unselectable",
		height:30,
		items : [taskbar,legendBar]
	});
	return bottomBar;
};
//BOTTOM BAR





GenomeViewer.prototype.openListWidget = function(category, subcategory, query, resource, title, gridField) {
	var _this = this;
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function(evt, data) {
		
		var genomicListWidget = new GenomicListWidget({title:title, gridFields:gridField,genomeViewer:_this});
		genomicListWidget.draw(cellBaseDataAdapter.dataset.toJSON(), query );
		
		genomicListWidget.onSelected.addEventListener(function(evt, feature) {
			if (feature != null) {
				if (feature.chromosome != null) {
					_this.setLocation(feature.chromosome, feature.start);
				}
			}
		});
		
		genomicListWidget.onTrackAddAction.addEventListener(function(evt, features) {
			if (features != null) {
				_this.addTrackFromFeatures(features);
			}
		});
	});
	cellBaseDataAdapter.fill(category, subcategory, query, resource);
};






GenomeViewer.prototype.openGeneListWidget = function(geneName) {
	this.openListWidget("feature", "gene", geneName.toString(), "info", "Gene List");
};

GenomeViewer.prototype.openTranscriptListWidget = function(name) {
	this.openListWidget("feature", "transcript", name.toString(), "info", "Transcript List", ["externalName","stableId", "biotype", "chromosome", "start", "end", "strand", "description"]);
};

GenomeViewer.prototype.openExonListWidget = function(geneName) {
	var _this = this;
	var cellBase = new CellBaseDataAdapter(this.species);
	cellBase.successed.addEventListener(function(evt, data) {
		var window = new GenomicListWidget({title:'Exon List', gridFields:["stableId", "chromosome","start", "end", "strand"]});	
		var array = new Array();
		array.push(cellBase.dataset.toJSON());
		window.draw(array, geneName );
		window.onSelected.addEventListener(function(evt, feature) {
			if (feature != null) {
				if (feature.chromosome != null) {
					_this.setLocation(feature.chromosome, feature.start);
				}
			}
		});
		
		
	});
	cellBase.fill("feature", "exon", geneName.toString(), "info");
};

GenomeViewer.prototype.openSNPListWidget = function(snpName) {
	this.openListWidget("feature", "snp", snpName.toString(), "info", "SNP List", ["name", "variantAlleles", "ancestralAllele", "mapWeight",  "position", "sequence"]);
};

GenomeViewer.prototype.openGOListWidget = function(goList) {
	var _this = this;
	var cellBase = new CellBaseDataAdapter(this.species);
	cellBase.successed.addEventListener(function(evt, data) {
		
		var geneNames = new Array();
		for (var i = 0; i < cellBase.dataset.toJSON()[0].length; i++){
			geneNames.push(cellBase.dataset.toJSON()[0][i].displayId);
		}
		_this.openGeneListWidget(geneNames);
	});
	cellBase.fill("feature", "id", goList.toString(), "xref?dbname=ensembl_gene&");
};



GenomeViewer.prototype.drawChromosome = function(chromosome, start, end) {
	this._setChromosomeLabel(chromosome);
	DOM.removeChilds(this._getChromosomeContainerID());
	var width = this.width - 100;
	this.chromosomeFeatureTrack = new ChromosomeFeatureTrack(this.id + "chr", document.getElementById(this._getChromosomeContainerID()), this.species,{
				top : 5,
				bottom : 20,
				left : 10,
				right : width - 100,
				width : width,
				height : 40,
				label : true,
				"vertical" : false,
				"rounded" : 4
			});

	var _this = this;
	var dataAdapter = new RegionCellBaseDataAdapter(this.species,{resource : "cytoband"});
	dataAdapter.successed.addEventListener(function(evt, data) {
				_this.chromosomeFeatureTrack.draw(dataAdapter.dataset);
				_this.chromosomeFeatureTrack.click.addEventListener(function(evt, data) {
							_this.setLocation(_this.chromosome, data);
						});
			});

	dataAdapter.fill(chromosome, 1, 260000000, "cytoband");
};


GenomeViewer.prototype._setScaleLabels = function() {
	var value = Math.floor(100/this.genomeWidgetProperties.getPixelRatio()) + " nt ";
	Ext.getCmp(this.id+"scaleLabel").surface.items.items[0].setAttributes({text:value},true);
	
	var value10 = "Viewing "+Math.floor(100/this.genomeWidgetProperties.getPixelRatio())*10 + " nts ";
	Ext.getCmp(this.id+"windowSizeLabel").setText(value10);
};

GenomeViewer.prototype.setZoom = function(value) {
	this.genomeWidgetProperties.setZoom(value);
	
	this.position = this.genomeWidget.getMiddlePoint();
	this._getZoomSlider().setValue(value);
	
	this.genomeWidget.trackCanvas._goToCoordinateX(this.position- (this.genomeWidget.trackCanvas.width / 2)/ this.genomeWidgetProperties.getPixelRatio());
	this._setScaleLabels();
	this.refreshMasterGenomeViewer();
};


GenomeViewer.prototype.setLocation = function(chromosome, position) {
	this.chromosome = chromosome;
	this.position = Math.ceil(position);
	
	this.refreshMasterGenomeViewer();
	this.drawChromosome(this.chromosome, 1, 26000000);
};




GenomeViewer.prototype._setPositionField = function(chromosome, position) {
	if (position == NaN){
		position = 1000000;
	}
	if (position < 0){
		Ext.getCmp(this.id+'tbCoordinate').setValue(chromosome + ":" + 0);
	}
	else{
		Ext.getCmp(this.id+'tbCoordinate').setValue( chromosome + ":" + Math.ceil(position));
	}
};

GenomeViewer.prototype.refreshMasterGenomeViewer = function() {
	this.genomeWidget.clear();
	this.updateRegionMarked(this.chromosome, this.position);
	this._drawMasterGenomeViewer();
	
};

GenomeViewer.prototype._getWindowsSize = function() {
	var zoom = this.genomeWidgetProperties.getZoom();
	return this.genomeWidgetProperties.getWindowSize(zoom);
};
GenomeViewer.prototype._drawMasterGenomeViewer = function() {
		
		var _this = this;
		this._getPanel().setLoading("Retrieving data");
//		this.updateTracksMenu();

		
		this.genomeWidget = new GenomeWidget(this.id + "master", this._getTracksPanelID(), {
		                pixelRatio: this.genomeWidgetProperties.getPixelRatio(),
		                width:this.width-15,
//		                height:  this.height
		                height:  2000
		        });

		var zoom = this.genomeWidgetProperties.getZoom();

//		console.log(this.genomeWidgetProperties.getTrackByZoom(zoom).length);
		
		if (this.genomeWidgetProperties.getTrackByZoom(zoom).length > 0){
			for ( var i = 0; i < this.genomeWidgetProperties.getTrackByZoom(zoom).length; i++) {
				var track =  this.genomeWidgetProperties.getTrackByZoom(zoom)[i];
				track.top = track.originalTop;
				track.height = track.originalHeight;
				track.clear();
				this.genomeWidgetProperties.getDataAdapterByZoom(zoom)[i].datasets = new Object();
				this.genomeWidget.addTrack(track, this.genomeWidgetProperties.getDataAdapterByZoom(zoom)[i]);
			}
			
			var start = Math.ceil(this.position - (this._getWindowsSize()));// - (this._getWindowsSize()/6);
			var end = Math.ceil(this.position +   (this._getWindowsSize()));// - (this._getWindowsSize()/6);
			
			if (start < 0){ start = 0;}
			
			this.genomeWidget.onMarkerChange.addEventListener(function (evt, middlePosition){
				var window = _this.genomeWidgetProperties.windowSize/2;
				var start = middlePosition.middle - window;
				if (start < 0 ){start = 0;}
				_this.updateRegionMarked(_this.chromosome, middlePosition.middle);
			});
			 
			this.genomeWidget.onRender.addEventListener(function (evt){
				_this._getPanel().setLoading(false);
				_this.genomeWidget.trackCanvas.selectPaintOnRules(_this.position);
				

			 });
			 
			this._setPositionField(this.chromosome, this.position);
			this.genomeWidget.draw(this.chromosome, start, end);

			
		}
		else{
			_this._getPanel().setLoading("No tracks to display");
		}
};

GenomeViewer.prototype.updateRegionMarked = function(chromosome, middlePosition) {
	var window = this.genomeWidgetProperties.windowSize / 2;

	var start = middlePosition - window;
	if (start < 0) {
		start = 0;
	}
	var end = middlePosition + window;

	this.chromosomeFeatureTrack.select(start, end);
	
//	this.chromosomeFeatureTrack.mark({chromosome:this.chromosome, start:this.position, end:this.position}, "red");
};






/** DAS MENU * */
GenomeViewer.prototype.loadDASTrack = function(name, url) {
//	var counter = 1;	
//	while (this.genomeWidgetProperties.tracks[name] != null)
//	{
//		counter++;
//		var aux =  name + "("+ counter+")";
//		if(this.genomeWidgetProperties.tracks[aux] == null){
//			name =aux;
//		}
//	}
	
	if(this.genomeWidgetProperties.tracks[name] == undefined){
		
		var dasDataAdapter2 = new DasRegionDataAdapter({url : url});
		
		var dasTrack1 = new FeatureTrack("vcf", null, this.species,{
			top : 10,
			left : 0,
			height : 10,
//			labelHeight : 12,
//			featureHeight : 12,
			title : name,
			opacity : 0.9,
			titleFontSize : 9,
			forceColor : "purple",
			label : true,
			avoidOverlapping : true,
			pixelSpaceBetweenBlocks : 100,
			allowDuplicates : true,
			backgroundColor : "#FCFFFF",
			isAvalaible : false
		});
		this.genomeWidgetProperties.addCustomTrackByZoom(0, 50, dasTrack1,dasDataAdapter2);
		var dasTrack = new FeatureTrack("vcf", null, this.species,{
			top : 10,
			left : 0,
			height : 10,
//			labelHeight : 10,
//			featureHeight :10,
			title : name,
			titleFontSize : 9,
			forceColor : "#000000",
			label : true,
			avoidOverlapping : true,
			pixelSpaceBetweenBlocks : 100,
			allowDuplicates : true,
			backgroundColor : "#FCFFFF",
			isAvalaible : false
		});
		this.genomeWidgetProperties.addCustomTrackByZoom(60, 100, dasTrack,dasDataAdapter2);
	}
	
//	this.refreshMasterGenomeViewer();
};

//TODO aqui estaba getDasMenu


GenomeViewer.prototype.addFeatureTrack = function(title, dataadapter) {
	var _this = this;
	this._getPanel().setLoading();
	if (dataadapter != null) {
		
		var vcfTrack = new HistogramFeatureTrack("vcf", null, this.species,{
			top : 20,
			left : 0,
			height : 20,
			featureHeight : 18,
			title : title,
			titleFontSize : 9,
			titleWidth : 70,
			label : false,
			forceColor : "purple",
			intervalSize : 500000
		});
		
		_this.genomeWidgetProperties.addCustomTrackByZoom(0, 0, vcfTrack, dataadapter);

		var vcfTrack3 = new HistogramFeatureTrack("vcf", null, this.species,{
					top : 20,
					left : 0,
					height : 20,
					featureHeight : 18,
					title : title,
					titleFontSize : 9,
					titleWidth : 70,
					label : false,
					forceColor : "purple",
					intervalSize : 150000
				});
		_this.genomeWidgetProperties.addCustomTrackByZoom(10, 20, vcfTrack3, dataadapter);
		
		var vcfTrack2 = new FeatureTrack("vcf", null, this.species,{
					top : 10,
					left : 0,
					height : 10,
					title : title,
					label : false,
					avoidOverlapping : true,
					pixelSpaceBetweenBlocks : 1,
					allowDuplicates : true
				});
		_this.genomeWidgetProperties.addCustomTrackByZoom(30, 80, vcfTrack2, dataadapter);

		var vcfTrack2 = new FeatureTrack("vcf", null, this.species,{
					top : 10,
					left : 0,
					height : 10,
					title : title,
//					forceColor : "purple",
					label : true,
					avoidOverlapping : true,
					pixelSpaceBetweenBlocks : 75,
					allowDuplicates : true
				});
		_this.genomeWidgetProperties.addCustomTrackByZoom(90, 90, vcfTrack2, dataadapter);
		
		var vcfTrack100 = new SNPFeatureTrack("vcf", null, this.species,{
			top : 10,
			left : 0,
			height : 20,
			title : title,
			featureHeight:10,
//			forceColor : "purple",
			label : true,
			avoidOverlapping : true,
			pixelSpaceBetweenBlocks : 75,
			allowDuplicates : true
		});
		_this.genomeWidgetProperties.addCustomTrackByZoom(100, 100, vcfTrack100, dataadapter);
		
		_this._drawMasterGenomeViewer();
	}
};








GenomeViewer.prototype.addTrackFromFeatures = function(features, trackName) {
	var localRegionAdapter = new LocalRegionDataAdapter();
	localRegionAdapter.loadFromFeatures(features);
	
	if(trackName==null){trackName="";}
	
	this.addFeatureTrack( trackName.substr(0,20) + " #" +this.customTracksAddedCount,localRegionAdapter);
	this.customTracksAddedCount++;
};

GenomeViewer.prototype.addTrackFromFeaturesList = function(data) {
	var features = new Array();
	
	for ( var i = 0; i < data.features.length; i++) {
		for ( var j = 0; j < data.features[i].length; j++) {
			features.push(data.features[i][j]);
		}
	}
	this.addTrackFromFeatures(features, data.trackName);
};


////TODO DEPRECATED
///** TRACKS * */
//GenomeViewer.prototype.updateTracksMenu = function() {
//	var _this = this;
//	
//	if (this.tracks == null){
//		this.tracks = new Object();
//	}
//	
//	for ( var i = 0; i < this.genomeWidgetProperties.customTracks.length; i++) {
//		if (this.tracks[ this.genomeWidgetProperties.customTracks[i].titleName] == null){
//			this.tracksMenu.add({
//				text : this.genomeWidgetProperties.customTracks[i].titleName,
//				checked : this.genomeWidgetProperties.customTracks[i].title,
//				handler : function() {
//					_this.genomeWidgetProperties.tracks[this.text] = this.checked;
//					_this.refreshMasterGenomeViewer();
//				}
//			});
//			
//			this.tracks[this.genomeWidgetProperties.customTracks[i].titleName] = true;
//		}
//	}
////	for (var trackName in this.genomeWidgetProperties.customTracks) {
////		this.tracksMenu.add({
////					text : trackName,
////					checked : this.genomeWidgetProperties.tracks[trackName],
////					handler : function() {
////						_this.genomeWidgetProperties.tracks[this.text] = this.checked;
////						_this.refreshMasterGenomeViewer();
////					}
////				});
////	}
//};



//TODO MOVIDO A GENOMEMAPS

function GeneBlockManager () {
	this.data = new Object();
	this.data.queues = new Array();
	this.data.queues[0] = new Array();
	this.data.transcriptQueueCount = new Object();
	
	this.data.transcriptQueue = new Array();
	
};

GeneBlockManager.prototype.getGenesTrackCount = function(){
	return this.data.queues.length;
};


GeneBlockManager.prototype.getFeaturesFromGeneTrackIndex = function(index){
	return this.data.queues[index];
};

GeneBlockManager.prototype.toJSON = function(){
	return this.data;
};


GeneBlockManager.prototype.init = function(dataset){
	this.data.features = dataset;
	var features = this.data.features;
	for (var i = 0; i < features.length;  i++){
		var queueToDraw = this._searchSpace(features[i], this.data.queues);
		/** Insertamos en la cola para marcar el espacio reservado */
		this.data.queues[queueToDraw].push(features[i]);
		
		if (this.data.transcriptQueue[queueToDraw] == null){
			this.data.transcriptQueue.push(new Array());
		}

		this.data.TranscriptQueuesTest = new Array();
		for ( var j = 0; j < features[i].transcript.length; j++) {
			
			var featureAux = {"start": features[i].transcript[j].exon[0].start, "end":features[i].transcript[j].exon[features[i].transcript[j].exon.length -1 ].end};
			var queueTranscriptToDraw = this._searchSpace(featureAux, this.data.TranscriptQueuesTest);
			this.data.TranscriptQueuesTest[queueTranscriptToDraw].push(featureAux);
			
			if (this.data.transcriptQueue[queueToDraw][queueTranscriptToDraw] == null){
				this.data.transcriptQueue[queueToDraw].push(new Array());
			}
			this.data.transcriptQueue[queueToDraw][queueTranscriptToDraw].push(features[i].transcript[j]);
		}
		
	}
	return this.data.queues[queueToDraw].length;
};





/** True si dos bloques se solapan */
GeneBlockManager.prototype._overlapBlocks = function(block1, block2){
	if ((block1.start <= block2.end) && (block1.end >= block2.start)){
		return true;
	}
	return false;
};

/** Busca disponibilidad de espacio y devuelve el indice del layer donde debe insertarse */
GeneBlockManager.prototype._searchSpace = function(block1, queues){
//	var candidates = new Array();
	
	for (var i = 0; i < queues.length; i++ ){
//		console.log("Checking queueu " + i);
		var overlapping = new Array();
		for (var j = 0; j < queues[i].length; j++ ){
			var block2 = queues[i][j];
			overlapping.push((this._overlapBlocks(block1, block2)));	
//			overlapping.push((this._overlapBlocks(block2, block1)));	
		}
	
//		console.log(overlapping);
		/** no se solapa con ningun elemento de la cola i entonces devuelvo la capa */ 
		if (overlapping.valueOf(overlapping).indexOf(true)==-1){
//			console.log("inserto en: " + i);
//			console.log(overlapping);
//			candidates.push(i);
			return i;
		}
	}
	
	/*for ( var i = 0; i < candidates.length; i++) {
		var maxDistance = Number.MIN_VALUE;
		var farCandidate = 0;
		var distances = new Array();
		debugger
		if (candidates.length >1){
			var distance = Number.MIN_VALUE;
			
			for ( var j = 0; j < queues[candidates[i]].length; j++) {
				if (queues[candidates[i]][j].end < block1.start){
					distance = block1.start - queues[candidates[i]][j].end;
				}
				else{
					distance = queues[candidates[i]][j].start -  block1.end;
				}
				distances.push(distance);
				if (distance > maxDistance){
					maxDistance = distance;
					farCandidate = j;
				}
			}
		}
		console.log(candidates);
		console.log("far distances: " + distances);
		console.log("far distance: " + maxDistance);
		console.log("candidate: " + farCandidate);
		return candidates[farCandidate];
	}
	*/
	
	/** no me cabe en ninguna capa entonces creo una nueva */
	queues.push(new Array());
//	console.log("Neuva en: " + queues.length);
	/** no hemos encontrado ningun espacio en ninguna cola anterior */
	return queues.length - 1;
};GeneBlockManager.prototype.loadFromJSON = DataSet.prototype.loadFromJSON;
GeneBlockManager.prototype.loadFromFile = DataSet.prototype.loadFromFile;
GeneBlockManager.prototype.loadFromURL  = DataSet.prototype.loadFromURL;
//GeneBlockManager.prototype.validate  = 	    DataSet.prototype.validate;

function GeneBlockManager () {
	this.data = new Object();
};

GeneBlockManager.prototype.getGenesTrackCount = function(){
	return this.data.queues.length;
};


GeneBlockManager.prototype.getFeaturesFromGeneTrackIndex = function(index){
	return this.data.queues[index];
};

GeneBlockManager.prototype.toJSON = function(){
	return this.data;
};
GeneBlockManager.prototype.validate = function(){
	return true;
};

GeneBlockManager.prototype.sort = function(a, b){
	return (b.end - b.start) - (a.end - a.start);
};

GeneBlockManager.prototype.toDatasetFormatter = function(dataset){
	var features = new Array();
	try{
		for ( var i = 0; i < dataset.length; i++) {
			var geneFormatter = new GeneFeatureFormatter(dataset[i]);
			features.push(geneFormatter);
			if (dataset[i].transcript != null){
				var transcripts = dataset[i].transcript; //dataset[i].transcript.sort(this.sort);
				for ( var j = 0; j < transcripts.length; j++) {
					if (geneFormatter.transcript == null){
						geneFormatter.transcript = new Array();
					}
					geneFormatter.transcript.push(new TranscriptFeatureFormatter(dataset[i].transcript[j]));
				}
			}
		}
	}
	catch(e)
	{
		alert("ERROR: GeneBlockManager: " + e);
	}
	return features;
//	return this;
};
// JavaScript Document
function genomemapcanvas (targetID, args) {
	
	this.targetID = targetID;
	this.containers = new Array();
	this.tracks = new Array();
	
	this.start = args.coords.start;
	this.end = args.coords.end;
	
	this.features = new Object();
	
	this.rules = new Array();
	
	//Events
	this.click = new Event(this);
	this.renderedTrack = new Event(this);
	this.changeViewEvent = new Event(this);
};


genomemapcanvas.prototype.createNewContainer = function(id, width, height){
	return DOM.createNewElement("div", document.getElementById(this.targetID),[["id", id], ["style", "width:" + width + "; height:"+ height + ";overflow-y:auto"]]);
};

genomemapcanvas.prototype.addRule = function(track){
	this.rules.push(track);
	this.addTrack(track, "rule");
	
};

genomemapcanvas.prototype.addTrack = function(track, title){	
	this.tracks.push(track);
	this.renderTrack(this.tracks.length-1);
	this.features[track.id] = track.features;
	
	var _this = this;
	track.click.addEventListener(function (evt, feature){
			_this.clickonChild(feature);
	 });
};

genomemapcanvas.prototype.clickonChild = function(feature){
	this.click.notify(feature);
};


genomemapcanvas.prototype.moveLeft = function(){
	
	var step = (this.end -this.start)/4;
	this.start = parseFloat(this.start) -  parseFloat(step); 
	this.end =  parseFloat(this.end) -  parseFloat(step); 
	this.changeView(this.start, this.end);
};

genomemapcanvas.prototype.moveRight = function(){
	
	var step = (this.end - this.start)/4;
	this.start = parseFloat(this.start) +  parseFloat(step); 
	this.end =  parseFloat(this.end) +  parseFloat(step); 
	this.changeView(this.start, this.end);
};



genomemapcanvas.prototype.changeView = function(start, end){
	
	this.start = start;
	this.end = end;
	
	for (var i=0; i< this.tracks.length; i++){
		this.tracks[i].changeView(start, end);
	}
	DOM.removeChilds(this.targetID);
	this.changeViewEvent.notify({"start":start, "end":end});
	
	//cambiamos el inc del rule
	this.rules[0].inc = ((end - start)/50);
	this.render();
};

genomemapcanvas.prototype.renderTrack = function(indexTrack) {
	var container = this.createNewContainer(this.tracks[indexTrack].targetID, this.tracks[indexTrack].width, this.tracks[indexTrack].height);
	this.containers.push(container);
	this.tracks[indexTrack].draw();
	this.renderedTrack.notify(this.tracks[indexTrack].features);
};


genomemapcanvas.prototype.render = function(){
	for (var i=0; i< this.tracks.length; i++){
		this.renderTrack(i);
	}
	
};

genomemapcanvas.prototype.removeLastTrack = function(){
	this.tracks.pop();
	this.changeView(start, end);
};


VCFFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
VCFFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
VCFFileWidget.prototype.draw = FileWidget.prototype.draw;
VCFFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
VCFFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;

function VCFFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "VCF";
	args.tags = ["vcf"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
    this.chartWidgetQuality = new ChartWidget({height:300});
};

VCFFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"]),
	        this.chartWidgetQuality.getChart(["features","quality"])];
};



VCFFileWidget.prototype.loadFileFromLocal = function(file){
	var vcfAdapter = new VCFFileDataAdapter();
	this._fileLoad(vcfAdapter);
	vcfAdapter.loadFromFile(file);
};

VCFFileWidget.prototype._fileLoad = function(vcfAdapter){
	var _this = this;
	vcfAdapter.onRead.addEventListener(function(sender, id) {
		_this.dataAdapter = new VCFLocalRegionDataAdapter();
		_this.dataAdapter.loadFromFileDataAdapter(sender);
		
		var datastore = new Array();
	 	for ( var chromosome in _this.dataAdapter.featuresByChromosome) {
			datastore.push({ features: _this.dataAdapter.featuresByChromosome[chromosome].length, chromosome: chromosome });
		}
		
		var qualityStore = new Array();
		for ( var range in _this.dataAdapter.qualitycontrol) {
		
			qualityStore.push({features: _this.dataAdapter.qualitycontrol[range],  quality:range });
		}
		
	 	_this.chartWidgetByChromosome.getStore().loadData(datastore);
	 	_this.chartWidgetQuality.getStore().loadData(qualityStore);
	 	
	 	
	 	_this.panel.setLoading(false);
	 	_this.featureCountLabel.setText("Features count: " + _this.dataAdapter.features.length, false);
	 	_this.btnOk.enable();
	});
};

VCFFileWidget.prototype.loadFileFromServer = function(data){
	var vcfAdapter = new VCFFileDataAdapter();
	this._fileLoad(vcfAdapter);
	vcfAdapter.loadFromContent(data.data);
};SIFNetworkFileWidget.prototype.draw = NetworkFileWidget.prototype.draw;

function SIFNetworkFileWidget(args){
	if(args == null){
		var args={};
	};
	args.title='Import a Network SIF file';
	NetworkFileWidget.prototype.constructor.call(this, args);
};


SIFNetworkFileWidget.prototype.getFileUpload = function(){
	var _this = this;
	
	this.fileUpload = Ext.create('Ext.form.field.File', {
		msgTarget: 'side',
		allowBlank: false,
		emptyText:'SIF network file',
		flex:1,
		buttonText: 'Browse local',
		listeners: {
			change: function(){
				var sifdataadapter = new InteractomeSIFFileDataAdapter();
				var file = document.getElementById(_this.fileUpload.fileInputEl.id).files[0];				
				sifdataadapter.loadFromFile(file);
				sifdataadapter.onRead.addEventListener(function (sender, id){
					
					try{
						_this.content = sender; //para el onOK.notify event
						
						var vertices = sender.dataset.getVerticesCount();
						var edges = sender.dataset.getEdgesCount();
						
						var sif = new SIFFileDataAdapter().toSIF(sender.dataset);
						var tabularFileDataAdapter = new TabularFileDataAdapter();
						tabularFileDataAdapter.parse(sif);
						_this.gridStore.loadData(tabularFileDataAdapter.getLines());
						
						_this.infoLabel.setText('<span class="ok">File loaded sucessfully</span>',false);
						_this.countLabel.setText('vertices:<span class="info">'+vertices+'</span> edges:<span class="info">'+edges+'</span>',false);
						
					}catch(e){
						_this.infoLabel.setText('<span class="err">File not valid </span>'+e,false);
					};
					
				}); 
		
			}
	    }
	});
	
	return this.fileUpload;
};
function FileWidget(args){
	var _this=this;
	this.targetId = null;
	this.id = "FileWidget_" + Math.round(Math.random()*100000);
	this.wum = true;
	this.tags = [];
	
	this.args = args;
	
	if (args != null){
		if (args.targetId!= null){
			this.targetId = args.targetId;       
		}
		if (args.title!= null){
			this.title = args.title;    
			this.id = this.title+this.id;
		}
		if (args.wum!= null){
			this.wum = args.wum;    
		}
        if (args.tags!= null){
        	this.tags = args.tags;       
        }
	}
	
	this.dataAdapter = null;
	this.onOk = new Event(this);
	
	this.browserData = new BrowserDataWidget();
	/** Events i listen **/
	this.browserData.onSelect.addEventListener(function (sender, data){
		_this.trackNameField.setValue(data.filename);
		_this.fileNameLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
		_this.panel.setLoading();
	});	
    this.browserData.adapter.onReadData.addEventListener(function (sender, data){
    	_this.trackNameField.setValue(data.filename);
    	_this.fileNameLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
    	_this.loadFileFromServer(data);
	});	
};

FileWidget.prototype.getTitleName = function(){
	return this.trackNameField.getValue();
};


FileWidget.prototype.getFileFromServer = function(){
	//abstract method
};

FileWidget.prototype.loadFileFromLocal = function(){
	//abstract method
};

FileWidget.prototype.getChartItems = function(){
	//abstract method
	return [];
};

FileWidget.prototype.getFileUpload = function(){
	var _this = this;
	this.uploadField = Ext.create('Ext.form.field.File', {
		msgTarget : 'side',
//		flex:1,
		width:75,
		emptyText: 'Choose a local file',
        allowBlank: false,
		buttonText : 'Browse local',
		buttonOnly : true,
		listeners : {
			change : {
				fn : function() {
					_this.panel.setLoading();
			
					var file = document.getElementById(_this.uploadField.fileInputEl.id).files[0];
					_this.trackNameField.setValue(file.fileName);
					_this.fileNameLabel.setText('<span class="emph">'+ file.name +'</span> <span class="info">(local)</span>',false);
					_this.loadFileFromLocal(file);

				}
			}
		}
	});
	return this.uploadField;
};


FileWidget.prototype.draw = function(){
	var _this = this;
	
	if (this.openDialog == null){
	
		/** Bar for the chart **/
		var featureCountBar = Ext.create('Ext.toolbar.Toolbar');
		this.featureCountLabel = Ext.create('Ext.toolbar.TextItem', {
			html:'<span class="dis">No file loaded</span>'
		});
		featureCountBar.add([this.featureCountLabel]);
		
		/** Bar for the file upload browser **/
		var browseBar = Ext.create('Ext.toolbar.Toolbar',{cls:'bio-border-false'});
		browseBar.add(this.getFileUpload());
		
		this.panel = Ext.create('Ext.panel.Panel', {
			border: false,
			cls:'panel-border-top panel-border-bottom',
	//		padding: "0 0 10 0",
			title: "Previsualization",
		    items : this.getChartItems(),
		    bbar:featureCountBar
		});
		
	//	var colorPicker = Ext.create('Ext.picker.Color', {
	//	    value: '993300',  // initial selected color
	//	    listeners: {
	//	        select: function(picker, selColor) {
	//	            alert(selColor);
	//	        }
	//	    }
	//	});
		this.trackNameField = Ext.create('Ext.form.field.Text',{
			name: 'file',
            fieldLabel: 'Track Name',
            allowBlank: false,
            value: 'New track from '+this.title+' file',
            emptyText: 'Choose a name',
            flex:1
		});
		
		var panelSettings = Ext.create('Ext.panel.Panel', {
			border: false,
			layout: 'hbox',
			bodyPadding: 10,
		    items : [this.trackNameField]	 
		});
		
		
		if(this.wum){
			this.btnBrowse = Ext.create('Ext.button.Button', {
		        text: 'Browse server',
		        disabled:true,
//		        iconCls:'icon-local',
//		        cls:'x-btn-default-small',
		        handler: function (){
	    	   		_this.browserData.draw($.cookie('bioinfo_sid'),_this.tags);
	       		}
			});
			
			browseBar.add(this.btnBrowse);
			
			if($.cookie('bioinfo_sid') != null){
				this.sessionInitiated();
			}else{
				this.sessionFinished();
			}
		}
		
		this.fileNameLabel = Ext.create('Ext.toolbar.TextItem', {
			html:'<span class="emph">Select a <span class="info">local</span> file or a <span class="info">server</span> file from your account.</span>'
		});
		browseBar.add(['->',this.fileNameLabel]);
		
		
		
		this.btnOk = Ext.create('Ext.button.Button', {
			text:'Ok',
			disabled:true,
			handler: function(){ 
				_this.onOk.notify({title:_this.getTitleName(), dataAdapter:_this.dataAdapter});
				_this.openDialog.close();
			}
		});
		
		this.openDialog = Ext.create('Ext.ux.Window', {
			title : 'Open '+this.title+' file',
			taskbar:Ext.getCmp(this.args.genomeViewer.id+'uxTaskbar'),
			width : 800,
	//		bodyPadding : 10,
			resizable:false,
			items : [browseBar, this.panel, panelSettings],
			buttons:[this.btnOk, 
			         {text:'Cancel', handler: function(){_this.openDialog.close();}}],
			listeners: {
			    	scope: this,
			    	minimize:function(){
						this.openDialog.hide();
			       	},
			      	destroy: function(){
			       		delete this.openDialog;
			      	}
		    	}
		});
		
	}
	this.openDialog.show();
};

FileWidget.prototype.sessionInitiated = function (){
	if(this.btnBrowse!=null){
		this.btnBrowse.enable();
	}
};
FileWidget.prototype.sessionFinished = function (){
	if(this.btnBrowse!=null){
		this.btnBrowse.disable();
	}
};GFFFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
GFFFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
GFFFileWidget.prototype.draw = FileWidget.prototype.draw;
GFFFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
GFFFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;

function GFFFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "GFF";
	args.tags = ["gff"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
};

GFFFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"])];
};

GFFFileWidget.prototype.loadFileFromLocal = function(file){
	var gffAdapter = new GFFFileDataAdapter();
	this._fileLoad(gffAdapter);
	gffAdapter.loadFromFile(file);
};

GFFFileWidget.prototype._fileLoad = function(gffAdapter){
	var _this = this;
	gffAdapter.onRead.addEventListener(function(sender, id) {
		_this.dataAdapter = new GFFLocalRegionDataAdapter();
		_this.dataAdapter.loadFromFileDataAdapter(sender);
		
		var datastore = new Array();
	 	for ( var chromosome in _this.dataAdapter.featuresByChromosome) {
			datastore.push({ features: _this.dataAdapter.featuresByChromosome[chromosome].length, chromosome: chromosome });
		}
		
	 	_this.chartWidgetByChromosome.getStore().loadData(datastore);
	 	_this.panel.setLoading(false);
	 	_this.featureCountLabel.setText("Features count: " + _this.dataAdapter.features.length, false);
	 	_this.btnOk.enable();
	});
};

GFFFileWidget.prototype.loadFileFromServer = function(data){
	var gffAdapter = new GFFFileDataAdapter();
	this._fileLoad(gffAdapter);
	gffAdapter.loadFromContent(data.data);
};BEDFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
BEDFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
BEDFileWidget.prototype.draw = FileWidget.prototype.draw;
BEDFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
BEDFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;;

function BEDFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "BED";
	args.tags = ["bed"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
};

BEDFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"])];
};

BEDFileWidget.prototype.loadFileFromLocal = function(file){
	var bedAdapter = new BEDFileDataAdapter();
	this._fileLoad(bedAdapter);
	bedAdapter.loadFromFile(file);
};

BEDFileWidget.prototype._fileLoad = function(bedAdapter){
	var _this = this;
	bedAdapter.onRead.addEventListener(function(sender, id) {
		_this.dataAdapter = new BEDLocalRegionDataAdapter();
		_this.dataAdapter.loadFromFileDataAdapter(sender);
		
		var datastore = new Array();
	 	for ( var chromosome in _this.dataAdapter.featuresByChromosome) {
			datastore.push({ features: _this.dataAdapter.featuresByChromosome[chromosome].length, chromosome: chromosome });
		}
	 	
	 	_this.chartWidgetByChromosome.getStore().loadData(datastore);
	 	_this.panel.setLoading(false);
	 	_this.featureCountLabel.setText("Features count: " + _this.dataAdapter.features.length, false);
	 	_this.btnOk.enable();
	});
};

BEDFileWidget.prototype.loadFileFromServer = function(data){
	var bedAdapter = new BEDFileDataAdapter();
	this._fileLoad(bedAdapter);
	bedAdapter.loadFromContent(data.data);
};
function NetworkFileWidget(args){
	this.targetId = null;
	this.id = "NetworkFileWidget-" + Math.round(Math.random()*10000000);
	
	this.title = 'Open a Network JSON file';
	this.width = 600;
	this.height = 300;
	
    if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
    
    
	this.dataAdapter = null;
	this.onOk = new Event(this);
	
	this.previewId = this.id+'-preview';
};

NetworkFileWidget.prototype.getTitleName = function(){
	return Ext.getCmp(this.id + "_title").getValue();
};

NetworkFileWidget.prototype.getFileUpload = function(){
	var _this = this;
	
	this.fileUpload = Ext.create('Ext.form.field.File', {
		msgTarget: 'side',
		allowBlank: false,
		emptyText:'JSON network file',
		flex:1,
		buttonText: 'Browse local',
		listeners: {
			change: function(){
				var dataadapter = new FileDataAdapter();
				var file = document.getElementById(_this.fileUpload.fileInputEl.id).files[0];
				dataadapter.read(file);
				dataadapter.onRead.addEventListener(function (sender, content){
					
					try{
						_this.content = content.content; //para el onOK.notify event
						var json = JSON.parse(content.content);
						
						
						var graphDataset = new GraphDataset();
						graphDataset.loadFromJSON(json.dataset);
						
						var vertices = graphDataset.getVerticesCount();
						var edges = graphDataset.getEdgesCount();
						
						var sif = new SIFFileDataAdapter().toSIF(graphDataset);
						var tabularFileDataAdapter = new TabularFileDataAdapter();
						tabularFileDataAdapter.parse(sif);
						_this.gridStore.loadData(tabularFileDataAdapter.getLines());
						
						_this.infoLabel.setText('<span class="ok">File loaded sucessfully</span>',false);
						_this.countLabel.setText('vertices:<span class="info">'+vertices+'</span> edges:<span class="info">'+edges+'</span>',false);
					
					}catch(e){
						_this.infoLabel.setText('<span class="err">File not valid </span>'+e,false);
					};
					
//					console.log(content.content);
				});
			}
	    }
	});
	
	return this.fileUpload;
};

//NetworkFileWidget.prototype.loadJSON = function(content){
//	this.metaNetworkViewer.loadJSON(content);
//	this.draw(this.metaNetworkViewer.getDataset(), this.metaNetworkViewer.getFormatter(), this.metaNetworkViewer.getLayout());
//};
NetworkFileWidget.prototype.draw = function(){
	var _this = this;
	
	if (this.panel == null){
		/** Bar for the file upload browser **/
		var browseBar = Ext.create('Ext.toolbar.Toolbar',{cls:'bio-border-false'});
		browseBar.add(this.getFileUpload());
		
		this.infoLabel = Ext.create('Ext.toolbar.TextItem',{html:'Please select a network saved File'});
		this.countLabel = Ext.create('Ext.toolbar.TextItem');
		var infobar = Ext.create('Ext.toolbar.Toolbar',{cls:'bio-border-false'});
		infobar.add([this.infoLabel,'->',this.countLabel]);
		
//		/** Container for Preview **/
//		var previewContainer = Ext.create('Ext.container.Container', {
//			id:this.previewId,
//			cls:'x-unselectable',
//			flex:1,
//			autoScroll:true
//		});
		
		
		/** Grid for Preview **/
		this.gridStore = Ext.create('Ext.data.Store', {
		    fields: ["0","1","2"]
		});
		this.grid = Ext.create('Ext.grid.Panel', {
			border:false,
			flex:1,
		    store: this.gridStore,
		    columns: [{"header":"Node","dataIndex":"0",flex:1},{"header":"Node","dataIndex":"1",flex:1},{"header":"Node","dataIndex":"2",flex:1}],
		    features: [{ftype:'grouping'}],
		    tbar:browseBar,
		    bbar:infobar
		});
		
		
		this.panel = Ext.create('Ext.window.Window', {
			title : this.title,
			width: this.width,
			height:this.height,
			resizable:false,
			layout: { type: 'vbox',align: 'stretch'},
			items : [this.grid],
			buttons:[{text:'Ok', handler: function()
									{ 
											_this.onOk.notify(_this.content);
											_this.panel.close();
									}}, 
			         {text:'Cancel', handler: function(){_this.panel.close();}}],
			listeners: {
			    	scope: this,
			    	minimize:function(){
						this.panel.hide();
			       	},
			      	destroy: function(){
			       		delete this.panel;
			      	}
		    	}
		});
	}
	this.panel.show();
	
};
function UrlWidget(args){
	var _this=this;
	this.id = "UrlWidget_" + Math.round(Math.random()*10000000);
	this.targetId = null;
	
	this.title = "Custom url";
	this.width = 500;
	this.height = 400;
	
	if (args != null){
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
	
	this.onAdd = new Event(this);
};

UrlWidget.prototype.draw = function (){
	if(this.panel==null){
		this.render();
	}
	this.panel.show();
};

UrlWidget.prototype.render = function (){
	var _this=this;
	
    this.urlField = Ext.create('Ext.form.field.Text',{
    	margin:"0 2 2 0",
    	labelWidth : 30,
    	flex:1,
    	fieldLabel : 'URL',
		emptyText: 'enter a valid url',
		value : "http://www.ensembl.org/das/Homo_sapiens.GRCh37.gene/features",
		listeners : { change: {fn: function(){ var dasName = this.value.split('/das/')[1].split('/')[0];
											   _this.trackNameField.setValue(dasName); }}
		}
    });
    this.checkButton = Ext.create('Ext.button.Button',{
		text : 'Check',
		handler : function() {
			_this.form.setLoading();
			var dasDataAdapter = new DasRegionDataAdapter({
				url : _this.urlField.getValue()
			});

			dasDataAdapter.successed.addEventListener(function() {
				_this.contentArea.setValue(dasDataAdapter.xml);
				_this.form.setLoading(false);
			});

			dasDataAdapter.onError.addEventListener(function() {
				_this.contentArea.setValue("XMLHttpRequest cannot load. This server is not allowed by Access-Control-Allow-Origin");
				_this.form.setLoading(false);
			});
			dasDataAdapter.fill(1, 1, 1);
		}
    });
	this.trackNameField = Ext.create('Ext.form.field.Text',{
		name: 'file',
//        fieldLabel: 'Track name',
        allowBlank: false,
        value: _this.urlField.value.split('/das/')[1].split('/')[0],
        emptyText: 'Choose a name',
        flex:1
	});
	this.panelSettings = Ext.create('Ext.panel.Panel', {
		layout: 'hbox',
		border:false,
		title:'Track name',
		cls:"panel-border-top",
		bodyPadding: 10,
	    items : [this.trackNameField]	 
	});
	this.contentArea = Ext.create('Ext.form.field.TextArea',{
		margin:"-1",
		width : this.width,
		height : this.height
	});
	this.infobar = Ext.create('Ext.toolbar.Toolbar',{height:28,cls:"bio-border-false"});
	this.infobar.add(this.urlField);
	this.infobar.add(this.checkButton);
	this.form = Ext.create('Ext.panel.Panel', {
		border : false,
		items : [this.infobar,this.contentArea,this.panelSettings]
	});
	
	this.panel = Ext.create('Ext.ux.Window', {
		title : this.title,
		layout: 'fit',
		resizable:false,
		items : [this.form],
		buttons : [{
			text : 'Add',
			handler : function() {
				_this.onAdd.notify({name:_this.trackNameField.getValue(),url:_this.urlField.getValue()});
				_this.panel.close();
			}
		},{text : 'Cancel',handler : function() {_this.panel.close();}}
		],
		listeners: {
	      	destroy: function(){
	       		delete _this.panel;
	      	}
    	}
	});
};function MasterSlaveGenomeViewer(trackerID, targetId,  args) {
	this.targetId = targetId;
	this.id = trackerID + Math.random();
	this.width = 1300;
	this.height = 700;
	
	this.slaveHeight = this.height;
	this.masterHeight = this.height;
	
	
	this.masterWindowSize = 1000000;
	
	if (args != null){
		if (args.width != null){
			this.width = args.width;
		}
		if (args.height != null){
			this.height = args.height;
		}
		if (args.masterHeight != null){
			this.masterHeight = args.height;
		}
		if (args.slaveHeight != null){
			this.slaveHeight = args.height;
		}
		
	}
	this.pixelRatio = 0.0005; //0.001;

	this.zoomLevels = new Array();
	for ( var i = 1; i <= 10; i++) {
		this.zoomLevels[i] = this.pixelRatio * (i*2);
	}
	this.zoomLevels[0.1] = this.pixelRatio;
	this.genomeWidget = null;
	
	 /** Events **/
    this.markerChanged = new Event(this);

	
	
	
	
};

MasterSlaveGenomeViewer.prototype.getZoomFactor = function(value) {
	return this.zoomLevels[value/10];
};


MasterSlaveGenomeViewer.prototype.getMasterId = function() {
	return this.id + "_master";
};

MasterSlaveGenomeViewer.prototype.getSlaveId = function() {
	return this.id + "_slave";
};

MasterSlaveGenomeViewer.prototype.getMasterStart = function() {
	return this.position - (this.masterWindowSize);
};

MasterSlaveGenomeViewer.prototype.getMasterEnd = function() {
	return this.position + (this.masterWindowSize);
};


MasterSlaveGenomeViewer.prototype.init = function() {
//	var master = DOM.createNewElement("DIV", DOM.select(this.getMasterId()), [["width", this.width], ["height", this.height]]);
};

MasterSlaveGenomeViewer.prototype.goTo = function(chromosome, position) {
	this.clear();
	this.chromosome = chromosome;
	this.position = position;

	this._drawMaster();
	this._drawSlave(this.position);
};


MasterSlaveGenomeViewer.prototype.zoomIn = function() {
	this.position = this.genomeWidget.trackCanvas.getMiddlePoint();
//	this.pixelRatio = this.pixelRatio + 0.02;
	this.pixelRatio = this.pixelRatio * 1.5;
	this.clear();
	this.genomeWidget.trackCanvas._goToCoordinateX( this.position - (this.genomeWidget.trackCanvas.width/2) / this.pixelRatio);
	console.log("PIXEL RATIO " + this.pixelRatio);
};


MasterSlaveGenomeViewer.prototype.zoom = function(value) {
	if (value > 50){
			this.pixelRatio = this.pixelRatio * (1.5* ((value/4)/10));
	}
	else{
			this.pixelRatio = this.pixelRatio / (1.5* ((value/4)/10));
	}
	this.pixelRatio = this.getZoomFactor(value);
	this.position = this.genomeWidget.trackCanvas.getMiddlePoint();
	
	this.clear();
	this.genomeWidget.trackCanvas._goToCoordinateX( this.position - (this.genomeWidget.trackCanvas.width/2) / this.pixelRatio);
	
};

MasterSlaveGenomeViewer.prototype.zoomOut = function() {
	
	this.position = this.genomeWidget.trackCanvas.getMiddlePoint();
//	this.pixelRatio = this.pixelRatio - 0.002;
	this.pixelRatio = this.pixelRatio / 1.5;
	this.clear();
	this.genomeWidget.trackCanvas._goToCoordinateX( this.position - (this.genomeWidget.trackCanvas.width/2) / this.pixelRatio);
	console.log("PIXEL RATIO " + this.pixelRatio);
};

MasterSlaveGenomeViewer.prototype.clear = function() {
	this.genomeWidget.clear();
	this._drawMaster();
};

MasterSlaveGenomeViewer.prototype._createMaster = function() {


    var newGenomeWidget = new GenomeWidget(this.id + "master", this.getMasterId(),
                    {
                            "pixelRatio":this.pixelRatio,
                            "width":this.width,
                            "height":  this.height,
                            "showTranscripts": this.showTranscripts,
                            "showExons": this.showExons,
                            "showSNPTrack" : this.showSNPTrack
                    });

    if (this.genomeWidget != null){
            newGenomeWidget.trackList = this.genomeWidget.trackList;
            newGenomeWidget.dataAdapterList = this.genomeWidget.dataAdapterList;
            for ( var i = 0; i < newGenomeWidget.dataAdapterList.length; i++) {
                    newGenomeWidget.dataAdapterList.preloadSuccess = new Event();
                    newGenomeWidget.dataAdapterList.successed = new Event();
            }
    }

    return newGenomeWidget;
};



MasterSlaveGenomeViewer.prototype._drawMaster = function() {
//	this.genomeWidget = new GenomeWidget(this.id + "master", this.getMasterId(), {"pixelRatio":this.pixelRatio,  "width":this.width, "height":  this.height});
//	this.genomeWidget.draw(this.chromosome, this.getMasterStart(), this.getMasterEnd());
//	var _this = this;
//	this.genomeWidget.onClick.addEventListener(function (evt, feature){
//	    	console.log(feature);
//	});
//	
//	this.genomeWidget.markerChanged.addEventListener(function (evt, data){
//		_this.updateSlave(data);
//	});
	  this.genomeWidget = this._createMaster();
      this.genomeWidget.draw(this.chromosome, this.getMasterStart(), this.getMasterEnd());
      this._attachMasterEvents();

	
	
	
};

MasterSlaveGenomeViewer.prototype._attachMasterEvents = function() {
    var _this = this;
    this.genomeWidget.onClick.addEventListener(function (evt, feature){
//          console.log(feature);
    });

    this.genomeWidget.markerChanged.addEventListener(function (evt, data){
            _this.updateSlave(data);
            _this.chromosome = _this.genomeWidget.chromosome;
            _this.position = data;
            _this.markerChanged.notify();
    });
};


MasterSlaveGenomeViewer.prototype.addTrackMaster = function(track, dataAdapter) {
  this.genomeWidget = this._createMaster();
  this.genomeWidget.addTrack(track, dataAdapter);
//    this.masterGenomeWidget.draw(this.chromosome, this.getMasterStart(), this.getMasterEnd());
    this._attachMasterEvents();
};



MasterSlaveGenomeViewer.prototype._drawSlave = function(position) {
	DOM.removeChilds(this.getSlaveId());
	this.detailViewer = new SequenceGenomeWidget(this.id +"detail", this.getSlaveId(), {"width":this.width});
	this.detailViewer.draw(this.chromosome, position - 100, position + 100);
	
};

MasterSlaveGenomeViewer.prototype.draw = function(chromosome, position) {
	this.chromosome = chromosome;
	this.position = position;
	this.init();

	this._drawMaster();
	this._drawSlave(this.position);
};

MasterSlaveGenomeViewer.prototype.updateSlave = function(position) {
	this._drawSlave(position);
	this.detailViewer.trackCanvas._goToCoordinateX(position - ((this.detailViewer.trackCanvas.width/this.detailViewer.trackCanvas.pixelRatio)/2));
};// JavaScript Document
function KaryotypePanelWindow(species,args){
	var _this = this;
	this.id = "KaryotypePanelWindow_" + Math.random();
	this.karyotypeWidget = new KaryotypePanel(this.getKaryotypePanelId(), species, {"top":10, "width":1000, "height": 300, "trackWidth":15});
	this.karyotypeCellBaseDataAdapter = new KaryotypeCellBaseDataAdapter(species);
	
	this.args = args;
	
	this.onRendered = new Event();
	this.onMarkerChanged = new Event();
	
	this.karyotypeCellBaseDataAdapter.successed.addEventListener(function(evt, data){
		_this.karyotypeWidget.onRendered.addEventListener(function(evt, data){
			_this.onRendered.notify();
		});
		
		_this.karyotypeWidget.onClick.addEventListener(function(evt, data){
			_this.onMarkerChanged.notify(data);
		});
		
		_this.karyotypeWidget.draw(_this.karyotypeCellBaseDataAdapter.chromosomeNames, _this.karyotypeCellBaseDataAdapter.dataset.json);	

	});
	
};

KaryotypePanelWindow.prototype.select = function(chromosome, start, end){
	this.karyotypeWidget.select(chromosome, start, end);
};

KaryotypePanelWindow.prototype.mark = function(features){
	this.karyotypeWidget.mark(features);
};


KaryotypePanelWindow.prototype.draw = function(){
	if(this.panel==null){
		this.render();
	}
	this.panel.show();
};

KaryotypePanelWindow.prototype.getKaryotypePanel = function(){
	if(this.karyotypePanel==null){
		
		var helpLabel = Ext.create('Ext.toolbar.TextItem', {
			html:'<span class="dis">Click on chromosome to go</span>'
		});
		var infobar = Ext.create('Ext.toolbar.Toolbar',{dock: 'top'});
		infobar.add(helpLabel);
		
		this.karyotypePanel  = Ext.create('Ext.panel.Panel', {
			height:350,
			maxHeight:350,
			border:false,
			bodyPadding: 15,
			padding:'0 0 0 0',
			html:'<div id="' + this.getKaryotypePanelId() +'" ><div>',
			dockedItems: [infobar]
		});
	}
	return this.karyotypePanel;
};

KaryotypePanelWindow.prototype.render = function(){
	var _this = this;
	
	this.panel = Ext.create('Ext.ux.Window', {
		title: 'Karyotype',
		resizable:false,
		taskbar:Ext.getCmp(this.args.genomeViewer.id+'uxTaskbar'),
		constrain:true,
		animCollapse: true,
		width: 1050,
		height: 412,
		minWidth: 300,
		minHeight: 200,
		layout: 'fit',
		items: [this.getKaryotypePanel()],
		buttonAlign:'center',
		buttons:[{ text: 'Close', handler: function(){_this.panel.close();}}],
 		listeners: {
	      	destroy: function(){
	       		delete _this.panel;
	      	}
    	}
	});
	this.karyotypeCellBaseDataAdapter.fill();
};

KaryotypePanelWindow.prototype.getKaryotypePanelId = function (){
	return this.id+"_karyotypePanel";	
};// JavaScript Document
function KaryotypePanel(targetID, species, args){
	this.id = targetID+Math.round(Math.random()*10000);
	this.targetId = targetID;
	
	this.species=species;
	
	this.width = 500;
	this.height = 300;
	
	
	if (args!=null){
		if (args.height!=null){
			this.height = args.height;
		}
		if (args.width!=null){
			this.width = args.width;
		}
		
		if (args.trackWidth!=null){
			this.trackWidth = args.trackWidth;
		}
		
	}
	
	//Events 
	this.onClick = new Event(this);
	this.onRendered = new Event(this);
	this.onMarkerClicked = new Event(this);
};


KaryotypePanel.prototype.getTrackId = function(index){
	return this.id + "_track_" + index;
};


KaryotypePanel.prototype.init = function(){
	
	this.containerTable = DOM.createNewElement("table", DOM.select(this.targetId), [["id", this.id+"_table"], ["width", this.width], ["height", this.height]]);
	tr = DOM.createNewElement("tr", this.containerTable, [["width", this.width],["style", "vertical-align:bottom"]]);
	for ( var i = 0; i < this.features.length; i++) {
		var td = DOM.createNewElement("td", tr, [["style", "vertical-align:bottom"],["id", this.getTrackId(i)]]);
	}
};

KaryotypePanel.prototype.drawFeatures = function(){
	var _this = this;
	var size = this.width/this.features.length;
	
		this.panels = new Object();
		for ( var i = 0; i < this.features.length; i++) {
				var bottom = (this.chromosomeSize[i] * this.height) - 10;
				
				var verticalTrack =  new ChromosomeFeatureTrack(this.id + "chr" + this.chromosomesNames[i], document.getElementById( this.getTrackId(i)), this.species,{
					top:10, 
					bottom:bottom, 
					left:12, 
					right:25,  
					width: size, 
					height: this.chromosomeSize[i] * this.height,
					 "labelChromosome":true, 
					 label:true, 
					 "vertical":true, 
					 "rounded":2,
					 "backgroundcolor":"yellow"	
				});	
				_this.panels[this.chromosomesNames[i]] = verticalTrack;
				
				var dataset = new DataSet();
				dataset.loadFromJSON([this.features[i]]);
				verticalTrack.draw(dataset);
				
				_this.panels[this.chromosomesNames[i]].click.addEventListener(function (evt, cytoband){
					var position = (cytoband.end - cytoband.start)/2 + cytoband.start;
					_this.select(cytoband.chromosome, position, position + 2000000 );
					_this.onClick.notify(cytoband);
				});
				
				_this.panels[this.chromosomesNames[i]].onMarkerClicked.addEventListener(function (evt, feature){
					_this.onMarkerClicked.notify(feature);
				});
				
		}
		this.onRendered.notify();
};

KaryotypePanel.prototype.select = function(chromosome, start, end){
	for ( var i = 0; i < this.chromosomesNames.length; i++) {
		this.panels[this.chromosomesNames[i]].deselect();
	}
	
	this.panels[chromosome].select(start, end);
};

KaryotypePanel.prototype.mark = function(features, color){
	
	for ( var i = 0; i < features.length; i++) {
		if (this.panels[features[i].chromosome] != null){
			this.panels[features[i].chromosome].mark(features[i], color);
		}
	}
};

KaryotypePanel.prototype.unmark = function(){
	for (var panel in this.panels){
		this.panels[panel].unmark();
	}
		
};


KaryotypePanel.prototype.draw = function(names, chromosomes){
	this.features = chromosomes;
	this.chromosomesNames = names;
	
	this.chromosomeSize = new Array();
	this.maxChromosomeSize = 0;
	for ( var i = 0; i < this.features.length; i++) {
		this.chromosomeSize.push(this.features[i][this.features[i].length-1].end);
		if (this.maxChromosomeSize < this.features[i][this.features[i].length-1].end){
			this.maxChromosomeSize = this.features[i][this.features[i].length-1].end;
		}
	}
	
	for ( var i = 0; i < this.features.length; i++) {
		this.chromosomeSize[i] = (this.chromosomeSize[i] / this.maxChromosomeSize);
	}
	
	this.init();
	this.drawFeatures();
};

function TooltipPanel(args){
	this.id = "TooltipPanel" + Math.round(Math.random()*10000000);
	this.targetId = null;
	this.width = 100;
	this.height = 60;
	
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
};

TooltipPanel.prototype.getPanel = function(item){
	var _this=this;
	
	if (this.panel == null){
		this.panel = Ext.create('Ext.tip.Tip',{
			html:this._getItemInfo(item)
		});
	}	
	return this.panel;
};

TooltipPanel.prototype.destroy = function(){
	this.panel.destroy();
};

TooltipPanel.prototype._getItemInfo = function(item){
//	console.log(item);
	var str = "";
	if(item instanceof GeneFeatureFormatter || 
	   item instanceof TranscriptFeatureFormatter || 
	   item instanceof ExonFeatureFormatter || 
	   item instanceof SNPFeatureFormatter|| 
	   item instanceof TfbsFeatureFormatter ){
		str = '<span class="ssel">'+item.getName()+'</span><br>'+
		'start: <span class="emph">'+item.start+'</span><br>'+
		'end:  <span class="emph">'+item.end+'</span><br>'+
		'length: <span class="info">'+(item.end-item.start+1)+'</span><br>';
		
	}
	if(item instanceof VCFFeatureFormatter){
		str = '<span class="ssel">'+item.getName()+'</span><br>';
	}
	return str;
};
function KaryotypeHorizontalMarkerWidget(){
	this.id = "GV_";
	this.width = 600;
	this.height = 700;
	this.tabPanelHeight = 250;
	this.topPanelHeight = 600;

	
//	this.karyotypeWidget = new KaryotypePanel("human", "container_map_karyotype", {"width":this.width, "height": this.tabPanelHeight - 50, "trackWidth":15});
	this.genomeWidget = new GenomeWidget("id", "container_map", {width:100,  "height":this.topPanelHeight} );
	

	var _this = this;
//	this.karyotypeWidget.onClick.addEventListener(function (evt, feature){
////		_this.genomeWidget.draw(feature.chromosome, feature.start);
//		_this.goTo(feature.chromosome, feature.start);
//	});

	this.genomeWidgetProperties = new GenomeWidgetProperties({windowSize:1000000, pixelRatio: 0.00001});
	
	var sequenceTrack =  new SequenceFeatureTrack( this.id + "sequence", this.tracksPanel, {
		top:0, 
		left:0, 
		right:this.width,  
		width:this.width, 
		height:20, 
		featureHeight:12, 
		avoidOverlapping : false,
		backgroundColor: '#FFFFFF'
	});
	this.genomeWidgetProperties.addTrackByZoom(100, 100, sequenceTrack, new RegionCellBaseDataAdapter({resource: "sequence"}));
	
//	var snpTrack =  new SNPFeatureTrack( this.id + "_snp",  this.tracksPanel, {
//		top:0, 
//		left:0, 
//		right:this.width,  
//		width:this.width, 
//		height:30, 
//		featureHeight:10, 
//		opacity : 1,
//		avoidOverlapping : true,
//		pixelSpaceBetweenBlocks: 100,
//		backgroundColor: '#FFFFFF'
//	});
//	this.genomeWidgetProperties.addTrackByZoom(100, 100, snpTrack, new RegionCellBaseDataAdapter({resource: "snp"}));
	
	var cytobandTrack =  new CytobandFeatureTrack( this.id + "_cytoband",  this.tracksPanel, {
		top:0, 
		left:0, 
		height:20, 
		title:"Cytoband",
		titleFontSize:9,
		label:false,
		featureHeight:8, 
		opacity : 1,
		backgroundColor: '#FFFFFF'
	});
	this.genomeWidgetProperties.addTrackByZoom(0, 0, cytobandTrack, new RegionCellBaseDataAdapter({resource: "cytoband"}));
	var cytobandTrack2 =  new CytobandFeatureTrack( this.id + "_cytoband",  this.tracksPanel, {
		top:0, 
		left:0, 
		height:20, 
		title:"Cytoband",
		titleFontSize:9,
		label:true,
		featureHeight:8, 
		opacity : 1,
		backgroundColor: '#FFFFFF'
	});
	this.genomeWidgetProperties.addTrackByZoom(10, 100, cytobandTrack2, new RegionCellBaseDataAdapter({resource: "cytoband"}));
	
	
	 var multitrack = new HistogramFeatureTrack( this.id +"_multiTrack", this.tracksPanel, {
		 	top:5, 
			left:0, 
			height:20, 
			featureHeight:18, 
			queueHeight : 18,
			title:"GENES",
			titleFontSize:9,
			showTranscripts: false,
			allowDuplicates:true,
			backgroundColor: '#FFFFFF', 
			label:false,
			pixelSpaceBetweenBlocks : 1,
			showDetailGeneLabel:false,
			forceColor: "blue",
			intervalSize:1000000
		});

	this.genomeWidgetProperties.addTrackByZoom(0, 0, multitrack, new GeneRegionCellBaseDataAdapter({obtainTranscripts:false}));
	
	 var multitrack = new HistogramFeatureTrack( this.id +"_multiTrack", this.tracksPanel, {
		 	top:5, 
			left:0, 
			height:20, 
			featureHeight:18, 
			queueHeight : 18,
			title:"GENES",
			titleFontSize:9,
			showTranscripts: false,
			allowDuplicates:true,
			backgroundColor: '#FFFFFF', 
			label:false,
			pixelSpaceBetweenBlocks : 1,
			showDetailGeneLabel:false,
			forceColor: "blue",
			intervalSize:100000
		});

	this.genomeWidgetProperties.addTrackByZoom(10, 10, multitrack, new GeneRegionCellBaseDataAdapter({obtainTranscripts:false}));
	
	 var multitrack3 = new MultiFeatureTrack( this.id +"_multiTrack", this.tracksPanel, {
		 	top:5, 
			left:0, 
			height:10, 
			featureHeight:7, 
			queueHeight : 10,
			title:"GENES",
			titleFontSize:9,
			showTranscripts: false,
			allowDuplicates:false,
			backgroundColor: '#FFFFFF', 
			label:false,
			pixelSpaceBetweenBlocks : 1,
			showDetailGeneLabel:false
		});

	this.genomeWidgetProperties.addTrackByZoom(20, 40, multitrack3, new GeneRegionCellBaseDataAdapter({obtainTranscripts:false}));
	
	 var multitrack4 = new MultiFeatureTrack( this.id +"_multiTrack", this.tracksPanel, {
		 top:5,  
			left:0, 
			height:10, 
			featureHeight:7, 
			queueHeight : 10,
			title:"GENES",
			titleFontSize:9,
			showTranscripts: false,
			allowDuplicates:false,
			backgroundColor: '#FFFFFF', 
			label:true,
			pixelSpaceBetweenBlocks : 200,
			showDetailGeneLabel:false
		});

	this.genomeWidgetProperties.addTrackByZoom(50, 60, multitrack4, new GeneRegionCellBaseDataAdapter({obtainTranscripts:false}));
	
	
	 var multitrack2 = new MultiFeatureTrack( this.id +"_multiTrack", this.tracksPanel, {
		 top:5,  
			left:0, 
			height:10, 
			featureHeight:6, 
			queueHeight : 10,
			title:"GENES",
			titleFontSize:9,
			labelFontSize:8,
			showTranscripts: true,
			allowDuplicates:false,
			backgroundColor: '#FFFFFF', 
			label:true,
			pixelSpaceBetweenBlocks : 200,
			showDetailGeneLabel:true
		});
	this.genomeWidgetProperties.addTrackByZoom(70, 90, multitrack2, new GeneRegionCellBaseDataAdapter());
};






KaryotypeHorizontalMarkerWidget.prototype.draw = function(chromosome, position){
	
	
	this.chromosome = chromosome;
	this.position = position;

	
	var center = Ext.create('Ext.panel.Panel', {
		layout : 'vbox',
		region: 'center',
		margins:'0 0 0 5',
		items:[
//		       this.getMainMenu(),
		       this.getTopPanel()
//		       this.getMiddleMenu(),
//		       this.getBotPanel()
		      ]
	});


	var port = Ext.create('Ext.container.Viewport', {
		layout: 'border',
		items: [
		        center
		        ]
	});


//	this.genomeWidget.draw(this.chromosome, this.position);
	this._drawMasterKaryotypeHorizontalMarkerWidget(this.chromosome,this.position - (this.genomeWidgetProperties.windowSize), this.position + (this.genomeWidgetProperties.windowSize));
	
	

};




/** Drawing master Genome Viewer **/
KaryotypeHorizontalMarkerWidget.prototype.getMasterId = function() {
	return this.id + "_master";
};

KaryotypeHorizontalMarkerWidget.prototype.zoom = function(value) {
//	for ( var i = 0; i < this.genomeWidgetProperties.getTrackByZoom(value).length; i++) {
//		this.genomeWidgetProperties.windowSize = this.genomeWidgetProperties.minWindowSize;
//		this.genomeWidgetProperties._pixelRatio = 10; 
//		this.addMasterTrack(this.genomeWidgetProperties.getTrackByZoom(value)[i], this.genomeWidgetProperties.getDataAdapterByZoom(value)[i]);
//	}
	this.position = this.genomeWidget.getMiddlePoint();
	this.refreshMasterKaryotypeHorizontalMarkerWidget();
	this.genomeWidget.trackCanvas._goToCoordinateX( this.position - (this.genomeWidget.trackCanvas.width/2) / this.genomeWidgetProperties.getPixelRatio());
};

KaryotypeHorizontalMarkerWidget.prototype.goTo = function(chromosome, position) {
	this.chromosome = chromosome;
	this.position = position;
	this.refreshMasterKaryotypeHorizontalMarkerWidget();
};

KaryotypeHorizontalMarkerWidget.prototype.refreshMasterKaryotypeHorizontalMarkerWidget = function() {
	this.genomeWidget.clear();
//	this._drawMasterKaryotypeHorizontalMarkerWidget(this.chromosome,this.position - (this.genomeWidgetProperties.windowSize), this.position + (this.genomeWidgetProperties.windowSize));
	this._drawMasterKaryotypeHorizontalMarkerWidget();
};

KaryotypeHorizontalMarkerWidget.prototype.addMasterTrack = function(track, dataAdapter) {
	this.genomeWidgetProperties.getCustomTracks().push(track);
	this.genomeWidgetProperties.getCustomDataAdapters().push(dataAdapter);
	this._drawMasterKaryotypeHorizontalMarkerWidget();
//	this.position = this.genomeWidget.getMiddlePoint();
//	this.refreshMasterKaryotypeHorizontalMarkerWidget();
//	this.genomeWidget.trackCanvas._goToCoordinateX( this.position - (this.genomeWidget.trackCanvas.width/2) / this.genomeWidgetProperties.pixelRatio);
	
//	this.zoom(0);
};

KaryotypeHorizontalMarkerWidget.prototype._drawMasterKaryotypeHorizontalMarkerWidget = function() {
		var _this = this;
		this.genomeWidget = new GenomeWidget(this.id + "master", this.getMasterId(), {
		                pixelRatio: 0.000002,//this.genomeWidgetProperties.getPixelRatio(),
		                width:this.width,
		                height:  this.height
		        });

		/** Reseteamos las propiedades top y height a los originales asi como los datasets **/
		for ( var i = 0; i < this.genomeWidgetProperties.getCustomTracks().length; i++) {
			this.genomeWidgetProperties.getCustomTracks()[i].top = this.genomeWidgetProperties.getCustomTracks()[i].originalTop;
			this.genomeWidgetProperties.getCustomTracks()[i].height = this.genomeWidgetProperties.getCustomTracks()[i].originalHeight;
			this.genomeWidgetProperties.getCustomTracks()[i].clear();
			this.genomeWidgetProperties.getCustomDataAdapters()[i].datasets = new Object();
			this.genomeWidget.addTrack(this.genomeWidgetProperties.getCustomTracks()[i], this.genomeWidgetProperties.getCustomDataAdapters()[i]);
			
		 }
		
		var zoom = this.genomeWidgetProperties.getZoom();

		for ( var i = 0; i < this.genomeWidgetProperties.getTrackByZoom(zoom).length; i++) {
			var track =  this.genomeWidgetProperties.getTrackByZoom(zoom)[i];
			track.top = track.originalTop;
			track.height = track.originalHeight;
			track.clear();
			
			this.genomeWidgetProperties.getDataAdapterByZoom(zoom)[i].datasets = new Object();
			this.genomeWidget.addTrack(track, this.genomeWidgetProperties.getDataAdapterByZoom(zoom)[i]);
			
		}
		
		
		var start = Math.ceil(this.position - (this.genomeWidgetProperties.windowSize));
		var end = Math.ceil(this.position +  (this.genomeWidgetProperties.windowSize));
		
		if (start < 0){ start = 0;}
		
		this.genomeWidget.draw(this.chromosome, start, end);
		
		
};


/** PANELS**/
KaryotypeHorizontalMarkerWidget.prototype.getTopPanel = function() {	
	return Ext.create('Ext.panel.Panel', {
							width: this.width,
							height: this.topPanelHeight,
							margins:'0 5 2 5',
							html:'<div id = "'+ this.getMasterId() +'"></div>'
	});
};
function GenomeWidgetProperties(species,args) {
	this.args = args;
	
	this.species=species;
	this.windowSize = 10000000;
	
	this.minWindowSize = 100;
	this.maxWindowSize = 100000000;
	
	this._pixelRatio = 0.0005; 
	this.showTranscripts = false;
	
	this._zoom = 0;
    
	/** General parameters TRACKS CONFIG **/
	this.labelHeight = 10;
	this.labelSize = 10;
	this.featureHeight = 4;
	
	if (args != null){
		if (args.windowSize != null){
			this.windowSize = args.windowSize;
		}
		if (args.id != null){
			this.id = args.id;
		}
		
		if (args._pixelRatio != null){
			this._pixelRatio = args._pixelRatio;
		}
		
		if (args.showTrancsripts != null){
			this.showTrancsripts = args.showTranscripts;
		}
		
		if (args.showExons != null){
			this.showExons = args.showExons;
		}
	}
	
	this._zoomLevels = new Object();
	this._windowSizeLevels = new Object();
	this._zoomTracks = new Object();
	this._zoomDataAdapters = new Object();
	
	for ( var i = 0; i <= 100; i = i + 10) { 
		this._zoomTracks[i] = new Array();
		this._zoomDataAdapters[i] = new Array();
	}
	
	this.tracks = new Object();
	this.customTracks = new Array();
	this.customDataAdapters = new Array();
	this.init();
};

GenomeWidgetProperties.prototype.getWindowSize = function(zoomFactor){
	return this._windowSizeLevels[zoomFactor];
};
GenomeWidgetProperties.prototype.init = function(){
	this._zoomLevels[0] =  1/200000;
	this._zoomLevels[10] = 1/50000;
//	this._zoomLevels[20] = 1/25000;
//	this._zoomLevels[30] =  0.00005*16;
	this._zoomLevels[20] = 0.00005*16;
	this._zoomLevels[30] = 0.00005*16;
	this._zoomLevels[40] = 0.00005*64;
	this._zoomLevels[50] = 0.00005*128;
	this._zoomLevels[60] = 0.00005*256;
	this._zoomLevels[70] = 0.00005*512;
	this._zoomLevels[80] = 0.00005*1024;
	this._zoomLevels[90] = 0.00005*2048;
	this._zoomLevels[100] = 10;
	
	this._windowSizeLevels[0] = 130000000;
	this._windowSizeLevels[10] = 40000000;
//	this._windowSizeLevels[20] = 20000000;
//	this._windowSizeLevels[30] = 750000;
	this._windowSizeLevels[20] = 750000;
	this._windowSizeLevels[30] = 750000;
	this._windowSizeLevels[40] = 750000/4;
	this._windowSizeLevels[50] = 750000/8;
	this._windowSizeLevels[60] = 750000/16;
	this._windowSizeLevels[70] = 750000/32;
	this._windowSizeLevels[80] = 750000/64;
	this._windowSizeLevels[90] = 750000/128;
	this._windowSizeLevels[100] = 100;
	
	this._zoom =  40;
	this._pixelRatio = this._zoomLevels[this._zoom];
	this.windowSize = this._windowSizeLevels[this._zoom];

	
	for ( var i = 0; i <= 100; i = i + 10) {
		  var rule = new RuleFeatureTrack( this.id + "_ruleTrack", this.tracksPanel, this.species,{
				top:10, 
				left:0, 
				height:20, 
				expandRuleHeight : 1500,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				floating:true
//				title:'Ruler'
			});
		
		  this.addTrackByZoom(i, i, rule, new RuleRegionDataAdapter({pixelRatio: this._zoomLevels[i]}));
	}
	this.addNativeTracks();

};

GenomeWidgetProperties.prototype.setLabelHeight = function(value){
//labelHeight : this.labelHeight,
//featureHeight : 10,
//labelSize : this.labelSize,
	for ( var zoom in this._zoomTracks) {
		var tracks = this._zoomTracks[zoom];
		for ( var j = 0; j < tracks.length; j++) {
			tracks[j].labelHeight = value;
			tracks[j].labelSize = value;
		}
//		console.log(tracks);
	}
	
};


GenomeWidgetProperties.prototype.addCustomTrackByZoom = function(minZoom, maxZoom, track, dataAdapter){
	if (track.titleName.length > 5) {
		track.titleWidth = track.titleName.length * 5;
	}
	else{
		track.titleWidth = 25;
	}
	
	this.customTracks.push(track);
	
	if ((track instanceof HistogramFeatureTrack) == false && (track instanceof SNPFeatureTrack) == false){
		track.labelHeight = this.labelHeight;
		track.featureHeight = this.featureHeight;
	}
	
	this.addTrackByZoom(minZoom, maxZoom, track, dataAdapter);
};

GenomeWidgetProperties.prototype.addTrackByZoom = function(minZoom, maxZoom, track, dataAdapter){
	if (this.tracks[track.titleName] == null){
		this.tracks[track.titleName] = true;
	}
	
	for ( var i = minZoom; i <= maxZoom; i = i + 10) { 
		this._zoomTracks[i].push(track);
		this._zoomDataAdapters[i].push(dataAdapter);
	}
};

GenomeWidgetProperties.prototype.getTrackByZoom = function(zoom){
	var tracksByZoomVisible = new Array();
	for ( var i = 0; i < this._zoomTracks[zoom].length; i++) {
		if (this.tracks[this._zoomTracks[zoom][i].titleName] == true){
			tracksByZoomVisible.push(this._zoomTracks[zoom][i]);
		}
	}
	return 	tracksByZoomVisible;
	
};

GenomeWidgetProperties.prototype.getDataAdapterByZoom = function(zoom){
	var tracksByZoomVisible = new Array();
	for ( var i = 0; i < this._zoomTracks[zoom].length; i++) {
		if (this.tracks[this._zoomTracks[zoom][i].titleName] == true){
			tracksByZoomVisible.push(this._zoomDataAdapters[zoom][i]);
		}
	}
	
	return 	tracksByZoomVisible;
};



GenomeWidgetProperties.prototype.getPixelRatio = function(){
	return this._zoomLevels[this.getZoom()];
};

GenomeWidgetProperties.prototype.setZoom = function(zoom){
	this._zoom = zoom;
	this._pixelRatio =  this.getPixelRatioByZoomLevel(this.getZoom());
	this.windowSize = this._windowSizeLevels[zoom];
};


GenomeWidgetProperties.prototype.getZoom = function(){
	return this._zoom;
};

GenomeWidgetProperties.prototype.getPixelRatioByZoomLevel = function(zoom){
	if(zoom == 100) return 10;
	return this._zoomLevels[zoom];
};

GenomeWidgetProperties.prototype.getCustomTracks = function(){
	return this.customTracks;
};

GenomeWidgetProperties.prototype.getCustomDataAdapters = function(){
	return this.customDataAdapters;
};


GenomeWidgetProperties.prototype.addNativeTracks = function(){
	this.addSequenceTracks();
	this.addSNPTracks();
	this.addCytobandTracks();
	this.addMultifeatureTracks();
	this.addTFBSTracks();
	this.addHistoneTracks();
	this.addPolymeraseTracks();
	this.addOpenChromatinTracks();
	this.addMirnaTargetTracks();
	
	this.addConservedRegionsTracks();
	
	/** Set visibility **/
	this.tracks["SNP"] = false;
	this.tracks["Sequence"] = false;
	this.tracks["Cytoband"] = false;
	
	this.tracks["Histone"] = false;
	this.tracks["Open Chromatin"] = false;
	this.tracks["Polymerase"] = false;
	this.tracks["TFBS"] = false;
	this.tracks["miRNA targets"] = false;
	//TODO doing
	this.tracks["Conserved regions"] = false;
};


/** SNP TRACKS **/
GenomeWidgetProperties.prototype.addSNPTracks = function(){
		var snpTrack = new SNPFeatureTrack(this.id + "snp",this.tracksPanel, this.species, {
			top : 5,
			left : 0,
			label : true,
			title : "SNP",
			height : 20,
			isAvalaible : false
		});
		this.addTrackByZoom(0, 80, snpTrack,new RegionCellBaseDataAdapter(this.species,{resource : "snp"}));
		
		var snpTrack = new SNPFeatureTrack(this.id + "snp",this.tracksPanel, this.species,{
			top : 5,
			left : 0,
			label : false,
			title : "SNP",
			height : 20,
			labelHeight : this.labelHeight,
			featureHeight : 10,
			labelSize : this.labelSize,
			pixelSpaceBetweenBlocks : 150,
			avoidOverlapping : false,
			backgroundColor : '#FFFFFF'
		});
		this.addTrackByZoom(90, 90, snpTrack,new RegionCellBaseDataAdapter(this.species,{resource : "snp"}));
		
		var snpTrack = new SNPFeatureTrack(this.id + "snp",this.tracksPanel, this.species,{
			top : 5,
			left : 0,
			label : true,
			title : "SNP",
			height : 20,
			labelHeight : this.labelHeight,
			featureHeight : 10,
			labelSize : this.labelSize,
			pixelSpaceBetweenBlocks : 150,
			avoidOverlapping : true,
			backgroundColor : '#FFFFFF'
		});
		this.addTrackByZoom(100, 100, snpTrack,new RegionCellBaseDataAdapter(this.species,{resource : "snp"}));
};

/** SEQUENCE TRACKS **/
GenomeWidgetProperties.prototype.addSequenceTracks = function(){
	var sequenceTrack = new SequenceFeatureTrack(this.id + "sequence", this.tracksPanel, this.species,{
		top : 20,
		title : "Sequence",
		height : 15,
		featureHeight : 12,
		avoidOverlapping : false,
		backgroundColor : '#FFFFFF',
		isAvalaible: false
	});
	this.addTrackByZoom(0, 90, sequenceTrack,new RegionCellBaseDataAdapter(this.species));
	
	var sequenceTrack = new SequenceFeatureTrack(this.id + "sequence", this.tracksPanel, this.species,{
				top : 20,
				title : "Sequence",
				height : 15,
				featureHeight : 12,
				avoidOverlapping : false,
				backgroundColor : '#FFFFFF'
	});
	this.addTrackByZoom(100, 100, sequenceTrack,new RegionCellBaseDataAdapter(this.species,{resource : "sequence"}));
};

/** CYTOBAND TRACKS **/
GenomeWidgetProperties.prototype.addCytobandTracks = function(){
	
	var cytobandTrack = new FeatureTrack(this.id + "_cytoband", this.tracksPanel, this.species,{
					top : 10,
					height : 20,
					labelHeight : this.labelHeight,
					featureHeight : this.featureHeight,
					labelSize : this.labelSize,
					title : "Cytoband",
					allowDuplicates : true,
					label : false
			});
	this.addTrackByZoom(0, 0, cytobandTrack,new RegionCellBaseDataAdapter(this.species,{resource : "cytoband"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_cytoband", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Cytoband",
				allowDuplicates : true,
				label : true
			});
	this.addTrackByZoom(10, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "cytoband"}));
};





/** MIRNA TARGETS **/
GenomeWidgetProperties.prototype.addMirnaTargetTracks = function(){
	var color = "#298A08";
//	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, {
//		top : 20,
//		left : 0,
//		height : 20,
//		featureHeight : 18,
//		title : "miRNA targets",
//		titleFontSize : 9,
//		titleWidth : 70,
//		showTranscripts : false,
//		allowDuplicates : true,
//		backgroundColor : '#FFFFFF',
//		label : false,
//		pixelSpaceBetweenBlocks : 1,
//		showDetailGeneLabel : false,
//		forceColor : color,
//		intervalSize : 500000,
//		isAvalaible : false
//		
//	});
//	this.addTrackByZoom(0, 0, multitrack,new RegionCellBaseDataAdapter({resource : "mirnatarget"}));
//	
//	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, {
//		top : 20,
//		left : 0,
//		height : 20,
//		featureHeight : 18,
//		title : "miRNA targets",
//		titleFontSize : 9,
//		titleWidth : 70,
//		showTranscripts : false,
//		allowDuplicates : true,
//		backgroundColor : '#FFFFFF',
//		label : false,
//		pixelSpaceBetweenBlocks : 1,
//		showDetailGeneLabel : false,
//		forceColor : color,
//		intervalSize : 250000,
//		isAvalaible : false
//	});
//	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter({resource : "mirnatarget"}));
//
//	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, {
//		top : 20,
//		left : 0,
//		height : 20,
//		featureHeight : 18,
//		title : "miRNA targets",
//		titleFontSize : 9,
//		titleWidth : 100,
//		backgroundColor : '#FFFFFF',
//		label : false,
//		pixelSpaceBetweenBlocks : 1,
//		forceColor : color,
//		intervalSize :125000/16,
//		isAvalaible : false
//	});
//	this.addTrackByZoom(20, 20, multitrack,new RegionCellBaseDataAdapter({resource : "mirnatarget"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs",this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "miRNA targets",
				allowDuplicates : false,
				label : false,
				pixelSpaceBetweenBlocks : 0,
				avoidOverlapping : true,
				isAvalaible : false
			});
	this.addTrackByZoom(0, 70, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "mirnatarget"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "miRNA targets",
				allowDuplicates : false,
				label : true,
				pixelSpaceBetweenBlocks : 100,
				avoidOverlapping : true,
				showLabelsOnMiddleMarker :true
			});
	this.addTrackByZoom(80, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "mirnatarget"}));
};

/** OPEN CHROMATIN **/
GenomeWidgetProperties.prototype.addOpenChromatinTracks = function(){
	var color = "#298A08";
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Open Chromatin",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 500000
	});
	this.addTrackByZoom(0, 0, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=open chromatin"}));
	
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Open Chromatin",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 250000
	});
	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=open chromatin"}));

	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Open Chromatin",
		titleFontSize : 9,
		titleWidth : 100,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		forceColor : color,
		intervalSize :125000/16
	});
	this.addTrackByZoom(20, 20, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=open chromatin"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Open Chromatin",
				allowDuplicates : true,
				label : false,
				pixelSpaceBetweenBlocks : 0,
				avoidOverlapping : true
			});
	this.addTrackByZoom(30, 90, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=open chromatin"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Open Chromatin",
				allowDuplicates : true,
				label : true,
				pixelSpaceBetweenBlocks : 100,
				avoidOverlapping : true,
				showLabelsOnMiddleMarker :true
			});
	this.addTrackByZoom(100, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=open chromatin"}));
	
};




/** Polymerasa **/
GenomeWidgetProperties.prototype.addPolymeraseTracks = function(){
	var color = "#298A08";
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Polymerase",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 500000
	});
	this.addTrackByZoom(0, 0, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Polymerase"}));
	
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Polymerase",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 250000
	});
	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Polymerase"}));
	

	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Polymerase",
		titleFontSize : 9,
		titleWidth : 70,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		forceColor : color,
		intervalSize :125000/16
	});
	this.addTrackByZoom(20, 20, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Polymerase"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Polymerase",
				allowDuplicates : true,
				label : false,
				pixelSpaceBetweenBlocks : 0,
				avoidOverlapping : true
			});
	this.addTrackByZoom(30, 90, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Polymerase"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Polymerase",
				allowDuplicates : true,
				label : true,
				pixelSpaceBetweenBlocks : 100,
				avoidOverlapping : true
			});
	this.addTrackByZoom(100, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Polymerase"}));
	
};




/** HISTONES **/
GenomeWidgetProperties.prototype.addHistoneTracks = function(){
	var color = "#298A08";
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 40,
		featureHeight : 40,
		title : "Histone",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color
//		intervalSize : 500000
	});
//	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter({resource : "gene?histogram=true&interval=125000"}));
	this.addTrackByZoom(0, 0, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=HISTONE&histogram=true&interval=250000"}));
	
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 40,
		featureHeight : 40,
		title : "Histone",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 250000
	});
//	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter({resource : "regulatory?type=HISTONE"}));
	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=HISTONE&histogram=true&interval=125000"}));
	

	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Histone",
		titleFontSize : 9,
		titleWidth : 70,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		forceColor : color,
		intervalSize :125000/16
	});
	this.addTrackByZoom(20, 20, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=HISTONE"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Histone",
				allowDuplicates : true,
				label : false,
				pixelSpaceBetweenBlocks : 0,
				avoidOverlapping : true
			});
	this.addTrackByZoom(30, 90, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=HISTONE"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Histone",
				allowDuplicates : true,
				label : true,
				pixelSpaceBetweenBlocks : 100,
				avoidOverlapping : true
			});
	this.addTrackByZoom(100, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=HISTONE"}));
	
};

/** TFBS TRACKS **/
GenomeWidgetProperties.prototype.addTFBSTracks = function(){
	var color = "#298A08";
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "TFBS",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 500000
	});
	this.addTrackByZoom(0, 0, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "tfbs"}));
	
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "TFBS",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 250000
	});
	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "tfbs"}));
	

	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "TFBS",
		titleFontSize : 9,
		titleWidth : 70,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		forceColor : color,
		intervalSize :125000/16
	});
	this.addTrackByZoom(20, 20, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "tfbs"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "TFBS",
				allowDuplicates : true,
				label : false,
				pixelSpaceBetweenBlocks : 0,
				avoidOverlapping : true
			});
	this.addTrackByZoom(30, 90, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "tfbs"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "TFBS",
				allowDuplicates : true,
				label : true,
				pixelSpaceBetweenBlocks : 100,
				avoidOverlapping : true
			
			});
	this.addTrackByZoom(100, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "tfbs"}));
	
};



/** CONSERVED REGIONS **/  //TODO
GenomeWidgetProperties.prototype.addConservedRegionsTracks = function(){
	var cytobandTrack2 = new FeatureTrack(this.id + "_conservedregion", this.tracksPanel, this.species,{
		top : 10,
		height : 20,
		labelHeight : this.labelHeight,
		featureHeight : this.featureHeight,
		labelSize : this.labelSize,
		allowDuplicates : true,
		label : false,
		titleWidth : 92,
		pixelSpaceBetweenBlocks : 0,
		avoidOverlapping : true,
		title : 'Conserved regions'
	});
	this.addTrackByZoom(0, 50, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "conservedregion"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_conservedregion", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				allowDuplicates : true,
				label : true,
				titleWidth : 92,
				pixelSpaceBetweenBlocks : 0,
				avoidOverlapping : true,
				title : 'Conserved regions'
			});
	this.addTrackByZoom(60, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "conservedregion"}));
	
};




/** MULTIFEATURE TRACKS **/
GenomeWidgetProperties.prototype.addMultifeatureTracks = function(){
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 40,
		featureHeight : 40,
		title : "Gene/Transcript",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : "blue"
//		intervalSize : 500000
	});
	this.addTrackByZoom(0, 10, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "gene?histogram=true&interval=250000"}));
//	this.addTrackByZoom(0, 0, multitrack,new GeneRegionCellBaseDataAdapter({obtainTranscripts : false}));
	
//	var multitrack1 = new HistogramFeatureTrack(this.id + "_multiTrack",
//			this.tracksPanel, {
//				top : 20,
//				left : 0,
//				height : 40,
//				featureHeight : 40,
//				title : "Gene/Transcript",
//				titleFontSize : 9,
//				titleWidth : 70,
//				showTranscripts : false,
//				allowDuplicates : true,
//				backgroundColor : '#FFFFFF',
//				label : false,
//				pixelSpaceBetweenBlocks : 1,
//				showDetailGeneLabel : false,
//				forceColor : "blue"
////				intervalSize : 150000
//			});
//	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter({resource : "gene?histogram=true&interval=125000"}));
//	this.addTrackByZoom(10, 10, multitrack1,new GeneRegionCellBaseDataAdapter({obtainTranscripts : false}));
	
	
	var multitrack2 = new MultiFeatureTrack(this.id + "_multiTrack", this.tracksPanel, this.species,{
				top : 20,
				left : 0,
				height : 10,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				
				title : "Gene/Transcript",
				titleWidth : 70,
				titleFontSize : 9,
				showTranscripts : false,
				allowDuplicates : false,
				backgroundColor : '#FFFFFF',
				label : false,
				pixelSpaceBetweenBlocks : 1,
				showDetailGeneLabel : false,
				isAvalaible : true
			});

	this.addTrackByZoom(20, 20, multitrack2,new GeneRegionCellBaseDataAdapter(this.species,{obtainTranscripts : false}));
	
	var multitrack2 = new MultiFeatureTrack(this.id + "_multiTrack", this.tracksPanel, this.species,{
				top : 20,
				left : 0,
				height : 10,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				
				title : "Gene/Transcript",
				titleWidth : 70,
				titleFontSize : 9,
				showTranscripts : false,
				allowDuplicates : false,
				backgroundColor : '#FFFFFF',
				label : true,
				pixelSpaceBetweenBlocks : this.labelSize * 7,
				showDetailGeneLabel : false,
				isAvalaible : true
			});

	this.addTrackByZoom(30, 40, multitrack2,new GeneRegionCellBaseDataAdapter(this.species,{obtainTranscripts : false}));

	var multitrack3 = new MultiFeatureTrack(this.id + "_multiTrack", this.tracksPanel, this.species,{
				top : 20,
				left : 0,
				height : 10,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Gene/Transcript",
				titleFontSize : 9,
				titleWidth : 70,
				showTranscripts : false,
				allowDuplicates : false,
				backgroundColor : '#FFFFFF',
				label : true,
				pixelSpaceBetweenBlocks : 200,
				showDetailGeneLabel : true
			});

	this.addTrackByZoom(50, 60, multitrack3,new GeneRegionCellBaseDataAdapter(this.species,{obtainTranscripts : false}));

	var multitrack4 = new MultiFeatureTrack(this.id + "_multiTrack", this.tracksPanel, this.species,{
				top : 20,
				left : 0,
				height : 10,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Gene/Transcript",
				titleWidth : 70,
				titleFontSize : 9,
				showTranscripts : true,
				showExonLabel : false,
				allowDuplicates : false,
				backgroundColor : '#FFFFFF',
				label : true,
				pixelSpaceBetweenBlocks : 200,
				showDetailGeneLabel : true
			});

	this.addTrackByZoom(70, 70, multitrack4,new GeneRegionCellBaseDataAdapter(this.species,{obtainTranscripts : true}));
	
	var multitrack4 = new MultiFeatureTrack(this.id + "_multiTrack", this.tracksPanel, this.species,{
				top : 20,
				left : 0,
				height : 10,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Gene/Transcript",
				titleWidth : 70,
				titleFontSize : 9,
				showTranscripts : true,
				showExonLabel : false,
				allowDuplicates : false,
				backgroundColor : '#FFFFFF',
				label : true,
				pixelSpaceBetweenBlocks : 200,
				showDetailGeneLabel : true
			});

	this.addTrackByZoom(80, 80, multitrack4,new GeneRegionCellBaseDataAdapter(this.species,{obtainTranscripts : true}));

	var multitrack5 = new MultiFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 10,
		left : 0,
		height : 10,
		labelHeight : this.labelHeight,
		featureHeight : this.featureHeight,
		labelSize : this.labelSize,
		title : "Gene/Transcript",
		titleWidth : 70,
		titleFontSize : 9,
		labelFontSize : 8,
		showTranscripts : true,
		allowDuplicates : false,
		backgroundColor : '#FFFFFF',
		label : true,
		pixelSpaceBetweenBlocks : 200,
		showDetailGeneLabel : true
	});
	this.addTrackByZoom(90, 90, multitrack5,new GeneRegionCellBaseDataAdapter(this.species));

	var multitrack5 = new MultiFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
				top : 10,
				left : 0,
				height : 10,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Gene/Transcript",
				titleWidth : 70,
				titleFontSize : 9,
				labelFontSize : 8,
				showTranscripts : true,
				allowDuplicates : false,
				backgroundColor : '#FFFFFF',
				label : true,
				pixelSpaceBetweenBlocks : 200,
				showDetailGeneLabel : true,
				showLabelsOnMiddleMarker :true,
				showExonLabel : true,
				onMouseOverShitExonTranscriptLabel:true
			});
	this.addTrackByZoom(100, 100, multitrack5,new GeneRegionCellBaseDataAdapter(this.species));
	
};





function GenomeWidget(trackerID, targetId,  args) {
	this.id = trackerID;
	this.targetId = targetId;
	
	this.pixelRatio = 0.001;
	
	this.width = 100;
	this.height = 500;
	
	/** Chromosome Position **/
	this.chromosome = null;
	this.start = null;
	this.end = null;
	this.viewBoxModule = 7000000;
	
	/** Drag and drop **/
	this.allowDragging = true;
	
//	this.ruleNotListenMoving = true;
	
	if (args != null){
		if (args.width != null){
			this.width = args.width;
		}
		if (args.height != null){
			this.height = args.height;
		}
		if (args.pixelRatio != null){
			this.pixelRatio = args.pixelRatio;
		}
		if (args.viewBoxModule != null){
			this.viewBoxModule = args.viewBoxModule;
		}
		
		if (args.allowDragging != null) {
			this.allowDragging = args.allowDragging;
		}
		
//		if (args.ruleNotListenMoving != null){
//			this.ruleNotListenMoving = args.ruleNotListenMoving;
//		}
	}
	
	 this.trackList = new Array();
     this.dataAdapterList = new Array();

     
	this.trackCanvas = null;
	
	/** EVENTS **/
	this.onMarkerChange = new Event(this);
	this.onClick = new Event(this);
	this.onRender = new Event(this);
	this.onMove = new Event(this);
	
};

GenomeWidget.prototype.clear = function() {
	this.trackCanvas.clear();
};

GenomeWidget.prototype.init = function(){
	DOM.removeChilds(this.targetId);
	this.tracksPanel = DOM.createNewElement("div", document.getElementById(this.targetId), [["id", "detail_tracks_container"]]);
};

GenomeWidget.prototype.getviewBoxModule = function(){
	var viewBoxModule = this.viewBoxModule;
	
	var counter = 2000000;
	while (((this.end*this.pixelRatio) % viewBoxModule) < ((this.start*this.pixelRatio) % viewBoxModule)){
		counter = counter + counter;
		viewBoxModule = parseFloat(viewBoxModule) + counter;
	}
	
	return viewBoxModule;
};

GenomeWidget.prototype.getMiddlePoint = function(){
	return this.trackCanvas.getMiddlePoint();
};



GenomeWidget.prototype.addTrack = function(track, dataAdapter){
    this.trackList.push(track);
    this.dataAdapterList.push(dataAdapter);
};




GenomeWidget.prototype.draw = function(chromosome, start, end){
	
	this.chromosome = chromosome;
	this.start = start;
	this.end = end;
	
	var _this = this;
	this.init();
	this.trackCanvas =  new TrackCanvas(this.id + "_canvas", document.getElementById(this.targetId), {
			top:0, 
			left:0, 
			right:this.width,  
			width:this.width, 
			height:this.height, 
			start: this.start, 
			end: this.end,
			backgroundColor: "#FFCCFF", 
			pixelRatio:this.pixelRatio,
			viewBoxModule: this.getviewBoxModule(),
			allowDragging :this.allowDragging
	});
	
    this.trackCanvas.init();
    
    this.trackCanvas.afterDrag.addEventListener(function (evt, data){
	});
    
    this.trackCanvas.onMove.addEventListener(function (evt, data){
    	_this.onMarkerChange.notify(data);
	});
   
    
    for ( var i = 0; i < this.trackList.length; i++) {
    	this.trackList[i].viewBoxModule = this.getviewBoxModule();
    	this.trackList[i].pixelRatio = this.pixelRatio;
    	this.trackList[i].targetID = document.getElementById(this.targetId);
    	    
    	 this.trackCanvas.addTrack(this.trackList[i], this.dataAdapterList[i]);
	}
    
    var _this = this;
    this.trackCanvas.onRender.addEventListener(function (evt){
		 _this.onRender.notify();
	 });
    
//    console.log(this.getviewBoxModule());
    
    this.trackCanvas.draw(this.chromosome, this.start, this.end);
    
   
};function LegendPanel(args){
	this.width = 200;
	this.height = 250;
	
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
	
	
};

LegendPanel.prototype.getColorItems = function(legend){
	panelsArray = new Array();
	
	for ( var item in legend) {
//		var color = legend[item].toString().replace("#", "");
//		var cp = new Ext.picker.Color();
//		cp.width = 20;
//		cp.colors = [color];

		var size=15;
		var color = Ext.create('Ext.draw.Component', {
        width: size,
        height: size,
        items:[{
				type: 'rect',
				fill: legend[item],
				x:0,y:0,
				width: size,
				height : size
				}]
		});
		
		//Remove "_" and UpperCase first letter
		var name = item.replace(/_/gi, " ");
		name = name.charAt(0).toUpperCase() + name.slice(1);
		
		var panel = Ext.create('Ext.panel.Panel', {
			height:size,
			border:false,
			flex:1,
			margin:"1 0 0 1",
		    layout: {type: 'hbox',align:'stretch' },
		    items: [color, {xtype: 'tbtext',text:name, margin:"1 0 0 3"} ]
		});
		
		panelsArray.push(panel);
	}
	
	return panelsArray;
};




LegendPanel.prototype.getPanel = function(legend){
	var _this=this;
	
	if (this.panel == null){
		
		var items = this.getColorItems(legend);
		
		this.panel  = Ext.create('Ext.panel.Panel', {
			bodyPadding:'0 0 0 2',
			border:false,
			layout: {
		        type: 'vbox',
		        align:'stretch' 
		    },
			items:items,
			width:this.width,
			height:items.length*20
		});		
	}	
	
	return this.panel;
};

LegendPanel.prototype.getButton = function(legend){
	var _this=this;
	
	if (this.button == null){
		
		this.button = Ext.create('Ext.button.Button', {
			text : this.title,
			menu : {
					items: [this.getPanel(legend)]
				}
		});
	}	
	return this.button;
	
	
};function LegendWidget(args){
	
	this.width = 300;
	this.height = 300;
	this.title = "Legend";
	
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
	
	this.legendPanel = new LegendPanel();
	
};

LegendWidget.prototype.draw = function(legend){
	var _this = this;
	if(this.panel==null){
		
		var item = this.legendPanel.getPanel(legend);
	
		this.panel = Ext.create('Ext.ux.Window', {
			title : this.title,
			resizable: false,
			constrain:true,
			closable:true,
			width: item.width+10,
			height: item.height+70,
			items : [item],
			buttonAlign:'right',
			 layout: {
		        type: 'hbox',
		        align:'stretch' 
		    },
			buttons:[
					{text:'Close', handler: function(){_this.panel.close();}}
			]
		});
	}
	this.panel.show();
	
	
};
GeneFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
GeneFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
GeneFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
GeneFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
GeneFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging; 
GeneFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId; 
GeneFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON; 
GeneFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON; 
GeneFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents; 

function GeneFeatureFormatter(gene){
	if (gene != null){
		this.feature = gene;
		this.start = gene.start;
		this.end = gene.end;
		this.label = this.getLabel();
		this.args = new Object();
		this.args.object = gene;
		this.args.title = new Object();
		this.args.stroke = "#000000";
//		this.args.strokeOpacity = 0.8;
		this.args.strokeWidth = 0.5;
		this.args.fill = "#"+this._getColor(gene);
		this.args.opacity = 1;
		FeatureFormatter.prototype.constructor.call(this, this.getId(), this.args);
	}
};

GeneFeatureFormatter.prototype.getId = function(){
	return this.feature.stableId + "_" + this.feature.start + "_" + this.feature.end;
};

GeneFeatureFormatter.prototype.getName = function(){
	return this.feature.stableId;
};

GeneFeatureFormatter.prototype.getLabel = function(){
	var label = this.feature.externalName;
	
//	if (GENOMEMAPS_CONFIG.showFeatureStableId != null){
//		if (GENOMEMAPS_CONFIG.showFeatureStableId == true){
//			label = this.feature.stableId;
//		}
//		
//	}

	if (this.feature.strand == -1){
		label = "< " +label;
	}
	
	if (this.feature.strand == 1){
		label = label + " >";
	}
	return label;
};

GeneFeatureFormatter.prototype.getDetailLabel = function(){
	//Remove "_" and UpperCase first letter
	var name = this.feature.biotype.replace(/_/gi, " ");
	name = name.charAt(0).toUpperCase() + name.slice(1);
	return this.getLabel() + " [" + name + "] ";// + this.feature.start; 
};

GeneFeatureFormatter.prototype.getBioTypeColors = function(){
	var colors = new Object();

	//TODO buscar los colores en ensembl!
	colors[new String("protein_coding")] = "a00000";
	colors[new String("processed_transcript")] = "0000ff";
	colors[new String("pseudogene")] = "666666";
	colors[new String("miRNA")] = "8b668b";//TODO falta
	colors[new String("snRNA")] = "8b668b";
	colors[new String("snoRNA")] = "8b668b";//TODO falta
	colors[new String("lincRNA")] = "8b668b";
	
	colors[new String("other")] = "ffffff";
	return colors;
};

GeneFeatureFormatter.prototype._getColor = function(gene){
//	console.log(gene.biotype + " " + this.getBioTypeColors()[gene.biotype]);
	if (gene.biotype.indexOf("pseudogene") != -1){
		return this.getBioTypeColors()["pseudogene"];
	}
	
	if (this.getBioTypeColors()[gene.biotype] == null){
		return this.getBioTypeColors()["other"];
	}
	
	
	return this.getBioTypeColors()[gene.biotype];
};


TranscriptFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
TranscriptFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
TranscriptFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
TranscriptFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
TranscriptFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging; 
TranscriptFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId; 
TranscriptFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON; 
TranscriptFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON; 
TranscriptFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents; 

function TranscriptFeatureFormatter(transcript){
	this.feature = transcript;
	this.start = transcript.start;
	this.end =  transcript.end;
	this.label =  this.getLabel();
	
	this.exon = new Array();
	for ( var i = 0; i < transcript.exon.length; i++) {
		this.exon.push(new ExonFeatureFormatter(transcript.exon[i], transcript));
	}
	this.args = new Object();
	this.args.title = new Object();
	this.args.hidden = false;
	this.args.stroke = "black";//this.getBioTypeColors()[transcript.biotype.toUpperCase()];//"black";
	this.args.strokeWidth = 1;
	this.args.fill = this.getBioTypeColors()[transcript.biotype.toUpperCase()];//"black";
	this.args.size = 1;
	this.args.opacity = 0.5;
	this.args.fontSize = 10;
	this.args.fontColor = "#FFFFFF";
	
//	[["stroke-width", "0.5"], ["fill", "black"], ["stroke", "black"]]
	 
	//TODO doing
	this.showFeatureStableId = true;
	 
	FeatureFormatter.prototype.constructor.call(this, this.getId(), this.args);
};

TranscriptFeatureFormatter.prototype.getName = function(){
	return this.feature.stableId;
};

TranscriptFeatureFormatter.prototype.getId = function(){
	return this.feature.stableId + "_" + this.feature.start + "_" + this.feature.end;
};

TranscriptFeatureFormatter.prototype.getBioTypeColors = function(){
	var colors = new Object();
	colors[new String("protein_coding").toUpperCase()] = "21610B";
	colors[new String("pseudogene").toUpperCase()] = "ffcc00";
	colors[new String("snRNA").toUpperCase()] = "424242";
	colors[new String("lincRNA").toUpperCase()] = "8A0886";
	colors[new String("processed_transcript").toUpperCase()] = "ff9900";
	
	colors[new String("other").toUpperCase()] = "FFFFFF";
	return colors;
};

TranscriptFeatureFormatter.prototype.getLabel = function(){
	var label = this.feature.externalName;
//	if (GENOMEMAPS_CONFIG.showFeatureStableId != null){
//		if (GENOMEMAPS_CONFIG.showFeatureStableId == true){
//			label = this.feature.stableId;
//		}
//	}
//	if (this.showFeatureStableId == true){
//		label = this.feature.stableId;
//	}
//	
	
	if (this.feature.strand == -1){
		label = "< " + label;
	}
	
	if (this.feature.strand == 1){
		label = label + " >";
	}
	
	var name = this.feature.biotype.replace(/_/gi, " ");
	name = name.charAt(0).toUpperCase() + name.slice(1);
	label = label + " [" + name + "]" ;
	return label;
};


ExonFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
ExonFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
ExonFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
ExonFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
ExonFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging; 
ExonFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId; 
ExonFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON; 
ExonFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON; 
ExonFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents; 

function ExonFeatureFormatter(exon, transcript){
	this.feature = exon;
	this.start = exon.start;
	this.end =  exon.end;
	this.label = exon.stableId;
	this.args = new Object();
	this.args.title = new Object();
	this.args.hidden = false;
	this.args.opacity = 1;
	this.args.strokeOpacity = 1;
	this.args.fill = "#FF0033";
	this.args.stroke = "#3B0B0B";
	

	this.args.strokeWidth = 1;
	this.args.size = 1;
	this.args.fontSize = 10;
	this.args.fontColor = "#FFFFFF";
	FeatureFormatter.prototype.constructor.call(this, this.getId(), this.args);
};

ExonFeatureFormatter.prototype.getName = function(){
	return this.feature.stableId;
};

ExonFeatureFormatter.prototype.getId = function(){
	return this.feature.stableId + "_" + this.feature.start + "_" + this.feature.end;
};

SNPFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
SNPFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
SNPFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
SNPFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
SNPFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging; 
SNPFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId; 
SNPFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON; 
SNPFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON; 
SNPFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents; 

function SNPFeatureFormatter(snp){
//<<<<<<< HEAD
//	this.feature = snp;
//	this.start = snp.start;
//	this.end =  snp.end;
//	this.label = snp.name + " (" + snp.alleleString +")";// strand:" + snp.strand ;
//	this.base = snp.alleleString.split("/")[1]; // example:  "A/AT"  or  "ATTT/G"
//	
//	this.args = new Object();
//	this.args.stroke = "#000000";
//	this.args.strokeOpacity = 1;
//	this.args.strokeWidth = 1;
//	this.args.fill = "#FF3333";
//	//this.args.fill = "#000000";
//	this.args.opacity = 1;
//	
//	FeatureFormatter.prototype.constructor.call(this, snp.name, this.args);
//=======
	if (snp != null){
		this.feature = snp;
		this.start = snp.start;
		this.end =  snp.end;
		this.label = snp.name + " (" + snp.alleleString +")" ;
		this.base = snp.alleleString.split("/")[1]; // example:  "A/AT"  or  "ATTT/G"
		
		this.args = new Object();
		this.args.stroke = "#f55959";
		this.args.strokeOpacity = 1;
		this.args.strokeWidth = 1;
		this.args.fill = this._getColor(snp); //"#f55959";
		//this.args.fill = "#000000";
		this.args.opacity = 1;
		
		FeatureFormatter.prototype.constructor.call(this, snp.name, this.args);
	}
//>>>>>>> eb4c9a6c00ef8bad1669b8a0b362a1b9335ffac6
};

SNPFeatureFormatter.prototype.getName = function(){
	return this.feature.name;
};

SNPFeatureFormatter.prototype.getFeatureColor = function(base){
	if (base == "A") return "#90EE90";
	if (base == "T") return "#E066FF";
	if (base == "G") return "#FFEC8B";
	if (base == "C") return "#B0C4DE";
	return "#CC00CC";
};
SNPFeatureFormatter.prototype.getBioTypeColors = function(){
	//TODO
	var colors = new Object();
	colors[new String("2KB_upstream_variant")] = "a2b5cd";				//TODO done Upstream
	colors[new String("5KB_upstream_variant")] = "a2b5cd";				//TODO done Upstream
	colors[new String("500B_downstream_variant")] = "a2b5cd";			//TODO done Downstream
	colors[new String("5KB_downstream_variant")] = "a2b5cd";			//TODO done Downstream
	colors[new String("3_prime_UTR_variant")] = "7ac5cd";				//TODO done 3 prime UTR
	colors[new String("5_prime_UTR_variant")] = "7ac5cd";				//TODO done 5 prime UTR
	colors[new String("coding_sequence_variant")] = "458b00";			//TODO done Coding unknown
	colors[new String("complex_change_in_transcript")] = "00fa9a";		//TODO done Complex in/del
	colors[new String("frameshift_variant")] = "ff69b4";				//TODO done Frameshift coding
	colors[new String("incomplete_terminal_codon_variant")] = "ff00ff";	//TODO done Partial codon
	colors[new String("inframe_codon_gain")] = "ffd700";				//TODO done Non-synonymous coding
	colors[new String("inframe_codon_loss")] = "ffd700";				//TODO done Non-synonymous coding
	colors[new String("initiator_codon_change")] = "ffd700";			//TODO done Non-synonymous coding
	colors[new String("non_synonymous_codon")] = "ffd700";				//TODO done Non-synonymous coding
	colors[new String("intergenic_variant")] = "636363";				//TODO done Intergenic
	colors[new String("intron_variant")] = "02599c";					//TODO done Intronic
	colors[new String("mature_miRNA_variant")] = "458b00";				//TODO done Within mature miRNA
	colors[new String("nc_transcript_variant")] = "32cd32";				//TODO done Within non-coding gene
	colors[new String("splice_acceptor_variant")] = "ff7f50";			//TODO done Essential splice site
	colors[new String("splice_donor_variant")] = "ff7f50";				//TODO done Essential splice site
	colors[new String("splice_region_variant")] = "ff7f50";				//TODO done Splice site
	colors[new String("stop_gained")] = "ff0000";						//TODO done Stop gained
	colors[new String("stop_lost")] = "ff0000";							//TODO done Stop lost
	colors[new String("stop_retained_variant")] = "76ee00";				//TODO done Synonymous coding
	colors[new String("synonymous_codon")] = "76ee00";					//TODO done Synonymous coding
	
	colors[new String("other")] = "ffffff";
	return colors;
};

SNPFeatureFormatter.prototype._getColor = function(snp){
	return this.getBioTypeColors()[snp.displaySoConsequence];
};




SequenceFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
SequenceFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
SequenceFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
SequenceFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
SequenceFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging; 
SequenceFormatter.prototype.getId = FeatureFormatter.prototype.getId; 
SequenceFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON; 
SequenceFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON; 
SequenceFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents; 

function SequenceFormatter(sequence){
	this.start = sequence.start;
	this.end =  sequence.end;
	this.label = sequence.base;//exon.stableId;
	
	this.args = new Object();
	this.args.title = new Object();
	this.args.hidden = false;
	this.args.stroke = "#FFFFFF";
	this.args.strokeOpacity = 0.6;
	this.args.strokeWidth = 1;
	this.args.fill = this.getFeatureColor(sequence.base);
	this.args.size = 1;
	this.args.opacity = 0.6;
	this.args.fontSize = 10;
	this.args.fontColor = "#FFFFFF";
	
	FeatureFormatter.prototype.constructor.call(this, sequence.start, this.args);
};

SequenceFormatter.prototype.getName = function(){
	return this.label;
};

SequenceFormatter.prototype.getFeatureColor = function(base){
	if (base == "A") return "#90EE90";
	if (base == "T") return "#E066FF";
	if (base == "G") return "#FFEC8B";
	if (base == "C") return "#B0C4DE";
	return "#CC00CC";
};

VCFFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
VCFFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
VCFFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
VCFFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
VCFFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
VCFFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
VCFFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
VCFFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
VCFFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function VCFFeatureFormatter(feature){
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end-1;
        this.label = feature.label;//exon.stableId;
        this.base = feature.alt;
        
        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.stroke = "#000000";
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 0.1;
        this.args.fill = "purple";
        this.args.size = 1;
        this.args.opacity = 1;
        
        this.feature.samples = feature.all[9];
        
        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};

VCFFeatureFormatter.prototype.getName = function(){
	return this.feature.chromosome+":"+this.feature.start+"-"+this.feature.alt;
};

GFFFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
GFFFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
GFFFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
GFFFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
GFFFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
GFFFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
GFFFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
GFFFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
GFFFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function GFFFeatureFormatter(feature){
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end;
        this.label = feature.label;//exon.stableId;

        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.stroke = "blue";
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 0.4;
        this.args.fill = "purple";
        this.args.size = 1;
        
        if (feature.score != null){
        	this.args.opacity = (1 * feature.score)/1000;
        }
        else{
        	this.args.opacity = 0.5;
        }
        
        this.args.fontColor = "blue";

        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};


GFFFeatureFormatter.prototype.getName = function(){
	return this.label;
};

BEDFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
BEDFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
BEDFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
BEDFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
BEDFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
BEDFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
BEDFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
BEDFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
BEDFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function BEDFeatureFormatter(feature){
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end;
        this.label = feature.label;//exon.stableId;
        this.score = feature.score;
        if(this.score<0){this.score = 0;}
        if(this.score>1000){this.score = 1000;}
        var gray = Math.abs(Math.ceil(this.score*0.255)-255).toString(16);
        
        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 1;
        this.args.fill =  "#"+gray+gray+gray;
        this.args.stroke = '#000000';
        
        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};

BEDFeatureFormatter.prototype.getName = function(){
	return this.label;
};


CytobandFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
CytobandFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
CytobandFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
CytobandFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
CytobandFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
CytobandFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
CytobandFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
CytobandFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
CytobandFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function CytobandFeatureFormatter(cytoband){
		this.feature = cytoband;
        this.start = cytoband.start;
        this.end =  cytoband.end;
        this.label = cytoband.cytoband;//exon.stableId;

        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.stroke = "#000000";
        this.args.strokeOpacity = 0.1;
        this.args.strokeWidth = 0.5;
        this.args.fill = this.getColor(cytoband);
        this.args.size = 1;
        this.args.opacity = 1;
    	this.args.fontSize = 10;
        this.args.fontColor = "blue";

        FeatureFormatter.prototype.constructor.call(this, cytoband.cytoband, this.args);
};

CytobandFeatureFormatter.prototype.getColor = function(feature) {
	if (feature.stain == ('gneg')){
		return "white";
	}
	if (feature.stain == ('stalk')){
		return "#666666";
	}
	if (feature.stain == ('gvar')){
		return "#CCCCCC";
	}
	
	if (feature.stain.indexOf('gpos') != -1){
		var value = feature.stain.replace("gpos", "");
		
		if (value == 25){
			return "silver";
		}
		if (value == 50){
			return "gray";
		}
		if (value == 75){
			return "darkgray";
		}
		if (value == 100){
			return "black";
		}
	}
	
	if (feature.stain=="acen"){
		return "blue";
	}
	return "purple";
};


MarkerRuleFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
MarkerRuleFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
MarkerRuleFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
MarkerRuleFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
MarkerRuleFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging; 
MarkerRuleFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId; 
MarkerRuleFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON; 
MarkerRuleFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON; 
MarkerRuleFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents; 

function MarkerRuleFeatureFormatter(marker){
	this.start = marker.start;
	this.end =  marker.end;
	this.label = this.start;//exon.stableId;
	
	this.isLabeled = false;
	
	this.args = new Object();
	this.args.title = new Object();
	this.args.hidden = false;
	this.args.stroke = "#FFFFFF";
	this.args.strokeOpacity = 0.6;
	this.args.strokeWidth = 1;
	this.args.fill = "black";
	this.args.size = 1;
	this.args.opacity = 0.1;
	if (marker.label){
		this.isLabeled = true;
		this.args.opacity = 0.2;
	}
	
	this.args.fontSize = 10;
	this.args.fontColor = "#FFFFFF";
	
	FeatureFormatter.prototype.constructor.call(this, marker.start, this.args);
};


DASFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
DASFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
DASFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
DASFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
DASFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
DASFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
DASFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
DASFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
DASFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function DASFeatureFormatter(feature){
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end;
        this.label = feature.id;//exon.stableId;

        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.stroke = "#FFFFFF";
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 1;
        this.args.fill = "purple";
        this.args.size = 1;
        this.args.opacity = "1";
        this.args.fontSize = 10;
        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};


GenericFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
GenericFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
GenericFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
GenericFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
GenericFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
GenericFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
GenericFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
GenericFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
GenericFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function GenericFeatureFormatter(feature){
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end;
        this.label = this.getLabel(feature);//exon.stableId;
        this.base = feature.alt;
        
        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.stroke = "#000000";
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 0.1;
        this.args.fill = "purple";
        this.args.size = 1;
        this.args.opacity = 1;

        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};

GenericFeatureFormatter.prototype.getLabel = function(feature) {
	if (feature.externalName != null){
		return feature.externalName;
	}
	
	if (feature.stableId != null){
		return feature.stableId;
	}
	
	if (feature.name != null){
		return feature.name;
	}
	
	if (feature.label != null){
		return feature.label;
	}
	
	return feature.chromosome + ":" + feature.start + "-" + feature.end;
	
};



TfbsFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
TfbsFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
TfbsFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
TfbsFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
TfbsFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
TfbsFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
TfbsFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
TfbsFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
TfbsFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function TfbsFeatureFormatter(feature){
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end;
        this.label = this.getLabel(feature);//exon.stableId;
        this.base = feature.alt;
        this.args = new Object();
        this.args.stroke = "#000000";
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 0.5;
        this.args.fill = this.getColors()[feature.cellType];
        this.args.opacity = 1;

        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};

TfbsFeatureFormatter.prototype.getName = function(){
	return this.feature.tfName;
};

TfbsFeatureFormatter.prototype.getLabel = function(feature) {
	return feature.tfName + " [" + feature.cellType + "]";
};

TfbsFeatureFormatter.prototype.getColors = function(){
	var colors = new Object();

	//TODO buscar los colores en ensembl!
	colors[new String("CD4")] = "38610B";
	colors[new String("GM06990")] = "4B8A08";
	colors[new String("GM12878")] = "5FB404";
	colors[new String("H1ESC")] = "74DF00";//TODO falta
	colors[new String("HeLa-S3")] = "80FF00";
	colors[new String("HepG2")] = "9AFE2E";//TODO falta
	colors[new String("HUVEC")] = "ACFA58";
	colors[new String("IMR90")] = "BEF781";//TODO falta
	colors[new String("K562")] = "E1F5A9";
	colors[new String("K562b")] = "ECF6CE";//TODO falta
	colors[new String("NHEK")] = "F1F8E0";
	
	colors[new String("other")] = "ffffff";
	return colors;
};

/** miRNA **/
MiRNAFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
MiRNAFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
MiRNAFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
MiRNAFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
MiRNAFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
MiRNAFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
MiRNAFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
MiRNAFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
MiRNAFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function MiRNAFeatureFormatter(feature){
	console.log(feature);
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end;
        this.label = this.getLabel(feature);//exon.stableId;
        this.base = feature.alt;
        
        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.stroke = "#000000";
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 0.1;
        this.args.fill = "purple";
        this.args.size = 1;
        this.args.opacity = 1;

        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};

MiRNAFeatureFormatter.prototype.getLabel = function(feature) {
	return feature.mirbaseId + "[" + feature.geneTargetName + "]";
	
};


function FeatureFormatter(id, defaultFormat, selectedFormat, overFormat, draggingFormat){
	this.id =  id;
	this.internalId =  Math.random();
	
	this.args = new Object();
	
	this.defaultFormat = new ItemFeatureFormat(defaultFormat);
	
	if(selectedFormat != null){
		this.selected = new ItemFeatureFormat(selectedFormat);
	}
	else{
		this.selected = new ItemFeatureFormat(defaultFormat);
	}
	
	if(overFormat != null){
		this.over = new ItemFeatureFormat(overFormat);
	}
	else{
		this.over = new ItemFeatureFormat(defaultFormat);
	}
	
	if(draggingFormat != null){
		this.dragging = new ItemFeatureFormat(draggingFormat);
	}
	else{
		this.dragging = new ItemFeatureFormat(defaultFormat);
	}
	
	//Events
	this.stateChanged  = new Event(this);

	
	//Attaching events
	var _this = this;
	this._setEvents();
};

FeatureFormatter.prototype.getType = function(){
	return this.args.type;
};


FeatureFormatter.prototype.toJSON = function(){
	var json = this.args;
	json.defaultFormat = this.getDefault().toJSON();
	json.over = this.getOver().toJSON();
	json.selected = this.getSelected().toJSON();
	json.dragging = this.getDragging().toJSON();
	json.id = this.id;
	return json;
};

FeatureFormatter.prototype.loadFromJSON = function(json){
	this.args = json;
	this.defaultFormat = new ItemFeatureFormat(json.defaultFormat);
	this.over = new ItemFeatureFormat(json.over);
	this.selected = new ItemFeatureFormat(json.selected);
	this.dragging = new ItemFeatureFormat(json.dragging);
	this._setEvents();
};

FeatureFormatter.prototype._setEvents = function(){
	//Attaching events
	var _this = this;
	
	this.defaultFormat.changed.addEventListener(function (sender, item){
		_this.over.setSize(_this.defaultFormat.getSize());
		_this.selected.setSize(_this.defaultFormat.getSize());
		_this.dragging.setSize(_this.defaultFormat.getSize());
		_this.stateChanged.notify(_this);
	});
	
	this.selected.changed.addEventListener(function (sender, item){
		_this.stateChanged.notify(_this);
	});
	
	this.over.changed.addEventListener(function (sender, item){
		_this.stateChanged.notify(_this);
	});
	
	this.dragging.changed.addEventListener(function (sender, item){
		_this.stateChanged.notify(_this);
	});
};

/** Getters **/
FeatureFormatter.prototype.getId = function(){return this.id;};
FeatureFormatter.prototype.getDefault = function(){return this.defaultFormat;};
FeatureFormatter.prototype.getSelected = function(){return this.selected;};
FeatureFormatter.prototype.getOver = function(){return this.over;};
FeatureFormatter.prototype.getDragging = function(){return this.dragging;};

function ItemFeatureFormat(args){
	this.defaultFormat = new Object();
	this.args = new Object();
	this.args.title = new Object();
	//Defult properties
	this.args.hidden = false;
	this.args.stroke = "black";
	this.args.strokeOpacity = 0.8;
	this.args.strokeWidth = 1;
	this.args.fill = "white";
	this.args.size = 1;
	this.args.opacity = 1;
	this.args.fontSize = "8";
	this.args.fontColor = "black";
	
	/** For directed edge with arrow **/ 
	//this.args.arrowSize = 1;
	
	if (args != null){
		if (args.opacity != null){
			this.args.opacity = args.opacity;
		}
		if (args.size != null){
			this.args.size = args.size;
		}
		if (args.hidden != null){
			this.args.hidden = args.hidden;
		}
		if (args.stroke != null){
			this.args.stroke = args.stroke;
		}
		if (args.strokeOpacity != null){
			this.args.strokeOpacity = args.strokeOpacity;
		}
		if (args.strokeWidth!=null){
			this.args.strokeWidth = args.strokeWidth;
		}
		if (args.shape!=null){
			this.args.shape = args.shape;
		}
		if (args.fill!=null){
			this.args.fill = args.fill;
		}
//		if (args.title!=null){
			if (args.fontSize!=null){
				this.args.fontSize = args.fontSize;
			}
//			if (args.title.fill!=null){
//				this.args.fill = args.fill;
//			}
//		}
	
	}
	
	this.changed = new Event();
};

ItemFeatureFormat.prototype.toJSON = function(){
	if(this.args.strokeOpacity != null){
		this.args["stroke-opacity"] = this.args.strokeOpacity;
		delete this.args.strokeOpacity;
	}
	if(this.args.strokeWidth != null){
		this.args["stroke-width"] = this.args.strokeWidth;
		delete this.args.strokeWidth;
	}

	if(this.args.title.fontColor != null){
		this.args.title["font-color"] = this.args.title.fontColor;
	}
	else{
		this.args.title["font-color"] = this.args.fontColor;//;this.args.title.fontColor;
	}
	
	if(this.args.title.fontSize != null){
		this.args.title["font-size"] = this.args.title.fontSize;//;this.args.title.fontColor;
	}
	else{ 
		this.args.title["font-size"] = this.args.fontSize;//;this.args.title.fontColor;
	}
	//return this.args;
	return this.args;
};

ItemFeatureFormat.prototype.getAttribute = function(name){return this.args[name];};

//Getters and Setters
ItemFeatureFormat.prototype.setVisible = function(visible){
	if (this.args.visible != visible){
		this.args.visible = visible;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getVisible = function(){return this.args.visible;};

ItemFeatureFormat.prototype.setHidden = function(hidden){
	if (this.args.hidden != hidden){
		this.args.hidden = hidden;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getHidden = function(){return this.args.hidden;};


ItemFeatureFormat.prototype.setStroke = function(stroke){
	if (this.args.stroke != stroke){
		this.args.stroke = stroke;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getStroke = function(){return this.args.stroke;};

ItemFeatureFormat.prototype.setStrokeOpacity = function(strokeOpacity){
	if (this.args.strokeOpacity != strokeOpacity){
		this.args.strokeOpacity = strokeOpacity;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getStrokeOpacity = function(){return this.args["stroke-opacity"];};

ItemFeatureFormat.prototype.setStrokeWidth = function(strokeWidth){
	if (this.args.strokeWidth != strokeWidth){
		this.args.strokeWidth = strokeWidth;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getStrokeWidth = function(){return this.args.strokeWidth;};

ItemFeatureFormat.prototype.setFill = function(fill){
	if (this.args.fill != fill){
		this.args.fill = fill;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getFill = function(){return this.args.fill;};

ItemFeatureFormat.prototype.setSize = function(size){
	if (this.args.size != size){
		this.args.size = size;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getSize = function(){return this.args.size;};

ItemFeatureFormat.prototype.setOpacity = function(opacity){
	if (this.args.opacity != opacity){
		this.args.opacity = opacity;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getOpacity = function(){return this.args.opacity;};

ItemFeatureFormat.prototype.getArrowSize = function(){return this.args.arrowSize;};

ItemFeatureFormat.prototype.setArrowSize = function(arrowSize){
	if (this.args.arrowSize != arrowSize){
		this.args.arrowSize = arrowSize;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getFontSize = function(){return this.args.title.fontSize;};

ItemFeatureFormat.prototype.setFontSize = function(fontSize){

	if (this.args.title.fontSize != fontSize){
		this.args.title.fontSize = fontSize;
		this.changed.notify(this);
	}
};




/*
function svgsnptrack (id,targetID,  args) {
	featureTrack.prototype.constructor.call(this, id,targetID,  args);
	
	this.drawBlocks = true;
	this.sizeBetweenBlocks = 80;
	
	this.consecuenceTypes = new Object();
	this.consecuenceTypesNames = new Array();
	

}


svgsnptrack.prototype = featureTrack;
svgsnptrack.prototype.constructor= featureTrack;

svgsnptrack.prototype.changeView =         featureTrack.prototype.changeView;
svgsnptrack.prototype.render =             featureTrack.prototype.render;
svgsnptrack.prototype.init =               featureTrack.prototype.init;
svgsnptrack.prototype.createSVGDom =       featureTrack.prototype.createSVGDom;
svgsnptrack.prototype._getTopText =        featureTrack.prototype._getTopText;
svgsnptrack.prototype._getTopFeatures = featureTrack.prototype._getTopFeatures;
svgsnptrack.prototype._searchSpace = featureTrack.prototype._searchSpace;
//svgsnptrack.prototype._overlapBlocks = featureTrack.prototype._overlapBlocks;
svgsnptrack.prototype.drawTitle = featureTrack.prototype.drawTitle;
svgsnptrack.prototype.mouseMove = featureTrack.prototype.mouseMove;
svgsnptrack.prototype.mouseclick = featureTrack.prototype.mouseclick;
svgsnptrack.prototype.getById = featureTrack.prototype.getById;

//True si dos bloques se solapan
svgsnptrack.prototype.addConsequenceType = function(consequenceType){
	for (var i = 0; i< this.consecuenceTypesNames.length; i++){
		if (consequenceType == this.consecuenceTypesNames[i]){
			
			//me quedo aqui
		}
		
	}
};


//True si dos bloques se solapan
svgsnptrack.prototype._overlapBlocks = function(block1, block2){
	var pixelInc = (this.right - this.left)/(this.end - this.start);
	if ( Math.abs(block1.start - block2.start) * pixelInc < this.sizeBetweenBlocks){
		return true;
	}
	return false;
};

//Si una feature se encuentra entre un start y un end
svgsnptrack.prototype.contains = function(feature, start, end){
	if ((feature.start > start)&& (feature.end < end)){
		return true;
	}
	return false;
};




svgsnptrack.prototype.drawFeatures = function(){
	
	var pixelInc = (this.right - this.left)/(this.end - this.start);
	var strokewidth = 0.1;
	var stroke = "white";

	this.queues = new Array();
	this.queues.push(new Array());
	
	

	
	//if ((this.featuresView[start+"-" +end].length) > ((this.right - this.left)/1000)){
	if (this.drawBlocks){
		
		var numberOfDivisions = 80;
		var divisions = new Array();
		var clusters = new Array();
		var start = this.start;
		var end = this.end;
		
		var interval = Math.ceil(((this.end - this.start)/numberOfDivisions));
		for (var i = 0; i < numberOfDivisions; i++){
			
			var x = ( parseFloat(this.start)+ parseFloat(i*interval))+ parseFloat(1);
			var y = parseFloat(this.start) + parseFloat((i+1)*interval);
			divisions.push([x, y]);
			clusters.push(new Array());
		}
		
		
		//si ya habiamos calculado los bloques
		if(this.blocksView[this.start+"-" +this.end]!=null){
			clusters = this.blocksView[start+"-" +end];
		}else{
			for (var i = 0; i < this.featuresView[start+"-" +end].length;  i++){
				for(var j = 0; j < divisions.length; j++){
					if (this.contains(this.featuresView[start+"-" +end][i], divisions[j][0],  divisions[j][1])){
						clusters[j].push(this.featuresView[start+"-" +end][i]);
					}
				}
			}
			
		}
		var max = 0;
		for(var j = 0; j < divisions.length; j++){
				if (clusters[j].length>max){
					max=clusters[j].length;
				}
		}
		
		this.blocksView[start+"-" +end] = clusters;
		for (var i = 0; i < numberOfDivisions; i++){
			var startInterval = divisions[i][0];
			var endInterval = divisions[i][1];
			var relativeSize = (clusters[i].length*100)/max;
			var relativeHeight = (relativeSize*this.maxBlockFeatureHeight)/100;
			var startPoint = this.left + pixelInc * (startInterval - this.start);
			exonWidth = pixelInc * (endInterval - startInterval);
			
			
			var attributes = [["fill", "blue"],["cursor", "pointer"],["id", this.id+"_block_"+start+"-"+end+"_index_"+i] ,["stroke-width", strokewidth],["opacity", 0.3], ["stroke", stroke]];
			SVG.drawRectangle( startPoint, this.top + (this.maxBlockFeatureHeight - relativeHeight)  , exonWidth, relativeHeight, this.trackNodeGroup, attributes);
		}
		
		
	}
	
	
	
	var featuresToDraw = new Array();
	var attributes = [["fill", color],["id",] ,["stroke-width", strokewidth], ["stroke", stroke]];
	
	//Dibujo todas las features
	for (var i = 0; i < this.featuresView[start+"-" +end].length;  i++)
	{
		var feature = this.featuresView[start+"-" +end][i];
		var color =  feature.color;
		//Actualizar esta varible antes
		this.sizeBetweenBlocks = 80;
		var queueToDraw = this._searchSpace(feature); 
		
		//Insertamos en la cola para marcar el espacio reservado
		this.queues[queueToDraw].push(feature);
		
		var _this = this;
		var exonWidth = 1;
		var startPoint = 0;
		var top = 0;
		
		if ((parseFloat(feature.start) >= parseFloat(this.start)) && (parseFloat(feature.end) <= parseFloat(this.end))){
			startPoint = this.left + pixelInc * (feature.start - this.start);
			top = this._getTopFeatures()+ (queueToDraw*this.queueHeight);
			attributes.push(["opacity", "1"]);
		}	
		
		var topTodraw = top ;
		if (this.drawBlocks){
			topTodraw = topTodraw + this.maxBlockFeatureHeight;
		}
		
		featuresToDraw.push({"startPoint": Math.ceil(startPoint), "topTodraw":topTodraw, "exonWidth":exonWidth,"height": this.featureHeight, "id": feature.name});
		//SVG.drawRectangle( startPoint, topTodraw, exonWidth, this.featureHeight, this.trackNodeGroup, attributes);
		
	//	var topTodraw = topTodraw + 7 ;
		
	//	var textAttr = [["fill", "black"],["id", this.id+ "_" + feature.name] , ["opacity", "1"], ["font-size", 10], ["style", "cursor:pointer"]];
	//	SVG.drawText( startPoint+2, topTodraw  , feature.id, this.labelNodeGroup, textAttr);
	}
	

	if (this.queues.length<40){
		for (var i = 0; i < featuresToDraw.length; i++){
			
			var attributes = [["fill", color],["id", this.id+ "_" + featuresToDraw[i].id] ,["stroke-width", strokewidth], ["stroke", stroke]];
			SVG.drawRectangle( featuresToDraw[i].startPoint, featuresToDraw[i].topTodraw, featuresToDraw[i].exonWidth, featuresToDraw[i].height, this.trackNodeGroup, attributes);
			
			var textAttr = [["fill", "black"],["id", this.id+ "_" + featuresToDraw[i].id] , ["opacity", "1"], ["font-size", 10], ["style", "cursor:pointer"]];
			SVG.drawText( featuresToDraw[i].startPoint+2, featuresToDraw[i].topTodraw +7 , featuresToDraw[i].id, this.labelNodeGroup, textAttr);
		}
		
		this.drawTitle(this._getTopFeatures()+ (this.queues.length*this.queueHeight) + this.maxBlockFeatureHeight);
		
	}
	else{
		
		this.queues = new Array();
		this.queues.push(new Array());
		for (var i = 0; i < featuresToDraw.length; i++){
			top = this._getTopFeatures()+ (this.queueHeight)  + this.maxBlockFeatureHeight;
			var attributes = [["fill", color],["id", this.id+ "_" + featuresToDraw[i].id] ,["stroke-width", strokewidth], ["stroke", stroke]];
			SVG.drawRectangle( featuresToDraw[i].startPoint, top, featuresToDraw[i].exonWidth, featuresToDraw[i].height, this.trackNodeGroup, attributes);
		}
		
		this.drawTitle(this._getTopFeatures()+ this.maxBlockFeatureHeight +  this._getTopFeatures()+ (this.queueHeight) + 10  );
		
	}
	
};
*/// JavaScript Document
function svgtranscripttrack (trackerID,targetID,  args) {
		featureTrack.prototype.constructor.call(this, trackerID,targetID,  args);
		
		this.drawBlocks = true;
		this.sizeBetweenBlocks = 80;
		
		this.consecuenceTypes = new Object();
		this.consecuenceTypesNames = new Array();
		

}


	svgtranscripttrack.prototype.constructor=featureTrack;

	svgtranscripttrack.prototype.changeView = featureTrack.prototype.changeView;
	svgtranscripttrack.prototype.render = featureTrack.prototype.render;
	svgtranscripttrack.prototype.init = featureTrack.prototype.init;
	svgtranscripttrack.prototype.createSVGDom = featureTrack.prototype.createSVGDom;
	svgtranscripttrack.prototype._getTopText = featureTrack.prototype._getTopText;
	svgtranscripttrack.prototype._getTopFeatures = featureTrack.prototype._getTopFeatures;
	svgtranscripttrack.prototype._searchSpace = featureTrack.prototype._searchSpace;
	svgtranscripttrack.prototype._overlapBlocks = featureTrack.prototype._overlapBlocks;
	svgtranscripttrack.prototype.drawTitle = featureTrack.prototype.drawTitle;
	svgtranscripttrack.prototype.mouseMove = featureTrack.prototype.mouseMove;
	svgtranscripttrack.prototype.mouseclick = featureTrack.prototype.mouseclick;
	svgtranscripttrack.prototype.getById = featureTrack.prototype.getById;



	svgtranscripttrack.prototype.drawFeatures = function(){
		
		var pixelInc = (this.right - this.left)/(this.end - this.start);
		var strokewidth = 0.4;
		var stroke = "white";
		
		var startView = this.start;
		var endView = this.end;
		
		this.queues = new Array();
		this.queues.push(new Array());
		
		
		for (var i = 0; i < this.featuresView[startView +"-" +endView].length;  i++)
		{
			var feature = this.featuresView[startView +"-"+endView][i];
			var color =  feature.color;
			var queueToDraw = this._searchSpace(feature); 
			//Insertamos en la cola para marcar el espacio reservado
			this.queues[queueToDraw].push(feature);
			var attributes = [["fill", color],["id", this.id+"_" + feature.name] ,["stroke-width", strokewidth], ["stroke", stroke], ["style", "cursor:hand"]];
			
			var id = JSON.stringify(feature);
			var _this = this;
			var exonWidth = 1;
			var startPoint = 0;
			var top = 0;
			
			//Encontramos la feature dentro del espacio que estamos visualizando
			if ((parseFloat(feature.start) >= parseFloat(startView)) && (parseFloat(feature.end) <= parseFloat(endView))){
				exonWidth = pixelInc * (feature.end - feature.start);
				
				startPoint = this.left + pixelInc * (feature.start - startView);
				top = this.top+ (queueToDraw*this.queueHeight);
			}	
			
			//La feature empieza fuera del margen derecho pero acaba dentro
			if ((feature.start < startView) && (feature.end < endView)&& (feature.end > startView)){
				exonWidth = pixelInc * (feature.end - startView);//(this.features[i].start + this.left));
				startPoint = this.left;
				top =  this.top+ (queueToDraw*this.queueHeight);
			
			}
			
			//La feature que empieza dentro pero se sale del margen izquierdo
			if ((feature.start > startView) && (feature.end > endView) && (feature.start < endView)){
				
				startPoint = this.left + pixelInc * (feature.start - startView);
				exonWidth = this.right -startPoint;
				top = this.top+ (queueToDraw*this.queueHeight);
			}
			
			//La feature es mas grande que todo el espacio que visualizamos
			if ((feature.start < startView) && (feature.end > endView)){
				exonWidth =  this.right - this.left;
				startPoint = this.left;
				top = this.top+ (queueToDraw*this.queueHeight);
				
			}
			
			attributes.push(["opacity", "1"]);
			exonWidth =  Math.ceil(exonWidth);
			var node = SVG.drawRectangle( startPoint, top, exonWidth, this.featureHeight, this.trackNodeGroup, attributes);
		}
		
		
		//Dibujamos las uniones
		
		for (var i = 0; i < this.featuresView[startView +"-" +endView].length - 1;  i++)
		{
			var unionNode1 = this.featuresView[startView +"-" +endView][i];
			var unionNode2 = this.featuresView[startView +"-" +endView][i + 1];
			
			var start = unionNode1.end;
			var end = unionNode2.start;
			var middle = (end - start)/2;
		
			startPoint = this.left + pixelInc * (start - startView);
			middlePoint =  pixelInc * (end - start);
			
			var attributes = [["fill", color],["id", this.id+"_" + feature.name] ,["stroke-width", 1],["opacity", "0.5"], ["stroke", color]];
			
			//Encontramos la feature dentro del espacio que estamos visualizando
			if ((parseFloat(unionNode1.start) >= parseFloat(startView)) && (parseFloat(unionNode1.end) <= parseFloat(endView))){
				if ((parseFloat(unionNode2.start) >= parseFloat(startView)) && (parseFloat(unionNode2.end) <= parseFloat(endView))){
					var node = SVG.drawLine( startPoint, top + (this.featureHeight/2), startPoint + (middlePoint)/2, top + this.featureHeight, this.trackNodeGroup, attributes);
					var node = SVG.drawLine( startPoint + (middlePoint)/2, top + this.featureHeight, startPoint + (middlePoint), top + (this.featureHeight/2), this.trackNodeGroup, attributes);
				}
			}	
		}
		
		this.drawTitle(this.top+ (this.queues.length*this.queueHeight));
};



function RuleTrack (rulerID,targetID,  args) {
	
	//Groups and layers
	this.ruleNodeGroup = null;
	this.mainNodeGroup = null;
	this.labelNodeGroup = null;
	
	//target
	this.targetID = targetID;
	
	//Coordenates
	this.top = args.coords.top;
	this.left = args.coords.left;
	this.right = args.coords.right;
	this.width = args.coords.width;
	this.height = args.coords.height;
	
	
	this.start = args.rule.start;
	this.end = args.rule.end;
	
	// ruler
	this.inc = args.rule.inc;
	this.mediumDivisionInterval = args.rule.mediumDivisionInterval;
	this.bigDivisionInterval =  args.rule.bigDivisionInterval;
	
	
	//ruler size
	this.rulerLabelsTop = this.top + 18;
	this.topRule = this.top + 20;
	this.rulerTraceSmall = 4;
	this.rulerTraceMedium = 8;
	this.rulerTraceBig = 10;
	

	//Optional parameters
	this.backgroundColor = "#FFFFFF";
	this.linecolor =  "#000000";
	this.textcolor = "#000000";
	
	
	this.labelBigIntervals = true;
	this.labelMediumIntervals = false;

	//Processing optional parameters
	if (args.optional!=null)
	{
		if (args.optional.backgroundcolor!=null)
		{
			this.backgroundColor = args.optional.backgroundcolor;		
		}
		if (args.optional.linecolor!=null)
		{
			this.linecolor = args.optional.linecolor;		
		}
		if (args.optional.textcolor!=null)
		{
			this.textcolor = args.optional.textcolor;	
		}
		if (args.optional.labelBigIntervals!=null)
		{
			this.labelBigIntervals = args.optional.labelBigIntervals;	
		}
		if (args.optional.labelMediumIntervals!=null)
		{
			this.labelMediumIntervals = args.optional.labelMediumIntervals;	
		}

	}

	//id manage
	this.id = rulerID;	
	this.rulerID = null;
	this.namesID = null;
	this.idMain =null;
	
	
	//Events
	this.click = new Event(this);
};

RuleTrack.prototype.createSVGDom = function(targetID, id, width, height, backgroundColor )
{
	var container = document.getElementById(targetID);
	this._svg = SVG.createSVGCanvas(container, [["id", id]]);
	var rect = SVG.drawRectangle(0, 0, width, height, this._svg, [["fill", backgroundColor],[id, id + "_background"]]);
	this.idMain = this._svg.getAttribute("id") + "_Main";
	this.idRule = this._svg.getAttribute("id") + "_Rule";
	this.idLabels = this._svg.getAttribute("id") + "_Names";
	return this._svg;
};

RuleTrack.prototype.changeView = function(start, end)
{
	this.start = start;
	this.end = end;
};

RuleTrack.prototype.init = function()
{
		
	this._svg = this.createSVGDom(this.targetID, this.id, this.width, this.height, this.backgroundColor);
	this.mainNodeGroup = SVG.drawGroup(this._svg, [["id", this.idMain]]);
	
	this.ruleNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idRule]]);
	this.labelNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idLabels]]);
	
	var _this = this;
    this._svg.addEventListener("mousemove", function(event) { _this.mouseMove(event, _this); }, false);
    this._svg.addEventListener("mousedown", function(event) { _this.mouseDown(event, _this); }, false);
    this._svg.addEventListener("mouseup", function(event) { _this.mouseUp(event, _this); }, false);
};


RuleTrack.prototype.mouseMove = function(){
	//console.log("mouse move");
};
RuleTrack.prototype.mouseDown = function(){

	//console.log("mouse mouseDown");
};
RuleTrack.prototype.mouseUp = function(){

	//console.log("mouse mouseUp");
};


RuleTrack.prototype.render = function() 
{
	this.init();
	var count = 0;
	
	var steps = ((this.end - this.start)/this.inc);
	var realWidth = this.right - this.left;
	var pixInc = realWidth/((this.end - this.start)/this.inc);
      
	for (var i = 0; i <= steps; i=i+1)
	{
		var x1 = x2 = this.left + i * pixInc;
		var y1 = this.topRule;
		
		var topInc = this.rulerTraceSmall;
		var realNumber = parseFloat(this.start) + parseFloat(i*this.inc);
		var alreadyLabeled = false;
		var label = Math.ceil(realNumber/1000)+ " Kb";
		
		if (i%(this.bigDivisionInterval) == 0)
		{
			topInc = this.rulerTraceBig;
			if (this.labelBigIntervals)
			{
				SVG.drawText(x1, this.rulerLabelsTop, label , this.labelNodeGroup, [["font-size", 12], ["fill", this.textcolor]]); 
				SVG.drawRectangle(x1 - 2, this.rulerLabelsTop-12, 50 , 15, this._svg, [["fill", this.textcolor], ["opacity", "0.2"], ["rx", "5"], ["ry", "5"]]);
				alreadyLabeled = true;
			}
		}

		if (i%(this.mediumDivisionInterval) == 0){
			if (this.labelMediumIntervals){
				if (!alreadyLabeled){
					topInc = this.rulerTraceMedium;
					SVG.drawRectangle(x1 - 2, this.rulerLabelsTop-12, 50 , 15, this._svg, [["fill", this.textcolor], ["opacity", "0.1"], ["rx", "5"], ["ry", "3"]]);
					SVG.drawText(x1, this.rulerLabelsTop, label, this.labelNodeGroup, [["font-size", 10], ["fill", this.textcolor]]); 
				}
			}
		}
	
		var y2 = this.topRule + topInc;
		SVG.drawLine(x1, y1, x2, y2,  this.ruleNodeGroup, [["stroke", this.linecolor]]);
		count ++;
	}
	
	//draw horizontal line
	SVG.drawLine(this.left, y1,this.right, y1,  this.ruleNodeGroup, [["stroke", this.linecolor]]);
  
};
