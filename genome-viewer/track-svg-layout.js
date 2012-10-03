/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

function TrackSvgLayout(parent, args) {//parent is a DOM div element
	var _this = this;
	this.args = args;
	this.id = Math.round(Math.random()*10000000);
	//deprecated
	//this.trackDataList =  new Array();
	
	this.trackSvgList =  new Array();
	this.swapHash = new Object();
	this.zoomOffset = 0;//for region overview panel, that will keep zoom higher, 0 by default
	this.parentLayout = null;
	this.mousePosition="";
	this.windowSize = "";
	
	
	//default values
	this.height=0;
	
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
		if(args.zoomOffset != null){
			this.zoomOffset = args.zoomOffset;
		}
		if(args.zoom != null){
			this.zoom = args.zoom-this.zoomOffset;
		}
		if(args.parentLayout != null){
			this.parentLayout = args.parentLayout;
		}
		if(args.genomeViewer != null){
			this.genomeViewer = args.genomeViewer;
		}
	}
	
	this._createPixelsbyBase();//create pixelByBase array
	this.pixelBase = this._getPixelsbyBase(this.zoom);
	this.halfVirtualBase = (this.width*3/2) / this.pixelBase;
	
	
	//SVG structure and events initialization
	this.onZoomChange = new Event();
	this.onChromosomeChange = new Event();
	this.onMove = new Event();
	this.onWindowSize = new Event();
	this.onMousePosition = new Event();
	this.onSvgRemoveTrack = new Event();


	//this.tracksDiv = $('<div></div>').height(this.height).css({"overflow-y":"auto"})[0];
	//$(this.tracksDiv).appendTo(parent);

	//Main SVG and his events
	this.svgTop = SVG.init(parent.top,{
		"width":this.width
	});
	

	//Main SVG and his events
	this.svg = SVG.init(parent.track,{
		"width":this.width,
		"height":this.height
	});
	
	//grid
	var patt = SVG.addChild(this.svg,"pattern",{
		"id":this.id+"gridPatt",
		"patternUnits":"userSpaceOnUse",
		"x":0,
		"y":0,
		"width":10,
		"height":2000
	});
	
	var mid = this.width/2;
	this.grid = SVG.addChild(patt,"rect",{
		"x":parseInt(mid%10),
		"y":0,
		"width":1,
		"height":2000,
		"opacity":"0.15",
		"fill":"grey"
	});
	
	this.grid2 = SVG.addChild(this.svg,"rect",{
		"width":this.width,
		"height":2000,
		"x":0,
		"fill":"url(#"+this.id+"gridPatt)"
	});
	
	this.positionText = SVG.addChild(this.svgTop,"text",{
		"x":mid-30,
		"y":22,
		"font-size":10,
		"fill":"green"
	});
	this.nucleotidText = SVG.addChild(this.svgTop,"text",{
		"x":mid+35,
		"y":22,
		"font-family": "Ubuntu Mono",
		"font-size":13
	});
	this.firstPositionText = SVG.addChild(this.svgTop,"text",{
		"x":0,
		"y":22,
		"font-size":10,
		"fill":"green"
	});
	this.lastPositionText = SVG.addChild(this.svgTop,"text",{
		"x":this.width-70,
		"y":22,
		"font-size":10,
		"fill":"green"
	});
	this._setTextPosition();
	
	
	this.viewNtsArrow = SVG.addChild(this.svgTop,"rect",{
		"x":16,
		"y":2,
		"width":this.width-32,
		"height":10,
		"opacity":"0.7",
		"fill":"grey"
	});
	this.viewNtsArrowLeft = SVG.addChild(this.svgTop,"polyline",{
		"points":"0,7 16,0 16,14",
		"opacity":"0.7",
		"fill":"grey"
	});
	this.viewNtsArrowRight = SVG.addChild(this.svgTop,"polyline",{
		"points":this.width+",7 "+(this.width-16)+",0 "+(this.width-16)+",14",
		"opacity":"0.7",
		"fill":"grey"
	});
	this.viewNtsText = SVG.addChild(this.svgTop,"text",{
		"x":mid-30,
		"y":11,
		"font-size":10,
		"fill":"white"
	});
	this.windowSize = "Window size: "+Math.ceil((this.width)/this.pixelBase).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")+" nts";
	this.viewNtsText.textContent = this.windowSize;
	
	this.currentLine = SVG.addChild(this.svg,"rect",{
		"x":mid,
		"y":this.height,
		"width":this.pixelBase,
		"height":this.height,
		"stroke-width":"2",
		"stroke":"orangered",
		"opacity":"0.5",
		"fill":"orange"
	});
	
	this.mouseLine = SVG.addChild(this.svg,"rect",{
		"x":-20,
		"y":this.height,
		"width":this.pixelBase,
		"height":this.height,
		"stroke-width":"2",
		//"stroke":"LawnGreen",
		"stroke":"lightgray",
		"opacity":"0.4",
		//"fill":"GreenYellow"
		"fill":"gainsboro"
	});

	if(this.parentLayout==null){
		//Main svg  movement events
//		this.svg.setAttribute("cursor", "move");
		
		$(parent.track).mousemove(function(event) {
			var mid = _this.width/2;
			var pb2 = _this.pixelBase/2;
			var offsetX = (event.clientX - $(parent.track).offset().left);
			var cX = offsetX-pb2;
			var rcX = (cX/_this.pixelBase) | 0;
			var pos = (rcX*_this.pixelBase) + mid%_this.pixelBase;
			_this.mouseLine.setAttribute("x",pos);
			
			var posOffset = (mid/_this.pixelBase) | 0;
			_this.mousePosition = _this.position+rcX-posOffset;
			_this.onMousePosition.notify(_this.mousePosition);
			_this.setMousePosition(_this.mousePosition);
		});
		
		$(this.svg).mousedown(function(event) {
//			_this.mouseLine.setAttribute("visibility","hidden");
			this.setAttribute("cursor", "move");
			var downX = event.clientX;
			var lastX = 0;
			$(this).mousemove(function(event){
				this.setAttribute("cursor", "move");
				var newX = (downX - event.clientX)/_this.pixelBase | 0;//truncate always towards zero
				if(newX!=lastX){
					var desp = lastX-newX;
					var p = _this.position - desp;
					if(p>0){//avoid 0 and negative positions
						_this.position -= desp;
						_this._setTextPosition();
						_this.onMove.notify(desp);
						lastX = newX;
						_this.setNucleotidPosition(_this.position);
					}
				}
			});
		});
		$(this.svg).mouseup(function(event) {
			_this.mouseLine.setAttribute("visibility","visible");
			this.setAttribute("cursor", "default");
			$(this).off('mousemove');
//			$(this).focus();// without this, the keydown does not work
		});
		$(this.svg).mouseleave(function(event) {
			this.setAttribute("cursor", "default");
			$(this).off('mousemove');
			$("body").off('keydown');
		});
		
		$(this.svg).mouseenter(function(e) {
			$("body").off('keydown');
			enableKeys();
		});
		
		var enableKeys = function(){
			//keys
			$("body").keydown(function(e) {
				var desp = 0;
				switch (e.keyCode){
					case 37://left arrow
						if(e.ctrlKey){
							desp = 100/_this.pixelBase;
						}else{
							desp = 10/_this.pixelBase;
						}
					break;
					case 39://right arrow
						if(e.ctrlKey){
							desp = -100/_this.pixelBase;
						}else{
							desp = -10/_this.pixelBase;
						}
					break;
					case 109://minus key
						if(e.shiftKey){
							console.log("zoom out");
						}
					break;
					case 107://plus key
						if(e.shiftKey){
							console.log("zoom in");
						}
					break;
				}
				if(desp != 0){
					_this.position -= desp;
					_this._setTextPosition();
					_this.onMove.notify(desp);
				}
			});
		};
		
		
//		$(this.svg).focus();// without this, the keydown does not work
		
	}else{
		_this.parentLayout.onMove.addEventListener(function(sender,desp){
			_this.position -= desp;
			_this._setTextPosition();
			_this.onMove.notify(desp);
		});
	}
};


