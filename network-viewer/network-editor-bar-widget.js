function NetworkEditorBarWidget(networkViewer) {
	this.networkViewer = networkViewer;
};

NetworkEditorBarWidget.prototype.setNetworkSvg = function(networkSvg) {
	var _this = this;
	this.networkSvg = networkSvg;

	this.setNodeButtons({
				"shape" : this.networkSvg.nodeShape,
				"size" : this.networkSvg.nodeSize,
				"color" : this.networkSvg.nodeColor,
				"strokeWidth" : this.networkSvg.nodeStrokeSize,
				"strokeColor" : this.networkSvg.nodeStrokeColor,
				"opacity" : this.networkSvg.nodeOpacity,
				"label" : this.networkSvg.edgeLabel
			});

	this.setEdgeButtons({
				"type" : this.networkSvg.edgeType,
				"label" : this.networkSvg.edgeLabel
			});

	this.networkSvg.onNodeClick.addEventListener(function(sender, args) {
				if (_this.networkSvg.countSelectedNodes == 1) {
					_this.showNodeButtons();
					_this.hideEdgeButtons();
					_this.setNodeButtons(args);
				} else {
					_this.showNodeButtons();
					_this.unsetNodeButtons();
				}
			});

	this.networkSvg.onEdgeClick.addEventListener(function(sender, args) {
				if (_this.networkSvg.countSelectedEdges == 1) {
					_this.showEdgeButtons();
					_this.hideNodeButtons();
					_this.setEdgeButtons(args);
				} else {
					_this.showEdgeButtons();
					_this.unsetEdgeButtons();
				}
			});

	this.networkSvg.onCanvasClick.addEventListener(function(sender, args) {
				if (_this.networkSvg.countSelectedNodes == 1) {
					_this.showNodeButtons();
					_this.hideEdgeButtons();
					_this.setNodeButtons(args);
				} else if (_this.networkSvg.countSelectedNodes > 1) {
					_this.showNodeButtons();
					_this.unsetNodeButtons();
				} else {
					_this.hideNodeButtons();
					_this.hideEdgeButtons();
				}
				
//				Ext.getCmp("selectBtn").
			});
};

NetworkEditorBarWidget.prototype.setNodeButtons = function(args) {
	var shapes = {
		"circle" : 0,
		"square" : 1,
		"ellipse" : 2,
		"rectangle" : 3
	};
	this.comboBoxNode.menu.items.items[shapes[args.shape]].setChecked(true);

	var sizes = {
		"1" : 0,
		"2" : 1,
		"3" : 2,
		"4" : 3,
		"5" : 4,
		"6" : 5,
		"7" : 6,
		"8" : 7,
		"10" : 8,
		"12" : 9,
		"14" : 10,
		"16" : 11,
		"18" : 12,
		"22" : 13,
		"28" : 14,
		"36" : 15,
		"72" : 16
	};
	this.comboSize.menu.items.items[sizes[args.size]].setChecked(true);
	this.comboStrokeWidth.menu.items.items[sizes[args.strokeWidth]]
			.setChecked(true);

	this.innerColorPicker.select(args.color, true);
	this.strokeColorPicker.select(args.strokeColor, true);

	var opacities = {
		"1" : 0,
		"0.8" : 1,
		"0.5" : 2,
		"0.2" : 3,
		"0" : 4
	};
	this.comboBoxOpacity.menu.items.items[opacities[args.opacity]]
			.setChecked(true);

	this.textBoxName.setValue(args.label);
};

NetworkEditorBarWidget.prototype.unsetNodeButtons = function() {
	for (var i = 0, len = this.comboBoxNode.menu.items.items.length; i < len; i++) {
		this.comboBoxNode.menu.items.items[i].setChecked(false);
	}

	for (var i = 0, len = this.comboSize.menu.items.items.length; i < len; i++) {
		this.comboSize.menu.items.items[i].setChecked(false);
	}

	for (var i = 0, len = this.comboStrokeWidth.menu.items.items.length; i < len; i++) {
		this.comboStrokeWidth.menu.items.items[i].setChecked(false);
	}

	this.innerColorPicker.select("#", true);

	this.strokeColorPicker.select("#", true);

	for (var i = 0, len = this.comboBoxOpacity.menu.items.items.length; i < len; i++) {
		this.comboBoxOpacity.menu.items.items[i].setChecked(false);
	}

	this.textBoxName.setValue("");
};

