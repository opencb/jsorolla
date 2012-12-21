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

function PagedViewListWidget(args){
	var _this=this;
	this._data = null;
	this.id = "PagedViewListWidget_"+ Math.round(Math.random()*10000);
	this.targetId = null;
	
	this.pageSize = 6;
	this.storeFields = new Object();
	this.template = new Object();
	this.width = 280;
	this.height = 550;
	this.title = "";
	this.order = 0;
	this.border = 0;
	this.mode = "view";
	this.sort = 'DESC';

	
	if (args != null){
		if (args.pageSize != null){
			this.pageSize = args.pageSize; 
		}
		if (args.storeFields != null){
			this.storeFields = args.storeFields;
		}
		if (args.template != null){
			this.template = args.template;
		}
		if (args.targetId != null){
			this.targetId = args.targetId;
		}
		if (args.width != null){
        	this.width = args.width;
        }
        if (args.height != null){
        	this.height = args.height;      
        }
        if (args.title != null){
        	this.title = args.title;      
        }
        if (args.order != null){
        	this.order = args.order;      
        }
        if (args.border != null){
        	this.border = args.border;      
        }
        if (args.mode != null){
        	this.mode = args.mode;      
        }
    }
    
	this.currentPage = 1;
	this.pageFieldId = this.id + '_pageField';
	this.pageLabelId = this.id + '_pageLabel';
	this.pagbarId = this.id + '_pagbar';
	this.panelId = this.id + '_panel';
	
	/**Events i send**/
	this.onItemClick = new Event(this);
	
	
	this.textFilterFunction = function(item){
		var str = Ext.getCmp(_this.id+"searchField").getValue().toLowerCase();
		if(item.data.name.toLowerCase().indexOf(str)<0){
			return false;
		}
		return true;
	};
	
};

PagedViewListWidget.prototype.getData = function (){
	return this._data;
};

PagedViewListWidget.prototype._setData = function (data){
	this._data = data;
};

//PagedViewListWidget.prototype.getPageSize = function (){
//	return this.pageSize;
//};

//PagedViewListWidget.prototype.getItemsCount = function (){
//	return this.getData().length;
//};

//PagedViewListWidget.prototype.getPageCount = function (){
//	return Math.ceil(this.getItemsCount() / this.getPageSize());
//};

/**FILTER **/
PagedViewListWidget.prototype.setFilter = function(filterFunction) {
	this.store.clearFilter();
	
	if(filterFunction!=null){
		this.filterFunction = filterFunction;
		this.store.filter([filterFunction,this.textFilterFunction]);
	}else{
		this.store.filter([this.textFilterFunction]);
	}
	
};

/** DRAW **/
PagedViewListWidget.prototype.draw = function(data) {
	
	this._setData(data);
//	this.changeOrder();
	this.render();
	
	this.store.loadData(this.getData());
	if (this.filterFunction != null ){
		this.setFilter(this.filterFunction);
//		this._setData(this.store.data.items);
	}
//	this.changePage(this.currentPage, this.getData(), true);
	
};
/** CLEAN **/
PagedViewListWidget.prototype.clean =  function (){
	if (this.panel != null){
		this.panel.destroy();
		delete this.panel;
	}
};


//PagedViewListWidget.prototype.changePage = function (numberPage, data, restUpdated){
//	if((data != null) && (data.length > 0)){
//		if ((numberPage > 0) && (numberPage <= this.getPageCount())){
//			this.currentPage = numberPage;
//			Ext.getCmp(this.pageLabelId).setText(numberPage+' of '+ this.getPageCount());
//			if (restUpdated != true){				
//				Ext.getCmp(this.pageFieldId).setValue(numberPage);
//			} 
//			var dataPage = new Array(); 
//			for ( var i = (this.getPageSize() * numberPage)- this.getPageSize(); i < this.getPageSize() * numberPage; i++) {
//				if (data[i] != null){
//					dataPage.push(data[i]);
//				}
//			}
//			this.store.loadData(dataPage, false);
//			}
//	}
//	else{
//		this.store.removeAll();
//		this.currentPage=1;
//		Ext.getCmp(this.pageFieldId).setValue(this.currentPage);
//		Ext.getCmp(this.pageLabelId).setText('No data found');
//		
//	}	
//};

//PagedViewListWidget.prototype.changeOrder = function (){
////	console.log(this.id+": "+this.sort);
//	if(this.sort == "desc"){
//		var aux = new Array();
//		var data = this.getData();
//		if(data != null){		
//			for ( var i = data.length-1; i >= 0; i--) {
//				aux.push(data[i]);
//			}
//		}
//		this._setData(aux);
//	}
//};

