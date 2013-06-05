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

function NetworkViewer(targetId, args) {
	var _this = this;
	this.id = "NetworkViewer"+ Math.round(Math.random()*10000);
	
	this.menuBar = null;
	
	// if not provided on instatiation
	this.width =  $(document).width();
	this.height = $(document).height();
	this.targetId=null;
	this.overviewScale = 0.2;
	this.version = "";
	
	//Setting paramaters
	if (targetId != null) {
		this.targetId=targetId;
	}
	if (args != null) {
		if(args.description != null) {
			args.description = "beta";
		}
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
		if(args.menuBar != null) {
			this.menuBar = args.menuBar;
		}
		if (args.pluginsMenu != null) {
			this.pluginsMenu = args.pluginsMenu;
		}
		if (args.overview != null) {
			this.overview = args.overview;
		}
		if (args.version != null) {
			this.version = args.version;
		}
	}
	
	/** Network Data object **/
	this.networkData = new NetworkData();
	
	this.drawZoneWidth = this.width-12;
	this.drawZoneHeight = this.height-112;
	
	//Events i send
	this.onSelectionChange = new Event();
	
	console.log(this.width+"x"+this.height);
	console.log(this.targetId);
	console.log(this.id);
};

NetworkViewer.prototype.draw = function(){
	var _this = this;
	if(this.targetId!=null){
		this._getPanel(this.width,this.height);
	}
	
	var div = $('#'+this.getGraphCanvasId())[0];
	this.networkSvg = new NetworkSvg(div, this.networkData, {"width": this.drawZoneWidth, "height": this.drawZoneHeight});
	
	this.networkEditorBarWidget.setNetworkSvg(this.networkSvg);
	
	this.networkSvg.onSelectionChange.addEventListener(function(sender,data){
		_this.onSelectionChange.notify(data);
	});
	
	// networkSVG for the overview
	if(this.overview) {
		div = $('#'+this.getGraphCanvasId()+'_overview')[0];
		this.networkSvgOverview = new NetworkSvg(div, this.networkData, {"width": "100%", "height": "100%", "parentNetwork": this.networkSvg, "scale": this.overviewScale});
	}
};

//Gets the panel containing all genomeViewer
NetworkViewer.prototype._getPanel = function(width,height) {
	var _this=this;
	if(this._panel == null){
		this.networkEditorBarWidget = new NetworkEditorBarWidget(this);
		var editorBar = this.networkEditorBarWidget.getBar();
		
		var htmlContent = '<div id="'+this.getGraphCanvasId()+'" style="border:1px solid #bbb;"></div>'; 
		if(this.overview) {
			htmlContent = '<div id="'+this.getGraphCanvasId()+'" style="position:relative; border:1px solid #bbb;">';
			htmlContent += '<div id="'+this.getGraphCanvasId()+'_overview" style="position:absolute; bottom:7px; right:7px; width:'+parseInt(this.drawZoneWidth*this.overviewScale)+'px; height:'+parseInt(this.drawZoneHeight*this.overviewScale)+'px; border:1px solid #bbb;"></div>';
			htmlContent += '</div>';
		}
		
		this.container = Ext.create('Ext.container.Container', {
			padding:5,
			flex:1,
			style:"background: whiteSmoke;",
			cls:'x-unselectable',
			html:htmlContent
		});
		
		var items = [];
		if(this.menuBar!=null){
			items.push(this.menuBar);
			this.drawZoneHeight = this.drawZoneHeight-28;
		}
		items.push(this.getOptionBar());
		items.push(editorBar);
		
		items.push(this.container);
		items.push(this.getInfoBar());
		
		this._panel = Ext.create('Ext.panel.Panel', {
			renderTo:this.targetId,
			border : false,
	    	width:width,
	    	height:height,
			cls:'x-unselectable',
			layout: { type: 'vbox',align: 'stretch'},
			region : 'center',
			margins : '0 0 0 0',
			items :items
		});
		
//		this._panel = Ext.create('Ext.container.Container', {
//			renderTo:this.targetId,
//			width:width,
//	    	height:height,
//			cls:'x-unselectable',
//			layout: { type: 'vbox',align: 'stretch'},
//			region : 'center',
//			margins : '0 0 0 0',
//			items :items
//		});
	}
	
	return this._panel;
};

