function GenomeWidgetProperties(species,args) {
	this.args = args;
	
	this.species=species;
	this.windowSize = 10000000;
	
	this.minWindowSize = 100;
	this.maxWindowSize = 100000000;
	
	this._pixelRatio = 0.0005; 
	this.showTranscripts = false;
	
	this._zoom = 100;
	this.increment = 5;
    
	/** General parameters TRACKS CONFIG **/
	this.labelHeight = 10;
	this.labelSize = 10;
	this.featureHeight = 4;
	
	if (args != null){
		if (args.windowSize != null){
			this.windowSize = args.windowSize;
		}
		if (args.id != null){
			this.id = args.id+"_master";
		}
		if (args._pixelRatio != null){
			this._pixelRatio = args._pixelRatio;
		}
		if (args.width != null){
			this.width = args.width;
		}
		if (args.showTrancsripts != null){
			this.showTrancsripts = args.showTranscripts;
		}
		
		if (args.showExons != null){
			this.showExons = args.showExons;
		}
		if (args.zoom != null){
			this._zoom = args.zoom;
		}
		
	}
	
	this._zoomLevels = new Object();
	this._interval = new Object();
	this._windowSizeLevels = new Object();
	this._zoomTracks = new Object();
	this._zoomDataAdapters = new Object();
	
	for ( var i = 0; i <= 100; i = i + this.increment) { 
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
	var _this=this;
	
	this._zoomLevels[-40]= 0.00000476837158203125;
	this._zoomLevels[-35]= 0.00000476837158203125;
	this._zoomLevels[-30]= 0.00000476837158203125;
	this._zoomLevels[-25]= 0.00000476837158203125;
	this._zoomLevels[-20]= 0.00000476837158203125;
	this._zoomLevels[-15]= 0.00000476837158203125;
	this._zoomLevels[-10]= 0.00000476837158203125;
	this._zoomLevels[-5] = 0.00000476837158203125;
	this._zoomLevels[0]  = 0.0000095367431640625;
	this._zoomLevels[5]  = 0.000019073486328125;
	this._zoomLevels[10] = 0.00003814697265625;
	this._zoomLevels[15] = 0.0000762939453125;
	this._zoomLevels[20] = 0.000152587890625;
	this._zoomLevels[25] = 0.00030517578125;
	this._zoomLevels[30] = 0.0006103515625;
	this._zoomLevels[35] = 0.001220703125;
	this._zoomLevels[40] = 0.00244140625;
	this._zoomLevels[45] = 0.0048828125;
	this._zoomLevels[50] = 0.009765625;
	this._zoomLevels[55] = 0.01953125;
	this._zoomLevels[60] = 0.0390625;
	this._zoomLevels[65] = 0.078125;
	this._zoomLevels[70] = 0.15625;
	this._zoomLevels[75] = 0.3125;
	this._zoomLevels[80] = 0.625;
	this._zoomLevels[85] = 1.25;
	this._zoomLevels[90] = 2.5;
	this._zoomLevels[95] = 5;
	this._zoomLevels[100] = 10;
	
	//XXX PAKO interval settings
	for ( var i = -40; i <=100; i+=this.increment) {
		this._windowSizeLevels[i] = this.width/this._zoomLevels[i];
	}
	
	
//	this._zoom =  100;
	this._pixelRatio = this._zoomLevels[this._zoom];
	this.windowSize = this._windowSizeLevels[this._zoom];
	
	
	//XXX PAKO interval settings
	for ( var i = 0; i <=100; i+=this.increment) {
		this._interval[i]  = Math.ceil((1000/this._zoomLevels[i])/(this.width/5));
	}
	
	
//	console.log('width: '+ this.width);
//	console.log('pixelRatio: '+ this._pixelRatio);
//	console.log('windowSize: '+ this.windowSize);
	
	
	for ( var i = 0; i <= 100; i = i + this.increment) {
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

	for ( var i = minZoom; i <= maxZoom; i = i + this.increment) {
		if(this._zoomTracks[i]!=null){
			this._zoomTracks[i].push(track);
			this._zoomDataAdapters[i].push(dataAdapter);
		}
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
	
	this.addCytobandTracks();
	this.addSequenceTracks();
	this.addMultifeatureTracks();
	this.addSNPTracks();
	this.addTFBSTracks();
	this.addHistoneTracks();
	this.addPolymeraseTracks();
	this.addOpenChromatinTracks();
	this.addMirnaTargetTracks();
	
	this.addConservedRegionsTracks();
	this.addCpgIslandTracks();
	this.addMutationTracks();
	this.addStructuralVariationTracks();
	

	
	/** Set visibility **/
	this.tracks["Cytoband"] = false;
	this.tracks["SNP"] = false;
	this.tracks["Sequence"] = false;
	
	this.tracks["Histone"] = false;
	this.tracks["Open Chromatin"] = false;
	this.tracks["Polymerase"] = false;
	this.tracks["TFBS"] = false;
	this.tracks["miRNA targets"] = false;
	
	//TODO doing
	this.tracks["Conserved regions"] = false;
	this.tracks["CpG islands"] = false;
	this.tracks["Mutation"] = false;
	this.tracks["Structural variation"] = false;
};


/** SNP TRACKS **/
GenomeWidgetProperties.prototype.addSNPTracks = function(){
	
//	var snpTrack = new SNPFeatureTrack(this.id,this.tracksPanel, this.species, {
//		top : 5,
//		left : 0,
//		label : true,
//		title : "SNP",
//		height : 20,
//		isAvalaible : false
//	});
//	this.addTrackByZoom(0, 50, snpTrack,new RegionCellBaseDataAdapter(this.species,{resource : "snp"}));
	for ( var i = 0; i <= 80; i+=this.increment) {
		var histoTrack = new HistogramFeatureTrack(this.id, this.tracksPanel, this.species,{
			top : 20,
			left : 0,
			height : 40,
			featureHeight : 40,
			title : "SNP",
			titleFontSize : 9,
			titleWidth : 70,
			showTranscripts : false,
			allowDuplicates : true,
			backgroundColor : '#FFFFFF',
			label : false,
			pixelSpaceBetweenBlocks : 1,
			showDetailGeneLabel : false,
			forceColor : "orange"
//			intervalSize : 500000
		});
		this.addTrackByZoom(i, i, histoTrack,new RegionCellBaseDataAdapter(this.species,{resource : "snp?histogram=true&interval="+this._interval[i]}));
	}

	var snpTrack = new SNPFeatureTrack(this.id, this.tracksPanel, this.species,{
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
	this.addTrackByZoom(85, 95, snpTrack,new RegionCellBaseDataAdapter(this.species,{resource : "snp"}));

	var snpTrack = new SNPFeatureTrack(this.id, this.tracksPanel, this.species,{
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
	var sequenceTrack = new SequenceFeatureTrack(this.id, this.tracksPanel, this.species,{
		top : 20,
		title : "Sequence",
		height : 15,
		featureHeight : 12,
		avoidOverlapping : false,
		backgroundColor : '#FFFFFF',
		isAvalaible: false
	});
	this.addTrackByZoom(0, 95, sequenceTrack,new RegionCellBaseDataAdapter(this.species));
	
	var sequenceTrack = new SequenceFeatureTrack(this.id, this.tracksPanel, this.species,{
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
	
	var cytobandTrack = new FeatureTrack(this.id, this.tracksPanel, this.species,{
					top : 10,
					height : 20,
					labelHeight : this.labelHeight,
					featureHeight : this.featureHeight,
					labelSize : this.labelSize,
					title : "Cytoband",
					allowDuplicates : true,
					label : false
			});
	this.addTrackByZoom(0, 5, cytobandTrack,new RegionCellBaseDataAdapter(this.species,{resource : "cytoband"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id, this.tracksPanel, this.species,{
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
	for ( var i = 0; i <= 70; i+=this.increment) {
		var histoTrack = new HistogramFeatureTrack(this.id, this.tracksPanel, this.species,{
			top : 20,
			left : 0,
			height : 40,
			featureHeight : 40,
			title : 'miRNA targets',
			titleFontSize : 9,
			titleWidth : 70,
			showTranscripts : false,
			allowDuplicates : true,
			backgroundColor : '#FFFFFF',
			label : false,
			pixelSpaceBetweenBlocks : 1,
			showDetailGeneLabel : false,
			forceColor : "#ff7f50"
//			intervalSize : 500000
		});
		this.addTrackByZoom(i, i, histoTrack,new RegionCellBaseDataAdapter(this.species,{resource : "mirnatarget?histogram=true&interval="+this._interval[i]}));
	}
	
	
	var cytobandTrack2 = new FeatureTrack(this.id, this.tracksPanel, this.species,{
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
	this.addTrackByZoom(75, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "mirnatarget"}));
};

/** OPEN CHROMATIN **/
GenomeWidgetProperties.prototype.addOpenChromatinTracks = function(){
	
	for ( var i = 0; i <= 80; i+=this.increment) {
		var histoTrack = new HistogramFeatureTrack(this.id, this.tracksPanel, this.species,{
			top : 20,
			left : 0,
			height : 40,
			featureHeight : 40,
			title : 'Open Chromatin',
			titleFontSize : 9,
			titleWidth : 70,
			showTranscripts : false,
			allowDuplicates : true,
			backgroundColor : '#FFFFFF',
			label : false,
			pixelSpaceBetweenBlocks : 1,
			showDetailGeneLabel : false,
			forceColor : "#288B00"
//			intervalSize : 500000
		});
		this.addTrackByZoom(i, i, histoTrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Open Chromatin&histogram=true&interval="+this._interval[i]}));
	}
	
	var cytobandTrack2 = new FeatureTrack(this.id, this.tracksPanel, this.species,{
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
	this.addTrackByZoom(85, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Open Chromatin"}));
};




/** Polymerasa **/
GenomeWidgetProperties.prototype.addPolymeraseTracks = function(){
	
	for ( var i = 0; i <= 80; i+=this.increment) {
		var histoTrack = new HistogramFeatureTrack(this.id, this.tracksPanel, this.species,{
			top : 20,
			left : 0,
			height : 40,
			featureHeight : 40,
			title : 'Polymerase',
			titleFontSize : 9,
			titleWidth : 70,
			showTranscripts : false,
			allowDuplicates : true,
			backgroundColor : '#FFFFFF',
			label : false,
			pixelSpaceBetweenBlocks : 1,
			showDetailGeneLabel : false,
			forceColor : "#2A9A14"
//			intervalSize : 500000
		});
		this.addTrackByZoom(i, i, histoTrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Polymerase&histogram=true&interval="+this._interval[i]}));
	}
	
	
	var cytobandTrack2 = new FeatureTrack(this.id, this.tracksPanel, this.species,{
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
	this.addTrackByZoom(85, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Polymerase"}));
	
};




/** HISTONES **/
GenomeWidgetProperties.prototype.addHistoneTracks = function(){
	
	for ( var i = 0; i <= 80; i+=this.increment) {
		var histoTrack = new HistogramFeatureTrack(this.id, this.tracksPanel, this.species,{
			top : 20,
			left : 0,
			height : 40,
			featureHeight : 40,
			title : 'Histone',
			titleFontSize : 9,
			titleWidth : 70,
			showTranscripts : false,
			allowDuplicates : true,
			backgroundColor : '#FFFFFF',
			label : false,
			pixelSpaceBetweenBlocks : 1,
			showDetailGeneLabel : false,
			forceColor : "#298A08"
//			intervalSize : 500000
		});
		this.addTrackByZoom(i, i, histoTrack, new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Histone&histogram=true&interval="+this._interval[i]}));
	}
	
	var track = new FeatureTrack(this.id, this.tracksPanel, this.species,{
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
	this.addTrackByZoom(85, 100, track, new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Histone"}));
	
};

/** TFBS TRACKS **/
GenomeWidgetProperties.prototype.addTFBSTracks = function(){
	
	for ( var i = 0; i <= 70; i+=this.increment) {
		var histoTrack = new HistogramFeatureTrack(this.id, this.tracksPanel, this.species,{
			top : 20,
			left : 0,
			height : 40,
			featureHeight : 40,
			title : 'TFBS',
			titleFontSize : 9,
			titleWidth : 70,
			showTranscripts : false,
			allowDuplicates : true,
			backgroundColor : '#FFFFFF',
			label : false,
			pixelSpaceBetweenBlocks : 1,
			showDetailGeneLabel : false,
			forceColor : "#02599c"
//			intervalSize : 500000
		});
		this.addTrackByZoom(i, i, histoTrack,new RegionCellBaseDataAdapter(this.species,{resource : "tfbs?histogram=true&interval="+this._interval[i]}));
	}
	
	var cytobandTrack2 = new FeatureTrack(this.id, this.tracksPanel, this.species,{
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
	this.addTrackByZoom(75, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "tfbs"}));

};



/** CONSERVED REGIONS **/  //TODO
GenomeWidgetProperties.prototype.addConservedRegionsTracks = function(){
	for ( var i = 0; i <= 100; i+=this.increment) {
		var histoTrack = new HistogramFeatureTrack(this.id, this.tracksPanel, this.species,{
			top : 20,
			left : 0,
			height : 40,
			featureHeight : 40,
			title : "Conserved regions",
			titleFontSize : 9,
			titleWidth : 70,
			showTranscripts : false,
			allowDuplicates : true,
			backgroundColor : '#FFFFFF',
			label : false,
			pixelSpaceBetweenBlocks : 1,
			showDetailGeneLabel : false,
			forceColor : "purple"
//			intervalSize : 500000
		});
		this.addTrackByZoom(i, i, histoTrack,new RegionCellBaseDataAdapter(this.species,{resource : "conservedregion?histogram=true&interval="+this._interval[i]}));
	}
	

};

/** CPG REGIONS **/  //TODO
GenomeWidgetProperties.prototype.addCpgIslandTracks = function(){
	var cpgIsland = new FeatureTrack(this.id, this.tracksPanel, this.species,{
		top : 10,
		height : 20,
		labelHeight : this.labelHeight,
		featureHeight : this.featureHeight,
		labelSize : this.labelSize,
		allowDuplicates : true,
		label : true,
		titleWidth : 92,
		pixelSpaceBetweenBlocks : 100,
		avoidOverlapping : true,
		title : 'CpG islands'
	});
	this.addTrackByZoom(75, 100, cpgIsland,new RegionCellBaseDataAdapter(this.species,{resource : "cpgisland"}));
	
	for ( var i = 0; i <= 70; i+=this.increment) {
		var histoTrack = new HistogramFeatureTrack(this.id, this.tracksPanel, this.species,{
			top : 20,
			left : 0,
			height : 40,
			featureHeight : 40,
			title : 'CpG islands',
			titleFontSize : 9,
			titleWidth : 70,
			showTranscripts : false,
			allowDuplicates : true,
			backgroundColor : '#FFFFFF',
			label : false,
			pixelSpaceBetweenBlocks : 1,
			showDetailGeneLabel : false,
			forceColor : "#76ee00"
//			intervalSize : 500000
		});
		this.addTrackByZoom(i, i, histoTrack,new RegionCellBaseDataAdapter(this.species,{resource : "cpgisland?histogram=true&interval="+this._interval[i]}));
	}
	
	
};

/** Mutation REGIONS **/  //TODO
GenomeWidgetProperties.prototype.addMutationTracks = function(){
	
	for ( var i = 0; i <= 70; i+=this.increment) {
		var histoTrack = new HistogramFeatureTrack(this.id, this.tracksPanel, this.species,{
			top : 20,
			left : 0,
			height : 40,
			featureHeight : 40,
			title : 'Mutation',
			titleFontSize : 9,
			titleWidth : 70,
			showTranscripts : false,
			allowDuplicates : true,
			backgroundColor : '#FFFFFF',
			label : false,
			pixelSpaceBetweenBlocks : 1,
			showDetailGeneLabel : false,
			forceColor : "#00fa9a"
//			intervalSize : 500000
		});
		this.addTrackByZoom(i, i, histoTrack,new RegionCellBaseDataAdapter(this.species,{resource : "mutation?histogram=true&interval="+this._interval[i]}));
	}
	
	
	var snpTrack = new SNPFeatureTrack(this.id, this.tracksPanel, this.species,{
		top : 5,
		left : 0,
		label : true,
		title : "Mutation",
		height : 20,
		labelHeight : this.labelHeight,
		featureHeight : 10,
		labelSize : this.labelSize,
		pixelSpaceBetweenBlocks : 150,
		avoidOverlapping : true,
		backgroundColor : '#555555'
	});
	this.addTrackByZoom(75, 100, snpTrack,new RegionCellBaseDataAdapter(this.species,{resource : "mutation"}));
};

/** STRUCTURAL VARIATION REGIONS **/
GenomeWidgetProperties.prototype.addStructuralVariationTracks = function(){
	
	for ( var i = 0; i <= 70; i+=this.increment) {
		var histoTrack = new HistogramFeatureTrack(this.id, this.tracksPanel, this.species,{
			top : 20,
			left : 0,
			height : 40,
			featureHeight : 40,
			title : 'Structural variation',
			titleFontSize : 9,
			titleWidth : 70,
			showTranscripts : false,
			allowDuplicates : true,
			backgroundColor : '#FFFFFF',
			label : false,
			pixelSpaceBetweenBlocks : 1,
			showDetailGeneLabel : false,
			forceColor : "#a2b5cd"
//			intervalSize : 500000
		});
		this.addTrackByZoom(i, i, histoTrack,new RegionCellBaseDataAdapter(this.species,{resource : "structuralvariation?histogram=true&interval="+this._interval[i]}));
	}
	
	
	var structuralVariationTrack = new FeatureTrack(this.id, this.tracksPanel, this.species,{
		top : 10,
		height : 20,
		labelHeight : this.labelHeight,
		featureHeight : this.featureHeight,
		labelSize : this.labelSize,
		allowDuplicates : true,
		label : true,
		titleWidth : 92,
		pixelSpaceBetweenBlocks : 100,
		avoidOverlapping : true,
		title : 'Structural variation'
	});
	this.addTrackByZoom(75, 100, structuralVariationTrack,new RegionCellBaseDataAdapter(this.species,{resource : "structuralvariation"}));
};

/** MULTIFEATURE TRACKS **/
GenomeWidgetProperties.prototype.addMultifeatureTracks = function(){
	
	for ( var i = 0; i <= 10; i+=this.increment) {
		var multitrack = new HistogramFeatureTrack(this.id, this.tracksPanel, this.species,{
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
//			intervalSize : 500000
		});
		this.addTrackByZoom(i, i, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "gene?histogram=true&interval="+this._interval[i]}));
	}
	
	var multitrack2 = new MultiFeatureTrack(this.id, this.tracksPanel, this.species,{
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

	this.addTrackByZoom(15, 25, multitrack2,new GeneRegionCellBaseDataAdapter(this.species,{obtainTranscripts : false}));
	
	var multitrack2 = new MultiFeatureTrack(this.id, this.tracksPanel, this.species,{
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

	var multitrack3 = new MultiFeatureTrack(this.id, this.tracksPanel, this.species,{
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

	this.addTrackByZoom(45, 60, multitrack3,new GeneRegionCellBaseDataAdapter(this.species,{obtainTranscripts : false}));

	var multitrack4 = new MultiFeatureTrack(this.id, this.tracksPanel, this.species,{
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

	this.addTrackByZoom(65, 70, multitrack4,new GeneRegionCellBaseDataAdapter(this.species,{obtainTranscripts : true}));
	
	var multitrack4 = new MultiFeatureTrack(this.id, this.tracksPanel, this.species,{
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

	this.addTrackByZoom(75, 80, multitrack4,new GeneRegionCellBaseDataAdapter(this.species,{obtainTranscripts : true}));

	var multitrack5 = new MultiFeatureTrack(this.id, this.tracksPanel, this.species,{
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
	this.addTrackByZoom(85, 90, multitrack5,new GeneRegionCellBaseDataAdapter(this.species));

	var multitrack5 = new MultiFeatureTrack(this.id, this.tracksPanel, this.species,{
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
	this.addTrackByZoom(95, 100, multitrack5,new GeneRegionCellBaseDataAdapter(this.species));
	
};
