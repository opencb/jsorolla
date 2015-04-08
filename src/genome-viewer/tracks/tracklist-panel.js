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

function TrackListPanel(args) {//parent is a DOM div element
    var _this = this;

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.cellBaseHost = 'https://www.ebi.ac.uk/cellbase/webservices/rest';
    this.cellBaseVersion = 'v3';

    //set default args
    this.target;
    this.autoRender = true;
    this.id = Utils.genId("TrackListPanel");
    this.collapsed = false;
    this.collapsible = false;
    this.hidden = false;

    this.tracks = [];
    this.tracksIndex = {};

    this.parentLayout;
    this.mousePosition;
    this.windowSize;

    this.zoomMultiplier = 1;
    this.showRegionOverviewBox = false;


    this.height = 0;

    //set instantiation args, must be last
    _.extend(this, args);

    //set new region object
    this.region = new Region(this.region);
    this.width -= 18;


    this.status;

    //this region is used to do not modify original region, and will be used by trackSvg
    this.visualRegion = new Region(this.region);

    /********/
    this._setPixelBase();
    /********/

    this.on(this.handlers);

    this.regionChanging = false;

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }

};

TrackListPanel.prototype = {
    show: function () {
        $(this.div).css({display: 'block'});
        this.hidden = false;
    },

    hide: function () {
        $(this.div).css({display: 'none'});
        this.hidden = true;
    },
    setVisible: function (bool) {
        if (bool) {
            this.show()
        } else {
            this.hide()
        }
    },
    setTitle: function (title) {
        if ('titleDiv' in this) {
            $(this.titleDiv).html(title);
        }
    },
    showContent: function () {
        $(this.tlHeaderDiv).css({display: 'block'});
        $(this.panelDiv).css({display: 'block'});
        this.collapsed = false;
        $(this.collapseDiv).removeClass('active');
        $(this.collapseDiv).children().first().removeClass('fa-plus');
        $(this.collapseDiv).children().first().addClass('fa-minus');
    },
    hideContent: function () {
        $(this.tlHeaderDiv).css({display: 'none'});
        $(this.panelDiv).css({display: 'none'});
        this.collapsed = true;
        $(this.collapseDiv).addClass('active');
        $(this.collapseDiv).children().first().removeClass('fa-minus');
        $(this.collapseDiv).children().first().addClass('fa-plus');
    },
    render: function () {
        var _this = this;

        this.div = document.createElement('div');
        this.div.classList.add('ocb-gv-tracklist')

        this.windowSizeDiv = document.createElement('div');
        this.windowSizeDiv.classList.add('ocb-gv-tracklist-windowsize');

        if ('title' in this && this.title !== '') {

            var titleDiv = document.createElement('div');
            titleDiv.classList.add('ocb-gv-panel-title', 'unselectable');

            titleDiv.appendChild(this.windowSizeDiv);

            if (this.collapsible == true) {
                this.collapseDiv = document.createElement('div');
                this.collapseDiv.classList.add('ocb-gv-panel-collapse-control');

                var collapseSpan = document.createElement('span');
                collapseSpan.classList.add('fa', 'fa-minus');

                this.collapseDiv.appendChild(collapseSpan);

                $(titleDiv).dblclick(function () {
                    if (_this.collapsed) {
                        _this.showContent();
                    } else {
                        _this.hideContent();
                    }
                });
                $(this.collapseDiv).click(function () {
                    if (_this.collapsed) {
                        _this.showContent();
                    } else {
                        _this.hideContent();
                    }
                });
                titleDiv.appendChild(this.collapseDiv);
            }

            var titleTextDiv = document.createElement('div');
            titleTextDiv.classList.add('ocb-gv-panel-text');
            titleTextDiv.textContent = this.title;
            titleDiv.appendChild(titleTextDiv);


            this.div.appendChild(titleDiv);
        }

        var tlHeaderDiv = $('<div id="tl-header" class="unselectable"></div>')[0];

        var panelDiv = $('<div id="tl-panel"></div>')[0];
        $(panelDiv).css({position: 'relative', width: '100%'});


        this.tlTracksDiv = $('<div id="tl-tracks"></div>')[0];
        $(this.tlTracksDiv).css({position: 'relative', 'z-index': 3});


        $(this.div).append(tlHeaderDiv);
        $(this.div).append(panelDiv);

        $(panelDiv).append(this.tlTracksDiv);


        //Main SVG and its events

        //Position div
        this.positionDiv = document.createElement('div');
        this.positionDiv.classList.add('ocb-gv-tracklist-position');

        this.positionLeftDiv = document.createElement('div');
        this.positionLeftDiv.classList.add('ocb-gv-tracklist-position-left');
        this.positionNucleotidDiv = document.createElement('div');
        this.positionNucleotidDiv.classList.add('ocb-gv-tracklist-position-mid-nt');
        this.positionMidPosDiv = document.createElement('div');
        this.positionMidPosDiv.classList.add('ocb-gv-tracklist-position-mid-pos');
        this.positionMidDiv = document.createElement('div');
        this.positionMidDiv.classList.add('ocb-gv-tracklist-position-mid');
        this.positionRightDiv = document.createElement('div');
        this.positionRightDiv.classList.add('ocb-gv-tracklist-position-right');

        this.positionDiv.appendChild(this.positionLeftDiv);
        this.positionDiv.appendChild(this.positionNucleotidDiv);
        this.positionMidDiv.appendChild(this.positionNucleotidDiv);
        this.positionMidDiv.appendChild(this.positionMidPosDiv);
        this.positionDiv.appendChild(this.positionMidDiv);
        this.positionDiv.appendChild(this.positionRightDiv);
        tlHeaderDiv.appendChild(this.positionDiv);


        var mid = this.width / 2;
        this._setTextPosition();


        this.centerLine = $('<div id="' + this.id + 'centerLine"></div>')[0];
        $(panelDiv).append(this.centerLine);
        $(this.centerLine).css({
            'z-index': 2,
            'position': 'absolute',
            'left': mid - 1,
            'top': 0,
            'width': Math.floor(this.pixelBase),//this.pixelBase + 1,
//            'height': '100%',
            'height': 'calc(100% - 8px)',
            'opacity': 0.5,
            'border': '1px solid orangered',
            'background-color': 'orange'
        });


        this.mouseLine = $('<div id="' + this.id + 'mouseLine"></div>')[0];
        $(panelDiv).append(this.mouseLine);
        $(this.mouseLine).css({
            'z-index': 1,
            'position': 'absolute',
            'left': -20.5,
            'top': 0,
            'width': Math.floor(this.pixelBase),//this.pixelBase + 2,
            'height': 'calc(100% - 8px)',
            'border': '1px solid gray',
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

        if (this.showRegionOverviewBox) {
            var regionOverviewBoxLeft = $('<div id="' + this.id + 'regionOverviewBoxLeft"></div>')[0];
            var regionOverviewBoxRight = $('<div id="' + this.id + 'regionOverviewBoxRight"></div>')[0];
            $(panelDiv).append(regionOverviewBoxLeft);
            $(panelDiv).append(regionOverviewBoxRight);
            var regionOverviewBoxWidth = this.region.length() * this.pixelBase;
            var regionOverviewDarkBoxWidth = (this.width - regionOverviewBoxWidth) / 2
            $(regionOverviewBoxLeft).css({
                'z-index': 0,
                'position': 'absolute',
                'left': 1,
                'top': 0,
                'width': regionOverviewDarkBoxWidth,
                'height': 'calc(100% - 8px)',
//                'border': '1px solid gray',
                'opacity': 0.5,
                //            'visibility': 'hidden',
                'background-color': 'lightgray'
            });
            $(regionOverviewBoxRight).css({
                'z-index': 0,
                'position': 'absolute',
                'left': (regionOverviewDarkBoxWidth + regionOverviewBoxWidth),
                'top': 0,
                'width': regionOverviewDarkBoxWidth,
                'height': 'calc(100% - 8px)',
//                'border': '1px solid gray',
                'opacity': 0.5,
                //            'visibility': 'hidden',
                'background-color': 'lightgray'
            });
            this.regionOverviewBoxLeft = regionOverviewBoxLeft;
            this.regionOverviewBoxRight = regionOverviewBoxRight;
        }


        $(this.div).mousemove(function (event) {
            var centerPosition = _this.region.center();
            var mid = _this.width / 2;
            var mouseLineOffset = _this.pixelBase / 2;
            var offsetX = (event.clientX - _this.tlTracksDiv.getBoundingClientRect().left);
            //debugger
            var cX = offsetX - mouseLineOffset;
            var rcX = (cX / _this.pixelBase) | 0;
            var pos = (rcX * _this.pixelBase) + (mid % _this.pixelBase) - 1;
            $(_this.mouseLine).css({'left': pos});
//
            var posOffset = (mid / _this.pixelBase) | 0;
            _this.mousePosition = centerPosition + rcX - posOffset;
            _this.trigger('mousePosition:change', {
                mousePos: _this.mousePosition,
                baseHtml: _this.getMousePosition(_this.mousePosition)
            });
        });

        $(this.tlTracksDiv).dblclick(function (event) {
            if (!_this.regionChanging) {
                _this.regionChanging = true;
                /**/
                /**/
                /**/
                var halfLength = _this.region.length() / 2;
                var mouseRegion = new Region({
                    chromosome: _this.region.chromosome,
                    start: _this.mousePosition - halfLength,
                    end: _this.mousePosition + halfLength
                })
                _this.trigger('region:change', {region: mouseRegion, sender: _this});
                /**/
                /**/
                /**/
                setTimeout(function () {
                    _this.regionChanging = false;
                }, 700);
            }
        });

        var downX, moveX;
        $(this.tlTracksDiv).mousedown(function (event) {
            $('html').addClass('unselectable');
//                            $('.qtip').qtip('hide').qtip('disable'); // Hide AND disable all tooltips
            $(_this.mouseLine).css({'visibility': 'hidden'});

            var mouseState = event.which;
            if (event.ctrlKey) {
                mouseState = 'ctrlKey' + event.which;
            }
            switch (mouseState) {
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
                case 'ctrlKey1': //ctrlKey and left mouse button
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
            $('html').removeClass("unselectable");
            $(this).css({"cursor": "default"});
            $(_this.mouseLine).css({'visibility': 'visible'});
            $(this).off('mousemove');

            var mouseState = event.which;
            if (event.ctrlKey) {
                mouseState = 'ctrlKey' + event.which;
            }
            switch (mouseState) {
                case 1: //Left mouse button pressed

                    break;
                case 2: //Middle mouse button pressed
                case 'ctrlKey1': //ctrlKey and left mouse button
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
                        moveX = null;
                    } else if (downX != null && moveX == null) {
                        var mouseRegion = new Region({
                            chromosome: _this.region.chromosome,
                            start: _this.mousePosition,
                            end: _this.mousePosition
                        })
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
            $("body").off('keydown.genomeViewer');

            $(selBox).css({'visibility': 'hidden'});
            downX = null;
            moveX = null;
        });

        $(this.tlTracksDiv).mouseenter(function (e) {
//            $('.qtip').qtip('enable'); // To enable them again ;)
            $(_this.mouseLine).css({'visibility': 'visible'});
            $("body").off('keydown.genomeViewer');
            enableKeys();
        });

        var enableKeys = function () {
            //keys
            $("body").bind('keydown.genomeViewer', function (e) {
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

        this.tlHeaderDiv = tlHeaderDiv;
        this.panelDiv = panelDiv;


        this.setVisible(!this.hidden);
        this.rendered = true;
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
        console.log(width);
        this.width = width - 18;
        var mid = this.width / 2;
        this._setPixelBase();

        $(this.centerLine).css({'left': mid - 1, 'width': this.pixelBase + 2});
        $(this.mouseLine).css({'width': this.pixelBase});

        this.trigger('trackWidth:change', {width: this.width, sender: this})

        this._setTextPosition();

        if (this.showRegionOverviewBox) {
            var regionOverviewBoxWidth = this.region.length() * this.pixelBase;
            var regionOverviewDarkBoxWidth = (this.width - regionOverviewBoxWidth) / 2;
            $(this.regionOverviewBoxLeft).css({
                'width': regionOverviewDarkBoxWidth
            });
            $(this.regionOverviewBoxRight).css({
                'left': (regionOverviewDarkBoxWidth + regionOverviewBoxWidth),
                'width': regionOverviewDarkBoxWidth
            });
        }

    },

    highlight: function (event) {
        this.trigger('trackFeature:highlight', event)
    },


    moveRegion: function (event) {
        this.region.load(event.region);
        this.visualRegion.load(event.region);
        this._setTextPosition();
        this.trigger('trackRegion:move', event);
    },

    setSpecies: function (species) {
        this.species = species;
//        this.trigger('trackSpecies:change', {species: species, sender: this});

        for (var i = 0; i < this.tracks.length; i++) {
            var track = this.tracks[i];
            track.setSpecies(this.species);

        }
    },

    setRegion: function (region) {//item.chromosome, item.position, item.species
        var _this = this;
        this.region.load(region);
        this.visualRegion.load(region);
        this._setPixelBase();
        //get pixelbase by Region


        $(this.centerLine).css({'width': this.pixelBase + 2});
        $(this.mouseLine).css({'width': this.pixelBase + 2});

        this._setTextPosition();

        this.trigger('window:size', {windowSize: this.windowSize});

//        if (region.species != null) {
//            //check species and modify CellBaseAdapter, clean cache
//            for (i in this.tracks) {
//                if (this.tracks[i].trackData.adapter instanceof CellBaseAdapter ||
//                    this.tracks[i].trackData.adapter instanceof SequenceAdapter
//                    ) {
//                    this.tracks[i].trackData.adapter.species = region.species;
//                    //this.tracks[i].trackData.adapter.featureCache.clear();
//
//                    this.tracks[i].trackData.adapter.clearData();
//                }
//            }
//        }
        this.trigger('trackRegion:change', {region: this.visualRegion, sender: this})

        this.positionNucleotidDiv.textContent = "";//remove base char, will be drawn later if needed

        this.status = 'rendering';

//        this.onRegionChange.notify();

        //this.minRegionRect.setAttribute("width",this.minRectWidth);
        //this.minRegionRect.setAttribute("x",(this.width/2)-(this.minRectWidth/2)+6);
    },

    draw: function () {
        var _this = this;
        this.targetDiv = ( this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (!this.targetDiv) {
            console.log('target not found');
            return;
        }
        this.targetDiv.appendChild(this.div);

        this.trigger('track:draw', {sender: this});
    },
    _checkAllTrackStatus: function (status) {
        for (var i = 0; i < this.tracks.length; i++) {
            var track = this.tracks[i];
            if (track.status != status) return false;
        }
        return true;
    },
    checkTracksReady: function () {
        return this._checkAllTrackStatus('ready');
//        if (this._checkAllTrackStatus('ready')) {
//            this.status = 'ready';
//            console.log('all ready')
//            this.trigger('tracks:ready', {sender: this});
//        }
//        var checkStatus = function () {
//            if (checkAllTrackStatus('ready')) {
//                _this.trigger('tracks:ready', {sender: _this});
//            } else {
//                setTimeout(checkStatus, 100);
//            }
//        };
//        setTimeout(checkStatus, 10);
    },
    addTrack: function (track) {
        if (_.isArray(track)) {
            for (var i in track) {
                this._addTrack(track[i]);
            }
        } else {
            this._addTrack(track);
        }
    },
    _addTrack: function (track) {
        if (!this.rendered) {
            console.info(this.id + ' is not rendered yet');
            return;
        }
        var _this = this;

        if (track == null) {
            return false
        }
        // Check if already exists
        if (this.containsTrack(track)) {
            return false;
        }


        var length = this.tracks.push(track);
        var insertPosition = length - 1;
        this.tracksIndex[track.id] = insertPosition;


        if (typeof track.dataAdapter.host === 'undefined') {
            track.dataAdapter.host = this.cellBaseHost;
        }
        if (typeof track.dataAdapter.version === 'undefined') {
            track.dataAdapter.version = this.cellBaseVersion;
        }
        track.set('pixelBase', this.pixelBase);
        track.set('region', this.visualRegion);
        track.set('width', this.width);

        // Track must be initialized after we have created
        // de DIV element in order to create the elements in the DOM
        if (!track.rendered) {
            track.render(this.tlTracksDiv);
        }

        // Once tack has been initialize we can call draw() function
        track.draw();


        //trackEvents
        track.set('track:draw', function (event) {
            track.draw();
        });


//        track.set('trackSpecies:change', function (event) {
//            track.setSpecies(event.species);
//        });


        track.set('trackRegion:change', function (event) {
            track.set('pixelBase', _this.pixelBase);
            track.set('region', event.region);
            track.draw();
        });


        track.set('trackRegion:move', function (event) {
            track.set('region', event.region);
            track.set('pixelBase', _this.pixelBase);
            track.move(event.disp);
        });


        track.set('trackWidth:change', function (event) {
            track.setWidth(event.width);
            track.set('pixelBase', _this.pixelBase);
            track.draw();
        });


        track.set('trackFeature:highlight', function (event) {


            var attrName = event.attrName || 'feature_id';
            if ('attrValue' in event) {
                event.attrValue = ($.isArray(event.attrValue)) ? event.attrValue : [event.attrValue];
                for (var key in event.attrValue) {
                    var queryStr = attrName + '~=' + event.attrValue[key];
                    var group = $(track.svgdiv).find('g[' + queryStr + ']')
                    $(group).each(function () {
                        var animation = $(this).find('animate');
                        if (animation.length == 0) {
                            animation = SVG.addChild(this, 'animate', {
                                'attributeName': 'opacity',
                                'attributeType': 'XML',
                                'begin': 'indefinite',
                                'from': '0.0',
                                'to': '1',
                                'begin': '0s',
                                'dur': '0.5s',
                                'repeatCount': '5'
                            });
                        } else {
                            animation = animation[0];
                        }
                        var y = $(group).find('rect').attr("y");
                        $(track.svgdiv).scrollTop(y);
                        animation.beginElement();
                    });
                }
            }
        });

        track.on('track:close', function (event) {
            _this.removeTrack(event.sender);
        });
        track.on('track:up', function (event) {
            _this._reallocateAbove(event.sender);
        });
        track.on('track:down', function (event) {
            _this._reallocateUnder(event.sender);
        });

        this.on('track:draw', track.get('track:draw'));
//        this.on('trackSpecies:change', track.get('trackSpecies:change'));
        this.on('trackRegion:change', track.get('trackRegion:change'));
        this.on('trackRegion:move', track.get('trackRegion:move'));
        this.on('trackWidth:change', track.get('trackWidth:change'));
        this.on('trackFeature:highlight', track.get('trackFeature:highlight'));

//        track.on('track:ready', function () {
//            _this.checkTracksReady();
//        });
    },
    toggleAutoHeight: function (bool) {
        for (var i = 0; i < this.tracks.length; i++) {
            var track = this.tracks[i];
            track.toggleAutoHeight(bool);
        }
    },
    updateHeight: function () {
        for (var i = 0; i < this.tracks.length; i++) {
            var track = this.tracks[i];
            track.updateHeight(true);
        }
    },

    containsTrack: function (track) {
        if (typeof this.tracksIndex[track.id] !== 'undefined') {
            return true;
        } else {
            return false;
        }
    },
    getTrackIndex: function (track) {
        return this.tracksIndex[track.id];
    },
    _updateTracksIndex: function () {
        //update index with correct index after splice
        for (var i = 0; i < this.tracks.length; i++) {
            var track = this.tracks[i];
            this.tracksIndex[track.id] = i;
        }
    },
    refreshTracksDom: function () {
        for (var i = 0; i < this.tracks.length; i++) {
            var track = this.tracks[i];
            $(track.div).detach();
            $(this.tlTracksDiv).append(track.div);
        }
    },
    removeTrack: function (track) {
        if (!this.containsTrack(track)) {
            return false;
        }
        // first hide the track
        this.hideTrack(track);

        var index = this.getTrackIndex(track);
        // remove track from list and hash data
        this.tracks.splice(index, 1)[0];
        delete this.tracksIndex[track.id];
        this._updateTracksIndex();

        // delete listeners

        track.off('track:close');
        track.off('track:up');
        track.off('track:down');


        this.off('track:draw', track.get('track:draw'));
//        this.off('trackSpecies:change', track.get('trackSpecies:change'));
        this.off('trackRegion:change', track.get('trackRegion:change'));
        this.off('trackRegion:move', track.get('trackRegion:move'));
        this.off('trackWidth:change', track.set('trackWidth:change'));
        this.off('trackFeature:highlight', track.get('trackFeature:highlight'));

        this.refreshTracksDom();
        return track;
    },

    restoreTrack: function (track, index) {
        if (this.containsTrack((track))) {
            return false;
        }

        this.addTrack(track);
        if (typeof index !== 'undefined') {
            this.setTrackIndex(track, index);
        }
        track.show();
        this.refreshTracksDom();
    },


    //This routine is called when track order is modified
    _reallocateAbove: function (track) {
        if (!this.containsTrack((track))) {
            return false;
        }

        var i = this.getTrackIndex(track);
        console.log(i + " wants to move up");
        if (i > 0) {
            var aboveTrack = this.tracks[i - 1];
            var underTrack = this.tracks[i];

            this.tracks[i] = aboveTrack;
            this.tracks[i - 1] = underTrack;
            this.tracksIndex[aboveTrack.id] = i;
            this.tracksIndex[underTrack.id] = i - 1;
            this.refreshTracksDom();
        } else {
            console.log("is at top");
        }
    },

    //This routine is called when track order is modified
    _reallocateUnder: function (track) {
        if (!this.containsTrack((track))) {
            return false;
        }

        var i = this.getTrackIndex(track);
        console.log(i + " wants to move down");
        if (i + 1 < this.tracks.length) {
            var aboveTrack = this.tracks[i];
            var underTrack = this.tracks[i + 1];

            this.tracks[i] = underTrack;
            this.tracks[i + 1] = aboveTrack;
            this.tracksIndex[underTrack.id] = i;
            this.tracksIndex[aboveTrack.id] = i + 1;
            this.refreshTracksDom();
        } else {
            console.log("is at bottom");
        }
    },

    setTrackIndex: function (track, newIndex) {
        if (!this.containsTrack((track))) {
            return false;
        }

        var oldIndex = this.getTrackIndex(track);

        //remove track from old index
        this.tracks.splice(oldIndex, 1)[0];

        //add track at new Index
        this.tracks.splice(newIndex, 0, track);

        this._updateTracksIndex();

        //update track div positions
        this.refreshTracksDom();
    },
    swapTracks: function (t1, t2) {
        if (!this.containsTrack((t1))) {
            return false;
        }
        if (!this.containsTrack((t2))) {
            return false;
        }
        var oldIndex1 = this.getTrackIndex(t1);
        var oldIndex2 = this.getTrackIndex(t2);

        this.tracks[oldIndex1] = t2;
        this.tracks[oldIndex2] = t1;
        this.tracksIndex[t1.id] = oldIndex2;
        this.tracksIndex[t2.id] = oldIndex1;
        this.refreshTracksDom();
    },

    scrollToTrack: function (track) {
        if (!this.containsTrack((track))) {
            return false;
        }

        var y = $(track.div).position().top;
        $(this.tlTracksDiv).scrollTop(y);
    },


    hideTrack: function (track) {
        if (!this.containsTrack((track))) {
            return false;
        }
        track.hide();
        this.refreshTracksDom();
    },

    showTrack: function (track) {
        if (!this.containsTrack((track))) {
            return false;
        }
        track.show();
        this.refreshTracksDom();
    },
    _setPixelBase: function () {
        this.pixelBase = this.width / this.region.length();
        this.pixelBase = this.pixelBase / this.zoomMultiplier;
        this.halfVirtualBase = (this.width * 3 / 2) / this.pixelBase;
    },

    _setTextPosition: function () {
        var centerPosition = this.region.center();
        var baseLength = parseInt(this.width / this.pixelBase);//for zoom 100
        var aux = Math.ceil((baseLength / 2) - 1);
        this.visualRegion.start = Math.floor(centerPosition - aux);
        this.visualRegion.end = Math.floor(centerPosition + aux);

        this.positionMidPosDiv.textContent = Utils.formatNumber(centerPosition);
        this.positionLeftDiv.textContent = Utils.formatNumber(this.visualRegion.start);
        this.positionRightDiv.textContent = Utils.formatNumber(this.visualRegion.end);


        this.windowSize = 'Window size: ' + Utils.formatNumber(this.visualRegion.length()) + ' nts';
        this.windowSizeDiv.innerHTML = this.windowSize;
    },

    getTrackById: function (trackId) {
        if (typeof this.tracksIndex[trackId] !== 'undefined') {
            var i = this.tracksIndex[trackId];
            return this.tracks[i];
        }
    },
    getSequenceTrack: function () {
        //if multiple, returns the first found
        for (var i = 0; i < this.tracks.length; i++) {
            var track = this.tracks[i];
            if (track instanceof SequenceTrack) {
                return track;
            }
        }
        return;
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
        return '<span style="' + colorStyle + '">' + base + '</span>';
    },

    getSequenceNucleotid: function (position) {
        var seqTrack = this.getSequenceTrack();
        if (seqTrack != null && this.visualRegion.length() <= seqTrack.visibleRegionSize) {
            var nt = seqTrack.dataAdapter.getNucleotidByPosition({
                start: position,
                end: position,
                chromosome: this.region.chromosome
            })
            return nt;
        }
        return '';
    },

    setNucleotidPosition: function (position) {
        var base = this.getSequenceNucleotid(position);
        this.positionNucleotidDiv.style.color = SEQUENCE_COLORS[base];
        this.positionNucleotidDiv.textContent = base;
    }
};