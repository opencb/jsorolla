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

SnpPriorizationJobFormPanel.prototype.draw = JobFormPanel.prototype.draw;
SnpPriorizationJobFormPanel.prototype.render = JobFormPanel.prototype.render;
SnpPriorizationJobFormPanel.prototype.validateRunButton = JobFormPanel.prototype.validateRunButton;
SnpPriorizationJobFormPanel.prototype.getRunButtonPanel = JobFormPanel.prototype.getRunButtonPanel;


function SnpPriorizationJobFormPanel(args){
	if (args == null){
		args = new Object();
	}
	args.title = "SNP priorization";
	JobFormPanel.prototype.constructor.call(this, args);
	
	this.tags = ["snp|gene|genomic"];
	this.sufix = "_snpPrio";
	
	/** Params for WS **/
	this.paramsWS = new Object();
	this.paramsWS["sessionid"] = "";
	this.paramsWS["data-fileid"] = null;
	
	this.adapter = new AnalysisAdapter();
	var _this = this;
	this.browserData = new BrowserDataWidget({retrieveData:false});
	this.browserData.onSelect.addEventListener(function (sender, data){
		_this.fileBrowserLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
		_this.paramsWS["data-fileid"] = data.dataId;
		_this.validateRunButton();
	});
};

SnpPriorizationJobFormPanel.prototype.getForms = function (){
	var items = [
					this._getBrowseForm(),
					this._getSpeciesForm(),
					this._getNonSynonymousForm(),
					this._getTranscriptionForm(),
					this._getMicroRNAForm(),
					this._getPromoterForm(),
					this._getConservedForm(),
					this._getStructuralForm(),
					this.getRunButtonPanel()
	             ];

	var form = Ext.create('Ext.panel.Panel', {
		border:true,
//		layout:{type:'vbox', align: 'stretch'},
		buttonAlign:'center',
//		height:900,
		width: "80%",
		items:items
	});
	
	return [this._getExampleForm(),form];
};

