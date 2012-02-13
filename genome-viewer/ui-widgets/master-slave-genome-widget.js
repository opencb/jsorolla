function MasterSlaveGenomeViewer(trackerID, targetId,  args) {
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
};