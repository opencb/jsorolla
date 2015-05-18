/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
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

function FileWidget(args){
	var _this=this;

    _.extend(this, Backbone.Events);

    this.id = Utils.genId("FileWidget");
	this.targetId;
	this.wum = true;
	this.tags = [];
    this.viewer;
    this.title;
	this.dataAdapter;

    this.args = args;

    _.extend(this, args);


    this.on(this.handlers);

//	this.browserData = new BrowserDataWidget();
	/** Events i listen **/
//	this.browserData.onSelect.addEventListener(function (sender, data){
//		_this.trackNameField.setValue(data.filename);
//		_this.fileNameLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
//		_this.panel.setLoading();
//	});
//    this.browserData.adapter.onReadData.addEventListener(function (sender, data){
//    	console.log(data)
//    	_this.trackNameField.setValue(data.filename);
//    	_this.fileNameLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
//    	_this.loadFileFromServer(data);
//    	_this.panel.setLoading(false);
//	});
    
//    this.chartWidgetByChromosome = new ChartWidget({height:200,width:570});
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

//FileWidget.prototype.getChartItems = function(){
//	return [this.chartWidgetByChromosome.getChart(["features","chromosome"])];
//};

FileWidget.prototype.getFileUpload = function(){
	var _this = this;
	this.uploadField = Ext.create('Ext.form.field.File', {
		msgTarget : 'side',
		flex:1,
        padding:1,
//		width:75,
		emptyText: 'Choose a file',
        allowBlank: false,
        anchor: '100%',
		buttonText : 'Browse local',
//		buttonOnly : true,
		listeners : {
			change : {
				fn : function() {
					_this.panel.setLoading();
					var file = document.getElementById(_this.uploadField.fileInputEl.id).files[0];

					_this.trackNameField.setValue(file.name);
					_this.fileNameLabel.setText('<span class="emph">'+ file.name +'</span> <span class="info">(local)</span>',false);
					_this.loadFileFromLocal(file);
					_this.panel.setLoading(false);

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
			text:'<span class="dis">No file loaded</span>'
		});
		featureCountBar.add([this.featureCountLabel]);
		
		/** Bar for the file upload browser **/
		var browseBar = Ext.create('Ext.toolbar.Toolbar');
		browseBar.add(this.getFileUpload());
		
		this.panel = Ext.create('Ext.panel.Panel', {
			border: false,
	//		padding: "0 0 10 0",
			height:230,
			title: "Previsualization",
//		    items : this.getChartItems(),
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
//			this.btnBrowse = Ext.create('Ext.button.Button', {
//		        text: 'Browse server',
//		        disabled:true,
////		        iconCls:'icon-local',
////		        cls:'x-btn-default-small',
//		        handler: function (){
//	    	   		_this.browserData.draw($.cookie('bioinfo_sid'),_this.tags);
//	       		}
//			});
			
//			browseBar.add(this.btnBrowse);
			
			if(Cookies('bioinfo_sid') != null){
				this.sessionInitiated();
			}else{
				this.sessionFinished();
			}
		}
		
		this.fileNameLabel = Ext.create('Ext.toolbar.TextItem', {
//			text:'<span class="emph">Select a <span class="info">local</span> file or a <span class="info">server</span> file from your account.</span>'
		});
//		browseBar.add(['->',this.fileNameLabel]);
		
		
		
		this.btnOk = Ext.create('Ext.button.Button', {
			text:'Ok',
			disabled:true,
			handler: function(){
				_this.trigger('okButton:click',{fileName:_this.file.name, adapter:_this.adapter});
				_this.openDialog.close();
			}
		});
		
		this.openDialog = Ext.create('Ext.window.Window', {
			title : 'Open '+this.title+' file',
//			taskbar:Ext.getCmp(this.args.viewer.id+'uxTaskbar'),
			width : 600,
	//		bodyPadding : 10,
			resizable:false,
			items : [browseBar, /*this.panel,*/ panelSettings],
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

//FileWidget.prototype._loadChartInfo = function(){
//
//	var datastore = new Array();
// 	for ( var chromosome in this.adapter.featuresByChromosome) {
//		datastore.push({ features: this.adapter.featuresByChromosome[chromosome], chromosome: chromosome });
//	}
// 	this.chartWidgetByChromosome.getStore().loadData(datastore);
//
// 	this.panel.setLoading(false);
// 	this.featureCountLabel.setText("Features count: " + this.adapter.featuresCount, false);
//};



FileWidget.prototype.sessionInitiated = function (){
//	if(this.btnBrowse!=null){
//		this.btnBrowse.enable();
//	}
};
FileWidget.prototype.sessionFinished = function (){
//	if(this.btnBrowse!=null){
//		this.btnBrowse.disable();
//	}
};