//GenomicListWidget.prototype._render 				=       ListWidget.prototype._render;
GenomicListWidget.prototype.draw 				=       ListWidget.prototype.draw;
GenomicListWidget.prototype.getActionButton 			=       ListWidget.prototype.getActionButton;


function GenomicListWidget(args) {
	ListWidget.prototype.constructor.call(this, args);
	this.listPanel = new GenomicListPanel({title:false,gridFields:args.gridFields});
	this.onSelected = this.listPanel.onSelected;
	this.onFilterResult = this.listPanel.onFilterResult;
	
	this.onTrackAddAction = new Event();
	
	
};



GenomicListWidget.prototype._render = function() {
	var _this = this;
	if(this.panel==null){
		this.localizeButton = Ext.create('Ext.button.Button', {
			minWidth : 80,
			text : 'OK',
			disabled:true,
			handler : function() {
					_this.listPanel.onSelected.notify(_this.listPanel.grid.getSelectionModel().getSelection()[0].data);
					_this.panel.hide();
			}
		});
		this.filterButton = Ext.create('Ext.button.Button', {
			minWidth : 80,
			text : 'OK',
			handler : function() {
					_this.listPanel.onFilterResult.notify(_this.listPanel.store.getRange());
					_this.panel.hide();
			}
		});
		var buttonRigthMargin = 375;
		
		this.panel = Ext.create('Ext.ux.Window', {
			title : this.title,
			resizable: false,
			constrain:true,
			closable:true,
			layout: 'fit',
			minimizable :true,
			width: this.width,
			height:this.height,
			items : [ this.listPanel.grid ],
			buttonAlign:'right',
			buttons:[
			         {text:'Add Track', handler: function(){_this.onTrackAddAction.notify(_this.listPanel.features);}, margin:"0 " + buttonRigthMargin  +" 0 0 "},
			         this.getActionButton(this.action),
			         {text:'Close', handler: function(){_this.panel.close();}}
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
	}
};