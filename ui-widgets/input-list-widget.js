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

function InputListWidget(args) {
	this.id = "InputListWidget" + Math.round(Math.random()*10000000);
		
	this.title = "List";
	this.width = 500;
	this.height = 350;
	this.headerInfo = 'Write a list separated only by lines';
	
	this.args=args;
	
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
        if (args.headerInfo!= null){
        	this.headerInfo = args.headerInfo;       
        }
        if (args.viewer!= null){
        	this.viewer = args.viewer;       
        }
    }
	this.onOk = new Event(this);
};


InputListWidget.prototype.draw = function(text){
	var _this = this;
	
	if (text == null){
		text = new String();
	}
	
	if (this.panel == null){
		this.infobar = Ext.create('Ext.toolbar.Toolbar',{cls:"bio-border-false"});
		this.infoLabel = Ext.create('Ext.toolbar.TextItem', {
				text:this.headerInfo
		});
		this.infobar.add(this.infoLabel);
		this.editor = Ext.create('Ext.form.field.TextArea', {
				id:this.id + "genelist_preview",
	       	 	xtype: 'textarea',
	        	name: 'file',
	        	margin:"-1",
				width : this.width,
				height : this.height,
	        	enableKeyEvents:true,
	        	cls: 'dis',
	        	style:'normal 6px tahoma, arial, verdana, sans-serif',
	        	value: text,
	        	listeners: {
				       scope: this,
				       change: function(){
//				       			var re = /\n/g;
//				       			for( var i = 1; re.exec(this.editor.getValue()); ++i );
//				       			this.infoLabel.setText('<span class="ok">'+i+'</span> <span class="info"> Features detected</span>',false);
				       			this.validate();
				       }
				       
		        }
		});
		var form = Ext.create('Ext.panel.Panel', {
			border : false,
			items : [this.infobar,this.editor]
		});
		
		this.okButton = Ext.create('Ext.button.Button', {
			 text: 'Ok',
			 disabled:true,
			 listeners: {
			       scope: this,
			       click: function(){
			       			var geneNames = Ext.getCmp(this.id + "genelist_preview").getValue().split("\n");
							this.onOk.notify(geneNames);
							_this.panel.close();
			       		}
	        }
		});  
		
		this.panel = Ext.create('Ext.ux.Window', {
			title : this.title,
			taskbar:Ext.getCmp(this.viewer.id+'uxTaskbar'),
			layout: 'fit',
			resizable: false,
			collapsible:true,
			constrain:true,
			closable:true,
			items : [ form ],
			buttons : [ this.okButton, {text : 'Cancel',handler : function() {_this.panel.close();}} ],
			listeners: {
				       scope: this,
				       destroy: function(){
				       		delete this.panel;
				       }
		        }
		});
	}
	this.panel.show();
	
};

InputListWidget.prototype.validate = function (){
	if (this.editor.getValue()!="") {
		this.okButton.enable();
	}else{
		this.okButton.disable();
	}
};
