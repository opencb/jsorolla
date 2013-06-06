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

function GenomeViewer(targetId, species, args) {

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    var _this = this;

    this.id = Utils.genId("GenomeViewer");

    //set default args
    this.targetId = targetId;
    this.menuBar;
    this.sidePanelWidth = 26;
    this.width = $(document).width() - this.sidePanelWidth;
    this.height = $(document).height();

    this.species = "hsapiens";
    this.speciesName = "Homo sapiens";
    this.zoom = 100;

    this.confPanelHidden = false;
    this.regionPanelHidden = false;

    this.resizable = true;


    //set instantiation args, must be last
    _.extend(this, args);


    console.log(this.width + "x" + this.height);
    console.log(this.targetId);
    console.log(this.id);


    this.zoom = this._calculateZoomByRegion();


    this.initialize();

//  this.popularSpecies = args.popularSpecies;
//	his.toolbar = args.toolbar;
//	this.confPanelHidden = args.confPanelHidden;
//	this.setSpeciesMenu(args.availableSpecies, this.popularSpecies);
//	this.regionPanelHidden = args.regionPanelHidden;


//	//Events i send
//	this.onSpeciesChange = new Event();
//	this.onRegionChange = new Event();
//	this.afterLocationChange = new Event();
//	this.afterRender = new Event();

//	//Events i listen
//	this.onRegionChange.addEventListener(function(sender,data){
//		_this.setRegion(data);
//		if(data.sender != "trackSvgLayout"){
//			Ext.getCmp(_this.id+"regionHistory").add({
//				xtype:'box',padding:"2 5 2 3",border:1,
//				html:_this.region.toString(),
//				s:_this.region.toString(),
//				listeners:{
//				afterrender:function(){
//						var s = this.s;
//						this.getEl().addClsOnOver("encima");
//						this.getEl().addCls("whiteborder");
//						this.getEl().on("click",function(){
//							_this.region.parse(s);
//							_this.setRegion({sender:"regionHistory"});
//						});
//					}
//				}
//			});
//		}
//	});

    //Events i propagate
//	this.onSvgRemoveTrack = null;//assigned later, the component must exist

}

