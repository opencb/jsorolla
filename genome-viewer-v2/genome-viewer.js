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

	var _this=this;
	this.id = "GenomeViewer"+ Math.round(Math.random()*10000);
	this.menuBar = null;

	this.sidePanelWidth = 26;
	// If not provided on instatiation
	this.width =  $(document).width()-this.sidePanelWidth;
	this.height = $(document).height();
	this.targetId=null;


	//Default values
	this.species="hsapiens";
	this.speciesName="Homo sapiens";
	this.increment = 3;
	this.zoom=100;

	this.confPanelHidden = false;
	this.regionPanelHidden = false;

	//Setting paramaters
	if (targetId != null){
		this.targetId=targetId;
	}
	if (species != null) {
        console.log("In genome-viewer: "+species.text)
		this.species = Utils.getSpeciesCode(species.text);
		this.speciesName = species.text + ' ' + species.assembly;
	}
	if (args != null){
		if(args.toolbar != null){
			this.toolbar = args.toolbar;
		}
		if (args.width != null) {
			this.width = args.width-this.sidePanelWidth;
		}
		if (args.height != null) {
			this.height = args.height;
		}
        if (args.popularSpecies != null) {
            this.popularSpecies = args.popularSpecies;
        }
		if (args.availableSpecies != null) {
			this.setSpeciesMenu(args.availableSpecies, this.popularSpecies);
		}
		if (args.zoom != null) {//evaluate zoom after
			this.zoom = args.zoom;
		}
		if (args.region != null) {
            console.log("In genome-viewer: "+args.region)
			this.region = args.region;
		}else{
			this.region = new Region(species.region);
		}
		if (args.confPanelHidden != null) {
			this.confPanelHidden = args.confPanelHidden;
		}
		if (args.regionPanelHidden != null) {
			this.regionPanelHidden = args.regionPanelHidden;
		}
		if (args.region != null && args.region.url != null) {
			this._calculateZoomByRegion();
		}else{
			this._calculateRegionByZoom();
			this._calculateZoomByRegion();
		}
	}

	

	//Events i send
	this.onSpeciesChange = new Event();
	this.onRegionChange = new Event();
	this.afterLocationChange = new Event();
	this.afterRender = new Event();
	
	//Events i listen
	this.onRegionChange.addEventListener(function(sender,data){
		_this.setRegion(data);
		if(data.sender != "trackSvgLayout"){
			Ext.getCmp(_this.id+"regionHistory").add({
				xtype:'box',padding:"2 5 2 3",border:1,
				html:_this.region.toString(),
				s:_this.region.toString(),
				listeners:{
				afterrender:function(){
						var s = this.s;
						this.getEl().addClsOnOver("encima");
						this.getEl().addCls("whiteborder");
						this.getEl().on("click",function(){
							_this.region.parse(s);
							_this.setRegion({sender:"regionHistory"});
						});
					}
				}
			});
		}
	});
	
	//Events i propagate
	this.onSvgRemoveTrack = null;//assigned later, the component must exist
	
	// useful logs
	console.log(this.width+"x"+this.height);
	console.log(this.targetId);
	console.log(this.id);

    this.initialize();
}

GenomeViewer.prototype = {

    initialize: function(){
        console.debug("Initializing GenomeViewer structure.");

        $('#' + this.targetId).append('<div id="genome-viewer" style=""></div>');
        this.width = $('#'+this.targetId).width();


        $('#genome-viewer').append('<div id="gv-navigation-panel" style="background-color: greenyellow;"></div>');
        $('#genome-viewer').append('<div id="gv-center-panel" style=""></div>');


        $('#gv-center-panel').append('<div id="gv-sidebar-panel" style="background-color: yellow; position:absolute; right:0; z-index:50;width:20px;height:300px"></div>');
        $('#gv-center-panel').append('<div id="gv-main-panel" style="z-index:1"></div>');
        $('#gv-sidebar-panel').click(function(){
            $(this).css({width:200})
        });

        $('#gv-main-panel').append('<div id="gv-karyotype-panel" style=""></div>');
        $('#gv-main-panel').append('<div id="gv-chromosome-panel" style=""></div>');
        $('#gv-main-panel').append('<div id="gv-region-panel" style=""></div>');
        $('#gv-main-panel').append('<div id="gv-tracks-panel" style=""></div>');



        $('#genome-viewer').append('<div id="gv-statusbar-panel" style="background-color: slateblue;">statusbar</div>');
//        $('#' + this.targetId).disableTextSelect();

    },
    setRegion2: function(region) {
        this.region.load(region);
        this._calculateZoomByRegion();
        // tshi.setZooms(zoom)
        if (region != null) {
//            Ext.getCmp(this.id + "chromosomeMenuButton").setText("Chromosome " + this.region.chromosome);
//            Ext.getCmp(this.id + "chromosomePanel").setTitle("Chromosome " + this.region.chromosome);
//            Ext.getCmp(this.id + "speciesMenuButton").setText(this.speciesName);
//            Ext.getCmp(this.id + 'tbCoordinate').setValue(this.region.toString());
            this._updateChrStore();

            this.trigger('region:change', {sender: this, region: this.region});

//            this.trackSvgLayout.setRegion({});
//            this.trackSvgLayoutOverview.setRegion({});
//            this.chromosomePanel.setRegion({});
//            this.karyotypeWidget.setRegion({});
//            Ext.getCmp(this.id + "container").setLoading();
        }
    },
    setZoom2: function(zoom) {
        this.zoom = zoom;
        this._getZoomSlider().setValue(zoom);
        this.trigger('zoom:change', {sender: this, region: this.region});

        // region = calculateRegionByZoom();
        this.region.load(region);
        this.trigger('region:change', {sender: this, region: this.region});
    }
};

