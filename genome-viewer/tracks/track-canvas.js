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
	
	/** Flag to solve marker bug */
//	this.isBeenRenderized = true; /** true si estoy renderizando por primera vez el trackcanvas **/
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
		if (args.lastPosition != null) {
			this.lastPosition = args.lastPosition;
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
		
		//XXX test - only when middle>=0, at this point start is a negative vaule, like middle, depending on mouse speed
		if(this.middle>=0/*&& this.middle<=this.lastPosition*/){
			this._dragging(event);
			this.moveLabelsFeatureSelected();
		}
//		if(){
//			this._dragging(event);
//			this.moveLabelsFeatureSelected();
//		}
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
		
		//XXX test - acutal negative start - actual negative middle + 1 gets the start position that situates middle on 0
		if(this.middle<=0){
			this._goToCoordinateX(this.start-Math.ceil(this.middle)+1);
		}
//		//XXX apaño, pensarlo mejor
//		if(this.middle>=this.lastPosition){
//			this._goToCoordinateX(this.start-Math.ceil(this.middle)+this.lastPosition);
//		}
		
		
		
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
//		console.log("regionAdapter instanceof DasRegionDataAdapter");
//		var formatters = new ArrayRegionCellBaseDataAdapter();
		var formatters = new Array();
		for ( var i = 0; i < regionAdapter.dataset.json.length; i++) {
			formatters.push(new DASFeatureFormatter(regionAdapter.dataset.json[i]));
		}
		regionAdapter.dataset.json = formatters;
	}
	
	/** GENE REGION  **/
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
		
		if (regionAdapter.resource == "regulatory?type=Open Chromatin") {
			console.log("cromatin");
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new GenericFeatureFormatter(regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "regulatory?type=Histone") {
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
		
		if (regionAdapter.resource == "cpgisland") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new CpgIslandFeatureFormatter(
						regionAdapter.dataset.json[0][i]));
			}
		}
		
		if (regionAdapter.resource == "mutation") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new MutationFeatureFormatter(
						regionAdapter.dataset.json[0][i]));
			}
		}

		if (regionAdapter.resource == "structuralvariation") {
			var formatters = new Array();
			for ( var i = 0; i < regionAdapter.dataset.json[0].length; i++) {
				formatters.push(new StructuralVariationFeatureFormatter(
						regionAdapter.dataset.json[0][i]));
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
//				//original
//				data.middle = Math.ceil(data.middle) + 1;
				
				//TODO doing pako borrar
//				console.log(regionAdapter);
				data.middle =  Math.floor(data.middle);
//				console.log(data.middle);
				/**/
				
				regionAdapter.setIntervalView(chromosome, data.middle);
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
			
			if (_this._areAllTracksRendered()) {
				_this.drawRules(chromosome, start, end);
			}
//			console.log(_this._areAllTracksRendered());
		}
};

TrackCanvas.prototype.selectPaintOnRules = function(middle) {
	for ( var i = 0; i < this.getRulerTrack().length; i++) {
		if (this.pixelRatio < 1){
			this.getRulerTrack()[i].select(middle);
		}
		else{
			this.getRulerTrack()[i].select(middle, {width:this.pixelRatio});
		}
	}
};

TrackCanvas.prototype.getRulerTrack = function() {
	var rules = new Array();
	for ( var i = 0; i < this.trackList.length; i++) {
		if (this.trackList[i] instanceof RuleFeatureTrack){
			rules.push(this.trackList[i]);
		}
	}
	return rules;
};

TrackCanvas.prototype.getMiddlePoint = function() {
	//orig
//	return Math.ceil(this.middle) + 1;
	
	//TODO doing pako borrar
	return Math.floor(this.middle);
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


TrackCanvas.prototype.draw = function(chromosome, data_start, data_end, view_start, view_end) {
	
//	//XXX testing
//	var position = view_start + (view_end - view_start)/2;
//	var halfBases = (this.width) / this.pixelRatio / 2;
//	var wstart =  Math.ceil(position - halfBases);
//	var wend = Math.ceil(position + halfBases);
//	console.log(this.width);
//	console.log(position);
//	console.log(wstart+":"+wend);
	
	
	this.start = view_start;
	this.end = view_end;
//	console.log(start+":"+end);
	this.chromosome = chromosome;
	this.startViewBox = (view_start * this.pixelRatio) % this.viewBoxModule;
	this.endViewBox = (view_end * this.pixelRatio) % this.viewBoxModule;
//	console.log(this.startViewBox+":"+this.endViewBox);
	
	for ( var i = 0; i < this.regionAdapterList.length; i++) {
			var track = this.trackList[i];
			var regionAdapter = this.regionAdapterList[i];
			regionAdapter.successed = new Event(regionAdapter);
			regionAdapter.preloadSuccess = new Event(regionAdapter);
			
			//Set lastPosition of the chromosome on the track and the adapter
			if(regionAdapter instanceof RuleRegionDataAdapter){
				regionAdapter.maxChromosomeSize = this.lastPosition;
			} 
			if(track instanceof RuleFeatureTrack){
				track.lastPosition = this.lastPosition;
			}
			
			this._drawTrack(chromosome, data_start, data_end, track, regionAdapter);
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
//	console.log("viewBox: "+viewBox);
	this._svg.setAttribute("viewBox", viewBox);
	
	
//	//orig
//	/** He cambiado esto por el slave **/
//	if (this.isBeenRenderized){
//		this.middle = this.start + (this.end - this.start)/2;
//		this.isBeenRenderized = false;
//	}
//	else{
//		this.middle = this.start + ((this.width / this.pixelRatio) / 2);
//	}


////	//TODO doing pako borrar
//	this.middle = this.start + ((this.width / this.pixelRatio) / 2);
//	console.log((this.width / this.pixelRatio)/2);
	this.middle = this.start + ((this.width / this.pixelRatio) / 2);
//	
	
	//
	this.onMove.notify({
		"chromosome" : this.chromosome,
		"start" : this.start,
		"end" : this.end,
		"middle" : this.middle
	});
};

TrackCanvas.prototype._moveCoordinateX = function(move) {
//	for ( var i = 0; i < this.trackList.length; i++) {
//		if ((this.trackList[i].title) != null) {
////			if (parseFloat(this.pixelRatio) < 1){
//				this.trackList[i].moveTitle(-move);
////			}
////			else{
////				this._drawTitle(i);
////			}
//		}
//	}

	var newStart = move / this.pixelRatio;
	this._goToCoordinateX(Math.ceil(this.start + newStart));
	this._moveTitle();
};

TrackCanvas.prototype._moveTitle = function() {
	// Get svg elements
	var titleBoxElements = $(".trackTitleBox");
	var titleTextElements = $(".trackTitleText");
	
	var start = this.start;
	if(start < 0) start = 0;
	var coordenateX = ((start * this.pixelRatio) % this.viewBoxModule);

	for ( var i = 0; i < titleBoxElements.length; i++) {
		titleBoxElements[i].setAttribute("x", coordenateX);
		titleTextElements[i].setAttribute("x", coordenateX+2);
	}
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
