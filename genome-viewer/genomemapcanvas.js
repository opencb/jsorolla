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


