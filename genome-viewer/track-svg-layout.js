function TrackSvgLayout(parent, args) {
	var _this = this;
	this.args = args;
	this.id = Math.round(Math.random()*10000000);
	
	this.trackDataList =  new Array();
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
	this._createPixelsbyBase();//create pixelByBase array
	this.pixelBase = this._getPixelsbyBase(this.zoom);
	this.halfVirtualBase = (this.width*3/2) / this.pixelBase;
	
	this.svg = SVG.init(parent,{
		"width":this.width,
		"height":this.height
	});
	
	var mid = this.width/2;
	this.positionText = SVG.addChild(this.svg,"text",{
		"x":mid-30,
		"y":15,
		"fill":"green"
	});
	this.positionText.textContent = this.position;
	
	this.currentLine = SVG.addChild(this.svg,"line",{
			"x1":mid,
			"y1":this.height,
			"x2":mid,
			"y2":this.height,
			"stroke-width":1,
			"stroke":"green"
	});
//	this.currentLine = SVG.addChild(this.svg,"rect",{
//		"x":mid,
//		"y":this.height,
//		"width":this.pixelBase,
//		"height":this.height,
//		"stroke":"green"
//});

	
	this.onZoomChange = new Event();
	this.onChromosomeChange = new Event();
	this.onMove = new Event();
	
	//Main svg events
	$(this.svg).mousedown(function(event) {
		var downX = event.clientX;
		var lastX = 0;
		$(this).mousemove(function(event){
			var newX = (downX - event.clientX)/_this.pixelBase | 0;//truncate always towards zero
			if(newX!=lastX){
				var desp = lastX-newX;
				_this.position -= desp;
				_this.positionText.textContent = _this.position;
				_this.onMove.notify(desp);
				lastX = newX;
			}
		});
	});
	$(this.svg).mouseup(function(event) {
		$(this).off('mousemove');
	});
	
	$(this.svg).mouseover(function(){
//		console.log("over");
	});
	$(this.svg).mouseout(function(){
//		console.log("out");
	});
	
};

TrackSvgLayout.prototype.setHeight = function(height){
	this.height=height;
	this.svg.setAttribute("height",height);
};
TrackSvgLayout.prototype.setZoom = function(zoom){
	this.zoom=zoom;
	this.pixelBase = this._getPixelsbyBase(this.zoom);
	this.halfVirtualBase = (this.width*3/2) / this.pixelBase;
	this.onZoomChange.notify();
};
TrackSvgLayout.prototype.setChromosome = function(chr){
	this.chromosome = chr;
	this.onChromosomeChange.notify();
};

