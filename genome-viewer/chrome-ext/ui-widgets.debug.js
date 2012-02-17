ExpressionGenomicAttributesWidget.prototype.draw = GenomicAttributesWidget.prototype.draw;
ExpressionGenomicAttributesWidget.prototype.getMainPanel = GenomicAttributesWidget.prototype.getMainPanel;
ExpressionGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
ExpressionGenomicAttributesWidget.prototype.drawKaryotype = GenomicAttributesWidget.prototype.drawKaryotype;
ExpressionGenomicAttributesWidget.prototype.makeGrid = GenomicAttributesWidget.prototype.makeGrid;
ExpressionGenomicAttributesWidget.prototype.getKaryotypePanelId = GenomicAttributesWidget.prototype.getKaryotypePanelId;
ExpressionGenomicAttributesWidget.prototype.onAdditionalInformationClick = GenomicAttributesWidget.prototype.onAdditionalInformationClick;


function ExpressionGenomicAttributesWidget(species, args){
	if (args == null){
		args = new Object();
	}
	args.columnsCount = 2;
	args.title = "Expression";
	args.tags = ["expression"];
	args.featureType = 'gene';
	args.listWidgetArgs = {title:"Filter",action:'filter'};
	GenomicAttributesWidget.prototype.constructor.call(this, species, args);
};

ExpressionGenomicAttributesWidget.prototype.fill = function (queryNames){
	var _this = this;
	
	var normalized = Normalizer.normalizeArray(values);
	var colors = [];
	for ( var i = 0; i < normalized.length; i++) {
		if (!isNaN(parseFloat(values[i]))){
			colors.push( Colors.getColorByScoreValue(normalized[i]).HexString());
		}
		else{
			colors.push( "#000000");
		}
	}
	
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function(sender){		
		_this.karyotypePanel.setLoading("Retrieving data");
		
		for (var i = 0; i < cellBaseDataAdapter.dataset.toJSON().length; i++) {
			_this.karyotypeWidget.mark(cellBaseDataAdapter.dataset.toJSON()[i],  colors[i]);
		}
		_this.query = {"dataset": cellBaseDataAdapter.dataset, "resource":queryNames }; 
		_this.features=cellBaseDataAdapter.dataset.toJSON();
		_this.karyotypePanel.setLoading(false);
		_this.filtersButton.enable();
		_this.addTrackButton.enable();
	});
	cellBaseDataAdapter.fill("feature", "gene", queryNames.toString(), "info");
};

ExpressionGenomicAttributesWidget.prototype.dataChange = function (items){
	try{
				var _this = this;
				this.karyotypePanel.setLoading("Connecting to Database");
				this.karyotypeWidget.unmark();
				var _this=this;
				var externalNames = [];
				values = [];
				
				for (var i = 0; i < items.length; i++) {
					externalNames.push(items[i].data[0]);
					values.push(items[i].data[1]);
					
				}	
				
				if (items.length > 0){
					this.fill(externalNames, values);
				}
	}
	catch(e){
		alert(e);
		this.panel.setLoading(false);
	}
};ExpressionNetworkAttributesWidget.prototype.draw = NetworkAttributesWidget.prototype.draw;
ExpressionNetworkAttributesWidget.prototype.render = NetworkAttributesWidget.prototype.render;
ExpressionNetworkAttributesWidget.prototype.render = NetworkAttributesWidget.prototype.render;
ExpressionNetworkAttributesWidget.prototype.makeGrid = NetworkAttributesWidget.prototype.makeGrid;

ExpressionNetworkAttributesWidget.prototype.getDetailPanel = NetworkAttributesWidget.prototype.getDetailPanel;
ExpressionNetworkAttributesWidget.prototype.getNetworkPanelId = NetworkAttributesWidget.prototype.getNetworkPanelId;
ExpressionNetworkAttributesWidget.prototype.drawNetwork = NetworkAttributesWidget.prototype.drawNetwork;
ExpressionNetworkAttributesWidget.prototype.dataChanged = NetworkAttributesWidget.prototype.dataChanged;
ExpressionNetworkAttributesWidget.prototype.getFoundVertices = NetworkAttributesWidget.prototype.getFoundVertices;
ExpressionNetworkAttributesWidget.prototype.getVertexAttributesByName = NetworkAttributesWidget.prototype.getVertexAttributesByName;
//ExpressionNetworkAttributesWidget.prototype.getButtons = NetworkAttributesWidget.prototype.getButtons;


function ExpressionNetworkAttributesWidget(args){
	if (args == null){
		args = new Object();
	}
	this.id = "ExpressionNetworkAttributes_" + Math.random();
	args.columnsCount = 2;
	args.title = "Expression";
	args.tags = ["expression"];
	NetworkAttributesWidget.prototype.constructor.call(this, args);
	
	/** EVENTS **/
	this.applyColors = new Event();
};

ExpressionNetworkAttributesWidget.prototype.getButtons = function (){
	var _this = this;
	

	this.rescaleCheckBox =  Ext.create('Ext.form.field.Checkbox', {
        boxLabel : 'Rescale',
        padding:'0 0 5 5',
        disabled:true,
        listeners: {
		       scope: this,
		       change: function(sender, newValue, oldValue){
		       			_this.onDataChanged(_this.attributesPanel.grid.store.getRange());
		       		}
     	}
	});
	
	this.attributesPanel.barInfo.insert(0,this.rescaleCheckBox);
	
	this.attributesPanel.onFileRead.addEventListener(function(){
		_this.rescaleCheckBox.enable();
	});
	
	return [
		    {text:'Apply Colors', handler: function(){_this.applyColors.notify(); _this.panel.close();}},
		    {text:'Close', handler: function(){_this.panel.close();}}];
	
};