TrackSvgLayout.prototype.setHeight = function(height){
	this.height=height;
	this.svg.setAttribute("height",height);
	this.grid.setAttribute("height",height);
	this.grid2.setAttribute("height",height);
	this.currentLine.setAttribute("height",parseInt(height));//25 es el margen donde esta el texto de la posicion
	this.mouseLine.setAttribute("height",parseInt(height));//25 es el margen donde esta el texto de la posicion
};
TrackSvgLayout.prototype.setWidth = function(width){
	this.width=width;
	var mid = this.width/2;
	this.svg.setAttribute("width",width);
	this.grid.setAttribute("x",parseInt(mid%10));
	this.grid2.setAttribute("width",width);
	this.positionText.setAttribute("x",mid-30);
	this.nucleotidText.setAttribute("x",mid+35);
	this.lastPositionText.setAttribute("x",width-70);
	this.viewNtsArrow.setAttribute("width",width-32);
	this.viewNtsArrowRight.setAttribute("points",width+",7 "+(width-16)+",0 "+(width-16)+",14");
	this.viewNtsText.setAttribute("x",mid-30);
	this.currentLine.setAttribute("x",mid);
	for ( var i = 0; i < this.trackSvgList.length; i++) {
		this.trackSvgList[i].setWidth(width);
	}		
	this.halfVirtualBase = (this.width*3/2) / this.pixelBase;
	this.viewNtsText.textContent = "Window size: "+Math.ceil((this.width)/this.pixelBase).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")+" nts";
	this.windowSize = this.viewNtsText.textContent;
	this._setTextPosition();
	this.onWindowSize.notify({windowSize:this.viewNtsText.textContent});
	this.onZoomChange.notify();
};

