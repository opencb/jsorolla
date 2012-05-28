function TrackSvgLayout(parent, trackDataList, args) {
	var _this = this;
	this.args = args;
	this.id = Math.round(Math.random()*10000000);
	this.trackDataList = trackDataList;
	
	this.trackSvgList =  new Array();
	this.swapHash = new Object();
	
	//default values
	this.height=25;
	
	if (args != null){
		if(args.width != null){
			this.width = args.width;
		}
		if(args.height != null){
			this.height = args.height;
		}
		if(args.position != null){
			this.position = args.position;
		}
		if(args.chromosome != null){
			this.chromosome = args.chromosome;
		}
		if(args.zoom != null){
			this.zoom = args.zoom;
		}
	}
	
	this.pixelBase = this._getPixelsbyBase(this.zoom);
	
	this.svg = SVG.init(parent,{
		"width":this.width,
		"height":this.height
	});

	trackDataList.onAddTrack.addEventListener(function(sender,index){
		_this.draw(index);
	});
	
	
	this.onMove = new Event();
	var mid = this.width/2;
	this.positionText = SVG.addChild(this.svg,"text",{
		"x":mid-30,
		"y":15,
		"fill":"green",
	});
	this.positionText.textContent = this.position;
	
	this.lastPosMove = 0;
	$(this.svg).mousedown(function(event) {
		var move = event.clientX;
		$(this).mousemove(function(event){
//			console.log((move - event.clientX)/_this.pixelBase)
			var posMove = Math.floor((move - event.clientX)/_this.pixelBase);
			if(posMove!=_this.lastPosMove){
//				console.log(posMove-_this.lastPosMove)
				_this.onMove.notify(posMove-_this.lastPosMove);
				_this.position = _this.position+posMove-_this.lastPosMove;
				_this.positionText.textContent = _this.position;
			}
			_this.lastPosMove = posMove;
		});
	});
	$(this.svg).mouseup(function(event) {
		$(this).off('mousemove');
	});
	
	this.currentLine = SVG.addChild(this.svg,"line",{
			"x1":mid,
			"y1":this.height,
			"x2":mid,
			"y2":this.height,
			"stroke-width":"1",
			"stroke":"green"
	});
	
	this.onZoomChange = new Event();
	
};

TrackSvgLayout.prototype.setHeight = function(height){
	this.height=height;
	this.svg.setAttribute("height",height);
};
TrackSvgLayout.prototype.setZoom = function(zoom){
	this.zoom=zoom;
	this.pixelBase = this._getPixelsbyBase(this.zoom);
	this.onZoomChange.notify();
};


TrackSvgLayout.prototype.draw = function(i){
	var _this = this;
	
	
	var trackData = this.trackDataList.getTrack(i);
	var trackSvg = new TrackSvg(this.svg,{
		position:this.position,
		zoom:this.zoom,
		pixelBase:this.pixelBase,
		id:trackData.id,
		width:this.width
	});
	
	var halfVirtualWidth = _this.width*3/2;
	var virtualStart = parseInt(_this.position - halfVirtualWidth / _this.pixelBase);
	var vitualEnd = parseInt(_this.position + halfVirtualWidth / _this.pixelBase);
	trackData.retrieveData({chromosome:13,start:virtualStart,end:vitualEnd});
	
	this.onZoomChange.addEventListener(function(sender,data){
		trackSvg.zoom=_this.zoom;
		trackSvg.pixelBase=_this.pixelBase;
		while ( trackSvg.features.childNodes.length >= 1 )
	    {
			trackSvg.features.removeChild( trackSvg.features.firstChild );       
	    } 
		trackSvg.cache={};
		var virtualStart = parseInt(_this.position - halfVirtualWidth / _this.pixelBase);
		var vitualEnd = parseInt(_this.position + halfVirtualWidth / _this.pixelBase);
		trackData.retrieveData({chromosome:13,start:virtualStart,end:vitualEnd});
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
	
	$(this.svg).mousedown(function(event) {
		$(this).mousemove(function(event){
			trackSvg.position = _this.position;
			var virtualStart = parseInt(_this.position - halfVirtualWidth / _this.pixelBase);
			var vitualEnd = parseInt(_this.position + halfVirtualWidth / _this.pixelBase);
			trackData.retrieveData({chromosome:13,start:virtualStart,end:vitualEnd});
		});
	});
	$(this.svg).mouseup(function(event) {
		$(this).off('mousemove');
	});
	
	trackData.onRetrieve.addEventListener(function(sender,data){
//		console.log(trackData.featureCache)
		trackSvg.addFeatures(data);
	});
	
	this.height += trackSvg.getHeight();
	
	trackData = this.trackDataList.trackList[i];
	this.svg.setAttribute("height",this.height);
	this.currentLine.setAttribute("y2",this.height);
};

TrackSvgLayout.prototype._redraw = function(){
	var _this = this;
	var trackSvg = null;
	var lastY = 25;
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
	this.currentLine.setAttribute("y2",this.height);
	
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
	this.currentLine.setAttribute("y2",this.height);
	
	this._redraw();
};


TrackSvgLayout.prototype._getPixelsbyBase = function(zoom){
	var zoomLevels = new Array(); 
	
	zoomLevels[-40]= 0.00000476837158203125;
	zoomLevels[-35]= 0.00000476837158203125;
	zoomLevels[-30]= 0.00000476837158203125;
	zoomLevels[-25]= 0.00000476837158203125;
	zoomLevels[-20]= 0.00000476837158203125;
	zoomLevels[-15]= 0.00000476837158203125;
	zoomLevels[-10]= 0.00000476837158203125;
	zoomLevels[-5] = 0.00000476837158203125;
	zoomLevels[0]  = 0.0000095367431640625;
	zoomLevels[5]  = 0.000019073486328125;
	zoomLevels[10] = 0.00003814697265625;
	zoomLevels[15] = 0.0000762939453125;
	zoomLevels[20] = 0.000152587890625;
	zoomLevels[25] = 0.00030517578125;
	zoomLevels[30] = 0.0006103515625;
	zoomLevels[35] = 0.001220703125;
	zoomLevels[40] = 0.00244140625;
	zoomLevels[45] = 0.0048828125;
	zoomLevels[50] = 0.009765625;
	zoomLevels[55] = 0.01953125;
	zoomLevels[60] = 0.0390625;
	zoomLevels[65] = 0.078125;
	zoomLevels[70] = 0.15625;
	zoomLevels[75] = 0.3125;
	zoomLevels[80] = 0.625;
	zoomLevels[85] = 1.25;
	zoomLevels[90] = 2.5;
	zoomLevels[95] = 5;
	zoomLevels[100] = 10;
	
	return zoomLevels[zoom];
};