GenomeViewer.prototype = {

    initialize: function () {
        console.debug("Initializing GenomeViewer structure.");

        this.setWidth($('#' + this.targetId).width());

        Utils.setMinRegion(this.region, (this.width - 18));

        $('#' + this.targetId).append('<div id="genome-viewer" style=""></div>');


        $('#genome-viewer').append('<div id="gv-navigation-panel" style=""></div>');
        $('#genome-viewer').append('<div id="gv-center-panel" style=""></div>');


        $('#gv-center-panel').append('<div id="gv-sidebar-panel" style="position:absolute; right:0; z-index:50;width:0px;height:300px"></div>');
        $('#gv-center-panel').append('<div id="gv-main-panel" style="z-index:1"></div>');
        $('#gv-sidebar-panel').click(function () {
            $(this).css({width: 200})
        });

        $('#gv-main-panel').append('<div id="gv-karyotype-panel" style=""></div>');
        $('#gv-main-panel').append('<div id="gv-chromosome-panel" style=""></div>');
        $('#gv-main-panel').append('<div id="gv-region-panel" style=""></div>');
        $('#gv-main-panel').append('<div id="gv-tracks-panel" style=""></div>');


        $('#genome-viewer').append('<div id="gv-statusbar-panel" class="title">statusbar...</div>');

    },
    setWidth: function (width) {
        this.width = width;
        this.trigger('width:change', {width: this.width, sender: this});
        this.region.load(this._calculateRegionByWidth());
        this.trigger('region:change', {region: this.region, sender: this});
    },
    _setRegion: function (region) {
        this.region.load(region);
        this.zoom = this._calculateZoomByRegion();
    },
    setRegion : function(region){
        this.region.load(region);
        Utils.setMinRegion(this.region, (this.width - 18));
        this.trigger('region:change', {region: this.region, sender: this});
    },
//    setRegion2: function (region) {
//        this.region.load(region);
//        Utils.setMinRegion(this.region, (this.width - 18))
//        // tshi.setZooms(zoom)
//        if (region != null) {
////            Ext.getCmp(this.id + "chromosomeMenuButton").setText("Chromosome " + this.region.chromosome);
////            Ext.getCmp(this.id + "chromosomePanel").setTitle("Chromosome " + this.region.chromosome);
////            Ext.getCmp(this.id + "speciesMenuButton").setText(this.speciesName);
////            Ext.getCmp(this.id + 'tbCoordinate').setValue(this.region.toString());
////            this._updateChrStore();
//
//            this.trigger('region:change', {sender: this, region: this.region});
//
//            //set zoom
//            this.zoom = this._calculateZoomByRegion();
//
//
////            this.trackSvgLayout.setRegion({});
////            this.trackSvgLayoutOverview.setRegion({});
////            this.chromosomePanel.setRegion({});
////            this.karyotypeWidget.setRegion({});
////            Ext.getCmp(this.id + "container").setLoading();
//        }
//    },
//    setZoom2: function (zoom) {
//        this.zoom = zoom;
//        this._getZoomSlider().setValue(zoom);
//
//        this.trigger('zoom:change', {zoom: this.zoom, sender: this});
//
//        //set region
//        this.region.load(this._calculateRegionByZoom());
//        // region = calculateRegionByZoom();
////        this.region.load(region);
////        this.trigger('zoom:change', {sender: this, region: this.region});
//    },
//    _setZoom: function (zoom) {
//        this.zoom = zoom;
//        this.region.load(this._calculateRegionByZoom());
////        this.trigger('region:change', {region: this.region, sender: this});
//    },

    _calculateRegionByZoom: function () {
//        var zoomBaseLength = parseInt((this.width-18) / Utils.getPixelBaseByZoom(this.zoom));
//        var centerPosition = this.region.center();
//        var aux = Math.ceil((zoomBaseLength / 2) - 1);
//        var start = Math.floor(centerPosition - aux);
//        var end = Math.floor(centerPosition + aux);
//        return {start: start, end: end};
    },
    _calculateRegionByWidth: function () {
        var zoomBaseLength = parseInt((this.width-18) / Utils.getPixelBaseByZoom(this.zoom));
        var regionCenter = this.region.center();
        var regionHalf = Math.ceil((zoomBaseLength / 2) - 1);
        return {
            start: Math.floor(regionCenter - regionHalf),
            end: Math.floor(regionCenter + regionHalf)
        }
    },
    _calculateZoomByRegion: function () {
        return Math.round(Utils.getZoomByPixelBase(((this.width-18) / this.region.length())));
    },

    draw: function () {
        var _this = this;

        // Resize
        $(window).smartresize(function (event) {
            if (_this.resizable == true) {
                _this.setWidth($('#' + _this.targetId).width());
            }
        });

        /* Navigation Bar */
        this.navigationBar = this._createNavigationBar('gv-navigation-panel');

        /* karyotype Panel */
        this.karyotypePanel = this._drawKaryotypePanel();

        /* Chromosome Panel */
        this.chromosomePanel = this._drawChromosomePanel();

        /* Region Panel, is a TrackListPanel Class */
        this.regionOverviewPanel = this._createRegionOverviewPanel('gv-region-panel');

        /*TrackList Panel*/
        this.trackListPanel = this._createTrackListPanel('gv-tracks-panel');


        this.on('region:change', function (event) {
            if (event.sender != _this) {
                _this._setRegion(event.region);
            }
            /*Region change log*/
            //console.log(event.sender)
        });
//        this.on('zoom:change', function(event) {
//            if (event.sender != _this) {
//                _this._setZoom(event.zoom);
//            }
//        });
    },

    /**/
    /*Components*/
    /**/

    _createNavigationBar: function (targetId) {
        var _this = this;
        var navigationBar = new NavigationBar(targetId, {
            species: this.species,
            region: this.region,
            width: this.width,
            zoom: this.zoom
        });

        navigationBar.on('region:change', function (event) {
            Utils.setMinRegion(event.region, (_this.width - 18))
            _this.trigger('region:change', event);
        });

        this.on('region:change', function (event) {
            if (event.sender != navigationBar) {
                _this.navigationBar.setRegion(event.region);
            }
        });
        _this.on('width:change', function (event) {
            _this.navigationBar.setWidth(event.width);
        });
//        navigationBar.on('zoom:change', function (event) {
//            _this.trigger('zoom:change', event);
//        });
//
//        this.on('zoom:change', function (event) {
//            if (event.sender != navigationBar) {
//                _this.navigationBar.setZoom(event.zoom);
//            }
//        });

        navigationBar.on('karyotype-button:change', function (event) {
            if (event.selected) {
                _this.karyotypePanel.show();
            } else {
                _this.karyotypePanel.hide();
            }
        });

        navigationBar.on('chromosome-button:change', function (event) {
            if (event.selected) {
                _this.chromosomePanel.show();
            } else {
                _this.chromosomePanel.hide();
            }
        });

        navigationBar.on('region-button:change', function (event) {
            if (event.selected) {
                _this.regionOverviewPanel.show();
            } else {
                _this.regionOverviewPanel.hide();
            }
        });
        return navigationBar;
    },

    _drawKaryotypePanel: function () {
        var _this = this;

        this.karyotypePanel = new KaryotypePanel('gv-karyotype-panel', {
            width: this.width,
            height: 125,
            species: this.species,
            title:'Karyotype',
            region: this.region
        });

        this.karyotypePanel.on('region:change', function (event) {
            Utils.setMinRegion(event.region, (_this.width - 18))
            _this.trigger('region:change', event);
        });

        this.on('region:change', function (event) {
            if (event.sender != _this.karyotypePanel) {
                _this.karyotypePanel.setRegion(event.region);
            }
        });

        this.on('width:change', function (event) {
            _this.karyotypePanel.setWidth(event.width);
            _this.karyotypePanel.setWidth(event.width);
        });

        this.karyotypePanel.draw();

        return this.karyotypePanel;
    },

    _drawChromosomePanel: function () {
        var _this = this;


        this.chromosomePanel = new ChromosomePanel('gv-chromosome-panel', {
            width: this.width,
            height: 65,
            species: this.species,
            title:'Chromosome',
            region: this.region
        });

        this.chromosomePanel.on('region:change', function (event) {
            _this.trigger('region:change', event);
        });

        this.on('region:change', function (event) {
            if (event.sender != _this.chromosomePanel) {
                _this.chromosomePanel.setRegion(event.region);
            }
        });

        this.on('width:change', function (event) {
            _this.chromosomePanel.setWidth(event.width);
            _this.chromosomePanel.setWidth(event.width);
        });

        this.chromosomePanel.drawChromosome();

//        var panel = Ext.create('Ext.panel.Panel', {
//            id: this.id + "chromosomePanel",
//            renderTo: 'gv-chromosome-panel',
//            height: 95,
//            title: 'Chromosome',
//            border: true,
//            margin: '0 0 1 0',
//            //cls:'border-bot panel-border-top',
//            html: '<div id="' + this.id + 'chromosomeSvg" style="margin-top:2px"></div>',
//            listeners: {
//                afterrender: function () {
//                    var div = $('#' + _this.id + "chromosomeSvg")[0];
////				_this.chromosomeWidget = new ChromosomeWidget(div,{
//
//                }
//            }
//        });
        return this.chromosomePanel;
    },

    _createRegionOverviewPanel: function (targetId) {
        var _this = this;
        var trackListPanel = new TrackListPanel(targetId, {
            width: this.width,
            zoom: this.zoom,
//        height:200,
            title:'Region overview',
            region: this.region
        });
        var gene = new FeatureTrack({
            targetId:null,
            id:2,
            title:'Gene',
            histogramZoom:10,
            labelZoom:20,
            height:100,
            visibleRange:{start:0,end:100},
            titleVisibility:'hidden',
            featureTypes:FEATURE_TYPES,

            renderer:new FeatureRenderer(),

            dataAdapter:new CellBaseAdapter({
                category: "genomic",
                subCategory: "region",
                resource: "gene",
                species: this.species,
                featureCache:{
                    gzip: true,
                    chunkSize:50000
                }
            })
        });
        trackListPanel.addTrack(gene);

        trackListPanel.on('region:move', function (event) {
            _this.trigger('region:change', event);
        });
        this.on('region:change', function (event) {
            if (event.sender != trackListPanel) {
                trackListPanel.setRegion(event.region);
            }
        });

//        trackListPanel.on('zoom:change', function (event) {
//            _this.trigger('zoom:change', event);
//        });
//        this.on('zoom:change', function (event) {
//            if (event.sender != trackListPanel) {
//                trackListPanel.setZoom(event.zoom);
//            }
//        });

        this.on('width:change', function (event) {
            trackListPanel.setWidth(event.width);
        });
        return  trackListPanel;
    },

    _createTrackListPanel: function (targetId) {
        var _this = this;
        var trackListPanel = new TrackListPanel(targetId, {
            width: this.width,
            zoom: this.zoom,
//        height:200,
            title:'Detailed information',
            region: this.region
        });

        trackListPanel.on('region:move', function (event) {
            _this.trigger('region:change', event);
        });
        this.on('region:change', function (event) {
            if (event.sender != trackListPanel) {
                trackListPanel.setRegion(event.region);
            }
        });

//        trackListPanel.on('zoom:change', function (event) {
//            _this.trigger('zoom:change', event);
//        });
//        this.on('zoom:change', function (event) {
//            if (event.sender != trackListPanel) {
//                trackListPanel.setZoom(event.zoom);
//            }
//        });

        this.on('width:change', function (event) {
            trackListPanel.setWidth(event.width);
        });


        return  trackListPanel;
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
        cls: "bio-botbar x-unselectable",
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
