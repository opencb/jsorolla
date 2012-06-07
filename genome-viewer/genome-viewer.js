function GenomeViewer(targetId, species, args) {
	var _this=this;
	this.id = "GenomeViewer"+ Math.round(Math.random()*10000);
	this.menuBar = null;
	
	// if not provided on instatiation
	this.width =  $(document).width();
	this.height = $(document).height();
	this.targetId=null;
	
	//Default values
	this.species="hsa";
	this.speciesName="Homo sapiens";
	this.increment = 5;
	this.zoom=100;
	this.version="";
	
	//Setting paramaters
	if (targetId != null){
		this.targetId=targetId;
	}
	if (species != null) {
		this.species = species.species;
		this.speciesName = species.name;
		this.chromosome = species.chromosome;//this is a string
		this.position = parseInt(species.position);
	}
	if (args != null){
		if(args.toolbar != null){
			this.toolbar = args.toolbar;
		}
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.availableSpecies != null) {
			this.setSpeciesMenu(args.availableSpecies);
		}
		if (args.chromosome != null) {
			this.chromosome = args.chromosome;
		}
		if (args.position != null) {//middle browser window
			this.position = parseInt(args.position);
		}
		if (args.version != null) {
			this.version = args.version;
		}
	}

	//Events i send
	this.onLocationChange = new Event();
	this.afterLocationChange = new Event();
	
	//Events i listen
	this.onLocationChange.addEventListener(function(sender,data){
		_this.setLoc(data);
	});

	
	// useful logs
	console.log(this.width+"x"+this.height);
	console.log(this.targetId);
	console.log(this.id);
	
};

GenomeViewer.prototype.draw = function(){
	//interface
	this.render();
//	this.getData();
};
GenomeViewer.prototype.render = function(){
	var items = [];
	if(this.toolbar!=null){
		items.push(this.toolbar);
	}
	items.push(this._getNavigationBar());
	//items.push(this._getKaryotypePanel().hide());
	//items.push(this._getChromosomePanel());
//	items.push(this._getRegionPanel());
//	items.push(this._getWindowSizePanel());
	items.push(this._getTracksPanel());
	items.push(this._getBottomBar());
	
	
	Ext.create('Ext.container.Container', {
		id:this.id+"container",
		renderTo:this.targetId,
    	width:this.width,
    	height:this.height,
		cls:'x-unselectable',
		layout: { type: 'vbox',align: 'stretch'},
		region : 'center',
		margins : '0 0 0 0',
		items :items
	});
	
	Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
	//Ext.getCmp(this.id+"chromosomeCont").setTitle("Chromosome "+this.chromosome);
	Ext.getCmp(this.id+'tbCoordinate').setValue( this.chromosome + ":" + Math.ceil(this.position));
	
};

GenomeViewer.prototype.setSize = function(width,height) {
	Ext.getCmp(this.id+"container").setSize(width,height);
};

