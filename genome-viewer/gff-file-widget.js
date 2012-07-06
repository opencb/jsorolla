GFFFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
GFFFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
GFFFileWidget.prototype.draw = FileWidget.prototype.draw;
GFFFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
GFFFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;

function GFFFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "GFF";
	args.tags = ["gff"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
    this.chartWidgetQuality = new ChartWidget({height:300});
};

GFFFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"])];
};



GFFFileWidget.prototype.loadFileFromLocal = function(file){
	var _this = this;
	this.file = file;
	this.adapter = new GFFDataAdapter(new FileDataSource(file),{species:this.viewer.species});
	this.adapter.onLoad.addEventListener(function(sender){
		_this.btnOk.enable();
	});
};


GFFFileWidget.prototype.loadFileFromServer = function(data){
	this.file = {name:data.filename};
	this.adapter = new GFFDataAdapter(new StringDataSource(data.data),{async:false,species:this.viewer.species});
	this.btnOk.enable();
};