function NetworkEditorBarWidget(networkViewer){
	this.networkViewer = networkViewer;
};

NetworkEditorBarWidget.prototype.changeEdgeShape = function(value){
	var classe = "DirectedLineEdgeNetworkFormatter";
	if (value == "DirectedLineEdgeNetworkFormatter"){
		classe = "DirectedLineEdgeNetworkFormatter";
	}
	if (value == "undirected"){
		classe = "LineEdgeNetworkFormatter";
	}
	if (value == "inhibited"){
		classe = "CutDirectedLineEdgeNetworkFormatter";
	}
	if (value == "dot"){
		classe = "DotDirectedLineEdgeNetworkFormatter";
	}

	if (value == "odot"){
		classe = "OdotDirectedLineEdgeNetworkFormatter";
	}
	if (value == "odirected"){
		classe = "OdirectedLineEdgeNetworkFormatter";
	}
	for ( var i = 0; i < this.networkWidget.getSelectedEdges().length; i++) {
		this.networkWidget.getFormatter().changeEdgeType(this.networkWidget.getSelectedEdges()[i], classe);
	}
};

NetworkEditorBarWidget.prototype.changeShape = function(value){
	var classe = "CircleNetworkNodeFormatter";
	switch (value){
	case "square": classe = "SquareVertexNetworkFormatter"; break;
	case "circle": classe = "CircleVertexNetworkFormatter";  break;
	case "ellipse": classe = "EllipseVertexNetworkFormatter";  break;
	case "rectangle": classe = "RectangleVertexNetworkFormatter";  break;
	case "rounded": classe = "RoundedVertexNetworkFormatter";  break;
//	case "octagon": classe = "OctagonVertexNetworkFormatter";  break;
	default: classe = "CircleNetworkNodeFormatter";
	}
	for ( var i = 0; i < this.networkWidget.getSelectedVertices().length; i++) {
		this.networkWidget.getFormatter().changeNodeType(this.networkWidget.getSelectedVertices()[i], classe);
	}
};


NetworkEditorBarWidget.prototype.changeOpacity = function(opacityString){
	var opacity = 1;
	if (opacityString == "none"){
		opacity = 1;
	}
	if (opacityString == "low"){
		opacity = 0.8;
	}
	if (opacityString == "medium"){
		opacity = 0.5;
	}
	if (opacityString == "high"){
		opacity = 0.2;
	}
	if (opacityString == "invisible"){
		opacity = 0;
	}

	for ( var i = 0; i < this.networkWidget.getSelectedVertices().length; i++) {
		this.networkWidget.setVertexOpacity(this.networkWidget.getSelectedVertices()[i], opacity);
	}

	for ( var i = 0; i < this.networkWidget.getSelectedEdges().length; i++) {
		this.networkWidget.setEdgeStrokeOpacity(this.networkWidget.getSelectedEdges()[i], opacity);
	}
};

NetworkEditorBarWidget.prototype.setNetworkWidget = function(networkWidget){
	var _this = this;
	this.networkWidget = networkWidget;

	this.networkWidget.onVertexSelect.addEventListener(function (sender, id){
		_this.onSelect();
	});

	this.networkWidget.onEdgeSelect.addEventListener(function (sender, id){
		_this.onSelect();
	});

	this.networkWidget.onCanvasClicked.addEventListener(function (sender, id){
		_this.deselect();
	});

	this.deselect();
};

NetworkEditorBarWidget.prototype.changeSize = function(size){
	for ( var i = 0; i < this.networkWidget.getSelectedVertices().length; i++) {
		this.networkWidget.getFormatter().getVertexById(this.networkWidget.getSelectedVertices()[i]).getDefault().setSize(size);
		this.networkWidget.getFormatter().getVertexById(this.networkWidget.getSelectedVertices()[i]).getSelected().setSize(size);
		this.networkWidget.getFormatter().getVertexById(this.networkWidget.getSelectedVertices()[i]).getOver().setSize(size);
		this.networkWidget.getFormatter().getVertexById(this.networkWidget.getSelectedVertices()[i]).getDragging().setSize(size);
	}

	for ( var i = 0; i < this.networkWidget.getSelectedEdges().length; i++) {
		this.networkWidget.getFormatter().getEdgeById( this.networkWidget.getSelectedEdges()[i]).getDefault().setStrokeWidth(size);
		this.networkWidget.getFormatter().getEdgeById( this.networkWidget.getSelectedEdges()[i]).getSelected().setStrokeWidth(size);
		this.networkWidget.getFormatter().getEdgeById( this.networkWidget.getSelectedEdges()[i]).getOver().setStrokeWidth(size);
		this.networkWidget.getFormatter().getEdgeById( this.networkWidget.getSelectedEdges()[i]).getDragging().setStrokeWidth(size);
	}
};