GenomeViewer.prototype.draw = function(){
    var _this = this;

    /*Navigation Bar*/
    this.navigationBar = new NavigationBar('gv-navigation-panel', {
        species: this.species,
        region: this.region
    });

    this.navigationBar.on('region:change', function(event){
        this.trigger('region:change', event);
    });

    this.on('region:change', function(event) {
        if(event.sender != _this.navigationBar) {
            _this.navigationBar.setRegion(event.region);
        }
    });

    /*Chromosome Panel*/
    this._drawChromosomePanel();

    /*karyotype Panel*/


    /*TrackList Panel*/
    this.trackSvgLayout = new TrackListPanel('gv-tracks-panel',{
        width:_this.width-18,
//        height:200,
        region:this.region,
        genomeViewer:this
    });
    this.trackSvgLayout.on('region:move',function(event){
        _this.trigger('region:change', event);
    });
    this.on('region:change', function(event) {
        if(event.sender != _this.trackSvgLayout) {
            _this.trackSvgLayout.setRegion(event.region);
        }
    });


    /* debug*/
    /*Region change log*/
    this.on('region:change', function(event) {
        console.log(event.sender)
    });
};


GenomeViewer.prototype._drawChromosomePanel = function() {
    var _this = this;
    var panel =  Ext.create('Ext.panel.Panel', {
        id: this.id+"chromosomePanel",
        renderTo: 'gv-chromosome-panel',
        height : 95,
        title:'Chromosome',
        border:true,
        margin:'0 0 1 0',
        //cls:'border-bot panel-border-top',
        html: '<div id="'+this.id+'chromosomeSvg" style="margin-top:2px"></div>',
        listeners:{
            afterrender:function() {
                var div = $('#'+_this.id+"chromosomeSvg")[0];
//				_this.chromosomeWidget = new ChromosomeWidget(div,{
                _this.chromosomePanel = new ChromosomePanel(_this.id+"chromosomeSvg", {
                    width:_this.width,
                    height:65,
                    species:_this.species,
                    region:_this.region,
                    zoom:_this.zoom
                });

                _this.chromosomePanel.on('region:change', function(event){
                    _this.trigger('region:change', event);
                });

                _this.on('region:change', function(event) {
                    if(event.sender != _this.chromosomePanel) {
                        _this.chromosomePanel.setRegion(event.region);
                    }
                });

                _this.chromosomePanel.drawChromosome();
            }
        }
    });
    return panel;
};


/**/
/**/
/**/
/*OLD code*/
/**/
/**/

GenomeViewer.prototype.render = function(){
	var _this = this;
	var container = Ext.create('Ext.container.Container', {
		id:this.id+"container",
        renderTo: "gv-main-panel",
        width: this.width,
        height:this.height,
		cls:'x-unselectable',
		region:"center",
		flex:0,
		layout: { type: 'vbox',align: 'stretch'},
		region : 'center',
		margins : '0 0 0 0'
	});

	this.sideContainer = Ext.create('Ext.panel.Panel', {
		id: this.id+"sideContainer",
        renderTo: "gv-sidebar-panel",
		region: "east",
		title: "Configuration",
		collapsed:this.confPanelHidden,
		collapsible:true,
        collapseDirection: "right",
		titleCollapse:true,
		width: this.sidePanelWidth+260,
		layout: 'accordion',
        html: "hellooooo"
	});
	
//	var containerPort = Ext.create('Ext.container.Container', {
//		id:this.id+"containerPort",
//		renderTo:this.targetId,
//        width:this.width+this.sidePanelWidth,
//        height:this.height,
//		cls:'x-unselectable',
//		layout: { type: 'border'},
//		region : 'center',
//		margins : '0 0 0 0',
//		items:[container,this.sideContainer]
//	});
	//if(this.toolbar!=null){
		//containerPort.add(this.toolbar);
	//}
	//The last item is regionPanel
	//when all items are inserted afterRender is notified, tracks can be added now
	var tracksPanel = this._drawTracksPanel();
	var regionPanel = this._drawRegionPanel();
	var regionAndTrackRendered = 0;
	
	var createSvgLayout = function (){//there will be two instances of TrackSvgLayout, one for detailed information and other for Overview
		var divTop = $('#'+_this.id+"tracksSvgTop")[0];
		var divTrack = $('#'+_this.id+"tracksSvgTrack")[0];
		_this.trackSvgLayout = new TrackSvgLayout({top:divTop,track:divTrack},{
			width:_this.width-18,
			region:_this.region,
			genomeViewer:_this
		});
		
		_this.trackSvgLayout.onMove.addEventListener(function(sender,data){
			_this.onRegionChange.notify({sender:"trackSvgLayout"});
		});
		_this.trackSvgLayout.onMousePosition.addEventListener(function(sender,data){
			Ext.getCmp(_this.id+"mouseLabel").setText('<span class="ssel">Position: '+Utils.formatNumber(data.mousePos)+'</span>');
			$('#'+_this.id+"mouseLabel").qtip({content:'Mouse position',style:{width:95},position: {my:"bottom center",at:"top center"}});
			Ext.getCmp(_this.id+"mouseNucleotidLabel").setText(data.baseHtml);
		});
		Ext.getCmp(_this.id+"windowSize").setText('<span class="emph">'+_this.trackSvgLayout.windowSize+'</span>');
		_this.trackSvgLayout.onWindowSize.addEventListener(function(sender,data){
			Ext.getCmp(_this.id+"windowSize").setText('<span class="emph">'+data.windowSize+'</span>');
		});

		_this.trackSvgLayout.onReady.addEventListener(function(sender,data){
			Ext.getCmp(_this.id+"container").setLoading(false);
		});
		
		//propagate event to TrackSvgLayout
		_this.onSvgRemoveTrack = _this.trackSvgLayout.onSvgRemoveTrack;
		
		var divTop = $('#'+_this.id+"regionSvgTop")[0];
		var divTrack = $('#'+_this.id+"regionSvgTrack")[0];
		_this.trackSvgLayoutOverview = new TrackSvgLayout({top:divTop,track:divTrack},{
			width:_this.width-18,
			region:_this.region,
			zoomOffset:40,
			zoomMultiplier:8,
			genomeViewer:_this,
			parentLayout:_this.trackSvgLayout
		});
		_this.trackSvgLayoutOverview.onRegionSelect.addEventListener(function(sender,data){
			_this.onRegionChange.notify({sender:"trackSvgLayoutOverview"});
		});
		_this.afterRender.notify();
	};
	
	tracksPanel.on("afterrender", function(){
		regionAndTrackRendered++;
		if(regionAndTrackRendered>1){
			createSvgLayout();
		}
	});
	regionPanel.on("afterrender", function(){
		regionAndTrackRendered++;
		if(regionAndTrackRendered>1){
			createSvgLayout();
		}
	});
	
//	containerPort.insert(0, this._getNavigationBar());
//	containerPort.insert(1, this._getBottomBar());
	container.insert(0, this._drawKaryotypePanel().hide());//the good one
	//container.insert(1, this._drawKaryotypePanel());
//	container.insert(1, this._drawChromosomePanel());
	container.insert(2, tracksPanel);
	container.insert(2, regionPanel);//rendered after trackspanel but inserted with minor index

	Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.region.chromosome);
	Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.region.chromosome);
	Ext.getCmp(this.id+'tbCoordinate').setValue(this.region.toString());
};
GenomeViewer.prototype.setMenuBar = function(toolbar) {
	this.toolbar = toolbar;
};
GenomeViewer.prototype.addSidePanelItems = function(items) {
	this.sideContainer.insert(1,{
		title: 'Region history',
		bodyPadding:'10',
		id:this.id+"regionHistory"
	});
	if(items!=null){
		this.sideContainer.insert(0, items);
	}
};

