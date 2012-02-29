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




	this.comboSize = this._createViewMenuButton({
		data : [{name:"1"},{name:"2"},{name:"3"},{name:"4"},{name:"5"},{name:"6"},{name:"7"},{name:"8"},
		        {name:"10"},{name:"12"},{name:"14"},{name:"16"},{name:"18"},{name:"22"},{name:"28"},{name:"36"},{name:"72"}],
		        iconCls:'icon-node-size',
		        tooltip:"Size"
	});
	this.comboSize.view.getSelectionModel().on("selectionchange",function(este,selNodes){
		_this.changeSize(selNodes[0].data.name);
		_this.comboSize.menu.hide();
	});

	this.comboStrokeWidth = this._createViewMenuButton({
		data : [{name:"1"},{name:"2"},{name:"3"},{name:"4"},{name:"5"},{name:"6"},{name:"7"},{name:"8"},
		        {name:"10"},{name:"12"},{name:"14"},{name:"16"},{name:"18"},{name:"22"},{name:"28"},{name:"36"},{name:"72"}],
		        iconCls:'icon-stroke-size',
		        tooltip:"Stroke size"
	});
	this.comboStrokeWidth.view.getSelectionModel().on("selectionchange",function(este,selNodes){
		_this.changeStrokeWidth(selNodes[0].data.name);
//		chromosomeMenu.hide();
	});


	this.comboBoxOpacity = this._createViewMenuButton({
		data : [{name:"none"},{name:"low"},{name:"medium"},{name:"high"},{name:"invisible"}],
		iconCls:'icon-node-opacity',
		tooltip:"Opacity"
	});
	this.comboBoxOpacity.view.getSelectionModel().on("selectionchange",function(este,selNodes){
		_this.changeOpacity(selNodes[0].data.name);
//		chromosomeMenu.hide();
	});


	this.comboBoxEdge = this._createViewMenuButton({
		data : [{name:"directed"},{name:"odirected"},{name:"undirected"},{name:"inhibited"},{name:"dot"},{name:"odot"}],
		iconCls:'icon-edge-type',
		tooltip:"Edge type",
	});
	this.comboBoxEdge.view.getSelectionModel().on("selectionchange",function(este,selNodes){
		_this.changeEdgeShape(selNodes[0].data.name);
//		chromosomeMenu.hide();
	});


	this.comboBoxNode = this._createViewMenuButton({
		data : [{name:"circle"},{name:"square"},{name:"ellipse"},{name:"rectangle"},{name:"rounded"}],
		iconCls:'icon-node-shape',
		tooltip:"Node shape",
	});
	this.comboBoxNode.view.getSelectionModel().on("selectionchange",function(este,selNodes){
		_this.changeShape(selNodes[0].data.name);
//		chromosomeMenu.hide();
	});

	var backgroundButton = Ext.create('Ext.button.Button',{
		iconCls : 'icon-background-option',
		tooltip:"Background settings...",
		handler:function(){
			_this.networkViewer.settingsInteractomeViewer.draw(_this.networkViewer.networkMetaDataViewer.getFormatter());
		}
	});

	this.labelSizeButton = this._createViewMenuButton({
		data : [{name:"None"},{name:"Small"},{name:"Medium"},{name:"Large"},{name:"x-Large"}],
		iconCls : 'icon-label-size',
		tooltip:"Label size..."
	});
	this.labelSizeButton.view.getSelectionModel().on("selectionchange",function(este,selNodes){
		var hash = {"None":0,"Small":8,"Medium":10,"Large":12,"x-Large":16};
		_this.networkViewer.networkWidget.setVerticesFontSize(hash[selNodes[0].data.name]);
//		chromosomeMenu.hide();
	});

	this.layoutButton = this._createViewMenuButton({
		//TODO
		data : [/*{name:"Custom"},*/{name:"dot"},{name:"neato"},{name:"twopi"},{name:"circo"},{name:"fdp"},{name:"sfdp"},{name:"Random"},{name:"Circle"},{name:"Square"}],
		iconCls : 'icon-layout',
		tooltip:"Layout"
	});
	this.layoutButton.view.getSelectionModel().on("selectionchange",function(este,selNodes){
		if(selNodes[0].data.name=="Custom"){
			_this.networkViewer.networkMetaDataViewer.setLayout(new LayoutDataset());
			_this.networkViewer.graphEditorWidget.mainGraphCanvas.render();
		}else{
			_this.networkViewer.networkMetaDataViewer.getLayout().getLayout(selNodes[0].data.name);
		}
//		chromosomeMenu.hide();
	});

	this.collapseButton = Ext.create('Ext.button.Button',{
		iconCls : 'icon-collapse',
		tooltip:"Collapse",
		handler:function(){
			_this.networkViewer.networkWidget.collapse();
		}
	});

	this.selectButton = this._createViewMenuButton({
		//TODO
		data : [{name:"All Vertices"},{name:"All Edges"},{name:"Everything"},{name:"Adjacent"},{name:"Neighbourhood"},{name:"Connected"}],
		iconCls : 'icon-auto-select',
		tooltip:"Select"
	});
	this.selectButton.view.getSelectionModel().on("selectionchange",function(este,selNodes){
		switch(selNodes[0].data.name){
		case 'All Vertices': _this.networkViewer.networkWidget.selectAllNodes();break;
		case 'All Edges': _this.networkViewer.networkWidget.selectAllEdges();break;
		case 'Everything': _this.networkViewer.networkWidget.selectAll();break;
		case 'Adjacent': _this.networkViewer.networkWidget.selectAdjacent();break;
		case 'Neighbourhood': _this.networkViewer.networkWidget.selectNeighbourhood();break;
		case 'Connected': _this.networkViewer.networkWidget.selectConnectedComponent();break;
		}


//		chromosomeMenu.hide();
	});


	var nameLabel = Ext.create('Ext.toolbar.TextItem', {html:'Name:'});
	var sizeLabel = Ext.create('Ext.toolbar.TextItem', {html:'Size:'});
	var strokeWidthLabel = Ext.create('Ext.toolbar.TextItem', {html:'Stroke Width:'});
	var opacityLabel = Ext.create('Ext.toolbar.TextItem', {html:'Opacity:'});
	var edgeLabel = Ext.create('Ext.toolbar.TextItem', {html:'Edge:'});
	var nodeLabel = Ext.create('Ext.toolbar.TextItem', {html:'Node:'});

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
		         backgroundButton,
		         ]
	});
	return editionBar;
};

NetworkEditorBarWidget.prototype._createViewMenuButton = function(config){
	var storeView= Ext.create('Ext.data.Store', {
		fields: ["name"],
		data : config.data
	});
	var view = Ext.create('Ext.view.View', {
		store : storeView,
		selModel: {
			mode: 'SINGLE',
		},
		cls: 'list',
		trackOver: true,
		overItemCls: 'list-item-hover',
		itemSelector: '.chromosome-item', 
		tpl: '<tpl for="."><div style="text-align:left" class="chromosome-item"><span style="margin-left:15px">{name}</span></div></tpl>'
	});
	var container = Ext.create('Ext.container.Container', {
//		width:100,
//		height:300,
		autoScroll:true,
		style:'background-color:#fff',
		items : [view]
	});
	var button = Ext.create('Ext.button.Button', {
		view:view,
		iconCls:config.iconCls,
		tooltip:config.tooltip,
		menu : {items:[container]}
	});
	return button;
};
