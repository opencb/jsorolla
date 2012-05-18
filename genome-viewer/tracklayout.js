function TrackLayout(args) {
	this.args = args;
	this.id = Math.round(Math.random()*10000000);
	
	this.trackList =  new Array();
	this.trackHash = new Object();
	
	//XXX end SVG
//	// move element "on top of" all others within the same grouping
//	el.parentNode.appendChild(el); 
//
//	// move element "underneath" all others within the same grouping
//	el.parentNode.insertBefore(el,el.parentNode.firstChild);
//
//	// move element "on top of" all others in the entire document
//	el.ownerSVGElement.appendChild(el); 
//
//	// move element "underneath" all others in the entire document
//	el.ownerSVGElement.appendChild(el,el.ownerSVGElement.firstChild); 
};


//Add the tracks to the TrackList array. nothing with dom for now
TrackLayout.prototype.add = function(item){
	if(item instanceof Array){
		for ( var i = 0; i < item.length; i++) {
			this.trackList.push(item[i]);
		}
	}
	var i = this.trackList.push(item);
	this.trackHash[item.id] = i-1;
};

TrackLayout.prototype.draw = function(){
	var _this = this;
	var track = null;
	var lastY = 0;
	for ( var i = 0; i < this.trackList.length; i++) {
		track = this.trackList[i];
		track.setY(lastY);
		track.draw();
		
//		$(track.upRect).off('click');
		//track wants to move up 1 position, recieves i ITERARION
		$(track.upRect).bind("click",function(event){
			_this._reallocate(this.parentNode.id);
		});
		lastY += track.getHeight();
	}
};


//This routine is called when track order modified
TrackLayout.prototype._reallocate = function(trackMainId){
	
	var i = this.trackHash[trackMainId];
	console.log(i+" quiere moverse 1 posicion arriba");
	if(i>0){
		var underTrack=this.trackList[i];
		var aboveTrack=this.trackList[i-1];
		var y = parseInt(aboveTrack.main.getAttribute("y"));
		var h = parseInt(underTrack.main.getAttribute("height"));
		underTrack.main.setAttribute("y",y);
		aboveTrack.main.setAttribute("y",y+h);
		this.trackList[i] = aboveTrack;
		this.trackList[i-1] = underTrack;
		this.trackHash[underTrack.id]=i
		//TODO
//		console.log(_this.trackList);
//		console.log(_this.trackList[i]);
//	_this._reallocate();
//	console.log(_this.);
		
		
	}else{
		console.log("ya esta en la mas alta");
	}
};