//TODO (incomplete)
NetworkViewer.prototype.setSize = function(width, height) {
	this.width = width;
	this.height = height;
	
	console.log(width+"x"+height);
	this._getPanel().setSize(width, height);
	
	$('#'+this.getGraphCanvasId()+'_overview').css('width', parseInt((width-12)*this.overviewScale)+'px');
	$('#'+this.getGraphCanvasId()+'_overview').css('height', parseInt((height-112)*this.overviewScale)+'px');
//	this.networkData.resize(width, height);
//	this.networkSvg.refresh();
	
//	this.draw();
};

NetworkViewer.prototype.getGraphCanvasId = function() {
	return  this.id + "_graph";
};

/** Options handler **/
NetworkViewer.prototype.handleActionMenu = function(action, args) {
	if (action == 'select'){
		this.networkSvg.setMode("select");
	}
	
//	if (action == 'drag'){
//		this.networkSvg.setMode("drag");
//	}
	
	if (action == 'add'){
		this.networkSvg.setMode("add");
	}

	if (action == 'join'){
		this.networkSvg.setMode("join");
	}
	
	if (action == 'delete'){
		this.networkSvg.setMode("delete");
	}

	if (action == 'ZOOM'){
		this.networkSvg.setScale(args);
		if(this.overview) this.networkSvgOverview.setOverviewRectSize(args);
	}

	if (action == 'GO'){
		var name = Ext.getCmp("tbSearch").getValue();
		this.networkWidget.deselectNodes();
		this.networkWidget.selectVertexByName(name);
	}
};

NetworkViewer.prototype.getInfoBar = function() {
	var taskbar = Ext.create('Ext.toolbar.Toolbar', {
		id:this.id+'uxTaskbar',
		winMgr: new Ext.ZIndexManager(),
		enableOverflow:true,
		cls: 'bio-hiddenbar',
		height:28,
		flex:1
	});
	this.nodeInfoLabel = Ext.create('Ext.toolbar.TextItem', {
		text:''
	});
	var versionInfoLabel = Ext.create('Ext.toolbar.TextItem', {
		text:this.version
	});
	var infobar = Ext.create('Ext.toolbar.Toolbar', {
		cls:'bio-hiddenbar',
		width:300,
		height:28,
		items:['-',this.nodeInfoLabel,'->','-',versionInfoLabel]
	});
	
	this.bottomBar = Ext.create('Ext.container.Container', {
		layout:'hbox',
		cls:"bio-botbar x-unselectable",
		height:30,
		items : [taskbar,infobar]
	});
	return this.bottomBar;
};

NetworkViewer.prototype.setNodeInfoLabel = function(text) {
	this.nodeInfoLabel.setText(text,false);
};

/** TOOLBAR **/
NetworkViewer.prototype.getOptionBar = function() {
	var _this = this;

	this.slider = Ext.create('Ext.slider.Single', {
		id : this.id + '_zoomSlider',
		width : 200,
		minValue : 0,
		hideLabel : false,
		maxValue : 100,
		value : 0,
		useTips : true,
		increment : 10,
		tipText : function(thumb) {
			return Ext.String.format('<b>{0}%</b>', thumb.value);
		}
	});

	this.slider.on("changecomplete", function(slider, newValue) {
		_this.handleActionMenu("ZOOM", newValue);
	});

	var optionBar = Ext.create('Ext.toolbar.Toolbar', {
		cls : "bio-toolbar",
		height : 35,
		border : true,
		items : [
	        this.networkEditorBarWidget.collapseButton,
	        this.networkEditorBarWidget.layoutButton,
	        this.networkEditorBarWidget.labelSizeButton,
	        this.networkEditorBarWidget.selectButton,
	        '-',
	        this.networkEditorBarWidget.backgroundButton,
	        '-',
			{
				xtype : 'button',
				iconCls : 'icon-zoom-out',
				listeners : {
					scope : this,
					'click' : function() {
						var zoom = _this.slider.getValue();
						if (zoom > 0){
							zoom -= 10 ;
							_this.slider.setValue(zoom);
							this.handleActionMenu('ZOOM', zoom);
						}
					}
				}
			},  
			this.slider,
			{
				xtype : 'button',
				iconCls : 'icon-zoom-in',
				listeners : {
					scope : this,
					'click' : function() {
						var zoom = _this.slider.getValue();
						if (zoom < 100){
							zoom += 10;
							_this.slider.setValue(zoom);
							this.handleActionMenu('ZOOM', zoom);
						}
					}
				}
			},
			'-',
			{
				xtype : 'button',
				iconCls : 'icon-select',
				tooltip : "Show/Hide overview",
				toggleGroup : 'overview',
				pressed : true,
				handler : function() {
					if(this.pressed) {
						if(_this.overview){
							_this.networkSvgOverview.showRenderDiv();
						}
					}
					else {
						if(_this.overview){
							_this.networkSvgOverview.hideRenderDiv();
						}
					}
				}
			},
			'->',
			{
				xtype : 'label',
				text : 'Find:',
				margins : '0 15 0 5'
			}, {
				xtype : 'textfield',
				id : 'tbSearch',
				name : 'field1',
				listeners:{
					specialkey: function(field, e){
						if (e.getKey() == e.ENTER) {
							_this.handleActionMenu('GO');
						}
					}
				}
			}, {
				xtype : 'button',
				text : 'Go',
				listeners : {
					scope : this,
					'click' : function() {
						this.handleActionMenu('GO');
					}
				}
			}
		]
	});
	return optionBar;
};

