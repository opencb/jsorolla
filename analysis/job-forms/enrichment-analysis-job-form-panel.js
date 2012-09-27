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

EnrichmentAnalysisJobFormPanel.prototype.draw = JobFormPanel.prototype.draw;
EnrichmentAnalysisJobFormPanel.prototype.render = JobFormPanel.prototype.render;
EnrichmentAnalysisJobFormPanel.prototype.getRunButtonPanel = JobFormPanel.prototype.getRunButtonPanel;
//EnrichmentAnalysisJobFormPanel.prototype.getTreePanel = JobFormPanel.prototype.getTreePanel;
//EnrichmentAnalysisJobFormPanel.prototype.checkDataTypes = JobFormPanel.prototype.checkDataTypes;

function EnrichmentAnalysisJobFormPanel(args){
	var _this=this;
	if (args == null){
		args = new Object();
	}
	
	args.title = "Enrichment analysis form";
	JobFormPanel.prototype.constructor.call(this, args);
	
	this.widthFormPage = "60%";
	/** Web Service params **/
	this.paramsWS = new Object();
	this.paramsWS["sessionid"] = null;
	this.paramsWS["jobname"] = null;
	
	this.paramsWS["tool"] = "fatigo";//por defecto FatiGO // fatigo | fatiscan
	this.paramsWS["method"] = null;// fatiscan | logistic
	
	this.paramsWS["species"]="hsa";
	
	this.paramsWS["data-fileid"]=null;
	this.paramsWS["annotations-fileid"] = null;// fatiscan
	
	this.tags = ["idlist","gene"];//por defecto FatiGO
	this.annotationTags = ["annotation"];
	
	this.browserData = new BrowserDataWidget({retrieveData:false});
	this.browserData.onSelect.addEventListener(function (sender, data){
		_this.fileBrowserLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
		_this.paramsWS["data-fileid"]=data.dataId;
		_this.validateRunButton();
		
//		if(_this.paramsWS["tool"]!=null){
//			if(_this.paramsWS["tool"] == "fatigo")
//				_this.paramsWS["list1-fileid"] = data.dataId;
//			if(_this.paramsWS["tool"] == "fatiscan")
//				_this.paramsWS["ranked-list-fileid"] = data.dataId;
//		}
//		//
	});	
	
	this.customDataId=null;
	this.annotationBrowserData = new BrowserDataWidget({retrieveData:false});
	this.annotationBrowserData.onSelect.addEventListener(function (sender, data){
		_this.fileAnnotationLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
		_this.customDataId = data.dataId;
		_this.paramsWS["annotations-fileid"] = data.dataId;
		_this.validateRunButton();
	});	
};


EnrichmentAnalysisJobFormPanel.prototype.getForms = function (){
  		var items = [
  		            this._getSpeciesForm(),
 	             	this._getFuncAnalForm(),
 	             	this._getBrowseForm(),
 	             	this._getDatabasesForm(),
 	             	this.getRunButtonPanel()
 	             	];
		var form1234 = Ext.create('Ext.panel.Panel', {
			border:true,
//			layout:{type:'vbox', align: 'stretch'},
		    buttonAlign:'center',
//			height:680,
			width: "80%",
			items: items
		});
		return [this._getExampleForm(),form1234];
};

EnrichmentAnalysisJobFormPanel.prototype._getExampleForm = function (){
	var _this = this;
	
	var example1 = Ext.create('Ext.container.Container', {
		html:'<p class="emph u">Load example 1. (Homo sapiens) </span> <span class="info s110">Searching for significant TFs</p>',
		cls:'dedo inlineblock',
		listeners:{
			afterrender:function(){
				this.getEl().on("click",function(){_this.loadExampleTfbs();});
			}
		}
	});
	var example2 = Ext.create('Ext.container.Container', {
		html:'<p class="emph u">Load example 2. (Mus musculus) </span> <span class="info s110">Searching for significant miRNA</p>',
		cls:'dedo',
		listeners:{
			afterrender:function(){
				this.getEl().on("click",function(){_this.loadExampleMirna();});
			}
		}
	});
	
	var example3 = Ext.create('Ext.container.Container', {
		html:'<p class="emph u">Load example 3. (Homo sapiens) </span> <span class="info s110">Searching for significant TFs with Fatiscan</p>',
		cls:'dedo',
		listeners:{
			afterrender:function(){
				this.getEl().on("click",function(){_this.loadExampleFatiscan();});
			}
		}
	});
	
	var exampleForm = Ext.create('Ext.container.Container', {
		bodyPadding:10,
		items: [this.note1,example1,example2,example3],
		defaults:{margin:'5 0 0 5'}
	});
	
	return exampleForm;
};


