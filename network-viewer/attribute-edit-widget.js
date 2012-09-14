function AttributeEditWidget(attributeManager) {
	this.id = Math.round(Math.random() * 10000000);
	
	var _this = this;
	this.attrMan = attributeManager;
	this.grid;

	this.attrMan.store.on('datachanged', function(){
		if(Ext.getCmp("editAttrWindow")){
			_this.updateNumRowsLabel();
		}
	});
};

AttributeEditWidget.prototype.draw = function(selectedNodes) {
	var _this = this;

	var attrNameStore = Ext.create('Ext.data.Store', {
		id : this.id + "attrNameStore",
		fields: ['name'],
		data: this.getAttributeNames()
	});
	
	var modifyRowsFormPanel = Ext.create('Ext.form.Panel', {
		border: false,
		bodyStyle: 'background: #dedcd8',
		bodyPadding: "10 5 10 5",
		layout: 'hbox',
		items: [
		        {
		        	xtype: 'text',
		        	margin: "4 0 0 0",
		        	text: 'New value'
		        },
		        {
		        	xtype : 'textfield',
		        	id : this.id + "newValue",
		        	width : 120,
		        	margin: "0 0 0 10",
		        	allowBlank : false
		        },
		        {
		        	xtype: 'text',
		        	margin: "4 0 0 10",
		        	text: 'for attribute'
		        },
		        {
		        	xtype: 'combo',
		        	id: this.id + "selectedAttr",
		        	margin: "0 0 0 10",
		        	width: 120,
		        	allowBlank: false,
		        	mode: 'local',
		        	editable: false,
		        	displayField: 'name',
		        	valueField: 'name',
		        	store: attrNameStore
		        },
		        {
		        	xtype: 'text',
		        	margin: "4 0 0 10",
		        	text: 'for selected rows.'
		        },
		        {
		        	xtype: 'button',
		        	text: 'Modify',
		        	margin: "0 15 0 20",
		        	formBind: true, // only enabled if the form is valid
		        	disabled: true,
		        	handler: function() {
		        		var newValue = Ext.getCmp(_this.id + "newValue").getValue();
		        		var selectedAttr = Ext.getCmp(_this.id + "selectedAttr").getValue();
		        		var selectedRows = _this.grid.getSelectionModel().getSelection();

						_this.attrMan.modifyAttributeOfRows(selectedRows, selectedAttr, newValue);
		        	}
		        }
       ]
	});
	
	var attrSelected;
	
	var editAttrFormPanel = Ext.create('Ext.form.Panel', {
		border: false,
		bodyStyle: 'background: #dedcd8',
		bodyPadding: "10 5 10 5",
		layout: 'hbox',
		items: [
		        {
		        	xtype: 'text',
		        	margin: "4 0 0 0",
		        	text: 'Attr. name:'
		        },
		        {
		        	xtype: 'combo',
		        	id: this.id + "attrName",
		        	margin: "0 0 0 3",
		        	width: 100,
		        	allowBlank: false,
		        	mode: 'local',
		        	editable: true,
		        	displayField: 'name',
		        	valueField: 'name',
		        	store: attrNameStore,
		        	listeners: {
		        		select: function(combo, record, index) {
		        			// set other fields
		        			for ( var i = 0; i < _this.attrMan.fieldsModel.length; i++) {
		        				if(combo.getValue() == _this.attrMan.fieldsModel[i].name) {
		        					attrSelected = combo.getValue();
		        					Ext.getCmp(_this.id + "attrType").setValue(_this.attrMan.fieldsModel[i].type);
		        					Ext.getCmp(_this.id + "attrDefault").setValue(_this.attrMan.fieldsModel[i].defaultValue);
		        					break;
		        				}
		        			}
		        		}
		        	}
		        },
		        {
		        	xtype: 'text',
		        	margin: "4 0 0 8",
		        	text: 'Type:'
		        },
		        {
		        	xtype : 'combo',
		        	id : this.id + "attrType",
		        	combineErrors : true,
		        	msgTarget : 'side',
		        	width : 100,
		        	mode : 'local',
		        	value : 'string',
		        	editable : false,
		        	margin: "0 0 0 3",
		        	displayField : 'name',
		        	valueField : 'value',
		        	store : Ext.create('Ext.data.Store', {
		        		fields : [ 'name', 'value' ],
		        		data : [ {
		        			name : 'Number',
		        			value : 'number'
		        		}, {
		        			name : 'String',
		        			value : 'string'
		        		}, {
		        			name : 'Boolean',
		        			value : 'bool'
		        		} ]
		        	})
		        },
		        {
		        	xtype: 'text',
		        	margin: "4 0 0 8",
		        	text: 'Default value:'
		        },
		        {
		        	xtype : 'textfield',
		        	id : this.id + "attrDefault",
		        	width : 100,
		        	margin: "0 5 0 3",
		        	allowBlank : false
		        },
		        {
		        	xtype: 'button',
//		        	text: 'Add',
		        	tooltip: "Add attribute",
		        	iconCls: 'icon-add',
		        	margin: "0 0 0 5",
		        	formBind: true, // only enabled if the form is valid
		        	disabled: true,
		        	handler: function() {
		        		var name = Ext.getCmp(_this.id + "attrName").getValue();
		        		var type = Ext.getCmp(_this.id + "attrType").getValue();
		        		var defaultValue = Ext.getCmp(_this.id + "attrDefault").getValue();

		        		if(_this.attrMan.addAttribute(name, type, defaultValue)) {
		        			_this.grid.reconfigure(null, _this.attrMan.columnsGrid);

		        			// set default value for new attribute in existing rows
		        			if(_this.attrMan.getNumberOfRows() > 0) {
		        				_this.grid.getSelectionModel().selectAll();
		        				_this.attrMan.modifyAttributeOfRows(_this.grid.getSelectionModel().getSelection(), _this.attrMan.attributes[_this.attrMan.attributes.length-1], defaultValue);
		        				_this.grid.getSelectionModel().deselectAll();
		        			}

		        			attrNameStore.loadData(_this.getAttributeNames());
		        		}
		        		else {
		        			Ext.Msg.show({
		        				title:"Error",
		        				msg: "Already exists an attribute with this name.",
		        				buttons: Ext.Msg.OK,
		        				icon: Ext.Msg.ERROR
		        			});
		        		}
		        	}
		        },
		        {
		        	xtype : 'button',
//		        	text: 'Save',
		        	tooltip: "Save changes for this attribute",
		        	iconCls : 'icon-save',
		        	margin: "0 0 0 5",
		        	formBind: true, // only enabled if the form is valid
		        	disabled: true,
		        	handler: function() {
		        		var newName = Ext.getCmp(_this.id + "attrName").getValue();
		        		var type = Ext.getCmp(_this.id + "attrType").getValue();
		        		var defaultValue = Ext.getCmp(_this.id + "attrDefault").getValue();

		        		if(_this.attrMan.updateAttribute(attrSelected, newName, type, defaultValue)) {
		        			_this.grid.reconfigure(null, _this.attrMan.columnsGrid);

		        			attrNameStore.loadData(_this.getAttributeNames());
		        		}
		        		else {
		        			Ext.Msg.show({
		        				title:"Error",
		        				msg: "Imposible to save changes.",
		        				buttons: Ext.Msg.OK,
		        				icon: Ext.Msg.ERROR
		        			});
		        		}
		        	}
		        },
		        {
		        	xtype : 'button',
//		        	text: 'Del.',
		        	tooltip: "Remove this attribute",
		        	iconCls : 'icon-delete',
		        	margin: "0 10 0 5",
		        	formBind: true, // only enabled if the form is valid
		        	disabled: true,
		        	handler: function() {
		        		var name = Ext.getCmp(_this.id + "attrName").getValue();

		        		if(_this.attrMan.removeAttribute(name)) {
		        			_this.grid.reconfigure(null, _this.attrMan.columnsGrid);
		        			attrNameStore.loadData(_this.getAttributeNames());

		        			Ext.getCmp(_this.id + "attrName").reset();
		        			Ext.getCmp(_this.id + "attrType").reset();
		        			Ext.getCmp(_this.id + "attrDefault").reset();
		        		}
		        		else {
		        			Ext.Msg.show({
		        				title:"Error",
		        				msg: "Imposible to delete this attribute.",
		        				buttons: Ext.Msg.OK,
		        				icon: Ext.Msg.ERROR
		        			});
		        		}
		        	}
		        }
       ]
	});
	
	this.grid = Ext.create('Ext.grid.Panel', {
		store: this.attrMan.store,
		columns: this.attrMan.columnsGrid, 
		height: 400,
		width: 400,
		selModel: { 	
			selType: 'rowmodel',
			mode: 'MULTI'
		},
		border: 0,
		dockedItems: [
		              {
		            	  xtype: 'toolbar',
		            	  dock: 'bottom',
		            	  items: [
		            	          {
		            	        	  xtype : 'tbtext',
		            	        	  id : this.id + "numRowsLabel"
		            	          } 
		            	          ]
		              },
		              {
		            	  xtype : 'toolbar',
		            	  dock : 'bottom',
		            	  items : modifyRowsFormPanel
		              },
		              {
		            	  xtype: 'toolbar',
		            	  dock: 'top',
		            	  layout: {
		            		  pack: 'hbox'
		            	  },
		            	  items : editAttrFormPanel
		              }
		],
		plugins : [
		           // double click to edit cell
		           Ext.create('Ext.grid.plugin.CellEditing', {
		        	   clicksToEdit : 2
		           })
		],
		renderTo : Ext.getBody(),
		listeners: {
			afterrender: function() {
				var menu = this.headerCt.getMenu();
				menu.add([{
					text: 'Reset to default',
					handler: function() {
						var columnDataIndex = menu.activeHeader.dataIndex;
						alert('custom item for column "'+columnDataIndex+'" was pressed');
					}
				}]);           
			}
		}
	});

	Ext.create('Ext.window.Window', {
		id : "editAttrWindow",
		title : "Edit attributes",
		height : 450,
		width : 600,
		layout : "fit",
		items : this.grid
	}).show();

	this.selectRowsById(selectedNodes);
	this.updateNumRowsLabel();
};

