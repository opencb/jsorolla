function UrlWidget(args){
	var _this=this;
	this.id = "UrlWidget_" + Math.round(Math.random()*10000000);
	this.targetId = null;
	
	this.title = "Custom url";
	this.width = 500;
	this.height = 400;
	
	if (args != null){
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
	
	this.onAdd = new Event(this);
};

UrlWidget.prototype.draw = function (){
	if(this.panel==null){
		this.render();
	}
	this.panel.show();
};

UrlWidget.prototype.render = function (){
	var _this=this;
	
    this.urlField = Ext.create('Ext.form.field.Text',{
    	margin:"0 2 2 0",
    	labelWidth : 30,
    	flex:1,
    	fieldLabel : 'URL',
		emptyText: 'enter a valid url',
		value : "http://www.ensembl.org/das/Homo_sapiens.GRCh37.gene/features",
		listeners : { change: {fn: function(){ var dasName = this.value.split('/das/')[1].split('/')[0];
											   _this.trackNameField.setValue(dasName); }}
		}
    });
    this.checkButton = Ext.create('Ext.button.Button',{
		text : 'Check',
		handler : function() {
			_this.form.setLoading();
			var dasDataAdapter = new DasRegionDataAdapter({
				url : _this.urlField.getValue()
			});

			dasDataAdapter.successed.addEventListener(function() {
				_this.contentArea.setValue(dasDataAdapter.xml);
				_this.form.setLoading(false);
			});

			dasDataAdapter.onError.addEventListener(function() {
				_this.contentArea.setValue("XMLHttpRequest cannot load. This server is not allowed by Access-Control-Allow-Origin");
				_this.form.setLoading(false);
			});
			dasDataAdapter.fill(1, 1, 1);
		}
    });
	this.trackNameField = Ext.create('Ext.form.field.Text',{
		name: 'file',
//        fieldLabel: 'Track name',
        allowBlank: false,
        value: _this.urlField.value.split('/das/')[1].split('/')[0],
        emptyText: 'Choose a name',
        flex:1
	});
	this.panelSettings = Ext.create('Ext.panel.Panel', {
		layout: 'hbox',
		border:false,
		title:'Track name',
		cls:"panel-border-top",
		bodyPadding: 10,
	    items : [this.trackNameField]	 
	});
	this.contentArea = Ext.create('Ext.form.field.TextArea',{
		margin:"-1",
		width : this.width,
		height : this.height
	});
	this.infobar = Ext.create('Ext.toolbar.Toolbar',{height:28,cls:"bio-border-false"});
	this.infobar.add(this.urlField);
	this.infobar.add(this.checkButton);
	this.form = Ext.create('Ext.panel.Panel', {
		border : false,
		items : [this.infobar,this.contentArea,this.panelSettings]
	});
	
	this.panel = Ext.create('Ext.ux.Window', {
		title : this.title,
		layout: 'fit',
		resizable:false,
		items : [this.form],
		buttons : [{
			text : 'Add',
			handler : function() {
				_this.onAdd.notify({name:_this.trackNameField.getValue(),url:_this.urlField.getValue()});
				_this.panel.close();
			}
		},{text : 'Cancel',handler : function() {_this.panel.close();}}
		],
		listeners: {
	      	destroy: function(){
	       		delete _this.panel;
	      	}
    	}
	});
};