GenomeViewer.prototype.setSize = function(width,height) {
	this.width = width-this.sidePanelWidth;
	this.trackSvgLayout.setWidth(this.width-18);
	this.trackSvgLayoutOverview.setWidth(this.width-18);
	this.chromosomeWidget.setWidth(this.width);
	this.karyotypeWidget.setWidth(this.width);
	Ext.getCmp(this.id+"containerPort").setSize(width,height);
};

GenomeViewer.prototype._calculateRegionByZoom = function() {
	var zoomBaseLength = parseInt(this.width/Utils.getPixelBaseByZoom(this.zoom));
	var centerPosition = this.region.center();
	var aux = Math.ceil((zoomBaseLength/2)-1);
	this.region.start = Math.floor(centerPosition-aux);
	this.region.end = Math.floor(centerPosition+aux);
};

GenomeViewer.prototype._calculateZoomByRegion = function() {
	this._getZoomSlider().suspendEvents();
	this.setZoom(Math.round(Utils.getZoomByPixelBase((this.width/this.region.length()))));
	this._getZoomSlider().resumeEvents();
};

GenomeViewer.prototype.setRegion = function(data) {
	switch(data.sender){
	case "setSpecies":
		this._calculateZoomByRegion();
		this.species = data.species;
		this.speciesName = data.text;
		Ext.example.msg('Species', this.speciesName+' selected.');
		Ext.getCmp(this.id+"speciesMenuButton").setText(this.speciesName);
		
		Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.region.chromosome);
		Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.region.chromosome);
		Ext.getCmp(this.id+'tbCoordinate').setValue(this.region.toString());
		this._updateChrStore();
		this.trackSvgLayout.setRegion({species:this.species});
		this.trackSvgLayoutOverview.setRegion({species:this.species});
		this.chromosomeWidget.setRegion({species:this.species});
		this.karyotypeWidget.setRegion({species:this.species});
		this.onSpeciesChange.notify();
		Ext.getCmp(this.id+"container").setLoading();
		break;
	case "_getChromosomeMenu":
		this.trackSvgLayout.setRegion({});
		this.trackSvgLayoutOverview.setRegion({});
		this.chromosomeWidget.setRegion({});
		this.karyotypeWidget.setRegion({});
		Ext.getCmp(this.id+'tbCoordinate').setValue(this.region.toString());
		Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.region.chromosome);
		Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.region.chromosome);
		Ext.getCmp(this.id+"container").setLoading();
		break;
	case "GoButton":
		this._calculateZoomByRegion();
		Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.region.chromosome);
		Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.region.chromosome);
		this.trackSvgLayout.setRegion({});
		this.trackSvgLayoutOverview.setRegion({});
		this.chromosomeWidget.setRegion({});
		this.karyotypeWidget.setRegion({});
		Ext.getCmp(this.id+"container").setLoading();
		break;
	case "KaryotypePanel":
		this._calculateZoomByRegion();
		Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.region.chromosome);
		Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.region.chromosome);
		Ext.getCmp(this.id+'tbCoordinate').setValue(this.region.toString());
		this.trackSvgLayout.setRegion({});
		this.trackSvgLayoutOverview.setRegion({});
		this.chromosomeWidget.setRegion({});
		//this.karyotypeWidget.updatePositionBox();
		Ext.getCmp(this.id+"container").setLoading();
		break;
	case "ChromosomeWidget":
		this._calculateZoomByRegion();
		Ext.getCmp(this.id+'tbCoordinate').setValue(this.region.toString());
		this.trackSvgLayout.setRegion({});
		this.trackSvgLayoutOverview.setRegion({});
		this.karyotypeWidget.setRegion({});
		Ext.getCmp(this.id+"container").setLoading();
		break;
	case "trackSvgLayout":
		Ext.getCmp(this.id+'tbCoordinate').setValue(this.region.toString());
		this.chromosomeWidget.setRegion({});
		this.karyotypeWidget.setRegion({});
		break;
	case "trackSvgLayoutOverview":
		this._calculateZoomByRegion();
		Ext.getCmp(this.id+'tbCoordinate').setValue(this.region.toString());
		this.trackSvgLayout.setRegion({});
		this.trackSvgLayoutOverview.setRegion({});
		this.chromosomeWidget.setRegion({});
		this.karyotypeWidget.setRegion({});
		Ext.getCmp(this.id+"container").setLoading();
		break;
	case "zoom":
		this._calculateRegionByZoom();
		Ext.getCmp(this.id+'tbCoordinate').setValue(this.region.toString());
		this.trackSvgLayout.setRegion({});
		this.trackSvgLayoutOverview.setRegion({});
		this.chromosomeWidget.setRegion({});
		this.karyotypeWidget.setRegion({});
		Ext.getCmp(this.id+"container").setLoading();
		break;
	default:
		this._calculateZoomByRegion();
		if(data.species != null){
			this.species = data.species;
			this.speciesName = data.text;
			Ext.example.msg('Species', this.speciesName+' selected.');
			this.onSpeciesChange.notify();
		}
		Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.region.chromosome);
		Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.region.chromosome);
		Ext.getCmp(this.id+"speciesMenuButton").setText(this.speciesName);
		Ext.getCmp(this.id+'tbCoordinate').setValue(this.region.toString());
		this._updateChrStore();
		this.trackSvgLayout.setRegion({});
		this.trackSvgLayoutOverview.setRegion({});
		this.chromosomeWidget.setRegion({});
		this.karyotypeWidget.setRegion({});
		Ext.getCmp(this.id+"container").setLoading();
	}
};