EnrichmentAnalysisJobFormPanel.prototype._getSpeciesForm = function (){
	var _this=this;
	var hsaRadio = Ext.create('Ext.form.field.Radio', {
		 id:this.id+"_hsaSpeciesRadio",
		 boxLabel : "Human (Homo sapiens)",
		 name : "SpeciesForm",
		 checked:true,
		 listeners:{
			 change:function(){
				 if(this.getValue()){
					 _this.paramsWS["species"]="hsa";
		  		}
			 }
		 }
	});
	var mmuRadio = Ext.create('Ext.form.field.Radio', {
		 id:this.id+"_mmuSpeciesRadio",
		 boxLabel : "Mouse (Mus musculus)",
		 name : "SpeciesForm",
		 listeners:{
			 change:function(){
				 if(this.getValue()){
					 _this.paramsWS["species"]="mmu";
		  		}
			 }
		 }
	});
	
	var speciesForm = Ext.create('Ext.panel.Panel', {
		title:"Species",
		border:false,
		bodyPadding:10,
		items: [hsaRadio,mmuRadio]
	});
	
  	return speciesForm;
};

EnrichmentAnalysisJobFormPanel.prototype._getFuncAnalForm = function (){
	var _this = this;
	var seaLabel = Ext.create('Ext.container.Container', {
		html:'<span class="emph">Simple enrichment analysis</span>'
	});
	var gsaLabel = Ext.create('Ext.container.Container', {
		margin:"15 0 0 0",
		html:'<span class="emph">Gene set analysis</span>'
	});
	
	var fatigoRadio = Ext.create('Ext.form.field.Radio', {
		 id:this.id+"_fatigoRadio",
		 boxLabel : "FatiGO",
		 name : "FunctionalAnalysisForm",
		 checked:true,
		 listeners:{
			 change:function(){
				 if(this.getValue()){
					 Ext.getCmp(_this.id+"_fileBrowserLabel").setText('<p class="emph">No file selected.</p>');
					 _this.paramsWS["data-fileid"]=null;
		  			_this.setFatigoParams();
		  		}
			 }
		 }
	});
	
	
	var fatiscanRadio = Ext.create('Ext.form.field.Radio', {
		 id:this.id+"_fatiscanRadio",
		 boxLabel : "Fatiscan",
		 name : "FunctionalAnalysisForm",
		 listeners:{
			 change:function(){
				 if(this.getValue()){
					 Ext.getCmp(_this.id+"_fileBrowserLabel").setText('<p class="emph">No file selected.</p>');
					 _this.paramsWS["data-fileid"]=null;
		  			_this.setFatiscanParams("fatiscan");
		  		}
			 }
		 }
	});
	
	var logisticRadio = Ext.create('Ext.form.field.Radio', {
		 id:this.id+"_logisticRadio",
		 boxLabel : "Logistic Model",
		 name : "FunctionalAnalysisForm",
		 listeners:{
			 change:function(){
				 if(this.getValue()){
					 Ext.getCmp(_this.id+"_fileBrowserLabel").setText('<p class="emph">No file selected.</p>');
					 _this.paramsWS["data-fileid"]=null;
		  			_this.setFatiscanParams("logistic");
		  		}
			 }
		 }
	});
	
 	var funcAnalForm = Ext.create('Ext.panel.Panel', {
		title:"Functional Analysis",
		border:false,
		cls:'panel-border-top',
		bodyPadding:10,
		items: [seaLabel,fatigoRadio,gsaLabel,fatiscanRadio,logisticRadio]
	});
	
  	return funcAnalForm;
};

EnrichmentAnalysisJobFormPanel.prototype.setFatigoParams = function (){
	this.tags = ["idlist","gene"];
	this.paramsWS["tool"]="fatigo";
	this.paramsWS["method"]=null;
	this.validateRunButton();
};
EnrichmentAnalysisJobFormPanel.prototype.setFatiscanParams = function (method){
	this.tags = ["ranked"];
	this.paramsWS["tool"] = "fatiscan";
	this.paramsWS["method"] = method;
	this.validateRunButton();
};
EnrichmentAnalysisJobFormPanel.prototype._getBrowseForm = function (){
	var _this = this;
	
	var note1 = Ext.create('Ext.container.Container', {
		html:'<p>Please select a file from your <span class="info">server account</span> using the <span class="emph">Browse data</span> button.</p>'
	});
	this.fileBrowserLabel = Ext.create('Ext.toolbar.TextItem', {
		id:this.id+"_fileBrowserLabel",
		margin:"2 0 0 5",
		html:'<p class="emph">No file selected.</p>'
	});
	var btnBrowse = Ext.create('Ext.button.Button', {
		text: 'Browse file',
		handler: function (){
			_this.browserData.draw($.cookie('bioinfo_sid'),_this.tags);
		}
	});
	var browse = Ext.create('Ext.container.Container', {
		margin:"5 0 0 0",
		layout: 'hbox',
		items:[btnBrowse,this.fileBrowserLabel]
	});
	
	
	var note2 = Ext.create('Ext.container.Container', {
		margin:"20 0 0 0",
		html:'<p>Remember that files must be uploaded before using them. To upload a file, please use the <span class="emph">Upload data</span> button.</p>'
	});	
	var btnUpload = Ext.create('Ext.button.Button', {
		margin:"5 0 0 0",
		text: 'Upload data',
		iconCls:'icon-upload',
		handler: function (){
			_this.uploadWidget.draw();
		}
	});
	
	var formBrowser = Ext.create('Ext.panel.Panel', {
		title:"Select your data",
		border:false,
		cls:'panel-border-top',
		bodyPadding:10,
		items: [note1,browse,note2,btnUpload]
	});
	return formBrowser;
};