GenomeViewer.prototype.setLoc = function(data) {
//	console.log(data.sender);
	
//	this.chromosomeFeatureTrack.select(data.position-1000, data.position+1000);
	
	switch(data.sender){
	case "setSpecies": 
		this.species = data.species;
		this.speciesName = data.name;
		this.position = data.position;
		this.chromosome = data.chromosome;
		this._drawChromosome();
		Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
		Ext.getCmp(this.id+"chromosomeCont").setTitle("Chromosome "+this.chromosome);
		Ext.getCmp(this.id+'tbCoordinate').setValue( this.chromosome + ":" + Math.ceil(this.position));
		Ext.getCmp(this.id+"speciesMenuButton").setText(this.speciesName);
		Ext.example.msg('Species', this.speciesName+' selected.');
		this._updateChrStore();
		this._getKaryotypePanel(true);
		this.trackSvgLayout.setChromosome(data.chromosome);
		break;
	case "_getChromosomeMenu":
		if(this.chromosome!=data.chromosome){
			this.chromosome = data.chromosome;
			this.trackSvgLayout.setChromosome(data.chromosome);
			this._drawChromosome();
		}
		this._karyotypePanel.select(this.chromosome, this.position, this.position);
		Ext.getCmp(this.id+'tbCoordinate').setValue( this.chromosome + ":" + Math.ceil(this.position));
		Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
		Ext.getCmp(this.id+"chromosomeCont").setTitle("Chromosome "+this.chromosome);
		break;
	case "GoButton":
		this.position = data.position;
		if(this.chromosome!=data.chromosome){
			this.chromosome = data.chromosome;
			this.trackSvgLayout.setChromosome(data.chromosome);
			this._drawChromosome();
		}
		Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
		Ext.getCmp(this.id+"chromosomeCont").setTitle("Chromosome "+this.chromosome);
		this._karyotypePanel.select(this.chromosome, this.position, this.position);
		break;
	case "_getKaryotypePanel": 
		this.position = data.position;
		if(this.chromosome!=data.chromosome){
			this.chromosome = data.chromosome;
			this.trackSvgLayout.setChromosome(data.chromosome);
			this._drawChromosome();
		}
		Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
		Ext.getCmp(this.id+"chromosomeCont").setTitle("Chromosome "+this.chromosome);
		Ext.getCmp(this.id+'tbCoordinate').setValue( this.chromosome + ":" + Math.ceil(this.position));
		break;
	case "_drawChromosome":
		this.position = data.position;
		Ext.getCmp(this.id+'tbCoordinate').setValue( this.chromosome + ":" + Math.ceil(this.position));
		this._karyotypePanel.select(this.chromosome, this.position, this.position);
		break;
	case "trackSvgLayout":
		this.position = this.position-data.position;
		Ext.getCmp(this.id+'tbCoordinate').setValue( this.chromosome + ":" + Math.ceil(this.position));
//		this._karyotypePanel.select(this.chromosome, this.position, this.position);
		break;
	default:
	
	}
	
	
	
	
//	this.afterLocationChange.notify({sender:data.sender});
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
GenomeViewer.prototype._getNavigationBar = function() {
	var _this = this;
	
	
	var navToolbar = Ext.create('Ext.toolbar.Toolbar', {
		id:this.id+"navToolbar",
		cls:"bio-toolbar",
		border:true,
		height:35,
		enableOverflow:true,//if the field is hidden getValue() reads "" because seems the hidden field is a different object
		items : [
		         {
		        	 id:this.id+"speciesMenuButton",
		        	 text : this.speciesName,
		        	 menu: this._getSpeciesMenu()			
		         },{
		        	 id: this.id + "chromosomeMenuButton",
		        	 text : 'Chromosome',
		        	 menu: this._getChromosomeMenu()			
		         },
		         '-',
		         {
		        	 id:this.id+"karyotypeButton",
		        	 text : 'Karyotype',
		        	 enableToggle:true,
		        	 toggleHandler:function() {
		        		 if(this.pressed){
		        			 Ext.getCmp(_this.id+"karyotypeCont").show();
		        		 }else{
		        			 Ext.getCmp(_this.id+"karyotypeCont").hide();
		        		 }
		        	 }
		         },
		         {
		        	 id:this.id+"ChromosomeToggleButton",
		        	 text : 'Chromosome',
		        	 enableToggle:true,
		        	 pressed:true,
		        	 toggleHandler:function() {
		        		 if(this.pressed){
		        			 Ext.getCmp(_this.id+"chromosomeCont").show();
		        		 }else{
		        			 Ext.getCmp(_this.id+"chromosomeCont").hide();
		        		 }
		        	 }
		         },
		         {
		        	 id:this.id+"RegionToggleButton",
		        	 text : 'Region',
		        	 enableToggle:true,
		        	 pressed:true,
		        	 toggleHandler:function() {
		        		 if(this.pressed){
		        			 _this._getRegionPanel().show();
		        		 }else{
		        			 _this._getRegionPanel().hide();
		        		 }
		        	 }
		         },
		         '-',
//		         {
//		        	 id:this.id+"left1posButton",
//		        	 text : '<',
//		        	 margin : '0 0 0 15',
//		        	 handler : function() {
//		        		 _this._handleNavigationBar('<');
//		        	 }
//		         }, 
		         {
		        	 id:this.id+"zoomOutButton",
		        	 margin : '0 0 0 10',
		        	 iconCls:'icon-zoom-out',
		        	 handler : function() {
		        		 _this._handleNavigationBar('-');
		        	 }
		         }, 
		         this._getZoomSlider(), 
		         {
		        	 id:this.id+"zoomInButton",
		        	 margin:'0 5 0 0',
		        	 iconCls:'icon-zoom-in',
		        	 handler :  function() {
		        		 _this._handleNavigationBar('+');
		        	 }
		         },
//		         {
//		        	 id:this.id+"right1posButton",
//		        	 text : '>',
//		        	 handler : function() {
//		        		 _this._handleNavigationBar('>');
//		        	 }
//		         },
		         '->',{
		        	 id:this.id+"positionLabel",
		        	 xtype : 'label',
		        	 text : 'Position:',
		        	 margins : '0 0 0 10'
		         },{
		        	 id : this.id+'tbCoordinate',
		        	 xtype : 'textfield',
		        	 text : this.chromosome + ":" + this.position,
		        	 listeners:{
		        		 specialkey: function(field, e){
		        			 if (e.getKey() == e.ENTER) {
		        				 _this._handleNavigationBar('Go');
		        			 }
		        		 }
		        	 }
		         },{
		        	 id : this.id+'GoButton',
		        	 text : 'Go',
		        	 handler : function() {
		        		 _this._handleNavigationBar('Go');
		        	 }
		         },{
		        	 id : this.id+'searchLabel',
		        	 xtype : 'label',
		        	 text : 'Search:',
		        	 margins : '0 0 0 10'
		         },{
		        	 
		        	 id : this.id+'tbGene',
		        	 xtype : 'textfield',
		        	 emptyText:'gene, protein, transcript',
		        	 name : 'field1',
		        	 listeners:{
		        		 specialkey: function(field, e){
		        			 if (e.getKey() == e.ENTER) {
		        				 _this._handleNavigationBar('GoToGene');
		        			 }
		        		 }
		        	 }
		         },{
		        	 id : this.id+'GoToGeneButton',
		        	 text : 'Go',
		        	 handler : function() {
		        		 _this._handleNavigationBar('GoToGene');
		        	 }
		         }]
	});
	return navToolbar;
};

//Creates the species empty menu if not exist and returns it
GenomeViewer.prototype._getSpeciesMenu = function() {
	//items must be added by using  setSpeciesMenu()
	if(this._specieMenu == null){
		this._specieMenu = Ext.create('Ext.menu.Menu', {
			id:this.id+"_specieMenu",
			margin : '0 0 10 0',
			floating : true,
			items : []
		});
	}
	return this._specieMenu;
};
//Sets the species buttons in the menu
GenomeViewer.prototype.setSpeciesMenu = function(speciesObj) {
	var _this = this;
	//Auto generate menu items depending of AVAILABLE_SPECIES config
	var menu = this._getSpeciesMenu();
	menu.hide();//Hide the menu panel before remove
	menu.removeAll(); // Remove the old species
	for ( var i = 0; i < speciesObj.length; i++) {
		menu.add({	
					id:this.id+speciesObj[i].name,
					text:speciesObj[i].name,
					speciesObj:speciesObj[i],
					handler:function(este){
						//can't use the i from the FOR so i create the object again
						_this.setSpecies(este.speciesObj);
				}
		});
	};
};
//Sets the new specie and fires an event
GenomeViewer.prototype.setSpecies = function(data){
	data["sender"]="setSpecies";
	this.onLocationChange.notify(data);
};

GenomeViewer.prototype._getChromosomeMenu = function() {
	var _this = this;
	var chrStore = Ext.create('Ext.data.Store', {
		id:this.id+"chrStore",
		fields: ["name"],
		autoLoad:false
	});
	/*Chromolendar*/
 	var chrView = Ext.create('Ext.view.View', {
 		id:this.id+"chrView",
 		width:125,
 		style:'background-color:#fff',
 		store : chrStore,
 		selModel: {
 			mode: 'SINGLE',
 			listeners: {
 				selectionchange:function(este,selNodes){
 					if(selNodes.length>0){
 						_this.onLocationChange.notify({sender:"_getChromosomeMenu",chromosome:selNodes[0].data.name});
// 					_this.setChromosome(selNodes[0].data.name);
 					}
 					chromosomeMenu.hide();
 				}
 			}
 		},
 		cls: 'list',
 		trackOver: true,
 		overItemCls: 'list-item-hover',
 		itemSelector: '.chromosome-item', 
 		tpl: '<tpl for="."><div style="float:left" class="chromosome-item">{name}</div></tpl>'
//	        tpl: '<tpl for="."><div class="chromosome-item">chr {name}</div></tpl>'
 	});
	/*END chromolendar*/
 	
 	var chromosomeMenu = Ext.create('Ext.menu.Menu', {
 		id:this.id+"chromosomeMenu",
 		almacen :chrStore,
		items : [chrView]
	});
 	this._updateChrStore();
	return chromosomeMenu;
};

GenomeViewer.prototype._updateChrStore = function(){
	var _this = this;
	var chrStore = Ext.getStore(this.id+"chrStore");
	var chrView = Ext.getCmp(this.id+"chrView");
	var cellBaseManager = new CellBaseManager(this.species);
 	cellBaseManager.get("feature", "karyotype", "none", "chromosome");
 	cellBaseManager.success.addEventListener(function(sender,data){
 		var chromosomeData = [];
 		var sortfunction = function(a, b) {
 			var IsNumber = true;
 			for (var i = 0; i < a.length && IsNumber == true; i++) {
 				if (isNaN(a[i])) {
 					IsNumber = false;
 				}
 			}
 			if (!IsNumber) return 1;
 			return (a - b);
 		};
 		data.result.sort(sortfunction);
		for (var i = 0; i < data.result.length; i++) {
			chromosomeData.push({'name':data.result[i]});
		}
		chrStore.loadData(chromosomeData);
//		chrView.getSelectionModel().select(chrStore.find("name",_this.chromosome));
 	});
};

GenomeViewer.prototype._getZoomSlider = function() {
	var _this = this;
	if(this._zoomSlider==null){
		this._zoomSlider = Ext.create('Ext.slider.Single', {
			id : this.id+'_zoomSlider',
			width : 200,
			minValue : 0,
			maxValue : 100,
//			hideLabel : false,
//			value : _this.genomeWidgetProperties.getZoom(),
			value : this.zoom,
			useTips : true,
			increment : this.increment,
			tipText : function(thumb) {
				return Ext.String.format('<b>{0}%</b>', thumb.value);
			}
		});
		
		this._zoomSlider.on("changecomplete", function(slider, newValue) {
			_this._handleNavigationBar("ZOOM", newValue);
		});
	}
	return this._zoomSlider;
};


GenomeViewer.prototype.setZoom = function(zoom) {
	var _this = this;
	this.zoom = zoom;
	this._getZoomSlider().setValue(zoom);
	if(this.trackSvgLayout!=null){
		this.trackSvgLayout.setZoom(zoom);
	}
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
    }
    if (action == 'GoToGene'){
        var geneName = Ext.getCmp(this.id+'tbGene').getValue();
        this.openGeneListWidget(geneName);
        
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
        var position = value.split(":")[1];
        var chromosome = value.split(":")[0];
        
        // Validate chromosome and position
        if(isNaN(position) || position < 0){
        	Ext.getCmp(this.id+'tbCoordinate').markInvalid("Position must be a positive number");
        }
        else if(Ext.getCmp(this.id+"chromosomeMenu").almacen.find("name", chromosome) == -1){
        	Ext.getCmp(this.id+'tbCoordinate').markInvalid("Invalid chromosome");
        }
        else{
        	this.onLocationChange.notify({chromosome:chromosome,position:position,sender:"GoButton"});
        }
        
    }
    
    
//    if (action == '<'){
//        var position = Ext.getCmp(this.id+'tbCoordinate').getValue();
//        this.setLocation(this.chromosome, this.position - (this.genomeWidgetProperties.windowSize/2));
//    }
//    
//    
//    if (action == '>'){
//        var position = Ext.getCmp(this.id+'tbCoordinate').getValue();
//        this.setLocation(this.chromosome, this.position + (this.genomeWidgetProperties.windowSize/2));
//    }
    
    
};


