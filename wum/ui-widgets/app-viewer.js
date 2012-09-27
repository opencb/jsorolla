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

console.log("AppViewer deprecated");
function AppViewer (args){
	var _this = this;
	this.targetId = null;
	this.wum = true;
	this.suiteId=-1;
	
	this.title = "App Name";
	
	this.description = "description";
	
	/** Flag que indica si quieo mostrar el headerapp (posibilidad de login) **/
	if (args != null){
     
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.description!= null){
        	this.description = args.description;       
        }
        if (args.wum!= null){
        	this.wum = args.wum;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.suiteId!= null){
        	this.suiteId = args.suiteId;       
        }
    }
	this.id=this.title;
	
	/** ID **/
	this.portId = this.title + "_portID";
	
	if (this.wum==true){
		this.headerWidget = new HeaderWidget({
			appname: this.title,
			description: this.description,
			suiteId : this.suiteId
		});
		
		/**Atach events i listen**/
		this.headerWidget.onLogin.addEventListener(function (sender){
			Ext.example.msg('Welcome', 'You logged in');
		});
		
		this.headerWidget.onLogout.addEventListener(function (sender){
			Ext.example.msg('Good bye', 'You logged out');
		});
	}
	

//	/*Nuevo tipo ventana*/
//	Ext.define("Ext.ux.Window",{
//		extend:"Ext.window.Window",
//		minimizable:true,
//		constrain:true,
//		collapsible:true,
//		initComponent: function () {
//			this.callParent();
//			this.taskbar = Ext.getCmp('uxTaskbar');//si no existe, las ventanas funcionan como hasta ahora
//			if(this.taskbar!=null){
//				this.zIndexManager = this.taskbar.winMgr;
//				this.iconCls='icon-grid';
//				this.button=Ext.create('Ext.button.Button', {
//					text:this.title,
//					window:this,
//					iconCls : this.iconCls,
//					handler:function(){
//						if(this.window.zIndexManager.front==this.window){
//							this.window.minimize();
//						}else{
//							this.window.show();
//						}
//					}
//				});
//				this.taskbar.add(this.button);
//				
//				
//				this.contextMenu = new Ext.menu.Menu({
//					items: [{
//						text: 'Close',
//						window:this,
//						iconCls:'tools-icons x-tool-close',
//						handler:function(){this.window.close();}
//					}]
//				});
//				this.button.getEl().on('contextmenu', function(e){
//													e.preventDefault();
//													this.contextMenu.showAt(e.getX(),e.getY()-10-(this.contextMenu.items.length)*25);
//													},this);
//				
//				this.button.on('destroy', function(){this.window.close();});
//				
//				//Taskbar button can be destroying
//				this.on('destroy',function(){if(this.button.destroying!=true){this.button.destroy();}});
//				
//				this.on('minimize',function(){this.hide();});
//				this.on('deactivate',function(){
//					if(this.zIndexManager && this.zIndexManager.front.ghostPanel){
//						this.zIndexManager.unregister(this.zIndexManager.front.ghostPanel);
//					}
//					this.button.toggle(false);
//				});
//				this.on('activate',function(){this.button.toggle(true);});
//				
//			}
//		}
//	});
	
	this.onRendered = new Event(this);
	
	/*END Nuevo tipo ventana*/
	/***TASK BAR EXAMPLE****/
//	Ext.create('Ext.toolbar.Toolbar',{
//		id:'uxTaskbar',
//		winMgr: new Ext.ZIndexManager(),
//		cls:'bio-toolbar-bot x-unselectable',
//		enableOverflow:true,
//		height:30
//	});
	/*** END TASK BAR****/
};

///** appInterface **/
//AppViewer.prototype.getAppMenu = function(){
//	console.info("abstract method must be implemented in child classes");
//	return Ext.create('Ext.toolbar.Toolbar',{cls:'bio-menubar'});
//};

AppViewer.prototype.getAppPanel = function(){
	console.log("abstract method must be implemented in child classes");
	return({xtype:'panel',region: 'center',html:"This panel is created by and abstract method"});
};

AppViewer.prototype.drawApplication = function(){
	console.info("abstract method must be implemented in child classes");
};

AppViewer.prototype.getAppEastPanel = function(){
//	console.info("abstract method must be implemented in child classes");
	return null;
};

AppViewer.prototype.drawFramework = function(){
	var items = [];
	console.log(this.headerWidget.getPanel());
	if (this.wum==true){
		items.push(this.headerWidget.getPanel());
		
	}
	if (this.getAppEastPanel() != null){ 
		items.push(this.getAppEastPanel());
	}

	items.push(this.getAppPanel());
			
	if(this.targetId==null){
		this.port = Ext.create('Ext.container.Viewport', {
			id: this.portId,
	    	layout: 'border',
	    	items: items
		});
	}else{
		this.port = Ext.create('Ext.panel.Panel', {
			renderTo:this.targetId,
	    	layout: 'border',
	    	border:false,
	    	width:this.width,
	    	height:this.height,
	    	items: items
		});
	}

	this.port.on('resize',function(este,w,h){
		console.log(w+"x"+h);		
	});
};

AppViewer.prototype.draw = function(){
	this.drawFramework();
	
	var browserOk = false;
	if(Ext.chromeVersion>=14){
		browserOk = true;
	}
	if(Ext.firefoxVersion>=7){
		browserOk = true;
	}
	if(browserOk==false){
		Ext.create("Ext.window.Window",{
			title:'Supported browsers',
			modal:true,
			resizable:false,
			bodyStyle:"background:#ffffff;",
			bodyPadding:15,
			width:330,
			height:200,
			html:'<p>This release makes an intensive use of new web technologies and standards like HTML5, so the browsers that are fully supported from now on are:</p>'+ 
				 '<br><p class="emph">Chrome 14+</p>'+ 
				 '<p class="emph">Firefox 7+</p>'+ 
				 '<br>Older browsers like Chrome13-, Firefox 6- or Internet Explorer may rise some errors.'
		}).show();
	}
	
	this.drawApplication();
	this.onRendered.notify();
};


//window.onresize = function() {
//	//your code
//};
