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

//	this.geneBioTypeColors = this.getGeneBioTypeColors();
//	this.snpBioTypeColors = this.getSnpBioTypeColors();
	
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
//	var items = [];
//	if(this.toolbar!=null){
//		items.push(this.toolbar);
//	}
//	items.push(this._getNavigationBar());
//	//items.push(this._getKaryotypePanel().hide());
//	items.push(this._drawChromosomePanel());
//	items.push(this._drawKaryotypePanel().hide());
//	//items.push(this._getChromosomePanel());
//
////	items.push(this._getWindowSizePanel());
//	items.push(this._drawTracksPanel());
//	items.push(this._drawRegionPanel().hide());
//	items.push(this._getBottomBar());
	
	var container = Ext.create('Ext.container.Container', {
		id:this.id+"container",
		renderTo:this.targetId,
    	width:this.width,
    	height:this.height,
		cls:'x-unselectable',
		layout: { type: 'vbox',align: 'stretch'},
		region : 'center',
		margins : '0 0 0 0'
	});
	
	if(this.toolbar!=null){
		container.insert(0, this.toolbar);
	}
	container.insert(1, this._getNavigationBar());
	container.insert(2, this._drawKaryotypePanel().hide());
	container.insert(3, this._drawChromosomePanel());
	container.insert(4, this._drawTracksPanel());
	container.insert(5, this._getBottomBar());
	container.insert(3, this._drawRegionPanel().hide());//rendered after trackspanel but inserted with minor index
	
	Ext.getCmp(this.id+"regionPanel").show();//XXX for test purposes only
	Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
	Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.chromosome);
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
		Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
		Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.chromosome);
		Ext.getCmp(this.id+'tbCoordinate').setValue( this.chromosome + ":" + Math.ceil(this.position));
		Ext.getCmp(this.id+"speciesMenuButton").setText(this.speciesName);
		Ext.example.msg('Species', this.speciesName+' selected.');
		this._updateChrStore();