NetworkEditorBarWidget.prototype.deselect = function(){
	this.textBoxName.disable(true);
	this.strokeColorPickerButton.disable(true);
	this.colorPickerButton.disable(true);
	this.comboBoxOpacity.disable(true);
	this.comboSize.disable(true);
	this.comboBoxEdge.disable(true);
	this.comboStrokeWidth.disable(true);
	this.comboBoxNode.disable(true);
};

NetworkEditorBarWidget.prototype.onSelect = function(){
	var nodesSelectedCount = this.networkWidget.getSelectedVertices().length;
	var edgesSelectedCount =  this.networkWidget.getSelectedEdges().length;

	if ((nodesSelectedCount > 0)){
//		this.comboBoxEdge.setV([{name:"directed"},{name:"odirected"},{name:"undirected"},{name:"inhibited"},{name:"dot"},{name:"odot"}]);
		this.textBoxName.enable(true);
		if (edgesSelectedCount >0){
			this.strokeColorPickerButton.disable(false);
//			this.comboEdgeType.disable(false);
		}
	}

	/** Solo un nodo seleccionado **/
	if ((nodesSelectedCount == 1)&&(edgesSelectedCount == 0)){
		this.textBoxName.enable(true);
		this.strokeColorPickerButton.enable(true);
		this.colorPickerButton.enable(true);
		this.comboBoxNode.enable(true);
		this.comboBoxOpacity.enable(true);
		this.comboBoxEdge.disable(true);
		this.comboSize.enable(true);
		this.comboStrokeWidth.enable(true);
		this.textBoxName.setValue(this.networkWidget.getDataset().getVertexById(this.networkWidget.getSelectedVertices()[0]).getName());

//		var x = this.networkWidget.getFormatter().getVertexById(this.networkWidget.getSelectedVertices()[0]).getDefault().getSize();
//		var y = this.comboSize.view.store.findRecord("name",x);
//		this.comboSize.view.getSelectionModel().select([y]);

//		this.comboSize.setValue(this.networkWidget.getFormatter().getVertexById(this.networkWidget.getSelectedVertices()[0]).getDefault().getSize()+"");
	}
	/** Solo una arista seleccionado **/
	if ((nodesSelectedCount == 0)&&(edgesSelectedCount >= 1)){
//		this.textBoxName.enable(true);

		//	this.strokeColorPickerButton.disable(false);
		this.colorPickerButton.enable(true);
		this.comboBoxOpacity.enable(true);
		this.comboBoxEdge.enable(true);
		this.comboSize.enable(true);
		this.comboBoxNode.disable(true);
		//	this.comboEdgeType.enable(true);
		//	this.textBoxName.disable(false);
	}
};

NetworkEditorBarWidget.prototype.changeStroke = function(color){
	for ( var i = 0; i < this.networkWidget.getSelectedVertices().length; i++) {
		this.networkWidget.setVertexStroke(this.networkWidget.getSelectedVertices()[i], color);
	}
};

