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

UNTBgenJobFormPanel.prototype.draw = JobFormPanel.prototype.draw;
UNTBgenJobFormPanel.prototype.render = JobFormPanel.prototype.render;
UNTBgenJobFormPanel.prototype.validateRunButton = JobFormPanel.prototype.validateRunButton;
UNTBgenJobFormPanel.prototype.getRunButtonPanel = JobFormPanel.prototype.getRunButtonPanel;
//UNTBgenJobFormPanel.prototype.getTreePanel = JobFormPanel.prototype.getTreePanel;
//UNTBgenJobFormPanel.prototype.checkDataTypes = JobFormPanel.prototype.checkDataTypes;

function UNTBgenJobFormPanel(args){
	if (args == null){
		args = new Object();
	}
	args.title = "UNTBgen";
	JobFormPanel.prototype.constructor.call(this, args);
	
	this.tags = ["abundances"];
	
	/** Params for WS **/
	this.paramsWS = new Object();
	this.paramsWS["sessionid"] = "";
	this.paramsWS["data-fileid"] = null;
//	this.paramsWS["etienne"] = false;
//	this.paramsWS["ewens"] = false;
//	this.paramsWS["lrt"] = false;
//	this.paramsWS["sad"] = false;
//	this.paramsWS["test"] = false;
//	this.paramsWS["gens"] = "";
//	this.paramsWS["method"] = "";
//	this.paramsWS["fixs"] = false;
//	this.paramsWS["contour"] = false;
	
	this.adapter = new AnalysisAdapter();
	var _this = this;
	this.browserData = new BrowserDataWidget({retrieveData:false});
	this.browserData.onSelect.addEventListener(function (sender, data){
		_this.fileBrowserLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
		_this.paramsWS["data-fileid"] = data.dataId;
		_this.validateRunButton();
	});
	
};

