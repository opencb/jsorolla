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
		if (args.zoom != null) {
			this.zoom = args.zoom;
		}
	}

	//Events i send
	this.onSpeciesChange = new Event();
	this.onLocationChange = new Event();
	this.afterLocationChange = new Event();
	this.afterRender = new Event();
	
	//Events i listen
	this.onLocationChange.addEventListener(function(sender,data){
		_this.setLoc(data);
	});

	
	//Events i propagate
	this.onSvgRemoveTrack = null;//assigned later, the component must exist
	
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
	var _this = this;
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
	//The last item is regionPanel
	//when all items are inserted afterRender is notified, tracks can be added now
	var tracksPanel = this._drawTracksPanel();
	var regionPanel = this._drawRegionPanel();
	var regionAndTrackRendered = 0;
	
	var createSvgLayout = function (){
		var div = $('#'+_this.id+"tracksSvg")[0];
		_this.trackSvgLayout = new TrackSvgLayout(div,{
			width:_this.width-18,
			position:_this.position,
			chromosome:_this.chromosome,
			zoom : _this.zoom
		});
		_this.trackSvgLayout.onMove.addEventListener(function(sender,data){
			_this.onLocationChange.notify({position:data,sender:"trackSvgLayout"});
		});
		_this.trackSvgLayout.onMousePosition.addEventListener(function(sender,data){
			Ext.getCmp(_this.id+"mouseLabel").setText('<span class="ssel">Position: '+data+'</span>');
			$('#'+_this.id+"mouseLabel").qtip({content:'Mouse position',style:{width:95},position: {my:"bottom center",at:"top center"}});
		});
		//propagate event
		_this.onSvgRemoveTrack = _this.trackSvgLayout.onSvgRemoveTrack;
		
		var div = $('#'+_this.id+"regionSvg")[0];
		_this.trackSvgLayout2 = new TrackSvgLayout(div,{
			width:_this.width-18,
			position:_this.position,
			chromosome:_this.chromosome,
			zoom : _this.zoom,
			zoomOffset:40,
			parentLayout:_this.trackSvgLayout
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
	
	container.insert(1, this._getNavigationBar());
	container.insert(2, this._drawKaryotypePanel().hide());
	container.insert(3, this._drawChromosomePanel());
	container.insert(4, tracksPanel);
	container.insert(5, this._getBottomBar());
	container.insert(4, regionPanel);//rendered after trackspanel but inserted with minor index
	
	Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
	Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.chromosome);
	Ext.getCmp(this.id+'tbCoordinate').setValue( this.chromosome + ":" + Math.ceil(this.position));
};
GenomeViewer.prototype.setMenuBar = function(toolbar) {
	this.toolbar = toolbar;
};

GenomeViewer.prototype.setSize = function(width,height) {
	this.trackSvgLayout.setWidth(width-18);
	this.trackSvgLayout2.setWidth(width-18);
	this.chromosomeWidget.setWidth(width);
	this.karyotypeWidget.setWidth(width);
	Ext.getCmp(this.id+"container").setSize(width,height);
	
//	$("#"+this.id+'tracksSvg')[0].setAttribute('width',width);
//	$("#"+this.id+'regionSvg')[0].setAttribute('width',width);
};

GenomeViewer.prototype.setLoc = function(data) {
	console.log(data.sender);
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
		this.trackSvgLayout.setLocation({chromosome:this.chromosome,species:this.species,position:this.position});
		this.trackSvgLayout2.setLocation({chromosome:this.chromosome,species:this.species,position:this.position});
		this.chromosomeWidget.setLocation({chromosome:this.chromosome,species:this.species,position:this.position});
		this.karyotypeWidget.setLocation({chromosome:this.chromosome,species:this.species,position:this.position});
		this.onSpeciesChange.notify();
		break;
	case "_getChromosomeMenu":
		if(this.chromosome!=data.chromosome){
			this.chromosome = data.chromosome;
			this.trackSvgLayout.setLocation({chromosome:this.chromosome});
			this.trackSvgLayout2.setLocation({chromosome:this.chromosome});
			this.chromosomeWidget.setLocation({chromosome:this.chromosome});
			this.karyotypeWidget.setLocation({chromosome:this.chromosome,position:this.position});
		}
		Ext.getCmp(this.id+'tbCoordinate').setValue( this.chromosome + ":" + Math.ceil(this.position));
		Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
		Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.chromosome);
		break;
	case "GoButton":
		var obj = {};
		if(data.position != null && this.position != data.position){
			this.position = data.position;
			obj.position = this.position;
		}
		if(data.chromosome != null && this.chromosome != data.chromosome){
			this.chromosome = data.chromosome;
			obj.chromosome = this.chromosome;
			Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
			Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.chromosome);
		}
		if(Object.keys(obj).length>0){ //if obj has change
			this.trackSvgLayout.setLocation(obj);
			this.trackSvgLayout2.setLocation(obj);
			this.chromosomeWidget.setLocation(obj);
			this.karyotypeWidget.setLocation(obj);
		}
		break;
	case "KaryotypePanel":
		var obj = {};
		if(data.position != null && this.position != data.position){
			this.position = data.position;
			obj.position = this.position;
		}
		if(data.chromosome != null && this.chromosome != data.chromosome){
			this.chromosome = data.chromosome;
			obj.chromosome = this.chromosome;
			Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
			Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.chromosome);
		}
		if(Object.keys(obj).length>0){ //if obj has changeç
			this.trackSvgLayout.setLocation(obj);
			this.trackSvgLayout2.setLocation(obj);
			this.chromosomeWidget.setLocation(obj);
			
			Ext.getCmp(this.id+'tbCoordinate').setValue(this.chromosome + ":" + Math.ceil(this.position));
			this.karyotypeWidget.updatePositionBox({chromosome:this.chromosome,position:this.position});
		}
		break;
	case "ChromosomeWidget":
		this.position = data.position;
		this.trackSvgLayout.setLocation({position:this.position});
		this.trackSvgLayout2.setLocation({position:this.position});
		this.karyotypeWidget.setLocation({position:this.position});
		Ext.getCmp(this.id+'tbCoordinate').setValue(this.chromosome + ":" + Math.ceil(this.position));
		break;
	case "trackSvgLayout":
		this.position -= data.position;
		Ext.getCmp(this.id+'tbCoordinate').setValue( this.chromosome + ":" + Math.ceil(this.position));
		this.chromosomeWidget.setLocation({position:this.position});
		this.karyotypeWidget.setLocation({position:this.position});
		break;
	default:
		var obj = {};
		if(data.species != null){
			this.species = data.species;
			obj.species = this.species;
			Ext.example.msg('Species', this.speciesName+' selected.');
			this.onSpeciesChange.notify();
		}
		if(data.name != null){
			this.speciesName = data.name;
			obj.speciesName = this.speciesName;
		}
		if(data.position != null){
			this.position = data.position;
			obj.position = this.position;
		}
		if(data.chromosome != null){
			this.chromosome = data.chromosome;
			obj.chromosome = this.chromosome;
		}
		Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
		Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.chromosome);
		Ext.getCmp(this.id+'tbCoordinate').setValue( this.chromosome + ":" + Math.ceil(this.position));
		Ext.getCmp(this.id+"speciesMenuButton").setText(this.speciesName);
		this._updateChrStore();
		this.trackSvgLayout.setLocation(obj);
		this.trackSvgLayout2.setLocation(obj);
		this.chromosomeWidget.setLocation(obj);
		this.karyotypeWidget.setLocation(obj);
		
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

	var searchResults = Ext.create('Ext.data.Store', {
		fields: ["xrefId","displayId","description"]
	});
	
	var searchCombo = Ext.create('Ext.form.field.ComboBox', {
		id : this.id+'quickSearch',
		displayField: 'displayId',
		valueField: 'displayId',
		emptyText:'Quick search: gene, transcript',
		hideTrigger: true,
		width:170,
		store: searchResults,
		queryMode: 'local',
//		typeAhead:true,
		queryDelay: 500,
		listeners:{
			change:function(){
				var value = this.getValue();
				var min = 2;
				if(value && value.substring(0,3).toUpperCase() == "ENS"){
					min = 10;
				}
				if(value && value.length > min){
					$.ajax({
						url:new CellBaseManager().host+"/latest/"+_this.species+"/feature/id/"+this.getValue()+"/starts_with?of=json",
						success:function(data, textStatus, jqXHR){
							var d = JSON.parse(data);
							searchResults.loadData(d[0]);
						},
						error:function(jqXHR, textStatus, errorThrown){console.log(textStatus);}
					});
				}
			},
			select: function(field, e){
				_this._handleNavigationBar('GoToGene');
			}
		}
	});
	
	var navToolbar = Ext.create('Ext.toolbar.Toolbar', {
		id:this.id+"navToolbar",
		cls:"bio-toolbar",
		border:true,
		height:35,
//		enableOverflow:true,//if the field is hidden getValue() reads "" because seems the hidden field is a different object
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
		        	 pressed:false,
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
		        	 pressed:true,
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
		        			 }
//		        			 buffer : 300
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
		        			 }
