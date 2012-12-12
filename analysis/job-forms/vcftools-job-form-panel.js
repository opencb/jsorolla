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

VCFToolsJobFormPanel.prototype.draw = JobFormPanel.prototype.draw;
VCFToolsJobFormPanel.prototype.render = JobFormPanel.prototype.render;
VCFToolsJobFormPanel.prototype.validateRunButton = JobFormPanel.prototype.validateRunButton;
VCFToolsJobFormPanel.prototype.getRunButtonPanel = JobFormPanel.prototype.getRunButtonPanel;
//VCFToolsJobFormPanel.prototype.getTreePanel = JobFormPanel.prototype.getTreePanel;
//VCFToolsJobFormPanel.prototype.checkDataTypes = JobFormPanel.prototype.checkDataTypes;

function VCFToolsJobFormPanel(args){
	if (args == null){
		args = new Object();
	}
	args.title = "VCF Tools job form";
	JobFormPanel.prototype.constructor.call(this, args);
	
	this.tags = ["vcf|bed|gff"];
	
	
	/** Params for WS **/
	this.paramsWS = new Object();
	this.paramsWS["sessionid"] = "";
	this.paramsWS["vcf-file-fileid"] = null;
//	this.paramsWS["num-threads"] = "12";
	
	this.adapter = new AnalysisAdapter();
	var _this = this;
	this.browserData = new BrowserDataWidget({retrieveData:false});
	this.browserData.onSelect.addEventListener(function (sender, data){
		_this.fileBrowserLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
		_this.paramsWS["vcf-file-fileid"] = data.dataId;
		_this.validateRunButton();
	});
	
};

VCFToolsJobFormPanel.prototype.getForms = function (){
	var items = [
	             	this._getSpeciesForm(),
	             	this._getBrowseForm(),
	             	this._getToolSelectForm(),
	             	this._getFilterForm(),
	             	this._getMergeForm(),
	             	this._getSplitForm(),
	             	this._getStatsForm(),
	             	this.getRunButtonPanel()
	             ];

	var form1234 = Ext.create('Ext.panel.Panel', {
		border:true,
		layout:{type:'vbox', align: 'stretch'},
		buttonAlign:'center',
		//height:900,
		//width: "600",
		items:items
	});
	
	return [this._getExampleForm(),form1234];
};
VCFToolsJobFormPanel.prototype._getSpeciesForm = function (){
	var _this=this;
	
	var checkFlags = function(value){
		if(Ext.getCmp("SNPs_"+_this.id)){
			if(value!="hsa"){
				Ext.getCmp("Jaspar TFBS regions_"+_this.id).setValue(false).disable();
				Ext.getCmp("miRNA targets_"+_this.id).setValue(false).disable();
				Ext.getCmp("Other regulatory regions (CTCF, DNaseI, ...)_"+_this.id).setValue(false).disable();
				Ext.getCmp("SNPs_"+_this.id).setValue(false).disable();
				Ext.getCmp("Uniprot Natural Variants_"+_this.id).setValue(false).disable();
				Ext.getCmp("Phenotypic annotated SNPs_"+_this.id).setValue(false).disable();
				Ext.getCmp("Disease mutations_"+_this.id).setValue(false).disable();
			}else{
				Ext.getCmp("Jaspar TFBS regions_"+_this.id).setValue(false).enable();
				Ext.getCmp("miRNA targets_"+_this.id).setValue(false).enable();
				Ext.getCmp("Other regulatory regions (CTCF, DNaseI, ...)_"+_this.id).setValue(false).enable();
				Ext.getCmp("SNPs_"+_this.id).setValue(false).enable();
				Ext.getCmp("Uniprot Natural Variants_"+_this.id).setValue(false).enable();
				Ext.getCmp("Phenotypic annotated SNPs_"+_this.id).setValue(false).enable();
				Ext.getCmp("Disease mutations_"+_this.id).setValue(false).enable();
			}
		}
	};

	var speciesForm = Ext.create('Ext.panel.Panel', {
		title:"Species",
		border:false,
		bodyPadding:10,
		items: []
	});
	
	$.ajax({url:new CellBaseManager().host+"/latest/species?of=json",success:function(data, textStatus, jqXHR){
		// Create the combo box, attached to the states data store
		var objdata = JSON.parse(data);
		for ( var i = 0; i < objdata.length; i++) {
			objdata[i].sciAsembly = objdata[i].scientific+" ("+objdata[i].assembly+")";
		}
		var species = Ext.create('Ext.data.Store', {
			autoLoad: true,
		    fields: ['species', 'common','scientific','assembly','sciAsembly'],
		    data : objdata
		});
		var speciesCombo = Ext.create('Ext.form.field.ComboBox', {
			id:_this.id+"speciesCombo",
		    fieldLabel: 'Choose Species',
		    displayField: 'sciAsembly',
		    valueField: 'species',
		    editable:false,
		    width:350,
		    store: species,
			listeners:{
				 change:function(){
					 if(this.getValue()){
						 checkFlags(this.getValue());
						 _this.paramsWS["species"]=this.getValue();
			  		}
				 }
			 }
		});
		speciesCombo.select(speciesCombo.getStore().data.items[0]);
		speciesForm.add(speciesCombo);
	},error:function(jqXHR, textStatus, errorThrown){console.log(textStatus);}});
	
  	return speciesForm;
};