TrackSvgLayout.prototype.setZoom = function(zoom){
	this.zoom=Math.max(zoom-this.zoomOffset, -5);
//	console.log(this.zoom);
//	console.log(this._getPixelsbyBase(this.zoom));
	this.pixelBase = this._getPixelsbyBase(this.zoom);
	this.halfVirtualBase = (this.width*3/2) / this.pixelBase;
	this.currentLine.setAttribute("width", this.pixelBase);
	this.mouseLine.setAttribute("width", this.pixelBase);
	this.viewNtsText.textContent = "Window size: "+Math.ceil((this.width)/this.pixelBase).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")+" nts";
	this.windowSize = this.viewNtsText.textContent;
	this._setTextPosition();
	this.onWindowSize.notify({windowSize:this.viewNtsText.textContent});
	this.onZoomChange.notify();
};
TrackSvgLayout.prototype.setLocation = function(item){//item.chromosome, item.position, item.species
	if(item.chromosome!=null){
		this.chromosome = item.chromosome;
	}
	if(item.position!=null){
		this.position = parseInt(item.position);//check int, must be a number
		this._setTextPosition();
	}
	if(item.species!=null){
		//check species and modify CellBaseAdapter, clean cache
		for(i in this.trackSvgList){
			if(this.trackSvgList[i].trackData.adapter instanceof CellBaseAdapter){
				this.trackSvgList[i].trackData.adapter.species = item.species;
				this.trackSvgList[i].trackData.adapter.featureCache.clear();
			}
		}
	}
	this.onChromosomeChange.notify();
};



