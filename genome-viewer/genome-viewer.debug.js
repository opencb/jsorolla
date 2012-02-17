function GenomeBrowser(){
	
	  this.genomeViewer = new MasterSlaveGenomeViewer("id", "container_map");
	  this.karyotypeWidget = new KaryotypePanel("human", "container_map_karyotype", {"width":1000, "height":200, "trackWidth":15});
};

GenomeBrowser.prototype.draw = function(){
	var top = Ext.create('Ext.panel.Panel', {
        width: '1300',
        margins:'5 5 5 5',
        flex:3,
        //padding: '5 5 5 5',
        html:'<div id = "container_map"></div>'
		});

	var coordinatePanel = Ext.create('Ext.panel.Panel', {
        width: '1300',
        margins:'5 5 5 5',
       // height: '50px',
        //padding: '5 5 5 5',
        html:'<div id = "coordinates"><form><label >Location:&nbsp;&nbsp;</label><input type="hidden" name="db" value="core"><input name="r" id="loc_r" class="location_selector" style="width:250px" value="6:133017695-133161157" type="text">&nbsp;&nbsp;<input value="Go" type="submit" class="go-button"></form></div>'
		});  
		
		
	var bot = Ext.create('Ext.panel.Panel', {
        title:'bot',
        width: '100%',
        flex:1,
        split: true,
        html:'<div id = "container_map_karyotype" style="padding:0 0 0 200;text-align: center;width:100%;" ></div>'
		});

	 var handleAction = function(action){
			 if (action == 'ZoomIn'){
			 	genomeViewer.zoomIn();
			 }

			 if (action == 'ZoomOut'){
				 	genomeViewer.zoomOut();
				 }
			 
	       // Ext.example.msg('<b>Action</b>', 'You clicked "' + action + '"');
	    };

	    
	var menu = Ext.create('Ext.toolbar.Toolbar', {
		width: '100%',
        items: [
           /*     {
            xtype:'splitbutton',
            text: 'Menu Button',
            iconCls: 'add16',
            menu: [{text: 'Menu Item 1', handler: Ext.Function.pass(handleAction, 'Menu Item 1')}]
        },'-',*/
        {
            text: 'Zoom In',
            iconCls: 'add16',
            handler: Ext.Function.pass(handleAction, 'ZoomIn')
        },{
        	text: 'Zoom Out',
            iconCls: 'add16',
            
            handler: Ext.Function.pass(handleAction, 'ZoomOut')
        }
        //,'-',{
        //    text: 'Format',
       //     iconCls: 'add16',
          //  handler: Ext.Function.pass(handleAction, 'Format')
       // },'->',{
       //     text: 'Right',
       //     iconCls: 'add16',
          //  handler: Ext.Function.pass(handleAction, 'Right')
       // }
        ]

		});
		
	var center = Ext.create('Ext.panel.Panel', {
		layout : 'vbox',
        region: 'center',
        margins:5,
		items:[menu, top,coordinatePanel, bot]
		});

      var item2 = Ext.create('Ext.Panel', {
          title: 'Control',
          html: '&lt;empty panel&gt;',
          cls:'empty'
      });

      var item3 = Ext.create('Ext.Panel', {
          title: 'Accordion Item 3',
          html: '&lt;empty panel&gt;',
          cls:'empty'
      });

      var item4 = Ext.create('Ext.Panel', {
          title: 'Accordion Item 4',
          html: '&lt;empty panel&gt;',
          cls:'empty'
      });

      var item5 = Ext.create('Ext.Panel', {
          title: 'Accordion Item 5',
          html: '&lt;empty panel&gt;',
          cls:'empty'
      });


      
      
	var west = Ext.create('Ext.panel.Panel', {
        region: 'west',
        width: 200,
        margins:'5 5 5 5',
        split:true,
        width: 210,
        layout:'accordion',
        items: [ item2, item3, item4, item5]

		});

		
	
	var port = Ext.create('Ext.container.Viewport', {
    layout: 'border',
    items: [
    	center,
    	west
    ]
	});

  
    this.genomeViewer.draw(1, 25000000);
        

	
	
    this.karyotypeWidget.getFromCellBase();
};
	
function GenomeViewer(targetId, species, args) {
	var _this=this;
	this.id = "GenomeViewer#"+ Math.round(Math.random()*10000) +"#";
	
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
	//TODO Capturar el width al cambiar de tamaño y drawChromosome aver q pasa

	
	
	
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
};
GenomeViewer.prototype.setMenuBar = function(menuBar){
	this.menuBar = menuBar;
};

GenomeViewer.prototype.draw = function(){
	if(this.targetId!=null){
		this._getPanel(this.width,this.height);
	}
	this._render(this.chromosome,this.position);
	
	//this.setZoom(70);
	//this.setLocation(1, 211615616);
};

GenomeViewer.prototype._render = function(chromosome, position) {
	this.chromosome = chromosome;
	this.position = position;
	var start = this.position - (this.genomeWidgetProperties.windowSize);
	var end = this.position + (this.genomeWidgetProperties.windowSize);
	this._drawMasterGenomeViewer(this.chromosome, start, end);
	this.drawChromosome(chromosome, start, end);
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
	//items must be added by using  setSpecieMenu()
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
GenomeViewer.prototype.setSpecieMenu = function(speciesObj) {
	var _this = this;
	//Auto generate menu items depending of AVAILABLE_SPECIES config
	var menu = this._getSpeciesMenu();
	menu.hide();//Hide the menu panel before remove
	menu.removeAll(); // Remove the old species
	for ( var i = 0; i < speciesObj.length; i++) {
		menu.add({
					text:speciesObj[i].name,
					species:speciesObj[i].species,
					handler:function(este){
						//can't use the i from the FOR so i create the object again
						_this.setSpecie({name: este.text, species: este.species});
				}
		});
	};
};
//Sets the new specie and fires an event
GenomeViewer.prototype.setSpecie = function(text){
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
	
	var karyotypePanelWindow = new KaryotypePanelWindow(this.species,{genomeViewer:this});
	
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
//		enableOverflow:true,//if the field is hidden getValue() reads "" because seems the hidden field is a different object
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
		
		var genomicListWidget = new GenomicListWidget({title:title, gridFields:gridField,genomeViewer:_this});
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
	
	this.refreshMasterGenomeViewer();
	this.drawChromosome(this.chromosome, 1, 26000000);
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

GenomeViewer.prototype.refreshMasterGenomeViewer = function() {
	this.genomeWidget.clear();
	this.updateRegionMarked(this.chromosome, this.position);
	this._drawMasterGenomeViewer();
	
};

GenomeViewer.prototype._getWindowsSize = function() {
	var zoom = this.genomeWidgetProperties.getZoom();
	return this.genomeWidgetProperties.getWindowSize(zoom);
};
GenomeViewer.prototype._drawMasterGenomeViewer = function() {
		
		var _this = this;
		this._getPanel().setLoading("Retrieving data");
//		this.updateTracksMenu();

		
		this.genomeWidget = new GenomeWidget(this.id + "master", this._getTracksPanelID(), {
		                pixelRatio: this.genomeWidgetProperties.getPixelRatio(),
		                width:this.width-15,
//		                height:  this.height
		                height:  2000
		        });

		var zoom = this.genomeWidgetProperties.getZoom();

//		console.log(this.genomeWidgetProperties.getTrackByZoom(zoom).length);
		
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
		
		_this._drawMasterGenomeViewer();
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
VCFFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
VCFFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
VCFFileWidget.prototype.draw = FileWidget.prototype.draw;
VCFFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
VCFFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;

function VCFFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "VCF";
	args.tags = ["vcf"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
    this.chartWidgetQuality = new ChartWidget({height:300});
};

VCFFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"]),
	        this.chartWidgetQuality.getChart(["features","quality"])];
};



VCFFileWidget.prototype.loadFileFromLocal = function(file){
	var vcfAdapter = new VCFFileDataAdapter();
	this._fileLoad(vcfAdapter);
	vcfAdapter.loadFromFile(file);
};

VCFFileWidget.prototype._fileLoad = function(vcfAdapter){
	var _this = this;
	vcfAdapter.onRead.addEventListener(function(sender, id) {
		_this.dataAdapter = new VCFLocalRegionDataAdapter();
		_this.dataAdapter.loadFromFileDataAdapter(sender);
		
		var datastore = new Array();
	 	for ( var chromosome in _this.dataAdapter.featuresByChromosome) {
			datastore.push({ features: _this.dataAdapter.featuresByChromosome[chromosome].length, chromosome: chromosome });
		}
		
		var qualityStore = new Array();
		for ( var range in _this.dataAdapter.qualitycontrol) {
		
			qualityStore.push({features: _this.dataAdapter.qualitycontrol[range],  quality:range });
		}
		
	 	_this.chartWidgetByChromosome.getStore().loadData(datastore);
	 	_this.chartWidgetQuality.getStore().loadData(qualityStore);
	 	
	 	
	 	_this.panel.setLoading(false);
	 	_this.featureCountLabel.setText("Features count: " + _this.dataAdapter.features.length, false);
	 	_this.btnOk.enable();
	});
};

VCFFileWidget.prototype.loadFileFromServer = function(data){
	var vcfAdapter = new VCFFileDataAdapter();
	this._fileLoad(vcfAdapter);
	vcfAdapter.loadFromContent(data.data);
};SIFNetworkFileWidget.prototype.draw = NetworkFileWidget.prototype.draw;

function SIFNetworkFileWidget(args){
	if(args == null){
		var args={};
	};
	args.title='Import a Network SIF file';
	NetworkFileWidget.prototype.constructor.call(this, args);
};


SIFNetworkFileWidget.prototype.getFileUpload = function(){
	var _this = this;
	
	this.fileUpload = Ext.create('Ext.form.field.File', {
		msgTarget: 'side',
		allowBlank: false,
		emptyText:'SIF network file',
		flex:1,
		buttonText: 'Browse local',
		listeners: {
			change: function(){
				var sifdataadapter = new InteractomeSIFFileDataAdapter();
				var file = document.getElementById(_this.fileUpload.fileInputEl.id).files[0];				
				sifdataadapter.loadFromFile(file);
				sifdataadapter.onRead.addEventListener(function (sender, id){
					
					try{
						_this.content = sender; //para el onOK.notify event
						
						var vertices = sender.dataset.getVerticesCount();
						var edges = sender.dataset.getEdgesCount();
						
						var sif = new SIFFileDataAdapter().toSIF(sender.dataset);
						var tabularFileDataAdapter = new TabularFileDataAdapter();
						tabularFileDataAdapter.parse(sif);
						_this.gridStore.loadData(tabularFileDataAdapter.getLines());
						
						_this.infoLabel.setText('<span class="ok">File loaded sucessfully</span>',false);
						_this.countLabel.setText('vertices:<span class="info">'+vertices+'</span> edges:<span class="info">'+edges+'</span>',false);
						
					}catch(e){
						_this.infoLabel.setText('<span class="err">File not valid </span>'+e,false);
					};
					
				}); 
		
			}
	    }
	});
	
	return this.fileUpload;
};
function FileWidget(args){
	var _this=this;
	this.targetId = null;
	this.id = "FileWidget_" + Math.round(Math.random()*100000);
	this.wum = true;
	this.tags = [];
	
	this.args = args;
	
	if (args != null){
		if (args.targetId!= null){
			this.targetId = args.targetId;       
		}
		if (args.title!= null){
			this.title = args.title;    
			this.id = this.title+this.id;
		}
		if (args.wum!= null){
			this.wum = args.wum;    
		}
        if (args.tags!= null){
        	this.tags = args.tags;       
        }
	}
	
	this.dataAdapter = null;
	this.onOk = new Event(this);
	
	this.browserData = new BrowserDataWidget();
	/** Events i listen **/
	this.browserData.onSelect.addEventListener(function (sender, data){
		_this.trackNameField.setValue(data.filename);
		_this.fileNameLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
		_this.panel.setLoading();
	});	
    this.browserData.adapter.onReadData.addEventListener(function (sender, data){
    	_this.trackNameField.setValue(data.filename);
    	_this.fileNameLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
    	_this.loadFileFromServer(data);
	});	
};

FileWidget.prototype.getTitleName = function(){
	return this.trackNameField.getValue();
};


FileWidget.prototype.getFileFromServer = function(){
	//abstract method
};

FileWidget.prototype.loadFileFromLocal = function(){
	//abstract method
};

FileWidget.prototype.getChartItems = function(){
	//abstract method
	return [];
};

FileWidget.prototype.getFileUpload = function(){
	var _this = this;
	this.uploadField = Ext.create('Ext.form.field.File', {
		msgTarget : 'side',
//		flex:1,
		width:75,
		emptyText: 'Choose a local file',
        allowBlank: false,
		buttonText : 'Browse local',
		buttonOnly : true,
		listeners : {
			change : {
				fn : function() {
					_this.panel.setLoading();
			
					var file = document.getElementById(_this.uploadField.fileInputEl.id).files[0];
					_this.trackNameField.setValue(file.fileName);
					_this.fileNameLabel.setText('<span class="emph">'+ file.name +'</span> <span class="info">(local)</span>',false);
					_this.loadFileFromLocal(file);

				}
			}
		}
	});
	return this.uploadField;
};


FileWidget.prototype.draw = function(){
	var _this = this;
	
	if (this.openDialog == null){
	
		/** Bar for the chart **/
		var featureCountBar = Ext.create('Ext.toolbar.Toolbar');
		this.featureCountLabel = Ext.create('Ext.toolbar.TextItem', {
			html:'<span class="dis">No file loaded</span>'
		});
		featureCountBar.add([this.featureCountLabel]);
		
		/** Bar for the file upload browser **/
		var browseBar = Ext.create('Ext.toolbar.Toolbar',{cls:'bio-border-false'});
		browseBar.add(this.getFileUpload());
		
		this.panel = Ext.create('Ext.panel.Panel', {
			border: false,
			cls:'panel-border-top panel-border-bottom',
	//		padding: "0 0 10 0",
			title: "Previsualization",
		    items : this.getChartItems(),
		    bbar:featureCountBar
		});
		
	//	var colorPicker = Ext.create('Ext.picker.Color', {
	//	    value: '993300',  // initial selected color
	//	    listeners: {
	//	        select: function(picker, selColor) {
	//	            alert(selColor);
	//	        }
	//	    }
	//	});
		this.trackNameField = Ext.create('Ext.form.field.Text',{
			name: 'file',
            fieldLabel: 'Track Name',
            allowBlank: false,
            value: 'New track from '+this.title+' file',
            emptyText: 'Choose a name',
            flex:1
		});
		
		var panelSettings = Ext.create('Ext.panel.Panel', {
			border: false,
			layout: 'hbox',
			bodyPadding: 10,
		    items : [this.trackNameField]	 
		});
		
		
		if(this.wum){
			this.btnBrowse = Ext.create('Ext.button.Button', {
		        text: 'Browse server',
		        disabled:true,
//		        iconCls:'icon-local',
//		        cls:'x-btn-default-small',
		        handler: function (){
	    	   		_this.browserData.draw($.cookie('bioinfo_sid'),_this.tags);
	       		}
			});
			
			browseBar.add(this.btnBrowse);
			
			if($.cookie('bioinfo_sid') != null){
				this.sessionInitiated();
			}else{
				this.sessionFinished();
			}
		}
		
		this.fileNameLabel = Ext.create('Ext.toolbar.TextItem', {
			html:'<span class="emph">Select a <span class="info">local</span> file or a <span class="info">server</span> file from your account.</span>'
		});
		browseBar.add(['->',this.fileNameLabel]);
		
		
		
		this.btnOk = Ext.create('Ext.button.Button', {
			text:'Ok',
			disabled:true,
			handler: function(){ 
				_this.onOk.notify({title:_this.getTitleName(), dataAdapter:_this.dataAdapter});
				_this.openDialog.close();
			}
		});
		
		this.openDialog = Ext.create('Ext.ux.Window', {
			title : 'Open '+this.title+' file',
			taskbar:Ext.getCmp(this.args.genomeViewer.id+'uxTaskbar'),
			width : 800,
	//		bodyPadding : 10,
			resizable:false,
			items : [browseBar, this.panel, panelSettings],
			buttons:[this.btnOk, 
			         {text:'Cancel', handler: function(){_this.openDialog.close();}}],
			listeners: {
			    	scope: this,
			    	minimize:function(){
						this.openDialog.hide();
			       	},
			      	destroy: function(){
			       		delete this.openDialog;
			      	}
		    	}
		});
		
	}
	this.openDialog.show();
};

FileWidget.prototype.sessionInitiated = function (){
	if(this.btnBrowse!=null){
		this.btnBrowse.enable();
	}
};
FileWidget.prototype.sessionFinished = function (){
	if(this.btnBrowse!=null){
		this.btnBrowse.disable();
	}
};GFFFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
GFFFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
GFFFileWidget.prototype.draw = FileWidget.prototype.draw;
GFFFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
GFFFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;

function GFFFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "GFF";
	args.tags = ["gff"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
};

GFFFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"])];
};

