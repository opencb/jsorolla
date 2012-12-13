function GenericFormPanel(analysis) {
	this.analysis = analysis;
	this.form = null;
	this.paramsWS = null;
	this.gcsaManager = new GcsaManager();
};

GenericFormPanel.prototype.draw = function(args) {
	if(args.type == "window") {
		Ext.create('Ext.ux.Window', {
			title: args.title || "",
			resizable: args.resizable || false,
			width: args.width || 500,
			height: args.height,
			overflowY: 'auto',
			taskbar: args.taskbar,
			items: this.getForm()
		}).show();
	}
	else {
		return Ext.create('Ext.container.Container', {
			items: this.getForm()
		});
	}
};

GenericFormPanel.prototype.getForm = function() {
	if(this.form == null) {
		var items = this.getPanels();
		items.push(this.getJobPanel());
		items.push(this.getRunButton());
		
		this.form = Ext.create('Ext.form.Panel', {
			border: true,
			bodyPadding: "5",
			layout: 'vbox',
			items: items
		});
	}
	
	return this.form;
};

GenericFormPanel.prototype.getPanels = function() {
	// To be implemented in inner class
};

GenericFormPanel.prototype.getJobPanel = function() {
	var _this = this;
	var jobNameField = Ext.create('Ext.form.field.Text', {
		name: "jobName",
		fieldLabel:'Job name',
		emptyText:"Job name",
		allowBlank: false
	});
	
	var jobDescriptionField = Ext.create('Ext.form.field.TextArea', {
		name:"jobDescription",
		fieldLabel:'Description',
		emptyText:"Description"
	});
	
	var jobPanel = Ext.create('Ext.panel.Panel', {
		title: 'Job',
		border: true,
		bodyPadding: "5",
		margin: "0 0 5 0",
		width: "100%",
		buttonAlign:'center',
		items: [jobNameField,jobDescriptionField]
	});
	
	return jobPanel;
};

GenericFormPanel.prototype.getRunButton = function() {
	var _this = this;
	return Ext.create('Ext.button.Button', {
		text:'Run',
		disabled:true,
		formBind: true, // only enabled if the form is valid
		handler: function (){
			_this.beforeRun();
			if(_this.validate()) _this.run();
		}
	});
};

GenericFormPanel.prototype.beforeRun = function() {
	// To be implemented in inner class
};

GenericFormPanel.prototype.validate = function() {
	// To be implemented in inner class
	return true;
};

GenericFormPanel.prototype.run = function() {
	this.paramsWS = this.getForm().getForm().getFieldValues();
	this.paramsWS["sessionid"] = $.cookie('bioinfo_sid');
	
	this.gcsaManager.runAnalysis(this.analysis, this.paramsWS);
	
//	_this.onRun.notify();
	Ext.example.msg('Job Launched', 'It will be listed soon');
};

GenericFormPanel.prototype.createCombobox = function(name, label, data, defaultValue) {
	return Ext.create('Ext.form.field.ComboBox', {
		name: name,
	    fieldLabel: label,
	    store: data,
	    queryMode: 'local',
	    displayField: 'name',
	    valueField: 'value',
	    value: data.getAt(defaultValue).get('value'),
	    width: "100%",
	    labelWidth: "12%",
	    editable: false,
	    allowBlank: false
	});
};

GenericFormPanel.prototype.createCheckBox = function(name, label, checked, margin, disabled, handler) {
	return Ext.create('Ext.form.field.Checkbox', {
		 boxLabel: label,
		 name: name,
		 checked: (checked || false),
		 disabled: disabled,
		 margin: (margin || '0 0 0 0')
	});
};