//XXX DEPRECATED
AttributeEditWidget.prototype.addAttribute = function() {
	var _this = this;
	
	var items = [
	             {
	            	 xtype: 'textfield',
	            	 id: this.id + "newAttrName",
	            	 fieldLabel: 'Name',
	            	 allowBlank: false
	             },
	             {
	            	 id : this.id + "newAttrType",
	            	 combineErrors : true,
	            	 msgTarget : 'side',
	            	 fieldLabel : 'Type',
	            	 defaults : {hideLabel : true},
	            	 width : 50,
	            	 xtype : 'combo',
	            	 mode : 'local',
	            	 value : 'string',
	            	 editable : false,
	            	 margin: "15 0 0 0",
	            	 displayField : 'name',
	            	 valueField : 'value',
	            	 store : Ext.create('Ext.data.Store', {
	            		 fields : [ 'name', 'value' ],
	            		 data : [ {
	            			 name : 'Number',
	            			 value : 'number'
	            		 }, {
	            			 name : 'String',
	            			 value : 'string'
	            		 }, {
	            			 name : 'Boolean',
	            			 value : 'bool'
	            		 } ]
	            	 })
	             },
	             {
	            	 xtype : 'textfield',
	            	 fieldLabel : 'DefalutValue',
	            	 id : this.id + "newAttrDef",
	            	 margin: "19 0 0 0",
	            	 allowBlank : false
	             }
	             ];
	
	var formPanel = Ext.create('Ext.form.Panel', {
		border: false,
		bodyPadding: "15 15 15 15",
		layout: {
			type: 'vbox',
			align: 'stretch'
		},
		items: items,
		buttons: [
		          {
		        	  text: 'Ok',
		        	  formBind: true, // only enabled once the form is valid
		        	  disabled: true,
		        	  handler: function() {
		        		  var name = Ext.getCmp(_this.id + "newAttrName").getValue();
		        		  var type = Ext.getCmp(_this.id + "newAttrType").getValue();
		        		  var defaultValue = Ext.getCmp(_this.id + "newAttrDef").getValue();
		        		  
		        		  _this.attrMan.addAttribute(name, type, defaultValue);
		        		  _this.grid.reconfigure(null, _this.attrMan.columnsGrid);
		        		  
		        		  // set default value for new attribute in existing rows
		        		  if(_this.attrMan.getNumberOfRows() > 0) {
		        			  _this.grid.getSelectionModel().selectAll();
		        			  _this.attrMan.modifyAttributeOfRows(_this.grid.getSelectionModel().getSelection(), _this.attrMan.attributes[_this.attrMan.attributes.length-1], defaultValue);
		        			  _this.grid.getSelectionModel().deselectAll();
		        		  }
		        		  
		        		  Ext.getCmp("addAttrWindow").close();
		        	  }
		          }
		          ]
	});
	
	Ext.create('widget.window', {
		id: "addAttrWindow",
		title: "Add attribute",
		modal: true,
		height: 225,
		width: 420,
		layout: "fit",
		items: formPanel
	}).show();
};

//---------------------------getAttributeNames---------------------------------//
//Descripcion:
//	Coge los nombres de los atributos y los pasa en el formato
//	adecuado para poder pasarselo al combobox del search
//Parametros: (ninguno)
//-----------------------------------------------------------------------------//
AttributeEditWidget.prototype.getAttributeNames = function() {
	var names = [];
	for ( var i = 0; i < this.attrMan.attributes.length; i++) {
		var attr = this.attrMan.attributes[i];
		if(attr != "Id" && attr != "Name"){
			names.push({"name": attr});
		}
	}
	return names;
};


AttributeEditWidget.prototype.selectRowsById = function(arrayNodes) {
	this.grid.getSelectionModel().deselectAll();
	for (var i = 0; i < arrayNodes.length; i++) {
		var idx = this.attrMan.store.find("Id",arrayNodes[i]);
		this.grid.getSelectionModel().select(idx, true);
	}
};

AttributeEditWidget.prototype.updateNumRowsLabel = function() {
	Ext.getCmp(this.id + "numRowsLabel").setText(this.attrMan.getNumberOfRows() + " rows");
};