GFFFileWidget.prototype.loadFileFromLocal = function(file){
	var gffAdapter = new GFFFileDataAdapter();
	this._fileLoad(gffAdapter);
	gffAdapter.loadFromFile(file);
};

GFFFileWidget.prototype._fileLoad = function(gffAdapter){
	var _this = this;
	gffAdapter.onRead.addEventListener(function(sender, id) {
		_this.dataAdapter = new GFFLocalRegionDataAdapter();
		_this.dataAdapter.loadFromFileDataAdapter(sender);
		
		var datastore = new Array();
	 	for ( var chromosome in _this.dataAdapter.featuresByChromosome) {
			datastore.push({ features: _this.dataAdapter.featuresByChromosome[chromosome].length, chromosome: chromosome });
		}
		
	 	_this.chartWidgetByChromosome.getStore().loadData(datastore);
	 	_this.panel.setLoading(false);
	 	_this.featureCountLabel.setText("Features count: " + _this.dataAdapter.features.length, false);
	 	_this.btnOk.enable();
	});
};

GFFFileWidget.prototype.loadFileFromServer = function(data){
	var gffAdapter = new GFFFileDataAdapter();
	this._fileLoad(gffAdapter);
	gffAdapter.loadFromContent(data.data);
};BEDFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
BEDFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
BEDFileWidget.prototype.draw = FileWidget.prototype.draw;
BEDFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
BEDFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;;

function BEDFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "BED";
	args.tags = ["bed"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
};

BEDFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"])];
};

BEDFileWidget.prototype.loadFileFromLocal = function(file){
	var bedAdapter = new BEDFileDataAdapter();
	this._fileLoad(bedAdapter);
	bedAdapter.loadFromFile(file);
};

BEDFileWidget.prototype._fileLoad = function(bedAdapter){
	var _this = this;
	bedAdapter.onRead.addEventListener(function(sender, id) {
		_this.dataAdapter = new BEDLocalRegionDataAdapter();
		_this.dataAdapter.loadFromFileDataAdapter(sender);
		
		var datastore = new Array();
	 	for ( var chromosome in _this.dataAdapter.featuresByChromosome) {
			datastore.push({ features: _this.dataAdapter.featuresByChromosome[chromosome].length, chromosome: chromosome });
		}
	 	
	 	_this.chartWidgetByChromosome.getStore().loadData(datastore);
	 	_this.panel.setLoading(false);
	 	_this.featureCountLabel.setText("Features count: " + _this.dataAdapter.features.length, false);
	 	_this.btnOk.enable();
	});
};

BEDFileWidget.prototype.loadFileFromServer = function(data){
	var bedAdapter = new BEDFileDataAdapter();
	this._fileLoad(bedAdapter);
	bedAdapter.loadFromContent(data.data);
};
function NetworkFileWidget(args){
	this.targetId = null;
	this.id = "NetworkFileWidget-" + Math.round(Math.random()*10000000);
	
	this.title = 'Open a Network JSON file';
	this.width = 600;
	this.height = 300;
	
    if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
    
    
	this.dataAdapter = null;
	this.onOk = new Event(this);
	
	this.previewId = this.id+'-preview';
};

NetworkFileWidget.prototype.getTitleName = function(){
	return Ext.getCmp(this.id + "_title").getValue();
};

NetworkFileWidget.prototype.getFileUpload = function(){
	var _this = this;
	
	this.fileUpload = Ext.create('Ext.form.field.File', {
		msgTarget: 'side',
		allowBlank: false,
		emptyText:'JSON network file',
		flex:1,
		buttonText: 'Browse local',
		listeners: {
			change: function(){
				var dataadapter = new FileDataAdapter();
				var file = document.getElementById(_this.fileUpload.fileInputEl.id).files[0];
				dataadapter.read(file);
				dataadapter.onRead.addEventListener(function (sender, content){
					
					try{
						_this.content = content.content; //para el onOK.notify event
						var json = JSON.parse(content.content);
						
						
						var graphDataset = new GraphDataset();
						graphDataset.loadFromJSON(json.dataset);
						
						var vertices = graphDataset.getVerticesCount();
						var edges = graphDataset.getEdgesCount();
						
						var sif = new SIFFileDataAdapter().toSIF(graphDataset);
						var tabularFileDataAdapter = new TabularFileDataAdapter();
						tabularFileDataAdapter.parse(sif);
						_this.gridStore.loadData(tabularFileDataAdapter.getLines());
						
						_this.infoLabel.setText('<span class="ok">File loaded sucessfully</span>',false);
						_this.countLabel.setText('vertices:<span class="info">'+vertices+'</span> edges:<span class="info">'+edges+'</span>',false);
					
					}catch(e){
						_this.infoLabel.setText('<span class="err">File not valid </span>'+e,false);
					};
					
//					console.log(content.content);
				});
			}
	    }
	});
	
	return this.fileUpload;
};

