function GenomeViewer(targetId, species, args) {
	var _this=this;
	this.id = "GenomeViewer"+ Math.round(Math.random()*10000);
	this.menuBar = null;
	
	// if not provided on instatiation
	this.width =  $(document).width();
	this.height = $(document).height();
	this.lastPosition=260000000;
	this.targetId=null;
	
	//Default values
	this.species="hsa";
	this.speciesName="Homo sapiens";
	this.increment = 5;
	this.zoom=100;
	this.version="";
	
//	this.firstLoad=true;
	
//	this.firstLoad=true;
	
	//Setting paramaters
	if (targetId != null){
		this.targetId=targetId;
	}
	if (species != null) {
		this.species = species.species;
		this.speciesName = species.name;
		this.chromosome = parseInt(species.chromosome);//parseInt is important for genomeWidgetProperties
		this.position = parseInt(species.position);
	}
	if (args != null){
		if(args.description != null){
			args.description = "beta";
		}
		if(args.menuBar != null){
			this.menuBar = args.menuBar;
		}
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.pluginsMenu != null) {
			this.pluginsMenu = args.pluginsMenu;
		}
		if (args.chromosome != null) {
			this.chromosome = parseInt(args.chromosome);
		}
		if (args.position != null) {
			this.position = parseInt(args.position);
		}
		if (args.version != null) {
			this.version = args.version;
		}
	}

	//Events i send
	this.onSpeciesChange = new Event();
	this.afterLoading = new Event();
	this.onLastChrPosition = new Event();
	
	
	console.log(this.width+"x"+this.height);
	console.log(this.targetId);
	console.log(this.id);
	
	
	this.genomeWidget = null;// new GenomeWidget(this.id + "id",
//	this.chromosomeGenomeWidget = null;
	this.genomeWidgetProperties = new GenomeWidgetProperties(this.species,{
				width:this.width,
				windowSize : 1000000,
				pixelRatio : 0.0005,
				id:this.id,
				zoom:this.zoom,
				increment:this.increment
	});
	
	//Events i listen
	this.onSpeciesChange.addEventListener(function(sender,data){
		_this._changeSpecies(data);
	});
	
	this.customTracksAddedCount = 1;
	/** position molona 1: 211615616 **/
//	$(window).resize(function(ev,width,height) {
//
//	});	
	
	//used to know if the method _drawGenomeViewer is already called
	this.drawing=0;
	this.loading=true;
	this.afterLoading.addEventListener(function(sender,data){
		_this.loading=false;
	});
	
};

GenomeViewer.prototype._changeSpecies = function(data){
	this.species = data.species;
	this.speciesName = data.name;
	Ext.getCmp(this.id+"speciesMenuButton").setText(this.speciesName);
	Ext.example.msg('Species', this.speciesName+' selected.');
	
	Ext.getCmp(this.id + "chromosomeMenuButton").menu = this._getChromosomeMenu();

	
	this.genomeWidgetProperties = new GenomeWidgetProperties(this.species,{
		width:this.width,
		windowSize : 1000000,
		pixelRatio : 0.0005,
		id:this.id,
		zoom:this.zoom,
		increment:this.increment
	});
	
	this.setLocation(data.chromosome,data.position);
	this._getKaryotypePanel(true);

	if(this.targetId!=null){
		this.draw();
	}
};



GenomeViewer.prototype.setMenuBar = function(menuBar){
	this.menuBar = menuBar;
};

GenomeViewer.prototype.draw = function(){
	if(this.targetId!=null){
		this._getPanel(this.width,this.height);
	}
	this._render();
	//this.setZoom(70);
	//this.setLocation(1, 211615616);
};

GenomeViewer.prototype._render = function() {
	var _this=this;
	var start = this.position - (this.genomeWidgetProperties.windowSize);
	var end = this.position + (this.genomeWidgetProperties.windowSize);
	
//	console.log(start+":"+end);
	
	this.onLastChrPosition.addEventListener(function(sender,data){
		_this._drawGenomeViewer();
	});
	
	this.drawChromosome(this.chromosome, start, end);
	
	this._setScaleLabels();
};


