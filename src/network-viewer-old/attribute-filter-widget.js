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

function AttributeFilterWidget(attributeManager, type) {
	this.id = Math.round(Math.random() * 10000000);
	
	var _this = this;
	this.attrMan = attributeManager;
	this.type = type;

	this.attrMan.store.on('datachanged', function(){
		if(Ext.getCmp("filterAttrWindow")){
			_this.updateNumRowsLabel();
		}
	});
	
	this.onSelectNodes = new Event(this);
	this.onDeselectNodes = new Event(this);
	this.onFilterNodes = new Event(this);
	this.onRestoreNodes = new Event(this);
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
		        						
		        						// select nodes of filter
		        						_this.selectNodesOnGraph();
		        						
		        						// check item in the other menu
		        						Ext.getCmp(this.id+"_main").setChecked(true);
		        					}
		        					else{
		        						// remove filter
		        						_this.attrMan.disableFilter(this.text);
		        						_this.deselectNodesOnGraph();
		        						
		        						// check item in the other menu
		        						Ext.getCmp(this.id+"_main").setChecked(false);
		        					}
		        				}
		        			});
		        			
		        			//add to main menu
		        			Ext.getCmp("filters"+_this.type+"AttrMenu").add({
		        				id: filterName+"_main",
		        				text: filterName,
		        				checked: true,
		        				handler: function() {
		        					if(this.checked){
		        						// apply filter
		        						_this.attrMan.enableFilter(this.text);
		        						
		        						// select nodes of filter
		        						_this.selectNodesOnGraph();
		        						
		        						// check item in the other menu
		        						if(Ext.getCmp(this.text)) {
		        							Ext.getCmp(this.text).setChecked(true);
		        						}
		        					}
		        					else{
		        						// remove filter
		        						_this.attrMan.disableFilter(this.text);
		        						_this.deselectNodesOnGraph();
		        						
		        						// check item in the other menu
		        						if(Ext.getCmp(this.text)) {
		        							Ext.getCmp(this.text).setChecked(false);
		        						}
		        					}
		        				}
		        			});
		        			
		        			// Remove filter menu
		        			Ext.getCmp(_this.id+"rmFilterMenu").menu.add({
		        				text: filterName,
		        				handler: function() {
		        					var item = this;
		        					Ext.Msg.show({
	        							title:'Delete',
	        							msg: 'Confirm delete. Are you sure?',
	        							buttons: Ext.Msg.YESNO,
	        							icon: Ext.Msg.QUESTION,
	        							fn: function(resp){
	        								if(resp == "yes") {
	        									_this.attrMan.removeFilter(item.text);
	        									Ext.getCmp(_this.id+"rmFilterMenu").menu.remove(item);
	        									Ext.getCmp(_this.id+"filterMenu").menu.remove(item.text);
	        									Ext.getCmp("filters"+_this.type+"AttrMenu").remove(Ext.getCmp(item.text+"_main"));
	        									_this.deselectNodesOnGraph();
	        								}
	        							}
	        						});
		        				}
		        			});
		        			
		        			// select nodes of added filter
    						_this.selectNodesOnGraph();
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
	
	var restoreBtn = Ext.create('Ext.Button', {
		disabled: true,
		text: 'Restore original graph',
		handler: function() {
			this.setDisabled(true);
			
			_this.onRestoreNodes.notify();
		}
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
//		            	        				        	   columns: 1,
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
		            	        			  	            		 //Download file
//		            	        			  	            		 document.location = 'data:Application/octet-stream,'+encodeURIComponent(content);
		            	        			  	            		 var fileName = Ext.getCmp(_this.id+"fileName").getValue();
		            	        			  	            		 if(fileName == "") {
		            	        			  	            			 fileName =  "attributes";
		            	        			  	            		 }
		            	        			  	            		 var columns = Ext.getCmp(_this.id+"cbgAttributes").getChecked();
		            	        			  	            		 var content = _this.attrMan.exportToTab(columns, false);
		            	        			  	            		 this.getEl().child("em").child("a").set({
		            	        			  	            			 href: 'data:text/csv,'+encodeURIComponent(content),
		            	        			  	            			 download: fileName+".txt"
		            	        			  	            		 });
//		            	        			  	            		 Ext.getCmp("exportWindow").close();
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
							        	handler: function() {
							        		_this.selectNodesOnGraph();
							        	}
							       },
							       {
							        	xtype: 'button',
							        	text: 'Filter on graph',
							        	handler: function() {
							        		restoreBtn.setDisabled(false);
							        		_this.grid.getSelectionModel().selectAll();
							        		var selection = _this.grid.getSelectionModel().getSelection();
							        		var nodeList = {};
							        		for (var i = 0; i < selection.length; i++) {
												nodeList[selection[i].getData().Id] = true;
											}
							        		_this.onFilterNodes.notify(nodeList);
							        	}
							       },
							       restoreBtn
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
		id : "filter"+this.type+"AttrWindow",
		title : "Filter "+this.type.toLowerCase()+" attributes",
		height : 450,
		width : 600,
		layout : "fit",
		items : this.grid
	}).show();
	
	//Add created filters to menus
	for(var filter in this.attrMan.filters) {
		// Active filters menu
		Ext.getCmp(this.id+"filterMenu").menu.add({
			id: filter,
			text: filter,
			checked: this.attrMan.filters[filter].active,
			handler: function() {
				if(this.checked){
					// apply filter
					_this.attrMan.enableFilter(this.text);
					
					// select nodes of filter
					_this.selectNodesOnGraph();
					
					// check item in the other menu
					Ext.getCmp(this.id+"_main").setChecked(true);
				}
				else{
					// remove filter
					_this.attrMan.disableFilter(this.text);
					_this.deselectNodesOnGraph();
					
					// check item in the other menu
					Ext.getCmp(this.id+"_main").setChecked(false);
				}
			}
		});
		
		// Remove filter menu
		Ext.getCmp(this.id+"rmFilterMenu").menu.add({
			text: filter,
			handler: function() {
				_this.attrMan.removeFilter(this.text);
				Ext.getCmp(_this.id+"rmFilterMenu").menu.remove(this);
				Ext.getCmp(_this.id+"filterMenu").menu.remove(this.text);
				Ext.getCmp("filters"+_this.type+"AttrMenu").remove(Ext.getCmp(this.text+"_main"));
				_this.deselectNodesOnGraph();
			}
		});
	}
	
	this.selectRowsById(selectedNodes);
	this.updateNumRowsLabel();
};

AttributeFilterWidget.prototype.getAttributeNames = function() {
	var names = [];
	var nameList = this.attrMan.getAttrNameList();
	for ( var i = 0; i < nameList.length; i++) {
		var attr = nameList[i];
		if(attr != "Id"){
			names.push({"name": attr});
		}
	}
	return names;
};

AttributeFilterWidget.prototype.selectNodesOnGraph = function() {
	if(Ext.getCmp("filterAttrWindow")) {
		this.grid.getSelectionModel().selectAll();
	}
	
	var nodeList = [];
	this.attrMan.store.each(function (record){
		nodeList.push(record.getData().Id);
	});
	this.onSelectNodes.notify(nodeList);
};

AttributeFilterWidget.prototype.deselectNodesOnGraph = function() {
	this.onDeselectNodes.notify();
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