//NetworkFileWidget.prototype.loadJSON = function(content){
//	this.metaNetworkViewer.loadJSON(content);
//	this.draw(this.metaNetworkViewer.getDataset(), this.metaNetworkViewer.getFormatter(), this.metaNetworkViewer.getLayout());
//};
NetworkFileWidget.prototype.draw = function(){
	var _this = this;
	
	if (this.panel == null){
		/** Bar for the file upload browser **/
		var browseBar = Ext.create('Ext.toolbar.Toolbar',{cls:'bio-border-false'});
		browseBar.add(this.getFileUpload());
		
		this.infoLabel = Ext.create('Ext.toolbar.TextItem',{html:'Please select a network saved File'});
		this.countLabel = Ext.create('Ext.toolbar.TextItem');
		var infobar = Ext.create('Ext.toolbar.Toolbar',{cls:'bio-border-false'});
		infobar.add([this.infoLabel,'->',this.countLabel]);
		
//		/** Container for Preview **/
//		var previewContainer = Ext.create('Ext.container.Container', {
//			id:this.previewId,
//			cls:'x-unselectable',
//			flex:1,
//			autoScroll:true
//		});
		
		
		/** Grid for Preview **/
		this.gridStore = Ext.create('Ext.data.Store', {
		    fields: ["0","1","2"]
		});
		this.grid = Ext.create('Ext.grid.Panel', {
			border:false,
			flex:1,
		    store: this.gridStore,
		    columns: [{"header":"Node","dataIndex":"0",flex:1},{"header":"Node","dataIndex":"1",flex:1},{"header":"Node","dataIndex":"2",flex:1}],
		    features: [{ftype:'grouping'}],
		    tbar:browseBar,
		    bbar:infobar
		});
		
		
		this.panel = Ext.create('Ext.window.Window', {
			title : this.title,
			width: this.width,
			height:this.height,
			resizable:false,
			layout: { type: 'vbox',align: 'stretch'},
			items : [this.grid],
			buttons:[{text:'Ok', handler: function()
									{ 
											_this.onOk.notify(_this.content);
											_this.panel.close();
									}}, 
			         {text:'Cancel', handler: function(){_this.panel.close();}}],
			listeners: {
			    	scope: this,
			    	minimize:function(){
						this.panel.hide();
			       	},
			      	destroy: function(){
			       		delete this.panel;
			      	}
		    	}
		});
	}
	this.panel.show();
	
};
function UrlWidget(args){
	var _this=this;
	this.id = "UrlWidget_" + Math.round(Math.random()*10000000);
	this.targetId = null;
	
	this.title = "Custom url";
	this.width = 500;
	this.height = 400;
	
	if (args != null){
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
	
	this.onAdd = new Event(this);
};

UrlWidget.prototype.draw = function (){
	if(this.panel==null){
		this.render();
	}
	this.panel.show();
};

UrlWidget.prototype.render = function (){
	var _this=this;
	
    this.urlField = Ext.create('Ext.form.field.Text',{
    	margin:"0 2 2 0",
    	labelWidth : 30,
    	flex:1,
    	fieldLabel : 'URL',
		emptyText: 'enter a valid url',
		value : "http://www.ensembl.org/das/Homo_sapiens.GRCh37.gene/features",
		listeners : { change: {fn: function(){ var dasName = this.value.split('/das/')[1].split('/')[0];
											   _this.trackNameField.setValue(dasName); }}
		}
    });
    this.checkButton = Ext.create('Ext.button.Button',{
		text : 'Check',
		handler : function() {
			_this.form.setLoading();
			var dasDataAdapter = new DasRegionDataAdapter({
				url : _this.urlField.getValue()
			});

			dasDataAdapter.successed.addEventListener(function() {
				_this.contentArea.setValue(dasDataAdapter.xml);
				_this.form.setLoading(false);
			});

			dasDataAdapter.onError.addEventListener(function() {
				_this.contentArea.setValue("XMLHttpRequest cannot load. This server is not allowed by Access-Control-Allow-Origin");
				_this.form.setLoading(false);
			});
			dasDataAdapter.fill(1, 1, 1);
		}
    });
	this.trackNameField = Ext.create('Ext.form.field.Text',{
		name: 'file',
//        fieldLabel: 'Track name',
        allowBlank: false,
        value: _this.urlField.value.split('/das/')[1].split('/')[0],
        emptyText: 'Choose a name',
        flex:1
	});
	this.panelSettings = Ext.create('Ext.panel.Panel', {
		layout: 'hbox',
		border:false,
		title:'Track name',
		cls:"panel-border-top",
		bodyPadding: 10,
	    items : [this.trackNameField]	 
	});
	this.contentArea = Ext.create('Ext.form.field.TextArea',{
		margin:"-1",
		width : this.width,
		height : this.height
	});
	this.infobar = Ext.create('Ext.toolbar.Toolbar',{height:28,cls:"bio-border-false"});
	this.infobar.add(this.urlField);
	this.infobar.add(this.checkButton);
	this.form = Ext.create('Ext.panel.Panel', {
		border : false,
		items : [this.infobar,this.contentArea,this.panelSettings]
	});
	
	this.panel = Ext.create('Ext.ux.Window', {
		title : this.title,
		layout: 'fit',
		resizable:false,
		items : [this.form],
		buttons : [{
			text : 'Add',
			handler : function() {
				_this.onAdd.notify({name:_this.trackNameField.getValue(),url:_this.urlField.getValue()});
				_this.panel.close();
			}
		},{text : 'Cancel',handler : function() {_this.panel.close();}}
		],
		listeners: {
	      	destroy: function(){
	       		delete _this.panel;
	      	}
    	}
	});
};function MasterSlaveGenomeViewer(trackerID, targetId,  args) {
	this.targetId = targetId;
	this.id = trackerID + Math.random();
	this.width = 1300;
	this.height = 700;
	
	this.slaveHeight = this.height;
	this.masterHeight = this.height;
	
	
	this.masterWindowSize = 1000000;
	
	if (args != null){
		if (args.width != null){
			this.width = args.width;
		}
		if (args.height != null){
			this.height = args.height;
		}
		if (args.masterHeight != null){
			this.masterHeight = args.height;
		}
		if (args.slaveHeight != null){
			this.slaveHeight = args.height;
		}
		
	}
	this.pixelRatio = 0.0005; //0.001;

	this.zoomLevels = new Array();
	for ( var i = 1; i <= 10; i++) {
		this.zoomLevels[i] = this.pixelRatio * (i*2);
	}
	this.zoomLevels[0.1] = this.pixelRatio;
	this.genomeWidget = null;
	
	 /** Events **/
    this.markerChanged = new Event(this);

	
	
	
	
};

MasterSlaveGenomeViewer.prototype.getZoomFactor = function(value) {
	return this.zoomLevels[value/10];
};


MasterSlaveGenomeViewer.prototype.getMasterId = function() {
	return this.id + "_master";
};

MasterSlaveGenomeViewer.prototype.getSlaveId = function() {
	return this.id + "_slave";
};

MasterSlaveGenomeViewer.prototype.getMasterStart = function() {
	return this.position - (this.masterWindowSize);
};

MasterSlaveGenomeViewer.prototype.getMasterEnd = function() {
	return this.position + (this.masterWindowSize);
};


MasterSlaveGenomeViewer.prototype.init = function() {
//	var master = DOM.createNewElement("DIV", DOM.select(this.getMasterId()), [["width", this.width], ["height", this.height]]);
};

MasterSlaveGenomeViewer.prototype.goTo = function(chromosome, position) {
	this.clear();
	this.chromosome = chromosome;
	this.position = position;

	this._drawMaster();
	this._drawSlave(this.position);
};


MasterSlaveGenomeViewer.prototype.zoomIn = function() {
	this.position = this.genomeWidget.trackCanvas.getMiddlePoint();
//	this.pixelRatio = this.pixelRatio + 0.02;
	this.pixelRatio = this.pixelRatio * 1.5;
	this.clear();
	this.genomeWidget.trackCanvas._goToCoordinateX( this.position - (this.genomeWidget.trackCanvas.width/2) / this.pixelRatio);
	console.log("PIXEL RATIO " + this.pixelRatio);
};


MasterSlaveGenomeViewer.prototype.zoom = function(value) {
	if (value > 50){
			this.pixelRatio = this.pixelRatio * (1.5* ((value/4)/10));
	}
	else{
			this.pixelRatio = this.pixelRatio / (1.5* ((value/4)/10));
	}
	this.pixelRatio = this.getZoomFactor(value);
	this.position = this.genomeWidget.trackCanvas.getMiddlePoint();
	
	this.clear();
	this.genomeWidget.trackCanvas._goToCoordinateX( this.position - (this.genomeWidget.trackCanvas.width/2) / this.pixelRatio);
	
};

MasterSlaveGenomeViewer.prototype.zoomOut = function() {
	
	this.position = this.genomeWidget.trackCanvas.getMiddlePoint();
//	this.pixelRatio = this.pixelRatio - 0.002;
	this.pixelRatio = this.pixelRatio / 1.5;
	this.clear();
	this.genomeWidget.trackCanvas._goToCoordinateX( this.position - (this.genomeWidget.trackCanvas.width/2) / this.pixelRatio);
	console.log("PIXEL RATIO " + this.pixelRatio);
};

MasterSlaveGenomeViewer.prototype.clear = function() {
	this.genomeWidget.clear();
	this._drawMaster();
};

MasterSlaveGenomeViewer.prototype._createMaster = function() {


    var newGenomeWidget = new GenomeWidget(this.id + "master", this.getMasterId(),
                    {
                            "pixelRatio":this.pixelRatio,
                            "width":this.width,
                            "height":  this.height,
                            "showTranscripts": this.showTranscripts,
                            "showExons": this.showExons,
                            "showSNPTrack" : this.showSNPTrack
                    });

    if (this.genomeWidget != null){
            newGenomeWidget.trackList = this.genomeWidget.trackList;
            newGenomeWidget.dataAdapterList = this.genomeWidget.dataAdapterList;
            for ( var i = 0; i < newGenomeWidget.dataAdapterList.length; i++) {
                    newGenomeWidget.dataAdapterList.preloadSuccess = new Event();
                    newGenomeWidget.dataAdapterList.successed = new Event();
            }
    }

    return newGenomeWidget;
};



MasterSlaveGenomeViewer.prototype._drawMaster = function() {
//	this.genomeWidget = new GenomeWidget(this.id + "master", this.getMasterId(), {"pixelRatio":this.pixelRatio,  "width":this.width, "height":  this.height});
//	this.genomeWidget.draw(this.chromosome, this.getMasterStart(), this.getMasterEnd());
//	var _this = this;
//	this.genomeWidget.onClick.addEventListener(function (evt, feature){
//	    	console.log(feature);
//	});
//	
//	this.genomeWidget.markerChanged.addEventListener(function (evt, data){
//		_this.updateSlave(data);
//	});
	  this.genomeWidget = this._createMaster();
      this.genomeWidget.draw(this.chromosome, this.getMasterStart(), this.getMasterEnd());
      this._attachMasterEvents();

	
	
	
};

MasterSlaveGenomeViewer.prototype._attachMasterEvents = function() {
    var _this = this;
    this.genomeWidget.onClick.addEventListener(function (evt, feature){
//          console.log(feature);
    });

    this.genomeWidget.markerChanged.addEventListener(function (evt, data){
            _this.updateSlave(data);
            _this.chromosome = _this.genomeWidget.chromosome;
            _this.position = data;
            _this.markerChanged.notify();
    });
};


MasterSlaveGenomeViewer.prototype.addTrackMaster = function(track, dataAdapter) {
  this.genomeWidget = this._createMaster();
  this.genomeWidget.addTrack(track, dataAdapter);
//    this.masterGenomeWidget.draw(this.chromosome, this.getMasterStart(), this.getMasterEnd());
    this._attachMasterEvents();
};



MasterSlaveGenomeViewer.prototype._drawSlave = function(position) {
	DOM.removeChilds(this.getSlaveId());
	this.detailViewer = new SequenceGenomeWidget(this.id +"detail", this.getSlaveId(), {"width":this.width});
	this.detailViewer.draw(this.chromosome, position - 100, position + 100);
	
};

MasterSlaveGenomeViewer.prototype.draw = function(chromosome, position) {
	this.chromosome = chromosome;
	this.position = position;
	this.init();

	this._drawMaster();
	this._drawSlave(this.position);
};

MasterSlaveGenomeViewer.prototype.updateSlave = function(position) {
	this._drawSlave(position);
	this.detailViewer.trackCanvas._goToCoordinateX(position - ((this.detailViewer.trackCanvas.width/this.detailViewer.trackCanvas.pixelRatio)/2));
};// JavaScript Document
function KaryotypePanelWindow(species,args){
	var _this = this;
	this.id = "KaryotypePanelWindow_" + Math.random();
	this.karyotypeWidget = new KaryotypePanel(this.getKaryotypePanelId(), species, {"top":10, "width":1000, "height": 300, "trackWidth":15});
	this.karyotypeCellBaseDataAdapter = new KaryotypeCellBaseDataAdapter(species);
	
	this.args = args;
	
	this.onRendered = new Event();
	this.onMarkerChanged = new Event();
	
	this.karyotypeCellBaseDataAdapter.successed.addEventListener(function(evt, data){
		_this.karyotypeWidget.onRendered.addEventListener(function(evt, data){
			_this.onRendered.notify();
		});
		
		_this.karyotypeWidget.onClick.addEventListener(function(evt, data){
			_this.onMarkerChanged.notify(data);
		});
		
		_this.karyotypeWidget.draw(_this.karyotypeCellBaseDataAdapter.chromosomeNames, _this.karyotypeCellBaseDataAdapter.dataset.json);	

	});
	
};

KaryotypePanelWindow.prototype.select = function(chromosome, start, end){
	this.karyotypeWidget.select(chromosome, start, end);
};

KaryotypePanelWindow.prototype.mark = function(features){
	this.karyotypeWidget.mark(features);
};


KaryotypePanelWindow.prototype.draw = function(){
	if(this.panel==null){
		this.render();
	}
	this.panel.show();
};

KaryotypePanelWindow.prototype.getKaryotypePanel = function(){
	if(this.karyotypePanel==null){
		
		var helpLabel = Ext.create('Ext.toolbar.TextItem', {
			html:'<span class="dis">Click on chromosome to go</span>'
		});
		var infobar = Ext.create('Ext.toolbar.Toolbar',{dock: 'top'});
		infobar.add(helpLabel);
		
		this.karyotypePanel  = Ext.create('Ext.panel.Panel', {
			height:350,
			maxHeight:350,
			border:false,
			bodyPadding: 15,
			padding:'0 0 0 0',
			html:'<div id="' + this.getKaryotypePanelId() +'" ><div>',
			dockedItems: [infobar]
		});
	}
	return this.karyotypePanel;
};

KaryotypePanelWindow.prototype.render = function(){
	var _this = this;
	
	this.panel = Ext.create('Ext.ux.Window', {
		title: 'Karyotype',
		resizable:false,
		taskbar:Ext.getCmp(this.args.genomeViewer.id+'uxTaskbar'),
		constrain:true,
		animCollapse: true,
		width: 1050,
		height: 412,
		minWidth: 300,
		minHeight: 200,
		layout: 'fit',
		items: [this.getKaryotypePanel()],
		buttonAlign:'center',
		buttons:[{ text: 'Close', handler: function(){_this.panel.close();}}],
 		listeners: {
	      	destroy: function(){
	       		delete _this.panel;
	      	}
    	}
	});
	this.karyotypeCellBaseDataAdapter.fill();
};

KaryotypePanelWindow.prototype.getKaryotypePanelId = function (){
	return this.id+"_karyotypePanel";	
};// JavaScript Document
function KaryotypePanel(targetID, species, args){
	this.id = targetID+Math.round(Math.random()*10000);
	this.targetId = targetID;
	
	this.species=species;
	
	this.width = 500;
	this.height = 300;
	
	
	if (args!=null){
		if (args.height!=null){
			this.height = args.height;
		}
		if (args.width!=null){
			this.width = args.width;
		}
		
		if (args.trackWidth!=null){
			this.trackWidth = args.trackWidth;
		}
		
	}
	
	//Events 
	this.onClick = new Event(this);
	this.onRendered = new Event(this);
	this.onMarkerClicked = new Event(this);
};


KaryotypePanel.prototype.getTrackId = function(index){
	return this.id + "_track_" + index;
};


KaryotypePanel.prototype.init = function(){
	
	this.containerTable = DOM.createNewElement("table", DOM.select(this.targetId), [["id", this.id+"_table"], ["width", this.width], ["height", this.height]]);
	tr = DOM.createNewElement("tr", this.containerTable, [["width", this.width],["style", "vertical-align:bottom"]]);
	for ( var i = 0; i < this.features.length; i++) {
		var td = DOM.createNewElement("td", tr, [["style", "vertical-align:bottom"],["id", this.getTrackId(i)]]);
	}
};

KaryotypePanel.prototype.drawFeatures = function(){
	var _this = this;
	var size = this.width/this.features.length;
	
		this.panels = new Object();
		for ( var i = 0; i < this.features.length; i++) {
				var bottom = (this.chromosomeSize[i] * this.height) - 10;
				
				var verticalTrack =  new ChromosomeFeatureTrack(this.id + "chr" + this.chromosomesNames[i], document.getElementById( this.getTrackId(i)), this.species,{
					top:10, 
					bottom:bottom, 
					left:12, 
					right:25,  
					width: size, 
					height: this.chromosomeSize[i] * this.height,
					 "labelChromosome":true, 
					 label:true, 
					 "vertical":true, 
					 "rounded":2,
					 "backgroundcolor":"yellow"	
				});	
				_this.panels[this.chromosomesNames[i]] = verticalTrack;
				
				var dataset = new DataSet();
				dataset.loadFromJSON([this.features[i]]);
				verticalTrack.draw(dataset);
				
				_this.panels[this.chromosomesNames[i]].click.addEventListener(function (evt, cytoband){
					var position = (cytoband.end - cytoband.start)/2 + cytoband.start;
					_this.select(cytoband.chromosome, position, position + 2000000 );
					_this.onClick.notify(cytoband);
				});
				
				_this.panels[this.chromosomesNames[i]].onMarkerClicked.addEventListener(function (evt, feature){
					_this.onMarkerClicked.notify(feature);
				});
				
		}
		this.onRendered.notify();
};

KaryotypePanel.prototype.select = function(chromosome, start, end){
	for ( var i = 0; i < this.chromosomesNames.length; i++) {
		this.panels[this.chromosomesNames[i]].deselect();
	}
	
	this.panels[chromosome].select(start, end);
};

KaryotypePanel.prototype.mark = function(features, color){
	
	for ( var i = 0; i < features.length; i++) {
		if (this.panels[features[i].chromosome] != null){
			this.panels[features[i].chromosome].mark(features[i], color);
		}
	}
};

KaryotypePanel.prototype.unmark = function(){
	for (var panel in this.panels){
		this.panels[panel].unmark();
	}
		
};


KaryotypePanel.prototype.draw = function(names, chromosomes){
	this.features = chromosomes;
	this.chromosomesNames = names;
	
	this.chromosomeSize = new Array();
	this.maxChromosomeSize = 0;
	for ( var i = 0; i < this.features.length; i++) {
		this.chromosomeSize.push(this.features[i][this.features[i].length-1].end);
		if (this.maxChromosomeSize < this.features[i][this.features[i].length-1].end){
			this.maxChromosomeSize = this.features[i][this.features[i].length-1].end;
		}
	}
	
	for ( var i = 0; i < this.features.length; i++) {
		this.chromosomeSize[i] = (this.chromosomeSize[i] / this.maxChromosomeSize);
	}
	
	this.init();
	this.drawFeatures();
};

function TooltipPanel(args){
	this.id = "TooltipPanel" + Math.round(Math.random()*10000000);
	this.targetId = null;
	this.width = 100;
	this.height = 60;
	
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
};

TooltipPanel.prototype.getPanel = function(item){
	var _this=this;
	
	if (this.panel == null){
		this.panel = Ext.create('Ext.tip.Tip',{
			html:this._getItemInfo(item)
		});
	}	
	return this.panel;
};

TooltipPanel.prototype.destroy = function(){
	this.panel.destroy();
};

TooltipPanel.prototype._getItemInfo = function(item){
//	console.log(item);
	var str = "";
	if(item instanceof GeneFeatureFormatter || 
	   item instanceof TranscriptFeatureFormatter || 
	   item instanceof ExonFeatureFormatter || 
	   item instanceof SNPFeatureFormatter|| 
	   item instanceof TfbsFeatureFormatter ){
		str = '<span class="ssel">'+item.getName()+'</span><br>'+
		'start: <span class="emph">'+item.start+'</span><br>'+
		'end:  <span class="emph">'+item.end+'</span><br>'+
		'length: <span class="info">'+(item.end-item.start+1)+'</span><br>';
		
	}
	if(item instanceof VCFFeatureFormatter){
		str = '<span class="ssel">'+item.getName()+'</span><br>';
	}
	return str;
};
function KaryotypeHorizontalMarkerWidget(){
	this.id = "GV_";
	this.width = 600;
	this.height = 700;
	this.tabPanelHeight = 250;
	this.topPanelHeight = 600;

	
//	this.karyotypeWidget = new KaryotypePanel("human", "container_map_karyotype", {"width":this.width, "height": this.tabPanelHeight - 50, "trackWidth":15});
	this.genomeWidget = new GenomeWidget("id", "container_map", {width:100,  "height":this.topPanelHeight} );
	

	var _this = this;
//	this.karyotypeWidget.onClick.addEventListener(function (evt, feature){
////		_this.genomeWidget.draw(feature.chromosome, feature.start);
//		_this.goTo(feature.chromosome, feature.start);
//	});

	this.genomeWidgetProperties = new GenomeWidgetProperties({windowSize:1000000, pixelRatio: 0.00001});
	
	var sequenceTrack =  new SequenceFeatureTrack( this.id + "sequence", this.tracksPanel, {
		top:0, 
		left:0, 
		right:this.width,  
		width:this.width, 
		height:20, 
		featureHeight:12, 
		avoidOverlapping : false,
		backgroundColor: '#FFFFFF'
	});
	this.genomeWidgetProperties.addTrackByZoom(100, 100, sequenceTrack, new RegionCellBaseDataAdapter({resource: "sequence"}));
	
//	var snpTrack =  new SNPFeatureTrack( this.id + "_snp",  this.tracksPanel, {
//		top:0, 
//		left:0, 
//		right:this.width,  
//		width:this.width, 
//		height:30, 
//		featureHeight:10, 
//		opacity : 1,
//		avoidOverlapping : true,
//		pixelSpaceBetweenBlocks: 100,
//		backgroundColor: '#FFFFFF'
//	});
//	this.genomeWidgetProperties.addTrackByZoom(100, 100, snpTrack, new RegionCellBaseDataAdapter({resource: "snp"}));
	
	var cytobandTrack =  new CytobandFeatureTrack( this.id + "_cytoband",  this.tracksPanel, {
		top:0, 
		left:0, 
		height:20, 
		title:"Cytoband",
		titleFontSize:9,
		label:false,
		featureHeight:8, 
		opacity : 1,
		backgroundColor: '#FFFFFF'
	});
	this.genomeWidgetProperties.addTrackByZoom(0, 0, cytobandTrack, new RegionCellBaseDataAdapter({resource: "cytoband"}));
	var cytobandTrack2 =  new CytobandFeatureTrack( this.id + "_cytoband",  this.tracksPanel, {
		top:0, 
		left:0, 
		height:20, 
		title:"Cytoband",
		titleFontSize:9,
		label:true,
		featureHeight:8, 
		opacity : 1,
		backgroundColor: '#FFFFFF'
	});
	this.genomeWidgetProperties.addTrackByZoom(10, 100, cytobandTrack2, new RegionCellBaseDataAdapter({resource: "cytoband"}));
	
	
	 var multitrack = new HistogramFeatureTrack( this.id +"_multiTrack", this.tracksPanel, {
		 	top:5, 
			left:0, 
			height:20, 
			featureHeight:18, 
			queueHeight : 18,
			title:"GENES",
			titleFontSize:9,
			showTranscripts: false,
			allowDuplicates:true,
			backgroundColor: '#FFFFFF', 
			label:false,
			pixelSpaceBetweenBlocks : 1,
			showDetailGeneLabel:false,
			forceColor: "blue",
			intervalSize:1000000
		});

	this.genomeWidgetProperties.addTrackByZoom(0, 0, multitrack, new GeneRegionCellBaseDataAdapter({obtainTranscripts:false}));
	
	 var multitrack = new HistogramFeatureTrack( this.id +"_multiTrack", this.tracksPanel, {
		 	top:5, 
			left:0, 
			height:20, 
			featureHeight:18, 
			queueHeight : 18,
			title:"GENES",
			titleFontSize:9,
			showTranscripts: false,
			allowDuplicates:true,
			backgroundColor: '#FFFFFF', 
			label:false,
			pixelSpaceBetweenBlocks : 1,
			showDetailGeneLabel:false,
			forceColor: "blue",
			intervalSize:100000
		});

	this.genomeWidgetProperties.addTrackByZoom(10, 10, multitrack, new GeneRegionCellBaseDataAdapter({obtainTranscripts:false}));
	
	 var multitrack3 = new MultiFeatureTrack( this.id +"_multiTrack", this.tracksPanel, {
		 	top:5, 
			left:0, 
			height:10, 
			featureHeight:7, 
			queueHeight : 10,
			title:"GENES",
			titleFontSize:9,
			showTranscripts: false,
			allowDuplicates:false,
			backgroundColor: '#FFFFFF', 
			label:false,
			pixelSpaceBetweenBlocks : 1,
			showDetailGeneLabel:false
		});

	this.genomeWidgetProperties.addTrackByZoom(20, 40, multitrack3, new GeneRegionCellBaseDataAdapter({obtainTranscripts:false}));
	
	 var multitrack4 = new MultiFeatureTrack( this.id +"_multiTrack", this.tracksPanel, {
		 top:5,  
			left:0, 
			height:10, 
			featureHeight:7, 
			queueHeight : 10,
			title:"GENES",
			titleFontSize:9,
			showTranscripts: false,
			allowDuplicates:false,
			backgroundColor: '#FFFFFF', 
			label:true,
			pixelSpaceBetweenBlocks : 200,
			showDetailGeneLabel:false
		});

	this.genomeWidgetProperties.addTrackByZoom(50, 60, multitrack4, new GeneRegionCellBaseDataAdapter({obtainTranscripts:false}));
	
	
	 var multitrack2 = new MultiFeatureTrack( this.id +"_multiTrack", this.tracksPanel, {
		 top:5,  
			left:0, 
			height:10, 
			featureHeight:6, 
			queueHeight : 10,
			title:"GENES",
			titleFontSize:9,
			labelFontSize:8,
			showTranscripts: true,
			allowDuplicates:false,
			backgroundColor: '#FFFFFF', 
			label:true,
			pixelSpaceBetweenBlocks : 200,
			showDetailGeneLabel:true
		});
	this.genomeWidgetProperties.addTrackByZoom(70, 90, multitrack2, new GeneRegionCellBaseDataAdapter());
};






KaryotypeHorizontalMarkerWidget.prototype.draw = function(chromosome, position){
	
	
	this.chromosome = chromosome;
	this.position = position;

	
	var center = Ext.create('Ext.panel.Panel', {
		layout : 'vbox',
		region: 'center',
		margins:'0 0 0 5',
		items:[
//		       this.getMainMenu(),
		       this.getTopPanel()
//		       this.getMiddleMenu(),
//		       this.getBotPanel()
		      ]
	});


	var port = Ext.create('Ext.container.Viewport', {
		layout: 'border',
		items: [
		        center
		        ]
	});


//	this.genomeWidget.draw(this.chromosome, this.position);
	this._drawMasterKaryotypeHorizontalMarkerWidget(this.chromosome,this.position - (this.genomeWidgetProperties.windowSize), this.position + (this.genomeWidgetProperties.windowSize));
	
	

};




/** Drawing master Genome Viewer **/
KaryotypeHorizontalMarkerWidget.prototype.getMasterId = function() {
	return this.id + "_master";
};

KaryotypeHorizontalMarkerWidget.prototype.zoom = function(value) {
//	for ( var i = 0; i < this.genomeWidgetProperties.getTrackByZoom(value).length; i++) {
//		this.genomeWidgetProperties.windowSize = this.genomeWidgetProperties.minWindowSize;
//		this.genomeWidgetProperties._pixelRatio = 10; 
//		this.addMasterTrack(this.genomeWidgetProperties.getTrackByZoom(value)[i], this.genomeWidgetProperties.getDataAdapterByZoom(value)[i]);
//	}
	this.position = this.genomeWidget.getMiddlePoint();
	this.refreshMasterKaryotypeHorizontalMarkerWidget();
	this.genomeWidget.trackCanvas._goToCoordinateX( this.position - (this.genomeWidget.trackCanvas.width/2) / this.genomeWidgetProperties.getPixelRatio());
};

KaryotypeHorizontalMarkerWidget.prototype.goTo = function(chromosome, position) {
	this.chromosome = chromosome;
	this.position = position;
	this.refreshMasterKaryotypeHorizontalMarkerWidget();
};

KaryotypeHorizontalMarkerWidget.prototype.refreshMasterKaryotypeHorizontalMarkerWidget = function() {
	this.genomeWidget.clear();
//	this._drawMasterKaryotypeHorizontalMarkerWidget(this.chromosome,this.position - (this.genomeWidgetProperties.windowSize), this.position + (this.genomeWidgetProperties.windowSize));
	this._drawMasterKaryotypeHorizontalMarkerWidget();
};

KaryotypeHorizontalMarkerWidget.prototype.addMasterTrack = function(track, dataAdapter) {
	this.genomeWidgetProperties.getCustomTracks().push(track);
	this.genomeWidgetProperties.getCustomDataAdapters().push(dataAdapter);
	this._drawMasterKaryotypeHorizontalMarkerWidget();
//	this.position = this.genomeWidget.getMiddlePoint();
//	this.refreshMasterKaryotypeHorizontalMarkerWidget();
//	this.genomeWidget.trackCanvas._goToCoordinateX( this.position - (this.genomeWidget.trackCanvas.width/2) / this.genomeWidgetProperties.pixelRatio);
	
//	this.zoom(0);
};

KaryotypeHorizontalMarkerWidget.prototype._drawMasterKaryotypeHorizontalMarkerWidget = function() {
		var _this = this;
		this.genomeWidget = new GenomeWidget(this.id + "master", this.getMasterId(), {
		                pixelRatio: 0.000002,//this.genomeWidgetProperties.getPixelRatio(),
		                width:this.width,
		                height:  this.height
		        });

		/** Reseteamos las propiedades top y height a los originales asi como los datasets **/
		for ( var i = 0; i < this.genomeWidgetProperties.getCustomTracks().length; i++) {
			this.genomeWidgetProperties.getCustomTracks()[i].top = this.genomeWidgetProperties.getCustomTracks()[i].originalTop;
			this.genomeWidgetProperties.getCustomTracks()[i].height = this.genomeWidgetProperties.getCustomTracks()[i].originalHeight;
			this.genomeWidgetProperties.getCustomTracks()[i].clear();
			this.genomeWidgetProperties.getCustomDataAdapters()[i].datasets = new Object();
			this.genomeWidget.addTrack(this.genomeWidgetProperties.getCustomTracks()[i], this.genomeWidgetProperties.getCustomDataAdapters()[i]);
			
		 }
		
		var zoom = this.genomeWidgetProperties.getZoom();

		for ( var i = 0; i < this.genomeWidgetProperties.getTrackByZoom(zoom).length; i++) {
			var track =  this.genomeWidgetProperties.getTrackByZoom(zoom)[i];
			track.top = track.originalTop;
			track.height = track.originalHeight;
			track.clear();
			
			this.genomeWidgetProperties.getDataAdapterByZoom(zoom)[i].datasets = new Object();
			this.genomeWidget.addTrack(track, this.genomeWidgetProperties.getDataAdapterByZoom(zoom)[i]);
			
		}
		
		
		var start = Math.ceil(this.position - (this.genomeWidgetProperties.windowSize));
		var end = Math.ceil(this.position +  (this.genomeWidgetProperties.windowSize));
		
		if (start < 0){ start = 0;}
		
		this.genomeWidget.draw(this.chromosome, start, end);
		
		
};


/** PANELS**/
KaryotypeHorizontalMarkerWidget.prototype.getTopPanel = function() {	
	return Ext.create('Ext.panel.Panel', {
							width: this.width,
							height: this.topPanelHeight,
							margins:'0 5 2 5',
							html:'<div id = "'+ this.getMasterId() +'"></div>'
	});
};
function GenomeWidgetProperties(species,args) {
	this.args = args;
	
	this.species=species;
	this.windowSize = 10000000;
	
	this.minWindowSize = 100;
	this.maxWindowSize = 100000000;
	
	this._pixelRatio = 0.0005; 
	this.showTranscripts = false;
	
	this._zoom = 0;
    
	/** General parameters TRACKS CONFIG **/
	this.labelHeight = 10;
	this.labelSize = 10;
	this.featureHeight = 4;
	
	if (args != null){
		if (args.windowSize != null){
			this.windowSize = args.windowSize;
		}
		if (args.id != null){
			this.id = args.id;
		}
		
		if (args._pixelRatio != null){
			this._pixelRatio = args._pixelRatio;
		}
		
		if (args.showTrancsripts != null){
			this.showTrancsripts = args.showTranscripts;
		}
		
		if (args.showExons != null){
			this.showExons = args.showExons;
		}
	}
	
	this._zoomLevels = new Object();
	this._windowSizeLevels = new Object();
	this._zoomTracks = new Object();
	this._zoomDataAdapters = new Object();
	
	for ( var i = 0; i <= 100; i = i + 10) { 
		this._zoomTracks[i] = new Array();
		this._zoomDataAdapters[i] = new Array();
	}
	
	this.tracks = new Object();
	this.customTracks = new Array();
	this.customDataAdapters = new Array();
	this.init();
};

GenomeWidgetProperties.prototype.getWindowSize = function(zoomFactor){
	return this._windowSizeLevels[zoomFactor];
};
GenomeWidgetProperties.prototype.init = function(){
	this._zoomLevels[0] =  1/200000;
	this._zoomLevels[10] = 1/50000;
//	this._zoomLevels[20] = 1/25000;
//	this._zoomLevels[30] =  0.00005*16;
	this._zoomLevels[20] = 0.00005*16;
	this._zoomLevels[30] = 0.00005*16;
	this._zoomLevels[40] = 0.00005*64;
	this._zoomLevels[50] = 0.00005*128;
	this._zoomLevels[60] = 0.00005*256;
	this._zoomLevels[70] = 0.00005*512;
	this._zoomLevels[80] = 0.00005*1024;
	this._zoomLevels[90] = 0.00005*2048;
	this._zoomLevels[100] = 10;
	
	this._windowSizeLevels[0] = 130000000;
	this._windowSizeLevels[10] = 40000000;
//	this._windowSizeLevels[20] = 20000000;
//	this._windowSizeLevels[30] = 750000;
	this._windowSizeLevels[20] = 750000;
	this._windowSizeLevels[30] = 750000;
	this._windowSizeLevels[40] = 750000/4;
	this._windowSizeLevels[50] = 750000/8;
	this._windowSizeLevels[60] = 750000/16;
	this._windowSizeLevels[70] = 750000/32;
	this._windowSizeLevels[80] = 750000/64;
	this._windowSizeLevels[90] = 750000/128;
	this._windowSizeLevels[100] = 100;
	
	this._zoom =  40;
	this._pixelRatio = this._zoomLevels[this._zoom];
	this.windowSize = this._windowSizeLevels[this._zoom];

	
	for ( var i = 0; i <= 100; i = i + 10) {
		  var rule = new RuleFeatureTrack( this.id + "_ruleTrack", this.tracksPanel, this.species,{
				top:10, 
				left:0, 
				height:20, 
				expandRuleHeight : 1500,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				floating:true
//				title:'Ruler'
			});
		
		  this.addTrackByZoom(i, i, rule, new RuleRegionDataAdapter({pixelRatio: this._zoomLevels[i]}));
	}
	this.addNativeTracks();

};

GenomeWidgetProperties.prototype.setLabelHeight = function(value){
//labelHeight : this.labelHeight,
//featureHeight : 10,
//labelSize : this.labelSize,
	for ( var zoom in this._zoomTracks) {
		var tracks = this._zoomTracks[zoom];
		for ( var j = 0; j < tracks.length; j++) {
			tracks[j].labelHeight = value;
			tracks[j].labelSize = value;
		}
//		console.log(tracks);
	}
	
};


GenomeWidgetProperties.prototype.addCustomTrackByZoom = function(minZoom, maxZoom, track, dataAdapter){
	if (track.titleName.length > 5) {
		track.titleWidth = track.titleName.length * 5;
	}
	else{
		track.titleWidth = 25;
	}
	
	this.customTracks.push(track);
	
	if ((track instanceof HistogramFeatureTrack) == false && (track instanceof SNPFeatureTrack) == false){
		track.labelHeight = this.labelHeight;
		track.featureHeight = this.featureHeight;
	}
	
	this.addTrackByZoom(minZoom, maxZoom, track, dataAdapter);
};

GenomeWidgetProperties.prototype.addTrackByZoom = function(minZoom, maxZoom, track, dataAdapter){
	if (this.tracks[track.titleName] == null){
		this.tracks[track.titleName] = true;
	}
	
	for ( var i = minZoom; i <= maxZoom; i = i + 10) { 
		this._zoomTracks[i].push(track);
		this._zoomDataAdapters[i].push(dataAdapter);
	}
};

GenomeWidgetProperties.prototype.getTrackByZoom = function(zoom){
	var tracksByZoomVisible = new Array();
	for ( var i = 0; i < this._zoomTracks[zoom].length; i++) {
		if (this.tracks[this._zoomTracks[zoom][i].titleName] == true){
			tracksByZoomVisible.push(this._zoomTracks[zoom][i]);
		}
	}
	return 	tracksByZoomVisible;
	
};

GenomeWidgetProperties.prototype.getDataAdapterByZoom = function(zoom){
	var tracksByZoomVisible = new Array();
	for ( var i = 0; i < this._zoomTracks[zoom].length; i++) {
		if (this.tracks[this._zoomTracks[zoom][i].titleName] == true){
			tracksByZoomVisible.push(this._zoomDataAdapters[zoom][i]);
		}
	}
	
	return 	tracksByZoomVisible;
};



GenomeWidgetProperties.prototype.getPixelRatio = function(){
	return this._zoomLevels[this.getZoom()];
};

GenomeWidgetProperties.prototype.setZoom = function(zoom){
	this._zoom = zoom;
	this._pixelRatio =  this.getPixelRatioByZoomLevel(this.getZoom());
	this.windowSize = this._windowSizeLevels[zoom];
};


GenomeWidgetProperties.prototype.getZoom = function(){
	return this._zoom;
};

GenomeWidgetProperties.prototype.getPixelRatioByZoomLevel = function(zoom){
	if(zoom == 100) return 10;
	return this._zoomLevels[zoom];
};

GenomeWidgetProperties.prototype.getCustomTracks = function(){
	return this.customTracks;
};

GenomeWidgetProperties.prototype.getCustomDataAdapters = function(){
	return this.customDataAdapters;
};


GenomeWidgetProperties.prototype.addNativeTracks = function(){
	this.addSequenceTracks();
	this.addSNPTracks();
	this.addCytobandTracks();
	this.addMultifeatureTracks();
	this.addTFBSTracks();
	this.addHistoneTracks();
	this.addPolymeraseTracks();
	this.addOpenChromatinTracks();
	this.addMirnaTargetTracks();
	
	this.addConservedRegionsTracks();
	
	/** Set visibility **/
	this.tracks["SNP"] = false;
	this.tracks["Sequence"] = false;
	this.tracks["Cytoband"] = false;
	
	this.tracks["Histone"] = false;
	this.tracks["Open Chromatin"] = false;
	this.tracks["Polymerase"] = false;
	this.tracks["TFBS"] = false;
	this.tracks["miRNA targets"] = false;
	//TODO doing
	this.tracks["Conserved regions"] = false;
};


/** SNP TRACKS **/
GenomeWidgetProperties.prototype.addSNPTracks = function(){
		var snpTrack = new SNPFeatureTrack(this.id + "snp",this.tracksPanel, this.species, {
			top : 5,
			left : 0,
			label : true,
			title : "SNP",
			height : 20,
			isAvalaible : false
		});
		this.addTrackByZoom(0, 80, snpTrack,new RegionCellBaseDataAdapter(this.species,{resource : "snp"}));
		
		var snpTrack = new SNPFeatureTrack(this.id + "snp",this.tracksPanel, this.species,{
			top : 5,
			left : 0,
			label : false,
			title : "SNP",
			height : 20,
			labelHeight : this.labelHeight,
			featureHeight : 10,
			labelSize : this.labelSize,
			pixelSpaceBetweenBlocks : 150,
			avoidOverlapping : false,
			backgroundColor : '#FFFFFF'
		});
		this.addTrackByZoom(90, 90, snpTrack,new RegionCellBaseDataAdapter(this.species,{resource : "snp"}));
		
		var snpTrack = new SNPFeatureTrack(this.id + "snp",this.tracksPanel, this.species,{
			top : 5,
			left : 0,
			label : true,
			title : "SNP",
			height : 20,
			labelHeight : this.labelHeight,
			featureHeight : 10,
			labelSize : this.labelSize,
			pixelSpaceBetweenBlocks : 150,
			avoidOverlapping : true,
			backgroundColor : '#FFFFFF'
		});
		this.addTrackByZoom(100, 100, snpTrack,new RegionCellBaseDataAdapter(this.species,{resource : "snp"}));
};

/** SEQUENCE TRACKS **/
GenomeWidgetProperties.prototype.addSequenceTracks = function(){
	var sequenceTrack = new SequenceFeatureTrack(this.id + "sequence", this.tracksPanel, this.species,{
		top : 20,
		title : "Sequence",
		height : 15,
		featureHeight : 12,
		avoidOverlapping : false,
		backgroundColor : '#FFFFFF',
		isAvalaible: false
	});
	this.addTrackByZoom(0, 90, sequenceTrack,new RegionCellBaseDataAdapter(this.species));
	
	var sequenceTrack = new SequenceFeatureTrack(this.id + "sequence", this.tracksPanel, this.species,{
				top : 20,
				title : "Sequence",
				height : 15,
				featureHeight : 12,
				avoidOverlapping : false,
				backgroundColor : '#FFFFFF'
	});
	this.addTrackByZoom(100, 100, sequenceTrack,new RegionCellBaseDataAdapter(this.species,{resource : "sequence"}));
};

/** CYTOBAND TRACKS **/
GenomeWidgetProperties.prototype.addCytobandTracks = function(){
	
	var cytobandTrack = new FeatureTrack(this.id + "_cytoband", this.tracksPanel, this.species,{
					top : 10,
					height : 20,
					labelHeight : this.labelHeight,
					featureHeight : this.featureHeight,
					labelSize : this.labelSize,
					title : "Cytoband",
					allowDuplicates : true,
					label : false
			});
	this.addTrackByZoom(0, 0, cytobandTrack,new RegionCellBaseDataAdapter(this.species,{resource : "cytoband"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_cytoband", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Cytoband",
				allowDuplicates : true,
				label : true
			});
	this.addTrackByZoom(10, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "cytoband"}));
};





