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

    this.fontFamily = 'Source Sans Pro';

    this.height = 0;

    //set instantiation args, must be last
    _.extend(this, args);

    //set new region object
    this.region = new Region(this.region);
    this.width -= 18;

//        this.zoomMultiplier;
//        this.parentLayout;


    //this region is used to do not modify original region, and will be used by trackSvg
    this.visualRegion = new Region(this.region);

    /********/
    this._setPixelBaseAndZoom();
    /********/

        //Deprecated - SVG structure and events initialization
    this.onReady = new Event();
    this.onWindowSize = new Event();
    this.onMousePosition = new Event();
    this.onSvgRemoveTrack = new Event();


    this.targetDiv = $('#' + targetId)[0];

    if ('title' in this && this.title !== '') {
        var titleDiv = $('<div id="tl-title" class="title x-unselectable">' + this.title + '</div>')[0];
        $(this.targetDiv).append(titleDiv);
    }


    var tlHeaderDiv = $('<div id="tl-header"></div>')[0];

    var panelDiv = $('<div id="tl-panel"></div>')[0];
    $(panelDiv).css({position: 'relative'});


    this.tlTracksDiv = $('<div id="tl-tracks"></div>')[0];
    $(this.tlTracksDiv).css({ position: 'relative', 'z-index': 3});


    $(this.targetDiv).append(tlHeaderDiv);
    $(this.targetDiv).append(panelDiv);

    $(panelDiv).append(this.tlTracksDiv);


    //Main SVG and his events
    this.svgTop = SVG.init(tlHeaderDiv, {
        "width": this.width,
        "height": 25
    });

    var mid = this.width / 2;

    this.positionText = SVG.addChild(this.svgTop, "text", {
        "x": mid - 30,
        "y": 24,
        "font-size": 12,
        'font-family':_this.fontFamily,
        "fill": "green"
    });
    this.nucleotidText = SVG.addChild(this.svgTop, "text", {
        "x": mid + 35,
        "y": 24,
//        "font-family": "Ubuntu Mono",
        'font-family':_this.fontFamily,
        "font-size": 13
    });
    this.firstPositionText = SVG.addChild(this.svgTop, "text", {
        "x": 0,
        "y": 24,
        "font-size": 12,
        'font-family':_this.fontFamily,
        "fill": "green"
    });
    this.lastPositionText = SVG.addChild(this.svgTop, "text", {
        "x": this.width - 70,
        "y": 24,
        "font-size": 12,
        'font-family':_this.fontFamily,
        "fill": "green"
    });
    this.viewNtsArrow = SVG.addChild(this.svgTop, "rect", {
        "x": 2,
        "y": 6,
        "width": this.width - 4,
        "height": 2,
        "opacity": "0.5",
        "fill": "black"
    });
    this.viewNtsArrowLeft = SVG.addChild(this.svgTop, "polyline", {
        "points": "0,1 2,1 2,13 0,13",
        "opacity": "0.5",
        "fill": "black"
    });
    this.viewNtsArrowRight = SVG.addChild(this.svgTop, "polyline", {
        "points": this.width + ",1 " + (this.width - 2) + ",1 " + (this.width - 2) + ",13 " + this.width + ",13",
        "opacity": "0.5",
        "fill": "black"
    });
    this.windowSize = "Window size: " + this.region.length() + " nts";
    this.viewNtsTextBack = SVG.addChild(this.svgTop, "rect", {
        "x": mid - 40,
        "y": 0,
        "width": this.windowSize.length * 6,
        "height": 13,
        "fill": "white"
    });
    this.viewNtsText = SVG.addChild(this.svgTop, "text", {
        "x": mid - 30,
        "y": 11,
        "font-size": 12,
        'font-family':_this.fontFamily,
        "fill": "black"
    });
    this.viewNtsText.textContent = this.windowSize;
    this._setTextPosition();


    this.centerLine = $('<div id="' + this.id + 'centerLine"></div>')[0];
    $(panelDiv).append(this.centerLine);
    $(this.centerLine).css({
        'z-index': 2,
        'position': 'absolute',
        'left': mid,
        'top': 0,
        'width': this.pixelBase,
        'height': '100%',
        'opacity': 0.5,
        'border': '1px solid orangered',
        'background-color': 'orange'
    });


    this.mouseLine = $('<div id="' + this.id + 'mouseLine"></div>')[0];
    $(panelDiv).append(this.mouseLine);
    $(this.mouseLine).css({
        'z-index': 1,
        'position': 'absolute',
        'left': -20,
        'top': 0,
        'width': this.pixelBase,
        'height': '100%',
        'border': '1px solid lightgray',
        'opacity': 0.7,
        'visibility': 'hidden',
        'background-color': 'gainsboro'
    });

    //allow selection in trackSvgLayoutOverview


    var selBox = $('<div id="' + this.id + 'selBox"></div>')[0];
    $(panelDiv).append(selBox);
    $(selBox).css({
        'z-index': 0,
        'position': 'absolute',
        'left': 0,
        'top': 0,
        'height': '100%',
        'border': '2px solid deepskyblue',
        'opacity': 0.5,
        'visibility': 'hidden',
        'background-color': 'honeydew'
    });

