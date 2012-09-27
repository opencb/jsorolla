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

function AttributesPanel(args){
	var _this= this;
	this.targetId = null;
	this.id = "AttributesPanel_" + Math.round(Math.random()*10000000);
	
	this.title = null;
	this.width = 1023;
	this.height = 628;
	this.wum = true;
	this.tags = [];
	this.borderCls='panel-border-bottom';
	
	this.columnsCount = null;
	if (args != null){
		if (args.wum!= null){
        	this.wum = args.wum;       
        }
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
        if (args.columnsCount!= null){
        	this.columnsCount = args.columnsCount;       
        }
        if (args.borderCls!= null){
        	this.borderCls = args.borderCls;       
        }
        if (args.tags!= null){
        	this.tags = args.tags;       
        }
    }
        
	/** create widgets **/
	this.browserData = new BrowserDataWidget();
    
	
    /** Events i send **/
    this.onDataChange = new Event(this);
    this.onFileRead = new Event(this);
    
    /** Events i listen **/
    this.browserData.adapter.onReadData.addEventListener(function (sender, data){
    	var tabularDataAdapter = new TabularDataAdapter(new StringDataSource(data.data),{async:false});
    	var fileLines = tabularDataAdapter.getLines();
		_this.makeGrid(tabularDataAdapter);
		_this.uptadeTotalFilteredRowsInfo(fileLines.length);
		_this.uptadeTotalRowsInfo(fileLines.length);
		_this.fileName = data.filename;
		_this.fileNameLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
	});	
};

AttributesPanel.prototype.draw = function (){
	var panel = this.getPanel();
	
	if (this.targetId != null){
		panel.render(this.targetId);
	}
};

AttributesPanel.prototype.uptadeTotalRowsInfo = function (linesCount){
	this.infoLabel.setText('<span class="dis">Total rows: </span><span class="emph">' + linesCount + '</span>',false);
	
};

AttributesPanel.prototype.uptadeTotalFilteredRowsInfo = function (filteredCount){
	this.infoLabel2.setText('<span class="dis">Filtered rows: </span><span class="emph">' + filteredCount + '</span>',false);
};

AttributesPanel.prototype.sessionInitiated = function (){
	if(this.btnBrowse!=null){
		this.btnBrowse.enable();
	}
};

AttributesPanel.prototype.sessionFinished = function (){
	if(this.btnBrowse!=null){
		this.btnBrowse.disable();
	}
};

