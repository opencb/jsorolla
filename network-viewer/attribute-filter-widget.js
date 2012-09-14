function AttributeFilterWidget(attributeManager) {
	this.id = Math.round(Math.random() * 10000000);
	
	var _this = this;
	this.attrMan = attributeManager;
	this.grid;

	this.attrMan.store.on('datachanged', function(){
		if(Ext.getCmp("filterAttrWindow")){
			_this.updateNumRowsLabel();
		}
	});
};

AttributeFilterWidget.prototype.draw = function(selectedNodes) {
	var _this = this;
	
	var attrNameStore = Ext.create('Ext.data.Store', {
		id : this.id + "attrNameStore",
		fields: ['name'],
		data: this.getAttributeNames()
	});

	var addFilterFormPanel = Ext.create('Ext.form.Panel', {
		title: 'Add new filter',
		border: false,
		bodyStyle: 'background: #dedcd8',
		bodyPadding: "10 5 10 5",
		layout: 'hbox',
		items: [
		        {
		        	xtype: 'text',
		        	margin: "4 0 0 0",
		        	text: 'Filter name:'
		        },
		        {
		        	xtype : 'textfield',
		        	id : this.id + "filterName",
		        	width : 105,
		        	margin: "0 0 0 4",
		        	allowBlank : false
		        },
		        {
		        	xtype: 'text',
		        	margin: "4 0 0 10",
		        	text: 'Attribute:'
		        },
		        {
		        	xtype: 'combo',
		        	id: this.id + "selectedAttr",
		        	margin: "0 0 0 4",
		        	width: 105,
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
		        	text: 'Attr. value:'
		        },
		        {
		        	xtype : 'textfield',
		        	id : this.id + "attrValue",
		        	width : 105,
		        	margin: "0 0 0 4",
		        	allowBlank : false
		        },
		        {
		        	xtype: 'button',
		        	text: 'Add',
		        	iconCls: 'icon-add',
		        	margin: "0 15 0 10",
		        	formBind: true, // only enabled if the form is valid
		        	disabled: true,
		        	handler: function() {
		        		var filterName = Ext.getCmp(_this.id + "filterName").getValue();
		        		var selectedAttr = Ext.getCmp(_this.id + "selectedAttr").getValue();
		        		var attrValue = Ext.getCmp(_this.id + "attrValue").getValue();
		        		
		        		if(_this.attrMan.addFilter(filterName, selectedAttr, attrValue)) {
		        			// Active filters menu
		        			Ext.getCmp(_this.id+"filterMenu").menu.add({
		        				id: filterName,
		        				text: filterName,
		        				checked: true,
		        				handler: function() {
		        					if(this.checked){
		        						// apply filter
		        						_this.attrMan.enableFilter(this.text);
		        					}
		        					else{
		        						// remove filter
		        						_this.attrMan.disableFilter(this.text);
		        					}
		        				}
		        			});
		        			
		        			// Remove filter menu
		        			Ext.getCmp(_this.id+"rmFilterMenu").menu.add({
		        				text: filterName,
		        				handler: function() {
		        					_this.attrMan.removeFilter(this.text);
		        					Ext.getCmp(_this.id+"rmFilterMenu").menu.remove(this);
		        					Ext.getCmp(_this.id+"filterMenu").menu.remove(this.text);
		        				}
		        			});
		        		}
		        		else {
		        			Ext.Msg.show({
		        				title:"Error",
		        				msg: "Already exists a filter with this name.",
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
		            	  items : addFilterFormPanel
		              },
		              {
		            	  xtype: 'toolbar',
		            	  dock: 'top',
		            	  layout: {
		            		  pack: 'hbox',
		            		  align: 'right'
		            	  },
		            	  items : [
		            	           {
		            	        	   id : this.id+"filterMenu",
		            	        	   text : 'Active filters',
		            	        	   menu : []
		            	           },
		            	           {
		            	        	   id : this.id+"rmFilterMenu",
		            	        	   text : 'Remove filter',
		            	        	   menu : []
		            	           },
		            	           {
							        	xtype: 'button',
							        	text: 'Select on graph',
							        	// margin: "0 15 0 10",
							        	handler: function() {
							        		
							        	}
							       },
							       {
							        	xtype: 'button',
							        	text: 'Filter on graph',
							        	// margin: "0 15 0 10",
							        	handler: function() {
							        		
							        	}
							       }
		            	          ]
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
		id : "filterAttrWindow",
		title : "Filter attributes",
		height : 450,
		width : 600,
		layout : "fit",
		items : this.grid
	}).show();

	this.selectRowsById(selectedNodes);
	this.updateNumRowsLabel();
};


//---------------------------getAttributeNames---------------------------------//
//Descripcion:
//	Coge los nombres de los atributos y los pasa en el formato
//	adecuado para poder pasarselo al combobox del search
//Parametros: (ninguno)
//-----------------------------------------------------------------------------//
AttributeFilterWidget.prototype.getAttributeNames = function() {
	var names = [];
	for ( var i = 0; i < this.attrMan.attributes.length; i++) {
		var attr = this.attrMan.attributes[i];
		if(attr != "Id"){
			names.push({"name": attr});
		}
	}
	return names;
};


AttributeFilterWidget.prototype.selectRowsById = function(arrayNodes) {
	this.grid.getSelectionModel().deselectAll();
	for (var i = 0; i < arrayNodes.length; i++) {
		var idx = this.attrMan.store.find("Id",arrayNodes[i]);
		this.grid.getSelectionModel().select(idx, true);
	}
};

AttributeFilterWidget.prototype.updateNumRowsLabel = function() {
	Ext.getCmp(this.id + "numRowsLabel").setText(this.attrMan.getNumberOfRows() + " rows");
};
