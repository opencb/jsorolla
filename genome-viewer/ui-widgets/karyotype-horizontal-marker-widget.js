
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
		       this.getTopPanel(),
//		       this.getMiddleMenu(),
//		       this.getBotPanel()
		      ]
	});


	var port = Ext.create('Ext.container.Viewport', {
		layout: 'border',
		items: [
		        center,
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