TrackSvgLayout.prototype.addTrack = function(trackData, args){
	var _this = this;
	
	var i = this.trackDataList.push(trackData);
	
	var trackSvg = new TrackSvg(this.svg,{
		position:this.position,
		zoom:this.zoom,
		pixelBase:this.pixelBase,
		id:args.id,
		type:args.type,
		width:this.width,
		render:args.render
	});
	
	this.trackSvgList.push(trackSvg);
	this.swapHash[trackSvg.id] = {index:i-1,visible:true};
	trackSvg.setY(this.height);
	trackSvg.draw();
	
	//Watch out!!!
	//this event must be attached before any "trackData.retrieveData()" call
	trackData.adapter.onGetData.addEventListener(function(sender,data){
		trackSvg.addFeatures(data);
	});

	
	//on first load get virtual window and retrieve data
	var virtualStart = parseInt(this.position - this.halfVirtualBase);
	var vitualEnd = parseInt(this.position + this.halfVirtualBase);
	trackData.retrieveData({chromosome:this.chromosome,start:virtualStart,end:vitualEnd});
	
	//on zoom change set new virtual window and update track values
	this.onZoomChange.addEventListener(function(sender,data){
		trackSvg.zoom=_this.zoom;
		trackSvg.pixelBase=_this.pixelBase;
		
		while( trackSvg.features.childNodes.length >= 1 )
	    {
			trackSvg.features.removeChild( trackSvg.features.firstChild );
	    }
		trackData.adapter.featureCache.featuresAdded = new Object();

		var virtualStart = parseInt(_this.position - _this.halfVirtualBase);
		var vitualEnd = parseInt(_this.position + _this.halfVirtualBase);
		if(virtualStart<0){
			virtualStart=1;
		}
		if(vitualEnd>300000000){
			vitualEnd=300000000;
		}
		trackData.retrieveData({chromosome:_this.chromosome,start:virtualStart,end:vitualEnd});
	});
	
	this.onChromosomeChange.addEventListener(function(sender,data){
		while( trackSvg.features.childNodes.length >= 1 )
	    {
			trackSvg.features.removeChild( trackSvg.features.firstChild );
	    }
		trackData.adapter.featureCache.featuresAdded = {};
		
		var virtualStart = parseInt(_this.position - _this.halfVirtualBase);
		var vitualEnd = parseInt(_this.position + _this.halfVirtualBase);
		if(virtualStart<0){
			virtualStart=1;
		}
		if(vitualEnd>300000000){
			vitualEnd=300000000;
		}
		trackData.retrieveData({chromosome:_this.chromosome,start:virtualStart,end:vitualEnd});
	});
	
	
	var callStart = parseInt(trackSvg.position - this.halfVirtualBase);
	var callEnd = parseInt(trackSvg.position + this.halfVirtualBase);
	
	
	
	//movement listeners
	this.onMove.addEventListener(function(sender,desp){
		trackSvg.position -= desp;
		var despBase = desp*_this.pixelBase;
		trackSvg.pixelPosition-=despBase;
		
		var move =  parseFloat(trackSvg.features.getAttribute("x")) + despBase;
		trackSvg.features.setAttribute("x",move);
		
		var virtualStart = parseInt(trackSvg.position - _this.halfVirtualBase/3);
		var virtualEnd = parseInt(trackSvg.position + _this.halfVirtualBase/3);
		
		if(virtualStart<0){
			virtualStart=1;
		}
		if(vitualEnd>300000000){
			vitualEnd=300000000;
		}
		
		if(desp<0 && virtualEnd > callEnd){
			trackData.retrieveData({chromosome:_this.chromosome,start:callEnd,end:parseInt(callEnd+_this.halfVirtualBase/3)});
			callEnd = parseInt(callEnd+_this.halfVirtualBase/3);
		}

		if(desp>0 && virtualStart < callStart){
			trackData.retrieveData({chromosome:_this.chromosome,start:parseInt(callStart-_this.halfVirtualBase/3),end:callStart});
			callStart = parseInt(callStart-_this.halfVirtualBase/3);
		}
	});
	
	//$(this.svg).mousedown(function(event) {
		//var downX = event.clientX;
		//var lastX = 0;
		//$(this).mousemove(function(event){
			//var newX = (downX - event.clientX)/_this.pixelBase | 0;//truncate always towards zero
			//if(newX!=lastX){
				//var desp = lastX-newX;
				//var despBase = desp*_this.pixelBase;
				//var move =  parseFloat(trackSvg.features.getAttribute("x")) + despBase;
				//trackSvg.features.setAttribute("x",move);
				//trackSvg.pixelPosition-=despBase;
				//
				//var virtualStart = parseInt(trackSvg.position - _this.halfVirtualBase/3);
				//var virtualEnd = parseInt(trackSvg.position + _this.halfVirtualBase/3);
				//
				//if(desp<0 && virtualEnd > callEnd){
					//trackData.retrieveData({chromosome:_this.chromosome,start:callEnd,end:parseInt(callEnd+_this.halfVirtualBase/3)});
					//callEnd = parseInt(callEnd+_this.halfVirtualBase/3);
				//}
				//
				//if(desp>0 && virtualStart < callStart){
					//trackData.retrieveData({chromosome:_this.chromosome,start:parseInt(callStart-_this.halfVirtualBase/3),end:callStart});
					//callStart = parseInt(callStart-_this.halfVirtualBase/3);
				//}
				//
				//lastX = newX;
			//}
		//});
	//});
	//$(this.svg).mouseup(function(event) {
		//$(this).off('mousemove');
	//});
	
	
	
	//dibujado
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
	if(i+1<this.trackDataList.length){
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
	return this.zoomLevels[zoom];
};

TrackSvgLayout.prototype._createPixelsbyBase = function(){
	this.zoomLevels = new Array();
	var pixelsByBase = 10;
	for ( var i = 100; i >= -40; i-=5) {
		this.zoomLevels[i] = pixelsByBase;
		pixelsByBase = pixelsByBase / 2;
	}
};
