function GenomeViewer(targetId, species, args) {
	var _this=this;
	this.id = "GenomeViewer:"+ Math.round(Math.random()*10000);
	
	this.menuBar = null;
	
	// if not provided on instatiation
	this.width =  $(document).width();
	this.height = $(document).height();
	this.targetId=null;
	
	//Default species
	this.species="hsa";
	this.speciesName="Homo sapiens";
	
	//Setting paramaters
	if (targetId != null){
		this.targetId=targetId;
	}
	if (species != null) {
		this.species = species.species;
		this.speciesName = species.name;
		this.chromosome=species.chromosome;
		this.position=species.position;
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
	}

	//Events i send
	this.onSpeciesChange = new Event();
	
	console.log(this.width+"x"+this.height);
	console.log(this.targetId);
	console.log(this.id);

	
	
	this.genomeWidget = null;// new GenomeWidget(this.id + "id",
//	this.chromosomeGenomeWidget = null;
	this.genomeWidgetProperties = new GenomeWidgetProperties(this.species,{
				windowSize : 1000000,
				pixelRatio : 0.0005,
				id:this.id
	});
	
	//Events i listen
	this.onSpeciesChange.addEventListener(function(sender,data){
		_this.setLocation(data.chromosome,data.position);
		_this.species=data.species;
		_this.speciesName=data.name;
		Ext.getCmp(_this.id+"speciesMenuButton").setText(_this.speciesName);
		Ext.example.msg('Species', _this.speciesName+' selected.');
		
		Ext.getCmp(_this.id + "chromosomeMenuButton").menu = _this._getChromosomeMenu();

		_this.genomeWidgetProperties = new GenomeWidgetProperties(_this.species,{
			windowSize : 1000000,
			pixelRatio : 0.0005,
			id:_this.id
		});

		if(_this.targetId!=null){
			_this.draw();
		}
	});
	
	this.customTracksAddedCount = 1;
	/** position molona 1: 211615616 **/
	$(window).resize(function(ev,width,height) {

	});	
	
	//TODO check first if chromosome exists on the new specie
	this.chromosome = 13;
	this.position = 32889611;
	
	
	this.drawing=0;
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
	var start = this.position - (this.genomeWidgetProperties.windowSize);
	var end = this.position + (this.genomeWidgetProperties.windowSize);
	
	this._drawGenomeViewer();
	
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
		items.push(this._getChromosomePanel());
		items.push(this._getWindowSizePanel());
		items.push(this._getTracksPanel());
		items.push(this._getBottomBar());
		
		this._panel = Ext.create('Ext.panel.Panel', {
			renderTo:this.targetId,
	    	border:false,
	    	width:width,
	    	height:height,
			cls:'x-unselectable',
			layout: { type: 'vbox',align: 'stretch'},
			region : 'center',
			margins : '0 0 0 0',
			border : false,
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
	this.draw();
};


//NAVIGATION BAR
//Creates the species empty menu if not exist and returns it
GenomeViewer.prototype._getSpeciesMenu = function() {
	//items must be added by using  setSpeciesMenu()
	if(this._specieMenu == null){
		this._specieMenu = Ext.create('Ext.menu.Menu', {
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
		fields: ["name"],
		autoLoad:false
	});
	/*Chromolendar*/
 	var chrView = Ext.create('Ext.view.View', {
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
 	var chrContainer = Ext.create('Ext.container.Container', {
 		width:125,
//	 		height:300,
 		autoScroll:true,
 		style:'background-color:#fff',
 		items : [chrView]
 	});
	/*END chromolendar*/
 	
 	var chromosomeMenu = Ext.create('Ext.menu.Menu', {
//			width:100,
 		almacen :chrStore,
		items : [chrContainer]
	});
	
	//Load Chromosomes for his menu
	var karyotypeCellBaseDataAdapter = new KaryotypeCellBaseDataAdapter(this.species);
	karyotypeCellBaseDataAdapter.successed.addEventListener(function() {
		var chromosomeData = [];
		for (var i = 0; i < karyotypeCellBaseDataAdapter.chromosomeNames.length; i++) {
			chromosomeData.push({'name':karyotypeCellBaseDataAdapter.chromosomeNames[i]});
		}
		chrStore.loadData(chromosomeData);
		
	});
	karyotypeCellBaseDataAdapter.fill();
	
	return chromosomeMenu;
};


GenomeViewer.prototype._showKaryotypeWindow = function() {
	var _this = this;
	
	var karyotypePanelWindow = new KaryotypePanelWindow(this.species,{viewer:this});
	
	/** Events i listen **/
	karyotypePanelWindow.onRendered.addEventListener(function(evt, feature) {
		karyotypePanelWindow.select(_this.chromosome, _this.position, _this.position);
	});
	karyotypePanelWindow.onMarkerChanged.addEventListener(function(evt, data) {
		_this.setLocation(data.chromosome, data.start);
	});
	
	karyotypePanelWindow.draw();
};


GenomeViewer.prototype._getZoomSlider = function() {
	var _this = this;
	if(this._zoomSlider==null){
		this._zoomSlider = Ext.create('Ext.slider.Single', {
			id : this.id + ' zoomSlider',
			width : 200,
			minValue : 0,
			hideLabel : false,
			maxValue : 100,
			value : _this.genomeWidgetProperties.getZoom(),
			useTips : true,
			increment : 10,
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
    	   var zoom = this.genomeWidgetProperties.getZoom();
    	   if (zoom < 100){
    		   this.setZoom(zoom + 10);
    	   }
    }
    if (action == '-'){
    	 var zoom = this.genomeWidgetProperties.getZoom();
  	   if (zoom >= 10){
  		   this.setZoom(zoom - 10);
  	   }
    }
    
    if (action == 'Go'){
    	var value = Ext.getCmp(this.id+'tbCoordinate').getValue();
        var position = value.split(":")[1];
        this.chromosome = value.split(":")[0];
        
        this.setLocation(this.chromosome, position);
    }
    
    
    if (action == '<'){
        var position = Ext.getCmp(this.id+'tbCoordinate').getValue();
        this.setLocation(this.chromosome, this.position - (this.genomeWidgetProperties.windowSize/2));
    }
    
    
    if (action == '>'){
        var position = Ext.getCmp(this.id+'tbCoordinate').getValue();
        this.setLocation(this.chromosome, this.position + (this.genomeWidgetProperties.windowSize/2));
    }
};






GenomeViewer.prototype._getNavigationBar = function() {
	var _this = this;
	

	
	var toolbar = Ext.create('Ext.toolbar.Toolbar', {
		cls:"bio-toolbar",
		height:35,
		enableOverflow:true,//if the field is hidden getValue() reads "" because seems the hidden field is a different object
		border:0,
		items : [
		         {
		        	 id:this.id+"speciesMenuButton",
		        	 text : this.speciesName,
		        	 menu: this._getSpeciesMenu()			
		         },{
		        	 id: this.id + "chromosomeMenuButton",
		        	 text : 'Chromosome',
		        	 menu: this._getChromosomeMenu()			
		         },{
		        	 text : 'Karyotype',
		        	 handler:function() {
		        		 _this._showKaryotypeWindow();
		        	 }
		         },{
		        	 text : '<',
		        	 margin : '0 0 0 15',
		        	 handler : function() {
		        		 _this._handleNavigationBar('<');
		        	 }
		         }, {
		        	 margin : '0 0 0 5',
		        	 iconCls:'icon-zoom-out',
		        	 handler : function() {
		        		 _this._handleNavigationBar('-');
		        	 }
		         }, 
		         this._getZoomSlider(), 
		         {
		        	 margin:'0 5 0 0',
		        	 iconCls:'icon-zoom-in',
		        	 handler :  function() {
		        		 _this._handleNavigationBar('+');
		        	 }
		         },{
		        	 text : '>',
		        	 handler : function() {
		        		 _this._handleNavigationBar('>');
		        	 }
		         },'->',{
		        	 xtype : 'label',
		        	 text : 'Position:',
		        	 margins : '0 0 0 10'
		         },{
		        	 xtype : 'textfield',
		        	 id : this.id+'tbCoordinate',
		        	 text : this.chromosome + ":" + this.position,
		        	 listeners:{
		        		 specialkey: function(field, e){
		        			 if (e.getKey() == e.ENTER) {
		        				 _this._handleNavigationBar('Go');
		        			 }
		        		 }
		        	 }
		         },{
		        	 text : 'Go',
		        	 handler : function() {
		        		 _this._handleNavigationBar('Go');
		        	 }
		         },{
		        	 xtype : 'label',
		        	 text : 'Search:',
		        	 margins : '0 0 0 10'
		         },{
		        	 xtype : 'textfield',
		        	 id : this.id+'tbGene',
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
		        	 text : 'Go',
		        	 handler : function() {
		        		 _this._handleNavigationBar('GoToGene');
		        	 }
		         }]
	});
	return toolbar;
};
//NAVIGATION BAR

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
	
	var label = Ext.create('Ext.container.Container', {
		id:this._getChromosomeLabelID(),
		margin:5
	});
	var svg = Ext.create('Ext.container.Container', {
		id:this._getChromosomeContainerID(),
		margin:10
	});
	return Ext.create('Ext.container.Container', {
		height : 70,
	    layout: {type: 'table', columns: 2},
		items:[label,svg]
//		html : '<br/><table style="border:0px" ><tr><td id="'
//				+ this._getChromosomeLabelID()
//				+ '" style="padding-left: 8px">Chromosome&nbsp;15</td><td><div id="'
//				+ this._getChromosomeContainerID() + '"></td></tr></div>'
	});
};
//CHROMOSOME PANEL


//WINDOWSIZE PANEL
GenomeViewer.prototype._getWindowSizePanel = function() {
	var windowSizeLabel = Ext.create('Ext.toolbar.TextItem', {
		id:this.id+"windowSizeLabel",
		text:'window Size'
	});
	return Ext.create('Ext.container.Container', {
		style:'text-align:center;',
		height : 20,
		items:windowSizeLabel
	});
};
//WINDOWSIZE PANEL




//TOP PANEL
GenomeViewer.prototype._getTracksPanelID = function() {
	return this.id+"master";
};

GenomeViewer.prototype._getTracksPanel = function() {
	if (this._mainPanel == null) {
		this._mainPanel = Ext.create('Ext.panel.Panel', {
			autoScroll:true,
			flex: 1,  
			border:false,
//			margins:'0 5 2 0',
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
	var taskbar = Ext.create('Ext.toolbar.Toolbar', {
		id:this.id+'uxTaskbar',
		winMgr: new Ext.ZIndexManager(),
		enableOverflow:true,
		cls: 'bio-hiddenbar',
		height:28,
		flex:1
	});
	var legendBar = Ext.create('Ext.toolbar.Toolbar', {
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
		layout:'hbox',
		cls:"bio-botbar x-unselectable",
		height:30,
		items : [taskbar,legendBar]
	});
	return bottomBar;
};
//BOTTOM BAR





GenomeViewer.prototype.openListWidget = function(category, subcategory, query, resource, title, gridField) {
	var _this = this;
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function(evt, data) {
		
		var genomicListWidget = new GenomicListWidget({title:title, gridFields:gridField,viewer:_this});
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
	this._setChromosomeLabel(chromosome);
	DOM.removeChilds(this._getChromosomeContainerID());
	var width = this.width - 100;
	this.chromosomeFeatureTrack = new ChromosomeFeatureTrack(this.id + "chr", document.getElementById(this._getChromosomeContainerID()), this.species,{
				top : 5,
				bottom : 20,
				left : 10,
				right : width - 100,
				width : width,
				height : 40,
				label : true,
				"vertical" : false,
				"rounded" : 4
			});

	var _this = this;
	var dataAdapter = new RegionCellBaseDataAdapter(this.species,{resource : "cytoband"});
	dataAdapter.successed.addEventListener(function(evt, data) {
				_this.chromosomeFeatureTrack.draw(dataAdapter.dataset);
				_this.chromosomeFeatureTrack.click.addEventListener(function(evt, data) {
							_this.setLocation(_this.chromosome, data);
						});
			});

	dataAdapter.fill(chromosome, 1, 260000000, "cytoband");
};


GenomeViewer.prototype._setScaleLabels = function() {
	var value = Math.floor(100/this.genomeWidgetProperties.getPixelRatio()) + " nt ";
	Ext.getCmp(this.id+"scaleLabel").surface.items.items[0].setAttributes({text:value},true);
	
	var value10 = "Viewing "+Math.floor(100/this.genomeWidgetProperties.getPixelRatio())*10 + " nts ";
	Ext.getCmp(this.id+"windowSizeLabel").setText(value10);
};

GenomeViewer.prototype.setZoom = function(value) {
	this.genomeWidgetProperties.setZoom(value);
	
	this.position = this.genomeWidget.getMiddlePoint();
	this._getZoomSlider().setValue(value);
	
	this.genomeWidget.trackCanvas._goToCoordinateX(this.position- (this.genomeWidget.trackCanvas.width / 2)/ this.genomeWidgetProperties.getPixelRatio());
	this._setScaleLabels();
	this.refreshMasterGenomeViewer();
};


GenomeViewer.prototype.setLocation = function(chromosome, position) {
	this.chromosome = chromosome;
	this.position = Math.ceil(position);
	
	this.drawChromosome(this.chromosome, 1, 26000000);
	this.refreshMasterGenomeViewer();
};


GenomeViewer.prototype._setPositionField = function(chromosome, position) {
	if (position == NaN){
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
	var zoom = this.genomeWidgetProperties.getZoom();
	return this.genomeWidgetProperties.getWindowSize(zoom);
};

GenomeViewer.prototype.refreshMasterGenomeViewer = function() {
	this.updateRegionMarked(this.chromosome, this.position);
	this._drawGenomeViewer();
	
};

GenomeViewer.prototype._drawGenomeViewer = function() {
	//This method filters repetitive calls to _drawOnceGenomeViewer
	var _this = this;
	_this.drawing += 1;
	setTimeout(function() {
		_this.drawing -= 1;
		if(_this.drawing==0){
			_this._drawOnceGenomeViewer();
		}
	},300);
};
GenomeViewer.prototype._drawOnceGenomeViewer = function() {
	var _this = this;
	this._getPanel().setLoading("Retrieving data");
//	this.updateTracksMenu();

	if(this.genomeWidget!=null){
		this.genomeWidget.clear();
	}
	
	this.genomeWidget = new GenomeWidget(this.id + "master", this._getTracksPanelID(), {
	                pixelRatio: this.genomeWidgetProperties.getPixelRatio(),
	                width:this.width-15,
//	                height:  this.height
	                height:  2000
	        });

	var zoom = this.genomeWidgetProperties.getZoom();

	
	if (this.genomeWidgetProperties.getTrackByZoom(zoom).length > 0){
		for ( var i = 0; i < this.genomeWidgetProperties.getTrackByZoom(zoom).length; i++) {
			var track =  this.genomeWidgetProperties.getTrackByZoom(zoom)[i];
			track.top = track.originalTop;
			track.height = track.originalHeight;
			track.clear();
			this.genomeWidgetProperties.getDataAdapterByZoom(zoom)[i].datasets = new Object();
			this.genomeWidget.addTrack(track, this.genomeWidgetProperties.getDataAdapterByZoom(zoom)[i]);
		}
		
		var start = Math.ceil(this.position - (this._getWindowsSize()));// - (this._getWindowsSize()/6);
		var end = Math.ceil(this.position +   (this._getWindowsSize()));// - (this._getWindowsSize()/6);
		
		if (start < 0){ start = 0;}
		this.genomeWidget.onMarkerChange.addEventListener(function (evt, middlePosition){
			var window = _this.genomeWidgetProperties.windowSize/2;
			var start = middlePosition.middle - window;
			if (start < 0 ){start = 0;}
			_this.updateRegionMarked(_this.chromosome, middlePosition.middle);
		});
		 
		this.genomeWidget.onRender.addEventListener(function (evt){
//			 console.log("test");
			_this._getPanel().setLoading(false);
			_this.genomeWidget.trackCanvas.selectPaintOnRules(_this.position);

		 });
		 
		this._setPositionField(this.chromosome, this.position);
		this.genomeWidget.draw(this.chromosome, start, end);

		
	}
	else{
		_this._getPanel().setLoading("No tracks to display");
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
		
		var dasTrack1 = new FeatureTrack("vcf", null, this.species,{
			top : 10,
			left : 0,
			height : 10,
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
		this.genomeWidgetProperties.addCustomTrackByZoom(0, 50, dasTrack1,dasDataAdapter2);
		var dasTrack = new FeatureTrack("vcf", null, this.species,{
			top : 10,
			left : 0,
			height : 10,
//			labelHeight : 10,
//			featureHeight :10,
			title : name,
			titleFontSize : 9,
			forceColor : "#000000",
			label : true,
			avoidOverlapping : true,
			pixelSpaceBetweenBlocks : 100,
			allowDuplicates : true,
			backgroundColor : "#FCFFFF",
			isAvalaible : false
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
		
		var vcfTrack = new HistogramFeatureTrack("vcf", null, this.species,{
			top : 20,
			left : 0,
			height : 20,
			featureHeight : 18,
			title : title,
			titleFontSize : 9,
			titleWidth : 70,
			label : false,
			forceColor : "purple",
			intervalSize : 500000
		});
		
		_this.genomeWidgetProperties.addCustomTrackByZoom(0, 0, vcfTrack, dataadapter);

		var vcfTrack3 = new HistogramFeatureTrack("vcf", null, this.species,{
					top : 20,
					left : 0,
					height : 20,
					featureHeight : 18,
					title : title,
					titleFontSize : 9,
					titleWidth : 70,
					label : false,
					forceColor : "purple",
					intervalSize : 150000
				});
		_this.genomeWidgetProperties.addCustomTrackByZoom(10, 20, vcfTrack3, dataadapter);
		
		var vcfTrack2 = new FeatureTrack("vcf", null, this.species,{
					top : 10,
					left : 0,
					height : 10,
					title : title,
					label : false,
					avoidOverlapping : true,
					pixelSpaceBetweenBlocks : 1,
					allowDuplicates : true
				});
		_this.genomeWidgetProperties.addCustomTrackByZoom(30, 80, vcfTrack2, dataadapter);

		var vcfTrack2 = new FeatureTrack("vcf", null, this.species,{
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
		_this.genomeWidgetProperties.addCustomTrackByZoom(90, 90, vcfTrack2, dataadapter);
		
		var vcfTrack100 = new SNPFeatureTrack("vcf", null, this.species,{
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
		_this.genomeWidgetProperties.addCustomTrackByZoom(100, 100, vcfTrack100, dataadapter);
		
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


////TODO DEPRECATED
///** TRACKS * */
//GenomeViewer.prototype.updateTracksMenu = function() {
//	var _this = this;
//	
//	if (this.tracks == null){
//		this.tracks = new Object();
//	}
//	
//	for ( var i = 0; i < this.genomeWidgetProperties.customTracks.length; i++) {
//		if (this.tracks[ this.genomeWidgetProperties.customTracks[i].titleName] == null){
//			this.tracksMenu.add({
//				text : this.genomeWidgetProperties.customTracks[i].titleName,
//				checked : this.genomeWidgetProperties.customTracks[i].title,
//				handler : function() {
//					_this.genomeWidgetProperties.tracks[this.text] = this.checked;
//					_this.refreshMasterGenomeViewer();
//				}
//			});
//			
//			this.tracks[this.genomeWidgetProperties.customTracks[i].titleName] = true;
//		}
//	}
////	for (var trackName in this.genomeWidgetProperties.customTracks) {
////		this.tracksMenu.add({
////					text : trackName,
////					checked : this.genomeWidgetProperties.tracks[trackName],
////					handler : function() {
////						_this.genomeWidgetProperties.tracks[this.text] = this.checked;
////						_this.refreshMasterGenomeViewer();
////					}
////				});
////	}
//};



//TODO MOVIDO A GENOMEMAPS
