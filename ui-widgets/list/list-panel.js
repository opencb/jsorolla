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

function ListPanel(species, args) {
	this.targetId = null;
	this.id = "ListPanel" + Math.round(Math.random()*100000);
	this.species=species;
	
	this.args=args;
	
	this.title = "List of Genes";
	this.width = 1000;
	this.height = 500;
	this.borderCls='panel-border-bottom';
	
	this.gridFields = [ 'externalName', 'stableId', 'biotype','position', 'strand', 'description', 'chromosome', 'start', 'end'];
		
	if (args != null){
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
        if (args.gridFields != null){
        	this.gridFields = args.gridFields;
        }
        if (args.borderCls!= null){
        	this.borderCls = args.borderCls;       
        }
        if (args.viewer!= null){
        	this.viewer = args.viewer;       
        }
        if (args.featureType!= null){
        	this.featureType = args.featureType;       
        }
    }
	
	this.onSelected = new Event(this);
	this.onFilterResult = new Event(this);
	
	
};

ListPanel.prototype._getGeneGrid = function() {
	var _this = this;
//	if(this.grid==null){
		var fields = this.gridFields;
		
		var filters = [];
		var columns = new Array();
		
		for(var i=0; i<fields.length; i++){
			filters.push({type:'string', dataIndex:fields[i]});
			columns.push({header:this.gridFields[i], dataIndex:this.gridFields[i], flex:1});
		}
		
		this.store = Ext.create('Ext.data.Store', {
			fields : fields,
			groupField : 'biotype',
			autoload : false
		});

	
		var filters = {
	        ftype: 'filters',
	        local: true, // defaults to false (remote filtering)
	        filters: filters
	    };
		
	    this.infoToolBar = Ext.create('Ext.toolbar.Toolbar');
		this.infoLabelOk = Ext.create('Ext.toolbar.TextItem', {
			text : '&nbsp;'
		});
		this.infoLabelNotFound = Ext.create('Ext.toolbar.TextItem', {
			text : '&nbsp;'
		});
		this.clearFilter = Ext.create('Ext.button.Button', {
			 text: 'Clear filters',
			 listeners: {
			 	scope: this,
			 	click: function(){
			 		if(this.grid.filters!=null){
						this.grid.filters.clearFilters();
			 		}
				}
		    }
		});
		this.found = Ext.create('Ext.button.Button', {
			 text: 'Features found',
			 hidden:true,
			 listeners: {
			 	scope: this,
			 	click: function(){
			 		new InputListWidget({title:"Features found", headerInfo:"This features were found in the database",viewer:this.viewer}).draw(this.queriesFound.join('\n'));
				}
		    }
		});
		this.notFound = Ext.create('Ext.button.Button', {
			 text: 'Features not found',
			 hidden:true,
			 listeners: {
			 	scope: this,
			 	click: function(){
			 		new InputListWidget({title:"Features not found", headerInfo:"This features were not found in the database",viewer:this.viewer}).draw(this.queriesNotFound.join('\n'));
				}
		    }
		});
		this.exportButton = Ext.create('Ext.button.Button', {
			text : 'Export to Text',
			handler : function() {
    	 		new InputListWidget({width:1100, title:"VCS content", headerInfo:"Export results",viewer:_this.args.viewer}).draw(_this._getStoreContent());
     		}
		});
		this.localizeButton = Ext.create('Ext.button.Button', {
			text : 'Localize on karyotype',
			handler : function() { _this._localize();}
		});
		this.infoToolBar.add([ '->',this.exportButton,this.localizeButton,'-',this.found,this.notFound,this.clearFilter]);
	    
		
		this.grid = Ext.create('Ext.grid.Panel', {
			border:0,
			store : this.store,
			features: [filters],
			bbar:this.infoToolBar,
			columns : columns,
			selModel: {
                mode: 'SINGLE'
            }
		});		
	return this.grid;
};