NetworkEditorBarWidget.prototype.showNodeButtons = function() {
	this.textBoxName.enable();
	this.strokeColorPickerButton.enable();
	this.colorPickerButton.enable();
	this.comboBoxOpacity.enable();
	this.comboSize.enable();
	this.comboStrokeWidth.enable();
	this.comboBoxNode.enable();
};

NetworkEditorBarWidget.prototype.setEdgeButtons = function(args) {
	var types = {
		"directed" : 0,
		"odirected" : 1,
		"undirected" : 2,
		"inhibited" : 3,
		"dot" : 4,
		"odot" : 5
	};
	this.comboBoxEdge.menu.items.items[types[args.type]].setChecked(true);

	this.textBoxEdgeName.setValue(args.label);
};

NetworkEditorBarWidget.prototype.unsetEdgeButtons = function() {
	for (var i = 0, len = this.comboStrokeWidth.menu.items.items.length; i < len; i++) {
		this.comboBoxEdge.menu.items.items[i].setChecked(false);
	}

	this.textBoxEdgeName.setValue("");
};

NetworkEditorBarWidget.prototype.showEdgeButtons = function() {
	this.comboBoxEdge.enable();
	this.textBoxEdgeName.enable();
};

NetworkEditorBarWidget.prototype.hideNodeButtons = function() {
	this.textBoxName.disable();
	this.strokeColorPickerButton.disable();
	this.colorPickerButton.disable();
	this.comboBoxOpacity.disable();
	this.comboSize.disable();
	this.comboStrokeWidth.disable();
	this.comboBoxNode.disable();
};

NetworkEditorBarWidget.prototype.hideEdgeButtons = function() {
	this.comboBoxEdge.disable();
	this.textBoxEdgeName.disable();
};

NetworkEditorBarWidget.prototype.onSelect = function() {
	var nodesSelectedCount = this.networkWidget.getSelectedVertices().length;
	var edgesSelectedCount = this.networkWidget.getSelectedEdges().length;

	if ((nodesSelectedCount > 0)) {
		// this.comboBoxEdge.setV([{name:"directed"},{name:"odirected"},{name:"undirected"},{name:"inhibited"},{name:"dot"},{name:"odot"}]);
		this.textBoxName.enable(true);
		if (edgesSelectedCount > 0) {
			this.strokeColorPickerButton.disable(false);
			// this.comboEdgeType.disable(false);
		}
	}

	/** Solo un nodo seleccionado * */
	if ((nodesSelectedCount == 1) && (edgesSelectedCount == 0)) {
		this.textBoxName.enable(true);
		this.strokeColorPickerButton.enable(true);
		this.colorPickerButton.enable(true);
		this.comboBoxNode.enable(true);
		this.comboBoxOpacity.enable(true);
		this.comboBoxEdge.disable(true);
		this.comboSize.enable(true);
		this.comboStrokeWidth.enable(true);
		this.textBoxName.setValue(this.networkWidget.getDataset()
				.getVertexById(this.networkWidget.getSelectedVertices()[0])
				.getName());

		// var x =
		// this.networkWidget.getFormatter().getVertexById(this.networkWidget.getSelectedVertices()[0]).getDefault().getSize();
		// var y = this.comboSize.view.store.findRecord("name",x);
		// this.comboSize.view.getSelectionModel().select([y]);

		// this.comboSize.setValue(this.networkWidget.getFormatter().getVertexById(this.networkWidget.getSelectedVertices()[0]).getDefault().getSize()+"");
	}
	/** Solo una arista seleccionado * */
	if ((nodesSelectedCount == 0) && (edgesSelectedCount >= 1)) {
		// this.textBoxName.enable(true);

		// this.strokeColorPickerButton.disable(false);
		this.colorPickerButton.enable(true);
		this.comboBoxOpacity.enable(true);
		this.comboBoxEdge.enable(true);
		this.comboSize.enable(true);
		this.comboBoxNode.disable(true);
		// this.comboEdgeType.enable(true);
		// this.textBoxName.disable(false);
	}
};

