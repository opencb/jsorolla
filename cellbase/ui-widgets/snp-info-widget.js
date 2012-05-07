SnpInfoWidget.prototype.draw = InfoWidget.prototype.draw;
SnpInfoWidget.prototype.render = InfoWidget.prototype.render;
SnpInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
SnpInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
SnpInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
SnpInfoWidget.prototype.getSnpTemplate = InfoWidget.prototype.getSnpTemplate;
SnpInfoWidget.prototype.getSnpTranscriptTemplate = InfoWidget.prototype.getSnpTranscriptTemplate;
SnpInfoWidget.prototype.getConsequenceTypeTemplate = InfoWidget.prototype.getConsequenceTypeTemplate;
SnpInfoWidget.prototype.getPhenotypeTemplate = InfoWidget.prototype.getPhenotypeTemplate;
SnpInfoWidget.prototype.getPopulationTemplate = InfoWidget.prototype.getPopulationTemplate;

function SnpInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "SNP Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

SnpInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Genomic", children: [
	                { text: "Information"},
	                { text: "Transcripts"}
	            ] },
	            { text: "Consequence type"},
	            { text: "Annotated phenotype"},
	            { text: "Population frequency"}
	           
	        ];
};
SnpInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Information":  this.panel.add(this.getInfoPanel(this.data).show()); break;
			case "Transcripts": this.panel.add(this.getTranscriptPanel(this.data.snptotranscript).show()); break;
			case "Consequence type": this.panel.add(this.getConsequenceTypePanel(this.data.snptotranscript).show()); break;
			case "Annotated phenotype": this.panel.add(this.getPhenotypePanel(this.data.phenotype).show()); break;
			case "Population frequency": this.panel.add(this.getPopulationPanel(this.data.population).show()); break;
		}
	}
};

SnpInfoWidget.prototype.getInfoPanel = function(data){
	if(data==null){
		return this.notFoundPanel;
	}
    if(this.infoPanel==null){
    	var tpl = this.getSnpTemplate();

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


SnpInfoWidget.prototype.getTranscriptPanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.transcriptGrid==null){
    	var tpl = this.getSnpTranscriptTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var transcriptPanel = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(transcriptPanel);
    	}
		this.transcriptGrid = Ext.create('Ext.panel.Panel',{
			title:"Transcripts ("+i+")",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.transcriptGrid;
};

SnpInfoWidget.prototype.getConsequenceTypePanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.consequencePanel==null){
    	var tpl = this.getConsequenceTypeTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var consPanel = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(consPanel);
    	}
		this.consequencePanel = Ext.create('Ext.panel.Panel',{
			title:"Consequence type ("+i+")",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.consequencePanel;
};


SnpInfoWidget.prototype.getPhenotypePanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.phenotypePanel==null){
    	var tpl = this.getPhenotypeTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var pan = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(pan);
    	}
		this.phenotypePanel = Ext.create('Ext.panel.Panel',{
			title:"Phenotype ("+i+")",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.phenotypePanel;
};



SnpInfoWidget.prototype.getPopulationPanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.populationPanel==null){
    	var tpl = this.getPopulationTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var pan = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(pan);
    	}
		this.populationPanel = Ext.create('Ext.panel.Panel',{
			title:"Population ("+i+")",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.populationPanel;
};


SnpInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function (evt){
		_this.dataReceived(JSON.parse(cellBaseDataAdapter.toJSON()));//TODO
	});
	cellBaseDataAdapter.fill("feature","snp", this.feature.getName(), "fullinfo");
};
SnpInfoWidget.prototype.dataReceived = function (data){
	var mappedSnps = data[0];
	for ( var i = 0; i < mappedSnps.length; i++) {
		if (mappedSnps[i].chromosome == this.feature.feature.chromosome && mappedSnps[i].start == this.feature.start && mappedSnps[i].end == this.feature.end ){
			this.data=mappedSnps[i];
			console.log(mappedSnps[i]);
		}
	}
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};