//		this._getKaryotypePanel(true);
		this.trackSvgLayout.setLocation({chromosome:this.chromosome,species:this.species,position:this.position});
		this.trackSvgLayout2.setLocation({chromosome:this.chromosome,species:this.species,position:this.position});
		this.chromosomeWidget.setLocation({chromosome:this.chromosome,species:this.species,position:this.position});
		this.karyotypePanel.setLocation({chromosome:this.chromosome,species:this.species,position:this.position});
		break;
	case "_getChromosomeMenu":
		if(this.chromosome!=data.chromosome){
			this.chromosome = data.chromosome;
			this.trackSvgLayout.setLocation({chromosome:this.chromosome});
			this.trackSvgLayout2.setLocation({chromosome:this.chromosome});
			this.chromosomeWidget.setLocation({chromosome:this.chromosome});
			this.karyotypePanel.setLocation({chromosome:this.chromosome,position:this.position});
		}
		Ext.getCmp(this.id+'tbCoordinate').setValue( this.chromosome + ":" + Math.ceil(this.position));
		Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
		Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.chromosome);
		break;
	case "GoButton":
		if(this.position!=data.position){
			this.position = data.position;
			this.trackSvgLayout.setLocation({position:this.position});
			this.trackSvgLayout2.setLocation({position:this.position});
			this.chromosomeWidget.setLocation({position:this.position});
			this.karyotypePanel.setLocation({position:this.position});
		}
		if(this.chromosome!=data.chromosome){
			this.chromosome = data.chromosome;
			this.trackSvgLayout.setLocation({chromosome:this.chromosome});
			this.trackSvgLayout2.setLocation({chromosome:this.chromosome});
			this.chromosomeWidget.setLocation({chromosome:this.chromosome});
			this.karyotypePanel.setLocation({chromosome:this.chromosome});
			Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
			Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.chromosome);
		}
		break;
	case "KaryotypePanel":
		if(this.chromosome!=data.chromosome){
			this.chromosome = data.chromosome;
			this.trackSvgLayout.setLocation({chromosome:this.chromosome});
			this.trackSvgLayout2.setLocation({chromosome:this.chromosome});
			this.chromosomeWidget.setLocation({chromosome:this.chromosome});
			Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
			Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.chromosome);
		}
		if(this.position!=data.position){
			this.position = data.position;
			this.trackSvgLayout.setLocation({position:this.position});
			this.trackSvgLayout2.setLocation({position:this.position});
			this.chromosomeWidget.setLocation({position:this.position});
			Ext.getCmp(this.id+'tbCoordinate').setValue(this.chromosome + ":" + Math.ceil(this.position));
		}
		break;
	case "ChromosomeWidget":
		this.position = data.position;
		this.trackSvgLayout.setLocation({position:this.position});
		this.trackSvgLayout2.setLocation({position:this.position});
		this.karyotypePanel.setLocation({position:this.position});
		Ext.getCmp(this.id+'tbCoordinate').setValue(this.chromosome + ":" + Math.ceil(this.position));
		break;
	case "trackSvgLayout":
		this.position -= data.position;
		Ext.getCmp(this.id+'tbCoordinate').setValue( this.chromosome + ":" + Math.ceil(this.position));
		this.chromosomeWidget.setLocation({position:this.position});
		this.karyotypePanel.setLocation({position:this.position});
		break;
	default:
	
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
		        			 Ext.getCmp(_this.id+"karyotypePanel").show();
		        		 }else{
		        			 Ext.getCmp(_this.id+"karyotypePanel").hide();
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
		        			 Ext.getCmp(_this.id+"chromosomePanel").show();
		        		 }else{
		        			 Ext.getCmp(_this.id+"chromosomePanel").hide();
		        		 }
		        	 }
		         },
		         {
		        	 id:this.id+"RegionToggleButton",
		        	 text : 'Region',
		        	 enableToggle:true,
		        	 toggleHandler:function() {
		        		 if(this.pressed){
		        			 Ext.getCmp(_this.id+"regionPanel").show();
		        		 }else{
		        			 Ext.getCmp(_this.id+"regionPanel").hide();
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
		        	 listeners : {
		        		 click:{
		        			 fn :function() {
		        				 var current = Ext.getCmp(_this.id+'zoomSlider').getValue();
		        				 Ext.getCmp(_this.id+'zoomSlider').setValue(current-_this.increment);
		        			 },
		        			 buffer : 400
		        		 }
		        	 }
		         }, 
		         this._getZoomSlider(), 
		         {
		        	 id:this.id+"zoomInButton",
		        	 margin:'0 5 0 0',
		        	 iconCls:'icon-zoom-in',
		        	 listeners : {
		        		 click:{
		        			 fn :function() {
		        				 var current = Ext.getCmp(_this.id+'zoomSlider').getValue();
		        				 Ext.getCmp(_this.id+'zoomSlider').setValue(current+_this.increment);
		        			 },
		        			 buffer : 400
		        		 }
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
			id : this.id+'zoomSlider',
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
		
		this._zoomSlider.on({
			'change': {
				fn: function(slider, newValue) {
				 _this._handleNavigationBar("ZOOM", newValue);
   			 },
   			 buffer : 500
   			 }
		});
		
//		this._zoomSlider.on("changecomplete", function(slider, newValue) {
//			_this._handleNavigationBar("ZOOM", newValue);
//		});
	
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
	var _this = this;
	
	this.zoom = zoom;
	this._getZoomSlider().setValue(zoom);
	if(this.trackSvgLayout!=null){
		this.trackSvgLayout.setZoom(zoom);
		this.trackSvgLayout2.setZoom(zoom);
	}
	this.chromosomeWidget.setZoom(zoom);
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
        var position = parseInt(value.split(":")[1]);
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


GenomeViewer.prototype._drawKaryotypePanel = function() {
	var _this = this;
	var panel =  Ext.create('Ext.panel.Panel', {
		id:this.id+"karyotypePanel",
		height : 200,
		title:'Karyotype',
		border:false,
		margin:'0 0 1 0',
		cls:'border-bot panel-border-top',
		html: '<div id="'+this.id+'karyotypeSvg" style="margin-top:2px"></div>',
		listeners:{
			afterrender:function(){
				var div = $('#'+_this.id+"karyotypeSvg")[0];
				_this.karyotypePanel = new ChromosomeWidget(div,{
					width:_this.width,
					height:168,
					species:_this.species,
					chromosome:_this.chromosome,
					zoom:_this.zoom,
					position:_this.position
				});
				_this.karyotypePanel.onClick.addEventListener(function(sender,data){
					_this.onLocationChange.notify({position:data.position,chromosome:data.chromosome,sender:"KaryotypePanel"});
				});
				_this.karyotypePanel.drawKaryotype();
			}
		}
	});
	return panel;
};

//GenomeViewer.prototype._getKaryotypePanel = function(specieChanged) {
//	var _this = this;
//	var cont = Ext.getCmp(this.id+"karyotypeCont");
//	
//	
//	// sencha 4.1 must be shown because must be in the dom, in sencha 4.1 hidden elements are not in the dom
//	if(cont != null ){
//		if( cont.isHidden()){
//			cont["wasHidden"] = true;
//			cont.show();
//		}else{
//			cont["wasHidden"] = false;
//		}
//	}
//	// end
//	
//	if(cont == null ){
//		cont = Ext.create('Ext.panel.Panel',{
//			id:this.id+"karyotypeCont",
//			title:'Karyotype',
//			border:false,
//			margin:'0 0 1 0',
//			cls:'border-bot panel-border-top'
//		});
//	}
//	
//	if(specieChanged == true){
//		this._karyotypePanel.getKaryotypePanel().destroy();
//		this._karyotypePanel=null;
//	}
//	
//	if(this._karyotypePanel==null){
//		this._karyotypePanel = new KaryotypePanelWindow(this.species,{viewer:this,height:150,width:this.width});
//		
//		cont.add(this._karyotypePanel.getKaryotypePanel());
//		/** Events i listen **/
//		this._karyotypePanel.onRendered.addEventListener(function(evt, feature) {
//			_this._karyotypePanel.select(_this.chromosome, _this.position, _this.position);
//		});
//		this._karyotypePanel.onMarkerChanged.addEventListener(function(evt, data) {
//			_this.onLocationChange.notify({chromosome:data.chromosome,position:data.start,sender:"_getKaryotypePanel"});
//		});
//		this._karyotypePanel.karyotypeCellBaseDataAdapter.fill();
//		
//		//para la 4.1rc3
////		Ext.getCmp(this.id+"karyotypeButton").toggle();
////		Ext.getCmp(this.id+"karyotypeButton").toggle();
//	}
//	
//	// sencha 4.1 must be shown because must be in the dom, in sencha 4.1 hidden elements are not in the dom
//	if(cont!= null && cont["wasHidden"] == true){
//		cont.hide();
//	}
//	// end 
//	
//	
//	return cont;
//};


GenomeViewer.prototype._drawChromosomePanel = function() {
	var _this = this;
	var panel =  Ext.create('Ext.panel.Panel', {
		id:this.id+"chromosomePanel",
		height : 95,
		title:'Chromosome',
		border:false,
		margin:'0 0 1 0',
		cls:'border-bot panel-border-top',
		html: '<div id="'+this.id+'chromosomeSvg" style="margin-top:2px"></div>',
		listeners:{
			afterrender:function(){
				var div = $('#'+_this.id+"chromosomeSvg")[0];
				_this.chromosomeWidget = new ChromosomeWidget(div,{
					width:_this.width,
					height:65,
					species:_this.species,
					chromosome:_this.chromosome,
					zoom:_this.zoom,
					position:_this.position
				});
				_this.chromosomeWidget.onClick.addEventListener(function(sender,data){
					_this.onLocationChange.notify({position:data,sender:"ChromosomeWidget"});
				});
				_this.chromosomeWidget.drawChromosome();
			}
		}
	});
	return panel;
};


GenomeViewer.prototype._drawRegionPanel = function() {
	var _this=this;
	var panel =  Ext.create('Ext.panel.Panel', {
		id:this.id+"regionPanel",
		height : 150,
		title:'Region',
		border:false,
		autoScroll:true,
		margin:'0 0 1 0',
		cls:'border-bot panel-border-top',
		html: '<div id="'+this.id+'regionSvg" style="margin-top:2px"></div>',
		listeners:{
			afterrender:function(){
				var div = $('#'+_this.id+"regionSvg")[0];
				// _this.trackDataList = new TrackDataList(_this.species);
				_this.trackSvgLayout2 = new TrackSvgLayout(div,{
					width:_this.width-18,
					position:_this.position,
					chromosome:_this.chromosome,
					zoom : _this.zoom,
					zoomOffset:40,
					parentLayout:_this.trackSvgLayout
				});
				
				var geneTrack = new TrackData("gene",{
					adapter: new CellBaseAdapter({
						category: "genomic",
						subCategory: "region",
						resource: "gene",
						species: _this.species,
						featureCache:{
							gzip: true,
							chunkSize:50000
						}
					})
				});
				_this.trackSvgLayout2.addTrack(geneTrack,{
					id:"gene",
					type:"gene",
					histogramRender:null,
					featuresRender:"MultiFeatureRender",
					histogramZoom:20,
					height:150,
					visibleRange:{start:0,end:100},
					titleVisibility:'hidden',
					settings:{
						label: "externalName",
						infoWidgetId: "externalName",
						height:4,
						histogramColor:"lightblue",
						colorField: "biotype",
						color: _this.geneBioTypeColors
					}
				});
			}
		}
	});
	return panel;
};

GenomeViewer.prototype._drawTracksPanel = function() {
	var _this=this;
	var panel = Ext.create('Ext.panel.Panel', {
		id:this.id+"tracksPanel",
		title:'Detailed Information',
		autoScroll:true,
		flex: 1,
		html:'<div id = "'+this.id+'tracksSvg"></div>',
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
				
				var seqtrack = new TrackData("sequence",{
					adapter: new CellBaseAdapter({
						category: "genomic",
						subCategory: "region",
						resource: "sequence",
						species: _this.species,
						featureCache:{
							gzip: true,
							chunkSize:1000
						}
					})
				});
				_this.trackSvgLayout.addTrack(seqtrack,{
					id:"sequence",
					type:"sequence",
					featuresRender:"SequenceRender",
//					histogramZoom:"",
					height:50,
					visibleRange:{start:100,end:100},
					settings:{
						color: {A:"#009900", C:"#0000FF", G:"#857A00", T:"#aa0000", N:"#555555"},
						closable: false
					}
				});
				
				
				var geneTrack = new TrackData("gene",{
					adapter: new CellBaseAdapter({
						category: "genomic",
						subCategory: "region",
						resource: "gene",
						species: _this.species,
						featureCache:{
							gzip: true,
							chunkSize:50000
						}
					})
				});
				_this.trackSvgLayout.addTrack(geneTrack,{
					id:"gene",
					type:"gene",
					histogramRender:null,
					featuresRender:"MultiFeatureRender",
					histogramZoom:20,
					height:24,
					visibleRange:{start:0,end:100},
					settings:{
						label: "externalName",
						infoWidgetId: "externalName",
						colorField: "biotype",
						height:4,
						histogramColor:"lightblue",
						color: _this.geneBioTypeColors
					}
				});
				
				
				var snpTrack = new TrackData("snp",{
					adapter: new CellBaseAdapter({
						category: "genomic",
						subCategory: "region",
						resource: "snp",
						species: _this.species,
						featureCache:{
							gzip: true,
							chunkSize:10000
						}
					})
				});
				_this.trackSvgLayout.addTrack(snpTrack,{
					id:"snp",
					type:"snp",
					histogramRender:null,
					featuresRender:"MultiFeatureRender",
					histogramZoom:80,
					height:150,
					visibleRange:{start:0,end:100},
					settings:{
						label: "name",
						infoWidgetId: "name",
						colorField: "displaySoConsequence",
						height:10,
						histogramColor:"orange",
						color: _this.snpBioTypeColors
					}
				});
				
				
//				var vcfTrack = new TrackData("vcf",{
//					adapter: new VCFDataAdapter(new UrlDataSource("http://rsanchez/example.vcf"),{
//						async: false,
//						gzip: false
//					})
//				});
//				_this.trackSvgLayout.addTrack(vcfTrack,{
//					id:"vcf",
//					type:"vcf",
//					histogramRender:null,
//					featuresRender:"MultiFeatureRender",
//					histogramZoom:"",
//					height:50,
//					visibleRange:{start:0,end:100}
//				});
				
//				
//				var vcfTrack = new TrackData("vcf",{
//					adapter: new VCFDataAdapter(new UrlDataSource("http://fsalavert/example.vcf"),{
//						async: false,
//						gzip: true
//					})
//				});
//				_this.trackSvgLayout.addTrack(vcfTrack,{
//					id:"vcf",
//					type:"vcf",
//					histogramRender:null,
//					featuresRender:"MultiFeatureRender",
//					histogramZoom:"",
//					height:50,
//					visibleRange:{start:0,end:100}
//				});
				
//				var track3 = new TrackData("gff",{
//					adapter: new GFFDataAdapter(new UrlDataSource("http://rsanchez/example.gff"),{
//						async: false,
//						gzip: true
//					})
//				});
//				_this.trackSvgLayout.addTrack(track3,{id:"gff",type:"gff"});

//					var track4 = new TrackData("bed",{
//						adapter: new BEDDataAdapter(new UrlDataSource("http://bioinfo.cipf.es/apps-beta/examples/example.bed"),{
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
	return panel;
};


GenomeViewer.prototype.geneBioTypeColors = {
		//TODO buscar los colores en ensembl!
		"protein_coding":"#a00000",
		"processed_transcript":"#0000ff",
		"pseudogene":"#666666",
		"miRNA":"#8b668b",//TODO falta
		"snRNA":"#8b668b",
		"snoRNA":"#8b668b",//TODO falta
		"lincRNA":"#8b668b",
		"other":"#ffffff"
	};

	GenomeViewer.prototype.snpBioTypeColors = {
		"2KB_upstream_variant":"#a2b5cd",				//TODO done Upstream
		"5KB_upstream_variant":"#a2b5cd",				//TODO done Upstream
		"500B_downstream_variant":"#a2b5cd",			//TODO done Downstream
		"5KB_downstream_variant":"#a2b5cd",			//TODO done Downstream
		"3_prime_UTR_variant":"#7ac5cd",				//TODO done 3 prime UTR
		"5_prime_UTR_variant":"#7ac5cd",				//TODO done 5 prime UTR
		"coding_sequence_variant":"#458b00",			//TODO done Coding unknown
		"complex_change_in_transcript":"#00fa9a",		//TODO done Complex in/del
		"frameshift_variant":"#ff69b4",				//TODO done Frameshift coding
		"incomplete_terminal_codon_variant":"#ff00ff",	//TODO done Partial codon
		"inframe_codon_gain":"#ffd700",				//TODO done Non-synonymous coding
		"inframe_codon_loss":"#ffd700",				//TODO done Non-synonymous coding
		"initiator_codon_change":"#ffd700",			//TODO done Non-synonymous coding
		"non_synonymous_codon":"#ffd700",				//TODO done Non-synonymous coding
		"intergenic_variant":"#636363",				//TODO done Intergenic
		"intron_variant":"#02599c",					//TODO done Intronic
		"mature_miRNA_variant":"#458b00",				//TODO done Within mature miRNA
		"nc_transcript_variant":"#32cd32",				//TODO done Within non-coding gene
		"splice_acceptor_variant":"#ff7f50",			//TODO done Essential splice site
		"splice_donor_variant":"#ff7f50",				//TODO done Essential splice site
		"splice_region_variant":"#ff7f50",				//TODO done Splice site
		"stop_gained":"#ff0000",						//TODO done Stop gained
		"stop_lost":"#ff0000",							//TODO done Stop lost
		"stop_retained_variant":"#76ee00",				//TODO done Synonymous coding
		"synonymous_codon":"#76ee00",					//TODO done Synonymous coding
		"other":"#ffffff"
	};


//XXX BOTTOM BAR

GenomeViewer.prototype._getBottomBar = function() {
	var geneLegendPanel = new LegendPanel({title:'Gene legend'});
	var snpLegendPanel = new LegendPanel({title:'SNP legend'});
	
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
		         geneLegendPanel.getButton(this.geneBioTypeColors),
		         snpLegendPanel.getButton(this.snpBioTypeColors),
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