VariantEffectJobFormPanel.prototype.draw = JobFormPanel.prototype.draw;
VariantEffectJobFormPanel.prototype.render = JobFormPanel.prototype.render;
VariantEffectJobFormPanel.prototype.validateRunButton = JobFormPanel.prototype.validateRunButton;
VariantEffectJobFormPanel.prototype.getRunButtonPanel = JobFormPanel.prototype.getRunButtonPanel;
//VariantEffectJobFormPanel.prototype.getTreePanel = JobFormPanel.prototype.getTreePanel;
//VariantEffectJobFormPanel.prototype.checkDataTypes = JobFormPanel.prototype.checkDataTypes;

function VariantEffectJobFormPanel(args){
	if (args == null){
		args = new Object();
	}
	args.title = "Variant effect job form";
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

VariantEffectJobFormPanel.prototype.getForms = function (){
	var items = [
	             	this._getSpeciesForm(),
	             	this._getBrowseForm(),
	             	this._getFilterForm(),
	             	this._getOutputForm(),
	             	this.getRunButtonPanel()
	             ];

	var form1234 = Ext.create('Ext.panel.Panel', {
		border:true,
//		layout:{type:'vbox', align: 'stretch'},
		buttonAlign:'center',
//		height:900,
		width: "80%",
		items:items
	});
	
	return [this._getExampleForm(),form1234];
};
VariantEffectJobFormPanel.prototype._getSpeciesForm = function (){
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


VariantEffectJobFormPanel.prototype._getExampleForm = function (){
	var _this = this;
	
	var example1 = Ext.create('Ext.container.Container', {
		html:'<span class="u"><span class="emph u">Load example 1.</span> <span class="info s110">VCF file with ~3500 variants</span></span>',
		cls:'dedo',
		listeners:{
			afterrender:function(){
				this.getEl().on("click",function(){_this.loadExample1();Ext.example.msg("Example loaded","");});
				
			}
		}
	});
	var example2 = Ext.create('Ext.container.Container', {
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


VariantEffectJobFormPanel.prototype._getBrowseForm = function (){
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


VariantEffectJobFormPanel.prototype._getFilterForm = function (){
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
		title:"Input data filter options",
		border:false,
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
	formFilterOptions.insert(3,region);
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
			formFilterOptions.insert(3,reg);
			_this.regionFields.push(reg);
		}
	});
	formFilterOptions.insert(4,button);
	
	return formFilterOptions;
};

VariantEffectJobFormPanel.prototype._getOutputForm = function (){
	var margin = 10;
	var items = [];
	items.push(this.createLabel("Consequence types"));
	items.push(this.createCheckBox("Non-synonymous coding", true, margin));
	items.push(this.createCheckBox("Synonymous coding", false, margin));
	items.push(this.createCheckBox("Splice sites", true,margin));
	items.push(this.createCheckBox("Stop gained/lost", false,margin));
	items.push(this.createCheckBox("Upstream", true,margin));
	items.push(this.createCheckBox("Downstream", true,margin));
	items.push(this.createCheckBox("5' UTR", true,margin));
	items.push(this.createCheckBox("3' UTR", true,margin));
	items.push(this.createCheckBox("Non-coding RNA", true,margin));
	items.push(this.createCheckBox("Intergenic", false,margin));
	items.push(this.createLabel("Regulatory"));
	items.push(this.createCheckBox("Jaspar TFBS regions", true,margin));
	items.push(this.createCheckBox("miRNA targets", true,margin));
	items.push(this.createCheckBox("Other regulatory regions (CTCF, DNaseI, ...)", false,margin));
	items.push(this.createLabel("Variations"));
	items.push(this.createCheckBox("SNPs", true,margin));
	items.push(this.createCheckBox("Uniprot Natural Variants", false,margin));
	items.push(this.createLabel("Phenotype and diseases"));
	items.push(this.createCheckBox("Phenotypic annotated SNPs", false,margin));
	items.push(this.createCheckBox("Disease mutations", false, margin));
	 	
	var form4 = Ext.create('Ext.form.Panel', {
		id:"Output options",
		title:"Output options",
		border:false,
//		cls:'panel-border-left',
		flex:1,
		bodyPadding:10,
		cls:'panel-border-top',
		items: items
	});
	 return form4;
};


VariantEffectJobFormPanel.prototype.loadExample1 = function (){
	Ext.getCmp("jobNameField_"+this.id).setValue("Example vcf 3500");
	this.paramsWS["vcf-file-fileid"] = "example1";
	
	
	
	Ext.getCmp("Only SNPs_"+this.id).setValue(true);
	this.fileBrowserLabel.setText('<span class="emph">CHB_exon.vcf</span> <span class="info">(server)</span>',false);
	
	Ext.getCmp("Non-synonymous coding_"+this.id).setValue(true);
	Ext.getCmp("Synonymous coding_"+this.id).setValue(true);
	Ext.getCmp("Splice sites_"+this.id).setValue(true);
	Ext.getCmp("Stop gained/lost_"+this.id).setValue(true);
	Ext.getCmp("Upstream_"+this.id).setValue(true);
	Ext.getCmp("Downstream_"+this.id).setValue(true);
	Ext.getCmp("5' UTR_"+this.id).setValue(true);
	Ext.getCmp("3' UTR_"+this.id).setValue(false);
	Ext.getCmp("Non-coding RNA_"+this.id).setValue(true);
	Ext.getCmp("Intergenic_"+this.id).setValue(false);
	
	Ext.getCmp("Jaspar TFBS regions_"+this.id).setValue(true);
	Ext.getCmp("miRNA targets_"+this.id).setValue(true);
	Ext.getCmp("Other regulatory regions (CTCF, DNaseI, ...)_"+this.id).setValue(false);
	
	Ext.getCmp("SNPs_"+this.id).setValue(true);
	Ext.getCmp("Uniprot Natural Variants_"+this.id).setValue(false);
	
	Ext.getCmp("Phenotypic annotated SNPs_"+this.id).setValue(false);
	Ext.getCmp("Disease mutations_"+this.id).setValue(false);
	Ext.getCmp(this.id+"speciesCombo").select(Ext.getCmp(this.id+"speciesCombo").findRecordByValue("hsa"));
	console.log(this.paramsWS);
	this.validateRunButton();

};
VariantEffectJobFormPanel.prototype.loadExample2 = function (){
	Ext.getCmp("jobNameField_"+this.id).setValue("Example vcf 5000");
	this.paramsWS["vcf-file-fileid"] = "example2";
	
	
	
	Ext.getCmp("Only SNPs_"+this.id).setValue(true);
	this.fileBrowserLabel.setText('<span class="emph">1000genomes_5000_variants.vcf</span> <span class="info">(server)</span>',false);
	
	Ext.getCmp("Non-synonymous coding_"+this.id).setValue(true);
	Ext.getCmp("Synonymous coding_"+this.id).setValue(true);
	Ext.getCmp("Splice sites_"+this.id).setValue(true);
	Ext.getCmp("Stop gained/lost_"+this.id).setValue(true);
	Ext.getCmp("Upstream_"+this.id).setValue(true);
	Ext.getCmp("Downstream_"+this.id).setValue(true);
	Ext.getCmp("5' UTR_"+this.id).setValue(true);
	Ext.getCmp("3' UTR_"+this.id).setValue(true);
	Ext.getCmp("Non-coding RNA_"+this.id).setValue(true);
	Ext.getCmp("Intergenic_"+this.id).setValue(false);
	
	Ext.getCmp("Jaspar TFBS regions_"+this.id).setValue(true);
	Ext.getCmp("miRNA targets_"+this.id).setValue(true);
	Ext.getCmp("Other regulatory regions (CTCF, DNaseI, ...)_"+this.id).setValue(false);
	
	Ext.getCmp("SNPs_"+this.id).setValue(true);
	Ext.getCmp("Uniprot Natural Variants_"+this.id).setValue(false);
	
	Ext.getCmp("Phenotypic annotated SNPs_"+this.id).setValue(false);
	Ext.getCmp("Disease mutations_"+this.id).setValue(false);
	Ext.getCmp(this.id+"speciesCombo").select(Ext.getCmp(this.id+"speciesCombo").findRecordByValue("hsa"));
	console.log(this.paramsWS);
	this.validateRunButton();

};


VariantEffectJobFormPanel.prototype.validateRunButton = function (){
	if(this.paramsWS["vcf-file-fileid"] != null && Ext.getCmp("jobNameField_"+this.id).getValue()!=""){
		this.runButton.enable();
	}else{
		this.runButton.disable();
	}
//	this.runButton.enable();
};
VariantEffectJobFormPanel.prototype.getCheckValue = function (checkbox){
	if(checkbox.getValue())
		return null;
	return "";
};
VariantEffectJobFormPanel.prototype.runJob = function (){
		
		this.paramsWS["sessionid"] = $.cookie('bioinfo_sid');
		this.paramsWS["jobname"] = Ext.getCmp("jobNameField_"+this.id).getValue();
		
		
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
			this.paramsWS["quality"] = Ext.getCmp(this.id+"coverage").getValue();
		}
		if(Ext.getCmp(this.id+"alleles").getValue()!=null){
			this.paramsWS["alleles"] = Ext.getCmp(this.id+"coverage").getValue();
		}
		
		if(Ext.getCmp("Only SNPs_"+this.id).getValue()){
			this.paramsWS["snp"] = "include";
		}
		if(Ext.getCmp("Only Non-SNPs_"+this.id).getValue()){
			this.paramsWS["snp"] = "exclude";
		}
		
		var soTerms = new Array();
		if(!Ext.getCmp("Non-synonymous coding_"+this.id).getValue()){
			soTerms.push("non_synonymous_codon");
		}
		if(!Ext.getCmp("Synonymous coding_"+this.id).getValue()){
			soTerms.push("synonymous_codon");
		}
		if(!Ext.getCmp("Splice sites_"+this.id).getValue()){
			soTerms.push("splice_donor_variant");
			soTerms.push("splice_acceptor_variant");
			soTerms.push("splice_region_variant");
		}
		if(!Ext.getCmp("Stop gained/lost_"+this.id).getValue()){
			soTerms.push("stop_gained");
			soTerms.push("stop_lost");
		}
		if(!Ext.getCmp("Upstream_"+this.id).getValue()){
			soTerms.push("5KB_upstream_variant");
		}
		if(!Ext.getCmp("Downstream_"+this.id).getValue()){
			soTerms.push("5KB_downstream_variant");
		}
		if(!Ext.getCmp("5' UTR_"+this.id).getValue()){
			soTerms.push("5_prime_UTR_variant");
		}
		if(!Ext.getCmp("3' UTR_"+this.id).getValue()){
			soTerms.push("3_prime_UTR_variant");
		}
		if(!Ext.getCmp("Non-coding RNA_"+this.id).getValue()){
			soTerms.push("pseudogene");
			soTerms.push("nc_transcript_variant");
			soTerms.push("miRNA");
			soTerms.push("lincRNA");
		}
		if(!Ext.getCmp("Intergenic_"+this.id).getValue()){
			soTerms.push("intergenic_variant");
		}
		if(!Ext.getCmp("Jaspar TFBS regions_"+this.id).getValue()){
			soTerms.push("TF_binding_site_variant");
		}
		if(!Ext.getCmp("miRNA targets_"+this.id).getValue()){
			soTerms.push("miRNA_target_site");
		}
		if(!Ext.getCmp("Other regulatory regions (CTCF, DNaseI, ...)_"+this.id).getValue()){
			soTerms.push("regulatory_region_variant");
			soTerms.push("DNAseI_hypersensitive_site");
			soTerms.push("RNA_polymerase_promoter");
		}
		if(!Ext.getCmp("SNPs_"+this.id).getValue()){
			soTerms.push("SNP");
		}
		
//		if(!Ext.getCmp("Uniprot Natural Variants_"+this.id).getValue())
//			
//		}
		if(Ext.getCmp("Phenotypic annotated SNPs_"+this.id).getValue()){
			this.paramsWS["no-phenotype"] = "";
		}
		if(Ext.getCmp("Disease mutations_"+this.id).getValue()){
			this.paramsWS["no-phenotype"] = "";
		}
		if(soTerms.length > 0){
			this.paramsWS["exclude"] = soTerms.toString();
		}
		
		this.paramsWS["command"] = "effect";
		
		console.log(this.paramsWS);
		this.adapter.variantAnalysis(this.paramsWS);
		this.panel.close();
};



//helping functions
VariantEffectJobFormPanel.prototype.createCheckBox = function (name, checked, margin){
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
VariantEffectJobFormPanel.prototype.createLabel = function (text, margin){
	if(margin == null){
		margin = "15 0 0 0";
	}
	var label = Ext.create('Ext.form.Label', {
		margin:margin,
		html:'<span class="emph">'+text+'</span>'
	});
	
	return label;
};
VariantEffectJobFormPanel.prototype.createTextFields = function (name){
	var tb = Ext.create('Ext.form.field.Text', {
		id:name+"_"+this.id,
		fieldLabel : name,
		name : name
//		allowBlank: false
	});
	return tb;
};
VariantEffectJobFormPanel.prototype.createTextAreas = function (name, emptyText){
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
VariantEffectJobFormPanel.prototype.createTextField = function (name, emptyText){
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
VariantEffectJobFormPanel.prototype.createRadio = function (name, group, checked, hidden){
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
