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
		if (args.lastPosition != null) {
			this.lastPosition = args.lastPosition;
		}
		if (args.viewer != null) {
			this.viewer = args.viewer;
		}
		if (args.hasFocus != null) {
			this.hasFocus = args.hasFocus;
		}
//		if (args.ruleNotListenMoving != null){
//			this.ruleNotListenMoving = args.ruleNotListenMoving;
//		}
	}
	
	 this.trackList = new Array();
     this.dataAdapterList = new Array();

     
	this.trackCanvas = null;
	
	/** EVENTS **/
	this.onClick = new Event(this);
	this.onRender = new Event(this);
	this.onMove = new Event(this);
	
//	console.log("widget width: "+this.width);
	
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

GenomeWidget.prototype.draw = function(chromosome, data_start, data_end, view_start, view_end){
//	start=32889528;
//	end=32889695;
//	var mid = start + (end-start)/2;
//	var nw= this.width / this.pixelRatio / 2;
//	start =  Math.ceil(mid - nw);
//	end = Math.ceil(mid + nw);
	
	
	this.chromosome = chromosome;
	this.start = data_start;
	this.end = data_end;
	
	var _this = this;
	this.init();
	
//	console.log(this.width);
//	console.log(this.pixelRatio);
	
	this.trackCanvas = new TrackCanvas(this.id, $('#'+this.targetId)[0], {
		top:0, 
		left:0, 
		right:this.width,  
		width:this.width, 
		height:this.height, 
		start: this.start, 
		end: this.end,
		backgroundColor: "#FFCCFF", 
		pixelRatio:this.pixelRatio,
		viewer:this.viewer,
		viewBoxModule: this.getviewBoxModule(),
		allowDragging :this.allowDragging,
		lastPosition : this.lastPosition,
		hasFocus:this.hasFocus
	});
	
    this.trackCanvas.init();
    
    
    this.trackCanvas.afterDrag.addEventListener(function (evt, data){
	});
    
    this.trackCanvas.onMove.addEventListener(function (evt, data){
    	_this.onMove.notify(data);
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
    this.trackCanvas.draw(this.chromosome, this.start, this.end, view_start, view_end);
    
   
};