//XXX
//XXX
//XXX
//XXX
//XXX SENCHA ITEMS
//XXX
//XXX
//XXX
//XXX
//XXX

//NAVIGATION BAR
//GenomeViewer.prototype._getNavigationBar = function() {
//	var _this = this;
//
//	var searchResults = Ext.create('Ext.data.Store', {
//		fields: ["xrefId","displayId","description"]
//	});
//
//
//	var searchCombo = Ext.create('Ext.form.field.ComboBox', {
//		id : this.id+'quickSearch',
//		displayField: 'displayId',
//		valueField: 'displayId',
//		emptyText:'gene, snp',
//		hideTrigger: true,
//        fieldLabel:'Search:',
//        labelWidth:40,
//		width:150,
//		store: searchResults,
//		queryMode: 'local',
//		typeAhead:false,
//		autoSelect:false,
//		queryDelay: 500,
//		listeners:{
//			change:function(){
//				var value = this.getValue();
//				var min = 2;
//				if(value && value.substring(0,3).toUpperCase() == "ENS"){
//					min = 10;
//				}
//				if(value && value.length > min){
//					$.ajax({
//						url:new CellBaseManager().host+"/latest/"+_this.species+"/feature/id/"+this.getValue()+"/starts_with?of=json",
//						success:function(data, textStatus, jqXHR){
//							var d = JSON.parse(data);
//							searchResults.loadData(d[0]);
//							console.log(searchResults)
//						},
//						error:function(jqXHR, textStatus, errorThrown){console.log(textStatus);}
//					});
//				}
//			},
//			select: function(field, e){
//				_this._handleNavigationBar('GoToGene');
//			}
////			,specialkey: function(field, e){
////				if (e.getKey() == e.ENTER) {
////					_this._handleNavigationBar('GoToGene');
////				}
////			}
//		}
//	});
//
//	var navToolbar = Ext.create('Ext.toolbar.Toolbar', {
//		id:this.id+"navToolbar",
//        renderTo: "gv-menubar-panel",
//		cls:"bio-toolbar",
//		region:"north",
//		border:true,
//		height:35,
////		enableOverflow:true,//if the field is hidden getValue() reads "" because seems the hidden field is a different object
//		items : [
//		         {
//		        	 id:this.id+"speciesMenuButton",
//		        	 text : this.speciesName,
//		        	 menu: this._getSpeciesMenu()
//		         },{
//		        	 id: this.id + "chromosomeMenuButton",
//		        	 text : 'Chromosome',
//		        	 menu: this._getChromosomeMenu()
//		         },
//		         '-',
//		         {
//		        	 id:this.id+"karyotypeButton",
//		        	 text : 'Karyotype',
//		        	 enableToggle:true,
//		        	 pressed:false,
//		        	 toggleHandler:function() {
//		        		 if(this.pressed){
//		        			 Ext.getCmp(_this.id+"karyotypePanel").show();
//		        		 }else{
//		        			 Ext.getCmp(_this.id+"karyotypePanel").hide();
//		        		 }
//		        	 }
//		         },
//		         {
//		        	 id:this.id+"ChromosomeToggleButton",
//		        	 text : 'Chromosome',
//		        	 enableToggle:true,
//		        	 pressed:true,
//		        	 toggleHandler:function() {
//		        		 if(this.pressed){
//		        			 Ext.getCmp(_this.id+"chromosomePanel").show();
//		        		 }else{
//		        			 Ext.getCmp(_this.id+"chromosomePanel").hide();
//		        		 }
//		        	 }
//		         },
//		         {
//		        	 id:this.id+"RegionToggleButton",
//		        	 text : 'Region',
//		        	 enableToggle:true,
//		        	 pressed:this.regionPanelHidden,
//		        	 toggleHandler:function() {
//		        		 if(this.pressed){
//		        			 Ext.getCmp(_this.id+"regionPanel").show();
//		        		 }else{
//		        			 Ext.getCmp(_this.id+"regionPanel").hide();
//		        		 }
//		        	 }
//		         },
//		         '-',
////		         {
////		        	 id:this.id+"left1posButton",
////		        	 text : '<',
////		        	 margin : '0 0 0 15',
////		        	 handler : function() {
////		        		 _this._handleNavigationBar('<');
////		        	 }
////		         },
//		         {
//		        	 id:this.id+"zoomOutButton",
//                     tooltip:'Zoom out',
//		        	 iconCls:'icon-zoom-out',
//		        	 margin : '0 0 0 10',
//		        	 listeners : {
//		        		 click:{
//		        			 fn :function() {
//		        				 var current = Ext.getCmp(_this.id+'zoomSlider').getValue();
//		        				 Ext.getCmp(_this.id+'zoomSlider').setValue(current-_this.increment);
//		        			 }
////		        			 buffer : 300
//		        		 }
//		        	 }
//		         },
//		         this._getZoomSlider(),
//		         {
//		        	 id:this.id+"zoomInButton",
//		        	 margin:'0 5 0 0',
//                     tooltip:'Zoom in',
//		        	 iconCls:'icon-zoom-in',
//		        	 listeners : {
//		        		 click:{
//		        			 fn :function() {
//		        				 var current = Ext.getCmp(_this.id+'zoomSlider').getValue();
//		        				 Ext.getCmp(_this.id+'zoomSlider').setValue(current+_this.increment);
//		        			 }
////		        			 buffer : 300
//		        		 }
//		        	 }
//		         },'-',
////		         {
////		        	 id:this.id+"right1posButton",
////		        	 text : '>',
////		        	 handler : function() {
////		        		 _this._handleNavigationBar('>');
////		        	 }
////		         },
//		         {
//		        	 id:this.id+"positionLabel",
//		        	 xtype : 'label',
//		        	 text : 'Position:',
//		        	 margins : '0 0 0 10'
//		         },{
//		        	 id : this.id+'tbCoordinate',
//		        	 xtype : 'textfield',
//		        	 width : 165,
//		        	 text : this.chromosome + ":" + this.position,
//		        	 listeners:{
//		        		 specialkey: function(field, e){
//		        			 if (e.getKey() == e.ENTER) {
//		        				 _this._handleNavigationBar('Go');
//		        			 }
//		        		 }
//		        	 }
//				},
//		         {
//		        	 id : this.id+'GoButton',
//		        	 text : 'Go',
//		        	 handler : function() {
//		        		 _this._handleNavigationBar('Go');
//		        	 }
//		         },'->',
////		         {
////		        	 id : this.id+'searchLabel',
////		        	 xtype : 'label',
////		        	 text : 'Quick search:',
////		        	 margins : '0 0 0 10'
////		         },
//		         searchCombo,
////		         {
////		        	 id : this.id+'quickSearch',
////		        	 xtype : 'textfield',
////		        	 emptyText:'gene, protein, transcript',
////		        	 name : 'field1',
////		        	 listeners:{
////		        		 specialkey: function(field, e){
////		        			 if (e.getKey() == e.ENTER) {
////		        				 _this._handleNavigationBar('GoToGene');
////		        			 }
////		        		 },
////		        		 change: function(){
////		        			 	var str = this.getValue();
////		        			 	if(str.length > 3){
////		        			 		console.log(this.getValue());
////		        			 	}
////					     }
////		        	 }
////		         },
//		         {
//		        	 id : this.id+'GoToGeneButton',
//		        	 iconCls:'icon-find',
//		        	 handler : function() {
//		        		 _this._handleNavigationBar('GoToGene');
//		        	 }
//		         }]
//	});
//
//	return navToolbar;
//
//};

