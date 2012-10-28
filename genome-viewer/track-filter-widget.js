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

function TrackFilterWidget(args) {
	this.id = "TrackFilterWidget"+ Math.round(Math.random()*10000);
	if (args != null){
		if(args.trackSvg != null){
			this.trackSvg = args.trackSvg;
		}
		if(args.treeRecord != null){
			this.treeRecord = args.treeRecord;
		}
	}

	this.filtersConfig = this.trackSvg.trackData.adapter.filtersConfig;
	if(this.filtersConfig != null){
		this.draw();
	}
};

TrackFilterWidget.prototype.setFilters = function(filters){
	 this.trackSvg.setFilters(filters);
}

TrackFilterWidget.prototype.draw = function(){
	var _this = this;
	var items = [];
	var stores = [];
	for(var i = 0; i < this.filtersConfig.length; i++){
		
		var rootText = this.filtersConfig[i].text;
		var rootName = this.filtersConfig[i].name;
		
		var children = [];
		for(var j = 0; j < this.filtersConfig[i].values.length; j++){
			children.push({text: this.filtersConfig[i].values[j], leaf: true, checked:true, iconCls:"icon-blue-box"});
		}
		
		var root = {
			text:rootName,
			expanded: true,
			iconCls:"icon-box",
			children:children
		};
		var st = Ext.create('Ext.data.TreeStore',{root:root});
		items.push({
			xtype:"treepanel",
			useArrows:true,
			rootVisible: false,
			bodyPadding:"10 0 0 0",
			title : rootText,
			border:false,
			store:st
		});
		
		stores.push(st);
	}

	var displaySettingsPanel = Ext.create('Ext.panel.Panel', {
		title: "Display settings",
		bodyPadding:10,
		items: [{
				xtype:'textfield',
				value: _this.trackSvg.getTitle(),
				fieldLabel:'TrackName',
				allowBlank: false,
				listeners:{
					change:function(este, newValue){
						if(este.isValid()){
							_this.trackSvg.setTitle(newValue);
							_this.treeRecord.set('text',newValue);
							_this.treeRecord.save();
						}
					}
				}
			}
		]
	});
	var tabFilter = Ext.create('Ext.tab.Panel', {
		title: "Filters",
		items: items
	});
	
	Ext.create('Ext.window.Window', {
		id:this.id+"window",
		title: 'Settings',
		width: 500,
		modal:true,
		items: [displaySettingsPanel, tabFilter],
		buttons:[{text:'Ok', handler: function(){
						var filters = [];
						for(var i = 0; i < stores.length; i++){
							var root = stores[i].getRootNode();
							var name = root.get("text");
							var checkValues = [];
							root.eachChild(function(node){
								if(node.data.checked){
									checkValues.push(node.get("text"));
								}
							});
							if(checkValues.length > 0){
								var filter = {
									param:name,
									value:checkValues
								};
								filters.push(filter);
							}
						}
						if(filters.length > 0){
							_this.setFilters(filters);
						}
					}
				},
			    {text:'Cancel', handler: function(){
					_this.trackSvg.setTitle(originalValue);
					_this.treeRecord.set('text',originalValue);
					_this.treeRecord.save();
					Ext.getCmp(_this.id+"window").destroy();
				}}
		]
	}).show();

	var originalValue = _this.trackSvg.getTitle();
};