/** MIRNA TARGETS **/
GenomeWidgetProperties.prototype.addMirnaTargetTracks = function(){
	var color = "#298A08";
//	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, {
//		top : 20,
//		left : 0,
//		height : 20,
//		featureHeight : 18,
//		title : "miRNA targets",
//		titleFontSize : 9,
//		titleWidth : 70,
//		showTranscripts : false,
//		allowDuplicates : true,
//		backgroundColor : '#FFFFFF',
//		label : false,
//		pixelSpaceBetweenBlocks : 1,
//		showDetailGeneLabel : false,
//		forceColor : color,
//		intervalSize : 500000,
//		isAvalaible : false
//		
//	});
//	this.addTrackByZoom(0, 0, multitrack,new RegionCellBaseDataAdapter({resource : "mirnatarget"}));
//	
//	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, {
//		top : 20,
//		left : 0,
//		height : 20,
//		featureHeight : 18,
//		title : "miRNA targets",
//		titleFontSize : 9,
//		titleWidth : 70,
//		showTranscripts : false,
//		allowDuplicates : true,
//		backgroundColor : '#FFFFFF',
//		label : false,
//		pixelSpaceBetweenBlocks : 1,
//		showDetailGeneLabel : false,
//		forceColor : color,
//		intervalSize : 250000,
//		isAvalaible : false
//	});
//	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter({resource : "mirnatarget"}));
//
//	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, {
//		top : 20,
//		left : 0,
//		height : 20,
//		featureHeight : 18,
//		title : "miRNA targets",
//		titleFontSize : 9,
//		titleWidth : 100,
//		backgroundColor : '#FFFFFF',
//		label : false,
//		pixelSpaceBetweenBlocks : 1,
//		forceColor : color,
//		intervalSize :125000/16,
//		isAvalaible : false
//	});
//	this.addTrackByZoom(20, 20, multitrack,new RegionCellBaseDataAdapter({resource : "mirnatarget"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs",this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "miRNA targets",
				allowDuplicates : false,
				label : false,
				pixelSpaceBetweenBlocks : 0,
				avoidOverlapping : true,
				isAvalaible : false
			});
	this.addTrackByZoom(0, 70, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "mirnatarget"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "miRNA targets",
				allowDuplicates : false,
				label : true,
				pixelSpaceBetweenBlocks : 100,
				avoidOverlapping : true,
				showLabelsOnMiddleMarker :true
			});
	this.addTrackByZoom(80, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "mirnatarget"}));
};