NetworkEditorBarWidget.prototype.changeStrokeWidth = function(value){
//	debugger
	for ( var i = 0; i < this.networkWidget.getSelectedVertices().length; i++) {
		this.networkWidget.getFormatter().getVertexById( this.networkWidget.getSelectedVertices()[i]).getDefault().setStrokeWidth(value);
	}

	for ( var i = 0; i < this.networkWidget.getSelectedEdges().length; i++) {
//		this.networkWidget.getSelectedEdges()[i].getDefault().setStrokeWidth(value);

		this.networkWidget.getFormatter().getEdgeById(this.networkWidget.getSelectedEdges()[i]).getDefault().setStrokeWidth(value);
	}

//	for ( var i = 0; i < this.networkWidget.getSelectedVertices().length; i++) {
//	this.networkWidget.setVertexFill(this.networkWidget.getSelectedVertices()[i], color);
//	}

//	for ( var i = 0; i < this.networkWidget.getSelectedEdges().length; i++) {
//	this.networkWidget.setEdgeStroke(this.networkWidget.getSelectedEdges()[i], color);
//	}
};

NetworkEditorBarWidget.prototype.changeColor = function(color){

	for ( var i = 0; i < this.networkWidget.getSelectedVertices().length; i++) {
		this.networkWidget.setVertexFill(this.networkWidget.getSelectedVertices()[i], color);
	}

	for ( var i = 0; i < this.networkWidget.getSelectedEdges().length; i++) {
		this.networkWidget.setEdgeStroke(this.networkWidget.getSelectedEdges()[i], color);
	}
};

NetworkEditorBarWidget.prototype.changeName = function(name){
	for ( var i = 0; i < this.networkWidget.getSelectedVertices().length; i++) {
		this.networkWidget.getDataset().getVertexById(this.networkWidget.getSelectedVertices()[i]).setName(name);
	}
};