ExpressionNetworkAttributesWidget.prototype.onDataChanged = function (data){

	var rescale = this.rescaleCheckBox.getValue();
	this.verticesSelected.notify(this.getFoundVertices());
	this.networkWidget.deselectNodes();
	this.networkWidget.selectVerticesByName(this.getFoundVertices());
	
	var values = new Array();
	var ids = new Array();
	for(var i=0; i< data.length; i++){
		var node = this.graphDataset.getVertexByName(data[i].data["0"]);
		var value = data[i].data["1"];
		if ((node != null)&& (!isNaN(parseFloat(value)))){
			if (rescale){
				if (parseFloat(value) < 0){
					value = Math.log(Math.abs(value))/Math.log(2)* -1;
				}
				else{
					value = Math.log(Math.abs(value))/Math.log(2);
				}
				values.push(value);
			}
			else{
				values.push(value);
			}
			ids.push(data[i].data["0"]);
		}
	}

//	console.log(values);
	
	
	var normalized = Normalizer.normalizeArray(values);
	
//	console.log(normalized);
	
	var colors = [];
	for ( var i = 0; i < normalized.length; i++) {
		if (!isNaN(parseFloat(values[i]))){
			colors.push( Colors.getColorByScoreValue(normalized[i]).HexString());
		}
		else{
			colors.push( "#000000");
		}
	}
	
	for ( var vertexId in ids) {
		var vertices = this.dataset.getVertexByName(ids[vertexId]);
		for ( var i = 0; i < vertices.length; i++) {
			this.formatter.getVertexById(vertices[i].getId()).getDefault().setFill(colors[vertexId]);
		}
		
	}
	
};function GenomicAttributesWidget(species, args){
	var _this=this;
	this.id = "GenomicAttributesWidget_" + Math.random();
	
	this.species=species;
	
	
	this.title = "None";
	this.featureType = "gene";
	
	this.columnsCount = null; /** El numero de columns que el attributes widget leera del fichero, si null lo leera entero **/
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.columnsCount!= null){
        	this.columnsCount = args.columnsCount;       
        }
        if (args.featureType!= null){
        	this.featureType = args.featureType;       
        }
    }
    
	this.listWidget = new ListWidget(args.listWidgetArgs);
	
    this.karyotypeWidget = new KaryotypePanel(this.getKaryotypePanelId(), this.species, {"top":10, "width":1000, "height": 300, "trackWidth":15});
	this.attributesPanel = new AttributesPanel({height: 240, columnsCount: this.columnsCount,wum:args.wum,tags:args.tags});
	
	/** Event **/
	this.onMarkerClicked = new Event(this);
	this.onTrackAddAction = new Event(this);
	
	
	/**Atach events i listen**/
	this.attributesPanel.onDataChange.addEventListener(function(sender,data){
		_this.dataChange(data);
	});
	
	this.karyotypeWidget.onMarkerClicked.addEventListener(function(sender,feature){
		_this.onMarkerClicked.notify(feature); 
	});
	
	
	
};

