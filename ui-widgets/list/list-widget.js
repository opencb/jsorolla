/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
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

function ListWidget(species, args) {
	this.targetId = null;
	this.id = "ListWidget" + Math.round(Math.random()*10000000);
	this.species=species;
	
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
        if (args.viewer!= null){
        	this.viewer = args.viewer;
        }
    }
	

	this.listPanel = new ListPanel(this.species,{title:false,gridFields:args.gridFields,viewer:this.args.viewer});
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
			taskbar:Ext.getCmp(this.viewer.id+'uxTaskbar'),
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
//			         {text:'aaa', handler: function(){},margin:"0 50 0 0 "},
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

ListWidget.prototype.draw = function(cbResponse, processData) {
	var _this = this;
	this.listPanel.draw(cbResponse, processData);
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
};