//		        			 buffer : 300
		        		 }
		        	 }
		         },'-',
//		         {
//		        	 id:this.id+"right1posButton",
//		        	 text : '>',
//		        	 handler : function() {
//		        		 _this._handleNavigationBar('>');
//		        	 }
//		         },
		         {
		        	 id:this.id+"positionLabel",
		        	 xtype : 'label',
		        	 text : 'Position:',
		        	 margins : '0 0 0 10'
		         },{
		        	 id : this.id+'tbCoordinate',
		        	 xtype : 'textfield',
		        	 width : 120,
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
		         },'->',
//		         {
//		        	 id : this.id+'searchLabel',
//		        	 xtype : 'label',
//		        	 text : 'Quick search:',
//		        	 margins : '0 0 0 10'
//		         },
		         searchCombo,
//		         {
//		        	 id : this.id+'quickSearch',
//		        	 xtype : 'textfield',
//		        	 emptyText:'gene, protein, transcript',
//		        	 name : 'field1',
//		        	 listeners:{
//		        		 specialkey: function(field, e){
//		        			 if (e.getKey() == e.ENTER) {
//		        				 _this._handleNavigationBar('GoToGene');
//		        			 }
//		        		 },
//		        		 change: function(){
//		        			 	var str = this.getValue();
//		        			 	if(str.length > 3){
//		        			 		console.log(this.getValue());
//		        			 	}
//					     }
//		        	 }
//		         },
		         {
		        	 id : this.id+'GoToGeneButton',
		        	 iconCls:'icon-find',
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
        var geneName = Ext.getCmp(this.id+'quickSearch').getValue();
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
				_this.karyotypeWidget = new KaryotypeWidget(div,{
					width:_this.width,
					height:168,
					species:_this.species,
					chromosome:_this.chromosome,
					zoom:_this.zoom,
					position:_this.position
				});
				_this.karyotypeWidget.onClick.addEventListener(function(sender,data){
					_this.onLocationChange.notify({position:data.position,chromosome:data.chromosome,sender:"KaryotypePanel"});
				});
				_this.karyotypeWidget.drawKaryotype();
			}
		}
	});
	return panel;
};


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
		title:'Region overview',
		border:false,
		autoScroll:true,
		margin:'0 0 1 0',
		cls:'border-bot panel-border-top x-unselectable',
		html: '<div id="'+this.id+'regionSvg" style="margin-top:2px"></div>'
	});
	return panel;
};