//Creates the species empty menu if not exist and returns it
//GenomeViewer.prototype._getSpeciesMenu = function() {
//	//items must be added by using  setSpeciesMenu()
//	if(this._specieMenu == null){
//		this._specieMenu = Ext.create('Ext.menu.Menu', {
//			id:this.id+"_specieMenu",
//			margin : '0 0 10 0',
//			floating : true,
//            plain:true,
//			items : []
//		});
//	}
//	return this._specieMenu;
//};
////Sets the species buttons in the menu
//GenomeViewer.prototype.setSpeciesMenu = function(speciesObj, popular) {
//	var _this = this;
//
//	var menu = this._getSpeciesMenu();
//	//Auto generate menu items depending of AVAILABLE_SPECIES config
//	menu.hide();//Hide the menu panel before remove
//	menu.removeAll(); // Remove the old species
//
//    var popularSpecies = [];
//
//    for(var i = 0; i < speciesObj.items.length; i++){
//        var phyloSpecies = speciesObj.items[i].items;
//        var pyhlo = speciesObj.items[i];
//        pyhlo.menu = {items:phyloSpecies};
//        for(var j = 0; j < phyloSpecies.length; j++){
//            var species = phyloSpecies[j];
//            var text = species.text+' ('+species.assembly+')';
////            species.id = this.id+text;
//            species.name = species.text;
//            species.species = Utils.getSpeciesCode(species.text);
//            species.text = text;
//            species.speciesObj = species;
//            species.iconCls = '';
////            species.icon = 'http://static.ensembl.org/i/species/48/Danio_rerio.png';
//            species.handler = function(me){
//                _this.setSpecies(me.speciesObj);
//            };
//
//            if(popular.indexOf(species.name) != -1){
//                popularSpecies.push(species);
//            }
//        }
//    }
//    popularSpecies.sort(function(a, b) {return a.text.localeCompare(b.text);});
//    popularSpecies.push('-');
//    var items = popularSpecies.concat(speciesObj.items);
//    menu.add(items);
//};
//
////Sets the new specie and fires an event
//GenomeViewer.prototype.setSpecies = function(data){
//	this.region.load(data.region);
//	data["sender"]="setSpecies";
//	this.onRegionChange.notify(data);
//};
//
//GenomeViewer.prototype._getChromosomeMenu = function() {
//	var _this = this;
//	var chrStore = Ext.create('Ext.data.Store', {
//		id:this.id+"chrStore",
//		fields: ["name"],
//		autoLoad:false
//	});
//	/*Chromolendar*/
// 	var chrView = Ext.create('Ext.view.View', {
// 		id:this.id+"chrView",
// 		width:125,
//		style:'background-color:#fff',
// 		store : chrStore,
// 		selModel: {
// 			mode: 'SINGLE',
// 			listeners: {
// 				selectionchange:function(este,selNodes){
// 					if(selNodes.length>0){
//						_this.region.chromosome = selNodes[0].data.name;
// 						_this.onRegionChange.notify({sender:"_getChromosomeMenu"});
//// 					_this.setChromosome(selNodes[0].data.name);
// 					}
// 					chromosomeMenu.hide();
// 				}
// 			}
// 		},
// 		cls: 'list',
// 		trackOver: true,
// 		overItemCls: 'list-item-hover',
// 		itemSelector: '.chromosome-item',
// 		tpl: '<tpl for="."><div style="float:left" class="chromosome-item">{name}</div></tpl>'
////	        tpl: '<tpl for="."><div class="chromosome-item">chr {name}</div></tpl>'
// 	});
//	/*END chromolendar*/
//
// 	var chromosomeMenu = Ext.create('Ext.menu.Menu', {
// 		id:this.id+"chromosomeMenu",
// 		almacen :chrStore,
//        plain: true,
//		items : [/*{xtype:'textfield', width:125},*/chrView]
////        items:[ //TODO alternative
////            {
////                xtype: 'buttongroup',
////                id:this.id+'chrButtonGroup',
//////                title: 'User options',
////                columns: 5,
////                defaults: {
////                    xtype: 'button',
//////                    scale: 'large',
////                    iconAlign: 'left',
////                    handler:function(){}
////                },
//////                items : [chrView]
//////                items: []
////            }
////        ]
//	});
// 	this._updateChrStore();
//	return chromosomeMenu;
//};
//
//GenomeViewer.prototype._updateChrStore = function(){
//	var _this = this;
//	var chrStore = Ext.getStore(this.id+"chrStore");
//	var chrView = Ext.getCmp(this.id+"chrView");
////	var chrButtonGroup = Ext.getCmp(this.id+"chrButtonGroup");
//	var cellBaseManager = new CellBaseManager(this.species);
// 	cellBaseManager.success.addEventListener(function(sender,data){
// 		var chromosomeData = [];
// 		var chrItems = [];
// 		var sortfunction = function(a, b) {
// 			var IsNumber = true;
// 			for (var i = 0; i < a.length && IsNumber == true; i++) {
// 				if (isNaN(a[i])) {
// 					IsNumber = false;
// 				}
// 			}
// 			if (!IsNumber) return 1;
// 			return (a - b);
// 		};
// 		data.result.sort(sortfunction);
//		for (var i = 0; i < data.result.length; i++) {
//			chromosomeData.push({'name':data.result[i]});
////            chrItems.push({text:data.result[i],iconAlign: 'left'});
//		}
//		chrStore.loadData(chromosomeData);
////        chrButtonGroup.removeAll();
////        chrButtonGroup.add(chrItems);
////		chrView.getSelectionModel().select(chrStore.find("name",_this.chromosome));
// 	});
// 	cellBaseManager.get('feature', 'chromosome', null, 'list');
//};

