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

function GenomeViewer(args) {
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    var _this = this;
    this.id = Utils.genId("GenomeViewer");

    //set default args
    this.version = 'Genome Viewer v1';
    this.targetId;
    this.drawNavigationBar = true;
    this.drawKaryotypePanel = true;
    this.drawChromosomePanel = true;
    this.drawRegionOverviewPanel = true;
    this.karyotypePanelConfig = {
        collapsed:false,
        collapsible:true
    }
    this.chromosomePanelConfig = {
        collapsed:false,
        collapsible:true
    }
    this.drawStatusBar = true;
    this.border = true;
    this.resizable = true;
    this.sidePanel = true;//enable or disable sidePanel at construction
    this.trackListTitle = 'Detailed information';//enable or disable sidePanel at construction
    this.trackPanelScrollWidth = 18;
    this.availableSpecies = {
        "text": "Species",
        "items": [
            {
                "text": "Vertebrates",
                "items": [
                    {"text": "Homo sapiens", "assembly": "GRCh37.p10", "region": {"chromosome": "13", "start": 32889611, "end": 32889611}, "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "Y", "MT"], "url": "ftp://ftp.ensembl.org/pub/release-71/"},
                    {"text": "Mus musculus", "assembly": "GRCm38.p1", "region": {"chromosome": "1", "start": 18422009, "end": 18422009}, "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "X", "Y", "MT"], "url": "ftp://ftp.ensembl.org/pub/release-71/"}
                ]
            }
        ]
    };
    this.species = this.availableSpecies.items[0].items[0];
    this.zoom = 100;

    //set instantiation args, must be last
    _.extend(this, args);

    this.defaultRegion = new Region(this.region);

    this.width;
    this.height;
    this.sidePanelWidth = (this.sidePanel) ? 25 : 0;

//    console.log(this.targetId);
//    console.log(this.id);

    //events attachments
    this.on(this.handlers);

    this.fullscreen = false;
    this.resizing = false;


    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
}

GenomeViewer.prototype = {

    render: function (targetId) {
        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }

        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="' + this.id + '" class="ocb-gv ocb-box-vertical"></div>')[0];
        $(this.targetDiv).append(this.div);

        var width = Math.max($(this.div).width(), $(this.targetDiv).width())
        if (width == 0) {
            console.log('target div width is zero');
            return
        }
        this._setWidth(width);

        if (this.border) {
            var border = (_.isString(this.border)) ? this.border : '1px solid lightgray';
            $(this.div).css({border: border});
        }


        Utils.setMinRegion(this.region, this.getSVGCanvasWidth());
        this._recalculateZoom();


        this.navigationbarDiv = $('<div id="navigation-' + this.id + '" class="ocb-gv-navigation"></div>')[0];
        $(this.div).append(this.navigationbarDiv);

        this.centerPanelDiv = $('<div id="center-' + this.id + '" class="ocb-gv-center"></div>')[0];
        $(this.div).append(this.centerPanelDiv);

        this.statusbarDiv = $('<div id="statusbar-' + this.id + '" class="ocb-gv-status"></div>');
        $(this.div).append(this.statusbarDiv);


        this.rightSidebarDiv = $('<div id="rightsidebar-' + this.id + '" style="position:absolute; z-index:50;right:0px;"></div>')[0];
        this.leftSidebarDiv = $('<div id="leftsidebar-' + this.id + '" style="position:absolute; z-index:50;left:0px;"></div>')[0];
        $(this.centerPanelDiv).append(this.rightSidebarDiv);
        $(this.centerPanelDiv).append(this.leftSidebarDiv);


        this.karyotypeDiv = $('<div id="karyotype-' + this.id + '"></div>');
        $(this.centerPanelDiv).append(this.karyotypeDiv);

        this.chromosomeDiv = $('<div id="chromosome-' + this.id + '"></div>');
        $(this.centerPanelDiv).append(this.chromosomeDiv);

        this.trackListPanelsDiv = $('<div id="trackListPanels-' + this.id + '" class="trackListPanels" ></div>');
        $(this.centerPanelDiv).append(this.trackListPanelsDiv);

        this.regionDiv = $('<div id="region-' + this.id + '" ></div>');
        $(this.trackListPanelsDiv).append(this.regionDiv);

        this.tracksDiv = $('<div id="tracks-' + this.id + '" ></div>');
        $(this.trackListPanelsDiv).append(this.tracksDiv);

        this.rendered = true;
    },
    draw: function () {
        if (!this.rendered) {
            console.info('Genome Viewer is not rendered yet');
            return;
        }
        var _this = this;

        // Resize
        if (this.resizable) {
            $(window).resize(function (event) {
                if (event.target == window) {
                    if (!_this.resizing) {//avoid multiple resize events
                        _this.resizing = true;
                        _this._setWidth($(_this.targetDiv).width());
                        setTimeout(function () {
                            _this.resizing = false;
                        }, 400);
                    }
                }
            });
//            $(this.targetDiv).resizable({
//                handles: 'e',
//                ghost: true,
//                stop: function (event, ui) {
//                    _this._setWidth($(_this.targetDiv).width());
//                }
//            });
        }

        /* Navigation Bar */
        if (this.drawNavigationBar) {
            this.navigationBar = this._createNavigationBar($(this.navigationbarDiv).attr('id'));
        }

        /*karyotype Panel*/
        if (this.drawKaryotypePanel) {
            this.karyotypePanel = this._drawKaryotypePanel($(this.karyotypeDiv).attr('id'));
        }

        /* Chromosome Panel */
        if (this.drawChromosomePanel) {
            this.chromosomePanel = this._drawChromosomePanel($(this.chromosomeDiv).attr('id'));
        }

        /* Region Panel, is a TrackListPanel Class */
        if (this.drawRegionOverviewPanel) {
            this.regionOverviewPanel = this._createRegionOverviewPanel($(this.regionDiv).attr('id'));
        }
        /*TrackList Panel*/
        this.trackListPanel = this._createTrackListPanel($(this.tracksDiv).attr('id'));

        /*Status Bar*/
        if (this.drawStatusBar) {
            this.statusBar = this._createStatusBar($(this.statusbarDiv).attr('id'));
        }


        this.on('region:change region:move', function (event) {
            if (event.sender != _this) {
                _this._setRegion(event.region);
            }
        });
    },

    /**/
    /*Components*/
    /**/

    _createNavigationBar: function (targetId) {
        var _this = this;
        var navigationBar = new NavigationBar({
            targetId: targetId,
            availableSpecies: this.availableSpecies,
            species: this.species,
            region: this.region,
            width: this.width,
            svgCanvasWidthOffset: this.trackPanelScrollWidth + this.sidePanelWidth,
            zoom: this.zoom,
            autoRender: true,
            handlers: {
                'region:change': function (event) {
                    Utils.setMinRegion(event.region, _this.getSVGCanvasWidth())
                    _this.trigger('region:change', event);
                },
                'karyotype-button:change': function (event) {
                    if (event.selected) {
                        _this.karyotypePanel.show();
                    } else {
                        _this.karyotypePanel.hide();
                    }
                },
                'chromosome-button:change': function (event) {
                    if (event.selected) {
                        _this.chromosomePanel.show();
                    } else {
                        _this.chromosomePanel.hide();
                    }
                },
                'region-button:change': function (event) {
                    if (event.selected) {
                        _this.regionOverviewPanel.show();
                    } else {
                        _this.regionOverviewPanel.hide();
                    }
                },
                'region:move': function (event) {
                    _this.trigger('region:move', event);
                },
                'species:change': function (event) {
                    _this.trigger('species:change', event);
                    _this.setRegion(event.species.region);
                },
                'fullscreen:click': function (event) {
                    if (_this.fullscreen) {
                        $(_this.div).css({width: 'auto'});
                        Utils.cancelFullscreen();//no need to pass the dom object;
                        _this.fullscreen = false;
                    } else {
                        $(_this.div).css({width: screen.width});
                        Utils.launchFullScreen(_this.div);
                        _this.fullscreen = true;
                    }
                },
                'restoreDefaultRegion:click': function (event) {
                    Utils.setMinRegion(_this.defaultRegion, _this.getSVGCanvasWidth());
                    event.region = _this.defaultRegion;
                    _this.trigger('region:change', event);
                },
                'autoHeight-button:click':function(event){
                    _this.enableAutoHeight();
                }
            }
        });

        this.on('region:change', function (event) {
            if (event.sender != navigationBar) {
                _this.navigationBar.setRegion(event.region);
            }
        });
        this.on('region:move', function (event) {
            if (event.sender != navigationBar) {
                _this.navigationBar.moveRegion(event.region);
            }
        });
        this.on('width:change', function (event) {
            _this.navigationBar.setWidth(event.width);
        });

        navigationBar.draw();

        return navigationBar;
    },

    _drawKaryotypePanel: function (targetId) {
        var _this = this;
        karyotypePanel = new KaryotypePanel({
            targetId: targetId,
            width: this.width - this.sidePanelWidth,
            height: 125,
            species: this.species,
            title: 'Karyotype',
            collapsed: this.karyotypePanelConfig.collapsed,
            collapsible: this.karyotypePanelConfig.collapsible,
            region: this.region,
            autoRender: true,
            handlers: {
                'region:change': function (event) {
                    Utils.setMinRegion(event.region, _this.getSVGCanvasWidth());
                    _this.trigger('region:change', event);
                }
            }
        });

        this.on('region:change region:move', function (event) {
            if (event.sender != karyotypePanel) {
                karyotypePanel.setRegion(event.region);
            }
        });

        this.on('width:change', function (event) {
            karyotypePanel.setWidth(event.width - _this.sidePanelWidth);
        });

        this.on('species:change', function (event) {
            karyotypePanel.setSpecies(event.species);
        });

        karyotypePanel.draw();

        return karyotypePanel;
    },

    _drawChromosomePanel: function (targetId) {
        var _this = this;


        var chromosomePanel = new ChromosomePanel({
            targetId: targetId,
            autoRender: true,
            width: this.width - this.sidePanelWidth,
            height: 65,
            species: this.species,
            title: 'Chromosome',
            collapsed: this.chromosomePanelConfig.collapsed,
            collapsible: this.chromosomePanelConfig.collapsible,
            region: this.region,
            handlers: {
                'region:change': function (event) {
                    _this.trigger('region:change', event);
                }
            }
        });

        this.on('region:change region:move', function (event) {
            if (event.sender != chromosomePanel) {
                chromosomePanel.setRegion(event.region);
            }
        });

        this.on('width:change', function (event) {
            chromosomePanel.setWidth(event.width - _this.sidePanelWidth);
        });

        this.on('species:change', function (event) {
            chromosomePanel.setSpecies(event.species);
        });

        chromosomePanel.draw();

        return chromosomePanel;
    },

    _createRegionOverviewPanel: function (targetId) {
        var _this = this;
        var trackListPanel = new TrackListPanel({
            targetId: targetId,
            autoRender: true,
            width: this.width - this.sidePanelWidth,
            zoom: this.zoom,
            zoomMultiplier: 8,
            title: 'Region overview',
            showRegionOverviewBox: true,
            region: this.region,
            handlers: {
                'region:change': function (event) {
                    event.sender = {};
                    Utils.setMinRegion(event.region, _this.getSVGCanvasWidth())
                    _this.trigger('region:change', event);
                },
                'region:move': function (event) {
                    _this.trigger('region:move', event);
                },
                'tracks:ready':function(){
                    _this.checkTrackListReady();
                }
            }
        });

        this.on('region:change', function (event) {
            if (event.sender != trackListPanel) {
                trackListPanel.setRegion(event.region);
            }
        });

        this.on('region:move', function (event) {
            if (event.sender != trackListPanel) {
                trackListPanel.moveRegion(event);
            }
        });

        this.on('width:change', function (event) {
            trackListPanel.setWidth(event.width - _this.sidePanelWidth);
        });

        this.on('species:change', function (event) {
            trackListPanel.setSpecies(event.species);
        });

        return  trackListPanel;
    },

    _createTrackListPanel: function (targetId) {
        var _this = this;
        var trackListPanel = new TrackListPanel({
            targetId: targetId,
            autoRender: true,
            width: this.width - this.sidePanelWidth,
            zoom: this.zoom,
            title: this.trackListTitle,
            region: this.region,
            handlers: {
                'region:change': function (event) {
                    event.sender = {};
                    Utils.setMinRegion(event.region, _this.getSVGCanvasWidth());
                    _this.trigger('region:change', event);
                },
                'region:move': function (event) {
                    _this.trigger('region:move', event);
                },
                'tracks:ready':function(){
                    _this.checkTrackListReady();
                }
            }
        });

        this.on('feature:highlight', function (event) {
            trackListPanel.highlight(event);
        });

        this.on('region:change', function (event) {
            if (event.sender != trackListPanel) {
                trackListPanel.setRegion(event.region);
            }
        });

        this.on('region:move', function (event) {
            if (event.sender != trackListPanel) {
                trackListPanel.moveRegion(event);
            }
        });
        this.on('width:change', function (event) {
            trackListPanel.setWidth(event.width - _this.sidePanelWidth);
        });

        this.on('species:change', function (event) {
            trackListPanel.setSpecies(event.species);
        });

        return  trackListPanel;
    },

    _createStatusBar: function (targetId) {
        var _this = this;
        var statusBar = new StatusBar({
            targetId: targetId,
            autoRender: true,
            region: this.region,
            width: this.width,
            version: this.version
        });

        this.trackListPanel.on('mousePosition:change', function (event) {
            statusBar.setMousePosition(event);
        });
        this.on('region:change', function (event) {
            statusBar.setRegion(event);
        });

        return  statusBar;
    },

    checkTrackListReady: function () {
        var _this = this;
        var checkAllTrackListStatus = function (status) {
            if(_this.trackListPanel.status != status || _this.regionOverviewPanel.status != status){
               return false;
            }
            return true;
        };
        if (checkAllTrackListStatus('ready')) {
            console.log('-------------all tracklist ready')
            _this.trigger('tracks:ready', {sender: _this});
        }
//        var checkStatus = function () {
//            if (checkAllTrackStatus('ready')) {
//                _this.trigger('tracks:ready', {sender: _this});
//            } else {
//                setTimeout(checkStatus, 100);
//            }
//        };
//        setTimeout(checkStatus, 10);
    },

    getRightSidePanelId: function () {
        return $(this.rightSidebarDiv).attr('id');
    },
    getLeftSidePanelId: function () {
        return $(this.leftSidebarDiv).attr('id');
    },
    getNavigationPanelId: function () {
        return $(this.navigationbarDiv).attr('id');
    },
    getStatusPanelId: function () {
        return $(this.statusbarDiv).attr('id');
    },
    setNavigationBar: function (navigationBar) {
        this.navigationBar = navigationBar;
        var config = {
            availableSpecies: this.availableSpecies,
            species: this.species,
            region: this.region,
            width: this.width,
            svgCanvasWidthOffset: this.trackPanelScrollWidth + this.sidePanelWidth,
            zoom: this.zoom
        };
        _.extend(this.navigationBar, config);
        navigationBar.render(this.getNavigationPanelId());
    },
    _setWidth: function (width) {
        this.width = width;
        this._recalculateZoom();
        this.trigger('width:change', {width: this.width, sender: this});
    },
    setWidth: function (width) {
        $(this.div).width(width);
        this._setWidth(width);
    },
    getSVGCanvasWidth: function () {
        return this.width - this.trackPanelScrollWidth - this.sidePanelWidth;
    },
    _setRegion: function (region) {
        //update internal parameters
        this.region.load(region);
        this._recalculateZoom();
    },
    setRegion: function (region) {
        this.region.load(region);
        Utils.setMinRegion(this.region, this.getSVGCanvasWidth());
        this.trigger('region:change', {region: this.region, sender: this});
    },
    move: function (disp) {
//        var pixelBase = (this.width-this.svgCanvasWidthOffset) / this.region.length();
//        var disp = Math.round((disp*10) / pixelBase);
        this.region.start += disp;
        this.region.end += disp;
        this.trigger('region:move', {region: this.region, disp: -disp, sender: this});
    },

    _recalculateZoom: function () {
        this.zoom = this._calculateZoomByRegion();
    },
    _calculateRegionByWidth: function () {
        var zoomBaseLength = parseInt(this.getSVGCanvasWidth() / Utils.getPixelBaseByZoom(this.zoom));
        var regionCenter = this.region.center();
        var regionHalf = Math.ceil((zoomBaseLength / 2) - 1);
        return {
            start: Math.floor(regionCenter - regionHalf),
            end: Math.floor(regionCenter + regionHalf)
        }
    },
    _calculateZoomByRegion: function () {
        return Utils.getZoomByPixelBase((this.getSVGCanvasWidth() / this.region.length()));
    },

    mark: function (args) {
        var attrName = args.attrName || 'feature_id';
        var cssClass = args.class || 'feature-emph';
        if ('attrValues' in args) {
            args.attrValues = ($.isArray(args.attrValues)) ? args.attrValues : [args.attrValues];
            for (var key in args.attrValues) {
                $('rect[' + attrName + '~=' + args.attrValues[key] + ']').attr('class', cssClass);
            }

        }
    },
    unmark: function (args) {
        var attrName = args.attrName || 'feature_id';
        if ('attrValues' in args) {
            args.attrValues = ($.isArray(args.attrValues)) ? args.attrValues : [args.attrValues];
            for (var key in args.attrValues) {
                $('rect[' + attrName + '~=' + args.attrValues[key] + ']').attr('class', '');
            }

        }
    },

    highlight: function (args) {
        this.trigger('feature:highlight', args);
    },

    enableAutoHeight: function () {
        this.trackListPanel.enableAutoHeight();
        this.regionOverviewPanel.enableAutoHeight();
    },


    setSpeciesVisible: function (bool) {
        this.navigationBar.setSpeciesVisible(bool);
    },

    setChromosomesVisible: function (bool) {
        this.navigationBar.setChromosomeMenuVisible(bool);
    },

    setKaryotypePanelVisible: function (bool) {
        this.karyotypePanel.setVisible(bool);
        this.navigationBar.setVisible({'karyotype': bool});
    },

    setChromosomePanelVisible: function (bool) {
        this.chromosomePanel.setVisible(bool);
        this.navigationBar.setVisible({'chromosome': bool});
    },

    setRegionOverviewPanelVisible: function (bool) {
        this.regionOverviewPanel.setVisible(bool);
        this.navigationBar.setVisible({'region': bool});
    },
    setRegionTextBoxVisible: function (bool) {
        this.navigationBar.setRegionTextBoxVisible(bool);
    },
    setSearchVisible: function (bool) {
        this.navigationBar.setSearchVisible(bool);
    },
    setFullScreenVisible: function (bool) {
        this.navigationBar.setFullScreenButtonVisible(bool);
    },

    /*Track management*/
    addOverviewTrack: function (trackData, args) {
        this.regionOverviewPanel.addTrack(trackData, args);
    },

    addTrack: function (trackData, args) {
        this.trackListPanel.addTrack(trackData, args);
    },

    getTrackSvgById: function (trackId) {
        return this.trackListPanel.getTrackSvgById(trackId);
    },

    removeTrack: function (trackId) {
        return this.trackListPanel.removeTrack(trackId);
    },

    restoreTrack: function (trackSvg, index) {
        return this.trackListPanel.restoreTrack(trackSvg, index);
    },

    setTrackIndex: function (trackId, newIndex) {
        return this.trackListPanel.setTrackIndex(trackId, newIndex);
    },

    scrollToTrack: function (trackId) {
        return this.trackListPanel.scrollToTrack(trackId);
    },

    showTrack: function (trackId) {
        this.trackListPanel._showTrack(trackId);
    },

    hideTrack: function (trackId) {
        this.trackListPanel._hideTrack(trackId);
    },

    checkRenderedTrack: function (trackId) {
        if (this.trackListPanel.swapHash[trackId]) {
            return true;
        }
        return false;
    }
};


