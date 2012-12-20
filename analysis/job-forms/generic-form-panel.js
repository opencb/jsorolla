function GenericFormPanel(analysis) {
	this.analysis = analysis;
	this.form = null;
	this.paramsWS = {};
	this.gcsaManager = new GcsaManager();
	this.panelId = this.analysis+"_FormPanel";
	
	this.gcsaManager.onRunAnalysis.addEventListener(function(sender, response){
		if(response.data.indexOf("ERROR") != -1) {
			Ext.Msg.show({
				title:"Error",
				msg: response.data,
				buttons: Ext.Msg.OK,
				icon: Ext.Msg.ERROR
			});
		}
		else console.log(response.data);
	});
};

GenericFormPanel.prototype.draw = function(args) {
	if(args != null && args.type == "window") {
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
			id:this.panelId,
			title: args.title,
		    closable:true,
		    defaults:{margin:30},
		    autoScroll:true,
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
			border: false,
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
	
	var bucketList= Ext.create('Ext.data.Store', {
		fields: ['value', 'name'],
		data : [
		        {"value":"default", "name":"Default"}
		       ]
	});
	var jobDestinationBucket = this.createCombobox("jobDestinationBucket", "Destination bucket", bucketList, 0, 100);
	
	var jobPanel = Ext.create('Ext.panel.Panel', {
		title: 'Job',
		border: true,
		bodyPadding: "5",
		margin: "0 0 5 0",
		width: "100%",
		buttonAlign:'center',
		items: [jobNameField, jobDescriptionField, jobDestinationBucket]
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
			_this.paramsWS = _this.getForm().getForm().getFieldValues();
			_this.paramsWS["sessionid"] = $.cookie('bioinfo_sid');
			_this.beforeRun();
			_this.run();
		}
	});
};

GenericFormPanel.prototype.beforeRun = function() {
	// To be implemented in inner class
};

GenericFormPanel.prototype.run = function() {
	this.gcsaManager.runAnalysis(this.analysis, this.paramsWS);
	
	Ext.example.msg('Job Launched', 'It will be listed soon');
};

GenericFormPanel.prototype.createCombobox = function(name, label, data, defaultValue, labelWidth, margin) {
	return Ext.create('Ext.form.field.ComboBox', {
		name: name,
	    fieldLabel: label,
	    store: data,
	    queryMode: 'local',
	    displayField: 'name',
	    valueField: 'value',
	    value: data.getAt(defaultValue).get('value'),
	    labelWidth: labelWidth,
	    margin: margin,
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

GenericFormPanel.prototype.createGcsaBrowserCmp = function(label, dataParamName) {
	var _this = this;
	var btnBrowse = Ext.create('Ext.button.Button', {
        text: 'Browse data',
        margin: '0 0 0 10',
        handler: function (){
        	_this.gcsaBrowserWidget.draw();
        	var listenerIdx = _this.gcsaBrowserWidget.onSelect.addEventListener(function(sender, response){
        		console.log(response);
        		_this.gcsaBrowserWidget.onSelect.removeEventListener(listenerIdx);
        	});
//        	_this.dataIds[dataParamName] = data;
   		}
	});
	
	return Ext.create('Ext.container.Container', {
//		bodyPadding:10,
//		defaults:{margin:'5 0 0 5'},
//		margin: '5 0 0 0',
		items: [
		        {xtype: 'label', text: label, margin:'5 0 0 5'},
		        btnBrowse
		       ]
	});
};