UNTBgenJobFormPanel.prototype.getForms = function (){
	var items = [
	             	this._getBrowseForm(),
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

UNTBgenJobFormPanel.prototype._getExampleForm = function (){
	var _this = this;
	
	var example1 = Ext.create('Ext.container.Container', {
		html:'<span class="u"><span class="emph u">Load example 1.</span> <span class="info s110">BCI full</span></span>',
		cls:'dedo',
		listeners:{
			afterrender:function(){
				this.getEl().on("click",function(){_this.loadExample1();Ext.example.msg("Example loaded","");});
			}
		}
	});
	
	var example2 = Ext.create('Ext.container.Container', {
		html:'<span class="u"><span class="emph u">Load example 2.</span> <span class="info s110">BCI short</span></span>',
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


UNTBgenJobFormPanel.prototype._getBrowseForm = function (){
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
	var btnViewAbundChart = Ext.create('Ext.button.Button', {
        text: 'View abundance chart',
        margin:"15 0 0 0",
        handler: function (){
	   		if(_this.paramsWS["data-fileid"] != null){
				var url = ANALYSISHOST+"/comparative/untbgen/readAbund/";
				$.get(url, { datafileid: _this.paramsWS["data-fileid"], sessionid: $.cookie('bioinfo_sid') }, function(data) {
						this.win = Ext.create('Ext.window.Window',{
							title: 'Abundance',
							resizable: false,
							minimizable: false,
							constrain: true,
							closable: true,
							width: 900,
							height: 600,
							html: '<div id="gchart_preview"></div>'
						});
						this.win.show();
						drawChart("gchart_preview",data);
					 });
			}
			else Ext.Msg.alert('Error','Select an input file, please.');
   		}
	});
	var btnViewAbundTable = Ext.create('Ext.button.Button', {
        text: 'View abundance table',
        margin:"15 0 0 0",
        handler: function (){
	   		//console.log(_this.paramsWS["data-fileid"]);
	   		//console.log($.cookie('bioinfo_sid'));
	   		if(_this.paramsWS["data-fileid"] != null){
				var url = ANALYSISHOST+"/comparative/untbgen/readAbund/";
				$.get(url, { datafileid: _this.paramsWS["data-fileid"], sessionid: $.cookie('bioinfo_sid'), type: 'table' }, function(data) {
						this.win = Ext.create('Ext.window.Window',{
							title: 'Abundance',
							resizable: false,
							minimizable: false,
							constrain: true,
							closable: true,
							width: 500,
							height: 360
						});
//						console.log(data);
						var store = Ext.create('Ext.data.ArrayStore', {
							fields: [
							   {name: 'rank', type: 'float'},
							   {name: 'prop', type: 'float'},
							   {name: 'abund', type: 'float'},
							   {name: 'species'}
							],
							data: JSON.parse(data)
						});
						var grid = Ext.create('Ext.grid.Panel', {
							store: store,
							stateful: true,
							stateId: 'stateGrid',
							columns: [
								{
									text     : 'Species',
									width    : 200,
									sortable : true,
									dataIndex: 'species'
								},
								{
									text     : 'Rank',
									width    : 75,
									sortable : true,
									dataIndex: 'rank'
								},
								{
									text     : 'Abundance',
									width    : 75,
									sortable : true,
									dataIndex: 'abund'
								},
								{
									text     : 'Percentage',
									width    : 120,
									sortable : true,
									dataIndex: 'prop'
								}
							],
							height: 330,
							width: 490,
							viewConfig: {
								stripeRows: true
							}
						});
						this.win.add(grid);
						this.win.show();
						
					 });
			}
			else Ext.Msg.alert('Error','Select an input file, please.');
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
			items: [note1,browse,btnViewAbundChart,btnViewAbundTable,note2,btnUpload]
		});
	return formBrowser;
};

UNTBgenJobFormPanel.prototype._getOutputForm = function (){
	var margin = 10;
	var items = [];
	items.push(this.createLabel("Models"));
	items.push(this.createCheckBox("etienne", "Etienne", false, margin, false));
	items.push(this.createCheckBox("ewens", "Ewens", false, margin, false));
	items.push(this.createLabel("<br>Other options"));
	items.push(this.createCheckBox("lrt", "Likelihood ratio test", false, margin, true));
	items.push(this.createCheckBox("sad", "Species abundance diversity", false, margin, false));
	items.push(this.createCheckBox("test", "Neutrality test", false, margin, false));
	items.push(this.createNumberField("gens", "Number of simulations", 1000, 1, 10000, 30, true));
	
	var radioMethod = Ext.create('Ext.form.RadioGroup', {
		id: 'method',	
		layout: 'hbox',
		fieldLabel: 'Method',
		name: 'method',
		style: 'margin-left:30px',
		disabled: true,
		defaults: {
			name: 'method',
			margins: '0 15 0 0'
		},
		items: [{
			inputValue: 'shannon',
			boxLabel: 'Shannon',
			checked: true
		}, {
			inputValue: 'loglike',
			boxLabel: 'Log-likelihood'
		}]
	});
	items.push(radioMethod);
	
	items.push(this.createCheckBox("fixs", "Fix number of species during simulations", false, 30, true));
	items.push(this.createCheckBox("contour", "Contour plot", false, margin, true));

	var form4 = Ext.create('Ext.form.Panel', {
		id:"Options",
		title:"Options",
		border:false,
//		cls:'panel-border-left',
		flex:1,
		bodyPadding:10,
		cls:'panel-border-top',
		items: items
	});
	return form4;
};


UNTBgenJobFormPanel.prototype.loadExample1 = function (){
	Ext.getCmp("jobNameField_"+this.id).setValue("Example bci full");
	this.paramsWS["data-fileid"] = "example1";
	
	this.fileBrowserLabel.setText('<span class="emph">bci_full.txt</span> <span class="info">(server)</span>',false);
	
	Ext.getCmp("etienne_"+this.id).setValue(true);
	Ext.getCmp("ewens_"+this.id).setValue(true);
	Ext.getCmp("lrt_"+this.id).setValue(true);
	Ext.getCmp("sad_"+this.id).setValue(true);
	Ext.getCmp("test_"+this.id).setValue(true);
	Ext.getCmp("fixs_"+this.id).setValue(true);
	Ext.getCmp("contour_"+this.id).setValue(true);
	
	this.validateRunButton();
};


UNTBgenJobFormPanel.prototype.loadExample2 = function (){
	Ext.getCmp("jobNameField_"+this.id).setValue("Example bci short");
	this.paramsWS["data-fileid"] = "example2";
	
	this.fileBrowserLabel.setText('<span class="emph">bci_short.txt</span> <span class="info">(server)</span>',false);
	
	Ext.getCmp("etienne_"+this.id).setValue(true);
	Ext.getCmp("ewens_"+this.id).setValue(true);
	Ext.getCmp("lrt_"+this.id).setValue(true);
	Ext.getCmp("sad_"+this.id).setValue(true);
	Ext.getCmp("test_"+this.id).setValue(true);
	Ext.getCmp("fixs_"+this.id).setValue(true);
	Ext.getCmp("contour_"+this.id).setValue(true);
	
	this.validateRunButton();
};


UNTBgenJobFormPanel.prototype.validateRunButton = function (){
	if(this.paramsWS["data-fileid"] != null && Ext.getCmp("jobNameField_"+this.id).getValue()!=""){
		this.runButton.enable();
	}else{
		this.runButton.disable();
	}
//	this.runButton.enable();
};
UNTBgenJobFormPanel.prototype.getCheckValue = function (checkbox){
	if(checkbox.getValue())
		return null;
	return "";
};
UNTBgenJobFormPanel.prototype.runJob = function (){
		this.paramsWS["sessionid"] = $.cookie('bioinfo_sid');
		this.paramsWS["jobname"] = Ext.getCmp("jobNameField_"+this.id).getValue();
		
		var etienneValue = Ext.getCmp("etienne_"+this.id).getValue();
		this.paramsWS["etienne"] = etienneValue;
		
		var ewensValue = Ext.getCmp("ewens_"+this.id).getValue();
		this.paramsWS["ewens"] = ewensValue;
		
		if(etienneValue && ewensValue)
			this.paramsWS["lrt"] = Ext.getCmp("lrt_"+this.id).getValue();
		
		this.paramsWS["sad"] = Ext.getCmp("sad_"+this.id).getValue();
		
		var testValue = Ext.getCmp("test_"+this.id).getValue();
		this.paramsWS["test"] = testValue;
		if(testValue){
			this.paramsWS["gens"] = Ext.getCmp("gens_"+this.id).getValue();
			this.paramsWS["method"] = Ext.getCmp("method").getValue().method;
			this.paramsWS["fixs"] = Ext.getCmp("fixs_"+this.id).getValue();
		}
		
		if(etienneValue)
			this.paramsWS["contour"] = Ext.getCmp("contour_"+this.id).getValue();
		
		
		this.adapter.untbgenAnalysis(this.paramsWS);
		this.panel.close();
};


//helping functions
UNTBgenJobFormPanel.prototype.createCheckBox = function (name, label, checked, margin, disabled, handler){
	if(checked == null)
		cheched = false;
	if(margin == null)
		margin = 0;
	var sufix = this.id;
	var cb = Ext.create('Ext.form.field.Checkbox', {
		 id: name+"_"+this.id,
		 boxLabel: label,
		 name: name,
		 checked: checked,
		 disabled: disabled,
		 margin: '0 0 0 '+margin,
		 handler: function(me, checked){
			 validateOptions(name,checked, sufix);
		 }
	});
	return cb;
};
UNTBgenJobFormPanel.prototype.createLabel = function (text, margin){
	if(margin == null)
		margin = "15 0 0 0";
	var label = Ext.create('Ext.form.Label', {
		margin:margin,
		html:'<span class="emph">'+text+'</span>'
	});
	
	return label;
};
UNTBgenJobFormPanel.prototype.createNumberField = function (name, label, value, min, max, margin, disabled){
	var nf = Ext.create('Ext.form.field.Number', {
		id:name+"_"+this.id,
		fieldLabel : label,
		name : name,
		disabled: disabled,
		width: 200,
		value: value,
		minValue: min,
	    maxValue: max,
	    style: 'margin-left:'+margin+'px',
		allowBlank: false
	});
	return nf;
};


//validate options
function validateOptions(opt, checked, sufix) {
	if(opt == 'etienne'){
		if(!checked)
			Ext.getCmp('contour_'+sufix).disable();
		else
			Ext.getCmp('contour_'+sufix).enable();
			
		if(checked==true && Ext.getCmp('ewens_'+sufix).value==true)
			Ext.ComponentManager.get('lrt_'+sufix).enable();
		else
			Ext.ComponentManager.get('lrt_'+sufix).disable();
	}
	else if(opt == 'ewens'){
		if(checked==true && Ext.ComponentManager.get('etienne_'+sufix).value==true)
			Ext.ComponentManager.get('lrt_'+sufix).enable();
		else
			Ext.ComponentManager.get('lrt_'+sufix).disable();
	}
	else if(opt == 'test'){
		if(!checked){
			Ext.getCmp('gens_'+sufix).disable();
			Ext.getCmp('fixs_'+sufix).disable();
			Ext.getCmp('method').disable();
		}
		else{
			Ext.getCmp('gens_'+sufix).enable();
			Ext.getCmp('fixs_'+sufix).enable();
			Ext.getCmp('method').enable();
		}
	}
}