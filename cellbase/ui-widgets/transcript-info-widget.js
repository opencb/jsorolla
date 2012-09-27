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

TranscriptInfoWidget.prototype.draw = InfoWidget.prototype.draw;
TranscriptInfoWidget.prototype.render = InfoWidget.prototype.render;
TranscriptInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
TranscriptInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
TranscriptInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
TranscriptInfoWidget.prototype.getGeneTemplate = InfoWidget.prototype.getGeneTemplate;
TranscriptInfoWidget.prototype.getTranscriptTemplate = InfoWidget.prototype.getTranscriptTemplate;
TranscriptInfoWidget.prototype.getExonTemplate = InfoWidget.prototype.getExonTemplate;
//shared with gene
TranscriptInfoWidget.prototype.get3Dprotein = GeneInfoWidget.prototype.get3Dprotein;
TranscriptInfoWidget.prototype.getGenePanel = GeneInfoWidget.prototype.getGenePanel;
TranscriptInfoWidget.prototype.getXrefGrid = GeneInfoWidget.prototype.getXrefGrid;
TranscriptInfoWidget.prototype.getTfbsGrid = GeneInfoWidget.prototype.getTfbsGrid;
TranscriptInfoWidget.prototype.getMirnaTargetGrid = GeneInfoWidget.prototype.getMirnaTargetGrid;
TranscriptInfoWidget.prototype.getProteinFeaturesGrid = GeneInfoWidget.prototype.getProteinFeaturesGrid;

function TranscriptInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Transcript";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

TranscriptInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Genomic", children: [
	                 { text: "Information"},
	                 { text: "Gene"},
	                 { text: "Exons"}
	            ] },
	            { text: "Functional information", children: [
	                  { text: "GO"},
	                  { text: "Reactome"},
	                  { text: "Interpro"}
	            ] },
	            { text: "Variation", children: [
	                  { text: "SNPs"},
	                  { text: "Mutations"}
	            ] },
	            { text: "Regulatory", children: [
	                  { text: "TFBS"},
	                  { text: "miRNA targets"}                   
	            ]},
	            { text:"Protein", children: [
	                  { text: "Features"},//protein profile
	                  { text: "3D structure"}
	            ]}	            
	        ];
};
TranscriptInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Information": this.panel.add(this.getInfoPanel(this.data).show()); break;
			case "Gene": this.panel.add(this.getGenePanel(this.data.gene).show());  break;
			case "Exons": this.panel.add(this.getExonsGrid(this.data.exons).show());  break;
			case "GO": this.panel.add(this.getXrefGrid(this.data.go, "GO").show());  break;
			case "Interpro": this.panel.add(this.getXrefGrid(this.data.interpro, "Interpro").show());  break;
			case "Reactome": this.panel.add(this.getXrefGrid(this.data.reactome, "Reactome").show());  break;
			case "SNPs": this.panel.add(this.getSnpsGrid(this.data.snps).show());  break;
			case "Mutations": this.panel.add(this.getMutationsGrid(this.data.mutations).show());  break;
			case "TFBS": this.panel.add(this.getTfbsGrid(this.data.tfbs).show());  break;
			case "miRNA targets": this.panel.add(this.getMirnaTargetGrid(this.data.mirnaTargets).show());  break;
			case "Features": this.panel.add(this.getProteinFeaturesGrid(this.data.proteinFeatures).show());  break;
			case "3D structure": this.panel.add(this.get3Dprotein(this.data.snps).show());  break;
		}
	}
};

TranscriptInfoWidget.prototype.getInfoPanel = function(data){
	if(data==null){
		return this.notFoundPanel;
	}
	if(this.infoPanel==null){
		
    	var tpl = this.getTranscriptTemplate();
    	
		this.infoPanel = Ext.create('Ext.panel.Panel',{
			title:"Information",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:10,
			autoScroll:true,
			data:data,//para el template
			tpl:tpl
		});
	}
	return this.infoPanel;
};


TranscriptInfoWidget.prototype.getExonsGrid = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.exonsGrid==null){

    	var tpl = this.getExonTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var exonPanel = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(exonPanel);
    	}
		this.exonsGrid = Ext.create('Ext.panel.Panel',{
			title:"Exons ("+i+")",
	        border:false,
	        cls:'panel-border-left',
			flex:3,
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.exonsGrid;
};



//TODO hay muchos y tarda
TranscriptInfoWidget.prototype.getSnpsGrid = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.snpsGrid==null){
    	var groupField = '';
    	var modelName = 'SNPs';
	    var fields = ['chromosome','start','end','name',"strand","alleleString","displaySoConsequence"];
		var columns = [
		               	{header : 'Name',dataIndex: 'name',flex:2},
		               	{header : 'Location: chr:start-end (strand)', xtype:'templatecolumn', tpl:'{chromosome}:{start}-{end} ({strand})',flex:2},
						{header : 'Alleles',dataIndex: 'alleleString',flex:0.7},
						{header : 'Most severe SO term',dataIndex: 'displaySoConsequence',flex:2}
		             ];
		this.snpsGrid = this.doGrid(columns,fields,modelName,groupField);
		this.snpsGrid.store.loadData(data);
    }
    return this.snpsGrid;
};

TranscriptInfoWidget.prototype.getMutationsGrid = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.mutationsGrid==null){
    	var groupField = '';
    	var modelName = 'Mutations';
	    var fields = ["chromosome","start","end","mutationAa","mutationCds","primaryHistology","source"];
		var columns = [
		                {header : 'Mutation AA',dataIndex: 'mutationAa',flex:1},
		               	{header : 'Mutation CDS',dataIndex: 'mutationCds',flex:1.5},
		               	{header : 'Location: chr:start-end', xtype:'templatecolumn', tpl:'{chromosome}:{start}-{end}',flex:1.7},
						{header : 'Primary histology',dataIndex: 'primaryHistology',flex:1},
						{header : 'Source',dataIndex: 'source',flex:1}
		             ];
		this.mutationsGrid = this.doGrid(columns,fields,modelName,groupField);
		this.mutationsGrid.store.loadData(data);
    }
    return this.mutationsGrid;
};


TranscriptInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	
	var cellBaseManager = new CellBaseManager(this.species);
	cellBaseManager.success.addEventListener(function(sender,data){
		_this.dataReceived(JSON.parse(data.result));//TODO
	});
	cellBaseManager.get("feature","transcript", this.query, "fullinfo");
};
TranscriptInfoWidget.prototype.dataReceived = function (data){
	this.data=data[0];
	console.log(this.data);
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};