GenomeViewer.prototype._drawTracksPanel = function() {
	var _this=this;
	var panel = Ext.create('Ext.panel.Panel', {
		id:this.id+"tracksPanel",
		title:'Detailed information',
		autoScroll:true,
		cls:"x-unselectable",
		flex: 1,
		html:'<div id = "'+this.id+'tracksSvg"></div>'
	});
	return panel;
};

GenomeViewer.prototype.addTrack = function(trackData, args) {
	this.trackSvgLayout.addTrack(trackData, args);
};

GenomeViewer.prototype.removeTrack = function(trackId) {
	return this.trackSvgLayout.removeTrack(trackId);
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
		text:''
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
		width:420,
		height:28,
		items : [/*scaleLabel, */
		         '-',mouseLabel,
		         geneLegendPanel.getButton(GENE_BIOTYPE_COLORS),
		         snpLegendPanel.getButton(SNP_BIOTYPE_COLORS),
		         '->',versionLabel]
	});
	
	var bottomBar = Ext.create('Ext.container.Container', {
		id:this.id+'bottomBar',
		layout:'hbox',
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
		var genomicListWidget = new GenomicListWidget(_this.species,{title:args.title, gridFields:args.gridField,viewer:_this});
		
		genomicListWidget.draw(data);
		
		genomicListWidget.onSelected.addEventListener(function(evt, feature) {
//			console.log(feature);
			if (feature != null && feature.chromosome != null) {
				if(_this.chromosome!= feature.chromosome || _this.position != feature.start){
					_this.setLoc({sender:"",chromosome:feature.chromosome, position:feature.start});
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
//	this.openListWidget({
//		category:"feature",
//		subcategory:"transcript",
//		query:name.toString(),
//		resource:"info",
//		title:"Transcript List",
//		gridField:["externalName","stableId", "biotype", "chromosome", "start", "end", "strand", "description"]
//	});
};

GenomeViewer.prototype.openExonListWidget = function(name) {
//	this.openListWidget({
//		category:"feature",
//		subcategory:"exon",
//		query:name.toString(),
//		resource:"info",
//		title:"Exon List",
//		gridField:["stableId", "chromosome","start", "end", "strand"]
//	});
};

GenomeViewer.prototype.openSNPListWidget = function(name) {
	this.openListWidget({
		category:"feature",
		subcategory:"id",
		query:name.toString(),
		resource:"snp",
		title:"SNP List",
		gridField:["name", "variantAlleles", "ancestralAllele", "mapWeight",  "position", "sequence"]
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