TrackSvgLayout.prototype.addTrack = function(trackData, args){
	var _this = this;
	var visibleRange = args.visibleRange;
	
	args["position"] = this.position;
	args["trackData"] = trackData;
	args["zoom"] = this.zoom;
	args["pixelBase"] = this.pixelBase;
	args["width"] = this.width;
	args["adapter"] = trackData.adapter;
	args["trackSvgLayout"] = this;
	
	//deprecated
	//var i = this.trackDataList.push(trackData);

	var trackSvg = new TrackSvg(this.svg,args);
	
	
	var i = this.trackSvgList.push(trackSvg);
	this.swapHash[trackSvg.id] = {index:i-1,visible:true};
	trackSvg.setY(this.height);
	trackSvg.draw();
	this.setHeight(this.height + trackSvg.getHeight());
	
	
	
	
	//XXX help methods
	var callStart, callEnd, virtualStart, vitualEnd;
	var setCallRegion = function (){
		//needed call variables
		callStart = parseInt(_this.position - _this.halfVirtualBase*2);
		callEnd = parseInt(_this.position + _this.halfVirtualBase*2);
		virtualStart = parseInt(_this.position - _this.halfVirtualBase*2);//for now
		vitualEnd = parseInt(_this.position + _this.halfVirtualBase*2);//for now
	};
	var checkHistogramZoom = function(){
		if(_this.zoom <= trackSvg.histogramZoom){
			trackSvg.histogram = true;
			trackSvg.interval = Math.max(512, 5/_this.pixelBase);//server interval limit 512
//			console.log(trackData.adapter.featureCache);
		}else{
			trackSvg.histogram = null;
		}
	};
	var checkTranscriptZoom = function(){ //for genes only
		if(trackSvg.transcriptZoom != null && _this.zoom >= trackSvg.transcriptZoom){
			trackSvg.transcript=true;
		}else{
			trackSvg.transcript=null;
		}
	};
	var cleanSvgFeatures = function(){
		console.time("empty");
//		$(trackSvg.features).empty();
//		trackSvg.features.textContent = "";
		while (trackSvg.features.firstChild) {
			trackSvg.features.removeChild(trackSvg.features.firstChild);
		}
		console.timeEnd("empty");
		//deprecated, bam still uses it
		trackData.adapter.featureCache.chunksDisplayed = {};

		trackSvg.chunksDisplayed = {};
		trackSvg.renderedArea = {};
	};
	//END help methods
	
	
	
	//EventListeners
	//Watch out!!!
	//this event must be attached before any "trackData.retrieveData()" call
	trackSvg.onGetDataIdx = trackData.adapter.onGetData.addEventListener(function(sender,response){
		if(response.params.histogram == true){
			trackSvg.featuresRender = trackSvg.HistogramRender;
		}else{
			trackSvg.featuresRender = trackSvg.defaultRender;
		}
		
		_this.setHeight(_this.height - trackSvg.getHeight());//modify height before redraw

		trackSvg.featuresRender(response);
		
		trackSvg.setLoading(false);
		
		console.log("rendered");
//		console.log(trackData.adapter.featureCache);
		_this.setHeight(_this.height + trackSvg.getHeight());//modify height after redraw 
		_this._redraw();
	});
	
	
	//first load, get virtual window and retrieve data
	checkHistogramZoom();
	checkTranscriptZoom();//for genes only
	setCallRegion();
	// check if track is visible in this zoom
	if(_this.zoom >= visibleRange.start-_this.zoomOffset && _this.zoom <= visibleRange.end){
		trackSvg.setLoading(true);
		trackData.retrieveData({chromosome:_this.chromosome,start:virtualStart,end:vitualEnd, histogram:trackSvg.histogram, interval:trackSvg.interval, transcript:trackSvg.transcript});
		trackSvg.invalidZoomText.setAttribute("visibility", "hidden");
	}else{
		trackSvg.invalidZoomText.setAttribute("visibility", "visible");
	}
	
	
	//on zoom change set new virtual window and update track values
	trackSvg.onZoomChangeIdx = this.onZoomChange.addEventListener(function(sender,data){
		trackSvg.zoom=_this.zoom;
		trackSvg.pixelBase=_this.pixelBase;
		
		checkHistogramZoom();
		checkTranscriptZoom();//for genes only
		cleanSvgFeatures();
		setCallRegion();
		
		// check if track is visible in this zoom
		if(_this.zoom >= visibleRange.start-_this.zoomOffset && _this.zoom <= visibleRange.end){
			trackSvg.setLoading(true);
			trackData.retrieveData({chromosome:_this.chromosome,start:virtualStart,end:vitualEnd, histogram:trackSvg.histogram, interval:trackSvg.interval, transcript:trackSvg.transcript});
			trackSvg.invalidZoomText.setAttribute("visibility", "hidden");
		}else{
			trackSvg.invalidZoomText.setAttribute("visibility", "visible");
		}
	});

	
	//on chromosome change set new virtual window and update track values
	trackSvg.onChromosomeChangeIdx = this.onChromosomeChange.addEventListener(function(sender,data){
		trackSvg.position=_this.position;
		
		cleanSvgFeatures();
		setCallRegion();
		
		// check if track is visible in this zoom
		if(_this.zoom >= visibleRange.start-_this.zoomOffset && _this.zoom <= visibleRange.end){
			trackSvg.setLoading(true);
			trackData.retrieveData({chromosome:_this.chromosome,start:virtualStart,end:vitualEnd, histogram:trackSvg.histogram, interval:trackSvg.interval, transcript:trackSvg.transcript});
		}
	});
	

	//movement listeners 
	trackSvg.onMoveIdx = this.onMove.addEventListener(function(sender,desp){
		trackSvg.position -= desp;
		var despBase = desp*_this.pixelBase;
		trackSvg.pixelPosition-=despBase;

		//parseFloat important 
		var move =  parseFloat(trackSvg.features.getAttribute("x")) + despBase;
		trackSvg.features.setAttribute("x",move);

		virtualStart = parseInt(trackSvg.position - _this.halfVirtualBase);
		virtualEnd = parseInt(trackSvg.position + _this.halfVirtualBase);
		// check if track is visible in this zoom
		if(_this.zoom >= visibleRange.start && _this.zoom <= visibleRange.end){
			
			if(desp>0 && virtualStart < callStart){
				trackData.retrieveData({chromosome:_this.chromosome,start:parseInt(callStart-_this.halfVirtualBase),end:callStart, histogram:trackSvg.histogram, interval:trackSvg.interval, transcript:trackSvg.transcript});
				callStart = parseInt(callStart-_this.halfVirtualBase);
			}

			if(desp<0 && virtualEnd > callEnd){
				trackData.retrieveData({chromosome:_this.chromosome,start:callEnd,end:parseInt(callEnd+_this.halfVirtualBase), histogram:trackSvg.histogram, interval:trackSvg.interval, transcript:trackSvg.transcript});
				callEnd = parseInt(callEnd+_this.halfVirtualBase);
			}

		}
	});
	
	
	
	
	
	//track buttons
	//XXX se puede mover?
	$(trackSvg.upRect).bind("click",function(event){
		_this._reallocateAbove(this.parentNode.parentNode.id);//"this" is the svg element
	});
	$(trackSvg.downRect).bind("click",function(event){
		_this._reallocateUnder(this.parentNode.parentNode.id);//"this" is the svg element
	});
	$(trackSvg.hideRect).bind("click",function(event){
//		_this._hideTrack(this.parentNode.parentNode.id);//"this" is the svg element
		_this.removeTrack(this.parentNode.parentNode.id);//"this" is the svg element
		_this.onSvgRemoveTrack.notify(this.parentNode.parentNode.id);
	});
	$(trackSvg.settingsRect).bind("click",function(event){
		console.log("settings click");//"this" is the svg element
	});
	

};

