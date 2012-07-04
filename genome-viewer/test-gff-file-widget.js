TestGFFFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
TestGFFFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
TestGFFFileWidget.prototype.draw = FileWidget.prototype.draw;
TestGFFFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
TestGFFFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;

function TestGFFFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "GFF";
	args.tags = ["gff"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
    this.chartWidgetQuality = new ChartWidget({height:300});
    
    this.onComplete = new Event();
};

TestGFFFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"])];
};


TestGFFFileWidget.prototype.loadFileFromLocal = function(file){
	var _this = this;
	this.file = file;
	this.adapter = new GFFDataAdapter(new FileDataSource(file),{species:this.viewer.species});
	this.adapter.onLoad.addEventListener(function(sender){
		_this.onComplete.notify(file);
		_this.btnOk.enable();
	});
};