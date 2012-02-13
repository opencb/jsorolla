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