GenomeViewer.prototype._getZoomSlider = function() {
	var _this = this;
	if(this._zoomSlider==null){
		this._zoomSlider = Ext.create('Ext.slider.Single', {
			id : this.id+'zoomSlider',
			width : 170,
			maxValue : 100,
			minValue : 0,
//			value : this.zoom,
			useTips : true,
			increment : 1,
			tipText : function(thumb) {
				return Ext.String.format('<b>{0}%</b>', thumb.value);
			},
			listeners : {
				'change': {
					fn :function(slider, newValue) {
					 _this._handleNavigationBar("ZOOM", newValue);
					},
					buffer : 500
				}
			}
		});
	}
	return this._zoomSlider;
};

GenomeViewer.prototype._disableZoomElements = function(){
	//disable sencha elements till render gets finished
	Ext.getCmp(this.id+'zoomSlider').disable();
	Ext.getCmp(this.id+"zoomOutButton").disable();
	Ext.getCmp(this.id+"zoomInButton").disable();
};
GenomeViewer.prototype._enableZoomElements = function(){
	Ext.getCmp(this.id+'zoomSlider').enable();
	Ext.getCmp(this.id+"zoomOutButton").enable();
	Ext.getCmp(this.id+"zoomInButton").enable();
};

GenomeViewer.prototype.setZoom = function(zoom) {
	this.zoom = zoom;
	this._getZoomSlider().setValue(zoom);
};