PagedViewListWidget.prototype.render = function() {
	var _this = this;
	if (this.panel == null){
				this.tpl = new Ext.XTemplate(this.template);
				
				this.store = Ext.create('Ext.data.Store', {
			    	fields: this.storeFields,
			    	sorters: [{ property : 'creationTime', direction: 'DESC'}],
					autoLoad: false
			    });
				
			   var pan=null;
				
			   if(this.mode == "view"){
				   	this.view = Ext.create('Ext.view.View', {
				   		id : this.id+"view",
						padding:15,
						store: this.store,
					    tpl: this.tpl,
					    height:$(document).height()-200,
					    trackOver: true,
					    autoScroll:true,
	           			overItemCls: 'list-item-hover',
	           			itemSelector: '.joblist-item',
					    listeners : {
					    	scope: this,
					    	itemclick : function (este,record){
					    		console.log("jobId: "+record.data.jobId+ "   dataId: "+record.data.dataId);
					    		this.onItemClick.notify(record);
				    		}
	//				    	itemmouseenter : function (este, record, item){
	//				    		item.style.cursor="pointer";
	//				    		item.firstChild.style.cursor="pointer";
	//				    		item.style.border = "1px solid deepSkyBlue";
	//				    		item.style.background = "honeydew";
	//				    	},
	//			    		itemmouseleave : function (este, record, item){
	//				    		item.style.background = "white";	
	//				    		item.style.border = "1px solid #ffffff";
	//				    	}
					    }
					});
				   	
					pan = this.view;
				}
				
				
				if(this.mode == "grid"){
					var columns = [];
					for (var j=0;j<this.storeFields.length; j++){
						columns.push({header:this.storeFields[j],dataIndex:this.storeFields[j], flex:1});
					}
					this.grid = Ext.create('Ext.grid.Panel', {
					    store: this.store,
					    columns: columns,
					    border:0
					});
					pan = this.grid;
				}
				
				/**TEXT SEARCH FILTER**/
		        var searchField = Ext.create('Ext.form.field.Text',{
		        	 id:this.id+"searchField",
			         flex:1,
			         margin:"0 1 0 0",
					 emptyText: 'enter search term',
					 enableKeyEvents:true,
					 listeners:{
					 	change:function (){
					 		_this.setFilter(null);
					 	}
					 }
		        });
				
				this.pagBar = Ext.create('Ext.toolbar.Toolbar', {
					id : this.pagbarId,
					style:'border: '+this.border,
				    items: [
//							{
//							    id : this.id+'btnPrev',
//							    iconCls: Ext.baseCSSPrefix + 'tbar-page-prev',
//							    tooltip:'Previous Page',
//							    listeners: {
//							        scope: this,
//							        click: this.onPrevClick
//							    }
//							},
//							'-',
//							{	
//							    xtype: 'numberfield',
//							    id: this.pageFieldId,
//							    cls: Ext.baseCSSPrefix + 'tbar-page-number',
//							    allowDecimals: false,
//							    minValue: 1,
//							    value:1,
//							    hideTrigger: true,
//							    enableKeyEvents: true,
//							    selectOnFocus: true,
//							    submitValue: false,
//							    width: 30,
//							    margins: '-1 2 3 2',
//							    listeners: {
//							        scope: this,
//							        keyup: this.onPageChange
//							    }
//							},
//							'-',
//							{
//							    id : this.id+'btnNext',
//							    iconCls: Ext.baseCSSPrefix + 'tbar-page-next',
//							    tooltip:'Next Page',
//							    listeners: {
//							        scope: this,
//							        click: this.onNextClick
//							    }
//							},
//			//				'-',
//							{
//							    xtype: 'label',
//							    id: this.pageLabelId,
//							    text: '',
//							    margins: '5 0 0 5'
//							},
							{
							    id : this.id+'btnSort',
							    iconCls: 'icon-order-desc',
							    tooltip:'Change order',
							    handler: function(){
							    	if(_this.sort=="DESC") {
							    		_this.sort = "ASC";
							    		_this.store.sort('creationTime', 'ASC');
							    		this.setIconCls('icon-order-asc');
							    	}
							    	else {
							    		_this.sort = "DESC";
							    		_this.store.sort('creationTime', 'DESC');
							    		this.setIconCls('icon-order-desc');
							    	}
							    }
							},
							searchField,
							{
							    id : this.id+'btnClear',
//							    iconCls: 'icon-delete',
							    text: 'X',
							    margin: "0 2 0 0",
							    tooltip: 'Clear search box',
							    handler: function(){
							    	searchField.reset();
							    }
							}
							
				    ]
				});
//				this.currentPage = Ext.getCmp(this.pageFieldId).getValue();
				
				this.panel = Ext.create('Ext.panel.Panel', {
					id : this.panelId,
					//title : this.title,
					border:this.border,
				    width: this.width,
				    tbar : this.pagBar,
				    items: [pan]
				});
//				this.view.setHeight(this.panel.getHeight());
				
				var target = Ext.getCmp(this.targetId);
				if (target instanceof Ext.panel.Panel){
					target.insert(this.order, this.panel);
					//target.setActiveTab(1);//si no se pone el active da un error de EXT
					//target.setActiveTab(0);//si no se pone el active da un error de EXT
					//pan.setHeight = this.panel.getHeight();
				}else{
					this.panel.render(this.targetId);
				}
	}
};


/** Paging bar Events **/
//PagedViewListWidget.prototype.onPageChange = function (object, event, option){
//	this.changePage(Ext.getCmp(this.pageFieldId).getValue(), this.getData());
//};
//PagedViewListWidget.prototype.onPrevClick = function () {
//	this.changePage(this.currentPage - 1, this.getData());
//};
//PagedViewListWidget.prototype.onNextClick = function () {
//	this.changePage(this.currentPage + 1, this.getData());
//};
/** END Paging bar Events **/