NetworkEditorBarWidget.prototype.getBar = function(){
	var _this = this;

	this.textBoxName = Ext.create('Ext.form.field.Text',{
		emptyText: 'Node name',
		width:100,
		enableKeyEvents:true,
		listeners:{
			scope:this,
			keyup:function() {
				this.changeName(this.textBoxName.getValue());
			}
		}
	});

	var innerColorPicker = Ext.create('Ext.picker.Color', {
		value: '993300',
		listeners: {
			select: function(picker, selColor) {
				_this.changeColor("#" + selColor);
			}
		}
	});

	this.colorPickerButton = Ext.create('Ext.button.Button',{
		iconCls : 'icon-fill-color',
		tooltip:"Color",
		menu: new Ext.menu.Menu({
			items: innerColorPicker
		})
	});

	var strokeColorPickerButton = Ext.create('Ext.picker.Color', {
		value: '993300',  // initial selected color
		listeners: {
			scope:this,
			select: function(picker, selColor) {
				this.changeStroke("#" + selColor);
			}
		}
	});
	this.strokeColorPickerButton = Ext.create('Ext.button.Button',{
		iconCls : 'icon-stroke-color',
		tooltip:"Stroke color",
		menu: new Ext.menu.Menu({
			items: strokeColorPickerButton
		})
	});

	
	this.comboSizeId = "Size";
	var buttons = this._createButtons({
		group:this.comboSizeId,
		data:[{text:"1"},{text:"2"},{text:"3"},{text:"4"},{text:"5"},{text:"6"},{text:"7"},{text:"8"},
		      {text:"10"},{text:"12"},{text:"14"},{text:"16"},{text:"18"},{text:"22"},{text:"28"},{text:"36"},{text:"72"}]
	});
	this.comboSize = Ext.create('Ext.button.Button', {
		iconCls : 'icon-node-size',
		tooltip:this.comboSizeId,
		menu : {items:buttons,plain:true}
	});
	
	
	this.comboStrokeWidthId = "Stroke size";
	var buttons = this._createButtons({
		group:this.comboStrokeWidthId,
		data:[{text:"1"},{text:"2"},{text:"3"},{text:"4"},{text:"5"},{text:"6"},{text:"7"},{text:"8"},
		      {text:"10"},{text:"12"},{text:"14"},{text:"16"},{text:"18"},{text:"22"},{text:"28"},{text:"36"},{text:"72"}]
	});
	this.comboStrokeWidth = Ext.create('Ext.button.Button', {
		iconCls : 'icon-stroke-size',
		tooltip:this.comboStrokeWidthId,
		menu : {items:buttons,plain:true}
	});
	
	
	this.comboBoxOpacityId = "Opacity";
	var buttons = this._createButtons({
		group:this.comboBoxOpacityId,
		data:[{text:"none"},{text:"low"},{text:"medium"},{text:"high"},{text:"invisible"}]
	});
	this.comboBoxOpacity = Ext.create('Ext.button.Button', {
		iconCls : 'icon-node-opacity',
		tooltip:this.comboBoxOpacityId,
		menu : {items:buttons,plain:true}
	});



	this.comboBoxEdgeId = "Edge type";
	var buttons = this._createButtons({
		group:this.comboBoxEdgeId,
		data:[{text:"directed"},{text:"odirected"},{text:"undirected"},{text:"inhibited"},{text:"dot"},{text:"odot"}]
	});
	this.comboBoxEdge = Ext.create('Ext.button.Button', {
		iconCls : 'icon-edge-type',
		tooltip:this.comboBoxEdgeId,
		menu : {items:buttons,plain:true}
	});
	

	this.comboBoxNodeId = "Node shape";
	var buttons = this._createButtons({
		group:this.comboBoxNodeId,
		data:[{text:"circle"},{text:"square"},{text:"ellipse"},{text:"rectangle"},{text:"rounded"}]
	});
	this.comboBoxNode = Ext.create('Ext.button.Button', {
		iconCls : 'icon-node-shape',
		tooltip:this.comboBoxNodeId,
		menu : {items:buttons,plain:true}
	});
	
	
	var backgroundButton = Ext.create('Ext.button.Button',{
		iconCls : 'icon-background-option',
		tooltip:"Background settings...",
		handler:function(){
			_this.networkViewer.settingsInteractomeViewer.draw(_this.networkViewer.networkMetaDataViewer.getFormatter());
		}
	});


	this.labelSizeButtonId = "Label size";
	var buttons = this._createButtons({
		group:this.labelSizeButtonId,
		data:[{text:"None"},{text:"Small"},{text:"Medium"},{text:"Large"},{text:"x-Large"}]
	});
	this.labelSizeButton = Ext.create('Ext.button.Button', {
		iconCls : 'icon-label-size',
		tooltip:this.labelSizeButtonId,
		menu : {items:buttons,plain:true}
	});

	
	this.layoutButtonId = "Layout";
	var buttons = this._createButtons({
		group:this.layoutButtonId,
		data:[/*{text:"Custom"},*/{text:"dot"},{text:"neato"},{text:"twopi"},{text:"circo"},{text:"fdp"},{text:"sfdp"},{text:"Random"},{text:"Circle"},{text:"Square"}]
	});
	this.layoutButton = Ext.create('Ext.button.Button', {
		iconCls : 'icon-layout',
		tooltip:this.layoutButtonId,
		menu : {items:buttons,plain:true}
	});
	
	
	this.collapseButton = Ext.create('Ext.button.Button',{
		iconCls : 'icon-collapse',
		tooltip:"Collapse",
		handler:function(){
			_this.networkViewer.networkWidget.collapse();
		}
	});


	
	this.selectButtonId = "Select";
	var buttons = this._createButtons({
		group:this.selectButtonId,
		data:[{text:"All Vertices"},{text:"All Edges"},{text:"Everything"},{text:"Adjacent"},{text:"Neighbourhood"},{text:"Connected"}]
	});
	this.selectButton = Ext.create('Ext.button.Button', {
		iconCls : 'icon-auto-select',
		tooltip:this.selectButtonId,
		menu : {items:buttons,plain:true}
	});


//	var nameLabel = Ext.create('Ext.toolbar.TextItem', {html:'Name:'});
//	var sizeLabel = Ext.create('Ext.toolbar.TextItem', {html:'Size:'});
//	var strokeWidthLabel = Ext.create('Ext.toolbar.TextItem', {html:'Stroke Width:'});
//	var opacityLabel = Ext.create('Ext.toolbar.TextItem', {html:'Opacity:'});
//	var edgeLabel = Ext.create('Ext.toolbar.TextItem', {html:'Edge:'});
//	var nodeLabel = Ext.create('Ext.toolbar.TextItem', {html:'Node:'});

	var editionBar = Ext.create('Ext.toolbar.Toolbar', {
		cls : "bio-toolbar-bot",
		height : 35,
		border : 0,
		items : [
		         {
		        	 iconCls : 'icon-select', tooltip : 'Select', handler :function() {
		        		 _this.networkViewer.handleActionMenu("select");
		        	 }
		         },
		         {
		        	 iconCls : 'icon-drag', tooltip : 'Drag', handler : function() {
		        		 _this.networkViewer.handleActionMenu("drag");
		        	 }
		         },'-',
		         {
		        	 iconCls : 'icon-add',tooltip : 'Add', handler : function() {
		        		 _this.networkViewer.handleActionMenu("add");
		        	 }
		         },
		         {
		        	 iconCls : 'icon-link',tooltip : 'Join', handler : function() {
		        		 _this.networkViewer.handleActionMenu("join");
		        	 }
		         },
		         {
		        	 iconCls : 'icon-delete', tooltip : 'Delete', handler : function() {
		        		 _this.networkViewer.handleActionMenu("delete");
		        	 }
		         },


//		         this.collapseButton,
//		         this.layoutButton,
//		         this.labelSizeButton,
//		         this.selectButton,
		         "-",
		         this.comboBoxNode,
		         this.comboSize,
		         this.colorPickerButton,
		         this.comboStrokeWidth,
		         this.strokeColorPickerButton,
		         this.comboBoxOpacity,
		         this.comboBoxEdge,
		         this.textBoxName,
		         "-",
		         backgroundButton
		         ]
	});
	return editionBar;
};

