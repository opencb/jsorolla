ProteinInfoWidget.prototype.draw = InfoWidget.prototype.draw;
ProteinInfoWidget.prototype.render = InfoWidget.prototype.render;
ProteinInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
ProteinInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
ProteinInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;

function ProteinInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Protein Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

ProteinInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Sumary", children: [
	                { text: "Long"},
	                { text: "Seq"}
	            ] },
	            { text: "Functional information", children: [
	                { text: "GO"},
	                { text: "Reactome"},
	                { text: "Interpro"}
	            ] },
	            { text: "Interactions"},
	            { text: "Variations"}
	           
	        ];
};
ProteinInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "":  break;
			case "":  break;
//			case "GO": this.panel.add(this.getGoGrid().show()); break;
			case "Reactome": break;
			case "Interpro": break;
			case "": break;
			case "": break;
			case "": break;
		}
	}
};