NetworkViewer.prototype.getGraphCanvas = function() {
	return this.mainGraphCanvas;
};


/**** INTERNAL METHODS *****/
NetworkViewer.prototype.calculateLayoutVertex = function(type, count){
	switch (type) {
	case "Circle":
		var radius = 0.4;
		var centerX = 0.5;
		var centerY = 0.5;
		var vertexCoordinates = new Array();
		for(var i = 0; i < count; i++){
			x = centerX + radius * Math.sin(i * 2 * Math.PI/count);
			y = centerY + radius * Math.cos(i * 2 * Math.PI/count);
			vertexCoordinates.push({'x':x,'y':y});
		}
		return vertexCoordinates;
		break;

	case "Square":
		var xMin = 0.1;
		var xMax = 0.9;
		var yMin = 0.1;
		var yMax = 0.9;
		var rows = Math.sqrt(count);
		var step = (xMax - xMin) / rows;
		var vertexCoordinates = new Array();
		for(var i = 0; i < rows; i ++){
			for ( var j = 0; j < rows; j++) {
				x = i * step + xMin;
				y = j * step + yMin;
				vertexCoordinates.push({'x':x,'y':y});
			}
		}
		return vertexCoordinates;
		break;
	}
};


/**** NETWORK VIEWER API *****/
NetworkViewer.prototype.loadNetwork = function(networkData, layout){
    this.networkData = networkData;
	this.networkData.resize(this.drawZoneWidth, this.drawZoneHeight);
	this.refresh(networkData);
	
	if(layout && layout != "none") {
		this.setLayout(layout);
	}
};

NetworkViewer.prototype.toJSON = function(){
	var selectedNodes = this.networkSvg.deselectAllNodes();
	this.networkData.updateFromSvg(this.networkSvg.getNodeMetainfo());
    this.networkSvg.selectNodes(selectedNodes);

	return this.networkData.toJSON();
};

NetworkViewer.prototype.loadJSON = function(data){
    var network = data;
    if(data.content) network = data.content;
	this.networkData.loadJSON(network);
	this.refresh(this.networkData);
	
	if(data.layout && data.layout != "none") {
		this.setLayout(data.layout);
	}
};

NetworkViewer.prototype.getNetworkData = function(){
	return this.networkData;
};

NetworkViewer.prototype.getNetworkSvg = function(){
	return this.networkSvg;
};