ListPanel.prototype._localize = function() {
	var _this = this;
	
	var panel = Ext.create('Ext.window.Window', {
		id:this.id+"karyotypePanel",
		title:"Karyotype",
		width:1020,
		height:410,
		bodyStyle: 'background:#fff;',
		html:'<div id="' + this.id + "karyotypeDiv" +'" ><div>',
		buttons : [{text : 'Close', handler : function() {panel.close();}} ],
		listeners:{
			afterrender:function(){
				
				var div = $('#'+_this.id+"karyotypeDiv")[0];
				var karyotypeWidget = new KaryotypeWidget(div,{
					width:1000,
					height:340,
					species:_this.viewer.species,
					chromosome:_this.viewer.chromosome,
					position:_this.viewer.position
				});
				karyotypeWidget.onClick.addEventListener(function(sender,data){
					_this.viewer.onLocationChange.notify({position:data.position,chromosome:data.chromosome,sender:"KaryotypePanel"});
				});
				karyotypeWidget.drawKaryotype();

				for ( var i = 0; i < _this.features.length; i++) {
						var feature = _this.features[i];
						karyotypeWidget.addMark(feature);
				}
//				
			}
		}
	}).show();
};

ListPanel.prototype.setTextInfoBar = function(resultsCount, featuresCount, noFoundCount) {
	this.found.setText('<span class="dis">' + resultsCount + ' results found </span> ');
	this.found.show();
	if (noFoundCount > 0){
		this.notFound.setText('<span class="err">'  + noFoundCount +' features not found</span>');
		this.notFound.show();
	}
};

ListPanel.prototype._getStoreContent = function() {
	var text = new String();
		for ( var i = 0; i < this.store.data.items.length; i++) {
			var header = new String();
			if (i == 0){
				for ( var j = 0; j < this.gridFields.length; j++) {
					header = header + this.gridFields[j] + "\t";
				}
				header = header + "\n";
			}
			var row = header;
			for ( var j = 0; j < this.gridFields.length; j++) {
				row = row + this.store.data.items[i].data[ this.gridFields[j]] + "\t";
			}
				
			row = row + "\n";
			text = text + row;
		}
	return text;
};

ListPanel.prototype._render = function() {
	var _this = this;
	if(this.panel==null){
		this.panel = Ext.create('Ext.panel.Panel', {
		    height:240,
		    layout:'fit',
		    cls:this.borderCls,
			title : this.title,
			border:false
		});
	}
	this.panel.add(this._getGeneGrid());
};

ListPanel.prototype.draw = function(cbResponse, useAdapter) {
	this._render();
	
	this.queriesNotFound = [];
	this.queriesFound = [];
	this.features = [];
	

	if(useAdapter != false){
		this.adapter = new FeatureDataAdapter(null,{species:this.species});
		for ( var i = 0; i < cbResponse.result.length; i++) {

			//Check if is a single object
			if(cbResponse.result[i].constructor != Array){
				cbResponse.result[i] = [cbResponse.result[i]];
			}

			for ( var j = 0; j < cbResponse.result[i].length; j++) {
				var feature = cbResponse.result[i][j];
				feature.position = feature.chromosome + ":"+ feature.start + "-" + feature.end;
				feature.featureType = cbResponse.subCategory;
				this.features.push(feature);
			}


			if (cbResponse.result[i].length == 0){
				this.queriesNotFound.push(cbResponse.query[i]);
			}else{
				this.queriesFound.push(cbResponse.query[i]);
				this.adapter.addFeatures(cbResponse.result[i]);
			}
		}
	}else{// no adapter needed because no track will be created 
		for ( var i = 0; i < cbResponse.result.length; i++) {
			//Check if is a single object
			if(cbResponse.result[i].constructor != Array){
				cbResponse.result[i] = [cbResponse.result[i]];
			}
			for ( var j = 0; j < cbResponse.result[i].length; j++) {
				var feature = cbResponse.result[i][j];
				feature.position = feature.chromosome + ":"+ feature.start + "-" + feature.end;
				feature.featureType = cbResponse.subCategory;
				this.features.push(feature);
			}

			if (cbResponse.result[i].length == 0){
				this.queriesNotFound.push(cbResponse.query[i]);
			}else{
				this.queriesFound.push(cbResponse.query[i]);
			}
		}
	}

	
	this.store.loadData(this.features);//true = append;  to sencha store

	this.setTextInfoBar(this.queriesFound.length, this.queriesFound.length, this.queriesNotFound.length);
};
