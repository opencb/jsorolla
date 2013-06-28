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
    this.border = true;
    this.resizable = true;
    this.sidePanel = true;//enable or disable sidePanel at construction
    this.trackPanelScrollWidth = 18;
    this.availableSpecies = {
        "text": "Species",
        "items": [
            {
                "text": "Vertebrates",
                "items": [
                    {"text": "Homo sapiens", "assembly": "GRCh37.p10", "region": {"chromosome": "13", "start": 32889611, "end": 32889611}, "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "Y", "MT"], "url": "ftp://ftp.ensembl.org/pub/release-71/"},
                    {"text": "Mus musculus", "assembly": "GRCm38.p1", "region":{"chromosome":"1","start":18422009,"end":18422009}, "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "X", "Y", "MT"], "url": "ftp://ftp.ensembl.org/pub/release-71/"}
                ]
            }
        ]
    };
    this.species = this.availableSpecies.items[0].items[0];
    this.zoom = 100;

    //set instantiation args, must be last
    _.extend(this, args);

    this.width;
    this.height;
    this.sidePanelWidth = (this.sidePanel) ? 25 : 0;

    console.log(this.targetId);
    console.log(this.id);

    //events attachments
    this.on(this.handlers);

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
        console.log("Initializing GenomeViewer structure.");
        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="genome-viewer"></div>')[0];
        $(this.targetDiv).append(this.div);

        if(this.border){
            var border = (Utils.isString(this.border)) ? this.border : '1px solid lightgray';
            $(this.div).css({border:border});
        }


        this.setWidth($(this.div).width());

        this._recalculateZoom();

        Utils.setMinRegion(this.region, this.getSVGCanvasWidth());


        $(this.div).append('<div id="gv-navigation-panel"></div>');
        $(this.div).append('<div id="gv-center-panel" style="position:relative"></div>');


        this.sidebarDiv = $('<div id="gv-sidebar-panel" style="position:absolute; z-index:50;right:0px;height:100%"></div>')[0];

        $('#gv-center-panel').append(this.sidebarDiv);
        $('#gv-center-panel').append('<div id="gv-main-panel" style="z-index:1"></div>');

        $('#gv-main-panel').append('<div id="gv-karyotype-panel"></div>');
        $('#gv-main-panel').append('<div id="gv-chromosome-panel"></div>');
        $('#gv-main-panel').append('<div id="gv-region-panel"></div>');
        $('#gv-main-panel').append('<div id="gv-tracks-panel"></div>');


        $('#genome-viewer').append('<div id="gv-statusbar-panel"></div>');

        this.rendered = true;
    },
    getSidebarId : function(){
        return $(this.sidebarDiv).attr('id');
    },
    setWidth: function (width) {
        this.width = width;
        this._recalculateZoom();
        this.trigger('width:change', {width: this.width, sender: this});
//        this.region.load(this._calculateRegionByWidth());
//        this.trigger('region:change', {region: this.region, sender: this});
    },
    getSVGCanvasWidth: function () {
        return $(this.div).width() - this.trackPanelScrollWidth - this.sidePanelWidth;
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

    draw: function () {
        if (!this.rendered) {
            console.info('Genome Viewer is not rendered yet');
            return;
        }
        var _this = this;

        // Resize
        if(this.resizable){
            $(window).resize(function (event) {
                if(event.target == window){
                    if(!_this.resizing){//avoid multiple resize events
                        _this.resizing = true;
                        _this.setWidth($(_this.div).width());
                        setTimeout(function () {
                            _this.resizing = false;
                        }, 400);
                    }
                }
            });
            $(this.targetDiv).resizable({
                handles: 'e, s',
                ghost: true,
                stop: function( event, ui ) {
                    _this.setWidth($(_this.targetDiv).width());
                }
            });
        }

        /* Navigation Bar */
        this.navigationBar = this._createNavigationBar('gv-navigation-panel');

        /*karyotype Panel*/
        this.karyotypePanel = this._drawKaryotypePanel('gv-karyotype-panel');

        /* Chromosome Panel */
        this.chromosomePanel = this._drawChromosomePanel('gv-chromosome-panel');

        /* Region Panel, is a TrackListPanel Class */
        this.regionOverviewPanel = this._createRegionOverviewPanel('gv-region-panel');

        /*TrackList Panel*/
        this.trackListPanel = this._createTrackListPanel('gv-tracks-panel');

        /*Status Bar*/
        this.statusBar = this._createStatusBar('gv-statusbar-panel');


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
                'fullscreen:change': function (event) {
                    if (event.fullscreen) {
                        $(_this.div).css({width:screen.width});
                        Utils.launchFullScreen(_this.div);
                    } else {
                        $(_this.div).css({width:'auto'});
                        Utils.cancelFullscreen();//no need to pass the dom object;
                    }
                }
            }
        });

        this.on('region:change region:move', function (event) {
            if (event.sender != navigationBar) {
                _this.navigationBar.setRegion(event.region);
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
            region: this.region,
            handlers: {
                'region:change': function (event) {
                    event.sender = {};
                    Utils.setMinRegion(event.region, _this.getSVGCanvasWidth())
                    _this.trigger('region:change', event);
                },
                'region:move': function (event) {
                    _this.trigger('region:move', event);
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

        var gene = new FeatureTrack({
            targetId: null,
            id: 2,
            title: 'Gene',
            histogramZoom: 10,
            labelZoom: 20,
            height: 100,
            visibleRange: {start: 0, end: 100},
            titleVisibility: 'hidden',
            featureTypes: FEATURE_TYPES,

            renderer: new FeatureRenderer({
                label: function (f) {
                    var name = (f.name != null) ? f.name : f.id;
                    var str = "";
                    str += (f.strand < 0 || f.strand == '-') ? "<" : "";
                    str += " " + name + " ";
                    str += (f.strand > 0 || f.strand == '+') ? ">" : "";
                    if (f.biotype != null && f.biotype != '') {
                        str += " [" + f.biotype + "]";
                    }
                    return str;
                },
                tooltipTitle: function (f) {
                    var name = (f.name != null) ? f.name : f.id;
                    return FEATURE_TYPES.formatTitle(f.featureType) +
                        ' - <span class="ok">' + name + '</span>';
                },
                tooltipText: function (f) {
                    var color = GENE_BIOTYPE_COLORS[f.biotype];
                    return    'id:&nbsp;<span class="ssel">' + f.id + '</span><br>' +
                        'biotype:&nbsp;<span class="emph" style="color:' + color + ';">' + f.biotype + '</span><br>' +
                        FEATURE_TYPES.getTipCommons(f) +
                        'source:&nbsp;<span class="ssel">' + f.source + '</span><br><br>' +
                        'description:&nbsp;<span class="emph">' + f.description + '</span><br>';
                },
                color: function (f) {
                    return GENE_BIOTYPE_COLORS[f.biotype];
                },
                infoWidgetId: "id",
                height: 4,
                histogramColor: "lightblue",
                handlers: {
                    'feature:click': function (event) {
                        new GeneInfoWidget(null, _this.species).draw(event);
                    }
                }
            }),

            dataAdapter: new CellBaseAdapter({
                category: "genomic",
                subCategory: "region",
                resource: "gene",
                species: this.species,
                featureCache: {
                    gzip: true,
                    chunkSize: 50000
                }
            })
        });
        trackListPanel.addTrack(gene);

        return  trackListPanel;
    },

    _createTrackListPanel: function (targetId) {
        var _this = this;
        var trackListPanel = new TrackListPanel({
            targetId: targetId,
            autoRender: true,
            width: this.width - this.sidePanelWidth,
            zoom: this.zoom,
            title: 'Detailed information',
            region: this.region,
            handlers: {
                'region:change': function (event) {
                    event.sender = {};
                    Utils.setMinRegion(event.region, _this.getSVGCanvasWidth());
                    _this.trigger('region:change', event);
                },
                'region:move': function (event) {
                    _this.trigger('region:move', event);
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

        return  statusBar;
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
    }
};


GenomeViewer.prototype.addTrack = function (trackData, args) {
    this.trackListPanel.addTrack(trackData, args);
};

GenomeViewer.prototype.getTrackSvgById = function (trackId) {
    return this.trackListPanel.getTrackSvgById(trackId);
};

GenomeViewer.prototype.removeTrack = function (trackId) {
    return this.trackListPanel.removeTrack(trackId);
};

GenomeViewer.prototype.restoreTrack = function (trackSvg, index) {
    return this.trackListPanel.restoreTrack(trackSvg, index);
};

GenomeViewer.prototype.setTrackIndex = function (trackId, newIndex) {
    return this.trackListPanel.setTrackIndex(trackId, newIndex);
};

GenomeViewer.prototype.scrollToTrack = function (trackId) {
    return this.trackListPanel.scrollToTrack(trackId);
};

GenomeViewer.prototype.showTrack = function (trackId) {
    this.trackListPanel._showTrack(trackId);
};

GenomeViewer.prototype.hideTrack = function (trackId) {
    this.trackListPanel._hideTrack(trackId);
};

GenomeViewer.prototype.checkRenderedTrack = function (trackId) {
    if (this.trackListPanel.swapHash[trackId]) {
        return true;
    }
    return false;
};


//XXX BOTTOM BAR

GenomeViewer.prototype._getBottomBar = function () {
    var geneLegendPanel = new LegendPanel({title: 'Gene legend'});
    var snpLegendPanel = new LegendPanel({title: 'SNP legend'});

//	var scaleLabel = Ext.create('Ext.draw.Component', {
//		id:this.id+"scaleLabel",
//        width: 100,
//        height: 20,
//        items:[
//            {type: 'text',text: 'Scale number',fill: '#000000',x: 10,y: 9,width: 5, height: 20},
//            {type: 'rect',fill: '#000000',x: 0,y: 0,width: 2, height: 20},
//			{type: 'rect',fill: '#000000',x: 2,y: 12, width: 100,height: 3},
//			{type: 'rect',fill: '#000000',x: 101,y: 0, width: 2,height: 20}
//		]
//	});
//	scale.surface.items.items[0].setAttributes({text:'num'},true);

    var versionLabel = Ext.create('Ext.toolbar.TextItem', {
        id: this.id + "versionLabel",
        text: ''
    });

    var mouseLabel = Ext.create('Ext.toolbar.TextItem', {
        id: this.id + "mouseLabel",
        width: 110,
        text: '<span class="ssel">Position: -</span>'
    });
    var mouseNucleotidLabel = Ext.create('Ext.toolbar.TextItem', {
        id: this.id + "mouseNucleotidLabel",
        width: 10,
        text: '-'
    });
    var windowSize = Ext.create('Ext.toolbar.TextItem', {
        id: this.id + "windowSize",
        width: 150,
        text: '<span class="emph">Window size: -</span>'
    });

    var taskbar = Ext.create('Ext.toolbar.Toolbar', {
        id: this.id + 'uxTaskbar',
        winMgr: new Ext.ZIndexManager(),
        enableOverflow: true,
        cls: 'bio-hiddenbar',
        height: 28,
        flex: 1
    });

    var legendBar = Ext.create('Ext.toolbar.Toolbar', {
        id: this.id + 'legendBar',
        cls: 'bio-hiddenbar',
        width: 610,
        height: 28,
        items: [/*scaleLabel, */
            '-', mouseLabel, mouseNucleotidLabel, windowSize,
            geneLegendPanel.getButton(GENE_BIOTYPE_COLORS),
            snpLegendPanel.getButton(SNP_BIOTYPE_COLORS),
            '->', versionLabel]
    });

    var bottomBar = Ext.create('Ext.container.Container', {
        id: this.id + 'bottomBar',
        layout: 'hbox',
        region: "south",
        cls: "bio-botbar unselectable",
        height: 30,
        border: true,
        items: [taskbar, legendBar]
    });
    return bottomBar;
};
//BOTTOM BAR


GenomeViewer.prototype.openListWidget = function (args) {
    var _this = this;

    console.log(args.query)

    var cellBaseManager = new CellBaseManager(this.species);
    cellBaseManager.success.addEventListener(function (evt, data) {
        if (data.result[0].length > 1) {
            var genomicListWidget = new GenomicListWidget(_this.species, {title: args.title, gridFields: args.gridField, viewer: _this});
            genomicListWidget.draw(data);

            genomicListWidget.onSelected.addEventListener(function (evt, feature) {
//			console.log(feature);
                if (feature != null && feature.chromosome != null) {
                    if (_this.chromosome != feature.chromosome || _this.position != feature.start) {
                        _this.onRegionChange.notify({sender: "", chromosome: feature.chromosome, position: feature.start});
                    }
                }
            });

            genomicListWidget.onTrackAddAction.addEventListener(function (evt, event) {
                var track = new TrackData(event.fileName, {
                    adapter: event.adapter
                });
                _this.trackSvgLayout.addTrack(track, {
                    id: event.fileName,
                    featuresRender: "MultiFeatureRender",
//					histogramZoom:80,
                    height: 150,
                    visibleRange: {start: 0, end: 100},
                    featureTypes: FEATURE_TYPES
                });
            });
        } else {
            var feature = data.result[0][0];
            if (feature != null) {
                _this.region.load(feature);
                _this.onRegionChange.notify({sender: ""});
            } else {
                Ext.example.msg('Feature <span class="ssel">' + args.query + '</span> not found', "");
            }
        }
    });
    cellBaseManager.get(args.category, args.subcategory, args.query, args.resource, args.params);
};
GenomeViewer.prototype.openGeneListWidget = function (name) {
    this.openListWidget({
        category: "feature",
        subcategory: "id",
        query: name.toString(),
        resource: "gene",
        title: "Gene List"
    });
};

GenomeViewer.prototype.openTranscriptListWidget = function (name) {
    this.openListWidget({
        category: "feature",
        subcategory: "transcript",
        query: name.toString(),
        resource: "info",
        title: "Transcript List",
        gridField: ["externalName", "stableId", "biotype", "chromosome", "start", "end", "strand", "description"]
    });
};

GenomeViewer.prototype.openExonListWidget = function (name) {
    this.openListWidget({
        category: "feature",
        subcategory: "exon",
        query: name.toString(),
        resource: "info",
        title: "Exon List",
        gridField: ["stableId", "chromosome", "start", "end", "strand"]
    });
};

GenomeViewer.prototype.openSNPListWidget = function (name) {
    this.openListWidget({
        category: "feature",
        subcategory: "id",
        query: name.toString(),
        resource: "snp",
        title: "SNP List",
        gridField: ["name", "variantAlleles", "ancestralAllele", "mapWeight", "position", "sequence", "chromosome", "start", "end"]
    });
};

GenomeViewer.prototype.openGOListWidget = function (name) {
    this.openListWidget({
        category: "feature",
        subcategory: "id",
        query: name.toString(),
        resource: "gene",
        title: "Gene List by GO"
    });
};
