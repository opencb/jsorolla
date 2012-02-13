TFInfoWidget.prototype.draw = InfoWidget.prototype.draw;
TFInfoWidget.prototype.render = InfoWidget.prototype.render;
TFInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
TFInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
TFInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
TFInfoWidget.prototype.getTranscriptTemplate = InfoWidget.prototype.getTranscriptTemplate;

function TFInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Transcription Factor Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

TFInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Information", children: [
	                { text: "Protein"},
	                { text: "Transcript"}, 
	                { text: "Gene"} 
	            ] },
	            { text: "Regulatory", children: [
  	                { text: "PWM"},//position weight matrix (PWM)
  	                { text: "Target Genes"}
  	            ] }
	        ];
};
TFInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Protein": /* this.panel.add(this.getInfoPanel(this.data).show());*/ break;
			case "Transcript": break;
			case "Gene": break;
			case "PWM": break;
			case "Target Genes": break;
		}
	}
};

TFInfoWidget.prototype.getInfoPanel = function(data){
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

TFInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function (evt){
		_this.dataReceived(cellBaseDataAdapter.toJSON());
	});
	cellBaseDataAdapter.fill("regulatory","tf", "usf1", "tfbs");
	console.log(this.feature.getName());
};
TFInfoWidget.prototype.dataReceived = function (data){
	this.data=data[0];
//	console.log(this.data);
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};
