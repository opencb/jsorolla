function TrackLayout(svgNode, args) {
	this.args = args;
	this.id = Math.round(Math.random()*10000000);
	this.svgNode = svgNode;
	
	this.trackList =  new Array();
	this.trackHash = new Object();
	if (args != null){
		if(args.clase != null){
			this.clase = args.clase;
		}
	}
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
	console.log(this.trackHash);
	var _this = this;
	var track = null;
	var lastY = 0;
	for ( var i = 0; i < this.trackList.length; i++) {
		track = this.trackList[i];
		track.setY(lastY);
		track.draw();
		
		$(track.upRect).bind("click",function(event){
			_this._reallocateAbove(this.parentNode.id);//"this" is the svg element
		});
		$(track.downRect).bind("click",function(event){
			_this._reallocateUnder(this.parentNode.id);//"this" is the svg element
		});
		lastY += track.getHeight();
	}
};


//This routine is called when track order modified
TrackLayout.prototype._reallocateAbove = function(trackMainId){
	var i = this.trackHash[trackMainId];
	console.log(i+" quiere moverse 1 posicion arriba");
	if(i>0){
		var aboveTrack=this.trackList[i-1];
		var underTrack=this.trackList[i];
		var y = parseInt(aboveTrack.main.getAttribute("y"));
		var h = parseInt(underTrack.main.getAttribute("height"));
		aboveTrack.main.setAttribute("y",y+h);
		underTrack.main.setAttribute("y",y);
		this.trackList[i] = aboveTrack;
		this.trackList[i-1] = underTrack;
		this.trackHash[aboveTrack.id]=i;
		this.trackHash[underTrack.id]=i-1;
		
	}else{
		console.log("ya esta en la mas alta");
	}
};
//This routine is called when track order modified
TrackLayout.prototype._reallocateUnder = function(trackMainId){
	var i = this.trackHash[trackMainId];
	console.log(i+" quiere moverse 1 posicion arriba");
	if(i+1<this.trackList.length){
		var aboveTrack=this.trackList[i];
		var underTrack=this.trackList[i+1];
		var y = parseInt(aboveTrack.main.getAttribute("y"));
		var h = parseInt(underTrack.main.getAttribute("height"));
		aboveTrack.main.setAttribute("y",y+h);
		underTrack.main.setAttribute("y",y);
		this.trackList[i] = underTrack;
		this.trackList[i+1] = aboveTrack;
		this.trackHash[underTrack.id]=i;
		this.trackHash[aboveTrack.id]=i+1;
		
	}else{
		console.log("abajo del todo");
	}
};