TrackSvgLayout.prototype.removeTrack = function(trackId){
	// first hide the track
	this._hideTrack(trackId);
	
	var position = this.swapHash[trackId].index;
	
	// delete listeners
	this.onZoomChange.removeEventListener(this.trackSvgList[position].onZoomChangeIdx);
	this.onChromosomeChange.removeEventListener(this.trackSvgList[position].onChromosomeChangeIdx);
	this.onMove.removeEventListener(this.trackSvgList[position].onMoveIdx);

	// delete data
	this.trackSvgList.splice(position, 1);

	//deprecated
	//this.trackDataList.splice(position, 1);
	
	delete this.swapHash[trackId];
	//uddate swapHash with correct index after slice
	for ( var i = 0; i < this.trackSvgList.length; i++) {
		this.swapHash[this.trackSvgList[i].id].index = i;
	}
	return trackId;
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
	if(i+1<this.trackSvgList.length){
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
	
	this.setHeight(this.height - track.getHeight());
	
	this._redraw();
	
	var _this= this;
//	setTimeout(function() {
//		_this._showTrack(trackMainId);
//	},2000);
};

TrackSvgLayout.prototype._showTrack = function(trackMainId){
	this.swapHash[trackMainId].visible=true;
	var i = this.swapHash[trackMainId].index;
	var track = this.trackSvgList[i];
	this.svg.appendChild(track.main);
	
	this.setHeight(this.height + track.getHeight());
	
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

TrackSvgLayout.prototype._setTextPosition = function(){
	this.positionText.textContent = this.position.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
	var x = Math.floor((this.width)/this.pixelBase/2);
	this.firstPositionText.textContent = (this.position-x).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
	this.lastPositionText.textContent = (this.position+x-1).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
};

TrackSvgLayout.prototype.getTrackSvgById = function(trackId){
	if(this.swapHash[trackId]!=null){
		var position = this.swapHash[trackId].index;
		return this.trackSvgList[position];
	}
	return null;
};

TrackSvgLayout.prototype.setMousePosition = function(position){
	//var base = this.getSequenceNucleotid(position);
	//var html = '<span style="font-family: Ubuntu Mono;font-size:19px;color:'+SEQUENCE_COLORS[base]+'">'+base+'</span>';
	//Ext.getCmp(this.genomeViewer.id+"mouseNucleotidLabel").setText(html);
};

TrackSvgLayout.prototype.getSequenceNucleotid = function(position){
	var seqTrack = this.getTrackSvgById("Sequence");
	if( seqTrack != null){
		var key  = this.chromosome+":"+seqTrack.trackData.adapter.featureCache._getChunk(position);
		var r = seqTrack.trackData.adapter.featureCache.getFeatureChunk(key);
		if(r != null){
			return r.data[0].sequence.charAt(position-r.data[0].start);
		}
	}
	return "";
}

TrackSvgLayout.prototype.setNucleotidPosition = function(position){
	//var base = this.getSequenceNucleotid(position);
	//this.nucleotidText.setAttribute("fill",SEQUENCE_COLORS[base]);
	//this.nucleotidText.textContent = base;
};