NetworkEditorBarWidget.prototype.changeOpacity = function(opacityString) {
	var opacity = 1;
	switch (opacityString) {
		case "none" :
			opacity = 1;
			break;
		case "low" :
			opacity = 0.8;
			break;
		case "medium" :
			opacity = 0.5;
			break;
		case "high" :
			opacity = 0.2;
			break;
		case "invisible" :
			opacity = 0;
			break;
	}

	this.networkSvg.setNodeOpacity(opacity);
};

NetworkEditorBarWidget.prototype.changeStroke = function(color) {
	for (var i = 0; i < this.networkWidget.getSelectedVertices().length; i++) {
		this.networkWidget.setVertexStroke(this.networkWidget
						.getSelectedVertices()[i], color);
	}
};

NetworkEditorBarWidget.prototype.changeStrokeWidth = function(value) {
	// debugger
	for (var i = 0; i < this.networkWidget.getSelectedVertices().length; i++) {
		this.networkWidget.getFormatter().getVertexById(this.networkWidget
				.getSelectedVertices()[i]).getDefault().setStrokeWidth(value);
	}

	for (var i = 0; i < this.networkWidget.getSelectedEdges().length; i++) {
		// this.networkWidget.getSelectedEdges()[i].getDefault().setStrokeWidth(value);

		this.networkWidget.getFormatter().getEdgeById(this.networkWidget
				.getSelectedEdges()[i]).getDefault().setStrokeWidth(value);
	}

	// for ( var i = 0; i < this.networkWidget.getSelectedVertices().length;
	// i++) {
	// this.networkWidget.setVertexFill(this.networkWidget.getSelectedVertices()[i],
	// color);
	// }

	// for ( var i = 0; i < this.networkWidget.getSelectedEdges().length; i++) {
	// this.networkWidget.setEdgeStroke(this.networkWidget.getSelectedEdges()[i],
	// color);
	// }
};

NetworkEditorBarWidget.prototype.changeColor = function(color) {

	for (var i = 0; i < this.networkWidget.getSelectedVertices().length; i++) {
		this.networkWidget.setVertexFill(this.networkWidget
						.getSelectedVertices()[i], color);
	}

	for (var i = 0; i < this.networkWidget.getSelectedEdges().length; i++) {
		this.networkWidget.setEdgeStroke(
				this.networkWidget.getSelectedEdges()[i], color);
	}
};

NetworkEditorBarWidget.prototype.changeName = function(name) {
	for (var i = 0; i < this.networkWidget.getSelectedVertices().length; i++) {
		this.networkWidget.getDataset().getVertexById(this.networkWidget
				.getSelectedVertices()[i]).setName(name);
	}
};

