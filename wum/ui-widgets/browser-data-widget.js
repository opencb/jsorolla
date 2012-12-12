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

function BrowserDataWidget(args){
	var _this=this;
	this.id = "BrowserDataWidget_" + Math.round(Math.random()*10000000);
	this.targetId = null;
    this.tags=null;
	
   	this.width = 900;
	this.height = 500;
    
	this.retrieveData=true;
	this.notAvailableSuiteList = ['SEA', 'GSnow'];
	
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
        if (args.retrieveData!= null){
        	this.retrieveData = args.retrieveData;       
        }
        if (args.notAvailableSuites!= null){
        	for(var i=0; i<args.notAvailableSuites.length; i++) {
        		this.notAvailableSuiteList.push(args.notAvailableSuites[i]);       
        	}
        }
    }
    
    this.adapter = new WumAdapter();
	this.adapter.onGetData.addEventListener(function (sender, data){
		_this.data=data;
		_this.adapter.getSuiteList();
	});	
	this.adapter.onSuiteList.addEventListener(function (sender, data){
		_this.suiteList = data;
//		console.log(data);
		Ext.getBody().unmask();
		_this.render();
	});	
	
	this.onSelect = new Event(this);
	/**ID**/
	this.searchFieldId = this.id + "_searchField";
};

BrowserDataWidget.prototype.draw = function (sessionID, tags){
	this.tags = tags;
	Ext.getBody().mask("Loading...");
	this.adapter.getData(sessionID, -1);
};