//Gets the panel containing all genomeViewer
GenomeViewer.prototype._getPanel = function(width,height) {
	var _this=this;

	if(this._panel == null){
		var items = [];
		if(this.menuBar!=null){
			items.push(this.menuBar);
		}
		items.push(this._getNavigationBar());
		items.push(this._getKaryotypePanel().hide());
		items.push(this._getChromosomePanel());
		items.push(this._getRegionPanel());
		items.push(this._getWindowSizePanel());
		items.push(this._getTracksPanel());
		items.push(this._getBottomBar());
		
		this._panel = Ext.create('Ext.panel.Panel', {
			id:this.id+"_panel",
			renderTo:this.targetId,
	    	border:false,
	    	width:width,
	    	height:height,
			cls:'x-unselectable',
			layout: { type: 'vbox',align: 'stretch'},
			region : 'center',
			margins : '0 0 0 0',
			items :items
		});
	}
	return this._panel;
};

GenomeViewer.prototype.setSize = function(width,height) {
	if(width<500){width=500;}
	if(width>2400){width=2400;}//if bigger does not work TODO why?
	this.width=width;
	this.height=height;
	this._getPanel().setSize(width,height);
	
	Ext.getCmp(this.id+"windowSizeCont").update(this._getWindowSizeArrow("main"));
	Ext.getCmp(this.id+"regionWindowSizeCont").update(this._getWindowSizeArrow("region"));
	this.draw();
};


//NAVIGATION BAR
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
GenomeViewer.prototype.setSpecies = function(text){
	this.onSpeciesChange.notify(text);
};