NetworkEditorBarWidget.prototype.getBar = function() {
	var _this = this;

	this.textBoxName = Ext.create('Ext.form.field.Text', {
				emptyText : 'Node name',
				width : 100,
				enableKeyEvents : true,
				disabled : true,
				listeners : {
					scope : this,
					keyup : function() {
						// this.changeName(this.textBoxName.getValue());
						_this.networkSvg.setNodeLabel(this.textBoxName
								.getValue());
					}
				}
			});

	this.textBoxEdgeName = Ext.create('Ext.form.field.Text', {
				emptyText : 'Edge name',
				width : 100,
				enableKeyEvents : true,
				disabled : true,
				listeners : {
					scope : this,
					keyup : function() {
						_this.networkSvg.setEdgeLabel(this.textBoxEdgeName
								.getValue());
					}
				}
			});

	this.innerColorPicker = Ext.create('Ext.picker.Color', {
				value : '993300',
				listeners : {
					select : function(picker, selColor) {
						_this.networkSvg.setNodeColor("#" + selColor);
						// _this.changeColor("#" + selColor);
					}
				}
			});

	this.colorPickerButton = Ext.create('Ext.button.Button', {
				iconCls : 'icon-fill-color',
				tooltip : "Color",
				disabled : true,
				menu : new Ext.menu.Menu({
							items : this.innerColorPicker
						})
			});

	this.strokeColorPicker = Ext.create('Ext.picker.Color', {
				value : '993300', // initial selected color
				listeners : {
					scope : this,
					select : function(picker, selColor) {
						_this.networkSvg.setNodeStrokeColor("#" + selColor);
						// this.changeStroke("#" + selColor);
					}
				}
			});
	this.strokeColorPickerButton = Ext.create('Ext.button.Button', {
				iconCls : 'icon-stroke-color',
				tooltip : "Stroke color",
				disabled : true,
				menu : new Ext.menu.Menu({
							items : this.strokeColorPicker
						})
			});

	this.comboSizeId = "Size";
	var buttons = this._createButtons({
				group : this.comboSizeId,
				data : [{
							text : "1"
						}, {
							text : "2"
						}, {
							text : "3"
						}, {
							text : "4"
						}, {
							text : "5"
						}, {
							text : "6"
						}, {
							text : "7"
						}, {
							text : "8"
						}, {
							text : "10"
						}, {
							text : "12"
						}, {
							text : "14"
						}, {
							text : "16"
						}, {
							text : "18"
						}, {
							text : "22"
						}, {
							text : "28"
						}, {
							text : "36"
						}, {
							text : "72"
						}]
			});
	this.comboSize = Ext.create('Ext.button.Button', {
				iconCls : 'icon-node-size',
				tooltip : this.comboSizeId,
				disabled : true,
				menu : {
					items : buttons,
					plain : true
				}
			});

	this.comboStrokeWidthId = "Stroke size";
	var buttons = this._createButtons({
				group : this.comboStrokeWidthId,
				data : [{
							text : "1"
						}, {
							text : "2"
						}, {
							text : "3"
						}, {
							text : "4"
						}, {
							text : "5"
						}, {
							text : "6"
						}, {
							text : "7"
						}, {
							text : "8"
						}, {
							text : "10"
						}, {
							text : "12"
						}, {
							text : "14"
						}, {
							text : "16"
						}, {
							text : "18"
						}, {
							text : "22"
						}, {
							text : "28"
						}, {
							text : "36"
						}, {
							text : "72"
						}]
			});
	this.comboStrokeWidth = Ext.create('Ext.button.Button', {
				iconCls : 'icon-stroke-size',
				tooltip : this.comboStrokeWidthId,
				disabled : true,
				menu : {
					items : buttons,
					plain : true
				}
			});

	this.comboBoxOpacityId = "Opacity";
	var buttons = this._createButtons({
				group : this.comboBoxOpacityId,
				data : [{
							text : "none"
						}, {
							text : "low"
						}, {
							text : "medium"
						}, {
							text : "high"
						}, {
							text : "invisible"
						}]
			});
	this.comboBoxOpacity = Ext.create('Ext.button.Button', {
				iconCls : 'icon-node-opacity',
				tooltip : this.comboBoxOpacityId,
				disabled : true,
				menu : {
					items : buttons,
					plain : true
				}
			});

	this.comboBoxEdgeId = "Edge type";
	var buttons = this._createButtons({
				group : this.comboBoxEdgeId,
				data : [{
							text : "directed"
						}, {
							text : "odirected"
						}, {
							text : "undirected"
						}, {
							text : "inhibited"
						}, {
							text : "dot"
						}, {
							text : "odot"
						}]
			});
	this.comboBoxEdge = Ext.create('Ext.button.Button', {
				iconCls : 'icon-edge-type',
				tooltip : this.comboBoxEdgeId,
				disabled : true,
				menu : {
					items : buttons,
					plain : true
				}
			});

	this.comboBoxNodeId = "Node shape";
	var buttons = this._createButtons({
				group : this.comboBoxNodeId,
				data : [{
							text : "circle"
						}, {
							text : "square"
						}, {
							text : "ellipse"
						}, {
							text : "rectangle"
						}]
			});
	this.comboBoxNode = Ext.create('Ext.button.Button', {
				iconCls : 'icon-node-shape',
				tooltip : this.comboBoxNodeId,
				disabled : true,
				menu : {
					items : buttons,
					plain : true
				}
			});

	this.backgroundButton = Ext.create('Ext.button.Button', {
				iconCls : 'icon-background-option',
				tooltip : "Background settings...",
				handler : function() {
					_this.networkSvg.networkBackgroundSettings
							.draw(_this.networkSvg);
				}
			});

	this.labelSizeButtonId = "Label size";
	var buttons = this._createButtons({
				group : this.labelSizeButtonId,
				data : [{
							text : "None"
						}, {
							text : "Small"
						}, {
							text : "Medium"
						}, {
							text : "Large"
						}, {
							text : "x-Large"
						}]
			});
	this.labelSizeButton = Ext.create('Ext.button.Button', {
				iconCls : 'icon-label-size',
				tooltip : this.labelSizeButtonId,
				menu : {
					items : buttons,
					plain : true
				}
			});

	this.layoutButtonId = "Layout";
	var buttons = this._createButtons({
				group : this.layoutButtonId,
				data : [/* {text:"Custom"}, */{
							text : "dot"
						}, {
							text : "neato"
						}, {
							text : "twopi"
						}, {
							text : "circo"
						}, {
							text : "fdp"
						}, {
							text : "sfdp"
						}, {
							text : "Random"
						}, {
							text : "Circle"
						}, {
							text : "Square"
						}]
			});
	this.layoutButton = Ext.create('Ext.button.Button', {
				iconCls : 'icon-layout',
				tooltip : this.layoutButtonId,
				menu : {
					items : buttons,
					plain : true
				}
			});

	this.collapseButton = Ext.create('Ext.button.Button', {
				iconCls : 'icon-collapse',
				tooltip : "Collapse",
				handler : function() {
					_this.networkSvg.collapse();
				}
			});

	this.selectButtonId = "Select";
	var buttons = this._createButtons({
				group : this.selectButtonId,
				data : [{
							text : "All Nodes"
						}, {
							text : "All Edges"
						}, {
							text : "Everything"
						}, {
							text : "Adjacent"
						}, {
							text : "Neighbourhood"
						}, {
							text : "Connected"
						}]
			});
	this.selectButton = Ext.create('Ext.button.Button', {
				iconCls : 'icon-auto-select',
				tooltip : this.selectButtonId,
				menu : {
					items : buttons,
					plain : true
				}
			});

	// var nameLabel = Ext.create('Ext.toolbar.TextItem', {html:'Name:'});
	// var sizeLabel = Ext.create('Ext.toolbar.TextItem', {html:'Size:'});
	// var strokeWidthLabel = Ext.create('Ext.toolbar.TextItem', {html:'Stroke
	// Width:'});
	// var opacityLabel = Ext.create('Ext.toolbar.TextItem', {html:'Opacity:'});
	// var edgeLabel = Ext.create('Ext.toolbar.TextItem', {html:'Edge:'});
	// var nodeLabel = Ext.create('Ext.toolbar.TextItem', {html:'Node:'});

	var editionBar = Ext.create('Ext.toolbar.Toolbar', {
				cls : "bio-toolbar-bot",
				height : 35,
				border : true,
				items : [
						{
							id : 'selectBtn',
							iconCls : 'icon-mouse-select',
							tooltip : 'Select',
							toggleGroup : 'action',
							pressed : 'true',
							handler : function() {
								this.toggle(true);
								_this.hideNodeButtons();
								_this.hideEdgeButtons();
								_this.networkViewer.handleActionMenu("select");
							}
						},
						'-',
						{
							iconCls : 'icon-add',
							tooltip : 'Add node',
							toggleGroup : 'action',
							handler : function() {
								this.toggle(true);
								_this.showNodeButtons();
								_this.hideEdgeButtons();
								_this.networkViewer.handleActionMenu("add");
							}
						},
						{
							iconCls : 'icon-link',
							tooltip : 'Join nodes',
							toggleGroup : 'action',
							handler : function() {
								this.toggle(true);
								_this.hideNodeButtons();
								_this.showEdgeButtons();
								_this.networkViewer.handleActionMenu("join");
							}
						},
						{
							iconCls : 'icon-delete',
							tooltip : 'Delete',
							toggleGroup : 'action',
							handler : function() {
								this.toggle(true);
								_this.hideNodeButtons();
								_this.hideEdgeButtons();
								_this.networkViewer.handleActionMenu("delete");
							}
						},

						// this.collapseButton,
						// this.layoutButton,
						// this.labelSizeButton,
						// this.selectButton,
						"-", this.comboBoxNode, this.comboSize,
						this.colorPickerButton, this.comboStrokeWidth,
						this.strokeColorPickerButton, this.comboBoxOpacity,
						this.textBoxName, this.comboBoxEdge,
						this.textBoxEdgeName
				// "-",
				// backgroundButton
				]
			});
	return editionBar;
};