VCFToolsJobFormPanel.prototype._getExampleForm = function (){
	var _this = this;
	
	var example1 = Ext.create('Ext.Component', {
		width:300,
		html:'<span class="u"><span class="emph u">Load example 1.</span> <span class="info s110">VCF file with ~3500 variants</span></span>',
		cls:'dedo',
		listeners:{
			afterrender:function(){
				this.getEl().on("click",function(){_this.loadExample1();Ext.example.msg("Example loaded","");});
			}
		}
	});
	var example2 = Ext.create('Ext.Component', {
		width:300,
		html:'<span class="u"><span class="emph u">Load example 2.</span> <span class="info s110">VCF file with ~5000 variants</span></span>',
		cls:'dedo',
		listeners:{
			afterrender:function(){
				this.getEl().on("click",function(){_this.loadExample2();Ext.example.msg("Example loaded","");});
			}
		}
	});
	
	var exampleForm = Ext.create('Ext.container.Container', {
		bodyPadding:10,
		items: [this.note1,example1,example2],
		defaults:{margin:'5 0 0 5'}
	});
	
	return exampleForm;
};


VCFToolsJobFormPanel.prototype._getBrowseForm = function (){
	var _this = this;
	
	var note1 = Ext.create('Ext.container.Container', {
		html:'<p>Please select a file from your <span class="info">server account</span> using the <span class="emph">Browse data</span> button.</p>'
	});
	this.fileBrowserLabel = Ext.create('Ext.toolbar.TextItem', {
		margin:"2 0 0 5",
		html:'<p class="emph">No file selected.</p>'
	});
	var btnBrowse = Ext.create('Ext.button.Button', {
        text: 'Browse data',
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
			cls:'panel-border-top',
			border:false,
			bodyPadding:10,
			items: [note1,browse,note2,btnUpload]
		});
	return formBrowser;
};