GenomeViewer.prototype._getChromosomeMenu = function() {
	var _this = this;
	var chrStore= Ext.create('Ext.data.Store', {
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
 					_this.setChromosome(selNodes[0].data.name);
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
	
	//Load Chromosomes for his menu
	var karyotypeCellBaseDataAdapter = new KaryotypeCellBaseDataAdapter(this.species);
	karyotypeCellBaseDataAdapter.successed.addEventListener(function() {
		var chromosomeData = [];
		for (var i = 0; i < karyotypeCellBaseDataAdapter.chromosomeNames.length; i++) {
			chromosomeData.push({'name':karyotypeCellBaseDataAdapter.chromosomeNames[i]});
		}
//		console.log(chromosomeData);
		chrStore.loadData(chromosomeData);
	});
	karyotypeCellBaseDataAdapter.fill();
	
	return chromosomeMenu;
};


//GenomeViewer.prototype._showKaryotypeWindow = function() {
//	var _this = this;
//	
//	var karyotypePanelWindow = new KaryotypePanelWindow(this.species,{viewer:this,mode:"window"});
//	
//	/** Events i listen **/
//	karyotypePanelWindow.onRendered.addEventListener(function(evt, feature) {
//		karyotypePanelWindow.select(_this.chromosome, _this.position, _this.position);
//	});
//	karyotypePanelWindow.onMarkerChanged.addEventListener(function(evt, data) {
//		_this.setLocation(data.chromosome, data.start);
//	});
//	
//	karyotypePanelWindow.draw();
//};


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




//Action for buttons located in the NavigationBar
GenomeViewer.prototype._handleNavigationBar = function(action, args) {
	var _this = this;
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
        this.chromosome = value.split(":")[0];
        
        // Validate chromosome and position
        if(isNaN(position) || position < 0){
        	Ext.getCmp(this.id+'tbCoordinate').markInvalid("Position must be a positive number");
        }
        else if(Ext.getCmp(this.id+"chromosomeMenu").almacen.find("name", this.chromosome) == -1){
        	Ext.getCmp(this.id+'tbCoordinate').markInvalid("Invalid chromosome");
        }
        else{
        	this.setLocation(this.chromosome, position);
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
//		        		 _this._showKaryotypeWindow();
		        		 if(this.pressed){
		        			 _this._getKaryotypePanel().show();
		        		 }else{
		        			 _this._getKaryotypePanel().hide();
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
		        			 _this._getChromosomePanel().show();
		        		 }else{
		        			 _this._getChromosomePanel().hide();
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
//NAVIGATION BAR




GenomeViewer.prototype._getKaryotypePanel = function(specieChanged) {
	var _this = this;
	if(this._karyotypeCont == null ){
		this._karyotypeCont = Ext.create('Ext.panel.Panel',{
			title:'Karyotype',
			border:false,
			cls:'border-bot panel-border-top',
			id:this.id+"_karyotypeCont"
		});
	}
	
	if(specieChanged == true){//
		this._karyotypePanel.getKaryotypePanel().destroy();
		this._karyotypePanel=null;
	}
	
	if(this._karyotypePanel==null){
		this._karyotypePanel = new KaryotypePanelWindow(this.species,{viewer:this,height:150,width:this.width});
		
		this._karyotypeCont.add(this._karyotypePanel.getKaryotypePanel());
		/** Events i listen **/
		this._karyotypePanel.onRendered.addEventListener(function(evt, feature) {
			_this._karyotypePanel.select(_this.chromosome, _this.position, _this.position);
		});
		this._karyotypePanel.onMarkerChanged.addEventListener(function(evt, data) {
			_this.setLocation(data.chromosome, data.start);
		});
		this._karyotypePanel.karyotypeCellBaseDataAdapter.fill();
		
		//TODO para la 4.1rc3
//		Ext.getCmp(this.id+"karyotypeButton").toggle();
//		Ext.getCmp(this.id+"karyotypeButton").toggle();
	}
	return this._karyotypeCont;
};





//CHROMOSOME PANEL
//Sets the newChromosome and changes Location to same with on different chromosome
GenomeViewer.prototype.setChromosome = function(chromosome) {
	this.setLocation(chromosome, this.position);
	this._setChromosomeLabel(chromosome);
};
GenomeViewer.prototype._setChromosomeLabel = function(chromosome) {
//	var text = '<span class="ssel">'+this.species+'</span>'+"<br>Chromosome "+ chromosome;
	document.getElementById(this._getChromosomeLabelID()).innerHTML = "Chromosome&nbsp;"+ chromosome;
	Ext.getCmp(this.id + "chromosomeMenuButton").setText("Chromosome "+ chromosome );
};
//CHROMOSOME PANEL
GenomeViewer.prototype._getChromosomeContainerID = function() {
	return this.id + "container_map_one_chromosome";
};

GenomeViewer.prototype._getChromosomeLabelID = function() {
	return this.id + "chromosome_label_id";
};
GenomeViewer.prototype._getChromosomePanel = function() {
	if(this._chromosomePanel==null){
		var label = Ext.create('Ext.container.Container', {
			id:this._getChromosomeLabelID(),
			margin:5
		});
		var svg = Ext.create('Ext.container.Container', {
			id:this._getChromosomeContainerID(),
			margin:10
		});
		this._chromosomePanel =  Ext.create('Ext.panel.Panel', {
			id:this.id+"_chromosomePanel",
			height : 95,
			title:'Chromosome',
			border:false,
			cls:'border-bot panel-border-top',
			layout: {type: 'table', columns: 2},
			items:[label,svg]
//		html : '<br/><table style="border:0px" ><tr><td id="'
//				+ this._getChromosomeLabelID()
//				+ '" style="padding-left: 8px">Chromosome&nbsp;15</td><td><div id="'
//				+ this._getChromosomeContainerID() + '"></td></tr></div>'
		});
	}
	return this._chromosomePanel;
};
//CHROMOSOME PANEL


//WINDOWSIZE PANEL
GenomeViewer.prototype._getWindowSizeArrow = function(arrowName) {
	var trueWidth = this.width-16;
	var trueWidth10 = trueWidth-10;
	var halfWidth = (trueWidth/2)-60;
	var tbgs = (trueWidth/2)-70;
	var tbge = (trueWidth/2)+75;
	var svgItem ='<svg xmlns="http://www.w3.org/2000/svg" version="1.1">'+
				 '<path fill="black" opacity="0.3" d="M0 5 L10 0 L10 10  Z" />'+
				 '<path fill="black" opacity="0.3" d="M10 4 L10 6 L'+trueWidth10+' 6 L'+trueWidth10+' 4 Z" />'+
				 '<path fill="black" opacity="0.3" d="M'+trueWidth+' 5 L'+trueWidth10+' 0 L'+trueWidth10+' 10 Z" />'+
				 '<path fill="white" opacity="1" d="M'+tbgs+' 4 L'+tbgs+' 6 L'+tbge+' 6 L'+tbge+' 4 Z" />'+
				 '<text id="'+this.id+arrowName+"windowSizeLabel"+'" x="'+halfWidth+'" y="10" fill="blue">nt</text>'+
				 '</svg>';
	return svgItem;
};
GenomeViewer.prototype._getWindowSizePanel = function() {
	return Ext.create('Ext.panel.Panel', {
		id:this.id+"windowSizeCont",
		bodyPadding:'1 0 0 0',
		border:false,
		cls:'panel-border-top',
		title:'Detailed Information',
		height :40,
		html:this._getWindowSizeArrow("main")
	});
};
//WINDOWSIZE PANEL


//REGION PANEL
GenomeViewer.prototype._getRegionPanel = function() {
	var _this = this;
	if(this._regionCont == null ){
		var regionWindowSize = Ext.create('Ext.container.Container',{
			id:this.id+"regionWindowSizeCont",
			margin:'1 0 0 0',
			height : 13,
			html:this._getWindowSizeArrow("region")
		});
		var regionCont = Ext.create('Ext.container.Container',{
			id:this.id+"_regionCont",
			height:110,
			autoScroll:true
		});
		this._regionCont = Ext.create('Ext.panel.Panel',{
			id:this.id+"_regionPan",
			border:false,
			title:'Region Overview',
			cls:'border-bot panel-border-top',
			items:[regionWindowSize,regionCont]
		});
	}
	return this._regionCont;
};


//TOP PANEL
GenomeViewer.prototype._getTracksPanelID = function() {
	return this.id+"_master";
};

GenomeViewer.prototype._getTracksPanel = function() {
	var _this=this;
	if (this._mainPanel == null) {
		this._mainPanel = Ext.create('Ext.container.Container', {
			id:this.id+"_mainContainer",
			autoScroll:true,
			flex: 1,  
			html:'<div height=2000px; overflow-y="scroll"; id = "'+ this._getTracksPanelID() +'"></div>'
		});
	}
	return this._mainPanel;
};
//TOP PANEL


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
            {type: 'text',text: 'Scale number',fill: '#000000',x: 10,y: 5,width: 5, height: 20},
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





GenomeViewer.prototype.openListWidget = function(category, subcategory, query, resource, title, gridField) {
	var _this = this;
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function(evt, data) {
		
		var genomicListWidget = new GenomicListWidget(_this.species,{title:title, gridFields:gridField,viewer:_this});
		genomicListWidget.draw(cellBaseDataAdapter.dataset.toJSON(), query );
		
		genomicListWidget.onSelected.addEventListener(function(evt, feature) {
			if (feature != null) {
				if (feature.chromosome != null) {
					_this.setLocation(feature.chromosome, feature.start);
				}
			}
		});
		
		genomicListWidget.onTrackAddAction.addEventListener(function(evt, features) {
			if (features != null) {
				_this.addTrackFromFeatures(features);
			}
		});
	});
	cellBaseDataAdapter.fill(category, subcategory, query, resource);
};




GenomeViewer.prototype.openGeneListWidget = function(geneName) {
	this.openListWidget("feature", "gene", geneName.toString(), "info", "Gene List");
};

GenomeViewer.prototype.openTranscriptListWidget = function(name) {
	this.openListWidget("feature", "transcript", name.toString(), "info", "Transcript List", ["externalName","stableId", "biotype", "chromosome", "start", "end", "strand", "description"]);
};

GenomeViewer.prototype.openExonListWidget = function(geneName) {
	var _this = this;
	var cellBase = new CellBaseDataAdapter(this.species);
	cellBase.successed.addEventListener(function(evt, data) {
		var window = new GenomicListWidget({title:'Exon List', gridFields:["stableId", "chromosome","start", "end", "strand"]});	
		var array = new Array();
		array.push(cellBase.dataset.toJSON());
		window.draw(array, geneName );
		window.onSelected.addEventListener(function(evt, feature) {
			if (feature != null) {
				if (feature.chromosome != null) {
					_this.setLocation(feature.chromosome, feature.start);
				}
			}
		});
		
		
	});
	cellBase.fill("feature", "exon", geneName.toString(), "info");
};

GenomeViewer.prototype.openSNPListWidget = function(snpName) {
	this.openListWidget("feature", "snp", snpName.toString(), "info", "SNP List", ["name", "variantAlleles", "ancestralAllele", "mapWeight",  "position", "sequence"]);
};

GenomeViewer.prototype.openGOListWidget = function(goList) {
	var _this = this;
	var cellBase = new CellBaseDataAdapter(this.species);
	cellBase.successed.addEventListener(function(evt, data) {
		
		var geneNames = new Array();
		for (var i = 0; i < cellBase.dataset.toJSON()[0].length; i++){
			geneNames.push(cellBase.dataset.toJSON()[0][i].displayId);
		}
		_this.openGeneListWidget(geneNames);
	});
	cellBase.fill("feature", "id", goList.toString(), "xref?dbname=ensembl_gene&");
};



GenomeViewer.prototype.drawChromosome = function(chromosome, start, end) {
	var _this = this;
	this._setChromosomeLabel(chromosome);
	DOM.removeChilds(this._getChromosomeContainerID());
	var width = this.width - 100;
	this.chromosomeFeatureTrack = new ChromosomeFeatureTrack(this.id + "chr", document.getElementById(this._getChromosomeContainerID()), this.species,{
		top : 5,
		bottom : 20,
		left : 10,
		right : width - 100,
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
//			console.log(_this.lastPosition);
			
			if(_this.position > _this.lastPosition){
				_this.position = _this.lastPosition/2;
			}
//			_this.firstLoad=false;
			
			_this.onLastChrPosition.notify();
//			_this._getPanel().setLoading(false);
		}
		_this.chromosomeFeatureTrack.draw(dataAdapter.dataset);
		_this.chromosomeFeatureTrack.click.addEventListener(function(evt, data) {
//			_this.setLocation(_this.chromosome, data);
			_this.position = Math.ceil(data);
			_this.refreshMasterGenomeViewer();
		});
	});

	dataAdapter.fill(chromosome, 1, 260000000, "cytoband");
	this._getPanel().setLoading("Retrieving data");
};


GenomeViewer.prototype._setScaleLabels = function() {
	var value = Math.floor(100/this.genomeWidgetProperties.getPixelRatio()) + " nt ";
	var ntWidth = "Viewing "+Math.ceil((this.width-16)/this.genomeWidgetProperties.getPixelRatio()) + " nts ";
	
	
	var pixelRatio2 = this.genomeWidgetProperties._zoomLevels[this.zoom-40];
	var ntWidth2 = "Viewing "+Math.ceil((this.width-16)/pixelRatio2) + " nts ";
	
	Ext.getCmp(this.id+"scaleLabel").surface.items.items[0].setAttributes({text:value},true);
	//Change svg text 
	Ext.getDom(this.id+"mainwindowSizeLabel").firstChild.nodeValue=ntWidth;
	Ext.getDom(this.id+"regionwindowSizeLabel").firstChild.nodeValue=ntWidth2;
};

GenomeViewer.prototype.setZoom = function(value) {
	if(!this.loading){
		this.loading=true;
		this.genomeWidgetProperties.setZoom(value);
		this.zoom = value;
		
		this.position = this.genomeWidget.getMiddlePoint();
		this._getZoomSlider().setValue(value);
		
		//TODO ORIG descomentar
//	this.genomeWidget.trackCanvas._goToCoordinateX(this.position- (this.genomeWidget.trackCanvas.width / 2)/ this.genomeWidgetProperties.getPixelRatio());
		this._setScaleLabels();
		this.refreshMasterGenomeViewer();
	}
};


GenomeViewer.prototype.setLocation = function(chromosome, position) {
	this.chromosome = chromosome;
	this.position = Math.ceil(position);
	
	this._karyotypePanel.select(this.chromosome, this.position, this.position);
	this.drawChromosome(this.chromosome, 1, 26000000);
	this.refreshMasterGenomeViewer();
};


GenomeViewer.prototype._setPositionField = function(chromosome, position) {
	if (isNaN(position)){
		position = 1000000;
	}
	if (position < 0){
		Ext.getCmp(this.id+'tbCoordinate').setValue(chromosome + ":" + 0);
	}
	else{
		Ext.getCmp(this.id+'tbCoordinate').setValue( chromosome + ":" + Math.ceil(position));
	}
};



GenomeViewer.prototype._getWindowsSize = function() {
//	var zoom = this.genomeWidgetProperties.getZoom();
	return this.genomeWidgetProperties.getWindowSize(this.zoom);
};

GenomeViewer.prototype.refreshMasterGenomeViewer = function() {
//	this.updateRegionMarked(this.chromosome, this.position);
	this._drawGenomeViewer();
};

GenomeViewer.prototype._drawGenomeViewer = function() {
	//This method filters repetitive calls to _drawOnceGenomeViewer
	var _this = this;
	_this.drawing += 1;
	setTimeout(function() {
		_this.drawing -= 1;
		if(_this.drawing==0){
			_this._drawGenomeWidget();
			_this._drawRegionGenomeWidget();
		}
	},500);
};

GenomeViewer.prototype._drawGenomeWidget = function() {
	var _this = this;
	this._getPanel().disable();
	this._getPanel().setLoading("Retrieving data");
//	this.updateTracksMenu();

	if(this.genomeWidget!=null){
		this.genomeWidget.clear();
	}
	
	var pixelRatio = this.genomeWidgetProperties.getPixelRatio();
	
	this.genomeWidget = new GenomeWidget(this.id + "_master", this._getTracksPanelID(), {
	                pixelRatio: pixelRatio,
	                width:this.width-16,
	                lastPosition : this.lastPosition,
	                viewer:this,
//	                height:  this.height
	                height:  2000
	});
	
//	var zoom = this.genomeWidgetProperties.getZoom();
	var zoom = this.zoom;
	
	if (this.genomeWidgetProperties.getTrackByZoom(zoom).length > 0){
		for ( var i = 0; i < this.genomeWidgetProperties.getTrackByZoom(zoom).length; i++) {
			var track =  this.genomeWidgetProperties.getTrackByZoom(zoom)[i];
			track.top = track.originalTop;
			track.height = track.originalHeight;
			track.clear();
			this.genomeWidgetProperties.getDataAdapterByZoom(zoom)[i].datasets = new Object();
			this.genomeWidget.addTrack(track, this.genomeWidgetProperties.getDataAdapterByZoom(zoom)[i]);
		}
		
		
		/*orig*/
		var data_start = Math.ceil(this.position - (this._getWindowsSize()));// - (this._getWindowsSize()/6);
		var data_end = Math.ceil(this.position +   (this._getWindowsSize()));// - (this._getWindowsSize()/6);
		
////	/*TODO*/
//		var halfBases = (this.width-15) / pixelRatio / 2;
//		var start =  Math.ceil(this.position - halfBases);
//		var end = Math.ceil(this.position + halfBases);
//		/**/
		var halfBases = ((this.width-16) / pixelRatio) / 2;
		var view_start=Math.ceil(this.position - halfBases);
		var view_end= Math.ceil(this.position + halfBases);
		
		
		if (data_start < 0){ 
			data_start = 0;
		}
		
		this.genomeWidget.onMove.addEventListener(function (evt, positionObj){
			if(_this.genomeWidget.trackCanvas.hasFocus){
				_this._userMove(positionObj);
			}
		});
		 
		this.genomeWidget.onRender.addEventListener(function (evt){
			_this._getPanel().enable(false);
			_this._getPanel().setLoading(false);
			_this.afterLoading.notify();
			
			//TODO pako doing descomentar para el funcionamiento anterior
//			_this.genomeWidget.trackCanvas.selectPaintOnRules(_this.position);

		 });
		 
		//TODO Orig descomentar
//		this._setPositionField(this.chromosome, this.position);
		this.genomeWidget.draw(this.chromosome, data_start, data_end, view_start, view_end);
		
	}
	else{
		_this._getPanel().setLoading("No tracks to display");
	}
	
};

GenomeViewer.prototype._drawRegionGenomeWidget = function() {
	var _this=this;
	var contextZoom = this.zoom-40;

	var pixelRatio2 = this.genomeWidgetProperties._zoomLevels[contextZoom];
	this.genomeWidget2 = new GenomeWidget(this.id+"_region", this.id+"_regionCont", {
		pixelRatio: pixelRatio2,
		width:this.width-16,
		allowDragging:false,
		hasFocus:false,
		lastPosition : this.lastPosition,
		viewer:this,
//		height:  this.height
		height:  2000
	});
	var rule = new RuleFeatureTrack(this.genomeWidget2.id, this.id+"_RegionCont", this.species,{
		top:10, 
		left:0, 
		height:20, 
		expandRuleHeight : 1500,
		labelHeight : 10,
		featureHeight : 4,
		floating:true
	});
	var track = new MultiFeatureTrack(this.genomeWidget2.id, this.id+"_RegionCont", this.species,{
		top : 20,
		left : 0,
		height : 10,
		labelHeight : 10,
		featureHeight : 4,
		labelSize : 10,
		title : "Gene",
		titleWidth : 30,
		titleFontSize : 9,
		showTranscripts : false,
		allowDuplicates : false,
		backgroundColor : '#FFFFFF',
		label : true,
		pixelSpaceBetweenBlocks : 100,
		showDetailGeneLabel : false,
		isAvalaible : true
	});
	var track2 = new HistogramFeatureTrack(this.genomeWidget2.id, this.id+"_RegionCont", this.species,{
		top : 20,
		left : 0,
		height : 40,
		featureHeight : 40,
		title : "Gene",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : "blue"
//		intervalSize : 500000
	});
	
	this.genomeWidget2.addTrack(rule, new RuleRegionDataAdapter({pixelRatio: pixelRatio2}));
	if(contextZoom <=10){
		this.genomeWidget2.addTrack(track2, new RegionCellBaseDataAdapter(this.species,{resource : "gene?histogram=true&interval="+this.genomeWidgetProperties._interval[contextZoom]}));
	}else{
		this.genomeWidget2.addTrack(track, new RegionCellBaseDataAdapter(this.species,{resource : "gene"}));
	}

	var data_start = Math.ceil(this.position - (this.genomeWidgetProperties.getWindowSize(contextZoom)));
	var data_end = Math.ceil(this.position +   (this.genomeWidgetProperties.getWindowSize(contextZoom)));
	var halfBases = ((this.width-16) / pixelRatio2) / 2;
	var view_start=Math.ceil(this.position - halfBases);
	var view_end= Math.ceil(this.position + halfBases);
	if (data_start < 0){ 
		data_start = 0;
	}
	
//	this.genomeWidget2.onMove.addEventListener(function (evt, positionObj){
//		if(_this.genomeWidget2.trackCanvas.hasFocus){
//			_this._userMove(positionObj);
//		}
//	});
	
	this.genomeWidget2.draw(this.chromosome, data_start, data_end, view_start, view_end);
};

GenomeViewer.prototype._userMove = function(positionObj){
	console.log(positionObj);
	//posición actual
	var last = this.position;
	
//	console.log(positionObj.middle);
	var window = this.genomeWidgetProperties.windowSize/2;
//	console.log(window);
	
	//TODO pako movido de la linea de abajo, asi se actualiza a la vez el textfield
	this.position = Math.floor(positionObj.middle);
	this._setPositionField(this.chromosome, this.position);
	this._karyotypePanel.select(this.chromosome, this.position, this.position);
	
	var start = this.position - window;
	if (start < 0 ){start = 0;}
	this.updateRegionMarked(this.chromosome, this.position);
	
	
	if(this.genomeWidget.trackCanvas.hasFocus){
		this.genomeWidget2.trackCanvas.moveX(Math.floor(this.position-last));
	}
	if(this.genomeWidget2.trackCanvas.hasFocus){
		this.genomeWidget.trackCanvas.moveX(Math.floor(this.position-last));
	}
};



GenomeViewer.prototype.updateRegionMarked = function(chromosome, middlePosition) {
	var window = this.genomeWidgetProperties.windowSize / 2;

	var start = middlePosition - window;
	if (start < 0) {
		start = 0;
	}
	var end = middlePosition + window;

	this.chromosomeFeatureTrack.select(start, end);
	
//	this.chromosomeFeatureTrack.mark({chromosome:this.chromosome, start:this.position, end:this.position}, "red");
};



/** DAS MENU * */
GenomeViewer.prototype.loadDASTrack = function(name, url) {
//	var counter = 1;	
//	while (this.genomeWidgetProperties.tracks[name] != null)
//	{
//		counter++;
//		var aux =  name + "("+ counter+")";
//		if(this.genomeWidgetProperties.tracks[aux] == null){
//			name =aux;
//		}
//	}
	
	if(this.genomeWidgetProperties.tracks[name] == undefined){
		
		var dasDataAdapter2 = new DasRegionDataAdapter({url : url});
		
		var dasTrack1 = new FeatureTrack(this.genomeWidget.id, null, this.species,{
			top : 10,
			left : 0,
			height : 15,
//			labelHeight : 12,
//			featureHeight : 12,
			title : name,
			opacity : 0.9,
			titleFontSize : 9,
			forceColor : "purple",
			label : true,
			avoidOverlapping : true,
			pixelSpaceBetweenBlocks : 100,
			allowDuplicates : true,
			backgroundColor : "#FCFFFF",
			isAvalaible : false
		});
		this.genomeWidgetProperties.addCustomTrackByZoom(0, 55, dasTrack1,dasDataAdapter2);
		var dasTrack = new FeatureTrack(this.genomeWidget.id, null, this.species,{
			top : 10,
			left : 0,
			height : 10,
//			labelHeight : 10,
//			featureHeight :10,
			title : name,
			titleFontSize : 9,
			forceColor : "purple",
			label : true,
			avoidOverlapping : true,
			pixelSpaceBetweenBlocks : 100,
			allowDuplicates : true,
			backgroundColor : "#FCFFFF",
			isAvalaible : true
		});
		this.genomeWidgetProperties.addCustomTrackByZoom(60, 100, dasTrack,dasDataAdapter2);
	}
	
//	this.refreshMasterGenomeViewer();
};

//TODO aqui estaba getDasMenu


GenomeViewer.prototype.addFeatureTrack = function(title, dataadapter) {
	var _this = this;
	this._getPanel().setLoading();
	if (dataadapter != null) {
		
		var available = true;
		if(dataadapter.featuresByChromosome[this.chromosome]!=null && dataadapter.featuresByChromosome[this.chromosome].length > 1000){
			available = false;
		}
		
		var track = new FeatureTrack(this.genomeWidget.id, null, this.species,{
			top : 20,
			left : 0,
			height : 20,
			featureHeight : 18,
			title : title,
			titleFontSize : 9,
			titleWidth : 70,
			label : false,
			forceColor : "purple",
			intervalSize : 500000,
			isAvalaible: available
			
		});
		
		_this.genomeWidgetProperties.addCustomTrackByZoom(0, 20, track, dataadapter);
		
		var vcfTrack2 = new FeatureTrack(this.genomeWidget.id, null, this.species,{
					top : 10,
					left : 0,
					height : 10,
					title : title,
					label : false,
					avoidOverlapping : true,
					pixelSpaceBetweenBlocks : 1,
					allowDuplicates : true
				});
		_this.genomeWidgetProperties.addCustomTrackByZoom(25, 80, vcfTrack2, dataadapter);

		var vcfTrack2 = new FeatureTrack(this.genomeWidget.id, null, this.species,{
					top : 10,
					left : 0,
					height : 10,
					title : title,
//					forceColor : "purple",
					label : true,
					avoidOverlapping : true,
					pixelSpaceBetweenBlocks : 75,
					allowDuplicates : true
				});
		_this.genomeWidgetProperties.addCustomTrackByZoom(85, 90, vcfTrack2, dataadapter);
		
		var vcfTrack100 = new SNPFeatureTrack(this.genomeWidget.id, null, this.species,{
			top : 10,
			left : 0,
			height : 20,
			title : title,
			featureHeight:10,
//			forceColor : "purple",
			label : true,
			avoidOverlapping : true,
			pixelSpaceBetweenBlocks : 75,
			allowDuplicates : true
		});
		_this.genomeWidgetProperties.addCustomTrackByZoom(95, 100, vcfTrack100, dataadapter);
		
		_this._drawGenomeViewer();
	}
};



GenomeViewer.prototype.addTrackFromFeatures = function(features, trackName) {
	var localRegionAdapter = new LocalRegionDataAdapter();
	localRegionAdapter.loadFromFeatures(features);
	
	if(trackName==null){trackName="";}
	
	this.addFeatureTrack( trackName.substr(0,20) + " #" +this.customTracksAddedCount,localRegionAdapter);
	this.customTracksAddedCount++;
};

GenomeViewer.prototype.addTrackFromFeaturesList = function(data) {
	var features = new Array();
	
	for ( var i = 0; i < data.features.length; i++) {
		for ( var j = 0; j < data.features[i].length; j++) {
			features.push(data.features[i][j]);
		}
	}
	this.addTrackFromFeatures(features, data.trackName);
};
