FunctionalHaplotypesJobFormPanel.prototype.draw = JobFormPanel.prototype.draw;
FunctionalHaplotypesJobFormPanel.prototype.render = JobFormPanel.prototype.render;
FunctionalHaplotypesJobFormPanel.prototype.validateRunButton = JobFormPanel.prototype.validateRunButton;
FunctionalHaplotypesJobFormPanel.prototype.getRunButtonPanel = JobFormPanel.prototype.getRunButtonPanel;


function FunctionalHaplotypesJobFormPanel(args){
	if (args == null){
		args = new Object();
	}
	args.title = "Functional haplotypes";
	JobFormPanel.prototype.constructor.call(this, args);
	
//	this.tags = ["snp|gene|genomic"];
	this.sufix = "_functional";
	
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

FunctionalHaplotypesJobFormPanel.prototype.getForms = function (){
	var items = [
					this._getBrowseForm(),
					this._getSpeciesForm(),
					this._getAssociationForm(),
					this._getBlockFindingForm(),
					this._getTagginOptForm(),
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

FunctionalHaplotypesJobFormPanel.prototype._getExampleForm = function (){
	var _this = this;
	
	var example1 = Ext.create('Ext.container.Container', {
		html:'<span class="u"><span class="emph u">Load example 1.</span> <span class="info s110">functional haplotype example</span></span>',
		cls:'dedo',
		listeners:{
			afterrender:function(){
				this.getEl().on("click",function(){_this.loadExample1();Ext.example.msg("Example loaded","");});
			}
		}
	});
	
	var exampleForm = Ext.create('Ext.container.Container', {
		bodyPadding:10,
		items: [this.note1,example1],
		defaults:{margin:'5 0 0 5'}
	});
	
	return exampleForm;
};

FunctionalHaplotypesJobFormPanel.prototype._getBrowseForm = function (){
	var _this = this;
	
	var note1 = Ext.create('Ext.container.Container', {
		html:'<p>Select linkage pedigree data (PED file) </p>',
		margin:"2 0 0 0"
	});
	this.fileBrowserLabel1 = Ext.create('Ext.toolbar.TextItem', {
		margin:"2 0 0 5",
		html:'<p class="emph">No file selected.</p>'
	});
	var btnBrowse1 = Ext.create('Ext.button.Button', {
        text: 'Browse data',
        margin:"0 0 10 5",
        handler: function (){
	   		_this.browserData.draw($.cookie('bioinfo_sid'),["haploview_ped"]);
   		}
	});
	var browse1 = Ext.create('Ext.container.Container', {
		margin:"10 0 0 0",
		layout: 'hbox',
		items:[note1,btnBrowse1,this.fileBrowserLabel1]
	});
	
	var note2 = Ext.create('Ext.container.Container', {
		html:'<p>Select markers (list of SNPs) </p>',
		margin:"2 0 0 0"
	});
	this.fileBrowserLabel2 = Ext.create('Ext.toolbar.TextItem', {
		margin:"2 0 0 5",
		html:'<p class="emph">No file selected.</p>'
	});
	var btnBrowse2 = Ext.create('Ext.button.Button', {
        text: 'Browse data',
        margin:"0 0 10 5",
        handler: function (){
	   		_this.browserData.draw($.cookie('bioinfo_sid'),["snp"]);
   		}
	});
	var browse2 = Ext.create('Ext.container.Container', {
		margin:"0 0 0 0",
		layout: 'hbox',
		items:[note2,btnBrowse2,this.fileBrowserLabel2]
	});

	
	var noteUpload = Ext.create('Ext.container.Container', {
		margin:"10 0 0 0",
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
			items: [browse1,browse2,noteUpload,btnUpload]
		});
	return formBrowser;
};

FunctionalHaplotypesJobFormPanel.prototype._getSpeciesForm = function (){
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

FunctionalHaplotypesJobFormPanel.prototype._getAssociationForm = function (){
	var items = [];
	items.push(this.createCheckBox("association_test", "Perform case/control association test", false, 10, false));

	var form = Ext.create('Ext.form.Panel', {
		id:"associationForm"+this.sufix,
		title:"Case/control association test",
		border:false,
//		cls:'panel-border-left',
		flex:1,
		bodyPadding:10,
		cls:'panel-border-top',
		items: items
	});
	return form;
};

FunctionalHaplotypesJobFormPanel.prototype._getBlockFindingForm = function (){
	var radioBlockFinding = Ext.create('Ext.form.RadioGroup', {
		id: 'blockFinding'+this.sufix,	
		name: 'blockFinding',
		layout: {
		    type: 'vbox',
		    align: 'left'
		},
		height: 65,
		margin: '0 0 0 10',
		defaults: {
			name: 'block_finding'
		},
		items: [{
			inputValue: 'confidence_intervals',
			boxLabel: 'Confidence intervals (Gabriel et al.)'
		}, {
			inputValue: 'four_gamete_rule',
			boxLabel: 'Four gamete rule (Wang et al.)'
		}, {
			inputValue: 'solid_spine',
			boxLabel: 'Solid spine of LD'
		}]
	});
	
	var form = Ext.create('Ext.form.Panel', {
		id:"blockFindingForm"+this.sufix,
		title:"Select block finding algorithm",
		border:false,
//		cls:'panel-border-left',
		flex:1,
		bodyPadding:10,
		cls:'panel-border-top',
		items: radioBlockFinding
	});
	return form;
};

FunctionalHaplotypesJobFormPanel.prototype._getTagginOptForm = function (){
	var items = [];
	var radioTagging = Ext.create('Ext.form.RadioGroup', {
		id: 'tagging'+this.sufix,	
		name: 'tagging',
		layout: {
		    type: 'vbox',
		    align: 'left'
		},
		height: 45,
		margin: '0 0 0 10',
		defaults: {
			name: 'tagging'
		},
		items: [{
			inputValue: 'pairwise',
			boxLabel: 'Pairwise tagging'
		}, {
			inputValue: 'aggresive',
			boxLabel: 'Aggresive tagging'
		}]
	});
	items.push(radioTagging);
	items.push(this.createNumberField("r2_cut_off", "r2 cut-off	", "0.8", 0, 100, "5 0 5 10", 170, 70, false));
	items.push(this.createNumberField("lod_cut_off", "LOd cut-off", "3", 0, 100, "0 0 20 10", 170, 70, false));
	
	var _this = this;
	var note1 = Ext.create('Ext.container.Container', {
		html:'<p>Select markers to exclude (list of SNPs) </p>',
		margin:"2 0 0 0"
	});
	this.fileBrowserLabel1 = Ext.create('Ext.toolbar.TextItem', {
		margin:"2 0 0 5",
		html:'<p class="emph">No file selected.</p>'
	});
	var btnBrowse1 = Ext.create('Ext.button.Button', {
        text: 'Browse data',
        margin:"0 0 10 5",
        handler: function (){
	   		_this.browserData.draw($.cookie('bioinfo_sid'),_this.tags);
   		}
	});
	var browse1 = Ext.create('Ext.container.Container', {
		margin:"10 0 0 0",
		layout: 'hbox',
		items:[note1,btnBrowse1,this.fileBrowserLabel1]
	});
	
	var note2 = Ext.create('Ext.container.Container', {
		html:'<p>Select markers to force (list of SNPs) </p>',
		margin:"2 0 0 0"
	});
	this.fileBrowserLabel2 = Ext.create('Ext.toolbar.TextItem', {
		margin:"2 0 0 5",
		html:'<p class="emph">No file selected.</p>'
	});
	var btnBrowse2 = Ext.create('Ext.button.Button', {
        text: 'Browse data',
        margin:"0 0 10 13",
        handler: function (){
	   		_this.browserData.draw($.cookie('bioinfo_sid'),_this.tags);
   		}
	});
	var browse2 = Ext.create('Ext.container.Container', {
		margin:"0 0 0 0",
		layout: 'hbox',
		items:[note2,btnBrowse2,this.fileBrowserLabel2]
	});
	
	var noteUpload = Ext.create('Ext.container.Container', {
		margin: "10 0 0 0",
		html:'<p>Remember that files must be uploaded before using them. To upload a file, please use the <span class="emph">Upload data</span> button.</p>'
	});	
	var btnUpload = Ext.create('Ext.button.Button', {
		margin: "5 0 10 0",
		text: 'Upload data',
		iconCls:'icon-upload',
		handler: function (){
			_this.uploadWidget.draw();
		}
	});
	var exclude = {
		xtype: 'fieldset',
		flex: 1,
		title: 'Exclude or force a list of markers from being used as tags',
		layout: 'anchor',
		width: 650,
		margin: "0 0 0 10",
		defaults: {
		    hideEmptyLabel: true
		},
		items: [browse1,browse2,noteUpload,btnUpload]
    };
	items.push(exclude);

	var form = Ext.create('Ext.form.Panel', {
		id:"taggingOptForm"+this.sufix,
		title:"Tagging options",
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
FunctionalHaplotypesJobFormPanel.prototype.createCheckBox = function (name, label, checked, margin, disabled, rules){
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
FunctionalHaplotypesJobFormPanel.prototype.createLabel = function (text, margin){
	if(margin == undefined) margin = "0 0 0 10";
	var label = Ext.create('Ext.form.Label', {
		margin: margin,
		html: '<span class="emph">'+text+'</span>'
	});
	
	return label;
};
FunctionalHaplotypesJobFormPanel.prototype.createNumberField = function (name, label, value, min, max, margin, width, labelWidth, disabled){
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
FunctionalHaplotypesJobFormPanel.prototype.validateOption = function (checked, optSlave) {
//	console.log(checked+" - "+optSlave);
	if(!checked)
		Ext.getCmp(optSlave+this.sufix).disable();
	else
		Ext.getCmp(optSlave+this.sufix).enable();
}