VCFToolsJobFormPanel.prototype._getToolSelectForm = function (){
	var _this=this;	
	var items = [];

	var note1 = Ext.create('Ext.Component', {
		html:'Please choose one of the following tools:',
		margin:"0 0 10 0"
	});
	items.push(note1);
	
	var tool1 = Ext.create('Ext.form.field.Radio', {
		boxLabel :'Filter',
		name : this.id+"toolGroup",
		listeners:{
			change:function(comp, newValue, oldValue, eOpts){
				if(newValue){
					Ext.getCmp(_this.id+"filterForm").show();
					_this.paramsWS["tool"] = "filter";
				}else{
					Ext.getCmp(_this.id+"filterForm").hide();
				}
			}
		}
	});
	var tool2 = Ext.create('Ext.form.field.Radio', {
		boxLabel :'Merge',
		name : this.id+"toolGroup",
		listeners:{
			change:function(comp, newValue, oldValue, eOpts){
				if(newValue){
					Ext.getCmp(_this.id+"mergeForm").show();
					_this.paramsWS["tool"] = "merge";
				}else{
					Ext.getCmp(_this.id+"mergeForm").hide();
				}
			}
		}
	});
	var tool3 = Ext.create('Ext.form.field.Radio', {
		boxLabel :'Split',
		name : this.id+"toolGroup",
		listeners:{
			change:function(comp, newValue, oldValue, eOpts){
				if(newValue){
					Ext.getCmp(_this.id+"splitForm").show();
					_this.paramsWS["tool"] = "split";
				}else{
					Ext.getCmp(_this.id+"splitForm").hide();
				}
			}
		}
	});
	var tool4 = Ext.create('Ext.form.field.Radio', {
		boxLabel :'Stats',
		name : this.id+"toolGroup",
		listeners:{
			change:function(comp, newValue, oldValue, eOpts){
				if(newValue){
					Ext.getCmp(_this.id+"statsForm").show();
					_this.paramsWS["tool"] = "stats";
				}else{
					Ext.getCmp(_this.id+"statsForm").hide();
				}
			}
		}
	});
	
	items.push(tool1);
	items.push(tool2);
	items.push(tool3);
	items.push(tool4);

	var form = Ext.create('Ext.form.Panel', {
		title:"Tool Selection",
		border:false,
		cls:'panel-border-top',
		bodyPadding:10,
		items: items
	});
	
	return form;
};

VCFToolsJobFormPanel.prototype._getFilterForm = function (){
	var _this=this;
	var items = [];
	var coverage = Ext.create('Ext.form.field.Number', {
		id:this.id+"coverage",
		fieldLabel: 'Coverage (min)',
		width:500,
		minValue:0,
		allowDecimals:false
	});
	items.push(coverage);
	var quality = Ext.create('Ext.form.field.Number', {
		id:this.id+"quality",
		fieldLabel: 'VCF Quality (min)',
		width:500,
		minValue:0,
		allowDecimals:false
	});
	items.push(quality);
	var alleles = Ext.create('Ext.form.field.Number', {
		id:this.id+"alleles",
		fieldLabel: 'Alleles',
		width:500,
		minValue:1,
		allowDecimals:false
	});
	items.push(alleles);
	var minAlleles = Ext.create('Ext.form.field.Number', {
		id:this.id+"minAlleles",
		fieldLabel: 'Min Alleles Freq (max)',
		width:500,
		minValue:0,
		maxValue:1,
		step:0.01,
		decimalPrecision:12,
		allowDecimals:true
	});
	items.push(minAlleles);
	
	var radioItems = [];
	radioItems.push(this.createRadio("All","snp",true));
	radioItems.push(this.createRadio("Only SNPs","snp"));
	radioItems.push(this.createRadio("Only Non-SNPs","snp"));
	var radioGroup = Ext.create('Ext.form.RadioGroup', {
		fieldLabel: 'SNP',
		width:500,
		items: radioItems
	});
	items.push(radioGroup);
	

	var formFilterOptions = Ext.create('Ext.form.Panel', {
		id:this.id+"filterForm",
		title:"Filter",
		border:false,
		hidden:true,
		cls:'panel-border-top',
		bodyPadding:10,
		items: items
	});
	
	//regions
	_this.regionFields = [];
	var region = Ext.create('Ext.form.field.Text', {
		id:this.id+"region",
		fieldLabel: 'Region',
		width:500,
		emptyText:"chr:start-end",
		regex : /^([a-zA-Z0-9])+\:([0-9])+\-([0-9])+$/
	});
	formFilterOptions.insert(4,region);
	_this.regionFields.push(region);
	
	var button = Ext.create('Ext.button.Button', {
		text:"Add more regions",
		margin:"0 0 15 105",
		handler: function(){
			var reg = Ext.create('Ext.form.field.Text', {
				fieldLabel: 'Region',
				width:500,
				emptyText:"chr:start-end",
				regex : /^([a-zA-Z0-9])+\:([0-9])+\-([0-9])+$/
			});
			formFilterOptions.insert(4,reg);
			_this.regionFields.push(reg);
		}
	});
	formFilterOptions.insert(5,button);
	
	return formFilterOptions;
};

