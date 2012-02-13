function FileWidget(args){
	var _this=this;
	this.targetId = null;
	this.id = "FileWidget_" + Math.round(Math.random()*100000);
	this.wum = true;
	this.tags = [];
	
	if (args != null){
		if (args.targetId!= null){
			this.targetId = args.targetId;       
		}
		if (args.title!= null){
			this.title = args.title;    
			this.id = this.title+this.id;
		}
		if (args.wum!= null){
			this.wum = args.wum;    
		}
        if (args.tags!= null){
        	this.tags = args.tags;       
        }
	}
	
	this.dataAdapter = null;
	this.onOk = new Event(this);
	
	this.browserData = new BrowserDataWidget();
	/** Events i listen **/
	this.browserData.onSelect.addEventListener(function (sender, data){
		_this.trackNameField.setValue(data.filename);
		_this.fileNameLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
		_this.panel.setLoading();
	});	
    this.browserData.adapter.onReadData.addEventListener(function (sender, data){
    	_this.trackNameField.setValue(data.filename);
    	_this.fileNameLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
    	_this.loadFileFromServer(data);
	});	
};

FileWidget.prototype.getTitleName = function(){
	return this.trackNameField.getValue();
};


FileWidget.prototype.getFileFromServer = function(){
	//abstract method
};

FileWidget.prototype.loadFileFromLocal = function(){
	//abstract method
};

FileWidget.prototype.getChartItems = function(){
	//abstract method
	return [];
};

FileWidget.prototype.getFileUpload = function(){
	var _this = this;
	this.uploadField = Ext.create('Ext.form.field.File', {
		msgTarget : 'side',
//		flex:1,
		width:75,
		emptyText: 'Choose a local file',
        allowBlank: false,
		buttonText : 'Browse local',
		buttonOnly : true,
		listeners : {
			change : {
				fn : function() {
					_this.panel.setLoading();
			
					var file = document.getElementById(_this.uploadField.fileInputEl.id).files[0];
					_this.trackNameField.setValue(file.fileName);
					_this.fileNameLabel.setText('<span class="emph">'+ file.name +'</span> <span class="info">(local)</span>',false);
					_this.loadFileFromLocal(file);

				}
			}
		}
	});
	return this.uploadField;
};


FileWidget.prototype.draw = function(){
	var _this = this;
	
	if (this.openDialog == null){
	
		/** Bar for the chart **/
		var featureCountBar = Ext.create('Ext.toolbar.Toolbar');
		this.featureCountLabel = Ext.create('Ext.toolbar.TextItem', {
			html:'<span class="dis">No file loaded</span>'
		});
		featureCountBar.add([this.featureCountLabel]);
		
		/** Bar for the file upload browser **/
		var browseBar = Ext.create('Ext.toolbar.Toolbar',{cls:'bio-border-false'});
		browseBar.add(this.getFileUpload());
		
		this.panel = Ext.create('Ext.panel.Panel', {
			border: false,
			cls:'panel-border-top panel-border-bottom',
	//		padding: "0 0 10 0",
			title: "Previsualization",
		    items : this.getChartItems(),
		    bbar:featureCountBar
		});
		
	//	var colorPicker = Ext.create('Ext.picker.Color', {
	//	    value: '993300',  // initial selected color
	//	    listeners: {
	//	        select: function(picker, selColor) {
	//	            alert(selColor);
	//	        }
	//	    }
	//	});
		this.trackNameField = Ext.create('Ext.form.field.Text',{
			name: 'file',
            fieldLabel: 'Track Name',
            allowBlank: false,
            value: 'New track from '+this.title+' file',
            emptyText: 'Choose a name',
            flex:1
		});
		
		var panelSettings = Ext.create('Ext.panel.Panel', {
			border: false,
			layout: 'hbox',
			bodyPadding: 10,
		    items : [this.trackNameField]	 
		});
		
		
		if(this.wum){
			this.btnBrowse = Ext.create('Ext.button.Button', {
		        text: 'Browse server',
		        disabled:true,
//		        iconCls:'icon-local',
//		        cls:'x-btn-default-small',
		        handler: function (){
	    	   		_this.browserData.draw($.cookie('bioinfo_sid'),_this.tags);
	       		}
			});
			
			browseBar.add(this.btnBrowse);
			
			if($.cookie('bioinfo_sid') != null){
				this.sessionInitiated();
			}else{
				this.sessionFinished();
			}
		}
		
		this.fileNameLabel = Ext.create('Ext.toolbar.TextItem', {
			html:'<span class="emph">Select a <span class="info">local</span> file or a <span class="info">server</span> file from your account.</span>'
		});
		browseBar.add(['->',this.fileNameLabel]);
		
		
		
		this.btnOk = Ext.create('Ext.button.Button', {
			text:'Ok',
			disabled:true,
			handler: function(){ 
				_this.onOk.notify({title:_this.getTitleName(), dataAdapter:_this.dataAdapter});
				_this.openDialog.close();
			}
		});
		
		this.openDialog = Ext.create('Ext.ux.Window', {
			title : 'Open '+this.title+' file',
			width : 800,
	//		bodyPadding : 10,
			resizable:false,
			items : [browseBar, this.panel, panelSettings],
			buttons:[this.btnOk, 
			         {text:'Cancel', handler: function(){_this.openDialog.close();}}],
			listeners: {
			    	scope: this,
			    	minimize:function(){
						this.openDialog.hide();
			       	},
			      	destroy: function(){
			       		delete this.openDialog;
			      	}
		    	}
		});
		
	}
	this.openDialog.show();
};

FileWidget.prototype.sessionInitiated = function (){
	if(this.btnBrowse!=null){
		this.btnBrowse.enable();
	}
};
FileWidget.prototype.sessionFinished = function (){
	if(this.btnBrowse!=null){
		this.btnBrowse.disable();
	}
};