GenomeViewer.prototype._getKaryotypePanel = function(specieChanged) {
	var _this = this;
	var cont = Ext.getCmp(this.id+"karyotypeCont");
	
	
	// sencha 4.1 must be shown because must be in the dom, in sencha 4.1 hidden elements are not in the dom
	if(cont != null ){
		if( cont.isHidden()){
			cont["wasHidden"] = true;
			cont.show();
		}else{
			cont["wasHidden"] = false;
		}
	}
	// end
	
	if(cont == null ){
		cont = Ext.create('Ext.panel.Panel',{
			id:this.id+"karyotypeCont",
			title:'Karyotype',
			border:false,
			margin:'0 0 1 0',
			cls:'border-bot panel-border-top'
		});
	}
	
	if(specieChanged == true){
		this._karyotypePanel.getKaryotypePanel().destroy();
		this._karyotypePanel=null;
	}
	
	if(this._karyotypePanel==null){
		this._karyotypePanel = new KaryotypePanelWindow(this.species,{viewer:this,height:150,width:this.width});
		
		cont.add(this._karyotypePanel.getKaryotypePanel());
		/** Events i listen **/
		this._karyotypePanel.onRendered.addEventListener(function(evt, feature) {
			_this._karyotypePanel.select(_this.chromosome, _this.position, _this.position);
		});
		this._karyotypePanel.onMarkerChanged.addEventListener(function(evt, data) {
			_this.onLocationChange.notify({chromosome:data.chromosome,position:data.start,sender:"_getKaryotypePanel"});
		});
		this._karyotypePanel.karyotypeCellBaseDataAdapter.fill();
		
		//TODO para la 4.1rc3
//		Ext.getCmp(this.id+"karyotypeButton").toggle();
//		Ext.getCmp(this.id+"karyotypeButton").toggle();
	}
	
	// sencha 4.1 must be shown because must be in the dom, in sencha 4.1 hidden elements are not in the dom
	if(cont!= null && cont["wasHidden"] == true){
		cont.hide();
	}
	// end 
	
	
	return cont;
};