/** OPEN CHROMATIN **/
GenomeWidgetProperties.prototype.addOpenChromatinTracks = function(){
	var color = "#298A08";
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Open Chromatin",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 500000
	});
	this.addTrackByZoom(0, 0, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=open chromatin"}));
	
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Open Chromatin",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 250000
	});
	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=open chromatin"}));

	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Open Chromatin",
		titleFontSize : 9,
		titleWidth : 100,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		forceColor : color,
		intervalSize :125000/16
	});
	this.addTrackByZoom(20, 20, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=open chromatin"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Open Chromatin",
				allowDuplicates : true,
				label : false,
				pixelSpaceBetweenBlocks : 0,
				avoidOverlapping : true
			});
	this.addTrackByZoom(30, 90, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=open chromatin"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Open Chromatin",
				allowDuplicates : true,
				label : true,
				pixelSpaceBetweenBlocks : 100,
				avoidOverlapping : true,
				showLabelsOnMiddleMarker :true
			});
	this.addTrackByZoom(100, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=open chromatin"}));
	
};




/** Polymerasa **/
GenomeWidgetProperties.prototype.addPolymeraseTracks = function(){
	var color = "#298A08";
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Polymerase",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 500000
	});
	this.addTrackByZoom(0, 0, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Polymerase"}));
	
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Polymerase",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 250000
	});
	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Polymerase"}));
	

	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Polymerase",
		titleFontSize : 9,
		titleWidth : 70,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		forceColor : color,
		intervalSize :125000/16
	});
	this.addTrackByZoom(20, 20, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Polymerase"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Polymerase",
				allowDuplicates : true,
				label : false,
				pixelSpaceBetweenBlocks : 0,
				avoidOverlapping : true
			});
	this.addTrackByZoom(30, 90, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Polymerase"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Polymerase",
				allowDuplicates : true,
				label : true,
				pixelSpaceBetweenBlocks : 100,
				avoidOverlapping : true
			});
	this.addTrackByZoom(100, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=Polymerase"}));
	
};




