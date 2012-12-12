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

function GenomicAttributesWidget(species, args){
	var _this=this;
	this.id = "GenomicAttributesWidget" + Math.round(Math.random()*10000);
	
	this.species=species;
	this.args=args;
	
	this.title = "None";
	this.featureType = "gene";
	
	this.columnsCount = null; /** El numero de columns que el attributes widget leera del fichero, si null lo leera entero **/
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.columnsCount!= null){
        	this.columnsCount = args.columnsCount;       
        }
        if (args.featureType!= null){
        	this.featureType = args.featureType;
        }
        if (args.viewer!= null){
        	this.viewer = args.viewer;      
        	args.listWidgetArgs.viewer = args.viewer;
        }
    }
	
	this.listWidget = new ListWidget(this.species,args.listWidgetArgs);
	
	this.attributesPanel = new AttributesPanel({height: 240, columnsCount: this.columnsCount,wum:args.wum,tags:args.tags});
	
	/** Event **/
	this.onMarkerClicked = new Event(this);
	this.onTrackAddAction = new Event(this);
	
	
	/**Atach events i listen**/
	this.attributesPanel.onDataChange.addEventListener(function(sender,data){
		_this.dataChange(data);
	});
	
	
};

GenomicAttributesWidget.prototype.draw = function (){
	var _this=this;
	if (this.panel == null){
		
		this.karyotypePanel  = Ext.create('Ext.panel.Panel', {
			id:this.id+"karyotypePanel",
			height:350,
			maxHeight:350,
			border:0,
//			bodyPadding: 15,
			padding:'0 0 0 0',
			html:'<div id="' + this.id + "karyotypeDiv" +'" ><div>'
		});
		
		this.karyotypePanel.on("afterrender",function(){
			var div = $('#'+_this.id+"karyotypeDiv")[0];
			console.log(div);
			_this.karyotypeWidget = new KaryotypeWidget(div,{
				width:1000,
				height:340,
				species:_this.viewer.species,
				region:_this.viewer.region
			});
			_this.karyotypeWidget.onClick.addEventListener(function(sender,data){
				_this.viewer.region.load(data)
				_this.viewer.onRegionChange.notify({sender:"KaryotypePanel"});
			});
			_this.karyotypeWidget.drawKaryotype();
		});
		
		this.filtersButton = Ext.create('Ext.button.Button', {
			 text: 'Additional Filters',
			 disabled:true,
			 listeners: {
			       scope: this,
			       click: function(){this.onAdditionalInformationClick();}
	        }
		});
		
		this.addTrackButton = Ext.create('Ext.button.Button', {
			text:'Add Track',
			disabled:true,
			handler: function(){
				_this.onTrackAddAction.notify({"adapter":_this.adapter,"fileName":_this.attributesPanel.fileName});
				}
		});
		
		this.panel  = Ext.create('Ext.ux.Window', {
			title : this.title,
			resizable: false,
			minimizable :true,
			constrain:true,
			closable:true,
			bodyStyle: 'background:#fff;',
			taskbar:Ext.getCmp(this.args.viewer.id+'uxTaskbar'),
			items: [this.attributesPanel.getPanel(),this.karyotypePanel],
			width: 1035,
		    height: 653,
		    buttonAlign:'left',
			buttons:[this.addTrackButton,'->',
			         {text:'Close', handler: function(){_this.panel.close();}}],
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
		this.attributesPanel.barField.add(this.filtersButton);
		this.panel.setLoading();
	}	
	this.panel.show();
		
};

//GenomicAttributesWidget.prototype.getMainPanel = function (){
//	var _this=this;
//	if (this.panel == null){
//		
//		this.karyotypePanel  = Ext.create('Ext.panel.Panel', {
//			height:350,
//			maxHeight:350,
//			border:0,
//			bodyPadding: 15,
//			padding:'0 0 0 0',
//			html:'<div id="' + this.id + "karyotypeDiv" +'" ><div>'
//		});
//
//		this.filtersButton = Ext.create('Ext.button.Button', {
//			 text: 'Additional Filters',
//			 disabled:true,
//			 listeners: {
//			       scope: this,
//			       click: function(){this.onAdditionalInformationClick();}
//	        }
//		});
//		
//		this.addTrackButton = Ext.create('Ext.button.Button', {
//			text:'Add Track',
//			disabled:true,
//			handler: function(){ 
//				_this.onTrackAddAction.notify({"features":_this.features,"trackName":_this.attributesPanel.fileName});
//				}
//		});
//		
////		this.panel  = Ext.create('Ext.ux.Window', {
////			title : this.title,
////			resizable: false,
////			minimizable :true,
////			constrain:true,
////			closable:true,
////			items: [this.attributesPanel.getPanel(),this.karyotypePanel],
////			width: 1035,
////		    height: 653,
////		    buttonAlign:'left',
////			buttons:[this.addTrackButton,'->',
////			         {text:'Close', handler: function(){_this.panel.close();}}],
////	 		listeners: {
////		    	scope: this,
////		    	minimize:function(){
////					this.panel.hide();
////		       	},
////		      	destroy: function(){
////		       		delete this.panel;
////		      	}
////	    	}
////		});
//		this.attributesPanel.getPanel();
//		this.attributesPanel.barField.add(this.filtersButton);
////		this.panel.setLoading();
////		this.drawKaryotype();
//	}	
//	return [this.attributesPanel.getPanel(),this.karyotypePanel];
//		
//};

//GenomicAttributesWidget.prototype.fill = function (queryNames){
//	var _this = this;
//	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
//	cellBaseDataAdapter.successed.addEventListener(function(sender){
//		_this.karyotypePanel.setLoading("Retrieving data");
//		for (var i = 0; i < cellBaseDataAdapter.dataset.toJSON().length; i++) {
//				_this.karyotypeWidget.mark(cellBaseDataAdapter.dataset.toJSON()[i]);
//				
//		}
//		_this.features=cellBaseDataAdapter.dataset.toJSON();
//		_this.query = {"dataset": cellBaseDataAdapter.dataset, "resource":queryNames }; 
//		_this.karyotypePanel.setLoading(false);
//		_this.filtersButton.enable();
//		_this.addTrackButton.enable();
//		
//	});
//	cellBaseDataAdapter.fill("feature", this.featureType, queryNames.toString(), "info");
//};

GenomicAttributesWidget.prototype.dataChange = function (items){
		try{
					var _this = this;
					
					this.karyotypePanel.setLoading("Connecting to Database");
					this.karyotypeWidget.unmark();
					var _this=this;
					var externalNames = [];
					
					for (var i = 0; i < items.length; i++) {
						externalNames.push(items[i].data[0]);
					}	
					if (items.length > 0){
						this.fill(externalNames);
					}
					else{
						this.karyotypePanel.setLoading(false);
					}
		}
		catch(e){
			alert(e);
			
		}
		finally{
			this.karyotypePanel.setLoading(false);
		}
};


GenomicAttributesWidget.prototype.onAdditionalInformationClick = function (){
	var _this=this;
	this.listWidget.draw(this.cbResponse, false);
	this.listWidget.onFilterResult.addEventListener(function(sender,data){
			_this.karyotypeWidget.unmark();
			var items  = data;
			for (var i = 0; i < items.length; i++) {
				var feature = items[i].data;
				_this.karyotypeWidget.addMark(feature);
			}
		
		_this.attributesPanel.store.clearFilter();
		_this.attributesPanel.store.filter(function(item){
			return item.data.cellBase;
		});
	});
};
