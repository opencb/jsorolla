// JavaScript Document
function KaryotypePanelWindow(species,args){
	var _this = this;
	this.id = "KaryotypePanelWindow" + Math.round(Math.random()*10000);
	
	if (args!=null){
		if (args.width!=null){//only if args.mode is panel
			this.width = args.width;
		}
	}
	this.args = args;
	
	this.karyotypeWidget = new KaryotypePanel(this.getKaryotypePanelId(), species, {"top":10, "width":args.width, "height": args.height, "trackWidth":15});
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
	this.karyotypeCellBaseDataAdapter.fill();
	
	this.render();
	this.panel.show();
};

KaryotypePanelWindow.prototype.getKaryotypePanel = function(){
	if(this.karyotypePanel==null){
//		var helpLabel = Ext.create('Ext.toolbar.TextItem', {
//			html:'<span class="dis">Click on chromosome to go</span>'
//		});
//		var infobar = Ext.create('Ext.toolbar.Toolbar',{dock: 'top'});
//		infobar.add(helpLabel);
		
		this.karyotypePanel  = Ext.create('Ext.container.Container', {
			id:this.id+"karyotypePanel",
			height:this.karyotypeWidget.height+10,
			maxHeight:350,
			width:this.karyotypeWidget.width+15,
//			border:false,
//			bodyPadding: 15,
			padding:15,
			html:'<div id="' + this.getKaryotypePanelId() +'" ><div>'
//			dockedItems: [infobar]
		});
	}
	return this.karyotypePanel;
};

KaryotypePanelWindow.prototype.render = function(){
	var _this = this;
	
	//Window is shown by default
	this.panel = Ext.create('Ext.ux.Window', {
		id:this.id+"karyotypeWindow",
		title: 'Karyotype',
		resizable:false,
		taskbar:Ext.getCmp(this.args.viewer.id+'uxTaskbar'),
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
};


KaryotypePanelWindow.prototype.getKaryotypePanelId = function (){
	return this.id+"_karyotypePanel";	
};