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
		id: "jobname",
		name: "jobname",
		fieldLabel:'Name',
		emptyText:"Job name",
		allowBlank: false,
		margin:'5 0 0 5'
	});
	
	var jobDescriptionField = Ext.create('Ext.form.field.TextArea', {
		id:"jobdescription",
		name:"jobdescription",
		fieldLabel:'Description',
		emptyText:"Description",
		margin:'5 0 0 5'
	});
	
//	var bucketList= Ext.create('Ext.data.Store', {
//		fields: ['value', 'name'],
//		data : [
//		        {"value":"default", "name":"Default"}
//		       ]
//	});
//	var jobDestinationBucket = this.createCombobox("jobdestinationbucket", "Destination bucket", bucketList, 0, 100);
	var jobFolder = this.createGcsaBrowserCmp('Folder:', 'outdir', 'folderSelection', '0 0 0 66', 'Default job folder');
	
	var jobPanel = Ext.create('Ext.panel.Panel', {
		title: 'Job',
		border: true,
		bodyPadding: "5",
		margin: "0 0 5 0",
		width: "99%",
		buttonAlign:'center',
		items: [jobNameField, jobDescriptionField, jobFolder]
	});
	
	return jobPanel;
};

GenericFormPanel.prototype.getRunButton = function() {
	var _this = this;
	return Ext.create('Ext.button.Button', {
		text:'Run',
		width:300,
		height:35,
		disabled:true,
		formBind: true, // only enabled if the form is valid
		handler: function (){
			var formParams = _this.getForm().getForm().getFieldValues();
			for(var param in formParams) {
				_this.paramsWS[param] = formParams[param];
			}
			_this.paramsWS["sessionid"] = $.cookie('bioinfo_sid');
			_this.paramsWS["accountid"] = $.cookie('bioinfo_account');
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
		id: name,
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
		id: name,
		name: name,
		boxLabel: label,
		checked: (checked || false),
		disabled: disabled,
		margin: (margin || '0 0 0 0')
	});
};

GenericFormPanel.prototype.createGcsaBrowserCmp = function(fieldLabel, dataParamName, mode,  btnMargin, defaultFileLabel) {
	var _this = this;
	var btnBrowse = Ext.create('Ext.button.Button', {
        text: 'Browse...',
        margin: btnMargin || '0 0 0 10',
        handler: function () {
        	_this.gcsaBrowserWidget.draw(mode);
        	var listenerIdx = _this.gcsaBrowserWidget.onSelect.addEventListener(function(sender, response){
        		_this.paramsWS[dataParamName] = response.bucketId+':'+response.id;
        		fileSelectedLabel.setText('<span class="emph">'+response.bucketId+'/'+response.id+'</span>', false);
        		_this.gcsaBrowserWidget.onSelect.removeEventListener(listenerIdx);
        	});
   		}
	});
	
	var fileSelectedLabel = Ext.create('Ext.form.Label', {
		id: dataParamName,
		text: defaultFileLabel || "No file selected",
		margin:'5 0 0 15'
	});
	
	return Ext.create('Ext.container.Container', {
//		bodyPadding:10,
//		defaults:{margin:'5 0 0 5'},
		margin: '5 0 5 0',
		items: [
		        {xtype: 'label', text: fieldLabel, margin:'5 0 0 5'},
		        btnBrowse,
		        fileSelectedLabel
		       ]
	});
};