EnrichmentAnalysisJobFormPanel.prototype._getDatabasesForm = function (){
	var _this = this;
	
	var hsaLabel = Ext.create('Ext.toolbar.TextItem', {
		margin:"0 0 0 0",
		html:'<span class="emph">Select Annotation</span>'
	});
	var customLabel = Ext.create('Ext.toolbar.TextItem', {
		margin:"15 0 0 0",
		html:'<span class="emph">Custom annotation</span>'
	});
	this.btnAnnotationBrowse = Ext.create('Ext.button.Button', {
        text: 'Browse annotation file',
        disabled:false,
        hidden:false,
        handler: function (){
	   		_this.annotationBrowserData.draw($.cookie('bioinfo_sid'),_this.annotationTags);
   		}
	});
	this.fileAnnotationLabel = Ext.create('Ext.toolbar.TextItem', {
		margin:"2 0 0 5",
		html:'<p class="emph">No file selected.</p>'
	});
	
	var browse = Ext.create('Ext.container.Container', {
		margin:"5 0 0 0",
		layout: 'hbox',
		hidden:true,
		items:[this.btnAnnotationBrowse,this.fileAnnotationLabel]
	});
	
	
	
	var tfbsRadio = Ext.create('Ext.form.field.Radio', {
		 id:this.id+"_tfbsRadio",
		 boxLabel : "TFBS (Transcription Factor Binding Site)",
		 name : "DatabasesForm",
		 listeners:{
			 change:function(){
				 if(this.getValue()){
					 mirnaCuratedRadio.disable();
					 mirnaPredictedRadio.disable();
					 mirnaAllRadio.disable();
					 _this.validateDatabasesForm("tf");
		  		}
			 }
		 }
	});
	
	
	var mirnaCuratedRadio = Ext.create('Ext.form.field.Radio', {
		id:this.id+"_mirnaCuratedRadio",
		margin:"0 0 0 15",
		boxLabel : "Curated miRNA targets",
		name : "MirnaDatabasesForm",
		listeners:{
			change:function(){
				if(this.getValue()){
					_this.validateDatabasesForm("curated_mirna");
				}
			}
		}
	});
	
	var mirnaPredictedRadio = Ext.create('Ext.form.field.Radio', {
		id:this.id+"_mirnaPredictedRadio",
		margin:"0 0 0 15",
		boxLabel : "Computational predicted miRNA targets",
		name : "MirnaDatabasesForm",
		listeners:{
			change:function(){
				if(this.getValue()){
					_this.validateDatabasesForm("predicted_mirna");
				}
			}
		}
	});
	
	var mirnaAllRadio = Ext.create('Ext.form.field.Radio', {
		id:this.id+"_mirnaAllRadio",
		margin:"0 0 0 15",
		boxLabel : "All miRNA targets",
		name : "MirnaDatabasesForm",
		listeners:{
			change:function(){
				if(this.getValue()){
					_this.validateDatabasesForm("all_mirna");
				}
			}
		}
	});
	
	var mirnaRadio = Ext.create('Ext.form.field.Radio', {
		id:this.id+"_mirnaRadio",
		boxLabel : "miRNA",
		name : "DatabasesForm",
		listeners:{
			change:function(){
				if(this.getValue()){
					mirnaCuratedRadio.enable();
					mirnaCuratedRadio.setValue(true);
					mirnaPredictedRadio.enable();
					mirnaAllRadio.enable();
				}
			}
		}
	});
	
	var yourRadio = Ext.create('Ext.form.field.Radio', {
		 id:this.id+"_yourRadio",
		 boxLabel : "Your annotations",
		 name : "DatabasesForm",
		 listeners:{
			 change:function(){
				 if(this.getValue()){
					 browse.show();
					 _this.validateDatabasesForm(_this.customDataId);
		  		}else{
		  			browse.hide();
		  		}
			 }
		 }
	});
	
	
	
  	var databasesForm = Ext.create('Ext.panel.Panel', {
		title:"Databases",
		border:false,
		cls:'panel-border-top',
		bodyPadding:10,
		items: [hsaLabel,tfbsRadio,mirnaRadio,mirnaCuratedRadio,mirnaPredictedRadio,mirnaAllRadio,customLabel,yourRadio,browse]
	});
	
  	return databasesForm;
};