NetworkEditorBarWidget.prototype._createButtons = function(config) {
	var _this = this;
	var buttons = new Array();
	for (var i = 0; i < config.data.length; i++) {
		var btn = {
			// xtype:'button',
			xtype : 'menucheckitem',
			text : config.data[i].text,
			// checked:false,
			// cls:"bio-toolbar greyborder",
			// overCls:"list-item-hover",
			group : config.group, // only one pressed
			handler : function(este) {
				_this._handleButtons({
							text : este.text,
							parent : config.group
						});
			}
		};
		buttons.push(btn);
	}
	return buttons;
};

NetworkEditorBarWidget.prototype._handleButtons = function(config) {
	var _this = this;
	switch (config.parent) {
		case this.selectButtonId :
			switch (config.text) {
				case 'All Nodes' :
					_this.networkSvg.selectAllNodes();
					break;
				case 'All Edges' :
					_this.networkSvg.selectAllEdges();
					break;
				case 'Everything' :
					_this.networkSvg.selectAll();
					break;
				case 'Adjacent' :
					_this.networkSvg.selectAdjacentNodes();
					break;
				case 'Neighbourhood' :
					_this.networkSvg.selectNeighbourhood();
					break;
				case 'Connected' :
					_this.networkSvg.selectConnectedNodes();
					break;
				default :
					console.log(config.text + " not yet defined");
			}
			break;

		case this.layoutButtonId :
			_this.networkViewer.setLayout(config.text);
			break;
		case this.labelSizeButtonId :
			var hash = {
				"None" : 0,
				"Small" : 8,
				"Medium" : 10,
				"Large" : 12,
				"x-Large" : 16
			};
			_this.networkSvg.setLabelSize(hash[config.text]);
			break;

		case this.comboBoxNodeId :
			_this.networkSvg.setNodeShape(config.text);
			break;
		case this.comboBoxEdgeId :
			_this.networkSvg.setEdgeType(config.text);
			break;
		case this.comboSizeId :
			_this.networkSvg.setNodeSize(config.text);
			break;
		case this.comboStrokeWidthId :
			_this.networkSvg.setNodeStrokeSize(config.text);
			break;
		case this.comboBoxOpacityId :
			_this.changeOpacity(config.text);
			break;

		default :
			console.log(config.parent + " not yet defined");
	}
};