GenomeViewer.prototype._getChromosomePanel = function() {
	var _this = this;
	var cont = Ext.getCmp(this.id+"chromosomeCont");
	
	if(cont==null){
		cont =  Ext.create('Ext.panel.Panel', {
			id:this.id+"chromosomeCont",
			height : 95,
			title:'Chromosome',
			border:false,
			margin:'0 0 1 0',
			cls:'border-bot panel-border-top',
			html: '<div id="'+this.id+'chromosomeSvg" style="margin-top:2px"></div>',
			listeners:{
				afterrender:function(){
					_this._drawChromosome();
				}
			}
		});
	}
	return cont;
};
GenomeViewer.prototype._drawChromosome = function() {
	var _this = this;
//	this._setChromosomeLabel(chromosome);
	DOM.removeChilds(this.id+"chromosomeSvg");
	var width = this.width - 17;
	this.chromosomeFeatureTrack = new ChromosomeFeatureTrack(this.id + "chr", document.getElementById(this.id+"chromosomeSvg"), this.species,{
		top : 5,
		bottom : 20,
		left : 10,
		right : width,
		width : width,
		height : 50,
		label : true,
		"vertical" : false,
		"rounded" : 4
	});

	var dataAdapter = new RegionCellBaseDataAdapter(this.species,{resource : "cytoband"});
	dataAdapter.successed.addEventListener(function(evt, data) {
		if (data!=null && data[0].length>0){
			_this.lastPosition = data[0][data[0].length-1].end;
			
			if(_this.position > _this.lastPosition){
				_this.position = _this.lastPosition/2;
			}
//			_this.onLastChrPosition.notify();
		}
		_this.chromosomeFeatureTrack.draw(dataAdapter.dataset);
		_this.chromosomeFeatureTrack.select(_this.position-1000, _this.position+1000);
		_this.chromosomeFeatureTrack.click.addEventListener(function(evt, data) {
			_this.onLocationChange.notify({position:Math.ceil(data),sender:"_drawChromosome"});
//			_this.position = Math.ceil(data);
//			_this.refreshMasterGenomeViewer();
		});
	});
	dataAdapter.fill(this.chromosome, 1, 260000000, "cytoband");
//	this._getPanel().setLoading("Retrieving data");
};