//	if(this.parentLayout==null){

    $(this.targetDiv).mousemove(function (event) {
        var centerPosition = _this.region.center();
        var mid = _this.width / 2;
        var mouseLineOffset = _this.pixelBase / 2;
        var offsetX = (event.clientX - $(_this.tlTracksDiv).offset().left);
        var cX = offsetX - mouseLineOffset;
        var rcX = (cX / _this.pixelBase) | 0;
        var pos = (rcX * _this.pixelBase) + mid % _this.pixelBase;
        $(_this.mouseLine).css({'left': pos});
//
        var posOffset = (mid / _this.pixelBase) | 0;
        _this.mousePosition = centerPosition + rcX - posOffset;
        _this.onMousePosition.notify({mousePos: _this.mousePosition, baseHtml: _this.getMousePosition(_this.mousePosition)});
    });


    var downX, moveX;
    $(this.tlTracksDiv).mousedown(function (event) {
        $('html').addClass('x-unselectable');
//                            $('.qtip').qtip('hide').qtip('disable'); // Hide AND disable all tooltips
        $(_this.mouseLine).css({'visibility': 'hidden'});
        switch (event.which) {
            case 1: //Left mouse button pressed
                $(this).css({"cursor": "move"});
                downX = event.clientX;
                var lastX = 0;
                $(this).mousemove(function (event) {
                    var newX = (downX - event.clientX) / _this.pixelBase | 0;//truncate always towards zero
                    if (newX != lastX) {
                        var disp = lastX - newX;
                        var centerPosition = _this.region.center();
                        var p = centerPosition - disp;
                        if (p > 0) {//avoid 0 and negative positions
                            _this.region.start -= disp;
                            _this.region.end -= disp;
                            _this._setTextPosition();
                            //						_this.onMove.notify(disp);
                            _this.trigger('region:move', {region: _this.region, disp: disp, sender: _this});
                            _this.trigger('trackRegion:move', {region: _this.region, disp: disp, sender: _this});
                            lastX = newX;
                            _this.setNucleotidPosition(p);
                        }
                    }
                });

                break;
            case 2: //Middle mouse button pressed
                $(selBox).css({'visibility': 'visible'});
                $(selBox).css({'width': 0});
                downX = (event.pageX - $(_this.tlTracksDiv).offset().left);
                $(selBox).css({"left": downX});
                $(this).mousemove(function (event) {
                    moveX = (event.pageX - $(_this.tlTracksDiv).offset().left);
                    if (moveX < downX) {
                        $(selBox).css({"left": moveX});
                    }
                    $(selBox).css({"width": Math.abs(moveX - downX)});
                });


                break;
            case 3: //Right mouse button pressed
                break;
            default: // other button?
        }


    });

    $(this.tlTracksDiv).mouseup(function (event) {
        $('html').removeClass("x-unselectable");
        $(this).css({"cursor": "default"});
        $(_this.mouseLine).css({'visibility': 'visible'});
        $(this).off('mousemove');
        switch (event.which) {
            case 1: //Left mouse button pressed

                break;
            case 2: //Middle mouse button pressed
                $(selBox).css({'visibility': 'hidden'});
                $(this).off('mousemove');
                if (downX != null && moveX != null) {
                    var ss = downX / _this.pixelBase;
                    var ee = moveX / _this.pixelBase;
                    ss += _this.visualRegion.start;
                    ee += _this.visualRegion.start;
                    _this.region.start = parseInt(Math.min(ss, ee));
                    _this.region.end = parseInt(Math.max(ss, ee));
                    _this.trigger('region:change', {region: _this.region, sender: _this});
                    _this.onRegionSelect.notify();
                    moveX = null;
                } else if(downX != null && moveX == null){
                    var mouseRegion = new Region({chromosome:_this.region.chromosome,start:_this.mousePosition, end:_this.mousePosition})
                    _this.trigger('region:change', {region: mouseRegion, sender: _this});
                }
                break;
            case 3: //Right mouse button pressed
                break;
            default: // other button?
        }

    });

    $(this.tlTracksDiv).mouseleave(function (event) {
        $(this).css({"cursor": "default"});
        $(_this.mouseLine).css({'visibility': 'hidden'});
        $(this).off('mousemove');
        $("body").off('keydown');

        $(selBox).css({'visibility': 'hidden'});
        downX = null;
        moveX = null;
    });

    $(this.tlTracksDiv).mouseenter(function (e) {
//            $('.qtip').qtip('enable'); // To enable them again ;)
        $(_this.mouseLine).css({'visibility': 'visible'});
        $("body").off('keydown');
        enableKeys();
    });

    var enableKeys = function () {
        //keys
        $("body").keydown(function (e) {
            var disp = 0;
            switch (e.keyCode) {
                case 37://left arrow
                    if (e.ctrlKey) {
                        disp = Math.round(100 / _this.pixelBase);
                    } else {
                        disp = Math.round(10 / _this.pixelBase);
                    }
                    break;
                case 39://right arrow
                    if (e.ctrlKey) {
                        disp = Math.round(-100 / _this.pixelBase)
                    } else {
                        disp = Math.round(-10 / _this.pixelBase);
                    }
                    break;
                case 109://minus key
                    if (e.shiftKey) {
                        console.log("zoom out");
                    }
                    break;
                case 107://plus key
                    if (e.shiftKey) {
                        console.log("zoom in");
                    }
                    break;
            }
            if (disp != 0) {
                _this.region.start -= disp;
                _this.region.end -= disp;
                _this._setTextPosition();
//					_this.onMove.notify(disp);
                _this.trigger('region:move', {region: _this.region, disp: disp, sender: _this});
                _this.trigger('trackRegion:move', {region: _this.region, disp: disp, sender: _this});
            }
        });
    };
};