/** HISTONES **/
GenomeWidgetProperties.prototype.addHistoneTracks = function(){
	var color = "#298A08";
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 40,
		featureHeight : 40,
		title : "Histone",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color
//		intervalSize : 500000
	});
//	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter({resource : "gene?histogram=true&interval=125000"}));
	this.addTrackByZoom(0, 0, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=HISTONE&histogram=true&interval=250000"}));
	
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 40,
		featureHeight : 40,
		title : "Histone",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 250000
	});
//	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter({resource : "regulatory?type=HISTONE"}));
	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=HISTONE&histogram=true&interval=125000"}));
	

	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "Histone",
		titleFontSize : 9,
		titleWidth : 70,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		forceColor : color,
		intervalSize :125000/16
	});
	this.addTrackByZoom(20, 20, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=HISTONE"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Histone",
				allowDuplicates : true,
				label : false,
				pixelSpaceBetweenBlocks : 0,
				avoidOverlapping : true
			});
	this.addTrackByZoom(30, 90, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=HISTONE"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Histone",
				allowDuplicates : true,
				label : true,
				pixelSpaceBetweenBlocks : 100,
				avoidOverlapping : true
			});
	this.addTrackByZoom(100, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "regulatory?type=HISTONE"}));
	
};

/** TFBS TRACKS **/
GenomeWidgetProperties.prototype.addTFBSTracks = function(){
	var color = "#298A08";
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "TFBS",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 500000
	});
	this.addTrackByZoom(0, 0, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "tfbs"}));
	
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "TFBS",
		titleFontSize : 9,
		titleWidth : 70,
		showTranscripts : false,
		allowDuplicates : true,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		showDetailGeneLabel : false,
		forceColor : color,
		intervalSize : 250000
	});
	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "tfbs"}));
	

	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 20,
		featureHeight : 18,
		title : "TFBS",
		titleFontSize : 9,
		titleWidth : 70,
		backgroundColor : '#FFFFFF',
		label : false,
		pixelSpaceBetweenBlocks : 1,
		forceColor : color,
		intervalSize :125000/16
	});
	this.addTrackByZoom(20, 20, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "tfbs"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "TFBS",
				allowDuplicates : true,
				label : false,
				pixelSpaceBetweenBlocks : 0,
				avoidOverlapping : true
			});
	this.addTrackByZoom(30, 90, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "tfbs"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_tfbs", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "TFBS",
				allowDuplicates : true,
				label : true,
				pixelSpaceBetweenBlocks : 100,
				avoidOverlapping : true
			
			});
	this.addTrackByZoom(100, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "tfbs"}));
	
};



