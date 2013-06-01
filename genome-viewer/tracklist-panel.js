/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
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

function TrackListPanel(targetId, args) {//parent is a DOM div element
	var _this = this;

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args
	this.id = Utils.genId("TrackListPanel");

	this.trackSvgList = [];
	this.swapHash = {};
	this.zoomOffset = 0;//for region overview panel, that will keep zoom higher, 0 by default

	this.parentLayout;
	this.mousePosition;
	this.windowSize;

	this.zoomMultiplier = 1;

    this.height=0;

    //set instantiation args, must be last
    _.extend(this, args);

    //set new region object
    this.region = new Region(args.region);
    this.width -= 18;

//    if (typeof args != 'undefined') {
//        this.width = args.width || this.width;
//        this.height = args.height || this.height;
//        this.zoomOffset = args.zoomOffset || this.zoomOffset;
//        this.zoomMultiplier = args.zoomMultiplier || this.zoomMultiplier;
//        this.parentLayout = args.parentLayout || this.parentLayout;
//        this.genomeViewer = args.genomeViewer || this.genomeViewer;
//        if (args.region != null) {
//            this.region.load(args.region);
//        }
//    }



	//this region is used to do not modify original region, and will be used by trackSvg
    //Deprecated
	this.visualRegion = new Region();
	this.visualRegion.load(this.region);
	
	/********/
	this._calculateMinRegion();
	this._calculatePixelBase();
	/********/
	
	//SVG structure and events initialization
	this.onReady = new Event();
	this.onRegionChange = new Event();
	this.onRegionSelect = new Event();//only when parentLayout is not null
//	this.onMove = new Event();
	this.onWindowSize = new Event();
	this.onMousePosition = new Event();
	this.onSvgRemoveTrack = new Event();



    var targetDiv =  $('#'+targetId)[0];

    var tlHeaderDiv = $('<div id="tl-header"></div>')[0];

    var panelDiv = $('<div id="tl-panel"></div>')[0];
    $(panelDiv).css({position:'relative'});


    this.tlTracksDiv = $('<div id="tl-tracks"></div>')[0];
    $(this.tlTracksDiv).css({ position:'relative','z-index':3});


    $(targetDiv).append(tlHeaderDiv);
    $(targetDiv).append(panelDiv);

    $(panelDiv).append(this.tlTracksDiv);


	//Main SVG and his events
	this.svgTop = SVG.init(tlHeaderDiv,{
		"width":this.width,
        "height":25
	});
	

	//grid
	//var patt = SVG.addChild(this.svg,"pattern",{
		//"id":this.id+"gridPatt",
		//"patternUnits":"userSpaceOnUse",
		//"x":0,
		//"y":0,
		//"width":_this.pixelBase,
		//"height":2000
	//});

	var mid = this.width/2;
	//this.grid = SVG.addChild(patt,"rect",{
		//"x":parseInt(mid%10),
		//"y":0,
		//"width":1,
		//"height":2000,
		//"opacity":"0.15",
		//"fill":"grey"
	//});
	//
	//this.grid2 = SVG.addChild(this.svg,"rect",{
		//"width":0,
		//"height":2000,
		//"x":0,
		//"fill":"url(#"+this.id+"gridPatt)"
	//});
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
	this.viewNtsArrow = SVG.addChild(this.svgTop,"rect",{
		"x":2,
		"y":6,
		"width":this.width-4,
		"height":2,
		"opacity":"0.5",
		"fill":"black"
	});
	this.viewNtsArrowLeft = SVG.addChild(this.svgTop,"polyline",{
		"points":"0,1 2,1 2,13 0,13",
		"opacity":"0.5",
		"fill":"black"
	});
	this.viewNtsArrowRight = SVG.addChild(this.svgTop,"polyline",{
		"points":this.width+",1 "+(this.width-2)+",1 "+(this.width-2)+",13 "+this.width+",13",
		"opacity":"0.5",
		"fill":"black"
	});
	this.windowSize = "Window size: "+this.region.length()+" nts";
    this.viewNtsTextBack = SVG.addChild(this.svgTop,"rect",{
        "x":mid-40,
        "y":0,
        "width":this.windowSize.length*6,
        "height":13,
        "fill":"white"
    });
	this.viewNtsText = SVG.addChild(this.svgTop,"text",{
		"x":mid-30,
		"y":11,
		"font-size":10,
		"fill":"black"
	});
	this.viewNtsText.textContent = this.windowSize;
	this._setTextPosition();


    this.currentLine = $('<div id="'+this.id+'centerLine"></div>')[0];
    $(panelDiv).append(this.currentLine);
    $(this.currentLine).css({
        'z-index': 2,
        'position': 'absolute',
        'left': mid,
        'top':0,
        'width':this.pixelBase,
		'height':'100%',
        'opacity':0.5,
        'border':'1px solid orangered',
        'background-color':'orange'
    });


    this.mouseLine = $('<div id="'+this.id+'mouseLine"></div>')[0];
    $(panelDiv).append(this.mouseLine);
    $(this.mouseLine).css({
        'z-index': 1,
        'position': 'absolute',
        'left': -20,
        'top':0,
        'width':this.pixelBase,
        'height':'100%',
        'border':'1px solid lightgray',
        'opacity':0.7,
        'background-color':'gainsboro'
    });

	if(this.parentLayout==null){

        $(targetDiv).mousemove(function(event) {
            var centerPosition = _this.region.center();
            var mid = _this.width/2;
            var mouseLineOffset = _this.pixelBase/2;
            var offsetX = (event.clientX - $(_this.tlTracksDiv).offset().left);
            var cX = offsetX-mouseLineOffset;
            var rcX = (cX/_this.pixelBase) | 0;
            var pos = (rcX*_this.pixelBase) + mid%_this.pixelBase;
            $(_this.mouseLine).css({'left':pos});
//
            var posOffset = (mid/_this.pixelBase) | 0;
            _this.mousePosition = centerPosition+rcX-posOffset;
            _this.onMousePosition.notify({mousePos:_this.mousePosition,baseHtml:_this.getMousePosition(_this.mousePosition)});
        });

		$(this.tlTracksDiv).mousedown(function(event) {
//            $('.qtip').qtip('hide').qtip('disable'); // Hide AND disable all tooltips
            $(this).css({"cursor": "move"});
            $(_this.mouseLine).css({'visibility':'hidden'});
			var downX = event.clientX;
			var lastX = 0;
			$(this).mousemove(function(event){
				var newX = (downX - event.clientX)/_this.pixelBase | 0;//truncate always towards zero
				if(newX!=lastX){
					var disp = lastX-newX;
					var centerPosition = _this.region.center();
					var p = centerPosition - disp;
					if(p>0){//avoid 0 and negative positions
						_this.region.start -= disp;
						_this.region.end -= disp;
						_this._setTextPosition();
//						_this.onMove.notify(disp);
                        _this.trigger('region:move', {region:_this.region, disp:disp, sender: _this});
						lastX = newX;
						_this.setNucleotidPosition(p);
					}
				}
			});
		});

		$(this.tlTracksDiv).mouseup(function(event) {
//            $('.qtip').qtip('enable'); // To enable them again ;)
            $(this).css({"cursor": "default"});
            $(_this.mouseLine).css({'visibility':'visible'});
			$(this).off('mousemove');
		});

		$(this.tlTracksDiv).mouseleave(function(event) {
            $(this).css({"cursor": "default"});
            $(_this.mouseLine).css({'visibility':'hidden'});
			$(this).off('mousemove');
			$("body").off('keydown');
		});

		$(this.tlTracksDiv).mouseenter(function(e) {
//            $('.qtip').qtip('enable'); // To enable them again ;)
            $(_this.mouseLine).css({'visibility':'visible'});
			$("body").off('keydown');
			enableKeys();
		});
		
		var enableKeys = function(){
			//keys
			$("body").keydown(function(e) {
				var disp = 0;
				switch (e.keyCode){
					case 37://left arrow
						if(e.ctrlKey){
                            disp = Math.round(100/_this.pixelBase);
						}else{
                            disp = Math.round(10/_this.pixelBase);
						}
					break;
					case 39://right arrow
						if(e.ctrlKey){
                            disp = Math.round(-100/_this.pixelBase)
						}else{
                            disp = Math.round(-10/_this.pixelBase);
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
				if(disp != 0){
					_this.region.start -= disp;
					_this.region.end -= disp;
					_this._setTextPosition();
//					_this.onMove.notify(disp);
                    _this.trigger('region:move', {region:_this.region, disp:disp, sender: _this});
				}
			});
		};
	}else{
		_this.parentLayout.on('region:move',function(event){
            _this.region.load(event.region);
			_this._setTextPosition();
//			_this.onMove.notify(disp);
            _this.trigger('region:move', {region:_this.region, disp:event.disp, sender: _this});
		});

		//allow selection in trackSvgLayoutOverview
		var selBox = SVG.addChild(this.svg,"rect",{
				"x":0,
				"y":0,
				"stroke-width":"2",
				"stroke":"deepskyblue",
				"opacity":"0.5",
				"fill":"honeydew"
		});
		var downX, moveX;
		$(this.svg).mousedown(function(event) {
			downX = (event.pageX - $(_this.svg).offset().left);
			selBox.setAttribute("x",downX);
			$(this).mousemove(function(event){
				moveX = (event.pageX - $(_this.svg).offset().left);
				if(moveX < downX){
					selBox.setAttribute("x",moveX);
				}
				selBox.setAttribute("width",Math.abs(moveX - downX));
				selBox.setAttribute("height",_this.height);
			});
		});
		$(this.svg).mouseup(function(event) {
			selBox.setAttribute("width",0);
			selBox.setAttribute("height",0);
			$(this).off('mousemove');

			if(downX != null && moveX != null){
				var ss = downX/_this.pixelBase;
				var ee =moveX/_this.pixelBase;
				ss += _this.visualRegion.start;
				ee += _this.visualRegion.start;
				_this.region.start = parseInt(Math.min(ss,ee));
				_this.region.end =  parseInt(Math.max(ss,ee));
				_this.onRegionSelect.notify();
			}
		});
		$(this.svg).mouseleave(function(event) {
			//cancel action
			selBox.setAttribute("width",0);
			selBox.setAttribute("height",0);
			$(this).off('mousemove');
			downX = null;
			moveX = null;
		});
	}
};

TrackListPanel.prototype = {
    setHeight : function(height){
//        this.height=Math.max(height,60);
//        $(this.tlTracksDiv).css('height',height);
//        //this.grid.setAttribute("height",height);
//        //this.grid2.setAttribute("height",height);
//        $(this.currentLine).css("height",parseInt(height));//25 es el margen donde esta el texto de la posicion
//        $(this.mouseLine).css("height",parseInt(height));//25 es el margen donde esta el texto de la posicion
    },

    setWidth : function(width){
        this.width=width-18;
        var mid = this.width/2;
        this._calculateMinRegion();
        this._calculatePixelBase();

        $(this.currentLine).css({'left':mid,'width':this.pixelBase});

        this.svgTop.setAttribute('width',this.width);
        this.positionText.setAttribute("x",mid-30);
        this.nucleotidText.setAttribute("x",mid+35);
        this.lastPositionText.setAttribute("x",this.width-70);
        this.viewNtsArrow.setAttribute("width",this.width-4);
        this.viewNtsArrowRight.setAttribute("points",this.width+",1 "+(this.width-2)+",1 "+(this.width-2)+",13 "+this.width+",13");
        this.viewNtsText.setAttribute("x",mid-30);
        this.viewNtsTextBack.setAttribute("x",mid-40);
        this.trigger('trackWidth:change',{width:this.width,sender:this})

        this._setTextPosition();
        /*

        this.svg.setAttribute("width",width);
        //this.grid.setAttribute("x",parseInt(mid%10));
        //this.grid2.setAttribute("width",width);
        this.onWindowSize.notify({windowSize:this.viewNtsText.textContent});
        this.onRegionChange.notify();
        */




//        for ( var i = 0; i < this.trackSvgList.length; i++) {
//            this.trackSvgList[i].setWidth(width);
//        }
    },

    setZoom : function(zoom){
        throw("DEPRECATED: TrackSvgLayout.prototype.setZoom");
    },

    setRegion : function(region){//item.chromosome, item.position, item.species
        this.region.load(region);
        var _this = this;
        this._calculateMinRegion();
        this._calculatePixelBase();
        //get pixelbase by Region


        this.currentLine.setAttribute("width", this.pixelBase);
        this.mouseLine.setAttribute("width", this.pixelBase);
        this.viewNtsText.textContent = "Window size: "+this.region.length()+" nts";
        this.windowSize = this.viewNtsText.textContent;
        this._setTextPosition();
        this.onWindowSize.notify({windowSize:this.viewNtsText.textContent});

        if(region.species!=null){
            //check species and modify CellBaseAdapter, clean cache
            for(i in this.trackSvgList){
                if(this.trackSvgList[i].trackData.adapter instanceof CellBaseAdapter ||
                    this.trackSvgList[i].trackData.adapter instanceof SequenceAdapter
                    ){
                    this.trackSvgList[i].trackData.adapter.species = region.species;
                    //this.trackSvgList[i].trackData.adapter.featureCache.clear();

                    this.trackSvgList[i].trackData.adapter.clearData();
                }
            }
        }
        this.trigger('trackRegion:change',{region:this.region,sender:this})

        this.nucleotidText.textContent = "";//remove base char, will be drawn later if needed


        /************ Loading ************/
        var checkAllTrackStatus = function(status){
            for(i in _this.trackSvgList){
                if(_this.trackSvgList[i].status != status) return false;
            }
            return true;
        };
        var checkStatus = function(){
            if(checkAllTrackStatus('ready')){
                if(_this.parentLayout==null){
                    _this.onReady.notify();
                }
            }else{
                setTimeout(checkStatus,100);
            }
        };
        setTimeout(checkStatus, 10);
        /***************************/
        this.onRegionChange.notify();

        //this.minRegionRect.setAttribute("width",this.minRectWidth);
        //this.minRegionRect.setAttribute("x",(this.width/2)-(this.minRectWidth/2)+6);
    },

    addTrack : function(track){//args antiguo
        var _this = this;
        var i = this.trackSvgList.push(track);
        this.swapHash[track.id] = {index:i-1,visible:true};

        track.set('pixelBase', this.pixelBase);
        track.set('zoom', this.zoom);
        track.set('region', this.region);
        track.set('width', this.width);

        track.initialize(this.tlTracksDiv);

        track.draw();


        this.on('trackRegion:change',function(event){
            track.set('pixelBase', _this.pixelBase);
            track.set('zoom', _this.zoom);
            track.set('region', event.region);
//            trackSvg.position = trackSvg.region.center();
//            setCallRegion();
            track.draw();
        });

        this.on('region:move',function(event){
            track.set('region', event.region);
            track.set('pixelBase', _this.pixelBase);
            track.set('zoom', _this.zoom);
//            trackSvg.position = trackSvg.region.center();
//            setCallRegion();
            track.move(event.disp);
        });

        this.on('trackWidth:change',function(event){
            track.set('pixelBase', _this.pixelBase);
            track.set('zoom', _this.zoom);
            track.set('region', _this.region);
//            trackSvg.position = trackSvg.region.center();
//            setCallRegion();
            track.setWidth(event.width);
            track.draw();
        });

//old
/*

        var visibleRange = args.visibleRange;



        args["region"] = this.region;
        args["trackData"] = trackData;
        args["zoom"] = this.zoom;
        args["pixelBase"] = this.pixelBase;
        args["width"] = this.width;
        args["visibleRange"] = args.visibleRange;
        args["adapter"] = trackData.adapter;
        args["trackSvgLayout"] = this;

        //deprecated
        //var i = this.trackDataList.push(trackData);
        var trackSvg = new TrackSvg(this.tlTracksDiv, args);

        var i = this.trackSvgList.push(trackSvg);
        this.swapHash[trackSvg.id] = {index:i-1,visible:true};
        trackSvg.setY(this.height);
        trackSvg.draw();

        this.setHeight(this.height + trackSvg.getHeight());

        //XXX help methods
        var callStart, callEnd, virtualStart, vitualEnd;
        var setCallRegion = function (){
            //needed call variables
            callStart = parseInt(_this.region.start - _this.halfVirtualBase*2);
            callEnd = parseInt(_this.region.end + _this.halfVirtualBase*2);
            virtualStart = parseInt(_this.region.start - _this.halfVirtualBase*2);//for now
            vitualEnd = parseInt(_this.region.end + _this.halfVirtualBase*2);//for now

            trackSvg.pixelBase = _this.pixelBase;
        };
        var checkHistogramZoom = function(){
            if(_this.zoom <= trackSvg.histogramZoom){
                trackSvg.histogram = true;
                trackSvg.histogramLogarithm = true;
                trackSvg.histogramMax = 500;
//                trackSvg.interval = parseInt(Math.min(512, 5/_this.pixelBase));
                trackSvg.interval = parseInt(5/_this.pixelBase);//server interval limit 512
//			console.log(trackData.adapter.featureCache);
            }else{
                trackSvg.histogram = null;
                trackSvg.histogramLogarithm = null;
                trackSvg.histogramMax = null;
            }
        };
        var checkTranscriptZoom = function(){ //for genes only
            if(trackSvg.transcriptZoom != null && _this.zoom >= trackSvg.transcriptZoom){
                trackSvg.transcript=true;
            }else{
                trackSvg.transcript=null;
            }
        };
        //var cleanSvgFeatures = function(){
        //console.time("empty");
        //$(trackSvg.features).empty();
        //trackSvg.features.textContent = "";
        //while (trackSvg.features.firstChild) {
        //trackSvg.features.removeChild(trackSvg.features.firstChild);
        //}
        //console.timeEnd("empty");
        //
        //deprecated, diplayed object is now in trackSvg class
        //trackData.adapter.featureCache.chunksDisplayed = {};
        //
        //trackSvg.chunksDisplayed = {};
        //trackSvg.renderedArea = {};
        //};
        var retrieveData = function(sender){
            // check if track is visible in this zoom
            if(_this.zoom >= visibleRange.start-_this.zoomOffset && _this.zoom <= visibleRange.end ){
                // Just before retrieve data the track is set to loading
                trackSvg.setLoading(true);
                trackData.retrieveData({
                    chromosome:_this.region.chromosome,
                    start:virtualStart,
                    end:vitualEnd,
                    histogram:trackSvg.histogram,
                    histogramLogarithm:trackSvg.histogramLogarithm,
                    histogramMax:trackSvg.histogramMax,
                    interval:trackSvg.interval,
                    transcript:trackSvg.transcript,
                    sender:sender
                });
                trackSvg.invalidZoomText.setAttribute("visibility", "hidden");
            }else{
                trackSvg.invalidZoomText.setAttribute("visibility", "visible");
            }
        };
        //END help methods



        //EventListeners
        //Watch out!!!
        //this event must be attached before call "trackData.retrieveData()"

        trackSvg.getData = function(sender,response){
            if(response.params.histogram == true){
                trackSvg.featuresRender = trackSvg.HistogramRender;
            }else{
                trackSvg.featuresRender = trackSvg.defaultRender;
            }

            _this.setHeight(_this.height - trackSvg.getHeight());//modify height before redraw

            trackSvg.featuresRender(response);
            trackSvg.setLoading(false);

            _this.setHeight(_this.height + trackSvg.getHeight());//modify height after redraw
            _this._redraw();
        };

        trackSvg.onGetDataIdx = trackData.adapter.onGetData.addEventListener(trackSvg.getData);


        //first load, get virtual window and retrieve data
        checkHistogramZoom();
        checkTranscriptZoom();//for genes only
        setCallRegion();
        retrieveData("firstLoad");


        //on region change set new virtual window and update track values
        trackSvg.regionChange = function(sender,data){
            trackSvg.pixelBase = _this.pixelBase;
            trackSvg.zoom = _this.zoom;
            trackSvg.position = trackSvg.region.center();

            checkHistogramZoom();
            checkTranscriptZoom();//for genes only

            trackSvg.cleanSvg();
            setCallRegion();
            retrieveData("onRegionChange");
        };
        trackSvg.onRegionChangeIdx = this.onRegionChange.addEventListener(trackSvg.regionChange);


        trackSvg.move = function(event){
            var desp = event.desp;
            trackSvg.position = _this.region.center();
            var despBase = desp*_this.pixelBase;
            trackSvg.pixelPosition-=despBase;

            //parseFloat important
            var move =  parseFloat(trackSvg.features.getAttribute("x")) + despBase;
            trackSvg.features.setAttribute("x",move);

            virtualStart = parseInt(trackSvg.region.start - _this.halfVirtualBase);
            virtualEnd = parseInt(trackSvg.region.end + _this.halfVirtualBase);
            // check if track is visible in this zoom
            if(_this.zoom >= visibleRange.start && _this.zoom <= visibleRange.end){

                if(desp>0 && virtualStart < callStart){
                    trackData.retrieveData({
                        chromosome:_this.region.chromosome,
                        start:parseInt(callStart-_this.halfVirtualBase),
                        end:callStart,
                        histogram:trackSvg.histogram,
                        interval:trackSvg.interval,
                        transcript:trackSvg.transcript,
                        sender:"onMove"
                    });
                    callStart = parseInt(callStart-_this.halfVirtualBase);
                }

                if(desp<0 && virtualEnd > callEnd){
                    trackData.retrieveData({
                        chromosome:_this.region.chromosome,
                        start:callEnd,
                        end:parseInt(callEnd+_this.halfVirtualBase),
                        histogram:trackSvg.histogram,
                        interval:trackSvg.interval,
                        transcript:trackSvg.transcript,
                        sender:"onMove"
                    });
                    callEnd = parseInt(callEnd+_this.halfVirtualBase);
                }

            }
        };
        //movement listeners
        this.on('region:move',trackSvg.move);


        //track buttons
        //XXX se puede mover?
        //$(trackSvg.upRect).bind("click",function(event){
        //_this._reallocateAbove(this.parentNode.parentNode.id);//"this" is the svg element
        //});
        //$(trackSvg.downRect).bind("click",function(event){
        //_this._reallocateUnder(this.parentNode.parentNode.id);//"this" is the svg element
        //});
        //$(trackSvg.hideRect).bind("click",function(event){
        ////_this._hideTrack(this.parentNode.parentNode.id);//"this" is the svg element
        //_this.removeTrack(this.parentNode.parentNode.id);//"this" is the svg element
        //_this.onSvgRemoveTrack.notify(this.parentNode.parentNode.id);
        //});
        //$(trackSvg.settingsRect).bind("click",function(event){
        //console.log("settings click");//"this" is the svg element
        //});


        */
    },

    removeTrack : function(trackId){
        // first hide the track
        this._hideTrack(trackId);

        var i = this.swapHash[trackId].index;

        // delete listeners
        this.onRegionChange.removeEventListener(this.trackSvgList[i].onRegionChangeIdx);
        this.off('region:move',this.trackSvgList[i].move);
//        this.onMove.removeEventListener(this.trackSvgList[i].onMoveIdx);

        // delete data
        var track = this.trackSvgList.splice(i, 1)[0];

        delete this.swapHash[trackId];
        //uddate swapHash with correct index after splice
        for ( var i = 0; i < this.trackSvgList.length; i++) {
            this.swapHash[this.trackSvgList[i].id].index = i;
        }
        return track;
    },

    restoreTrack : function(trackSvg, index){
        var _this = this;

        trackSvg.region = this.region;
        trackSvg.zoom = this.zoom;
        trackSvg.pixelBase = this.pixelBase;
        trackSvg.width = this.width;

        var i = this.trackSvgList.push(trackSvg);
        this.swapHash[trackSvg.id] = {index:i-1,visible:true};
        trackSvg.setY(this.height);
        trackSvg.draw();
        this.setHeight(this.height + trackSvg.getHeight());

        trackSvg.onRegionChangeIdx = this.onRegionChange.addEventListener(trackSvg.regionChange);
        trackSvg.onMoveIdx = this.onMove.addEventListener(trackSvg.move);

        trackSvg.regionChange();

        if(index!=null){
            this.setTrackIndex(trackSvg.id, index);
        }
    },

    _redraw : function(){
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
    },

    //This routine is called when track order is modified
    _reallocateAbove : function(trackId){
        var i = this.swapHash[trackId].index;
        console.log(i+" wants to move up");
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
            console.log("is at top");
        }
    },

    //This routine is called when track order is modified
    _reallocateUnder : function(trackId){
        var i = this.swapHash[trackId].index;
        console.log(i+" wants to move down");
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
            console.log("is at bottom");
        }
    },

    setTrackIndex : function(trackId, newIndex){
        var oldIndex = this.swapHash[trackId].index;

        //remove track from old index
        var track = this.trackSvgList.splice(oldIndex,1)[0]

        //add track at new Index
        this.trackSvgList.splice(newIndex,0,track);

        //uddate swapHash with correct index after slice
        for ( var i = 0; i < this.trackSvgList.length; i++) {
            this.swapHash[this.trackSvgList[i].id].index = i;
        }
        //update svg coordinates
        this._redraw();
    },

    scrollToTrack : function(trackId){
        var swapTrack = this.swapHash[trackId];
        if(swapTrack != null){
            var i = swapTrack.index;
            var track = this.trackSvgList[i];
            $(this.svg).parent().parent().scrollTop(track.main.getAttribute("y"));
        }
    },


    _hideTrack : function(trackMainId){
        this.swapHash[trackMainId].visible=false;
        var i = this.swapHash[trackMainId].index;
        var track = this.trackSvgList[i];
        this.svg.removeChild(track.main);

        this.setHeight(this.height - track.getHeight());

        this._redraw();
    },

    _showTrack : function(trackMainId){
        this.swapHash[trackMainId].visible=true;
        var i = this.swapHash[trackMainId].index;
        var track = this.trackSvgList[i];
        this.svg.appendChild(track.main);

        this.setHeight(this.height + track.getHeight());

        this._redraw();
    },

    _calculateMinRegion : function() {
        var regionLength = this.region.length();
        var minimumBaseLength = parseInt(this.width/Utils.getPixelBaseByZoom(100));//for zoom 100
        //this.minRectWidth = regionLength*Utils.getPixelBaseByZoom(100);
        if(regionLength < minimumBaseLength){
            //the zoom will be 100, region must be recalculated
            var centerPosition = this.region.center();
            var aux = Math.ceil((minimumBaseLength/2)-1);
            this.region.start = Math.floor(centerPosition-aux);
            this.region.end = Math.floor(centerPosition+aux);
        }
    },

    _calculatePixelBase : function(){
        this.pixelBase = this.width/this.region.length();
        this.pixelBase = this.pixelBase / this.zoomMultiplier;
        // At maximum zoom a bp is 10px, for each zoom level (5% of zoom)
        // pixels are divided by two.
//        return Math.max(this.pixelBase, (10/Math.pow(2,20)));
        this.pixelBase = Math.max(this.pixelBase, (10/Math.pow(2,20)));

        this.halfVirtualBase = (this.width*3/2) / this.pixelBase;
        this.zoom = Math.round(Utils.getZoomByPixelBase(this.pixelBase));
    },

    _setTextPosition : function() {
        var centerPosition = this.region.center();
        var baseLength = parseInt(this.width/this.pixelBase);//for zoom 100
        var aux = Math.ceil((baseLength/2)-1);
        this.visualRegion.start = Math.floor(centerPosition-aux);
        this.visualRegion.end = Math.floor(centerPosition+aux);

        this.positionText.textContent = Utils.formatNumber(centerPosition);
        this.firstPositionText.textContent = Utils.formatNumber(this.visualRegion.start);
        this.lastPositionText.textContent = Utils.formatNumber(this.visualRegion.end);

        this.viewNtsText.textContent = "Window size: "+this.visualRegion.length()+" nts";
        this.viewNtsTextBack.setAttribute("width", this.viewNtsText.textContent.length*6);
        this.windowSize = this.viewNtsText.textContent;
    },

    getTrackSvgById : function(trackId){
        if(this.swapHash[trackId]!=null){
            var position = this.swapHash[trackId].index;
            return this.trackSvgList[position];
        }
        return null;
    },

    getMousePosition : function(position){
        var base = '';
        var colorStyle = '';
        if(position>0){
            base = this.getSequenceNucleotid(position);
            colorStyle = 'color:'+SEQUENCE_COLORS[base];
        }
//        this.mouseLine.setAttribute('stroke',SEQUENCE_COLORS[base]);
//        this.mouseLine.setAttribute('fill',SEQUENCE_COLORS[base]);
        return '<span style="font-family: Ubuntu Mono;font-size:19px;'+colorStyle+'">'+base+'</span>';
    },

    getSequenceNucleotid : function(position){
        var seqTrack = this.getTrackSvgById(1);
        if( seqTrack != null && this.zoom >= seqTrack.visibleRange.start-this.zoomOffset && this.zoom <= seqTrack.visibleRange.end){
            return seqTrack.trackData.adapter.getNucleotidByPosition({start:position,end:position,chromosome:this.region.chromosome})
        }
        return '';
    },

    setNucleotidPosition : function(position){
        var base = this.getSequenceNucleotid(position);
        this.nucleotidText.setAttribute("fill",SEQUENCE_COLORS[base]);
        this.nucleotidText.textContent = base;
    }
};