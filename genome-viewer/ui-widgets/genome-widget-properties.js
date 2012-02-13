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





