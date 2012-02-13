function LegendWidget(args){
	
	this.width = 300;
	this.height = 300;
	this.title = "Legend";
	
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
	
	this.legendPanel = new LegendPanel();
	
};

LegendWidget.prototype.draw = function(legend){
	var _this = this;
	if(this.panel==null){
		
		var item = this.legendPanel.getPanel(legend);
	
		this.panel = Ext.create('Ext.ux.Window', {
			title : this.title,
			resizable: false,
			constrain:true,
			closable:true,
			width: item.width+10,
			height: item.height+70,
			items : [item],
			buttonAlign:'right',
			 layout: {
		        type: 'hbox',
		        align:'stretch' 
		    },
			buttons:[
					{text:'Close', handler: function(){_this.panel.close();}}
			]
		});
	}
	this.panel.show();
	
	
};