//BOTTOM BAR

GenomeViewer.prototype._getBottomBar = function() {
	var geneFeatureFormatter = new GeneFeatureFormatter();
	var snpFeatureFormatter = new SNPFeatureFormatter();
	var geneLegendPanel = new LegendPanel({title:'Gene legend'});
	var snpLegendPanel = new LegendPanel({title:'SNP legend'});
//	legendPanel.getPanel(geneFeatureFormatter.getBioTypeColors());
//	legendPanel.getColorItems(geneFeatureFormatter.getBioTypeColors());
	
	var scaleLabel = Ext.create('Ext.draw.Component', {
		id:this.id+"scaleLabel",
        width: 100,
        height: 20,
        items:[
            {type: 'text',text: 'Scale number',fill: '#000000',x: 10,y: 9,width: 5, height: 20},
            {type: 'rect',fill: '#000000',x: 0,y: 0,width: 2, height: 20},
			{type: 'rect',fill: '#000000',x: 2,y: 12, width: 100,height: 3},
			{type: 'rect',fill: '#000000',x: 101,y: 0, width: 2,height: 20}
		]
	});
//	scale.surface.items.items[0].setAttributes({text:'num'},true);
	
	var aboutLabel = Ext.create('Ext.container.Container', {
		id:this.id+'aboutLabel',
		padding:5,
		html: this.version
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
		width:300,
		height:28,
		items : [scaleLabel, 
		         '-',
		         geneLegendPanel.getButton(geneFeatureFormatter.getBioTypeColors()),
		         snpLegendPanel.getButton(snpFeatureFormatter.getBioTypeColors()),
		         '->']
	});
	
	var bottomBar = Ext.create('Ext.container.Container', {
		id:this.id+'bottomBar',
		layout:'hbox',
		cls:"bio-botbar x-unselectable",
		height:30,
		border:true,
		items : [aboutLabel,taskbar,legendBar]
	});
	return bottomBar;
};
//BOTTOM BAR

