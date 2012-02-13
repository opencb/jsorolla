SnpInfoWidget.prototype.draw = InfoWidget.prototype.draw;
SnpInfoWidget.prototype.render = InfoWidget.prototype.render;
SnpInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
SnpInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
SnpInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
SnpInfoWidget.prototype.getSnpTemplate = InfoWidget.prototype.getSnpTemplate;

function SnpInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "SNP Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

SnpInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Genomic", children: [
	                { text: "Information"},
	                { text: "Gene"}
	            ] },
	            { text: "Consequence Type"},
	            { text: "Population"}
	           
	        ];
};
SnpInfoWidget.prototype.optionClick = function (item){
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

SnpInfoWidget.prototype.getInfoPanel = function(data){
    if(this.infoPanel==null){

    	var tpl = this.getSnpTemplate();

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

SnpInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function (evt){
		_this.dataReceived(JSON.parse(cellBaseDataAdapter.toJSON()));//TODO
	});
	cellBaseDataAdapter.fill("feature","snp", this.feature.getName(), "fullinfo");
};
SnpInfoWidget.prototype.dataReceived = function (data){
	var mappedSnps = data[0];
	for ( var i = 0; i < mappedSnps.length; i++) {
		if (mappedSnps[i].chromosome == this.feature.feature.chromosome && mappedSnps[i].start == this.feature.start && mappedSnps[i].end == this.feature.end ){
			this.data=mappedSnps[i];
			console.log(mappedSnps[i]);
		}
	}
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};
