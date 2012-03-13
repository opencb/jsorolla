TFInfoWidget.prototype.draw = InfoWidget.prototype.draw;
TFInfoWidget.prototype.render = InfoWidget.prototype.render;
TFInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
TFInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
TFInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
TFInfoWidget.prototype.getTranscriptTemplate = InfoWidget.prototype.getTranscriptTemplate;
TFInfoWidget.prototype.getProteinTemplate =InfoWidget.prototype.getProteinTemplate;
TFInfoWidget.prototype.getGeneTemplate = InfoWidget.prototype.getGeneTemplate;
TFInfoWidget.prototype.getPWMTemplate = InfoWidget.prototype.getPWMTemplate;


function TFInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Transcription Factor Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

TFInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Information", children: [
	                { text: "Protein"},
	                { text: "Transcript"}, 
	                { text: "Gene"} 
	            ] },
	            { text: "Regulatory", children: [
  	                { text: "PWM"},//position weight matrix (PWM)
  	                { text: "Target Genes"}
  	            ] },
  	            { text: "Protein Features", children: [
  	              { text: "Protein profile"},//position weight matrix (PWM)
  	              { text: "Mutation sites"},
  	              { text: "Pathways"},
  	              { text: "Related Diseases"}
  	            ] }
	        ];
};
TFInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Protein":  this.panel.add(this.getProteinPanel(this.data.proteins).show()); break;
			case "Transcript": this.panel.add(this.getTranscriptPanel(this.data.transcripts).show()); break;
			case "Gene": this.panel.add(this.getGenePanel(this.data.gene).show()); break;
			case "PWM": this.panel.add(this.getPWMPanel(this.data.pwm).show()); break;
			case "Target Genes": this.panel.add(this.getTargetGenesGrid(this.data.targetGenes).show()); break;
			case "Protein profile": break;
			case "Mutation sites": break;
			case "Pathways": break;
			case "Related Diseases": break;
		}
	}
};

TFInfoWidget.prototype.getProteinPanel = function(data){
    if(this.proteinPanel==null){

    	var tpl = this.getProteinTemplate();

		this.proteinPanel = Ext.create('Ext.panel.Panel',{
			title:"Protein",
	        border:false,
	        cls:'panel-border-left',
			flex:3,    
			bodyPadding:10,
			data:data[0],
			tpl:tpl
		});

    }
    return this.proteinPanel;
};


TFInfoWidget.prototype.getTranscriptPanel = function(data){
    if(this.transcriptGrid==null){
    	
    	var tpl = this.getTranscriptTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var transcriptPanel = Ext.create('Ext.panel.Panel',{
		        border:false,
				bodyPadding:5,
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

TFInfoWidget.prototype.getGenePanel = function(data){
    if(this.genePanel==null){
    	
    	var tpl = this.getGeneTemplate();
    	
		this.genePanel = Ext.create('Ext.panel.Panel',{
			title:"Gene information",
	        border:false,
	        cls:'panel-border-left',
			flex:3,
			bodyPadding:10,
			data:data,
			tpl:tpl
		});

    }
    return this.genePanel;
};

TFInfoWidget.prototype.getPWMPanel = function(data){
    if(this.pwmPanel==null){
    	var tpl = this.getPWMTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var pwmPan = Ext.create('Ext.panel.Panel',{
		        border:false,
				bodyPadding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(pwmPan);
    	}
		this.pwmPanel = Ext.create('Ext.panel.Panel',{
			title:"PWM ("+i+")",
	        border:false,
	        cls:'panel-border-left',
			flex:3,
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.pwmPanel;
};

TFInfoWidget.prototype.getTargetGenesGrid = function(data){
    if(this.targetGenesGrid==null){
//    	console.log(data);
    	
    	if(data.length<=0){
    		this.targetGenesGrid= Ext.create('Ext.panel.Panel',{
    			cls:'panel-border-left',
    			border:false,
    			flex:3,
    			bodyPadding:'40',
    			html:'No results found'
    		});
    	}else{
    		var groupField = '';
    		var modelName = "targetGenes";
    		var fields = ['externalName','stableId','biotype','chromosome','start','end','strand','description'];
    		var columns = [
    		               {header : 'Name',dataIndex: 'externalName',flex:1},
    		               {header : 'Stable Id',dataIndex: 'stableId',flex:2},
    		               {header : 'Biotype',dataIndex: 'biotype',flex:1.5},
    		               {header : 'Chr',dataIndex: 'chromosome',flex:0.5},
    		               {header : 'Start',dataIndex: 'start',flex:1},
    		               {header : 'End',dataIndex: 'end',flex:1},
    		               {header : 'Strand',dataIndex: 'strand',flex:0.5},
    		               {header : 'Description',dataIndex: 'description',flex:1}
    		               ];
    		this.targetGenesGrid = this.doGrid(columns,fields,modelName,groupField);
    		this.targetGenesGrid.store.loadData(data);
    	}
    }
    return this.targetGenesGrid;
};

TFInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function (evt){
		_this.dataReceived(cellBaseDataAdapter.toJSON());
	});
	cellBaseDataAdapter.fill("regulatory","tf", this.feature.getName(), "fullinfo");
	console.log(this.feature.getName());
};
TFInfoWidget.prototype.dataReceived = function (data){
	var parseData = JSON.parse(data);
	this.data=parseData[0];
	this.optionClick({"text":"Protein","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};
