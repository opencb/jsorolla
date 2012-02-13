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



