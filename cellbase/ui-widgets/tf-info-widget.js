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

TFInfoWidget.prototype.draw = InfoWidget.prototype.draw;
TFInfoWidget.prototype.render = InfoWidget.prototype.render;
TFInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
TFInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
TFInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
TFInfoWidget.prototype.getTranscriptTemplate = InfoWidget.prototype.getTranscriptTemplate;
TFInfoWidget.prototype.getProteinTemplate =InfoWidget.prototype.getProteinTemplate;
TFInfoWidget.prototype.getGeneTemplate = InfoWidget.prototype.getGeneTemplate;
TFInfoWidget.prototype.getPWMTemplate = InfoWidget.prototype.getPWMTemplate;
TFInfoWidget.prototype.getProteinXrefTemplate = InfoWidget.prototype.getProteinXrefTemplate;

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
  	              { text: "Protein interactions"},
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
			case "Protein profile": this.panel.add(this.getProteinFeatureGrid(this.data.protein_feature, "Protein profile").show());  break;
			case "Mutation sites": this.panel.add(this.getProteinFeatureGrid(this.data.protein_feature, "Mutation sites").show());  break;
			case "Pathways": this.panel.add(this.getProteinXrefPanel(this.data.protein_xref, "Pathway").show()); break;
			case "Protein interactions": this.panel.add(this.getProteinXrefPanel(this.data.protein_xref, "Interaction").show()); break;
			case "Related Diseases": this.panel.add(this.getProteinXrefPanel(this.data.protein_xref, "Disease").show()); break;
		}
	}
};

TFInfoWidget.prototype.getProteinPanel = function(data){
	if(data==null){
		return this.notFoundPanel;
	}
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
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.transcriptGrid==null){
    	
    	var tpl = this.getTranscriptTemplate();
    	
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

TFInfoWidget.prototype.getGenePanel = function(data){
	if(data==null){
		return this.notFoundPanel;
	}
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
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.pwmPanel==null){
    	var tpl = this.getPWMTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var pwmPan = Ext.create('Ext.container.Container',{
				padding:5,
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
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.targetGenesGrid==null){
//    	console.log(data);
    	
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
    return this.targetGenesGrid;
};


TFInfoWidget.prototype.getProteinFeatureGrid = function(data, type){
//	console.log(data.length)
    if(this[type+"Grid"]==null){
//    	console.log(data);
    	
    	//Filtering Mutagenesis
		var notMutaData = new Array();
		var mutaData = new Array();
		for ( var i = 0; i < data.length; i++) {
			if(data[i].type=="mutagenesis site"){
				mutaData.push(data[i]);
			}else{
				notMutaData.push(data[i]);
			}
		}    	
		
    	if(type!=null){
    		if(type=="Protein profile"){
    			var data = notMutaData;
    		}
    		if(type=="Mutation sites"){
    			var data = mutaData;
    		}
    	}
    	if(data.length<=0){
    		return this.notFoundPanel;
    	}
    	
    	var groupField = '';
    	var modelName = type;
    	var fields = ['type','start','end','original','variation','description'];
    	var columns = [
    	               {header : 'Type',dataIndex: 'type',flex:1.5},
    	               {header : 'Start',dataIndex: 'start',flex:0.5},
    	               {header : 'End',dataIndex: 'end',flex:0.5},
    	               {header : 'Original',dataIndex: 'original',flex:0.7},
    	               {header : 'Variation',dataIndex: 'variation',flex:0.7},
    	               {header : 'Description',dataIndex: 'description',flex:3}
    	               ];
    	this[type+"Grid"] = this.doGrid(columns,fields,modelName,groupField);
    	this[type+"Grid"].store.loadData(data);
    }
    return this[type+"Grid"];
};

TFInfoWidget.prototype.getProteinXrefPanel = function(data, type){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this[type+"panel"]==null){
    	var tpl = this.getProteinXrefTemplate();
    	
    	//Filtering Xref
		var pathwayData = new Array();
		var interacData = new Array();
		var diseaseData = new Array();
		
		for ( var i = 0; i < data.length; i++) {
			var src = data[i].source;
			if(src=="Go" || src=="Reactome" || src=="KEGG"){
				pathwayData.push(data[i]);
			}
			if(src=="IntAct" || src=="MINT" || src=="DIP" || src=="String"){
				interacData.push(data[i]);
			}
			if(src=="MIN" || src=="PharmGKB" || src=="Orphanet"){
				diseaseData.push(data[i]);
			}
		}
		
    	if(type!=null){
    		switch(type){
    		case "Pathway":data = pathwayData;break;
    		case "Interaction":data = interacData;break;
    		case "Disease":data = diseaseData;break;
    		}
    	}
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var pan = Ext.create('Ext.panel.Panel',{
		        border:false,
				bodyPadding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(pan);
    	}
    	this[type+"panel"] = Ext.create('Ext.panel.Panel',{
			title:type+" ("+i+")",
	        border:false,
	        cls:'panel-border-left',
			flex:3,
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this[type+"panel"];
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
	console.log(this.data);
	this.optionClick({"text":"Protein","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};
