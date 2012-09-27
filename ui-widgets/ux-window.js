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

	/*Nuevo tipo ventana*/
	Ext.define("Ext.ux.Window",{
		extend:"Ext.window.Window",
		minimizable:true,
		constrain:true,
		collapsible:true,
		initComponent: function () {
			this.callParent();
			if(this.taskbar!=null){//si no existe, las ventanas funcionan como hasta ahora
				this.zIndexManager = this.taskbar.winMgr;
				this.iconCls='icon-grid';
				this.button=Ext.create('Ext.button.Button', {
					text:this.title,
					window:this,
					iconCls : this.iconCls,
					handler:function(){
						if(this.window.zIndexManager.front==this.window){
							this.window.minimize();
						}else{
							this.window.show();
						}
					}
				});
				this.taskbar.add(this.button);
				
				
				this.contextMenu = new Ext.menu.Menu({
					items: [{
						text: 'Close',
						window:this,
						iconCls:'tools-icons x-tool-close',
						handler:function(){this.window.close();}
					}]
				});
				this.button.getEl().on('contextmenu', function(e){
													e.preventDefault();
													this.contextMenu.showAt(e.getX(),e.getY()-10-(this.contextMenu.items.length)*25);
													},this);
				
				this.button.on('destroy', function(){this.window.close();});
				
				//Taskbar button can be destroying
				this.on('destroy',function(){if(this.button.destroying!=true){this.button.destroy();}});
				
				this.on('minimize',function(){this.hide();});
				this.on('deactivate',function(){
					if(this.zIndexManager && this.zIndexManager.front.ghostPanel){
						this.zIndexManager.unregister(this.zIndexManager.front.ghostPanel);
					}
					this.button.toggle(false);
				});
				this.on('activate',function(){this.button.toggle(true);});
				
			}
		}
	});