TrackListPanel.prototype = {
    show: function () {
        $(this.targetDiv).css({display: 'block'});
    },

    hide: function () {
        $(this.targetDiv).css({display: 'none'});
    },
    setTitle: function (title) {
        if('titleDiv' in this){
            $(this.titleDiv).html(title);
        }
    },

    setHeight: function (height) {
//        this.height=Math.max(height,60);
//        $(this.tlTracksDiv).css('height',height);
//        //this.grid.setAttribute("height",height);
//        //this.grid2.setAttribute("height",height);
//        $(this.centerLine).css("height",parseInt(height));//25 es el margen donde esta el texto de la posicion
//        $(this.mouseLine).css("height",parseInt(height));//25 es el margen donde esta el texto de la posicion
    },

    setWidth: function (width) {
        this.width = width - 18;
        var mid = this.width / 2;
        this._setPixelBaseAndZoom();

        $(this.centerLine).css({'left': mid, 'width': this.pixelBase});
        $(this.mouseLine).css({'width': this.pixelBase});

        this.svgTop.setAttribute('width', this.width);
        this.positionText.setAttribute("x", mid - 30);
        this.nucleotidText.setAttribute("x", mid + 35);
        this.lastPositionText.setAttribute("x", this.width - 70);
        this.viewNtsArrow.setAttribute("width", this.width - 4);
        this.viewNtsArrowRight.setAttribute("points", this.width + ",1 " + (this.width - 2) + ",1 " + (this.width - 2) + ",13 " + this.width + ",13");
        this.viewNtsText.setAttribute("x", mid - 30);
        this.viewNtsTextBack.setAttribute("x", mid - 40);
        this.trigger('trackWidth:change', {width: this.width, sender: this})

        this._setTextPosition();
    },

    setZoom: function (zoom) {
//        this.zoom = zoom;
    },

    moveRegion: function (event) {
        this.trigger('trackRegion:move', event);
    },

    setRegion: function (region) {//item.chromosome, item.position, item.species
        var _this = this;
        this.region.load(region);
        this._setPixelBaseAndZoom();
        //get pixelbase by Region


        $(this.centerLine).css({'width': this.pixelBase});
        $(this.mouseLine).css({'width': this.pixelBase});

        this.viewNtsText.textContent = "Window size: " + this.region.length() + " nts";
        this.windowSize = this.viewNtsText.textContent;
        this._setTextPosition();
        this.onWindowSize.notify({windowSize: this.viewNtsText.textContent});

        if (region.species != null) {
            //check species and modify CellBaseAdapter, clean cache
            for (i in this.trackSvgList) {
                if (this.trackSvgList[i].trackData.adapter instanceof CellBaseAdapter ||
                    this.trackSvgList[i].trackData.adapter instanceof SequenceAdapter
                    ) {
                    this.trackSvgList[i].trackData.adapter.species = region.species;
                    //this.trackSvgList[i].trackData.adapter.featureCache.clear();

                    this.trackSvgList[i].trackData.adapter.clearData();
                }
            }
        }
        this.trigger('trackRegion:change', {region: this.region, sender: this})

        this.nucleotidText.textContent = "";//remove base char, will be drawn later if needed


        /************ Loading ************/
        var checkAllTrackStatus = function (status) {
            for (i in _this.trackSvgList) {
                if (_this.trackSvgList[i].status != status) return false;
            }
            return true;
        };
        var checkStatus = function () {
            if (checkAllTrackStatus('ready')) {
                if (_this.parentLayout == null) {
                    _this.onReady.notify();
                }
            } else {
                setTimeout(checkStatus, 100);
            }
        };
        setTimeout(checkStatus, 10);
        /***************************/
//        this.onRegionChange.notify();

        //this.minRegionRect.setAttribute("width",this.minRectWidth);
        //this.minRegionRect.setAttribute("x",(this.width/2)-(this.minRectWidth/2)+6);
    },

    addTrack: function (track) {//args antiguo
        var _this = this;
        var i = this.trackSvgList.push(track);
        this.swapHash[track.id] = {index: i - 1, visible: true};

        track.set('pixelBase', this.pixelBase);
        track.set('zoom', this.zoom);
        track.set('region', this.region);
        track.set('width', this.width);

        // Track must be initialized after we have created
        // de DIV element in order to create the elements in the DOM
        track.initialize(this.tlTracksDiv);

        // Once tack has been initialize we can call draw() function
        track.draw();


        this.on('trackRegion:change', function (event) {
            track.set('pixelBase', _this.pixelBase);
            track.set('zoom', _this.zoom);
            track.set('region', event.region);
            track.draw();
        });

        this.on('trackRegion:move', function (event) {
            track.set('region', event.region);
            track.set('pixelBase', _this.pixelBase);
            track.set('zoom', _this.zoom);
            track.move(event.disp);
        });

        this.on('trackWidth:change', function (event) {
            track.setWidth(event.width);
        });
    },

    removeTrack: function (trackId) {
        // first hide the track
        this._hideTrack(trackId);

        var i = this.swapHash[trackId].index;

        // delete listeners
        this.onRegionChange.removeEventListener(this.trackSvgList[i].onRegionChangeIdx);
        this.off('trackRegion:move', this.trackSvgList[i].move);
//        this.onMove.removeEventListener(this.trackSvgList[i].onMoveIdx);

        // delete data
        var track = this.trackSvgList.splice(i, 1)[0];

        delete this.swapHash[trackId];
        //uddate swapHash with correct index after splice
        for (var i = 0; i < this.trackSvgList.length; i++) {
            this.swapHash[this.trackSvgList[i].id].index = i;
        }
        return track;
    },

    restoreTrack: function (trackSvg, index) {
        var _this = this;

        trackSvg.region = this.region;
        trackSvg.zoom = this.zoom;
        trackSvg.pixelBase = this.pixelBase;
        trackSvg.width = this.width;

        var i = this.trackSvgList.push(trackSvg);
        this.swapHash[trackSvg.id] = {index: i - 1, visible: true};
        trackSvg.setY(this.height);
        trackSvg.draw();
        this.setHeight(this.height + trackSvg.getHeight());

        trackSvg.onRegionChangeIdx = this.onRegionChange.addEventListener(trackSvg.regionChange);
        trackSvg.onMoveIdx = this.onMove.addEventListener(trackSvg.move);

        trackSvg.regionChange();

        if (index != null) {
            this.setTrackIndex(trackSvg.id, index);
        }
    },

    _redraw: function () {
        var _this = this;
        var trackSvg = null;
        var lastY = 0;
        for (var i = 0; i < this.trackSvgList.length; i++) {
            trackSvg = this.trackSvgList[i];
            if (this.swapHash[trackSvg.id].visible) {
                trackSvg.main.setAttribute("y", lastY);
                lastY += trackSvg.getHeight();
            }
        }
    },

    //This routine is called when track order is modified
    _reallocateAbove: function (trackId) {
        var i = this.swapHash[trackId].index;
        console.log(i + " wants to move up");
        if (i > 0) {
            var aboveTrack = this.trackSvgList[i - 1];
            var underTrack = this.trackSvgList[i];

            var y = parseInt(aboveTrack.main.getAttribute("y"));
            var h = parseInt(underTrack.main.getAttribute("height"));
            aboveTrack.main.setAttribute("y", y + h);
            underTrack.main.setAttribute("y", y);

            this.trackSvgList[i] = aboveTrack;
            this.trackSvgList[i - 1] = underTrack;
            this.swapHash[aboveTrack.id].index = i;
            this.swapHash[underTrack.id].index = i - 1;
        } else {
            console.log("is at top");
        }
    },

    //This routine is called when track order is modified
    _reallocateUnder: function (trackId) {
        var i = this.swapHash[trackId].index;
        console.log(i + " wants to move down");
        if (i + 1 < this.trackSvgList.length) {
            var aboveTrack = this.trackSvgList[i];
            var underTrack = this.trackSvgList[i + 1];

            var y = parseInt(aboveTrack.main.getAttribute("y"));
            var h = parseInt(underTrack.main.getAttribute("height"));
            aboveTrack.main.setAttribute("y", y + h);
            underTrack.main.setAttribute("y", y);

            this.trackSvgList[i] = underTrack;
            this.trackSvgList[i + 1] = aboveTrack;
            this.swapHash[underTrack.id].index = i;
            this.swapHash[aboveTrack.id].index = i + 1;

        } else {
            console.log("is at bottom");
        }
    },

    setTrackIndex: function (trackId, newIndex) {
        var oldIndex = this.swapHash[trackId].index;

        //remove track from old index
        var track = this.trackSvgList.splice(oldIndex, 1)[0]

        //add track at new Index
        this.trackSvgList.splice(newIndex, 0, track);

        //uddate swapHash with correct index after slice
        for (var i = 0; i < this.trackSvgList.length; i++) {
            this.swapHash[this.trackSvgList[i].id].index = i;
        }
        //update svg coordinates
        this._redraw();
    },

    scrollToTrack: function (trackId) {
        var swapTrack = this.swapHash[trackId];
        if (swapTrack != null) {
            var i = swapTrack.index;
            var track = this.trackSvgList[i];
            $(this.svg).parent().parent().scrollTop(track.main.getAttribute("y"));
        }
    },


    _hideTrack: function (trackMainId) {
        this.swapHash[trackMainId].visible = false;
        var i = this.swapHash[trackMainId].index;
        var track = this.trackSvgList[i];
        this.svg.removeChild(track.main);

        this.setHeight(this.height - track.getHeight());

        this._redraw();
    },

    _showTrack: function (trackMainId) {
        this.swapHash[trackMainId].visible = true;
        var i = this.swapHash[trackMainId].index;
        var track = this.trackSvgList[i];
        this.svg.appendChild(track.main);

        this.setHeight(this.height + track.getHeight());

        this._redraw();
    },

    _setPixelBaseAndZoom: function () {
        this.pixelBase = this.width / this.region.length();
        this.pixelBase = this.pixelBase / this.zoomMultiplier;
        // At maximum zoom a bp is 10px, for each zoom level (5% of zoom)
        // pixels are divided by two.
//        return Math.max(this.pixelBase, (10/Math.pow(2,20)));
        this.pixelBase = Math.max(this.pixelBase, (10 / Math.pow(2, 20)));

        this.halfVirtualBase = (this.width * 3 / 2) / this.pixelBase;
        this.zoom = Math.round(Utils.getZoomByPixelBase(this.pixelBase));
    },

    _setTextPosition: function () {
        var centerPosition = this.region.center();
        var baseLength = parseInt(this.width / this.pixelBase);//for zoom 100
        var aux = Math.ceil((baseLength / 2) - 1);
        this.visualRegion.start = Math.floor(centerPosition - aux);
        this.visualRegion.end = Math.floor(centerPosition + aux);

        this.positionText.textContent = Utils.formatNumber(centerPosition);
        this.firstPositionText.textContent = Utils.formatNumber(this.visualRegion.start);
        this.lastPositionText.textContent = Utils.formatNumber(this.visualRegion.end);

        this.viewNtsText.textContent = "Window size: " + this.visualRegion.length() + " nts";
        this.viewNtsTextBack.setAttribute("width", this.viewNtsText.textContent.length * 6);
        this.windowSize = this.viewNtsText.textContent;
    },

    getTrackSvgById: function (trackId) {
        if (this.swapHash[trackId] != null) {
            var position = this.swapHash[trackId].index;
            return this.trackSvgList[position];
        }
        return null;
    },

    getMousePosition: function (position) {
        var base = '';
        var colorStyle = '';
        if (position > 0) {
            base = this.getSequenceNucleotid(position);
            colorStyle = 'color:' + SEQUENCE_COLORS[base];
        }
//        this.mouseLine.setAttribute('stroke',SEQUENCE_COLORS[base]);
//        this.mouseLine.setAttribute('fill',SEQUENCE_COLORS[base]);
        return '<span style="font-family: Ubuntu Mono;font-size:19px;' + colorStyle + '">' + base + '</span>';
    },

    getSequenceNucleotid: function (position) {
        var seqTrack = this.getTrackSvgById(1);
        if (seqTrack != null && this.zoom >= seqTrack.visibleRange.start - this.zoomOffset && this.zoom <= seqTrack.visibleRange.end) {
            return seqTrack.dataAdapter.getNucleotidByPosition({start: position, end: position, chromosome: this.region.chromosome})
        }
        return '';
    },

    setNucleotidPosition: function (position) {
        var base = this.getSequenceNucleotid(position);
        this.nucleotidText.setAttribute("fill", SEQUENCE_COLORS[base]);
        this.nucleotidText.textContent = base;
    }
};