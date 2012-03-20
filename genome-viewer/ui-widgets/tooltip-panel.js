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
	
	if(item instanceof GenericFeatureFormatter){
		str = 
		'start: <span class="emph">'+item.start+'</span><br>'+
		'end:  <span class="emph">'+item.end+'</span><br>'+
		'length: <span class="info">'+(item.end-item.start+1)+'</span><br>';
	}
	
	if(item instanceof BEDFeatureFormatter){
		str = "";
		if(item.score!=null){
			str+='Score: <span class="ssel">'+item.score+'</span> &nbsp; &nbsp';
		}
		if(item.strand!=null){
			str+='Strand:<span class="ok">'+item.strand+'</span><br>';
		}
		str+= 'Pos: <span class="emph">'+item.chromosome+':'+item.start+"-"+item.end+'</span><br>';
		str+= 'Length: <span class="info">'+(item.end-item.start+1)+'</span><br>';
		if(item.thickStart != null && item.thickEnd != null){
			str+='ThickPos: <span class="emph">'+item.thickStart+"-"+item.thickEnd+'</span><br>';
			str+='ThickLength: <span class="info">'+(item.thickEnd-item.thickStart+1)+'</span><br>';
		}
		if(item.blockCount!=null){
			str+='BlockCount: <span class="ok">'+item.blockCount+'</span><br>';
		}
		if(item.blockSizes!=null){
			str+='BlockSizes: <span class="ok">'+item.blockSizes+'</span><br>';
		}
		if(item.blockStarts!=null){
			str+='BlockStarts: <span class="ok">'+item.blockStarts+'</span><br>';
		}
	}
	
	if(item instanceof GeneFeatureFormatter || 
	   item instanceof TranscriptFeatureFormatter || 
	   item instanceof ExonFeatureFormatter || 
	   item instanceof SNPFeatureFormatter|| 
	   item instanceof TfbsFeatureFormatter ||
	   item instanceof MutationFeatureFormatter ||
	   item instanceof CpgIslandFeatureFormatter ||
	   item instanceof StructuralVariationFeatureFormatter ||
	   item instanceof MiRNAFeatureFormatter
	){
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