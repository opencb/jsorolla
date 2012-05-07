VCFVariantInfoWidget.prototype.draw = InfoWidget.prototype.draw;
VCFVariantInfoWidget.prototype.render = InfoWidget.prototype.render;
VCFVariantInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
VCFVariantInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
VCFVariantInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
VCFVariantInfoWidget.prototype.getVCFVariantTemplate = InfoWidget.prototype.getVCFVariantTemplate;
VCFVariantInfoWidget.prototype.getVariantEffectTemplate = InfoWidget.prototype.getVariantEffectTemplate;

function VCFVariantInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "VCF variant Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

VCFVariantInfoWidget.prototype.getdataTypes = function (){
	return dataTypes=[
	            { text: "Genomic", children: [
	                { text: "Information"},
	                { text: "Variant effect"}
	            ] }
	        ];
};
VCFVariantInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Information":  this.panel.add(this.getInfoPanel(this.data.feature).show()); break;
			case "Variant effect":this.panel.add(this.getEffectPanel(this.data.consequenceType).show()); break;
			case "Population": break;
		}
	}
};

VCFVariantInfoWidget.prototype.getInfoPanel = function(data){
	if(data==null){
		return this.notFoundPanel;
	}
    if(this.infoPanel==null){

    	var tpl = this.getVCFVariantTemplate();

		this.infoPanel = Ext.create('Ext.panel.Panel',{
			title:"Information",
	        border:false,
	        cls:'panel-border-left',
			flex:3,    
			bodyPadding:10,
			data:data,
			tpl:tpl
		});

    }
    return this.infoPanel;
};

VCFVariantInfoWidget.prototype.getEffectPanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
	for ( var i = 0; i < data.length; i++) {
		data[i].consequence = data[i].consequenceType+" - "+data[i].consequenceTypeObo;
		if(data[i].featureName == ""){data[i].featureName="-";}
		if(data[i].geneId == ""){data[i].geneId="-";}
		if(data[i].transcriptId == ""){data[i].transcriptId="-";}
		if(data[i].featureBiotype == ""){data[i].featureBiotype="-";}
		if(data[i].aaPosition == ""){data[i].aaPosition="-";}
		if(data[i].aminoacidChange == ""){data[i].aminoacidChange="-";}

	}
	
    if(this.effectGrid==null){
    	var groupField = 'consequence';
    	var modelName = "effectGridModel";
    	var fields = ['featureName','geneId','transcriptId','featureBiotype','aaPosition','aminoacidChange','consequence'];
    	var columns = [
    	               {header : 'Feature',dataIndex: 'featureName',flex:1},
    	               {header : 'Gene Id',dataIndex: 'geneId',flex:1.5},
    	               {header : 'Transcript Id',dataIndex: 'transcriptId',flex:1.5},
    	               {header : 'Feat.Biotype',dataIndex: 'featureBiotype',flex:1},
    	               {header : 'aa Position',dataIndex: 'aaPosition',flex:1},
    	               {header : 'aa Change',dataIndex: 'aminoacidChange',flex:1}
    	               ];
    	this.effectGrid = this.doGrid(columns,fields,modelName,groupField);
    	this.effectGrid.store.loadData(data);
    }
    return this.effectGrid;
	
//    if(this.effectPanel==null){
//    	var tpl = this.getVariantEffectTemplate();
//    	//sort by consequenceTypeObo
//    	data.sort(function(a,b){
//    		if(a.consequenceTypeObo == b.consequenceTypeObo){return 0;}
//    		return (a.consequenceTypeObo < b.consequenceTypeObo) ? -1 : 1;
//    	});
//    	
//    	
//    	var panels = [];
//    	for ( var i = 0; i < data.length; i++) {
//			var transcriptPanel = Ext.create('Ext.container.Container',{
//				padding:5,
//				data:data[i],
//				tpl:tpl
//			});
//			panels.push(transcriptPanel);
//    	}
//		this.effectPanel = Ext.create('Ext.panel.Panel',{
//			title:"Effects ("+i+")",
//			border:false,
//			cls:'panel-border-left',
//			flex:3,    
//			bodyPadding:5,
//			autoScroll:true,
//			items:panels
//		});
//    }
//    return this.effectPanel;
};


VCFVariantInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
	
	
	
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function (evt){
		console.log(cellBaseDataAdapter.toJSON());
		_this.dataReceived(cellBaseDataAdapter.toJSON());//TODO
	});
	console.log(this.feature.feature);
	var query = this.feature.feature.chromosome+":"+this.feature.feature.start+":"+this.feature.feature.ref+":"+this.feature.feature.alt;
	cellBaseDataAdapter.fill("genomic","variant", query, "consequence_type");
	
//	this.dataReceived(this.feature);
};

VCFVariantInfoWidget.prototype.dataReceived = function (data){
	this.data = new Object();
	this.data["feature"] = this.feature.feature;
	this.data["consequenceType"] = data;
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};