GenomeViewer.prototype._getTracksPanel = function() {
	var _this=this;
	if (this._mainPanel == null) {
		this._mainPanel = Ext.create('Ext.container.Container', {
			id:this.id+"_tracksContainer",
			autoScroll:true,
			flex: 1,  
			html:'<div height=2000px; overflow-y="scroll"; id = "'+this.id+'tracksSvg"></div>',
			listeners:{
				afterrender:function(){
					var div = $('#'+_this.id+"tracksSvg")[0];
					// _this.trackDataList = new TrackDataList(_this.species);
					_this.trackSvgLayout = new TrackSvgLayout(div,{
						width:_this.width-18,
						position:_this.position,
						chromosome:_this.chromosome,
						zoom : _this.zoom
					});
					_this.trackSvgLayout.onMove.addEventListener(function(sender,data){
						_this.onLocationChange.notify({position:data,sender:"trackSvgLayout"});
					});
					

//					var track1 = new TrackData("gene",{
//						adapter: new CellBaseAdapter({
//							category: "genomic",
//							subCategory: "region",
//							resource: "gene",
//							species: _this.species,
//							featureCache:{
//								gzip: true,
//								chunkSize:1000
//							}
//						})
//					});
//					_this.trackSvgLayout.addTrack(track1,{id:"gene",type:"gene"});
//					console.log(track1.adapter.featureCache.cache);
					
					var seqtrack = new TrackData("sequence",{
						adapter: new CellBaseAdapter({
							category: "genomic",
							subCategory: "region",
							resource: "sequence",
							species: _this.species,
							featureCache:{
								gzip: false,
								chunkSize:1000
							}
						})
					});
					_this.trackSvgLayout.addTrack(seqtrack,{id:"sequence",type:"sequence"/*,render:""GeneRender*/});
					
					
//					var track2 = new TrackData("vcf",{
//						adapter: new VCFDataAdapter(new UrlDataSource("http://rsanchez/example.vcf"),{
//							async: false,
//							gzip: false
//						})
//					});
//					_this.trackSvgLayout.addTrack(track2,{id:"vcf",type:"vcf"});
					
//					var track3 = new TrackData("gff",{
//						adapter: new GFFDataAdapter(new UrlDataSource("http://rsanchez/example.gff"),{
//							async: false,
//							gzip: false
//						})
//					});
//					_this.trackSvgLayout.addTrack(track3,{id:"gff",type:"gff"});
//					console.log(track3.adapter.featureCache.cache);

//					var track4 = new TrackData("bed",{
//						adapter: new BEDDataAdapter(new UrlDataSource("http://rsanchez/example.bed"),{
//							async: false,
//							gzip: false
//						})
//					});
//					_this.trackSvgLayout.addTrack(track4,{id:"bed",type:"bed"});
					
//					// load vcf file from file widget
//					var vcf = new TestVCFFileWidget({viewer:this});
//					vcf.onComplete.addEventListener(function(sender, data){
//						vcf.onOk.addEventListener(function(sender){
//							_this.trackSvgLayout.addTrack(data,{id:"vcf",type:"vcf",render:""/*GeneRender*/});
//						});
//					});
//					vcf.draw();
					
//					this.trackSvgLayout.addTrack(track3,{id:"vcf",type:"snp",render:""/*GeneRender*/});
					
					

					//track3.adapter.onLoad.addEventListener(function(sender){
						//_this.trackSvgLayout.addTrack(track3,{id:"vcf",type:"snp",render:""/*GeneRender*/});
					//});
					
					
					// _this.trackSvgLayout.addTrack({id:"gene",resource:"gene"});
					//_this.trackSvgLayout.addTrack({id:"snp",resource:"snp"});
					
					//setTimeout(function() {
						//_this.trackSvgLayout.addTrack({id:"track4"});
					//},5000);
				}
			}
		});
	}
	return this._mainPanel;
};