//Action for buttons located in the NavigationBar
GenomeViewer.prototype._handleNavigationBar = function(action, args) {
//	var _this = this;
    if (action == 'OptionMenuClick'){
            this.genomeWidget.showTranscripts = Ext.getCmp("showTranscriptCB").checked;
            this.genomeWidgetProperties.setShowTranscripts(Ext.getCmp("showTranscriptCB").checked);
            this.refreshMasterGenomeViewer();
    }
    if (action == 'ZOOM'){
    	this.setZoom(args);
    	this.onRegionChange.notify({sender:"zoom"});
    }
    if (action == 'GoToGene'){
        var geneName = Ext.getCmp(this.id+'quickSearch').getValue();
        if(geneName != null){
        	if(geneName.slice(0, "rs".length) == "rs" || geneName.slice(0, "AFFY_".length) == "AFFY_" || geneName.slice(0, "SNP_".length) == "SNP_" || geneName.slice(0, "VAR_".length) == "VAR_" || geneName.slice(0, "CRTAP_".length) == "CRTAP_" || geneName.slice(0, "FKBP10_".length) == "FKBP10_" || geneName.slice(0, "LEPRE1_".length) == "LEPRE1_" || geneName.slice(0, "PPIB_".length) == "PPIB_") {
        		this.openSNPListWidget(geneName);
        	}else{
        		this.openGeneListWidget(geneName);
        	}
        }
    }
    if (action == '+'){
//  	var zoom = this.genomeWidgetProperties.getZoom();
    	var zoom = this.zoom;
    	if (zoom < 100){
    		this.setZoom(zoom + this.increment);
    	}
    }
    if (action == '-'){
//    	 var zoom = this.genomeWidgetProperties.getZoom();
    	 var zoom = this.zoom;
  	   if (zoom >= 5){
  		   this.setZoom(zoom - this.increment);
  	   }
    }
    
    if (action == 'Go'){
    	var value = Ext.getCmp(this.id+'tbCoordinate').getValue();

		var reg = new Region({str:value});
		
        // Validate chromosome and position
        if(isNaN(reg.start) || reg.start < 0){
        	Ext.getCmp(this.id+'tbCoordinate').markInvalid("Position must be a positive number");
        }
        else if(Ext.getCmp(this.id+"chromosomeMenu").almacen.find("name", reg.chromosome) == -1){
        	Ext.getCmp(this.id+'tbCoordinate').markInvalid("Invalid chromosome");
        }
        else{
			this.region.load(reg);
			this.onRegionChange.notify({sender:"GoButton"});
        }
        
    }
};


GenomeViewer.prototype._drawKaryotypePanel = function() {
	var _this = this;
	var panel =  Ext.create('Ext.panel.Panel', {
		id:this.id+"karyotypePanel",
		height : 200,
		title:'Karyotype',
		border:true,
		margin:'0 0 1 0',
		//cls:'border-bot panel-border-top',
		html: '<div id="'+this.id+'karyotypeSvg" style="margin-top:2px"></div>',
		listeners:{
			afterrender:function(){
				var div = $('#'+_this.id+"karyotypeSvg")[0];
				_this.karyotypeWidget = new KaryotypeWidget(div,{
					width:_this.width,
					height:168,
					species:_this.species,
					region:_this.region
				});
				_this.karyotypeWidget.onClick.addEventListener(function(sender,data){
					_this.onRegionChange.notify({sender:"KaryotypePanel"});
				});
				_this.karyotypeWidget.drawKaryotype();
			}
		}
	});
	return panel;
};




GenomeViewer.prototype._drawRegionPanel = function() {
	var _this=this;
	var c1 = Ext.create('Ext.container.Container', {
		height:25,
		style:'background:whitesmoke',
		html:'<div id = "'+this.id+'regionSvgTop"></div>'
	});
	var c2 = Ext.create('Ext.container.Container', {
		overflowY:'auto',//scrollbar
		overflowX:'hidden',//scrollbar
		style:'background:whitesmoke',
		flex: 1,//scrollbar
		html:'<div id = "'+this.id+'regionSvgTrack" style="margin-top:0px"></div></div>'
	});
	var panel =  Ext.create('Ext.panel.Panel', {
		id:this.id+"regionPanel",
		//style:'background:whitesmoke',
		height : 150,
		title:'Region overview <span class="ssel" id="'+this.id+"regionPanelZoom"+'"></span>',
		border:true,
        hidden:!this.regionPanelHidden,
		margin:'0 0 1 0',
		layout: { type: 'vbox',align: 'stretch'},//scrollbar
		//cls:'border-bot panel-border-top x-unselectable',
		items:[c1,c2]
		//html: '<div id="'+this.id+'regionSvg" '
	});
	return panel;
};

GenomeViewer.prototype._drawTracksPanel = function() {
	var _this=this;
	var c1 = Ext.create('Ext.container.Container', {
		height:25,
		style:'background:whitesmoke',
		html:'<div id = "'+this.id+'tracksSvgTop"></div>'
	});
	var c2 = Ext.create('Ext.container.Container', {
		overflowY:'auto',//scrollbar
		overflowX:'hidden',//scrollbar
		style:'background:whitesmoke',
		flex: 1,//scrollbar
		html:'<div id = "'+this.id+'tracksSvgTrack"></div>'
	});
	
	var panel = Ext.create('Ext.panel.Panel', {
		id:this.id+"tracksPanel",
		title:'Detailed information <span class="ssel" id="'+this.id+"regionPanelZoom"+'"></span>',
        shrinkWrap:1,
		layout: { type: 'vbox',align: 'stretch'},//scrollbar
		border:true,
        cls:'x-unselectable',
		//cls:"border-bot panel-border-top x-unselectable",
		flex: 1,
		items:[c1,c2]
	});
	return panel;
};

GenomeViewer.prototype.addTrack = function(trackData, args) {
	this.trackSvgLayout.addTrack(trackData, args);
};

GenomeViewer.prototype.getTrackSvgById = function(trackId) {
	return this.trackSvgLayout.getTrackSvgById(trackId);
};

GenomeViewer.prototype.removeTrack = function(trackId) {
	return this.trackSvgLayout.removeTrack(trackId);
};

GenomeViewer.prototype.restoreTrack = function(trackSvg, index) {
	return this.trackSvgLayout.restoreTrack(trackSvg, index);
};

