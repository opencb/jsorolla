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

function AttributeEditWidget(attributeManager, type) {
	this.id = Math.round(Math.random() * 10000000);
	
	var _this = this;
	this.attrMan = attributeManager;
	this.type = type;

	this.attrMan.store.on('datachanged', function(){
		if(Ext.getCmp("edit"+type+"AttrWindow")){
			_this.updateNumRowsLabel();
		}
	});
	
	this.onSelectNodes = new Event(this);
};

AttributeEditWidget.prototype.draw = function(selectedNodes) {
	var _this = this;

	this.attrNameStore = Ext.create('Ext.data.Store', {
		fields: ['name'],
		data: this.getAttributeNames()
	});
	
	this.attrNameStore2 = Ext.create('Ext.data.Store', {
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
		        	editable: false,
		        	displayField: 'name',
		        	valueField: 'name',
		        	queryMode: 'local',
		        	store: this.attrNameStore2
		        },
		        {
		        	xtype: 'text',
		        	margin: "4 0 0 10",
		        	text: 'for selected rows.'
		        },
		        {
		        	xtype: 'button',
		        	text: 'Update',
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
		        	editable: true,
		        	displayField: 'name',
		        	valueField: 'name',
		        	queryMode: 'local',
		        	store: this.attrNameStore,
		        	listeners: {
		        		select: function(combo, record, index) {
		        			// set other fields
		        			for ( var i = 0; i < _this.attrMan.attributes.length; i++) {
		        				if(combo.getValue() == _this.attrMan.attributes[i].name) {
		        					attrSelected = combo.getValue();
		        					Ext.getCmp(_this.id + "attrType").setValue(_this.attrMan.attributes[i].type);
		        					Ext.getCmp(_this.id + "attrDefault").setValue(_this.attrMan.attributes[i].defaultValue);
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
		        	margin: "0 5 0 3"
		        },
		        {
		        	xtype: 'button',
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
		        				_this.attrMan.modifyAttributeOfRows(_this.grid.getSelectionModel().getSelection(), _this.attrMan.attributes[_this.attrMan.attributes.length-1].name, defaultValue);
		        				_this.grid.getSelectionModel().deselectAll();
		        			}
		        			
		        			console.log(_this.getAttributeNames());
		        			_this.attrNameStore.loadData(_this.getAttributeNames());
		        			_this.attrNameStore2.loadData(_this.getAttributeNames());
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

		        			_this.attrNameStore.loadData(_this.getAttributeNames());
		        			_this.attrNameStore2.loadData(_this.getAttributeNames());
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
		        	tooltip: "Remove this attribute",
		        	iconCls : 'icon-delete',
		        	margin: "0 10 0 5",
		        	formBind: true, // only enabled if the form is valid
		        	disabled: true,
		        	handler: function() {
		        		Ext.Msg.show({
		        		     title:'Delete',
		        		     msg: 'Confirm delete. Are you sure?',
		        		     buttons: Ext.Msg.YESNO,
		        		     icon: Ext.Msg.QUESTION,
		        		     fn: function(resp){
		        		    	 if(resp == "yes") {
		        		    		 var name = Ext.getCmp(_this.id + "attrName").getValue();
		        		    		 if(_this.attrMan.removeAttribute(name)) {
		        		    			 _this.grid.reconfigure(null, _this.attrMan.columnsGrid);
		        		    			 _this.attrNameStore.loadData(_this.getAttributeNames());
		        		    			 _this.attrNameStore2.loadData(_this.getAttributeNames());
		        		    			 
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
		        		});
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
		            	          }, '->',
		            	          {
		            	        	  xtype: 'button',
		            	        	  text: 'Export...',
		            	        	  handler: function() {
		            	        		  if(!Ext.getCmp("exportWindow")) {
		            	        			  var cbgItems = [];
		            	        			  var attrList = _this.attrMan.getAttrNameList();
		            	        			  
		            	        			  cbgItems.push({
	            	        					  boxLabel  : attrList[1],
	            	        					  name      : 'attr',
	            	        					  inputValue: attrList[1],
	            	        					  checked   : true,
	            	        					  disabled  : true
	            	        				  });
		            	        			  
		            	        			  for(var i = 2; i < attrList.length; i++) {
		            	        				  cbgItems.push({
		            	        					  boxLabel  : attrList[i],
		            	        					  name      : 'attr',
		            	        					  inputValue: attrList[i],
		            	        					  checked   : true
		            	        				  });
		            	        			  }

		            	        			  Ext.create('Ext.window.Window', {
		            	        				  id : "exportWindow",
		            	        				  title : "Export attributes",
		            	        				  height : 250,
		            	        				  maxHeight: 250,
		            	        				  width : 400,
		            	        				  autoScroll: true,
		            	        				  layout : "vbox",
		            	        				  modal : true,
		            	        				  items : [
		            	        				           {
		            	        				        	   xtype: 'checkboxgroup',
		            	        				        	   id: _this.id+"cbgAttributes",
		            	        				        	   layout: 'vbox',
//		            	        				        	   width: 380,
//		            	        				        	   height: 200,
//		            	        				        	   maxHeight: 200,
//		            	        				        	   autoScroll: true,
//		            	        				        	   defaultType: 'checkboxfield',
//		            	        				        	   columns: 2,
//		            	        				        	   vertical: true,
		            	        				        	   items: cbgItems
		            	        				           }
		            	        				          ],
            	        				          buttons : [
            	        				                     {
            	        				                    	 xtype: 'textfield',
            	        				                    	 id: _this.id+"fileName",
            	        				                    	 emptyText:"enter file name",
            	        				                    	 flex:1
            	        				                     },
            	        				                     {
            	        				                    	 text: 'Download',
            	        				                    	 href: "none",
            	        				                    	 handler: function() {
            	        				                    		 var fileName = Ext.getCmp(_this.id+"fileName").getValue();
            	        				                    		 if(fileName == "") {
            	        				                    			 fileName =  "attributes";
            	        				                    		 }
            	        				                    		 var columns = Ext.getCmp(_this.id+"cbgAttributes").getChecked();
            	        				                    		 var content = _this.attrMan.exportToTab(columns, true);
            	        				                    		 this.getEl().child("em").child("a").set({
            	        				                    			 href: 'data:text/csv,'+encodeURIComponent(content),
            	        				                    			 download: fileName+".txt"
            	        				                    		 });
            	        				                    	 }
            	        				                     }
		            	        			  	            ]
		            	        			  }).show();
		            	        		  }
		            	        	  }
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
			},
			selectionchange: function(model, selected) {
				var nodeList = [];
				for (var i = 0; i < selected.length; i++) {
					nodeList.push(selected[i].getData().Id);
				}
        		_this.onSelectNodes.notify(nodeList);
			}
		}
	});

	Ext.create('Ext.window.Window', {
		id : "edit"+this.type+"AttrWindow",
		title : "Edit "+this.type.toLowerCase()+" attributes",
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
	            			 value : 'float'
	            		 }, {
	            			 name : 'String',
	            			 value : 'string'
	            		 }, {
	            			 name : 'Boolean',
	            			 value : 'boolean'
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
		        			  _this.attrMan.modifyAttributeOfRows(_this.grid.getSelectionModel().getSelection(), _this.attrMan.attributes[_this.attrMan.attributes.length-1].name, defaultValue);
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
	var nameList = this.attrMan.getAttrNameList();
	for ( var i = 0; i < nameList.length; i++) {
		var attr = nameList[i];
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