AttributesPanel.prototype.getPanel = function (){
	var _this=this;
	if (this.panel == null){
		this.expresionAnalysisUploadFieldFile = Ext.create('Ext.form.field.File', {
			msgTarget : 'side',
//			flex:1,
			width:75,
			emptyText: 'Choose a local file',
	        allowBlank: false,
			buttonText : 'Browse local',
			buttonOnly : true,
			listeners : {
				scope:this,
				change :function() {
						_this.panel.setLoading("Reading file");
						try{
							var dataAdapter = new TabularFileDataAdapter({comment:"#"});
							var file = document.getElementById(this.expresionAnalysisUploadFieldFile.fileInputEl.id).files[0];
							_this.fileName = file.name;
							_this.fileNameLabel.setText('<span class="emph">'+ file.name +'</span> <span class="info">(local)</span>',false);
							dataAdapter.loadFromFile(file);
							
							dataAdapter.onRead.addEventListener(function(sender, id) {
									_this.makeGrid(dataAdapter);
									_this.uptadeTotalFilteredRowsInfo(dataAdapter.lines.length);
									_this.uptadeTotalRowsInfo(dataAdapter.lines.length);
									_this.panel.setLoading(false);
									_this.onFileRead.notify();
							});
						}
						catch(e){
							alert(e);
							_this.panel.setLoading(false);
						}
					
				}
			}
		});
		this.barField = Ext.create('Ext.toolbar.Toolbar');
		this.barInfo = Ext.create('Ext.toolbar.Toolbar',{dock:'bottom'});
		this.barHelp = Ext.create('Ext.toolbar.Toolbar',{dock:'top'});
		
		
		this.clearFilter = Ext.create('Ext.button.Button', {
			 text: 'Clear filters',
			 disabled:true,
			 listeners: {
			       scope: this,
			       click: function(){
			       			if(this.grid.filters!=null){
			       				this.grid.filters.clearFilters();
			       				this.store.clearFilter();
			       			}
			       		}
	        }
		});
			
		
		this.helpLabel = Ext.create('Ext.toolbar.TextItem', {
			text:'<span class="dis">Click on the header down arrow to filter by column</span>'
		});
		this.fileNameLabel = Ext.create('Ext.toolbar.TextItem', {
			text:'<span class="emph">Select a <span class="info">local</span> file or a <span class="info">server</span> file from your account.</span>'
		});
		this.infoLabel = Ext.create('Ext.toolbar.TextItem', {
			text:'&nbsp;'
		});
		this.infoLabel2 = Ext.create('Ext.toolbar.TextItem', {
			text:'&nbsp;'//'<span class="info">No file selected</span>'
		});
		
		this.barField.add(this.expresionAnalysisUploadFieldFile);
		this.barInfo.add('->',this.infoLabel,this.infoLabel2);
		this.barHelp.add(this.fileNameLabel,'->',this.helpLabel);
		
		this.store = Ext.create('Ext.data.Store', {
			fields:["1","2"],
			data:[]
		});
		this.grid = Ext.create('Ext.grid.Panel', {
		    store: this.store,
		    disabled:true,
		    border:0,
		    columns:[{header:"Column 1",dataIndex:"1"},{header:"Column 2",dataIndex:"2"}]
		});
		
		this.panel  = Ext.create('Ext.panel.Panel', {
			title : this.title,
			border:false,
			layout: 'fit',
			cls:this.borderCls,
			items: [this.grid],
			tbar:this.barField,
			width: this.width,
		    height:this.height,
		    maxHeight:this.height,
			buttonAlign:'right',
	 		listeners: {
		    	scope: this,
		    	minimize:function(){
					this.panel.hide();
		       	},
		      	destroy: function(){
		       		delete this.panel;
		      	}
	    	}
		});
		this.panel.addDocked(this.barInfo);
		this.panel.addDocked(this.barHelp );
		
	}	
	
	
	if(this.wum){
			this.btnBrowse = Ext.create('Ext.button.Button', {
		        text: 'Browse server',
		        disabled:true,
//		        iconCls:'icon-local',
//		        cls:'x-btn-default-small',
		        listeners: {
				       scope: this,
				       click: function (){
				    	   		this.browserData.draw($.cookie('bioinfo_sid'),this.tags);
				       		}
		        }
			});
			
			this.barField.add(this.btnBrowse);
			
			if($.cookie('bioinfo_sid') != null){
				this.sessionInitiated();
			}else{
				this.sessionFinished();
			}
	}
	this.barField.add('-',this.clearFilter);
	
	return this.panel;
};


AttributesPanel.prototype.getData = function (){
	return this.data;
};

AttributesPanel.prototype.makeGrid = function (dataAdapter){
		var _this = this;
		this.data = dataAdapter.getLines();
	
		var fields = [];
		var columns = [];
		var filtros = [];
		
		if (this.columnsCount == null){
			this.columnsCount = this.data[0].length;
		}
//		for(var i=0; i< data[0].length; i++){
		for(var i=0; i< this.columnsCount; i++){
			var type = dataAdapter.getHeuristicTypeByColumnIndex(i);
			fields.push({"name": i.toString(),type:type});
			columns.push({header: "Column "+i.toString(), dataIndex:i.toString(), flex:1,filterable: true,  filter: {type:type}});
			filtros.push({type:type, dataIndex:i.toString()});
		}
		this.store = Ext.create('Ext.data.Store', {
		    fields: fields,
		    data: this.data,
		    listeners:{
		    	scope:this,
		    	datachanged:function(store){
		    		var items = store.getRange();
		    		this.uptadeTotalFilteredRowsInfo(store.getRange().length);
		    		this.onDataChange.notify(store.getRange());
		    	}
		    }
		});
		
		var filters = {
        ftype: 'filters',
        local: true,
        filters: filtros
    	};
		
    	if(this.grid!=null){
			this.panel.remove(this.grid);
		}
    	
		this.grid = Ext.create('Ext.grid.Panel', {
		    store: this.store,
		    columns:columns,
//		    height:164,
//		    maxHeight:164,
//		    height:this.height,
//		    maxHeight:this.height,
		    border:0,
		    features: [filters]
		});
		this.panel.insert(0,this.grid);
		this.clearFilter.enable();
};