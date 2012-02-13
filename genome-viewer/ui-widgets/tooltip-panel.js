function TooltipPanel(args){
	this.id = "TooltipPanel" + Math.round(Math.random()*10000000);
	this.targetId = null;
	this.width = 100;
	this.height = 60;
	
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

TooltipPanel.prototype.getPanel = function(item){
	var _this=this;
	
	if (this.panel == null){
		this.panel = Ext.create('Ext.tip.Tip',{
			html:this._getItemInfo(item)
		});
	}	
	return this.panel;
};

TooltipPanel.prototype.destroy = function(){
	this.panel.destroy();
};

TooltipPanel.prototype._getItemInfo = function(item){
//	console.log(item);
	var str = "";
	if(item instanceof GeneFeatureFormatter || 
	   item instanceof TranscriptFeatureFormatter || 
	   item instanceof ExonFeatureFormatter || 
	   item instanceof SNPFeatureFormatter|| 
	   item instanceof TfbsFeatureFormatter ){
		str = '<span class="ssel">'+item.getName()+'</span><br>'+
		'start: <span class="emph">'+item.start+'</span><br>'+
		'end:  <span class="emph">'+item.end+'</span><br>'+
		'length: <span class="info">'+(item.end-item.start+1)+'</span><br>';
		
	}
	if(item instanceof VCFFeatureFormatter){
		str = '<span class="ssel">'+item.getName()+'</span><br>';
	}
	return str;
};