SnpPriorizationJobFormPanel.prototype._getExampleForm = function (){
	var _this = this;
	
	var example1 = Ext.create('Ext.container.Container', {
		html:'<span class="u"><span class="emph u">Load example 1.</span> <span class="info s110">snps from gene list</span></span>',
		cls:'dedo',
		listeners:{
			afterrender:function(){
				this.getEl().on("click",function(){_this.loadExample1();Ext.example.msg("Example loaded","");});
			}
		}
	});
	
	var example2 = Ext.create('Ext.container.Container', {
		html:'<span class="u"><span class="emph u">Load example 2.</span> <span class="info s110">snps from region</span></span>',
		cls:'dedo',
		listeners:{
			afterrender:function(){
				this.getEl().on("click",function(){_this.loadExample2();Ext.example.msg("Example loaded","");});
				
			}
		}
	});
	
	var example3 = Ext.create('Ext.container.Container', {
		html:'<span class="u"><span class="emph u">Load example 3.</span> <span class="info s110">snps from snp list</span></span>',
		cls:'dedo',
		listeners:{
			afterrender:function(){
				this.getEl().on("click",function(){_this.loadExample3();Ext.example.msg("Example loaded","");});
				
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

SnpPriorizationJobFormPanel.prototype._getBrowseForm = function (){
	var _this = this;
	
	var note1 = Ext.create('Ext.container.Container', {
		html:'<p>Select a SNP file from your <span class="info">server account</span> using the <span class="emph">Browse data</span> button.</p>'
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
			border:false,
			bodyPadding:10,
			items: [note1,browse,note2,btnUpload]
		});
	return formBrowser;
};

SnpPriorizationJobFormPanel.prototype._getSpeciesForm = function (){
	var radioSpecies = Ext.create('Ext.form.RadioGroup', {
		id: 'species'+this.sufix,	
		name: 'species',
		layout: {
		    type: 'vbox',
		    align: 'left'
		},
		height: 65,
		margin: '0 0 0 10',
		defaults: {
			name: 'species'
		},
		items: [{
			inputValue: 'hsa',
			boxLabel: 'Homo sapiens'
		}, {
			inputValue: 'mmu',
			boxLabel: 'Mus musculus'
		}, {
			inputValue: 'rno',
			boxLabel: 'Rattus norvegicus'
		}]
	});
	
	var form = Ext.create('Ext.form.Panel', {
		id:"speciesForm"+this.sufix,
		title:"Select your organism",
		border:false,
//		cls:'panel-border-left',
		flex:1,
		bodyPadding:10,
		cls:'panel-border-top',
		items: radioSpecies
	});
	return form;
};

SnpPriorizationJobFormPanel.prototype._getNonSynonymousForm = function (){
	var items = [];
	items.push(this.createCheckBox("non_synonymous", "All non-synonymous SNPs", false, 10, false));
	items.push(this.createCheckBox("snpeffect_structure", "Mutations affecting protein structure and dynamics (SNPeffect)", false, 10, false));
	items.push(this.createCheckBox("snpeffect_processing", "Mutations affecting protein cellular processing (SNPeffect)", false, 10, false));
	items.push(this.createCheckBox("snpeffect_functional", "Mutations affecting functional sites (SNPeffect)", false, 10, false));
	items.push(this.createCheckBox("omega", "Pathological mutations predicted by selective constraints (dN/dS)", false, 10, false, ["omega_min","omega_max"]));
	var omegaMin = this.createNumberField("omega_min", "Omega values from", "", 0, 100, "0 0 0 10", 200, 110, true);
	var omegaMax = this.createNumberField("omega_max", "to", "", 0, 100, "0 0 0 10", 108, 20, true);
	var omega = Ext.create('Ext.container.Container', {
		margin:"5 0 0 0",
		layout: 'hbox',
		items:[omegaMin,omegaMax]
	});
	items.push(omega);

	var form = Ext.create('Ext.form.Panel', {
		id:"nonSynonymousForm"+this.sufix,
		title:"Non-synonymous SNPs",
		border:false,
//		cls:'panel-border-left',
		flex:1,
		bodyPadding:10,
		cls:'panel-border-top',
		items: items
	});
	return form;
};

SnpPriorizationJobFormPanel.prototype._getTranscriptionForm = function (){
	var items = [];
	items.push(this.createCheckBox("transfac", "TRANSFAC/Match predictions", false, 10, false));
	items.push(this.createCheckBox("jaspar", "JASPAR/MatScan predictions", false, 10, false));
	items.push(this.createCheckBox("oreganno", "ORegAnno", false, 10, false));

	var form = Ext.create('Ext.form.Panel', {
		id:"transcriptionForm"+this.sufix,
		title:"Transcription factor binding site",
		border:false,
//		cls:'panel-border-left',
		flex:1,
		bodyPadding:10,
		cls:'panel-border-top',
		items: items
	});
	return form;
};

SnpPriorizationJobFormPanel.prototype._getMicroRNAForm = function (){
	var items = [];
	items.push(this.createCheckBox("mirna_sequence", "microRNA sequences", false, 10, false));
	items.push(this.createCheckBox("mirna_target", "microRNA targets", false, 10, false));

	var form = Ext.create('Ext.form.Panel', {
		id:"microRNAForm"+this.sufix,
		title:"microRNA",
		border:false,
//		cls:'panel-border-left',
		flex:1,
		bodyPadding:10,
		cls:'panel-border-top',
		items: items
	});
	return form;
};

SnpPriorizationJobFormPanel.prototype._getPromoterForm = function (){
	var items = [];
	items.push(this.createCheckBox("triplex", "Search in low-flexibility promoter regions", false, 10, false));
	items.push(this.createNumberField("triplex_min_length", "Minimum length of sequences in bp", "10", 0, 100, "5 0 0 10", 308, 200, false));

	var form = Ext.create('Ext.form.Panel', {
		id:"promoterFlexForm"+this.sufix,
		title:"Promoter flexibility",
		border:false,
//		cls:'panel-border-left',
		flex:1,
		bodyPadding:10,
		cls:'panel-border-top',
		items: items
	});
	return form;
};

SnpPriorizationJobFormPanel.prototype._getConservedForm = function (){
	var items = [];
	items.push(this.createCheckBox("conserved_region", "Search in highly-conserved regions", false, 10, false));

	var form = Ext.create('Ext.form.Panel', {
		id:"conservedRegForm"+this.sufix,
		title:"Conserved regions",
		border:false,
//		cls:'panel-border-left',
		flex:1,
		bodyPadding:10,
		cls:'panel-border-top',
		items: items
	});
	return form;
};

SnpPriorizationJobFormPanel.prototype._getStructuralForm = function (){
	var items = [];
	items.push(this.createCheckBox("splice_site", "Splice sites created/disrupted by SNPs (GeneID predictions)", false, 10, false));
	items.push(this.createCheckBox("ese", "Exonic splicing enhancer", false, 10, false));
	items.push(this.createCheckBox("ess", "Exonic splicing silencer", false, 10, false));

	var form = Ext.create('Ext.form.Panel', {
		id:"structuralForm"+this.sufix,
		title:"Structural properties",
		border:false,
//		cls:'panel-border-left',
		flex:1,
		bodyPadding:10,
		cls:'panel-border-top',
		items: items
	});
	return form;
};

//helping functions
SnpPriorizationJobFormPanel.prototype.createCheckBox = function (name, label, checked, margin, disabled, rules){
	if(checked == null)
		cheched = false;
	if(margin == null)
		margin = 0;
	
	// Setting option rules
	var _this = this;
	var handler = null;
	if(rules != undefined) {
		handler = function(me, checked){
			for(var i=0; i<rules.length; i++){
				_this.validateOption(checked, rules[i]);				
			}
		 };
	}
	
	var cb = Ext.create('Ext.form.field.Checkbox', {
		 id: name+this.sufix,
		 boxLabel: label,
		 name: name,
		 checked: checked,
		 disabled: disabled,
		 margin: '0 0 0 '+margin,
		 handler: handler
	});
	return cb;
};
SnpPriorizationJobFormPanel.prototype.createLabel = function (text, margin){
	if(margin == null)
		margin = "15 0 0 0";
	var label = Ext.create('Ext.form.Label', {
		margin:margin,
		html:'<span class="emph">'+text+'</span>'
	});
	
	return label;
};
SnpPriorizationJobFormPanel.prototype.createNumberField = function (name, label, value, min, max, margin, width, labelWidth, disabled){
	if(margin == null)
		margin = "15 0 0 0";
	var nf = Ext.create('Ext.form.field.Number', {
		id:name+this.sufix,
		fieldLabel : label,
		name : name,
		disabled: disabled,
		width: width,
		labelWidth: labelWidth,
		value: value,
		minValue: min,
	    maxValue: max,
	    margin:margin,
		allowBlank: false
	});
	return nf;
};


//validate options
SnpPriorizationJobFormPanel.prototype.validateOption = function (checked, optSlave) {
//	console.log(checked+" - "+optSlave);
	if(!checked)
		Ext.getCmp(optSlave+this.sufix).disable();
	else
		Ext.getCmp(optSlave+this.sufix).enable();
}