/** CONSERVED REGIONS **/  //TODO
GenomeWidgetProperties.prototype.addConservedRegionsTracks = function(){
	var cytobandTrack2 = new FeatureTrack(this.id + "_conservedregion", this.tracksPanel, this.species,{
		top : 10,
		height : 20,
		labelHeight : this.labelHeight,
		featureHeight : this.featureHeight,
		labelSize : this.labelSize,
		allowDuplicates : true,
		label : false,
		titleWidth : 92,
		pixelSpaceBetweenBlocks : 0,
		avoidOverlapping : true,
		title : 'Conserved regions'
	});
	this.addTrackByZoom(0, 50, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "conservedregion"}));
	
	var cytobandTrack2 = new FeatureTrack(this.id + "_conservedregion", this.tracksPanel, this.species,{
				top : 10,
				height : 20,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				allowDuplicates : true,
				label : true,
				titleWidth : 92,
				pixelSpaceBetweenBlocks : 0,
				avoidOverlapping : true,
				title : 'Conserved regions'
			});
	this.addTrackByZoom(60, 100, cytobandTrack2,new RegionCellBaseDataAdapter(this.species,{resource : "conservedregion"}));
	
};




/** MULTIFEATURE TRACKS **/
GenomeWidgetProperties.prototype.addMultifeatureTracks = function(){
	var multitrack = new HistogramFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 20,
		left : 0,
		height : 40,
		featureHeight : 40,
		title : "Gene/Transcript",
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
	this.addTrackByZoom(0, 10, multitrack,new RegionCellBaseDataAdapter(this.species,{resource : "gene?histogram=true&interval=250000"}));
//	this.addTrackByZoom(0, 0, multitrack,new GeneRegionCellBaseDataAdapter({obtainTranscripts : false}));
	
//	var multitrack1 = new HistogramFeatureTrack(this.id + "_multiTrack",
//			this.tracksPanel, {
//				top : 20,
//				left : 0,
//				height : 40,
//				featureHeight : 40,
//				title : "Gene/Transcript",
//				titleFontSize : 9,
//				titleWidth : 70,
//				showTranscripts : false,
//				allowDuplicates : true,
//				backgroundColor : '#FFFFFF',
//				label : false,
//				pixelSpaceBetweenBlocks : 1,
//				showDetailGeneLabel : false,
//				forceColor : "blue"
////				intervalSize : 150000
//			});
//	this.addTrackByZoom(10, 10, multitrack,new RegionCellBaseDataAdapter({resource : "gene?histogram=true&interval=125000"}));
//	this.addTrackByZoom(10, 10, multitrack1,new GeneRegionCellBaseDataAdapter({obtainTranscripts : false}));
	
	
	var multitrack2 = new MultiFeatureTrack(this.id + "_multiTrack", this.tracksPanel, this.species,{
				top : 20,
				left : 0,
				height : 10,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				
				title : "Gene/Transcript",
				titleWidth : 70,
				titleFontSize : 9,
				showTranscripts : false,
				allowDuplicates : false,
				backgroundColor : '#FFFFFF',
				label : false,
				pixelSpaceBetweenBlocks : 1,
				showDetailGeneLabel : false,
				isAvalaible : true
			});

	this.addTrackByZoom(20, 20, multitrack2,new GeneRegionCellBaseDataAdapter(this.species,{obtainTranscripts : false}));
	
	var multitrack2 = new MultiFeatureTrack(this.id + "_multiTrack", this.tracksPanel, this.species,{
				top : 20,
				left : 0,
				height : 10,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				
				title : "Gene/Transcript",
				titleWidth : 70,
				titleFontSize : 9,
				showTranscripts : false,
				allowDuplicates : false,
				backgroundColor : '#FFFFFF',
				label : true,
				pixelSpaceBetweenBlocks : this.labelSize * 7,
				showDetailGeneLabel : false,
				isAvalaible : true
			});

	this.addTrackByZoom(30, 40, multitrack2,new GeneRegionCellBaseDataAdapter(this.species,{obtainTranscripts : false}));

	var multitrack3 = new MultiFeatureTrack(this.id + "_multiTrack", this.tracksPanel, this.species,{
				top : 20,
				left : 0,
				height : 10,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Gene/Transcript",
				titleFontSize : 9,
				titleWidth : 70,
				showTranscripts : false,
				allowDuplicates : false,
				backgroundColor : '#FFFFFF',
				label : true,
				pixelSpaceBetweenBlocks : 200,
				showDetailGeneLabel : true
			});

	this.addTrackByZoom(50, 60, multitrack3,new GeneRegionCellBaseDataAdapter(this.species,{obtainTranscripts : false}));

	var multitrack4 = new MultiFeatureTrack(this.id + "_multiTrack", this.tracksPanel, this.species,{
				top : 20,
				left : 0,
				height : 10,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Gene/Transcript",
				titleWidth : 70,
				titleFontSize : 9,
				showTranscripts : true,
				showExonLabel : false,
				allowDuplicates : false,
				backgroundColor : '#FFFFFF',
				label : true,
				pixelSpaceBetweenBlocks : 200,
				showDetailGeneLabel : true
			});

	this.addTrackByZoom(70, 70, multitrack4,new GeneRegionCellBaseDataAdapter(this.species,{obtainTranscripts : true}));
	
	var multitrack4 = new MultiFeatureTrack(this.id + "_multiTrack", this.tracksPanel, this.species,{
				top : 20,
				left : 0,
				height : 10,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Gene/Transcript",
				titleWidth : 70,
				titleFontSize : 9,
				showTranscripts : true,
				showExonLabel : false,
				allowDuplicates : false,
				backgroundColor : '#FFFFFF',
				label : true,
				pixelSpaceBetweenBlocks : 200,
				showDetailGeneLabel : true
			});

	this.addTrackByZoom(80, 80, multitrack4,new GeneRegionCellBaseDataAdapter(this.species,{obtainTranscripts : true}));

	var multitrack5 = new MultiFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
		top : 10,
		left : 0,
		height : 10,
		labelHeight : this.labelHeight,
		featureHeight : this.featureHeight,
		labelSize : this.labelSize,
		title : "Gene/Transcript",
		titleWidth : 70,
		titleFontSize : 9,
		labelFontSize : 8,
		showTranscripts : true,
		allowDuplicates : false,
		backgroundColor : '#FFFFFF',
		label : true,
		pixelSpaceBetweenBlocks : 200,
		showDetailGeneLabel : true
	});
	this.addTrackByZoom(90, 90, multitrack5,new GeneRegionCellBaseDataAdapter(this.species));

	var multitrack5 = new MultiFeatureTrack(this.id + "_multiTrack",this.tracksPanel, this.species,{
				top : 10,
				left : 0,
				height : 10,
				labelHeight : this.labelHeight,
				featureHeight : this.featureHeight,
				labelSize : this.labelSize,
				title : "Gene/Transcript",
				titleWidth : 70,
				titleFontSize : 9,
				labelFontSize : 8,
				showTranscripts : true,
				allowDuplicates : false,
				backgroundColor : '#FFFFFF',
				label : true,
				pixelSpaceBetweenBlocks : 200,
				showDetailGeneLabel : true,
				showLabelsOnMiddleMarker :true,
				showExonLabel : true,
				onMouseOverShitExonTranscriptLabel:true
			});
	this.addTrackByZoom(100, 100, multitrack5,new GeneRegionCellBaseDataAdapter(this.species));
	
};





function GenomeWidget(trackerID, targetId,  args) {
	this.id = trackerID;
	this.targetId = targetId;
	
	this.pixelRatio = 0.001;
	
	this.width = 100;
	this.height = 500;
	
	/** Chromosome Position **/
	this.chromosome = null;
	this.start = null;
	this.end = null;
	this.viewBoxModule = 7000000;
	
	/** Drag and drop **/
	this.allowDragging = true;
	
//	this.ruleNotListenMoving = true;
	
	if (args != null){
		if (args.width != null){
			this.width = args.width;
		}
		if (args.height != null){
			this.height = args.height;
		}
		if (args.pixelRatio != null){
			this.pixelRatio = args.pixelRatio;
		}
		if (args.viewBoxModule != null){
			this.viewBoxModule = args.viewBoxModule;
		}
		
		if (args.allowDragging != null) {
			this.allowDragging = args.allowDragging;
		}
		
//		if (args.ruleNotListenMoving != null){
//			this.ruleNotListenMoving = args.ruleNotListenMoving;
//		}
	}
	
	 this.trackList = new Array();
     this.dataAdapterList = new Array();

     
	this.trackCanvas = null;
	
	/** EVENTS **/
	this.onMarkerChange = new Event(this);
	this.onClick = new Event(this);
	this.onRender = new Event(this);
	this.onMove = new Event(this);
	
};

