	/*Nuevo tipo ventana*/
	Ext.define("Ext.ux.Window",{
		extend:"Ext.window.Window",
		minimizable:true,
		constrain:true,
		collapsible:true,
		initComponent: function () {
			this.callParent();
			this.taskbar = Ext.getCmp('uxTaskbar');//si no existe, las ventanas funcionan como hasta ahora
			if(this.taskbar!=null){
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