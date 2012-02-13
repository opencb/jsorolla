VCFVariantInfoWidget.prototype.draw = InfoWidget.prototype.draw;
VCFVariantInfoWidget.prototype.render = InfoWidget.prototype.render;
VCFVariantInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
VCFVariantInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
VCFVariantInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
VCFVariantInfoWidget.prototype.getVCFVariantTemplate = InfoWidget.prototype.getVCFVariantTemplate;

function VCFVariantInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "VCF variant Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

VCFVariantInfoWidget.prototype.getdataTypes = function (){
	return dataTypes=[
	            { text: "Genomic", children: [
	                { text: "Information"}
	            ] }
	        ];
};
VCFVariantInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Information":  this.panel.add(this.getInfoPanel(this.data).show()); break;
			case "Consequence Type": break;
			case "Population": break;
		}
	}
};

VCFVariantInfoWidget.prototype.getInfoPanel = function(data){
    if(this.infoPanel==null){

    	var tpl = this.getVCFVariantTemplate();

		this.infoPanel = Ext.create('Ext.panel.Panel',{
			title:"Information",
	        border:false,
	        cls:'panel-border-left',
			flex:3,    
			bodyPadding:10,
			data:data,
			tpl:tpl
		});

    }
    return this.infoPanel;
};

VCFVariantInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
	
	this.dataReceived(this.feature);
};

VCFVariantInfoWidget.prototype.dataReceived = function (data){
	this.data = data.feature;
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};
