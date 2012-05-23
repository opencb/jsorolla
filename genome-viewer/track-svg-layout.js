function TrackSvgLayout(parent, trackDataList, args) {
	var _this = this;
	this.args = args;
	this.id = Math.round(Math.random()*10000000);
	this.trackDataList = trackDataList;
	
	this.trackSvgList =  new Array();
	this.swapHash = new Object();
	
	//default values
	this.height=0;
	
	if (args != null){
		if(args.width != null){
			this.width = args.width;
		}
		if(args.height != null){
			this.height = args.height;
		}
	}
	
	this.svg = SVG.init(parent,{
		"width":this.width,
		"height":this.height
	});
	
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
	trackDataList.onAddTrack.addEventListener(function(sender,index){
		_this.draw(index);
	});
	
};

TrackSvgLayout.prototype.setHeight = function(height){
	this.height=height;
	this.svg.setAttribute("height",height);
};

TrackSvgLayout.prototype.draw = function(i){
	console.log(i);
	var _this = this;
	var trackSvg = new TrackSvg(this.svg,{
		id:this.trackDataList.trackList[i].id,
		width:this.width
	});
	this.trackSvgList.push(trackSvg);
	this.swapHash[trackSvg.id] = {index:i,visible:true};
	trackSvg.setY(this.height);
	trackSvg.draw();
	
	//XXX se puede mover?
	$(trackSvg.upRect).bind("click",function(event){
		_this._reallocateAbove(this.parentNode.id);//"this" is the svg element
	});
	$(trackSvg.downRect).bind("click",function(event){
		_this._reallocateUnder(this.parentNode.id);//"this" is the svg element
	});
	$(trackSvg.hideRect).bind("click",function(event){
		_this._hideTrack(this.parentNode.id);//"this" is the svg element
	});
	
	this.height += trackSvg.getHeight();
	
	trackData = this.trackDataList.trackList[i];
	this.svg.setAttribute("height",this.height);
};

TrackSvgLayout.prototype._redraw = function(){
	var _this = this;
	var trackSvg = null;
	var lastY = 0;
	for ( var i = 0; i < this.trackSvgList.length; i++) {
		trackSvg = this.trackSvgList[i];
		if(this.swapHash[trackSvg.id].visible){
			trackSvg.main.setAttribute("y",lastY);
			lastY += trackSvg.getHeight();
		}
	}
};

//This routine is called when track order modified
TrackSvgLayout.prototype._reallocateAbove = function(trackMainId){
	var i = this.swapHash[trackMainId].index;
	console.log(i+" quiere moverse 1 posicion arriba");
	if(i>0){
		var aboveTrack=this.trackSvgList[i-1];
		var underTrack=this.trackSvgList[i];
		
		var y = parseInt(aboveTrack.main.getAttribute("y"));
		var h = parseInt(underTrack.main.getAttribute("height"));
		aboveTrack.main.setAttribute("y",y+h);
		underTrack.main.setAttribute("y",y);
		
		this.trackSvgList[i] = aboveTrack;
		this.trackSvgList[i-1] = underTrack;
		this.swapHash[aboveTrack.id].index=i;
		this.swapHash[underTrack.id].index=i-1;
	}else{
		console.log("ya esta en la mas alta");
	}
};
//This routine is called when track order modified
TrackSvgLayout.prototype._reallocateUnder = function(trackMainId){
	var i = this.swapHash[trackMainId].index;
	console.log(i+" quiere moverse 1 posicion abajo");
	if(i+1<this.trackDataList.trackList.length){
		var aboveTrack=this.trackSvgList[i];
		var underTrack=this.trackSvgList[i+1];
		
		var y = parseInt(aboveTrack.main.getAttribute("y"));
		var h = parseInt(underTrack.main.getAttribute("height"));
		aboveTrack.main.setAttribute("y",y+h);
		underTrack.main.setAttribute("y",y);
		
		this.trackSvgList[i] = underTrack;
		this.trackSvgList[i+1] = aboveTrack;
		this.swapHash[underTrack.id].index=i;
		this.swapHash[aboveTrack.id].index=i+1;
		
	}else{
		console.log("abajo del todo");
	}
};

TrackSvgLayout.prototype._hideTrack = function(trackMainId){
	this.swapHash[trackMainId].visible=false;
	var i = this.swapHash[trackMainId].index;
	var track = this.trackSvgList[i];
	this.svg.removeChild(track.main);
	
	this.height -= track.getHeight();
	this.svg.setAttribute("height",this.height);
	
	this._redraw();
	
	
	var _this= this;
	setTimeout(function() {
		_this._showTrack(trackMainId);
	},2000);
	
};

TrackSvgLayout.prototype._showTrack = function(trackMainId){
	this.swapHash[trackMainId].visible=true;
	var i = this.swapHash[trackMainId].index;
	var track = this.trackSvgList[i];
	this.svg.appendChild(track.main);
	
	this.height += track.getHeight();
	this.svg.setAttribute("height",this.height);
	
	this._redraw();
};



