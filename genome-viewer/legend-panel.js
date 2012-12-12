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

function LegendPanel(args){
	this.width = 200;
	this.height = 250;
	
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
    }
	
	
};

LegendPanel.prototype.getColorItems = function(legend){
	panelsArray = new Array();
	
	for ( var item in legend) {
//		var color = legend[item].toString().replace("#", "");
//		var cp = new Ext.picker.Color();
//		cp.width = 20;
//		cp.colors = [color];
		var size=15;
		var color = Ext.create('Ext.draw.Component', {
        width: size,
        height: size,
        items:[{
				type: 'rect',
				fill: legend[item],
				x:0,y:0,
				width: size,
				height : size
				}]
		});
		
		var name = Compbio.formatText(item, "_");
		
		var panel = Ext.create('Ext.panel.Panel', {
			height:size,
			border:false,
			flex:1,
			margin:"1 0 0 1",
		    layout: {type: 'hbox',align:'stretch' },
		    items: [color, {xtype: 'tbtext',text:name, margin:"1 0 0 3"} ]
		});
		
		panelsArray.push(panel);
	}
	
	return panelsArray;
};




LegendPanel.prototype.getPanel = function(legend){
	var _this=this;
	
	if (this.panel == null){
		
		var items = this.getColorItems(legend);
		
		this.panel  = Ext.create('Ext.panel.Panel', {
			bodyPadding:'0 0 0 2',
			border:false,
			layout: {
		        type: 'vbox',
		        align:'stretch' 
		    },
			items:items,
			width:this.width,
			height:items.length*20
		});		
	}	
	
	return this.panel;
};

LegendPanel.prototype.getButton = function(legend){
	var _this=this;
	
	if (this.button == null){
		
		this.button = Ext.create('Ext.button.Button', {
			text : this.title,
			menu : {
					items: [this.getPanel(legend)]
				}
		});
	}	
	return this.button;
	
};
