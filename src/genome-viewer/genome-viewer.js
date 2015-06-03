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
    this.autoRender = true;
    this.version = 'Powered by <a target="_blank" href="http://www.genomemaps.org/">Genome Maps</a>';
    this.target;

    this.width;
    this.height;

    this.cellBaseHost = 'http://bioinfo.hpc.cam.ac.uk/cellbase/webservices/rest';
    this.cellBaseVersion = 'v3';

    this.quickSearchResultFn;
    this.quickSearchDisplayKey = 'name';

    this.drawNavigationBar = true;
    this.drawKaryotypePanel = true;
    this.drawChromosomePanel = true;
    this.drawOverviewTrackListPanel = true;
    this.overviewZoomMultiplier = 8;
    this.karyotypePanelConfig = {
        hidden: false,
        collapsed: false,
        collapsible: true
    };
    this.chromosomePanelConfig = {
        hidden: false,
        collapsed: false,
        collapsible: true
    };
    this.regionPanelConfig = {
        hidden: false,
        collapsed: false,
        collapsible: true
    };
    this.navigationBarConfig = {};
    this.drawStatusBar = true;
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
                    {
                        "text": "Homo sapiens",
                        "assembly": "GRCh37.p10",
                        "region": {"chromosome": "13", "start": 32889611, "end": 32889611},
                        "url": "ftp://ftp.ensembl.org/pub/release-71/"
                    },
                    {
                        "text": "Mus musculus",
                        "assembly": "GRCm38.p1",
                        "region": {"chromosome": "1", "start": 18422009, "end": 18422009},
                        "url": "ftp://ftp.ensembl.org/pub/release-71/"
                    }
                ]
            }
        ]
    };
    this.species = this.availableSpecies.items[0].items[0];


    this.zoom;

    this.chromosomes;
    this.chromosomeList;

    //set instantiation args, must be last
    _.extend(this, args);

    this.chromosomes = this.getChromosomes();
    this.species.chromosomes = this.chromosomes;

    this.defaultRegion = new Region(this.region);

    this.sidePanelWidth = (this.sidePanel) ? 25 : 0;


    //events attachments
    this.on(this.handlers);

    this.fullscreen = false;
    this.resizing = false;

    this.changingRegion = false;

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
}

