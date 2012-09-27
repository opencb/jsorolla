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
			case "Transcripts": this.panel.add(this.getSnpTranscriptPanel(this.data.snptotranscript).show()); break;
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


SnpInfoWidget.prototype.getSnpTranscriptPanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.snpTranscriptGrid==null){
    	var tpl = this.getSnpTranscriptTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var snpTranscriptPanel = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(snpTranscriptPanel);
    	}
		this.snpTranscriptGrid = Ext.create('Ext.panel.Panel',{
			title:"Transcripts ("+i+")",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.snpTranscriptGrid;
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
	var cellBaseManager = new CellBaseManager(this.species);
	cellBaseManager.success.addEventListener(function (sender,data){
		_this.dataReceived(JSON.parse(data.result));//TODO
	});
	cellBaseManager.get("feature","snp", this.query, "fullinfo");
};
SnpInfoWidget.prototype.dataReceived = function (data){
	var mappedSnps = data[0];
	for ( var i = 0; i < mappedSnps.length; i++) {
		if (mappedSnps[i].chromosome == this.feature.chromosome && mappedSnps[i].start == this.feature.start && mappedSnps[i].end == this.feature.end ){
			this.data=mappedSnps[i];
			console.log(mappedSnps[i]);
		}
	}
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};
