// JavaScript Document
function KaryotypePanelWindow(species,args){
	var _this = this;
	this.id = "KaryotypePanelWindow_" + Math.random();
	this.karyotypeWidget = new KaryotypePanel(this.getKaryotypePanelId(), species, {"top":10, "width":1000, "height": 300, "trackWidth":15});
	this.karyotypeCellBaseDataAdapter = new KaryotypeCellBaseDataAdapter(species);
	
	
	this.onRendered = new Event();
	this.onMarkerChanged = new Event();
	
	this.karyotypeCellBaseDataAdapter.successed.addEventListener(function(evt, data){
		_this.karyotypeWidget.onRendered.addEventListener(function(evt, data){
			_this.onRendered.notify();
		});
		
		_this.karyotypeWidget.onClick.addEventListener(function(evt, data){
			_this.onMarkerChanged.notify(data);
		});
		
		_this.karyotypeWidget.draw(_this.karyotypeCellBaseDataAdapter.chromosomeNames, _this.karyotypeCellBaseDataAdapter.dataset.json);	

	});
	
};

KaryotypePanelWindow.prototype.select = function(chromosome, start, end){
	this.karyotypeWidget.select(chromosome, start, end);
};

KaryotypePanelWindow.prototype.mark = function(features){
	this.karyotypeWidget.mark(features);
};


KaryotypePanelWindow.prototype.draw = function(){
	if(this.panel==null){
		this.render();
	}
	this.panel.show();
};

KaryotypePanelWindow.prototype.getKaryotypePanel = function(){
	if(this.karyotypePanel==null){
		
		var helpLabel = Ext.create('Ext.toolbar.TextItem', {
			html:'<span class="dis">Click on chromosome to go</span>'
		});
		var infobar = Ext.create('Ext.toolbar.Toolbar',{dock: 'top'});
		infobar.add(helpLabel);
		
		this.karyotypePanel  = Ext.create('Ext.panel.Panel', {
			height:350,
			maxHeight:350,
			border:false,
			bodyPadding: 15,
			padding:'0 0 0 0',
			html:'<div id="' + this.getKaryotypePanelId() +'" ><div>',
			dockedItems: [infobar]
		});
	}
	return this.karyotypePanel;
};

KaryotypePanelWindow.prototype.render = function(){
	var _this = this;
	
	this.panel = Ext.create('Ext.ux.Window', {
		title: 'Karyotype',
		resizable:false,
		constrain:true,
		animCollapse: true,
		width: 1050,
		height: 412,
		minWidth: 300,
		minHeight: 200,
		layout: 'fit',
		items: [this.getKaryotypePanel()],
		buttonAlign:'center',
		buttons:[{ text: 'Close', handler: function(){_this.panel.close();}}],
 		listeners: {
	      	destroy: function(){
	       		delete _this.panel;
	      	}
    	}
	});
	this.karyotypeCellBaseDataAdapter.fill();
};

KaryotypePanelWindow.prototype.getKaryotypePanelId = function (){
	return this.id+"_karyotypePanel";	
};