GenomeViewer.prototype.setTrackIndex = function(trackId, newIndex) {
	return this.trackSvgLayout.setTrackIndex(trackId, newIndex);
};

GenomeViewer.prototype.scrollToTrack = function(trackId) {
	return this.trackSvgLayout.scrollToTrack(trackId);
};

GenomeViewer.prototype.showTrack = function(trackId) {
	this.trackSvgLayout._showTrack(trackId);
};

GenomeViewer.prototype.hideTrack = function(trackId) {
	this.trackSvgLayout._hideTrack(trackId);
};

GenomeViewer.prototype.checkRenderedTrack = function(trackId) {
	if(this.trackSvgLayout.swapHash[trackId]){
		return true;
	}
	return false;
};


//XXX BOTTOM BAR

GenomeViewer.prototype._getBottomBar = function() {
	var geneLegendPanel = new LegendPanel({title:'Gene legend'});
	var snpLegendPanel = new LegendPanel({title:'SNP legend'});
	
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
		id:this.id+"versionLabel",
		text:''
	});
	
	var mouseLabel = Ext.create('Ext.toolbar.TextItem', {
		id:this.id+"mouseLabel",
		width:110,
		text:'<span class="ssel">Position: -</span>'
	});
	var mouseNucleotidLabel = Ext.create('Ext.toolbar.TextItem', {
		id:this.id+"mouseNucleotidLabel",
		width:10,
		text:'-'
	});
	var windowSize = Ext.create('Ext.toolbar.TextItem', {
		id:this.id+"windowSize",
		width:150,
		text:'<span class="emph">Window size: -</span>'
	});
	
	var taskbar = Ext.create('Ext.toolbar.Toolbar', {
		id:this.id+'uxTaskbar',
		winMgr: new Ext.ZIndexManager(),
		enableOverflow:true,
		cls: 'bio-hiddenbar',
		height:28,
		flex:1
	});
	
	var legendBar = Ext.create('Ext.toolbar.Toolbar', {
		id:this.id+'legendBar',
		cls: 'bio-hiddenbar',
		width:610,
		height:28,
		items : [/*scaleLabel, */
		         '-',mouseLabel,mouseNucleotidLabel,windowSize,
		         geneLegendPanel.getButton(GENE_BIOTYPE_COLORS),
		         snpLegendPanel.getButton(SNP_BIOTYPE_COLORS),
		         '->',versionLabel]
	});
	
	var bottomBar = Ext.create('Ext.container.Container', {
		id:this.id+'bottomBar',
		layout:'hbox',
		region:"south",
		cls:"bio-botbar x-unselectable",
		height:30,
		border:true,
		items : [taskbar,legendBar]
	});
	return bottomBar;
};
//BOTTOM BAR



GenomeViewer.prototype.openListWidget = function(args) {
	var _this = this;
	
	console.log(args.query)
	
	var cellBaseManager = new CellBaseManager(this.species);
	cellBaseManager.success.addEventListener(function(evt, data) {
		if(data.result[0].length>1){
			var genomicListWidget = new GenomicListWidget(_this.species,{title:args.title, gridFields:args.gridField,viewer:_this});
			genomicListWidget.draw(data);
			
			genomicListWidget.onSelected.addEventListener(function(evt, feature) {
//			console.log(feature);
				if (feature != null && feature.chromosome != null) {
					if(_this.chromosome!= feature.chromosome || _this.position != feature.start){
						_this.onRegionChange.notify({sender:"",chromosome:feature.chromosome, position:feature.start});
					}
				}
			});
			
			genomicListWidget.onTrackAddAction.addEventListener(function(evt, event) {
				var track = new TrackData(event.fileName,{
					adapter: event.adapter
				});
				_this.trackSvgLayout.addTrack(track,{
					id:event.fileName,
					featuresRender:"MultiFeatureRender",
//					histogramZoom:80,
					height:150,
					visibleRange:{start:0,end:100},
					featureTypes:FEATURE_TYPES
				});
			});
		}else{
			var feature = data.result[0][0];
			if(feature != null){
				_this.region.load(feature);
				_this.onRegionChange.notify({sender:""});
			}else{
				Ext.example.msg('Feature <span class="ssel">'+args.query+'</span> not found',"");
			}
		}
	});
	cellBaseManager.get(args.category, args.subcategory, args.query, args.resource, args.params);
};
GenomeViewer.prototype.openGeneListWidget = function(name) {
	this.openListWidget({
		category:"feature",
		subcategory:"id",
		query:name.toString(),
		resource:"gene",
		title:"Gene List"
	});
};

GenomeViewer.prototype.openTranscriptListWidget = function(name) {
	this.openListWidget({
		category:"feature",
		subcategory:"transcript",
		query:name.toString(),
		resource:"info",
		title:"Transcript List",
		gridField:["externalName","stableId", "biotype", "chromosome", "start", "end", "strand", "description"]
	});
};

GenomeViewer.prototype.openExonListWidget = function(name) {
	this.openListWidget({
		category:"feature",
		subcategory:"exon",
		query:name.toString(),
		resource:"info",
		title:"Exon List",
		gridField:["stableId", "chromosome","start", "end", "strand"]
	});
};

GenomeViewer.prototype.openSNPListWidget = function(name) {
	this.openListWidget({
		category:"feature",
		subcategory:"id",
		query:name.toString(),
		resource:"snp",
		title:"SNP List",
		gridField:["name", "variantAlleles", "ancestralAllele", "mapWeight",  "position", "sequence","chromosome","start","end"]
	});
};

GenomeViewer.prototype.openGOListWidget = function(name) {
	this.openListWidget({
		category:"feature",
		subcategory:"id",
		query:name.toString(),
		resource:"gene",
		title:"Gene List by GO"
	});
};