GenomeViewer.prototype = {
    render: function () {
        var _this = this;
        console.log("Initializing Genome Viewer");

        //HTML skel
        this.div = document.createElement('div');
        this.div.setAttribute('id', this.id);
        this.div.setAttribute('class', 'ocb-gv ocb-box-vertical');

        this.navigationbarDiv = document.createElement('div');
        this.navigationbarDiv.setAttribute('class', 'ocb-gv-navigation');
        this.div.appendChild(this.navigationbarDiv);

        this.centerPanelDiv = document.createElement('div');
        this.centerPanelDiv.setAttribute('class', 'ocb-gv-center');
        this.div.appendChild(this.centerPanelDiv);

        this.statusbarDiv = document.createElement('div');
        this.statusbarDiv.setAttribute('class', 'ocb-gv-status');
        this.div.appendChild(this.statusbarDiv);


        this.rightSidebarDiv = document.createElement('div');
        this.rightSidebarDiv.setAttribute('class', 'ocb-gv-right-side');
        this.centerPanelDiv.appendChild(this.rightSidebarDiv);

        this.leftSidebarDiv = document.createElement('div');
        this.leftSidebarDiv.setAttribute('class', 'ocb-gv-left-side');
        this.centerPanelDiv.appendChild(this.leftSidebarDiv);


        this.karyotypeDiv = document.createElement('div');
        this.karyotypeDiv.setAttribute('class', 'ocb-gv-karyotype');
        this.centerPanelDiv.appendChild(this.karyotypeDiv);

        this.chromosomeDiv = document.createElement('div');
        this.chromosomeDiv.setAttribute('class', 'ocb-gv-chromosome');
        this.centerPanelDiv.appendChild(this.chromosomeDiv);


        this.trackListPanelsDiv = document.createElement('div');
        this.trackListPanelsDiv.setAttribute('class', 'ocb-gv-tracklist-target');
        this.centerPanelDiv.appendChild(this.trackListPanelsDiv);

        this.regionDiv = document.createElement('div');
        this.regionDiv.setAttribute('class', 'ocb-gv-overview');
        this.trackListPanelsDiv.appendChild(this.regionDiv);

        this.tracksDiv = document.createElement('div');
        this.tracksDiv.setAttribute('class', 'ocb-gv-detailed');
        this.trackListPanelsDiv.appendChild(this.tracksDiv);


        /****************************/
        /****************************/
        /****************************/


        this._checkAndSetMinimumRegion(this.region, this.getSVGCanvasWidth());
        this.zoom = this._calculateZoomByRegion(this.region);

        // Resize
        if (this.resizable) {
            $(window).resize(function (event) {
                if (event.target == window) {
                    if (!_this.resizing) {//avoid multiple resize events
                        _this.resizing = true;
                        _this.setWidth($(_this.targetDiv).width());
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
            this.navigationBar = this._createNavigationBar(this.navigationbarDiv);
        }


        /*karyotype Panel*/
        if (this.drawKaryotypePanel) {
            this.karyotypePanel = this._drawKaryotypePanel(this.karyotypeDiv);
        }

        /* Chromosome Panel */
        if (this.drawChromosomePanel) {
            this.chromosomePanel = this._drawChromosomePanel(this.chromosomeDiv);
        }

        /* Region Panel, is a TrackListPanel Class */
        if (this.drawOverviewTrackListPanel) {
            this.overviewTrackListPanel = this._createOverviewTrackListPanel(this.regionDiv);
        }
        /*TrackList Panel*/
        this.trackListPanel = this._createTrackListPanel(this.tracksDiv);

        /*Status Bar*/
        if (this.drawStatusBar) {
            this.statusBar = this._createStatusBar(this.statusbarDiv);
        }


        this.on('region:change region:move', function (event) {
            if (event.sender != _this) {
                _this.region.load(event.region);
            }
        });
        this.on('width:change', function (event) {
            if (event.sender != _this) {
                _this.width = event.width;
                $(_this.div).width(event.width);
                $(_this.targetDiv).width(event.width);
            }
        });
        //this.on('species:change', function (event) {
        //    _this.species = event.species;
        //    _this.chromosomes = _this.getChromosomes();
        //});

        $("html").bind('keydown.genomeViewer', function (e) {
            switch (e.keyCode) {
                case 40://down arrow
                case 109://minus key
                    if (e.shiftKey) {
                        _this.increaseZoom(-10);
                    }
                    break;
                case 38://up arrow
                case 107://plus key
                    if (e.shiftKey) {
                        _this.increaseZoom(10);
                    }
                    break;
            }
        });

        /****************************/
        /****************************/
        /****************************/


        this.rendered = true;
    },
    draw: function () {
        this.targetDiv = ( this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (!this.targetDiv) {
            console.log('target not found');
            return;
        }
        this.targetDiv.appendChild(this.div);
    },
    destroy: function () {
        $(this.div).remove();
        this.off();
        this.rendered = false;
        $("html").unbind(".genomeViewer");
        $("body").unbind(".genomeViewer");
        delete this;
    },
    getChromosomes: function () {
        var saveChromosomes = function (chromsomeList) {
            var chromosomes = {};
            for (var i = 0; i < chromsomeList.length; i++) {
                var chromosome = chromsomeList[i];
                chromosomes[chromosome.name] = chromosome;
            }
            return chromosomes;
        }

        var chromosomes;
        if (typeof this.chromosomeList !== 'undefined') {
            chromosomes = saveChromosomes(this.chromosomeList);
        } else {
            CellBaseManager.get({
                host: this.cellBaseHost,
                version: this.cellBaseVersion,
                species: this.species,
                category: 'genomic',
                subCategory: 'chromosome',
                resource: 'all',
                async: false,
                success: function (data) {
                    chromosomes = saveChromosomes(data.response[0].result[0].chromosomes);
                    for (var i = 0; i < chromosomes.length; i++) {
                        var chr = chromosomes[i];
                        debugger
                    }
                },
                error: function (data) {
                    console.log('Could not get chromosome list');
                }
            });
        }
        return chromosomes;
    },
    /**/
    /*Components*/
    /**/

    _createNavigationBar: function (target) {
        var _this = this;

        if (!$.isFunction(this.quickSearchResultFn)) {
            this.quickSearchResultFn = function (query) {
                var results = [];
                var speciesCode = Utils.getSpeciesCode(this.species.text);

                CellBaseManager.get({
                    host: _this.cellBaseHost,
                    version: _this.cellBaseVersion,
//                    host: 'http://ws.bioinfo.cipf.es/cellbase/rest',
                    species: speciesCode,
                    category: 'feature',
                    subCategory: 'id',
                    query: query,
                    resource: 'starts_with',
                    params: {
                        limit: 10
                    },
                    async: false,
                    success: function (data, textStatus, jqXHR) {
                        results = data.response[0].result;
//                        var features = data.response[0].result;
//                        for (var i = 0; i < features.length; i++) {
//                            results.push(features[i].name)
//                        }
                    }
                });
                return results;
            };
        }

        var goFeature = function (feature) {
            _this._regionChangeHandler({region: new Region(feature)});
//            if (featureName != null) {
//                if (featureName.slice(0, "rs".length) == "rs" || featureName.slice(0, "AFFY_".length) == "AFFY_" || featureName.slice(0, "SNP_".length) == "SNP_" || featureName.slice(0, "VAR_".length) == "VAR_" || featureName.slice(0, "CRTAP_".length) == "CRTAP_" || featureName.slice(0, "FKBP10_".length) == "FKBP10_" || featureName.slice(0, "LEPRE1_".length) == "LEPRE1_" || featureName.slice(0, "PPIB_".length) == "PPIB_") {
//                    this.openSNPListWidget(featureName);
//                } else {
//                    console.log(featureName);
//                    CellBaseManager.get({
//                        host: _this.cellBaseHost,
//                        version: _this.cellBaseVersion,
//                        species: _this.species,
//                        category: 'feature',
//                        subCategory: 'id',
//                        query: featureName,
//                        resource: 'info',
//                        params: {
//                            include: 'chromosome,start,end'
//                        },
//                        success: function (data) {
//                            debugger
//                            var feat = data.response[0].result[0];
//                            var region = new Region(feat);
//                            _this._regionChangeHandler({region: region});
//                        }
//                    });
//                }
//            }
        };

        var navigationBar = new NavigationBar({
            target: target,
            cellBaseHost: this.cellBaseHost,
            cellBaseVersion: this.cellBaseVersion,
            availableSpecies: this.availableSpecies,
            species: this.species,
            region: this.region,
            width: this.width,
            svgCanvasWidthOffset: this.trackPanelScrollWidth + this.sidePanelWidth,
            zoom: this.zoom,
            quickSearchResultFn: this.quickSearchResultFn,
            quickSearchDisplayKey: this.quickSearchDisplayKey,
            componentsConfig: this.navigationBarConfig.componentsConfig,
            karyotypePanelConfig: this.karyotypePanelConfig,
            chromosomePanelConfig: this.chromosomePanelConfig,
            regionPanelConfig: this.regionPanelConfig,
            handlers: {
                'region:change': function (event) {
                    _this._regionChangeHandler(event);
                },
                'region:move': function (event) {
                    _this._regionMoveHandler(event);
                },
                'zoom:change': function (event) {
                    _this._zoomChangeHandler(event);
                },
                'species:change': function (event) {
                    _this._speciesChangeHandler(event);
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
                        _this.overviewTrackListPanel.show();
                    } else {
                        _this.overviewTrackListPanel.hide();
                    }
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
                    event.region = _this.defaultRegion;
                    _this._regionChangeHandler(event);
                },
                'autoHeight-button:change': function (event) {
                    _this.toggleAutoHeight(event.selected);
                },
                'quickSearch:select': function (event) {
                    goFeature(event.item);
                    _this.trigger('quickSearch:select', event);
                },
                'quickSearch:go': function (event) {
                    goFeature(event.item);
                }
            }
        });

        this.on('region:change', function (event) {
//            if (event.sender != navigationBar) {
            _this.navigationBar.setRegion(event.region, _this.zoom);
//            }
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

    _drawKaryotypePanel: function (target) {
        var _this = this;
        var karyotypePanel = new KaryotypePanel({
            target: target,
            cellBaseHost: this.cellBaseHost,
            cellBaseVersion: this.cellBaseVersion,
            width: this.width - this.sidePanelWidth,
            height: 125,
            species: this.species,
            title: 'Karyotype',
            collapsed: this.karyotypePanelConfig.collapsed,
            collapsible: this.karyotypePanelConfig.collapsible,
            hidden: this.karyotypePanelConfig.hidden,
            region: this.region,
            autoRender: true,
            handlers: {
                'region:change': function (event) {
                    _this._regionChangeHandler(event);
                }
            }
        });

        this.on('region:change region:move', function (event) {
//            if (event.sender != karyotypePanel) {
            karyotypePanel.setRegion(event.region);
//            }
        });
        this.on('width:change', function (event) {
            karyotypePanel.setWidth(event.width - _this.sidePanelWidth);
        });
//        this.on('species:change', function (event) {
//            karyotypePanel.setSpecies(event.species);
//        });

        karyotypePanel.draw();

        return karyotypePanel;
    },

    _drawChromosomePanel: function (target) {
        var _this = this;

        var chromosomePanel = new ChromosomePanel({
            target: target,
            cellBaseHost: this.cellBaseHost,
            cellBaseVersion: this.cellBaseVersion,
            autoRender: true,
            width: this.width - this.sidePanelWidth,
            height: 65,
            species: this.species,
            title: 'Chromosome',
            collapsed: this.chromosomePanelConfig.collapsed,
            collapsible: this.chromosomePanelConfig.collapsible,
            hidden: this.chromosomePanelConfig.hidden,
            region: this.region,
            handlers: {
                'region:change': function (event) {
                    _this._regionChangeHandler(event);
                }
            }
        });

        this.on('region:change region:move', function (event) {
//            if (event.sender != chromosomePanel) {
            chromosomePanel.setRegion(event.region);
//            }
        });
        this.on('width:change', function (event) {
            chromosomePanel.setWidth(event.width - _this.sidePanelWidth);
        });
//        this.on('species:change', function (event) {
//            chromosomePanel.setSpecies(event.species);
//        });

        chromosomePanel.draw();

        return chromosomePanel;
    },

    _createOverviewTrackListPanel: function (target) {
        var _this = this;
        var trackListPanel = new TrackListPanel({
            cellBaseHost: this.cellBaseHost,
            cellBaseVersion: this.cellBaseVersion,
            target: target,
            autoRender: true,
            width: this.width - this.sidePanelWidth,
            zoomMultiplier: this.overviewZoomMultiplier,
            title: 'Region overview',
            showRegionOverviewBox: true,
            collapsible: this.regionPanelConfig.collapsible,
            region: this.region,
            handlers: {
                'region:change': function (event) {
                    event.sender = undefined;
                    _this._regionChangeHandler(event);
                },
                'region:move': function (event) {
                    _this._regionMoveHandler(event);
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
//        this.on('species:change', function (event) {
//            trackListPanel.setSpecies(event.species);
//        });

        trackListPanel.draw();

        return trackListPanel;
    },

    _createTrackListPanel: function (target) {
        var _this = this;
        var trackListPanel = new TrackListPanel({
            target: target,
            cellBaseHost: this.cellBaseHost,
            cellBaseVersion: this.cellBaseVersion,
            autoRender: true,
            width: this.width - this.sidePanelWidth,
            title: this.trackListTitle,
            region: this.region,
            hidden: this.regionPanelConfig.hidden,
            handlers: {
                'region:change': function (event) {
                    event.sender = undefined;
                    _this._regionChangeHandler(event);
                },
                'region:move': function (event) {
                    _this._regionMoveHandler(event);
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
//        this.on('species:change', function (event) {
//            trackListPanel.setSpecies(event.species);
//        });

        this.on('feature:highlight', function (event) {
            trackListPanel.highlight(event);
        });

        trackListPanel.draw();

        return trackListPanel;
    },

    _createStatusBar: function (target) {
        var _this = this;
        var statusBar = new StatusBar({
            target: target,
            autoRender: true,
            region: this.region,
            width: this.width,
            version: this.version
        });

        this.on('region:change', function (event) {
            statusBar.setRegion(event);
        });


        this.trackListPanel.on('mousePosition:change', function (event) {
            statusBar.setMousePosition(event);
        });

        statusBar.draw();
        return statusBar;
    },


    /*****************/
    /** PRIVATE HELPER METHODS **/
    /*****************/
    _checkAndSetNewChromosomeRegion: function (region) {
        var newChr = this.chromosomes[region.chromosome];
        if (region.chromosome !== this.region.chromosome) {
            if (region.start > newChr.size || region.end > newChr.size) {
                region.start = Math.round(newChr.size / 2);
                region.end = Math.round(newChr.size / 2);
            }
        }
    },
    _checkAndSetMinimumRegion: function (region, width) {
        var minLength = Math.floor(width / 10);
        if (region.length() < minLength) {
            var centerPosition = region.center();
            var aux = Math.ceil((minLength / 2) - 1);
            region.start = Math.floor(centerPosition - aux);
            region.end = Math.floor(centerPosition + aux);
        }
    },
    _calculateRegionByZoom: function (zoom) {
        // mrl = minimum region length
        // zlm = zoom level multiplier

        // mrl * zlm ^ 100 = chr.size
        // zlm = (chr.size/mrl)^(1/100)
        // zlm = (chr.size/mrl)^0.01

        var minNtPixels = 10; // 10 is the minimum pixels per nt
        var chr = this.chromosomes[this.region.chromosome];
        var minRegionLength = this.getSVGCanvasWidth() / minNtPixels;
        var zoomLevelMultiplier = Math.pow(chr.size / minRegionLength, 0.01); // 0.01 = 1/100  100 zoom levels

//      regionLength = mrl * (Math.pow(zlm,ZOOM))
        var regionLength = minRegionLength * (Math.pow(zoomLevelMultiplier, 100 - zoom)); // invert   100 - zoom

        var centerPosition = this.region.center();
        var aux = Math.ceil((regionLength / 2) - 1);
        var start = Math.floor(centerPosition - aux);
        var end = Math.floor(centerPosition + aux);

        return {start: start, end: end};
    },
    _calculateZoomByRegion: function (region) {
        var minNtPixels = 10; // 10 is the minimum pixels per nt
        var chr = this.chromosomes[region.chromosome];
        var minRegionLength = this.getSVGCanvasWidth() / minNtPixels;
        var zoomLevelMultiplier = Math.pow(chr.size / minRegionLength, 0.01); // 0.01 = 1/100  100 zoom levels

        var regionLength = region.length();

//      zoom = Math.log(REGIONLENGTH/mrl) / Math.log(zlm);
        var zoom = Math.log(regionLength / minRegionLength) / Math.log(zoomLevelMultiplier);
        return 100 - zoom;
    },
    /*****************/
    /*****************/
    /*****************/



    /*****************/
//    _startRegionChange: function () {
//        if (this.changingRegion === true) {
////            return false;
//            return true
//        } else {
//            this.changingRegion = true;
//            return true;
//        }
//    },
//    _endRegionChange: function () {
//        this.changingRegion = false;
//    },

//    _checkStatus: function () {
//        var ok = true;
//        if (typeof this.overviewTrackListPanel !== 'undefined') {
//            if (this.overviewTrackListPanel.status !== 'ready') {
//                ok = false;
//            }
//        }
//        if (typeof this.trackListPanel !== 'undefined') {
//            if (this.trackListPanel.status !== 'ready') {
//                ok = false;
//            }
//        }
//        if (ok) {
//            this._endRegionChange();
//        }
//    },
//    checkTrackListReady: function () {
//        var _this = this;
//        var checkAllTrackListStatus = function (status) {
//            if (_this.overviewTrackListPanel && _this.overviewTrackListPanel.status != status) {
//                return false;
//            }
//            if (_this.trackListPanel.status != status) {
//                return false;
//            }
//            return true;
//        };
//        if (checkAllTrackListStatus('ready')) {
////            console.log('-------------all tracklist ready')
//            _this.trigger('tracks:ready', {sender: _this});
//        }
////        var checkStatus = function () {
////            if (checkAllTrackStatus('ready')) {
////                _this.trigger('tracks:ready', {sender: _this});
////            } else {
////                setTimeout(checkStatus, 100);
////            }
////        };
////        setTimeout(checkStatus, 10);
//    },

    _checkChangingRegion: function () {
        if (typeof this.overviewTrackListPanel !== 'undefined') {
            if (!this.overviewTrackListPanel.checkTracksReady()) {
                return false;
            }
        }
        if (typeof this.trackListPanel !== 'undefined') {
            if (!this.trackListPanel.checkTracksReady()) {
                return false;
            }
        }
        return true;
    },

    /*****************/




    /*****************/
    /** EVENT METHODS **/
    /*****************/
    _regionChangeHandler: function (event) {
        if (this._checkChangingRegion()) {

            /**/
            this._checkAndSetNewChromosomeRegion(event.region);
            this._checkAndSetMinimumRegion(event.region, this.getSVGCanvasWidth());
            this.zoom = this._calculateZoomByRegion(event.region);
            //Relaunch
            this.trigger('region:change', event);
            /**/
            return true;
        } else {
            if (event.sender) {
                if (event.sender.updateRegionControls) {
                    event.sender.updateRegionControls();
                }
            }
            console.log('****************************');
            console.log('**************************** region change already in progress');
            console.log('****************************');
            return false;
        }
    },
    _regionMoveHandler: function (event) {
        //Relaunch
        this.trigger('region:move', event);
    },
    _zoomChangeHandler: function (event) {
        event.zoom = Math.min(100, event.zoom);
        event.zoom = Math.max(0, event.zoom);
        this.zoom = event.zoom;
        this.region.load(this._calculateRegionByZoom(event.zoom));
        this.setRegion(this.region);
    },
    _speciesChangeHandler: function (event) {
        //Relaunch
        //this.trigger('species:change', event);
        this._updateSpecies(event.species);

        var c = this.chromosomes[Object.keys(this.chromosomes)[0]];
        var region = new Region({
            chromosome: c.name,
            start: Math.round(c.size / 2),
            end: Math.round(c.size / 2)
        });
        this.setRegion(region);
    },
    _updateSpecies:function(species){
        this.species = species;
        this.chromosomes = this.getChromosomes();
        this.species.chromosomes = this.chromosomes;

        this.overviewTrackListPanel.setSpecies(species);
        this.trackListPanel.setSpecies(species);
        this.chromosomePanel.setSpecies(species);
        this.karyotypePanel.setSpecies(species);
        this.navigationBar.setSpecies(species);
    },
    _getSpeciesByTaxonomy: function (taxonomyCode) {
        //find species object
        var speciesObject = null;
        for (var i = 0; i < this.availableSpecies.items.length; i++) {
            for (var j = 0; j < this.availableSpecies.items[i].items.length; j++) {
                var species = this.availableSpecies.items[i].items[j];
                var taxonomy = Utils.getSpeciesCode(species.text);
                if (taxonomy === taxonomyCode) {
                    speciesObject = species;
                    break;
                }
            }
        }
        return speciesObject;
    },

    /*****************/
    /*****************/
    /*****************/
    /*****************/
    /** API METHODS **/
    /*****************/
    setSpeciesByTaxonomy: function (taxonomyCode) {
        var species = this._getSpeciesByTaxonomy(taxonomyCode);
        if (species != null) {
            this._speciesChangeHandler({species: species});
        } else {
            console.log("Species taxonomy not found on availableSpecies.")
        }
    },
    setRegion: function (region, taxonomy) {
        if(taxonomy != null){
            var species = this._getSpeciesByTaxonomy(taxonomy);
            this._updateSpecies(species);
        }
        return this._regionChangeHandler({region: new Region(region)});
    },
    moveRegion: function (disp) {
        this.region.start += disp;
        this.region.end += disp;
        this.trigger('region:move', {region: this.region, disp: -disp, sender: this});
    },
    setWidth: function (width) {
        this.trigger('width:change', {width: width});
    },
    setZoom: function (zoom) {
        zoom = Math.min(100, zoom);
        zoom = Math.max(0, zoom);
        this.zoom = zoom;
        this.region.load(this._calculateRegionByZoom(zoom));
        this.setRegion(this.region);
    },
    increaseZoom: function (zoomToIncrease) {
        var zoom = this.zoom + zoomToIncrease;
        this.setZoom(zoom);
    },
    /*****************/
    /*****************/
    getSVGCanvasWidth: function () {
        return this.width - this.trackPanelScrollWidth - this.sidePanelWidth;
    },
    /*****************/
    /*****************/
    /*****************/







    mark: function (args) {
        var attrName = args.attrName || 'feature_id';
        var cssClass = args.class || 'ocb-feature-mark';
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
            svgCanvasWidthOffset: this.trackPanelScrollWidth + this.sidePanelWidth
        };
        _.extend(this.navigationBar, config);
        navigationBar.render(this.getNavigationPanelId());
    },

    toggleAutoHeight: function (bool) {
        this.trackListPanel.toggleAutoHeight(bool);
        this.overviewTrackListPanel.toggleAutoHeight(bool);
    },
    updateHeight: function () {
        this.trackListPanel.updateHeight();
        this.overviewTrackListPanel.updateHeight();
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
        this.overviewTrackListPanel.setVisible(bool);
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
    addOverviewTrack: function (track) {
        this.overviewTrackListPanel.addTrack(track);
    },

    addTrack: function (track) {
        this.trackListPanel.addTrack(track);
    },

    getTrackById: function (trackId) {
        return this.trackListPanel.getTrackById(trackId);
    },

    removeTrack: function (track) {
        return this.trackListPanel.removeTrack(track);
    },

    restoreTrack: function (track, index) {
        return this.trackListPanel.restoreTrack(track, index);
    },

    setTrackIndex: function (track, newIndex) {
        return this.trackListPanel.setTrackIndex(track, newIndex);
    },

    scrollToTrack: function (track) {
        return this.trackListPanel.scrollToTrack(track);
    },

    showTrack: function (track) {
        this.trackListPanel.showTrack(track);
    },

    hideTrack: function (track) {
        this.trackListPanel.hideTrack(track);
    },
    containsTrack: function (track) {
        return this.trackListPanel.containsTrack(track);
    },

    // TODO - DEPRECATED
    checkRenderedTrack: function (trackId) {
        console.log('DEPRECATED METHOD')
        console.log(this.checkRenderedTrack);
        this.trackExists(trackId);
    }
};