BrowserDataWidget.prototype.render = function (){
	var _this=this;
	if (this.panel == null){
		var data = JSON.parse(this.data);
		var months = {"1":"January","2":"February","3":"March","4":"April","5":"May","6":"June","7":"July","8":"August","9":"September","10":"October","11":"November","12":"December"};
		for(var i =0; i < data.length; i++){
			
			var yearNum = data[i].creationTime.substring(0,4);
			var monthNum = data[i].creationTime.substring(5,7);
			var dayNum = data[i].creationTime.substring(8,10);
			var hourNum = data[i].creationTime.substring(11,16);
			
			data[i].yearMonth = yearNum+" - "+monthNum+" ("+months[parseInt(monthNum)]+")";
			data[i].dayHour = dayNum+" - "+hourNum;
			
			data[i].tagsMatch=false;
			if(data[i].tags!=null){
				data[i].tagsMatch = this.checkTags(data[i].tags);				
			}
		}

		
		/**GRID**/
		this.gridStore = Ext.create('Ext.data.Store', {
		    fields: ["dataId", "ownerId", "jobId", "suiteId", "name", "multiple", "diskUsage", "creationTime", "responsible", "organization", "date", "description", "status", "statusMessage", "write", "enabled", "tags", "dataFiles", "yearMonth","dayHour", "tagsMatch"],
			groupField: 'yearMonth',
		    sorters: [{ property : 'yearMonth',direction: 'DESC'}],
		    data: data
		});
		this.selectedLabel = Ext.create('Ext.toolbar.TextItem', {
			padding:3,
			flex:1,
			text:'<span class="info"> Please select a file</span>.'
		});
		var tagsLabel = Ext.create('Ext.toolbar.TextItem', {
			padding:3,
			text:'Suported tags by this analysis: <span class="emph">'+this.tags.toString().replace(/,/gi,', ').replace(/\|/gi,' or ')+'</span>'
		});
		var tpl = ['<tpl if="tagsMatch"><span class="emph">{name}</span></tpl>',
				   '<tpl if="!tagsMatch"><span class="dis">{name}</span></tpl>'];
				   
		this.grid = Ext.create('Ext.grid.Panel', {
			border:false,
//		    title: 'Data Files',
		    store: this.gridStore,
		    columns: [{"header":"Name",flex:3, xtype:'templatecolumn', tpl:tpl},
		    		  {"header":"Disk usage (KB)","dataIndex":"diskUsage",flex:1.2},{"header":"Year & Month","dataIndex":"yearMonth",flex:1.3},{"header":"Day & Time","dataIndex":"dayHour",flex:1},{"header":"Tags","dataIndex":"tags",flex:1}],
		    features: [{ftype:'grouping'}],
		    selModel: {
                mode: 'SINGLE',
//                allowDeselect:true,
                listeners: {
                	scope:this,
                    selectionchange: function (este,item){
                    					if(item.length>0){//se compr
                    						if(item[0].data.tagsMatch){
                    							this.selectButton.enable();
                    							this.selectedLabel.setText('<p>The selected file <span class="emph">'+item[0].data.name.substr(0,40)+'</span><span class="ok"> is allowed</span>.</p>',false);
                    						}else{
                    							this.selectButton.disable();
                    							this.selectedLabel.setText('<p>The selected file <span class="dis">'+item[0].data.name.substr(0,40)+'</span><span class="err"> is not allowed</span>.</p>',false);
                    						}
                    						//TODO por defecto cojo el primero pero que pasa si el data contiene varios ficheros??
                    					}else{
                    						this.selectButton.disable();
                    					}
                    				}
                }
            },
//		    width: 600,
//		    height: 370,
            flex:4,
		    bbar:{items:[tagsLabel,'-',this.selectedLabel]}
		});
		
		
		/**ORIGIN FILTER**/
		var origins = [{ suiteId: "all",name:"all"},{ suiteId: "Uploaded Data",name:"Uploaded Data"},{ suiteId: "Job Generated",name:"Job Generated"}];
		
	 	var stOrigin = Ext.create('Ext.data.Store', {
	 		fields: ["suiteId","name"],
	 		data : origins
		});
		this.viewOrigin = Ext.create('Ext.view.View', {
		    store : stOrigin,
            selModel: {
                mode: 'SINGLE',
//                allowDeselect:true,
                listeners: {
                    selectionchange:function(){_this.setFilter();}
                }
            },
            cls: 'list',
         	trackOver: true,
            overItemCls: 'list-item-hover',
            itemSelector: '.list-item',
            tpl: '<tpl for="."><div class="list-item">{name}</div></tpl>'
        });
        
        var panOrigin = Ext.create('Ext.panel.Panel', {
        	title:'Search by origin',
        	border:0,
        	bodyPadding:5,
        	style: 'border-bottom:1px solid #99bce8;',
		    items : [this.viewOrigin]
		});
        
		
        /**SUITE FILTER**/
		var parsedSuites = JSON.parse(this.suiteList);
		var suites = [];
		// remove not available suites
		for(var i = 0; i < parsedSuites.length; i++) {
			if(this.notAvailableSuiteList.indexOf(parsedSuites[i].name)==-1){ // es que esta para quitar
				suites.push(parsedSuites[i]);
			}
		}
		
        var stSuite = Ext.create('Ext.data.Store', {
	 		fields: ["suiteId","name","description"],
	 		data : suites
		});
		
		this.viewSuite = Ext.create('Ext.view.View', {
		    store : stSuite,
            selModel: {
                mode: 'SINGLE',
//                allowDeselect:true,
                listeners: {
                	selectionchange:function(){_this.setFilter();}
                }
            },
            cls: 'list',
         	trackOver: true,
            overItemCls: 'list-item-hover',
            itemSelector: '.list-item',
            tpl: '<tpl for="."><div class="list-item">{name}</div></tpl>'
        });
         
        var panSuite = Ext.create('Ext.panel.Panel', {
        	title:'Search by suite',
        	border:0,
        	bodyPadding:5,
		    items : [this.viewSuite]
		});

		
		/**TEXT SEARCH FILTER**/
        this.searchField = Ext.create('Ext.form.field.Text',{
        	 id:this.searchFieldId,
	         flex:1,
			 emptyText: 'enter search term',
			 enableKeyEvents:true,
			 listeners:{
			 	scope:this,
			 	change:this.setFilter
			 }
        });
        
        /**FILTER PANEL**/
         var panFilter = Ext.create('Ext.panel.Panel', {
			minWidth: 125,
		    minHeight : 370,
			flex:1,
			cls:'panel-border-right',
		    border:false,
		    items : [panOrigin,panSuite],
		    tbar : {items:this.searchField}
		});
		
		this.selectButton = Ext.create('Ext.button.Button', {
			 text: 'Ok',
			 disabled:true,
			 handler: function(){
	       			var item = _this.grid.getSelectionModel().getSelection()[0];
	       			if(_this.retrieveData==true){
	       				_this.adapter.readData($.cookie('bioinfo_sid'),item.data.dataFiles[0].dataId,item.data.dataFiles[0].filename);	       				
	       			}
	       			_this.onSelect.notify(item.data.dataFiles[0]);
	       			_this.panel.close();
	       	}
		});  
		
		/**MAIN PANEL**/
//		this.height=205+(26*suites.length);//segun el numero de suites
		this.panel = Ext.create('Ext.window.Window', {
		    title: 'Browse Data',
		    resizable: false,
		    minimizable :true,
			constrain:true,
		    closable:true,
		    modal:true,
		    height:this.height,
		    width:this.width,
		    layout: { type: 'hbox',align: 'stretch'},
		    items: [panFilter,this.grid],
		    buttonAlign:'right',
		    buttons:[
		             { text: 'Close', handler: function(){_this.panel.close();}},
		             this.selectButton
		             ],
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
	}//if null
	this.panel.show();
	this.viewOrigin.getSelectionModel().select(this.viewOrigin.store.first());
    this.viewSuite.getSelectionModel().select(this.viewSuite.store.first());
};

BrowserDataWidget.prototype.setFilter = function (){
	var _this=this;
	var recordOrigin = this.viewOrigin.getSelectionModel().getSelection()[0];
	var recordSuite = this.viewSuite.getSelectionModel().getSelection()[0];
	
	this.gridStore.clearFilter();
	
	if(recordOrigin!=null){
		switch(recordOrigin.data.suiteId){
			case  "all": 			break;
			case  "Uploaded Data": 	this.gridStore.filter(function(item){return item.data.jobId < 0;}); break;
			case  "Job Generated": 	this.gridStore.filter(function(item){return item.data.jobId > 0;}); break;
		}
	}
	if(recordSuite!=null){
		switch(recordSuite.data.suiteId){
			case  1: 				break;
			default : 				this.gridStore.filter(function(item){return item.data.suiteId == recordSuite.data.suiteId;});
		}
	}
	
	this.gridStore.filter(function(item){
			var str = Ext.getCmp(_this.searchFieldId).getValue().toLowerCase();
			if(item.data.name.toLowerCase().indexOf(str)<0){
				return false;
			}
			return true;
		});
};

BrowserDataWidget.prototype.checkTags = function(tags){
	for(var i = 0; i < this.tags.length ; i++){
		if (this.tags[i].indexOf('|')>-1){
			var orTags = this.tags[i].split('|');
			var orMatch = false;
			for(var j = 0; j < orTags.length ; j++){
				if (tags.indexOf(orTags[j]) >-1){
					orMatch=true;
				}
			}
			if(!orMatch){
				return false;
			}
		}else{
			if (tags.indexOf(this.tags[i])==-1){
				return false;
			}
		}
	}
	return true;
	
};
