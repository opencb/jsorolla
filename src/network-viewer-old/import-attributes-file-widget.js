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

function ImportAttributesFileWidget(args){
	this.targetId = null;
	this.id = "ImportAttributesFileWidget-" + Math.round(Math.random()*10000000);
	
	this.title = 'Open an attributes file';
	this.width = 600;
	this.height = 350;
	
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
        if (args.numNodes!= null){
        	this.numNodes = args.numNodes;       
        }
    }
    
	this.dataAdapter = null;
	this.onOk = new Event(this);
	
	this.previewId = this.id+'-preview';
};

ImportAttributesFileWidget.prototype.getTitleName = function(){
	return Ext.getCmp(this.id + "_title").getValue();
};

ImportAttributesFileWidget.prototype.getFileUpload = function(){
	var _this = this;
	
	this.fileUpload = Ext.create('Ext.form.field.File', {
		msgTarget: 'side',
		allowBlank: false,
		emptyText:'Attributes tabular file',
		flex:1,
		buttonText: 'Browse local',
		listeners: {
			change: function(){
				var file = document.getElementById(_this.fileUpload.fileInputEl.id).files[0];				
				var attributesDataAdapter = new AttributesDataAdapter(new FileDataSource(file));
				attributesDataAdapter.onLoad.addEventListener(function(sender,data){
					_this.content = attributesDataAdapter.getAttributesJSON(); //para el onOK.notify event
					
					var existNameColumn = false;
					var cbgItems = [];
					_this.columnsGrid = [];
					for(var i=0; i < _this.content.attributes.length; i++){
						var name = _this.content.attributes[i].name;
						
						_this.columnsGrid.push({
							"text": name,
							"dataIndex": name,
							"editor": {xtype: 'textfield', allowBlank: true}
						});
						
						var disabled = false;
						if(name == "Name") {
							disabled = true;
							existNameColumn = true;
						}
						cbgItems.push({
							boxLabel  : name,
							name      : 'attr',
							inputValue: name,
							margin    : '0 0 0 5',
							checked   : true,
							disabled  : disabled
						});
					}
					
					var uniqueNameValues = true;
					var nameValues = {};
					for(var i=0; i < _this.content.data.length; i++) {
						var name = _this.content.data[i][0];
						if(nameValues[name]) {
							uniqueNameValues = false;
							break;
						}
						else {
							nameValues[name] = true;
						}
					}
					
					if(!existNameColumn) {
						_this.infoLabel.setText("<span class='err'>Invalid file. The column 'Name' is required.</span>",false);
					}
					else if(!uniqueNameValues) {
						_this.infoLabel.setText("<span class='err'>Invalid file. The values for 'Name' column must be uniques.</span>",false);
					}
					else {
						_this.cbgAttributes.add(cbgItems);
						_this.checkboxBar.show();
						_this.createNodesBar.show();
						
						Ext.getCmp(_this.id + 'okBtn').setDisabled(false);
					}
					_this.grid.reconfigure(null, _this.columnsGrid);
					
					_this.model.setFields(_this.content.attributes);
					
					_this.gridStore.loadData(_this.content.data);
				});
			}
	    }
	});
	
	return this.fileUpload;
};

ImportAttributesFileWidget.prototype.filterColumnsToImport = function(){
	var checkeds = this.cbgAttributes.getChecked();
	
	var data = {};
	var newAttrArray = [];
	var indexToImport = {};
	
	data.content = {};
	data.createNodes = this.createNodesCkb.getValue();
	if(checkeds.length < this.content.attributes.length) {
		var columnsToImport = {};
		for(var i=0; i<checkeds.length; i++) {
			columnsToImport[checkeds[i].inputValue] = true;
		}
		
		for(var i=0; i<this.content.attributes.length; i++) {
			var name = this.content.attributes[i].name; 
			if(columnsToImport[name]) {
				newAttrArray.push(this.content.attributes[i]);
				indexToImport[i] = true;
			}
		}
		
		data.content.data = [];
		for(var i=0; i < this.content.data.length; i++) {
			data.content.data.push([]);
			for(var j=0; j < this.content.data[i].length; j++) {
				if(indexToImport[j]) {
					data.content.data[i].push(this.content.data[i][j]);
				}
			}
		}
		
		data.content.attributes = newAttrArray;
	}
	else {
		data.content = this.content;
	}
	
	return data;
};

ImportAttributesFileWidget.prototype.draw = function(){
	var _this = this;
	
	if (this.panel == null){
		/** Bar for the file upload browser **/
		var browseBar = Ext.create('Ext.toolbar.Toolbar',{cls:'bio-border-false', dock: 'top'});
		browseBar.add(this.getFileUpload());
		
		this.infoLabel = Ext.create('Ext.toolbar.TextItem',{html:'Please select a network saved File'});
		this.countLabel = Ext.create('Ext.toolbar.TextItem');
		var infobar = Ext.create('Ext.toolbar.Toolbar',{cls:'bio-border-false', dock: 'bottom'});
		infobar.add([this.infoLabel,'->',this.countLabel]);
		
		this.cbgLabel = Ext.create('Ext.draw.Text',{
			text: "Import:",
			margin: "0 0 0 3"
		});
		
		this.cbgAttributes = Ext.create('Ext.form.CheckboxGroup',{
			margin: '2 2 2 2',
			layout: 'hbox',
			autoScroll: true,
			defaultType: 'checkboxfield'
		});
		
		this.checkboxBar = Ext.create('Ext.toolbar.Toolbar',{
			cls: 'bio-border-false',
			dock: 'bottom',
			hidden: true,
			items: [this.cbgLabel, this.cbgAttributes]
		});
		
		this.createNodesCkb = Ext.create('Ext.form.field.Checkbox',{
			margin: '2 2 2 2',
			boxLabel  : "Create nodes for unrecognized names."
		});
		
		this.createNodesBar = Ext.create('Ext.toolbar.Toolbar',{
			cls: 'bio-border-false',
			dock: 'bottom',
			hidden: true,
			items: this.createNodesCkb
		});
		
		/** Grid for Preview **/
		this.columnsGrid = [];
		
		this.model = Ext.define('User', {
			extend: 'Ext.data.Model'
		});
		
		this.gridStore = Ext.create('Ext.data.Store', {
		    model: this.model
		});
		
		this.grid = Ext.create('Ext.grid.Panel', {
			border:false,
			flex:1,
		    store: this.gridStore,
		    columns: this.columnsGrid,
		    dockedItems: [browseBar, infobar, this.createNodesBar, this.checkboxBar]
		});
		
		this.panel = Ext.create('Ext.window.Window', {
			title: this.title,
			width: this.width,
			height: this.height,
			resizable: false,
			modal: true,
			layout: { type: 'vbox',align: 'stretch'},
			items: [this.grid],
			buttons: [
			          {
			        	  id: _this.id + 'okBtn',
			        	  text: 'Ok',
			        	  disabled: true,
			        	  handler: function() {
			        		  _this.onOk.notify(_this.filterColumnsToImport());
			        		  _this.panel.close();
			        	  }
			          }, 
			          {
			        	  text:'Cancel',
			        	  handler: function() { _this.panel.close(); }
			          }
			],
			listeners: {
				scope: this,
				minimize:function() {
					this.panel.hide();
				},
				destroy: function() {
					delete this.panel;
				}
			}
		});
	}
	this.panel.show();
};