VCFToolsJobFormPanel.prototype._getMergeForm = function (){
	var _this=this;	
	var items = [];

	var radioItems = [];
	radioItems.push(this.createRadio("Missing","missing-mode",true));
	radioItems.push(this.createRadio("Reference","missing-mode"));
	var radioGroup = Ext.create('Ext.form.RadioGroup', {
		fieldLabel: 'Missing Mode',
		width:500,
		items: radioItems,
		listeners:{
			validitychange:function(comp, newValue, oldValue, eOpts){
				console.log(newValue);
				console.log(oldValue);
			}
		}
	});
	items.push(radioGroup);

	var form = Ext.create('Ext.form.Panel', {
		id:this.id+"mergeForm",
		title:"Merge",
		border:false,
		hidden:true,
		cls:'panel-border-top',
		bodyPadding:10,
		items: items
	});
	
	return form;
};

VCFToolsJobFormPanel.prototype._getSplitForm = function (){
	var _this=this;	
	var items = [];

	var radioItems = [];
	radioItems.push(this.createRadio("Chromosome","criterion",true));
	//radioItems.push(this.createRadio("...","criterion"));
	var radioGroup = Ext.create('Ext.form.RadioGroup', {
		fieldLabel: 'Criterion',
		width:500,
		items: radioItems
	});
	items.push(radioGroup);

	var form = Ext.create('Ext.form.Panel', {
		id:this.id+"splitForm",
		title:"Split",
		border:false,
		hidden:true,
		cls:'panel-border-top',
		bodyPadding:10,
		items: items
	});
	
	return form;
};

VCFToolsJobFormPanel.prototype._getStatsForm = function (){
	var _this=this;	
	var items = [];

	var margin = 10;
	items.push(this.createCheckBox("Variants", true, margin));
	items.push(this.createCheckBox("Samples", true, margin));
	
	var form = Ext.create('Ext.form.Panel', {
		id:this.id+"statsForm",
		title:"Stats",
		border:false,
		hidden:true,
		cls:'panel-border-top',
		bodyPadding:10,
		items: items
	});
	
	return form;
};


VCFToolsJobFormPanel.prototype.loadExample1 = function (){
this.runButton.enable();
};
VCFToolsJobFormPanel.prototype.loadExample2 = function (){

};


VCFToolsJobFormPanel.prototype.validateRunButton = function (){
	if(this.paramsWS["vcf-file-fileid"] != null && Ext.getCmp("jobNameField_"+this.id).getValue()!="" && this.paramsWS["tool"] != null){
		this.runButton.enable();
	}else{
		this.runButton.disable();
	}
//	this.runButton.enable();
};