NetworkEditorBarWidget.prototype._createButtons = function(config){
	var _this=this;
	var buttons = new Array();
	for ( var i = 0; i < config.data.length; i++) {
		var btn = {
//			xtype:'button',
//			xtype: 'menucheckitem',
			text : config.data[i].text,
			checked:false,
//			cls:"bio-toolbar greyborder",
//			overCls:"list-item-hover",
			group:config.group, //only one pressed
			handler: function(este){
				_this._handleButtons({text:este.text,parent:config.group});
			}
		};
		buttons.push(btn);
	}
	return buttons;
};

NetworkEditorBarWidget.prototype._handleButtons = function(config){
	var _this=this;
	switch(config.parent){
		case this.selectButtonId:
			switch(config.text){
				case 'All Vertices': _this.networkViewer.networkWidget.selectAllNodes();break;
				case 'All Edges': _this.networkViewer.networkWidget.selectAllEdges();break;
				case 'Everything': _this.networkViewer.networkWidget.selectAll();break;
				case 'Adjacent': _this.networkViewer.networkWidget.selectAdjacent();break;
				case 'Neighbourhood': _this.networkViewer.networkWidget.selectNeighbourhood();break;
				case 'Connected': _this.networkViewer.networkWidget.selectConnectedComponent();break;
				default: console.log(config.text+" not yet defined");
			}
		break;
				
		case this.layoutButtonId:
			if(config.text=="Custom"){
				_this.networkViewer.networkMetaDataViewer.setLayout(new LayoutDataset());
				_this.networkViewer.graphEditorWidget.mainGraphCanvas.render();
			}else{
				_this.networkViewer.networkMetaDataViewer.getLayout().getLayout(config.text);
			}
		break;
		case this.labelSizeButtonId:
			var hash = {"None":0,"Small":8,"Medium":10,"Large":12,"x-Large":16};
			_this.networkViewer.networkWidget.setVerticesFontSize(hash[config.text]);
//			chromosomeMenu.hide();
		break;
		
		case this.comboBoxNodeId:		_this.changeShape(config.text);	break;
		case this.comboBoxEdgeId:		_this.changeEdgeShape(config.text);	break;
		case this.comboSizeId:			_this.changeSize(config.text);	break;
		case this.comboStrokeWidthId:	_this.changeStrokeWidth(config.text);	break;
		case this.comboBoxOpacityId:	_this.changeOpacity(config.text);	break;
		
		default: console.log(config.parent+" not yet defined");
	}
};