NetworkViewer.prototype.setLayout = function(type, nodeLst){
	var nodeList = nodeLst || this.networkData.getNodesList();
	switch (type) {
	case "Circle":
		var vertexCoordinates = this.calculateLayoutVertex(type, nodeList.length);
		var aux = 0;
		for(var i = 0; i < nodeList.length; i++) {
			var x = this.networkSvg.getWidth()*(0.05 + 0.85*vertexCoordinates[aux].x);
			var y = this.networkSvg.getHeight()*(0.05 + 0.85*vertexCoordinates[aux].y);
			this.networkSvg.moveNode(nodeList[i], x, y);
			aux++;
		}
		break;
	case "Square":
		var vertexCoordinates = this.calculateLayoutVertex(type, nodeList.length);
		var aux = 0;
		for(var i = 0; i < nodeList.length; i++) {
			var x = this.networkSvg.getWidth()*(0.05 + 0.85*vertexCoordinates[aux].x);
			var y = this.networkSvg.getHeight()*(0.05 + 0.85*vertexCoordinates[aux].y);
			this.networkSvg.moveNode(nodeList[i], x, y);
			aux++;
		}
		break;
	case "Random":
		for(var i = 0; i < nodeList.length; i++) {
			var x = this.networkSvg.getWidth()*(0.05 + 0.85*Math.random());
			var y = this.networkSvg.getHeight()*(0.05 + 0.85*Math.random());
			this.networkSvg.moveNode(nodeList[i], x, y);
		}
		break;
	default:
		var dotText = this.networkData.toDot();
		var url = "http://bioinfo.cipf.es/utils/ws/rest/network/layout/"+type+".coords";
//		var url = "http://localhost:8080/opencga/rest/utils/network/layout/"+type+".coords";
		var _this = this;
		
		$.ajax({
			async: false,
			type: "POST",
			url: url,
			dataType: "text",
			data: {
				dot: dotText
			},
			cache: false,
			success: function(data){ 
				var response = JSON.parse(data);
				for(var nodeId in response){
					var x = _this.networkSvg.getWidth()*(0.05 + 0.85*response[nodeId].x);
					var y = _this.networkSvg.getHeight()*(0.05 + 0.85*response[nodeId].y);
					_this.networkSvg.moveNode(nodeId, x, y);
				}
			}
		});
		break;
	}
	this.networkData.updateFromSvg(this.networkSvg.getNodeMetainfo());
};

NetworkViewer.prototype.importAttributes = function(data){
	if(data.createNodes) {
		var nodeList = [];
		for(var i=0; i<data.content.data.length; i++) {
			var nodeId = this.networkData.addNode({
				"name": data.content.data[i][0],
				"metainfo":{}
			});
			if(nodeId != -1) {
				nodeList.push(nodeId);
			}
		}
		this.refresh();
		this.setLayout("Random", nodeList);
	}
	
	// add attributes
	if(data.content.attributes.length > 1) {
		var attrNames = [];
		for(var i=0; i < data.content.attributes.length; i++) {
			var name = data.content.attributes[i].name;
			var type = data.content.attributes[i].type;
			var defaultValue = data.content.attributes[i].defaultValue;
			this.networkData.getNodeAttributes().addAttribute(name, type, defaultValue);
			attrNames.push(name);
		}
		
		// add values for attributes
		for(var i=0; i < data.content.data.length; i++) {
			for(var j=1; j < data.content.data[i].length; j++) {
				var name = data.content.data[i][0];
				var attr = attrNames[j];
				var value = data.content.data[i][j];
				this.networkData.getNodeAttributes().setAttributeByName(name, attr, value);
			}
		}
	}
};

NetworkViewer.prototype.selectNodes = function(nodeList) {
	this.networkSvg.selectNodes(nodeList);
};

NetworkViewer.prototype.deselectAllNodes = function() {
	this.networkSvg.deselectAllNodes();
};

NetworkViewer.prototype.filterNodes = function(nodeList) {
	this.networkSvg.filterNodes(nodeList);
};

NetworkViewer.prototype.refresh = function(networkData) {
	networkData = networkData || this.networkData;
    this.networkSvg.refresh(networkData);
	this.networkSvg.placeLabelsAndEdges();
	
	if(this.overview) {
		this.networkSvgOverview.refresh(networkData);
		this.networkSvgOverview.placeLabelsAndEdges();
	}
};

NetworkViewer.prototype.getSelectedNodes = function() {
	return this.networkSvg.getSelectedNodes();
};

NetworkViewer.prototype.getNumNodes = function() {
	return this.networkData.getNodesCount();
};

NetworkViewer.prototype.addNode = function(args) {
	return this.networkData.addNode(args);
};

NetworkViewer.prototype.removeNode = function(nodeId) {
	this.networkData.removeNode(nodeId);
};

NetworkViewer.prototype.addEdge = function(source, target, type, name, args) {
	return this.networkData.addEdge(source, target, type, name, args);
};