GenomeWidget.prototype.clear = function() {
	this.trackCanvas.clear();
};

GenomeWidget.prototype.init = function(){
	DOM.removeChilds(this.targetId);
	this.tracksPanel = DOM.createNewElement("div", document.getElementById(this.targetId), [["id", "detail_tracks_container"]]);
};

GenomeWidget.prototype.getviewBoxModule = function(){
	var viewBoxModule = this.viewBoxModule;
	
	var counter = 2000000;
	while (((this.end*this.pixelRatio) % viewBoxModule) < ((this.start*this.pixelRatio) % viewBoxModule)){
		counter = counter + counter;
		viewBoxModule = parseFloat(viewBoxModule) + counter;
	}
	
	return viewBoxModule;
};

GenomeWidget.prototype.getMiddlePoint = function(){
	return this.trackCanvas.getMiddlePoint();
};



GenomeWidget.prototype.addTrack = function(track, dataAdapter){
    this.trackList.push(track);
    this.dataAdapterList.push(dataAdapter);
};




GenomeWidget.prototype.draw = function(chromosome, start, end){
	
	this.chromosome = chromosome;
	this.start = start;
	this.end = end;
	
	var _this = this;
	this.init();
	this.trackCanvas =  new TrackCanvas(this.id + "_canvas", document.getElementById(this.targetId), {
			top:0, 
			left:0, 
			right:this.width,  
			width:this.width, 
			height:this.height, 
			start: this.start, 
			end: this.end,
			backgroundColor: "#FFCCFF", 
			pixelRatio:this.pixelRatio,
			viewBoxModule: this.getviewBoxModule(),
			allowDragging :this.allowDragging
	});
	
    this.trackCanvas.init();
    
    this.trackCanvas.afterDrag.addEventListener(function (evt, data){
	});
    
    this.trackCanvas.onMove.addEventListener(function (evt, data){
    	_this.onMarkerChange.notify(data);
	});
   
    
    for ( var i = 0; i < this.trackList.length; i++) {
    	this.trackList[i].viewBoxModule = this.getviewBoxModule();
    	this.trackList[i].pixelRatio = this.pixelRatio;
    	this.trackList[i].targetID = document.getElementById(this.targetId);
    	    
    	 this.trackCanvas.addTrack(this.trackList[i], this.dataAdapterList[i]);
	}
    
    var _this = this;
    this.trackCanvas.onRender.addEventListener(function (evt){
		 _this.onRender.notify();
	 });
    
//    console.log(this.getviewBoxModule());
    
    this.trackCanvas.draw(this.chromosome, this.start, this.end);
    
   
};function LegendPanel(args){
	this.width = 200;
	this.height = 250;
	
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
	
	
};

LegendPanel.prototype.getColorItems = function(legend){
	panelsArray = new Array();
	
	for ( var item in legend) {
//		var color = legend[item].toString().replace("#", "");
//		var cp = new Ext.picker.Color();
//		cp.width = 20;
//		cp.colors = [color];

		var size=15;
		var color = Ext.create('Ext.draw.Component', {
        width: size,
        height: size,
        items:[{
				type: 'rect',
				fill: legend[item],
				x:0,y:0,
				width: size,
				height : size
				}]
		});
		
		//Remove "_" and UpperCase first letter
		var name = item.replace(/_/gi, " ");
		name = name.charAt(0).toUpperCase() + name.slice(1);
		
		var panel = Ext.create('Ext.panel.Panel', {
			height:size,
			border:false,
			flex:1,
			margin:"1 0 0 1",
		    layout: {type: 'hbox',align:'stretch' },
		    items: [color, {xtype: 'tbtext',text:name, margin:"1 0 0 3"} ]
		});
		
		panelsArray.push(panel);
	}
	
	return panelsArray;
};




LegendPanel.prototype.getPanel = function(legend){
	var _this=this;
	
	if (this.panel == null){
		
		var items = this.getColorItems(legend);
		
		this.panel  = Ext.create('Ext.panel.Panel', {
			bodyPadding:'0 0 0 2',
			border:false,
			layout: {
		        type: 'vbox',
		        align:'stretch' 
		    },
			items:items,
			width:this.width,
			height:items.length*20
		});		
	}	
	
	return this.panel;
};

LegendPanel.prototype.getButton = function(legend){
	var _this=this;
	
	if (this.button == null){
		
		this.button = Ext.create('Ext.button.Button', {
			text : this.title,
			menu : {
					items: [this.getPanel(legend)]
				}
		});
	}	
	return this.button;
	
	
};function LegendWidget(args){
	
	this.width = 300;
	this.height = 300;
	this.title = "Legend";
	
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
	
	this.legendPanel = new LegendPanel();
	
};

LegendWidget.prototype.draw = function(legend){
	var _this = this;
	if(this.panel==null){
		
		var item = this.legendPanel.getPanel(legend);
	
		this.panel = Ext.create('Ext.ux.Window', {
			title : this.title,
			resizable: false,
			constrain:true,
			closable:true,
			width: item.width+10,
			height: item.height+70,
			items : [item],
			buttonAlign:'right',
			 layout: {
		        type: 'hbox',
		        align:'stretch' 
		    },
			buttons:[
					{text:'Close', handler: function(){_this.panel.close();}}
			]
		});
	}
	this.panel.show();
	
	
};
function GeneBlockManager () {
	this.data = new Object();
	this.data.queues = new Array();
	this.data.queues[0] = new Array();
	this.data.transcriptQueueCount = new Object();
	
	this.data.transcriptQueue = new Array();
	
};

GeneBlockManager.prototype.getGenesTrackCount = function(){
	return this.data.queues.length;
};


GeneBlockManager.prototype.getFeaturesFromGeneTrackIndex = function(index){
	return this.data.queues[index];
};

GeneBlockManager.prototype.toJSON = function(){
	return this.data;
};


GeneBlockManager.prototype.init = function(dataset){
	this.data.features = dataset;
	var features = this.data.features;
	for (var i = 0; i < features.length;  i++){
		var queueToDraw = this._searchSpace(features[i], this.data.queues);
		/** Insertamos en la cola para marcar el espacio reservado */
		this.data.queues[queueToDraw].push(features[i]);
		
		if (this.data.transcriptQueue[queueToDraw] == null){
			this.data.transcriptQueue.push(new Array());
		}

		this.data.TranscriptQueuesTest = new Array();
		for ( var j = 0; j < features[i].transcript.length; j++) {
			
			var featureAux = {"start": features[i].transcript[j].exon[0].start, "end":features[i].transcript[j].exon[features[i].transcript[j].exon.length -1 ].end};
			var queueTranscriptToDraw = this._searchSpace(featureAux, this.data.TranscriptQueuesTest);
			this.data.TranscriptQueuesTest[queueTranscriptToDraw].push(featureAux);
			
			if (this.data.transcriptQueue[queueToDraw][queueTranscriptToDraw] == null){
				this.data.transcriptQueue[queueToDraw].push(new Array());
			}
			this.data.transcriptQueue[queueToDraw][queueTranscriptToDraw].push(features[i].transcript[j]);
		}
		
	}
	return this.data.queues[queueToDraw].length;
};





/** True si dos bloques se solapan */
GeneBlockManager.prototype._overlapBlocks = function(block1, block2){
	if ((block1.start <= block2.end) && (block1.end >= block2.start)){
		return true;
	}
	return false;
};

/** Busca disponibilidad de espacio y devuelve el indice del layer donde debe insertarse */
GeneBlockManager.prototype._searchSpace = function(block1, queues){
//	var candidates = new Array();
	
	for (var i = 0; i < queues.length; i++ ){
//		console.log("Checking queueu " + i);
		var overlapping = new Array();
		for (var j = 0; j < queues[i].length; j++ ){
			var block2 = queues[i][j];
			overlapping.push((this._overlapBlocks(block1, block2)));	
//			overlapping.push((this._overlapBlocks(block2, block1)));	
		}
	
//		console.log(overlapping);
		/** no se solapa con ningun elemento de la cola i entonces devuelvo la capa */ 
		if (overlapping.valueOf(overlapping).indexOf(true)==-1){
//			console.log("inserto en: " + i);
//			console.log(overlapping);
//			candidates.push(i);
			return i;
		}
	}
	
	/*for ( var i = 0; i < candidates.length; i++) {
		var maxDistance = Number.MIN_VALUE;
		var farCandidate = 0;
		var distances = new Array();
		debugger
		if (candidates.length >1){
			var distance = Number.MIN_VALUE;
			
			for ( var j = 0; j < queues[candidates[i]].length; j++) {
				if (queues[candidates[i]][j].end < block1.start){
					distance = block1.start - queues[candidates[i]][j].end;
				}
				else{
					distance = queues[candidates[i]][j].start -  block1.end;
				}
				distances.push(distance);
				if (distance > maxDistance){
					maxDistance = distance;
					farCandidate = j;
				}
			}
		}
		console.log(candidates);
		console.log("far distances: " + distances);
		console.log("far distance: " + maxDistance);
		console.log("candidate: " + farCandidate);
		return candidates[farCandidate];
	}
	*/
	
	/** no me cabe en ninguna capa entonces creo una nueva */
	queues.push(new Array());
//	console.log("Neuva en: " + queues.length);
	/** no hemos encontrado ningun espacio en ninguna cola anterior */
	return queues.length - 1;
};GeneBlockManager.prototype.loadFromJSON = DataSet.prototype.loadFromJSON;
GeneBlockManager.prototype.loadFromFile = DataSet.prototype.loadFromFile;
GeneBlockManager.prototype.loadFromURL  = DataSet.prototype.loadFromURL;
//GeneBlockManager.prototype.validate  = 	    DataSet.prototype.validate;

function GeneBlockManager () {
	this.data = new Object();
};

GeneBlockManager.prototype.getGenesTrackCount = function(){
	return this.data.queues.length;
};


GeneBlockManager.prototype.getFeaturesFromGeneTrackIndex = function(index){
	return this.data.queues[index];
};

GeneBlockManager.prototype.toJSON = function(){
	return this.data;
};
GeneBlockManager.prototype.validate = function(){
	return true;
};

GeneBlockManager.prototype.sort = function(a, b){
	return (b.end - b.start) - (a.end - a.start);
};

GeneBlockManager.prototype.toDatasetFormatter = function(dataset){
	var features = new Array();
	try{
		for ( var i = 0; i < dataset.length; i++) {
			var geneFormatter = new GeneFeatureFormatter(dataset[i]);
			features.push(geneFormatter);
			if (dataset[i].transcript != null){
				var transcripts = dataset[i].transcript; //dataset[i].transcript.sort(this.sort);
				for ( var j = 0; j < transcripts.length; j++) {
					if (geneFormatter.transcript == null){
						geneFormatter.transcript = new Array();
					}
					geneFormatter.transcript.push(new TranscriptFeatureFormatter(dataset[i].transcript[j]));
				}
			}
		}
	}
	catch(e)
	{
		alert("ERROR: GeneBlockManager: " + e);
	}
	return features;
//	return this;
};