GenomicAttributesWidget.prototype.draw = function (){
	var _this=this;
	if (this.panel == null){
		
		this.karyotypePanel  = Ext.create('Ext.panel.Panel', {
			height:350,
			maxHeight:350,
			border:0,
			bodyPadding: 15,
			padding:'0 0 0 0',
			html:'<div id="' + this.getKaryotypePanelId() +'" ><div>'
		});
		
		this.filtersButton = Ext.create('Ext.button.Button', {
			 text: 'Additional Filters',
			 disabled:true,
			 listeners: {
			       scope: this,
			       click: function(){this.onAdditionalInformationClick();}
	        }
		});
		
		this.addTrackButton = Ext.create('Ext.button.Button', {
			text:'Add Track',
			disabled:true,
			handler: function(){ 
				_this.onTrackAddAction.notify({"features":_this.features,"trackName":_this.attributesPanel.fileName});
				}
		});
		
		this.panel  = Ext.create('Ext.ux.Window', {
			title : this.title,
			resizable: false,
			minimizable :true,
			constrain:true,
			closable:true,
			items: [this.attributesPanel.getPanel(),this.karyotypePanel],
			width: 1035,
		    height: 653,
		    buttonAlign:'left',
			buttons:[this.addTrackButton,'->',
			         {text:'Close', handler: function(){_this.panel.close();}}],
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
		this.attributesPanel.barField.add(this.filtersButton);
		this.panel.setLoading();
		this.drawKaryotype();
	}	
	this.panel.show();
		
};

GenomicAttributesWidget.prototype.getMainPanel = function (){
	var _this=this;
	if (this.panel == null){
		
		this.karyotypePanel  = Ext.create('Ext.panel.Panel', {
			height:350,
			maxHeight:350,
			border:0,
			bodyPadding: 15,
			padding:'0 0 0 0',
			html:'<div id="' + this.getKaryotypePanelId() +'" ><div>'
		});
		
		this.filtersButton = Ext.create('Ext.button.Button', {
			 text: 'Additional Filters',
			 disabled:true,
			 listeners: {
			       scope: this,
			       click: function(){this.onAdditionalInformationClick();}
	        }
		});
		
		this.addTrackButton = Ext.create('Ext.button.Button', {
			text:'Add Track',
			disabled:true,
			handler: function(){ 
				_this.onTrackAddAction.notify({"features":_this.features,"trackName":_this.attributesPanel.fileName});
				}
		});
		
//		this.panel  = Ext.create('Ext.ux.Window', {
//			title : this.title,
//			resizable: false,
//			minimizable :true,
//			constrain:true,
//			closable:true,
//			items: [this.attributesPanel.getPanel(),this.karyotypePanel],
//			width: 1035,
//		    height: 653,
//		    buttonAlign:'left',
//			buttons:[this.addTrackButton,'->',
//			         {text:'Close', handler: function(){_this.panel.close();}}],
//	 		listeners: {
//		    	scope: this,
//		    	minimize:function(){
//					this.panel.hide();
//		       	},
//		      	destroy: function(){
//		       		delete this.panel;
//		      	}
//	    	}
//		});
		this.attributesPanel.getPanel();
		this.attributesPanel.barField.add(this.filtersButton);
//		this.panel.setLoading();
		this.drawKaryotype();
	}	
	return [this.attributesPanel.getPanel(),this.karyotypePanel];
		
};

GenomicAttributesWidget.prototype.fill = function (queryNames){
	
	var _this = this;
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function(sender){
		_this.karyotypePanel.setLoading("Retrieving data");
		for (var i = 0; i < cellBaseDataAdapter.dataset.toJSON().length; i++) {
				_this.karyotypeWidget.mark(cellBaseDataAdapter.dataset.toJSON()[i]);
				
		}
		_this.features=cellBaseDataAdapter.dataset.toJSON();
		_this.query = {"dataset": cellBaseDataAdapter.dataset, "resource":queryNames }; 
		_this.karyotypePanel.setLoading(false);
		_this.filtersButton.enable();
		_this.addTrackButton.enable();
		
	});
	cellBaseDataAdapter.fill("feature", this.featureType, queryNames.toString(), "info");
};

GenomicAttributesWidget.prototype.dataChange = function (items){
		try{
					var _this = this;
					
					this.karyotypePanel.setLoading("Connecting to Database");
					this.karyotypeWidget.unmark();
					var _this=this;
					var externalNames = [];
					
					for (var i = 0; i < items.length; i++) {
						externalNames.push(items[i].data[0]);
					}	
					
					if (items.length > 0){
						this.fill(externalNames);
					}
					else{
						this.karyotypePanel.setLoading(false);
					}
		}
		catch(e){
			alert(e);
			
		}
		finally{
			this.karyotypePanel.setLoading(false);
		}
};

GenomicAttributesWidget.prototype.drawKaryotype = function (){
		/** Karyotype Widget **/
		var _this = this;
		var karyotypeCellBaseDataAdapter = new KaryotypeCellBaseDataAdapter(this.species);
		
		karyotypeCellBaseDataAdapter.successed.addEventListener(function(evt, data){
			_this.karyotypeWidget.onRendered.addEventListener(function(evt, data){
//				_this.panel.setLoading(false);
			});
			
			_this.karyotypeWidget.onClick.addEventListener(function(evt, data){
			});
			
			_this.karyotypeWidget.draw(karyotypeCellBaseDataAdapter.chromosomeNames, karyotypeCellBaseDataAdapter.dataset.json);
			
		});
		karyotypeCellBaseDataAdapter.fill();
};

GenomicAttributesWidget.prototype.getKaryotypePanelId = function (){
	return this.id + "_karyotypePanel";	
};

GenomicAttributesWidget.prototype.onAdditionalInformationClick = function (){
	var _this=this;
	this.listWidget.draw(this.query.dataset.toJSON(), this.query.resource);
	this.listWidget.onFilterResult.addEventListener(function(sender,data){
		_this.attributesPanel.store.clearFilter();
		_this.attributesPanel.store.filter(function(item){
			for(var i = 0; i < data.length; i++){
				if(data[i].data.stableId == item.data["0"]){
					return true;
				}
			}
		});
	});
};
NetworkAttributesWidget.prototype.render = AttributesWidget.prototype.render;
NetworkAttributesWidget.prototype.getButtons = AttributesWidget.prototype.getButtons;

function NetworkAttributesWidget(args){
	if(args == null){
		var args={};
	};
	var height = args.height*0.5;
	var width = args.width*0.5;
	args.borderCls="";
	args.tags = ["sif|json"];
//	AttributesWidget.prototype.constructor.call(this, {height:675, width:800, title:args.title});
	AttributesWidget.prototype.constructor.call(this, {height:height+325+75, width:width+24, title:args.title});
//	this.width=800;
//	this.height=675;
	this.networkHeigth = height;
	this.networkWidth = width;
	this.networkPanelId = "NetworkAttributesWidget_" + Math.ceil(Math.random()*1000);
};



NetworkAttributesWidget.prototype.getNetworkPanelId = function (){
	return this.networkPanelId;
};

NetworkAttributesWidget.prototype.getDetailPanel = function (){
//	return   Ext.create('Ext.panel.Panel', {
//		height:285,
////		maxHeight:350,
//		border:0,
////		bodyPadding: 15,
//		padding:'0 0 0 0',
//		html:'<div id="' + this.getNetworkPanelId() +'" ><div>'
//	});
	
	return Ext.create('Ext.container.Container', {
		padding:5,
		flex:1,
		height:this.networkHeigth,
		style:"background: #eee;",
		cls:'x-unselectable',
		html:'<div id="' + this.getNetworkPanelId() +'" style="border:1px solid #bbb;" ><div>'
	});
	
};

NetworkAttributesWidget.prototype.drawNetwork = function (targetId, dataset, formatter, layout){
	this.dataset =	dataset.clone();

	this.formatter = new NetworkDataSetFormatter({width:400, height:200});
	this.formatter.loadFromJSON(this.dataset, formatter.toJSON());
	
	var vertices = this.dataset.getVertices();
	for ( var vertex in vertices) {
		var size = this.formatter.getVertexById(vertex).getDefault().getSize();
		this.formatter.getVertexById(vertex).getDefault().setSize(size*0.3);
	}
	
	var edges = this.dataset.getEdges();
	for ( var edge in edges) {
		var size = this.formatter.getEdgeById(edge).getDefault().getStrokeWidth();
		this.formatter.getEdgeById(edge).getDefault().setStrokeWidth(size*0.3);
	}
	
	var dsLayout = new LayoutDataset();
	dsLayout.loadFromJSON(this.dataset, layout.toJSON());
	
	this.networkWidget = new NetworkWidget({targetId: targetId, label:false});
	this.networkWidget.draw(this.dataset, this.formatter, dsLayout);
	this.networkWidget.getFormatter().resize(this.networkWidth, this.networkHeigth);
};

NetworkAttributesWidget.prototype.draw = function (graphDataset, formatter, layout){
	var _this=this;
	this.render();
	
	/** Data for search in attributes **/
	this.attributes = new Object();
	
	/** Events **/
	this.verticesSelected = new Event(this);

	this.graphDataset = graphDataset;
	
	this.found = Ext.create('Ext.button.Button', {
		 text: 'Nodes found',
		 hidden:true,
		 listeners: {
		 	scope: this,
		 	click: function(){
		 		new InputListWidget({title:"Features found", headerInfo:"This nodes were found in the Graph"}).draw(this.foundNodes.join('\n'));
			}
	    }
	});
	this.notFound = Ext.create('Ext.button.Button', {
		 text: 'nodes not found',
		 hidden:true,
		 listeners: {
		 	scope: this,
		 	click: function(){
		 		new InputListWidget({title:"Features not found", headerInfo:"This nodes were not found in the grpah"}).draw(this.notFoundNodes.join('\n'));
			}
	    }
	});
	
	this.attributesPanel.barInfo.insert(2, this.notFound);
	this.attributesPanel.barInfo.insert(2, this.found);
	
	this.attributesPanel.onDataChange.addEventListener(function (sender, data){
		_this.dataChanged(data);
	});	
	
	
	this.drawNetwork(this.getNetworkPanelId(), graphDataset, formatter, layout);
};

NetworkAttributesWidget.prototype.getVertexAttributesByName = function (name){
	var attributes = this.attributesPanel.getData();
	var results = new Array();
	if(attributes != null){
		for ( var i = 0; i < attributes.length; i++) {
			if (attributes[i][0] == name){
				results.push(attributes[i]);
			}
		}
		return results;
	}
	else{
		return name;
	}
};


NetworkAttributesWidget.prototype.dataChanged = function (data){
	this.foundNodes=[];
	this.notFoundNodes=[];
	for(var i=0; i< data.length; i++){
		var node = this.graphDataset.getVertexByName(data[i].data["0"]);
		if(node==null){
			this.notFoundNodes.push(data[i].data["0"]);
		}else{
			this.foundNodes.push(data[i].data["0"]);
		}
	}
	this.found.setText('<span class="dis">' + this.foundNodes.length + ' results found </span> ');
	this.found.show();
	if (this.notFoundNodes.length > 0){
		this.notFound.setText('<span class="err">'  + this.notFoundNodes.length +' features not found</span>');
		this.notFound.show();
	}
	
	this.onDataChanged(data);
	
};

NetworkAttributesWidget.prototype.onDataChanged = function (data){
	this.verticesSelected.notify(this.getFoundVertices());
	this.networkWidget.deselectNodes();
	this.networkWidget.selectVerticesByName(this.getFoundVertices());
};

NetworkAttributesWidget.prototype.getFoundVertices = function (){
	return this.foundNodes;
};
function AttributesPanel(args){
	var _this= this;
	this.targetId = null;
	this.id = "AttributesPanel_" + Math.round(Math.random()*10000000);
	
	this.title = null;
	this.width = 1023;
	this.height = 628;
	this.wum = true;
	this.tags = [];
	this.borderCls='panel-border-bottom';
	
	this.columnsCount = null;
	if (args != null){
		if (args.wum!= null){
        	this.wum = args.wum;       
        }
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
        if (args.columnsCount!= null){
        	this.columnsCount = args.columnsCount;       
        }
        if (args.borderCls!= null){
        	this.borderCls = args.borderCls;       
        }
        if (args.tags!= null){
        	this.tags = args.tags;       
        }
    }
        
	/** create widgets **/
	this.browserData = new BrowserDataWidget();
    
	
    /** Events i send **/
    this.onDataChange = new Event(this);
    this.onFileRead = new Event(this);
    
    /** Events i listen **/
    this.browserData.adapter.onReadData.addEventListener(function (sender, data){
		var tabularFileDataAdapter = new TabularFileDataAdapter({comment:"#"});
		tabularFileDataAdapter.parse(data.data);
		_this.makeGrid(tabularFileDataAdapter);
		_this.uptadeTotalFilteredRowsInfo(tabularFileDataAdapter.lines.length);
		_this.uptadeTotalRowsInfo(tabularFileDataAdapter.lines.length);
		_this.fileNameLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
	});	
};

AttributesPanel.prototype.draw = function (){
	var panel = this.getPanel();
	
	if (this.targetId != null){
		panel.render(this.targetId);
	}
};

AttributesPanel.prototype.uptadeTotalRowsInfo = function (linesCount){
	this.infoLabel.setText('<span class="dis">Total rows: </span><span class="emph">' + linesCount + '</span>',false);
	
};

AttributesPanel.prototype.uptadeTotalFilteredRowsInfo = function (filteredCount){
	this.infoLabel2.setText('<span class="dis">Filtered rows: </span><span class="emph">' + filteredCount + '</span>',false);
};

AttributesPanel.prototype.sessionInitiated = function (){
	if(this.btnBrowse!=null){
		this.btnBrowse.enable();
	}
};

AttributesPanel.prototype.sessionFinished = function (){
	if(this.btnBrowse!=null){
		this.btnBrowse.disable();
	}
};

AttributesPanel.prototype.getPanel = function (){
	var _this=this;
	if (this.panel == null){
		this.expresionAnalysisUploadFieldFile = Ext.create('Ext.form.field.File', {
			msgTarget : 'side',
//			flex:1,
			width:75,
			emptyText: 'Choose a local file',
	        allowBlank: false,
			buttonText : 'Browse local',
			buttonOnly : true,
			listeners : {
				scope:this,
				change :function() {
						_this.panel.setLoading("Reading file");
						try{
							var dataAdapter = new TabularFileDataAdapter({comment:"#"});
							var file = document.getElementById(this.expresionAnalysisUploadFieldFile.fileInputEl.id).files[0];
							_this.fileName = file.name;
							_this.fileNameLabel.setText('<span class="emph">'+ file.name +'</span> <span class="info">(local)</span>',false);
							dataAdapter.loadFromFile(file);
							
							dataAdapter.onRead.addEventListener(function(sender, id) {
									_this.makeGrid(dataAdapter);
									_this.uptadeTotalFilteredRowsInfo(dataAdapter.lines.length);
									_this.uptadeTotalRowsInfo(dataAdapter.lines.length);
									_this.panel.setLoading(false);
									_this.onFileRead.notify();
							});
						}
						catch(e){
							alert(e);
							_this.panel.setLoading(false);
						}
					
				}
			}
		});
		this.barField = Ext.create('Ext.toolbar.Toolbar');
		this.barInfo = Ext.create('Ext.toolbar.Toolbar',{dock:'bottom'});
		this.barHelp = Ext.create('Ext.toolbar.Toolbar',{dock:'top'});
		
		
		this.clearFilter = Ext.create('Ext.button.Button', {
			 text: 'Clear filters',
			 disabled:true,
			 listeners: {
			       scope: this,
			       click: function(){
			       			if(this.grid.filters!=null){
			       				this.grid.filters.clearFilters();
			       				this.store.clearFilter();
			       			}
			       		}
	        }
		});
			
		
		this.helpLabel = Ext.create('Ext.toolbar.TextItem', {
			html:'<span class="dis">Click on the header down arrow to filter by column</span>'
		});
		this.fileNameLabel = Ext.create('Ext.toolbar.TextItem', {
			html:'<span class="emph">Select a <span class="info">local</span> file or a <span class="info">server</span> file from your account.</span>'
		});
		this.infoLabel = Ext.create('Ext.toolbar.TextItem', {
			html:'&nbsp;'
		});
		this.infoLabel2 = Ext.create('Ext.toolbar.TextItem', {
			html:'&nbsp;'//'<span class="info">No file selected</span>'
		});
		
		this.barField.add(this.expresionAnalysisUploadFieldFile);
		this.barInfo.add('->',this.infoLabel,this.infoLabel2);
		this.barHelp.add(this.fileNameLabel,'->',this.helpLabel);
		
		this.store = Ext.create('Ext.data.Store', {
			fields:["1","2"],
			data:[]
		});
		this.grid = Ext.create('Ext.grid.Panel', {
		    store: this.store,
		    disabled:true,
		    border:0,
		    columns:[{header:"Column 1",dataIndex:"1"},{header:"Column 2",dataIndex:"2"}]
		});
		
		this.panel  = Ext.create('Ext.panel.Panel', {
			title : this.title,
			border:false,
			layout: 'fit',
			cls:this.borderCls,
			items: [this.grid],
			tbar:this.barField,
			width: this.width,
		    height:this.height,
		    maxHeight:this.height,
			buttonAlign:'right',
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
		this.panel.addDocked(this.barInfo);
		this.panel.addDocked(this.barHelp );
		
	}	
	
	
	if(this.wum){
			this.btnBrowse = Ext.create('Ext.button.Button', {
		        text: 'Browse server',
		        disabled:true,
//		        iconCls:'icon-local',
//		        cls:'x-btn-default-small',
		        listeners: {
				       scope: this,
				       click: function (){
				    	   		this.browserData.draw($.cookie('bioinfo_sid'),this.tags);
				       		}
		        }
			});
			
			this.barField.add(this.btnBrowse);
			
			if($.cookie('bioinfo_sid') != null){
				this.sessionInitiated();
			}else{
				this.sessionFinished();
			}
	}
	this.barField.add('-',this.clearFilter);
	
	return this.panel;
};


AttributesPanel.prototype.getData = function (){
	return this.data;
};

AttributesPanel.prototype.makeGrid = function (dataAdapter){
		var _this = this;
		this.data = dataAdapter.lines;
	
		var fields = [];
		var columns = [];
		var filtros = [];
		
		if (this.columnsCount == null){
			this.columnsCount = this.data[0].length;
		}
//		for(var i=0; i< data[0].length; i++){
		for(var i=0; i< this.columnsCount; i++){
			var type = dataAdapter.getHeuristicTypeByColumnIndex(i);
			fields.push({"name": i.toString(),type:type});
			columns.push({header: "Column "+i.toString(), dataIndex:i.toString(), flex:1,filterable: true,  filter: {type:type}});
			filtros.push({type:type, dataIndex:i.toString()});
		}
		this.store = Ext.create('Ext.data.Store', {
		    fields: fields,
		    data: this.data,
		    listeners:{
		    	scope:this,
		    	datachanged:function(store){
		    		var items = store.getRange();
		    		this.uptadeTotalFilteredRowsInfo(store.getRange().length);
		    		this.onDataChange.notify(store.getRange());
		    	}
		    }
		});
		
		var filters = {
        ftype: 'filters',
        local: true,
        filters: filtros
    	};
		
    	if(this.grid!=null){
			this.panel.remove(this.grid);
		}
    	
		this.grid = Ext.create('Ext.grid.Panel', {
		    store: this.store,
		    columns:columns,
//		    height:164,
//		    maxHeight:164,
//		    height:this.height,
//		    maxHeight:this.height,
		    border:0,
		    features: [filters]
		});
		this.panel.insert(0,this.grid);
		this.clearFilter.enable();
};GenotypeGenomicAttributesWidget.prototype.draw = GenomicAttributesWidget.prototype.draw;
GenotypeGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
GenotypeGenomicAttributesWidget.prototype.drawKaryotype = GenomicAttributesWidget.prototype.drawKaryotype;
GenotypeGenomicAttributesWidget.prototype.makeGrid = GenomicAttributesWidget.prototype.makeGrid;
GenotypeGenomicAttributesWidget.prototype.getKaryotypePanelId = GenomicAttributesWidget.prototype.getKaryotypePanelId;
GenotypeGenomicAttributesWidget.prototype.dataChange = GenomicAttributesWidget.prototype.dataChange;
GenotypeGenomicAttributesWidget.prototype.fill = GenomicAttributesWidget.prototype.fill;
GenotypeGenomicAttributesWidget.prototype.onAdditionalInformationClick = GenomicAttributesWidget.prototype.onAdditionalInformationClick;

function GenotypeGenomicAttributesWidget(species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Genotype";
	args.tags = ["genotype"];
	args.featureType = 'snp';
	args.listWidgetArgs = {title:'Filter',action:'filter', gridFields:["name", "variantAlleles", "ancestralAllele", "mapWeight",  "position", "sequence"]};
	GenomicAttributesWidget.prototype.constructor.call(this, species, args);
};


ExpressionGenomicAttributesWidget.prototype.draw = GenomicAttributesWidget.prototype.draw;
ExpressionGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
ExpressionGenomicAttributesWidget.prototype.drawKaryotype = GenomicAttributesWidget.prototype.drawKaryotype;
ExpressionGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
ExpressionGenomicAttributesWidget.prototype.makeGrid = GenomicAttributesWidget.prototype.makeGrid;
ExpressionGenomicAttributesWidget.prototype.getKaryotypePanelId = GenomicAttributesWidget.prototype.getKaryotypePanelId;
ExpressionGenomicAttributesWidget.prototype.dataChange = GenomicAttributesWidget.prototype.dataChange;


function ExpressionGenomicAttributesWidget(targetId, widgetId, args){
	GenomicAttributesWidget.prototype.constructor.call(this, targetId, widgetId, args);
    this.karyotypeWidget = new KaryotypePanel(this.getKaryotypePanelId(), this.getKaryotypePanelId(), {"top":10, "width":1000, "height": 300, "trackWidth":15});
};


ExpressionGenomicAttributesWidget.prototype.dataChange = function (items){
	try{
				console.log(items);
				var _this = this;
				this.karyotypePanel.setLoading("Connecting to Database");
				this.karyotypeWidget.unmark();
				var _this=this;
				var externalNames = [];
				
				if (items.length > 0){
					for (var i = 0; i < items.length; i++) {
						externalNames.push(items[i].data[0]);
					}	
					
					
					var cellBaseDataAdapter = new CellBaseDataAdapter();
					cellBaseDataAdapter.successed.addEventListener(function(sender){		
						_this.karyotypePanel.setLoading("Retrieving data");
						for (var i = 0; i < cellBaseDataAdapter.dataset.toJSON().length; i++) {
								_this.karyotypeWidget.mark(cellBaseDataAdapter.dataset.toJSON()[i]);
						}
						_this.karyotypePanel.setLoading(false);
					});
					cellBaseDataAdapter.fill("feature", "gene", externalNames.toString(), "info");
				}
	}
	catch(e){
		alert(e);
		this.panel.setLoading(false);
	}
};


function AttributesWidget(args){
	this.id = "AttributesWidget_" + Math.random();
	this.title = "";
	this.width = 1025;
	this.height = 628;
	
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
	this.attributesPanel = new AttributesPanel({borderCls:args.borderCls, height:325});
};

AttributesWidget.prototype.draw = function (){
	this.render();
};

AttributesWidget.prototype.getDetailPanel = function (){
	return {};
};

AttributesWidget.prototype.getButtons = function (){
	var _this=this;
	return [{text:'Close', handler: function(){_this.panel.close();}}];
};


AttributesWidget.prototype.render = function (){
	var _this = this;
	if (this.panel == null){
		this.panel  = Ext.create('Ext.ux.Window', {
			title : this.title,
			resizable: false,
			constrain:true,
			closable:true,
			collapsible:true,
			layout: { type: 'vbox',align: 'stretch'},
			items: [this.attributesPanel.getPanel(), this.getDetailPanel()],
			width: this.width,
		    height:this.height,
			buttonAlign:'right',
			buttons:this.getButtons(),
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
		this.panel.setLoading();
	}	
	this.panel.show();
};
function ChartWidget(args) {
	var this_ = this;
	this.id = "ChartWidget_" + Math.round(Math.random() * 10000000);

	this.title = null;
	this.width = 750;
	this.height = 300;

	if (args != null) {
		if (args.title != null) {
			this.title = args.title;
		}
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
	}
};

ChartWidget.prototype.getStore = function() {
	return this.store;
};

ChartWidget.prototype.getChart = function(fields) {
	
	Ext.define('ChromosomeChart', {
	    extend: 'Ext.data.Model',
	    fields: fields
	});
	
	this.store = Ext.create('Ext.data.Store', {
		 model: 'ChromosomeChart',
		 autoLoad : false
	});
	
	var dibujo = Ext.create('Ext.chart.Chart', {
		animate : true,
		shadow : true,
		store : this.store,
		width : this.width,
		height : this.height,
		axes : [{
					position : 'left',
					fields : [fields[0]],
					title : fields[0],
					grid:true,
					type : 'Numeric',
	                minimum: 0 //si no se pone, peta
				}, {
					title : fields[1],
					type : 'category',
					position : 'bottom',
					fields : [fields[1]],
//					width : 10,
					label : {
						rotate : {
							degrees : 270
						}
					}
				}],
		series : [{
					type : 'column',
					axis: 'left',
					gutter: 80,
					yField : fields[0],
					xField : fields[1],
	                style: {
	                    fill: '#38B8BF'
	                }
				}]
	});
	return dibujo;
};//GenomicListWidget.prototype._render 				=       ListWidget.prototype._render;
GenomicListWidget.prototype.draw 				=       ListWidget.prototype.draw;
GenomicListWidget.prototype.getActionButton 			=       ListWidget.prototype.getActionButton;


function GenomicListWidget(args) {
	ListWidget.prototype.constructor.call(this, args);
	this.listPanel = new GenomicListPanel({title:false,gridFields:args.gridFields});
	this.onSelected = this.listPanel.onSelected;
	this.onFilterResult = this.listPanel.onFilterResult;
	
	this.onTrackAddAction = new Event();
	
	
};



GenomicListWidget.prototype._render = function() {
	var _this = this;
	if(this.panel==null){
		this.localizeButton = Ext.create('Ext.button.Button', {
			minWidth : 80,
			text : 'OK',
			disabled:true,
			handler : function() {
					_this.listPanel.onSelected.notify(_this.listPanel.grid.getSelectionModel().getSelection()[0].data);
					_this.panel.hide();
			}
		});
		this.filterButton = Ext.create('Ext.button.Button', {
			minWidth : 80,
			text : 'OK',
			handler : function() {
					_this.listPanel.onFilterResult.notify(_this.listPanel.store.getRange());
					_this.panel.hide();
			}
		});
		var buttonRigthMargin = 375;
		
		
		this.panel = Ext.create('Ext.ux.Window', {
			title : this.title,
			taskbar:Ext.getCmp(this.args.genomeViewer.id+'uxTaskbar'),
			resizable: false,
			constrain:true,
			closable:true,
			layout: 'fit',
			minimizable :true,
			width: this.width,
			height:this.height,
			items : [ this.listPanel.grid ],
			buttonAlign:'right',
			buttons:[
			         {text:'Add Track', handler: function(){_this.onTrackAddAction.notify(_this.listPanel.features);}, margin:"0 " + buttonRigthMargin  +" 0 0 "},
			         this.getActionButton(this.action),
			         {text:'Close', handler: function(){_this.panel.close();}}
			],
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
};function ListWidget(args) {
	this.targetId = null;
	this.id = "ListWidget_" + Math.round(Math.random()*10000000);
		
	this.width = 1000;
	this.height = 500;
	this.action = 'localize';
	this.title='';
	
	this.args = args;
	
//	if (args == null){
//		args = {};
//	}
		
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
        if (args.action!= null){
        	this.action = args.action;       
        }
    }
	
	this.listPanel = new ListPanel({title:false,gridFields:args.gridFields});
	this.onSelected=this.listPanel.onSelected;
	this.onFilterResult=this.listPanel.onFilterResult;
	
};

ListWidget.prototype._render = function() {
	var _this = this;
	if(this.panel==null){
		this.localizeButton = Ext.create('Ext.button.Button', {
			minWidth : 80,
			text : 'OK',
			disabled:true,
			handler : function() {
					_this.listPanel.onSelected.notify(_this.listPanel.grid.getSelectionModel().getSelection()[0].data);
					_this.panel.hide();
			}
		});
		this.filterButton = Ext.create('Ext.button.Button', {
			minWidth : 80,
			text : 'OK',
			handler : function() {
					_this.listPanel.onFilterResult.notify(_this.listPanel.store.getRange());
					_this.panel.hide();
			}
		});
		
		this.panel = Ext.create('Ext.ux.Window', {
			title : this.title,
			taskbar:Ext.getCmp(this.args.genomeViewer.id+'uxTaskbar'),
			resizable: false,
			constrain:true,
			closable:true,
			layout: 'fit',
			minimizable :true,
			width: this.width,
			height:this.height,
			items : [ this.listPanel.grid ],
			buttonAlign:'right',
			buttons:[{text:'aaa', handler: function(){},margin:"0 50 0 0 "},
			         this.getActionButton(this.action),
					{text:'Close', handler: function(){_this.panel.close();}}
			],
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
};

ListWidget.prototype.draw = function(features, queries) {
	var _this = this;
	this.listPanel.draw(features, queries);
	this.listPanel.grid.getSelectionModel().on('selectionchange',function(){
		if(_this.listPanel.grid.getSelectionModel().hasSelection()){
			_this.localizeButton.enable();
		}else{
			_this.localizeButton.disable();
		}
	});
	this._render();
	this.panel.show();
};

ListWidget.prototype.getActionButton = function(action) {
	switch (action){
		case "localize": return this.localizeButton; break;
		case "filter": this.listPanel.localizeButton.disable().hide(); return this.filterButton; break;
	};
};function ListPanel(args) {
	this.targetId = null;
	this.id = "ListPanel_" + Math.round(Math.random()*10000000);
		
	this.title = "List of Genes";
	this.width = 1000;
	this.height = 500;
	this.borderCls='panel-border-bottom';
	
	this.gridFields = [ 'externalName', 'stableId', 'biotype','position', 'strand', 'description' ];
		
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
        if (args.gridFields != null){
        	this.gridFields = args.gridFields;
        }
        if (args.borderCls!= null){
        	this.borderCls = args.borderCls;       
        }
        
    }
	
	this.onSelected = new Event(this);
	this.onFilterResult = new Event(this);
	
	
};

ListPanel.prototype._getGeneGrid = function() {
	var _this = this;
//	if(this.grid==null){
		var fields = this.gridFields;
		
		var filters = [];
		var columns = new Array();
		
		for(var i=0; i<fields.length; i++){
			filters.push({type:'string', dataIndex:fields[i]});
			columns.push({header:this.gridFields[i], dataIndex:this.gridFields[i], flex:1});
		}
		
		this.store = Ext.create('Ext.data.Store', {
			fields : fields,
			groupField : 'biotype',
			autoload : false
		});

	
		var filters = {
	        ftype: 'filters',
	        local: true, // defaults to false (remote filtering)
	        filters: filters
	    };
		
	    this.infoToolBar = Ext.create('Ext.toolbar.Toolbar');
		this.infoLabelOk = Ext.create('Ext.toolbar.TextItem', {
			html : '&nbsp;'
		});
		this.infoLabelNotFound = Ext.create('Ext.toolbar.TextItem', {
			html : '&nbsp;'
		});
		this.clearFilter = Ext.create('Ext.button.Button', {
			 text: 'Clear filters',
			 listeners: {
			 	scope: this,
			 	click: function(){
			 		if(this.grid.filters!=null){
						this.grid.filters.clearFilters();
			 		}
				}
		    }
		});
		this.found = Ext.create('Ext.button.Button', {
			 text: 'Features found',
			 hidden:true,
			 listeners: {
			 	scope: this,
			 	click: function(){
			 		new InputListWidget({title:"Features found", headerInfo:"This features were found in the database"}).draw(this.queriesFound.join('\n'));
				}
		    }
		});
		this.notFound = Ext.create('Ext.button.Button', {
			 text: 'Features not found',
			 hidden:true,
			 listeners: {
			 	scope: this,
			 	click: function(){
			 		new InputListWidget({title:"Features not found", headerInfo:"This features were not found in the database"}).draw(this.queriesNotFound.join('\n'));
				}
		    }
		});
		this.exportButton = Ext.create('Ext.button.Button', {
			text : 'Export to Text',
			handler : function() {
    	 		new InputListWidget({width:1100, title:"VCS content", headerInfo:"Export results"}).draw(_this._getStoreContent());
     		}
		});
		this.localizeButton = Ext.create('Ext.button.Button', {
			text : 'Localize on karyotype',
			handler : function() { _this._localize();}
		});
		this.infoToolBar.add([ '->',this.exportButton,this.localizeButton,'-',this.found,this.notFound,this.clearFilter]);
	    
		
		this.grid = Ext.create('Ext.grid.Panel', {
			border:0,
			store : this.store,
			features: [filters],
			bbar:this.infoToolBar,
			columns : columns,
			selModel: {
                mode: 'SINGLE'
            }
		});		
	return this.grid;
};

ListPanel.prototype._localize = function() {
	var _this = this;
	
	var karyotypePanelWindow = new KaryotypePanelWindow();
	karyotypePanelWindow.onRendered.addEventListener(function(evt, feature) {
		var results = new Array();
		for ( var i = 0; i < _this.original.length; i++) {
			for ( var j = 0; j < _this.original[i].length; j++) {
				results.push(_this.original[i][j]);
			}
		}
		karyotypePanelWindow.mark(results);
	});

	karyotypePanelWindow.onMarkerChanged.addEventListener(function(evt, data) {
		_this.onSelected.notify(data);
	});
	karyotypePanelWindow.draw();
};

ListPanel.prototype.setTextInfoBar = function(resultsCount, featuresCount, noFoundCount) {
	this.found.setText('<span class="dis">' + resultsCount + ' results found </span> ');
	this.found.show();
	if (noFoundCount > 0){
		this.notFound.setText('<span class="err">'  + noFoundCount +' features not found</span>');
		this.notFound.show();
	}
};

ListPanel.prototype._getStoreContent = function() {
	var text = new String();
		for ( var i = 0; i < this.store.data.items.length; i++) {
			var header = new String();
			if (i == 0){
				for ( var j = 0; j < this.gridFields.length; j++) {
					header = header + this.gridFields[j] + "\t";
				}
				header = header + "\n";
			}
			var row = header;
			for ( var j = 0; j < this.gridFields.length; j++) {
				row = row + this.store.data.items[i].data[ this.gridFields[j]] + "\t";
			}
				
			row = row + "\n";
			text = text + row;
		}
	return text;
};

ListPanel.prototype._render = function() {
	var _this = this;
	if(this.panel==null){
		this.panel = Ext.create('Ext.panel.Panel', {
		    height:240,
		    layout:'fit',
		    cls:this.borderCls,
			title : this.title,
			border:false
		});
	}
	this.panel.add(this._getGeneGrid());
};

ListPanel.prototype.draw = function(features, queries) {
	this._render();
	
	if ((queries instanceof Array) == false){
		queries = queries.split(",");
	}
	this.original = features;
	this.queriesNotFound=[];
	this.queriesFound=[];
	var notFoundCount = 0;
	var results = new Array();

	for ( var i = 0; i < features.length; i++) {
		if (features[i].length == 0){
			notFoundCount++; 
			this.queriesNotFound.push(queries[i]);
		}else{
			this.queriesFound.push(queries[i]);
		}
		
		for ( var j = 0; j < features[i].length; j++) {
			features[i][j].position = features[i][j].chromosome + ":"+ features[i][j].start + "-" + features[i][j].end;
			results.push(features[i][j]);
		}
	}
	
	this.features = results;

	this.setTextInfoBar(results.length, this.original.length, notFoundCount);
	
	this.store.loadData(results, false);
};GenomicListPanel.prototype._getGeneGrid 				=       ListPanel.prototype._getGeneGrid;
GenomicListPanel.prototype._localize 				=       ListPanel.prototype._localize;
GenomicListPanel.prototype.setTextInfoBar 			=       ListPanel.prototype.setTextInfoBar;
GenomicListPanel.prototype._getStoreContent 			=       ListPanel.prototype._getStoreContent;
GenomicListPanel.prototype._render  					=       ListPanel.prototype._render;
GenomicListPanel.prototype.draw  					=       ListPanel.prototype.draw;

function GenomicListPanel(args) {
	ListPanel.prototype.constructor.call(this, args);
};


function TextWindowWidget(args){
	this.windows = new Array();
};

TextWindowWidget.prototype.draw = function(text){
//	this.windows.push( window.open(''+self.location,"Bioinformatics",config="height="+500+",width="+800+" ,font-size=8, resizable=yes, toolbar=1, menubar=1"));
//	this.windows[this.windows.length-1].document.write("<title>"+ "asdasda" +"</title>");
//	this.windows[this.windows.length-1].document.write(text);
//	this.windows[this.windows.length-1].document.close();
	
	
	myRef = window.open('data:text/csv,field1%2Cfield2%0Afoo%2Cbar%0Agoo%2Cgai%0A','mywin',
	'left=20,top=20,width=500,height=200');
	
	myRef.document.write(text);
};


function ClienSideDownloaderWindowWidget(args){
	this.windows = new Array();
};

ClienSideDownloaderWindowWidget.prototype.draw = function(text, content){
//	myRef = window.open('data:text/csv,field1%2Cfield2%0Afoo%2Cbar%0Agoo%2Cgai%0A','mywin', 'left=20,top=20,width=500,height=200');
	
	myRef = window.open('data:text/csv,' + content,'mywin', 'left=20,top=20,width=500,height=200');
	
	myRef.document.write(text);
};	/*Nuevo tipo ventana*/
	Ext.define("Ext.ux.Window",{
		extend:"Ext.window.Window",
		minimizable:true,
		constrain:true,
		collapsible:true,
		initComponent: function () {
			this.callParent();
			if(this.taskbar!=null){//si no existe, las ventanas funcionan como hasta ahora
				this.zIndexManager = this.taskbar.winMgr;
				this.iconCls='icon-grid';
				this.button=Ext.create('Ext.button.Button', {
					text:this.title,
					window:this,
					iconCls : this.iconCls,
					handler:function(){
						if(this.window.zIndexManager.front==this.window){
							this.window.minimize();
						}else{
							this.window.show();
						}
					}
				});
				this.taskbar.add(this.button);
				
				
				this.contextMenu = new Ext.menu.Menu({
					items: [{
						text: 'Close',
						window:this,
						iconCls:'tools-icons x-tool-close',
						handler:function(){this.window.close();}
					}]
				});
				this.button.getEl().on('contextmenu', function(e){
													e.preventDefault();
													this.contextMenu.showAt(e.getX(),e.getY()-10-(this.contextMenu.items.length)*25);
													},this);
				
				this.button.on('destroy', function(){this.window.close();});
				
				//Taskbar button can be destroying
				this.on('destroy',function(){if(this.button.destroying!=true){this.button.destroy();}});
				
				this.on('minimize',function(){this.hide();});
				this.on('deactivate',function(){
					if(this.zIndexManager && this.zIndexManager.front.ghostPanel){
						this.zIndexManager.unregister(this.zIndexManager.front.ghostPanel);
					}
					this.button.toggle(false);
				});
				this.on('activate',function(){this.button.toggle(true);});
				
			}
		}
	});function FilterPanel(args){
	var this_=this;
	this.id = "FilterPanel_" + Math.round(Math.random()*10000000);
	this.targetId = null;
	
	this.title=null;
	this.width=null;
	this.height=null;
	
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
FilterPanel.prototype.draw = function (arr){
	var arr = ["manzanas","pera","meloconton","sandia","melon","naranja","manzanas","pera","meloconton","sandia","melon","naranja","manzanas","pera","meloconton","sandia","melon","naranja"];
	this.render(arr);
	
	if (this.targetId != null){
		this.panel.render(this.targetId);
	}
	
};
FilterPanel.prototype.render = function (arr){

	var items = [];
	for (var i = 0; i < arr.length; i++) {
		items.push({boxLabel:arr[i],checked:true});
	}
	
	if (this.panel == null){
		this.panel = Ext.create('Ext.panel.Panel', {
			title: this.title,
		    width: this.width,
		    height: this.height,
		    layout: 'vbox',
		    defaultType: 'checkboxfield',
		    items: items
		});
	}
};function InputListWidget(args) {
	this.id = "InputListWidget" + Math.round(Math.random()*10000000);
		
	this.title = "List";
	this.width = 500;
	this.height = 350;
	this.headerInfo = 'Write a list separated only by lines';
	
	this.args=args;
	
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
        if (args.headerInfo!= null){
        	this.headerInfo = args.headerInfo;       
        }
    }
	
	this.onOk = new Event(this);
};


InputListWidget.prototype.draw = function(text){
	var _this = this;
	
	if (text == null){
		text = new String();
	}
	
	if (this.panel == null){
		this.infobar = Ext.create('Ext.toolbar.Toolbar',{cls:"bio-border-false"});
		this.infoLabel = Ext.create('Ext.toolbar.TextItem', {
				html:this.headerInfo
		});
		this.infobar.add(this.infoLabel);
		this.editor = Ext.create('Ext.form.field.TextArea', {
				id:this.id + "genelist_preview",
	       	 	xtype: 'textarea',
	        	name: 'file',
	        	margin:"-1",
				width : this.width,
				height : this.height,
	        	enableKeyEvents:true,
	        	cls: 'dis',
	        	style:'normal 6px tahoma, arial, verdana, sans-serif',
	        	value: text,
	        	listeners: {
				       scope: this,
				       change: function(){
//				       			var re = /\n/g;
//				       			for( var i = 1; re.exec(this.editor.getValue()); ++i );
//				       			this.infoLabel.setText('<span class="ok">'+i+'</span> <span class="info"> Features detected</span>',false);
				       			this.validate();
				       }
				       
		        }
		});
		var form = Ext.create('Ext.panel.Panel', {
			border : false,
			items : [this.infobar,this.editor]
		});
		
		this.okButton = Ext.create('Ext.button.Button', {
			 text: 'Ok',
			 disabled:true,
			 listeners: {
			       scope: this,
			       click: function(){
			       			var geneNames = Ext.getCmp(this.id + "genelist_preview").getValue().split("\n");
							this.onOk.notify(geneNames);
							_this.panel.close();
			       		}
	        }
		});  
		
		this.panel = Ext.create('Ext.ux.Window', {
			title : this.title,
			taskbar:Ext.getCmp(this.args.genomeViewer.id+'uxTaskbar'),
			layout: 'fit',
			resizable: false,
			collapsible:true,
			constrain:true,
			closable:true,
			items : [ form ],
			buttons : [ this.okButton, {text : 'Cancel',handler : function() {_this.panel.close();}} ],
			listeners: {
				       scope: this,
				       destroy: function(){
				       		delete this.panel;
				       }
		        }
		});
	}
	this.panel.show();
	
};

InputListWidget.prototype.validate = function (){
	if (this.editor.getValue()!="") {
		this.okButton.enable();
	}else{
		this.okButton.disable();
	}
};