NetworkViewer.prototype.clearNetwork = function() {
	this.networkData.clearNetwork();
    this.refresh();
};

NetworkViewer.prototype.getNodeLabelsFromNodeList= function(nodeList) {
	return this.networkData.getNodeLabelsFromNodeList(nodeList);
};

NetworkViewer.prototype.getUnselectedNodes = function(selectedNodes) {
	return this.networkData.getUnselectedNodes(selectedNodes);
};

//TODO BORRAR
/**********SBGN*********/
//NetworkViewer.prototype.getSBGNToolBar = function() {
//    this.entityNodeButton = Ext.create('Ext.button.Button',{
//	text : 'Add Entity Node',
//	menu: new Ext.menu.Menu({
//		items: [
//			{text: 'unspecified entity',disabled:true,iconCls:'icon-sbgn-en1',handler: function(button){/*call*/}},
//			{text: 'simple chemical',disabled:true,iconCls:'icon-sbgn-en2',handler: function(button){/*call*/}},
//			{text: 'macromolecule',disabled:true,iconCls:'icon-sbgn-en3',handler: function(button){/*call*/}},
//			{text: 'nucleic acid feature',disabled:true,iconCls:'icon-sbgn-en4',handler: function(button){/*call*/}},
//			{text: 'perturbing agent',disabled:true,iconCls:'icon-sbgn-en5',handler: function(button){/*call*/}},
//			{text: 'source sink',disabled:true,iconCls:'icon-sbgn-en6',handler: function(button){/*call*/}}
//			]
//	})
//    });
//	
//    this.processNodeButton = Ext.create('Ext.button.Button',{
//    	    text : 'Add Process Node',
//    	    menu: new Ext.menu.Menu({
//		items: [
//		        {text: 'process',disabled:true,iconCls:'icon-sbgn-pn1',handler: function(button){/*call*/}},
//		        {text: 'omitted process',disabled:true,iconCls:'icon-sbgn-pn2',handler: function(button){/*call*/}},
//		        {text: 'uncertain process',disabled:true,iconCls:'icon-sbgn-pn3',handler: function(button){/*call*/}},
//		        {text: 'association',disabled:true,iconCls:'icon-sbgn-pn4',handler: function(button){/*call*/}},
//		        {text: 'dissociation',disabled:true,iconCls:'icon-sbgn-pn5',handler: function(button){/*call*/}},
//		        {text: 'phenotype',disabled:true,iconCls:'icon-sbgn-pn6',handler: function(button){/*call*/}}
//		        ]
//    	   })
//    });
//
//    this.connectingArcsButton = Ext.create('Ext.button.Button',{
//    	    text : 'Connecting arcs',
//    	    menu: new Ext.menu.Menu({
//                items: [
//                        {text: 'consumption',disabled:true,iconCls:'icon-sbgn-ca1',handler: function(button){/*call*/}},
//                        {text: 'production',disabled:true,iconCls:'icon-sbgn-ca2',handler: function(button){/*call*/}},
//                        {text: 'modulation',disabled:true,iconCls:'icon-sbgn-ca3',handler: function(button){/*call*/}},
//                        {text: 'stimulation',disabled:true,iconCls:'icon-sbgn-ca4',handler: function(button){/*call*/}},
//                   	{text: 'catalysis',disabled:true,iconCls:'icon-sbgn-ca5',handler: function(button){/*call*/}},
//                   	{text: 'inhibition',disabled:true,iconCls:'icon-sbgn-ca6',handler: function(button){/*call*/}},
//                   	{text: 'necessary stimulation',disabled:true,iconCls:'icon-sbgn-ca7',handler: function(button){/*call*/}}
//                   	]
//    	    })
//    });
//    
//    var sbgnLink = Ext.create('Ext.button.Button', {
//    	width:43,
//    	height:20,
//    	margin:'0 3 0 1',
//    	cls:'img-sbgn-logo',
//    	handler:function(){
//    		window.open('http://www.sbgn.org/');
//    	}
//    });
//	
//    var bar = Ext.create('Ext.toolbar.Toolbar', {
//        cls : "bio-toolbar-bot",
//        height : this.height,
//        border : 0,
//        items : [sbgnLink, this.entityNodeButton, this.processNodeButton,this.connectingArcsButton]
//        });
//    return bar;
//
//};
/**********END SBGN*********/
