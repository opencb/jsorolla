function FilterPanel(args){
	var this_=this;
	this.id = "FilterPanel_" + Math.round(Math.random()*10000000);
	this.targetId = null;
	
	this.title=null;
	this.width=null;
	this.height=null;
	
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
FilterPanel.prototype.draw = function (arr){
	var arr = ["manzanas","pera","meloconton","sandia","melon","naranja","manzanas","pera","meloconton","sandia","melon","naranja","manzanas","pera","meloconton","sandia","melon","naranja"];
	this.render(arr);
	
	if (this.targetId != null){
		this.panel.render(this.targetId);
	}
	
};
FilterPanel.prototype.render = function (arr){

	var items = [];
	for (var i = 0; i < arr.length; i++) {
		items.push({boxLabel:arr[i],checked:true});
	}
	
	if (this.panel == null){
		this.panel = Ext.create('Ext.panel.Panel', {
			title: this.title,
		    width: this.width,
		    height: this.height,
		    layout: 'vbox',
		    defaultType: 'checkboxfield',
		    items: items
		});
	}
};