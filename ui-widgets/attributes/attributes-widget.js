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

function AttributesWidget(args){
	this.id = "AttributesWidget_" + Math.random();
	this.title = "";
	this.width = 1025;
	this.height = 628;
	
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
	this.attributesPanel = new AttributesPanel({borderCls:args.borderCls, height:325});
};

AttributesWidget.prototype.draw = function (){
	this.render();
};

AttributesWidget.prototype.getDetailPanel = function (){
	return {};
};

AttributesWidget.prototype.getButtons = function (){
	var _this=this;
	return [{text:'Close', handler: function(){_this.panel.close();}}];
};


AttributesWidget.prototype.render = function (){
	var _this = this;
	if (this.panel == null){
		this.panel  = Ext.create('Ext.ux.Window', {
			title : this.title,
			resizable: false,
			constrain:true,
			closable:true,
			collapsible:true,
			layout: { type: 'vbox',align: 'stretch'},
			items: [this.attributesPanel.getPanel(), this.getDetailPanel()],
			width: this.width,
		    height:this.height,
			buttonAlign:'right',
			buttons:this.getButtons(),
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
		this.panel.setLoading();
	}	
	this.panel.show();
};