VCFToolsJobFormPanel.prototype.getCheckValue = function (checkbox){
	if(checkbox.getValue())
		return null;
	return "";
};
VCFToolsJobFormPanel.prototype.runJob = function (){
		
		this.paramsWS["sessionid"] = $.cookie('bioinfo_sid');
		this.paramsWS["jobname"] = Ext.getCmp("jobNameField_"+this.id).getValue();
		
		/*FILTER*/
		//validate regions
		var regions = "";
		var regionPatt = /^([a-zA-Z0-9])+\:([0-9])+\-([0-9])+$/;
		for ( var i = 0; i < this.regionFields.length; i++) {
			var value = this.regionFields[i].getValue();
			if (value!="" && regionPatt.test(value)){
				regions +=value+",";
			}
		}
		if(regions != ""){
			this.paramsWS["region"] = regions;
		}
		
		if(Ext.getCmp(this.id+"coverage").getValue()!=null){
			this.paramsWS["coverage"] = Ext.getCmp(this.id+"coverage").getValue();
		}
		if(Ext.getCmp(this.id+"quality").getValue()!=null){
			this.paramsWS["quality"] = Ext.getCmp(this.id+"quality").getValue();
		}
		if(Ext.getCmp(this.id+"alleles").getValue()!=null){
			this.paramsWS["alleles"] = Ext.getCmp(this.id+"alleles").getValue();
		}
		if(Ext.getCmp(this.id+"minAlleles").getValue()!=null){
			this.paramsWS["maf"] = Ext.getCmp(this.id+"minAlleles").getValue();
		}
		
		if(Ext.getCmp("Only SNPs_"+this.id).getValue()){
			this.paramsWS["snp"] = "include";
		}
		if(Ext.getCmp("Only Non-SNPs_"+this.id).getValue()){
			this.paramsWS["snp"] = "exclude";
		}
		
		/*END FILTER*/

		/*MERGE*/
		if(Ext.getCmp("Missing_"+this.id).getValue()){
			this.paramsWS["missing-mode"] = "missing";
		}
		if(Ext.getCmp("Reference_"+this.id).getValue()){
			this.paramsWS["missing-mode"] = "reference";
		}
		/*END MERGE*/

		
		/*SPLIT*/
		if(Ext.getCmp("Chromosome_"+this.id).getValue()){
			this.paramsWS["criterion"] = "chromosome";
		}
		/*END SPLIT*/

		/*STATS*/
		if(Ext.getCmp("Variants_"+this.id).getValue()){
			this.paramsWS["variants"] = "";
		}
		if(Ext.getCmp("Samples_"+this.id).getValue()){
			this.paramsWS["samples"] = "";
		}
		/*END STATS*/

		//FALTA APLICAR SOLO LOS DE LA TOOL ELEGIDA
		
		this.paramsWS["command"] = "hpg-var-vcf";
		
		console.log(this.paramsWS);
		//this.adapter.variantAnalysis(this.paramsWS);
		//this.panel.close();

};



//helping functions
VCFToolsJobFormPanel.prototype.createCheckBox = function (name, checked, margin){
	if(checked == null)
		cheched = false;
	if(margin == null)
		margin = 0;
	var cb = Ext.create('Ext.form.field.Checkbox', {
		 id:name+"_"+this.id,
		 boxLabel : name,
		 name : name,
		 checked : checked,
		 margin: '0 0 0 '+margin
	});
	return cb;
};
VCFToolsJobFormPanel.prototype.createLabel = function (text, margin){
	if(margin == null){
		margin = "15 0 0 0";
	}
	var label = Ext.create('Ext.form.Label', {
		margin:margin,
		html:'<span class="emph">'+text+'</span>'
	});
	
	return label;
};
VCFToolsJobFormPanel.prototype.createTextFields = function (name){
	var tb = Ext.create('Ext.form.field.Text', {
		id:name+"_"+this.id,
		fieldLabel : name,
		name : name
//		allowBlank: false
	});
	return tb;
};
VCFToolsJobFormPanel.prototype.createTextAreas = function (name, emptyText){
	var tb = Ext.create('Ext.form.field.TextArea', {
		id:name+"_"+this.id,
		fieldLabel : name,
		name : name,
		width:500,
		emptyText:emptyText
//		allowBlank: false
	});
	return tb;
};
VCFToolsJobFormPanel.prototype.createTextField = function (name, emptyText){
	var tb = Ext.create('Ext.form.field.Text', {
		id:name+"_"+this.id,
		fieldLabel : name,
		name : name,
		width:500,
		emptyText:emptyText
//		allowBlank: false
	});
	return tb;
};
VCFToolsJobFormPanel.prototype.createRadio = function (name, group, checked, hidden){
	var cb = Ext.create('Ext.form.field.Radio', {
		 id:name+"_"+this.id,
		 boxLabel : name,
		 inputValue : name,
		 checked:checked,
		 name : group,
		 hidden: hidden
	});
	return cb;
};