EnrichmentAnalysisJobFormPanel.prototype.loadExampleTfbs = function (){
	Ext.getCmp(this.id+"_fatigoRadio").setValue(true);
	this.paramsWS["data-fileid"]="example1";
	Ext.getCmp(this.id+"_tfbsRadio").setValue(true);
	Ext.getCmp("jobNameField_"+this.id).setValue("example TFBS");
	this.fileBrowserLabel.setText('<span class="emph">hsa_example_genes.txt</span> <span class="info">(server)</span>',false);
	Ext.getCmp(this.id+"_hsaSpeciesRadio").setValue(true);
};
EnrichmentAnalysisJobFormPanel.prototype.loadExampleMirna = function (){
	Ext.getCmp(this.id+"_fatigoRadio").setValue(true);
	this.paramsWS["data-fileid"]="example2";
	Ext.getCmp(this.id+"_mirnaRadio").setValue(true);
	Ext.getCmp(this.id+"_mirnaAllRadio").setValue(true);
	Ext.getCmp("jobNameField_"+this.id).setValue("example miRNA");
	this.fileBrowserLabel.setText('<span class="emph">mmu_example_genes.txt</span> <span class="info">(server)</span>',false);
	Ext.getCmp(this.id+"_mmuSpeciesRadio").setValue(true);
};

EnrichmentAnalysisJobFormPanel.prototype.loadExampleFatiscan = function (){
	Ext.getCmp(this.id+"_fatiscanRadio").setValue(true);
	this.paramsWS["data-fileid"]="example3";
	Ext.getCmp(this.id+"_tfbsRadio").setValue(true);
	Ext.getCmp("jobNameField_"+this.id).setValue("example TFBS Fatiscan");
	this.fileBrowserLabel.setText('<span class="emph">fanconi_anemia_ranked.txt</span> <span class="info">(server)</span>',false);
	Ext.getCmp(this.id+"_hsaSpeciesRadio").setValue(true);
};

EnrichmentAnalysisJobFormPanel.prototype.validateDatabasesForm = function (annotationId){
	this.paramsWS["annotations-fileid"]=annotationId;
	this.validateRunButton();
};

EnrichmentAnalysisJobFormPanel.prototype.validateRunButton = function (){
	if(this.paramsWS["data-fileid"] != null && this.paramsWS["annotations-fileid"]!=null  && Ext.getCmp("jobNameField_"+this.id).getValue()!=""){
		this.runButton.enable();
	}else{
		if(this.runButton!=null){
			this.runButton.disable();
		}
		
	}
//	this.runButton.enable();
};


EnrichmentAnalysisJobFormPanel.prototype.runJob = function (){
	var _this = this;
	this.paramsWS["sessionid"] = $.cookie('bioinfo_sid');
	this.paramsWS["jobname"] = Ext.getCmp("jobNameField_"+this.id).getValue();
//	this.validateRunButton();
	//TODO
//	console.log("hola")
	console.log(this.paramsWS);
	
	analysisAdapter = new AnalysisAdapter();
	analysisAdapter.onEnrichmentAnalysis.addEventListener(function(sender, data){
		console.log(_this);
		if(data.indexOf("ERROR")!=-1){
			Ext.Msg.show({
				title:'ERROR',
				msg: data
			});
		}else{
			_this.panel.close();
		}
	});
	analysisAdapter.enrichmentAnalysis(this.paramsWS);
};






//helping functions
EnrichmentAnalysisJobFormPanel.prototype.createCheckBox = function (name){
	var cb = Ext.create('Ext.form.field.Checkbox', {
		 id:name+"_"+this.id,
		 boxLabel : name,
		 name : name
	});
	return cb;
};
EnrichmentAnalysisJobFormPanel.prototype.createTextFields = function (name){
	var tb = Ext.create('Ext.form.field.Text', {
		id:name+"_"+this.id,
		fieldLabel : name,
		name : name
//		allowBlank: false
	});
	return tb;
};
EnrichmentAnalysisJobFormPanel.prototype.createTextAreas = function (name){
	var tb = Ext.create('Ext.form.field.TextArea', {
		id:name+"_"+this.id,
		fieldLabel : name,
		name : name,
		emptyText:"List separated by line break"
//		allowBlank: false
	});
	return tb;
};
EnrichmentAnalysisJobFormPanel.prototype.createRadio = function (name,group, hidden){
	var cb = Ext.create('Ext.form.field.Radio', {
		 id:name+"_"+this.id,
		 boxLabel : name,
		 inputValue : name,
		 name : group,
		 hidden: hidden
	});
	return cb;
};